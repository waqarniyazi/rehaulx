"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { Clock, Sparkles, Video } from "lucide-react"

interface TimestampSkeletonProps {
  message?: string
  timestampRange?: string
}

export function TimestampSkeleton({ 
  message = "Analyzing Visual Moments", 
  timestampRange 
}: TimestampSkeletonProps) {
  return (
    <div className="my-4 p-4 sm:p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg">
      <div className="flex items-start gap-3 sm:gap-4">
        {/* Icon Section */}
        <div className="h-12 w-12 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
          <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400 animate-pulse" />
        </div>

        {/* Content Section */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 mb-3">
            <div className="flex items-center gap-2">
              <h4 className="text-sm sm:text-base font-medium text-blue-400">{message}</h4>
              {timestampRange && (
                <div className="flex items-center gap-1 px-2 py-1 bg-blue-500/20 border border-blue-500/30 rounded text-xs text-blue-300">
                  <Clock className="h-3 w-3" />
                  <span>{timestampRange}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs text-white/40">
              <Video className="h-3 w-3" />
              <span>Processing frames...</span>
            </div>
          </div>

          {/* Progress Skeleton */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-3 w-20 bg-blue-500/20" />
              <Skeleton className="h-3 w-16 bg-blue-500/20" />
              <Skeleton className="h-3 w-24 bg-blue-500/20" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-3 w-16 bg-blue-500/20" />
              <Skeleton className="h-3 w-28 bg-blue-500/20" />
              <Skeleton className="h-3 w-12 bg-blue-500/20" />
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse rounded-full w-2/3 transition-all duration-1000" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
