/**
 * UI Store
 * Manages UI state like sidebar, theme, command palette, and view preferences
 */

import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

/** Theme options */
export type Theme = 'light' | 'dark' | 'system'

/** Sidebar section IDs */
export type SidebarSection =
  | 'harnesses'
  | 'skills'
  | 'hooks'
  | 'sessions'
  | 'memory'
  | 'settings'
  | 'tools'

/** View mode for lists */
export type ViewMode = 'list' | 'grid' | 'compact'

/** Sort direction */
export type SortDirection = 'asc' | 'desc'

/** Sort options for different views */
export interface SortConfig {
  field: string
  direction: SortDirection
}

/** UI store state */
interface UIState {
  /** Current theme */
  theme: Theme
  /** Resolved theme (accounting for system preference) */
  resolvedTheme: 'light' | 'dark'
  /** Whether sidebar is collapsed */
  sidebarCollapsed: boolean
  /** Expanded sidebar sections */
  expandedSections: Set<SidebarSection>
  /** Whether command palette is open */
  commandPaletteOpen: boolean
  /** Current view mode for list views */
  viewMode: ViewMode
  /** Sort configuration per view */
  sortConfigs: Record<string, SortConfig>
  /** Whether to show hidden items */
  showHiddenItems: boolean
  /** Search query (global) */
  searchQuery: string
  /** Active filters */
  activeFilters: Record<string, string[]>
  /** Notification toast queue */
  toasts: Toast[]
}

/** Toast notification */
export interface Toast {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message?: string
  duration?: number
}

/** UI store actions */
interface UIActions {
  /** Set theme */
  setTheme: (theme: Theme) => void
  /** Set resolved theme (called when system preference changes) */
  setResolvedTheme: (theme: 'light' | 'dark') => void
  /** Toggle sidebar collapsed state */
  toggleSidebar: () => void
  /** Set sidebar collapsed state */
  setSidebarCollapsed: (collapsed: boolean) => void
  /** Toggle a sidebar section */
  toggleSection: (section: SidebarSection) => void
  /** Expand a sidebar section */
  expandSection: (section: SidebarSection) => void
  /** Collapse a sidebar section */
  collapseSection: (section: SidebarSection) => void
  /** Open command palette */
  openCommandPalette: () => void
  /** Close command palette */
  closeCommandPalette: () => void
  /** Toggle command palette */
  toggleCommandPalette: () => void
  /** Set view mode */
  setViewMode: (mode: ViewMode) => void
  /** Set sort config for a view */
  setSortConfig: (view: string, config: SortConfig) => void
  /** Toggle show hidden items */
  toggleShowHiddenItems: () => void
  /** Set search query */
  setSearchQuery: (query: string) => void
  /** Set active filters */
  setActiveFilters: (filters: Record<string, string[]>) => void
  /** Add a filter value */
  addFilter: (key: string, value: string) => void
  /** Remove a filter value */
  removeFilter: (key: string, value: string) => void
  /** Clear all filters */
  clearFilters: () => void
  /** Add a toast notification */
  addToast: (toast: Omit<Toast, 'id'>) => void
  /** Remove a toast */
  removeToast: (id: string) => void
  /** Clear all toasts */
  clearToasts: () => void
  /** Reset UI to defaults */
  resetUI: () => void
}

/** Combined UI store type */
type UIStore = UIState & UIActions

/** Default expanded sections */
const defaultExpandedSections = new Set<SidebarSection>(['harnesses', 'skills'])

/** Initial state */
const initialState: UIState = {
  theme: 'system',
  resolvedTheme: 'dark',
  sidebarCollapsed: false,
  expandedSections: defaultExpandedSections,
  commandPaletteOpen: false,
  viewMode: 'list',
  sortConfigs: {},
  showHiddenItems: false,
  searchQuery: '',
  activeFilters: {},
  toasts: [],
}

/** Generate unique toast ID */
const generateToastId = () => `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

/**
 * UI store
 * Persists theme, sidebar state, and view preferences
 */
export const useUIStore = create<UIStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        setTheme: (theme) => set({ theme }, false, 'setTheme'),

        setResolvedTheme: (resolvedTheme) => set({ resolvedTheme }, false, 'setResolvedTheme'),

        toggleSidebar: () =>
          set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }), false, 'toggleSidebar'),

        setSidebarCollapsed: (collapsed) =>
          set({ sidebarCollapsed: collapsed }, false, 'setSidebarCollapsed'),

        toggleSection: (section) =>
          set(
            (state) => {
              const newSections = new Set(state.expandedSections)
              if (newSections.has(section)) {
                newSections.delete(section)
              } else {
                newSections.add(section)
              }
              return { expandedSections: newSections }
            },
            false,
            'toggleSection'
          ),

        expandSection: (section) =>
          set(
            (state) => {
              const newSections = new Set(state.expandedSections)
              newSections.add(section)
              return { expandedSections: newSections }
            },
            false,
            'expandSection'
          ),

        collapseSection: (section) =>
          set(
            (state) => {
              const newSections = new Set(state.expandedSections)
              newSections.delete(section)
              return { expandedSections: newSections }
            },
            false,
            'collapseSection'
          ),

        openCommandPalette: () => set({ commandPaletteOpen: true }, false, 'openCommandPalette'),

        closeCommandPalette: () => set({ commandPaletteOpen: false }, false, 'closeCommandPalette'),

        toggleCommandPalette: () =>
          set(
            (state) => ({ commandPaletteOpen: !state.commandPaletteOpen }),
            false,
            'toggleCommandPalette'
          ),

        setViewMode: (mode) => set({ viewMode: mode }, false, 'setViewMode'),

        setSortConfig: (view, config) =>
          set(
            (state) => ({
              sortConfigs: { ...state.sortConfigs, [view]: config },
            }),
            false,
            'setSortConfig'
          ),

        toggleShowHiddenItems: () =>
          set(
            (state) => ({ showHiddenItems: !state.showHiddenItems }),
            false,
            'toggleShowHiddenItems'
          ),

        setSearchQuery: (query) => set({ searchQuery: query }, false, 'setSearchQuery'),

        setActiveFilters: (filters) => set({ activeFilters: filters }, false, 'setActiveFilters'),

        addFilter: (key, value) =>
          set(
            (state) => {
              const current = state.activeFilters[key] || []
              if (current.includes(value)) return state
              return {
                activeFilters: {
                  ...state.activeFilters,
                  [key]: [...current, value],
                },
              }
            },
            false,
            'addFilter'
          ),

        removeFilter: (key, value) =>
          set(
            (state) => {
              const current = state.activeFilters[key] || []
              return {
                activeFilters: {
                  ...state.activeFilters,
                  [key]: current.filter((v) => v !== value),
                },
              }
            },
            false,
            'removeFilter'
          ),

        clearFilters: () => set({ activeFilters: {}, searchQuery: '' }, false, 'clearFilters'),

        addToast: (toast) =>
          set(
            (state) => ({
              toasts: [...state.toasts, { ...toast, id: generateToastId() }],
            }),
            false,
            'addToast'
          ),

        removeToast: (id) =>
          set(
            (state) => ({
              toasts: state.toasts.filter((t) => t.id !== id),
            }),
            false,
            'removeToast'
          ),

        clearToasts: () => set({ toasts: [] }, false, 'clearToasts'),

        resetUI: () =>
          set(
            {
              ...initialState,
              // Keep theme preference
              theme: get().theme,
              resolvedTheme: get().resolvedTheme,
            },
            false,
            'resetUI'
          ),
      }),
      {
        name: 'ui-store',
        // Persist UI preferences
        partialize: (state) => ({
          theme: state.theme,
          sidebarCollapsed: state.sidebarCollapsed,
          expandedSections: Array.from(state.expandedSections),
          viewMode: state.viewMode,
          sortConfigs: state.sortConfigs,
          showHiddenItems: state.showHiddenItems,
        }),
        // Handle Set serialization
        merge: (persisted, current) => {
          const persistedState = persisted as Partial<UIState> & { expandedSections?: string[] }
          return {
            ...current,
            ...persistedState,
            expandedSections: persistedState.expandedSections
              ? new Set(persistedState.expandedSections as SidebarSection[])
              : current.expandedSections,
          }
        },
      }
    ),
    { name: 'UIStore' }
  )
)

/** Selector hooks for common patterns */
export const useTheme = () => useUIStore((state) => state.theme)
export const useResolvedTheme = () => useUIStore((state) => state.resolvedTheme)
export const useSidebarCollapsed = () => useUIStore((state) => state.sidebarCollapsed)
export const useCommandPaletteOpen = () => useUIStore((state) => state.commandPaletteOpen)
export const useToasts = () => useUIStore((state) => state.toasts)
