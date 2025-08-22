import { Card, CardContent } from "@/components/ui/card"
import { Star } from "lucide-react"

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Content Creator",
    avatar: "/placeholder.svg?height=40&width=40",
    content:
      "ReHaulX transformed my workflow. What used to take hours now takes minutes. The AI-generated content is incredibly accurate and engaging.",
  },
  {
    name: "Marcus Rodriguez",
    role: "Marketing Manager",
    avatar: "/placeholder.svg?height=40&width=40",
    content:
      "The quality of content generated is outstanding. We've increased our content output by 300% while maintaining high quality standards.",
  },
  {
    name: "Emily Watson",
    role: "YouTuber",
    avatar: "/placeholder.svg?height=40&width=40",
    content:
      "Perfect for repurposing my YouTube content across all platforms. The snapshot feature is a game-changer for social media posts.",
  },
]

export function TestimonialsSection() {
  return (
    <section className="container mx-auto px-4 py-20">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent mb-6">
          Loved by Creators
        </h2>
        <p className="text-xl text-white/60 max-w-3xl mx-auto">Join thousands of content creators who trust ReHaulX</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {testimonials.map((testimonial, index) => (
          <Card
            key={index}
            className="bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105"
          >
            <CardContent className="p-8">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-white/80 mb-6 leading-relaxed">"{testimonial.content}"</p>
              <div className="flex items-center gap-3">
                <img
                  src={testimonial.avatar || "/placeholder.svg"}
                  alt={testimonial.name}
                  className="h-10 w-10 rounded-full"
                />
                <div>
                  <div className="font-semibold text-white">{testimonial.name}</div>
                  <div className="text-sm text-white/60">{testimonial.role}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
