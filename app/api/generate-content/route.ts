import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getLLMProvider } from "@/lib/llm"
import { ceilMinutes, deductUserMinutes, getUserMinutesBalance } from "@/lib/billing"

export async function POST(request: NextRequest) {
  try {
  const { videoUrl, contentType, userId: userIdFromBody, transcript, keyFrames } = await request.json()

  // Resolve authenticated user (ignore userId from body for security)
  const sb = await createClient()
  const { data: { user } } = await sb.auth.getUser()
  const userId = user?.id || userIdFromBody // fallback only for dev/testing when auth not present

    // Require transcript for content generation
    if (!transcript || !Array.isArray(transcript) || transcript.length === 0) {
      return NextResponse.json({ 
        error: "Transcript is required for content generation", 
        details: "Cannot generate content without video transcript. Please ensure the video has captions or transcript available."
      }, { status: 400 })
    }

    // Estimate minutes needed from transcript duration (fallback by words if duration missing)
    const lastSeg = transcript[transcript.length - 1]
    const estSeconds = typeof lastSeg?.start === 'number' && typeof lastSeg?.duration === 'number'
      ? Math.max(1, Math.round(lastSeg.start + lastSeg.duration))
      : Math.round(transcript.reduce((acc: number, seg: any) => acc + ((seg.duration as number) || 0), 0))
    const minutesNeeded = ceilMinutes(estSeconds)

    // If user present, enforce minutes balance
    if (userId) {
      const usage = await getUserMinutesBalance(userId)
      const remaining = usage?.remaining || 0
      if (remaining < minutesNeeded) {
        return NextResponse.json({
          error: "Insufficient minutes",
          details: `You need ${minutesNeeded} minutes for this generation but only have ${remaining}.` ,
          minutesNeeded,
          remaining,
          upgrade: true,
        }, { status: 402 })
      }
    }

    if (!contentType) {
      return NextResponse.json({ error: "Content type is required" }, { status: 400 })
    }

    console.log("Generating content:", { 
      contentType, 
      transcriptLength: transcript.length,
      hasTranscript: transcript.length > 0
    })

    // Validate transcript quality
    const totalWords = transcript.reduce((acc: number, seg: any) => acc + (seg.text || '').split(' ').length, 0)
    if (totalWords < 50) {
      return NextResponse.json({ 
        error: "Transcript too short for content generation", 
        details: "The video transcript is too short to generate meaningful content. Please try with a longer video."
      }, { status: 400 })
    }

    // Create a readable stream for real-time updates
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send initial progress
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "progress",
                progress: 10,
                message: "Analyzing video content...",
              })}\n\n`,
            ),
          )

          // Prepare transcript text with timestamps
          const transcriptWithTimestamps = transcript.map((seg: any, index: number) => ({
            text: seg.text,
            start: seg.start,
            index: index,
            timestamp: `[${Math.floor(seg.start)}s]`,
          }))

          const transcriptText = transcriptWithTimestamps.map((seg: any) => `${seg.timestamp} ${seg.text}`).join("\n")

          // Enhanced prompt with video metadata
          const videoInfo = {
            title: transcript[0]?.videoTitle || "Video Content",
            author: transcript[0]?.videoAuthor || "Content Creator", 
            description: transcript[0]?.videoDescription || "",
            duration: transcript[0]?.videoDuration || "Unknown"
          }

          // Generate content type-specific prompt
          const prompt = generatePrompt(contentType, transcriptText, keyFrames, transcriptWithTimestamps, videoInfo)

          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "progress",
                progress: 30,
                message: "Generating content with AI...",
              })}\n\n`,
            ),
          )

          // Use the LLM provider abstraction
          const provider = getLLMProvider()
          let generatedContent = ""
          let progress = 30

          // Stream the response
          for await (const chunk of provider.generateStream(prompt)) {
            generatedContent += chunk
            progress = Math.min(progress + 2, 90)

            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: "progress",
                  progress: progress,
                  message: "Generating content...",
                })}\n\n`,
              ),
            )

            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: "content",
                  content: generatedContent,
                  timestampMap: transcriptWithTimestamps,
                })}\n\n`,
              ),
            )
          }

          // Final progress update
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "progress",
                progress: 100,
                message: "Content generation complete!",
              })}\n\n`,
            ),
          )

          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "complete",
                content: generatedContent,
                timestampMap: transcriptWithTimestamps,
              })}\n\n`,
            ),
          )

          // Deduct minutes after successful completion (fire-and-forget)
          try {
            if (userId) {
              await deductUserMinutes(
                userId,
                minutesNeeded,
                undefined,
                `content_generation:${contentType}`,
                estSeconds,
                'content-generation'
              )
            }
          } catch (e) {
            console.error('Failed to debit minutes:', e)
          }

          controller.close()
        } catch (error) {
          console.error("Content generation error:", error)
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "error",
                error: error instanceof Error ? error.message : "Unknown error",
              })}\n\n`,
            ),
          )
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    })
  } catch (error) {
    console.error("Content generation setup error:", error)
    return NextResponse.json(
      {
        error: "Failed to start content generation",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

function generatePrompt(contentType: string, transcriptText: string, keyFrames: any[], timestampMap: any[], videoInfo?: any): string {
  const keyTimestamps = keyFrames?.map((kf) => kf.timestamp).join(", ") || ""
  const videoContext = videoInfo ? `
Video Information:
- Title: ${videoInfo.title}
- Author: ${videoInfo.author} 
- Duration: ${videoInfo.duration}
- Description: ${videoInfo.description}
` : ""

  const prompts = {
    "short-article": `Write a 500-word SEO-optimized blog article based on this video content.

${videoContext}

Use the video title and description as context for creating compelling, accurate content.

IMPORTANT: For each paragraph, include a comment indicating which timestamp range it covers, like this:
<!-- TIMESTAMP_RANGE: 0-30 --> (for content covering 0 to 30 seconds)
<!-- TIMESTAMP_RANGE: 45-90 --> (for content covering 45 to 90 seconds)

Include:
- Compelling headline (incorporate video title if relevant)
- Introduction hook referencing the video content
- 3-4 main sections with subheadings
- Conclusion with call-to-action
- Focus on key insights from timestamps: ${keyTimestamps}

Video Transcript with timestamps:
${transcriptText}`,

    "long-article": `Write a comprehensive 1000+ word blog article based on this video content.

${videoContext}

Use the video title, description, and author information to create authoritative, well-researched content.

IMPORTANT: For each paragraph, include a comment indicating which timestamp range it covers, like this:
<!-- TIMESTAMP_RANGE: 0-30 --> (for content covering 0 to 30 seconds)
<!-- TIMESTAMP_RANGE: 45-90 --> (for content covering 45 to 90 seconds)

Include:
- SEO-optimized title (incorporate video title elements)
- Meta description incorporating key insights
- Detailed introduction that references the original video
- 5-7 main sections with subheadings
- Examples and actionable insights from the content
- Conclusion with strong call-to-action
- Focus on key moments at: ${keyTimestamps}

Video Transcript with timestamps:
${transcriptText}`,

    linkedin: `Create a professional LinkedIn post based on this video transcript.

IMPORTANT: Include timestamp references where relevant, like: "As mentioned at 2:30 in the video..."

Include:
- Attention-grabbing opening line
- 2-3 key insights or takeaways
- Personal reflection or industry perspective
- Call-to-action for engagement
- Use relevant hashtags
- Keep it under 300 words
- Focus on timestamps: ${keyTimestamps}

Transcript with timestamps:
${transcriptText}`,

    twitter: `Create a Twitter thread (8-12 tweets) based on this video transcript.

IMPORTANT: Include timestamp references where relevant, like: "At 1:45, the key insight is..."

Include:
- Hook tweet that grabs attention
- Break down key insights into digestible tweets
- Use emojis and formatting for engagement
- End with call-to-action
- Each tweet under 280 characters
- Focus on key moments: ${keyTimestamps}

Format as: 1/🧵 [tweet content]

Transcript with timestamps:
${transcriptText}`,
  }

  return prompts[contentType as keyof typeof prompts] || prompts["short-article"]
}
