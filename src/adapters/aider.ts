/**
 * Aider Adapter
 * Implements HarnessAdapter for Aider AI pair programming assistant
 *
 * Configuration locations:
 * - Config: .aider.conf.yml (project) or ~/.aider.conf.yml (global)
 * - Input history: .aider.input.history
 * - Chat history: .aider.chat.history.md
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

// Type definitions for Aider configuration files
// TODO: These interfaces will be used when implementing actual file parsing via backend

/** Aider .aider.conf.yml structure */
export interface AiderConfig {
  model?: string
  'openai-api-key'?: string
  'anthropic-api-key'?: string
  'auto-commits'?: boolean
  'auto-lint'?: boolean
  'auto-test'?: boolean
  'dark-mode'?: boolean
  'edit-format'?: 'diff' | 'whole' | 'diff-fenced'
  [key: string]: unknown
}

/** Aider command from input history */
export interface AiderCommand {
  command: string
  timestamp: Date
}

/**
 * Aider Adapter
 * Provides access to Aider configuration and chat history
 */
export class AiderAdapter extends BaseHarnessAdapter {
  readonly type: HarnessType = 'aider'
  readonly displayName = 'Aider'

  // TODO: Use os.homedir() for cross-platform path resolution
  private readonly basePaths = {
    globalConfig: '~/.aider.conf.yml',
    projectConfig: '.aider.conf.yml',
    inputHistory: '.aider.input.history',
    chatHistory: '.aider.chat.history.md',
  }

  // ============================================
  // Detection & Configuration
  // ============================================

  async detect(): Promise<DetectionResult> {
    // TODO: Implement actual filesystem detection via backend service
    const configPaths: HarnessConfigPaths = {
      settings: this.basePaths.globalConfig,
      projectConfig: this.basePaths.projectConfig,
      memory: this.basePaths.chatHistory,
    }

    // TODO: Check if Aider is installed (which aider) and config exists
    return {
      type: this.type,
      detected: true,
      status: 'active',
      version: '0.64.0',
      configPaths,
    }
  }

  async getConfig(): Promise<HarnessConfig> {
    const detection = await this.detect()
    const skills = await this.listSkills()
    const hooks = await this.listHooks()
    const sessions = await this.listSessions()

    return {
      id: 'aider',
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
      brandColor: '#10B981',
      icon: 'aider',
    }
  }

  // ============================================
  // Skills Management (Aider Commands)
  // ============================================

  async listSkills(): Promise<SkillSummary[]> {
    // Aider built-in commands
    return [
      {
        id: 'aider-add',
        harness: this.type,
        name: '/add',
        description: 'Add files to the chat context',
        category: 'core',
        status: 'enabled',
      },
      {
        id: 'aider-drop',
        harness: this.type,
        name: '/drop',
        description: 'Remove files from the chat context',
        category: 'core',
        status: 'enabled',
      },
      {
        id: 'aider-run',
        harness: this.type,
        name: '/run',
        description: 'Run a shell command',
        category: 'development',
        status: 'enabled',
      },
      {
        id: 'aider-test',
        harness: this.type,
        name: '/test',
        description: 'Run tests',
        category: 'testing',
        status: 'enabled',
      },
      {
        id: 'aider-lint',
        harness: this.type,
        name: '/lint',
        description: 'Run linter on changed files',
        category: 'development',
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
      filePath: 'built-in',
      metadata: {
        name: summary.name,
        description: summary.description,
        category: summary.category,
        triggers: [{ pattern: summary.name, isRegex: false }],
      },
      content: `# ${summary.name}\n\n${summary.description}\n\nBuilt-in Aider command.`,
      status: summary.status,
      stats: { invocationCount: 0 },
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  }

  async createSkill(options: CreateSkillOptions): Promise<Skill> {
    const id = `aider-${options.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`
    return {
      id,
      harness: this.type,
      filePath: this.basePaths.projectConfig,
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
  // Hooks Management (Auto-commit, Auto-lint, Auto-test)
  // ============================================

  async listHooks(): Promise<HookSummary[]> {
    return [
      {
        id: 'auto-commit',
        name: 'Auto Commit',
        harness: this.type,
        trigger: 'PostToolUse',
        toolMatcher: 'Edit',
        status: 'enabled',
        runCount: 234,
        blockCount: 0,
      },
      {
        id: 'auto-lint',
        name: 'Auto Lint',
        harness: this.type,
        trigger: 'PostToolUse',
        toolMatcher: 'Edit',
        status: 'enabled',
        runCount: 234,
        blockCount: 12,
      },
    ]
  }

  async getHook(id: string): Promise<Hook | null> {
    const hooks = await this.listHooks()
    const summary = hooks.find((h) => h.id === id)
    if (!summary) return null

    return {
      id: summary.id,
      name: summary.name,
      harness: this.type,
      config: { trigger: summary.trigger, toolMatcher: summary.toolMatcher },
      scriptPath: 'built-in',
      scriptLanguage: 'bash',
      status: summary.status,
      stats: {
        runCount: summary.runCount,
        allowCount: summary.runCount - summary.blockCount,
        blockCount: summary.blockCount,
        errorCount: 0,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  }

  async createHook(options: CreateHookOptions): Promise<Hook> {
    const id = options.name.toLowerCase().replace(/\s+/g, '-')
    return {
      id,
      name: options.name,
      harness: this.type,
      config: options.config,
      scriptPath: `${this.basePaths.projectConfig}`,
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
    return {
      ...existing,
      name: updates.name || existing.name,
      config: updates.config || existing.config,
      description: updates.description || existing.description,
      updatedAt: new Date(),
    }
  }

  async deleteHook(id: string): Promise<void> {
    const hook = await this.getHook(id)
    if (!hook) throw new Error(`Hook not found: ${id}`)
  }

  // ============================================
  // Sessions Management (Chat History)
  // ============================================

  async listSessions(options?: SessionFilterOptions): Promise<SessionSummary[]> {
    // TODO: Parse .aider.chat.history.md and .aider.input.history via backend
    const sessions: SessionSummary[] = [
      {
        id: 'aider-session-001',
        harness: this.type,
        title: 'Feature implementation',
        project: 'my-project',
        startedAt: new Date(Date.now() - 7200000),
        endedAt: new Date(),
        duration: 7200000,
        messageCount: 48,
        lastMessagePreview: 'Feature complete, all tests passing',
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
        { id: 'msg-001', role: 'user', content: '/add src/*.ts', timestamp: summary.startedAt },
        {
          id: 'msg-002',
          role: 'assistant',
          content: 'Added 5 files to the chat.',
          timestamp: new Date(summary.startedAt.getTime() + 1000),
        },
        {
          id: 'msg-003',
          role: 'user',
          content: 'Implement the new feature',
          timestamp: new Date(summary.startedAt.getTime() + 2000),
        },
        {
          id: 'msg-004',
          role: 'assistant',
          content: "I'll implement the feature...",
          timestamp: new Date(summary.startedAt.getTime() + 3000),
        },
      ],
      stats: {
        messageCount: summary.messageCount,
        userMessageCount: Math.floor(summary.messageCount / 2),
        assistantMessageCount: Math.ceil(summary.messageCount / 2),
        toolCallCount: 25,
        fileChangeCount: 15,
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
  // Memory Management (History Files)
  // ============================================

  async getMemoryStats(): Promise<MemoryStats> {
    return {
      totalEntries: 30,
      totalSize: 2097152,
      byType: [
        { type: 'session', entryCount: 20, totalSize: 1572864, percentage: 75 },
        { type: 'learning', entryCount: 10, totalSize: 524288, percentage: 25 },
      ],
      byHarness: [{ harness: this.type, entryCount: 30, totalSize: 2097152, percentage: 100 }],
      storageLocations: [
        {
          location: 'local',
          name: 'Aider History',
          path: '.',
          totalCapacity: 104857600,
          usedSpace: 2097152,
          availableSpace: 102760448,
          isConnected: true,
        },
      ],
      oldestEntry: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      newestEntry: new Date(),
    }
  }

  async listMemoryEntries(options?: {
    type?: string
    limit?: number
  }): Promise<MemoryEntrySummary[]> {
    const entries: MemoryEntrySummary[] = [
      {
        id: 'aider-history-001',
        harness: this.type,
        type: 'session',
        title: 'Chat History: Feature implementation',
        size: 81920,
        createdAt: new Date(Date.now() - 7200000),
        lastAccessedAt: new Date(),
      },
      {
        id: 'aider-input-001',
        harness: this.type,
        type: 'learning',
        title: 'Input History',
        size: 20480,
        createdAt: new Date(Date.now() - 86400000),
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
      content: '# Aider History\n\nChat and input history...',
      filePath: id.includes('input') ? this.basePaths.inputHistory : this.basePaths.chatHistory,
      metadata: { source: 'aider' },
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
      filePath: this.basePaths.globalConfig,
      settings: [
        { key: 'model', value: 'claude-sonnet-4-20250514', source: 'user', isModified: true },
        { key: 'auto-commits', value: true, source: 'user', isModified: true },
        { key: 'auto-lint', value: true, source: 'user', isModified: true },
        { key: 'auto-test', value: false, source: 'user', isModified: false },
        { key: 'dark-mode', value: true, source: 'user', isModified: true },
        { key: 'edit-format', value: 'diff', source: 'user', isModified: false },
      ],
      lastSyncedAt: new Date(),
    }
  }

  async getSetting(key: string): Promise<Setting | null> {
    const settings = await this.getSettings()
    return settings.settings.find((s) => s.key === key) || null
  }

  async setSetting(_key: string, _value: unknown): Promise<void> {
    // Would update .aider.conf.yml via backend service
  }
}

export const createAiderAdapter = (): AiderAdapter => new AiderAdapter()
