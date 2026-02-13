/**
 * Sync & Backup Service
 * Configuration backup, restore, sync status, and backup rotation
 */

import type { HarnessType } from '@/types'
import { generateId } from '@/lib/utils'

// ============================================
// Types
// ============================================

/** Backup type */
export type BackupType = 'manual' | 'auto' | 'pre-migration'

/** Backup status */
export type BackupStatus = 'complete' | 'in-progress' | 'failed'

/** Sync status */
export type SyncStatus = 'synced' | 'syncing' | 'pending' | 'error' | 'never'

/** What is included in a backup */
export interface BackupContents {
  skills: number
  hooks: number
  settings: number
  mcpServers: number
  projectContextFiles: number
}

/** A single backup entry */
export interface Backup {
  id: string
  name: string
  type: BackupType
  status: BackupStatus
  harness: HarnessType | 'all'
  contents: BackupContents
  size: number // bytes
  createdAt: Date
  expiresAt: Date | null
  description?: string
}

/** Sync state for a harness */
export interface HarnessSyncState {
  harness: HarnessType
  status: SyncStatus
  lastSyncedAt: Date | null
  pendingChanges: number
  error?: string
}

/** Backup rotation config */
export interface RotationConfig {
  maxBackups: number
  maxAgeDays: number
  keepMinimum: number
  autoBackupEnabled: boolean
  autoBackupIntervalHours: number
}

/** Restore result */
export interface RestoreResult {
  success: boolean
  backupId: string
  restoredItems: number
  skippedItems: number
  errors: string[]
  duration: number // ms
}

/** Backup stats */
export interface BackupStats {
  totalBackups: number
  totalSize: number
  oldestBackup: Date | null
  newestBackup: Date | null
  byType: { type: BackupType; count: number }[]
  byHarness: { harness: HarnessType | 'all'; count: number }[]
}

// ============================================
// Mock Data
// ============================================

const now = Date.now()
const DAY = 86400000
const HOUR = 3600000

let mockBackups: Backup[] = [
  {
    id: 'backup-001',
    name: 'Full Backup',
    type: 'manual',
    status: 'complete',
    harness: 'all',
    contents: { skills: 12, hooks: 8, settings: 24, mcpServers: 3, projectContextFiles: 5 },
    size: 145920,
    createdAt: new Date(now - 2 * HOUR),
    expiresAt: new Date(now + 30 * DAY),
    description: 'Complete backup of all configurations',
  },
  {
    id: 'backup-002',
    name: 'Claude Code Backup',
    type: 'manual',
    status: 'complete',
    harness: 'claude-code',
    contents: { skills: 5, hooks: 4, settings: 10, mcpServers: 2, projectContextFiles: 2 },
    size: 52480,
    createdAt: new Date(now - DAY),
    expiresAt: new Date(now + 30 * DAY),
    description: 'Claude Code specific configurations',
  },
  {
    id: 'backup-003',
    name: 'Auto Backup',
    type: 'auto',
    status: 'complete',
    harness: 'all',
    contents: { skills: 12, hooks: 8, settings: 24, mcpServers: 3, projectContextFiles: 5 },
    size: 143360,
    createdAt: new Date(now - 6 * HOUR),
    expiresAt: new Date(now + 7 * DAY),
  },
  {
    id: 'backup-004',
    name: 'Pre-Migration Backup',
    type: 'pre-migration',
    status: 'complete',
    harness: 'cursor',
    contents: { skills: 3, hooks: 0, settings: 8, mcpServers: 1, projectContextFiles: 1 },
    size: 28672,
    createdAt: new Date(now - 3 * DAY),
    expiresAt: null,
    description: 'Created before Cursor → Claude Code migration',
  },
  {
    id: 'backup-005',
    name: 'Auto Backup',
    type: 'auto',
    status: 'complete',
    harness: 'all',
    contents: { skills: 11, hooks: 7, settings: 22, mcpServers: 3, projectContextFiles: 4 },
    size: 138240,
    createdAt: new Date(now - 12 * HOUR),
    expiresAt: new Date(now + 7 * DAY),
  },
  {
    id: 'backup-006',
    name: 'Old Auto Backup',
    type: 'auto',
    status: 'complete',
    harness: 'all',
    contents: { skills: 10, hooks: 6, settings: 20, mcpServers: 2, projectContextFiles: 3 },
    size: 122880,
    createdAt: new Date(now - 14 * DAY),
    expiresAt: new Date(now - 7 * DAY), // expired
  },
]

const mockSyncStates: HarnessSyncState[] = [
  {
    harness: 'claude-code',
    status: 'synced',
    lastSyncedAt: new Date(now - 5 * 60000),
    pendingChanges: 0,
  },
  {
    harness: 'cursor',
    status: 'pending',
    lastSyncedAt: new Date(now - 2 * HOUR),
    pendingChanges: 3,
  },
  {
    harness: 'copilot',
    status: 'synced',
    lastSyncedAt: new Date(now - 30 * 60000),
    pendingChanges: 0,
  },
  {
    harness: 'cline',
    status: 'error',
    lastSyncedAt: new Date(now - DAY),
    pendingChanges: 1,
    error: 'Config file not found at expected path',
  },
  {
    harness: 'continue',
    status: 'synced',
    lastSyncedAt: new Date(now - 45 * 60000),
    pendingChanges: 0,
  },
  {
    harness: 'aider',
    status: 'never',
    lastSyncedAt: null,
    pendingChanges: 0,
  },
]

let mockRotationConfig: RotationConfig = {
  maxBackups: 20,
  maxAgeDays: 30,
  keepMinimum: 3,
  autoBackupEnabled: true,
  autoBackupIntervalHours: 6,
}

// ============================================
// Service Functions
// ============================================

/**
 * List all backups, sorted by creation date (newest first)
 */
export async function listBackups(): Promise<Backup[]> {
  await new Promise((r) => setTimeout(r, 200))
  return [...mockBackups].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
}

/**
 * Get a specific backup
 */
export async function getBackup(id: string): Promise<Backup | null> {
  await new Promise((r) => setTimeout(r, 100))
  return mockBackups.find((b) => b.id === id) ?? null
}

/**
 * Create a new backup
 */
export async function createBackup(options: {
  name: string
  harness: HarnessType | 'all'
  description?: string
  type?: BackupType
}): Promise<Backup> {
  await new Promise((r) => setTimeout(r, 800))

  const contents: BackupContents =
    options.harness === 'all'
      ? { skills: 12, hooks: 8, settings: 24, mcpServers: 3, projectContextFiles: 5 }
      : { skills: 3, hooks: 2, settings: 8, mcpServers: 1, projectContextFiles: 1 }

  const totalItems =
    contents.skills +
    contents.hooks +
    contents.settings +
    contents.mcpServers +
    contents.projectContextFiles

  const backup: Backup = {
    id: generateId('backup'),
    name: options.name,
    type: options.type ?? 'manual',
    status: 'complete',
    harness: options.harness,
    contents,
    size: totalItems * 2560,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 30 * DAY),
    description: options.description,
  }

  mockBackups.push(backup)
  return backup
}

/**
 * Delete a backup
 */
export async function deleteBackup(id: string): Promise<boolean> {
  await new Promise((r) => setTimeout(r, 200))
  const idx = mockBackups.findIndex((b) => b.id === id)
  if (idx === -1) return false
  mockBackups.splice(idx, 1)
  return true
}

/**
 * Restore from a backup
 */
export async function restoreBackup(id: string): Promise<RestoreResult> {
  await new Promise((r) => setTimeout(r, 1200))

  const backup = mockBackups.find((b) => b.id === id)
  if (!backup) {
    return {
      success: false,
      backupId: id,
      restoredItems: 0,
      skippedItems: 0,
      errors: ['Backup not found'],
      duration: 0,
    }
  }

  const total =
    backup.contents.skills +
    backup.contents.hooks +
    backup.contents.settings +
    backup.contents.mcpServers +
    backup.contents.projectContextFiles

  // Simulate occasional skips
  const skipped = Math.floor(Math.random() * 2)

  return {
    success: true,
    backupId: id,
    restoredItems: total - skipped,
    skippedItems: skipped,
    errors: [],
    duration: 1200 + Math.floor(Math.random() * 300),
  }
}

/**
 * Get sync states for all harnesses
 */
export async function getSyncStates(): Promise<HarnessSyncState[]> {
  await new Promise((r) => setTimeout(r, 200))
  return [...mockSyncStates]
}

/**
 * Trigger sync for a specific harness
 */
export async function syncHarness(harness: HarnessType): Promise<HarnessSyncState> {
  await new Promise((r) => setTimeout(r, 1000))

  const state = mockSyncStates.find((s) => s.harness === harness)
  if (!state) {
    return {
      harness,
      status: 'error',
      lastSyncedAt: null,
      pendingChanges: 0,
      error: 'Harness not configured',
    }
  }

  // Simulate successful sync
  state.status = 'synced'
  state.lastSyncedAt = new Date()
  state.pendingChanges = 0
  state.error = undefined

  return { ...state }
}

/**
 * Trigger sync for all harnesses
 */
export async function syncAll(): Promise<HarnessSyncState[]> {
  await new Promise((r) => setTimeout(r, 2000))

  for (const state of mockSyncStates) {
    if (state.status !== 'never') {
      state.status = 'synced'
      state.lastSyncedAt = new Date()
      state.pendingChanges = 0
      state.error = undefined
    }
  }

  return [...mockSyncStates]
}

/**
 * Get backup statistics
 */
export async function getBackupStats(): Promise<BackupStats> {
  await new Promise((r) => setTimeout(r, 150))

  const sorted = [...mockBackups].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
  const typeCount = new Map<BackupType, number>()
  const harnessCount = new Map<string, number>()
  let totalSize = 0

  for (const b of mockBackups) {
    totalSize += b.size
    typeCount.set(b.type, (typeCount.get(b.type) ?? 0) + 1)
    harnessCount.set(b.harness, (harnessCount.get(b.harness) ?? 0) + 1)
  }

  return {
    totalBackups: mockBackups.length,
    totalSize,
    oldestBackup: sorted.length > 0 ? sorted[0].createdAt : null,
    newestBackup: sorted.length > 0 ? sorted[sorted.length - 1].createdAt : null,
    byType: Array.from(typeCount.entries()).map(([type, count]) => ({ type, count })),
    byHarness: Array.from(harnessCount.entries()).map(([harness, count]) => ({
      harness: harness as HarnessType | 'all',
      count,
    })),
  }
}

/**
 * Get rotation config
 */
export async function getRotationConfig(): Promise<RotationConfig> {
  await new Promise((r) => setTimeout(r, 100))
  return { ...mockRotationConfig }
}

/**
 * Update rotation config
 */
export async function updateRotationConfig(
  updates: Partial<RotationConfig>
): Promise<RotationConfig> {
  await new Promise((r) => setTimeout(r, 200))
  mockRotationConfig = { ...mockRotationConfig, ...updates }
  return { ...mockRotationConfig }
}

/**
 * Run backup rotation (delete expired/excess backups)
 */
export async function runRotation(): Promise<{ deleted: number; remaining: number }> {
  await new Promise((r) => setTimeout(r, 300))

  const expiredBefore = mockBackups.length
  const nowMs = Date.now()

  // Remove expired backups (keep minimum)
  const nonExpired = mockBackups.filter((b) => !b.expiresAt || b.expiresAt.getTime() > nowMs)
  const expired = mockBackups.filter((b) => b.expiresAt && b.expiresAt.getTime() <= nowMs)

  // Keep at least keepMinimum total
  if (nonExpired.length >= mockRotationConfig.keepMinimum) {
    mockBackups = nonExpired
  } else {
    // Keep some expired ones to meet minimum
    const needed = mockRotationConfig.keepMinimum - nonExpired.length
    const keptExpired = expired
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, needed)
    mockBackups = [...nonExpired, ...keptExpired]
  }

  // Enforce max backups
  if (mockBackups.length > mockRotationConfig.maxBackups) {
    mockBackups = mockBackups
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, mockRotationConfig.maxBackups)
  }

  return {
    deleted: expiredBefore - mockBackups.length,
    remaining: mockBackups.length,
  }
}

/**
 * Reset mock data (for testing)
 */
export function resetMockData(): void {
  mockBackups = mockBackups.map((b) => ({ ...b }))
}
