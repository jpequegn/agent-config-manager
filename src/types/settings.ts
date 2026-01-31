/**
 * Settings Types
 * Types for application and harness settings/preferences
 */

import type { HarnessType } from './harness'

/** Setting value types */
export type SettingValueType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'select'
  | 'multiselect'
  | 'path'
  | 'json'

/** Setting category for organization */
export type SettingCategory =
  | 'general'
  | 'appearance'
  | 'editor'
  | 'ai'
  | 'privacy'
  | 'advanced'
  | 'experimental'

/** Setting scope - where the setting applies */
export type SettingScope = 'global' | 'user' | 'workspace' | 'project'

/** Individual setting value (union type for flexibility) */
export type SettingValue = string | number | boolean | string[] | Record<string, unknown>

/** Setting option for select/multiselect types */
export interface SettingOption {
  /** Option value */
  value: string
  /** Display label */
  label: string
  /** Optional description */
  description?: string
}

/** Setting definition (schema) */
export interface SettingDefinition {
  /** Unique setting key */
  key: string
  /** Display name */
  name: string
  /** Description of what this setting does */
  description: string
  /** Value type */
  type: SettingValueType
  /** Category for organization */
  category: SettingCategory
  /** Default value */
  defaultValue: SettingValue
  /** Available options (for select/multiselect) */
  options?: SettingOption[]
  /** Validation pattern (for strings) */
  pattern?: string
  /** Minimum value (for numbers) */
  min?: number
  /** Maximum value (for numbers) */
  max?: number
  /** Whether this setting requires restart */
  requiresRestart?: boolean
  /** Scope where this setting applies */
  scope: SettingScope
  /** Whether this is an experimental setting */
  experimental?: boolean
  /** Deprecation message if deprecated */
  deprecated?: string
}

/** Current setting value with metadata */
export interface Setting {
  /** Setting key */
  key: string
  /** Current value */
  value: SettingValue
  /** Source of current value */
  source: SettingScope
  /** Whether value differs from default */
  isModified: boolean
  /** Last modification timestamp */
  modifiedAt?: Date
}

/** Settings for a specific harness */
export interface HarnessSettings {
  /** Harness type */
  harness: HarnessType
  /** File path to settings */
  filePath?: string
  /** All settings with current values */
  settings: Setting[]
  /** Last sync timestamp */
  lastSyncedAt?: Date
}

/** Global application settings */
export interface AppSettings {
  /** Theme preference */
  theme: 'light' | 'dark' | 'system'
  /** Accent color */
  accentColor?: string
  /** Default harness to show */
  defaultHarness?: HarnessType
  /** Whether to show all harnesses or only detected */
  showAllHarnesses: boolean
  /** Auto-refresh interval in ms (0 = disabled) */
  autoRefreshInterval: number
  /** Enable notifications */
  notificationsEnabled: boolean
  /** Telemetry opt-in */
  telemetryEnabled: boolean
  /** Last active tab/view */
  lastActiveView?: string
  /** Window position and size */
  windowBounds?: WindowBounds
}

/** Window position and size */
export interface WindowBounds {
  /** X position */
  x: number
  /** Y position */
  y: number
  /** Width */
  width: number
  /** Height */
  height: number
  /** Whether maximized */
  isMaximized: boolean
}

/** Settings import/export format */
export interface SettingsExport {
  /** Export version */
  version: string
  /** Export timestamp */
  exportedAt: Date
  /** App settings */
  appSettings: AppSettings
  /** Per-harness settings */
  harnessSettings: HarnessSettings[]
}

/** Settings validation result */
export interface SettingsValidationResult {
  /** Whether all settings are valid */
  isValid: boolean
  /** Validation errors by setting key */
  errors: Record<string, string>
  /** Validation warnings by setting key */
  warnings: Record<string, string>
}
