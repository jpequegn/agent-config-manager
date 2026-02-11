/**
 * Session Memory Store Tests
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { useSessionMemoryStore } from './session-memory-store'

describe('SessionMemoryStore', () => {
  beforeEach(() => {
    const store = useSessionMemoryStore.getState()
    store.clearSelection()
    store.setActivePanel('sessions')
    store.setPruneRules([])
    store.setIsBulkOperating(false)
    store.setLastOperationMessage(null)
  })

  it('should start with defaults after reset', () => {
    const state = useSessionMemoryStore.getState()
    expect(state.selectedIds.size).toBe(0)
    expect(state.selectAll).toBe(false)
    expect(state.activePanel).toBe('sessions')
    expect(state.pruneRules).toEqual([])
    expect(state.isBulkOperating).toBe(false)
    expect(state.lastOperationMessage).toBeNull()
  })

  it('should toggle selection', () => {
    const store = useSessionMemoryStore.getState()
    store.toggleSelected('sess-1')
    expect(useSessionMemoryStore.getState().selectedIds.has('sess-1')).toBe(true)
    store.toggleSelected('sess-1')
    expect(useSessionMemoryStore.getState().selectedIds.has('sess-1')).toBe(false)
  })

  it('should select all', () => {
    const store = useSessionMemoryStore.getState()
    store.setSelectAll(true, ['sess-1', 'sess-2', 'sess-3'])
    const state = useSessionMemoryStore.getState()
    expect(state.selectAll).toBe(true)
    expect(state.selectedIds.size).toBe(3)
  })

  it('should deselect all', () => {
    const store = useSessionMemoryStore.getState()
    store.setSelectAll(true, ['sess-1', 'sess-2'])
    store.setSelectAll(false)
    const state = useSessionMemoryStore.getState()
    expect(state.selectAll).toBe(false)
    expect(state.selectedIds.size).toBe(0)
  })

  it('should clear selection', () => {
    const store = useSessionMemoryStore.getState()
    store.toggleSelected('sess-1')
    store.toggleSelected('sess-2')
    store.clearSelection()
    expect(useSessionMemoryStore.getState().selectedIds.size).toBe(0)
  })

  it('should set active panel', () => {
    useSessionMemoryStore.getState().setActivePanel('prune')
    expect(useSessionMemoryStore.getState().activePanel).toBe('prune')
  })

  it('should set prune rules', () => {
    const rules = [{ id: 'r1', name: 'Test', enabled: true }]
    useSessionMemoryStore.getState().setPruneRules(rules)
    expect(useSessionMemoryStore.getState().pruneRules).toEqual(rules)
  })

  it('should set bulk operating state', () => {
    useSessionMemoryStore.getState().setIsBulkOperating(true)
    expect(useSessionMemoryStore.getState().isBulkOperating).toBe(true)
  })

  it('should set operation message', () => {
    useSessionMemoryStore.getState().setLastOperationMessage('Deleted 3 sessions')
    expect(useSessionMemoryStore.getState().lastOperationMessage).toBe('Deleted 3 sessions')
  })
})
