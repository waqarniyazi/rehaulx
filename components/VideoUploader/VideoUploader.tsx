"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, LinkIcon, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { TranscriptSegment } from "@/app/repurpose/page"

interface VideoUploaderProps {
  onVideoProcessed: (url: string, transcript: TranscriptSegment[]) => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

export function VideoUploader({ onVideoProcessed, isLoading, setIsLoading }: VideoUploaderProps) {
  const [youtubeUrl, setYoutubeUrl] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const { toast } = useToast()

  const handleYouTubeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!youtubeUrl.trim()) return

    setIsLoading(true)
    toast({
      title: "Processing video...",
      description: "Extracting transcript from YouTube video",
    })

    try {
      const response = await fetch(`/api/transcript?url=${encodeURIComponent(youtubeUrl)}`)
      if (!response.ok) {
        throw new Error("Failed to extract transcript")
      }

      const transcript = await response.json()
      onVideoProcessed(youtubeUrl, transcript)

      toast({
        title: "Success!",
        description: "Video transcript extracted successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process video. Please check the URL and try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile) return

    toast({
      title: "File upload",
      description: "MP4 file upload is coming soon!",
    })
  }

  return (
    <Tabs defaultValue="youtube" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="youtube">YouTube URL</TabsTrigger>
        <TabsTrigger value="upload">Upload MP4</TabsTrigger>
      </TabsList>

      <TabsContent value="youtube" className="space-y-4">
        <form onSubmit={handleYouTubeSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="youtube-url">YouTube URL</Label>
            <Input
              id="youtube-url"
              type="url"
              placeholder="https://www.youtube.com/watch?v=..."
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <Button type="submit" disabled={isLoading || !youtubeUrl.trim()}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <LinkIcon className="mr-2 h-4 w-4" />
                Extract Transcript
              </>
            )}
          </Button>
        </form>
      </TabsContent>

      <TabsContent value="upload" className="space-y-4">
        <form onSubmit={handleFileUpload} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="video-file">Upload MP4 File</Label>
            <Card className="border-dashed border-2 border-muted-foreground/25">
              <CardContent className="flex flex-col items-center justify-center space-y-2 p-6">
                <Upload className="h-8 w-8 text-muted-foreground" />
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Drag and drop your MP4 file here, or click to browse</p>
                  <Input
                    id="video-file"
                    type="file"
                    accept=".mp4"
                    className="mt-2"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
          <Button type="submit" disabled={!selectedFile} variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Upload & Process (Coming Soon)
          </Button>
        </form>
      </TabsContent>
    </Tabs>
  )
}
