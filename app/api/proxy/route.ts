import { type NextRequest, NextResponse } from "next/server"
import ytdl from "ytdl-core"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const url = searchParams.get("url")

    if (!url) {
      return NextResponse.json({ error: "URL parameter is required" }, { status: 400 })
    }

    // Get video info and stream URL
    const info = await ytdl.getInfo(url)
    const format = ytdl.chooseFormat(info.formats, { quality: "lowest", filter: "videoandaudio" })

    if (!format) {
      return NextResponse.json({ error: "No suitable video format found" }, { status: 404 })
    }

    // Return the direct video URL with CORS headers
    const response = new NextResponse(null, {
      status: 302,
      headers: {
        Location: format.url,
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    })

    return response
  } catch (error) {
    console.error("Video proxy error:", error)
    return NextResponse.json({ error: "Failed to proxy video" }, { status: 500 })
  }
}
