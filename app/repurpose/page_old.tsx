'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/Header/Header'
import { Footer } from '@/components/Footer/Footer'
import { VideoSubmissionStep } from './components/VideoSubmissionStep'
import { ContentTypeSelectionStep } from './components/ContentTypeSelectionStep'
import { ContentGenerationStep } from './components/ContentGenerationStep'
import { ContentResultStep } from './components/ContentResultStep'
import { StepNavigation } from './components/StepNavigation'
import { VideoInfoCard } from './components/VideoInfoCard'
import { useAuth } from '@/hooks/useAuth'
import type { TranscriptSegment, VideoInfo, KeyFrame } from '@/types'

export interface GeneratedContent {
  blog: string
  linkedin: string
  twitter: string
  newsletter: string
}

export default function RepurposePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null)
  const [selectedContentType, setSelectedContentType] = useState<string>('')
  const [generatedContent, setGeneratedContent] = useState<string>('')
  const [keyFrames, setKeyFrames] = useState<KeyFrame[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [redirecting, setRedirecting] = useState(false)

  // Handle authentication redirect
  useEffect(() => {
    if (!loading && !user && !redirecting) {
      setRedirecting(true)
      const redirectUrl = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:3000/auth/callback?redirect=/repurpose'
        : 'https://rehaulx.com/auth/callback?redirect=/repurpose'
      
      // Use window.location.href for cross-domain redirect
      setTimeout(() => {
        window.location.href = redirectUrl
      }, 100)
    }
  }, [user, loading, redirecting])

  // Show loading state
  if (loading || redirecting || !user) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-white/60">
              {loading ? 'Loading...' : redirecting ? 'Redirecting to sign in...' : 'Please wait...'}
            </p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  const steps = [
    { number: 1, title: 'Submit Video', description: 'Enter YouTube URL' },
    { number: 2, title: 'Choose Format', description: 'Select content type' },
    { number: 3, title: 'Generate', description: 'AI creates content' },
    { number: 4, title: 'Review & Export', description: 'Finalize your content' },
  ]

  const handleVideoSubmitted = (video: VideoInfo) => {
    setVideoInfo(video)
    setCurrentStep(2)
  }

  const handleContentTypeSelected = (contentType: string) => {
    setSelectedContentType(contentType)
    setCurrentStep(3)
  }

  const handleContentGenerated = (content: string, frames: KeyFrame[]) => {
    setGeneratedContent(content)
    setKeyFrames(frames)
    setCurrentStep(4)
  }

  const handleStepChange = (step: number) => {
    if (step === 1) {
      // Reset everything when going back to step 1
      setVideoInfo(null)
      setSelectedContentType('')
      setGeneratedContent('')
      setKeyFrames([])
    } else if (step === 2 && !videoInfo) {
      return // Can't go to step 2 without video
    } else if (step === 3 && (!videoInfo || !selectedContentType)) {
      return // Can't go to step 3 without video and content type
    } else if (step === 4 && (!videoInfo || !selectedContentType || !generatedContent)) {
      return // Can't go to step 4 without all previous data
    }

    setCurrentStep(step)
  }

  const canGoToStep = (step: number) => {
    switch (step) {
      case 1:
        return true
      case 2:
        return !!videoInfo
      case 3:
        return !!videoInfo && !!selectedContentType
      case 4:
        return !!videoInfo && !!selectedContentType && !!generatedContent
      default:
        return false
    }
  }

  return (
    <div className="min-h-screen bg-black">
      <Header />

      <main className="container mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent mb-4">
            Repurpose Your Content
          </h1>
          <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto px-4">
            Transform any YouTube video into professional content in minutes
          </p>
        </div>

        {/* Step Navigation */}
        <StepNavigation
          steps={steps}
          currentStep={currentStep}
          onStepChange={handleStepChange}
          canGoToStep={canGoToStep}
        />

        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Main Content Area */}
            <div className="lg:col-span-2 order-2 lg:order-1">
              {currentStep === 1 && (
                <VideoSubmissionStep
                  onVideoSubmitted={handleVideoSubmitted}
                  isLoading={isLoading}
                  setIsLoading={setIsLoading}
                />
              )}

              {currentStep === 2 && videoInfo && (
                <ContentTypeSelectionStep
                  videoInfo={videoInfo}
                  onContentTypeSelected={handleContentTypeSelected}
                  selectedContentType={selectedContentType}
                />
              )}

              {currentStep === 3 && videoInfo && selectedContentType && (
                <ContentGenerationStep
                  videoInfo={videoInfo}
                  contentType={selectedContentType}
                  onContentGenerated={handleContentGenerated}
                />
              )}

              {currentStep === 4 && videoInfo && generatedContent && (
                <ContentResultStep
                  videoInfo={videoInfo}
                  contentType={selectedContentType}
                  generatedContent={generatedContent}
                  keyFrames={keyFrames}
                />
              )}
            </div>

            {/* Sidebar - Video Info */}
            <div className="lg:col-span-1 order-1 lg:order-2">
              {videoInfo && (
                <div className="sticky top-6">
                  <VideoInfoCard videoInfo={videoInfo} currentStep={currentStep} />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

  const steps = [
    { number: 1, title: "Submit Video", description: "Enter YouTube URL" },
    { number: 2, title: "Choose Format", description: "Select content type" },
    { number: 3, title: "Generate", description: "AI creates content" },
    { number: 4, title: "Review & Export", description: "Finalize your content" },
  ]

  const handleVideoSubmitted = (video: VideoInfo) => {
    setVideoInfo(video)
    setCurrentStep(2)
  }

  const handleContentTypeSelected = (contentType: string) => {
    setSelectedContentType(contentType)
    setCurrentStep(3)
  }

  const handleContentGenerated = (content: string, frames: KeyFrame[]) => {
    setGeneratedContent(content)
    setKeyFrames(frames)
    setCurrentStep(4)
  }

  const handleStepChange = (step: number) => {
    if (step === 1) {
      // Reset everything when going back to step 1
      setVideoInfo(null)
      setSelectedContentType("")
      setGeneratedContent("")
      setKeyFrames([])
    } else if (step === 2 && !videoInfo) {
      return // Can't go to step 2 without video
    } else if (step === 3 && (!videoInfo || !selectedContentType)) {
      return // Can't go to step 3 without video and content type
    } else if (step === 4 && (!videoInfo || !selectedContentType || !generatedContent)) {
      return // Can't go to step 4 without all previous data
    }

    setCurrentStep(step)
  }

  const canGoToStep = (step: number) => {
    switch (step) {
      case 1:
        return true
      case 2:
        return !!videoInfo
      case 3:
        return !!videoInfo && !!selectedContentType
      case 4:
        return !!videoInfo && !!selectedContentType && !!generatedContent
      default:
        return false
    }
  }

  return (
    <div className="min-h-screen bg-black">
      <Header />

      <main className="container mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent mb-4">
            Repurpose Your Content
          </h1>
          <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto px-4">
            Transform any YouTube video into professional content in minutes
          </p>
        </div>

        {/* Step Navigation */}
        <StepNavigation
          steps={steps}
          currentStep={currentStep}
          onStepChange={handleStepChange}
          canGoToStep={canGoToStep}
        />

        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Main Content Area */}
            <div className="lg:col-span-2 order-2 lg:order-1">
              {currentStep === 1 && (
                <VideoSubmissionStep
                  onVideoSubmitted={handleVideoSubmitted}
                  isLoading={isLoading}
                  setIsLoading={setIsLoading}
                />
              )}

              {currentStep === 2 && videoInfo && (
                <ContentTypeSelectionStep
                  videoInfo={videoInfo}
                  onContentTypeSelected={handleContentTypeSelected}
                  selectedContentType={selectedContentType}
                />
              )}

              {currentStep === 3 && videoInfo && selectedContentType && (
                <ContentGenerationStep
                  videoInfo={videoInfo}
                  contentType={selectedContentType}
                  onContentGenerated={handleContentGenerated}
                />
              )}

              {currentStep === 4 && videoInfo && generatedContent && (
                <ContentResultStep
                  videoInfo={videoInfo}
                  contentType={selectedContentType}
                  generatedContent={generatedContent}
                  keyFrames={keyFrames}
                />
              )}
            </div>

            {/* Sidebar - Video Info */}
            <div className="lg:col-span-1 order-1 lg:order-2">
              {videoInfo && (
                <div className="sticky top-6">
                  <VideoInfoCard videoInfo={videoInfo} currentStep={currentStep} />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
