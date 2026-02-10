/**
 * Skill Types
 * Types for AI agent skills and commands
 */

import type { HarnessType } from './harness'

/** Skill category for organization */
export type SkillCategory =
  | 'core'
  | 'development'
  | 'research'
  | 'security'
  | 'testing'
  | 'documentation'
  | 'deployment'
  | 'custom'

/** Skill status */
export type SkillStatus = 'enabled' | 'disabled' | 'error'

/** Skill trigger pattern */
export interface SkillTrigger {
  /** Trigger phrase or pattern */
  pattern: string
  /** Whether this is a regex pattern */
  isRegex: boolean
  /** Description of when this trigger activates */
  description?: string
}

/** Skill metadata from SKILL.md frontmatter */
export interface SkillMetadata {
  /** Skill name */
  name: string
  /** Brief description */
  description: string
  /** Category for organization */
  category: SkillCategory
  /** Trigger patterns (USE WHEN clauses) */
  triggers: SkillTrigger[]
  /** Other skills this depends on */
  dependencies?: string[]
  /** Glob patterns for files this skill applies to */
  globs?: string[]
  /** Whether skill always applies */
  alwaysApply?: boolean
  /** Author information */
  author?: string
  /** Version string */
  version?: string
  /** Tags for searchability */
  tags?: string[]
}

/** Skill usage statistics */
export interface SkillStats {
  /** Number of times invoked */
  invocationCount: number
  /** Last invocation timestamp */
  lastUsed?: Date
  /** Average execution time in ms */
  avgExecutionTime?: number
  /** Success rate (0-1) */
  successRate?: number
}

/** Version history entry for a skill */
export interface SkillHistoryEntry {
  /** Version string */
  version: string
  /** When this version was created */
  date: Date
  /** Summary of changes */
  summary: string
  /** Author of the change */
  author?: string
}

/** Complete skill definition */
export interface Skill {
  /** Unique identifier */
  id: string
  /** Harness this skill belongs to */
  harness: HarnessType
  /** File path to skill definition */
  filePath: string
  /** Skill metadata */
  metadata: SkillMetadata
  /** Full markdown content */
  content: string
  /** JSON schema if applicable */
  schema?: Record<string, unknown>
  /** Current status */
  status: SkillStatus
  /** Usage statistics */
  stats: SkillStats
  /** Version history */
  history?: SkillHistoryEntry[]
  /** Creation timestamp */
  createdAt: Date
  /** Last modification timestamp */
  updatedAt: Date
  /** Error message if status is 'error' */
  error?: string
}

/** Skill summary for list views */
export interface SkillSummary {
  /** Unique identifier */
  id: string
  /** Harness this skill belongs to */
  harness: HarnessType
  /** Skill name */
  name: string
  /** Brief description */
  description: string
  /** Category */
  category: SkillCategory
  /** Current status */
  status: SkillStatus
  /** Last used timestamp */
  lastUsed?: Date
}

/** Options for creating a new skill */
export interface CreateSkillOptions {
  /** Skill name */
  name: string
  /** Description */
  description: string
  /** Category */
  category: SkillCategory
  /** Initial content (markdown) */
  content: string
  /** Trigger patterns */
  triggers?: SkillTrigger[]
  /** Target harness */
  harness: HarnessType
}
