# Contributing to Agent Config Manager

Thank you for your interest in contributing! This guide covers everything you need to submit a quality pull request.

---

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Set Up](#getting-set-up)
3. [How to Contribute](#how-to-contribute)
4. [Development Workflow](#development-workflow)
5. [Code Style](#code-style)
6. [Testing Standards](#testing-standards)
7. [Commit Convention](#commit-convention)
8. [Pull Request Process](#pull-request-process)

---

## Code of Conduct

Be respectful and constructive. We welcome contributors of all experience levels.

---

## Getting Set Up

### Prerequisites

- [Bun](https://bun.sh/) 1.0+ (preferred) or Node.js 18+
- Git

### Fork and clone

```bash
# 1. Fork the repo on GitHub
# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/agent-config-manager.git
cd agent-config-manager

# 3. Add the upstream remote
git remote add upstream https://github.com/jpequegn/agent-config-manager.git

# 4. Install dependencies
bun install

# 5. Verify everything works
bun run test:run
bun run lint
bun run build
```

---

## How to Contribute

### Reporting bugs

1. Search [existing issues](https://github.com/jpequegn/agent-config-manager/issues) first
2. If it's new, open an issue with:
   - Steps to reproduce
   - Expected vs. actual behaviour
   - Browser/OS/Node version
   - Console errors if any

### Suggesting features

Open a GitHub issue with the `type:feature` label. Describe the problem you're trying to solve, not just the solution.

### Fixing bugs / implementing features

1. Find an open issue (or open one first for non-trivial changes)
2. Comment to claim it — avoids duplicate work
3. Follow the [Development Workflow](#development-workflow) below

---

## Development Workflow

```bash
# 1. Sync with upstream
git fetch upstream
git checkout main
git merge upstream/main

# 2. Create a feature branch
git checkout -b feat/my-feature   # or fix/my-bug

# 3. Make changes, run tests as you go
bun dev                # dev server
bun run test          # watch mode
bun run lint:fix       # auto-fix lint issues

# 4. Before committing
bun run test:run      # all tests must pass
bun run lint          # zero errors
bun run build         # must build cleanly
```

---

## Code Style

### TypeScript

- **Strict mode** is enabled — no `any`, no implicit returns on non-void functions
- Prefer `interface` over `type` for object shapes; use `type` for unions/aliases
- Use `const` by default; `let` only when reassignment is needed
- Export types separately from values: `export type { Foo }` not `export { type Foo }`

### React

- Functional components only (no class components)
- Name components in `PascalCase`
- Props interfaces should be named `[ComponentName]Props` for exported components; inline types for internal ones
- Use `React.memo` for list item components that receive stable props
- Avoid inline object/array literals in JSX props — extract to variables

### File structure

- **One component per file** for non-trivial components
- Feature folders: `src/features/[feature-name]/[ComponentName].tsx`
- Barrel files: each folder has an `index.ts` that re-exports public API
- Tests co-located with source: `ComponentName.test.tsx` next to `ComponentName.tsx`

### Imports

Order imports as follows (enforced by ESLint):

```typescript
// 1. React
import { useState } from 'react'

// 2. Third-party
import { useVirtualizer } from '@tanstack/react-virtual'

// 3. Internal (path alias)
import { Button } from '@/components/ui/button'
import { useSessionsStore } from '@/stores'

// 4. Types
import type { SessionSummary } from '@/types'
```

### Naming

| Thing | Convention |
|-------|-----------|
| Component | `PascalCase` |
| Hook | `useCamelCase` |
| Service function | `camelCase` |
| Store | `useXxxStore` |
| Type / Interface | `PascalCase` |
| Constant | `UPPER_SNAKE_CASE` |
| File | `PascalCase.tsx` for components, `camelCase.ts` for services/utils |

---

## Testing Standards

### What to test

- **Every service function** — pure data transformation and CRUD operations
- **Store actions** — state transitions and side effects
- **Component behaviour** — user interactions, not implementation details
- **Edge cases** — empty lists, loading states, error states

### What not to test

- Implementation details (internal state, private functions)
- Static layout / visual appearance
- Third-party library internals

### Writing tests

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, userEvent } from '@/test/utils'

describe('ComponentName', () => {
  beforeEach(() => {
    // reset stores / mocks
  })

  it('should do the expected thing', async () => {
    const user = userEvent.setup()
    render(<ComponentName />)

    await user.click(screen.getByRole('button', { name: /submit/i }))

    expect(screen.getByText('Success')).toBeInTheDocument()
  })
})
```

### Test utilities

Use the custom `render` from `@/test/utils` — it wraps components with the app providers.

```typescript
// ✅ correct
import { render, screen } from '@/test/utils'

// ❌ avoid — missing providers
import { render } from '@testing-library/react'
```

### Coverage targets

New code should have ≥ 80% line coverage. Run `bun run test:coverage` to check.

---

## Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short description>

[optional body]

[optional footer]
```

### Types

| Type | When to use |
|------|------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `perf` | Performance improvement |
| `refactor` | Code change with no behaviour change |
| `test` | Adding or updating tests |
| `docs` | Documentation only |
| `chore` | Build process, dependency updates |
| `style` | Formatting changes (whitespace, semicolons) |

### Examples

```
feat(hooks): add community hook templates panel

fix(learnings): virtualized list now renders in jsdom tests

docs(contributing): add commit convention section

perf(sessions): memoize SessionRow to prevent unnecessary re-renders
```

### Scope

Use the feature folder name as scope: `hooks`, `settings`, `sessions`, `migration`, `search`, etc.

---

## Pull Request Process

### Before opening a PR

- [ ] Tests pass: `bun run test:run`
- [ ] Linting passes: `bun run lint`
- [ ] Build succeeds: `bun run build`
- [ ] Branch is up to date with `main`

### PR title

Follow the commit convention: `feat(scope): description`.

### PR description template

```markdown
## Summary
- What was built / changed
- Why it was needed

## Testing
- Tests added/modified
- Manual testing steps

## Related
- Closes #<issue>
```

### Review process

1. At least one approval is required to merge
2. All CI checks must pass
3. Address reviewer comments — don't just dismiss them
4. Squash commits before merging (GitHub will do this automatically if configured)

### After merge

Delete your feature branch. Update your local `main`:

```bash
git checkout main
git pull upstream main
git branch -d feat/my-feature
```
