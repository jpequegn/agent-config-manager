# Agent Config Manager

A unified UI for managing configurations, memory, hooks, and skills across multiple AI coding harnesses.

[![CI](https://github.com/jpequegn/agent-config-manager/actions/workflows/ci.yml/badge.svg)](https://github.com/jpequegn/agent-config-manager/actions/workflows/ci.yml)
![Status](https://img.shields.io/badge/status-in%20development-yellow)
![License](https://img.shields.io/badge/license-MIT-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)
![React](https://img.shields.io/badge/React-19-61dafb)

---

## What is this?

Agent Config Manager is a desktop-grade web app that gives you one place to manage everything across multiple AI coding assistants — Claude Code, Cursor, Copilot, Cline, Continue, and Aider. Instead of hunting through scattered config files and directories, everything is a click away.

---

## Features

### Memory & Knowledge
- **Memory Dashboard** — Storage health, usage breakdown by harness, quick stats at a glance
- **Session Memory** — Browse, filter, and bulk-export past AI sessions; prune old sessions automatically
- **Learnings** — Searchable knowledge base of insights captured across sessions, organized by category
- **Project Context** — View and edit per-project CLAUDE.md / context files with live preview
- **External Context** — Manage portable context stored on external drives

### Configuration
- **Settings Editor** — Visual editor for all harness configuration files with inline editing, diff preview, and reset to defaults
- **Skills Manager** — Browse, create, and edit skills / slash commands with syntax highlighting
- **Tools Registry** — Inventory of available tools and MCP server status across harnesses
- **Hooks System** — Create, toggle, reorder, and test automation hooks with a live log viewer

### Workflows
- **Unified Search** — Command palette (⌘K) that searches across sessions, skills, settings, tools, hooks, and learnings simultaneously
- **Cross-Harness Migration** — Wizard-style tool for transferring configs, skills, and settings between harnesses with compatibility checks and rollback support
- **Sync & Backup** — Scheduled backups with rotation management, restore points, and per-harness sync status
- **Notifications & Alerts** — Real-time toast notifications with history and alert management

---

## Supported Harnesses

| Harness | Config Path | Notes |
|---------|-------------|-------|
| **Claude Code** | `~/.claude/` | Full support: settings, skills, hooks, sessions, memory |
| **Cursor** | `~/.cursor/` | Settings, rules, skills, memory |
| **GitHub Copilot** | VS Code settings | Settings, instructions.md |
| **Cline** | `~/.cline/` | Settings, task history |
| **Continue** | `~/.continue/` | Settings, slash commands, index |
| **Aider** | `~/.aider.conf.yml` | Settings, history |

Harnesses are auto-detected on startup from your home directory.

---

## Getting Started

### Install from npm (recommended)

```bash
npm install -g agent-config-manager
agent-config-manager
```

The app opens automatically in your browser at `http://localhost:5173`.

### Run without installing

```bash
npx agent-config-manager
```

### Local development

```bash
# Clone the repository
git clone https://github.com/jpequegn/agent-config-manager.git
cd agent-config-manager

# Install dependencies (recommended: bun)
bun install

# Start the development server
bun dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
bun run build
bun run preview   # preview the production build locally
```

---

## Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── layout/           # AppShell, header, sidebar
│   ├── notifications/    # Toast container
│   ├── shared/           # MarkdownRenderer, VirtualList
│   └── ui/               # shadcn/ui primitives (button, input, …)
├── features/             # Feature modules (one folder per tab)
│   ├── conversations/    # Session browser
│   ├── hooks/            # Hooks manager + log viewer
│   ├── memory/           # Dashboard, learnings, sessions, project context, external context
│   ├── migration/        # Cross-harness migration wizard
│   ├── notifications/    # Notifications & alerts page
│   ├── settings/         # Settings editor
│   ├── skills/           # Skills manager
│   ├── sync-backup/      # Sync & backup manager
│   └── tools/            # Tools registry
├── lib/                  # Utilities (cn, formatRelativeTime, reportWebVitals, …)
├── services/             # Data access layer (mock + filesystem)
│   ├── detection/        # Harness auto-detection
│   ├── filesystem/       # File system abstraction
│   ├── hooks/            # Hooks CRUD
│   ├── learnings/        # Learnings CRUD
│   ├── migration/        # Migration engine
│   ├── notifications/    # Notification service
│   ├── project-context/  # Project context reader
│   ├── search/           # Unified search
│   ├── sessions/         # Session reader
│   ├── settings/         # Settings reader/writer
│   ├── skills/           # Skills CRUD
│   ├── sync-backup/      # Backup & sync service
│   └── tools/            # Tools registry
├── stores/               # Zustand state stores (one per feature)
├── types/                # Shared TypeScript types
└── test/                 # Test utilities and setup
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript 5.9 |
| Build | Vite 7 |
| Styling | Tailwind CSS 4 + shadcn/ui |
| State | Zustand 5 |
| Code Editor | Monaco Editor |
| Charts | Recharts |
| Virtualization | @tanstack/react-virtual |
| Testing | Vitest + Testing Library |
| Package Manager | Bun |

---

## Development

```bash
bun dev             # start dev server (hot reload)
bun run build       # production build
bun run test        # watch mode tests
bun run test:run    # single-pass tests
bun run lint        # ESLint check
bun run lint:fix    # ESLint auto-fix
bun run format      # Prettier format all files
```

### Running Tests

```bash
bun run test:run          # all tests
bun run test:coverage     # with coverage report
```

All 1200+ tests run in under 25 seconds using Vitest in jsdom.

---

## Documentation

| Document | Description |
|----------|-------------|
| [Changelog](./CHANGELOG.md) | Release history and what's new |
| [User Guide](./docs/USER_GUIDE.md) | Feature walkthroughs, keyboard shortcuts, and workflows |
| [Plugin API](./docs/PLUGIN_API.md) | How to write a custom harness adapter |
| [Contributing](./CONTRIBUTING.md) | Contribution guidelines and PR process |
| [Troubleshooting](./docs/TROUBLESHOOTING.md) | Common issues and solutions |

---

## Contributing

Contributions are welcome! See [CONTRIBUTING.md](./CONTRIBUTING.md) for how to get started.

---

## License

MIT
