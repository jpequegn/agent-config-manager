/**
 * UI Store Tests
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { useUIStore } from './ui-store'

describe('UIStore', () => {
  beforeEach(() => {
    useUIStore.setState({
      theme: 'system',
      resolvedTheme: 'dark',
      sidebarCollapsed: false,
      expandedSections: new Set(['harnesses', 'skills']),
      commandPaletteOpen: false,
      viewMode: 'list',
      sortConfigs: {},
      showHiddenItems: false,
      searchQuery: '',
      activeFilters: {},
      toasts: [],
    })
  })

  describe('theme', () => {
    it('sets theme', () => {
      useUIStore.getState().setTheme('dark')
      expect(useUIStore.getState().theme).toBe('dark')
    })

    it('sets resolved theme', () => {
      useUIStore.getState().setResolvedTheme('light')
      expect(useUIStore.getState().resolvedTheme).toBe('light')
    })
  })

  describe('sidebar', () => {
    it('toggles sidebar collapsed state', () => {
      expect(useUIStore.getState().sidebarCollapsed).toBe(false)
      useUIStore.getState().toggleSidebar()
      expect(useUIStore.getState().sidebarCollapsed).toBe(true)
      useUIStore.getState().toggleSidebar()
      expect(useUIStore.getState().sidebarCollapsed).toBe(false)
    })

    it('sets sidebar collapsed directly', () => {
      useUIStore.getState().setSidebarCollapsed(true)
      expect(useUIStore.getState().sidebarCollapsed).toBe(true)
    })

    it('toggles a sidebar section', () => {
      useUIStore.getState().toggleSection('memory')
      expect(useUIStore.getState().expandedSections.has('memory')).toBe(true)
      useUIStore.getState().toggleSection('memory')
      expect(useUIStore.getState().expandedSections.has('memory')).toBe(false)
    })

    it('expands a section', () => {
      useUIStore.getState().expandSection('settings')
      expect(useUIStore.getState().expandedSections.has('settings')).toBe(true)
    })

    it('collapses a section', () => {
      useUIStore.getState().collapseSection('harnesses')
      expect(useUIStore.getState().expandedSections.has('harnesses')).toBe(false)
    })
  })

  describe('command palette', () => {
    it('opens command palette', () => {
      useUIStore.getState().openCommandPalette()
      expect(useUIStore.getState().commandPaletteOpen).toBe(true)
    })

    it('closes command palette', () => {
      useUIStore.getState().openCommandPalette()
      useUIStore.getState().closeCommandPalette()
      expect(useUIStore.getState().commandPaletteOpen).toBe(false)
    })

    it('toggles command palette', () => {
      useUIStore.getState().toggleCommandPalette()
      expect(useUIStore.getState().commandPaletteOpen).toBe(true)
      useUIStore.getState().toggleCommandPalette()
      expect(useUIStore.getState().commandPaletteOpen).toBe(false)
    })
  })

  describe('view mode and sort', () => {
    it('sets view mode', () => {
      useUIStore.getState().setViewMode('grid')
      expect(useUIStore.getState().viewMode).toBe('grid')
    })

    it('sets sort config for a view', () => {
      useUIStore.getState().setSortConfig('skills', { field: 'name', direction: 'asc' })
      expect(useUIStore.getState().sortConfigs['skills']).toEqual({
        field: 'name',
        direction: 'asc',
      })
    })

    it('toggles show hidden items', () => {
      useUIStore.getState().toggleShowHiddenItems()
      expect(useUIStore.getState().showHiddenItems).toBe(true)
      useUIStore.getState().toggleShowHiddenItems()
      expect(useUIStore.getState().showHiddenItems).toBe(false)
    })
  })

  describe('search and filters', () => {
    it('sets search query', () => {
      useUIStore.getState().setSearchQuery('my hook')
      expect(useUIStore.getState().searchQuery).toBe('my hook')
    })

    it('sets active filters', () => {
      useUIStore.getState().setActiveFilters({ harness: ['claude-code', 'cursor'] })
      expect(useUIStore.getState().activeFilters['harness']).toEqual(['claude-code', 'cursor'])
    })

    it('adds a filter value', () => {
      useUIStore.getState().addFilter('harness', 'claude-code')
      expect(useUIStore.getState().activeFilters['harness']).toContain('claude-code')
    })

    it('does not add duplicate filter values', () => {
      useUIStore.getState().addFilter('harness', 'claude-code')
      useUIStore.getState().addFilter('harness', 'claude-code')
      expect(useUIStore.getState().activeFilters['harness']).toHaveLength(1)
    })

    it('removes a filter value', () => {
      useUIStore.getState().addFilter('harness', 'claude-code')
      useUIStore.getState().addFilter('harness', 'cursor')
      useUIStore.getState().removeFilter('harness', 'claude-code')
      expect(useUIStore.getState().activeFilters['harness']).not.toContain('claude-code')
      expect(useUIStore.getState().activeFilters['harness']).toContain('cursor')
    })

    it('clears all filters and search query', () => {
      useUIStore.getState().setSearchQuery('test')
      useUIStore.getState().addFilter('harness', 'claude-code')
      useUIStore.getState().clearFilters()
      expect(useUIStore.getState().activeFilters).toEqual({})
      expect(useUIStore.getState().searchQuery).toBe('')
    })
  })

  describe('toasts', () => {
    it('adds a toast with generated id', () => {
      useUIStore.getState().addToast({ type: 'info', title: 'Hello' })
      const toasts = useUIStore.getState().toasts
      expect(toasts).toHaveLength(1)
      expect(toasts[0].title).toBe('Hello')
      expect(toasts[0].id).toBeTruthy()
    })

    it('removes a toast by id', () => {
      useUIStore.getState().addToast({ type: 'success', title: 'Done' })
      const id = useUIStore.getState().toasts[0].id
      useUIStore.getState().removeToast(id)
      expect(useUIStore.getState().toasts).toHaveLength(0)
    })

    it('clears all toasts', () => {
      useUIStore.getState().addToast({ type: 'info', title: 'A' })
      useUIStore.getState().addToast({ type: 'error', title: 'B' })
      useUIStore.getState().clearToasts()
      expect(useUIStore.getState().toasts).toHaveLength(0)
    })
  })

  describe('resetUI', () => {
    it('resets UI state but preserves theme', () => {
      useUIStore.getState().setTheme('light')
      useUIStore.getState().setResolvedTheme('light')
      useUIStore.getState().openCommandPalette()
      useUIStore.getState().setSearchQuery('test')

      useUIStore.getState().resetUI()

      const state = useUIStore.getState()
      expect(state.commandPaletteOpen).toBe(false)
      expect(state.searchQuery).toBe('')
      // Theme is preserved
      expect(state.theme).toBe('light')
      expect(state.resolvedTheme).toBe('light')
    })
  })
})
