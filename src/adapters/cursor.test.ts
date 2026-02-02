/**
 * Cursor Adapter Tests
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { CursorAdapter } from './cursor'

describe('CursorAdapter', () => {
  let adapter: CursorAdapter

  beforeEach(() => {
    adapter = new CursorAdapter()
  })

  describe('detection', () => {
    it('should have correct type and display name', () => {
      expect(adapter.type).toBe('cursor')
      expect(adapter.displayName).toBe('Cursor')
    })

    it('should detect Cursor installation', async () => {
      const result = await adapter.detect()
      expect(result.type).toBe('cursor')
      expect(result.detected).toBe(true)
      expect(result.status).toBe('active')
      expect(result.configPaths.settings).toBe('~/.cursor/settings.json')
      expect(result.configPaths.projectConfig).toBe('.cursorrules')
    })

    it('should return full harness config', async () => {
      const config = await adapter.getConfig()
      expect(config.id).toBe('cursor')
      expect(config.name).toBe('Cursor')
      expect(config.type).toBe('cursor')
      expect(config.brandColor).toBe('#00D1FF')
      expect(config.stats).toBeDefined()
    })
  })

  describe('skills', () => {
    it('should list skills', async () => {
      const skills = await adapter.listSkills()
      expect(skills.length).toBeGreaterThan(0)
      expect(skills[0].harness).toBe('cursor')
      expect(skills[0].status).toBe('enabled')
    })

    it('should get a specific skill', async () => {
      const skill = await adapter.getSkill('cursorrules-default')
      expect(skill).not.toBeNull()
      expect(skill!.id).toBe('cursorrules-default')
      expect(skill!.harness).toBe('cursor')
    })

    it('should return null for non-existent skill', async () => {
      const skill = await adapter.getSkill('non-existent')
      expect(skill).toBeNull()
    })

    it('should create a new skill', async () => {
      const skill = await adapter.createSkill({
        name: 'Test Project',
        description: 'Test project rules',
        category: 'custom',
        content: '# Test Rules\n\nYou are a helpful assistant.',
        harness: 'cursor',
      })
      expect(skill.id).toBe('cursorrules-test-project')
      expect(skill.status).toBe('enabled')
    })

    it('should update an existing skill', async () => {
      const updated = await adapter.updateSkill('cursorrules-default', {
        description: 'Updated description',
      })
      expect(updated.metadata.description).toBe('Updated description')
    })

    it('should throw when updating non-existent skill', async () => {
      await expect(adapter.updateSkill('non-existent', {})).rejects.toThrow('Skill not found')
    })

    it('should delete a skill', async () => {
      await expect(adapter.deleteSkill('cursorrules-default')).resolves.toBeUndefined()
    })

    it('should throw when deleting non-existent skill', async () => {
      await expect(adapter.deleteSkill('non-existent')).rejects.toThrow('Skill not found')
    })
  })

  describe('hooks', () => {
    it('should list hooks', async () => {
      const hooks = await adapter.listHooks()
      expect(hooks.length).toBeGreaterThan(0)
      expect(hooks[0].harness).toBe('cursor')
    })

    it('should get a specific hook', async () => {
      const hook = await adapter.getHook('format-on-save')
      expect(hook).not.toBeNull()
      expect(hook!.name).toBe('Format on Save')
      expect(hook!.config.trigger).toBe('PostToolUse')
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
        scriptContent: 'console.log("test")',
        scriptLanguage: 'node',
        harness: 'cursor',
      })
      expect(hook.id).toBe('test-hook')
      expect(hook.status).toBe('enabled')
    })

    it('should update an existing hook', async () => {
      const updated = await adapter.updateHook('format-on-save', {
        description: 'Updated description',
      })
      expect(updated.description).toBe('Updated description')
    })

    it('should throw when updating non-existent hook', async () => {
      await expect(adapter.updateHook('non-existent', {})).rejects.toThrow('Hook not found')
    })

    it('should delete a hook', async () => {
      await expect(adapter.deleteHook('format-on-save')).resolves.toBeUndefined()
    })

    it('should throw when deleting non-existent hook', async () => {
      await expect(adapter.deleteHook('non-existent')).rejects.toThrow('Hook not found')
    })
  })

  describe('sessions', () => {
    it('should list sessions', async () => {
      const sessions = await adapter.listSessions()
      expect(sessions.length).toBeGreaterThan(0)
      expect(sessions[0].harness).toBe('cursor')
    })

    it('should filter sessions by project', async () => {
      const sessions = await adapter.listSessions({ project: 'my-app' })
      expect(sessions.every((s) => s.project === 'my-app')).toBe(true)
    })

    it('should filter sessions by search text', async () => {
      const sessions = await adapter.listSessions({ searchText: 'refactor' })
      expect(sessions.some((s) => s.title.toLowerCase().includes('refactor'))).toBe(true)
    })

    it('should get a specific session', async () => {
      const session = await adapter.getSession('cursor-session-001')
      expect(session).not.toBeNull()
      expect(session!.metadata.title).toBe('Refactoring auth module')
      expect(session!.messages.length).toBeGreaterThan(0)
    })

    it('should return null for non-existent session', async () => {
      const session = await adapter.getSession('non-existent')
      expect(session).toBeNull()
    })

    it('should delete a session', async () => {
      await expect(adapter.deleteSession('cursor-session-001')).resolves.toBeUndefined()
    })

    it('should throw when deleting non-existent session', async () => {
      await expect(adapter.deleteSession('non-existent')).rejects.toThrow('Session not found')
    })
  })

  describe('memory', () => {
    it('should get memory stats', async () => {
      const stats = await adapter.getMemoryStats()
      expect(stats.totalEntries).toBeGreaterThan(0)
      expect(stats.totalSize).toBeGreaterThan(0)
      expect(stats.byType.length).toBeGreaterThan(0)
      expect(stats.storageLocations.length).toBeGreaterThan(0)
    })

    it('should list memory entries', async () => {
      const entries = await adapter.listMemoryEntries()
      expect(entries.length).toBeGreaterThan(0)
      expect(entries[0].harness).toBe('cursor')
    })

    it('should filter memory entries by type', async () => {
      const entries = await adapter.listMemoryEntries({ type: 'session' })
      expect(entries.every((e) => e.type === 'session')).toBe(true)
    })

    it('should limit memory entries', async () => {
      const entries = await adapter.listMemoryEntries({ limit: 1 })
      expect(entries.length).toBe(1)
    })

    it('should get a specific memory entry', async () => {
      const entry = await adapter.getMemoryEntry('cursor-mem-001')
      expect(entry).not.toBeNull()
      expect(entry!.content).toBeDefined()
    })

    it('should return null for non-existent memory entry', async () => {
      const entry = await adapter.getMemoryEntry('non-existent')
      expect(entry).toBeNull()
    })

    it('should delete a memory entry', async () => {
      await expect(adapter.deleteMemoryEntry('cursor-mem-001')).resolves.toBeUndefined()
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
      expect(settings.harness).toBe('cursor')
      expect(settings.settings.length).toBeGreaterThan(0)
    })

    it('should get a specific setting', async () => {
      const setting = await adapter.getSetting('cursor.general.model')
      expect(setting).not.toBeNull()
      expect(setting!.key).toBe('cursor.general.model')
    })

    it('should return null for non-existent setting', async () => {
      const setting = await adapter.getSetting('non-existent')
      expect(setting).toBeNull()
    })

    it('should set a setting value', async () => {
      await expect(adapter.setSetting('editor.fontSize', 16)).resolves.toBeUndefined()
    })
  })
})
