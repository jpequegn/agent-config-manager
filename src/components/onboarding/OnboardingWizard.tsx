/**
 * Onboarding Wizard Component
 * Multi-step wizard for first-time setup
 */

import { useState, useCallback } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { StepIndicator } from './StepIndicator'
import { DetectionStep } from './steps/DetectionStep'
import { ReviewStep } from './steps/ReviewStep'
import { MemoryStep } from './steps/MemoryStep'
import { CompleteStep } from './steps/CompleteStep'
import {
  useOnboardingStore,
  useCurrentStep,
  useIsWizardOpen,
  STEP_INFO,
} from '@/stores/onboarding-store'
import type { DetectionResult } from '@/types'

/**
 * Onboarding Wizard
 * Guides users through initial setup
 */
export function OnboardingWizard() {
  const currentStep = useCurrentStep()
  const isOpen = useIsWizardOpen()
  const {
    closeWizard,
    nextStep,
    previousStep,
    goToStep,
    canNavigateToStep,
    setMemoryPath,
    completeOnboarding,
    memoryPath,
  } = useOnboardingStore()

  // Local state for detection results (not persisted)
  const [detectionResults, setDetectionResults] = useState<DetectionResult[]>([])

  const handleDetectionComplete = useCallback(
    (results: DetectionResult[]) => {
      setDetectionResults(results)
      nextStep()
    },
    [nextStep]
  )

  const handleReviewComplete = useCallback(() => {
    nextStep()
  }, [nextStep])

  const handleMemoryComplete = useCallback(
    (path: string) => {
      setMemoryPath(path)
      nextStep()
    },
    [nextStep, setMemoryPath]
  )

  const handleMemorySkip = useCallback(() => {
    nextStep()
  }, [nextStep])

  const handleFinish = useCallback(() => {
    completeOnboarding()
  }, [completeOnboarding])

  const handleClose = useCallback(() => {
    // Allow closing at any step
    closeWizard()
  }, [closeWizard])

  const stepInfo = STEP_INFO[currentStep]

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="relative">
          <DialogTitle className="text-center pr-8">{stepInfo.title}</DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0"
            onClick={handleClose}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </DialogHeader>

        {/* Progress indicator */}
        <div className="py-4">
          <StepIndicator
            currentStep={currentStep}
            onStepClick={goToStep}
            canNavigate={canNavigateToStep}
          />
        </div>

        {/* Step content */}
        <div className="py-4">
          {currentStep === 'detection' && (
            <DetectionStep onComplete={handleDetectionComplete} onSkip={() => nextStep()} />
          )}

          {currentStep === 'review' && (
            <ReviewStep
              detectionResults={detectionResults}
              onComplete={handleReviewComplete}
              onBack={previousStep}
            />
          )}

          {currentStep === 'memory' && (
            <MemoryStep
              initialPath={memoryPath}
              onComplete={handleMemoryComplete}
              onBack={previousStep}
              onSkip={handleMemorySkip}
            />
          )}

          {currentStep === 'complete' && (
            <CompleteStep
              detectionResults={detectionResults}
              memoryPath={memoryPath}
              onFinish={handleFinish}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default OnboardingWizard
