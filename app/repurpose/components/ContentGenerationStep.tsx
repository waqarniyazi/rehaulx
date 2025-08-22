"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Loader2, CheckCircle } from "lucide-react"
import { toast } from "sonner"
import type { VideoInfo, KeyFrame } from "../page"

interface ContentGenerationStepProps {
  videoInfo: VideoInfo
  contentType: string
  onContentGenerated: (content: string, keyFrames: KeyFrame[]) => void
}

export function ContentGenerationStep({ videoInfo, contentType, onContentGenerated }: ContentGenerationStepProps) {
  const [progress, setProgress] = useState(0)
  const [currentMessage, setCurrentMessage] = useState("Initializing...")
  const [generatedContent, setGeneratedContent] = useState("")
  const [isComplete, setIsComplete] = useState(false)
  const [keyFrames, setKeyFrames] = useState<KeyFrame[]>([])

  useEffect(() => {
    startGeneration()
  }, [])

  const startGeneration = async () => {
    try {
      // First, generate key timestamps
      setCurrentMessage("Analyzing video for key moments...")
      setProgress(10)

      const timestampResponse = await fetch("/api/generate-timestamps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript: videoInfo.transcript,
          contentType,
        }),
      })

      let timestamps: number[] = []
      if (timestampResponse.ok) {
        const timestampData = await timestampResponse.json()
        timestamps = timestampData.timestamps || []
      }

      setProgress(20)
      setCurrentMessage("Generating content with AI...")

      // Start content generation with streaming
      const response = await fetch("/api/generate-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoUrl: videoInfo.url,
          contentType,
          transcript: videoInfo.transcript,
          keyFrames: timestamps.map((t) => ({ timestamp: t, description: `Key moment at ${t}s` })),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to start content generation")
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error("No response stream")

      let content = ""
      let timestampMap: any[] = []

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = new TextDecoder().decode(value)
        const lines = chunk.split("\n").filter((line) => line.trim() && line.startsWith("data: "))

        for (const line of lines) {
          try {
            const data = JSON.parse(line.replace("data: ", ""))

            if (data.type === "progress") {
              setProgress(data.progress)
              setCurrentMessage(data.message)
            } else if (data.type === "content") {
              content = data.content
              setGeneratedContent(content)
              if (data.timestampMap) {
                timestampMap = data.timestampMap
              }
            } else if (data.type === "complete") {
              setProgress(100)
              setCurrentMessage("Content generation complete!")
              setIsComplete(true)

              // Extract frames for key timestamps
              if (timestamps.length > 0) {
                try {
                  const frameResponse = await fetch("/api/extract-frames", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      videoUrl: videoInfo.url,
                      timestamps: timestamps.slice(0, 5), // Limit to 5 frames
                    }),
                  })

                  if (frameResponse.ok) {
                    const frameData = await frameResponse.json()
                    setKeyFrames(frameData.frames || [])
                    onContentGenerated(content, frameData.frames || [])
                  } else {
                    onContentGenerated(content, [])
                  }
                } catch (frameError) {
                  console.warn("Frame extraction failed:", frameError)
                  onContentGenerated(content, [])
                }
              } else {
                onContentGenerated(content, [])
              }

              toast.success("Content generated successfully!", {
                description: "Your content is ready for review and export",
              })
              break
            } else if (data.type === "error") {
              throw new Error(data.error)
            }
          } catch (parseError) {
            console.warn("Failed to parse SSE data:", parseError)
          }
        }
      }
    } catch (error) {
      console.error("Content generation error:", error)
      toast.error("Content generation failed", {
        description: error instanceof Error ? error.message : "Please try again",
      })
      setCurrentMessage("Generation failed. Please try again.")
    }
  }

  const getContentTypeLabel = (type: string) => {
    const labels = {
      "short-article": "Short Article",
      "long-article": "Long Article",
      linkedin: "LinkedIn Post",
      twitter: "Twitter Thread",
    }
    return labels[type as keyof typeof labels] || type
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            {isComplete ? (
              <CheckCircle className="h-5 w-5 text-green-400" />
            ) : (
              <Loader2 className="h-5 w-5 text-blue-400 animate-spin" />
            )}
            Generating {getContentTypeLabel(contentType)}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/80">{currentMessage}</span>
              <span className="text-white/60">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2 bg-white/10" />
          </div>

          {/* Live Content Preview */}
          {generatedContent && (
            <div className="space-y-2">
              <h3 className="text-white font-semibold">Generated Content Preview:</h3>
              <div className="bg-white/5 border border-white/10 rounded-lg p-4 max-h-96 overflow-y-auto">
                <div className="text-white/80 text-sm whitespace-pre-wrap">{generatedContent}</div>
              </div>
            </div>
          )}

          {/* Generation Steps */}
          <div className="space-y-3">
            <h3 className="text-white font-semibold">Generation Process:</h3>
            <div className="space-y-2">
              {[
                { step: "Analyzing transcript", completed: progress >= 20 },
                { step: "Identifying key moments", completed: progress >= 40 },
                { step: "Generating content", completed: progress >= 80 },
                { step: "Extracting visual frames", completed: progress >= 100 },
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      item.completed ? "bg-green-400" : progress > index * 25 ? "bg-blue-400" : "bg-white/20"
                    }`}
                  />
                  <span
                    className={`text-sm ${
                      item.completed ? "text-green-400" : progress > index * 25 ? "text-blue-400" : "text-white/40"
                    }`}
                  >
                    {item.step}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
