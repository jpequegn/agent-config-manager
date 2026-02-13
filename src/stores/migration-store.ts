/**
 * Migration Store
 * Manages wizard state for cross-harness migration
 */

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { HarnessType } from '@/types'
import type {
  MigrationStep,
  MigrationPlan,
  MigrationResult,
  MigrationBackup,
  CompatibilityResult,
} from '@/services/migration'

/** Migration store state */
interface MigrationState {
  /** Current wizard step */
  currentStep: MigrationStep
  /** Source harness */
  sourceHarness: HarnessType | null
  /** Target harness */
  targetHarness: HarnessType | null
  /** Compatibility analysis result */
  compatibility: CompatibilityResult | null
  /** Full migration plan with items */
  plan: MigrationPlan | null
  /** Backup created before migration */
  backup: MigrationBackup | null
  /** Migration execution result */
  result: MigrationResult | null
  /** Whether analysis is in progress */
  isAnalyzing: boolean
  /** Whether migration is executing */
  isExecuting: boolean
  /** Whether rollback is in progress */
  isRollingBack: boolean
  /** Status message */
  message: string | null
}

/** Migration store actions */
interface MigrationActions {
  setStep: (step: MigrationStep) => void
  setSourceHarness: (harness: HarnessType | null) => void
  setTargetHarness: (harness: HarnessType | null) => void
  setCompatibility: (result: CompatibilityResult | null) => void
  setPlan: (plan: MigrationPlan | null) => void
  setBackup: (backup: MigrationBackup | null) => void
  setResult: (result: MigrationResult | null) => void
  setIsAnalyzing: (v: boolean) => void
  setIsExecuting: (v: boolean) => void
  setIsRollingBack: (v: boolean) => void
  setMessage: (msg: string | null) => void
  toggleItemSelection: (itemId: string) => void
  selectAllItems: () => void
  deselectAllItems: () => void
  reset: () => void
}

type MigrationStore = MigrationState & MigrationActions

const initialState: MigrationState = {
  currentStep: 'select',
  sourceHarness: null,
  targetHarness: null,
  compatibility: null,
  plan: null,
  backup: null,
  result: null,
  isAnalyzing: false,
  isExecuting: false,
  isRollingBack: false,
  message: null,
}

export const useMigrationStore = create<MigrationStore>()(
  devtools(
    (set) => ({
      ...initialState,

      setStep: (step) => set({ currentStep: step }, false, 'setStep'),

      setSourceHarness: (harness) => set({ sourceHarness: harness }, false, 'setSourceHarness'),

      setTargetHarness: (harness) => set({ targetHarness: harness }, false, 'setTargetHarness'),

      setCompatibility: (result) => set({ compatibility: result }, false, 'setCompatibility'),

      setPlan: (plan) => set({ plan }, false, 'setPlan'),

      setBackup: (backup) => set({ backup }, false, 'setBackup'),

      setResult: (result) => set({ result }, false, 'setResult'),

      setIsAnalyzing: (v) => set({ isAnalyzing: v }, false, 'setIsAnalyzing'),

      setIsExecuting: (v) => set({ isExecuting: v }, false, 'setIsExecuting'),

      setIsRollingBack: (v) => set({ isRollingBack: v }, false, 'setIsRollingBack'),

      setMessage: (msg) => set({ message: msg }, false, 'setMessage'),

      toggleItemSelection: (itemId) =>
        set(
          (state) => {
            if (!state.plan) return state
            return {
              plan: {
                ...state.plan,
                items: state.plan.items.map((item) =>
                  item.id === itemId ? { ...item, selected: !item.selected } : item
                ),
              },
            }
          },
          false,
          'toggleItemSelection'
        ),

      selectAllItems: () =>
        set(
          (state) => {
            if (!state.plan) return state
            return {
              plan: {
                ...state.plan,
                items: state.plan.items.map((item) => ({ ...item, selected: true })),
              },
            }
          },
          false,
          'selectAllItems'
        ),

      deselectAllItems: () =>
        set(
          (state) => {
            if (!state.plan) return state
            return {
              plan: {
                ...state.plan,
                items: state.plan.items.map((item) => ({ ...item, selected: false })),
              },
            }
          },
          false,
          'deselectAllItems'
        ),

      reset: () => set(initialState, false, 'reset'),
    }),
    { name: 'MigrationStore' }
  )
)

/** Selector hooks */
export const useMigrationStep = () => useMigrationStore((s) => s.currentStep)
export const useMigrationPlan = () => useMigrationStore((s) => s.plan)
export const useMigrationResult = () => useMigrationStore((s) => s.result)
export const useIsAnalyzing = () => useMigrationStore((s) => s.isAnalyzing)
export const useIsExecuting = () => useMigrationStore((s) => s.isExecuting)
