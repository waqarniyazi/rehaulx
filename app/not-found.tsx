import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/Header/Header"
import { Suspense } from "react"
import { Footer } from "@/components/Footer/Footer"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950">
      <Suspense>
        <Header />
      </Suspense>
      
      <main className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="max-w-md w-full text-center">
          {/* 404 Icon */}
          <div className="mb-8">
            <div className="relative">
              <div className="text-8xl font-bold text-transparent bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text">
                404
              </div>
              <div className="absolute inset-0 text-8xl font-bold text-blue-500/20 blur-sm">
                404
              </div>
            </div>
          </div>

          {/* Error Message */}
          <div className="mb-8 space-y-4">
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              Page Not Found
            </h1>
            <p className="text-white/70 leading-relaxed">
              The page you're looking for doesn't exist or has been moved. 
              Don't worry, let's get you back on track.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <Link href="/">
              <Button 
                size="lg"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-blue-500/25"
              >
                Go to Homepage
              </Button>
            </Link>
            
            <Link href="/repurpose">
              <Button 
                variant="outline"
                size="lg"
                className="w-full border-white/20 text-white hover:bg-white/5 font-medium py-3 px-6 rounded-lg transition-all duration-200"
              >
                Start Repurposing Content
              </Button>
            </Link>
          </div>

          {/* Additional Help */}
          <div className="mt-8 pt-8 border-t border-white/10">
            <p className="text-sm text-white/50 mb-4">
              Need help? Here are some popular sections:
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <Link 
                href="/about" 
                className="text-xs text-blue-400 hover:text-blue-300 px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
              >
                About Us
              </Link>
              <Link 
                href="/pricing" 
                className="text-xs text-blue-400 hover:text-blue-300 px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
              >
                Pricing
              </Link>
              <Link 
                href="/dashboard" 
                className="text-xs text-blue-400 hover:text-blue-300 px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
