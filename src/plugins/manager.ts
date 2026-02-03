/**
 * Plugin Manager
 * Handles plugin lifecycle: install, load, enable, disable, uninstall
 */

import { adapterRegistry } from '@/adapters'
import type {
  Plugin,
  PluginInstallOptions,
  PluginInstallResult,
  PluginModule,
  PluginStatus,
  PluginEvent,
  PluginEventListener,
  PluginConfig,
} from './types'
import { pluginLoader, validateModule } from './loader'

/**
 * Plugin Manager class
 * Manages the full plugin lifecycle
 */
export class PluginManager {
  private plugins: Map<string, Plugin> = new Map()
  private eventListeners: Set<PluginEventListener> = new Set()
  private configs: Map<string, PluginConfig> = new Map()

  /**
   * Install a plugin from npm or local path
   */
  async install(options: PluginInstallOptions): Promise<PluginInstallResult> {
    const { source, enableAfterInstall = false, force = false } = options

    // Check if already installed
    if (this.plugins.has(source) && !force) {
      return {
        success: false,
        error: `Plugin already installed: ${source}. Use force=true to reinstall.`,
      }
    }

    // Load the plugin module
    const loadResult = await pluginLoader.load(source)
    if (!loadResult.success || !loadResult.module) {
      return {
        success: false,
        error: loadResult.error || 'Failed to load plugin module',
      }
    }

    const module = loadResult.module

    // Create plugin instance
    const plugin: Plugin = {
      manifest: module.manifest,
      status: 'installed',
      module,
      source,
      installedAt: new Date(),
    }

    // Store plugin
    this.plugins.set(module.manifest.id, plugin)

    // Emit event
    this.emitEvent({
      type: 'installed',
      pluginId: module.manifest.id,
      timestamp: new Date(),
    })

    // Load and optionally enable
    await this.load(module.manifest.id)

    if (enableAfterInstall) {
      await this.enable(module.manifest.id)
    }

    return {
      success: true,
      plugin,
    }
  }

  /**
   * Install a plugin from a pre-loaded module (for built-in plugins)
   */
  installFromModule(module: PluginModule, source: string = 'built-in'): PluginInstallResult {
    if (!validateModule(module)) {
      return {
        success: false,
        error: 'Invalid plugin module',
      }
    }

    const plugin: Plugin = {
      manifest: module.manifest,
      status: 'installed',
      module,
      source,
      installedAt: new Date(),
    }

    this.plugins.set(module.manifest.id, plugin)

    this.emitEvent({
      type: 'installed',
      pluginId: module.manifest.id,
      timestamp: new Date(),
    })

    return {
      success: true,
      plugin,
    }
  }

  /**
   * Load a plugin (call onLoad hook)
   */
  async load(pluginId: string): Promise<boolean> {
    const plugin = this.plugins.get(pluginId)
    if (!plugin) {
      return false
    }

    if (plugin.status === 'loaded' || plugin.status === 'enabled') {
      return true // Already loaded
    }

    try {
      // Call onLoad hook if present
      if (plugin.module.onLoad) {
        await plugin.module.onLoad()
      }

      plugin.status = 'loaded'

      this.emitEvent({
        type: 'loaded',
        pluginId,
        timestamp: new Date(),
      })

      return true
    } catch (error) {
      plugin.status = 'error'
      plugin.error = error instanceof Error ? error.message : 'Unknown load error'

      this.emitEvent({
        type: 'error',
        pluginId,
        timestamp: new Date(),
        error: plugin.error,
      })

      return false
    }
  }

  /**
   * Enable a plugin (register adapter and call onEnable hook)
   */
  async enable(pluginId: string): Promise<boolean> {
    const plugin = this.plugins.get(pluginId)
    if (!plugin) {
      return false
    }

    if (plugin.status === 'enabled') {
      return true // Already enabled
    }

    // Ensure plugin is loaded
    if (plugin.status !== 'loaded' && plugin.status !== 'disabled') {
      const loaded = await this.load(pluginId)
      if (!loaded) {
        return false
      }
    }

    try {
      // Call onEnable hook if present
      if (plugin.module.onEnable) {
        await plugin.module.onEnable()
      }

      // Register adapter with the registry
      adapterRegistry.register(
        plugin.manifest.harnessType,
        plugin.manifest.name,
        plugin.module.createAdapter
      )

      plugin.status = 'enabled'
      plugin.enabledAt = new Date()

      // Update config
      this.configs.set(pluginId, {
        id: pluginId,
        enabled: true,
      })

      this.emitEvent({
        type: 'enabled',
        pluginId,
        timestamp: new Date(),
      })

      return true
    } catch (error) {
      plugin.status = 'error'
      plugin.error = error instanceof Error ? error.message : 'Unknown enable error'

      this.emitEvent({
        type: 'error',
        pluginId,
        timestamp: new Date(),
        error: plugin.error,
      })

      return false
    }
  }

  /**
   * Disable a plugin (unregister adapter and call onDisable hook)
   */
  async disable(pluginId: string): Promise<boolean> {
    const plugin = this.plugins.get(pluginId)
    if (!plugin) {
      return false
    }

    if (plugin.status !== 'enabled') {
      return true // Not enabled, nothing to disable
    }

    try {
      // Call onDisable hook if present
      if (plugin.module.onDisable) {
        await plugin.module.onDisable()
      }

      // Unregister adapter
      adapterRegistry.unregister(plugin.manifest.harnessType)

      plugin.status = 'disabled'
      plugin.adapter = undefined

      // Update config
      this.configs.set(pluginId, {
        id: pluginId,
        enabled: false,
      })

      this.emitEvent({
        type: 'disabled',
        pluginId,
        timestamp: new Date(),
      })

      return true
    } catch (error) {
      plugin.status = 'error'
      plugin.error = error instanceof Error ? error.message : 'Unknown disable error'

      this.emitEvent({
        type: 'error',
        pluginId,
        timestamp: new Date(),
        error: plugin.error,
      })

      return false
    }
  }

  /**
   * Uninstall a plugin
   */
  async uninstall(pluginId: string): Promise<boolean> {
    const plugin = this.plugins.get(pluginId)
    if (!plugin) {
      return false
    }

    // Disable first if enabled
    if (plugin.status === 'enabled') {
      await this.disable(pluginId)
    }

    // Call onUnload hook if present
    try {
      if (plugin.module.onUnload) {
        await plugin.module.onUnload()
      }
    } catch {
      // Ignore unload errors during uninstall
    }

    // Remove from loader
    pluginLoader.unload(plugin.source)

    // Remove plugin
    this.plugins.delete(pluginId)
    this.configs.delete(pluginId)

    this.emitEvent({
      type: 'uninstalled',
      pluginId,
      timestamp: new Date(),
    })

    return true
  }

  /**
   * Get a plugin by ID
   */
  get(pluginId: string): Plugin | undefined {
    return this.plugins.get(pluginId)
  }

  /**
   * Get all plugins
   */
  getAll(): Plugin[] {
    return Array.from(this.plugins.values())
  }

  /**
   * Get plugins by status
   */
  getByStatus(status: PluginStatus): Plugin[] {
    return this.getAll().filter((p) => p.status === status)
  }

  /**
   * Get enabled plugins
   */
  getEnabled(): Plugin[] {
    return this.getByStatus('enabled')
  }

  /**
   * Check if a plugin is installed
   */
  isInstalled(pluginId: string): boolean {
    return this.plugins.has(pluginId)
  }

  /**
   * Check if a plugin is enabled
   */
  isEnabled(pluginId: string): boolean {
    const plugin = this.plugins.get(pluginId)
    return plugin?.status === 'enabled'
  }

  /**
   * Get plugin configuration
   */
  getConfig(pluginId: string): PluginConfig | undefined {
    return this.configs.get(pluginId)
  }

  /**
   * Set plugin configuration
   */
  setConfig(pluginId: string, config: Partial<PluginConfig>): void {
    const existing = this.configs.get(pluginId) || { id: pluginId, enabled: false }
    this.configs.set(pluginId, { ...existing, ...config })
  }

  /**
   * Subscribe to plugin events
   */
  addEventListener(listener: PluginEventListener): void {
    this.eventListeners.add(listener)
  }

  /**
   * Unsubscribe from plugin events
   */
  removeEventListener(listener: PluginEventListener): void {
    this.eventListeners.delete(listener)
  }

  /**
   * Emit a plugin event
   */
  private emitEvent(event: PluginEvent): void {
    for (const listener of this.eventListeners) {
      try {
        listener(event)
      } catch {
        // Ignore listener errors
      }
    }
  }

  /**
   * Clear all plugins (for testing)
   */
  clear(): void {
    this.plugins.clear()
    this.configs.clear()
    pluginLoader.clear()
  }
}

/** Global plugin manager instance */
export const pluginManager = new PluginManager()
