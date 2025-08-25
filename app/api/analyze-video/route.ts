import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: "YouTube URL is required" }, { status: 400 })
    }

    console.log("Analyzing video via Heroku service:", url)

    // Call the Heroku video service
    const videoServiceUrl = process.env.VIDEO_SERVICE_URL || 'http://localhost:3001'
    
    const response = await fetch(`${videoServiceUrl}/api/analyze-video`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url })
    })

    if (!response.ok) {
      throw new Error(`Video service responded with status: ${response.status}`)
    }

    const result = await response.json()
    
    console.log("Video analysis complete via Heroku service")
    
    return NextResponse.json(result)
  } catch (error) {
    console.error("Video analysis error:", error)
    return NextResponse.json(
      {
        error: "Failed to analyze video",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
