"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Copy, Linkedin } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface LinkedInPreviewProps {
  content: string
  extractedFrames: Record<number, string[]>
}

export function LinkedInPreview({ content, extractedFrames }: LinkedInPreviewProps) {
  const { toast } = useToast()

  const copyToClipboard = () => {
    navigator.clipboard.writeText(content)
    toast({
      title: "Copied!",
      description: "LinkedIn post copied to clipboard",
    })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Linkedin className="h-5 w-5" />
            LinkedIn Post
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
              <p className="text-xs text-muted-foreground">Suggested images:</p>
              <div className="grid grid-cols-2 gap-2">
                {Object.values(extractedFrames)
                  .slice(0, 2)
                  .map((frames, index) => (
                    <img
                      key={index}
                      src={frames[1] || "/placeholder.svg"} // Use middle frame
                      alt={`Suggested image ${index + 1}`}
                      className="w-full aspect-video object-cover rounded border"
                    />
                  ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
