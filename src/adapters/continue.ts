/**
 * Continue Adapter
 * Implements HarnessAdapter for Continue AI coding assistant
 *
 * Configuration locations:
 * - Config: ~/.continue/config.json
 * - Slash commands: ~/.continue/config.json (slashCommands array)
 * - Codebase index: ~/.continue/index/
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

// Type definitions for Continue configuration files
// TODO: These interfaces will be used when implementing actual file parsing via backend

/** Continue config.json structure */
export interface ContinueConfig {
  models?: ContinueModel[]
  slashCommands?: ContinueSlashCommand[]
  customCommands?: ContinueCustomCommand[]
  contextProviders?: ContinueContextProvider[]
  tabAutocompleteModel?: ContinueModel
  embeddingsProvider?: ContinueEmbeddingsProvider
  [key: string]: unknown
}

/** Continue model configuration */
export interface ContinueModel {
  title: string
  provider: string
  model: string
  apiKey?: string
  apiBase?: string
}

/** Continue slash command */
export interface ContinueSlashCommand {
  name: string
  description: string
  prompt?: string
}

/** Continue custom command */
export interface ContinueCustomCommand {
  name: string
  description: string
  prompt: string
}

/** Continue context provider */
export interface ContinueContextProvider {
  name: string
  params?: Record<string, unknown>
}

/** Continue embeddings provider */
export interface ContinueEmbeddingsProvider {
  provider: string
  model?: string
  apiKey?: string
}

/**
 * Continue Adapter
 * Provides access to Continue configuration, slash commands, and codebase index
 */
export class ContinueAdapter extends BaseHarnessAdapter {
  readonly type: HarnessType = 'continue'
  readonly displayName = 'Continue'

  // TODO: Use os.homedir() for cross-platform path resolution
  private readonly basePaths = {
    config: '~/.continue',
    configFile: '~/.continue/config.json',
    index: '~/.continue/index',
  }

  // ============================================
  // Detection & Configuration
  // ============================================

  async detect(): Promise<DetectionResult> {
    // TODO: Implement actual filesystem detection via backend service
    const configPaths: HarnessConfigPaths = {
      settings: this.basePaths.configFile,
      skills: this.basePaths.configFile,
      memory: this.basePaths.index,
    }

    // TODO: Check if Continue config files actually exist
    return {
      type: this.type,
      detected: true,
      status: 'active',
      version: '0.9.0',
      configPaths,
    }
  }

  async getConfig(): Promise<HarnessConfig> {
    const detection = await this.detect()
    const skills = await this.listSkills()
    const hooks = await this.listHooks()
    const sessions = await this.listSessions()

    return {
      id: 'continue',
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
      brandColor: '#F59E0B',
      icon: 'continue',
    }
  }

  // ============================================
  // Skills Management (Slash Commands)
  // ============================================

  async listSkills(): Promise<SkillSummary[]> {
    // TODO: Read slashCommands from config.json via backend
    return [
      {
        id: 'cmd-edit',
        harness: this.type,
        name: '/edit',
        description: 'Edit code with AI assistance',
        category: 'development',
        status: 'enabled',
      },
      {
        id: 'cmd-comment',
        harness: this.type,
        name: '/comment',
        description: 'Add comments to code',
        category: 'documentation',
        status: 'enabled',
      },
      {
        id: 'cmd-share',
        harness: this.type,
        name: '/share',
        description: 'Share context with AI',
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
        triggers: [{ pattern: summary.name, isRegex: false }],
      },
      content: `# ${summary.name}\n\n${summary.description}`,
      status: summary.status,
      stats: { invocationCount: 0 },
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  }

  async createSkill(options: CreateSkillOptions): Promise<Skill> {
    const id = `cmd-${options.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`
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
  // Sessions Management
  // ============================================

  async listSessions(options?: SessionFilterOptions): Promise<SessionSummary[]> {
    const sessions: SessionSummary[] = [
      {
        id: 'continue-session-001',
        harness: this.type,
        title: 'Code refactoring session',
        project: 'my-app',
        startedAt: new Date(Date.now() - 5400000),
        endedAt: new Date(),
        duration: 5400000,
        messageCount: 35,
        lastMessagePreview: 'Refactoring complete',
        tags: ['refactoring'],
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
          content: 'Help me refactor this code',
          timestamp: summary.startedAt,
        },
        {
          id: 'msg-002',
          role: 'assistant',
          content: "I'll help you refactor...",
          timestamp: new Date(summary.startedAt.getTime() + 1000),
        },
      ],
      stats: {
        messageCount: summary.messageCount,
        userMessageCount: Math.floor(summary.messageCount / 2),
        assistantMessageCount: Math.ceil(summary.messageCount / 2),
        toolCallCount: 20,
        fileChangeCount: 12,
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
  // Memory Management (Codebase Index)
  // ============================================

  async getMemoryStats(): Promise<MemoryStats> {
    return {
      totalEntries: 150,
      totalSize: 52428800,
      byType: [
        { type: 'codebase-index', entryCount: 100, totalSize: 41943040, percentage: 80 },
        { type: 'session', entryCount: 50, totalSize: 10485760, percentage: 20 },
      ],
      byHarness: [{ harness: this.type, entryCount: 150, totalSize: 52428800, percentage: 100 }],
      storageLocations: [
        {
          location: 'local',
          name: 'Continue Index',
          path: this.basePaths.index,
          totalCapacity: 536870912,
          usedSpace: 52428800,
          availableSpace: 484442112,
          isConnected: true,
        },
      ],
      oldestEntry: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      newestEntry: new Date(),
    }
  }

  async listMemoryEntries(options?: {
    type?: string
    limit?: number
  }): Promise<MemoryEntrySummary[]> {
    const entries: MemoryEntrySummary[] = [
      {
        id: 'continue-idx-001',
        harness: this.type,
        type: 'codebase-index',
        title: 'Codebase Index: my-app',
        size: 20971520,
        createdAt: new Date(Date.now() - 86400000),
        lastAccessedAt: new Date(),
      },
      {
        id: 'continue-mem-001',
        harness: this.type,
        type: 'session',
        title: 'Session: Code refactoring',
        size: 40960,
        createdAt: new Date(Date.now() - 5400000),
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
      content: '# Memory Entry\n\nContinue index/session data...',
      filePath: `${this.basePaths.index}/${id}`,
      metadata: { source: 'continue' },
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
    // TODO: Read from config.json via backend service
    // Note: Complex settings like models array are stored as JSON strings
    return {
      harness: this.type,
      filePath: this.basePaths.configFile,
      settings: [
        { key: 'models', value: 'claude-sonnet-4-20250514', source: 'user', isModified: true },
        { key: 'tabAutocompleteModel', value: 'claude-haiku', source: 'user', isModified: true },
        { key: 'embeddingsProvider', value: 'transformers', source: 'global', isModified: false },
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

export const createContinueAdapter = (): ContinueAdapter => new ContinueAdapter()
