/**
 * Memory Service
 * Provides mock data for memory storage statistics and health monitoring
 */

import type {
  HarnessType,
  MemoryType,
  MemoryStats,
  MemoryUsageByType,
  MemoryUsageByHarness,
  StorageInfo,
} from '@/types'

/** Health status for storage */
export type StorageHealthStatus = 'healthy' | 'warning' | 'critical'

/** Storage health indicator */
export interface StorageHealth {
  location: StorageInfo
  status: StorageHealthStatus
  message: string
  usagePercent: number
}

/** Memory dashboard summary */
export interface MemoryDashboardData {
  stats: MemoryStats
  health: StorageHealth[]
}

/** Mock storage locations */
const MOCK_STORAGE_LOCATIONS: StorageInfo[] = [
  {
    location: 'local',
    name: 'Local Storage',
    path: '~/.config',
    totalCapacity: 500 * 1024 * 1024 * 1024, // 500 GB
    usedSpace: 287 * 1024 * 1024, // 287 MB
    availableSpace: 500 * 1024 * 1024 * 1024 - 287 * 1024 * 1024,
    isConnected: true,
    lastSyncedAt: new Date(Date.now() - 60000),
  },
  {
    location: 'external',
    name: 'External Drive',
    path: '/Volumes/Extreme Pro',
    totalCapacity: 2 * 1024 * 1024 * 1024 * 1024, // 2 TB
    usedSpace: 1.2 * 1024 * 1024 * 1024, // 1.2 GB
    availableSpace: 2 * 1024 * 1024 * 1024 * 1024 - 1.2 * 1024 * 1024 * 1024,
    isConnected: true,
    lastSyncedAt: new Date(Date.now() - 3600000),
  },
  {
    location: 'cloud',
    name: 'Cloud Sync',
    path: 'cloud://pai-backup',
    totalCapacity: 10 * 1024 * 1024 * 1024, // 10 GB
    usedSpace: 156 * 1024 * 1024, // 156 MB
    availableSpace: 10 * 1024 * 1024 * 1024 - 156 * 1024 * 1024,
    isConnected: false,
  },
]

/** Mock usage by type */
const MOCK_BY_TYPE: MemoryUsageByType[] = [
  { type: 'session', entryCount: 847, totalSize: 142 * 1024 * 1024, percentage: 41.2 },
  { type: 'learning', entryCount: 234, totalSize: 89 * 1024 * 1024, percentage: 25.8 },
  { type: 'project-context', entryCount: 56, totalSize: 78 * 1024 * 1024, percentage: 22.6 },
  { type: 'codebase-index', entryCount: 12, totalSize: 36 * 1024 * 1024, percentage: 10.4 },
]

/** Mock usage by harness */
const MOCK_BY_HARNESS: MemoryUsageByHarness[] = [
  { harness: 'claude-code', entryCount: 523, totalSize: 178 * 1024 * 1024, percentage: 51.6 },
  { harness: 'cursor', entryCount: 245, totalSize: 67 * 1024 * 1024, percentage: 19.4 },
  { harness: 'copilot', entryCount: 156, totalSize: 45 * 1024 * 1024, percentage: 13.0 },
  { harness: 'cline', entryCount: 98, totalSize: 28 * 1024 * 1024, percentage: 8.1 },
  { harness: 'continue', entryCount: 67, totalSize: 18 * 1024 * 1024, percentage: 5.2 },
  { harness: 'aider', entryCount: 60, totalSize: 9 * 1024 * 1024, percentage: 2.7 },
]

const MOCK_STATS: MemoryStats = {
  totalEntries: 1149,
  totalSize: 345 * 1024 * 1024, // 345 MB
  byType: MOCK_BY_TYPE,
  byHarness: MOCK_BY_HARNESS,
  storageLocations: MOCK_STORAGE_LOCATIONS,
  oldestEntry: new Date(Date.now() - 86400000 * 180),
  newestEntry: new Date(Date.now() - 60000 * 5),
}

function getHealthStatus(usagePercent: number): StorageHealthStatus {
  if (usagePercent >= 90) return 'critical'
  if (usagePercent >= 75) return 'warning'
  return 'healthy'
}

function getHealthMessage(status: StorageHealthStatus, usagePercent: number): string {
  if (status === 'critical') return `Storage critically full (${usagePercent.toFixed(1)}% used)`
  if (status === 'warning') return `Storage usage high (${usagePercent.toFixed(1)}% used)`
  return `Storage healthy (${usagePercent.toFixed(1)}% used)`
}

/**
 * Get memory statistics.
 */
export async function getMemoryStats(): Promise<MemoryStats> {
  await new Promise((resolve) => setTimeout(resolve, 200))
  return MOCK_STATS
}

/**
 * Get storage health indicators.
 */
export async function getStorageHealth(): Promise<StorageHealth[]> {
  await new Promise((resolve) => setTimeout(resolve, 100))

  return MOCK_STORAGE_LOCATIONS.map((loc) => {
    const usagePercent = (loc.usedSpace / loc.totalCapacity) * 100
    const status = getHealthStatus(usagePercent)
    return {
      location: loc,
      status,
      message: loc.isConnected ? getHealthMessage(status, usagePercent) : 'Storage disconnected',
      usagePercent,
    }
  })
}

/**
 * Get full dashboard data.
 */
export async function getMemoryDashboard(): Promise<MemoryDashboardData> {
  const [stats, health] = await Promise.all([getMemoryStats(), getStorageHealth()])
  return { stats, health }
}

/**
 * Get usage breakdown for a specific harness.
 */
export async function getHarnessMemoryUsage(
  harness: HarnessType
): Promise<MemoryUsageByHarness | null> {
  await new Promise((resolve) => setTimeout(resolve, 50))
  return MOCK_BY_HARNESS.find((h) => h.harness === harness) ?? null
}

/**
 * Get usage breakdown for a specific memory type.
 */
export async function getTypeMemoryUsage(type: MemoryType): Promise<MemoryUsageByType | null> {
  await new Promise((resolve) => setTimeout(resolve, 50))
  return MOCK_BY_TYPE.find((t) => t.type === type) ?? null
}
