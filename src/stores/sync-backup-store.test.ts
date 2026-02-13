/**
 * Sync Backup Store Tests
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { useSyncBackupStore } from './sync-backup-store'
import type { Backup, HarnessSyncState } from '@/services/sync-backup'

const mockBackup: Backup = {
  id: 'b-1',
  name: 'Test Backup',
  type: 'manual',
  status: 'complete',
  harness: 'all',
  createdAt: new Date(),
  expiresAt: null,
  size: 1024,
  contents: { skills: 2, hooks: 1, settings: 1, mcpServers: 0, projectContextFiles: 1 },
}

const mockSyncState: HarnessSyncState = {
  harness: 'cursor',
  status: 'synced',
  lastSyncedAt: new Date(),
  pendingChanges: 0,
}

describe('SyncBackupStore', () => {
  beforeEach(() => {
    // Reset to initial state
    useSyncBackupStore.setState({
      backups: [],
      selectedBackupId: null,
      syncStates: [],
      rotationConfig: null,
      stats: null,
      lastRestoreResult: null,
      isLoadingBackups: false,
      isCreatingBackup: false,
      isRestoring: false,
      isSyncing: false,
      isRotating: false,
      message: null,
    })
  })

  it('should start with initial state', () => {
    const state = useSyncBackupStore.getState()
    expect(state.backups).toEqual([])
    expect(state.selectedBackupId).toBeNull()
    expect(state.syncStates).toEqual([])
    expect(state.rotationConfig).toBeNull()
    expect(state.stats).toBeNull()
    expect(state.isLoadingBackups).toBe(false)
    expect(state.isSyncing).toBe(false)
    expect(state.message).toBeNull()
  })

  it('should set backups', () => {
    useSyncBackupStore.getState().setBackups([mockBackup])
    expect(useSyncBackupStore.getState().backups).toHaveLength(1)
    expect(useSyncBackupStore.getState().backups[0].id).toBe('b-1')
  })

  it('should add a backup to the front', () => {
    useSyncBackupStore.getState().setBackups([mockBackup])
    const newBackup = { ...mockBackup, id: 'b-2', name: 'Second' }
    useSyncBackupStore.getState().addBackup(newBackup)
    const backups = useSyncBackupStore.getState().backups
    expect(backups).toHaveLength(2)
    expect(backups[0].id).toBe('b-2')
  })

  it('should remove a backup', () => {
    useSyncBackupStore.getState().setBackups([mockBackup])
    useSyncBackupStore.getState().removeBackup('b-1')
    expect(useSyncBackupStore.getState().backups).toHaveLength(0)
  })

  it('should clear selectedBackupId when removing the selected backup', () => {
    useSyncBackupStore.getState().setBackups([mockBackup])
    useSyncBackupStore.getState().setSelectedBackupId('b-1')
    useSyncBackupStore.getState().removeBackup('b-1')
    expect(useSyncBackupStore.getState().selectedBackupId).toBeNull()
  })

  it('should keep selectedBackupId when removing a different backup', () => {
    const b2 = { ...mockBackup, id: 'b-2' }
    useSyncBackupStore.getState().setBackups([mockBackup, b2])
    useSyncBackupStore.getState().setSelectedBackupId('b-1')
    useSyncBackupStore.getState().removeBackup('b-2')
    expect(useSyncBackupStore.getState().selectedBackupId).toBe('b-1')
  })

  it('should set selected backup ID', () => {
    useSyncBackupStore.getState().setSelectedBackupId('b-1')
    expect(useSyncBackupStore.getState().selectedBackupId).toBe('b-1')
  })

  it('should set sync states', () => {
    useSyncBackupStore.getState().setSyncStates([mockSyncState])
    expect(useSyncBackupStore.getState().syncStates).toHaveLength(1)
    expect(useSyncBackupStore.getState().syncStates[0].harness).toBe('cursor')
  })

  it('should update a single sync state', () => {
    useSyncBackupStore.getState().setSyncStates([mockSyncState])
    const updated: HarnessSyncState = { ...mockSyncState, status: 'pending', pendingChanges: 3 }
    useSyncBackupStore.getState().updateSyncState(updated)
    expect(useSyncBackupStore.getState().syncStates[0].status).toBe('pending')
    expect(useSyncBackupStore.getState().syncStates[0].pendingChanges).toBe(3)
  })

  it('should set rotation config', () => {
    useSyncBackupStore.getState().setRotationConfig({
      maxBackups: 20,
      maxAgeDays: 30,
      keepMinimum: 3,
      autoBackupEnabled: true,
      autoBackupIntervalHours: 24,
    })
    expect(useSyncBackupStore.getState().rotationConfig!.maxBackups).toBe(20)
  })

  it('should set stats', () => {
    useSyncBackupStore.getState().setStats({
      totalBackups: 5,
      totalSize: 10240,
      oldestBackup: new Date('2025-01-01'),
      newestBackup: new Date('2025-06-01'),
      byType: [{ type: 'manual', count: 3 }],
      byHarness: [{ harness: 'all', count: 5 }],
    })
    expect(useSyncBackupStore.getState().stats!.totalBackups).toBe(5)
  })

  it('should set last restore result', () => {
    useSyncBackupStore.getState().setLastRestoreResult({
      success: true,
      backupId: 'b-1',
      restoredItems: 5,
      skippedItems: 0,
      errors: [],
      duration: 100,
    })
    expect(useSyncBackupStore.getState().lastRestoreResult!.success).toBe(true)
  })

  it('should set loading flags', () => {
    useSyncBackupStore.getState().setIsLoadingBackups(true)
    expect(useSyncBackupStore.getState().isLoadingBackups).toBe(true)

    useSyncBackupStore.getState().setIsCreatingBackup(true)
    expect(useSyncBackupStore.getState().isCreatingBackup).toBe(true)

    useSyncBackupStore.getState().setIsRestoring(true)
    expect(useSyncBackupStore.getState().isRestoring).toBe(true)

    useSyncBackupStore.getState().setIsSyncing(true)
    expect(useSyncBackupStore.getState().isSyncing).toBe(true)

    useSyncBackupStore.getState().setIsRotating(true)
    expect(useSyncBackupStore.getState().isRotating).toBe(true)
  })

  it('should set and clear message', () => {
    useSyncBackupStore.getState().setMessage('Test message')
    expect(useSyncBackupStore.getState().message).toBe('Test message')

    useSyncBackupStore.getState().setMessage(null)
    expect(useSyncBackupStore.getState().message).toBeNull()
  })
})
