/**
 * GitHub Copilot Adapter
 * Implements HarnessAdapter for GitHub Copilot AI assistant
 *
 * Configuration locations:
 * - VS Code settings: ~/.config/Code/User/settings.json (Linux)
 *                     ~/Library/Application Support/Code/User/settings.json (macOS)
 *                     %APPDATA%/Code/User/settings.json (Windows)
 * - Instructions: .github/copilot-instructions.md in project root
 * - Chat history: VS Code extension storage
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

// Type definitions for Copilot configuration files
// TODO: These interfaces will be used when implementing actual file parsing via backend

/** VS Code settings related to Copilot */
export interface CopilotSettings {
  'github.copilot.enable'?: Record<string, boolean>
  'github.copilot.editor.enableAutoCompletions'?: boolean
  'github.copilot.editor.enableCodeActions'?: boolean
  'github.copilot.chat.localeOverride'?: string
  'github.copilot.chat.welcomeMessage'?: string
  [key: string]: unknown
}

/** Copilot instructions file content */
export interface CopilotInstructions {
  /** Raw markdown content */
  content: string
  /** Project path where instructions file is located */
  projectPath: string
  /** Last modified timestamp */
  lastModified: Date
}

/** Copilot chat message */
export interface CopilotChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

/**
 * GitHub Copilot Adapter
 * Provides access to Copilot configuration, instructions, and settings
 */
export class CopilotAdapter extends BaseHarnessAdapter {
  readonly type: HarnessType = 'copilot'
  readonly displayName = 'GitHub Copilot'

  // TODO: Use os.homedir() for cross-platform path resolution
  // These paths are placeholders - actual resolution happens via backend service
  private readonly basePaths = {
    // VS Code settings paths vary by OS
    vscodeSettingsMac: '~/Library/Application Support/Code/User/settings.json',
    vscodeSettingsLinux: '~/.config/Code/User/settings.json',
    vscodeSettingsWindows: '%APPDATA%/Code/User/settings.json',
    // Copilot extension data
    extensionData: '~/.vscode/extensions/github.copilot-*',
    // Project-level instructions
    projectInstructions: '.github/copilot-instructions.md',
  }

  // ============================================
  // Detection & Configuration
  // ============================================

  async detect(): Promise<DetectionResult> {
    // TODO: Implement actual filesystem detection via backend service
    // Currently returns mock data for UI development
    const configPaths: HarnessConfigPaths = {
      settings: this.basePaths.vscodeSettingsMac,
      projectConfig: this.basePaths.projectInstructions,
    }

    // TODO: Check if Copilot extension is installed in VS Code
    // For now, returns true to enable UI development
    return {
      type: this.type,
      detected: true,
      status: 'active',
      version: '1.234.0',
      configPaths,
    }
  }

  async getConfig(): Promise<HarnessConfig> {
    const detection = await this.detect()
    const skills = await this.listSkills()
    const hooks = await this.listHooks()
    const sessions = await this.listSessions()

    return {
      id: 'copilot',
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
      brandColor: '#000000',
      icon: 'copilot',
    }
  }

  // ============================================
  // Skills Management (Instructions Files)
  // ============================================

  async listSkills(): Promise<SkillSummary[]> {
    // TODO: Scan projects for .github/copilot-instructions.md files via backend
    // Currently returns mock data for UI development
    return [
      {
        id: 'instructions-project-main',
        harness: this.type,
        name: 'Main Project Instructions',
        description: 'Copilot instructions for main project',
        category: 'custom',
        status: 'enabled',
      },
      {
        id: 'instructions-workspace',
        harness: this.type,
        name: 'Workspace Instructions',
        description: 'Shared instructions across workspace',
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
      filePath: `.github/copilot-instructions.md`,
      metadata: {
        name: summary.name,
        description: summary.description,
        category: summary.category,
        triggers: [],
      },
      content: '# Copilot Instructions\n\nYou are an expert developer helping with this project...',
      status: summary.status,
      stats: {
        invocationCount: 0,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  }

  async createSkill(options: CreateSkillOptions): Promise<Skill> {
    // Creates a new copilot-instructions.md file
    const id = `instructions-${options.name.toLowerCase().replace(/\s+/g, '-')}`

    return {
      id,
      harness: this.type,
      filePath: `.github/copilot-instructions.md`,
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
    // Would delete copilot-instructions.md file
  }

  // ============================================
  // Hooks Management
  // ============================================

  // GitHub Copilot doesn't have native hooks, but we simulate
  // common patterns like pre-commit checks

  async listHooks(): Promise<HookSummary[]> {
    return [
      {
        id: 'copilot-review',
        name: 'Copilot Code Review',
        harness: this.type,
        trigger: 'PreCommit',
        status: 'enabled',
        runCount: 89,
        blockCount: 5,
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
      },
      scriptPath: `.github/hooks/${summary.id}.sh`,
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
      scriptPath: `.github/hooks/${id}.sh`,
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
    // Would remove hook script
  }

  // ============================================
  // Sessions Management
  // ============================================

  async listSessions(options?: SessionFilterOptions): Promise<SessionSummary[]> {
    // Copilot chat history (if accessible via extension storage)
    const sessions: SessionSummary[] = [
      {
        id: 'copilot-chat-001',
        harness: this.type,
        title: 'Code review assistance',
        project: 'my-project',
        startedAt: new Date(Date.now() - 3600000),
        endedAt: new Date(),
        duration: 3600000,
        messageCount: 15,
        lastMessagePreview: 'The code looks good, consider adding tests',
        tags: ['review'],
      },
      {
        id: 'copilot-chat-002',
        harness: this.type,
        title: 'Debugging help',
        project: 'my-project',
        startedAt: new Date(Date.now() - 7200000),
        endedAt: new Date(Date.now() - 3600000),
        duration: 3600000,
        messageCount: 22,
        lastMessagePreview: 'The bug was in the async handler',
        tags: ['debugging'],
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
          content: 'Can you help me review this code?',
          timestamp: summary.startedAt,
        },
        {
          id: 'msg-002',
          role: 'assistant',
          content: "I'll review the code. Let me analyze the structure...",
          timestamp: new Date(summary.startedAt.getTime() + 1000),
        },
      ],
      stats: {
        messageCount: summary.messageCount,
        userMessageCount: Math.floor(summary.messageCount / 2),
        assistantMessageCount: Math.ceil(summary.messageCount / 2),
        toolCallCount: 0,
        fileChangeCount: 0,
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
    // Would delete session data from extension storage
  }

  // ============================================
  // Memory Management
  // ============================================

  async getMemoryStats(): Promise<MemoryStats> {
    return {
      totalEntries: 45,
      totalSize: 10485760, // 10 MB
      byType: [
        { type: 'session', entryCount: 40, totalSize: 8388608, percentage: 80 },
        { type: 'project-context', entryCount: 5, totalSize: 2097152, percentage: 20 },
      ],
      byHarness: [{ harness: this.type, entryCount: 45, totalSize: 10485760, percentage: 100 }],
      storageLocations: [
        {
          location: 'local',
          name: 'VS Code Extension Storage',
          path: '~/.vscode/extensions/github.copilot-*/data',
          totalCapacity: 268435456, // 256 MB
          usedSpace: 10485760,
          availableSpace: 257949696,
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
        id: 'copilot-mem-001',
        harness: this.type,
        type: 'session',
        title: 'Chat: Code review assistance',
        size: 40960,
        createdAt: new Date(Date.now() - 3600000),
        lastAccessedAt: new Date(),
      },
      {
        id: 'copilot-mem-002',
        harness: this.type,
        type: 'project-context',
        title: 'Project: my-project context',
        size: 81920,
        createdAt: new Date(Date.now() - 86400000),
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
      content: '# Memory Entry\n\nCopilot conversation context...',
      filePath: `~/.vscode/extensions/github.copilot-chat/data/${id}`,
      metadata: {
        source: 'copilot-chat-001',
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
    // Would delete memory file from extension storage
  }

  // ============================================
  // Settings Management
  // ============================================

  async getSettings(): Promise<HarnessSettings> {
    return {
      harness: this.type,
      filePath: this.basePaths.vscodeSettingsMac,
      settings: [
        {
          key: 'github.copilot.enable',
          value: { '*': true, markdown: true, plaintext: false },
          source: 'user',
          isModified: true,
          modifiedAt: new Date(),
        },
        {
          key: 'github.copilot.editor.enableAutoCompletions',
          value: true,
          source: 'user',
          isModified: false,
        },
        {
          key: 'github.copilot.editor.enableCodeActions',
          value: true,
          source: 'user',
          isModified: false,
        },
        {
          key: 'github.copilot.chat.localeOverride',
          value: 'en',
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
    // Would update VS Code settings.json
    // Implementation will write to settings file via backend service
  }
}

// Export factory function for registration
export const createCopilotAdapter = (): CopilotAdapter => new CopilotAdapter()
