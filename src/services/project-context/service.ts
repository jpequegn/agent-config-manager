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

/** Validation error for context files */
export interface ContextFileValidationError {
  line?: number
  message: string
  severity: 'error' | 'warning'
}

/** Validation result */
export interface ContextFileValidationResult {
  valid: boolean
  errors: ContextFileValidationError[]
}

/** Context file template */
export interface ContextFileTemplate {
  id: string
  name: string
  description: string
  fileType: ProjectContextFile['type']
  harness: HarnessType
  fileName: string
  content: string
}

/** Built-in templates */
const CONTEXT_TEMPLATES: ContextFileTemplate[] = [
  {
    id: 'claude-md-basic',
    name: 'CLAUDE.md - Basic',
    description: 'Basic project context for Claude Code',
    fileType: 'claude-md',
    harness: 'claude-code',
    fileName: 'CLAUDE.md',
    content: `# Project Name

## Overview
Brief description of what this project does.

## Tech Stack
- Language/framework
- Key dependencies

## Architecture
- \`src/\` - Source code
- \`tests/\` - Test files

## Conventions
- Follow existing patterns
- Use TypeScript strict mode
`,
  },
  {
    id: 'claude-md-detailed',
    name: 'CLAUDE.md - Detailed',
    description: 'Comprehensive context with architecture and guidelines',
    fileType: 'claude-md',
    harness: 'claude-code',
    fileName: 'CLAUDE.md',
    content: `# Project Name

## Overview
Brief description of what this project does and its purpose.

## Tech Stack
- **Language:** TypeScript
- **Framework:** React
- **Build Tool:** Vite
- **Styling:** Tailwind CSS

## Architecture
- \`src/components/\` - React UI components
- \`src/features/\` - Feature modules
- \`src/services/\` - Business logic and API calls
- \`src/stores/\` - State management
- \`src/types/\` - TypeScript type definitions
- \`src/lib/\` - Shared utilities

## Conventions
- Use TypeScript strict mode
- Prefer functional components with hooks
- Follow existing patterns in the codebase
- Write tests for new features

## Common Tasks
- \`npm run dev\` - Start development server
- \`npm run build\` - Build for production
- \`npm run test\` - Run tests
`,
  },
  {
    id: 'cursorrules-basic',
    name: '.cursorrules - Basic',
    description: 'Basic rules for Cursor AI assistant',
    fileType: 'cursorrules',
    harness: 'cursor',
    fileName: '.cursorrules',
    content: `You are an expert developer working on this project.
Follow the existing patterns in the codebase.
Use TypeScript for all new files.
Prefer functional components with hooks.
Write clean, readable code with meaningful variable names.
`,
  },
  {
    id: 'cursorrules-detailed',
    name: '.cursorrules - Detailed',
    description: 'Comprehensive rules with tech stack and style preferences',
    fileType: 'cursorrules',
    harness: 'cursor',
    fileName: '.cursorrules',
    content: `You are an expert TypeScript and React developer.

## Tech Stack
- React with TypeScript
- Tailwind CSS for styling
- Zustand for state management
- Vitest for testing

## Code Style
- Use functional components with hooks
- Prefer named exports over default exports
- Use descriptive variable and function names
- Keep components focused and small

## Patterns
- Follow existing patterns in the codebase
- Use custom hooks for reusable logic
- Prefer composition over inheritance
- Handle errors gracefully
`,
  },
  {
    id: 'copilot-instructions',
    name: 'Copilot Instructions',
    description: 'Instructions for GitHub Copilot',
    fileType: 'copilot-instructions',
    harness: 'copilot',
    fileName: '.github/copilot-instructions.md',
    content: `Use TypeScript for all new code.
Follow the existing project structure.
Prefer functional components with hooks.
Use Tailwind CSS for styling.
Write comprehensive tests for new features.
`,
  },
  {
    id: 'aider-config',
    name: 'Aider Config',
    description: 'Configuration for Aider AI assistant',
    fileType: 'other',
    harness: 'aider',
    fileName: '.aider.conf.yml',
    content: `model: claude-sonnet-4-20250514
edit-format: diff
auto-commits: true
auto-lint: true
`,
  },
  {
    id: 'continue-config',
    name: 'Continue Config',
    description: 'Configuration for Continue AI assistant',
    fileType: 'other',
    harness: 'continue',
    fileName: '.continuerc.json',
    content: `{
  "models": [
    {
      "title": "Claude Sonnet",
      "provider": "anthropic",
      "model": "claude-sonnet-4-20250514"
    }
  ],
  "tabAutocompleteModel": {
    "title": "Codestral",
    "provider": "mistral"
  }
}`,
  },
]

/**
 * Get available templates for context files.
 */
export function getContextTemplates(): ContextFileTemplate[] {
  return CONTEXT_TEMPLATES
}

/**
 * Get templates filtered by harness type.
 */
export function getTemplatesForHarness(harness: HarnessType): ContextFileTemplate[] {
  return CONTEXT_TEMPLATES.filter((t) => t.harness === harness)
}

/**
 * Validate context file content based on its type.
 */
export function validateContextFile(
  content: string,
  _fileType: ProjectContextFile['type'],
  fileName: string
): ContextFileValidationResult {
  const errors: ContextFileValidationError[] = []

  // Empty content check
  if (!content.trim()) {
    errors.push({ message: 'File content cannot be empty', severity: 'error' })
    return { valid: false, errors }
  }

  // JSON validation for .continuerc.json and similar
  if (fileName.endsWith('.json')) {
    try {
      JSON.parse(content)
    } catch (e) {
      const msg = e instanceof SyntaxError ? e.message : 'Invalid JSON'
      errors.push({ message: `JSON syntax error: ${msg}`, severity: 'error' })
    }
  }

  // YAML basic validation for .aider.conf.yml and similar
  if (fileName.endsWith('.yml') || fileName.endsWith('.yaml')) {
    const lines = content.split('\n')
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      // Check for tabs (YAML uses spaces)
      if (line.startsWith('\t')) {
        errors.push({
          line: i + 1,
          message: 'YAML files should use spaces, not tabs',
          severity: 'error',
        })
      }
    }
  }

  // Markdown validation for .md files
  if (fileName.endsWith('.md')) {
    // Warn if no heading found
    if (!content.match(/^#\s+/m)) {
      errors.push({
        message: 'Markdown file should start with a heading (# Title)',
        severity: 'warning',
      })
    }
  }

  // Size check
  if (content.length > 50000) {
    errors.push({
      message: `File is very large (${Math.round(content.length / 1024)}KB). Consider splitting into smaller files.`,
      severity: 'warning',
    })
  }

  return {
    valid: errors.filter((e) => e.severity === 'error').length === 0,
    errors,
  }
}

/**
 * Save context file content. In development, updates mock data in memory.
 */
export async function saveContextFile(
  filePath: string,
  content: string
): Promise<{ success: boolean; error?: string }> {
  await new Promise((resolve) => setTimeout(resolve, 100))

  // Update mock content
  MOCK_FILE_CONTENT[filePath] = content

  // Update file size in mock projects
  const newSize = new TextEncoder().encode(content).length
  for (const project of MOCK_PROJECTS) {
    for (const file of project.contextFiles) {
      if (file.filePath === filePath) {
        file.size = newSize
        file.lastModified = new Date()
        project.lastModified = new Date()
      }
    }
  }

  return { success: true }
}

/**
 * Create a new context file in a project. In development, adds to mock data.
 */
export async function createContextFile(
  projectPath: string,
  fileName: string,
  content: string,
  fileType: ProjectContextFile['type'],
  harness: HarnessType
): Promise<{ success: boolean; error?: string; file?: ProjectContextFile }> {
  await new Promise((resolve) => setTimeout(resolve, 100))

  const project = MOCK_PROJECTS.find((p) => p.projectPath === projectPath)
  if (!project) {
    return { success: false, error: 'Project not found' }
  }

  // Check if file already exists
  if (project.contextFiles.some((f) => f.fileName === fileName)) {
    return { success: false, error: `File ${fileName} already exists in this project` }
  }

  const filePath = `${projectPath}/${fileName}`
  const newFile: ProjectContextFile = {
    type: fileType,
    fileName,
    filePath,
    size: new TextEncoder().encode(content).length,
    harness,
    lastModified: new Date(),
  }

  project.contextFiles.push(newFile)
  project.lastModified = new Date()
  MOCK_FILE_CONTENT[filePath] = content

  return { success: true, file: newFile }
}

/** Export the known context file patterns for use in detection */
export { CONTEXT_FILE_PATTERNS }
