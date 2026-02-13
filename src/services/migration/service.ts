/**
 * Migration Service
 * Cross-harness configuration migration with compatibility detection,
 * transformation, backup, and rollback support
 */

import type { HarnessType, SkillSummary, HookSummary } from '@/types'
import { generateId } from '@/lib/utils'

// ============================================
// Types
// ============================================

/** Compatibility level between harnesses */
export type CompatibilityLevel = 'full' | 'partial' | 'minimal' | 'none'

/** Migration item type */
export type MigrationItemType = 'skill' | 'hook' | 'setting' | 'mcp-server'

/** Migration item status */
export type MigrationItemStatus = 'pending' | 'migrated' | 'skipped' | 'failed' | 'warning'

/** Wizard step */
export type MigrationStep = 'select' | 'analyze' | 'preview' | 'execute' | 'result'

/** Compatibility between two harnesses */
export interface CompatibilityResult {
  source: HarnessType
  target: HarnessType
  level: CompatibilityLevel
  score: number // 0-100
  summary: string
  warnings: string[]
  unsupportedFeatures: string[]
}

/** A single item to migrate */
export interface MigrationItem {
  id: string
  type: MigrationItemType
  name: string
  description: string
  sourceHarness: HarnessType
  targetHarness: HarnessType
  status: MigrationItemStatus
  compatibility: CompatibilityLevel
  warnings: string[]
  /** Original content */
  sourceContent: string
  /** Transformed content for target */
  targetContent: string
  /** Whether user selected this item for migration */
  selected: boolean
}

/** Migration plan aggregating all items */
export interface MigrationPlan {
  id: string
  source: HarnessType
  target: HarnessType
  items: MigrationItem[]
  compatibility: CompatibilityResult
  createdAt: Date
}

/** Backup created before migration */
export interface MigrationBackup {
  id: string
  migrationId: string
  source: HarnessType
  target: HarnessType
  itemCount: number
  createdAt: Date
  size: number // bytes
}

/** Result of executing a migration */
export interface MigrationResult {
  id: string
  planId: string
  backup: MigrationBackup
  source: HarnessType
  target: HarnessType
  totalItems: number
  migratedItems: number
  skippedItems: number
  failedItems: number
  warningItems: number
  items: MigrationItem[]
  startedAt: Date
  completedAt: Date
  duration: number // ms
}

// ============================================
// Compatibility Matrix
// ============================================

/** Compatibility scores between harness pairs (source -> target) */
const COMPATIBILITY_MATRIX: Record<HarnessType, Partial<Record<HarnessType, number>>> = {
  'claude-code': {
    cursor: 70,
    copilot: 55,
    cline: 75,
    continue: 60,
    aider: 45,
  },
  cursor: {
    'claude-code': 70,
    copilot: 65,
    cline: 60,
    continue: 55,
    aider: 40,
  },
  copilot: {
    'claude-code': 55,
    cursor: 65,
    cline: 50,
    continue: 50,
    aider: 35,
  },
  cline: {
    'claude-code': 75,
    cursor: 60,
    copilot: 50,
    continue: 65,
    aider: 50,
  },
  continue: {
    'claude-code': 60,
    cursor: 55,
    copilot: 50,
    cline: 65,
    aider: 45,
  },
  aider: {
    'claude-code': 45,
    cursor: 40,
    copilot: 35,
    cline: 50,
    continue: 45,
  },
}

function scoreToLevel(score: number): CompatibilityLevel {
  if (score >= 70) return 'full'
  if (score >= 50) return 'partial'
  if (score >= 30) return 'minimal'
  return 'none'
}

/** Feature support per harness */
const HARNESS_FEATURES: Record<HarnessType, string[]> = {
  'claude-code': ['skills', 'hooks', 'mcp-servers', 'memory', 'project-context', 'sessions'],
  cursor: ['rules', 'mcp-servers', 'project-context', 'settings'],
  copilot: ['instructions', 'settings', 'project-context'],
  cline: ['rules', 'mcp-servers', 'settings', 'memory'],
  continue: ['config', 'rules', 'mcp-servers', 'settings'],
  aider: ['config', 'conventions', 'settings'],
}

// ============================================
// Mock Source Data (items that can be migrated)
// ============================================

function getMockSkillsForHarness(harness: HarnessType): SkillSummary[] {
  const skills: Record<HarnessType, SkillSummary[]> = {
    'claude-code': [
      {
        id: 'skill-cc-commit',
        harness: 'claude-code',
        name: 'Commit',
        description: 'Create well-formatted git commits',
        category: 'development',
        status: 'enabled',
      },
      {
        id: 'skill-cc-review',
        harness: 'claude-code',
        name: 'Code Review',
        description: 'Review code changes for quality',
        category: 'development',
        status: 'enabled',
      },
      {
        id: 'skill-cc-test',
        harness: 'claude-code',
        name: 'Test Generator',
        description: 'Generate unit tests for functions',
        category: 'testing',
        status: 'enabled',
      },
    ],
    cursor: [
      {
        id: 'skill-cur-autocomplete',
        harness: 'cursor',
        name: 'Smart Autocomplete',
        description: 'Context-aware code completion rules',
        category: 'development',
        status: 'enabled',
      },
      {
        id: 'skill-cur-refactor',
        harness: 'cursor',
        name: 'Refactor Rules',
        description: 'Custom refactoring patterns',
        category: 'development',
        status: 'enabled',
      },
    ],
    copilot: [
      {
        id: 'skill-cop-suggest',
        harness: 'copilot',
        name: 'Suggestion Rules',
        description: 'Custom code suggestion instructions',
        category: 'development',
        status: 'enabled',
      },
    ],
    cline: [
      {
        id: 'skill-cln-autonomous',
        harness: 'cline',
        name: 'Autonomous Coding',
        description: 'Rules for autonomous code generation',
        category: 'development',
        status: 'enabled',
      },
      {
        id: 'skill-cln-debug',
        harness: 'cline',
        name: 'Debug Assistant',
        description: 'Debugging workflow rules',
        category: 'development',
        status: 'enabled',
      },
    ],
    continue: [
      {
        id: 'skill-cnt-context',
        harness: 'continue',
        name: 'Context Rules',
        description: 'Custom context retrieval rules',
        category: 'development',
        status: 'enabled',
      },
    ],
    aider: [
      {
        id: 'skill-aid-conventions',
        harness: 'aider',
        name: 'Code Conventions',
        description: 'Project coding conventions',
        category: 'development',
        status: 'enabled',
      },
    ],
  }
  return skills[harness] ?? []
}

function getMockHooksForHarness(harness: HarnessType): HookSummary[] {
  const hooks: Record<HarnessType, HookSummary[]> = {
    'claude-code': [
      {
        id: 'hook-cc-lint',
        harness: 'claude-code',
        name: 'Pre-commit Lint',
        trigger: 'PreCommit',
        status: 'enabled',
        runCount: 89,
        blockCount: 12,
      },
      {
        id: 'hook-cc-notify',
        harness: 'claude-code',
        name: 'Session Notification',
        trigger: 'Notification',
        status: 'enabled',
        runCount: 234,
        blockCount: 0,
      },
    ],
    cursor: [],
    copilot: [],
    cline: [
      {
        id: 'hook-cln-approve',
        harness: 'cline',
        name: 'Auto Approve',
        trigger: 'PreToolUse',
        status: 'enabled',
        runCount: 156,
        blockCount: 23,
      },
    ],
    continue: [],
    aider: [],
  }
  return hooks[harness] ?? []
}

// ============================================
// Service Functions
// ============================================

/**
 * Check compatibility between two harnesses
 */
export async function checkCompatibility(
  source: HarnessType,
  target: HarnessType
): Promise<CompatibilityResult> {
  await new Promise((r) => setTimeout(r, 300))

  const score = COMPATIBILITY_MATRIX[source]?.[target] ?? 0
  const level = scoreToLevel(score)

  const sourceFeatures = HARNESS_FEATURES[source] ?? []
  const targetFeatures = HARNESS_FEATURES[target] ?? []
  const unsupported = sourceFeatures.filter((f) => !targetFeatures.includes(f))

  const warnings: string[] = []
  if (level === 'partial') {
    warnings.push('Some configurations may need manual adjustment after migration')
  }
  if (level === 'minimal') {
    warnings.push('Many features are not directly transferable')
    warnings.push('Manual reconfiguration will likely be needed')
  }
  if (unsupported.length > 0) {
    warnings.push(`${target} does not support: ${unsupported.join(', ')}`)
  }

  const summaries: Record<CompatibilityLevel, string> = {
    full: `${source} and ${target} have highly compatible configurations. Most items can be migrated directly.`,
    partial: `${source} and ${target} share many features but some items will need transformation.`,
    minimal: `${source} and ${target} have limited compatibility. Only basic configurations can be transferred.`,
    none: `${source} and ${target} configurations are not compatible for direct migration.`,
  }

  return {
    source,
    target,
    level,
    score,
    summary: summaries[level],
    warnings,
    unsupportedFeatures: unsupported,
  }
}

/**
 * Analyze source configs and build a migration plan
 */
export async function analyzeMigration(
  source: HarnessType,
  target: HarnessType
): Promise<MigrationPlan> {
  await new Promise((r) => setTimeout(r, 500))

  const compatibility = await checkCompatibility(source, target)
  const skills = getMockSkillsForHarness(source)
  const hooks = getMockHooksForHarness(source)

  const items: MigrationItem[] = []

  // Transform skills
  for (const skill of skills) {
    const itemCompat =
      compatibility.score >= 60 ? 'full' : compatibility.score >= 40 ? 'partial' : 'minimal'
    const warnings: string[] = []
    if (itemCompat === 'partial') {
      warnings.push('Trigger patterns may need manual adjustment')
    }
    if (itemCompat === 'minimal') {
      warnings.push('Only the description and basic content can be migrated')
    }

    const sourceContent = `# ${skill.name}\n\n${skill.description}\n\nCategory: ${skill.category}\nStatus: ${skill.status}`
    const targetContent = transformSkillContent(sourceContent, source, target)

    items.push({
      id: generateId('mig-item'),
      type: 'skill',
      name: skill.name,
      description: skill.description,
      sourceHarness: source,
      targetHarness: target,
      status: 'pending',
      compatibility: itemCompat,
      warnings,
      sourceContent,
      targetContent,
      selected: true,
    })
  }

  // Transform hooks
  for (const hook of hooks) {
    const hookSupported =
      HARNESS_FEATURES[target]?.includes('hooks') || HARNESS_FEATURES[target]?.includes('rules')
    const itemCompat: CompatibilityLevel = hookSupported ? 'partial' : 'minimal'
    const warnings: string[] = []
    if (!hookSupported) {
      warnings.push(`${target} does not natively support hooks`)
      warnings.push('Hook logic will be converted to project-level instructions')
    } else {
      warnings.push('Hook trigger points may differ between harnesses')
    }

    const sourceContent = `Hook: ${hook.name}\nTrigger: ${hook.trigger}\nRuns: ${hook.runCount} times`
    const targetContent = transformHookContent(sourceContent, source, target)

    items.push({
      id: generateId('mig-item'),
      type: 'hook',
      name: hook.name,
      description: `${hook.trigger} hook - ${hook.runCount} executions`,
      sourceHarness: source,
      targetHarness: target,
      status: 'pending',
      compatibility: itemCompat,
      warnings,
      sourceContent,
      targetContent,
      selected: hookSupported,
    })
  }

  // Add mock settings items
  const settingItems = getMockSettingItems(source, target, compatibility.score)
  items.push(...settingItems)

  return {
    id: generateId('mig-plan'),
    source,
    target,
    items,
    compatibility,
    createdAt: new Date(),
  }
}

function getMockSettingItems(
  source: HarnessType,
  target: HarnessType,
  score: number
): MigrationItem[] {
  const settings = [
    { name: 'Model Configuration', desc: 'Default model and temperature settings' },
    { name: 'Context Window', desc: 'Maximum context window size' },
    { name: 'Auto-save', desc: 'Auto-save behavior and interval' },
  ]

  return settings.map((s) => ({
    id: generateId('mig-item'),
    type: 'setting' as MigrationItemType,
    name: s.name,
    description: s.desc,
    sourceHarness: source,
    targetHarness: target,
    status: 'pending' as MigrationItemStatus,
    compatibility: score >= 50 ? ('full' as CompatibilityLevel) : ('partial' as CompatibilityLevel),
    warnings: score < 50 ? ['Setting format may differ'] : [],
    sourceContent: `${s.name}: configured`,
    targetContent: `${s.name}: migrated from ${source}`,
    selected: true,
  }))
}

function transformSkillContent(content: string, _source: HarnessType, target: HarnessType): string {
  const headerMap: Record<HarnessType, string> = {
    'claude-code': '# SKILL.md',
    cursor: '# .cursorrules',
    copilot: '# copilot-instructions.md',
    cline: '# .clinerules',
    continue: '# .continuerc.json',
    aider: '# .aider.conf.yml',
  }

  return content
    .replace(/^# .+/m, headerMap[target] ?? '# Config')
    .concat(`\n\n<!-- Migrated to ${target} format -->`)
}

function transformHookContent(content: string, _source: HarnessType, target: HarnessType): string {
  return `# ${target} equivalent\n\n${content}\n\n<!-- Adapted for ${target} -->`
}

/**
 * Create a backup before migration
 */
export async function createBackup(plan: MigrationPlan): Promise<MigrationBackup> {
  await new Promise((r) => setTimeout(r, 400))

  const selectedItems = plan.items.filter((i) => i.selected)

  return {
    id: generateId('backup'),
    migrationId: plan.id,
    source: plan.source,
    target: plan.target,
    itemCount: selectedItems.length,
    createdAt: new Date(),
    size: selectedItems.length * 2048, // mock ~2KB per item
  }
}

/**
 * Execute the migration
 */
export async function executeMigration(
  plan: MigrationPlan,
  backup: MigrationBackup
): Promise<MigrationResult> {
  const startedAt = new Date()

  // Simulate migration with per-item delay
  const selectedItems = plan.items.filter((i) => i.selected)
  const migratedItems: MigrationItem[] = []

  for (const item of plan.items) {
    if (!item.selected) {
      migratedItems.push({ ...item, status: 'skipped' })
      continue
    }

    await new Promise((r) => setTimeout(r, 150))

    // Simulate occasional warnings/failures
    let status: MigrationItemStatus = 'migrated'
    if (item.compatibility === 'minimal') {
      status = Math.random() > 0.5 ? 'warning' : 'failed'
    } else if (item.compatibility === 'partial') {
      status = Math.random() > 0.8 ? 'warning' : 'migrated'
    }

    migratedItems.push({ ...item, status })
  }

  const completedAt = new Date()
  const migrated = migratedItems.filter((i) => i.status === 'migrated').length
  const skipped = migratedItems.filter((i) => i.status === 'skipped').length
  const failed = migratedItems.filter((i) => i.status === 'failed').length
  const warning = migratedItems.filter((i) => i.status === 'warning').length

  return {
    id: generateId('mig-result'),
    planId: plan.id,
    backup,
    source: plan.source,
    target: plan.target,
    totalItems: selectedItems.length,
    migratedItems: migrated,
    skippedItems: skipped,
    failedItems: failed,
    warningItems: warning,
    items: migratedItems,
    startedAt,
    completedAt,
    duration: completedAt.getTime() - startedAt.getTime(),
  }
}

/**
 * Rollback a migration using its backup
 */
export async function rollbackMigration(
  result: MigrationResult
): Promise<{ success: boolean; message: string }> {
  await new Promise((r) => setTimeout(r, 600))

  return {
    success: true,
    message: `Successfully rolled back migration. Restored ${result.backup.itemCount} items from backup ${result.backup.id}.`,
  }
}

/** All migration steps in order */
export const MIGRATION_STEPS: { step: MigrationStep; label: string }[] = [
  { step: 'select', label: 'Select Harnesses' },
  { step: 'analyze', label: 'Analyze Compatibility' },
  { step: 'preview', label: 'Preview Changes' },
  { step: 'execute', label: 'Execute Migration' },
  { step: 'result', label: 'Results' },
]
