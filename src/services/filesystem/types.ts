/**
 * File System Service Types
 * Defines interfaces for cross-platform file system operations
 */

/** File entry type */
export type FileEntryType = 'file' | 'directory' | 'symlink'

/** File entry metadata */
export interface FileEntry {
  /** File/directory name */
  name: string
  /** Full path */
  path: string
  /** Entry type */
  type: FileEntryType
  /** Size in bytes (0 for directories) */
  size: number
  /** Last modified timestamp */
  modifiedAt: Date
  /** Created timestamp */
  createdAt: Date
  /** Whether entry is hidden */
  isHidden: boolean
}

/** Options for reading files */
export interface ReadOptions {
  /** Encoding (default: utf-8) */
  encoding?: 'utf-8' | 'base64' | 'binary'
}

/** Options for writing files */
export interface WriteOptions {
  /** Encoding (default: utf-8) */
  encoding?: 'utf-8' | 'base64' | 'binary'
  /** Create parent directories if needed (default: true) */
  createParents?: boolean
  /** Create backup before overwriting (default: true for existing files) */
  backup?: boolean
  /** Backup suffix (default: .bak) */
  backupSuffix?: string
}

/** Options for listing directory contents */
export interface ListOptions {
  /** Include hidden files (default: false) */
  includeHidden?: boolean
  /** Recursive listing (default: false) */
  recursive?: boolean
  /** Filter by file type */
  type?: FileEntryType
  /** Filter by glob pattern */
  pattern?: string
}

/** Options for watching files */
export interface WatchOptions {
  /** Watch recursively (default: false) */
  recursive?: boolean
  /** Debounce delay in ms (default: 100) */
  debounceMs?: number
}

/** File change event types */
export type FileChangeType = 'create' | 'modify' | 'delete' | 'rename'

/** File change event */
export interface FileChangeEvent {
  /** Type of change */
  type: FileChangeType
  /** Path that changed */
  path: string
  /** Previous path (for renames) */
  previousPath?: string
  /** Timestamp of change */
  timestamp: Date
}

/** File watcher handle */
export interface FileWatcher {
  /** Stop watching */
  close(): void
  /** Whether watcher is active */
  readonly isActive: boolean
}

/** Backup metadata */
export interface BackupInfo {
  /** Original file path */
  originalPath: string
  /** Backup file path */
  backupPath: string
  /** Backup timestamp */
  createdAt: Date
  /** Original file size */
  originalSize: number
}

/** Result of a file operation */
export interface FileOperationResult {
  /** Whether operation succeeded */
  success: boolean
  /** Error message if failed */
  error?: string
  /** Backup info if backup was created */
  backup?: BackupInfo
}

/** Parsed config file result */
export interface ParsedConfig<T = unknown> {
  /** Parsed data */
  data: T
  /** Original file path */
  filePath: string
  /** File format */
  format: 'json' | 'yaml' | 'toml' | 'unknown'
  /** Parse warnings */
  warnings?: string[]
}

/** Validation error */
export interface ValidationError {
  /** Error path (e.g., "settings.theme") */
  path: string
  /** Error message */
  message: string
  /** Expected value/type */
  expected?: string
  /** Actual value/type */
  actual?: string
}

/** Validation result */
export interface ValidationResult {
  /** Whether validation passed */
  valid: boolean
  /** Validation errors */
  errors: ValidationError[]
}
