"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Linkedin, Twitter, ArrowRight } from "lucide-react"
import type { VideoInfo } from "../page"

interface ContentTypeSelectionStepProps {
  videoInfo: VideoInfo
  onContentTypeSelected: (contentType: string) => void
  selectedContentType: string
}

export function ContentTypeSelectionStep({
  videoInfo,
  onContentTypeSelected,
  selectedContentType,
}: ContentTypeSelectionStepProps) {
  const contentTypes = [
    {
      id: "short-article",
      title: "Short Article",
      description: "500-word SEO-optimized blog post with key insights",
      icon: FileText,
      estimatedTime: "2-3 minutes",
      features: ["SEO optimized", "Key insights", "Call-to-action"],
    },
    {
      id: "long-article",
      title: "Long Article",
      description: "1000+ word comprehensive blog post with detailed analysis",
      icon: FileText,
      estimatedTime: "3-5 minutes",
      features: ["Comprehensive", "Multiple sections", "In-depth analysis"],
    },
    {
      id: "linkedin",
      title: "LinkedIn Post",
      description: "Professional post with insights and engagement hooks",
      icon: Linkedin,
      estimatedTime: "1-2 minutes",
      features: ["Professional tone", "Hashtags included", "Engagement focused"],
    },
    {
      id: "twitter",
      title: "Twitter Thread",
      description: "8-12 tweet thread breaking down key points",
      icon: Twitter,
      estimatedTime: "1-2 minutes",
      features: ["Thread format", "Engaging hooks", "Shareable content"],
    },
  ]

  const handleContinue = () => {
    if (selectedContentType) {
      onContentTypeSelected(selectedContentType)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Choose Content Format</CardTitle>
          <p className="text-white/60">Select the type of content you want to generate from your video</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {contentTypes.map((type) => (
              <Card
                key={type.id}
                className={`cursor-pointer transition-all duration-300 ${
                  selectedContentType === type.id
                    ? "bg-blue-500/20 border-blue-500/50 ring-2 ring-blue-500/30"
                    : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                }`}
                onClick={() => onContentTypeSelected(type.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div
                      className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                        selectedContentType === type.id
                          ? "bg-blue-500/30"
                          : "bg-gradient-to-r from-blue-500/20 to-purple-500/20"
                      }`}
                    >
                      <type.icon className="h-6 w-6 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-semibold mb-1">{type.title}</h3>
                      <p className="text-white/60 text-sm mb-3">{type.description}</p>
                      <div className="flex items-center gap-2 text-xs text-white/40 mb-3">
                        <span>⏱️ {type.estimatedTime}</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {type.features.map((feature, index) => (
                          <span key={index} className="px-2 py-1 bg-white/10 rounded text-xs text-white/70">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {selectedContentType && (
            <div className="mt-6 pt-6 border-t border-white/10">
              <Button
                onClick={handleContinue}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white border-0"
              >
                Continue to Generation
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
