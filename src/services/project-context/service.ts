/**
 * Project Context Service
 * Scans for and manages project-level context files (CLAUDE.md, .cursorrules, etc.)
 */

import type { HarnessType, ProjectContext, ProjectContextFile } from '@/types'

/** Aggregate stats across all projects */
export interface ProjectContextStats {
  totalProjects: number
  totalContextFiles: number
  totalSize: number
  byHarness: { harness: HarnessType; count: number }[]
}

/** Known context file patterns per harness */
const CONTEXT_FILE_PATTERNS: {
  fileName: string
  type: ProjectContextFile['type']
  harness: HarnessType
}[] = [
  { fileName: 'CLAUDE.md', type: 'claude-md', harness: 'claude-code' },
  { fileName: '.cursorrules', type: 'cursorrules', harness: 'cursor' },
  { fileName: '.github/copilot-instructions.md', type: 'copilot-instructions', harness: 'copilot' },
  { fileName: '.aider.conf.yml', type: 'other', harness: 'aider' },
  { fileName: '.continuerc.json', type: 'other', harness: 'continue' },
]

/** Mock project data for development */
const MOCK_PROJECTS: ProjectContext[] = [
  {
    projectName: 'agent-config-manager',
    projectPath: '~/Code/agent-config-manager',
    lastModified: new Date(Date.now() - 3600000),
    contextFiles: [
      {
        type: 'claude-md',
        fileName: 'CLAUDE.md',
        filePath: '~/Code/agent-config-manager/CLAUDE.md',
        size: 4096,
        harness: 'claude-code',
        lastModified: new Date(Date.now() - 3600000),
      },
      {
        type: 'cursorrules',
        fileName: '.cursorrules',
        filePath: '~/Code/agent-config-manager/.cursorrules',
        size: 2048,
        harness: 'cursor',
        lastModified: new Date(Date.now() - 86400000),
      },
    ],
  },
  {
    projectName: 'web-dashboard',
    projectPath: '~/Code/web-dashboard',
    lastModified: new Date(Date.now() - 7200000),
    contextFiles: [
      {
        type: 'claude-md',
        fileName: 'CLAUDE.md',
        filePath: '~/Code/web-dashboard/CLAUDE.md',
        size: 8192,
        harness: 'claude-code',
        lastModified: new Date(Date.now() - 7200000),
      },
      {
        type: 'copilot-instructions',
        fileName: '.github/copilot-instructions.md',
        filePath: '~/Code/web-dashboard/.github/copilot-instructions.md',
        size: 3072,
        harness: 'copilot',
        lastModified: new Date(Date.now() - 172800000),
      },
      {
        type: 'cursorrules',
        fileName: '.cursorrules',
        filePath: '~/Code/web-dashboard/.cursorrules',
        size: 1536,
        harness: 'cursor',
        lastModified: new Date(Date.now() - 259200000),
      },
    ],
  },
  {
    projectName: 'api-server',
    projectPath: '~/Code/api-server',
    lastModified: new Date(Date.now() - 86400000),
    contextFiles: [
      {
        type: 'claude-md',
        fileName: 'CLAUDE.md',
        filePath: '~/Code/api-server/CLAUDE.md',
        size: 6144,
        harness: 'claude-code',
        lastModified: new Date(Date.now() - 86400000),
      },
      {
        type: 'other',
        fileName: '.aider.conf.yml',
        filePath: '~/Code/api-server/.aider.conf.yml',
        size: 512,
        harness: 'aider',
        lastModified: new Date(Date.now() - 604800000),
      },
    ],
  },
  {
    projectName: 'mobile-app',
    projectPath: '~/Code/mobile-app',
    lastModified: new Date(Date.now() - 172800000),
    contextFiles: [
      {
        type: 'cursorrules',
        fileName: '.cursorrules',
        filePath: '~/Code/mobile-app/.cursorrules',
        size: 3584,
        harness: 'cursor',
        lastModified: new Date(Date.now() - 172800000),
      },
      {
        type: 'other',
        fileName: '.continuerc.json',
        filePath: '~/Code/mobile-app/.continuerc.json',
        size: 1024,
        harness: 'continue',
        lastModified: new Date(Date.now() - 345600000),
      },
    ],
  },
  {
    projectName: 'data-pipeline',
    projectPath: '~/Code/data-pipeline',
    lastModified: new Date(Date.now() - 604800000),
    contextFiles: [
      {
        type: 'claude-md',
        fileName: 'CLAUDE.md',
        filePath: '~/Code/data-pipeline/CLAUDE.md',
        size: 2048,
        harness: 'claude-code',
        lastModified: new Date(Date.now() - 604800000),
      },
    ],
  },
]

/** Mock file content for context files */
const MOCK_FILE_CONTENT: Record<string, string> = {
  '~/Code/agent-config-manager/CLAUDE.md': `# Agent Config Manager

## Project Overview
A unified UI for managing AI coding agent configurations across multiple harnesses.

## Tech Stack
- React 19 + TypeScript 5.9
- Vite 7.2 for build tooling
- Tailwind CSS 4 + shadcn/ui
- Zustand for state management

## Architecture
- \`src/adapters/\` - Harness-specific implementations
- \`src/components/\` - React UI components
- \`src/features/\` - Feature modules
- \`src/stores/\` - Zustand state stores
- \`src/services/\` - Core business logic
- \`src/types/\` - TypeScript type definitions

## Conventions
- Use TypeScript strict mode
- Follow existing adapter pattern for new harnesses
- Use Zustand with devtools + persist middleware
- Components use shadcn/ui primitives
`,
  '~/Code/agent-config-manager/.cursorrules': `You are an expert TypeScript and React developer.
Follow the existing patterns in the codebase.
Use Tailwind CSS for styling.
Prefer functional components with hooks.
Use Zustand for state management.
`,
  '~/Code/web-dashboard/CLAUDE.md': `# Web Dashboard

## Overview
Internal analytics dashboard built with Next.js and D3.

## Key Patterns
- Server components for data fetching
- Client components for interactive charts
- PostgreSQL with Prisma ORM
`,
  '~/Code/web-dashboard/.github/copilot-instructions.md': `Use Next.js App Router patterns.
Prefer server components where possible.
Use Prisma for database queries.
Follow the existing component structure in src/components/.
`,
  '~/Code/web-dashboard/.cursorrules': `TypeScript and Next.js project.
Use Tailwind CSS for styling.
Database queries via Prisma.
`,
  '~/Code/api-server/CLAUDE.md': `# API Server

## Overview
REST API built with Express.js and TypeScript.

## Architecture
- Controllers handle HTTP logic
- Services contain business logic
- Repositories handle data access
- Middleware for auth, logging, error handling
`,
  '~/Code/api-server/.aider.conf.yml': `model: claude-sonnet-4-20250514
edit-format: diff
auto-commits: true
`,
  '~/Code/mobile-app/.cursorrules': `React Native project using Expo.
Use TypeScript for all new files.
Follow the existing navigation structure.
Use React Query for server state.
`,
  '~/Code/mobile-app/.continuerc.json': `{
  "models": [{ "title": "Claude Sonnet", "provider": "anthropic" }],
  "tabAutocompleteModel": { "title": "Codestral", "provider": "mistral" }
}`,
  '~/Code/data-pipeline/CLAUDE.md': `# Data Pipeline

## Overview
ETL pipeline using Python and Apache Airflow.

## Key Patterns
- DAGs defined in dags/ directory
- Custom operators in plugins/
- Tests use pytest
`,
}

/**
 * Scan filesystem for projects containing context files.
 * Returns mock data in development.
 */
export async function scanProjects(): Promise<ProjectContext[]> {
  // Simulate async scan delay
  await new Promise((resolve) => setTimeout(resolve, 300))
  return MOCK_PROJECTS
}

/**
 * Get context details for a specific project.
 */
export async function getProjectContext(projectPath: string): Promise<ProjectContext | null> {
  await new Promise((resolve) => setTimeout(resolve, 100))
  return MOCK_PROJECTS.find((p) => p.projectPath === projectPath) ?? null
}

/**
 * Read the content of a context file.
 */
export async function getContextFileContent(filePath: string): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, 50))
  return MOCK_FILE_CONTENT[filePath] ?? '# File not found\n\nNo content available.'
}

/**
 * Get aggregate statistics across all discovered projects.
 */
export async function getProjectStats(): Promise<ProjectContextStats> {
  const projects = await scanProjects()

  const allFiles = projects.flatMap((p) => p.contextFiles)
  const harnessMap = new Map<HarnessType, number>()

  for (const file of allFiles) {
    harnessMap.set(file.harness, (harnessMap.get(file.harness) ?? 0) + 1)
  }

  return {
    totalProjects: projects.length,
    totalContextFiles: allFiles.length,
    totalSize: allFiles.reduce((sum, f) => sum + f.size, 0),
    byHarness: Array.from(harnessMap.entries()).map(([harness, count]) => ({
      harness,
      count,
    })),
  }
}

/** Export the known context file patterns for use in detection */
export { CONTEXT_FILE_PATTERNS }
