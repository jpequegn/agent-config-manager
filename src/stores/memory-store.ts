/**
 * Memory Store
 * Zustand store for memory dashboard state
 */

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { MemoryStats } from '@/types'
import type { StorageHealth } from '@/services/memory'

interface MemoryState {
  /** Memory statistics */
  stats: MemoryStats | null
  /** Storage health indicators */
  health: StorageHealth[]
  /** Whether data is loading */
  isLoading: boolean
  /** Currently selected breakdown view */
  breakdownView: 'type' | 'harness'

  // Actions
  setStats: (stats: MemoryStats | null) => void
  setHealth: (health: StorageHealth[]) => void
  setIsLoading: (loading: boolean) => void
  setBreakdownView: (view: 'type' | 'harness') => void
}

export const useMemoryStore = create<MemoryState>()(
  devtools(
    (set) => ({
      stats: null,
      health: [],
      isLoading: false,
      breakdownView: 'type',

      setStats: (stats) => set({ stats }, false, 'setStats'),
      setHealth: (health) => set({ health }, false, 'setHealth'),
      setIsLoading: (isLoading) => set({ isLoading }, false, 'setIsLoading'),
      setBreakdownView: (breakdownView) => set({ breakdownView }, false, 'setBreakdownView'),
    }),
    { name: 'memory-store' }
  )
)

// Selector hooks
export const useMemoryStats = () => useMemoryStore((s) => s.stats)
export const useStorageHealth = () => useMemoryStore((s) => s.health)
export const useIsMemoryLoading = () => useMemoryStore((s) => s.isLoading)
export const useBreakdownView = () => useMemoryStore((s) => s.breakdownView)
