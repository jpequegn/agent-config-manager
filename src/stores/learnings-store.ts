/**
 * Learnings Store
 * Manages learnings browser state: list, selection, search, filters
 */

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { HarnessType, LearningCategory, MemoryEntry, MemoryEntrySummary } from '@/types'

/** Learnings store state */
interface LearningsState {
  /** List of learning summaries */
  learnings: MemoryEntrySummary[]
  /** Currently selected learning (full entry) */
  selectedLearning: MemoryEntry | null
  /** Whether loading is in progress */
  isLoading: boolean
  /** Search query */
  searchQuery: string
  /** Category filter */
  filterCategory: LearningCategory | null
  /** Harness filter */
  filterHarness: HarnessType | null
}

/** Learnings store actions */
interface LearningsActions {
  setLearnings: (learnings: MemoryEntrySummary[]) => void
  selectLearning: (learning: MemoryEntry | null) => void
  setIsLoading: (isLoading: boolean) => void
  setSearchQuery: (query: string) => void
  setFilterCategory: (category: LearningCategory | null) => void
  setFilterHarness: (harness: HarnessType | null) => void
  clearFilters: () => void
}

type LearningsStore = LearningsState & LearningsActions

const initialState: LearningsState = {
  learnings: [],
  selectedLearning: null,
  isLoading: false,
  searchQuery: '',
  filterCategory: null,
  filterHarness: null,
}

export const useLearningsStore = create<LearningsStore>()(
  devtools(
    (set) => ({
      ...initialState,

      setLearnings: (learnings) => set({ learnings }, false, 'setLearnings'),

      selectLearning: (learning) => set({ selectedLearning: learning }, false, 'selectLearning'),

      setIsLoading: (isLoading) => set({ isLoading }, false, 'setIsLoading'),

      setSearchQuery: (query) => set({ searchQuery: query }, false, 'setSearchQuery'),

      setFilterCategory: (category) =>
        set({ filterCategory: category }, false, 'setFilterCategory'),

      setFilterHarness: (harness) => set({ filterHarness: harness }, false, 'setFilterHarness'),

      clearFilters: () =>
        set({ searchQuery: '', filterCategory: null, filterHarness: null }, false, 'clearFilters'),
    }),
    { name: 'LearningsStore' }
  )
)

/** Selector hooks */
export const useLearnings = () => useLearningsStore((s) => s.learnings)
export const useSelectedLearning = () => useLearningsStore((s) => s.selectedLearning)
export const useIsLearningsLoading = () => useLearningsStore((s) => s.isLoading)
