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
})
