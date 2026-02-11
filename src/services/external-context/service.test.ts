/**
 * External Context Service Tests
 */

import { describe, it, expect } from 'vitest'
import {
  detectDrives,
  getConnectedDrives,
  getSyncConfig,
  updateSyncConfig,
  toggleSyncTarget,
  triggerSync,
  initializeDriveContext,
  getExternalContextStats,
} from './service'

describe('External Context Service', () => {
  it('should detect all drives including disconnected', async () => {
    const drives = await detectDrives()
    expect(drives.length).toBeGreaterThanOrEqual(3)

    const disconnected = drives.filter((d) => !d.storage.isConnected)
    expect(disconnected.length).toBeGreaterThanOrEqual(1)
  })

  it('should return only connected drives', async () => {
    const drives = await getConnectedDrives()
    expect(drives.every((d) => d.storage.isConnected)).toBe(true)
  })

  it('should get sync config for a configured drive', async () => {
    const config = await getSyncConfig('drive-extreme-pro')
    expect(config).not.toBeNull()
    expect(config!.driveId).toBe('drive-extreme-pro')
    expect(config!.mode).toBe('auto')
    expect(config!.syncTargets.length).toBeGreaterThan(0)
  })

  it('should return null for unconfigured drive', async () => {
    const config = await getSyncConfig('nonexistent')
    expect(config).toBeNull()
  })

  it('should update sync config', async () => {
    const updated = await updateSyncConfig('drive-extreme-pro', { mode: 'manual' })
    expect(updated.mode).toBe('manual')
    // Restore
    await updateSyncConfig('drive-extreme-pro', { mode: 'auto' })
  })

  it('should toggle sync target', async () => {
    const configBefore = await getSyncConfig('drive-extreme-pro')
    const backupsEnabled = configBefore!.syncTargets.find((t) => t.type === 'backups')!.enabled

    const updated = await toggleSyncTarget('drive-extreme-pro', 'backups')
    expect(updated).not.toBeNull()
    const backupsAfter = updated!.syncTargets.find((t) => t.type === 'backups')!.enabled
    expect(backupsAfter).toBe(!backupsEnabled)

    // Restore
    await toggleSyncTarget('drive-extreme-pro', 'backups')
  })

  it('should trigger sync successfully', async () => {
    const result = await triggerSync('drive-extreme-pro')
    expect(result.success).toBe(true)
    expect(result.filesTransferred).toBeGreaterThan(0)
  })

  it('should fail sync for unconfigured drive', async () => {
    const result = await triggerSync('nonexistent')
    expect(result.success).toBe(false)
    expect(result.error).toBeDefined()
  })

  it('should initialize drive context', async () => {
    const result = await initializeDriveContext('drive-sd-card')
    expect(result.success).toBe(true)
    expect(result.path).toContain('pai-context')
  })

  it('should get external context stats', async () => {
    const stats = await getExternalContextStats()
    expect(stats.totalDrives).toBeGreaterThanOrEqual(3)
    expect(stats.drivesWithContext).toBeGreaterThanOrEqual(2)
    expect(stats.totalCapacity).toBeGreaterThan(0)
  })
})
