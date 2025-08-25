import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { videoId, languages = ["en"], preserveFormatting = false } = await request.json()

    if (!videoId) {
      return NextResponse.json({ success: false, error: "Video ID is required" }, { status: 400 })
    }

    console.log("=== Transcript Extraction via Heroku Service ===")
    console.log("Video ID:", videoId)

    // Use the Heroku video service for transcript extraction
    const videoServiceUrl = process.env.VIDEO_SERVICE_URL
    if (!videoServiceUrl) {
      return NextResponse.json(
        { success: false, error: "Video service not configured" }, 
        { status: 500 }
      )
    }

    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`
    const response = await fetch(`${videoServiceUrl}/api/analyze-video`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: videoUrl }),
    })

    if (!response.ok) {
      throw new Error(`Video service responded with status: ${response.status}`)
    }

    const data = await response.json()
    const transcript = data.videoInfo?.transcript || []

    console.log("Transcript extracted:", transcript.length, "segments")

    // Transform to match expected format
    const transformedResult = {
      success: transcript.length > 0,
      videoId: videoId,
      transcript: transcript,
      segmentCount: transcript.length,
      title: data.videoInfo?.title || `Video ${videoId}`,
      duration: transcript.length > 0 ? 
        transcript[transcript.length - 1].start + transcript[transcript.length - 1].duration : 0,
      language: "en",
      languageCode: "en",
      isGenerated: false,
    }

    return NextResponse.json(transformedResult)
  } catch (error) {
    console.error("Transcript API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
