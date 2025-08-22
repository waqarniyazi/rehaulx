"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Loader2, Video, Database, CheckCircle } from "lucide-react"
import { toast } from "sonner"

interface BetaSignupModalProps {
  isOpen: boolean
  onClose: () => void
  feature: "reels" | "knowledge"
}

export function BetaSignupModal({ isOpen, onClose, feature }: BetaSignupModalProps) {
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [useCase, setUseCase] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const featureInfo = {
    reels: {
      title: "YouTube Reels Creator",
      icon: Video,
      description: "Transform your long-form videos into viral YouTube Shorts and Reels",
      benefits: [
        "Auto-crop to vertical format",
        "AI-generated captions and hooks",
        "Viral moment detection",
        "Batch processing",
        "Custom branding overlays",
      ],
    },
    knowledge: {
      title: "YouTube Knowledge Graph",
      icon: Database,
      description: "Build a searchable knowledge base from your entire video library",
      benefits: [
        "Semantic search across all videos",
        "AI-powered Q&A assistant",
        "Content relationship mapping",
        "Topic clustering",
        "Automated tagging",
      ],
    },
  }

  const currentFeature = featureInfo[feature]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !name.trim()) return

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/beta-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name,
          feature,
          useCase,
        }),
      })

      if (response.ok) {
        toast.success("Welcome to the beta!", {
          description: `You've been added to the ${currentFeature.title} waitlist. We'll notify you when it's ready!`,
        })
        setEmail("")
        setName("")
        setUseCase("")
        onClose()
      } else {
        throw new Error("Failed to join beta")
      }
    } catch (error) {
      toast.error("Failed to join beta", {
        description: "Please try again later",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-background/95 backdrop-blur border-border/50">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 bg-primary/20 rounded-lg flex items-center justify-center">
              <currentFeature.icon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl">{currentFeature.title}</DialogTitle>
              <Badge variant="secondary" className="mt-1">
                Beta Access
              </Badge>
            </div>
          </div>
          <DialogDescription className="text-base">{currentFeature.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Benefits */}
          <div>
            <h4 className="font-semibold mb-3">What you'll get:</h4>
            <div className="space-y-2">
              {currentFeature.benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                  <span className="text-sm">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="beta-name">Full Name</Label>
                <Input
                  id="beta-name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="beta-email">Email Address</Label>
                <Input
                  id="beta-email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="beta-usecase">How will you use this feature? (Optional)</Label>
              <Textarea
                id="beta-usecase"
                placeholder="Tell us about your content creation workflow and how this feature would help..."
                value={useCase}
                onChange={(e) => setUseCase(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Joining Beta...
                  </>
                ) : (
                  `Join ${currentFeature.title} Beta`
                )}
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </form>

          <div className="text-center text-sm text-muted-foreground">
            <p>🎉 Limited beta spots available</p>
            <p>We'll notify you as soon as your access is ready!</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
