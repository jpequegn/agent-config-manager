/**
 * Memory Store Tests
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { useMemoryStore } from './memory-store'
import type { MemoryStats } from '@/types'
import type { StorageHealth } from '@/services/memory'

const mockStats: MemoryStats = {
  totalEntries: 100,
  totalSize: 1024 * 1024,
  byType: [],
  byHarness: [],
  storageLocations: [],
  oldestEntry: new Date(),
  newestEntry: new Date(),
}

const mockHealth: StorageHealth[] = [
  {
    location: {
      location: 'local',
      name: 'Local',
      path: '~/.config',
      totalCapacity: 1024,
      usedSpace: 512,
      availableSpace: 512,
      isConnected: true,
    },
    status: 'healthy',
    message: 'Storage healthy',
    usagePercent: 50,
  },
]

describe('MemoryStore', () => {
  beforeEach(() => {
    const store = useMemoryStore.getState()
    store.setStats(null)
    store.setHealth([])
    store.setIsLoading(false)
    store.setBreakdownView('type')
  })

  it('should start with defaults after reset', () => {
    const state = useMemoryStore.getState()
    expect(state.stats).toBeNull()
    expect(state.health).toEqual([])
    expect(state.isLoading).toBe(false)
    expect(state.breakdownView).toBe('type')
  })

  it('should set stats', () => {
    useMemoryStore.getState().setStats(mockStats)
    expect(useMemoryStore.getState().stats).toEqual(mockStats)
  })

  it('should set health', () => {
    useMemoryStore.getState().setHealth(mockHealth)
    expect(useMemoryStore.getState().health).toEqual(mockHealth)
  })

  it('should set loading state', () => {
    useMemoryStore.getState().setIsLoading(true)
    expect(useMemoryStore.getState().isLoading).toBe(true)
  })

  it('should set breakdown view', () => {
    useMemoryStore.getState().setBreakdownView('harness')
    expect(useMemoryStore.getState().breakdownView).toBe('harness')
  })

  it('should clear stats', () => {
    useMemoryStore.getState().setStats(mockStats)
    useMemoryStore.getState().setStats(null)
    expect(useMemoryStore.getState().stats).toBeNull()
  })
})
