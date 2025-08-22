"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, Sparkles } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { TranscriptSegment } from "@/app/repurpose/page"

interface TimestampSelectorProps {
  transcript: TranscriptSegment[]
  onTimestampsSelected: (timestamps: number[]) => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

export function TimestampSelector({
  transcript,
  onTimestampsSelected,
  isLoading,
  setIsLoading,
}: TimestampSelectorProps) {
  const [selectedTimestamps, setSelectedTimestamps] = useState<number[]>([])
  const { toast } = useToast()

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const generateTimestamps = async () => {
    setIsLoading(true)
    toast({
      title: "Analyzing content...",
      description: "AI is identifying key moments in your video",
    })

    try {
      const response = await fetch("/api/generate-timestamps", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ transcript }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate timestamps")
      }

      const { timestamps } = await response.json()
      setSelectedTimestamps(timestamps)
      onTimestampsSelected(timestamps)

      toast({
        title: "Success!",
        description: `Generated ${timestamps.length} key timestamps`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate timestamps. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Button onClick={generateTimestamps} disabled={isLoading} className="w-full">
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Analyzing...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-4 w-4" />
            Generate Key Timestamps
          </>
        )}
      </Button>

      {selectedTimestamps.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Selected Timestamps:</p>
          <div className="flex flex-wrap gap-2">
            {selectedTimestamps.map((timestamp, index) => (
              <Badge key={index} variant="secondary">
                {formatTime(timestamp)}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
