/**
 * Harness Types
 * Types for AI coding assistant harnesses (Claude Code, Cursor, etc.)
 */

/** Supported harness types */
export type HarnessType = 'claude-code' | 'cursor' | 'copilot' | 'cline' | 'continue' | 'aider'

/** Harness detection and installation status */
export type HarnessStatus = 'active' | 'installed' | 'detected' | 'disabled'

/** Result of harness auto-detection */
export interface DetectionResult {
  /** The type of harness detected */
  type: HarnessType
  /** Whether the harness was found */
  detected: boolean
  /** Installation/detection status */
  status: HarnessStatus
  /** Version if available */
  version?: string
  /** Paths to configuration files */
  configPaths: HarnessConfigPaths
  /** Any errors encountered during detection */
  error?: string
}

/** Paths to harness configuration files */
export interface HarnessConfigPaths {
  /** Main settings file path */
  settings?: string
  /** Skills/commands directory path */
  skills?: string
  /** Memory/history directory path */
  memory?: string
  /** Hooks configuration path */
  hooks?: string
  /** Project-level config pattern (e.g., CLAUDE.md) */
  projectConfig?: string
}

/** Statistics about a harness's configuration */
export interface HarnessStats {
  /** Number of skills/commands configured */
  skillCount: number
  /** Number of hooks configured */
  hookCount: number
  /** Number of sessions stored */
  sessionCount: number
  /** Total memory usage in bytes */
  memorySize: number
  /** Last activity timestamp */
  lastActivity?: Date
}

/** Complete harness configuration */
export interface HarnessConfig {
  /** Unique identifier for this harness instance */
  id: string
  /** Display name (e.g., "Claude Code", "Cursor") */
  name: string
  /** Harness type identifier */
  type: HarnessType
  /** Current status */
  status: HarnessStatus
  /** Version string if available */
  version?: string
  /** Configuration file paths */
  configPaths: HarnessConfigPaths
  /** Usage statistics */
  stats: HarnessStats
  /** Brand color for UI (hex) */
  brandColor?: string
  /** Icon identifier */
  icon?: string
}

/** Harness metadata for display */
export interface HarnessInfo {
  /** Harness type */
  type: HarnessType
  /** Display name */
  displayName: string
  /** Short description */
  description: string
  /** Brand color (hex) */
  brandColor: string
  /** Website URL */
  website: string
  /** Documentation URL */
  docsUrl?: string
}
