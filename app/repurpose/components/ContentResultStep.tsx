"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Download, Copy, Share, FileText, CheckCircle, Plus, X, Image as ImageIcon } from "lucide-react"
import { toast } from "sonner"
import { ExportModal } from "@/components/ExportModal/ExportModal"
import { 
  formatLLMContent, 
  renderFormattedContent, 
  insertFrameSuggestion,
  type ContentWithFrames,
  type SuggestedInsertion
} from "@/lib/contentFormatter"
import { cleanHtmlToText } from "@/lib/textUtils"
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
  const [formattedContentData, setFormattedContentData] = useState<ContentWithFrames | null>(null)
  const [finalContent, setFinalContent] = useState("")
  const [showExportModal, setShowExportModal] = useState(false)

  useEffect(() => {
    const formatted = formatLLMContent(generatedContent, keyFrames)
    setFormattedContentData(formatted)
    setFinalContent(formatted.content)
  }, [generatedContent, keyFrames])

  const handleCopyContent = async () => {
    try {
      const cleanContent = cleanHtmlToText(finalContent)
      await navigator.clipboard.writeText(cleanContent)
      toast.success("Content copied to clipboard!")
    } catch (error) {
      toast.error("Failed to copy content")
    }
  }

  const handleDownloadContent = () => {
    setShowExportModal(true)
  }

  const insertFrameAtPosition = (frame: KeyFrame) => {
    setSelectedFrame(frame)
    // This would open a position selector modal, but for now we'll use the first suggestion
    if (formattedContentData?.suggestedInsertions && formattedContentData.suggestedInsertions.length > 0) {
      const firstSuggestion = formattedContentData.suggestedInsertions[0]
      handleAcceptFrameSuggestion(firstSuggestion)
    }
  }

  const handleAcceptFrameSuggestion = (suggestion: SuggestedInsertion) => {
    if (!formattedContentData || !suggestion.keyFrame) return
    
    const updatedContent = insertFrameSuggestion(finalContent, suggestion)
    setFinalContent(updatedContent)
    
    // Update the suggestions list
    const updatedSuggestions = formattedContentData.suggestedInsertions.map(s => 
      s.id === suggestion.id ? { ...s, isAccepted: true } : s
    )
    setFormattedContentData({
      ...formattedContentData,
      suggestedInsertions: updatedSuggestions
    })
    
    toast.success("Frame added to content!")
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-white flex items-center gap-2 text-lg sm:text-xl">
                <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                <span className="truncate">{getContentTypeLabel(contentType)} Generated</span>
              </CardTitle>
              <p className="text-white/60 mt-1 text-sm sm:text-base">Review and export your content</p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Button
                onClick={handleCopyContent}
                variant="outline"
                size="sm"
                className="bg-white/5 border-white/20 text-white hover:bg-white/10"
              >
                <Copy className="mr-1 sm:mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Copy</span>
              </Button>
              <Button
                onClick={handleDownloadContent}
                size="sm"
                className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white border-0"
              >
                <Download className="mr-1 sm:mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Download</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <Tabs defaultValue="content" className="space-y-4">
            <TabsList className="bg-white/10 border-white/20 w-full sm:w-auto">
              <TabsTrigger value="content" className="data-[state=active]:bg-white/20 text-white flex-1 sm:flex-none text-sm">
                Content
              </TabsTrigger>
              {keyFrames.length > 0 && (
                <TabsTrigger value="frames" className="data-[state=active]:bg-white/20 text-white flex-1 sm:flex-none text-sm">
                  Frames ({keyFrames.length})
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="content" className="space-y-4">
              {/* Frame Suggestions */}
              {formattedContentData && formattedContentData.suggestedInsertions.length > 0 && (
                <Card className="bg-blue-500/5 border-blue-500/20">
                  <CardHeader className="pb-3 px-4 pt-4">
                    <CardTitle className="text-blue-400 text-sm sm:text-base flex items-center gap-2">
                      <ImageIcon className="h-4 w-4 flex-shrink-0" />
                      <span>Visual Suggestions ({formattedContentData.suggestedInsertions.length})</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 px-4 pb-4">
                    <div className="space-y-3">
                      {formattedContentData.suggestedInsertions
                        .filter(suggestion => !suggestion.isAccepted)
                        .slice(0, 3)
                        .map((suggestion) => (
                        <div
                          key={suggestion.id}
                          className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-white/10"
                        >
                          {suggestion.keyFrame?.imageUrl && (
                            <div className="w-12 h-9 sm:w-16 sm:h-12 rounded-md overflow-hidden flex-shrink-0 border border-white/20">
                              <img
                                src={suggestion.keyFrame.imageUrl}
                                alt={suggestion.text}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-white/90 text-sm mb-1 line-clamp-2">{suggestion.text}</p>
                            <p className="text-white/50 text-xs">
                              {formatTimestamp(suggestion.startTime)}-{formatTimestamp(suggestion.endTime)}
                            </p>
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                            <Button
                              size="sm"
                              onClick={() => handleAcceptFrameSuggestion(suggestion)}
                              className="h-8 px-2 sm:px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs"
                            >
                              <Plus className="h-3 w-3 sm:mr-1" />
                              <span className="hidden sm:inline">Add</span>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Main Content */}
              <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
                <div className="p-3 sm:p-4 md:p-6 max-h-80 sm:max-h-96 md:max-h-[500px] overflow-y-auto">
                  <div 
                    className="prose-formatted max-w-none text-sm sm:text-base"
                    dangerouslySetInnerHTML={{ 
                      __html: renderFormattedContent(finalContent) 
                    }} 
                  />
                </div>
              </div>

              {/* Content Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                <div className="text-center p-3 sm:p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="text-lg sm:text-xl md:text-2xl font-bold text-white">{finalContent.split(" ").length}</div>
                  <div className="text-xs sm:text-sm text-white/60">Words</div>
                </div>
                <div className="text-center p-3 sm:p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="text-lg sm:text-xl md:text-2xl font-bold text-white">{finalContent.length}</div>
                  <div className="text-xs sm:text-sm text-white/60">Characters</div>
                </div>
                <div className="text-center p-3 sm:p-4 bg-white/5 rounded-lg border border-white/10 col-span-2 sm:col-span-1">
                  <div className="text-lg sm:text-xl md:text-2xl font-bold text-white">
                    {Math.ceil(finalContent.split(" ").length / 200)}
                  </div>
                  <div className="text-xs sm:text-sm text-white/60">Min Read</div>
                </div>
              </div>
            </TabsContent>

            {keyFrames.length > 0 && (
              <TabsContent value="frames" className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                  {keyFrames.map((frame, index) => (
                    <Card
                      key={index}
                      className="bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300 group"
                    >
                      <CardContent className="p-3 sm:p-4">
                        <div className="aspect-video rounded-lg overflow-hidden mb-3 border border-white/10 bg-white/5">
                          <img
                            src={frame.imageUrl || "/placeholder.svg"}
                            alt={`Frame at ${formatTimestamp(frame.timestamp)}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                            {formatTimestamp(frame.timestamp)}
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDownloadFrame(frame)}
                            className="text-white/60 hover:text-white hover:bg-white/10 h-7 w-7 p-0"
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="text-xs sm:text-sm text-white/60 line-clamp-2">
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
        <CardHeader className="pb-4">
          <CardTitle className="text-white text-lg sm:text-xl">Export & Share</CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <Button
              variant="outline"
              className="h-16 sm:h-20 bg-white/5 border-white/20 text-white hover:bg-white/10 flex-col gap-1 sm:gap-2"
              onClick={handleDownloadContent}
            >
              <Download className="h-5 w-5 sm:h-6 sm:w-6" />
              <span className="text-xs sm:text-sm">Export Content</span>
            </Button>
            <Button
              variant="outline"
              className="h-16 sm:h-20 bg-white/5 border-white/20 text-white hover:bg-white/10 flex-col gap-1 sm:gap-2"
              onClick={handleCopyContent}
            >
              <Copy className="h-5 w-5 sm:h-6 sm:w-6" />
              <span className="text-xs sm:text-sm">Copy to Clipboard</span>
            </Button>
            <Button
              variant="outline"
              className="h-16 sm:h-20 bg-white/5 border-white/20 text-white hover:bg-white/10 flex-col gap-1 sm:gap-2 sm:col-span-2 lg:col-span-1"
              onClick={() => toast.info("Direct sharing coming soon!")}
            >
              <Share className="h-5 w-5 sm:h-6 sm:w-6" />
              <span className="text-xs sm:text-sm">Share Link</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        content={finalContent}
        contentType={contentType}
        videoInfo={videoInfo}
        keyFrames={keyFrames}
      />
    </div>
  )
}
