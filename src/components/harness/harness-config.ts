/**
 * Harness Configuration
 * Brand colors, icons, and metadata for each harness type
 */

import type { HarnessType } from '@/types'

/** Harness display configuration */
export interface HarnessDisplayConfig {
  /** Display name */
  name: string
  /** Short name for compact views */
  shortName: string
  /** Brand color (hex) */
  brandColor: string
  /** Background color for selected state */
  bgColor: string
  /** Text color on brand background */
  textColor: string
  /** Description */
  description: string
  /** Website URL */
  website: string
}

/** Configuration for all harness types */
export const harnessConfigs: Record<HarnessType, HarnessDisplayConfig> = {
  'claude-code': {
    name: 'Claude Code',
    shortName: 'Claude',
    brandColor: '#D97706',
    bgColor: 'bg-amber-500/10',
    textColor: 'text-amber-600 dark:text-amber-400',
    description: "Anthropic's AI coding assistant",
    website: 'https://claude.ai',
  },
  cursor: {
    name: 'Cursor',
    shortName: 'Cursor',
    brandColor: '#000000',
    bgColor: 'bg-neutral-500/10',
    textColor: 'text-neutral-900 dark:text-neutral-100',
    description: 'AI-first code editor',
    website: 'https://cursor.sh',
  },
  copilot: {
    name: 'GitHub Copilot',
    shortName: 'Copilot',
    brandColor: '#6366F1',
    bgColor: 'bg-indigo-500/10',
    textColor: 'text-indigo-600 dark:text-indigo-400',
    description: "GitHub's AI pair programmer",
    website: 'https://github.com/features/copilot',
  },
  cline: {
    name: 'Cline',
    shortName: 'Cline',
    brandColor: '#10B981',
    bgColor: 'bg-emerald-500/10',
    textColor: 'text-emerald-600 dark:text-emerald-400',
    description: 'Autonomous AI coding agent',
    website: 'https://github.com/cline/cline',
  },
  continue: {
    name: 'Continue',
    shortName: 'Continue',
    brandColor: '#3B82F6',
    bgColor: 'bg-blue-500/10',
    textColor: 'text-blue-600 dark:text-blue-400',
    description: 'Open-source AI code assistant',
    website: 'https://continue.dev',
  },
  aider: {
    name: 'Aider',
    shortName: 'Aider',
    brandColor: '#8B5CF6',
    bgColor: 'bg-violet-500/10',
    textColor: 'text-violet-600 dark:text-violet-400',
    description: 'AI pair programming in terminal',
    website: 'https://aider.chat',
  },
}

/**
 * Get display config for a harness type
 */
export function getHarnessConfig(type: HarnessType): HarnessDisplayConfig {
  return harnessConfigs[type]
}

/** Explicit ordering of harness types for consistent display */
const harnessOrder: HarnessType[] = [
  'claude-code',
  'cursor',
  'copilot',
  'cline',
  'continue',
  'aider',
]

/**
 * Get all harness types in display order
 */
export function getAllHarnessTypes(): HarnessType[] {
  return harnessOrder
}
