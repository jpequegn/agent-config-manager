/**
 * Step Indicator Component
 * Shows progress through onboarding wizard steps
 */

import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ONBOARDING_STEPS, STEP_INFO, type OnboardingStep } from '@/stores/onboarding-store'

interface StepIndicatorProps {
  currentStep: OnboardingStep
  onStepClick?: (step: OnboardingStep) => void
  canNavigate?: (step: OnboardingStep) => boolean
}

export function StepIndicator({ currentStep, onStepClick, canNavigate }: StepIndicatorProps) {
  const currentIndex = ONBOARDING_STEPS.indexOf(currentStep)

  return (
    <div className="flex items-center justify-center gap-2">
      {ONBOARDING_STEPS.map((step, index) => {
        const info = STEP_INFO[step]
        const isActive = step === currentStep
        const isCompleted = index < currentIndex
        const canClick = canNavigate?.(step) ?? false

        return (
          <div key={step} className="flex items-center">
            {/* Step circle */}
            <button
              onClick={() => canClick && onStepClick?.(step)}
              disabled={!canClick}
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-all',
                isCompleted && 'bg-primary text-primary-foreground',
                isActive &&
                  'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-background',
                !isActive && !isCompleted && 'bg-muted text-muted-foreground',
                canClick &&
                  !isActive &&
                  'cursor-pointer hover:bg-primary/80 hover:text-primary-foreground'
              )}
              title={info.title}
            >
              {isCompleted ? <Check className="h-4 w-4" /> : <span>{index + 1}</span>}
            </button>

            {/* Connector line */}
            {index < ONBOARDING_STEPS.length - 1 && (
              <div
                className={cn(
                  'mx-2 h-0.5 w-8 transition-colors',
                  index < currentIndex ? 'bg-primary' : 'bg-muted'
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

export default StepIndicator
