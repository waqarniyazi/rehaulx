"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Copy, FileText } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface BlogPreviewProps {
  content: {
    text: string
    ideas: Array<{
      title: string
      outline: string[]
    }>
  }
  extractedFrames: Record<number, string[]>
}

export function BlogPreview({ content, extractedFrames }: BlogPreviewProps) {
  const { toast } = useToast()

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: "Content copied to clipboard",
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Blog Post
            </CardTitle>
            <Button variant="outline" size="sm" onClick={() => copyToClipboard(content.text)}>
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none">
            <div className="whitespace-pre-wrap">{content.text}</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Additional Article Ideas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {content.ideas.map((idea, index) => (
            <div key={index} className="space-y-2">
              <h4 className="font-semibold">{idea.title}</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                {idea.outline.map((point, pointIndex) => (
                  <li key={pointIndex}>{point}</li>
                ))}
              </ul>
              {index < content.ideas.length - 1 && <Separator />}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
