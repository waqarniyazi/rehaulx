"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  FileText,
  Download,
  Image as ImageIcon,
  Archive,
  Loader2,
  CheckCircle,
  FileImage,
  Sparkles,
} from "lucide-react"
import { cleanHtmlToText } from "@/lib/textUtils"
import { toast } from "sonner"
import { saveAs } from "file-saver"
import JSZip from "jszip"
import type { VideoInfo, KeyFrame } from "@/types"

interface ExportModalProps {
  isOpen: boolean
  onClose: () => void
  content: string
  contentType: string
  videoInfo: VideoInfo
  keyFrames: KeyFrame[]
}

interface ExportOption {
  id: string
  label: string
  description: string
  icon: any
  format: string
  disabled?: boolean
  badge?: string
}

export function ExportModal({ 
  isOpen, 
  onClose, 
  content, 
  contentType, 
  videoInfo, 
  keyFrames 
}: ExportModalProps) {
  const [selectedExport, setSelectedExport] = useState<string>("")
  const [isExporting, setIsExporting] = useState(false)

  const imageCount = keyFrames.filter(f => f.imageUrl).length

  const exportOptions: ExportOption[] = [
    {
      id: "pdf",
      label: "PDF Document",
      description: "Professional document with embedded images and formatting",
      icon: FileText,
      format: "pdf",
      badge: "Recommended",
    },
    {
      id: "docx",
      label: "Word Document", 
      description: "Editable document with images and professional styling",
      icon: FileText,
      format: "docx",
      badge: "New",
    },
    {
      id: "txt",
      label: "Plain Text",
      description: "Clean text format for copying and basic editing",
      icon: FileText,
      format: "txt",
    },
    {
      id: "images",
      label: "Images ZIP",
      description: `Download all ${imageCount} extracted frames as archive`,
      icon: Archive,
      format: "zip",
      disabled: imageCount === 0,
      badge: imageCount > 0 ? `${imageCount} images` : undefined,
    },
  ]

  const handleExport = async (exportType: string) => {
    setSelectedExport(exportType)
    setIsExporting(true)

    try {
      if (exportType === "images") {
        await exportImages()
      } else {
        await exportDocument(exportType)
      }
      
      toast.success(`Successfully exported as ${exportType.toUpperCase()}!`, {
        description: "Your download should start automatically"
      })
      
      // Close modal after successful export
      setTimeout(() => {
        onClose()
      }, 1000)
    } catch (error) {
      console.error(`${exportType} export failed:`, error)
      toast.error(`Failed to export as ${exportType.toUpperCase()}`, {
        description: error instanceof Error ? error.message : "Please try again"
      })
    } finally {
      setIsExporting(false)
      setSelectedExport("")
    }
  }

  const exportDocument = async (format: string) => {
    const response = await fetch("/api/export", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content,
        format,
        videoInfo: {
          title: videoInfo.title,
          author: videoInfo.author,
          duration: videoInfo.duration,
        },
        keyFrames: keyFrames,
        contentType,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Export failed")
    }

    const blob = await response.blob()
    const filename = generateFilename(format)
    saveAs(blob, filename)
  }

  const exportImages = async () => {
    if (keyFrames.length === 0) {
      throw new Error("No images available to export")
    }

    const zip = new JSZip()
    let imageCount = 0

    for (const frame of keyFrames) {
      if (frame.imageUrl) {
        try {
          const response = await fetch(frame.imageUrl)
          if (response.ok) {
            const blob = await response.blob()
            const extension = getImageExtension(blob.type)
            const filename = `frame-${Math.floor(frame.timestamp)}s-${imageCount + 1}.${extension}`
            zip.file(filename, blob)
            imageCount++
          }
        } catch (error) {
          console.warn(`Failed to fetch image for timestamp ${frame.timestamp}:`, error)
        }
      }
    }

    if (imageCount === 0) {
      throw new Error("No images could be processed for export")
    }

    const zipBlob = await zip.generateAsync({ type: "blob" })
    const filename = `${videoInfo.title.slice(0, 50).replace(/[^a-zA-Z0-9]/g, '_')}-images.zip`
    saveAs(zipBlob, filename)
  }

  const generateFilename = (format: string) => {
    const baseFilename = videoInfo.title.slice(0, 50).replace(/[^a-zA-Z0-9]/g, '_')
    const contentTypeLabel = getContentTypeLabel(contentType)
    return `${baseFilename}-${contentTypeLabel}.${format}`
  }

  const getContentTypeLabel = (type: string) => {
    const labels = {
      "short-article": "Short-Article",
      "long-article": "Long-Article",
      linkedin: "LinkedIn-Post",
      twitter: "Twitter-Thread",
    }
    return labels[type as keyof typeof labels] || type
  }

  const getImageExtension = (mimeType: string) => {
    const extensions: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/jpg": "jpg", 
      "image/png": "png",
      "image/gif": "gif",
      "image/webp": "webp",
    }
    return extensions[mimeType] || "jpg"
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-black/95 backdrop-blur-xl border border-white/10 text-white">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center">
            <Download className="h-6 w-6 text-blue-400" />
          </div>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent">
            Export Your Content
          </DialogTitle>
          <DialogDescription className="text-white/60">
            Choose your preferred format for "{videoInfo.title.slice(0, 30)}{videoInfo.title.length > 30 ? '...' : ''}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-6">
          {exportOptions.map((option) => {
            const Icon = option.icon
            const isExportingThis = selectedExport === option.id && isExporting

            return (
              <Card
                key={option.id}
                className={`cursor-pointer transition-all duration-300 ${
                  option.disabled 
                    ? "opacity-50 cursor-not-allowed bg-white/5 border-white/5" 
                    : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                } ${isExportingThis ? "bg-blue-500/20 border-blue-500/50" : ""}`}
                onClick={() => !option.disabled && !isExporting && handleExport(option.id)}
              >
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center gap-4">
                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      isExportingThis 
                        ? "bg-blue-500/30" 
                        : "bg-gradient-to-r from-blue-500/20 to-purple-500/20"
                    }`}>
                      {isExportingThis ? (
                        <Loader2 className="h-6 w-6 text-blue-400 animate-spin" />
                      ) : (
                        <Icon className={`h-6 w-6 ${option.disabled ? "text-white/30" : "text-blue-400"}`} />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className={`font-semibold text-sm sm:text-base ${option.disabled ? "text-white/30" : "text-white"}`}>
                          {option.label}
                        </h3>
                        {option.badge && !option.disabled && (
                          <Badge 
                            variant="secondary" 
                            className={`text-xs ${
                              option.badge === "Recommended" 
                                ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                                : option.badge === "New"
                                ? "bg-green-500/20 text-green-400 border-green-500/30"
                                : "bg-white/10 text-white/70 border-white/20"
                            }`}
                          >
                            {option.badge}
                          </Badge>
                        )}
                        {isExportingThis && (
                          <Badge variant="outline" className="text-xs text-blue-400 border-blue-400 animate-pulse">
                            Exporting...
                          </Badge>
                        )}
                      </div>
                      <p className={`text-xs sm:text-sm ${option.disabled ? "text-white/20" : "text-white/60"}`}>
                        {option.description}
                      </p>
                      {option.disabled && option.id === "images" && (
                        <p className="text-xs text-yellow-400 mt-1 flex items-center gap-1">
                          <FileImage className="h-3 w-3" />
                          No images extracted from this video
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="flex items-center justify-between pt-4 mt-6 border-t border-white/10">
          <div className="text-sm text-white/60 flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">{imageCount} frames extracted</span>
            <span className="sm:hidden">{imageCount} images</span>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={onClose}
              disabled={isExporting}
              className="text-white border-white/20 hover:bg-white/5 text-sm px-4"
            >
              Close
            </Button>
            {isExporting && (
              <Button
                disabled
                className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-sm px-4"
              >
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
