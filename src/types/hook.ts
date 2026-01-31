/**
 * Hook Types
 * Types for automation hooks and scripts
 */

import type { HarnessType } from './harness'

/** Hook trigger points */
export type HookTrigger =
  | 'PreToolUse'
  | 'PostToolUse'
  | 'Notification'
  | 'Stop'
  | 'SessionStart'
  | 'SessionEnd'
  | 'PreCommit'
  | 'PostCommit'

/** Hook execution result */
export type HookResult = 'allow' | 'block' | 'error' | 'skip'

/** Hook status */
export type HookStatus = 'enabled' | 'disabled' | 'error'

/** Hook execution log entry */
export interface HookLogEntry {
  /** Unique log entry ID */
  id: string
  /** Hook ID */
  hookId: string
  /** Execution timestamp */
  timestamp: Date
  /** Execution duration in ms */
  duration: number
  /** Result of execution */
  result: HookResult
  /** Input provided to hook */
  input?: string
  /** Output from hook */
  output?: string
  /** Error message if result is 'error' */
  error?: string
  /** Tool that triggered the hook (if applicable) */
  triggeringTool?: string
}

/** Hook execution statistics */
export interface HookStats {
  /** Total number of runs */
  runCount: number
  /** Number of 'allow' results */
  allowCount: number
  /** Number of 'block' results */
  blockCount: number
  /** Number of 'error' results */
  errorCount: number
  /** Last execution timestamp */
  lastRun?: Date
  /** Last error message */
  lastError?: string
  /** Average execution time in ms */
  avgExecutionTime?: number
}

/** Hook configuration */
export interface HookConfig {
  /** Trigger point */
  trigger: HookTrigger
  /** Tool name or pattern to match (for tool-specific hooks) */
  toolMatcher?: string
  /** Whether toolMatcher is a regex */
  toolMatcherIsRegex?: boolean
  /** Timeout in milliseconds */
  timeout?: number
  /** When to run: always, on success, on failure */
  runOn?: 'always' | 'success' | 'failure'
  /** Environment variables to pass */
  env?: Record<string, string>
}

/** Complete hook definition */
export interface Hook {
  /** Unique identifier */
  id: string
  /** Hook name */
  name: string
  /** Harness this hook belongs to */
  harness: HarnessType
  /** Hook configuration */
  config: HookConfig
  /** Path to script file */
  scriptPath: string
  /** Script content (for inline display/editing) */
  scriptContent?: string
  /** Script language (bash, python, node) */
  scriptLanguage: 'bash' | 'python' | 'node' | 'unknown'
  /** Current status */
  status: HookStatus
  /** Execution statistics */
  stats: HookStats
  /** Description of what this hook does */
  description?: string
  /** Creation timestamp */
  createdAt: Date
  /** Last modification timestamp */
  updatedAt: Date
  /** Error message if status is 'error' */
  error?: string
}

/** Hook summary for list views */
export interface HookSummary {
  /** Unique identifier */
  id: string
  /** Hook name */
  name: string
  /** Harness this hook belongs to */
  harness: HarnessType
  /** Trigger point */
  trigger: HookTrigger
  /** Tool matcher pattern */
  toolMatcher?: string
  /** Current status */
  status: HookStatus
  /** Run count */
  runCount: number
  /** Block count */
  blockCount: number
}

/** Hook template for creating new hooks */
export interface HookTemplate {
  /** Template ID */
  id: string
  /** Template name */
  name: string
  /** Template category */
  category: 'security' | 'logging' | 'notifications' | 'utility'
  /** Description */
  description: string
  /** Default configuration */
  config: HookConfig
  /** Script template content */
  scriptTemplate: string
  /** Script language */
  scriptLanguage: 'bash' | 'python' | 'node'
}

/** Options for creating a new hook */
export interface CreateHookOptions {
  /** Hook name */
  name: string
  /** Description */
  description?: string
  /** Hook configuration */
  config: HookConfig
  /** Script content */
  scriptContent: string
  /** Script language */
  scriptLanguage: 'bash' | 'python' | 'node'
  /** Target harness */
  harness: HarnessType
}
