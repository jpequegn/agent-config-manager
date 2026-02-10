/**
 * Sessions Store Tests
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { useSessionsStore } from './sessions-store'
import type { Session, SessionSummary } from '@/types'

const mockSummary: SessionSummary = {
  id: 'sess-test-001',
  harness: 'claude-code',
  title: 'Test Session',
  project: 'test-project',
  startedAt: new Date(),
  duration: 60000,
  messageCount: 5,
  lastMessagePreview: 'Last message preview...',
  tags: ['test'],
}

const mockSession: Session = {
  id: 'sess-test-001',
  harness: 'claude-code',
  metadata: {
    title: 'Test Session',
    project: 'test-project',
    tags: ['test'],
  },
  messages: [
    {
      id: 'msg-test-1',
      role: 'user',
      content: 'Hello',
      timestamp: new Date(),
    },
  ],
  stats: {
    messageCount: 1,
    userMessageCount: 1,
    assistantMessageCount: 0,
    toolCallCount: 0,
    fileChangeCount: 0,
    duration: 60000,
  },
  startedAt: new Date(),
  isActive: false,
}

describe('SessionsStore', () => {
  beforeEach(() => {
    const store = useSessionsStore.getState()
    store.setSessions([])
    store.selectSession(null)
    store.setIsLoading(false)
    store.setSearchQuery('')
    store.setFilterHarness(null)
    store.setFilterProject(null)
    store.setFilterDateStart(null)
    store.setFilterDateEnd(null)
    store.setSortBy('recent')
    store.setSortOrder('desc')
  })

  it('should start with defaults after reset', () => {
    const state = useSessionsStore.getState()
    expect(state.sessions).toEqual([])
    expect(state.selectedSession).toBeNull()
    expect(state.isLoading).toBe(false)
    expect(state.searchQuery).toBe('')
    expect(state.filterHarness).toBeNull()
    expect(state.filterProject).toBeNull()
    expect(state.filterDateStart).toBeNull()
    expect(state.filterDateEnd).toBeNull()
    expect(state.sortBy).toBe('recent')
    expect(state.sortOrder).toBe('desc')
  })

  it('should set sessions list', () => {
    useSessionsStore.getState().setSessions([mockSummary])
    expect(useSessionsStore.getState().sessions).toEqual([mockSummary])
  })

  it('should select a session', () => {
    useSessionsStore.getState().selectSession(mockSession)
    expect(useSessionsStore.getState().selectedSession).toEqual(mockSession)
  })

  it('should clear selected session', () => {
    useSessionsStore.getState().selectSession(mockSession)
    useSessionsStore.getState().selectSession(null)
    expect(useSessionsStore.getState().selectedSession).toBeNull()
  })

  it('should set loading state', () => {
    useSessionsStore.getState().setIsLoading(true)
    expect(useSessionsStore.getState().isLoading).toBe(true)
  })

  it('should set search query', () => {
    useSessionsStore.getState().setSearchQuery('test')
    expect(useSessionsStore.getState().searchQuery).toBe('test')
  })

  it('should set harness filter', () => {
    useSessionsStore.getState().setFilterHarness('cursor')
    expect(useSessionsStore.getState().filterHarness).toBe('cursor')
  })

  it('should set project filter', () => {
    useSessionsStore.getState().setFilterProject('my-project')
    expect(useSessionsStore.getState().filterProject).toBe('my-project')
  })

  it('should set date range filters', () => {
    const start = new Date('2025-01-01')
    const end = new Date('2025-12-31')
    useSessionsStore.getState().setFilterDateStart(start)
    useSessionsStore.getState().setFilterDateEnd(end)
    expect(useSessionsStore.getState().filterDateStart).toEqual(start)
    expect(useSessionsStore.getState().filterDateEnd).toEqual(end)
  })

  it('should set sort options', () => {
    useSessionsStore.getState().setSortBy('duration')
    useSessionsStore.getState().setSortOrder('asc')
    expect(useSessionsStore.getState().sortBy).toBe('duration')
    expect(useSessionsStore.getState().sortOrder).toBe('asc')
  })

  it('should clear all filters including dates', () => {
    useSessionsStore.getState().setSearchQuery('test')
    useSessionsStore.getState().setFilterHarness('cursor')
    useSessionsStore.getState().setFilterProject('my-project')
    useSessionsStore.getState().setFilterDateStart(new Date())
    useSessionsStore.getState().setFilterDateEnd(new Date())
    useSessionsStore.getState().clearFilters()
    const state = useSessionsStore.getState()
    expect(state.searchQuery).toBe('')
    expect(state.filterHarness).toBeNull()
    expect(state.filterProject).toBeNull()
    expect(state.filterDateStart).toBeNull()
    expect(state.filterDateEnd).toBeNull()
  })
})
