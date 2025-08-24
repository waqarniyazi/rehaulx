"use client"

import { Header } from "@/components/Header/Header"
import { Footer } from "@/components/Footer/Footer"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Calendar, FileText } from "lucide-react"
import Link from "next/link"

interface PolicyLayoutProps {
  title: string
  lastUpdated: string
  children: React.ReactNode
}

export function PolicyLayout({ title, lastUpdated, children }: PolicyLayoutProps) {
  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        {/* Back Button */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="text-white/60 hover:text-white hover:bg-white/10">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>

        {/* Header */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-white/60 text-sm">
              <FileText className="h-4 w-4" />
              Legal Document
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent">
              {title}
            </h1>
            <div className="flex items-center justify-center gap-2 text-white/50 text-sm">
              <Calendar className="h-4 w-4" />
              Last updated: {lastUpdated}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 md:p-12">
            <div className="prose prose-invert prose-blue max-w-none">
              {children}
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="max-w-4xl mx-auto mt-12 p-6 bg-white/5 border border-white/10 rounded-xl">
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold text-white">Questions about our policies?</h3>
            <p className="text-white/60 text-sm">
              Contact us at{" "}
              <a href="mailto:legal@rehaulx.com" className="text-blue-400 hover:text-blue-300 underline">
                legal@rehaulx.com
              </a>{" "}
              for any questions or concerns.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
