/**
 * Continue Adapter Tests
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { ContinueAdapter } from './continue'

describe('ContinueAdapter', () => {
  let adapter: ContinueAdapter

  beforeEach(() => {
    adapter = new ContinueAdapter()
  })

  describe('detection', () => {
    it('should have correct type and display name', () => {
      expect(adapter.type).toBe('continue')
      expect(adapter.displayName).toBe('Continue')
    })

    it('should detect Continue installation', async () => {
      const result = await adapter.detect()
      expect(result.type).toBe('continue')
      expect(result.detected).toBe(true)
      expect(result.status).toBe('active')
    })

    it('should return full harness config', async () => {
      const config = await adapter.getConfig()
      expect(config.id).toBe('continue')
      expect(config.name).toBe('Continue')
      expect(config.brandColor).toBe('#F59E0B')
    })
  })

  describe('skills', () => {
    it('should list skills (slash commands)', async () => {
      const skills = await adapter.listSkills()
      expect(skills.length).toBeGreaterThan(0)
      expect(skills[0].harness).toBe('continue')
    })

    it('should get a specific skill', async () => {
      const skill = await adapter.getSkill('cmd-edit')
      expect(skill).not.toBeNull()
      expect(skill!.metadata.name).toBe('/edit')
    })

    it('should return null for non-existent skill', async () => {
      const skill = await adapter.getSkill('non-existent')
      expect(skill).toBeNull()
    })

    it('should create a new skill', async () => {
      const skill = await adapter.createSkill({
        name: '/custom',
        description: 'Custom command',
        category: 'custom',
        content: '# Custom',
        harness: 'continue',
      })
      expect(skill.id).toBe('cmd--custom')
      expect(skill.content).toBe('# Custom')
    })

    it('should update an existing skill', async () => {
      const updated = await adapter.updateSkill('cmd-edit', { description: 'Updated' })
      expect(updated.metadata.description).toBe('Updated')
    })

    it('should throw when updating non-existent skill', async () => {
      await expect(adapter.updateSkill('non-existent', {})).rejects.toThrow('Skill not found')
    })

    it('should delete a skill', async () => {
      await expect(adapter.deleteSkill('cmd-edit')).resolves.toBeUndefined()
    })

    it('should throw when deleting non-existent skill', async () => {
      await expect(adapter.deleteSkill('non-existent')).rejects.toThrow('Skill not found')
    })
  })

  describe('hooks', () => {
    it('should list hooks (empty for Continue)', async () => {
      const hooks = await adapter.listHooks()
      expect(hooks).toEqual([])
    })

    it('should return null for any hook', async () => {
      const hook = await adapter.getHook('any-id')
      expect(hook).toBeNull()
    })

    it('should create a new hook', async () => {
      const hook = await adapter.createHook({
        name: 'Test Hook',
        description: 'A test hook',
        config: { trigger: 'PreToolUse' },
        scriptContent: 'echo test',
        scriptLanguage: 'bash',
        harness: 'continue',
      })
      expect(hook.id).toBe('test-hook')
      expect(hook.scriptContent).toBe('echo test')
    })

    it('should throw when updating non-existent hook', async () => {
      await expect(adapter.updateHook('non-existent', {})).rejects.toThrow('Hook not found')
    })

    it('should throw when deleting non-existent hook', async () => {
      await expect(adapter.deleteHook('non-existent')).rejects.toThrow('Hook not found')
    })
  })

  describe('sessions', () => {
    it('should list sessions', async () => {
      const sessions = await adapter.listSessions()
      expect(sessions.length).toBeGreaterThan(0)
      expect(sessions[0].harness).toBe('continue')
    })

    it('should get a specific session', async () => {
      const session = await adapter.getSession('continue-session-001')
      expect(session).not.toBeNull()
      expect(session!.harness).toBe('continue')
    })

    it('should return null for non-existent session', async () => {
      const session = await adapter.getSession('non-existent')
      expect(session).toBeNull()
    })

    it('should delete a session', async () => {
      await expect(adapter.deleteSession('continue-session-001')).resolves.toBeUndefined()
    })

    it('should throw when deleting non-existent session', async () => {
      await expect(adapter.deleteSession('non-existent')).rejects.toThrow('Session not found')
    })
  })

  describe('memory', () => {
    it('should get memory stats', async () => {
      const stats = await adapter.getMemoryStats()
      expect(stats.totalEntries).toBeGreaterThan(0)
      expect(stats.byType.some((t) => t.type === 'codebase-index')).toBe(true)
    })

    it('should list memory entries', async () => {
      const entries = await adapter.listMemoryEntries()
      expect(entries.length).toBeGreaterThan(0)
    })

    it('should filter by type', async () => {
      const entries = await adapter.listMemoryEntries({ type: 'codebase-index' })
      expect(entries.every((e) => e.type === 'codebase-index')).toBe(true)
    })

    it('should get a specific memory entry', async () => {
      const entry = await adapter.getMemoryEntry('continue-idx-001')
      expect(entry).not.toBeNull()
    })

    it('should return null for non-existent memory entry', async () => {
      const entry = await adapter.getMemoryEntry('non-existent')
      expect(entry).toBeNull()
    })

    it('should delete a memory entry', async () => {
      await expect(adapter.deleteMemoryEntry('continue-idx-001')).resolves.toBeUndefined()
    })

    it('should throw when deleting non-existent memory entry', async () => {
      await expect(adapter.deleteMemoryEntry('non-existent')).rejects.toThrow(
        'Memory entry not found'
      )
    })
  })

  describe('settings', () => {
    it('should get all settings', async () => {
      const settings = await adapter.getSettings()
      expect(settings.harness).toBe('continue')
      expect(settings.settings.length).toBeGreaterThan(0)
    })

    it('should get a specific setting', async () => {
      const setting = await adapter.getSetting('models')
      expect(setting).not.toBeNull()
    })

    it('should return null for non-existent setting', async () => {
      const setting = await adapter.getSetting('non-existent')
      expect(setting).toBeNull()
    })

    it('should set a setting value', async () => {
      await expect(adapter.setSetting('models', [])).resolves.toBeUndefined()
    })
  })
})
