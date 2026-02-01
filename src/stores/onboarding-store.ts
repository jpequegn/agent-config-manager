/**
 * Onboarding Store
 * Manages onboarding wizard state and completion status
 */

import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

/** Onboarding step identifiers */
export type OnboardingStep = 'detection' | 'review' | 'memory' | 'complete'

/** All steps in order */
export const ONBOARDING_STEPS: OnboardingStep[] = ['detection', 'review', 'memory', 'complete']

/** Step metadata */
export interface StepInfo {
  id: OnboardingStep
  title: string
  description: string
}

/** Step information for display */
export const STEP_INFO: Record<OnboardingStep, StepInfo> = {
  detection: {
    id: 'detection',
    title: 'Detect Harnesses',
    description: 'Scanning for installed AI coding assistants',
  },
  review: {
    id: 'review',
    title: 'Review Configuration',
    description: 'Review detected harnesses and their settings',
  },
  memory: {
    id: 'memory',
    title: 'Memory Setup',
    description: 'Configure where to store shared memory',
  },
  complete: {
    id: 'complete',
    title: 'Complete',
    description: 'Setup complete! Ready to manage your harnesses',
  },
}

/** Onboarding store state */
interface OnboardingState {
  /** Whether onboarding has been completed */
  hasCompletedOnboarding: boolean
  /** Current step in the wizard */
  currentStep: OnboardingStep
  /** Whether the wizard is currently open */
  isWizardOpen: boolean
  /** Whether detection is in progress */
  isDetecting: boolean
  /** Selected memory storage path */
  memoryPath: string | null
  /** Skipped steps */
  skippedSteps: Set<OnboardingStep>
}

/** Onboarding store actions */
interface OnboardingActions {
  /** Open the onboarding wizard */
  openWizard: () => void
  /** Close the onboarding wizard */
  closeWizard: () => void
  /** Go to a specific step */
  goToStep: (step: OnboardingStep) => void
  /** Go to the next step */
  nextStep: () => void
  /** Go to the previous step */
  previousStep: () => void
  /** Set detecting state */
  setIsDetecting: (isDetecting: boolean) => void
  /** Set the memory storage path */
  setMemoryPath: (path: string) => void
  /** Skip a step */
  skipStep: (step: OnboardingStep) => void
  /** Mark onboarding as complete */
  completeOnboarding: () => void
  /** Reset onboarding (for re-running) */
  resetOnboarding: () => void
  /** Check if a step can be navigated to */
  canNavigateToStep: (step: OnboardingStep) => boolean
  /** Get the current step index */
  getCurrentStepIndex: () => number
}

/** Combined onboarding store type */
type OnboardingStore = OnboardingState & OnboardingActions

/** Initial state */
const initialState: OnboardingState = {
  hasCompletedOnboarding: false,
  currentStep: 'detection',
  isWizardOpen: false,
  isDetecting: false,
  memoryPath: null,
  skippedSteps: new Set(),
}

/**
 * Onboarding store
 * Persists completion status and memory path
 */
export const useOnboardingStore = create<OnboardingStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        openWizard: () => set({ isWizardOpen: true }, false, 'openWizard'),

        closeWizard: () => set({ isWizardOpen: false }, false, 'closeWizard'),

        goToStep: (step) => set({ currentStep: step }, false, 'goToStep'),

        nextStep: () => {
          const currentIndex = get().getCurrentStepIndex()
          if (currentIndex < ONBOARDING_STEPS.length - 1) {
            set({ currentStep: ONBOARDING_STEPS[currentIndex + 1] }, false, 'nextStep')
          }
        },

        previousStep: () => {
          const currentIndex = get().getCurrentStepIndex()
          if (currentIndex > 0) {
            set({ currentStep: ONBOARDING_STEPS[currentIndex - 1] }, false, 'previousStep')
          }
        },

        setIsDetecting: (isDetecting) => set({ isDetecting }, false, 'setIsDetecting'),

        setMemoryPath: (path) => set({ memoryPath: path }, false, 'setMemoryPath'),

        skipStep: (step) =>
          set(
            (state) => {
              const newSkipped = new Set(state.skippedSteps)
              newSkipped.add(step)
              return { skippedSteps: newSkipped }
            },
            false,
            'skipStep'
          ),

        completeOnboarding: () =>
          set(
            {
              hasCompletedOnboarding: true,
              currentStep: 'complete',
              isWizardOpen: false,
            },
            false,
            'completeOnboarding'
          ),

        resetOnboarding: () =>
          set(
            {
              ...initialState,
              isWizardOpen: true,
            },
            false,
            'resetOnboarding'
          ),

        canNavigateToStep: (step) => {
          const targetIndex = ONBOARDING_STEPS.indexOf(step)
          const currentIndex = get().getCurrentStepIndex()
          // Can go back to any previous step or stay at current
          return targetIndex <= currentIndex
        },

        getCurrentStepIndex: () => ONBOARDING_STEPS.indexOf(get().currentStep),
      }),
      {
        name: 'onboarding-store',
        partialize: (state) => ({
          hasCompletedOnboarding: state.hasCompletedOnboarding,
          memoryPath: state.memoryPath,
          skippedSteps: Array.from(state.skippedSteps),
        }),
        merge: (persisted, current) => {
          const persistedState = persisted as Partial<OnboardingState> & {
            skippedSteps?: string[]
          }
          return {
            ...current,
            ...persistedState,
            skippedSteps: persistedState.skippedSteps
              ? new Set(persistedState.skippedSteps as OnboardingStep[])
              : current.skippedSteps,
          }
        },
      }
    ),
    { name: 'OnboardingStore' }
  )
)

/** Selector hooks */
export const useHasCompletedOnboarding = () =>
  useOnboardingStore((state) => state.hasCompletedOnboarding)
export const useCurrentStep = () => useOnboardingStore((state) => state.currentStep)
export const useIsWizardOpen = () => useOnboardingStore((state) => state.isWizardOpen)
