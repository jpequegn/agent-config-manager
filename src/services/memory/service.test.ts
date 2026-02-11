/**
 * Memory Service Tests
 */

import { describe, it, expect } from 'vitest'
import {
  getMemoryStats,
  getStorageHealth,
  getMemoryDashboard,
  getHarnessMemoryUsage,
  getTypeMemoryUsage,
} from './service'

describe('MemoryService', () => {
  describe('getMemoryStats', () => {
    it('should return memory statistics', async () => {
      const stats = await getMemoryStats()
      expect(stats.totalEntries).toBeGreaterThan(0)
      expect(stats.totalSize).toBeGreaterThan(0)
    })

    it('should include breakdown by type', async () => {
      const stats = await getMemoryStats()
      expect(stats.byType.length).toBeGreaterThan(0)
      for (const t of stats.byType) {
        expect(t.type).toBeTruthy()
        expect(t.entryCount).toBeGreaterThan(0)
        expect(t.totalSize).toBeGreaterThan(0)
      }
    })

    it('should include breakdown by harness', async () => {
      const stats = await getMemoryStats()
      expect(stats.byHarness.length).toBeGreaterThan(0)
      for (const h of stats.byHarness) {
        expect(h.harness).toBeTruthy()
        expect(h.entryCount).toBeGreaterThan(0)
      }
    })

    it('should include storage locations', async () => {
      const stats = await getMemoryStats()
      expect(stats.storageLocations.length).toBeGreaterThan(0)
      for (const loc of stats.storageLocations) {
        expect(loc.name).toBeTruthy()
        expect(loc.path).toBeTruthy()
        expect(loc.totalCapacity).toBeGreaterThan(0)
      }
    })

    it('should include date range', async () => {
      const stats = await getMemoryStats()
      expect(stats.oldestEntry).toBeInstanceOf(Date)
      expect(stats.newestEntry).toBeInstanceOf(Date)
    })
  })

  describe('getStorageHealth', () => {
    it('should return health indicators for each location', async () => {
      const health = await getStorageHealth()
      expect(health.length).toBeGreaterThan(0)
      for (const h of health) {
        expect(h.location).toBeDefined()
        expect(h.status).toMatch(/^(healthy|warning|critical)$/)
        expect(h.message).toBeTruthy()
        expect(typeof h.usagePercent).toBe('number')
      }
    })

    it('should show disconnected status for unavailable storage', async () => {
      const health = await getStorageHealth()
      const disconnected = health.find((h) => !h.location.isConnected)
      expect(disconnected).toBeDefined()
      expect(disconnected!.message).toContain('disconnected')
    })
  })

  describe('getMemoryDashboard', () => {
    it('should return combined stats and health', async () => {
      const dashboard = await getMemoryDashboard()
      expect(dashboard.stats).toBeDefined()
      expect(dashboard.stats.totalEntries).toBeGreaterThan(0)
      expect(dashboard.health.length).toBeGreaterThan(0)
    })
  })

  describe('getHarnessMemoryUsage', () => {
    it('should return usage for a known harness', async () => {
      const usage = await getHarnessMemoryUsage('claude-code')
      expect(usage).not.toBeNull()
      expect(usage!.harness).toBe('claude-code')
      expect(usage!.totalSize).toBeGreaterThan(0)
    })

    it('should return null for unknown harness', async () => {
      const usage = await getHarnessMemoryUsage('unknown' as never)
      expect(usage).toBeNull()
    })
  })

  describe('getTypeMemoryUsage', () => {
    it('should return usage for a known type', async () => {
      const usage = await getTypeMemoryUsage('session')
      expect(usage).not.toBeNull()
      expect(usage!.type).toBe('session')
    })

    it('should return null for unknown type', async () => {
      const usage = await getTypeMemoryUsage('unknown' as never)
      expect(usage).toBeNull()
    })
  })
})
