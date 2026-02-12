/**
 * Hooks Service
 * Provides mock data for hook management: listing, toggling, reordering, bulk ops
 */

import type {
  HookTrigger,
  HookSummary,
  Hook,
  HookStatus,
  HookResult,
  HookLogEntry,
  HookTemplate,
  CreateHookOptions,
} from '@/types'
import { generateId } from '@/lib/utils'

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

/** Language to Monaco language ID mapping */
const LANGUAGE_MAP: Record<string, string> = {
  bash: 'shell',
  python: 'python',
  node: 'javascript',
  unknown: 'plaintext',
}

/**
 * Detect script language from file extension or shebang.
 */
export function detectScriptLanguage(
  filename: string,
  content?: string
): 'bash' | 'python' | 'node' | 'unknown' {
  const ext = filename.split('.').pop()?.toLowerCase()
  if (ext === 'sh' || ext === 'bash' || ext === 'zsh') return 'bash'
  if (ext === 'py') return 'python'
  if (ext === 'js' || ext === 'ts' || ext === 'mjs') return 'node'

  if (content) {
    const firstLine = content.split('\n')[0]
    if (firstLine.includes('bash') || firstLine.includes('sh')) return 'bash'
    if (firstLine.includes('python')) return 'python'
    if (firstLine.includes('node')) return 'node'
  }

  return 'unknown'
}

/**
 * Get Monaco editor language ID for a script language.
 */
export function getMonacoLanguage(lang: string): string {
  return LANGUAGE_MAP[lang] ?? 'plaintext'
}

/** Validation result for hook config */
export interface HookValidationResult {
  valid: boolean
  errors: string[]
}

/**
 * Validate hook configuration.
 */
export function validateHookConfig(options: Partial<CreateHookOptions>): HookValidationResult {
  const errors: string[] = []
  if (!options.name?.trim()) errors.push('Name is required')
  if (!options.config?.trigger) errors.push('Trigger type is required')
  if (!options.scriptContent?.trim()) errors.push('Script content is required')
  if (!options.harness) errors.push('Harness is required')
  if (options.config?.timeout != null && options.config.timeout < 0) {
    errors.push('Timeout must be positive')
  }
  return { valid: errors.length === 0, errors }
}

/**
 * Save a hook (create or update).
 */
export async function saveHook(options: CreateHookOptions, existingId?: string): Promise<Hook> {
  await new Promise((resolve) => setTimeout(resolve, 300))

  const now = new Date()
  if (existingId) {
    const existing = MOCK_HOOKS.find((h) => h.id === existingId)
    if (existing) {
      existing.name = options.name
      existing.description = options.description
      existing.config = options.config
      existing.scriptContent = options.scriptContent
      existing.scriptLanguage = options.scriptLanguage
      existing.harness = options.harness
      existing.updatedAt = now
      return existing
    }
  }

  const newHook: Hook = {
    id: generateId('hook'),
    name: options.name,
    harness: options.harness,
    config: options.config,
    scriptPath: `~/.claude/hooks/${options.name.toLowerCase().replace(/\s+/g, '-')}.${options.scriptLanguage === 'python' ? 'py' : options.scriptLanguage === 'node' ? 'js' : 'sh'}`,
    scriptContent: options.scriptContent,
    scriptLanguage: options.scriptLanguage,
    status: 'enabled',
    stats: { runCount: 0, allowCount: 0, blockCount: 0, errorCount: 0 },
    description: options.description,
    createdAt: now,
    updatedAt: now,
  }
  MOCK_HOOKS.push(newHook)
  return newHook
}

// --- Hook Logs & Testing ---

const TOOL_NAMES = ['Edit', 'Write', 'Read', 'Bash', 'Glob', 'Grep', 'WebFetch']

function randomResult(): HookResult {
  const r = Math.random()
  if (r < 0.7) return 'allow'
  if (r < 0.85) return 'block'
  if (r < 0.95) return 'error'
  return 'skip'
}

function generateMockLogs(hookId: string, count: number): HookLogEntry[] {
  const hook = MOCK_HOOKS.find((h) => h.id === hookId)
  const entries: HookLogEntry[] = []
  for (let i = 0; i < count; i++) {
    const result = randomResult()
    const timestamp = new Date(Date.now() - Math.random() * 86400000 * 7)
    const duration = Math.floor(Math.random() * 2000) + 5
    entries.push({
      id: generateId('log'),
      hookId,
      timestamp,
      duration,
      result,
      input: JSON.stringify({
        tool: TOOL_NAMES[Math.floor(Math.random() * TOOL_NAMES.length)],
        args: { file_path: '/src/example.ts' },
      }),
      output:
        result === 'allow' ? 'OK' : result === 'block' ? 'Blocked: sensitive file' : undefined,
      error: result === 'error' ? 'Script timed out after 5000ms' : undefined,
      triggeringTool:
        hook?.config.trigger === 'PreToolUse' || hook?.config.trigger === 'PostToolUse'
          ? TOOL_NAMES[Math.floor(Math.random() * TOOL_NAMES.length)]
          : undefined,
    })
  }
  return entries.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
}

const logsCache = new Map<string, HookLogEntry[]>()

/**
 * Get execution logs for a hook.
 */
export async function getHookLogs(
  hookId: string,
  filter?: HookResult | null
): Promise<HookLogEntry[]> {
  await new Promise((resolve) => setTimeout(resolve, 200))
  if (!logsCache.has(hookId)) {
    logsCache.set(hookId, generateMockLogs(hookId, 50))
  }
  const logs = logsCache.get(hookId)!
  return filter ? logs.filter((l) => l.result === filter) : logs
}

/**
 * Clear execution logs for a hook.
 */
export async function clearHookLogs(hookId: string): Promise<boolean> {
  await new Promise((resolve) => setTimeout(resolve, 100))
  logsCache.set(hookId, [])
  return true
}

/** Execution stats for a hook */
export interface HookExecutionStats {
  totalRuns: number
  allowCount: number
  blockCount: number
  errorCount: number
  skipCount: number
  avgDuration: number
  maxDuration: number
  recentResults: { date: string; allow: number; block: number; error: number }[]
}

/**
 * Get execution statistics for a hook.
 */
export async function getHookExecutionStats(hookId: string): Promise<HookExecutionStats> {
  await new Promise((resolve) => setTimeout(resolve, 150))
  const logs = logsCache.has(hookId) ? logsCache.get(hookId)! : generateMockLogs(hookId, 50)
  if (!logsCache.has(hookId)) logsCache.set(hookId, logs)

  const totalRuns = logs.length
  const allowCount = logs.filter((l) => l.result === 'allow').length
  const blockCount = logs.filter((l) => l.result === 'block').length
  const errorCount = logs.filter((l) => l.result === 'error').length
  const skipCount = logs.filter((l) => l.result === 'skip').length
  const durations = logs.map((l) => l.duration)
  const avgDuration =
    totalRuns > 0 ? Math.round(durations.reduce((a, b) => a + b, 0) / totalRuns) : 0
  const maxDuration = totalRuns > 0 ? Math.max(...durations) : 0

  // Group by day for recent results (last 7 days)
  const dayMap = new Map<string, { allow: number; block: number; error: number }>()
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000)
    const key = d.toISOString().split('T')[0]
    dayMap.set(key, { allow: 0, block: 0, error: 0 })
  }
  for (const log of logs) {
    const key = log.timestamp.toISOString().split('T')[0]
    const entry = dayMap.get(key)
    if (entry) {
      if (log.result === 'allow') entry.allow++
      else if (log.result === 'block') entry.block++
      else if (log.result === 'error') entry.error++
    }
  }
  const recentResults = [...dayMap.entries()].map(([date, counts]) => ({ date, ...counts }))

  return {
    totalRuns,
    allowCount,
    blockCount,
    errorCount,
    skipCount,
    avgDuration,
    maxDuration,
    recentResults,
  }
}

/** Test run result */
export interface HookTestResult {
  result: HookResult
  duration: number
  output: string
  exitCode: number
}

/**
 * Run a test execution of a hook with sample input.
 */
export async function runHookTest(hookId: string, sampleInput: string): Promise<HookTestResult> {
  await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 1000))
  const hook = MOCK_HOOKS.find((h) => h.id === hookId)
  if (!hook) {
    return { result: 'error', duration: 0, output: 'Hook not found', exitCode: 1 }
  }

  const duration = Math.floor(Math.random() * 500) + 10
  const r = Math.random()
  let result: HookResult
  let exitCode: number
  let output: string

  if (r < 0.6) {
    result = 'allow'
    exitCode = 0
    output = `Hook "${hook.name}" executed successfully.\nInput processed: ${sampleInput.slice(0, 100)}\nResult: ALLOW`
  } else if (r < 0.85) {
    result = 'block'
    exitCode = 2
    output = `Hook "${hook.name}" blocked the operation.\nReason: Input matched blocked pattern.\nResult: BLOCK`
  } else {
    result = 'error'
    exitCode = 1
    output = `Hook "${hook.name}" failed.\nError: Unexpected exit code\nResult: ERROR`
  }

  // Add to logs cache
  const logEntry: HookLogEntry = {
    id: generateId('log'),
    hookId,
    timestamp: new Date(),
    duration,
    result,
    input: sampleInput,
    output,
    error: result === 'error' ? output : undefined,
  }
  if (!logsCache.has(hookId)) {
    logsCache.set(hookId, [])
  }
  logsCache.get(hookId)!.unshift(logEntry)

  return { result, duration, output, exitCode }
}

// --- Hook Templates ---

const BUILTIN_TEMPLATES: HookTemplate[] = [
  // Security
  {
    id: 'tpl-secret-scanner',
    name: 'Secret Scanner',
    category: 'security',
    description:
      'Scans file content for hardcoded secrets, API keys, and passwords before allowing edits.',
    config: {
      trigger: 'PreToolUse',
      toolMatcher: 'Edit|Write',
      toolMatcherIsRegex: true,
      timeout: 5000,
    },
    scriptTemplate: `#!/bin/bash

# Secret Scanner - Blocks edits containing hardcoded secrets
# Exit 0 = allow, Exit 2 = block

INPUT=$(cat /dev/stdin)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')
CONTENT=$(echo "$INPUT" | jq -r '.tool_input.content // empty')

# Patterns to detect
PATTERNS=(
  'AKIA[0-9A-Z]{16}'           # AWS Access Key
  'sk-[a-zA-Z0-9]{48}'         # OpenAI API Key
  'ghp_[a-zA-Z0-9]{36}'        # GitHub Personal Token
  'password\\s*=\\s*["\\''].+["\\'']'  # Hardcoded passwords
)

for pattern in "\${PATTERNS[@]}"; do
  if echo "$CONTENT" | grep -qE "$pattern"; then
    echo "BLOCKED: Detected potential secret matching pattern: $pattern"
    exit 2
  fi
done

echo "OK: No secrets detected"
exit 0
`,
    scriptLanguage: 'bash',
  },
  {
    id: 'tpl-path-validator',
    name: 'Path Validator',
    category: 'security',
    description:
      'Validates file paths to prevent writes to sensitive directories like /etc, ~/.ssh, and .env files.',
    config: {
      trigger: 'PreToolUse',
      toolMatcher: 'Edit|Write|Bash',
      toolMatcherIsRegex: true,
      timeout: 3000,
    },
    scriptTemplate: `#!/bin/bash

# Path Validator - Blocks operations on sensitive paths
# Exit 0 = allow, Exit 2 = block

INPUT=$(cat /dev/stdin)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

BLOCKED_PATHS=(
  ".env"
  ".env.local"
  "credentials"
  ".ssh/"
  "/etc/"
  ".git/config"
)

for blocked in "\${BLOCKED_PATHS[@]}"; do
  if [[ "$FILE_PATH" == *"$blocked"* ]]; then
    echo "BLOCKED: Path '$FILE_PATH' matches blocked pattern '$blocked'"
    exit 2
  fi
done

echo "OK: Path '$FILE_PATH' is allowed"
exit 0
`,
    scriptLanguage: 'bash',
  },
  // Logging
  {
    id: 'tpl-jsonl-logger',
    name: 'JSONL Logger',
    category: 'logging',
    description:
      'Logs all hook executions to a JSONL file with timestamps, tool names, and results.',
    config: { trigger: 'PostToolUse', toolMatcher: '*', timeout: 5000 },
    scriptTemplate: `#!/usr/bin/env python3

import sys
import json
from datetime import datetime
from pathlib import Path

input_data = json.loads(sys.stdin.read())

log_entry = {
    "timestamp": datetime.utcnow().isoformat() + "Z",
    "tool": input_data.get("tool_name", "unknown"),
    "result": input_data.get("tool_result", {}).get("status", "unknown"),
    "duration_ms": input_data.get("duration_ms", 0),
    "session_id": input_data.get("session_id", "unknown"),
}

log_file = Path.home() / ".claude" / "hooks" / "execution.jsonl"
log_file.parent.mkdir(parents=True, exist_ok=True)

with open(log_file, "a") as f:
    f.write(json.dumps(log_entry) + "\\n")

print(f"Logged: {log_entry['tool']} -> {log_entry['result']}")
sys.exit(0)
`,
    scriptLanguage: 'python',
  },
  {
    id: 'tpl-metrics-collector',
    name: 'Metrics Collector',
    category: 'logging',
    description:
      'Collects execution metrics (duration, result counts) and writes periodic summaries.',
    config: { trigger: 'PostToolUse', toolMatcher: '*', timeout: 5000 },
    scriptTemplate: `#!/usr/bin/env python3

import sys
import json
from datetime import datetime
from pathlib import Path

input_data = json.loads(sys.stdin.read())

metrics_file = Path.home() / ".claude" / "hooks" / "metrics.json"
metrics_file.parent.mkdir(parents=True, exist_ok=True)

# Load existing metrics
metrics = {}
if metrics_file.exists():
    metrics = json.loads(metrics_file.read_text())

tool = input_data.get("tool_name", "unknown")
duration = input_data.get("duration_ms", 0)

# Update metrics
if tool not in metrics:
    metrics[tool] = {"count": 0, "total_ms": 0, "errors": 0}

metrics[tool]["count"] += 1
metrics[tool]["total_ms"] += duration
metrics[tool]["avg_ms"] = metrics[tool]["total_ms"] // metrics[tool]["count"]
metrics[tool]["last_run"] = datetime.utcnow().isoformat() + "Z"

metrics_file.write_text(json.dumps(metrics, indent=2))
print(f"Metrics updated: {tool} (avg {metrics[tool]['avg_ms']}ms)")
sys.exit(0)
`,
    scriptLanguage: 'python',
  },
  // Notifications
  {
    id: 'tpl-voice-notify',
    name: 'Voice Notification',
    category: 'notifications',
    description: 'Uses macOS say command to announce important events audibly.',
    config: { trigger: 'Notification', timeout: 10000 },
    scriptTemplate: `#!/bin/bash

# Voice Notification - Speaks notifications aloud (macOS)
# Exit 0 = allow

INPUT=$(cat /dev/stdin)
MESSAGE=$(echo "$INPUT" | jq -r '.message // "Notification received"')

# Use macOS say command
if command -v say &> /dev/null; then
  say "$MESSAGE" &
  echo "Voice notification sent: $MESSAGE"
else
  echo "say command not available (non-macOS system)"
fi

exit 0
`,
    scriptLanguage: 'bash',
  },
  {
    id: 'tpl-slack-webhook',
    name: 'Slack Webhook',
    category: 'notifications',
    description: 'Sends notifications to a Slack channel via incoming webhook URL.',
    config: { trigger: 'Notification', timeout: 15000 },
    scriptTemplate: `#!/usr/bin/env node

const fs = require("fs");
const https = require("https");

const input = JSON.parse(fs.readFileSync("/dev/stdin", "utf-8"));
const message = input.message || "Hook notification";

// Replace with your Slack webhook URL
const WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL || "https://hooks.slack.com/services/YOUR/WEBHOOK/URL";

const url = new URL(WEBHOOK_URL);
const payload = JSON.stringify({
  text: \`:robot_face: *Claude Code*: \${message}\`,
  unfurl_links: false,
});

const req = https.request({
  hostname: url.hostname,
  path: url.pathname,
  method: "POST",
  headers: { "Content-Type": "application/json" },
}, (res) => {
  console.log(\`Slack notification sent (status: \${res.statusCode})\`);
  process.exit(0);
});

req.on("error", (err) => {
  console.error(\`Failed to send Slack notification: \${err.message}\`);
  process.exit(0); // Don't block on notification failure
});

req.write(payload);
req.end();
`,
    scriptLanguage: 'node',
  },
  {
    id: 'tpl-desktop-notify',
    name: 'Desktop Notification',
    category: 'notifications',
    description:
      'Shows native desktop notifications using osascript (macOS) or notify-send (Linux).',
    config: { trigger: 'Stop', timeout: 5000 },
    scriptTemplate: `#!/bin/bash

# Desktop Notification - Shows native OS notification
# Exit 0 = allow

INPUT=$(cat /dev/stdin)
TITLE="Claude Code"
MESSAGE=$(echo "$INPUT" | jq -r '.message // "Agent has stopped"')

if [[ "$(uname)" == "Darwin" ]]; then
  osascript -e "display notification \\"$MESSAGE\\" with title \\"$TITLE\\""
  echo "macOS notification sent"
elif command -v notify-send &> /dev/null; then
  notify-send "$TITLE" "$MESSAGE"
  echo "Linux notification sent"
else
  echo "No notification system available"
fi

exit 0
`,
    scriptLanguage: 'bash',
  },
]

/** Template category info */
export interface TemplateCategory {
  id: 'security' | 'logging' | 'notifications' | 'utility'
  label: string
  description: string
}

export const TEMPLATE_CATEGORIES: TemplateCategory[] = [
  {
    id: 'security',
    label: 'Security',
    description: 'Protect sensitive files and validate operations',
  },
  { id: 'logging', label: 'Logging', description: 'Track executions, collect metrics, and audit' },
  {
    id: 'notifications',
    label: 'Notifications',
    description: 'Voice, Slack, desktop, and other alerts',
  },
  { id: 'utility', label: 'Utility', description: 'General-purpose automation helpers' },
]

/**
 * List all hook templates.
 */
export async function listTemplates(): Promise<HookTemplate[]> {
  await new Promise((resolve) => setTimeout(resolve, 100))
  return [...BUILTIN_TEMPLATES]
}

/**
 * Get templates grouped by category.
 */
export async function getTemplatesByCategory(): Promise<
  { category: TemplateCategory; templates: HookTemplate[] }[]
> {
  await new Promise((resolve) => setTimeout(resolve, 100))
  return TEMPLATE_CATEGORIES.map((cat) => ({
    category: cat,
    templates: BUILTIN_TEMPLATES.filter((t) => t.category === cat.id),
  })).filter((g) => g.templates.length > 0)
}

/**
 * Get a single template by ID.
 */
export async function getTemplate(id: string): Promise<HookTemplate | null> {
  await new Promise((resolve) => setTimeout(resolve, 50))
  return BUILTIN_TEMPLATES.find((t) => t.id === id) ?? null
}

// --- Import / Export / Duplicate ---

/** Shareable hook export format */
export interface HookExportData {
  version: 1
  exportedAt: string
  hooks: HookExportEntry[]
}

/** Single hook export entry */
export interface HookExportEntry {
  name: string
  description?: string
  harness: string
  config: {
    trigger: string
    toolMatcher?: string
    toolMatcherIsRegex?: boolean
    timeout?: number
  }
  scriptContent: string
  scriptLanguage: string
}

/** Import result */
export interface HookImportResult {
  success: boolean
  imported: number
  skipped: number
  errors: string[]
}

/** Community source */
export interface CommunityHookSource {
  id: string
  name: string
  description: string
  author: string
  url: string
  hookCount: number
  stars: number
  tags: string[]
}

/**
 * Export hooks to shareable JSON format.
 */
export async function exportHooks(hookIds: string[]): Promise<HookExportData> {
  await new Promise((resolve) => setTimeout(resolve, 200))
  const hooks = MOCK_HOOKS.filter((h) => hookIds.includes(h.id))
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    hooks: hooks.map((h) => ({
      name: h.name,
      description: h.description,
      harness: h.harness,
      config: {
        trigger: h.config.trigger,
        toolMatcher: h.config.toolMatcher,
        toolMatcherIsRegex: h.config.toolMatcherIsRegex,
        timeout: h.config.timeout,
      },
      scriptContent: h.scriptContent ?? '',
      scriptLanguage: h.scriptLanguage,
    })),
  }
}

/**
 * Export all hooks.
 */
export async function exportAllHooks(): Promise<HookExportData> {
  const ids = MOCK_HOOKS.map((h) => h.id)
  return exportHooks(ids)
}

/**
 * Import hooks from JSON data.
 */
export async function importHooks(data: string): Promise<HookImportResult> {
  await new Promise((resolve) => setTimeout(resolve, 300))

  const errors: string[] = []
  let parsed: HookExportData

  try {
    parsed = JSON.parse(data)
  } catch {
    return { success: false, imported: 0, skipped: 0, errors: ['Invalid JSON format'] }
  }

  if (!parsed.version || !Array.isArray(parsed.hooks)) {
    return {
      success: false,
      imported: 0,
      skipped: 0,
      errors: ['Invalid hook export format: missing version or hooks array'],
    }
  }

  let imported = 0
  let skipped = 0

  for (const entry of parsed.hooks) {
    if (!entry.name || !entry.config?.trigger) {
      errors.push(`Skipped hook: missing name or trigger`)
      skipped++
      continue
    }

    const lang = (['bash', 'python', 'node'] as const).includes(
      entry.scriptLanguage as 'bash' | 'python' | 'node'
    )
      ? (entry.scriptLanguage as 'bash' | 'python' | 'node')
      : 'bash'

    const newHook: Hook = {
      id: generateId('hook'),
      name: entry.name,
      harness: (entry.harness as Hook['harness']) || 'claude-code',
      config: {
        trigger: entry.config.trigger as HookTrigger,
        toolMatcher: entry.config.toolMatcher,
        toolMatcherIsRegex: entry.config.toolMatcherIsRegex,
        timeout: entry.config.timeout,
      },
      scriptPath: `~/.claude/hooks/${entry.name.toLowerCase().replace(/\s+/g, '-')}.${lang === 'python' ? 'py' : lang === 'node' ? 'js' : 'sh'}`,
      scriptContent: entry.scriptContent,
      scriptLanguage: lang,
      status: 'enabled',
      stats: { runCount: 0, allowCount: 0, blockCount: 0, errorCount: 0 },
      description: entry.description,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    MOCK_HOOKS.push(newHook)
    imported++
  }

  return {
    success: imported > 0,
    imported,
    skipped,
    errors,
  }
}

/**
 * Import hooks from a URL.
 */
export async function importHooksFromUrl(url: string): Promise<HookImportResult> {
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Simulate fetching from URL
  if (!url.startsWith('http')) {
    return { success: false, imported: 0, skipped: 0, errors: ['Invalid URL'] }
  }

  // Mock: simulate a successful URL import with 2 hooks
  const mockData: HookExportData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    hooks: [
      {
        name: `Imported from ${new URL(url).hostname}`,
        description: 'Hook imported from community source',
        harness: 'claude-code',
        config: { trigger: 'PreToolUse', timeout: 5000 },
        scriptContent: '#!/bin/bash\n\n# Imported hook\nexit 0\n',
        scriptLanguage: 'bash',
      },
    ],
  }

  return importHooks(JSON.stringify(mockData))
}

/**
 * Duplicate an existing hook.
 */
export async function duplicateHook(hookId: string): Promise<Hook | null> {
  await new Promise((resolve) => setTimeout(resolve, 200))
  const original = MOCK_HOOKS.find((h) => h.id === hookId)
  if (!original) return null

  const now = new Date()
  const duplicate: Hook = {
    id: generateId('hook'),
    name: `${original.name} (copy)`,
    harness: original.harness,
    config: { ...original.config },
    scriptPath: original.scriptPath.replace(/\.\w+$/, `-copy$&`),
    scriptContent: original.scriptContent,
    scriptLanguage: original.scriptLanguage,
    status: 'disabled',
    stats: { runCount: 0, allowCount: 0, blockCount: 0, errorCount: 0 },
    description: original.description,
    createdAt: now,
    updatedAt: now,
  }
  MOCK_HOOKS.push(duplicate)
  return duplicate
}

/**
 * Delete a hook.
 */
export async function deleteHook(hookId: string): Promise<boolean> {
  await new Promise((resolve) => setTimeout(resolve, 150))
  const idx = MOCK_HOOKS.findIndex((h) => h.id === hookId)
  if (idx === -1) return false
  MOCK_HOOKS.splice(idx, 1)
  return true
}

/**
 * List community hook sources.
 */
export async function listCommunitySources(): Promise<CommunityHookSource[]> {
  await new Promise((resolve) => setTimeout(resolve, 300))
  return [
    {
      id: 'cs-1',
      name: 'Claude Code Security Pack',
      description:
        'Battle-tested security hooks for Claude Code. Includes secret scanning, path validation, and command blocking.',
      author: 'anthropic-community',
      url: 'https://github.com/anthropic-community/claude-hooks-security',
      hookCount: 8,
      stars: 342,
      tags: ['security', 'claude-code'],
    },
    {
      id: 'cs-2',
      name: 'DevOps Hook Collection',
      description:
        'CI/CD integration hooks: Slack notifications, deployment checks, commit message validation.',
      author: 'devops-hooks',
      url: 'https://github.com/devops-hooks/agent-hooks',
      hookCount: 12,
      stars: 187,
      tags: ['devops', 'notifications', 'ci-cd'],
    },
    {
      id: 'cs-3',
      name: 'Multi-Agent Logging Suite',
      description: 'Comprehensive logging hooks compatible with Claude Code, Cursor, and Copilot.',
      author: 'agent-tools',
      url: 'https://github.com/agent-tools/logging-hooks',
      hookCount: 6,
      stars: 94,
      tags: ['logging', 'multi-harness'],
    },
    {
      id: 'cs-4',
      name: 'Cursor Safety Hooks',
      description:
        'Safety-focused hooks for Cursor: file protection, dependency scanning, and test enforcement.',
      author: 'cursor-community',
      url: 'https://github.com/cursor-community/safety-hooks',
      hookCount: 5,
      stars: 156,
      tags: ['security', 'cursor'],
    },
  ]
}
