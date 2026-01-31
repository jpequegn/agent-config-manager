/**
 * File System Service Module
 * Exports all filesystem-related types, utilities, and services
 */

// Types
export type {
  FileEntryType,
  FileEntry,
  ReadOptions,
  WriteOptions,
  ListOptions,
  WatchOptions,
  FileChangeType,
  FileChangeEvent,
  FileWatcher,
  BackupInfo,
  FileOperationResult,
  ParsedConfig,
  ValidationError,
  ValidationResult,
} from './types'

// Path utilities
export type { OperatingSystem, HarnessPaths, HarnessConfigLocations } from './paths'
export {
  detectOS,
  getPathSeparator,
  normalizePath,
  joinPath,
  dirname,
  basename,
  extname,
  isAbsolute,
  resolvePath,
  relativePath,
  getCommonPaths,
  getHarnessConfigLocations,
} from './paths'

// Service and provider
export type { FileSystemProvider } from './service'
export { FileSystemService, initFileSystem, getFileSystem } from './service'

// Mock provider (for testing/development)
export { MockFileSystemProvider } from './mock-provider'
