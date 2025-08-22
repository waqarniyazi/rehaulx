"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Copy, Twitter } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface TwitterPreviewProps {
  content: string[]
  extractedFrames: Record<number, string[]>
}

export function TwitterPreview({ content, extractedFrames }: TwitterPreviewProps) {
  const { toast } = useToast()

  const copyToClipboard = () => {
    const fullThread = content.join("\n\n")
    navigator.clipboard.writeText(fullThread)
    toast({
      title: "Copied!",
      description: "Twitter thread copied to clipboard",
    })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Twitter className="h-5 w-5" />
            Twitter Thread ({content.length} tweets)
          </CardTitle>
          <Button variant="outline" size="sm" onClick={copyToClipboard}>
            <Copy className="h-4 w-4 mr-2" />
            Copy Thread
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {content.map((tweet, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                  {index + 1}/{content.length}
                </span>
              </div>
              <div className="text-sm whitespace-pre-wrap">{tweet}</div>
              {index < content.length - 1 && <Separator />}
            </div>
          ))}

          {Object.keys(extractedFrames).length > 0 && (
            <div className="space-y-2 mt-4">
              <p className="text-xs text-muted-foreground">Suggested images for thread:</p>
              <div className="grid grid-cols-3 gap-2">
                {Object.values(extractedFrames)
                  .slice(0, 3)
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
