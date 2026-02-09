/**
 * Stores Module
 * Exports all Zustand stores and related types/hooks
 */

// Harness store
export {
  useHarnessStore,
  useActiveHarness,
  useDetectedHarnesses,
  useIsDetecting,
} from './harness-store'

// UI store
export type { Theme, SidebarSection, ViewMode, SortDirection, SortConfig, Toast } from './ui-store'
export {
  useUIStore,
  useTheme,
  useResolvedTheme,
  useSidebarCollapsed,
  useCommandPaletteOpen,
  useToasts,
} from './ui-store'

// Selection store
export type { SelectableType, SelectedItem } from './selection-store'
export {
  useSelectionStore,
  useSelection,
  useClipboard,
  useActiveSelectionType,
} from './selection-store'

// Onboarding store
export type { OnboardingStep } from './onboarding-store'
export {
  useOnboardingStore,
  useCurrentStep,
  useIsWizardOpen,
  useHasCompletedOnboarding,
  ONBOARDING_STEPS,
  STEP_INFO,
} from './onboarding-store'

// Project context store
export {
  useProjectContextStore,
  useProjects,
  useSelectedProject,
  useSelectedFile,
  useIsProjectScanning,
} from './project-context-store'

// Learnings store
export {
  useLearningsStore,
  useLearnings,
  useSelectedLearning,
  useIsLearningsLoading,
} from './learnings-store'
