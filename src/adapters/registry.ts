/**
 * Harness Adapter Registry
 * Manages registration and retrieval of harness-specific adapters
 */

import type { HarnessType, DetectionResult } from '@/types'
import type { HarnessAdapter } from './base'

/** Factory function type for creating adapter instances */
export type AdapterFactory = () => HarnessAdapter

/** Registry entry containing adapter metadata and factory */
interface RegistryEntry {
  type: HarnessType
  displayName: string
  factory: AdapterFactory
}

/**
 * Singleton registry for all harness adapters
 * Provides centralized adapter management and discovery
 */
class AdapterRegistry {
  private adapters: Map<HarnessType, RegistryEntry> = new Map()
  private instances: Map<HarnessType, HarnessAdapter> = new Map()

  /**
   * Register a new adapter factory
   * @param type - The harness type identifier
   * @param displayName - Human-readable name
   * @param factory - Factory function to create adapter instances
   */
  register(type: HarnessType, displayName: string, factory: AdapterFactory): void {
    if (this.adapters.has(type)) {
      console.warn(`Adapter for ${type} is already registered. Overwriting.`)
    }
    this.adapters.set(type, { type, displayName, factory })
    // Clear cached instance when re-registering
    this.instances.delete(type)
  }

  /**
   * Unregister an adapter
   * @param type - The harness type to unregister
   */
  unregister(type: HarnessType): boolean {
    this.instances.delete(type)
    return this.adapters.delete(type)
  }

  /**
   * Get an adapter instance for a specific harness type
   * Instances are cached for reuse
   * @param type - The harness type
   * @returns The adapter instance or null if not registered
   */
  get(type: HarnessType): HarnessAdapter | null {
    // Return cached instance if available
    const cached = this.instances.get(type)
    if (cached) {
      return cached
    }

    // Create new instance from factory
    const entry = this.adapters.get(type)
    if (!entry) {
      return null
    }

    const instance = entry.factory()
    this.instances.set(type, instance)
    return instance
  }

  /**
   * Get all registered harness types
   */
  getRegisteredTypes(): HarnessType[] {
    return Array.from(this.adapters.keys())
  }

  /**
   * Get metadata for all registered adapters
   */
  getRegisteredAdapters(): Array<{ type: HarnessType; displayName: string }> {
    return Array.from(this.adapters.values()).map(({ type, displayName }) => ({
      type,
      displayName,
    }))
  }

  /**
   * Check if an adapter is registered for a type
   */
  has(type: HarnessType): boolean {
    return this.adapters.has(type)
  }

  /**
   * Detect all registered harnesses
   * Runs detection in parallel for efficiency
   */
  async detectAll(): Promise<DetectionResult[]> {
    const results: DetectionResult[] = []

    const detectionPromises = Array.from(this.adapters.keys()).map(async (type) => {
      const adapter = this.get(type)
      if (!adapter) return null

      try {
        return await adapter.detect()
      } catch (error) {
        return {
          type,
          detected: false,
          status: 'disabled' as const,
          configPaths: {},
          error: error instanceof Error ? error.message : 'Unknown detection error',
        }
      }
    })

    const detectionResults = await Promise.all(detectionPromises)
    for (const result of detectionResults) {
      if (result) {
        results.push(result)
      }
    }

    return results
  }

  /**
   * Get all detected/available harnesses
   */
  async getAvailable(): Promise<HarnessAdapter[]> {
    const results = await this.detectAll()
    const available: HarnessAdapter[] = []

    for (const result of results) {
      if (result.detected) {
        const adapter = this.get(result.type)
        if (adapter) {
          available.push(adapter)
        }
      }
    }

    return available
  }

  /**
   * Clear all cached instances (useful for testing)
   */
  clearCache(): void {
    this.instances.clear()
  }

  /**
   * Clear entire registry (useful for testing)
   */
  clear(): void {
    this.adapters.clear()
    this.instances.clear()
  }
}

/** Global adapter registry instance */
export const adapterRegistry = new AdapterRegistry()

/**
 * Convenience function to get an adapter by type
 * @param type - The harness type
 * @returns The adapter instance or throws if not found
 */
export function getAdapter(type: HarnessType): HarnessAdapter {
  const adapter = adapterRegistry.get(type)
  if (!adapter) {
    throw new Error(`No adapter registered for harness type: ${type}`)
  }
  return adapter
}

/**
 * Convenience function to register an adapter
 */
export function registerAdapter(
  type: HarnessType,
  displayName: string,
  factory: AdapterFactory
): void {
  adapterRegistry.register(type, displayName, factory)
}
