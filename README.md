# Agent Config Manager

A unified UI for managing configurations, memory, hooks, and skills across multiple AI coding harnesses.

![Status](https://img.shields.io/badge/status-in%20development-yellow)
![License](https://img.shields.io/badge/license-MIT-blue)

## Supported Harnesses

| Harness | Status | Features |
|---------|--------|----------|
| Claude Code | Planned | Settings, Skills, Hooks, Sessions, Memory |
| Cursor | Planned | Settings, Rules, Skills, Memory |
| GitHub Copilot | Planned | Settings, Instructions |
| Cline | Planned | Settings, Tasks |
| Continue | Planned | Settings, Commands, Index |
| Aider | Planned | Settings, History |

## Features

- **Multi-Harness Dashboard** - Switch between and manage multiple AI coding assistants
- **Conversation Browser** - Search and browse session history across harnesses
- **Skill/Command Viewer** - Browse, search, and edit skill definitions
- **Tool Registry** - View available tools and MCP server status
- **Memory Management** - Manage sessions, learnings, and project context
- **Hooks Configuration** - Create, edit, and test automation hooks
- **Settings Editor** - Visual editor for all configuration files
- **Cross-Harness Migration** - Transfer configs between harnesses
- **Unified Search** - Command palette searching across all content

## Tech Stack

- **Frontend:** React 19 + TypeScript + Vite
- **UI:** shadcn/ui + Tailwind CSS (planned)
- **State:** Zustand + TanStack Query (planned)
- **Code Editor:** Monaco Editor (planned)
- **Charts:** Recharts (planned)

## Getting Started

```bash
# Clone the repository
git clone https://github.com/jpequegn/agent-config-manager.git
cd agent-config-manager

# Install dependencies
bun install

# Start development server
bun dev
```

## Project Structure

```
src/
├── adapters/       # Harness-specific adapters
├── components/     # Reusable UI components
├── features/       # Feature modules
├── services/       # Core services
├── stores/         # Zustand stores
├── hooks/          # React hooks
├── types/          # TypeScript types
└── utils/          # Utilities
```

## Development

See [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) for the full development roadmap.

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## License

MIT
