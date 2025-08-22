import { deepinfra } from "@ai-sdk/deepinfra"
import { generateObject } from "ai"
import { z } from "zod"

export class AIClient {
  private model = deepinfra("meta-llama/Meta-Llama-3.1-70B-Instruct")

  async generateTimestamps(transcript: any[]): Promise<number[]> {
    const transcriptText = transcript.map((segment) => `[${Math.floor(segment.start)}s] ${segment.text}`).join("\n")

    const result = await generateObject({
      model: this.model,
      schema: z.object({
        timestamps: z.array(z.number()),
      }),
      prompt: `Identify the 8-10 most important timestamps (in seconds) in this transcript for repurposing into blog, LinkedIn, Twitter and newsletter content. Return a JSON array of floats.

Transcript:
${transcriptText}`,
    })

    return result.object.timestamps
  }

  async generateContent(transcript: any[], timestamps: number[], extractedFrames: Record<number, string[]>) {
    const transcriptText = transcript.map((segment) => `[${Math.floor(segment.start)}s] ${segment.text}`).join("\n")

    const result = await generateObject({
      model: this.model,
      schema: z.object({
        blog: z.object({
          text: z.string(),
          ideas: z.array(
            z.object({
              title: z.string(),
              outline: z.array(z.string()),
            }),
          ),
        }),
        linkedin: z.string(),
        twitter: z.array(z.string()),
        newsletter: z.string(),
      }),
      prompt: `Using the "transcript" and "timestamps" JSON, produce:
1. A single 800–1000 word SEO‑optimized blog post with meta title, description, keywords, plus 3 additional article ideas with outlines.
2. A LinkedIn post summarizing key insights.
3. A Twitter thread (8 tweets).
4. A newsletter blurb.

For each section, include references to 2 sample images per key timestamp: insert placeholders like {{image_group_1}}.

Transcript:
${transcriptText}

Key Timestamps: ${timestamps.join(", ")}`,
    })

    return result.object
  }
}

export const aiClient = new AIClient()
