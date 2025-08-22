"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, ArrowRight, CheckCircle } from "lucide-react"

interface CTASectionProps {
  onGetStarted: () => void
  onSignUp: () => void
  showSignUp: boolean
}

export function CTASection({ onGetStarted, onSignUp, showSignUp }: CTASectionProps) {
  return (
    <section className="container mx-auto px-4 py-20">
      <Card className="bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-cyan-600/20 backdrop-blur-xl border border-white/20 max-w-4xl mx-auto">
        <CardContent className="p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to Transform Your Content?</h2>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Join thousands of creators who are already using ReHaulX to maximize their content reach
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={onGetStarted}
              size="lg"
              className="h-14 px-8 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white border-0 text-lg font-semibold shadow-2xl shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 hover:scale-105"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            {showSignUp && (
              <Button
                size="lg"
                variant="outline"
                className="h-14 px-8 bg-white/10 backdrop-blur-xl border-white/30 text-white hover:bg-white/20 hover:border-white/40 text-lg font-semibold transition-all duration-300"
                onClick={onSignUp}
              >
                <CheckCircle className="mr-2 h-5 w-5" />
                Sign Up Now
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
