/**
 * Settings Service
 * Manages settings browsing with mock data organized by category
 */

import type { SettingCategory, SettingDefinition, Setting, SettingValue } from '@/types'

/** Settings aggregate statistics */
export interface SettingsListStats {
  totalSettings: number
  modifiedSettings: number
  byCategory: { category: SettingCategory; count: number }[]
}

/** Filter options for settings list */
export interface SettingsFilterOptions {
  category?: SettingCategory
  searchText?: string
  modifiedOnly?: boolean
}

/** Combined setting definition + current value */
export interface SettingEntry {
  definition: SettingDefinition
  current: Setting
}

/** Category metadata */
export const SETTING_CATEGORIES: { value: SettingCategory; label: string; description: string }[] =
  [
    { value: 'general', label: 'General', description: 'General application settings' },
    { value: 'appearance', label: 'Appearance', description: 'Theme and visual preferences' },
    { value: 'editor', label: 'Editor', description: 'Code editor configuration' },
    { value: 'ai', label: 'AI', description: 'AI model and behavior settings' },
    { value: 'privacy', label: 'Privacy', description: 'Data collection and privacy' },
    { value: 'advanced', label: 'Advanced', description: 'Advanced configuration options' },
    { value: 'experimental', label: 'Experimental', description: 'Experimental features' },
  ]

/** Mock setting definitions */
const MOCK_DEFINITIONS: SettingDefinition[] = [
  // General
  {
    key: 'general.defaultHarness',
    name: 'Default Harness',
    description: 'The harness to show by default when the app launches',
    type: 'select',
    category: 'general',
    defaultValue: 'claude-code',
    options: [
      { value: 'claude-code', label: 'Claude Code' },
      { value: 'cursor', label: 'Cursor' },
      { value: 'copilot', label: 'Copilot' },
      { value: 'cline', label: 'Cline' },
    ],
    scope: 'user',
  },
  {
    key: 'general.autoRefreshInterval',
    name: 'Auto Refresh Interval',
    description: 'How often to refresh data in seconds (0 to disable)',
    type: 'number',
    category: 'general',
    defaultValue: 30,
    min: 0,
    max: 300,
    scope: 'user',
  },
  {
    key: 'general.showAllHarnesses',
    name: 'Show All Harnesses',
    description: 'Show all harnesses including undetected ones',
    type: 'boolean',
    category: 'general',
    defaultValue: false,
    scope: 'user',
  },
  {
    key: 'general.language',
    name: 'Language',
    description: 'Interface language',
    type: 'select',
    category: 'general',
    defaultValue: 'en',
    options: [
      { value: 'en', label: 'English' },
      { value: 'fr', label: 'French' },
      { value: 'de', label: 'German' },
      { value: 'ja', label: 'Japanese' },
    ],
    scope: 'user',
  },
  // Appearance
  {
    key: 'appearance.theme',
    name: 'Theme',
    description: 'Application color theme',
    type: 'select',
    category: 'appearance',
    defaultValue: 'system',
    options: [
      { value: 'light', label: 'Light' },
      { value: 'dark', label: 'Dark' },
      { value: 'system', label: 'System' },
    ],
    scope: 'user',
  },
  {
    key: 'appearance.fontSize',
    name: 'Font Size',
    description: 'Base font size in pixels',
    type: 'number',
    category: 'appearance',
    defaultValue: 14,
    min: 10,
    max: 24,
    scope: 'user',
  },
  {
    key: 'appearance.compactMode',
    name: 'Compact Mode',
    description: 'Use smaller spacing and text for dense information display',
    type: 'boolean',
    category: 'appearance',
    defaultValue: false,
    scope: 'user',
  },
  // Editor
  {
    key: 'editor.tabSize',
    name: 'Tab Size',
    description: 'Number of spaces per tab',
    type: 'number',
    category: 'editor',
    defaultValue: 2,
    min: 1,
    max: 8,
    scope: 'workspace',
  },
  {
    key: 'editor.wordWrap',
    name: 'Word Wrap',
    description: 'Enable word wrapping in editors',
    type: 'boolean',
    category: 'editor',
    defaultValue: true,
    scope: 'user',
  },
  {
    key: 'editor.formatOnSave',
    name: 'Format On Save',
    description: 'Automatically format files when saving',
    type: 'boolean',
    category: 'editor',
    defaultValue: true,
    scope: 'workspace',
  },
  // AI
  {
    key: 'ai.defaultModel',
    name: 'Default Model',
    description: 'Default AI model to use for completions',
    type: 'select',
    category: 'ai',
    defaultValue: 'claude-sonnet-4-5',
    options: [
      { value: 'claude-opus-4', label: 'Claude Opus 4' },
      { value: 'claude-sonnet-4-5', label: 'Claude Sonnet 4.5' },
      { value: 'claude-haiku-4', label: 'Claude Haiku 4' },
    ],
    scope: 'user',
  },
  {
    key: 'ai.maxTokens',
    name: 'Max Output Tokens',
    description: 'Maximum number of tokens in AI responses',
    type: 'number',
    category: 'ai',
    defaultValue: 4096,
    min: 256,
    max: 32768,
    scope: 'user',
  },
  {
    key: 'ai.temperature',
    name: 'Temperature',
    description: 'Controls randomness of AI responses (0 = deterministic, 1 = creative)',
    type: 'number',
    category: 'ai',
    defaultValue: 0.7,
    min: 0,
    max: 1,
    scope: 'user',
  },
  {
    key: 'ai.contextWindow',
    name: 'Context Window',
    description: 'Maximum context size in tokens',
    type: 'select',
    category: 'ai',
    defaultValue: '200000',
    options: [
      { value: '100000', label: '100K tokens' },
      { value: '200000', label: '200K tokens' },
    ],
    scope: 'user',
  },
  // Privacy
  {
    key: 'privacy.telemetry',
    name: 'Telemetry',
    description: 'Send anonymous usage statistics to help improve the application',
    type: 'boolean',
    category: 'privacy',
    defaultValue: false,
    scope: 'user',
  },
  {
    key: 'privacy.sendCrashReports',
    name: 'Crash Reports',
    description: 'Automatically send crash reports',
    type: 'boolean',
    category: 'privacy',
    defaultValue: true,
    scope: 'user',
  },
  // Advanced
  {
    key: 'advanced.logLevel',
    name: 'Log Level',
    description: 'Logging verbosity level',
    type: 'select',
    category: 'advanced',
    defaultValue: 'info',
    options: [
      { value: 'error', label: 'Error' },
      { value: 'warn', label: 'Warning' },
      { value: 'info', label: 'Info' },
      { value: 'debug', label: 'Debug' },
    ],
    scope: 'user',
  },
  {
    key: 'advanced.cacheDirectory',
    name: 'Cache Directory',
    description: 'Path to the cache directory',
    type: 'path',
    category: 'advanced',
    defaultValue: '~/.cache/agent-config-manager',
    scope: 'user',
  },
  {
    key: 'advanced.connectionTimeout',
    name: 'Connection Timeout',
    description: 'Timeout for MCP server connections in milliseconds',
    type: 'number',
    category: 'advanced',
    defaultValue: 10000,
    min: 1000,
    max: 60000,
    scope: 'user',
  },
  // Experimental
  {
    key: 'experimental.multiAgent',
    name: 'Multi-Agent Mode',
    description: 'Enable experimental multi-agent orchestration',
    type: 'boolean',
    category: 'experimental',
    defaultValue: false,
    scope: 'user',
    experimental: true,
  },
  {
    key: 'experimental.aiReview',
    name: 'AI-Powered Review',
    description: 'Use AI to automatically review configuration changes',
    type: 'boolean',
    category: 'experimental',
    defaultValue: false,
    scope: 'user',
    experimental: true,
  },
]

/** Mock current values (some modified from defaults) */
const MOCK_CURRENT_VALUES: Setting[] = [
  { key: 'general.defaultHarness', value: 'claude-code', source: 'user', isModified: false },
  {
    key: 'general.autoRefreshInterval',
    value: 60,
    source: 'user',
    isModified: true,
    modifiedAt: new Date(Date.now() - 86400000 * 3),
  },
  {
    key: 'general.showAllHarnesses',
    value: true,
    source: 'user',
    isModified: true,
    modifiedAt: new Date(Date.now() - 86400000 * 7),
  },
  { key: 'general.language', value: 'en', source: 'user', isModified: false },
  {
    key: 'appearance.theme',
    value: 'dark',
    source: 'user',
    isModified: true,
    modifiedAt: new Date(Date.now() - 86400000 * 14),
  },
  { key: 'appearance.fontSize', value: 14, source: 'user', isModified: false },
  { key: 'appearance.compactMode', value: false, source: 'user', isModified: false },
  { key: 'editor.tabSize', value: 2, source: 'workspace', isModified: false },
  { key: 'editor.wordWrap', value: true, source: 'user', isModified: false },
  { key: 'editor.formatOnSave', value: true, source: 'workspace', isModified: false },
  { key: 'ai.defaultModel', value: 'claude-sonnet-4-5', source: 'user', isModified: false },
  {
    key: 'ai.maxTokens',
    value: 8192,
    source: 'user',
    isModified: true,
    modifiedAt: new Date(Date.now() - 86400000),
  },
  { key: 'ai.temperature', value: 0.7, source: 'user', isModified: false },
  { key: 'ai.contextWindow', value: '200000', source: 'user', isModified: false },
  { key: 'privacy.telemetry', value: false, source: 'user', isModified: false },
  { key: 'privacy.sendCrashReports', value: true, source: 'user', isModified: false },
  {
    key: 'advanced.logLevel',
    value: 'debug',
    source: 'user',
    isModified: true,
    modifiedAt: new Date(Date.now() - 86400000 * 2),
  },
  {
    key: 'advanced.cacheDirectory',
    value: '~/.cache/agent-config-manager',
    source: 'user',
    isModified: false,
  },
  { key: 'advanced.connectionTimeout', value: 10000, source: 'user', isModified: false },
  { key: 'experimental.multiAgent', value: false, source: 'user', isModified: false },
  {
    key: 'experimental.aiReview',
    value: true,
    source: 'user',
    isModified: true,
    modifiedAt: new Date(Date.now() - 86400000 * 5),
  },
]

/**
 * List settings, optionally filtered.
 */
export async function listSettings(options?: SettingsFilterOptions): Promise<SettingEntry[]> {
  await new Promise((resolve) => setTimeout(resolve, 150))

  let definitions = MOCK_DEFINITIONS

  if (options?.category) {
    definitions = definitions.filter((d) => d.category === options.category)
  }
  if (options?.searchText) {
    const q = options.searchText.toLowerCase()
    definitions = definitions.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q) ||
        d.key.toLowerCase().includes(q)
    )
  }

  let entries = definitions.map((def) => {
    const current = MOCK_CURRENT_VALUES.find((v) => v.key === def.key) ?? {
      key: def.key,
      value: def.defaultValue,
      source: def.scope,
      isModified: false,
    }
    return { definition: def, current }
  })

  if (options?.modifiedOnly) {
    entries = entries.filter((e) => e.current.isModified)
  }

  return entries
}

/**
 * Get a single setting entry by key.
 */
export async function getSetting(key: string): Promise<SettingEntry | null> {
  await new Promise((resolve) => setTimeout(resolve, 50))
  const def = MOCK_DEFINITIONS.find((d) => d.key === key)
  if (!def) return null
  const current = MOCK_CURRENT_VALUES.find((v) => v.key === key) ?? {
    key: def.key,
    value: def.defaultValue,
    source: def.scope,
    isModified: false,
  }
  return { definition: def, current }
}

/**
 * Get all settings as raw JSON/YAML-like object (for raw view).
 */
export async function getSettingsRaw(): Promise<Record<string, SettingValue>> {
  await new Promise((resolve) => setTimeout(resolve, 100))
  const raw: Record<string, SettingValue> = {}
  for (const v of MOCK_CURRENT_VALUES) {
    raw[v.key] = v.value
  }
  return raw
}

/**
 * Get aggregate settings statistics.
 */
export async function getSettingsStats(): Promise<SettingsListStats> {
  await new Promise((resolve) => setTimeout(resolve, 100))

  const categoryMap = new Map<SettingCategory, number>()
  for (const d of MOCK_DEFINITIONS) {
    categoryMap.set(d.category, (categoryMap.get(d.category) ?? 0) + 1)
  }

  return {
    totalSettings: MOCK_DEFINITIONS.length,
    modifiedSettings: MOCK_CURRENT_VALUES.filter((v) => v.isModified).length,
    byCategory: Array.from(categoryMap.entries()).map(([category, count]) => ({
      category,
      count,
    })),
  }
}
