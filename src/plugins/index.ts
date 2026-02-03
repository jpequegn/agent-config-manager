/**
 * Plugin System Module
 * Exports plugin types, loader, and manager for adapter plugins
 */

// Types
export type {
  PluginStatus,
  PluginManifest,
  PluginModule,
  Plugin,
  PluginInstallOptions,
  PluginInstallResult,
  PluginDiscoveryResult,
  PluginConfig,
  PluginEventType,
  PluginEvent,
  PluginEventListener,
} from './types'

// Loader
export type { PluginLoadResult } from './loader'
export { PluginLoader, pluginLoader, validateManifest, validateModule } from './loader'

// Manager
export { PluginManager, pluginManager } from './manager'

// Example plugin (for reference/documentation)
export { default as examplePlugin } from './example'
