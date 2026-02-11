/**
 * Session Memory Store
 * Manages session memory management state: selection, bulk ops, pruning
 */

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { AutoPruneRule } from '@/services/session-memory'

/** Active panel in the session memory page */
export type SessionMemoryPanel = 'sessions' | 'prune' | 'export'

interface SessionMemoryState {
  /** IDs of selected sessions for bulk operations */
  selectedIds: Set<string>
  /** Whether select-all is active */
  selectAll: boolean
  /** Active panel */
  activePanel: SessionMemoryPanel
  /** Auto-prune rules */
  pruneRules: AutoPruneRule[]
  /** Whether a bulk operation is in progress */
  isBulkOperating: boolean
  /** Last operation result message */
  lastOperationMessage: string | null

  // Actions
  toggleSelected: (id: string) => void
  setSelectAll: (all: boolean, allIds?: string[]) => void
  clearSelection: () => void
  setActivePanel: (panel: SessionMemoryPanel) => void
  setPruneRules: (rules: AutoPruneRule[]) => void
  setIsBulkOperating: (operating: boolean) => void
  setLastOperationMessage: (message: string | null) => void
}

export const useSessionMemoryStore = create<SessionMemoryState>()(
  devtools(
    (set, get) => ({
      selectedIds: new Set<string>(),
      selectAll: false,
      activePanel: 'sessions',
      pruneRules: [],
      isBulkOperating: false,
      lastOperationMessage: null,

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

      setActivePanel: (activePanel) => set({ activePanel }, false, 'setActivePanel'),

      setPruneRules: (pruneRules) => set({ pruneRules }, false, 'setPruneRules'),

      setIsBulkOperating: (isBulkOperating) =>
        set({ isBulkOperating }, false, 'setIsBulkOperating'),

      setLastOperationMessage: (lastOperationMessage) =>
        set({ lastOperationMessage }, false, 'setLastOperationMessage'),
    }),
    { name: 'session-memory-store' }
  )
)

// Selector hooks
export const useSelectedSessionIds = () => useSessionMemoryStore((s) => s.selectedIds)
export const useSessionMemoryPanel = () => useSessionMemoryStore((s) => s.activePanel)
export const usePruneRules = () => useSessionMemoryStore((s) => s.pruneRules)
export const useIsBulkOperating = () => useSessionMemoryStore((s) => s.isBulkOperating)
