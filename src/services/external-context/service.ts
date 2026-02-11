/**
 * External Context Service
 * Drive detection, connection status, sync controls, and storage stats
 */

import type { StorageInfo } from '@/types'

/** Sync mode configuration */
export type SyncMode = 'manual' | 'auto'

/** Sync status */
export type SyncStatus = 'idle' | 'syncing' | 'error' | 'completed'

/** Sync direction */
export type SyncDirection = 'push' | 'pull' | 'bidirectional'

/** Detected external drive */
export interface ExternalDrive {
  /** Unique identifier */
  id: string
  /** Display name */
  name: string
  /** Mount path */
  mountPath: string
  /** Storage info */
  storage: StorageInfo
  /** Whether this drive has PAI context data */
  hasPaiContext: boolean
  /** PAI context path on this drive (if present) */
  paiContextPath: string | null
  /** Drive type */
  driveType: 'usb' | 'thunderbolt' | 'network' | 'sd-card'
}

/** Sync configuration for a drive */
export interface SyncConfig {
  /** Drive ID */
  driveId: string
  /** Sync mode */
  mode: SyncMode
  /** Sync direction */
  direction: SyncDirection
  /** Auto-sync interval in minutes (for auto mode) */
  intervalMinutes: number
  /** What to sync */
  syncTargets: SyncTarget[]
}

/** Sync target - what data to sync */
export interface SyncTarget {
  /** Target type */
  type: 'sessions' | 'learnings' | 'project-context' | 'backups'
  /** Whether this target is enabled */
  enabled: boolean
  /** Size on source in bytes */
  sourceSize: number
  /** Size on destination in bytes */
  destSize: number
  /** Last synced timestamp */
  lastSynced: Date | null
}

/** Sync operation result */
export interface SyncResult {
  /** Whether the sync succeeded */
  success: boolean
  /** Files transferred */
  filesTransferred: number
  /** Bytes transferred */
  bytesTransferred: number
  /** Duration in milliseconds */
  durationMs: number
  /** Error message if failed */
  error?: string
}

/** External context stats */
export interface ExternalContextStats {
  /** Total drives detected */
  totalDrives: number
  /** Drives with PAI context */
  drivesWithContext: number
  /** Total external storage capacity */
  totalCapacity: number
  /** Total external storage used */
  totalUsed: number
  /** Last sync across all drives */
  lastSync: Date | null
}

/** Mock detected drives */
const MOCK_DRIVES: ExternalDrive[] = [
  {
    id: 'drive-extreme-pro',
    name: 'Extreme Pro',
    mountPath: '/Volumes/Extreme Pro',
    storage: {
      location: 'external',
      name: 'Extreme Pro',
      path: '/Volumes/Extreme Pro',
      totalCapacity: 2 * 1024 * 1024 * 1024 * 1024, // 2 TB
      usedSpace: 1.2 * 1024 * 1024 * 1024, // 1.2 GB
      availableSpace: 2 * 1024 * 1024 * 1024 * 1024 - 1.2 * 1024 * 1024 * 1024,
      isConnected: true,
      lastSyncedAt: new Date(Date.now() - 3600000),
    },
    hasPaiContext: true,
    paiContextPath: '/Volumes/Extreme Pro/pai-context',
    driveType: 'usb',
  },
  {
    id: 'drive-backup-hdd',
    name: 'Backup HDD',
    mountPath: '/Volumes/Backup HDD',
    storage: {
      location: 'external',
      name: 'Backup HDD',
      path: '/Volumes/Backup HDD',
      totalCapacity: 4 * 1024 * 1024 * 1024 * 1024, // 4 TB
      usedSpace: 856 * 1024 * 1024, // 856 MB
      availableSpace: 4 * 1024 * 1024 * 1024 * 1024 - 856 * 1024 * 1024,
      isConnected: true,
      lastSyncedAt: new Date(Date.now() - 86400000 * 3),
    },
    hasPaiContext: true,
    paiContextPath: '/Volumes/Backup HDD/pai-context',
    driveType: 'usb',
  },
  {
    id: 'drive-sd-card',
    name: 'SD Card',
    mountPath: '/Volumes/SD Card',
    storage: {
      location: 'external',
      name: 'SD Card',
      path: '/Volumes/SD Card',
      totalCapacity: 128 * 1024 * 1024 * 1024, // 128 GB
      usedSpace: 0,
      availableSpace: 128 * 1024 * 1024 * 1024,
      isConnected: true,
    },
    hasPaiContext: false,
    paiContextPath: null,
    driveType: 'sd-card',
  },
]

/** Disconnected drive for fallback testing */
const MOCK_DISCONNECTED_DRIVE: ExternalDrive = {
  id: 'drive-nas',
  name: 'Network NAS',
  mountPath: '/Volumes/NAS',
  storage: {
    location: 'external',
    name: 'Network NAS',
    path: '/Volumes/NAS',
    totalCapacity: 8 * 1024 * 1024 * 1024 * 1024, // 8 TB
    usedSpace: 2.4 * 1024 * 1024 * 1024, // 2.4 GB
    availableSpace: 8 * 1024 * 1024 * 1024 * 1024 - 2.4 * 1024 * 1024 * 1024,
    isConnected: false,
  },
  hasPaiContext: true,
  paiContextPath: '/Volumes/NAS/pai-context',
  driveType: 'network',
}

/** Mock sync configs */
const MOCK_SYNC_CONFIGS: Map<string, SyncConfig> = new Map([
  [
    'drive-extreme-pro',
    {
      driveId: 'drive-extreme-pro',
      mode: 'auto',
      direction: 'bidirectional',
      intervalMinutes: 30,
      syncTargets: [
        {
          type: 'sessions',
          enabled: true,
          sourceSize: 142 * 1024 * 1024,
          destSize: 138 * 1024 * 1024,
          lastSynced: new Date(Date.now() - 3600000),
        },
        {
          type: 'learnings',
          enabled: true,
          sourceSize: 89 * 1024 * 1024,
          destSize: 89 * 1024 * 1024,
          lastSynced: new Date(Date.now() - 3600000),
        },
        {
          type: 'project-context',
          enabled: true,
          sourceSize: 78 * 1024 * 1024,
          destSize: 76 * 1024 * 1024,
          lastSynced: new Date(Date.now() - 7200000),
        },
        {
          type: 'backups',
          enabled: false,
          sourceSize: 345 * 1024 * 1024,
          destSize: 0,
          lastSynced: null,
        },
      ],
    },
  ],
  [
    'drive-backup-hdd',
    {
      driveId: 'drive-backup-hdd',
      mode: 'manual',
      direction: 'push',
      intervalMinutes: 60,
      syncTargets: [
        {
          type: 'sessions',
          enabled: true,
          sourceSize: 142 * 1024 * 1024,
          destSize: 120 * 1024 * 1024,
          lastSynced: new Date(Date.now() - 86400000 * 3),
        },
        {
          type: 'learnings',
          enabled: true,
          sourceSize: 89 * 1024 * 1024,
          destSize: 85 * 1024 * 1024,
          lastSynced: new Date(Date.now() - 86400000 * 3),
        },
        {
          type: 'project-context',
          enabled: false,
          sourceSize: 78 * 1024 * 1024,
          destSize: 0,
          lastSynced: null,
        },
        {
          type: 'backups',
          enabled: true,
          sourceSize: 345 * 1024 * 1024,
          destSize: 345 * 1024 * 1024,
          lastSynced: new Date(Date.now() - 86400000 * 3),
        },
      ],
    },
  ],
])

/**
 * Detect connected external drives.
 */
export async function detectDrives(): Promise<ExternalDrive[]> {
  await new Promise((resolve) => setTimeout(resolve, 300))
  return [...MOCK_DRIVES, MOCK_DISCONNECTED_DRIVE]
}

/**
 * Get only connected drives.
 */
export async function getConnectedDrives(): Promise<ExternalDrive[]> {
  await new Promise((resolve) => setTimeout(resolve, 200))
  return MOCK_DRIVES.filter((d) => d.storage.isConnected)
}

/**
 * Get sync configuration for a drive.
 */
export async function getSyncConfig(driveId: string): Promise<SyncConfig | null> {
  await new Promise((resolve) => setTimeout(resolve, 100))
  return MOCK_SYNC_CONFIGS.get(driveId) ?? null
}

/**
 * Update sync configuration for a drive.
 */
export async function updateSyncConfig(
  driveId: string,
  updates: Partial<Omit<SyncConfig, 'driveId'>>
): Promise<SyncConfig> {
  await new Promise((resolve) => setTimeout(resolve, 150))
  const existing = MOCK_SYNC_CONFIGS.get(driveId)
  if (!existing) {
    const newConfig: SyncConfig = {
      driveId,
      mode: updates.mode ?? 'manual',
      direction: updates.direction ?? 'push',
      intervalMinutes: updates.intervalMinutes ?? 60,
      syncTargets: updates.syncTargets ?? [],
    }
    MOCK_SYNC_CONFIGS.set(driveId, newConfig)
    return newConfig
  }
  const updated = { ...existing, ...updates }
  MOCK_SYNC_CONFIGS.set(driveId, updated)
  return updated
}

/**
 * Toggle a sync target for a drive.
 */
export async function toggleSyncTarget(
  driveId: string,
  targetType: SyncTarget['type']
): Promise<SyncConfig | null> {
  await new Promise((resolve) => setTimeout(resolve, 100))
  const config = MOCK_SYNC_CONFIGS.get(driveId)
  if (!config) return null
  const updated = {
    ...config,
    syncTargets: config.syncTargets.map((t) =>
      t.type === targetType ? { ...t, enabled: !t.enabled } : t
    ),
  }
  MOCK_SYNC_CONFIGS.set(driveId, updated)
  return updated
}

/**
 * Trigger a manual sync for a drive.
 */
export async function triggerSync(driveId: string): Promise<SyncResult> {
  await new Promise((resolve) => setTimeout(resolve, 1500))
  const config = MOCK_SYNC_CONFIGS.get(driveId)
  if (!config) {
    return {
      success: false,
      filesTransferred: 0,
      bytesTransferred: 0,
      durationMs: 0,
      error: 'No sync configuration found',
    }
  }
  const enabledTargets = config.syncTargets.filter((t) => t.enabled)
  const bytesTransferred = enabledTargets.reduce(
    (sum, t) => sum + Math.abs(t.sourceSize - t.destSize),
    0
  )
  return {
    success: true,
    filesTransferred: enabledTargets.length * 12,
    bytesTransferred,
    durationMs: 1500,
  }
}

/**
 * Initialize PAI context on a drive that doesn't have it.
 */
export async function initializeDriveContext(
  driveId: string
): Promise<{ success: boolean; path: string }> {
  await new Promise((resolve) => setTimeout(resolve, 500))
  const drive = MOCK_DRIVES.find((d) => d.id === driveId)
  if (!drive) return { success: false, path: '' }
  return { success: true, path: `${drive.mountPath}/pai-context` }
}

/**
 * Get aggregate stats for external context.
 */
export async function getExternalContextStats(): Promise<ExternalContextStats> {
  await new Promise((resolve) => setTimeout(resolve, 150))
  const allDrives = [...MOCK_DRIVES, MOCK_DISCONNECTED_DRIVE]
  const connectedDrives = allDrives.filter((d) => d.storage.isConnected)
  const drivesWithContext = allDrives.filter((d) => d.hasPaiContext)

  const lastSyncDates = allDrives
    .map((d) => d.storage.lastSyncedAt)
    .filter((d): d is Date => d != null)

  return {
    totalDrives: allDrives.length,
    drivesWithContext: drivesWithContext.length,
    totalCapacity: connectedDrives.reduce((sum, d) => sum + d.storage.totalCapacity, 0),
    totalUsed: connectedDrives.reduce((sum, d) => sum + d.storage.usedSpace, 0),
    lastSync:
      lastSyncDates.length > 0
        ? new Date(Math.max(...lastSyncDates.map((d) => d.getTime())))
        : null,
  }
}
