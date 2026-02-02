/**
 * GitHub Copilot Adapter Tests
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { CopilotAdapter } from './copilot'

describe('CopilotAdapter', () => {
  let adapter: CopilotAdapter

  beforeEach(() => {
    adapter = new CopilotAdapter()
  })

  describe('detection', () => {
    it('should have correct type and display name', () => {
      expect(adapter.type).toBe('copilot')
      expect(adapter.displayName).toBe('GitHub Copilot')
    })

    it('should detect Copilot installation', async () => {
      const result = await adapter.detect()
      expect(result.type).toBe('copilot')
      expect(result.detected).toBe(true)
      expect(result.status).toBe('active')
      expect(result.configPaths.projectConfig).toBe('.github/copilot-instructions.md')
    })

    it('should return full harness config', async () => {
      const config = await adapter.getConfig()
      expect(config.id).toBe('copilot')
      expect(config.name).toBe('GitHub Copilot')
      expect(config.type).toBe('copilot')
      expect(config.brandColor).toBe('#000000')
      expect(config.stats).toBeDefined()
    })
  })

  describe('skills', () => {
    it('should list skills', async () => {
      const skills = await adapter.listSkills()
      expect(skills.length).toBeGreaterThan(0)
      expect(skills[0].harness).toBe('copilot')
      expect(skills[0].status).toBe('enabled')
    })

    it('should get a specific skill', async () => {
      const skill = await adapter.getSkill('instructions-project-main')
      expect(skill).not.toBeNull()
      expect(skill!.id).toBe('instructions-project-main')
      expect(skill!.harness).toBe('copilot')
    })

    it('should return null for non-existent skill', async () => {
      const skill = await adapter.getSkill('non-existent')
      expect(skill).toBeNull()
    })

    it('should create a new skill', async () => {
      const skill = await adapter.createSkill({
        name: 'Test Instructions',
        description: 'Test copilot instructions',
        category: 'custom',
        content: '# Instructions\n\nYou are a helpful assistant.',
        harness: 'copilot',
      })
      expect(skill.id).toBe('instructions-test-instructions')
      expect(skill.status).toBe('enabled')
    })

    it('should update an existing skill', async () => {
      const updated = await adapter.updateSkill('instructions-project-main', {
        description: 'Updated description',
      })
      expect(updated.metadata.description).toBe('Updated description')
    })

    it('should throw when updating non-existent skill', async () => {
      await expect(adapter.updateSkill('non-existent', {})).rejects.toThrow('Skill not found')
    })

    it('should delete a skill', async () => {
      await expect(adapter.deleteSkill('instructions-project-main')).resolves.toBeUndefined()
    })

    it('should throw when deleting non-existent skill', async () => {
      await expect(adapter.deleteSkill('non-existent')).rejects.toThrow('Skill not found')
    })
  })

  describe('hooks', () => {
    it('should list hooks', async () => {
      const hooks = await adapter.listHooks()
      expect(hooks.length).toBeGreaterThan(0)
      expect(hooks[0].harness).toBe('copilot')
    })

    it('should get a specific hook', async () => {
      const hook = await adapter.getHook('copilot-review')
      expect(hook).not.toBeNull()
      expect(hook!.name).toBe('Copilot Code Review')
      expect(hook!.config.trigger).toBe('PreCommit')
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
        scriptContent: '#!/bin/bash\necho "test"',
        scriptLanguage: 'bash',
        harness: 'copilot',
      })
      expect(hook.id).toBe('test-hook')
      expect(hook.status).toBe('enabled')
    })

    it('should update an existing hook', async () => {
      const updated = await adapter.updateHook('copilot-review', {
        description: 'Updated description',
      })
      expect(updated.description).toBe('Updated description')
    })

    it('should throw when updating non-existent hook', async () => {
      await expect(adapter.updateHook('non-existent', {})).rejects.toThrow('Hook not found')
    })

    it('should delete a hook', async () => {
      await expect(adapter.deleteHook('copilot-review')).resolves.toBeUndefined()
    })

    it('should throw when deleting non-existent hook', async () => {
      await expect(adapter.deleteHook('non-existent')).rejects.toThrow('Hook not found')
    })
  })

  describe('sessions', () => {
    it('should list sessions', async () => {
      const sessions = await adapter.listSessions()
      expect(sessions.length).toBeGreaterThan(0)
      expect(sessions[0].harness).toBe('copilot')
    })

    it('should filter sessions by project', async () => {
      const sessions = await adapter.listSessions({ project: 'my-project' })
      expect(sessions.every((s) => s.project === 'my-project')).toBe(true)
    })

    it('should filter sessions by search text', async () => {
      const sessions = await adapter.listSessions({ searchText: 'review' })
      expect(sessions.some((s) => s.title.toLowerCase().includes('review'))).toBe(true)
    })

    it('should get a specific session', async () => {
      const session = await adapter.getSession('copilot-chat-001')
      expect(session).not.toBeNull()
      expect(session!.metadata.title).toBe('Code review assistance')
      expect(session!.messages.length).toBeGreaterThan(0)
    })

    it('should return null for non-existent session', async () => {
      const session = await adapter.getSession('non-existent')
      expect(session).toBeNull()
    })

    it('should delete a session', async () => {
      await expect(adapter.deleteSession('copilot-chat-001')).resolves.toBeUndefined()
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
      expect(entries[0].harness).toBe('copilot')
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
      const entry = await adapter.getMemoryEntry('copilot-mem-001')
      expect(entry).not.toBeNull()
      expect(entry!.content).toBeDefined()
    })

    it('should return null for non-existent memory entry', async () => {
      const entry = await adapter.getMemoryEntry('non-existent')
      expect(entry).toBeNull()
    })

    it('should delete a memory entry', async () => {
      await expect(adapter.deleteMemoryEntry('copilot-mem-001')).resolves.toBeUndefined()
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
      expect(settings.harness).toBe('copilot')
      expect(settings.settings.length).toBeGreaterThan(0)
    })

    it('should get a specific setting', async () => {
      const setting = await adapter.getSetting('github.copilot.enable')
      expect(setting).not.toBeNull()
      expect(setting!.key).toBe('github.copilot.enable')
    })

    it('should return null for non-existent setting', async () => {
      const setting = await adapter.getSetting('non-existent')
      expect(setting).toBeNull()
    })

    it('should set a setting value', async () => {
      await expect(
        adapter.setSetting('github.copilot.editor.enableAutoCompletions', false)
      ).resolves.toBeUndefined()
    })
  })
})
