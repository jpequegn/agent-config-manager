/**
 * Harness Store
 * Manages active harness selection and detected harnesses state
 */

import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { HarnessType, HarnessConfig, DetectionResult } from '@/types'

/** Harness store state */
interface HarnessState {
  /** Currently active/selected harness */
  activeHarness: HarnessType | null
  /** All detected harnesses with their configs */
  detectedHarnesses: Map<HarnessType, HarnessConfig>
  /** Detection results from last scan */
  detectionResults: DetectionResult[]
  /** Whether detection is in progress */
  isDetecting: boolean
  /** Last detection timestamp */
  lastDetectedAt: Date | null
  /** Detection error if any */
  detectionError: string | null
}

/** Harness store actions */
interface HarnessActions {
  /** Set the active harness */
  setActiveHarness: (harness: HarnessType | null) => void
  /** Set detected harnesses */
  setDetectedHarnesses: (harnesses: Map<HarnessType, HarnessConfig>) => void
  /** Update a single harness config */
  updateHarnessConfig: (type: HarnessType, config: HarnessConfig) => void
  /** Set detection results */
  setDetectionResults: (results: DetectionResult[]) => void
  /** Set detecting state */
  setIsDetecting: (isDetecting: boolean) => void
  /** Set detection error */
  setDetectionError: (error: string | null) => void
  /** Clear all harness data */
  clearHarnesses: () => void
  /** Get config for a specific harness */
  getHarnessConfig: (type: HarnessType) => HarnessConfig | undefined
  /** Check if a harness is detected */
  isHarnessDetected: (type: HarnessType) => boolean
}

/** Combined harness store type */
type HarnessStore = HarnessState & HarnessActions

/** Initial state */
const initialState: HarnessState = {
  activeHarness: null,
  detectedHarnesses: new Map(),
  detectionResults: [],
  isDetecting: false,
  lastDetectedAt: null,
  detectionError: null,
}

/**
 * Harness store
 * Persists active harness selection across sessions
 */
export const useHarnessStore = create<HarnessStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        setActiveHarness: (harness) => set({ activeHarness: harness }, false, 'setActiveHarness'),

        setDetectedHarnesses: (harnesses) =>
          set(
            {
              detectedHarnesses: harnesses,
              lastDetectedAt: new Date(),
              detectionError: null,
            },
            false,
            'setDetectedHarnesses'
          ),

        updateHarnessConfig: (type, config) =>
          set(
            (state) => {
              const newMap = new Map(state.detectedHarnesses)
              newMap.set(type, config)
              return { detectedHarnesses: newMap }
            },
            false,
            'updateHarnessConfig'
          ),

        setDetectionResults: (results) =>
          set({ detectionResults: results }, false, 'setDetectionResults'),

        setIsDetecting: (isDetecting) => set({ isDetecting }, false, 'setIsDetecting'),

        setDetectionError: (error) => set({ detectionError: error }, false, 'setDetectionError'),

        clearHarnesses: () =>
          set(
            {
              detectedHarnesses: new Map(),
              detectionResults: [],
              lastDetectedAt: null,
              detectionError: null,
            },
            false,
            'clearHarnesses'
          ),

        getHarnessConfig: (type) => get().detectedHarnesses.get(type),

        isHarnessDetected: (type) => get().detectedHarnesses.has(type),
      }),
      {
        name: 'harness-store',
        // Only persist active harness selection
        partialize: (state) => ({ activeHarness: state.activeHarness }),
      }
    ),
    { name: 'HarnessStore' }
  )
)

/** Selector hooks for common patterns */
export const useActiveHarness = () => useHarnessStore((state) => state.activeHarness)
export const useDetectedHarnesses = () => useHarnessStore((state) => state.detectedHarnesses)
export const useIsDetecting = () => useHarnessStore((state) => state.isDetecting)
