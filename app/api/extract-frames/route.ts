import { type NextRequest, NextResponse } from "next/server"
import { spawn } from "child_process"
import path from "path"
import fs from "fs"

export async function POST(request: NextRequest) {
  try {
    const { videoUrl, timestamps } = await request.json()

    if (!videoUrl || !timestamps || !Array.isArray(timestamps)) {
      return NextResponse.json({ error: "Video URL and timestamps array are required" }, { status: 400 })
    }

    console.log("Extracting frames for timestamps:", timestamps)

    const videoId = extractVideoId(videoUrl)
    if (!videoId) {
      return NextResponse.json({ error: "Invalid YouTube URL" }, { status: 400 })
    }

    const tempDir = path.join(process.cwd(), "temp", videoId)

    // Create temp directory
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true })
    }

    const frames: { timestamp: number; imageUrl: string; description?: string }[] = []

    // Extract frames at specified timestamps using yt-dlp + ffmpeg
    for (const timestamp of timestamps) {
      try {
        const outputPath = path.join(tempDir, `frame_${timestamp}.jpg`)

        // Use yt-dlp to get video stream and extract frame with ffmpeg
        await extractFrameAtTimestamp(videoUrl, timestamp, outputPath)

        // Convert to base64 for immediate use
        if (fs.existsSync(outputPath)) {
          const imageBuffer = fs.readFileSync(outputPath)
          const base64Image = `data:image/jpeg;base64,${imageBuffer.toString("base64")}`

          frames.push({
            timestamp,
            imageUrl: base64Image,
            description: `Frame at ${Math.floor(timestamp)}s`,
          })

          // Clean up temp file
          fs.unlinkSync(outputPath)
        }
      } catch (error) {
        console.error(`Failed to extract frame at ${timestamp}s:`, error)
      }
    }

    // Clean up temp directory
    try {
      fs.rmdirSync(tempDir, { recursive: true })
    } catch (e) {
      // Ignore cleanup errors
    }

    console.log(`Successfully extracted ${frames.length} frames`)

    return NextResponse.json({ frames })
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

async function extractFrameAtTimestamp(videoUrl: string, timestamp: number, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const ytDlpPath = process.env.YT_DLP_PATH || "yt-dlp"

    // Use yt-dlp to pipe video to ffmpeg for frame extraction
    const ytDlpProcess = spawn(ytDlpPath, ["-f", "best[height<=720]", "--quiet", "-o", "-", videoUrl])

    const ffmpegProcess = spawn("ffmpeg", [
      "-i",
      "pipe:0",
      "-ss",
      timestamp.toString(),
      "-vframes",
      "1",
      "-q:v",
      "2",
      "-y",
      outputPath,
    ])

    ytDlpProcess.stdout.pipe(ffmpegProcess.stdin)

    let stderr = ""

    ffmpegProcess.stderr.on("data", (data) => {
      stderr += data.toString()
    })

    ffmpegProcess.on("close", (code) => {
      if (code === 0) {
        resolve()
      } else {
        reject(new Error(`FFmpeg failed with code ${code}: ${stderr}`))
      }
    })

    ytDlpProcess.on("error", (error) => {
      reject(new Error(`yt-dlp error: ${error.message}`))
    })

    ffmpegProcess.on("error", (error) => {
      reject(new Error(`FFmpeg error: ${error.message}`))
    })
  })
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
