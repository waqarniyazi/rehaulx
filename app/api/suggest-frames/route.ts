import { type NextRequest, NextResponse } from "next/server"
import ytdl from "ytdl-core"

export async function POST(request: NextRequest) {
  try {
    const { videoUrl, keyFrames } = await request.json()

    if (!videoUrl || !keyFrames) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    // Get video info
    const info = await ytdl.getInfo(videoUrl)
    const formats = ytdl.filterFormats(info.formats, "videoandaudio")

    if (formats.length === 0) {
      throw new Error("No suitable video format found")
    }

    const suggestions = []

    for (const keyFrame of keyFrames) {
      // Generate 3 random timestamps within the key frame range
      const startTime = keyFrame.timestamp
      const endTime = keyFrame.endTime || startTime + 30
      const duration = endTime - startTime

      for (let i = 0; i < 3; i++) {
        const randomOffset = Math.random() * duration
        const timestamp = startTime + randomOffset

        // Generate thumbnail URL (YouTube provides thumbnails at specific timestamps)
        const videoId = ytdl.getVideoID(videoUrl)
        const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`

        suggestions.push({
          timestamp: timestamp,
          imageUrl: thumbnailUrl,
          contentSection: keyFrame.contentSection,
          description: `Frame at ${Math.floor(timestamp / 60)}:${Math.floor(timestamp % 60)
            .toString()
            .padStart(2, "0")}`,
        })
      }
    }

    return NextResponse.json(suggestions)
  } catch (error) {
    console.error("Frame suggestion error:", error)
    return NextResponse.json({ error: "Failed to suggest frames" }, { status: 500 })
  }
}
