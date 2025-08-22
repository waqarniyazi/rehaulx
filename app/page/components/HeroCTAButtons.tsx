"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Play, Video } from "lucide-react"

interface HeroCTAButtonsProps {
  onGetStarted: () => void
}

export function HeroCTAButtons({ onGetStarted }: HeroCTAButtonsProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
      <Button
        onClick={onGetStarted}
        size="lg"
        className="h-14 px-8 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white border-0 text-lg font-semibold shadow-2xl shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 hover:scale-105"
      >
        <Play className="mr-2 h-5 w-5" />
        Start Creating Content
        <ArrowRight className="ml-2 h-5 w-5" />
      </Button>
      <Button
        size="lg"
        variant="outline"
        className="h-14 px-8 bg-white/5 backdrop-blur-xl border-white/20 text-white hover:bg-white/10 hover:border-white/30 text-lg font-semibold transition-all duration-300 hover:scale-105"
      >
        <Video className="mr-2 h-5 w-5" />
        Watch Demo
      </Button>
    </div>
  )
}
