/**
 * Cline Adapter Tests
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { ClineAdapter } from './cline'

describe('ClineAdapter', () => {
  let adapter: ClineAdapter

  beforeEach(() => {
    adapter = new ClineAdapter()
  })

  describe('detection', () => {
    it('should have correct type and display name', () => {
      expect(adapter.type).toBe('cline')
      expect(adapter.displayName).toBe('Cline')
    })

    it('should detect Cline installation', async () => {
      const result = await adapter.detect()
      expect(result.type).toBe('cline')
      expect(result.detected).toBe(true)
      expect(result.status).toBe('active')
    })

    it('should return full harness config', async () => {
      const config = await adapter.getConfig()
      expect(config.id).toBe('cline')
      expect(config.name).toBe('Cline')
      expect(config.brandColor).toBe('#6366F1')
    })
  })

  describe('skills', () => {
    it('should list skills', async () => {
      const skills = await adapter.listSkills()
      expect(skills.length).toBeGreaterThan(0)
      expect(skills[0].harness).toBe('cline')
    })

    it('should get a specific skill', async () => {
      const skill = await adapter.getSkill('cline-instructions')
      expect(skill).not.toBeNull()
      expect(skill!.harness).toBe('cline')
    })

    it('should return null for non-existent skill', async () => {
      const skill = await adapter.getSkill('non-existent')
      expect(skill).toBeNull()
    })

    it('should create a new skill', async () => {
      const skill = await adapter.createSkill({
        name: 'Test',
        description: 'Test skill',
        category: 'custom',
        content: '# Test',
        harness: 'cline',
      })
      expect(skill.id).toBe('cline-test')
      expect(skill.content).toBe('# Test')
    })

    it('should update an existing skill', async () => {
      const updated = await adapter.updateSkill('cline-instructions', { description: 'Updated' })
      expect(updated.metadata.description).toBe('Updated')
    })

    it('should throw when updating non-existent skill', async () => {
      await expect(adapter.updateSkill('non-existent', {})).rejects.toThrow('Skill not found')
    })

    it('should delete a skill', async () => {
      await expect(adapter.deleteSkill('cline-instructions')).resolves.toBeUndefined()
    })

    it('should throw when deleting non-existent skill', async () => {
      await expect(adapter.deleteSkill('non-existent')).rejects.toThrow('Skill not found')
    })
  })

  describe('hooks', () => {
    it('should list hooks (empty for Cline)', async () => {
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
        harness: 'cline',
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
      expect(sessions[0].harness).toBe('cline')
    })

    it('should get a specific session', async () => {
      const session = await adapter.getSession('cline-task-001')
      expect(session).not.toBeNull()
      expect(session!.harness).toBe('cline')
    })

    it('should return null for non-existent session', async () => {
      const session = await adapter.getSession('non-existent')
      expect(session).toBeNull()
    })

    it('should delete a session', async () => {
      await expect(adapter.deleteSession('cline-task-001')).resolves.toBeUndefined()
    })

    it('should throw when deleting non-existent session', async () => {
      await expect(adapter.deleteSession('non-existent')).rejects.toThrow('Session not found')
    })
  })

  describe('memory', () => {
    it('should get memory stats', async () => {
      const stats = await adapter.getMemoryStats()
      expect(stats.totalEntries).toBeGreaterThan(0)
    })

    it('should list memory entries', async () => {
      const entries = await adapter.listMemoryEntries()
      expect(entries.length).toBeGreaterThan(0)
    })

    it('should get a specific memory entry', async () => {
      const entry = await adapter.getMemoryEntry('cline-mem-001')
      expect(entry).not.toBeNull()
    })

    it('should return null for non-existent memory entry', async () => {
      const entry = await adapter.getMemoryEntry('non-existent')
      expect(entry).toBeNull()
    })

    it('should delete a memory entry', async () => {
      await expect(adapter.deleteMemoryEntry('cline-mem-001')).resolves.toBeUndefined()
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
      expect(settings.harness).toBe('cline')
      expect(settings.settings.length).toBeGreaterThan(0)
    })

    it('should get a specific setting', async () => {
      const setting = await adapter.getSetting('model')
      expect(setting).not.toBeNull()
    })

    it('should return null for non-existent setting', async () => {
      const setting = await adapter.getSetting('non-existent')
      expect(setting).toBeNull()
    })

    it('should set a setting value', async () => {
      await expect(adapter.setSetting('model', 'gpt-4')).resolves.toBeUndefined()
    })
  })
})
