/**
 * Hooks Store Tests
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { useHooksStore } from './hooks-store'
import type { HookGroup } from '@/services/hooks'

const mockGroup: HookGroup = {
  trigger: 'PreToolUse',
  hooks: [
    {
      id: 'test-1',
      name: 'Test Hook',
      harness: 'claude-code',
      trigger: 'PreToolUse',
      status: 'enabled',
      runCount: 10,
      blockCount: 2,
    },
  ],
}

describe('Hooks Store', () => {
  beforeEach(() => {
    const store = useHooksStore.getState()
    store.setHookGroups([])
    store.clearSelection()
    store.setFilterTrigger(null)
    store.setFilterHarness(null)
    store.setIsLoading(false)
    store.setIsBulkOperating(false)
    store.setLastMessage(null)
  })

  it('should set hook groups', () => {
    useHooksStore.getState().setHookGroups([mockGroup])
    expect(useHooksStore.getState().hookGroups).toHaveLength(1)
    expect(useHooksStore.getState().hookGroups[0].trigger).toBe('PreToolUse')
  })

  it('should toggle selection', () => {
    useHooksStore.getState().toggleSelected('test-1')
    expect(useHooksStore.getState().selectedIds.has('test-1')).toBe(true)
    useHooksStore.getState().toggleSelected('test-1')
    expect(useHooksStore.getState().selectedIds.has('test-1')).toBe(false)
  })

  it('should select all', () => {
    useHooksStore.getState().setSelectAll(true, ['a', 'b', 'c'])
    const state = useHooksStore.getState()
    expect(state.selectedIds.size).toBe(3)
    expect(state.selectAll).toBe(true)
  })

  it('should clear selection', () => {
    useHooksStore.getState().setSelectAll(true, ['a', 'b'])
    useHooksStore.getState().clearSelection()
    const state = useHooksStore.getState()
    expect(state.selectedIds.size).toBe(0)
    expect(state.selectAll).toBe(false)
  })

  it('should set filter trigger', () => {
    useHooksStore.getState().setFilterTrigger('PreToolUse')
    expect(useHooksStore.getState().filterTrigger).toBe('PreToolUse')
  })

  it('should set loading state', () => {
    useHooksStore.getState().setIsLoading(true)
    expect(useHooksStore.getState().isLoading).toBe(true)
  })

  it('should set last message', () => {
    useHooksStore.getState().setLastMessage('Enabled 3 hooks')
    expect(useHooksStore.getState().lastMessage).toBe('Enabled 3 hooks')
  })
})
