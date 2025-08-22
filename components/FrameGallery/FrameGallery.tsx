"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, ImageIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface FrameGalleryProps {
  videoUrl: string
  timestamps: number[]
  onFramesExtracted: (frames: Record<number, string[]>) => void
  extractedFrames: Record<number, string[]>
}

export function FrameGallery({ videoUrl, timestamps, onFramesExtracted, extractedFrames }: FrameGalleryProps) {
  const [isExtracting, setIsExtracting] = useState(false)
  const { toast } = useToast()

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const extractFrames = async () => {
    setIsExtracting(true)
    toast({
      title: "Extracting frames...",
      description: "Capturing video frames at key timestamps",
    })

    try {
      // Create a video element to extract frames
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

      const newFrames: Record<number, string[]> = {}

      for (const timestamp of timestamps) {
        const frames: string[] = []

        // Extract 3 frames: t-0.5s, t, t+0.5s
        const offsets = [-0.5, 0, 0.5]

        for (const offset of offsets) {
          const seekTime = Math.max(0, timestamp + offset)
          video.currentTime = seekTime

          await new Promise((resolve) => {
            video.onseeked = resolve
          })

          ctx.drawImage(video, 0, 0)
          const dataURL = canvas.toDataURL("image/jpeg", 0.8)
          frames.push(dataURL)
        }

        newFrames[timestamp] = frames
      }

      onFramesExtracted(newFrames)

      toast({
        title: "Success!",
        description: `Extracted ${timestamps.length * 3} frames`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to extract frames. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsExtracting(false)
    }
  }

  return (
    <div className="space-y-4">
      <Button onClick={extractFrames} disabled={isExtracting} className="w-full">
        {isExtracting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Extracting Frames...
          </>
        ) : (
          <>
            <ImageIcon className="mr-2 h-4 w-4" />
            Extract Video Frames
          </>
        )}
      </Button>

      {Object.keys(extractedFrames).length > 0 && (
        <div className="space-y-4">
          <p className="text-sm font-medium">Extracted Frames:</p>
          <div className="space-y-4">
            {Object.entries(extractedFrames).map(([timestamp, frames]) => (
              <Card key={timestamp}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline">{formatTime(Number(timestamp))}</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {frames.map((frame, index) => (
                      <div key={index} className="aspect-video">
                        <img
                          src={frame || "/placeholder.svg"}
                          alt={`Frame at ${formatTime(Number(timestamp))} + ${index - 1 * 0.5}s`}
                          className="w-full h-full object-cover rounded border"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
