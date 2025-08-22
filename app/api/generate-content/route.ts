import { type NextRequest, NextResponse } from "next/server"
import { getLLMProvider } from "@/lib/llm"

export async function POST(request: NextRequest) {
  try {
    const { videoUrl, contentType, userId, transcript, keyFrames } = await request.json()

    if (!transcript || !contentType) {
      return NextResponse.json({ error: "Transcript and content type are required" }, { status: 400 })
    }

    console.log("Generating content:", { contentType, transcriptLength: transcript.length })

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

          // Generate content type-specific prompt
          const prompt = generatePrompt(contentType, transcriptText, keyFrames, transcriptWithTimestamps)

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

function generatePrompt(contentType: string, transcriptText: string, keyFrames: any[], timestampMap: any[]): string {
  const keyTimestamps = keyFrames?.map((kf) => kf.timestamp).join(", ") || ""

  const prompts = {
    "short-article": `Write a 500-word SEO-optimized blog article based on this video transcript. 

IMPORTANT: For each paragraph, include a comment indicating which timestamp range it covers, like this:
<!-- TIMESTAMP_RANGE: 0-30 --> (for content covering 0 to 30 seconds)
<!-- TIMESTAMP_RANGE: 45-90 --> (for content covering 45 to 90 seconds)

Include:
- Compelling headline
- Introduction hook
- 3-4 main sections with subheadings
- Conclusion with call-to-action
- Focus on key insights from timestamps: ${keyTimestamps}

Transcript with timestamps:
${transcriptText}`,

    "long-article": `Write a comprehensive 1000+ word blog article based on this video transcript.

IMPORTANT: For each paragraph, include a comment indicating which timestamp range it covers, like this:
<!-- TIMESTAMP_RANGE: 0-30 --> (for content covering 0 to 30 seconds)
<!-- TIMESTAMP_RANGE: 45-90 --> (for content covering 45 to 90 seconds)

Include:
- SEO-optimized title and meta description
- Detailed introduction
- 5-7 main sections with subheadings
- Examples and actionable insights
- Conclusion with strong call-to-action
- Focus on key moments at: ${keyTimestamps}

Transcript with timestamps:
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
