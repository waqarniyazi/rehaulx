"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Mail, Phone, MapPin, Send, Sparkles, Shield, CircleDot } from "lucide-react"

export default function ContactPage() {
  const [loading, setLoading] = useState(false)

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => setLoading(false), 1000)
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="relative overflow-hidden">
        {/* Aurora background */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl animate-pulse" />
          <div className="absolute -bottom-32 -right-32 h-[28rem] w-[28rem] rounded-full bg-purple-500/10 blur-3xl animate-pulse" />
        </div>

        <section className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full px-4 py-2 mb-6">
              <Sparkles className="h-4 w-4 text-blue-400" />
              <span className="text-sm text-white/80">We'd love to hear from you</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent mb-4">
              Contact Us
            </h1>
            <p className="text-white/60 max-w-2xl mx-auto">Have a question, feedback, or partnership idea? Reach out—our team typically replies within 24 hours.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Contact info */}
            <Card className="lg:col-span-1 bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300">
              <CardHeader>
                <CardTitle>Get in touch</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                    <Mail className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-white/80">Support</p>
                    <a href="mailto:support@rehaulx.com" className="text-white/60 hover:text-white transition">support@rehaulx.com</a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                    <Phone className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-white/80">Sales</p>
                    <p className="text-white/60">By appointment via email</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-white/80">HQ</p>
                    <p className="text-white/60">Remote-first, global team</p>
                  </div>
                </div>
                <div className="pt-4 border-t border-white/10">
                  <div className="flex items-center gap-2 text-white/60 text-sm">
                    <Shield className="h-4 w-4 text-emerald-400" />
                    We reply within 24 hours
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact form */}
            <Card className="lg:col-span-2 bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300">
              <CardHeader>
                <CardTitle>Send us a message</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={onSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input required placeholder="Your name" className="bg-black/20 border-white/10 text-white placeholder:text-white/40" />
                    <Input required type="email" placeholder="Your email" className="bg-black/20 border-white/10 text-white placeholder:text-white/40" />
                  </div>
                  <Input placeholder="Company (optional)" className="bg-black/20 border-white/10 text-white placeholder:text-white/40" />
                  <Textarea required placeholder="How can we help?" className="min-h-[140px] bg-black/20 border-white/10 text-white placeholder:text-white/40" />
                  <Button type="submit" disabled={loading} className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600">
                    <Send className="mr-2 h-4 w-4" />
                    {loading ? "Sending..." : "Send message"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  )
}
