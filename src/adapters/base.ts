/**
 * Harness Adapter Base
 * Defines the core interface that all harness-specific adapters must implement
 */

import type {
  HarnessType,
  HarnessConfig,
  DetectionResult,
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
  MemoryPruneOptions,
  MemoryPruneResult,
  HarnessSettings,
  Setting,
  Tool,
  ToolSummary,
  MCPServer,
  MCPServerSummary,
  MCPServerOptions,
} from '@/types'

/**
 * Core interface that all harness adapters must implement
 * Provides a unified API for interacting with different AI coding assistants
 */
export interface HarnessAdapter {
  /** The type of harness this adapter handles */
  readonly type: HarnessType

  /** Human-readable name of the harness */
  readonly displayName: string

  // ============================================
  // Detection & Configuration
  // ============================================

  /**
   * Detect if this harness is installed/available on the system
   */
  detect(): Promise<DetectionResult>

  /**
   * Get the full harness configuration
   */
  getConfig(): Promise<HarnessConfig>

  // ============================================
  // Skills Management
  // ============================================

  /**
   * List all skills with summary info
   */
  listSkills(): Promise<SkillSummary[]>

  /**
   * Get full details for a specific skill
   */
  getSkill(id: string): Promise<Skill | null>

  /**
   * Create a new skill
   */
  createSkill(options: CreateSkillOptions): Promise<Skill>

  /**
   * Update an existing skill
   */
  updateSkill(id: string, updates: Partial<CreateSkillOptions>): Promise<Skill>

  /**
   * Delete a skill
   */
  deleteSkill(id: string): Promise<void>

  /**
   * Enable or disable a skill
   */
  setSkillStatus(id: string, enabled: boolean): Promise<void>

  // ============================================
  // Hooks Management
  // ============================================

  /**
   * List all hooks with summary info
   */
  listHooks(): Promise<HookSummary[]>

  /**
   * Get full details for a specific hook
   */
  getHook(id: string): Promise<Hook | null>

  /**
   * Create a new hook
   */
  createHook(options: CreateHookOptions): Promise<Hook>

  /**
   * Update an existing hook
   */
  updateHook(id: string, updates: Partial<CreateHookOptions>): Promise<Hook>

  /**
   * Delete a hook
   */
  deleteHook(id: string): Promise<void>

  /**
   * Enable or disable a hook
   */
  setHookStatus(id: string, enabled: boolean): Promise<void>

  /**
   * Test a hook with sample input
   */
  testHook(
    id: string,
    testInput?: string
  ): Promise<{ success: boolean; output?: string; error?: string }>

  // ============================================
  // Sessions Management
  // ============================================

  /**
   * List sessions with optional filtering
   */
  listSessions(options?: SessionFilterOptions): Promise<SessionSummary[]>

  /**
   * Get full session details including all messages
   */
  getSession(id: string): Promise<Session | null>

  /**
   * Delete a session
   */
  deleteSession(id: string): Promise<void>

  /**
   * Export session to a file
   */
  exportSession(id: string, format: 'json' | 'markdown'): Promise<string>

  // ============================================
  // Memory Management
  // ============================================

  /**
   * Get memory statistics
   */
  getMemoryStats(): Promise<MemoryStats>

  /**
   * List memory entries with optional filtering
   */
  listMemoryEntries(options?: { type?: string; limit?: number }): Promise<MemoryEntrySummary[]>

  /**
   * Get full memory entry details
   */
  getMemoryEntry(id: string): Promise<MemoryEntry | null>

  /**
   * Delete a memory entry
   */
  deleteMemoryEntry(id: string): Promise<void>

  /**
   * Prune old or large memory entries
   */
  pruneMemory(options: MemoryPruneOptions): Promise<MemoryPruneResult>

  // ============================================
  // Settings Management
  // ============================================

  /**
   * Get all settings for this harness
   */
  getSettings(): Promise<HarnessSettings>

  /**
   * Get a specific setting value
   */
  getSetting(key: string): Promise<Setting | null>

  /**
   * Update a setting value
   */
  setSetting(key: string, value: unknown): Promise<void>

  /**
   * Reset a setting to its default value
   */
  resetSetting(key: string): Promise<void>

  /**
   * Reset all settings to defaults
   */
  resetAllSettings(): Promise<void>

  // ============================================
  // Tools & MCP Servers
  // ============================================

  /**
   * List all available tools
   */
  listTools(): Promise<ToolSummary[]>

  /**
   * Get full tool details
   */
  getTool(id: string): Promise<Tool | null>

  /**
   * List MCP servers
   */
  listMCPServers(): Promise<MCPServerSummary[]>

  /**
   * Get MCP server details
   */
  getMCPServer(id: string): Promise<MCPServer | null>

  /**
   * Add a new MCP server
   */
  addMCPServer(options: MCPServerOptions): Promise<MCPServer>

  /**
   * Update an MCP server
   */
  updateMCPServer(id: string, updates: Partial<MCPServerOptions>): Promise<MCPServer>

  /**
   * Remove an MCP server
   */
  removeMCPServer(id: string): Promise<void>

  /**
   * Enable or disable an MCP server
   */
  setMCPServerStatus(id: string, enabled: boolean): Promise<void>

  /**
   * Test connection to an MCP server
   */
  testMCPServer(id: string): Promise<{ connected: boolean; error?: string }>
}

/**
 * Base class providing default implementations for optional methods
 * Harness-specific adapters can extend this and override as needed
 */
export abstract class BaseHarnessAdapter implements HarnessAdapter {
  abstract readonly type: HarnessType
  abstract readonly displayName: string

  // Detection & Configuration - must be implemented
  abstract detect(): Promise<DetectionResult>
  abstract getConfig(): Promise<HarnessConfig>

  // Skills - must be implemented
  abstract listSkills(): Promise<SkillSummary[]>
  abstract getSkill(id: string): Promise<Skill | null>
  abstract createSkill(options: CreateSkillOptions): Promise<Skill>
  abstract updateSkill(id: string, updates: Partial<CreateSkillOptions>): Promise<Skill>
  abstract deleteSkill(id: string): Promise<void>

  setSkillStatus(_id: string, _enabled: boolean): Promise<void> {
    return Promise.reject(new Error('setSkillStatus not implemented for this harness'))
  }

  // Hooks - must be implemented
  abstract listHooks(): Promise<HookSummary[]>
  abstract getHook(id: string): Promise<Hook | null>
  abstract createHook(options: CreateHookOptions): Promise<Hook>
  abstract updateHook(id: string, updates: Partial<CreateHookOptions>): Promise<Hook>
  abstract deleteHook(id: string): Promise<void>

  setHookStatus(_id: string, _enabled: boolean): Promise<void> {
    return Promise.reject(new Error('setHookStatus not implemented for this harness'))
  }

  testHook(
    _id: string,
    _testInput?: string
  ): Promise<{ success: boolean; output?: string; error?: string }> {
    return Promise.reject(new Error('testHook not implemented for this harness'))
  }

  // Sessions - must be implemented
  abstract listSessions(options?: SessionFilterOptions): Promise<SessionSummary[]>
  abstract getSession(id: string): Promise<Session | null>
  abstract deleteSession(id: string): Promise<void>

  exportSession(_id: string, _format: 'json' | 'markdown'): Promise<string> {
    return Promise.reject(new Error('exportSession not implemented for this harness'))
  }

  // Memory - must be implemented
  abstract getMemoryStats(): Promise<MemoryStats>
  abstract listMemoryEntries(options?: {
    type?: string
    limit?: number
  }): Promise<MemoryEntrySummary[]>
  abstract getMemoryEntry(id: string): Promise<MemoryEntry | null>
  abstract deleteMemoryEntry(id: string): Promise<void>

  pruneMemory(_options: MemoryPruneOptions): Promise<MemoryPruneResult> {
    return Promise.reject(new Error('pruneMemory not implemented for this harness'))
  }

  // Settings - must be implemented
  abstract getSettings(): Promise<HarnessSettings>
  abstract getSetting(key: string): Promise<Setting | null>
  abstract setSetting(key: string, value: unknown): Promise<void>

  resetSetting(_key: string): Promise<void> {
    return Promise.reject(new Error('resetSetting not implemented for this harness'))
  }

  resetAllSettings(): Promise<void> {
    return Promise.reject(new Error('resetAllSettings not implemented for this harness'))
  }

  // Tools & MCP - default implementations return empty/unsupported
  listTools(): Promise<ToolSummary[]> {
    return Promise.resolve([])
  }

  getTool(_id: string): Promise<Tool | null> {
    return Promise.resolve(null)
  }

  listMCPServers(): Promise<MCPServerSummary[]> {
    return Promise.resolve([])
  }

  getMCPServer(_id: string): Promise<MCPServer | null> {
    return Promise.resolve(null)
  }

  addMCPServer(_options: MCPServerOptions): Promise<MCPServer> {
    return Promise.reject(new Error('MCP servers not supported by this harness'))
  }

  updateMCPServer(_id: string, _updates: Partial<MCPServerOptions>): Promise<MCPServer> {
    return Promise.reject(new Error('MCP servers not supported by this harness'))
  }

  removeMCPServer(_id: string): Promise<void> {
    return Promise.reject(new Error('MCP servers not supported by this harness'))
  }

  setMCPServerStatus(_id: string, _enabled: boolean): Promise<void> {
    return Promise.reject(new Error('MCP servers not supported by this harness'))
  }

  testMCPServer(_id: string): Promise<{ connected: boolean; error?: string }> {
    return Promise.reject(new Error('MCP servers not supported by this harness'))
  }
}
