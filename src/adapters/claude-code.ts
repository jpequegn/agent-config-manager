/**
 * Claude Code Adapter
 * Implements HarnessAdapter for Claude Code AI assistant
 *
 * Configuration locations:
 * - Settings: ~/.claude/settings.json
 * - Keybindings: ~/.claude/keybindings.json
 * - Skills: ~/.claude/skills/
 * - Hooks: configured in settings.json
 * - Sessions: ~/.claude/projects/<project>/*.jsonl
 */

import { BaseHarnessAdapter } from './base'
import type {
  HarnessType,
  HarnessConfig,
  DetectionResult,
  HarnessConfigPaths,
  Skill,
  SkillSummary,
  SkillCategory,
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

// Type definitions for Claude Code configuration files
// These will be used when implementing actual filesystem operations

/** Claude Code settings.json structure */
export interface ClaudeCodeSettings {
  apiKey?: string
  model?: string
  theme?: string
  hooks?: ClaudeCodeHooksConfig
  mcpServers?: Record<string, ClaudeCodeMCPServer>
  permissions?: Record<string, ClaudeCodePermission>
  [key: string]: unknown
}

/** Claude Code hooks configuration */
export interface ClaudeCodeHooksConfig {
  PreToolUse?: ClaudeCodeHook[]
  PostToolUse?: ClaudeCodeHook[]
  Notification?: ClaudeCodeHook[]
  Stop?: ClaudeCodeHook[]
}

/** Claude Code hook definition */
export interface ClaudeCodeHook {
  matcher?: string
  command: string
  timeout?: number
}

/** Claude Code MCP server configuration */
export interface ClaudeCodeMCPServer {
  command: string
  args?: string[]
  env?: Record<string, string>
}

/** Claude Code permission configuration */
export interface ClaudeCodePermission {
  allow?: boolean
  prompt?: string
}

/** SKILL.md frontmatter structure */
export interface SkillFrontmatter {
  name: string
  description: string
  category?: SkillCategory
  tags?: string[]
  author?: string
  version?: string
}

/**
 * Claude Code Adapter
 * Provides access to Claude Code configuration, skills, hooks, and sessions
 */
export class ClaudeCodeAdapter extends BaseHarnessAdapter {
  readonly type: HarnessType = 'claude-code'
  readonly displayName = 'Claude Code'

  /** Base paths for Claude Code configuration */
  private readonly basePaths = {
    config: '~/.claude',
    settings: '~/.claude/settings.json',
    keybindings: '~/.claude/keybindings.json',
    skills: '~/.claude/skills',
    projects: '~/.claude/projects',
  }

  // ============================================
  // Detection & Configuration
  // ============================================

  async detect(): Promise<DetectionResult> {
    // In a real implementation, this would check the filesystem
    // For now, we simulate detection
    const configPaths: HarnessConfigPaths = {
      settings: this.basePaths.settings,
      skills: this.basePaths.skills,
      memory: this.basePaths.projects,
      hooks: this.basePaths.settings, // Hooks are in settings.json
      projectConfig: 'CLAUDE.md',
    }

    // Simulate detection - in production, would check if files exist
    return {
      type: this.type,
      detected: true,
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
      id: 'claude-code',
      name: this.displayName,
      type: this.type,
      status: detection.status,
      version: detection.version,
      configPaths: detection.configPaths,
      stats: {
        skillCount: skills.length,
        hookCount: hooks.length,
        sessionCount: sessions.length,
        memorySize: 0, // Would calculate from actual files
        lastActivity: sessions[0]?.startedAt,
      },
      brandColor: '#D97757',
      icon: 'claude-code',
    }
  }

  // ============================================
  // Skills Management
  // ============================================

  async listSkills(): Promise<SkillSummary[]> {
    // Simulated skill data - would read from ~/.claude/skills/
    return [
      {
        id: 'core',
        harness: this.type,
        name: 'CORE',
        description: 'Core PAI infrastructure and identity',
        category: 'core',
        status: 'enabled',
      },
      {
        id: 'research',
        harness: this.type,
        name: 'Research',
        description: 'Multi-source parallel research capabilities',
        category: 'research',
        status: 'enabled',
      },
      {
        id: 'debugging',
        harness: this.type,
        name: 'Debugging',
        description: 'Systematic debugging workflow',
        category: 'development',
        status: 'enabled',
      },
    ]
  }

  async getSkill(id: string): Promise<Skill | null> {
    const skills = await this.listSkills()
    const summary = skills.find((s) => s.id === id)
    if (!summary) return null

    // Would read actual SKILL.md file
    return {
      id: summary.id,
      harness: this.type,
      filePath: `${this.basePaths.skills}/${summary.name}/SKILL.md`,
      metadata: {
        name: summary.name,
        description: summary.description,
        category: summary.category,
        triggers: [
          {
            pattern: `USE WHEN user mentions ${summary.name.toLowerCase()}`,
            isRegex: false,
          },
        ],
      },
      content: `# ${summary.name}\n\n${summary.description}`,
      status: summary.status,
      stats: {
        invocationCount: 0,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  }

  async createSkill(options: CreateSkillOptions): Promise<Skill> {
    // Would create SKILL.md file in ~/.claude/skills/
    const id = options.name.toLowerCase().replace(/\s+/g, '-')

    return {
      id,
      harness: this.type,
      filePath: `${this.basePaths.skills}/${options.name}/SKILL.md`,
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

    // Would update SKILL.md file
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
    // Would delete skill directory from ~/.claude/skills/
  }

  // ============================================
  // Hooks Management
  // ============================================

  async listHooks(): Promise<HookSummary[]> {
    // Simulated hook data - would read from settings.json
    return [
      {
        id: 'session-start-compact',
        name: 'SessionStart:compact',
        harness: this.type,
        trigger: 'SessionStart',
        status: 'enabled',
        runCount: 42,
        blockCount: 0,
      },
      {
        id: 'pre-tool-sensitive',
        name: 'PreToolUse:sensitive-check',
        harness: this.type,
        trigger: 'PreToolUse',
        toolMatcher: 'Bash',
        status: 'enabled',
        runCount: 156,
        blockCount: 3,
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
      scriptPath: `${this.basePaths.config}/hooks/${summary.id}.sh`,
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

    // Would update settings.json and create script file
    return {
      id,
      name: options.name,
      harness: this.type,
      config: options.config,
      scriptPath: `${this.basePaths.config}/hooks/${id}.${options.scriptLanguage === 'bash' ? 'sh' : options.scriptLanguage}`,
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

    // Would update settings.json and script file
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
    // Would remove from settings.json and delete script file
  }

  // ============================================
  // Sessions Management
  // ============================================

  async listSessions(options?: SessionFilterOptions): Promise<SessionSummary[]> {
    // Simulated session data - would scan ~/.claude/projects/
    const sessions: SessionSummary[] = [
      {
        id: 'session-001',
        harness: this.type,
        title: 'Implementing feature X',
        project: 'agent-config-manager',
        startedAt: new Date(Date.now() - 3600000),
        endedAt: new Date(),
        duration: 3600000,
        messageCount: 24,
        lastMessagePreview: 'Successfully implemented the feature',
        tags: ['feature', 'implementation'],
      },
      {
        id: 'session-002',
        harness: this.type,
        title: 'Debugging API issue',
        project: 'agent-config-manager',
        startedAt: new Date(Date.now() - 7200000),
        endedAt: new Date(Date.now() - 3600000),
        duration: 3600000,
        messageCount: 18,
        lastMessagePreview: 'Found and fixed the root cause',
        tags: ['debugging'],
      },
    ]

    // Apply filters
    let filtered = sessions
    if (options?.project) {
      filtered = filtered.filter((s) => s.project === options.project)
    }
    if (options?.startDate) {
      filtered = filtered.filter((s) => s.startedAt >= options.startDate!)
    }
    if (options?.endDate) {
      filtered = filtered.filter((s) => s.startedAt <= options.endDate!)
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

    // Would read .jsonl file and parse messages
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
          content: 'Please help me implement feature X',
          timestamp: summary.startedAt,
        },
        {
          id: 'msg-002',
          role: 'assistant',
          content: "I'll help you implement feature X. Let me start by...",
          timestamp: new Date(summary.startedAt.getTime() + 1000),
          toolCalls: [
            {
              id: 'tool-001',
              name: 'Read',
              input: { file_path: '/src/index.ts' },
              status: 'success',
              timestamp: new Date(summary.startedAt.getTime() + 2000),
            },
          ],
        },
      ],
      stats: {
        messageCount: summary.messageCount,
        userMessageCount: Math.floor(summary.messageCount / 2),
        assistantMessageCount: Math.ceil(summary.messageCount / 2),
        toolCallCount: 5,
        fileChangeCount: 3,
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
    // Would delete .jsonl file
  }

  // ============================================
  // Memory Management
  // ============================================

  async getMemoryStats(): Promise<MemoryStats> {
    return {
      totalEntries: 150,
      totalSize: 52428800, // 50 MB
      byType: [
        { type: 'session', entryCount: 100, totalSize: 31457280, percentage: 60 },
        { type: 'learning', entryCount: 30, totalSize: 10485760, percentage: 20 },
        { type: 'project-context', entryCount: 20, totalSize: 10485760, percentage: 20 },
      ],
      byHarness: [{ harness: this.type, entryCount: 150, totalSize: 52428800, percentage: 100 }],
      storageLocations: [
        {
          location: 'local',
          name: 'Local Storage',
          path: this.basePaths.projects,
          totalCapacity: 1073741824, // 1 GB
          usedSpace: 52428800,
          availableSpace: 1021313024,
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
        id: 'mem-001',
        harness: this.type,
        type: 'session',
        title: 'Session: Implementing feature X',
        size: 102400,
        createdAt: new Date(Date.now() - 3600000),
        lastAccessedAt: new Date(),
      },
      {
        id: 'mem-002',
        harness: this.type,
        type: 'learning',
        title: 'TypeScript async patterns',
        size: 51200,
        category: 'patterns',
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
      content: '# Memory Entry Content\n\nThis is the full content of the memory entry...',
      filePath: `${this.basePaths.projects}/memory/${id}.md`,
      metadata: {
        source: 'session-001',
        tags: ['learning', 'patterns'],
      },
      updatedAt: summary.lastAccessedAt,
    }
  }

  async deleteMemoryEntry(id: string): Promise<void> {
    const entry = await this.getMemoryEntry(id)
    if (!entry) {
      throw new Error(`Memory entry not found: ${id}`)
    }
    // Would delete file
  }

  // ============================================
  // Settings Management
  // ============================================

  async getSettings(): Promise<HarnessSettings> {
    // Would read from settings.json
    return {
      harness: this.type,
      filePath: this.basePaths.settings,
      settings: [
        {
          key: 'model',
          value: 'claude-sonnet-4-20250514',
          source: 'user',
          isModified: true,
          modifiedAt: new Date(),
        },
        {
          key: 'theme',
          value: 'dark',
          source: 'user',
          isModified: true,
        },
        {
          key: 'autoCompact',
          value: true,
          source: 'user',
          isModified: false,
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
    // Implementation will write to ~/.claude/settings.json via backend service
  }
}

// Export factory function for registration
export const createClaudeCodeAdapter = (): ClaudeCodeAdapter => new ClaudeCodeAdapter()
