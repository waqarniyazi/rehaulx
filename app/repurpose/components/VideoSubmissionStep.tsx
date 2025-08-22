"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, LinkIcon, Sparkles, Video, FileText } from "lucide-react"
import { toast } from "sonner"
import type { VideoInfo } from "../page"

interface VideoSubmissionStepProps {
  onVideoSubmitted: (videoInfo: VideoInfo) => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

export function VideoSubmissionStep({ onVideoSubmitted, isLoading, setIsLoading }: VideoSubmissionStepProps) {
  const [youtubeUrl, setYoutubeUrl] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!youtubeUrl.trim()) return

    setIsLoading(true)
    toast.info("Analyzing video...", {
      description: "Extracting video information and transcript",
    })

    try {
      const response = await fetch("/api/analyze-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: youtubeUrl.trim() }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to analyze video")
      }

      const { videoInfo } = await response.json()

      toast.success("Video analyzed successfully!", {
        description: `Found ${videoInfo.transcript?.length || 0} transcript segments`,
      })

      onVideoSubmitted(videoInfo)
    } catch (error) {
      console.error("Video analysis error:", error)
      toast.error("Failed to analyze video", {
        description: error instanceof Error ? error.message : "Please check the URL and try again",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const features = [
    {
      icon: Video,
      title: "Smart Analysis",
      description: "AI extracts key moments and insights from your video",
    },
    {
      icon: FileText,
      title: "Multiple Formats",
      description: "Generate blogs, LinkedIn posts, Twitter threads, and more",
    },
    {
      icon: Sparkles,
      title: "Frame Extraction",
      description: "Get perfect snapshots for your content automatically",
    },
  ]

  return (
    <div className="space-y-8">
      {/* URL Submission Form */}
      <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <LinkIcon className="h-5 w-5 text-blue-400" />
            Submit YouTube Video
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="youtube-url" className="text-white/80">
                YouTube URL
              </Label>
              <Input
                id="youtube-url"
                type="url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                disabled={isLoading}
                className="h-12 bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-blue-500/50 focus:ring-blue-500/20"
              />
            </div>
            <Button
              type="submit"
              disabled={isLoading || !youtubeUrl.trim()}
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white border-0"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing Video...
                </>
              ) : (
                <>
                  <Video className="mr-2 h-4 w-4" />
                  Analyze Video
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <Card
            key={index}
            className="bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 transition-all duration-300"
          >
            <CardContent className="p-6 text-center">
              <div className="h-12 w-12 mx-auto mb-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center">
                <feature.icon className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-white/60 text-sm">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
