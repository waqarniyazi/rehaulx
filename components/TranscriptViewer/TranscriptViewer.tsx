"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, ChevronRight } from "lucide-react"
import type { TranscriptSegment } from "@/app/repurpose/page"

interface TranscriptViewerProps {
  transcript: TranscriptSegment[]
}

export function TranscriptViewer({ transcript }: TranscriptViewerProps) {
  const [isOpen, setIsOpen] = useState(false)

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button variant="outline" className="w-full justify-between bg-transparent">
          <span>View Full Transcript ({transcript.length} segments)</span>
          {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-2 mt-4">
        <div className="max-h-96 overflow-y-auto space-y-2">
          {transcript.map((segment, index) => (
            <Card key={index} className="p-3">
              <CardContent className="p-0">
                <div className="flex items-start gap-3">
                  <span className="text-xs text-muted-foreground font-mono min-w-[50px]">
                    {formatTime(segment.start)}
                  </span>
                  <p className="text-sm flex-1">{segment.text}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
