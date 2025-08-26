"use client"

import { useState } from "react"
import { Header } from "@/components/Header/Header"
import { Footer } from "@/components/Footer/Footer"
import { useAuth } from "@/hooks/useAuth"
import { AuthModal } from "@/components/auth/AuthModal"
import { AnimatedBackground } from "./page/components/AnimatedBackground"
import { HeroBadge } from "./page/components/HeroBadge"
import { HeroHeadline } from "./page/components/HeroHeadline"
import { HeroSubtitle } from "./page/components/HeroSubtitle"
import { HeroCTAButtons } from "./page/components/HeroCTAButtons"
import { StatsGrid } from "./page/components/StatsGrid"
import { FeaturesSection } from "./page/components/FeaturesSection"
import { HowItWorksSection } from "./page/components/HowItWorksSection"
import { TestimonialsSection } from "./page/components/TestimonialsSection"
import { CTASection } from "./page/components/CTASection"

export default function HomePage() {
  const [showAuthModal, setShowAuthModal] = useState(false)
  const { user } = useAuth()

  const handleGetStarted = () => {
    const appUrl = process.env.NODE_ENV === "development" 
      ? "http://app.localhost:3000" 
      : "https://app.rehaulx.com"
    // Always take users to the app domain; add ?auth=1 only if not present.
    try {
      const target = new URL(appUrl)
      if (!target.searchParams.has("auth")) target.searchParams.set("auth", "1")
      window.location.href = target.toString()
    } catch {
      window.location.href = `${appUrl}?auth=1`
    }
  }

  const handleSignUp = () => {
    const appUrl = process.env.NODE_ENV === "development" 
      ? "http://app.localhost:3000" 
      : "https://app.rehaulx.com"
    try {
      const target = new URL(appUrl)
      if (!target.searchParams.has("auth")) target.searchParams.set("auth", "1")
      window.location.href = target.toString()
    } catch {
      window.location.href = `${appUrl}?auth=1`
    }
  }

  return (
    <div className="min-h-screen bg-black overflow-hidden">
      <AnimatedBackground />
      <Header />

      <main className="relative">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20 text-center">
          <div className="max-w-5xl mx-auto">
            <HeroBadge />
            <HeroHeadline />
            <HeroSubtitle />
            <HeroCTAButtons onGetStarted={handleGetStarted} />
            <StatsGrid />
          </div>
        </section>

        <FeaturesSection />
        <HowItWorksSection />
        <TestimonialsSection />
        <CTASection onGetStarted={handleGetStarted} onSignUp={handleSignUp} showSignUp={!user} />
      </main>

      <Footer />
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  )
}
