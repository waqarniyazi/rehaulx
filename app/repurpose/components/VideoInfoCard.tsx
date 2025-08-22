import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Eye, User } from "lucide-react"
import type { VideoInfo } from "../page"

interface VideoInfoCardProps {
  videoInfo: VideoInfo
  currentStep: number
}

export function VideoInfoCard({ videoInfo, currentStep }: VideoInfoCardProps) {
  return (
    <Card className="bg-white/5 backdrop-blur-xl border border-white/10 sticky top-6">
      <CardHeader>
        <CardTitle className="text-white text-lg">Video Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Thumbnail */}
        <div className="aspect-video rounded-lg overflow-hidden border border-white/10">
          <img
            src={videoInfo.thumbnail || "/placeholder.svg"}
            alt={videoInfo.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Title */}
        <div>
          <h3 className="text-white font-semibold line-clamp-2 mb-2">{videoInfo.title}</h3>
          <div className="flex items-center gap-2 text-sm text-white/60">
            <User className="h-4 w-4" />
            <span>{videoInfo.author}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-sm text-white/60">
            <Clock className="h-4 w-4" />
            <span>{videoInfo.duration}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-white/60">
            <Eye className="h-4 w-4" />
            <span>{Number.parseInt(videoInfo.viewCount).toLocaleString()}</span>
          </div>
        </div>

        {/* Transcript Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-white/60">Transcript</span>
          <Badge
            variant={videoInfo.transcript?.length > 0 ? "default" : "secondary"}
            className={
              videoInfo.transcript?.length > 0
                ? "bg-green-500/20 text-green-400 border-green-500/30"
                : "bg-orange-500/20 text-orange-400 border-orange-500/30"
            }
          >
            {videoInfo.transcript?.length > 0 ? `${videoInfo.transcript.length} segments` : "Not available"}
          </Badge>
        </div>

        {/* Progress Indicator */}
        <div className="pt-4 border-t border-white/10">
          <div className="flex items-center justify-between text-sm text-white/60 mb-2">
            <span>Progress</span>
            <span>Step {currentStep} of 4</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
