"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Download, Copy, Share, FileText, CheckCircle } from "lucide-react"
import { toast } from "sonner"
import type { VideoInfo, KeyFrame } from "../page"

interface ContentResultStepProps {
  videoInfo: VideoInfo
  contentType: string
  generatedContent: string
  keyFrames: KeyFrame[]
}

export function ContentResultStep({ videoInfo, contentType, generatedContent, keyFrames }: ContentResultStepProps) {
  const [selectedFrame, setSelectedFrame] = useState<KeyFrame | null>(null)
  const [insertPosition, setInsertPosition] = useState<number | null>(null)

  const handleCopyContent = async () => {
    try {
      await navigator.clipboard.writeText(generatedContent)
      toast.success("Content copied to clipboard!")
    } catch (error) {
      toast.error("Failed to copy content")
    }
  }

  const handleDownloadContent = () => {
    const blob = new Blob([generatedContent], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${videoInfo.title.slice(0, 50)}-${contentType}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success("Content downloaded!")
  }

  const handleDownloadFrame = (frame: KeyFrame) => {
    if (!frame.imageUrl) return

    const a = document.createElement("a")
    a.href = frame.imageUrl
    a.download = `frame-${frame.timestamp}s.jpg`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    toast.success("Frame downloaded!")
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

  const formatTimestamp = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                {getContentTypeLabel(contentType)} Generated
              </CardTitle>
              <p className="text-white/60 mt-1">Review and export your content</p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleCopyContent}
                variant="outline"
                className="bg-white/5 border-white/20 text-white hover:bg-white/10"
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy
              </Button>
              <Button
                onClick={handleDownloadContent}
                className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white border-0"
              >
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="content" className="space-y-4">
            <TabsList className="bg-white/10 border-white/20">
              <TabsTrigger value="content" className="data-[state=active]:bg-white/20 text-white">
                Generated Content
              </TabsTrigger>
              {keyFrames.length > 0 && (
                <TabsTrigger value="frames" className="data-[state=active]:bg-white/20 text-white">
                  Key Frames ({keyFrames.length})
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="content" className="space-y-4">
              <div className="bg-white/5 border border-white/10 rounded-lg p-6 max-h-96 overflow-y-auto">
                <div className="text-white/90 whitespace-pre-wrap leading-relaxed">{generatedContent}</div>
              </div>

              {/* Content Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="text-2xl font-bold text-white">{generatedContent.split(" ").length}</div>
                  <div className="text-sm text-white/60">Words</div>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="text-2xl font-bold text-white">{generatedContent.length}</div>
                  <div className="text-sm text-white/60">Characters</div>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="text-2xl font-bold text-white">
                    {Math.ceil(generatedContent.split(" ").length / 200)}
                  </div>
                  <div className="text-sm text-white/60">Min Read</div>
                </div>
              </div>
            </TabsContent>

            {keyFrames.length > 0 && (
              <TabsContent value="frames" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {keyFrames.map((frame, index) => (
                    <Card
                      key={index}
                      className="bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300"
                    >
                      <CardContent className="p-4">
                        <div className="aspect-video rounded-lg overflow-hidden mb-3 border border-white/10">
                          <img
                            src={frame.imageUrl || "/placeholder.svg"}
                            alt={`Frame at ${formatTimestamp(frame.timestamp)}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                            {formatTimestamp(frame.timestamp)}
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDownloadFrame(frame)}
                            className="text-white/60 hover:text-white hover:bg-white/10"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-sm text-white/60">
                          {frame.description || `Key moment at ${formatTimestamp(frame.timestamp)}`}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            )}
          </Tabs>
        </CardContent>
      </Card>

      {/* Export Options */}
      <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Export & Share</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="h-20 bg-white/5 border-white/20 text-white hover:bg-white/10 flex-col gap-2"
              onClick={handleDownloadContent}
            >
              <FileText className="h-6 w-6" />
              <span>Download as TXT</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 bg-white/5 border-white/20 text-white hover:bg-white/10 flex-col gap-2"
              onClick={() => toast.info("PDF export coming soon!")}
            >
              <Download className="h-6 w-6" />
              <span>Export as PDF</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 bg-white/5 border-white/20 text-white hover:bg-white/10 flex-col gap-2"
              onClick={() => toast.info("Direct sharing coming soon!")}
            >
              <Share className="h-6 w-6" />
              <span>Share Link</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
