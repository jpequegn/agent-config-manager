/**
 * Learnings Store Tests
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { useLearningsStore } from './learnings-store'
import type { MemoryEntry, MemoryEntrySummary } from '@/types'

const mockSummary: MemoryEntrySummary = {
  id: 'learn-test-001',
  harness: 'claude-code',
  type: 'learning',
  title: 'Test Learning',
  size: 256,
  category: 'debugging',
  createdAt: new Date(),
  lastAccessedAt: new Date(),
}

const mockEntry: MemoryEntry = {
  id: 'learn-test-001',
  harness: 'claude-code',
  type: 'learning',
  title: 'Test Learning',
  content: 'Full content of the learning',
  filePath: '~/.claude/learnings/test.md',
  size: 256,
  metadata: {
    category: 'debugging',
    tags: ['test'],
  },
  createdAt: new Date(),
  lastAccessedAt: new Date(),
  updatedAt: new Date(),
}

describe('LearningsStore', () => {
  beforeEach(() => {
    const store = useLearningsStore.getState()
    store.setLearnings([])
    store.selectLearning(null)
    store.setIsLoading(false)
    store.setSearchQuery('')
    store.setFilterCategory(null)
    store.setFilterHarness(null)
  })

  it('should start with defaults after reset', () => {
    const state = useLearningsStore.getState()
    expect(state.learnings).toEqual([])
    expect(state.selectedLearning).toBeNull()
    expect(state.isLoading).toBe(false)
    expect(state.searchQuery).toBe('')
    expect(state.filterCategory).toBeNull()
    expect(state.filterHarness).toBeNull()
  })

  it('should set learnings list', () => {
    useLearningsStore.getState().setLearnings([mockSummary])
    expect(useLearningsStore.getState().learnings).toEqual([mockSummary])
  })

  it('should select a learning', () => {
    useLearningsStore.getState().selectLearning(mockEntry)
    expect(useLearningsStore.getState().selectedLearning).toEqual(mockEntry)
  })

  it('should clear selected learning', () => {
    useLearningsStore.getState().selectLearning(mockEntry)
    useLearningsStore.getState().selectLearning(null)
    expect(useLearningsStore.getState().selectedLearning).toBeNull()
  })

  it('should set loading state', () => {
    useLearningsStore.getState().setIsLoading(true)
    expect(useLearningsStore.getState().isLoading).toBe(true)
  })

  it('should set search query', () => {
    useLearningsStore.getState().setSearchQuery('zustand')
    expect(useLearningsStore.getState().searchQuery).toBe('zustand')
  })

  it('should set category filter', () => {
    useLearningsStore.getState().setFilterCategory('debugging')
    expect(useLearningsStore.getState().filterCategory).toBe('debugging')
  })

  it('should set harness filter', () => {
    useLearningsStore.getState().setFilterHarness('cursor')
    expect(useLearningsStore.getState().filterHarness).toBe('cursor')
  })

  it('should clear all filters', () => {
    useLearningsStore.getState().setSearchQuery('test')
    useLearningsStore.getState().setFilterCategory('debugging')
    useLearningsStore.getState().setFilterHarness('cursor')
    useLearningsStore.getState().clearFilters()
    const state = useLearningsStore.getState()
    expect(state.searchQuery).toBe('')
    expect(state.filterCategory).toBeNull()
    expect(state.filterHarness).toBeNull()
  })
})
