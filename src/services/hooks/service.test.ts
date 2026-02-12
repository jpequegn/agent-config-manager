/**
 * Hooks Service Tests
 */

import { describe, it, expect } from 'vitest'
import {
  listHooks,
  listHookSummaries,
  getHooksGroupedByTrigger,
  getHook,
  toggleHookStatus,
  reorderHooks,
  bulkEnableHooks,
  bulkDisableHooks,
  detectScriptLanguage,
  getMonacoLanguage,
  validateHookConfig,
  saveHook,
  getHookLogs,
  clearHookLogs,
  getHookExecutionStats,
  runHookTest,
  listTemplates,
  getTemplatesByCategory,
  getTemplate,
} from './service'

describe('Hooks Service', () => {
  it('should list all hooks', async () => {
    const hooks = await listHooks()
    expect(hooks.length).toBeGreaterThanOrEqual(10)
    expect(hooks[0]).toHaveProperty('id')
    expect(hooks[0]).toHaveProperty('config')
    expect(hooks[0]).toHaveProperty('stats')
  })

  it('should list hook summaries', async () => {
    const summaries = await listHookSummaries()
    expect(summaries.length).toBeGreaterThanOrEqual(10)
    expect(summaries[0]).toHaveProperty('trigger')
    expect(summaries[0]).toHaveProperty('runCount')
  })

  it('should group hooks by trigger', async () => {
    const groups = await getHooksGroupedByTrigger()
    expect(groups.length).toBeGreaterThan(0)
    for (const group of groups) {
      expect(group.hooks.length).toBeGreaterThan(0)
      expect(group.hooks.every((h) => h.trigger === group.trigger)).toBe(true)
    }
  })

  it('should get a single hook by ID', async () => {
    const hook = await getHook('hook-1')
    expect(hook).not.toBeNull()
    expect(hook!.name).toBe('Sensitive file guard')
  })

  it('should return null for unknown hook ID', async () => {
    const hook = await getHook('nonexistent')
    expect(hook).toBeNull()
  })

  it('should toggle hook status', async () => {
    const hook = await getHook('hook-5')
    const originalStatus = hook!.status
    const newStatus = await toggleHookStatus('hook-5')
    expect(newStatus).not.toBe(originalStatus)
    // Restore
    await toggleHookStatus('hook-5')
  })

  it('should return null when toggling unknown hook', async () => {
    const result = await toggleHookStatus('nonexistent')
    expect(result).toBeNull()
  })

  it('should reorder hooks', async () => {
    const result = await reorderHooks('PreToolUse', ['hook-9', 'hook-1'])
    expect(result).toBe(true)
  })

  it('should bulk enable hooks', async () => {
    const result = await bulkEnableHooks(['hook-5'])
    expect(result.success).toBe(true)
    expect(result.affectedCount).toBe(1)
    // Restore
    await toggleHookStatus('hook-5')
  })

  it('should bulk disable hooks', async () => {
    const result = await bulkDisableHooks(['hook-1', 'hook-2'])
    expect(result.success).toBe(true)
    expect(result.affectedCount).toBe(2)
    // Restore
    await toggleHookStatus('hook-1')
    await toggleHookStatus('hook-2')
  })
})

describe('detectScriptLanguage', () => {
  it('should detect bash from extension', () => {
    expect(detectScriptLanguage('script.sh')).toBe('bash')
    expect(detectScriptLanguage('script.bash')).toBe('bash')
    expect(detectScriptLanguage('script.zsh')).toBe('bash')
  })

  it('should detect python from extension', () => {
    expect(detectScriptLanguage('script.py')).toBe('python')
  })

  it('should detect node from extension', () => {
    expect(detectScriptLanguage('script.js')).toBe('node')
    expect(detectScriptLanguage('script.ts')).toBe('node')
    expect(detectScriptLanguage('script.mjs')).toBe('node')
  })

  it('should detect language from shebang', () => {
    expect(detectScriptLanguage('script', '#!/bin/bash\necho hi')).toBe('bash')
    expect(detectScriptLanguage('script', '#!/usr/bin/env python3\nprint("hi")')).toBe('python')
    expect(detectScriptLanguage('script', '#!/usr/bin/env node\nconsole.log("hi")')).toBe('node')
  })

  it('should return unknown for unrecognized files', () => {
    expect(detectScriptLanguage('script')).toBe('unknown')
    expect(detectScriptLanguage('script.xyz')).toBe('unknown')
  })
})

describe('getMonacoLanguage', () => {
  it('should map script languages to Monaco IDs', () => {
    expect(getMonacoLanguage('bash')).toBe('shell')
    expect(getMonacoLanguage('python')).toBe('python')
    expect(getMonacoLanguage('node')).toBe('javascript')
    expect(getMonacoLanguage('unknown')).toBe('plaintext')
  })

  it('should return plaintext for unmapped languages', () => {
    expect(getMonacoLanguage('ruby')).toBe('plaintext')
  })
})

describe('validateHookConfig', () => {
  it('should pass for valid config', () => {
    const result = validateHookConfig({
      name: 'Test hook',
      config: { trigger: 'PreToolUse' },
      scriptContent: '#!/bin/bash\nexit 0',
      harness: 'claude-code',
    })
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('should require name', () => {
    const result = validateHookConfig({
      config: { trigger: 'PreToolUse' },
      scriptContent: 'exit 0',
      harness: 'claude-code',
    })
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Name is required')
  })

  it('should require trigger', () => {
    const result = validateHookConfig({
      name: 'Test',
      scriptContent: 'exit 0',
      harness: 'claude-code',
    })
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Trigger type is required')
  })

  it('should require script content', () => {
    const result = validateHookConfig({
      name: 'Test',
      config: { trigger: 'PreToolUse' },
      harness: 'claude-code',
    })
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Script content is required')
  })

  it('should require harness', () => {
    const result = validateHookConfig({
      name: 'Test',
      config: { trigger: 'PreToolUse' },
      scriptContent: 'exit 0',
    })
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Harness is required')
  })

  it('should reject negative timeout', () => {
    const result = validateHookConfig({
      name: 'Test',
      config: { trigger: 'PreToolUse', timeout: -1 },
      scriptContent: 'exit 0',
      harness: 'claude-code',
    })
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Timeout must be positive')
  })
})

describe('saveHook', () => {
  it('should create a new hook', async () => {
    const hook = await saveHook({
      name: 'New test hook',
      config: { trigger: 'PreToolUse' },
      scriptContent: '#!/bin/bash\nexit 0',
      scriptLanguage: 'bash',
      harness: 'claude-code',
    })
    expect(hook.id).toBeTruthy()
    expect(hook.name).toBe('New test hook')
    expect(hook.status).toBe('enabled')
    expect(hook.stats.runCount).toBe(0)
  })

  it('should update an existing hook', async () => {
    const hook = await saveHook(
      {
        name: 'Updated name',
        config: { trigger: 'PostToolUse' },
        scriptContent: '#!/bin/bash\nexit 0',
        scriptLanguage: 'bash',
        harness: 'cursor',
      },
      'hook-1'
    )
    expect(hook.id).toBe('hook-1')
    expect(hook.name).toBe('Updated name')
    expect(hook.harness).toBe('cursor')
    // Restore
    hook.name = 'Sensitive file guard'
    hook.harness = 'claude-code'
    hook.config = {
      trigger: 'PreToolUse',
      toolMatcher: 'Edit|Write',
      toolMatcherIsRegex: true,
      timeout: 5000,
    }
  })

  it('should create new hook when existingId not found', async () => {
    const hook = await saveHook(
      {
        name: 'Fallback hook',
        config: { trigger: 'Stop' },
        scriptContent: 'exit 0',
        scriptLanguage: 'bash',
        harness: 'claude-code',
      },
      'nonexistent-id'
    )
    expect(hook.id).not.toBe('nonexistent-id')
    expect(hook.name).toBe('Fallback hook')
  })
})

describe('getHookLogs', () => {
  it('should return logs for a hook', async () => {
    const logs = await getHookLogs('hook-1')
    expect(logs.length).toBeGreaterThan(0)
    expect(logs[0]).toHaveProperty('id')
    expect(logs[0]).toHaveProperty('hookId')
    expect(logs[0]).toHaveProperty('result')
    expect(logs[0]).toHaveProperty('duration')
  })

  it('should filter logs by result', async () => {
    const logs = await getHookLogs('hook-1', 'allow')
    for (const log of logs) {
      expect(log.result).toBe('allow')
    }
  })

  it('should return sorted by timestamp descending', async () => {
    const logs = await getHookLogs('hook-1')
    for (let i = 1; i < logs.length; i++) {
      expect(logs[i - 1].timestamp.getTime()).toBeGreaterThanOrEqual(logs[i].timestamp.getTime())
    }
  })
})

describe('clearHookLogs', () => {
  it('should clear logs for a hook', async () => {
    // Ensure logs exist
    await getHookLogs('hook-2')
    const result = await clearHookLogs('hook-2')
    expect(result).toBe(true)
    const logs = await getHookLogs('hook-2')
    expect(logs).toHaveLength(0)
  })
})

describe('getHookExecutionStats', () => {
  it('should return execution stats', async () => {
    const stats = await getHookExecutionStats('hook-1')
    expect(stats.totalRuns).toBeGreaterThan(0)
    expect(stats.allowCount + stats.blockCount + stats.errorCount + stats.skipCount).toBe(
      stats.totalRuns
    )
    expect(stats.avgDuration).toBeGreaterThanOrEqual(0)
    expect(stats.maxDuration).toBeGreaterThanOrEqual(0)
    expect(stats.recentResults).toHaveLength(7)
  })

  it('should have daily breakdowns in recent results', async () => {
    const stats = await getHookExecutionStats('hook-1')
    for (const day of stats.recentResults) {
      expect(day).toHaveProperty('date')
      expect(day).toHaveProperty('allow')
      expect(day).toHaveProperty('block')
      expect(day).toHaveProperty('error')
    }
  })
})

describe('runHookTest', () => {
  it('should return a test result', async () => {
    const result = await runHookTest('hook-1', '{"tool":"Edit"}')
    expect(result).toHaveProperty('result')
    expect(result).toHaveProperty('duration')
    expect(result).toHaveProperty('output')
    expect(result).toHaveProperty('exitCode')
    expect(['allow', 'block', 'error']).toContain(result.result)
  })

  it('should return error for unknown hook', async () => {
    const result = await runHookTest('nonexistent', '{}')
    expect(result.result).toBe('error')
    expect(result.output).toContain('Hook not found')
  })

  it('should add log entry after test', async () => {
    await clearHookLogs('hook-3')
    await runHookTest('hook-3', '{"tool":"Read"}')
    const logs = await getHookLogs('hook-3')
    expect(logs.length).toBeGreaterThan(0)
    expect(logs[0].input).toBe('{"tool":"Read"}')
  })
})

describe('listTemplates', () => {
  it('should return built-in templates', async () => {
    const templates = await listTemplates()
    expect(templates.length).toBeGreaterThanOrEqual(7)
    expect(templates[0]).toHaveProperty('id')
    expect(templates[0]).toHaveProperty('name')
    expect(templates[0]).toHaveProperty('category')
    expect(templates[0]).toHaveProperty('scriptTemplate')
  })
})

describe('getTemplatesByCategory', () => {
  it('should group templates by category', async () => {
    const groups = await getTemplatesByCategory()
    expect(groups.length).toBeGreaterThan(0)
    for (const group of groups) {
      expect(group.category).toHaveProperty('id')
      expect(group.category).toHaveProperty('label')
      expect(group.templates.length).toBeGreaterThan(0)
      for (const tpl of group.templates) {
        expect(tpl.category).toBe(group.category.id)
      }
    }
  })

  it('should include security, logging, and notifications categories', async () => {
    const groups = await getTemplatesByCategory()
    const ids = groups.map((g) => g.category.id)
    expect(ids).toContain('security')
    expect(ids).toContain('logging')
    expect(ids).toContain('notifications')
  })
})

describe('getTemplate', () => {
  it('should return a template by ID', async () => {
    const tpl = await getTemplate('tpl-secret-scanner')
    expect(tpl).not.toBeNull()
    expect(tpl!.name).toBe('Secret Scanner')
    expect(tpl!.category).toBe('security')
  })

  it('should return null for unknown template ID', async () => {
    const tpl = await getTemplate('nonexistent')
    expect(tpl).toBeNull()
  })
})
