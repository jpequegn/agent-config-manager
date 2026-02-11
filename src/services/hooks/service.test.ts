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
