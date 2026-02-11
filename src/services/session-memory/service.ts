/**
 * Session Memory Service
 * Manages session memory operations: bulk actions, tagging, pruning, export
 */

import type { HarnessType, SessionSummary } from '@/types'

/** Export format options */
export type SessionExportFormat = 'json' | 'markdown'

/** Auto-prune rule */
export interface AutoPruneRule {
  id: string
  name: string
  enabled: boolean
  /** Prune sessions older than N days */
  olderThanDays?: number
  /** Keep at most N sessions */
  maxSessions?: number
  /** Max total size in bytes */
  maxSizeBytes?: number
  /** Only apply to specific harnesses */
  harnesses?: HarnessType[]
  /** Last run timestamp */
  lastRun?: Date
  /** Sessions pruned in last run */
  lastPrunedCount?: number
}

/** Bulk operation result */
export interface BulkOperationResult {
  success: boolean
  affected: number
  message: string
}

/** Session export data */
export interface SessionExportData {
  format: SessionExportFormat
  content: string
  filename: string
  size: number
}

/** Mock auto-prune rules */
const MOCK_PRUNE_RULES: AutoPruneRule[] = [
  {
    id: 'rule-1',
    name: 'Archive old sessions',
    enabled: true,
    olderThanDays: 90,
    lastRun: new Date(Date.now() - 86400000),
    lastPrunedCount: 12,
  },
  {
    id: 'rule-2',
    name: 'Limit Claude Code sessions',
    enabled: true,
    maxSessions: 500,
    harnesses: ['claude-code'],
    lastRun: new Date(Date.now() - 172800000),
    lastPrunedCount: 0,
  },
  {
    id: 'rule-3',
    name: 'Storage cap',
    enabled: false,
    maxSizeBytes: 1024 * 1024 * 512, // 512 MB
  },
]

/**
 * Get all auto-prune rules.
 */
export async function getAutoPruneRules(): Promise<AutoPruneRule[]> {
  await new Promise((resolve) => setTimeout(resolve, 100))
  return MOCK_PRUNE_RULES
}

/**
 * Toggle a prune rule enabled/disabled.
 */
export async function togglePruneRule(ruleId: string): Promise<AutoPruneRule | null> {
  await new Promise((resolve) => setTimeout(resolve, 50))
  const rule = MOCK_PRUNE_RULES.find((r) => r.id === ruleId)
  if (!rule) return null
  rule.enabled = !rule.enabled
  return { ...rule }
}

/**
 * Bulk delete sessions by ID.
 */
export async function bulkDeleteSessions(sessionIds: string[]): Promise<BulkOperationResult> {
  await new Promise((resolve) => setTimeout(resolve, 200))
  return {
    success: true,
    affected: sessionIds.length,
    message: `Deleted ${sessionIds.length} session${sessionIds.length !== 1 ? 's' : ''}`,
  }
}

/**
 * Bulk archive sessions by ID.
 */
export async function bulkArchiveSessions(sessionIds: string[]): Promise<BulkOperationResult> {
  await new Promise((resolve) => setTimeout(resolve, 200))
  return {
    success: true,
    affected: sessionIds.length,
    message: `Archived ${sessionIds.length} session${sessionIds.length !== 1 ? 's' : ''}`,
  }
}

/**
 * Add tags to sessions.
 */
export async function addTagsToSessions(
  sessionIds: string[],
  tags: string[]
): Promise<BulkOperationResult> {
  await new Promise((resolve) => setTimeout(resolve, 100))
  return {
    success: true,
    affected: sessionIds.length,
    message: `Added ${tags.length} tag${tags.length !== 1 ? 's' : ''} to ${sessionIds.length} session${sessionIds.length !== 1 ? 's' : ''}`,
  }
}

/**
 * Remove tags from sessions.
 */
export async function removeTagsFromSessions(
  sessionIds: string[],
  tags: string[]
): Promise<BulkOperationResult> {
  await new Promise((resolve) => setTimeout(resolve, 100))
  return {
    success: true,
    affected: sessionIds.length,
    message: `Removed ${tags.length} tag${tags.length !== 1 ? 's' : ''} from ${sessionIds.length} session${sessionIds.length !== 1 ? 's' : ''}`,
  }
}

/**
 * Export sessions in the given format.
 */
export async function exportSessions(
  sessions: SessionSummary[],
  format: SessionExportFormat
): Promise<SessionExportData> {
  await new Promise((resolve) => setTimeout(resolve, 150))

  if (format === 'json') {
    const content = JSON.stringify(sessions, null, 2)
    return {
      format: 'json',
      content,
      filename: `sessions-export-${new Date().toISOString().slice(0, 10)}.json`,
      size: new Blob([content]).size,
    }
  }

  // Markdown format
  const lines: string[] = [
    `# Sessions Export`,
    ``,
    `> Exported ${sessions.length} session${sessions.length !== 1 ? 's' : ''} on ${new Date().toLocaleDateString()}`,
    ``,
  ]

  for (const session of sessions) {
    lines.push(`## ${session.title}`)
    lines.push(``)
    lines.push(`- **ID:** ${session.id}`)
    lines.push(`- **Harness:** ${session.harness}`)
    if (session.project) lines.push(`- **Project:** ${session.project}`)
    lines.push(`- **Started:** ${session.startedAt.toLocaleString()}`)
    if (session.endedAt) lines.push(`- **Ended:** ${session.endedAt.toLocaleString()}`)
    lines.push(`- **Messages:** ${session.messageCount}`)
    if (session.tags?.length) lines.push(`- **Tags:** ${session.tags.join(', ')}`)
    lines.push(``)
    if (session.lastMessagePreview) {
      lines.push(`> ${session.lastMessagePreview}`)
      lines.push(``)
    }
    lines.push(`---`)
    lines.push(``)
  }

  const content = lines.join('\n')
  return {
    format: 'markdown',
    content,
    filename: `sessions-export-${new Date().toISOString().slice(0, 10)}.md`,
    size: new Blob([content]).size,
  }
}

/**
 * Get all unique tags across sessions.
 */
export async function getAllSessionTags(): Promise<string[]> {
  await new Promise((resolve) => setTimeout(resolve, 50))
  return [
    'feature',
    'bugfix',
    'debugging',
    'refactor',
    'setup',
    'config',
    'ui',
    'api',
    'auth',
    'testing',
    'architecture',
    'plugins',
    'performance',
  ].sort()
}
