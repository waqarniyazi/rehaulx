import { type NextRequest, NextResponse } from "next/server"
import { spawn } from "child_process"

async function getVideoInfoWithYtDlp(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const ytDlpPath = process.env.YT_DLP_PATH || "yt-dlp"

    const childProcess = spawn(ytDlpPath, ["--dump-json", "--no-download", url])

    let stdout = ""
    let stderr = ""

    childProcess.stdout.on("data", (data) => {
      stdout += data.toString()
    })

    childProcess.stderr.on("data", (data) => {
      stderr += data.toString()
    })

    childProcess.on("close", (code) => {
      if (code !== 0) {
        console.error("yt-dlp error:", stderr)
        reject(new Error(`yt-dlp failed with code ${code}: ${stderr}`))
        return
      }

      try {
        const videoData = JSON.parse(stdout)

        resolve({
          title: videoData.title || "Unknown Title",
          thumbnail: videoData.thumbnail || `https://img.youtube.com/vi/${extractVideoId(url)}/maxresdefault.jpg`,
          duration: formatDuration(videoData.duration || 0),
          url: url,
          author: videoData.uploader || "Unknown",
          viewCount: videoData.view_count?.toString() || "0",
          uploadDate: videoData.upload_date || "",
          description: videoData.description || "",
        })
      } catch (parseError) {
        reject(new Error(`Failed to parse yt-dlp output: ${parseError}`))
      }
    })

    childProcess.on("error", (error) => {
      if (error.message.includes('ENOENT')) {
        reject(new Error(`yt-dlp not found. Please install yt-dlp or check YT_DLP_PATH environment variable. Tried path: ${ytDlpPath}`))
      } else {
        reject(new Error(`Failed to start yt-dlp: ${error.message}`))
      }
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

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: "YouTube URL is required" }, { status: 400 })
    }

    console.log("Analyzing video:", url)

    // Extract video ID
    const videoId = extractVideoId(url)
    if (!videoId) {
      return NextResponse.json({ error: "Invalid YouTube URL format" }, { status: 400 })
    }

    // Get video info using yt-dlp
    const videoInfo = await getVideoInfoWithYtDlp(url)

    // Get transcript using our Python script
    let transcript = []
    try {
      const transcriptResponse = await fetch(`${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/transcript`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId, languages: ["en"] }),
      })

      if (transcriptResponse.ok) {
        const transcriptData = await transcriptResponse.json()
        if (transcriptData.success && transcriptData.transcript) {
          transcript = transcriptData.transcript
          console.log("Transcript extracted successfully:", transcript.length, "segments")
        }
      }
    } catch (transcriptError) {
      console.warn("Transcript extraction error:", transcriptError)
    }

    const result = {
      ...videoInfo,
      transcript,
      videoId,
    }

    console.log("Video analysis complete:", {
      title: result.title,
      transcriptSegments: transcript.length,
      duration: result.duration,
    })

    return NextResponse.json({ videoInfo: result })
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
