/**
 * Learnings Service
 * Manages knowledge base entries organized by category
 */

import type { HarnessType, LearningCategory, MemoryEntry, MemoryEntrySummary } from '@/types'

/** Learning statistics */
export interface LearningStats {
  totalLearnings: number
  totalSize: number
  byCategory: { category: LearningCategory; count: number }[]
  byHarness: { harness: HarnessType; count: number }[]
}

/** Export format */
export type ExportFormat = 'json' | 'markdown'

/** All learning categories with display labels */
export const LEARNING_CATEGORIES: { value: LearningCategory; label: string }[] = [
  { value: 'debugging', label: 'Debugging' },
  { value: 'architecture', label: 'Architecture' },
  { value: 'patterns', label: 'Patterns' },
  { value: 'decisions', label: 'Decisions' },
  { value: 'preferences', label: 'Preferences' },
  { value: 'errors', label: 'Errors' },
  { value: 'solutions', label: 'Solutions' },
  { value: 'other', label: 'Other' },
]

/** Mock learnings data */
const MOCK_LEARNINGS: MemoryEntry[] = [
  {
    id: 'learn-001',
    harness: 'claude-code',
    type: 'learning',
    title: 'Zustand persist middleware requires explicit storage in jsdom',
    content: `# Zustand persist + jsdom

## Problem
When using Zustand's \`persist\` middleware in vitest with jsdom environment, \`localStorage.setItem\` is undefined because jsdom v27 provides a localStorage object without the standard methods on its prototype.

## Solution
Either:
1. Remove \`persist\` from stores that don't need persistence across page reloads
2. Provide a fallback in-memory storage via \`createJSONStorage\`
3. Mock \`localStorage\` in the test setup file

## Tags
zustand, testing, vitest, jsdom, localStorage`,
    filePath: '~/.claude/projects/learnings/zustand-persist-jsdom.md',
    size: 512,
    metadata: {
      source: 'session-abc123',
      project: 'agent-config-manager',
      category: 'debugging',
      tags: ['zustand', 'testing', 'vitest', 'jsdom'],
    },
    createdAt: new Date(Date.now() - 3600000),
    lastAccessedAt: new Date(),
    updatedAt: new Date(Date.now() - 3600000),
  },
  {
    id: 'learn-002',
    harness: 'claude-code',
    type: 'learning',
    title: 'React effect setState lint rule workaround',
    content: `# react-hooks/set-state-in-effect

## Problem
The \`react-hooks/set-state-in-effect\` ESLint rule flags any synchronous \`setState\` call inside a \`useEffect\` body, even when it's needed for loading states.

## Solution
Derive loading state from comparing the requested input to the loaded result, instead of calling \`setIsLoading(true)\` synchronously in the effect.

\`\`\`typescript
function useFileContent(filePath: string | null) {
  const [loadedPath, setLoadedPath] = useState<string | null>(null)
  const [content, setContent] = useState('')

  useEffect(() => {
    if (!filePath) return
    let cancelled = false
    fetchContent(filePath).then((result) => {
      if (!cancelled) {
        setContent(result)
        setLoadedPath(filePath)
      }
    })
    return () => { cancelled = true }
  }, [filePath])

  const isLoading = filePath !== null && loadedPath !== filePath
  return { content: isLoading ? '' : content, isLoading }
}
\`\`\``,
    filePath: '~/.claude/projects/learnings/react-effect-setstate.md',
    size: 896,
    metadata: {
      source: 'session-abc123',
      project: 'agent-config-manager',
      category: 'patterns',
      tags: ['react', 'hooks', 'eslint', 'useEffect'],
    },
    createdAt: new Date(Date.now() - 7200000),
    lastAccessedAt: new Date(Date.now() - 3600000),
    updatedAt: new Date(Date.now() - 7200000),
  },
  {
    id: 'learn-003',
    harness: 'cursor',
    type: 'learning',
    title: 'Adapter pattern for multi-harness support',
    content: `# Adapter Pattern for Harness Abstraction

## Context
When building a unified UI for multiple AI coding assistants (Claude Code, Cursor, Copilot, etc.), each has different config locations, file formats, and capabilities.

## Pattern
Use an abstract \`BaseHarnessAdapter\` class with a common interface:
- Abstract methods for core operations (must implement)
- Default implementations for optional features (can override)
- Factory registration for runtime adapter selection

## Key Insight
Mock data in adapters during development lets you build the full UI before implementing filesystem operations. Replace mocks incrementally.`,
    filePath: '~/.claude/projects/learnings/adapter-pattern.md',
    size: 640,
    metadata: {
      category: 'architecture',
      tags: ['adapter-pattern', 'design-patterns', 'multi-harness'],
    },
    createdAt: new Date(Date.now() - 86400000),
    lastAccessedAt: new Date(Date.now() - 43200000),
    updatedAt: new Date(Date.now() - 86400000),
  },
  {
    id: 'learn-004',
    harness: 'claude-code',
    type: 'learning',
    title: 'Use devtools middleware name for Redux DevTools debugging',
    content: `# Zustand DevTools Naming

Always pass a \`name\` option to the \`devtools\` middleware so stores appear with meaningful names in Redux DevTools:

\`\`\`typescript
export const useMyStore = create<MyStore>()(
  devtools(
    (set) => ({ /* ... */ }),
    { name: 'MyStore' }  // <-- This shows in DevTools
  )
)
\`\`\`

Without the name, all stores show as "anonymous" which makes debugging impossible.`,
    filePath: '~/.claude/projects/learnings/zustand-devtools-name.md',
    size: 384,
    metadata: {
      category: 'patterns',
      tags: ['zustand', 'devtools', 'debugging'],
    },
    createdAt: new Date(Date.now() - 172800000),
    lastAccessedAt: new Date(Date.now() - 86400000),
    updatedAt: new Date(Date.now() - 172800000),
  },
  {
    id: 'learn-005',
    harness: 'claude-code',
    type: 'learning',
    title: 'Prefer cn() over manual Tailwind class concatenation',
    content: `# cn() Utility

Always use the \`cn()\` utility (clsx + tailwind-merge) for conditional Tailwind classes:

\`\`\`typescript
// Good
className={cn('base-classes', isActive && 'active-classes')}

// Bad - duplicates and conflicts not resolved
className={\`base-classes \${isActive ? 'active-classes' : ''}\`}
\`\`\`

This prevents class conflicts (e.g., \`p-2\` and \`p-4\` both being applied).`,
    filePath: '~/.claude/projects/learnings/cn-utility.md',
    size: 320,
    metadata: {
      category: 'preferences',
      tags: ['tailwind', 'css', 'utility'],
    },
    createdAt: new Date(Date.now() - 259200000),
    lastAccessedAt: new Date(Date.now() - 172800000),
    updatedAt: new Date(Date.now() - 259200000),
  },
  {
    id: 'learn-006',
    harness: 'copilot',
    type: 'learning',
    title: 'API error handling with custom error classes',
    content: `# Custom Error Classes Pattern

Create specific error classes that extend a base \`AppError\`:

\`\`\`typescript
class AppError extends Error {
  constructor(message: string, public code: string) { super(message) }
}
class FileSystemError extends AppError { /* ... */ }
class NetworkError extends AppError { /* ... */ }
\`\`\`

Use \`isAppError()\` type guard for narrowing and \`getUserMessage()\` for user-facing messages.`,
    filePath: '~/.claude/projects/learnings/custom-error-classes.md',
    size: 448,
    metadata: {
      category: 'errors',
      tags: ['error-handling', 'typescript', 'patterns'],
    },
    createdAt: new Date(Date.now() - 345600000),
    lastAccessedAt: new Date(Date.now() - 259200000),
    updatedAt: new Date(Date.now() - 345600000),
  },
  {
    id: 'learn-007',
    harness: 'claude-code',
    type: 'learning',
    title: 'Decision: shadcn/ui over full component libraries',
    content: `# Why shadcn/ui

## Decision
Use shadcn/ui (copy-paste Radix primitives) over Chakra/MUI/Ant Design.

## Rationale
1. **Ownership** - Components live in your codebase, fully customizable
2. **Tree-shaking** - Only include what you use (no bloated bundle)
3. **Tailwind native** - No CSS-in-JS runtime overhead
4. **Accessible** - Built on Radix UI primitives (ARIA compliant)
5. **Dark mode** - CSS variables make theming trivial

## Trade-off
More initial setup, but far less fighting with library opinions long-term.`,
    filePath: '~/.claude/projects/learnings/shadcn-decision.md',
    size: 576,
    metadata: {
      category: 'decisions',
      tags: ['ui', 'shadcn', 'component-library', 'architecture'],
    },
    createdAt: new Date(Date.now() - 604800000),
    lastAccessedAt: new Date(Date.now() - 345600000),
    updatedAt: new Date(Date.now() - 604800000),
  },
  {
    id: 'learn-008',
    harness: 'cursor',
    type: 'learning',
    title: 'Fix: Vite path aliases need both tsconfig and vite.config',
    content: `# Vite Path Aliases

When using \`@/\` aliases, you must configure BOTH:

1. **tsconfig.json** (for TypeScript/IDE):
\`\`\`json
{ "compilerOptions": { "paths": { "@/*": ["./src/*"] } } }
\`\`\`

2. **vite.config.ts** (for build/runtime):
\`\`\`typescript
resolve: { alias: { '@': path.resolve(__dirname, './src') } }
\`\`\`

Missing either one causes confusing errors - TypeScript says it's fine but Vite can't resolve, or vice versa.`,
    filePath: '~/.claude/projects/learnings/vite-path-aliases.md',
    size: 480,
    metadata: {
      category: 'solutions',
      tags: ['vite', 'typescript', 'path-alias', 'configuration'],
    },
    createdAt: new Date(Date.now() - 864000000),
    lastAccessedAt: new Date(Date.now() - 604800000),
    updatedAt: new Date(Date.now() - 864000000),
  },
]

/**
 * List all learnings, optionally filtered.
 */
export async function listLearnings(options?: {
  category?: LearningCategory
  harness?: HarnessType
  search?: string
}): Promise<MemoryEntrySummary[]> {
  await new Promise((resolve) => setTimeout(resolve, 150))

  let filtered = MOCK_LEARNINGS
  if (options?.category) {
    filtered = filtered.filter((l) => l.metadata.category === options.category)
  }
  if (options?.harness) {
    filtered = filtered.filter((l) => l.harness === options.harness)
  }
  if (options?.search) {
    const q = options.search.toLowerCase()
    filtered = filtered.filter(
      (l) =>
        l.title.toLowerCase().includes(q) ||
        l.content.toLowerCase().includes(q) ||
        l.metadata.tags?.some((t) => t.toLowerCase().includes(q))
    )
  }

  return filtered.map((l) => ({
    id: l.id,
    harness: l.harness,
    type: l.type,
    title: l.title,
    size: l.size,
    category: l.metadata.category,
    createdAt: l.createdAt,
    lastAccessedAt: l.lastAccessedAt,
  }))
}

/**
 * Get full learning entry by ID.
 */
export async function getLearning(id: string): Promise<MemoryEntry | null> {
  await new Promise((resolve) => setTimeout(resolve, 50))
  return MOCK_LEARNINGS.find((l) => l.id === id) ?? null
}

/**
 * Get aggregate learning statistics.
 */
export async function getLearningStats(): Promise<LearningStats> {
  await new Promise((resolve) => setTimeout(resolve, 100))

  const categoryMap = new Map<LearningCategory, number>()
  const harnessMap = new Map<HarnessType, number>()

  for (const l of MOCK_LEARNINGS) {
    const cat = l.metadata.category ?? 'other'
    categoryMap.set(cat, (categoryMap.get(cat) ?? 0) + 1)
    harnessMap.set(l.harness, (harnessMap.get(l.harness) ?? 0) + 1)
  }

  return {
    totalLearnings: MOCK_LEARNINGS.length,
    totalSize: MOCK_LEARNINGS.reduce((sum, l) => sum + l.size, 0),
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

/**
 * Export learnings to the specified format.
 */
export async function exportLearnings(ids: string[], format: ExportFormat): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, 100))

  const entries = MOCK_LEARNINGS.filter((l) => ids.includes(l.id))

  if (format === 'json') {
    return JSON.stringify(
      entries.map((e) => ({
        id: e.id,
        title: e.title,
        content: e.content,
        category: e.metadata.category,
        tags: e.metadata.tags,
        harness: e.harness,
        createdAt: e.createdAt.toISOString(),
      })),
      null,
      2
    )
  }

  // Markdown format
  return entries
    .map(
      (e) =>
        `# ${e.title}\n\n` +
        `**Category:** ${e.metadata.category ?? 'other'}  \n` +
        `**Tags:** ${e.metadata.tags?.join(', ') ?? 'none'}  \n` +
        `**Created:** ${e.createdAt.toLocaleDateString()}  \n\n` +
        `---\n\n${e.content}`
    )
    .join('\n\n---\n\n')
}

/**
 * Import learnings from JSON string. Returns count of imported entries.
 */
export async function importLearnings(_jsonData: string): Promise<number> {
  await new Promise((resolve) => setTimeout(resolve, 200))
  // Mock: parse and count entries
  try {
    const data = JSON.parse(_jsonData) as unknown[]
    return Array.isArray(data) ? data.length : 0
  } catch {
    return 0
  }
}
