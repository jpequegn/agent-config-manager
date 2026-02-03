/**
 * Aider Adapter Tests
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { AiderAdapter } from './aider'

describe('AiderAdapter', () => {
  let adapter: AiderAdapter

  beforeEach(() => {
    adapter = new AiderAdapter()
  })

  describe('detection', () => {
    it('should have correct type and display name', () => {
      expect(adapter.type).toBe('aider')
      expect(adapter.displayName).toBe('Aider')
    })

    it('should detect Aider installation', async () => {
      const result = await adapter.detect()
      expect(result.type).toBe('aider')
      expect(result.detected).toBe(true)
      expect(result.status).toBe('active')
    })

    it('should return full harness config', async () => {
      const config = await adapter.getConfig()
      expect(config.id).toBe('aider')
      expect(config.name).toBe('Aider')
      expect(config.brandColor).toBe('#10B981')
    })
  })

  describe('skills', () => {
    it('should list skills (aider commands)', async () => {
      const skills = await adapter.listSkills()
      expect(skills.length).toBeGreaterThan(0)
      expect(skills[0].harness).toBe('aider')
    })

    it('should get a specific skill', async () => {
      const skill = await adapter.getSkill('aider-add')
      expect(skill).not.toBeNull()
      expect(skill!.metadata.name).toBe('/add')
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
        harness: 'aider',
      })
      expect(skill.id).toBe('aider--custom')
      expect(skill.content).toBe('# Custom')
    })

    it('should update an existing skill', async () => {
      const updated = await adapter.updateSkill('aider-add', { description: 'Updated' })
      expect(updated.metadata.description).toBe('Updated')
    })

    it('should throw when updating non-existent skill', async () => {
      await expect(adapter.updateSkill('non-existent', {})).rejects.toThrow('Skill not found')
    })

    it('should delete a skill', async () => {
      await expect(adapter.deleteSkill('aider-add')).resolves.toBeUndefined()
    })

    it('should throw when deleting non-existent skill', async () => {
      await expect(adapter.deleteSkill('non-existent')).rejects.toThrow('Skill not found')
    })
  })

  describe('hooks', () => {
    it('should list hooks (auto-commit, auto-lint)', async () => {
      const hooks = await adapter.listHooks()
      expect(hooks.length).toBeGreaterThan(0)
      expect(hooks[0].harness).toBe('aider')
    })

    it('should get a specific hook', async () => {
      const hook = await adapter.getHook('auto-commit')
      expect(hook).not.toBeNull()
      expect(hook!.name).toBe('Auto Commit')
    })

    it('should return null for non-existent hook', async () => {
      const hook = await adapter.getHook('non-existent')
      expect(hook).toBeNull()
    })

    it('should create a new hook', async () => {
      const hook = await adapter.createHook({
        name: 'Test Hook',
        description: 'A test hook',
        config: { trigger: 'PreToolUse' },
        scriptContent: 'echo test',
        scriptLanguage: 'bash',
        harness: 'aider',
      })
      expect(hook.id).toBe('test-hook')
      expect(hook.scriptContent).toBe('echo test')
    })

    it('should update an existing hook', async () => {
      const updated = await adapter.updateHook('auto-commit', { description: 'Updated' })
      expect(updated.description).toBe('Updated')
    })

    it('should throw when updating non-existent hook', async () => {
      await expect(adapter.updateHook('non-existent', {})).rejects.toThrow('Hook not found')
    })

    it('should delete a hook', async () => {
      await expect(adapter.deleteHook('auto-commit')).resolves.toBeUndefined()
    })

    it('should throw when deleting non-existent hook', async () => {
      await expect(adapter.deleteHook('non-existent')).rejects.toThrow('Hook not found')
    })
  })

  describe('sessions', () => {
    it('should list sessions', async () => {
      const sessions = await adapter.listSessions()
      expect(sessions.length).toBeGreaterThan(0)
      expect(sessions[0].harness).toBe('aider')
    })

    it('should get a specific session', async () => {
      const session = await adapter.getSession('aider-session-001')
      expect(session).not.toBeNull()
      expect(session!.harness).toBe('aider')
      expect(session!.messages.length).toBeGreaterThan(0)
    })

    it('should return null for non-existent session', async () => {
      const session = await adapter.getSession('non-existent')
      expect(session).toBeNull()
    })

    it('should delete a session', async () => {
      await expect(adapter.deleteSession('aider-session-001')).resolves.toBeUndefined()
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

    it('should filter by type', async () => {
      const entries = await adapter.listMemoryEntries({ type: 'session' })
      expect(entries.every((e) => e.type === 'session')).toBe(true)
    })

    it('should get a specific memory entry', async () => {
      const entry = await adapter.getMemoryEntry('aider-history-001')
      expect(entry).not.toBeNull()
    })

    it('should return null for non-existent memory entry', async () => {
      const entry = await adapter.getMemoryEntry('non-existent')
      expect(entry).toBeNull()
    })

    it('should delete a memory entry', async () => {
      await expect(adapter.deleteMemoryEntry('aider-history-001')).resolves.toBeUndefined()
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
      expect(settings.harness).toBe('aider')
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
      await expect(adapter.setSetting('auto-commits', false)).resolves.toBeUndefined()
    })
  })
})
