import { Video, FileText, Sparkles } from "lucide-react"

const steps = [
  {
    step: "01",
    title: "Submit URL",
    description: "Paste any YouTube video URL and let our AI analyze the content",
    icon: Video,
  },
  {
    step: "02",
    title: "Choose Format",
    description: "Select your desired content type: blog, LinkedIn, Twitter, or newsletter",
    icon: FileText,
  },
  {
    step: "03",
    title: "Get Content",
    description: "Receive professionally crafted content with smart visual suggestions",
    icon: Sparkles,
  },
]

export function HowItWorksSection() {
  return (
    <section className="container mx-auto px-4 py-20">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent mb-6">
          How It Works
        </h2>
        <p className="text-xl text-white/60 max-w-3xl mx-auto">Transform your content in three simple steps</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {steps.map((item, index) => (
          <div key={index} className="text-center group">
            <div className="relative mb-8">
              <div className="h-20 w-20 mx-auto bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <item.icon className="h-10 w-10 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 h-8 w-8 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/20">
                <span className="text-xs font-bold text-white">{item.step}</span>
              </div>
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">{item.title}</h3>
            <p className="text-white/60">{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
