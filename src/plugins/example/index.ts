/**
 * Example Plugin Template
 * Demonstrates how to create a custom adapter plugin
 *
 * To use this as a template:
 * 1. Copy this directory to your plugin project
 * 2. Update the manifest with your plugin details
 * 3. Implement your adapter extending BaseHarnessAdapter
 * 4. Export the required interface
 */

import { BaseHarnessAdapter } from '@/adapters'
import type {
  HarnessType,
  HarnessConfig,
  DetectionResult,
  HarnessConfigPaths,
  Skill,
  SkillSummary,
  CreateSkillOptions,
  Hook,
  HookSummary,
  CreateHookOptions,
  Session,
  SessionSummary,
  SessionFilterOptions,
  MemoryStats,
  MemoryEntry,
  MemoryEntrySummary,
  HarnessSettings,
  Setting,
} from '@/types'
import type { PluginModule, PluginManifest } from '../types'

// ============================================
// Plugin Manifest
// ============================================

/**
 * Plugin manifest - required metadata
 * In a real plugin, this would come from package.json
 */
export const manifest: PluginManifest = {
  id: 'example-plugin',
  name: 'Example Plugin',
  version: '1.0.0',
  description: 'An example plugin demonstrating the adapter plugin system',
  author: 'Agent Config Manager Team',
  homepage: 'https://github.com/example/agent-config-manager-example-plugin',
  minAppVersion: '1.0.0',
  harnessType: 'claude-code' as HarnessType, // Would be a custom type in real plugin
  main: './index.ts',
  brandColor: '#8B5CF6',
  keywords: ['example', 'template', 'demo'],
  license: 'MIT',
}

// ============================================
// Example Adapter Implementation
// ============================================

/**
 * Example adapter - demonstrates the implementation pattern
 * Real adapters would interact with actual harness configuration files
 */
class ExampleAdapter extends BaseHarnessAdapter {
  readonly type: HarnessType = manifest.harnessType
  readonly displayName = manifest.name

  // ============================================
  // Detection & Configuration
  // ============================================

  async detect(): Promise<DetectionResult> {
    const configPaths: HarnessConfigPaths = {
      settings: '~/.example/config.json',
    }

    return {
      type: this.type,
      detected: true, // Would check if harness is actually installed
      status: 'active',
      version: '1.0.0',
      configPaths,
    }
  }

  async getConfig(): Promise<HarnessConfig> {
    const detection = await this.detect()
    const skills = await this.listSkills()
    const hooks = await this.listHooks()
    const sessions = await this.listSessions()

    return {
      id: manifest.id,
      name: this.displayName,
      type: this.type,
      status: detection.status,
      version: detection.version,
      configPaths: detection.configPaths,
      stats: {
        skillCount: skills.length,
        hookCount: hooks.length,
        sessionCount: sessions.length,
        memorySize: 0,
      },
      brandColor: manifest.brandColor,
      icon: 'example',
    }
  }

  // ============================================
  // Skills Management
  // ============================================

  async listSkills(): Promise<SkillSummary[]> {
    // TODO: Implement actual skill listing
    return []
  }

  async getSkill(_id: string): Promise<Skill | null> {
    // TODO: Implement actual skill retrieval
    return null
  }

  async createSkill(options: CreateSkillOptions): Promise<Skill> {
    const id = `example-${options.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`
    return {
      id,
      harness: this.type,
      filePath: '~/.example/skills',
      metadata: {
        name: options.name,
        description: options.description,
        category: options.category,
        triggers: options.triggers || [],
      },
      content: options.content,
      status: 'enabled',
      stats: { invocationCount: 0 },
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  }

  async updateSkill(id: string, updates: Partial<CreateSkillOptions>): Promise<Skill> {
    const existing = await this.getSkill(id)
    if (!existing) throw new Error(`Skill not found: ${id}`)
    return {
      ...existing,
      metadata: {
        ...existing.metadata,
        ...updates,
      },
      updatedAt: new Date(),
    }
  }

  async deleteSkill(id: string): Promise<void> {
    const skill = await this.getSkill(id)
    if (!skill) throw new Error(`Skill not found: ${id}`)
  }

  // ============================================
  // Hooks Management
  // ============================================

  async listHooks(): Promise<HookSummary[]> {
    return []
  }

  async getHook(_id: string): Promise<Hook | null> {
    return null
  }

  async createHook(options: CreateHookOptions): Promise<Hook> {
    const id = options.name.toLowerCase().replace(/\s+/g, '-')
    return {
      id,
      name: options.name,
      harness: this.type,
      config: options.config,
      scriptPath: '~/.example/hooks',
      scriptContent: options.scriptContent,
      scriptLanguage: options.scriptLanguage,
      status: 'enabled',
      stats: { runCount: 0, allowCount: 0, blockCount: 0, errorCount: 0 },
      description: options.description,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  }

  async updateHook(id: string, _updates: Partial<CreateHookOptions>): Promise<Hook> {
    const existing = await this.getHook(id)
    if (!existing) throw new Error(`Hook not found: ${id}`)
    throw new Error('Not implemented')
  }

  async deleteHook(id: string): Promise<void> {
    const hook = await this.getHook(id)
    if (!hook) throw new Error(`Hook not found: ${id}`)
  }

  // ============================================
  // Sessions Management
  // ============================================

  async listSessions(_options?: SessionFilterOptions): Promise<SessionSummary[]> {
    return []
  }

  async getSession(_id: string): Promise<Session | null> {
    return null
  }

  async deleteSession(id: string): Promise<void> {
    const session = await this.getSession(id)
    if (!session) throw new Error(`Session not found: ${id}`)
  }

  // ============================================
  // Memory Management
  // ============================================

  async getMemoryStats(): Promise<MemoryStats> {
    return {
      totalEntries: 0,
      totalSize: 0,
      byType: [],
      byHarness: [{ harness: this.type, entryCount: 0, totalSize: 0, percentage: 100 }],
      storageLocations: [],
      oldestEntry: new Date(),
      newestEntry: new Date(),
    }
  }

  async listMemoryEntries(_options?: {
    type?: string
    limit?: number
  }): Promise<MemoryEntrySummary[]> {
    return []
  }

  async getMemoryEntry(_id: string): Promise<MemoryEntry | null> {
    return null
  }

  async deleteMemoryEntry(id: string): Promise<void> {
    const entry = await this.getMemoryEntry(id)
    if (!entry) throw new Error(`Memory entry not found: ${id}`)
  }

  // ============================================
  // Settings Management
  // ============================================

  async getSettings(): Promise<HarnessSettings> {
    return {
      harness: this.type,
      filePath: '~/.example/config.json',
      settings: [],
      lastSyncedAt: new Date(),
    }
  }

  async getSetting(_key: string): Promise<Setting | null> {
    return null
  }

  async setSetting(_key: string, _value: unknown): Promise<void> {
    // TODO: Implement setting update
  }
}

// ============================================
// Plugin Lifecycle Hooks
// ============================================

/**
 * Called when the plugin is loaded
 */
async function onLoad(): Promise<void> {
  // Initialize any resources needed by the plugin
  // This runs before the adapter is registered
}

/**
 * Called when the plugin is unloaded
 */
async function onUnload(): Promise<void> {
  // Clean up any resources
  // This runs when the plugin is uninstalled
}

/**
 * Called when the plugin is enabled
 */
async function onEnable(): Promise<void> {
  // Called after the adapter is registered
  // Perform any setup needed when the plugin becomes active
}

/**
 * Called when the plugin is disabled
 */
async function onDisable(): Promise<void> {
  // Called before the adapter is unregistered
  // Perform any cleanup needed when the plugin becomes inactive
}

// ============================================
// Plugin Module Export
// ============================================

/**
 * Factory function to create adapter instances
 */
export const createAdapter = () => new ExampleAdapter()

/**
 * Complete plugin module export
 * This is what the plugin system expects to find
 */
const plugin: PluginModule = {
  manifest,
  createAdapter,
  onLoad,
  onUnload,
  onEnable,
  onDisable,
}

export default plugin
