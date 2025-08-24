/**
 * Utility to clean HTML content for plain text export/copy
 */

export function cleanHtmlToText(htmlContent: string): string {
  return htmlContent
    // Remove keyframe suggestion divs but keep a clean placeholder
    .replace(/<div class="keyframe-suggestion[^>]*data-timestamp="([^"]*)"[^>]*>[\s\S]*?<p[^>]*>(.*?)<\/p>[\s\S]*?<\/div>/g, '\n[Visual: $2]\n')
    // Remove other frame suggestion divs 
    .replace(/<div class="frame-suggestion"[\s\S]*?<\/div>/g, '')
    // Remove various forms of base64 image data that might appear as raw text
    .replace(/Image:\s*image\/[a-z]+;base64,[A-Za-z0-9+\/=]+/g, '[Image]')
    .replace(/URL:\s*data:image\/[a-z]+;base64,[A-Za-z0-9+\/=]+/g, '[Image]')
    .replace(/data:image\/[^;]+;base64,[A-Za-z0-9+\/=]+/g, '[Image]')
    .replace(/image\/[a-z]+;base64,[A-Za-z0-9+\/=]+/g, '[Image]')
    .replace(/\/9j\/[A-Za-z0-9+\/=]+(?::[^:]*)?(?::[^:]*)?/g, '[Image]')
    .replace(/Image: data:image[^,]*,[A-Za-z0-9+\/=]+/g, '[Image]')
    .replace(/URL: data/g, '')
    // Remove any standalone base64 strings that might leak through
    .replace(/;base64,[A-Za-z0-9+\/=]+/g, '')
    .replace(/[A-Za-z0-9+\/=]{50,}/g, '[Image Data]')
    // Convert headers to plain text with proper formatting
    .replace(/<h1[^>]*>(.*?)<\/h1>/g, '\n\n$1\n' + '='.repeat(50) + '\n')
    .replace(/<h2[^>]*>(.*?)<\/h2>/g, '\n\n$1\n' + '-'.repeat(30) + '\n')
    .replace(/<h3[^>]*>(.*?)<\/h3>/g, '\n\n$1\n')
    // Convert lists to plain text
    .replace(/<ul[^>]*>/g, '\n')
    .replace(/<\/ul>/g, '\n')
    .replace(/<li[^>]*>(.*?)<\/li>/g, '• $1\n')
    // Convert other tags to plain text
    .replace(/<strong[^>]*>(.*?)<\/strong>/g, '$1')
    .replace(/<em[^>]*>(.*?)<\/em>/g, '$1')
    .replace(/<p[^>]*>(.*?)<\/p>/g, '$1\n\n')
    // Remove any remaining HTML tags
    .replace(/<[^>]*>/g, '')
    // Convert HTML entities back to plain text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    // Clean up excessive whitespace
    .replace(/\n{3,}/g, '\n\n')
    .replace(/^\s+|\s+$/g, '')
    // Remove any remaining markdown-style formatting
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .trim()
}

export function formatContentForExport(content: string, title: string, keyFrames?: any[]): string {
  const cleanContent = cleanHtmlToText(content)
  
  let exportContent = `${title}\n${'='.repeat(title.length)}\n\n`
  exportContent += `${cleanContent}\n\n`
  
  // Add key frames information if available (this will be handled differently in PDF)
  if (keyFrames && keyFrames.length > 0) {
    exportContent += `\n${'-'.repeat(30)}\nKey Visual Moments:\n`
    keyFrames.forEach((frame, index) => {
      const minutes = Math.floor(frame.timestamp / 60)
      const seconds = Math.floor(frame.timestamp % 60)
      const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`
      exportContent += `${index + 1}. [${timeStr}] ${frame.description || 'Key moment'}\n`
    })
  }
  
  return exportContent
}

export function extractImagePlaceholders(content: string): Array<{
  position: number,
  timestamp: number,
  imageUrl: string,
  description: string
}> {
  const placeholders: Array<{
    position: number,
    timestamp: number,
    imageUrl: string,
    description: string
  }> = []
  
  const regex = /<div class="keyframe-suggestion[^>]*data-timestamp="([^"]*)"[^>]*>[\s\S]*?<img[^>]*src="([^"]*)"[^>]*>[\s\S]*?<p[^>]*>(.*?)<\/p>[\s\S]*?<\/div>/g
  let match
  let textPosition = 0
  let lastIndex = 0
  
  while ((match = regex.exec(content)) !== null) {
    // Calculate text position by cleaning content up to this point
    const beforeContent = content.substring(lastIndex, match.index)
    const cleanBefore = cleanHtmlToText(beforeContent)
    textPosition += cleanBefore.length
    
    placeholders.push({
      position: textPosition,
      timestamp: parseInt(match[1]),
      imageUrl: match[2],
      description: match[3].replace(/<[^>]*>/g, '').trim()
    })
    
    lastIndex = match.index + match[0].length
  }
  
  return placeholders
}
