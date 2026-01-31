/**
 * Selection Store
 * Manages selected items for bulk operations across different views
 */

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

/** Types of selectable items */
export type SelectableType = 'skill' | 'hook' | 'session' | 'memory' | 'tool' | 'mcp-server'

/** Selected item reference */
export interface SelectedItem {
  /** Item ID */
  id: string
  /** Item type */
  type: SelectableType
  /** Optional display name for UI */
  displayName?: string
}

/** Selection state per context */
interface SelectionContext {
  /** Selected item IDs */
  selectedIds: Set<string>
  /** Last selected item (for shift+click range) */
  lastSelectedId: string | null
  /** Whether select all is active */
  selectAllActive: boolean
}

/** Selection store state */
interface SelectionState {
  /** Selections per type */
  selections: Record<SelectableType, SelectionContext>
  /** Currently active selection type */
  activeType: SelectableType | null
  /** Clipboard for copy/paste operations */
  clipboard: SelectedItem[]
  /** Clipboard operation type */
  clipboardOperation: 'copy' | 'cut' | null
}

/** Selection store actions */
interface SelectionActions {
  /** Select a single item (optionally add to existing) */
  select: (type: SelectableType, id: string, addToSelection?: boolean) => void
  /** Deselect a single item */
  deselect: (type: SelectableType, id: string) => void
  /** Toggle selection of an item */
  toggleSelection: (type: SelectableType, id: string) => void
  /** Select multiple items */
  selectMultiple: (type: SelectableType, ids: string[]) => void
  /** Select range (for shift+click) */
  selectRange: (type: SelectableType, fromId: string, toId: string, allIds: string[]) => void
  /** Select all items of a type */
  selectAll: (type: SelectableType, allIds: string[]) => void
  /** Clear selection for a type */
  clearSelection: (type: SelectableType) => void
  /** Clear all selections */
  clearAllSelections: () => void
  /** Check if an item is selected */
  isSelected: (type: SelectableType, id: string) => boolean
  /** Get selected IDs for a type */
  getSelectedIds: (type: SelectableType) => string[]
  /** Get selection count for a type */
  getSelectionCount: (type: SelectableType) => number
  /** Set active selection type */
  setActiveType: (type: SelectableType | null) => void
  /** Copy selected items to clipboard */
  copyToClipboard: (items: SelectedItem[]) => void
  /** Cut selected items to clipboard */
  cutToClipboard: (items: SelectedItem[]) => void
  /** Clear clipboard */
  clearClipboard: () => void
  /** Check if clipboard has items */
  hasClipboardItems: () => boolean
}

/** Combined selection store type */
type SelectionStore = SelectionState & SelectionActions

/** Create empty selection context */
const createEmptyContext = (): SelectionContext => ({
  selectedIds: new Set(),
  lastSelectedId: null,
  selectAllActive: false,
})

/** Initial state */
const initialState: SelectionState = {
  selections: {
    skill: createEmptyContext(),
    hook: createEmptyContext(),
    session: createEmptyContext(),
    memory: createEmptyContext(),
    tool: createEmptyContext(),
    'mcp-server': createEmptyContext(),
  },
  activeType: null,
  clipboard: [],
  clipboardOperation: null,
}

/**
 * Selection store
 * Does not persist - selections are transient
 */
export const useSelectionStore = create<SelectionStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      select: (type, id, addToSelection = false) =>
        set(
          (state) => {
            const context = state.selections[type]
            const newIds = addToSelection ? new Set(context.selectedIds) : new Set<string>()
            newIds.add(id)
            return {
              selections: {
                ...state.selections,
                [type]: {
                  ...context,
                  selectedIds: newIds,
                  lastSelectedId: id,
                  selectAllActive: false,
                },
              },
              activeType: type,
            }
          },
          false,
          'select'
        ),

      deselect: (type, id) =>
        set(
          (state) => {
            const context = state.selections[type]
            const newIds = new Set(context.selectedIds)
            newIds.delete(id)
            return {
              selections: {
                ...state.selections,
                [type]: {
                  ...context,
                  selectedIds: newIds,
                  selectAllActive: false,
                },
              },
            }
          },
          false,
          'deselect'
        ),

      toggleSelection: (type, id) => {
        const context = get().selections[type]
        if (context.selectedIds.has(id)) {
          get().deselect(type, id)
        } else {
          get().select(type, id, true)
        }
      },

      selectMultiple: (type, ids) =>
        set(
          (state) => {
            const context = state.selections[type]
            const newIds = new Set(context.selectedIds)
            for (const id of ids) {
              newIds.add(id)
            }
            return {
              selections: {
                ...state.selections,
                [type]: {
                  ...context,
                  selectedIds: newIds,
                  lastSelectedId: ids[ids.length - 1] || context.lastSelectedId,
                  selectAllActive: false,
                },
              },
              activeType: type,
            }
          },
          false,
          'selectMultiple'
        ),

      selectRange: (type, fromId, toId, allIds) =>
        set(
          (state) => {
            const fromIndex = allIds.indexOf(fromId)
            const toIndex = allIds.indexOf(toId)

            if (fromIndex === -1 || toIndex === -1) return state

            const start = Math.min(fromIndex, toIndex)
            const end = Math.max(fromIndex, toIndex)
            const rangeIds = allIds.slice(start, end + 1)

            const context = state.selections[type]
            const newIds = new Set(context.selectedIds)
            for (const id of rangeIds) {
              newIds.add(id)
            }

            return {
              selections: {
                ...state.selections,
                [type]: {
                  ...context,
                  selectedIds: newIds,
                  lastSelectedId: toId,
                  selectAllActive: false,
                },
              },
              activeType: type,
            }
          },
          false,
          'selectRange'
        ),

      selectAll: (type, allIds) =>
        set(
          (state) => ({
            selections: {
              ...state.selections,
              [type]: {
                selectedIds: new Set(allIds),
                lastSelectedId: allIds[allIds.length - 1] || null,
                selectAllActive: true,
              },
            },
            activeType: type,
          }),
          false,
          'selectAll'
        ),

      clearSelection: (type) =>
        set(
          (state) => ({
            selections: {
              ...state.selections,
              [type]: createEmptyContext(),
            },
          }),
          false,
          'clearSelection'
        ),

      clearAllSelections: () =>
        set(
          {
            selections: {
              skill: createEmptyContext(),
              hook: createEmptyContext(),
              session: createEmptyContext(),
              memory: createEmptyContext(),
              tool: createEmptyContext(),
              'mcp-server': createEmptyContext(),
            },
            activeType: null,
          },
          false,
          'clearAllSelections'
        ),

      isSelected: (type, id) => get().selections[type].selectedIds.has(id),

      getSelectedIds: (type) => Array.from(get().selections[type].selectedIds),

      getSelectionCount: (type) => get().selections[type].selectedIds.size,

      setActiveType: (type) => set({ activeType: type }, false, 'setActiveType'),

      copyToClipboard: (items) =>
        set(
          {
            clipboard: items,
            clipboardOperation: 'copy',
          },
          false,
          'copyToClipboard'
        ),

      cutToClipboard: (items) =>
        set(
          {
            clipboard: items,
            clipboardOperation: 'cut',
          },
          false,
          'cutToClipboard'
        ),

      clearClipboard: () =>
        set(
          {
            clipboard: [],
            clipboardOperation: null,
          },
          false,
          'clearClipboard'
        ),

      hasClipboardItems: () => get().clipboard.length > 0,
    }),
    { name: 'SelectionStore' }
  )
)

/** Selector hooks for common patterns */
export const useSelection = (type: SelectableType) =>
  useSelectionStore((state) => ({
    selectedIds: state.selections[type].selectedIds,
    count: state.selections[type].selectedIds.size,
    selectAllActive: state.selections[type].selectAllActive,
  }))

export const useClipboard = () =>
  useSelectionStore((state) => ({
    items: state.clipboard,
    operation: state.clipboardOperation,
    hasItems: state.clipboard.length > 0,
  }))

export const useActiveSelectionType = () => useSelectionStore((state) => state.activeType)
