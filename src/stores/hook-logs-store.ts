/**
 * Hook Logs Store
 * Manages hook execution logs, test results, and filtering state
 */

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { HookLogEntry, HookResult } from '@/types'
import type { HookExecutionStats, HookTestResult } from '@/services/hooks'

interface HookLogsState {
  /** Currently viewed hook ID */
  hookId: string | null
  /** Execution logs */
  logs: HookLogEntry[]
  /** Filter by result type */
  resultFilter: HookResult | null
  /** Whether logs are loading */
  isLoading: boolean
  /** Execution stats */
  stats: HookExecutionStats | null
  /** Last test result */
  lastTestResult: HookTestResult | null
  /** Whether a test is running */
  isTesting: boolean
  /** Selected log entry for detail view */
  selectedLogId: string | null

  // Actions
  setHookId: (id: string | null) => void
  setLogs: (logs: HookLogEntry[]) => void
  setResultFilter: (filter: HookResult | null) => void
  setIsLoading: (loading: boolean) => void
  setStats: (stats: HookExecutionStats | null) => void
  setLastTestResult: (result: HookTestResult | null) => void
  setIsTesting: (testing: boolean) => void
  setSelectedLogId: (id: string | null) => void
  reset: () => void
}

export const useHookLogsStore = create<HookLogsState>()(
  devtools(
    (set) => ({
      hookId: null,
      logs: [],
      resultFilter: null,
      isLoading: false,
      stats: null,
      lastTestResult: null,
      isTesting: false,
      selectedLogId: null,

      setHookId: (hookId) => set({ hookId }, false, 'setHookId'),
      setLogs: (logs) => set({ logs }, false, 'setLogs'),
      setResultFilter: (resultFilter) => set({ resultFilter }, false, 'setResultFilter'),
      setIsLoading: (isLoading) => set({ isLoading }, false, 'setIsLoading'),
      setStats: (stats) => set({ stats }, false, 'setStats'),
      setLastTestResult: (lastTestResult) => set({ lastTestResult }, false, 'setLastTestResult'),
      setIsTesting: (isTesting) => set({ isTesting }, false, 'setIsTesting'),
      setSelectedLogId: (selectedLogId) => set({ selectedLogId }, false, 'setSelectedLogId'),
      reset: () =>
        set(
          {
            hookId: null,
            logs: [],
            resultFilter: null,
            isLoading: false,
            stats: null,
            lastTestResult: null,
            isTesting: false,
            selectedLogId: null,
          },
          false,
          'reset'
        ),
    }),
    { name: 'hook-logs-store' }
  )
)

// Selector hooks
export const useHookLogs = () => useHookLogsStore((s) => s.logs)
export const useHookLogsFilter = () => useHookLogsStore((s) => s.resultFilter)
export const useIsHookLogLoading = () => useHookLogsStore((s) => s.isLoading)
export const useHookExecutionStats = () => useHookLogsStore((s) => s.stats)
export const useLastTestResult = () => useHookLogsStore((s) => s.lastTestResult)
export const useIsHookTesting = () => useHookLogsStore((s) => s.isTesting)
