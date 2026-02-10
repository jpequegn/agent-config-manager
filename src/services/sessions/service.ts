/**
 * Sessions Service
 * Manages conversation session browsing and retrieval
 */

import type { HarnessType, Session, SessionSummary, SessionFilterOptions } from '@/types'

/** Sort field for sessions */
export type SessionSortField = 'recent' | 'duration' | 'messages'

/** Sort options for sessions list */
export interface SessionSortOptions {
  sortBy?: SessionSortField
  sortOrder?: 'asc' | 'desc'
}

/** Session aggregate statistics */
export interface SessionListStats {
  totalSessions: number
  activeSessions: number
  totalMessages: number
  byHarness: { harness: HarnessType; count: number }[]
  /** Unique project names across all sessions */
  projects: string[]
}

/** Mock session data */
const MOCK_SESSIONS: Session[] = [
  {
    id: 'sess-001',
    harness: 'claude-code',
    metadata: {
      title: 'Implement project context scanner',
      project: 'agent-config-manager',
      projectPath: '~/Code/agent-config-manager',
      tags: ['feature', 'project-context'],
    },
    messages: [
      {
        id: 'msg-001-1',
        role: 'user',
        content: 'I need to build a project context scanner that finds CLAUDE.md files.',
        timestamp: new Date(Date.now() - 7200000),
      },
      {
        id: 'msg-001-2',
        role: 'assistant',
        content: `I'll create a service that scans project directories for context files. Here's the interface:

\`\`\`typescript
export async function scanProjects(): Promise<ProjectContext[]> {
  const homeDir = await getHomeDirectory()
  const codeDirs = await listDirectories(path.join(homeDir, 'Code'))
  return Promise.all(codeDirs.map(scanSingleProject))
}
\`\`\`

This walks through each project directory and checks for known context files like CLAUDE.md, .cursorrules, and .github/copilot-instructions.md.`,
        timestamp: new Date(Date.now() - 7190000),
        toolCalls: [
          {
            id: 'tc-001',
            name: 'Write',
            input: { file_path: 'src/services/project-context/service.ts' },
            output: 'File created successfully at src/services/project-context/service.ts',
            status: 'success',
            duration: 150,
            timestamp: new Date(Date.now() - 7185000),
          },
        ],
        fileChanges: [
          {
            type: 'create',
            path: 'src/services/project-context/service.ts',
            linesAdded: 120,
            diff: `+export async function scanProjects(): Promise<ProjectContext[]> {
+  const homeDir = await getHomeDirectory()
+  const codeDirs = await listDirectories(path.join(homeDir, 'Code'))
+  return Promise.all(codeDirs.map(scanSingleProject))
+}`,
          },
        ],
      },
      {
        id: 'msg-001-3',
        role: 'user',
        content: 'Looks good! Now add filtering by harness type.',
        timestamp: new Date(Date.now() - 7000000),
      },
      {
        id: 'msg-001-4',
        role: 'assistant',
        content: `I've added harness filtering to the scanner:

\`\`\`typescript
export async function scanProjects(options?: {
  harness?: HarnessType
}): Promise<ProjectContext[]> {
  let projects = await scanAllProjects()
  if (options?.harness) {
    projects = projects.map(p => ({
      ...p,
      contextFiles: p.contextFiles.filter(f => f.harness === options.harness)
    })).filter(p => p.contextFiles.length > 0)
  }
  return projects
}
\`\`\``,
        timestamp: new Date(Date.now() - 6990000),
        fileChanges: [
          {
            type: 'modify',
            path: 'src/services/project-context/service.ts',
            linesAdded: 15,
            linesRemoved: 3,
            diff: `-export async function scanProjects(): Promise<ProjectContext[]> {
-  const homeDir = await getHomeDirectory()
-  return scanAllProjects()
+export async function scanProjects(options?: {
+  harness?: HarnessType
+}): Promise<ProjectContext[]> {
+  let projects = await scanAllProjects()
+  if (options?.harness) {
+    projects = projects.map(p => ({
+      ...p,
+      contextFiles: p.contextFiles.filter(f => f.harness === options.harness)
+    })).filter(p => p.contextFiles.length > 0)
+  }
+  return projects
 }`,
          },
        ],
      },
    ],
    stats: {
      messageCount: 4,
      userMessageCount: 2,
      assistantMessageCount: 2,
      toolCallCount: 1,
      fileChangeCount: 2,
      totalTokens: 3200,
      duration: 210000,
    },
    startedAt: new Date(Date.now() - 7200000),
    endedAt: new Date(Date.now() - 6990000),
    isActive: false,
  },
  {
    id: 'sess-002',
    harness: 'claude-code',
    metadata: {
      title: 'Debug Zustand persist in jsdom',
      project: 'agent-config-manager',
      projectPath: '~/Code/agent-config-manager',
      tags: ['debugging', 'zustand', 'testing'],
    },
    messages: [
      {
        id: 'msg-002-1',
        role: 'user',
        content: 'Tests are failing with localStorage.setItem is not a function.',
        timestamp: new Date(Date.now() - 86400000),
      },
      {
        id: 'msg-002-2',
        role: 'assistant',
        content:
          'This is a known issue with jsdom v27 where localStorage exists but methods are not on the prototype. Let me investigate and fix this.',
        timestamp: new Date(Date.now() - 86390000),
        toolCalls: [
          {
            id: 'tc-002',
            name: 'Bash',
            input: { command: 'bun run test:run -- --reporter=verbose' },
            output: `FAIL  src/stores/project-context-store.test.ts
  ● ProjectContextStore > should start with defaults
    TypeError: localStorage.setItem is not a function

      at node_modules/zustand/middleware.js:42:19
      at Object.<anonymous> (src/stores/project-context-store.ts:48:1)

Test Suites: 1 failed, 21 passed, 22 total
Tests:       9 failed, 371 passed, 380 total`,
            status: 'success',
            duration: 5000,
            timestamp: new Date(Date.now() - 86385000),
          },
        ],
      },
      {
        id: 'msg-002-3',
        role: 'assistant',
        content: `The fix is to remove the \`persist\` middleware from stores that are tested in jsdom. Here's the change:

\`\`\`typescript
// Before (broken in jsdom):
export const useProjectContextStore = create<Store>()(
  devtools(persist((set) => ({ ... }), { name: 'store' }))
)

// After (works in jsdom):
export const useProjectContextStore = create<Store>()(
  devtools((set) => ({ ... }), { name: 'ProjectContextStore' })
)
\`\`\`

This removes the localStorage dependency while keeping Redux DevTools support.`,
        timestamp: new Date(Date.now() - 86300000),
        fileChanges: [
          {
            type: 'modify',
            path: 'src/stores/project-context-store.ts',
            linesAdded: 2,
            linesRemoved: 8,
            diff: `-import { devtools, persist } from 'zustand/middleware'
+import { devtools } from 'zustand/middleware'

 export const useProjectContextStore = create<Store>()(
-  devtools(
-    persist(
-      (set) => ({
-        ...initialState,
-      }),
-      { name: 'project-context-store' }
-    ),
+  devtools(
+    (set) => ({
+      ...initialState,
+    }),
     { name: 'ProjectContextStore' }
   )
 )`,
          },
        ],
      },
    ],
    stats: {
      messageCount: 3,
      userMessageCount: 1,
      assistantMessageCount: 2,
      toolCallCount: 1,
      fileChangeCount: 1,
      totalTokens: 2800,
      duration: 100000,
    },
    startedAt: new Date(Date.now() - 86400000),
    endedAt: new Date(Date.now() - 86300000),
    isActive: false,
  },
  {
    id: 'sess-003',
    harness: 'cursor',
    metadata: {
      title: 'Set up Tailwind CSS 4 with Vite',
      project: 'portfolio-site',
      projectPath: '~/Code/portfolio-site',
      tags: ['setup', 'tailwind', 'vite'],
    },
    messages: [
      {
        id: 'msg-003-1',
        role: 'user',
        content: 'Help me configure Tailwind CSS 4 for my Vite project.',
        timestamp: new Date(Date.now() - 172800000),
      },
      {
        id: 'msg-003-2',
        role: 'assistant',
        content:
          "Tailwind CSS 4 uses a new CSS-first configuration. I'll set it up with Vite and the recommended presets.",
        timestamp: new Date(Date.now() - 172790000),
        fileChanges: [
          {
            type: 'modify',
            path: 'src/index.css',
            linesAdded: 12,
            linesRemoved: 0,
          },
          {
            type: 'modify',
            path: 'vite.config.ts',
            linesAdded: 5,
            linesRemoved: 1,
          },
        ],
      },
    ],
    stats: {
      messageCount: 2,
      userMessageCount: 1,
      assistantMessageCount: 1,
      toolCallCount: 0,
      fileChangeCount: 2,
      totalTokens: 1500,
      duration: 10000,
    },
    startedAt: new Date(Date.now() - 172800000),
    endedAt: new Date(Date.now() - 172790000),
    isActive: false,
  },
  {
    id: 'sess-004',
    harness: 'copilot',
    metadata: {
      title: 'Implement OAuth2 PKCE flow',
      project: 'auth-service',
      projectPath: '~/Code/auth-service',
      tags: ['auth', 'oauth', 'security'],
    },
    messages: [
      {
        id: 'msg-004-1',
        role: 'user',
        content: 'I need to implement OAuth2 with PKCE for our SPA.',
        timestamp: new Date(Date.now() - 345600000),
      },
      {
        id: 'msg-004-2',
        role: 'assistant',
        content:
          "I'll implement the PKCE flow with code verifier generation, authorization redirect, and token exchange.",
        timestamp: new Date(Date.now() - 345590000),
        toolCalls: [
          {
            id: 'tc-004',
            name: 'Write',
            input: { file_path: 'src/auth/pkce.ts' },
            output: 'File created',
            status: 'success',
            duration: 200,
            timestamp: new Date(Date.now() - 345585000),
          },
        ],
        fileChanges: [
          {
            type: 'create',
            path: 'src/auth/pkce.ts',
            linesAdded: 85,
          },
        ],
      },
    ],
    stats: {
      messageCount: 2,
      userMessageCount: 1,
      assistantMessageCount: 1,
      toolCallCount: 1,
      fileChangeCount: 1,
      totalTokens: 2100,
      duration: 15000,
    },
    startedAt: new Date(Date.now() - 345600000),
    endedAt: new Date(Date.now() - 345585000),
    isActive: false,
  },
  {
    id: 'sess-005',
    harness: 'cline',
    metadata: {
      title: 'Build REST API with Express',
      project: 'task-api',
      projectPath: '~/Code/task-api',
      tags: ['api', 'express', 'rest'],
    },
    messages: [
      {
        id: 'msg-005-1',
        role: 'user',
        content: 'Create a RESTful CRUD API for tasks with Express and TypeScript.',
        timestamp: new Date(Date.now() - 604800000),
      },
      {
        id: 'msg-005-2',
        role: 'assistant',
        content: "I'll scaffold the Express app with CRUD endpoints for tasks.",
        timestamp: new Date(Date.now() - 604790000),
        fileChanges: [
          {
            type: 'create',
            path: 'src/routes/tasks.ts',
            linesAdded: 95,
          },
          {
            type: 'create',
            path: 'src/models/task.ts',
            linesAdded: 30,
          },
        ],
      },
    ],
    stats: {
      messageCount: 2,
      userMessageCount: 1,
      assistantMessageCount: 1,
      toolCallCount: 0,
      fileChangeCount: 2,
      totalTokens: 1800,
      duration: 10000,
    },
    startedAt: new Date(Date.now() - 604800000),
    endedAt: new Date(Date.now() - 604790000),
    isActive: false,
  },
  {
    id: 'sess-006',
    harness: 'claude-code',
    metadata: {
      title: 'Refactor adapter plugin system',
      project: 'agent-config-manager',
      projectPath: '~/Code/agent-config-manager',
      tags: ['refactor', 'plugins', 'architecture'],
    },
    messages: [
      {
        id: 'msg-006-1',
        role: 'user',
        content: 'Refactor the adapter system to use a plugin pattern with dynamic loading.',
        timestamp: new Date(Date.now() - 259200000),
      },
      {
        id: 'msg-006-2',
        role: 'assistant',
        content:
          "I'll create a plugin manager that handles adapter registration and lifecycle management.",
        timestamp: new Date(Date.now() - 259190000),
        toolCalls: [
          {
            id: 'tc-006a',
            name: 'Write',
            input: { file_path: 'src/plugins/manager.ts' },
            output: 'File created',
            status: 'success',
            duration: 180,
            timestamp: new Date(Date.now() - 259185000),
          },
          {
            id: 'tc-006b',
            name: 'Write',
            input: { file_path: 'src/plugins/loader.ts' },
            output: 'File created',
            status: 'success',
            duration: 150,
            timestamp: new Date(Date.now() - 259180000),
          },
        ],
        fileChanges: [
          {
            type: 'create',
            path: 'src/plugins/manager.ts',
            linesAdded: 150,
          },
          {
            type: 'create',
            path: 'src/plugins/loader.ts',
            linesAdded: 90,
          },
        ],
      },
      {
        id: 'msg-006-3',
        role: 'user',
        content: 'Add tests for the plugin manager.',
        timestamp: new Date(Date.now() - 259000000),
      },
      {
        id: 'msg-006-4',
        role: 'assistant',
        content: "I've added comprehensive tests for the plugin manager.",
        timestamp: new Date(Date.now() - 258990000),
        fileChanges: [
          {
            type: 'create',
            path: 'src/plugins/manager.test.ts',
            linesAdded: 200,
          },
        ],
      },
    ],
    stats: {
      messageCount: 4,
      userMessageCount: 2,
      assistantMessageCount: 2,
      toolCallCount: 2,
      fileChangeCount: 3,
      totalTokens: 5400,
      duration: 210000,
    },
    startedAt: new Date(Date.now() - 259200000),
    endedAt: new Date(Date.now() - 258990000),
    isActive: false,
  },
  {
    id: 'sess-007',
    harness: 'continue',
    metadata: {
      title: 'Configure ESLint flat config',
      project: 'web-dashboard',
      projectPath: '~/Code/web-dashboard',
      tags: ['config', 'eslint', 'tooling'],
    },
    messages: [
      {
        id: 'msg-007-1',
        role: 'user',
        content: 'Migrate our ESLint config to the new flat config format.',
        timestamp: new Date(Date.now() - 432000000),
      },
      {
        id: 'msg-007-2',
        role: 'assistant',
        content:
          "I'll convert the .eslintrc.json to eslint.config.js using the flat config format.",
        timestamp: new Date(Date.now() - 431990000),
        fileChanges: [
          {
            type: 'create',
            path: 'eslint.config.js',
            linesAdded: 65,
          },
          {
            type: 'delete',
            path: '.eslintrc.json',
          },
        ],
      },
    ],
    stats: {
      messageCount: 2,
      userMessageCount: 1,
      assistantMessageCount: 1,
      toolCallCount: 0,
      fileChangeCount: 2,
      totalTokens: 1200,
      duration: 10000,
    },
    startedAt: new Date(Date.now() - 432000000),
    endedAt: new Date(Date.now() - 431990000),
    isActive: false,
  },
  {
    id: 'sess-008',
    harness: 'aider',
    metadata: {
      title: 'Add dark mode to marketing site',
      project: 'marketing-site',
      projectPath: '~/Code/marketing-site',
      tags: ['ui', 'dark-mode', 'css'],
    },
    messages: [
      {
        id: 'msg-008-1',
        role: 'user',
        content: 'Add dark mode support using CSS custom properties.',
        timestamp: new Date(Date.now() - 518400000),
      },
      {
        id: 'msg-008-2',
        role: 'assistant',
        content: "I'll set up CSS custom properties for theming and add a dark mode toggle.",
        timestamp: new Date(Date.now() - 518390000),
        fileChanges: [
          {
            type: 'modify',
            path: 'src/styles/globals.css',
            linesAdded: 40,
            linesRemoved: 5,
          },
          {
            type: 'create',
            path: 'src/components/ThemeToggle.tsx',
            linesAdded: 35,
          },
        ],
      },
    ],
    stats: {
      messageCount: 2,
      userMessageCount: 1,
      assistantMessageCount: 1,
      toolCallCount: 0,
      fileChangeCount: 2,
      totalTokens: 1600,
      duration: 10000,
    },
    startedAt: new Date(Date.now() - 518400000),
    endedAt: new Date(Date.now() - 518390000),
    isActive: false,
  },
  {
    id: 'sess-009',
    harness: 'claude-code',
    metadata: {
      title: 'Build learnings browser UI',
      project: 'agent-config-manager',
      projectPath: '~/Code/agent-config-manager',
      tags: ['feature', 'ui', 'learnings'],
    },
    messages: [
      {
        id: 'msg-009-1',
        role: 'user',
        content: 'Implement the learnings browser with search, category filters, and export.',
        timestamp: new Date(Date.now() - 3600000),
      },
      {
        id: 'msg-009-2',
        role: 'assistant',
        content:
          "I'll create the learnings browser following the same two-panel pattern as the project context page.",
        timestamp: new Date(Date.now() - 3590000),
        toolCalls: [
          {
            id: 'tc-009',
            name: 'Write',
            input: { file_path: 'src/features/memory/learnings/LearningsPage.tsx' },
            output: 'File created',
            status: 'success',
            duration: 200,
            timestamp: new Date(Date.now() - 3585000),
          },
        ],
        fileChanges: [
          {
            type: 'create',
            path: 'src/features/memory/learnings/LearningsPage.tsx',
            linesAdded: 120,
          },
        ],
      },
    ],
    stats: {
      messageCount: 2,
      userMessageCount: 1,
      assistantMessageCount: 1,
      toolCallCount: 1,
      fileChangeCount: 1,
      totalTokens: 1900,
      duration: 15000,
    },
    startedAt: new Date(Date.now() - 3600000),
    isActive: true,
    filePath: '~/.claude/projects/-Users-agent-config-manager/sess-009.jsonl',
  },
  {
    id: 'sess-010',
    harness: 'cursor',
    metadata: {
      title: 'Fix TypeScript strict mode errors',
      project: 'agent-config-manager',
      projectPath: '~/Code/agent-config-manager',
      tags: ['bugfix', 'typescript'],
    },
    messages: [
      {
        id: 'msg-010-1',
        role: 'user',
        content: 'Fix all the strict mode TypeScript errors in the codebase.',
        timestamp: new Date(Date.now() - 129600000),
      },
      {
        id: 'msg-010-2',
        role: 'assistant',
        content: "I'll go through each error and add proper type annotations and null checks.",
        timestamp: new Date(Date.now() - 129590000),
        fileChanges: [
          {
            type: 'modify',
            path: 'src/adapters/claude-code.ts',
            linesAdded: 8,
            linesRemoved: 4,
          },
          {
            type: 'modify',
            path: 'src/adapters/cursor.ts',
            linesAdded: 6,
            linesRemoved: 3,
          },
          {
            type: 'modify',
            path: 'src/lib/utils.ts',
            linesAdded: 4,
            linesRemoved: 2,
          },
        ],
      },
    ],
    stats: {
      messageCount: 2,
      userMessageCount: 1,
      assistantMessageCount: 1,
      toolCallCount: 0,
      fileChangeCount: 3,
      totalTokens: 2200,
      duration: 10000,
    },
    startedAt: new Date(Date.now() - 129600000),
    endedAt: new Date(Date.now() - 129590000),
    isActive: false,
  },
]

/**
 * List sessions, optionally filtered and sorted.
 */
export async function listSessions(
  options?: SessionFilterOptions,
  sort?: SessionSortOptions
): Promise<SessionSummary[]> {
  await new Promise((resolve) => setTimeout(resolve, 150))

  let filtered = MOCK_SESSIONS

  if (options?.harness) {
    const harnesses = Array.isArray(options.harness) ? options.harness : [options.harness]
    filtered = filtered.filter((s) => harnesses.includes(s.harness))
  }
  if (options?.project) {
    const q = options.project.toLowerCase()
    filtered = filtered.filter((s) => s.metadata.project?.toLowerCase() === q)
  }
  if (options?.startDate) {
    filtered = filtered.filter((s) => s.startedAt >= options.startDate!)
  }
  if (options?.endDate) {
    filtered = filtered.filter((s) => s.startedAt <= options.endDate!)
  }
  if (options?.tags && options.tags.length > 0) {
    filtered = filtered.filter((s) => options.tags!.some((tag) => s.metadata.tags?.includes(tag)))
  }
  if (options?.searchText) {
    const q = options.searchText.toLowerCase()
    filtered = filtered.filter(
      (s) =>
        s.metadata.title.toLowerCase().includes(q) ||
        s.metadata.project?.toLowerCase().includes(q) ||
        s.metadata.tags?.some((t) => t.toLowerCase().includes(q)) ||
        s.messages.some((m) => m.content.toLowerCase().includes(q))
    )
  }
  if (options?.activeOnly) {
    filtered = filtered.filter((s) => s.isActive)
  }

  // Sort
  const sortBy = sort?.sortBy ?? 'recent'
  const sortOrder = sort?.sortOrder ?? 'desc'
  const multiplier = sortOrder === 'desc' ? -1 : 1

  const sorted = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case 'duration':
        return (a.stats.duration - b.stats.duration) * multiplier
      case 'messages':
        return (a.stats.messageCount - b.stats.messageCount) * multiplier
      case 'recent':
      default:
        return (a.startedAt.getTime() - b.startedAt.getTime()) * multiplier
    }
  })

  return sorted.map((s) => ({
    id: s.id,
    harness: s.harness,
    title: s.metadata.title,
    project: s.metadata.project,
    startedAt: s.startedAt,
    endedAt: s.endedAt,
    duration: s.stats.duration,
    messageCount: s.stats.messageCount,
    lastMessagePreview: s.messages[s.messages.length - 1]?.content.slice(0, 120),
    tags: s.metadata.tags,
  }))
}

/**
 * Get full session by ID.
 */
export async function getSession(id: string): Promise<Session | null> {
  await new Promise((resolve) => setTimeout(resolve, 50))
  return MOCK_SESSIONS.find((s) => s.id === id) ?? null
}

/**
 * Get aggregate session list statistics.
 */
export async function getSessionListStats(): Promise<SessionListStats> {
  await new Promise((resolve) => setTimeout(resolve, 100))

  const harnessMap = new Map<HarnessType, number>()
  let totalMessages = 0

  for (const s of MOCK_SESSIONS) {
    harnessMap.set(s.harness, (harnessMap.get(s.harness) ?? 0) + 1)
    totalMessages += s.stats.messageCount
  }

  const projects = [
    ...new Set(
      MOCK_SESSIONS.map((s) => s.metadata.project).filter((p): p is string => p !== undefined)
    ),
  ].sort()

  return {
    totalSessions: MOCK_SESSIONS.length,
    activeSessions: MOCK_SESSIONS.filter((s) => s.isActive).length,
    totalMessages,
    byHarness: Array.from(harnessMap.entries()).map(([harness, count]) => ({
      harness,
      count,
    })),
    projects,
  }
}
