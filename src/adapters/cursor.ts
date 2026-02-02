/**
 * Cursor Adapter
 * Implements HarnessAdapter for Cursor AI-powered code editor
 *
 * Configuration locations:
 * - Settings: ~/.cursor/settings.json (macOS/Linux) or %APPDATA%\Cursor (Windows)
 * - Project rules: .cursorrules in project root
 * - Extensions: ~/.cursor/extensions/
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

// Type definitions for Cursor configuration files

/** Cursor settings.json structure */
export interface CursorSettings {
  'cursor.general.aiProvider'?: string
  'cursor.general.model'?: string
  'cursor.cpp.enabled'?: boolean
  'cursor.chat.enabled'?: boolean
  'cursor.composer.enabled'?: boolean
  'editor.fontSize'?: number
  'editor.theme'?: string
  [key: string]: unknown
}

/** Cursor rules file content */
export interface CursorRules {
  /** Raw content of .cursorrules file */
  content: string
  /** Project path where rules file is located */
  projectPath: string
  /** Last modified timestamp */
  lastModified: Date
}

/** Cursor extension info */
export interface CursorExtension {
  id: string
  name: string
  version: string
  enabled: boolean
  publisher: string
}

/**
 * Cursor Adapter
 * Provides access to Cursor configuration, rules, and settings
 */
export class CursorAdapter extends BaseHarnessAdapter {
  readonly type: HarnessType = 'cursor'
  readonly displayName = 'Cursor'

  /** Base paths for Cursor configuration */
  private readonly basePaths = {
    config: '~/.cursor',
    settings: '~/.cursor/settings.json',
    extensions: '~/.cursor/extensions',
    // Windows paths would be different
    windowsConfig: '%APPDATA%/Cursor',
  }

  // ============================================
  // Detection & Configuration
  // ============================================

  async detect(): Promise<DetectionResult> {
    const configPaths: HarnessConfigPaths = {
      settings: this.basePaths.settings,
      skills: this.basePaths.extensions,
      projectConfig: '.cursorrules',
    }

    // Simulate detection - in production, would check if files exist
    return {
      type: this.type,
      detected: true,
      status: 'active',
      version: '0.43.0',
      configPaths,
    }
  }

  async getConfig(): Promise<HarnessConfig> {
    const detection = await this.detect()
    const skills = await this.listSkills()
    const hooks = await this.listHooks()
    const sessions = await this.listSessions()

    return {
      id: 'cursor',
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
      brandColor: '#00D1FF',
      icon: 'cursor',
    }
  }

  // ============================================
  // Skills Management (Extensions & Rules)
  // ============================================

  async listSkills(): Promise<SkillSummary[]> {
    // Cursor "skills" are primarily .cursorrules files and extensions
    return [
      {
        id: 'cursorrules-project-a',
        harness: this.type,
        name: 'Project A Rules',
        description: 'Custom rules for Project A codebase',
        category: 'custom',
        status: 'enabled',
      },
      {
        id: 'cursorrules-default',
        harness: this.type,
        name: 'Default Rules',
        description: 'Global default cursor rules',
        category: 'core',
        status: 'enabled',
      },
      {
        id: 'ext-prettier',
        harness: this.type,
        name: 'Prettier Extension',
        description: 'Code formatting with Prettier',
        category: 'development',
        status: 'enabled',
      },
    ]
  }

  async getSkill(id: string): Promise<Skill | null> {
    const skills = await this.listSkills()
    const summary = skills.find((s) => s.id === id)
    if (!summary) return null

    const isRules = id.startsWith('cursorrules-')
    const filePath = isRules
      ? id === 'cursorrules-default'
        ? `${this.basePaths.config}/.cursorrules`
        : `/projects/${id.replace('cursorrules-', '')}/.cursorrules`
      : `${this.basePaths.extensions}/${id}`

    return {
      id: summary.id,
      harness: this.type,
      filePath,
      metadata: {
        name: summary.name,
        description: summary.description,
        category: summary.category,
        triggers: [],
      },
      content: isRules
        ? '# Cursor Rules\n\nYou are an expert developer...'
        : '// Extension manifest',
      status: summary.status,
      stats: {
        invocationCount: 0,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  }

  async createSkill(options: CreateSkillOptions): Promise<Skill> {
    // Creates a new .cursorrules file
    const id = `cursorrules-${options.name.toLowerCase().replace(/\s+/g, '-')}`

    return {
      id,
      harness: this.type,
      filePath: `/projects/${options.name}/.cursorrules`,
      metadata: {
        name: options.name,
        description: options.description,
        category: options.category,
        triggers: options.triggers || [],
      },
      content: options.content,
      status: 'enabled',
      stats: {
        invocationCount: 0,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  }

  async updateSkill(id: string, updates: Partial<CreateSkillOptions>): Promise<Skill> {
    const existing = await this.getSkill(id)
    if (!existing) {
      throw new Error(`Skill not found: ${id}`)
    }

    return {
      ...existing,
      metadata: {
        ...existing.metadata,
        name: updates.name || existing.metadata.name,
        description: updates.description || existing.metadata.description,
        category: updates.category || existing.metadata.category,
        triggers: updates.triggers || existing.metadata.triggers,
      },
      content: updates.content || existing.content,
      updatedAt: new Date(),
    }
  }

  async deleteSkill(id: string): Promise<void> {
    const skill = await this.getSkill(id)
    if (!skill) {
      throw new Error(`Skill not found: ${id}`)
    }
    // Would delete .cursorrules file or uninstall extension
  }

  // ============================================
  // Hooks Management
  // ============================================

  // Cursor doesn't have native hooks like Claude Code, but we can simulate
  // with VS Code task runners or extension-based hooks

  async listHooks(): Promise<HookSummary[]> {
    return [
      {
        id: 'format-on-save',
        name: 'Format on Save',
        harness: this.type,
        trigger: 'PostToolUse',
        toolMatcher: 'Edit',
        status: 'enabled',
        runCount: 523,
        blockCount: 0,
      },
      {
        id: 'lint-on-save',
        name: 'Lint on Save',
        harness: this.type,
        trigger: 'PostToolUse',
        toolMatcher: 'Write',
        status: 'enabled',
        runCount: 412,
        blockCount: 8,
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
      config: {
        trigger: summary.trigger,
        toolMatcher: summary.toolMatcher,
      },
      scriptPath: `${this.basePaths.config}/hooks/${summary.id}`,
      scriptLanguage: 'node',
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
      scriptPath: `${this.basePaths.config}/hooks/${id}`,
      scriptContent: options.scriptContent,
      scriptLanguage: options.scriptLanguage,
      status: 'enabled',
      stats: {
        runCount: 0,
        allowCount: 0,
        blockCount: 0,
        errorCount: 0,
      },
      description: options.description,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  }

  async updateHook(id: string, updates: Partial<CreateHookOptions>): Promise<Hook> {
    const existing = await this.getHook(id)
    if (!existing) {
      throw new Error(`Hook not found: ${id}`)
    }

    return {
      ...existing,
      name: updates.name || existing.name,
      config: updates.config || existing.config,
      scriptContent: updates.scriptContent || existing.scriptContent,
      scriptLanguage: updates.scriptLanguage || existing.scriptLanguage,
      description: updates.description || existing.description,
      updatedAt: new Date(),
    }
  }

  async deleteHook(id: string): Promise<void> {
    const hook = await this.getHook(id)
    if (!hook) {
      throw new Error(`Hook not found: ${id}`)
    }
    // Would remove hook configuration
  }

  // ============================================
  // Sessions Management
  // ============================================

  async listSessions(options?: SessionFilterOptions): Promise<SessionSummary[]> {
    // Cursor chat history
    const sessions: SessionSummary[] = [
      {
        id: 'cursor-session-001',
        harness: this.type,
        title: 'Refactoring auth module',
        project: 'my-app',
        startedAt: new Date(Date.now() - 7200000),
        endedAt: new Date(Date.now() - 3600000),
        duration: 3600000,
        messageCount: 32,
        lastMessagePreview: 'The refactoring is complete',
        tags: ['refactoring', 'auth'],
      },
      {
        id: 'cursor-session-002',
        harness: this.type,
        title: 'Building new API endpoint',
        project: 'my-app',
        startedAt: new Date(Date.now() - 14400000),
        endedAt: new Date(Date.now() - 7200000),
        duration: 7200000,
        messageCount: 45,
        lastMessagePreview: 'API endpoint is now functional',
        tags: ['api', 'feature'],
      },
    ]

    let filtered = sessions
    if (options?.project) {
      filtered = filtered.filter((s) => s.project === options.project)
    }
    if (options?.searchText) {
      const search = options.searchText.toLowerCase()
      filtered = filtered.filter(
        (s) => s.title.toLowerCase().includes(search) || s.project?.toLowerCase().includes(search)
      )
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
      metadata: {
        title: summary.title,
        project: summary.project,
        tags: summary.tags,
      },
      messages: [
        {
          id: 'msg-001',
          role: 'user',
          content: 'Help me refactor the authentication module',
          timestamp: summary.startedAt,
        },
        {
          id: 'msg-002',
          role: 'assistant',
          content: "I'll help you refactor the auth module. Let me analyze the current code...",
          timestamp: new Date(summary.startedAt.getTime() + 1000),
        },
      ],
      stats: {
        messageCount: summary.messageCount,
        userMessageCount: Math.floor(summary.messageCount / 2),
        assistantMessageCount: Math.ceil(summary.messageCount / 2),
        toolCallCount: 12,
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
    if (!session) {
      throw new Error(`Session not found: ${id}`)
    }
    // Would delete session data
  }

  // ============================================
  // Memory Management
  // ============================================

  async getMemoryStats(): Promise<MemoryStats> {
    return {
      totalEntries: 85,
      totalSize: 25165824, // 24 MB
      byType: [
        { type: 'session', entryCount: 60, totalSize: 15728640, percentage: 62.5 },
        { type: 'project-context', entryCount: 25, totalSize: 9437184, percentage: 37.5 },
      ],
      byHarness: [{ harness: this.type, entryCount: 85, totalSize: 25165824, percentage: 100 }],
      storageLocations: [
        {
          location: 'local',
          name: 'Cursor Data',
          path: this.basePaths.config,
          totalCapacity: 536870912, // 512 MB
          usedSpace: 25165824,
          availableSpace: 511705088,
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
        id: 'cursor-mem-001',
        harness: this.type,
        type: 'session',
        title: 'Chat: Refactoring auth module',
        size: 81920,
        createdAt: new Date(Date.now() - 7200000),
        lastAccessedAt: new Date(),
      },
      {
        id: 'cursor-mem-002',
        harness: this.type,
        type: 'project-context',
        title: 'Project: my-app context',
        size: 163840,
        createdAt: new Date(Date.now() - 172800000),
        lastAccessedAt: new Date(Date.now() - 3600000),
      },
    ]

    let filtered = entries
    if (options?.type) {
      filtered = filtered.filter((e) => e.type === options.type)
    }
    if (options?.limit) {
      filtered = filtered.slice(0, options.limit)
    }

    return filtered
  }

  async getMemoryEntry(id: string): Promise<MemoryEntry | null> {
    const entries = await this.listMemoryEntries()
    const summary = entries.find((e) => e.id === id)
    if (!summary) return null

    return {
      ...summary,
      harness: this.type,
      content: '# Memory Entry\n\nStored context and conversation history...',
      filePath: `${this.basePaths.config}/memory/${id}`,
      metadata: {
        source: 'cursor-session-001',
        tags: ['context'],
      },
      updatedAt: summary.lastAccessedAt,
    }
  }

  async deleteMemoryEntry(id: string): Promise<void> {
    const entry = await this.getMemoryEntry(id)
    if (!entry) {
      throw new Error(`Memory entry not found: ${id}`)
    }
    // Would delete memory file
  }

  // ============================================
  // Settings Management
  // ============================================

  async getSettings(): Promise<HarnessSettings> {
    return {
      harness: this.type,
      filePath: this.basePaths.settings,
      settings: [
        {
          key: 'cursor.general.aiProvider',
          value: 'anthropic',
          source: 'user',
          isModified: true,
          modifiedAt: new Date(),
        },
        {
          key: 'cursor.general.model',
          value: 'claude-sonnet-4-20250514',
          source: 'user',
          isModified: true,
        },
        {
          key: 'cursor.cpp.enabled',
          value: true,
          source: 'user',
          isModified: false,
        },
        {
          key: 'cursor.chat.enabled',
          value: true,
          source: 'user',
          isModified: false,
        },
        {
          key: 'editor.fontSize',
          value: 14,
          source: 'user',
          isModified: true,
        },
      ],
      lastSyncedAt: new Date(),
    }
  }

  async getSetting(key: string): Promise<Setting | null> {
    const settings = await this.getSettings()
    return settings.settings.find((s) => s.key === key) || null
  }

  async setSetting(_key: string, _value: unknown): Promise<void> {
    // Would update settings.json
    // Implementation will write to ~/.cursor/settings.json via backend service
  }
}

// Export factory function for registration
export const createCursorAdapter = (): CursorAdapter => new CursorAdapter()
