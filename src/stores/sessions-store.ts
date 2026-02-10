/**
 * Sessions Store
 * Manages session browser state: list, selection, search, filters, sorting
 */

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { HarnessType, Session, SessionSummary } from '@/types'

/** Sort field options */
export type SessionSortBy = 'recent' | 'duration' | 'messages'

/** Sessions store state */
interface SessionsState {
  /** List of session summaries */
  sessions: SessionSummary[]
  /** Currently selected session (full entry) */
  selectedSession: Session | null
  /** Whether loading is in progress */
  isLoading: boolean
  /** Search query */
  searchQuery: string
  /** Harness filter */
  filterHarness: HarnessType | null
  /** Project filter */
  filterProject: string | null
  /** Date range start */
  filterDateStart: Date | null
  /** Date range end */
  filterDateEnd: Date | null
  /** Sort field */
  sortBy: SessionSortBy
  /** Sort direction */
  sortOrder: 'asc' | 'desc'
}

/** Sessions store actions */
interface SessionsActions {
  setSessions: (sessions: SessionSummary[]) => void
  selectSession: (session: Session | null) => void
  setIsLoading: (isLoading: boolean) => void
  setSearchQuery: (query: string) => void
  setFilterHarness: (harness: HarnessType | null) => void
  setFilterProject: (project: string | null) => void
  setFilterDateStart: (date: Date | null) => void
  setFilterDateEnd: (date: Date | null) => void
  setSortBy: (sortBy: SessionSortBy) => void
  setSortOrder: (order: 'asc' | 'desc') => void
  clearFilters: () => void
}

type SessionsStore = SessionsState & SessionsActions

const initialState: SessionsState = {
  sessions: [],
  selectedSession: null,
  isLoading: false,
  searchQuery: '',
  filterHarness: null,
  filterProject: null,
  filterDateStart: null,
  filterDateEnd: null,
  sortBy: 'recent',
  sortOrder: 'desc',
}

export const useSessionsStore = create<SessionsStore>()(
  devtools(
    (set) => ({
      ...initialState,

      setSessions: (sessions) => set({ sessions }, false, 'setSessions'),

      selectSession: (session) => set({ selectedSession: session }, false, 'selectSession'),

      setIsLoading: (isLoading) => set({ isLoading }, false, 'setIsLoading'),

      setSearchQuery: (query) => set({ searchQuery: query }, false, 'setSearchQuery'),

      setFilterHarness: (harness) => set({ filterHarness: harness }, false, 'setFilterHarness'),

      setFilterProject: (project) => set({ filterProject: project }, false, 'setFilterProject'),

      setFilterDateStart: (date) => set({ filterDateStart: date }, false, 'setFilterDateStart'),

      setFilterDateEnd: (date) => set({ filterDateEnd: date }, false, 'setFilterDateEnd'),

      setSortBy: (sortBy) => set({ sortBy }, false, 'setSortBy'),

      setSortOrder: (order) => set({ sortOrder: order }, false, 'setSortOrder'),

      clearFilters: () =>
        set(
          {
            searchQuery: '',
            filterHarness: null,
            filterProject: null,
            filterDateStart: null,
            filterDateEnd: null,
          },
          false,
          'clearFilters'
        ),
    }),
    { name: 'SessionsStore' }
  )
)

/** Selector hooks */
export const useSessions = () => useSessionsStore((s) => s.sessions)
export const useSelectedSession = () => useSessionsStore((s) => s.selectedSession)
export const useIsSessionsLoading = () => useSessionsStore((s) => s.isLoading)
