"use client"

import { Button } from "@/components/ui/button"
import { CheckCircle, Circle } from "lucide-react"

interface Step {
  number: number
  title: string
  description: string
}

interface StepNavigationProps {
  steps: Step[]
  currentStep: number
  onStepChange: (step: number) => void
  canGoToStep: (step: number) => boolean
}

export function StepNavigation({ steps, currentStep, onStepChange, canGoToStep }: StepNavigationProps) {
  return (
    <div className="mb-12">
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            <Button
              variant="ghost"
              onClick={() => canGoToStep(step.number) && onStepChange(step.number)}
              disabled={!canGoToStep(step.number)}
              className={`flex flex-col items-center p-4 h-auto ${
                currentStep === step.number
                  ? "text-blue-400 bg-blue-500/10"
                  : currentStep > step.number
                    ? "text-green-400 bg-green-500/10"
                    : "text-white/40 bg-white/5"
              } ${canGoToStep(step.number) ? "hover:bg-white/10" : "cursor-not-allowed"}`}
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 mb-2">
                {currentStep > step.number ? (
                  <CheckCircle className="w-5 h-5" />
                ) : currentStep === step.number ? (
                  <Circle className="w-5 h-5 fill-current" />
                ) : (
                  <span className="text-sm font-semibold">{step.number}</span>
                )}
              </div>
              <div className="text-center">
                <div className="font-semibold text-sm">{step.title}</div>
                <div className="text-xs opacity-60">{step.description}</div>
              </div>
            </Button>

            {index < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-4 ${currentStep > step.number ? "bg-green-400" : "bg-white/20"}`} />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
