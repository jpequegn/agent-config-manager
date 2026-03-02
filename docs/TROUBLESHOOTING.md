# Troubleshooting

Solutions for common issues when running or developing Agent Config Manager.

---

## Table of Contents

1. [Installation Issues](#installation-issues)
2. [Dev Server Issues](#dev-server-issues)
3. [Build Issues](#build-issues)
4. [Test Failures](#test-failures)
5. [Runtime Issues](#runtime-issues)
6. [Harness Detection Issues](#harness-detection-issues)
7. [Performance Issues](#performance-issues)

---

## Installation Issues

### `bun install` fails with a network error

```
error: Failed to resolve: package not found
```

**Fix:** Check your network connection. If behind a proxy, set:

```bash
export HTTPS_PROXY=http://your-proxy:port
bun install
```

### `bun: command not found`

Bun is not installed. Install it:

```bash
curl -fsSL https://bun.sh/install | bash
```

Or use Node.js 18+ with `npm install` instead.

### Peer dependency warnings

Ignore these — they're usually harmless warnings from older packages that haven't declared React 19 compatibility yet.

---

## Dev Server Issues

### Port 5173 is already in use

```
error: listen EADDRINUSE: address already in use :::5173
```

**Fix 1:** Kill the existing process:

```bash
lsof -ti:5173 | xargs kill -9
```

**Fix 2:** Run on a different port:

```bash
bun dev --port 5174
```

### Hot reload not working

- Make sure you're not running the production build (`bun run preview`) — hot reload only works in dev mode
- Try restarting the dev server
- On Linux, increase the file watcher limit:
  ```bash
  echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
  sudo sysctl -p
  ```

### `@/` path alias not resolving

If your editor shows import errors with `@/`:

1. Ensure `tsconfig.json` has the path alias configured:
   ```json
   { "paths": { "@/*": ["./src/*"] } }
   ```
2. Restart your language server / editor

---

## Build Issues

### TypeScript errors during `bun run build`

All TypeScript errors must be fixed before the build succeeds. Common causes:

**`Property X does not exist on type Y`** — Run `bun run lint` first; this is usually a type mismatch caught earlier.

**`Module not found`** — Check that you didn't delete or rename an exported symbol without updating all imports.

**`Type X is not assignable to type Y`** — Look at the error location. Usually a missing property in an object literal or an incorrect return type.

### Chunk size warning

```
Some chunks are larger than 500 kB after minification.
```

This is a warning, not an error. Recharts and Monaco Editor are intentionally large. They are split into separate vendor chunks via the Vite `manualChunks` configuration in `vite.config.ts`.

### `vite: command not found` during build

```bash
bun install  # reinstall dependencies
```

---

## Test Failures

### Tests fail with `ResizeObserver is not defined`

**Cause:** `@tanstack/react-virtual` uses `ResizeObserver`, which doesn't exist in jsdom.

**Fix:** Already handled in `src/test/setup.ts`. If you see this in a new test file, ensure you're using the shared setup:

```typescript
// vitest.config.ts
test: {
  setupFiles: ['./src/test/setup.ts'],
}
```

### Virtualizer renders 0 items in tests

**Cause:** jsdom doesn't implement CSS layout, so `getBoundingClientRect()` returns `{height: 0}`, making the virtualizer think the container has no visible area.

**Fix:** Already handled in `src/test/setup.ts` with a global `getBoundingClientRect` mock returning `{height: 600}`. If you're writing new tests for virtualized components, use `waitFor` to wait for items to appear after the virtualizer re-renders.

### `window.matchMedia is not a function`

**Cause:** jsdom doesn't implement `matchMedia`.

**Fix:** Already mocked in `src/test/setup.ts`. If you see this error, check that your test imports `render` from `@/test/utils`, not directly from Testing Library.

### Zustand store state leaks between tests

**Cause:** Zustand stores are singletons. State set in one test persists to the next.

**Fix:** Reset the store in `beforeEach`:

```typescript
beforeEach(() => {
  useMyStore.getState().reset()
  // or manually reset specific fields:
  useMyStore.setState({ items: [], isLoading: false })
})
```

### `Cannot find module '@/...'`

**Cause:** The `vitest.config.ts` path alias isn't set up.

**Fix:** Ensure `vitest.config.ts` has:

```typescript
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
  },
}
```

### Test hangs / times out

Common causes:
- `waitFor` waiting for something that never appears — check the component is actually rendering the expected output
- A store `useEffect` that never completes — mock the service it calls
- `userEvent.setup()` not awaited — always `await user.click(...)` etc.

---

## Runtime Issues

### Blank screen on load

Open the browser console (`F12`). Common causes:

1. **JavaScript error** — Look for a red error in the console. Usually a `TypeError` or an unhandled promise rejection.
2. **Build artifact mismatch** — If running the production build, try `bun run build` again and re-run `bun run preview`.
3. **Stale dist folder** — Delete `dist/` and rebuild: `rm -rf dist && bun run build`.

### Toast notifications not appearing

- Check that `<ToastContainer />` is present in `App.tsx`
- Check that `useNotificationsStore` is being used correctly — pass `{type: 'toast'}` when creating a notification

### Settings changes not persisting

The current implementation uses **mock data** — writes are stored in memory only and reset on page reload. Persistence to disk is planned for a future release.

### Command palette (⌘K) not opening

- Make sure no other element has captured keyboard focus (e.g., a modal dialog)
- Try clicking the main app area first, then pressing ⌘K
- On Windows/Linux, use `Ctrl+K`

---

## Harness Detection Issues

### My harness shows as "not detected"

**Check the expected path exists:**

| Harness | Check if this exists |
|---------|---------------------|
| Claude Code | `~/.claude/settings.json` |
| Cursor | `~/.cursor/` (any file) |
| GitHub Copilot | VS Code `settings.json` with Copilot extension |
| Cline | `~/.cline/` (any file) |
| Continue | `~/.continue/config.json` |
| Aider | `~/.aider.conf.yml` |

**On Windows:** Paths resolve to `%USERPROFILE%\` instead of `~/`.

If the files exist but the harness still isn't detected, open an issue with your OS and the exact path of the config file.

### Harness shows wrong data

The app uses **mock data** for most harnesses while real filesystem integration is being built. If you see data that doesn't match your actual config files, this is expected behaviour in the current version.

---

## Performance Issues

### List scrolling is slow / janky

Lists with more than a few hundred items use `@tanstack/react-virtual` for virtualization. If you're experiencing slowness:

1. Make sure you're not running in development mode with React Strict Mode double-invocations — switch to the production build for performance testing
2. Check that you're not re-creating function references on every render (wrap callbacks in `useCallback`)

### Initial load is slow

The app uses `React.lazy` code splitting. The first time you visit each tab, its JavaScript chunk downloads. Subsequent visits are instant (cached by the browser).

### Memory usage grows over time

If you notice the browser's memory growing during a long session:

1. Check if any `useEffect` subscriptions are not being cleaned up (missing return function)
2. Check if large data sets are being held in multiple stores simultaneously

---

## Still stuck?

Open a [GitHub issue](https://github.com/jpequegn/agent-config-manager/issues) with:

- What you were trying to do
- What you expected to happen
- What actually happened (include console errors)
- Your OS, browser, and Node/Bun version
