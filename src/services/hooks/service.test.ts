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
