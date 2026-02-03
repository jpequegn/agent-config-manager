/**
 * Plugin System Types
 * Defines interfaces for adapter plugins and their manifests
 */

import type { HarnessType } from '@/types'
import type { HarnessAdapter, AdapterFactory } from '@/adapters'

/**
 * Plugin status in the lifecycle
 */
export type PluginStatus = 'installed' | 'loaded' | 'enabled' | 'disabled' | 'error'

/**
 * Plugin manifest - defines metadata and entry points
 * This should be in the plugin's package.json under "agentConfigManager" key
 * or in a separate manifest.json file
 */
export interface PluginManifest {
  /** Unique plugin identifier (npm package name or custom id) */
  id: string

  /** Human-readable plugin name */
  name: string

  /** Plugin version (semver) */
  version: string

  /** Plugin description */
  description: string

  /** Plugin author */
  author?: string

  /** Plugin homepage/repository URL */
  homepage?: string

  /** Minimum app version required */
  minAppVersion?: string

  /** Maximum app version supported */
  maxAppVersion?: string

  /** The harness type this plugin provides an adapter for */
  harnessType: HarnessType

  /** Entry point module path (relative to plugin root) */
  main: string

  /** Optional icon path (relative to plugin root) */
  icon?: string

  /** Optional brand color (hex) */
  brandColor?: string

  /** Plugin keywords for discovery */
  keywords?: string[]

  /** Plugin license */
  license?: string
}

/**
 * Plugin module interface - what a plugin must export
 */
export interface PluginModule {
  /** Plugin manifest */
  manifest: PluginManifest

  /** Factory function to create the adapter */
  createAdapter: AdapterFactory

  /** Optional initialization hook */
  onLoad?: () => Promise<void>

  /** Optional cleanup hook */
  onUnload?: () => Promise<void>

  /** Optional enable hook */
  onEnable?: () => Promise<void>

  /** Optional disable hook */
  onDisable?: () => Promise<void>
}

/**
 * Loaded plugin instance with runtime state
 */
export interface Plugin {
  /** Plugin manifest */
  manifest: PluginManifest

  /** Current plugin status */
  status: PluginStatus

  /** The plugin module */
  module: PluginModule

  /** The adapter instance (created when enabled) */
  adapter?: HarnessAdapter

  /** Source path (npm package name or local path) */
  source: string

  /** Installation timestamp */
  installedAt: Date

  /** Last enabled timestamp */
  enabledAt?: Date

  /** Error message if status is 'error' */
  error?: string
}

/**
 * Plugin installation options
 */
export interface PluginInstallOptions {
  /** Source - npm package name or local file path */
  source: string

  /** Whether to enable after installation */
  enableAfterInstall?: boolean

  /** Force reinstall even if already installed */
  force?: boolean
}

/**
 * Plugin installation result
 */
export interface PluginInstallResult {
  /** Whether installation succeeded */
  success: boolean

  /** The installed plugin (if successful) */
  plugin?: Plugin

  /** Error message (if failed) */
  error?: string
}

/**
 * Plugin discovery result from registry/npm
 */
export interface PluginDiscoveryResult {
  /** Plugin manifest from registry */
  manifest: PluginManifest

  /** NPM package name */
  packageName: string

  /** Download count */
  downloads?: number

  /** Star rating */
  stars?: number

  /** Last updated */
  lastUpdated?: Date

  /** Is official/verified */
  verified?: boolean
}

/**
 * Plugin configuration stored in user settings
 */
export interface PluginConfig {
  /** Plugin ID */
  id: string

  /** Whether plugin is enabled */
  enabled: boolean

  /** Plugin-specific settings */
  settings?: Record<string, unknown>
}

/**
 * Plugin event types for lifecycle hooks
 */
export type PluginEventType =
  | 'installed'
  | 'loaded'
  | 'enabled'
  | 'disabled'
  | 'uninstalled'
  | 'error'

/**
 * Plugin event payload
 */
export interface PluginEvent {
  type: PluginEventType
  pluginId: string
  timestamp: Date
  error?: string
}

/**
 * Plugin event listener
 */
export type PluginEventListener = (event: PluginEvent) => void
