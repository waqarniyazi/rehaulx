"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Download, CheckCircle } from "lucide-react"
import { toast } from "sonner"

interface FrameExtractorProps {
  videoUrl: string
  timestamps: number[]
}

interface ExtractedFrame {
  timestamp: number
  dataUrl: string
  selected: boolean
}

export function FrameExtractor({ videoUrl, timestamps }: FrameExtractorProps) {
  const [frames, setFrames] = useState<ExtractedFrame[]>([])
  const [isExtracting, setIsExtracting] = useState(false)
  const [extractionProgress, setExtractionProgress] = useState(0)

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const extractFrames = async () => {
    setIsExtracting(true)
    setExtractionProgress(0)

    try {
      const video = document.createElement("video")
      video.crossOrigin = "anonymous"
      video.src = `/api/proxy?url=${encodeURIComponent(videoUrl)}`

      await new Promise((resolve, reject) => {
        video.onloadedmetadata = resolve
        video.onerror = reject
      })

      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")!
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      const extractedFrames: ExtractedFrame[] = []

      for (let i = 0; i < timestamps.length; i++) {
        const timestamp = timestamps[i]

        video.currentTime = timestamp
        await new Promise((resolve) => {
          video.onseeked = resolve
        })

        ctx.drawImage(video, 0, 0)
        const dataURL = canvas.toDataURL("image/jpeg", 0.8)

        extractedFrames.push({
          timestamp,
          dataUrl: dataURL,
          selected: true,
        })

        setExtractionProgress(((i + 1) / timestamps.length) * 100)
      }

      setFrames(extractedFrames)
      toast.success("Frames extracted!", {
        description: `${extractedFrames.length} snapshots ready`,
      })
    } catch (error) {
      toast.error("Extraction failed", {
        description: "Please try again",
      })
    } finally {
      setIsExtracting(false)
    }
  }

  const toggleFrameSelection = (index: number) => {
    setFrames((prev) => prev.map((frame, i) => (i === index ? { ...frame, selected: !frame.selected } : frame)))
  }

  const downloadSelectedFrames = () => {
    const selectedFrames = frames.filter((frame) => frame.selected)

    selectedFrames.forEach((frame, index) => {
      const link = document.createElement("a")
      link.download = `frame-${formatTime(frame.timestamp)}.jpg`
      link.href = frame.dataUrl
      link.click()
    })

    toast.success("Download started!", {
      description: `${selectedFrames.length} frames downloading`,
    })
  }

  useEffect(() => {
    if (timestamps.length > 0) {
      extractFrames()
    }
  }, [timestamps, videoUrl])

  if (isExtracting) {
    return (
      <div className="text-center space-y-4 py-8">
        <div className="h-12 w-12 mx-auto bg-gradient-to-r from-purple-600 to-purple-500 rounded-full flex items-center justify-center">
          <Loader2 className="h-6 w-6 text-white animate-spin" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white mb-2">Extracting Frames</h3>
          <p className="text-white/60">Capturing key moments from your video...</p>
        </div>
        <div className="w-full bg-white/10 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-purple-600 to-purple-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${extractionProgress}%` }}
          />
        </div>
        <p className="text-sm text-white/60">{Math.round(extractionProgress)}% complete</p>
      </div>
    )
  }

  if (frames.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-white/60">No frames to display</p>
      </div>
    )
  }

  const selectedCount = frames.filter((f) => f.selected).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-white">Video Snapshots</h3>
          <Badge variant="secondary" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
            {selectedCount} selected
          </Badge>
        </div>
        <Button
          onClick={downloadSelectedFrames}
          disabled={selectedCount === 0}
          className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white border-0"
        >
          <Download className="h-4 w-4 mr-2" />
          Download Selected
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {frames.map((frame, index) => (
          <Card
            key={index}
            className={`cursor-pointer transition-all hover:scale-[1.02] ${
              frame.selected
                ? "bg-purple-500/20 border-purple-400/50"
                : "bg-white/5 border-white/20 hover:border-white/30"
            }`}
            onClick={() => toggleFrameSelection(index)}
          >
            <CardContent className="p-3">
              <div className="relative">
                <img
                  src={frame.dataUrl || "/placeholder.svg"}
                  alt={`Frame at ${formatTime(frame.timestamp)}`}
                  className="w-full aspect-video object-cover rounded"
                />
                {frame.selected && (
                  <div className="absolute top-2 right-2">
                    <CheckCircle className="h-5 w-5 text-purple-400 bg-black/50 rounded-full" />
                  </div>
                )}
              </div>
              <div className="mt-2 text-center">
                <Badge variant="outline" className="bg-white/10 text-white/80 border-white/20">
                  {formatTime(frame.timestamp)}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
