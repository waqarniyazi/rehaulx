"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"

interface BetaJoinModalProps {
  isOpen: boolean
  onClose: () => void
  feature: "snippets" | "knowledge"
}

export function BetaJoinModal({ isOpen, onClose, feature }: BetaJoinModalProps) {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const featureNames = {
    snippets: "Video Snippets",
    knowledge: "Knowledge Base",
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setIsSubmitting(true)

    try {
      // Here you would typically send the email to your backend
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate API call

      toast({
        title: "Success!",
        description: `You've been added to the ${featureNames[feature]} beta waitlist.`,
      })

      setEmail("")
      onClose()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to join beta. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Join {featureNames[feature]} Beta</DialogTitle>
          <DialogDescription>
            Be the first to try our new {featureNames[feature].toLowerCase()} feature. We'll notify you when it's ready!
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? "Joining..." : "Join Beta"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
