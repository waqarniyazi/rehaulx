import type { KeyFrame } from "@/types"

export interface ContentWithFrames {
  content: string
  suggestedInsertions: SuggestedInsertion[]
}

export interface SuggestedInsertion {
  id: string
  position: number
  originalTimestamp: string
  startTime: number
  endTime: number
  keyFrame?: KeyFrame
  text: string
  isAccepted: boolean
}

export function formatLLMContent(rawContent: string, keyFrames: KeyFrame[] = []): ContentWithFrames {
  let formattedContent = rawContent
  const suggestedInsertions: SuggestedInsertion[] = []

  // Step 1: Extract timestamp ranges and create a map
  const timestampRegex = /<!-- TIMESTAMP_RANGE: (\d+)-(\d+) -->/g
  const timestampMatches: Array<{match: RegExpExecArray, startTime: number, endTime: number}> = []
  let match

  while ((match = timestampRegex.exec(rawContent)) !== null) {
    const startTime = parseInt(match[1])
    const endTime = parseInt(match[2])
    timestampMatches.push({ match, startTime, endTime })
  }

  // Step 2: Process content and integrate keyframes at timestamp positions
  let contentParts = rawContent.split(/<!-- TIMESTAMP_RANGE: \d+-\d+ -->/)
  let finalContent = ""

  for (let i = 0; i < contentParts.length; i++) {
    // Add the content part
    finalContent += contentParts[i]

    // If there's a corresponding timestamp match, add keyframe suggestions
    if (i < timestampMatches.length) {
      const { startTime, endTime } = timestampMatches[i]
      
      // Find matching keyframes within this timestamp range
      const matchingFrames = keyFrames.filter(frame => 
        frame.timestamp >= startTime && frame.timestamp <= endTime
      )

      if (matchingFrames.length > 0) {
        // Add keyframe suggestions at this position
        matchingFrames.forEach(frame => {
          const insertionId = `insertion-${frame.timestamp}`
          const suggestion: SuggestedInsertion = {
            id: insertionId,
            position: finalContent.length,
            originalTimestamp: `<!-- TIMESTAMP_RANGE: ${startTime}-${endTime} -->`,
            startTime,
            endTime,
            keyFrame: frame,
            text: frame.description || `Key moment at ${formatTimestamp(frame.timestamp)}`,
            isAccepted: false
          }
          suggestedInsertions.push(suggestion)

          // Add placeholder for the frame in the content
          finalContent += `

[KEYFRAME:${frame.timestamp}:${frame.imageUrl || ''}:${frame.description || 'Key moment'}]

`
        })
      }
    }
  }

  // Step 3: Clean up raw base64 image data that might appear in content
  formattedContent = formattedContent
    // Remove raw base64 data that appears as text
    .replace(/Image:\s*image\/[a-z]+;base64,[A-Za-z0-9+\/=]+/g, '')
    .replace(/URL:\s*data:image\/[a-z]+;base64,[A-Za-z0-9+\/=]+/g, '')
    .replace(/image\/[a-z]+;base64,[A-Za-z0-9+\/=]+:Frame at \d+s/g, '')
    .replace(/\/9j\/[A-Za-z0-9+\/=]+:Frame at \d+s[^:]*:Frame at \d+s \(\d+:\d+\)/g, '')
    
  // Step 4: Format markdown-like syntax to proper HTML/React
  formattedContent = formattedContent
    // Bold text: **text** → <strong>text</strong>
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Italic text: *text* → <em>text</em>
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Headers: ## text → <h2>text</h2>
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    // Lists: - item → <li>item</li>
    .replace(/^- (.*$)/gim, '<li>$1</li>')

  // Handle list wrapping separately
  const listItemRegex = /(<li>.*<\/li>)/g
  const listItems = formattedContent.match(listItemRegex)
  if (listItems) {
    const listContent = listItems.join('')
    formattedContent = formattedContent.replace(listItemRegex, '').replace(listContent, `<ul>${listContent}</ul>`)
  }

  // Step 4: Convert keyframe placeholders to proper HTML
  formattedContent = formattedContent.replace(
    /\[KEYFRAME:(\d+):([^:]*):([^\]]*)\]/g,
    (match, timestamp, imageUrl, description) => {
      // Handle base64 images properly
      let imgTag = ''
      if (imageUrl) {
        // If it's already a data URL, use it directly
        if (imageUrl.startsWith('data:image/')) {
          imgTag = `<img src="${imageUrl}" alt="${description}" class="w-full max-w-md mx-auto rounded-lg shadow-md mb-3" style="max-height: 300px; object-fit: cover;" />`
        } else if (imageUrl.startsWith('/9j/') || imageUrl.includes('base64')) {
          // If it's base64 without the data URL prefix, add it
          const base64Data = imageUrl.startsWith('/9j/') ? imageUrl : imageUrl.split(',')[1]
          imgTag = `<img src="data:image/jpeg;base64,${base64Data}" alt="${description}" class="w-full max-w-md mx-auto rounded-lg shadow-md mb-3" style="max-height: 300px; object-fit: cover;" />`
        } else {
          // Regular URL
          imgTag = `<img src="${imageUrl}" alt="${description}" class="w-full max-w-md mx-auto rounded-lg shadow-md mb-3" style="max-height: 300px; object-fit: cover;" />`
        }
      }
      return `<div class="keyframe-suggestion my-6 p-4 bg-white/5 border border-white/10 rounded-lg text-center" data-timestamp="${timestamp}">${imgTag}<p class="text-sm text-white/70 italic mt-2">${description} (${formatTimestamp(parseInt(timestamp))})</p></div>`
    }
  )

  // Step 5: Clean up extra whitespace and formatting
  formattedContent = formattedContent
    .replace(/\n{3,}/g, '\n\n') // Multiple line breaks to double
    .trim()

  return {
    content: formattedContent,
    suggestedInsertions
  }
}

export function formatTimestamp(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
}

export function insertFrameSuggestion(
  content: string, 
  suggestion: SuggestedInsertion, 
  position: 'before' | 'after' = 'after'
): string {
  const lines = content.split('\n')
  
  // Find appropriate insertion point (after the nearest paragraph or heading)
  let insertIndex = 0
  let charCount = 0
  
  for (let i = 0; i < lines.length; i++) {
    charCount += lines[i].length + 1 // +1 for newline
    if (charCount >= suggestion.position) {
      insertIndex = position === 'before' ? i : i + 1
      break
    }
  }
  
  const frameInsertion = `
<div class="frame-suggestion" data-timestamp="${suggestion.keyFrame?.timestamp}">
  <img src="${suggestion.keyFrame?.imageUrl}" alt="${suggestion.text}" class="rounded-lg shadow-md" />
  <p class="text-sm text-gray-600 mt-2">${suggestion.text}</p>
</div>
`
  
  lines.splice(insertIndex, 0, frameInsertion)
  return lines.join('\n')
}

export function renderFormattedContent(content: string): string {
  return content
    .replace(/<h1>(.*?)<\/h1>/g, '<h1 class="text-3xl font-bold text-white mb-4">$1</h1>')
    .replace(/<h2>(.*?)<\/h2>/g, '<h2 class="text-2xl font-semibold text-white mb-3">$1</h2>')
    .replace(/<h3>(.*?)<\/h3>/g, '<h3 class="text-xl font-medium text-white mb-2">$1</h3>')
    .replace(/<strong>(.*?)<\/strong>/g, '<strong class="font-semibold text-white">$1</strong>')
    .replace(/<em>(.*?)<\/em>/g, '<em class="italic text-white/90">$1</em>')
    .replace(/<ul>(.*?)<\/ul>/g, '<ul class="list-disc list-inside space-y-1 text-white/80 mb-4">$1</ul>')
    .replace(/<li>(.*?)<\/li>/g, '<li class="ml-4">$1</li>')
    .replace(/\n\n/g, '</p><p class="text-white/80 mb-4">')
    .replace(/^(.+)/gm, '<p class="text-white/80 mb-4">$1</p>')
    // Clean up empty paragraphs
    .replace(/<p class="text-white\/80 mb-4"><\/p>/g, '')
}

// New function to format streaming content with proper markdown rendering and skeleton placeholders
export function formatStreamingContent(content: string): string {
  if (!content) return ''

  // First clean base64 data from streaming content
  let cleanedContent = content
    // Remove various forms of base64 image data that might appear as text
    .replace(/data:image\/[a-z]+;base64,[A-Za-z0-9+\/=]+/gi, '')
    .replace(/image\/[a-z]+;base64,[A-Za-z0-9+\/=]+/gi, '')
    .replace(/\b[A-Za-z0-9+\/=]{100,}\b/g, '') // Remove long base64 strings
    .replace(/\/9j\/[A-Za-z0-9+\/=]{50,}/g, '') // Remove JPEG base64 data
    
  // Replace timestamp comments with loading indicators during streaming
  cleanedContent = cleanedContent.replace(
    /<!--\s*TIMESTAMP_RANGE:\s*(\d+)-(\d+)\s*-->/gi,
    (match, start, end) => {
      return `\n\n<div class="timestamp-skeleton my-4 p-4 sm:p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg" data-range="${start}-${end}">
        <div class="flex items-start gap-3 sm:gap-4">
          <div class="h-12 w-12 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg class="h-5 w-5 sm:h-6 sm:w-6 text-blue-400 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3l14 9-14 9V3z"/>
            </svg>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 mb-3">
              <div class="flex items-center gap-2">
                <span class="text-sm sm:text-base font-medium text-blue-400">Analyzing Visual Moments</span>
                <div class="flex items-center gap-1 px-2 py-1 bg-blue-500/20 border border-blue-500/30 rounded text-xs text-blue-300">
                  <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <span>${start}s-${end}s</span>
                </div>
              </div>
              <div class="flex items-center gap-1 text-xs text-white/40">
                <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                </svg>
                <span>Processing frames...</span>
              </div>
            </div>
            <div class="w-full bg-white/10 rounded-full h-2 overflow-hidden">
              <div class="h-full bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse rounded-full w-2/3 transition-all duration-1000"></div>
            </div>
          </div>
        </div>
      </div>\n\n`
    }
  )

  // Format markdown syntax for proper display during streaming
  let formattedContent = cleanedContent
    // Bold text: **text** → <strong>text</strong>
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-white">$1</strong>')
    // Italic text: *text* → <em>text</em>
    .replace(/\*([^*]+)\*/g, '<em class="italic text-white/90">$1</em>')
    // Headers: ## text → <h2>text</h2>
    .replace(/^### (.*$)/gim, '<h3 class="text-xl font-medium text-white mb-2 mt-4">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-semibold text-white mb-3 mt-6">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold text-white mb-4 mt-8">$1</h1>')
    // Lists: - item → <li>item</li>
    .replace(/^\s*-\s+(.*$)/gim, '<li class="ml-4 text-white/80">$1</li>')
    // Convert paragraphs
    .split('\n\n')
    .map(paragraph => {
      if (paragraph.trim()) {
        // Don't wrap if it's already HTML
        if (paragraph.includes('<h') || paragraph.includes('<div') || paragraph.includes('<li')) {
          return paragraph
        }
        return `<p class="text-white/80 mb-4">${paragraph.trim()}</p>`
      }
      return ''
    })
    .join('\n\n')

  // Wrap lists properly
  formattedContent = formattedContent.replace(
    /(<li class="ml-4 text-white\/80">.*?<\/li>(?:\s*<li class="ml-4 text-white\/80">.*?<\/li>)*)/g,
    '<ul class="list-disc list-inside space-y-1 text-white/80 mb-4">$1</ul>'
  )

  return formattedContent
}
