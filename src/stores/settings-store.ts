/**
 * Settings Store
 * Manages settings viewer state: list, selection, search, filters, view mode
 */

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { SettingCategory } from '@/types'
import type { SettingEntry } from '@/services/settings'

/** Settings view mode */
export type SettingsViewMode = 'tree' | 'raw'

/** Settings store state */
interface SettingsState {
  /** List of setting entries */
  settings: SettingEntry[]
  /** Currently selected setting key */
  selectedKey: string | null
  /** Whether loading is in progress */
  isLoading: boolean
  /** Search query */
  searchQuery: string
  /** Active category */
  activeCategory: SettingCategory | null
  /** Show only modified settings */
  modifiedOnly: boolean
  /** View mode */
  viewMode: SettingsViewMode
}

/** Settings store actions */
interface SettingsActions {
  setSettings: (settings: SettingEntry[]) => void
  selectKey: (key: string | null) => void
  setIsLoading: (isLoading: boolean) => void
  setSearchQuery: (query: string) => void
  setActiveCategory: (category: SettingCategory | null) => void
  setModifiedOnly: (modifiedOnly: boolean) => void
  setViewMode: (mode: SettingsViewMode) => void
  clearFilters: () => void
}

type SettingsStore = SettingsState & SettingsActions

const initialState: SettingsState = {
  settings: [],
  selectedKey: null,
  isLoading: false,
  searchQuery: '',
  activeCategory: null,
  modifiedOnly: false,
  viewMode: 'tree' as SettingsViewMode,
}

export const useSettingsStore = create<SettingsStore>()(
  devtools(
    (set) => ({
      ...initialState,

      setSettings: (settings) => set({ settings }, false, 'setSettings'),

      selectKey: (key) => set({ selectedKey: key }, false, 'selectKey'),

      setIsLoading: (isLoading) => set({ isLoading }, false, 'setIsLoading'),

      setSearchQuery: (query) => set({ searchQuery: query }, false, 'setSearchQuery'),

      setActiveCategory: (category) =>
        set({ activeCategory: category }, false, 'setActiveCategory'),

      setModifiedOnly: (modifiedOnly) => set({ modifiedOnly }, false, 'setModifiedOnly'),

      setViewMode: (mode) => set({ viewMode: mode }, false, 'setViewMode'),

      clearFilters: () =>
        set({ searchQuery: '', activeCategory: null, modifiedOnly: false }, false, 'clearFilters'),
    }),
    { name: 'SettingsStore' }
  )
)

/** Selector hooks */
export const useSettingsList = () => useSettingsStore((s) => s.settings)
export const useSelectedSettingKey = () => useSettingsStore((s) => s.selectedKey)
export const useIsSettingsLoading = () => useSettingsStore((s) => s.isLoading)
export const useSettingsViewMode = () => useSettingsStore((s) => s.viewMode)
