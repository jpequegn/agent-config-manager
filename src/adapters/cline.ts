/**
 * Cline Adapter
 * Implements HarnessAdapter for Cline AI coding assistant
 *
 * Configuration locations:
 * - Config: ~/.cline/config.json
 * - Task history: ~/.cline/tasks/
 */

import { BaseHarnessAdapter } from './base'
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

// Type definitions for Cline configuration files
// TODO: These interfaces will be used when implementing actual file parsing via backend

/** Cline config.json structure */
export interface ClineConfig {
  apiProvider?: string
  apiKey?: string
  model?: string
  maxTokens?: number
  temperature?: number
  customInstructions?: string
  [key: string]: unknown
}

/** Cline task entry */
export interface ClineTask {
  id: string
  title: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  createdAt: Date
  completedAt?: Date
}

/**
 * Cline Adapter
 * Provides access to Cline configuration and task history
 */
export class ClineAdapter extends BaseHarnessAdapter {
  readonly type: HarnessType = 'cline'
  readonly displayName = 'Cline'

  // TODO: Use os.homedir() for cross-platform path resolution
  private readonly basePaths = {
    config: '~/.cline',
    configFile: '~/.cline/config.json',
    tasks: '~/.cline/tasks',
  }

  // ============================================
  // Detection & Configuration
  // ============================================

  async detect(): Promise<DetectionResult> {
    // TODO: Implement actual filesystem detection via backend service
    const configPaths: HarnessConfigPaths = {
      settings: this.basePaths.configFile,
      memory: this.basePaths.tasks,
    }

    // TODO: Check if Cline config files actually exist
    return {
      type: this.type,
      detected: true,
      status: 'active',
      version: '2.2.0',
      configPaths,
    }
  }

  async getConfig(): Promise<HarnessConfig> {
    const detection = await this.detect()
    const skills = await this.listSkills()
    const hooks = await this.listHooks()
    const sessions = await this.listSessions()

    return {
      id: 'cline',
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
        lastActivity: sessions[0]?.startedAt,
      },
      brandColor: '#6366F1',
      icon: 'cline',
    }
  }

  // ============================================
  // Skills Management
  // ============================================

  async listSkills(): Promise<SkillSummary[]> {
    // TODO: Scan for Cline custom instructions via backend
    return [
      {
        id: 'cline-instructions',
        harness: this.type,
        name: 'Custom Instructions',
        description: 'Global custom instructions for Cline',
        category: 'core',
        status: 'enabled',
      },
    ]
  }

  async getSkill(id: string): Promise<Skill | null> {
    const skills = await this.listSkills()
    const summary = skills.find((s) => s.id === id)
    if (!summary) return null

    return {
      id: summary.id,
      harness: this.type,
      filePath: this.basePaths.configFile,
      metadata: {
        name: summary.name,
        description: summary.description,
        category: summary.category,
        triggers: [],
      },
      content: '# Cline Instructions\n\nCustom instructions configured in Cline...',
      status: summary.status,
      stats: { invocationCount: 0 },
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  }

  async createSkill(options: CreateSkillOptions): Promise<Skill> {
    const id = `cline-${options.name.toLowerCase().replace(/\s+/g, '-')}`
    return {
      id,
      harness: this.type,
      filePath: this.basePaths.configFile,
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
        name: updates.name || existing.metadata.name,
        description: updates.description || existing.metadata.description,
        category: updates.category || existing.metadata.category,
      },
      content: updates.content || existing.content,
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

  async getHook(id: string): Promise<Hook | null> {
    const hooks = await this.listHooks()
    return hooks.find((h) => h.id === id) ? null : null
  }

  async createHook(options: CreateHookOptions): Promise<Hook> {
    const id = options.name.toLowerCase().replace(/\s+/g, '-')
    return {
      id,
      name: options.name,
      harness: this.type,
      config: options.config,
      scriptPath: `${this.basePaths.config}/hooks/${id}`,
      scriptContent: options.scriptContent,
      scriptLanguage: options.scriptLanguage,
      status: 'enabled',
      stats: { runCount: 0, allowCount: 0, blockCount: 0, errorCount: 0 },
      description: options.description,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  }

  async updateHook(id: string, updates: Partial<CreateHookOptions>): Promise<Hook> {
    const existing = await this.getHook(id)
    if (!existing) throw new Error(`Hook not found: ${id}`)
    return { ...existing, ...updates, updatedAt: new Date() } as Hook
  }

  async deleteHook(id: string): Promise<void> {
    const hook = await this.getHook(id)
    if (!hook) throw new Error(`Hook not found: ${id}`)
  }

  // ============================================
  // Sessions Management (Task History)
  // ============================================

  async listSessions(options?: SessionFilterOptions): Promise<SessionSummary[]> {
    // TODO: Read task history from ~/.cline/tasks/ via backend
    const sessions: SessionSummary[] = [
      {
        id: 'cline-task-001',
        harness: this.type,
        title: 'Implement new feature',
        project: 'my-project',
        startedAt: new Date(Date.now() - 3600000),
        endedAt: new Date(),
        duration: 3600000,
        messageCount: 28,
        lastMessagePreview: 'Feature implementation complete',
        tags: ['feature'],
      },
    ]

    let filtered = sessions
    if (options?.project) {
      filtered = filtered.filter((s) => s.project === options.project)
    }
    if (options?.searchText) {
      const search = options.searchText.toLowerCase()
      filtered = filtered.filter((s) => s.title.toLowerCase().includes(search))
    }
    return filtered
  }

  async getSession(id: string): Promise<Session | null> {
    const sessions = await this.listSessions()
    const summary = sessions.find((s) => s.id === id)
    if (!summary) return null

    return {
      id: summary.id,
      harness: this.type,
      metadata: { title: summary.title, project: summary.project, tags: summary.tags },
      messages: [
        {
          id: 'msg-001',
          role: 'user',
          content: 'Implement the new feature',
          timestamp: summary.startedAt,
        },
        {
          id: 'msg-002',
          role: 'assistant',
          content: "I'll implement the feature...",
          timestamp: new Date(summary.startedAt.getTime() + 1000),
        },
      ],
      stats: {
        messageCount: summary.messageCount,
        userMessageCount: Math.floor(summary.messageCount / 2),
        assistantMessageCount: Math.ceil(summary.messageCount / 2),
        toolCallCount: 15,
        fileChangeCount: 8,
        duration: summary.duration,
      },
      startedAt: summary.startedAt,
      endedAt: summary.endedAt,
      isActive: !summary.endedAt,
    }
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
      totalEntries: 25,
      totalSize: 5242880,
      byType: [{ type: 'session', entryCount: 25, totalSize: 5242880, percentage: 100 }],
      byHarness: [{ harness: this.type, entryCount: 25, totalSize: 5242880, percentage: 100 }],
      storageLocations: [
        {
          location: 'local',
          name: 'Cline Tasks',
          path: this.basePaths.tasks,
          totalCapacity: 104857600,
          usedSpace: 5242880,
          availableSpace: 99614720,
          isConnected: true,
        },
      ],
      oldestEntry: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      newestEntry: new Date(),
    }
  }

  async listMemoryEntries(options?: {
    type?: string
    limit?: number
  }): Promise<MemoryEntrySummary[]> {
    const entries: MemoryEntrySummary[] = [
      {
        id: 'cline-mem-001',
        harness: this.type,
        type: 'session',
        title: 'Task: Implement new feature',
        size: 20480,
        createdAt: new Date(Date.now() - 3600000),
        lastAccessedAt: new Date(),
      },
    ]
    let filtered = entries
    if (options?.type) filtered = filtered.filter((e) => e.type === options.type)
    if (options?.limit) filtered = filtered.slice(0, options.limit)
    return filtered
  }

  async getMemoryEntry(id: string): Promise<MemoryEntry | null> {
    const entries = await this.listMemoryEntries()
    const summary = entries.find((e) => e.id === id)
    if (!summary) return null
    return {
      ...summary,
      harness: this.type,
      content: '# Task Memory\n\nTask execution history...',
      filePath: `${this.basePaths.tasks}/${id}`,
      metadata: { source: 'cline-task-001' },
      updatedAt: summary.lastAccessedAt,
    }
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
      filePath: this.basePaths.configFile,
      settings: [
        { key: 'apiProvider', value: 'anthropic', source: 'user', isModified: true },
        { key: 'model', value: 'claude-sonnet-4-20250514', source: 'user', isModified: true },
        { key: 'maxTokens', value: 4096, source: 'user', isModified: false },
      ],
      lastSyncedAt: new Date(),
    }
  }

  async getSetting(key: string): Promise<Setting | null> {
    const settings = await this.getSettings()
    return settings.settings.find((s) => s.key === key) || null
  }

  async setSetting(_key: string, _value: unknown): Promise<void> {
    // Would update config.json via backend service
  }
}

export const createClineAdapter = (): ClineAdapter => new ClineAdapter()
