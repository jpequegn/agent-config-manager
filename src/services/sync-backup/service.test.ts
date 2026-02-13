/**
 * Sync & Backup Service Tests
 */

import { describe, it, expect } from 'vitest'
import {
  listBackups,
  getBackup,
  createBackup,
  deleteBackup,
  restoreBackup,
  getSyncStates,
  syncHarness,
  syncAll,
  getBackupStats,
  getRotationConfig,
  updateRotationConfig,
  runRotation,
} from './service'

describe('Sync & Backup Service', () => {
  describe('listBackups', () => {
    it('should return backups sorted by date (newest first)', async () => {
      const backups = await listBackups()
      expect(backups.length).toBeGreaterThan(0)
      for (let i = 1; i < backups.length; i++) {
        expect(backups[i - 1].createdAt.getTime()).toBeGreaterThanOrEqual(
          backups[i].createdAt.getTime()
        )
      }
    })

    it('should include all backup fields', async () => {
      const backups = await listBackups()
      for (const b of backups) {
        expect(b.id).toBeTruthy()
        expect(b.name).toBeTruthy()
        expect(b.type).toBeTruthy()
        expect(b.status).toBeTruthy()
        expect(b.contents).toBeTruthy()
        expect(b.size).toBeGreaterThan(0)
      }
    })
  })

  describe('getBackup', () => {
    it('should return a specific backup', async () => {
      const backup = await getBackup('backup-001')
      expect(backup).not.toBeNull()
      expect(backup!.id).toBe('backup-001')
      expect(backup!.name).toBe('Full Backup')
    })

    it('should return null for unknown ID', async () => {
      const backup = await getBackup('nonexistent')
      expect(backup).toBeNull()
    })
  })

  describe('createBackup', () => {
    it('should create a new backup', async () => {
      const backup = await createBackup({
        name: 'Test Backup',
        harness: 'all',
        description: 'Test description',
      })
      expect(backup.id).toBeTruthy()
      expect(backup.name).toBe('Test Backup')
      expect(backup.type).toBe('manual')
      expect(backup.status).toBe('complete')
      expect(backup.harness).toBe('all')
      expect(backup.size).toBeGreaterThan(0)
    })

    it('should create harness-specific backup', async () => {
      const backup = await createBackup({
        name: 'Cursor Backup',
        harness: 'cursor',
      })
      expect(backup.harness).toBe('cursor')
    })
  })

  describe('deleteBackup', () => {
    it('should delete an existing backup', async () => {
      const backup = await createBackup({ name: 'To Delete', harness: 'all' })
      const result = await deleteBackup(backup.id)
      expect(result).toBe(true)

      const found = await getBackup(backup.id)
      expect(found).toBeNull()
    })

    it('should return false for unknown ID', async () => {
      const result = await deleteBackup('nonexistent')
      expect(result).toBe(false)
    })
  })

  describe('restoreBackup', () => {
    it('should restore from an existing backup', async () => {
      const result = await restoreBackup('backup-001')
      expect(result.success).toBe(true)
      expect(result.backupId).toBe('backup-001')
      expect(result.restoredItems).toBeGreaterThan(0)
      expect(result.duration).toBeGreaterThan(0)
    })

    it('should fail for unknown backup', async () => {
      const result = await restoreBackup('nonexistent')
      expect(result.success).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })
  })

  describe('getSyncStates', () => {
    it('should return sync states for all harnesses', async () => {
      const states = await getSyncStates()
      expect(states.length).toBe(6)
      for (const s of states) {
        expect(s.harness).toBeTruthy()
        expect(s.status).toBeTruthy()
      }
    })

    it('should include various statuses', async () => {
      const states = await getSyncStates()
      const statuses = states.map((s) => s.status)
      expect(statuses).toContain('synced')
      expect(statuses).toContain('pending')
    })
  })

  describe('syncHarness', () => {
    it('should sync a specific harness', async () => {
      const result = await syncHarness('cursor')
      expect(result.harness).toBe('cursor')
      expect(result.status).toBe('synced')
      expect(result.pendingChanges).toBe(0)
    })
  })

  describe('syncAll', () => {
    it('should sync all harnesses', async () => {
      const states = await syncAll()
      for (const s of states) {
        if (s.status !== 'never') {
          expect(s.status).toBe('synced')
          expect(s.pendingChanges).toBe(0)
        }
      }
    })
  })

  describe('getBackupStats', () => {
    it('should return aggregate stats', async () => {
      const stats = await getBackupStats()
      expect(stats.totalBackups).toBeGreaterThan(0)
      expect(stats.totalSize).toBeGreaterThan(0)
      expect(stats.byType.length).toBeGreaterThan(0)
      expect(stats.byHarness.length).toBeGreaterThan(0)
    })
  })

  describe('getRotationConfig', () => {
    it('should return rotation config', async () => {
      const config = await getRotationConfig()
      expect(config.maxBackups).toBeGreaterThan(0)
      expect(config.maxAgeDays).toBeGreaterThan(0)
      expect(config.keepMinimum).toBeGreaterThan(0)
      expect(typeof config.autoBackupEnabled).toBe('boolean')
    })
  })

  describe('updateRotationConfig', () => {
    it('should update rotation config', async () => {
      const config = await updateRotationConfig({ maxBackups: 50 })
      expect(config.maxBackups).toBe(50)
    })
  })

  describe('runRotation', () => {
    it('should run rotation and return counts', async () => {
      const result = await runRotation()
      expect(result.remaining).toBeGreaterThan(0)
      expect(typeof result.deleted).toBe('number')
    })
  })
})
