/**
 * Harness Config Tests
 */

import { describe, it, expect } from 'vitest'
import { getHarnessConfig, getAllHarnessTypes, harnessConfigs } from './harness-config'
import type { HarnessType } from '@/types'

describe('harness-config', () => {
  describe('getAllHarnessTypes', () => {
    it('returns all expected harness types', () => {
      const types = getAllHarnessTypes()
      expect(types).toHaveLength(6)
      expect(types).toContain('claude-code')
      expect(types).toContain('cursor')
      expect(types).toContain('copilot')
      expect(types).toContain('cline')
      expect(types).toContain('continue')
      expect(types).toContain('aider')
    })

    it('returns types in consistent order', () => {
      const types1 = getAllHarnessTypes()
      const types2 = getAllHarnessTypes()
      expect(types1).toEqual(types2)
    })

    it('returns claude-code first', () => {
      const types = getAllHarnessTypes()
      expect(types[0]).toBe('claude-code')
    })
  })

  describe('getHarnessConfig', () => {
    const harnessTypes: HarnessType[] = [
      'claude-code',
      'cursor',
      'copilot',
      'cline',
      'continue',
      'aider',
    ]

    it.each(harnessTypes)('returns config for %s', (type) => {
      const config = getHarnessConfig(type)
      expect(config).toBeDefined()
      expect(config.name).toBeTruthy()
      expect(config.shortName).toBeTruthy()
      expect(config.brandColor).toMatch(/^#[0-9A-Fa-f]{6}$/)
      expect(config.bgColor).toBeTruthy()
      expect(config.textColor).toBeTruthy()
      expect(config.description).toBeTruthy()
      expect(config.website).toMatch(/^https:\/\//)
    })

    it('returns correct config for claude-code', () => {
      const config = getHarnessConfig('claude-code')
      expect(config.name).toBe('Claude Code')
      expect(config.shortName).toBe('Claude')
      expect(config.brandColor).toBe('#D97706')
    })

    it('returns correct config for cursor', () => {
      const config = getHarnessConfig('cursor')
      expect(config.name).toBe('Cursor')
      expect(config.website).toBe('https://cursor.sh')
    })
  })

  describe('harnessConfigs', () => {
    it('has config for all harness types', () => {
      const types = getAllHarnessTypes()
      for (const type of types) {
        expect(harnessConfigs[type]).toBeDefined()
      }
    })

    it('all configs have required fields', () => {
      for (const config of Object.values(harnessConfigs)) {
        expect(config).toHaveProperty('name')
        expect(config).toHaveProperty('shortName')
        expect(config).toHaveProperty('brandColor')
        expect(config).toHaveProperty('bgColor')
        expect(config).toHaveProperty('textColor')
        expect(config).toHaveProperty('description')
        expect(config).toHaveProperty('website')
      }
    })
  })
})
