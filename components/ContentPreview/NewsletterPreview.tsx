"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Copy, Mail } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface NewsletterPreviewProps {
  content: string
  extractedFrames: Record<number, string[]>
}

export function NewsletterPreview({ content, extractedFrames }: NewsletterPreviewProps) {
  const { toast } = useToast()

  const copyToClipboard = () => {
    navigator.clipboard.writeText(content)
    toast({
      title: "Copied!",
      description: "Newsletter content copied to clipboard",
    })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Newsletter Blurb
          </CardTitle>
          <Button variant="outline" size="sm" onClick={copyToClipboard}>
            <Copy className="h-4 w-4 mr-2" />
            Copy
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="whitespace-pre-wrap text-sm">{content}</div>

          {Object.keys(extractedFrames).length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Featured image:</p>
              <img
                src={Object.values(extractedFrames)[0]?.[1] || "/placeholder.svg"} // Use first timestamp, middle frame
                alt="Featured newsletter image"
                className="w-full max-w-md aspect-video object-cover rounded border"
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
