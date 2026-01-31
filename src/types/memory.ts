/**
 * Memory Types
 * Types for memory management (sessions, learnings, context)
 */

import type { HarnessType } from './harness'

/** Types of memory entries */
export type MemoryType = 'session' | 'learning' | 'project-context' | 'codebase-index'

/** Memory entry category (for learnings) */
export type LearningCategory =
  | 'debugging'
  | 'architecture'
  | 'patterns'
  | 'decisions'
  | 'preferences'
  | 'errors'
  | 'solutions'
  | 'other'

/** Storage location type */
export type StorageLocation = 'local' | 'external' | 'cloud'

/** Memory entry metadata */
export interface MemoryEntryMetadata {
  /** Source of this memory (e.g., session ID, file path) */
  source?: string
  /** Associated project */
  project?: string
  /** Category (for learnings) */
  category?: LearningCategory
  /** Tags for searchability */
  tags?: string[]
  /** Custom key-value metadata */
  custom?: Record<string, string>
}

/** Memory entry definition */
export interface MemoryEntry {
  /** Unique identifier */
  id: string
  /** Harness this memory belongs to */
  harness: HarnessType
  /** Type of memory */
  type: MemoryType
  /** Entry title/name */
  title: string
  /** Entry content */
  content: string
  /** File path where stored */
  filePath: string
  /** Size in bytes */
  size: number
  /** Entry metadata */
  metadata: MemoryEntryMetadata
  /** Creation timestamp */
  createdAt: Date
  /** Last access timestamp */
  lastAccessedAt: Date
  /** Last modification timestamp */
  updatedAt: Date
}

/** Memory entry summary for list views */
export interface MemoryEntrySummary {
  /** Unique identifier */
  id: string
  /** Harness */
  harness: HarnessType
  /** Type */
  type: MemoryType
  /** Title */
  title: string
  /** Size in bytes */
  size: number
  /** Category (for learnings) */
  category?: LearningCategory
  /** Creation timestamp */
  createdAt: Date
  /** Last accessed timestamp */
  lastAccessedAt: Date
}

/** Storage information for a location */
export interface StorageInfo {
  /** Storage location type */
  location: StorageLocation
  /** Display name */
  name: string
  /** Base path */
  path: string
  /** Total capacity in bytes */
  totalCapacity: number
  /** Used space in bytes */
  usedSpace: number
  /** Available space in bytes */
  availableSpace: number
  /** Whether this storage is connected/available */
  isConnected: boolean
  /** Last sync timestamp */
  lastSyncedAt?: Date
}

/** Memory usage breakdown by type */
export interface MemoryUsageByType {
  /** Memory type */
  type: MemoryType
  /** Number of entries */
  entryCount: number
  /** Total size in bytes */
  totalSize: number
  /** Percentage of total memory */
  percentage: number
}

/** Memory usage breakdown by harness */
export interface MemoryUsageByHarness {
  /** Harness type */
  harness: HarnessType
  /** Number of entries */
  entryCount: number
  /** Total size in bytes */
  totalSize: number
  /** Percentage of total memory */
  percentage: number
}

/** Complete memory statistics */
export interface MemoryStats {
  /** Total entries across all types */
  totalEntries: number
  /** Total size in bytes */
  totalSize: number
  /** Breakdown by type */
  byType: MemoryUsageByType[]
  /** Breakdown by harness */
  byHarness: MemoryUsageByHarness[]
  /** Storage locations */
  storageLocations: StorageInfo[]
  /** Oldest entry date */
  oldestEntry?: Date
  /** Newest entry date */
  newestEntry?: Date
}

/** Project context file */
export interface ProjectContext {
  /** Project name */
  projectName: string
  /** Project path */
  projectPath: string
  /** Context files present */
  contextFiles: ProjectContextFile[]
  /** Last modified timestamp */
  lastModified: Date
}

/** Individual project context file */
export interface ProjectContextFile {
  /** File type (CLAUDE.md, .cursorrules, etc.) */
  type: 'claude-md' | 'cursorrules' | 'copilot-instructions' | 'other'
  /** File name */
  fileName: string
  /** Full file path */
  filePath: string
  /** File size in bytes */
  size: number
  /** Associated harness */
  harness: HarnessType
  /** Last modified timestamp */
  lastModified: Date
}

/** Memory prune options */
export interface MemoryPruneOptions {
  /** Prune entries older than this date */
  olderThan?: Date
  /** Prune to keep only this many entries */
  keepCount?: number
  /** Maximum size to keep (in bytes) */
  maxSize?: number
  /** Types to prune */
  types?: MemoryType[]
  /** Harnesses to prune */
  harnesses?: HarnessType[]
  /** Dry run (don't actually delete) */
  dryRun?: boolean
}

/** Result of memory prune operation */
export interface MemoryPruneResult {
  /** Number of entries deleted */
  deletedCount: number
  /** Space freed in bytes */
  freedSpace: number
  /** Entries that would be deleted (for dry run) */
  entriesToDelete?: MemoryEntrySummary[]
}
