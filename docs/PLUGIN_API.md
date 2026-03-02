# Plugin API

Guide for building custom harness adapters that integrate new AI tools into Agent Config Manager.

---

## Overview

Agent Config Manager uses a **service layer** pattern rather than a classical plugin system. Each harness is supported through a combination of:

1. **Detection logic** — How the harness is identified on the user's machine
2. **Service functions** — Pure functions that read/write harness-specific data
3. **Type definitions** — TypeScript interfaces that all harnesses share

To add a new harness, you implement these three layers.

---

## Core Types

All adapters work with the same shared types defined in `src/types/`.

### `HarnessType`

```typescript
type HarnessType =
  | 'claude-code'
  | 'cursor'
  | 'copilot'
  | 'cline'
  | 'continue'
  | 'aider'
```

Add your harness slug to this union to register it.

### `HarnessStatus`

```typescript
type HarnessStatus = 'detected' | 'not-detected' | 'error'
```

### `DetectionResult`

```typescript
interface DetectionResult {
  harness: HarnessType
  status: HarnessStatus
  configPaths: HarnessConfigPaths
  version?: string
  error?: string
}
```

### `HarnessConfigPaths`

```typescript
interface HarnessConfigPaths {
  globalConfig?: string   // e.g., ~/.claude/settings.json
  projectConfig?: string  // e.g., ./.claude/settings.json
  skillsDir?: string      // e.g., ~/.claude/skills/
  hooksDir?: string       // e.g., ~/.claude/hooks/
  sessionsDir?: string    // e.g., ~/.claude/sessions/
  memoryDir?: string      // e.g., ~/.claude/memory/
}
```

---

## Step 1: Add Detection Logic

Detection lives in `src/services/detection/detection.ts`.

Add a `HarnessDetectionConfig` entry to the `HARNESS_CONFIGS` array:

```typescript
// src/services/detection/detection.ts

{
  type: 'my-harness',                       // matches your HarnessType value
  globalPaths: ['.my-harness'],             // paths relative to home dir to check
  projectPatterns: ['.my-harness-config'],  // project-level file patterns
  getConfigPaths: (detected, _os) => ({
    globalConfig: detected[0]
      ? `${detected[0]}/config.json`
      : undefined,
    skillsDir: detected[0]
      ? `${detected[0]}/skills/`
      : undefined,
  }),
}
```

**`globalPaths`** — Array of paths relative to the home directory that must exist for the harness to be considered "detected". The detection service checks each path in order.

**`projectPatterns`** — Optional patterns for project-local configs. These are checked relative to the current working directory.

**`getConfigPaths`** — Given the array of detected paths, return a `HarnessConfigPaths` object mapping logical names to absolute paths.

### OS-specific paths

```typescript
{
  type: 'my-harness',
  globalPaths: ['.my-harness'],
  osPaths: {
    windows: ['AppData/Roaming/my-harness'],
    linux: ['.config/my-harness'],
  },
  getConfigPaths: (detected, os) => ({
    globalConfig: detected[0] ? `${detected[0]}/config.json` : undefined,
  }),
}
```

---

## Step 2: Add TypeScript Types

Add harness-specific types to `src/types/harness.ts` if needed. Most data models (sessions, skills, hooks, settings) are generic and shared — you typically won't need new types.

If your harness has a unique data format, define types and transformation functions in a dedicated file:

```typescript
// src/services/my-harness/types.ts

export interface MyHarnessConfig {
  model: string
  temperature: number
  systemPrompt?: string
}

export function normalizeMyHarnessConfig(raw: MyHarnessConfig): Record<string, SettingValue> {
  return {
    'ai.model': raw.model,
    'ai.temperature': raw.temperature,
    'ai.systemPrompt': raw.systemPrompt ?? '',
  }
}
```

---

## Step 3: Implement Service Functions

Create a folder at `src/services/my-harness/` with a `service.ts` file.

### Reading settings

```typescript
// src/services/my-harness/service.ts

import type { SettingEntry } from '../settings'
import { readFile } from '../filesystem'

export async function getMyHarnessSettings(): Promise<SettingEntry[]> {
  const raw = await readFile('~/.my-harness/config.json')
  const parsed = JSON.parse(raw)
  return normalizeToSettingEntries(parsed)
}
```

### Writing settings

```typescript
export async function updateMyHarnessSetting(
  key: string,
  value: SettingValue
): Promise<void> {
  const raw = await readFile('~/.my-harness/config.json')
  const parsed = JSON.parse(raw)
  set(parsed, key, value)
  await writeFile('~/.my-harness/config.json', JSON.stringify(parsed, null, 2))
}
```

### Reading sessions

```typescript
import type { SessionSummary } from '@/types'

export async function getMyHarnessSessions(): Promise<SessionSummary[]> {
  const files = await listFiles('~/.my-harness/sessions/')
  return Promise.all(files.map(parseSessionFile))
}
```

---

## Step 4: File System Abstraction

All file I/O should go through the `FileSystemProvider` abstraction in `src/services/filesystem/`. This ensures your adapter works with the mock provider in tests.

```typescript
import { getFileSystemProvider } from '@/services/filesystem'

export async function readMyConfig(): Promise<string> {
  const fs = getFileSystemProvider()
  return fs.readFile('~/.my-harness/config.json')
}
```

### `FileSystemProvider` interface

```typescript
interface FileSystemProvider {
  readFile(path: string): Promise<string>
  writeFile(path: string, content: string): Promise<void>
  exists(path: string): Promise<boolean>
  listFiles(dir: string): Promise<string[]>
  mkdir(dir: string): Promise<void>
  homedir(): string
}
```

---

## Step 5: Register in the Service Index

Export your new service from `src/services/index.ts`:

```typescript
// src/services/index.ts
export * from './my-harness'
```

---

## Step 6: Wire into the UI

The UI pulls data from Zustand stores which call service functions. To surface your harness's data:

1. **Add to harness filter dropdowns** — The `HarnessType` union drives all filter dropdowns. Adding your type makes it appear automatically.
2. **Add detection config** — The detection service runs on app startup and populates the `HarnessDetectionService` result.
3. **Integrate with settings** — Call your `getMyHarnessSettings()` from the settings store when the settings page loads.

---

## Testing Your Adapter

### Unit tests

Create `src/services/my-harness/service.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getMyHarnessSettings } from './service'
import { mockFileSystem } from '@/test/utils'

describe('My Harness Service', () => {
  beforeEach(() => {
    mockFileSystem({
      '~/.my-harness/config.json': JSON.stringify({
        model: 'gpt-4',
        temperature: 0.7,
      }),
    })
  })

  it('returns normalized settings', async () => {
    const settings = await getMyHarnessSettings()
    expect(settings.find(s => s.definition.key === 'ai.model')?.current.value).toBe('gpt-4')
  })
})
```

### Mock file system

The test utilities provide a `mockFileSystem` helper that injects a `FileSystemProvider` backed by an in-memory map. This means your service tests never touch the real file system.

---

## Detection Service API

```typescript
import { HarnessDetectionService } from '@/services/detection'

const service = new HarnessDetectionService(fileSystemProvider)

// Detect all harnesses
const results: DetectionResult[] = await service.detectAll()

// Detect a specific harness
const result: DetectionResult = await service.detect('claude-code')
```

---

## Search Integration

To make your harness's data searchable via the command palette, implement the `SearchableItem` interface and register with the search service:

```typescript
// src/services/search/providers/my-harness.ts

import type { SearchResult } from '../types'
import { getMyHarnessSessions } from '@/services/my-harness'

export async function searchMyHarness(query: string): Promise<SearchResult[]> {
  const sessions = await getMyHarnessSessions()
  return sessions
    .filter(s => s.title.toLowerCase().includes(query.toLowerCase()))
    .map(s => ({
      id: s.id,
      type: 'session',
      title: s.title,
      subtitle: `${s.harness} · ${s.project ?? 'no project'}`,
      harness: s.harness,
      score: 1,
    }))
}
```

Register in `src/services/search/service.ts` by adding your provider to the `SEARCH_PROVIDERS` array.

---

## Conventions

- **No side effects at import time** — Service modules must not run code when imported
- **Pure functions where possible** — Makes testing straightforward
- **File paths via `FileSystemProvider`** — Never call `fs.readFileSync` or Node's `path` module directly in service code
- **Mock data for development** — If the real harness isn't available, return sensible mock data rather than throwing
- **Test coverage** — Every service function should have at least one test
