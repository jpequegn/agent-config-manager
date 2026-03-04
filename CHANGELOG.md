# Changelog

All notable changes to Agent Config Manager are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Versioning follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

---

## [0.1.0] - 2026-03-04

Initial release of Agent Config Manager.

### Added

**Memory & Knowledge**
- Memory Dashboard with storage health overview, usage donut chart, and per-harness stats
- Session Memory manager with bulk select, delete, archive, export, and auto-prune settings
- Learnings knowledge base with category filtering, search, import/export
- Project Context editor with Monaco editor, live markdown preview, and built-in templates
- External Context manager for portable context on external drives

**Configuration**
- Settings Editor with inline editing, diff preview, reset to defaults, and modified indicators
- Skills Manager with Monaco editor, syntax highlighting, and category organisation
- Tools Registry with harness filter, MCP-only filter, and usage stats
- Hooks System with trigger types, enable/disable toggle, regex tool matcher, community templates

**Workflows**
- Unified Search (⌘K) across sessions, skills, settings, tools, hooks, and learnings
- Cross-Harness Migration Wizard with compatibility analysis and one-click rollback
- Sync & Backup with rotation management, restore points, and per-harness sync status
- Notifications & Alerts with real-time toasts and alert history

**Supported Harnesses**
- Claude Code (`~/.claude/`)
- Cursor (`~/.cursor/`)
- GitHub Copilot (VS Code settings)
- Cline (`~/.cline/`)
- Continue (`~/.continue/`)
- Aider (`~/.aider.conf.yml`)

**Performance**
- Code splitting via React.lazy + Suspense for all 14 tab pages
- List virtualisation with @tanstack/react-virtual (10k+ items render smoothly)
- Component memoisation (React.memo, useMemo, useCallback) on hot-path components
- Manual Vite chunks for vendor libraries (React, Monaco, Recharts, Radix)
- Web Vitals monitoring built in

**Quality**
- 1 200+ unit tests across services, stores, and components
- 80%+ line coverage; service adapters at 84%+
- Full TypeScript strict mode
- ESLint + Prettier enforced via Husky pre-commit hooks
- GitHub Actions CI (lint → test → build) on every PR

**Documentation**
- [User Guide](./docs/USER_GUIDE.md) — complete feature walkthrough
- [Plugin API](./docs/PLUGIN_API.md) — how to write a custom harness adapter
- [Contributing](./CONTRIBUTING.md) — contribution guidelines and PR process
- [Troubleshooting](./docs/TROUBLESHOOTING.md) — common issues and solutions

### Technical Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript 5.9 |
| Build | Vite 7 |
| Styling | Tailwind CSS 4 + shadcn/ui |
| State | Zustand 5 |
| Code Editor | Monaco Editor |
| Charts | Recharts |
| Virtualisation | @tanstack/react-virtual |
| Testing | Vitest + Testing Library |
| Package Manager | Bun |

[Unreleased]: https://github.com/jpequegn/agent-config-manager/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/jpequegn/agent-config-manager/releases/tag/v0.1.0
