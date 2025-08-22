import { Card, CardContent } from "@/components/ui/card"
import { Zap, FileText, Video, Globe, Smartphone, Download } from "lucide-react"

const features = [
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Transform any YouTube video into professional content in under 60 seconds",
    gradient: "from-yellow-500/20 to-orange-500/20",
  },
  {
    icon: FileText,
    title: "Multiple Formats",
    description: "Generate blog posts, LinkedIn content, Twitter threads, and newsletters",
    gradient: "from-blue-500/20 to-cyan-500/20",
  },
  {
    icon: Video,
    title: "Smart Snapshots",
    description: "AI identifies key moments and extracts perfect frames for your content",
    gradient: "from-purple-500/20 to-pink-500/20",
  },
  {
    icon: Globe,
    title: "SEO Optimized",
    description: "Content crafted for maximum reach and engagement across platforms",
    gradient: "from-green-500/20 to-emerald-500/20",
  },
  {
    icon: Smartphone,
    title: "Mobile Ready",
    description: "Responsive design that works perfectly on all devices",
    gradient: "from-indigo-500/20 to-purple-500/20",
  },
  {
    icon: Download,
    title: "Export Anywhere",
    description: "Download as PDF, DOCX, or copy to clipboard for immediate use",
    gradient: "from-red-500/20 to-pink-500/20",
  },
]

export function FeaturesSection() {
  return (
    <section className="container mx-auto px-4 py-20">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent mb-6">
          Why Choose ReHaulX?
        </h2>
        <p className="text-xl text-white/60 max-w-3xl mx-auto">
          Built for creators who want to maximize their content reach without the manual work
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <Card
            key={index}
            className="group bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-500 hover:scale-105 hover:-translate-y-2"
          >
            <CardContent className="p-8">
              <div
                className={`h-14 w-14 rounded-2xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
              >
                <feature.icon className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-blue-400 transition-colors">
                {feature.title}
              </h3>
              <p className="text-white/60 leading-relaxed">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
