/**
 * Settings Service Tests
 */

import { describe, it, expect } from 'vitest'
import {
  listSettings,
  getSetting,
  getSettingsRaw,
  getSettingsStats,
  SETTING_CATEGORIES,
  validateSettingValue,
  updateSetting,
  resetSetting,
  getPendingChanges,
  saveAllChanges,
  discardAllChanges,
  hasPendingChanges,
} from './service'

describe('SettingsService', () => {
  describe('listSettings', () => {
    it('should return a list of setting entries', async () => {
      const settings = await listSettings()
      expect(settings.length).toBeGreaterThan(0)
    })

    it('should include definition and current value for each entry', async () => {
      const settings = await listSettings()
      for (const entry of settings) {
        expect(entry.definition.key).toBeTruthy()
        expect(entry.definition.name).toBeTruthy()
        expect(entry.definition.type).toBeTruthy()
        expect(entry.definition.category).toBeTruthy()
        expect(entry.current.key).toBe(entry.definition.key)
      }
    })

    it('should filter by category', async () => {
      const aiSettings = await listSettings({ category: 'ai' })
      expect(aiSettings.length).toBeGreaterThan(0)
      for (const entry of aiSettings) {
        expect(entry.definition.category).toBe('ai')
      }
    })

    it('should filter by search text', async () => {
      const results = await listSettings({ searchText: 'theme' })
      expect(results.length).toBeGreaterThan(0)
    })

    it('should filter modified only', async () => {
      const modified = await listSettings({ modifiedOnly: true })
      expect(modified.length).toBeGreaterThan(0)
      for (const entry of modified) {
        expect(entry.current.isModified).toBe(true)
      }
    })

    it('should return empty for non-matching search', async () => {
      const results = await listSettings({ searchText: 'xyznonexistent' })
      expect(results).toEqual([])
    })
  })

  describe('getSetting', () => {
    it('should return a setting entry by key', async () => {
      const entry = await getSetting('appearance.theme')
      expect(entry).not.toBeNull()
      expect(entry!.definition.key).toBe('appearance.theme')
      expect(entry!.definition.name).toBe('Theme')
    })

    it('should return null for unknown key', async () => {
      const entry = await getSetting('nonexistent.key')
      expect(entry).toBeNull()
    })
  })

  describe('getSettingsRaw', () => {
    it('should return all settings as key-value pairs', async () => {
      const raw = await getSettingsRaw()
      expect(Object.keys(raw).length).toBeGreaterThan(0)
      expect(raw['appearance.theme']).toBeDefined()
    })
  })

  describe('getSettingsStats', () => {
    it('should return aggregate statistics', async () => {
      const stats = await getSettingsStats()
      expect(stats.totalSettings).toBeGreaterThan(0)
      expect(stats.modifiedSettings).toBeGreaterThan(0)
      expect(stats.byCategory.length).toBeGreaterThan(0)
    })

    it('should have category breakdown that sums to total', async () => {
      const stats = await getSettingsStats()
      const categoryTotal = stats.byCategory.reduce((sum, c) => sum + c.count, 0)
      expect(categoryTotal).toBe(stats.totalSettings)
    })
  })

  describe('SETTING_CATEGORIES', () => {
    it('should export category list', () => {
      expect(SETTING_CATEGORIES.length).toBeGreaterThan(0)
      for (const cat of SETTING_CATEGORIES) {
        expect(cat.value).toBeTruthy()
        expect(cat.label).toBeTruthy()
      }
    })
  })

  describe('validateSettingValue', () => {
    it('should pass valid number within range', () => {
      const err = validateSettingValue('general.autoRefreshInterval', 60)
      expect(err).toBeNull()
    })

    it('should fail number below min', () => {
      const err = validateSettingValue('general.autoRefreshInterval', -1)
      expect(err).not.toBeNull()
      expect(err!.message).toContain('Minimum')
    })

    it('should fail number above max', () => {
      const err = validateSettingValue('general.autoRefreshInterval', 999)
      expect(err).not.toBeNull()
      expect(err!.message).toContain('Maximum')
    })

    it('should fail NaN for number type', () => {
      const err = validateSettingValue(
        'general.autoRefreshInterval',
        'notanumber' as unknown as number
      )
      expect(err).not.toBeNull()
      expect(err!.message).toContain('number')
    })

    it('should pass valid select option', () => {
      const err = validateSettingValue('appearance.theme', 'dark')
      expect(err).toBeNull()
    })

    it('should fail invalid select option', () => {
      const err = validateSettingValue('appearance.theme', 'rainbow')
      expect(err).not.toBeNull()
      expect(err!.message).toContain('Invalid option')
    })

    it('should fail for unknown key', () => {
      const err = validateSettingValue('nonexistent.key', 'value')
      expect(err).not.toBeNull()
      expect(err!.message).toContain('Unknown')
    })
  })

  describe('updateSetting', () => {
    it('should stage a valid change', async () => {
      const result = await updateSetting('appearance.theme', 'light')
      expect(result.success).toBe(true)
    })

    it('should reject invalid value', async () => {
      const result = await updateSetting('general.autoRefreshInterval', -1)
      expect(result.success).toBe(false)
      expect(result.error).toBeTruthy()
    })
  })

  describe('resetSetting', () => {
    it('should reset to default', async () => {
      const result = await resetSetting('appearance.theme')
      expect(result.success).toBe(true)
    })

    it('should fail for unknown key', async () => {
      const result = await resetSetting('nonexistent')
      expect(result.success).toBe(false)
    })
  })

  describe('getPendingChanges', () => {
    it('should return staged changes', async () => {
      await discardAllChanges()
      await updateSetting('appearance.fontSize', 18)
      const changes = await getPendingChanges()
      expect(changes.length).toBeGreaterThan(0)
      expect(changes.some((c) => c.key === 'appearance.fontSize')).toBe(true)
    })
  })

  describe('saveAllChanges', () => {
    it('should save pending changes', async () => {
      await discardAllChanges()
      await updateSetting('appearance.compactMode', true)
      const result = await saveAllChanges()
      expect(result.success).toBe(true)
      expect(result.savedCount).toBeGreaterThan(0)
    })
  })

  describe('discardAllChanges', () => {
    it('should clear all pending changes', async () => {
      await updateSetting('appearance.fontSize', 20)
      await discardAllChanges()
      expect(hasPendingChanges()).toBe(false)
    })
  })

  describe('hasPendingChanges', () => {
    it('should return true when changes exist', async () => {
      await discardAllChanges()
      await updateSetting('editor.tabSize', 4)
      expect(hasPendingChanges()).toBe(true)
    })

    it('should return false after discard', async () => {
      await discardAllChanges()
      expect(hasPendingChanges()).toBe(false)
    })
  })
})
