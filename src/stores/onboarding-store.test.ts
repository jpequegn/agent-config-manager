/**
 * Onboarding Store Tests
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { useOnboardingStore, ONBOARDING_STEPS } from './onboarding-store'

describe('OnboardingStore', () => {
  beforeEach(() => {
    useOnboardingStore.setState({
      hasCompletedOnboarding: false,
      currentStep: 'detection',
      isWizardOpen: false,
      isDetecting: false,
      memoryPath: null,
      skippedSteps: new Set(),
    })
  })

  it('starts with initial state', () => {
    const state = useOnboardingStore.getState()
    expect(state.hasCompletedOnboarding).toBe(false)
    expect(state.currentStep).toBe('detection')
    expect(state.isWizardOpen).toBe(false)
    expect(state.isDetecting).toBe(false)
    expect(state.memoryPath).toBeNull()
    expect(state.skippedSteps.size).toBe(0)
  })

  describe('wizard open/close', () => {
    it('opens the wizard', () => {
      useOnboardingStore.getState().openWizard()
      expect(useOnboardingStore.getState().isWizardOpen).toBe(true)
    })

    it('closes the wizard', () => {
      useOnboardingStore.getState().openWizard()
      useOnboardingStore.getState().closeWizard()
      expect(useOnboardingStore.getState().isWizardOpen).toBe(false)
    })
  })

  describe('step navigation', () => {
    it('goes to a specific step', () => {
      useOnboardingStore.getState().goToStep('review')
      expect(useOnboardingStore.getState().currentStep).toBe('review')
    })

    it('advances to the next step', () => {
      useOnboardingStore.getState().nextStep()
      expect(useOnboardingStore.getState().currentStep).toBe('review')
    })

    it('does not advance past the last step', () => {
      useOnboardingStore.getState().goToStep('complete')
      useOnboardingStore.getState().nextStep()
      expect(useOnboardingStore.getState().currentStep).toBe('complete')
    })

    it('goes to the previous step', () => {
      useOnboardingStore.getState().goToStep('review')
      useOnboardingStore.getState().previousStep()
      expect(useOnboardingStore.getState().currentStep).toBe('detection')
    })

    it('does not go before the first step', () => {
      useOnboardingStore.getState().previousStep()
      expect(useOnboardingStore.getState().currentStep).toBe('detection')
    })

    it('navigates through all steps in sequence', () => {
      for (let i = 0; i < ONBOARDING_STEPS.length - 1; i++) {
        expect(useOnboardingStore.getState().currentStep).toBe(ONBOARDING_STEPS[i])
        useOnboardingStore.getState().nextStep()
      }
      expect(useOnboardingStore.getState().currentStep).toBe('complete')
    })
  })

  describe('getCurrentStepIndex', () => {
    it('returns correct index for current step', () => {
      expect(useOnboardingStore.getState().getCurrentStepIndex()).toBe(0)
      useOnboardingStore.getState().goToStep('memory')
      expect(useOnboardingStore.getState().getCurrentStepIndex()).toBe(2)
    })
  })

  describe('canNavigateToStep', () => {
    it('allows navigating to a previous step', () => {
      useOnboardingStore.getState().goToStep('review')
      expect(useOnboardingStore.getState().canNavigateToStep('detection')).toBe(true)
    })

    it('allows staying at current step', () => {
      expect(useOnboardingStore.getState().canNavigateToStep('detection')).toBe(true)
    })

    it('does not allow navigating to a future step', () => {
      expect(useOnboardingStore.getState().canNavigateToStep('review')).toBe(false)
    })
  })

  describe('detecting state', () => {
    it('sets detecting state', () => {
      useOnboardingStore.getState().setIsDetecting(true)
      expect(useOnboardingStore.getState().isDetecting).toBe(true)
    })
  })

  describe('memory path', () => {
    it('sets memory path', () => {
      useOnboardingStore.getState().setMemoryPath('/home/user/.config')
      expect(useOnboardingStore.getState().memoryPath).toBe('/home/user/.config')
    })
  })

  describe('skip step', () => {
    it('skips a step', () => {
      useOnboardingStore.getState().skipStep('memory')
      expect(useOnboardingStore.getState().skippedSteps.has('memory')).toBe(true)
    })

    it('skipping the same step twice is idempotent', () => {
      useOnboardingStore.getState().skipStep('review')
      useOnboardingStore.getState().skipStep('review')
      expect(useOnboardingStore.getState().skippedSteps.size).toBe(1)
    })
  })

  describe('completeOnboarding', () => {
    it('marks onboarding as complete and closes wizard', () => {
      useOnboardingStore.getState().openWizard()
      useOnboardingStore.getState().completeOnboarding()
      const state = useOnboardingStore.getState()
      expect(state.hasCompletedOnboarding).toBe(true)
      expect(state.currentStep).toBe('complete')
      expect(state.isWizardOpen).toBe(false)
    })
  })

  describe('resetOnboarding', () => {
    it('resets and opens the wizard', () => {
      useOnboardingStore.getState().completeOnboarding()
      useOnboardingStore.getState().resetOnboarding()
      const state = useOnboardingStore.getState()
      expect(state.hasCompletedOnboarding).toBe(false)
      expect(state.currentStep).toBe('detection')
      expect(state.isWizardOpen).toBe(true)
    })
  })
})
