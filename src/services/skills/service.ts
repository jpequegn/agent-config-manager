/**
 * Skills Service
 * Manages skill browsing and retrieval with mock data
 */

import type { HarnessType, Skill, SkillSummary, SkillCategory, CreateSkillOptions } from '@/types'
import { generateId } from '@/lib/utils'

/** Skill aggregate statistics */
export interface SkillListStats {
  totalSkills: number
  enabledSkills: number
  disabledSkills: number
  byCategory: { category: SkillCategory; count: number }[]
  byHarness: { harness: HarnessType; count: number }[]
}

/** Filter options for skills list */
export interface SkillFilterOptions {
  harness?: HarnessType
  category?: SkillCategory
  searchText?: string
  status?: 'enabled' | 'disabled'
}

/** All skill categories with labels */
export const SKILL_CATEGORIES: { value: SkillCategory; label: string }[] = [
  { value: 'core', label: 'Core' },
  { value: 'development', label: 'Development' },
  { value: 'research', label: 'Research' },
  { value: 'security', label: 'Security' },
  { value: 'testing', label: 'Testing' },
  { value: 'documentation', label: 'Documentation' },
  { value: 'deployment', label: 'Deployment' },
  { value: 'custom', label: 'Custom' },
]

/** Mock skills data */
const MOCK_SKILLS: Skill[] = [
  // Claude Code skills
  {
    id: 'skill-cc-commit',
    harness: 'claude-code',
    filePath: '~/.claude/skills/commit/SKILL.md',
    metadata: {
      name: 'Commit',
      description: 'Create well-formatted git commits with conventional commit messages',
      category: 'development',
      triggers: [
        { pattern: '/commit', isRegex: false, description: 'Slash command' },
        { pattern: 'commit changes', isRegex: false, description: 'Natural language' },
      ],
      tags: ['git', 'commit', 'version-control'],
      version: '1.2.0',
    },
    content:
      '# Commit Skill\n\nCreates well-formatted git commits following conventional commit format.\n\n## Usage\n\nRun `/commit` or say "commit changes" to invoke.\n\n## Behavior\n\n1. Runs `git diff --staged` to detect changes\n2. Analyzes the diff for semantic meaning\n3. Generates a conventional commit message\n4. Prompts for confirmation before committing',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', description: 'Custom commit message override' },
        scope: { type: 'string', description: 'Commit scope (e.g. feat, fix, chore)' },
        amend: { type: 'boolean', description: 'Whether to amend the last commit', default: false },
      },
    },
    status: 'enabled',
    stats: {
      invocationCount: 142,
      lastUsed: new Date(Date.now() - 3600000),
      avgExecutionTime: 2500,
      successRate: 0.98,
    },
    history: [
      {
        version: '1.2.0',
        date: new Date(Date.now() - 86400000),
        summary: 'Added amend support and scope detection',
      },
      {
        version: '1.1.0',
        date: new Date(Date.now() - 86400000 * 15),
        summary: 'Improved diff analysis for monorepos',
        author: 'system',
      },
      {
        version: '1.0.0',
        date: new Date(Date.now() - 86400000 * 30),
        summary: 'Initial release with conventional commits',
        author: 'user',
      },
    ],
    createdAt: new Date(Date.now() - 86400000 * 30),
    updatedAt: new Date(Date.now() - 86400000),
  },
  {
    id: 'skill-cc-review',
    harness: 'claude-code',
    filePath: '~/.claude/skills/review-pr/SKILL.md',
    metadata: {
      name: 'Review PR',
      description: 'Review pull requests with detailed feedback on code quality and security',
      category: 'development',
      triggers: [
        { pattern: '/review-pr', isRegex: false, description: 'Slash command' },
        { pattern: 'review this PR', isRegex: false, description: 'Natural language' },
      ],
      tags: ['git', 'review', 'pull-request'],
      version: '2.0.1',
    },
    content:
      '# Review PR\n\nProvides detailed code review with security and quality analysis.\n\n## Features\n\n- Code quality analysis\n- Security vulnerability scanning\n- Performance suggestions\n- Style consistency checks',
    schema: {
      type: 'object',
      properties: {
        prNumber: { type: 'number', description: 'PR number to review' },
        depth: {
          type: 'string',
          enum: ['quick', 'standard', 'thorough'],
          description: 'Review depth',
          default: 'standard',
        },
        focus: {
          type: 'array',
          items: { type: 'string' },
          description: 'Areas to focus on (security, performance, style)',
        },
      },
      required: ['prNumber'],
    },
    status: 'enabled',
    stats: {
      invocationCount: 87,
      lastUsed: new Date(Date.now() - 7200000),
      avgExecutionTime: 8000,
      successRate: 0.95,
    },
    history: [
      {
        version: '2.0.1',
        date: new Date(Date.now() - 86400000 * 3),
        summary: 'Fixed false positive in SQL injection detection',
      },
      {
        version: '2.0.0',
        date: new Date(Date.now() - 86400000 * 20),
        summary: 'Added security scanning and focus areas',
        author: 'system',
      },
      {
        version: '1.0.0',
        date: new Date(Date.now() - 86400000 * 60),
        summary: 'Initial code review skill',
        author: 'user',
      },
    ],
    createdAt: new Date(Date.now() - 86400000 * 60),
    updatedAt: new Date(Date.now() - 86400000 * 3),
  },
  {
    id: 'skill-cc-research',
    harness: 'claude-code',
    filePath: '~/.claude/skills/research/SKILL.md',
    metadata: {
      name: 'Research',
      description: 'Comprehensive web research with multi-source analysis and synthesis',
      category: 'research',
      triggers: [
        { pattern: '/research', isRegex: false, description: 'Slash command' },
        { pattern: 'research.*topic', isRegex: true, description: 'Regex trigger' },
      ],
      tags: ['web', 'research', 'analysis'],
      version: '1.5.0',
    },
    content:
      '# Research\n\nMulti-source research with parallel agent execution.\n\n## How It Works\n\n1. Decomposes research query into sub-questions\n2. Launches parallel agents for each sub-question\n3. Synthesizes findings into a comprehensive report',
    status: 'enabled',
    stats: {
      invocationCount: 56,
      lastUsed: new Date(Date.now() - 14400000),
      avgExecutionTime: 15000,
      successRate: 0.92,
    },
    history: [
      {
        version: '1.5.0',
        date: new Date(Date.now() - 86400000 * 5),
        summary: 'Added parallel agent execution',
      },
      {
        version: '1.0.0',
        date: new Date(Date.now() - 86400000 * 45),
        summary: 'Initial research skill',
      },
    ],
    createdAt: new Date(Date.now() - 86400000 * 45),
    updatedAt: new Date(Date.now() - 86400000 * 5),
  },
  {
    id: 'skill-cc-security',
    harness: 'claude-code',
    filePath: '~/.claude/skills/security-audit/SKILL.md',
    metadata: {
      name: 'Security Audit',
      description: 'Perform security audits and vulnerability assessments on code',
      category: 'security',
      triggers: [{ pattern: '/security-audit', isRegex: false, description: 'Slash command' }],
      tags: ['security', 'audit', 'vulnerability'],
      version: '1.0.0',
    },
    content:
      '# Security Audit\n\nScans code for OWASP top 10 vulnerabilities.\n\n## Checks\n\n- SQL injection\n- XSS vulnerabilities\n- CSRF protection\n- Authentication flaws\n- Sensitive data exposure',
    schema: {
      type: 'object',
      properties: {
        targetPath: { type: 'string', description: 'Path to scan' },
        severity: {
          type: 'string',
          enum: ['low', 'medium', 'high', 'critical'],
          description: 'Minimum severity to report',
        },
      },
    },
    status: 'enabled',
    stats: {
      invocationCount: 23,
      lastUsed: new Date(Date.now() - 86400000 * 2),
      avgExecutionTime: 12000,
      successRate: 0.96,
    },
    createdAt: new Date(Date.now() - 86400000 * 20),
    updatedAt: new Date(Date.now() - 86400000 * 7),
  },
  {
    id: 'skill-cc-test',
    harness: 'claude-code',
    filePath: '~/.claude/skills/test-runner/SKILL.md',
    metadata: {
      name: 'Test Runner',
      description: 'Run and analyze test suites with intelligent failure diagnosis',
      category: 'testing',
      triggers: [
        { pattern: '/test', isRegex: false, description: 'Slash command' },
        { pattern: 'run tests', isRegex: false, description: 'Natural language' },
      ],
      tags: ['testing', 'vitest', 'jest'],
      version: '1.1.0',
    },
    content: '# Test Runner\n\nExecutes test suites and provides failure analysis.',
    status: 'disabled',
    stats: { invocationCount: 0 },
    createdAt: new Date(Date.now() - 86400000 * 10),
    updatedAt: new Date(Date.now() - 86400000 * 10),
  },
  // Cursor skills
  {
    id: 'skill-cur-generate',
    harness: 'cursor',
    filePath: '~/.cursor/skills/generate-component.md',
    metadata: {
      name: 'Generate Component',
      description: 'Generate React components with TypeScript, tests, and stories',
      category: 'development',
      triggers: [
        { pattern: 'generate component', isRegex: false, description: 'Natural language' },
      ],
      tags: ['react', 'component', 'generation'],
      version: '1.0.0',
    },
    content: '# Generate Component\n\nCreates React components with tests and Storybook stories.',
    status: 'enabled',
    stats: {
      invocationCount: 34,
      lastUsed: new Date(Date.now() - 172800000),
      avgExecutionTime: 5000,
      successRate: 0.94,
    },
    createdAt: new Date(Date.now() - 86400000 * 25),
    updatedAt: new Date(Date.now() - 86400000 * 2),
  },
  {
    id: 'skill-cur-docs',
    harness: 'cursor',
    filePath: '~/.cursor/skills/auto-docs.md',
    metadata: {
      name: 'Auto Documentation',
      description: 'Automatically generate JSDoc and README documentation',
      category: 'documentation',
      triggers: [
        { pattern: 'generate docs', isRegex: false, description: 'Natural language' },
        { pattern: 'document this', isRegex: false, description: 'Natural language' },
      ],
      tags: ['documentation', 'jsdoc', 'readme'],
      version: '1.0.0',
    },
    content: '# Auto Documentation\n\nGenerates comprehensive documentation from code.',
    status: 'enabled',
    stats: {
      invocationCount: 18,
      lastUsed: new Date(Date.now() - 259200000),
      avgExecutionTime: 4000,
      successRate: 0.89,
    },
    createdAt: new Date(Date.now() - 86400000 * 15),
    updatedAt: new Date(Date.now() - 86400000 * 4),
  },
  // Copilot skills
  {
    id: 'skill-cop-explain',
    harness: 'copilot',
    filePath: '~/.github/copilot-skills/explain-code.md',
    metadata: {
      name: 'Explain Code',
      description: 'Provide detailed explanations of complex code blocks',
      category: 'core',
      triggers: [{ pattern: 'explain this', isRegex: false, description: 'Natural language' }],
      tags: ['explanation', 'learning'],
      version: '1.0.0',
    },
    content: '# Explain Code\n\nProvides step-by-step explanations of code logic.',
    status: 'enabled',
    stats: {
      invocationCount: 67,
      lastUsed: new Date(Date.now() - 43200000),
      avgExecutionTime: 3000,
      successRate: 0.97,
    },
    createdAt: new Date(Date.now() - 86400000 * 40),
    updatedAt: new Date(Date.now() - 86400000 * 1),
  },
  // Cline skills
  {
    id: 'skill-cline-deploy',
    harness: 'cline',
    filePath: '~/.cline/skills/deploy.md',
    metadata: {
      name: 'Deploy',
      description: 'Deploy applications to cloud providers with safety checks',
      category: 'deployment',
      triggers: [{ pattern: 'deploy to', isRegex: false, description: 'Natural language' }],
      tags: ['deploy', 'cloud', 'ci-cd'],
      version: '1.0.0',
    },
    content: '# Deploy\n\nDeploys to AWS, GCP, or Cloudflare with pre-flight checks.',
    status: 'enabled',
    stats: {
      invocationCount: 12,
      lastUsed: new Date(Date.now() - 604800000),
      avgExecutionTime: 20000,
      successRate: 0.92,
    },
    createdAt: new Date(Date.now() - 86400000 * 35),
    updatedAt: new Date(Date.now() - 86400000 * 10),
  },
  {
    id: 'skill-cline-custom',
    harness: 'cline',
    filePath: '~/.cline/skills/my-workflow.md',
    metadata: {
      name: 'My Custom Workflow',
      description: 'Custom development workflow automation',
      category: 'custom',
      triggers: [{ pattern: '/my-workflow', isRegex: false, description: 'Slash command' }],
      tags: ['workflow', 'automation', 'custom'],
      version: '0.1.0',
    },
    content: '# My Custom Workflow\n\nCustom workflow for personal development tasks.',
    status: 'error',
    stats: { invocationCount: 3, lastUsed: new Date(Date.now() - 86400000 * 14) },
    createdAt: new Date(Date.now() - 86400000 * 7),
    updatedAt: new Date(Date.now() - 86400000 * 7),
    error: 'Syntax error in skill definition at line 15',
  },
]

/**
 * List skills, optionally filtered.
 */
export async function listSkills(options?: SkillFilterOptions): Promise<SkillSummary[]> {
  await new Promise((resolve) => setTimeout(resolve, 150))

  let filtered = MOCK_SKILLS

  if (options?.harness) {
    filtered = filtered.filter((s) => s.harness === options.harness)
  }
  if (options?.category) {
    filtered = filtered.filter((s) => s.metadata.category === options.category)
  }
  if (options?.status) {
    filtered = filtered.filter((s) => s.status === options.status)
  }
  if (options?.searchText) {
    const q = options.searchText.toLowerCase()
    filtered = filtered.filter(
      (s) =>
        s.metadata.name.toLowerCase().includes(q) ||
        s.metadata.description.toLowerCase().includes(q) ||
        s.metadata.tags?.some((t) => t.toLowerCase().includes(q))
    )
  }

  return filtered.map((s) => ({
    id: s.id,
    harness: s.harness,
    name: s.metadata.name,
    description: s.metadata.description,
    category: s.metadata.category,
    status: s.status,
    lastUsed: s.stats.lastUsed,
  }))
}

/**
 * Get full skill by ID.
 */
export async function getSkill(id: string): Promise<Skill | null> {
  await new Promise((resolve) => setTimeout(resolve, 50))
  return MOCK_SKILLS.find((s) => s.id === id) ?? null
}

/**
 * Get aggregate skill statistics.
 */
export async function getSkillListStats(): Promise<SkillListStats> {
  await new Promise((resolve) => setTimeout(resolve, 100))

  const categoryMap = new Map<SkillCategory, number>()
  const harnessMap = new Map<HarnessType, number>()

  for (const s of MOCK_SKILLS) {
    categoryMap.set(s.metadata.category, (categoryMap.get(s.metadata.category) ?? 0) + 1)
    harnessMap.set(s.harness, (harnessMap.get(s.harness) ?? 0) + 1)
  }

  return {
    totalSkills: MOCK_SKILLS.length,
    enabledSkills: MOCK_SKILLS.filter((s) => s.status === 'enabled').length,
    disabledSkills: MOCK_SKILLS.filter((s) => s.status === 'disabled').length,
    byCategory: Array.from(categoryMap.entries()).map(([category, count]) => ({
      category,
      count,
    })),
    byHarness: Array.from(harnessMap.entries()).map(([harness, count]) => ({
      harness,
      count,
    })),
  }
}

/** Validation result for skill content */
export interface SkillValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

/**
 * Validate skill content and metadata.
 */
export async function validateSkillContent(
  name: string,
  content: string,
  category: SkillCategory
): Promise<SkillValidationResult> {
  await new Promise((resolve) => setTimeout(resolve, 50))

  const errors: string[] = []
  const warnings: string[] = []

  if (!name.trim()) {
    errors.push('Skill name is required')
  }
  if (name.length > 100) {
    errors.push('Skill name must be 100 characters or less')
  }
  if (!content.trim()) {
    errors.push('Skill content is required')
  }
  if (content.length < 10) {
    warnings.push('Skill content is very short — consider adding more detail')
  }
  if (!content.startsWith('#')) {
    warnings.push('Skill content should start with a markdown heading')
  }
  if (!SKILL_CATEGORIES.some((c) => c.value === category)) {
    errors.push(`Invalid category: ${category}`)
  }

  return { valid: errors.length === 0, errors, warnings }
}

/**
 * Save a new or updated skill.
 */
export async function saveSkill(options: CreateSkillOptions, existingId?: string): Promise<Skill> {
  await new Promise((resolve) => setTimeout(resolve, 200))

  const now = new Date()

  if (existingId) {
    const existing = MOCK_SKILLS.find((s) => s.id === existingId)
    if (!existing) throw new Error(`Skill not found: ${existingId}`)
    existing.metadata.name = options.name
    existing.metadata.description = options.description
    existing.metadata.category = options.category
    existing.content = options.content
    if (options.triggers) existing.metadata.triggers = options.triggers
    existing.updatedAt = now
    return { ...existing }
  }

  const skill: Skill = {
    id: generateId(),
    harness: options.harness,
    filePath: `~/.${options.harness === 'claude-code' ? 'claude' : options.harness}/skills/${options.name.toLowerCase().replace(/\s+/g, '-')}/SKILL.md`,
    metadata: {
      name: options.name,
      description: options.description,
      category: options.category,
      triggers: options.triggers ?? [],
      version: '1.0.0',
    },
    content: options.content,
    status: 'enabled',
    stats: { invocationCount: 0 },
    createdAt: now,
    updatedAt: now,
  }

  MOCK_SKILLS.push(skill)
  return { ...skill }
}

/**
 * Toggle skill enabled/disabled status.
 */
export async function toggleSkillStatus(id: string): Promise<Skill> {
  await new Promise((resolve) => setTimeout(resolve, 100))

  const skill = MOCK_SKILLS.find((s) => s.id === id)
  if (!skill) throw new Error(`Skill not found: ${id}`)

  skill.status = skill.status === 'enabled' ? 'disabled' : 'enabled'
  skill.updatedAt = new Date()
  return { ...skill }
}

/**
 * Duplicate a skill within the same harness.
 */
export async function duplicateSkill(id: string): Promise<Skill> {
  await new Promise((resolve) => setTimeout(resolve, 150))

  const original = MOCK_SKILLS.find((s) => s.id === id)
  if (!original) throw new Error(`Skill not found: ${id}`)

  const now = new Date()
  const copy: Skill = {
    ...structuredClone(original),
    id: generateId(),
    metadata: {
      ...structuredClone(original.metadata),
      name: `${original.metadata.name} (copy)`,
      version: '1.0.0',
    },
    status: 'disabled',
    stats: { invocationCount: 0 },
    history: [],
    createdAt: now,
    updatedAt: now,
  }

  MOCK_SKILLS.push(copy)
  return copy
}

/**
 * Duplicate a skill to a different harness.
 */
export async function duplicateSkillToHarness(
  id: string,
  targetHarness: HarnessType
): Promise<Skill> {
  await new Promise((resolve) => setTimeout(resolve, 150))

  const original = MOCK_SKILLS.find((s) => s.id === id)
  if (!original) throw new Error(`Skill not found: ${id}`)

  const now = new Date()
  const copy: Skill = {
    ...structuredClone(original),
    id: generateId(),
    harness: targetHarness,
    filePath: `~/.${targetHarness === 'claude-code' ? 'claude' : targetHarness}/skills/${original.metadata.name.toLowerCase().replace(/\s+/g, '-')}/SKILL.md`,
    metadata: {
      ...structuredClone(original.metadata),
      version: '1.0.0',
    },
    status: 'disabled',
    stats: { invocationCount: 0 },
    history: [],
    createdAt: now,
    updatedAt: now,
  }

  MOCK_SKILLS.push(copy)
  return copy
}

/**
 * Delete a skill by ID.
 */
export async function deleteSkill(id: string): Promise<{ success: boolean; message: string }> {
  await new Promise((resolve) => setTimeout(resolve, 100))

  const index = MOCK_SKILLS.findIndex((s) => s.id === id)
  if (index === -1) return { success: false, message: `Skill not found: ${id}` }

  MOCK_SKILLS.splice(index, 1)
  return { success: true, message: 'Skill deleted successfully' }
}
