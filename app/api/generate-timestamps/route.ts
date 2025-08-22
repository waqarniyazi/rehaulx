import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { transcript } = await request.json()

    if (!transcript || !Array.isArray(transcript)) {
      return NextResponse.json({ error: "Valid transcript array is required" }, { status: 400 })
    }

    console.log("Generating timestamps for transcript with", transcript.length, "segments")

    // Use Ollama to analyze transcript and identify key moments
    const ollamaResponse = await fetch(`${process.env.OLLAMA_BASE_URL || "http://localhost:11434"}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3.1",
        prompt: `Analyze this video transcript and identify 8-10 key timestamps (in seconds) that would be most important for repurposing into blog posts, LinkedIn posts, Twitter threads, and newsletters. Focus on:
- Main topic introductions
- Key insights or revelations
- Important examples or case studies
- Conclusion or summary moments
- Actionable advice or tips

Transcript segments:
${transcript.map((seg, i) => `[${Math.floor(seg.start)}s] ${seg.text}`).join("\n")}

Return only a JSON array of timestamp numbers (in seconds), like: [15, 45, 120, 180, 240, 300, 420, 480]`,
        stream: false,
        options: {
          temperature: 0.3,
          top_p: 0.9,
        },
      }),
    })

    if (!ollamaResponse.ok) {
      throw new Error(`Ollama API error: ${ollamaResponse.statusText}`)
    }

    const ollamaResult = await ollamaResponse.json()
    console.log("Ollama response:", ollamaResult.response)

    // Parse the JSON array from Ollama response
    let timestamps: number[] = []
    try {
      // Extract JSON array from the response
      const jsonMatch = ollamaResult.response.match(/\[[\d,\s]+\]/)
      if (jsonMatch) {
        timestamps = JSON.parse(jsonMatch[0])
      } else {
        // Fallback: extract numbers from the response
        const numbers = ollamaResult.response.match(/\d+/g)
        if (numbers) {
          timestamps = numbers.slice(0, 10).map(Number)
        }
      }
    } catch (parseError) {
      console.error("Failed to parse Ollama response, using fallback:", parseError)
      // Fallback: generate timestamps based on transcript length
      const totalDuration = transcript[transcript.length - 1]?.start || 300
      const interval = totalDuration / 8
      timestamps = Array.from({ length: 8 }, (_, i) => Math.floor(i * interval))
    }

    // Ensure timestamps are within video bounds and sorted
    const maxTime = transcript[transcript.length - 1]?.start || 0
    timestamps = timestamps
      .filter((t) => t >= 0 && t <= maxTime)
      .sort((a, b) => a - b)
      .slice(0, 10) // Limit to 10 timestamps

    console.log("Generated timestamps:", timestamps)

    return NextResponse.json({ timestamps })
  } catch (error) {
    console.error("Timestamp generation error:", error)
    return NextResponse.json(
      {
        error: "Failed to generate timestamps",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
