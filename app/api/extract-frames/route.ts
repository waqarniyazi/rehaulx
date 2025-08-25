import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { videoUrl, timestamps } = await request.json()

    if (!videoUrl || !timestamps || !Array.isArray(timestamps)) {
      return NextResponse.json({ error: "Video URL and timestamps array are required" }, { status: 400 })
    }

    console.log("Extracting frames for timestamps:", timestamps)

    // Use the Heroku video service for frame extraction
    const videoServiceUrl = process.env.VIDEO_SERVICE_URL
    if (!videoServiceUrl) {
      return NextResponse.json(
        { error: "Video service not configured" }, 
        { status: 500 }
      )
    }

    const response = await fetch(`${videoServiceUrl}/api/extract-frames`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: videoUrl, timestamps }),
    })

    if (!response.ok) {
      throw new Error(`Video service responded with status: ${response.status}`)
    }

    const data = await response.json()
    console.log(`Successfully extracted ${data.frames?.length || 0} frames via Heroku service`)

    return NextResponse.json(data)
  } catch (error) {
    console.error("Frame extraction error:", error)
    return NextResponse.json(
      {
        error: "Failed to extract frames",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) {
      return match[1]
    }
  }

  return null
}
