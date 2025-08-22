import { Card, CardContent } from "@/components/ui/card"
import { Video, FileText, Users, Star } from "lucide-react"

const stats = [
  { number: "50K+", label: "Videos Processed", icon: Video },
  { number: "200K+", label: "Content Pieces", icon: FileText },
  { number: "10K+", label: "Happy Creators", icon: Users },
  { number: "4.9/5", label: "User Rating", icon: Star },
]

export function StatsGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
      {stats.map((stat, index) => (
        <div key={index} className="group hover:scale-110 transition-all duration-300">
          <Card className="bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300">
            <CardContent className="p-6 text-center">
              <stat.icon className="h-8 w-8 mx-auto mb-3 text-blue-400 group-hover:text-blue-300 transition-colors" />
              <div className="text-2xl md:text-3xl font-bold text-white mb-1">{stat.number}</div>
              <div className="text-sm text-white/60">{stat.label}</div>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  )
}
