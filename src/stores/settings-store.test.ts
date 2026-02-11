/**
 * Settings Store Tests
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { useSettingsStore } from './settings-store'
import type { SettingEntry } from '@/services/settings'

const mockEntry: SettingEntry = {
  definition: {
    key: 'test.setting',
    name: 'Test Setting',
    description: 'A test setting',
    type: 'string',
    category: 'general',
    defaultValue: 'default',
    scope: 'user',
  },
  current: {
    key: 'test.setting',
    value: 'modified',
    source: 'user',
    isModified: true,
  },
}

describe('SettingsStore', () => {
  beforeEach(() => {
    const store = useSettingsStore.getState()
    store.setSettings([])
    store.selectKey(null)
    store.setIsLoading(false)
    store.setSearchQuery('')
    store.setActiveCategory(null)
    store.setModifiedOnly(false)
    store.setViewMode('tree')
  })

  it('should start with defaults after reset', () => {
    const state = useSettingsStore.getState()
    expect(state.settings).toEqual([])
    expect(state.selectedKey).toBeNull()
    expect(state.isLoading).toBe(false)
    expect(state.searchQuery).toBe('')
    expect(state.activeCategory).toBeNull()
    expect(state.modifiedOnly).toBe(false)
    expect(state.viewMode).toBe('tree')
  })

  it('should set settings list', () => {
    useSettingsStore.getState().setSettings([mockEntry])
    expect(useSettingsStore.getState().settings).toEqual([mockEntry])
  })

  it('should select a setting key', () => {
    useSettingsStore.getState().selectKey('test.setting')
    expect(useSettingsStore.getState().selectedKey).toBe('test.setting')
  })

  it('should clear selected key', () => {
    useSettingsStore.getState().selectKey('test.setting')
    useSettingsStore.getState().selectKey(null)
    expect(useSettingsStore.getState().selectedKey).toBeNull()
  })

  it('should set loading state', () => {
    useSettingsStore.getState().setIsLoading(true)
    expect(useSettingsStore.getState().isLoading).toBe(true)
  })

  it('should set search query', () => {
    useSettingsStore.getState().setSearchQuery('theme')
    expect(useSettingsStore.getState().searchQuery).toBe('theme')
  })

  it('should set active category', () => {
    useSettingsStore.getState().setActiveCategory('ai')
    expect(useSettingsStore.getState().activeCategory).toBe('ai')
  })

  it('should set modified only filter', () => {
    useSettingsStore.getState().setModifiedOnly(true)
    expect(useSettingsStore.getState().modifiedOnly).toBe(true)
  })

  it('should set view mode', () => {
    useSettingsStore.getState().setViewMode('raw')
    expect(useSettingsStore.getState().viewMode).toBe('raw')
  })

  it('should clear all filters', () => {
    useSettingsStore.getState().setSearchQuery('test')
    useSettingsStore.getState().setActiveCategory('ai')
    useSettingsStore.getState().setModifiedOnly(true)
    useSettingsStore.getState().clearFilters()
    const state = useSettingsStore.getState()
    expect(state.searchQuery).toBe('')
    expect(state.activeCategory).toBeNull()
    expect(state.modifiedOnly).toBe(false)
  })
})
