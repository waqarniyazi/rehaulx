"use client"

import { Header } from "@/components/Header/Header"
import { Footer } from "@/components/Footer/Footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Target, Users, Zap, Clock, Globe, Heart, Lightbulb, Rocket, Shield, FileText } from "lucide-react"
import Link from "next/link"

export default function AboutPage() {
  const stats = [
    { label: "Content Pieces Created", value: "10,000+", icon: FileText },
    { label: "Hours Saved", value: "50,000+", icon: Clock },
    { label: "Happy Creators", value: "2,500+", icon: Users },
    { label: "Platforms Supported", value: "4", icon: Globe },
  ]

  const team = [
    {
      name: "Alex Chen",
      role: "CEO & Co-founder",
      bio: "Former YouTube creator with 2M+ subscribers. Passionate about democratizing content creation.",
      image: "/placeholder.svg?height=200&width=200&text=Alex",
    },
    {
      name: "Sarah Kim",
      role: "CTO & Co-founder",
      bio: "Ex-Google AI engineer. Expert in machine learning and natural language processing.",
      image: "/placeholder.svg?height=200&width=200&text=Sarah",
    },
    {
      name: "Marcus Johnson",
      role: "Head of Product",
      bio: "10+ years in product design. Previously at Figma and Notion.",
      image: "/placeholder.svg?height=200&width=200&text=Marcus",
    },
    {
      name: "Elena Rodriguez",
      role: "Head of AI",
      bio: "PhD in Computer Science. Leading our AI research and development initiatives.",
      image: "/placeholder.svg?height=200&width=200&text=Elena",
    },
  ]

  const values = [
    {
      icon: Lightbulb,
      title: "Innovation First",
      description: "We constantly push the boundaries of what's possible with AI and content creation.",
    },
    {
      icon: Users,
      title: "Creator-Centric",
      description: "Every decision we make is guided by what's best for content creators and their audiences.",
    },
    {
      icon: Shield,
      title: "Privacy & Security",
      description: "Your content and data are protected with enterprise-grade security measures.",
    },
    {
      icon: Heart,
      title: "Community Driven",
      description: "We build features based on real feedback from our community of creators.",
    },
  ]

  const timeline = [
    {
      year: "2023",
      title: "The Beginning",
      description: "Founded by content creators who experienced the pain of manual content repurposing firsthand.",
    },
    {
      year: "2024 Q1",
      title: "AI Integration",
      description: "Launched our first AI-powered content analysis and generation features.",
    },
    {
      year: "2024 Q2",
      title: "Platform Expansion",
      description: "Added support for LinkedIn, Twitter, and newsletter content formats.",
    },
    {
      year: "2024 Q3",
      title: "Community Growth",
      description: "Reached 1,000+ active creators and processed 5,000+ videos.",
    },
    {
      year: "2024 Q4",
      title: "Advanced Features",
      description: "Introduced smart frame extraction and real-time content streaming.",
    },
  ]

  return (
    <div className="min-h-screen bg-black">
      <Header />

      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full px-4 py-2 mb-6">
            <Sparkles className="h-4 w-4 text-blue-400" />
            <span className="text-sm text-white/80">About ReHaulX</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent mb-6">
            Empowering Creators with AI
          </h1>
          <p className="text-xl text-white/60 max-w-3xl mx-auto mb-8">
            We're on a mission to democratize content creation by making it easier for creators to repurpose their video
            content across multiple platforms with the power of artificial intelligence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/repurpose">
              <Button className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white border-0">
                <Rocket className="mr-2 h-4 w-4" />
                Start Creating
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="outline" className="bg-white/5 border-white/20 text-white hover:bg-white/10">
                View Pricing
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <Card key={index} className="bg-white/5 backdrop-blur-xl border border-white/10 text-center">
              <CardContent className="p-6">
                <div className="h-12 w-12 mx-auto mb-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center">
                  <stat.icon className="h-6 w-6 text-blue-400" />
                </div>
                <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-white/60">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Mission Section */}
        <Card className="bg-white/5 backdrop-blur-xl border border-white/10 mb-16">
          <CardContent className="p-8 md:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl font-bold text-white mb-4">Our Mission</h2>
                <p className="text-white/80 mb-6 leading-relaxed">
                  Content creators spend countless hours manually adapting their video content for different platforms.
                  We believe this time should be spent on what matters most - creating amazing content and connecting
                  with audiences.
                </p>
                <p className="text-white/80 mb-6 leading-relaxed">
                  ReHaulX uses cutting-edge AI to analyze your videos, identify key moments, and automatically generate
                  platform-optimized content that maintains your unique voice and style.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">AI-Powered</Badge>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Time-Saving</Badge>
                  <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">Multi-Platform</Badge>
                </div>
              </div>
              <div className="relative">
                <div className="aspect-square bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center">
                  <Target className="h-24 w-24 text-blue-400" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Values Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Our Values</h2>
            <p className="text-white/60 max-w-2xl mx-auto">
              These core principles guide everything we do and every decision we make.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {values.map((value, index) => (
              <Card key={index} className="bg-white/5 backdrop-blur-xl border border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <value.icon className="h-6 w-6 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">{value.title}</h3>
                      <p className="text-white/60">{value.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Meet Our Team</h2>
            <p className="text-white/60 max-w-2xl mx-auto">
              We're a passionate team of creators, engineers, and AI researchers dedicated to revolutionizing content
              creation.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, index) => (
              <Card key={index} className="bg-white/5 backdrop-blur-xl border border-white/10 text-center">
                <CardContent className="p-6">
                  <img
                    src={member.image || "/placeholder.svg"}
                    alt={member.name}
                    className="w-20 h-20 rounded-full mx-auto mb-4 border-2 border-white/10"
                  />
                  <h3 className="text-lg font-semibold text-white mb-1">{member.name}</h3>
                  <p className="text-blue-400 text-sm mb-3">{member.role}</p>
                  <p className="text-white/60 text-sm">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Timeline Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Our Journey</h2>
            <p className="text-white/60 max-w-2xl mx-auto">
              From a simple idea to a powerful AI platform - here's how we've grown.
            </p>
          </div>
          <div className="space-y-6">
            {timeline.map((item, index) => (
              <Card key={index} className="bg-white/5 backdrop-blur-xl border border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-400 font-bold text-sm">{item.year}</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                      <p className="text-white/60">{item.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-white/10">
          <CardContent className="p-8 md:p-12 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Transform Your Content?</h2>
            <p className="text-white/60 mb-8 max-w-2xl mx-auto">
              Join thousands of creators who are already saving hours every week with ReHaulX. Start repurposing your
              content with AI today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/repurpose">
                <Button className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white border-0">
                  <Zap className="mr-2 h-4 w-4" />
                  Start Free Trial
                </Button>
              </Link>
              <Link href="/pricing">
                <Button variant="outline" className="bg-white/5 border-white/20 text-white hover:bg-white/10">
                  View Pricing Plans
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  )
}
