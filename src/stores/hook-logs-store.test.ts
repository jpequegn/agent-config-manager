/**
 * Hook Logs Store Tests
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { useHookLogsStore } from './hook-logs-store'

describe('Hook Logs Store', () => {
  beforeEach(() => {
    useHookLogsStore.getState().reset()
  })

  it('should have correct initial state', () => {
    const state = useHookLogsStore.getState()
    expect(state.hookId).toBeNull()
    expect(state.logs).toEqual([])
    expect(state.resultFilter).toBeNull()
    expect(state.isLoading).toBe(false)
    expect(state.stats).toBeNull()
    expect(state.lastTestResult).toBeNull()
    expect(state.isTesting).toBe(false)
    expect(state.selectedLogId).toBeNull()
  })

  it('should set hookId', () => {
    useHookLogsStore.getState().setHookId('hook-1')
    expect(useHookLogsStore.getState().hookId).toBe('hook-1')
  })

  it('should set result filter', () => {
    useHookLogsStore.getState().setResultFilter('block')
    expect(useHookLogsStore.getState().resultFilter).toBe('block')
  })

  it('should set logs', () => {
    const mockLogs = [
      {
        id: 'log-1',
        hookId: 'hook-1',
        timestamp: new Date(),
        duration: 100,
        result: 'allow' as const,
      },
    ]
    useHookLogsStore.getState().setLogs(mockLogs)
    expect(useHookLogsStore.getState().logs).toHaveLength(1)
  })

  it('should set testing state', () => {
    useHookLogsStore.getState().setIsTesting(true)
    expect(useHookLogsStore.getState().isTesting).toBe(true)
  })

  it('should set selected log id', () => {
    useHookLogsStore.getState().setSelectedLogId('log-1')
    expect(useHookLogsStore.getState().selectedLogId).toBe('log-1')
  })

  it('should reset all state', () => {
    const store = useHookLogsStore.getState()
    store.setHookId('hook-1')
    store.setResultFilter('error')
    store.setIsTesting(true)
    store.setSelectedLogId('log-1')
    store.reset()

    const state = useHookLogsStore.getState()
    expect(state.hookId).toBeNull()
    expect(state.resultFilter).toBeNull()
    expect(state.isTesting).toBe(false)
    expect(state.selectedLogId).toBeNull()
  })
})
