/**
 * Hooks Service
 * Provides mock data for hook management: listing, toggling, reordering, bulk ops
 */

import type { HookTrigger, HookSummary, Hook, HookStatus } from '@/types'

/** Hook group by trigger */
export interface HookGroup {
  trigger: HookTrigger
  hooks: HookSummary[]
}

/** Bulk operation result */
export interface HookBulkResult {
  success: boolean
  affectedCount: number
  message: string
}

const MOCK_HOOKS: Hook[] = [
  {
    id: 'hook-1',
    name: 'Sensitive file guard',
    harness: 'claude-code',
    config: {
      trigger: 'PreToolUse',
      toolMatcher: 'Edit|Write',
      toolMatcherIsRegex: true,
      timeout: 5000,
    },
    scriptPath: '~/.claude/hooks/sensitive-guard.sh',
    scriptLanguage: 'bash',
    status: 'enabled',
    stats: {
      runCount: 342,
      allowCount: 318,
      blockCount: 24,
      errorCount: 0,
      lastRun: new Date(Date.now() - 60000 * 5),
      avgExecutionTime: 12,
    },
    description: 'Blocks edits to .env, credentials, and secret files',
    createdAt: new Date(Date.now() - 86400000 * 90),
    updatedAt: new Date(Date.now() - 86400000 * 3),
  },
  {
    id: 'hook-2',
    name: 'Lint on save',
    harness: 'claude-code',
    config: {
      trigger: 'PostToolUse',
      toolMatcher: 'Write',
      timeout: 30000,
    },
    scriptPath: '~/.claude/hooks/lint-on-save.sh',
    scriptLanguage: 'bash',
    status: 'enabled',
    stats: {
      runCount: 1247,
      allowCount: 1198,
      blockCount: 0,
      errorCount: 49,
      lastRun: new Date(Date.now() - 60000 * 2),
      avgExecutionTime: 850,
    },
    description: 'Runs ESLint/Prettier after file writes',
    createdAt: new Date(Date.now() - 86400000 * 60),
    updatedAt: new Date(Date.now() - 86400000),
  },
  {
    id: 'hook-3',
    name: 'Slack notification',
    harness: 'claude-code',
    config: {
      trigger: 'Notification',
      timeout: 10000,
    },
    scriptPath: '~/.claude/hooks/slack-notify.py',
    scriptLanguage: 'python',
    status: 'enabled',
    stats: {
      runCount: 89,
      allowCount: 89,
      blockCount: 0,
      errorCount: 0,
      lastRun: new Date(Date.now() - 3600000),
      avgExecutionTime: 200,
    },
    description: 'Sends important notifications to Slack',
    createdAt: new Date(Date.now() - 86400000 * 45),
    updatedAt: new Date(Date.now() - 86400000 * 10),
  },
  {
    id: 'hook-4',
    name: 'Session logger',
    harness: 'claude-code',
    config: {
      trigger: 'SessionStart',
      timeout: 5000,
    },
    scriptPath: '~/.claude/hooks/session-logger.sh',
    scriptLanguage: 'bash',
    status: 'enabled',
    stats: {
      runCount: 156,
      allowCount: 156,
      blockCount: 0,
      errorCount: 0,
      lastRun: new Date(Date.now() - 7200000),
      avgExecutionTime: 15,
    },
    description: 'Logs session start with timestamp and project',
    createdAt: new Date(Date.now() - 86400000 * 30),
    updatedAt: new Date(Date.now() - 86400000 * 5),
  },
  {
    id: 'hook-5',
    name: 'Session summary',
    harness: 'claude-code',
    config: {
      trigger: 'SessionEnd',
      timeout: 15000,
    },
    scriptPath: '~/.claude/hooks/session-summary.py',
    scriptLanguage: 'python',
    status: 'disabled',
    stats: {
      runCount: 42,
      allowCount: 42,
      blockCount: 0,
      errorCount: 0,
      lastRun: new Date(Date.now() - 86400000 * 7),
      avgExecutionTime: 1200,
    },
    description: 'Generates session summary on end',
    createdAt: new Date(Date.now() - 86400000 * 30),
    updatedAt: new Date(Date.now() - 86400000 * 7),
  },
  {
    id: 'hook-6',
    name: 'Cursor file watcher',
    harness: 'cursor',
    config: {
      trigger: 'PostToolUse',
      toolMatcher: '*',
      timeout: 5000,
    },
    scriptPath: '~/.cursor/hooks/file-watcher.sh',
    scriptLanguage: 'bash',
    status: 'enabled',
    stats: {
      runCount: 567,
      allowCount: 567,
      blockCount: 0,
      errorCount: 0,
      lastRun: new Date(Date.now() - 60000 * 30),
      avgExecutionTime: 8,
    },
    description: 'Watches for file changes and updates index',
    createdAt: new Date(Date.now() - 86400000 * 45),
    updatedAt: new Date(Date.now() - 86400000 * 2),
  },
  {
    id: 'hook-7',
    name: 'Pre-commit check',
    harness: 'claude-code',
    config: {
      trigger: 'PreCommit',
      timeout: 30000,
    },
    scriptPath: '~/.claude/hooks/pre-commit.sh',
    scriptLanguage: 'bash',
    status: 'enabled',
    stats: {
      runCount: 78,
      allowCount: 65,
      blockCount: 13,
      errorCount: 0,
      lastRun: new Date(Date.now() - 86400000),
      avgExecutionTime: 3500,
    },
    description: 'Runs tests and type checking before commits',
    createdAt: new Date(Date.now() - 86400000 * 20),
    updatedAt: new Date(Date.now() - 86400000),
  },
  {
    id: 'hook-8',
    name: 'Deploy notification',
    harness: 'copilot',
    config: {
      trigger: 'PostCommit',
      timeout: 10000,
    },
    scriptPath: '~/.config/copilot/hooks/deploy-notify.js',
    scriptLanguage: 'node',
    status: 'enabled',
    stats: {
      runCount: 34,
      allowCount: 34,
      blockCount: 0,
      errorCount: 0,
      lastRun: new Date(Date.now() - 86400000 * 2),
      avgExecutionTime: 450,
    },
    description: 'Sends deployment notification after commits',
    createdAt: new Date(Date.now() - 86400000 * 15),
    updatedAt: new Date(Date.now() - 86400000 * 2),
  },
  {
    id: 'hook-9',
    name: 'Dangerous command blocker',
    harness: 'claude-code',
    config: {
      trigger: 'PreToolUse',
      toolMatcher: 'Bash',
      timeout: 2000,
    },
    scriptPath: '~/.claude/hooks/danger-blocker.sh',
    scriptLanguage: 'bash',
    status: 'enabled',
    stats: {
      runCount: 891,
      allowCount: 874,
      blockCount: 17,
      errorCount: 0,
      lastRun: new Date(Date.now() - 60000 * 15),
      avgExecutionTime: 5,
    },
    description: 'Blocks rm -rf, force push, and other dangerous commands',
    createdAt: new Date(Date.now() - 86400000 * 80),
    updatedAt: new Date(Date.now() - 86400000 * 2),
  },
  {
    id: 'hook-10',
    name: 'Stop handler',
    harness: 'claude-code',
    config: {
      trigger: 'Stop',
      timeout: 5000,
    },
    scriptPath: '~/.claude/hooks/stop-handler.sh',
    scriptLanguage: 'bash',
    status: 'error',
    stats: {
      runCount: 23,
      allowCount: 18,
      blockCount: 0,
      errorCount: 5,
      lastRun: new Date(Date.now() - 86400000 * 3),
      lastError: 'Script not found',
      avgExecutionTime: 0,
    },
    description: 'Handles agent stop events',
    error: 'Script not found at path',
    createdAt: new Date(Date.now() - 86400000 * 10),
    updatedAt: new Date(Date.now() - 86400000 * 3),
  },
]

/**
 * List all hooks.
 */
export async function listHooks(): Promise<Hook[]> {
  await new Promise((resolve) => setTimeout(resolve, 200))
  return [...MOCK_HOOKS]
}

/**
 * Get hook summaries.
 */
export async function listHookSummaries(): Promise<HookSummary[]> {
  await new Promise((resolve) => setTimeout(resolve, 150))
  return MOCK_HOOKS.map((h) => ({
    id: h.id,
    name: h.name,
    harness: h.harness,
    trigger: h.config.trigger,
    toolMatcher: h.config.toolMatcher,
    status: h.status,
    runCount: h.stats.runCount,
    blockCount: h.stats.blockCount,
  }))
}

/**
 * Get hooks grouped by trigger type.
 */
export async function getHooksGroupedByTrigger(): Promise<HookGroup[]> {
  await new Promise((resolve) => setTimeout(resolve, 200))
  const triggers: HookTrigger[] = [
    'PreToolUse',
    'PostToolUse',
    'Notification',
    'Stop',
    'SessionStart',
    'SessionEnd',
    'PreCommit',
    'PostCommit',
  ]
  return triggers
    .map((trigger) => ({
      trigger,
      hooks: MOCK_HOOKS.filter((h) => h.config.trigger === trigger).map((h) => ({
        id: h.id,
        name: h.name,
        harness: h.harness,
        trigger: h.config.trigger,
        toolMatcher: h.config.toolMatcher,
        status: h.status,
        runCount: h.stats.runCount,
        blockCount: h.stats.blockCount,
      })),
    }))
    .filter((g) => g.hooks.length > 0)
}

/**
 * Get a single hook by ID.
 */
export async function getHook(id: string): Promise<Hook | null> {
  await new Promise((resolve) => setTimeout(resolve, 100))
  return MOCK_HOOKS.find((h) => h.id === id) ?? null
}

/**
 * Toggle a hook's enabled/disabled status.
 */
export async function toggleHookStatus(id: string): Promise<HookStatus | null> {
  await new Promise((resolve) => setTimeout(resolve, 100))
  const hook = MOCK_HOOKS.find((h) => h.id === id)
  if (!hook) return null
  hook.status = hook.status === 'enabled' ? 'disabled' : 'enabled'
  return hook.status
}

/**
 * Reorder hooks within a trigger group.
 */
export async function reorderHooks(trigger: HookTrigger, hookIds: string[]): Promise<boolean> {
  await new Promise((resolve) => setTimeout(resolve, 100))
  // In a real app, this would persist the new order
  void trigger
  void hookIds
  return true
}

/**
 * Bulk enable hooks.
 */
export async function bulkEnableHooks(ids: string[]): Promise<HookBulkResult> {
  await new Promise((resolve) => setTimeout(resolve, 200))
  let count = 0
  for (const id of ids) {
    const hook = MOCK_HOOKS.find((h) => h.id === id)
    if (hook && hook.status !== 'error') {
      hook.status = 'enabled'
      count++
    }
  }
  return { success: true, affectedCount: count, message: `Enabled ${count} hooks` }
}

/**
 * Bulk disable hooks.
 */
export async function bulkDisableHooks(ids: string[]): Promise<HookBulkResult> {
  await new Promise((resolve) => setTimeout(resolve, 200))
  let count = 0
  for (const id of ids) {
    const hook = MOCK_HOOKS.find((h) => h.id === id)
    if (hook) {
      hook.status = 'disabled'
      count++
    }
  }
  return { success: true, affectedCount: count, message: `Disabled ${count} hooks` }
}
