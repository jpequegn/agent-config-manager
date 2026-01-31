# Agent Config Manager - Implementation Plan

**Project:** Universal AI Coding Agent Configuration Manager
**Repository:** agent-config-manager
**Tech Stack:** React 18 + TypeScript + Vite + shadcn/ui + Tailwind CSS + Node.js

---

## Overview

A unified UI for managing configurations, memory, hooks, and skills across multiple AI coding harnesses (Claude Code, Cursor, Copilot, Cline, Continue, Aider).

---

## Phase 1: Foundation (Weeks 1-2)

### 1.1 Project Setup
- [ ] Initialize Vite + React + TypeScript project
- [ ] Configure Tailwind CSS and shadcn/ui
- [ ] Set up project structure (features-based)
- [ ] Configure ESLint, Prettier, and TypeScript strict mode
- [ ] Set up testing framework (Vitest + Testing Library)
- [ ] Create CI/CD pipeline (GitHub Actions)

### 1.2 Core Architecture
- [ ] Define TypeScript interfaces for all data models
- [ ] Create harness abstraction layer (HarnessAdapter interface)
- [ ] Implement file system service (read/write configs)
- [ ] Create state management setup (Zustand stores)
- [ ] Build error boundary and error handling utilities

### 1.3 Basic Shell UI
- [ ] Implement app shell with sidebar navigation
- [ ] Create harness selector tabs component
- [ ] Build command palette (cmd+K) foundation
- [ ] Implement dark theme with CSS variables
- [ ] Create reusable layout components

---

## Phase 2: Harness Detection & Adapters (Weeks 3-4)

### 2.1 Harness Detection System
- [ ] Build harness auto-detection service
- [ ] Implement config path resolution per OS (macOS, Linux, Windows)
- [ ] Create detection status indicators
- [ ] Build onboarding wizard flow

### 2.2 Claude Code Adapter
- [ ] Implement ClaudeCodeAdapter class
- [ ] Parse settings.json and keybindings.json
- [ ] Read skills from ~/.claude/skills/
- [ ] Parse hooks configuration
- [ ] Read project CLAUDE.md files
- [ ] Access session history

### 2.3 Cursor Adapter
- [ ] Implement CursorAdapter class
- [ ] Parse .cursor/settings.json
- [ ] Read .cursorrules files
- [ ] Detect Cursor-specific skills
- [ ] Handle Cursor memory format

### 2.4 Additional Adapters (Extensible)
- [ ] Implement CopilotAdapter (VS Code settings, instructions.md)
- [ ] Implement ClineAdapter (config.json, task history)
- [ ] Implement ContinueAdapter (config.json, slash commands)
- [ ] Implement AiderAdapter (.aider.conf.yml)
- [ ] Create adapter plugin system for community additions

---

## Phase 3: Core Features - Read Operations (Weeks 5-7)

### 3.1 Conversation Browser
- [ ] Build session list component with virtualization
- [ ] Implement session detail view with chat rendering
- [ ] Create markdown/code block renderer
- [ ] Add search and filter functionality
- [ ] Implement cross-harness session aggregation
- [ ] Add export functionality (JSON, Markdown)

### 3.2 Skill/Command Viewer
- [ ] Build skill tree navigation component
- [ ] Create skill detail panel with tabs
- [ ] Implement markdown renderer for skill content
- [ ] Add syntax highlighting for code blocks
- [ ] Build skill search functionality
- [ ] Show skill usage statistics

### 3.3 Tool Registry
- [ ] Build tool card grid component
- [ ] Create tool detail modal/panel
- [ ] Implement JSON schema viewer
- [ ] Add MCP server status display
- [ ] Build tool search and filtering
- [ ] Create tool testing interface (dry run)

### 3.4 Settings Viewer
- [ ] Build settings category tree
- [ ] Create settings form renderer
- [ ] Implement JSON/YAML viewer for raw configs
- [ ] Add settings search functionality

---

## Phase 4: Memory Management (Weeks 8-9)

### 4.1 Memory Dashboard
- [ ] Build storage overview with charts (recharts)
- [ ] Create per-harness storage breakdown
- [ ] Implement storage health indicators

### 4.2 Session Memory Management
- [ ] Build session list with selection
- [ ] Implement bulk operations (export, delete, archive)
- [ ] Create auto-prune settings UI
- [ ] Add session tagging functionality

### 4.3 Project Context Management
- [ ] Build project scanner
- [ ] Create project context file editor
- [ ] Implement template system for CLAUDE.md
- [ ] Add project quick-switch

### 4.4 Learnings Browser
- [ ] Build learnings tree by category
- [ ] Create learning detail viewer
- [ ] Implement learning search
- [ ] Add export/import for knowledge base

### 4.5 External Context Integration
- [ ] Detect external drives
- [ ] Build connection status UI
- [ ] Implement sync controls
- [ ] Create fallback handling for disconnected state

---

## Phase 5: Hooks Management (Weeks 10-11)

### 5.1 Hooks List & Management
- [ ] Build hooks list grouped by trigger type
- [ ] Create enable/disable toggles
- [ ] Implement drag-to-reorder for priority
- [ ] Add bulk operations

### 5.2 Hook Editor
- [ ] Build hook configuration form
- [ ] Integrate Monaco editor for script editing
- [ ] Implement syntax highlighting per language
- [ ] Create trigger type selector with tool matcher

### 5.3 Hook Testing & Logs
- [ ] Build hook test runner with sample inputs
- [ ] Create execution logs viewer
- [ ] Implement log filtering and search
- [ ] Add execution statistics charts

### 5.4 Hook Templates
- [ ] Build template gallery UI
- [ ] Create built-in templates (security, logging, notifications)
- [ ] Implement "use template" flow
- [ ] Add community template browser (future: registry)

---

## Phase 6: Write Operations & Editing (Weeks 12-13)

### 6.1 Settings Editor
- [ ] Implement inline setting editing
- [ ] Create validation with error display
- [ ] Build diff preview panel
- [ ] Add save/discard controls
- [ ] Implement "Reset to Default" per setting

### 6.2 Skill Editor
- [ ] Build skill creation wizard
- [ ] Implement skill markdown editor
- [ ] Add skill validation against spec
- [ ] Create skill duplication functionality
- [ ] Build skill enable/disable toggles

### 6.3 Hook Creator
- [ ] Build hook creation wizard
- [ ] Implement hook import from file/URL
- [ ] Create hook export functionality
- [ ] Add hook duplication

### 6.4 Project Context Editor
- [ ] Build CLAUDE.md editor with preview
- [ ] Implement .cursorrules editor
- [ ] Create template insertion
- [ ] Add validation and linting

---

## Phase 7: Advanced Features (Weeks 14-15)

### 7.1 Unified Search (Command Palette)
- [ ] Implement global search across all content types
- [ ] Build search result grouping and ranking
- [ ] Add command mode (> prefix)
- [ ] Create keyboard navigation
- [ ] Implement recent searches

### 7.2 Cross-Harness Migration
- [ ] Build migration wizard flow
- [ ] Implement compatibility detection
- [ ] Create config transformation logic
- [ ] Build diff preview for migrations
- [ ] Add backup/rollback functionality

### 7.3 Sync & Backup
- [ ] Implement config backup system
- [ ] Build restore from backup
- [ ] Create sync status indicators
- [ ] Add manual sync triggers

### 7.4 Notifications & Alerts
- [ ] Build notification system
- [ ] Create hook failure alerts
- [ ] Implement sync conflict notifications
- [ ] Add desktop notifications (optional)

---

## Phase 8: Polish & Release (Weeks 16-17)

### 8.1 Performance Optimization
- [ ] Implement virtualization for long lists
- [ ] Add lazy loading for heavy components
- [ ] Optimize re-renders with memoization
- [ ] Bundle size optimization

### 8.2 Accessibility
- [ ] Audit and fix ARIA attributes
- [ ] Implement keyboard navigation throughout
- [ ] Add screen reader announcements
- [ ] Test with accessibility tools

### 8.3 Documentation
- [ ] Write README with screenshots
- [ ] Create user guide
- [ ] Document adapter plugin API
- [ ] Add contributing guidelines

### 8.4 Testing & QA
- [ ] Write unit tests for adapters
- [ ] Add integration tests for file operations
- [ ] Create E2E tests for critical flows
- [ ] Cross-platform testing (macOS, Linux, Windows)

### 8.5 Release
- [ ] Create release workflow
- [ ] Build installers (npm package, standalone)
- [ ] Publish to npm
- [ ] Create demo video/GIFs

---

## Technical Architecture

### Directory Structure

```
agent-config-manager/
├── src/
│   ├── adapters/           # Harness-specific adapters
│   │   ├── base.ts         # HarnessAdapter interface
│   │   ├── claude-code.ts
│   │   ├── cursor.ts
│   │   ├── copilot.ts
│   │   └── ...
│   ├── components/         # Reusable UI components
│   │   ├── ui/             # shadcn/ui components
│   │   ├── layout/         # Shell, sidebar, etc.
│   │   └── shared/         # Common components
│   ├── features/           # Feature modules
│   │   ├── conversations/
│   │   ├── skills/
│   │   ├── tools/
│   │   ├── memory/
│   │   ├── hooks/
│   │   ├── settings/
│   │   └── migration/
│   ├── services/           # Core services
│   │   ├── filesystem.ts
│   │   ├── detection.ts
│   │   └── sync.ts
│   ├── stores/             # Zustand stores
│   ├── hooks/              # React hooks
│   ├── types/              # TypeScript types
│   └── utils/              # Utilities
├── electron/               # Electron main process (if standalone)
├── tests/
├── docs/
└── ...
```

### Key Interfaces

```typescript
interface HarnessAdapter {
  id: string;
  name: string;
  detect(): Promise<DetectionResult>;
  getSkills(): Promise<Skill[]>;
  getHooks(): Promise<Hook[]>;
  getSettings(): Promise<Settings>;
  getSessions(): Promise<Session[]>;
  getMemory(): Promise<MemoryInfo>;
  // Write operations
  saveSettings(settings: Settings): Promise<void>;
  saveSkill(skill: Skill): Promise<void>;
  saveHook(hook: Hook): Promise<void>;
}
```

---

## Dependencies

### Core
- react, react-dom (^18.x)
- typescript (^5.x)
- vite (^5.x)

### UI
- tailwindcss (^3.x)
- @shadcn/ui components
- lucide-react (icons)
- @radix-ui/* (primitives)

### State & Data
- zustand (state management)
- @tanstack/react-query (async state)
- zod (validation)

### Code Display
- @monaco-editor/react (code editing)
- react-markdown + remark-gfm (markdown)
- shiki or prism (syntax highlighting)

### Charts
- recharts (storage visualization)

### Utilities
- date-fns (dates)
- lodash-es (utilities)
- fast-glob (file discovery)

### Testing
- vitest
- @testing-library/react
- playwright (E2E)

### Optional (Standalone App)
- electron
- electron-builder

---

## Success Metrics

- [ ] Supports 3+ harnesses at launch (Claude Code, Cursor, Copilot)
- [ ] Sub-second navigation between views
- [ ] <5MB bundle size
- [ ] 80%+ test coverage on adapters
- [ ] Works on macOS, Linux, Windows
- [ ] Accessible (WCAG 2.1 AA)

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Harness config formats change | Abstract via adapters, version detection |
| File permission issues | Clear error messages, permission prompts |
| Large session histories slow UI | Virtualization, pagination, lazy loading |
| Cross-platform path differences | OS-specific path resolution utilities |
| Community adoption | Good docs, plugin system, demo content |

---

## Future Enhancements (Post-MVP)

- [ ] Cloud sync for configs
- [ ] Team sharing of skills/hooks
- [ ] AI-powered config recommendations
- [ ] Visual hook workflow builder (node-based)
- [ ] Plugin marketplace
- [ ] Mobile companion app (view-only)
