/**
 * Hooks Store
 * Manages hooks list, selection, grouping, and bulk operations state
 */

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { HookTrigger } from '@/types'
import type { HookGroup } from '@/services/hooks'

interface HooksState {
  /** Hook groups by trigger */
  hookGroups: HookGroup[]
  /** Selected hook IDs for bulk ops */
  selectedIds: Set<string>
  /** Whether select-all is active */
  selectAll: boolean
  /** Filter by trigger type */
  filterTrigger: HookTrigger | null
  /** Filter by harness */
  filterHarness: string | null
  /** Whether data is loading */
  isLoading: boolean
  /** Whether a bulk operation is in progress */
  isBulkOperating: boolean
  /** Last operation message */
  lastMessage: string | null

  // Actions
  setHookGroups: (groups: HookGroup[]) => void
  toggleSelected: (id: string) => void
  setSelectAll: (all: boolean, allIds?: string[]) => void
  clearSelection: () => void
  setFilterTrigger: (trigger: HookTrigger | null) => void
  setFilterHarness: (harness: string | null) => void
  setIsLoading: (loading: boolean) => void
  setIsBulkOperating: (operating: boolean) => void
  setLastMessage: (message: string | null) => void
}

export const useHooksStore = create<HooksState>()(
  devtools(
    (set, get) => ({
      hookGroups: [],
      selectedIds: new Set<string>(),
      selectAll: false,
      filterTrigger: null,
      filterHarness: null,
      isLoading: false,
      isBulkOperating: false,
      lastMessage: null,

      setHookGroups: (hookGroups) => set({ hookGroups }, false, 'setHookGroups'),

      toggleSelected: (id) => {
        const current = new Set(get().selectedIds)
        if (current.has(id)) {
          current.delete(id)
        } else {
          current.add(id)
        }
        set({ selectedIds: current, selectAll: false }, false, 'toggleSelected')
      },

      setSelectAll: (all, allIds) => {
        if (all && allIds) {
          set({ selectedIds: new Set(allIds), selectAll: true }, false, 'setSelectAll')
        } else {
          set({ selectedIds: new Set<string>(), selectAll: false }, false, 'setSelectAll')
        }
      },

      clearSelection: () =>
        set({ selectedIds: new Set<string>(), selectAll: false }, false, 'clearSelection'),

      setFilterTrigger: (filterTrigger) => set({ filterTrigger }, false, 'setFilterTrigger'),
      setFilterHarness: (filterHarness) => set({ filterHarness }, false, 'setFilterHarness'),
      setIsLoading: (isLoading) => set({ isLoading }, false, 'setIsLoading'),
      setIsBulkOperating: (isBulkOperating) =>
        set({ isBulkOperating }, false, 'setIsBulkOperating'),
      setLastMessage: (lastMessage) => set({ lastMessage }, false, 'setLastMessage'),
    }),
    { name: 'hooks-store' }
  )
)

// Selector hooks
export const useHookGroups = () => useHooksStore((s) => s.hookGroups)
export const useSelectedHookIds = () => useHooksStore((s) => s.selectedIds)
export const useIsHooksLoading = () => useHooksStore((s) => s.isLoading)
export const useHooksFilterTrigger = () => useHooksStore((s) => s.filterTrigger)
