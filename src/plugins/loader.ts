/**
 * Plugin Loader
 * Handles loading plugins from npm packages or local paths
 */

import type { PluginManifest, PluginModule } from './types'

/**
 * Plugin load result
 */
export interface PluginLoadResult {
  success: boolean
  module?: PluginModule
  manifest?: PluginManifest
  error?: string
}

/**
 * Validate a plugin manifest
 */
export function validateManifest(manifest: unknown): manifest is PluginManifest {
  if (!manifest || typeof manifest !== 'object') {
    return false
  }

  const m = manifest as Record<string, unknown>

  // Required fields
  if (typeof m.id !== 'string' || m.id.length === 0) return false
  if (typeof m.name !== 'string' || m.name.length === 0) return false
  if (typeof m.version !== 'string' || m.version.length === 0) return false
  if (typeof m.description !== 'string') return false
  if (typeof m.harnessType !== 'string') return false
  if (typeof m.main !== 'string' || m.main.length === 0) return false

  return true
}

/**
 * Validate a plugin module exports
 */
export function validateModule(module: unknown): module is PluginModule {
  if (!module || typeof module !== 'object') {
    return false
  }

  const m = module as Record<string, unknown>

  // Must have manifest and createAdapter
  if (!validateManifest(m.manifest)) return false
  if (typeof m.createAdapter !== 'function') return false

  // Optional hooks must be functions if present
  if (m.onLoad !== undefined && typeof m.onLoad !== 'function') return false
  if (m.onUnload !== undefined && typeof m.onUnload !== 'function') return false
  if (m.onEnable !== undefined && typeof m.onEnable !== 'function') return false
  if (m.onDisable !== undefined && typeof m.onDisable !== 'function') return false

  return true
}

/**
 * Plugin Loader class
 * Handles loading plugins from various sources
 */
export class PluginLoader {
  private loadedModules: Map<string, PluginModule> = new Map()

  /**
   * Load a plugin from an npm package
   * @param packageName - The npm package name
   */
  async loadFromNpm(packageName: string): Promise<PluginLoadResult> {
    // TODO: Implement actual npm package loading via backend service
    // This would involve:
    // 1. Checking if package is installed
    // 2. If not, installing it via npm/bun
    // 3. Importing the module
    // 4. Validating it exports the required interface

    // For now, return a mock error indicating npm loading is not yet implemented
    return {
      success: false,
      error: `npm package loading not yet implemented. Package: ${packageName}`,
    }
  }

  /**
   * Load a plugin from a local file path
   * @param filePath - Path to the plugin entry file or directory
   */
  async loadFromPath(filePath: string): Promise<PluginLoadResult> {
    // TODO: Implement actual file system loading via backend service
    // This would involve:
    // 1. Reading the manifest from package.json or manifest.json
    // 2. Dynamically importing the main module
    // 3. Validating the exports

    // For now, return a mock error indicating file loading is not yet implemented
    return {
      success: false,
      error: `Local plugin loading not yet implemented. Path: ${filePath}`,
    }
  }

  /**
   * Load a plugin from a source (auto-detect npm vs local)
   * @param source - npm package name or local path
   */
  async load(source: string): Promise<PluginLoadResult> {
    // Check if already loaded
    if (this.loadedModules.has(source)) {
      const module = this.loadedModules.get(source)!
      return {
        success: true,
        module,
        manifest: module.manifest,
      }
    }

    // Detect if source is npm package or local path
    const isLocalPath =
      source.startsWith('/') || source.startsWith('./') || source.startsWith('../')

    if (isLocalPath) {
      return this.loadFromPath(source)
    } else {
      return this.loadFromNpm(source)
    }
  }

  /**
   * Register a plugin module directly (for built-in or pre-loaded plugins)
   * @param source - Source identifier
   * @param module - The plugin module
   */
  register(source: string, module: PluginModule): PluginLoadResult {
    if (!validateModule(module)) {
      return {
        success: false,
        error: 'Invalid plugin module: missing required exports',
      }
    }

    this.loadedModules.set(source, module)
    return {
      success: true,
      module,
      manifest: module.manifest,
    }
  }

  /**
   * Unload a plugin module
   * @param source - Source identifier
   */
  unload(source: string): boolean {
    return this.loadedModules.delete(source)
  }

  /**
   * Get a loaded module
   * @param source - Source identifier
   */
  getModule(source: string): PluginModule | undefined {
    return this.loadedModules.get(source)
  }

  /**
   * Check if a module is loaded
   * @param source - Source identifier
   */
  isLoaded(source: string): boolean {
    return this.loadedModules.has(source)
  }

  /**
   * Get all loaded modules
   */
  getAllModules(): Map<string, PluginModule> {
    return new Map(this.loadedModules)
  }

  /**
   * Clear all loaded modules
   */
  clear(): void {
    this.loadedModules.clear()
  }
}

/** Global plugin loader instance */
export const pluginLoader = new PluginLoader()
