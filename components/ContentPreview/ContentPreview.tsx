"use client"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Sparkles } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { TranscriptSegment, GeneratedContent } from "@/app/repurpose/page"
import { BlogPreview } from "./BlogPreview"
import { LinkedInPreview } from "./LinkedInPreview"
import { TwitterPreview } from "./TwitterPreview"
import { NewsletterPreview } from "./NewsletterPreview"

interface ContentPreviewProps {
  transcript: TranscriptSegment[]
  timestamps: number[]
  extractedFrames: Record<number, string[]>
  generatedContent: GeneratedContent | null
  onContentGenerated: (content: GeneratedContent) => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

export function ContentPreview({
  transcript,
  timestamps,
  extractedFrames,
  generatedContent,
  onContentGenerated,
  isLoading,
  setIsLoading,
}: ContentPreviewProps) {
  const { toast } = useToast()

  const generateContent = async () => {
    setIsLoading(true)
    toast({
      title: "Generating content...",
      description: "AI is creating your repurposed content",
    })

    try {
      const response = await fetch("/api/generate-content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transcript,
          timestamps,
          extractedFrames,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate content")
      }

      const content = await response.json()
      onContentGenerated(content)

      toast({
        title: "Success!",
        description: "Content generated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate content. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!generatedContent) {
    return (
      <Button onClick={generateContent} disabled={isLoading} size="lg" className="w-full">
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating AI Content...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-4 w-4" />
            Generate Content
          </>
        )}
      </Button>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Generated Content</h3>
        <Button variant="outline" size="sm" onClick={generateContent} disabled={isLoading}>
          <Sparkles className="mr-2 h-4 w-4" />
          Regenerate
        </Button>
      </div>

      <Tabs defaultValue="blog" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="blog">Blog Post</TabsTrigger>
          <TabsTrigger value="linkedin">LinkedIn</TabsTrigger>
          <TabsTrigger value="twitter">Twitter</TabsTrigger>
          <TabsTrigger value="newsletter">Newsletter</TabsTrigger>
        </TabsList>

        <TabsContent value="blog">
          <BlogPreview content={generatedContent.blog} extractedFrames={extractedFrames} />
        </TabsContent>

        <TabsContent value="linkedin">
          <LinkedInPreview content={generatedContent.linkedin} extractedFrames={extractedFrames} />
        </TabsContent>

        <TabsContent value="twitter">
          <TwitterPreview content={generatedContent.twitter} extractedFrames={extractedFrames} />
        </TabsContent>

        <TabsContent value="newsletter">
          <NewsletterPreview content={generatedContent.newsletter} extractedFrames={extractedFrames} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
