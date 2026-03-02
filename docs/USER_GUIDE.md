# User Guide

A complete walkthrough of every feature in Agent Config Manager.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Interface Overview](#interface-overview)
3. [Memory Dashboard](#memory-dashboard)
4. [External Context](#external-context)
5. [Project Context](#project-context)
6. [Learnings](#learnings)
7. [Session Memory](#session-memory)
8. [Sessions Browser](#sessions-browser)
9. [Hooks](#hooks)
10. [Hook Logs](#hook-logs)
11. [Skills](#skills)
12. [Tools](#tools)
13. [Migration Wizard](#migration-wizard)
14. [Sync & Backup](#sync--backup)
15. [Notifications](#notifications)
16. [Settings](#settings)
17. [Unified Search](#unified-search)
18. [Keyboard Shortcuts](#keyboard-shortcuts)

---

## Getting Started

### First Launch

1. Start the dev server: `bun dev`
2. Open [http://localhost:5173](http://localhost:5173)
3. The app auto-detects which AI harnesses are installed on your system by scanning standard config directories (`~/.claude/`, `~/.cursor/`, etc.)
4. The **Memory Dashboard** tab opens by default

### Harness Detection

Agent Config Manager checks the following paths on startup:

| Harness | Detected When |
|---------|--------------|
| Claude Code | `~/.claude/settings.json` exists |
| Cursor | `~/.cursor/` directory exists |
| GitHub Copilot | VS Code `settings.json` with Copilot config |
| Cline | `~/.cline/` directory exists |
| Continue | `~/.continue/config.json` exists |
| Aider | `~/.aider.conf.yml` exists |

If a harness is not detected, its data will show as empty but the UI is still accessible.

---

## Interface Overview

The header bar contains tabs for all features. Click a tab to switch views. You can also navigate tabs with the keyboard:

- `ArrowRight` / `ArrowDown` — move to the next tab
- `ArrowLeft` / `ArrowUp` — move to the previous tab
- `Home` — jump to the first tab
- `End` — jump to the last tab

A **Suspense fallback** spinner appears while a tab's code loads on first visit (code splitting).

---

## Memory Dashboard

**Tab:** Memory

Gives you a high-level overview of storage health across all harnesses.

### What you see
- **Storage Health Card** — Overall health status with a score indicator
- **Usage Donut Chart** — Visual breakdown of storage by harness
- **Harness Breakdown** — Per-harness storage stats: sessions count, learnings count, skills count

### Use cases
- Spot which harness is consuming the most memory
- Identify harnesses that have no data (not yet connected)
- Get a quick sanity check before running backups

---

## External Context

**Tab:** External

Manages context files stored on external drives or portable media (e.g., a USB drive at `$EXTERNAL_CONTEXT`).

### What you see
- **Drive list** — All connected external context sources
- **Drive detail** — Files and directories within the selected drive

### Use cases
- Work with context that travels between machines
- Review what context is stored on a connected drive
- Identify stale or missing external context sources

---

## Project Context

**Tab:** Project Context

Browse and edit per-project context files (e.g., `CLAUDE.md`, `.cursorrules`, `copilot-instructions.md`).

### Layout
- **Left panel** — Project list with search and harness filter
- **Right panel** — Context file viewer/editor with live markdown preview

### Editing a context file

1. Select a project from the left panel
2. The context file loads in the editor (Monaco-powered)
3. Make your edits
4. Click **Save** to write back to disk

### Templates

The editor includes built-in templates for common context patterns:
- **Basic** — Simple project description
- **Full** — Complete template with tech stack, commands, preferences, guidelines
- **Minimal** — Just the essentials

### Validation

The editor validates context files in real time and shows warnings for:
- Files that exceed the recommended size limit
- Missing required sections

---

## Learnings

**Tab:** Learnings

A searchable knowledge base of insights and patterns captured across your AI sessions.

### Layout
- **Left panel** — Filterable list of learnings grouped by category
- **Right panel** — Full content of the selected learning in rendered markdown

### Categories

| Category | Color | Description |
|----------|-------|-------------|
| Debugging | Red | Bug fixes and diagnostic insights |
| Architecture | Blue | System design decisions |
| Patterns | Purple | Reusable code patterns |
| Decisions | Amber | Trade-off choices and rationale |
| Preferences | Green | Personal workflow preferences |
| Errors | Orange | Error messages and their resolutions |
| Solutions | Teal | Working solutions to recurring problems |
| Other | Gray | Uncategorized entries |

### Searching

Type in the search box to filter learnings by title. Click a category badge to filter to that category only — click it again to clear.

### Exporting

Click **Export** to download all learnings as a JSON file.

### Importing

Click **Import** to load learnings from a JSON file. Duplicate IDs are skipped.

---

## Session Memory

**Tab:** Session Memory

Bulk management of past AI coding sessions — select, export, and prune.

### Layout
- **Left panel** — Selectable session list with checkboxes
- **Right panel** — Split into Bulk Actions and Export panels

### Selecting sessions

- Click a checkbox to select individual sessions
- Use **Select all** in the header to select all sessions at once

### Bulk Actions

With one or more sessions selected:
- **Delete selected** — Remove sessions permanently
- **Archive selected** — Move sessions to archive storage
- **Export selected** — Download as JSON

### Auto-Prune Settings

Configure automatic session pruning:
- **Max sessions** — Keep only the N most recent sessions
- **Max age** — Delete sessions older than N days
- **Auto-prune on startup** — Enable to run pruning automatically

---

## Sessions Browser

**Tab:** Sessions

Browse and read individual conversation histories.

### Layout
- **Left panel** — Session list with search and harness filter
- **Right panel** — Full conversation thread with rendered markdown and code blocks

### Searching

Use the search bar to filter sessions by title, project, or content.

### Filters

- **Harness** — Filter to a specific AI assistant
- **Date range** — Show only sessions within a date range
- **Has tags** — Filter by session tags

---

## Hooks

**Tab:** Hooks

Create and manage automation hooks that run before/after AI tool calls.

### Layout
- **Left panel** — Hook list grouped by trigger type
- **Right panel** — Hook detail with full configuration

### Trigger types

| Trigger | Fires when… |
|---------|-------------|
| `PreToolUse` | Before a tool is executed |
| `PostToolUse` | After a tool completes |
| `Notification` | When an AI notification is sent |
| `Stop` | When the AI agent stops |
| `SubagentStop` | When a sub-agent stops |

### Creating a hook

1. Click **New Hook** in the top bar
2. Fill in name, trigger type, and script path
3. Configure tool matcher (supports regex) and timeout
4. Click **Save**

### Enabling / disabling hooks

Toggle the switch on any hook row to enable or disable it without deleting it.

### Templates

The **Community Templates** panel provides ready-made hooks for common patterns:
- Sensitive file guards
- Test runners
- Lint-on-save
- Commit message formatters

---

## Hook Logs

**Tab:** Hook Logs

Live log viewer for hook execution history.

### Layout
- **Top bar** — Filter controls (trigger type, status, harness)
- **Main area** — Scrollable log of hook events

### Log entries

Each log entry shows:
- Timestamp
- Hook name and trigger
- Execution result: `allow`, `block`, or `error`
- Execution time in ms
- Expandable payload (tool name, arguments, output)

### Filtering

Filter by trigger type (PreToolUse, PostToolUse, etc.) or result status (allow/block/error).

---

## Skills

**Tab:** Skills

Browse and manage skills (slash commands) across all harnesses.

### Layout
- **Left panel** — Filterable skill list
- **Right panel** — Skill detail: metadata, content, edit interface

### Creating a skill

1. Click **New Skill**
2. Enter name, description, and category
3. Write the skill content in the Monaco editor
4. Add `USE WHEN` trigger phrases in the description
5. Click **Save**

### Skill categories

Skills are organized by category: Core, Memory, Search, Development, Testing, Documentation, and more.

### Editing

The editor provides full Monaco features including syntax highlighting, find/replace, and multi-cursor editing.

---

## Tools

**Tab:** Tools

View all tools and MCP servers available to your AI harnesses.

### Layout
- **Left panel** — Tool grid with search and filters
- **Right panel** — Tool detail with usage stats

### Filters

- **Harness** — Filter tools by which harness provides them
- **MCP only** — Show only tools from MCP servers
- **Search** — Filter by tool name or description

### Tool statuses

| Status | Meaning |
|--------|---------|
| `available` | Tool is ready to use |
| `disabled` | Tool is installed but turned off |
| `error` | Tool has a configuration problem |
| `deprecated` | Tool still works but will be removed |

---

## Migration Wizard

**Tab:** Migration

Transfer configuration, skills, hooks, and settings from one harness to another.

### Steps

1. **Select source** — Choose the harness to migrate from
2. **Select target** — Choose the destination harness
3. **Compatibility check** — The wizard analyses what can be migrated and flags incompatibilities
4. **Select items** — Pick exactly what to migrate (skills, hooks, settings, memory)
5. **Review & confirm** — Preview the changes before applying
6. **Result** — Summary of what was migrated, skipped, or failed

### Rollback

If migration produces unexpected results, use the **Rollback** button on the result page to undo all changes.

---

## Sync & Backup

**Tab:** Sync & Backup

Manage backups and keep harness configs in sync.

### Backup

- **Create backup** — Snapshot all harness configs right now
- **Backup list** — Browse, restore, or delete past backups
- **Rotation config** — Set max backup count and max age; old backups are pruned automatically

### Sync

Each harness shows a sync status indicator:
- `synced` — Config on disk matches last known state
- `modified` — Local changes haven't been committed
- `error` — Sync failed (check error message)

Click **Sync** next to a harness to push its current state to the backup store. Click **Sync All** to sync every harness at once.

### Restoring a backup

1. Find the backup in the list
2. Click **Restore**
3. Confirm the restore (this overwrites current config)

---

## Notifications

**Tab:** Notifications

View and manage system notifications and alerts.

### Layout
- **Alert list** — All active and past alerts with severity indicators
- **Toast notifications** — Pop-up notifications appear in the bottom-right corner of the screen

### Alert severities

| Level | Color | Meaning |
|-------|-------|---------|
| Info | Blue | Informational messages |
| Warning | Amber | Non-critical issues |
| Error | Red | Errors requiring attention |
| Success | Green | Completed operations |

### Dismissing notifications

Click the **×** on a toast to dismiss it immediately. Toasts also auto-dismiss after a timeout.

To clear all alerts, click **Clear all** in the Notifications tab.

---

## Settings

**Tab:** Settings

Visual editor for all harness configuration settings.

### Layout
- **Left panel** — Category list (General, Appearance, Editor, AI, Privacy, Advanced, Experimental)
- **Middle panel** — Setting rows for the selected category
- **Right panel** — Tree view and diff preview

### Editing a setting

1. Click a setting row to expand it
2. The inline editor appears (text input, toggle, select, JSON editor, etc.)
3. Make your change
4. Click **Apply** to save or **Reset** to restore the default value

### Diff preview

The **Diff** panel shows a before/after view of all pending changes before you write them to disk.

### Modified indicator

Settings that differ from their default value show a **modified** badge. The category list also shows a count of modified settings per category.

---

## Unified Search

**Shortcut:** `⌘K` (macOS) / `Ctrl+K` (Windows/Linux)

The command palette searches across all content simultaneously.

### What it searches

- Sessions (by title, project, harness)
- Skills (by name, description, trigger phrases)
- Tools (by name, description)
- Settings (by key, name, description)
- Hooks (by name, trigger)
- Learnings (by title, content, category)

### Using the palette

1. Press `⌘K` to open
2. Type your query
3. Results appear grouped by type
4. Press `↑`/`↓` to navigate
5. Press `Enter` to jump to the item
6. Press `Escape` to close

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `⌘K` / `Ctrl+K` | Open command palette |
| `→` / `↓` (in tab bar) | Next tab |
| `←` / `↑` (in tab bar) | Previous tab |
| `Home` (in tab bar) | First tab |
| `End` (in tab bar) | Last tab |
| `Escape` | Close command palette / dialog |
| `Enter` | Confirm selection |
