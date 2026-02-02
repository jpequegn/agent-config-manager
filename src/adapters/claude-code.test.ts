/**
 * Claude Code Adapter Tests
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { ClaudeCodeAdapter } from './claude-code'

describe('ClaudeCodeAdapter', () => {
  let adapter: ClaudeCodeAdapter

  beforeEach(() => {
    adapter = new ClaudeCodeAdapter()
  })

  describe('detection', () => {
    it('should have correct type and display name', () => {
      expect(adapter.type).toBe('claude-code')
      expect(adapter.displayName).toBe('Claude Code')
    })

    it('should detect Claude Code installation', async () => {
      const result = await adapter.detect()
      expect(result.type).toBe('claude-code')
      expect(result.detected).toBe(true)
      expect(result.status).toBe('active')
      expect(result.configPaths.settings).toBe('~/.claude/settings.json')
      expect(result.configPaths.skills).toBe('~/.claude/skills')
      expect(result.configPaths.projectConfig).toBe('CLAUDE.md')
    })

    it('should return full harness config', async () => {
      const config = await adapter.getConfig()
      expect(config.id).toBe('claude-code')
      expect(config.name).toBe('Claude Code')
      expect(config.type).toBe('claude-code')
      expect(config.brandColor).toBe('#D97757')
      expect(config.stats).toBeDefined()
    })
  })

  describe('skills', () => {
    it('should list skills', async () => {
      const skills = await adapter.listSkills()
      expect(skills.length).toBeGreaterThan(0)
      expect(skills[0].harness).toBe('claude-code')
      expect(skills[0].status).toBe('enabled')
    })

    it('should get a specific skill', async () => {
      const skill = await adapter.getSkill('core')
      expect(skill).not.toBeNull()
      expect(skill!.id).toBe('core')
      expect(skill!.metadata.name).toBe('CORE')
      expect(skill!.harness).toBe('claude-code')
    })

    it('should return null for non-existent skill', async () => {
      const skill = await adapter.getSkill('non-existent')
      expect(skill).toBeNull()
    })

    it('should create a new skill', async () => {
      const skill = await adapter.createSkill({
        name: 'Test Skill',
        description: 'A test skill',
        category: 'custom',
        content: '# Test Skill\n\nThis is a test.',
        harness: 'claude-code',
      })
      expect(skill.id).toBe('test-skill')
      expect(skill.metadata.name).toBe('Test Skill')
      expect(skill.status).toBe('enabled')
    })

    it('should update an existing skill', async () => {
      const updated = await adapter.updateSkill('core', {
        description: 'Updated description',
      })
      expect(updated.metadata.description).toBe('Updated description')
    })

    it('should throw when updating non-existent skill', async () => {
      await expect(adapter.updateSkill('non-existent', {})).rejects.toThrow('Skill not found')
    })

    it('should delete a skill', async () => {
      await expect(adapter.deleteSkill('core')).resolves.toBeUndefined()
    })

    it('should throw when deleting non-existent skill', async () => {
      await expect(adapter.deleteSkill('non-existent')).rejects.toThrow('Skill not found')
    })
  })

  describe('hooks', () => {
    it('should list hooks', async () => {
      const hooks = await adapter.listHooks()
      expect(hooks.length).toBeGreaterThan(0)
      expect(hooks[0].harness).toBe('claude-code')
    })

    it('should get a specific hook', async () => {
      const hook = await adapter.getHook('session-start-compact')
      expect(hook).not.toBeNull()
      expect(hook!.name).toBe('SessionStart:compact')
      expect(hook!.config.trigger).toBe('SessionStart')
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
        harness: 'claude-code',
      })
      expect(hook.id).toBe('test-hook')
      expect(hook.status).toBe('enabled')
    })

    it('should update an existing hook', async () => {
      const updated = await adapter.updateHook('session-start-compact', {
        description: 'Updated description',
      })
      expect(updated.description).toBe('Updated description')
    })

    it('should throw when updating non-existent hook', async () => {
      await expect(adapter.updateHook('non-existent', {})).rejects.toThrow('Hook not found')
    })

    it('should delete a hook', async () => {
      await expect(adapter.deleteHook('session-start-compact')).resolves.toBeUndefined()
    })

    it('should throw when deleting non-existent hook', async () => {
      await expect(adapter.deleteHook('non-existent')).rejects.toThrow('Hook not found')
    })
  })

  describe('sessions', () => {
    it('should list sessions', async () => {
      const sessions = await adapter.listSessions()
      expect(sessions.length).toBeGreaterThan(0)
      expect(sessions[0].harness).toBe('claude-code')
    })

    it('should filter sessions by project', async () => {
      const sessions = await adapter.listSessions({ project: 'agent-config-manager' })
      expect(sessions.every((s) => s.project === 'agent-config-manager')).toBe(true)
    })

    it('should filter sessions by search text', async () => {
      const sessions = await adapter.listSessions({ searchText: 'feature' })
      expect(sessions.some((s) => s.title.toLowerCase().includes('feature'))).toBe(true)
    })

    it('should get a specific session', async () => {
      const session = await adapter.getSession('session-001')
      expect(session).not.toBeNull()
      expect(session!.metadata.title).toBe('Implementing feature X')
      expect(session!.messages.length).toBeGreaterThan(0)
    })

    it('should return null for non-existent session', async () => {
      const session = await adapter.getSession('non-existent')
      expect(session).toBeNull()
    })

    it('should delete a session', async () => {
      await expect(adapter.deleteSession('session-001')).resolves.toBeUndefined()
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
      expect(entries[0].harness).toBe('claude-code')
    })

    it('should filter memory entries by type', async () => {
      const entries = await adapter.listMemoryEntries({ type: 'learning' })
      expect(entries.every((e) => e.type === 'learning')).toBe(true)
    })

    it('should limit memory entries', async () => {
      const entries = await adapter.listMemoryEntries({ limit: 1 })
      expect(entries.length).toBe(1)
    })

    it('should get a specific memory entry', async () => {
      const entry = await adapter.getMemoryEntry('mem-001')
      expect(entry).not.toBeNull()
      expect(entry!.content).toBeDefined()
    })

    it('should return null for non-existent memory entry', async () => {
      const entry = await adapter.getMemoryEntry('non-existent')
      expect(entry).toBeNull()
    })

    it('should delete a memory entry', async () => {
      await expect(adapter.deleteMemoryEntry('mem-001')).resolves.toBeUndefined()
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
      expect(settings.harness).toBe('claude-code')
      expect(settings.settings.length).toBeGreaterThan(0)
    })

    it('should get a specific setting', async () => {
      const setting = await adapter.getSetting('model')
      expect(setting).not.toBeNull()
      expect(setting!.key).toBe('model')
    })

    it('should return null for non-existent setting', async () => {
      const setting = await adapter.getSetting('non-existent')
      expect(setting).toBeNull()
    })

    it('should set a setting value', async () => {
      await expect(adapter.setSetting('theme', 'light')).resolves.toBeUndefined()
    })
  })
})
