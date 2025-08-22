import { Badge } from "@/components/ui/badge"
import { Sparkles } from "lucide-react"

export function HeroBadge() {
  return (
    <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full px-6 py-3 mb-8 hover:bg-white/10 transition-all duration-300">
      <Sparkles className="h-4 w-4 text-blue-400 animate-pulse" />
      <span className="text-sm font-medium text-white/90">AI-Powered Content Magic</span>
      <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
        NEW
      </Badge>
    </div>
  )
}
