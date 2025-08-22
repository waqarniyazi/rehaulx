import { type NextRequest, NextResponse } from "next/server"
import { spawn } from "child_process"
import path from "path"

export async function POST(request: NextRequest) {
  try {
    const { videoId, languages = ["en"], preserveFormatting = false } = await request.json()

    if (!videoId) {
      return NextResponse.json({ success: false, error: "Video ID is required" }, { status: 400 })
    }

    // Convert videoId to YouTube URL for the Python script
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`

    // Path to the Python script
    const scriptPath = path.join(process.cwd(), "scripts", "transcript_extractor.py")

    // Add extensive logging
    console.log("=== Transcript Extraction Debug ===")
    console.log("Video ID:", videoId)
    console.log("Video URL:", videoUrl)
    console.log("Script path:", scriptPath)
    console.log("Languages:", languages)

    return new Promise((resolve) => {
      const pythonProcess = spawn(
        "/Users/waqarniyazi/Downloads/rehaulx-app/.venv/bin/python", // Use virtual environment python
        [scriptPath, "extract", videoUrl, ...languages],
        {
          stdio: ["pipe", "pipe", "pipe"],
          env: { ...process.env, PYTHONUNBUFFERED: "1" },
        },
      )

      let stdout = ""
      let stderr = ""

      pythonProcess.stdout.on("data", (data) => {
        const chunk = data.toString()
        console.log("Python stdout chunk:", chunk)
        stdout += chunk
      })

      pythonProcess.stderr.on("data", (data) => {
        const chunk = data.toString()
        console.log("Python stderr chunk:", chunk)
        stderr += chunk
      })

      pythonProcess.on("close", (code) => {
        console.log("=== Python Process Results ===")
        console.log("Exit code:", code)
        console.log("Full stdout:", stdout)
        console.log("Full stderr:", stderr)
        console.log("================================")

        if (code !== 0) {
          console.error("Python script failed with code:", code)
          resolve(
            NextResponse.json(
              {
                success: false,
                error: "Failed to extract transcript",
                details: stderr || stdout || "Python script execution failed",
                code,
                debug: {
                  stdout,
                  stderr,
                  scriptPath,
                  videoUrl,
                },
              },
              { status: 500 },
            ),
          )
          return
        }

        try {
          const result = JSON.parse(stdout)
          console.log("Parsed result:", result)

          // Transform the Python response to match frontend expectations
          const transformedResult = {
            success: result.success,
            videoId: videoId,
            transcript: result.segments || result.transcript || [],
            segmentCount: result.total_segments || result.segmentCount || 0,
            title: `Video ${videoId}`,
            duration:
              result.segments && result.segments.length > 0
                ? result.segments[result.segments.length - 1].start +
                  result.segments[result.segments.length - 1].duration
                : 0,
            language: result.language,
            languageCode: result.language_code,
            isGenerated: result.is_generated,
          }

          console.log("Transformed result:", transformedResult)
          resolve(NextResponse.json(transformedResult))
        } catch (parseError) {
          console.error("Failed to parse Python output:", parseError)
          console.error("Raw stdout:", stdout)
          const errorMessage = parseError instanceof Error ? parseError.message : 'Unknown parse error'
          resolve(
            NextResponse.json(
              {
                success: false,
                error: "Failed to parse transcript data",
                details: `Parse error: ${errorMessage}`,
                rawOutput: stdout,
                debug: {
                  parseError: errorMessage,
                  stdout,
                  stderr,
                },
              },
              { status: 500 },
            ),
          )
        }
      })

      pythonProcess.on("error", (error) => {
        console.error("Failed to start Python process:", error)
        resolve(
          NextResponse.json(
            {
              success: false,
              error: "Failed to start transcript extraction",
              details: `Process error: ${error.message}`,
              debug: {
                error: error.message,
                scriptPath,
                pythonPath: "python",
              },
            },
            { status: 500 },
          ),
        )
      })

      // Set a timeout for the process
      setTimeout(() => {
        pythonProcess.kill()
        resolve(
          NextResponse.json(
            {
              success: false,
              error: "Transcript extraction timeout",
              details: "The process took too long to complete",
            },
            { status: 408 },
          ),
        )
      }, 30000) // 30 second timeout
    })
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
