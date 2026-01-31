/**
 * File System Service
 * Abstract interface for file system operations with provider pattern
 */

import type {
  FileEntry,
  ReadOptions,
  WriteOptions,
  ListOptions,
  WatchOptions,
  FileChangeEvent,
  FileWatcher,
  FileOperationResult,
  ParsedConfig,
  ValidationResult,
} from './types'

/**
 * File System Provider Interface
 * Implementations can use Electron, Tauri, Browser File System Access API, etc.
 */
export interface FileSystemProvider {
  /** Provider name for debugging */
  readonly name: string

  /** Whether this provider is available in the current environment */
  isAvailable(): boolean

  /**
   * Read a file's contents
   */
  readFile(path: string, options?: ReadOptions): Promise<string>

  /**
   * Read a file as binary data
   */
  readBinary(path: string): Promise<Uint8Array>

  /**
   * Write content to a file
   */
  writeFile(path: string, content: string, options?: WriteOptions): Promise<FileOperationResult>

  /**
   * Write binary data to a file
   */
  writeBinary(path: string, data: Uint8Array, options?: WriteOptions): Promise<FileOperationResult>

  /**
   * Check if a path exists
   */
  exists(path: string): Promise<boolean>

  /**
   * Get file/directory metadata
   */
  stat(path: string): Promise<FileEntry | null>

  /**
   * Create a directory (and parents if needed)
   */
  mkdir(path: string, recursive?: boolean): Promise<FileOperationResult>

  /**
   * Remove a file or directory
   */
  remove(path: string, recursive?: boolean): Promise<FileOperationResult>

  /**
   * Copy a file or directory
   */
  copy(src: string, dest: string, overwrite?: boolean): Promise<FileOperationResult>

  /**
   * Move/rename a file or directory
   */
  move(src: string, dest: string, overwrite?: boolean): Promise<FileOperationResult>

  /**
   * List directory contents
   */
  list(path: string, options?: ListOptions): Promise<FileEntry[]>

  /**
   * Watch a file or directory for changes
   */
  watch(
    path: string,
    callback: (event: FileChangeEvent) => void,
    options?: WatchOptions
  ): Promise<FileWatcher>

  /**
   * Resolve environment variables in a path
   */
  resolvePath(path: string): Promise<string>

  /**
   * Get the user's home directory
   */
  getHomeDir(): Promise<string>
}

/**
 * File System Service
 * High-level API for file operations with parsing and validation
 */
export class FileSystemService {
  private provider: FileSystemProvider

  constructor(provider: FileSystemProvider) {
    this.provider = provider
  }

  /** Get the current provider name */
  get providerName(): string {
    return this.provider.name
  }

  /** Check if the provider is available */
  isAvailable(): boolean {
    return this.provider.isAvailable()
  }

  // ============================================
  // Basic File Operations
  // ============================================

  async readFile(path: string, options?: ReadOptions): Promise<string> {
    return this.provider.readFile(path, options)
  }

  async readBinary(path: string): Promise<Uint8Array> {
    return this.provider.readBinary(path)
  }

  async writeFile(
    path: string,
    content: string,
    options?: WriteOptions
  ): Promise<FileOperationResult> {
    return this.provider.writeFile(path, content, options)
  }

  async writeBinary(
    path: string,
    data: Uint8Array,
    options?: WriteOptions
  ): Promise<FileOperationResult> {
    return this.provider.writeBinary(path, data, options)
  }

  async exists(path: string): Promise<boolean> {
    return this.provider.exists(path)
  }

  async stat(path: string): Promise<FileEntry | null> {
    return this.provider.stat(path)
  }

  async mkdir(path: string, recursive = true): Promise<FileOperationResult> {
    return this.provider.mkdir(path, recursive)
  }

  async remove(path: string, recursive = false): Promise<FileOperationResult> {
    return this.provider.remove(path, recursive)
  }

  async copy(src: string, dest: string, overwrite = false): Promise<FileOperationResult> {
    return this.provider.copy(src, dest, overwrite)
  }

  async move(src: string, dest: string, overwrite = false): Promise<FileOperationResult> {
    return this.provider.move(src, dest, overwrite)
  }

  async list(path: string, options?: ListOptions): Promise<FileEntry[]> {
    return this.provider.list(path, options)
  }

  async watch(
    path: string,
    callback: (event: FileChangeEvent) => void,
    options?: WatchOptions
  ): Promise<FileWatcher> {
    return this.provider.watch(path, callback, options)
  }

  async resolvePath(path: string): Promise<string> {
    return this.provider.resolvePath(path)
  }

  async getHomeDir(): Promise<string> {
    return this.provider.getHomeDir()
  }

  // ============================================
  // Config File Operations
  // ============================================

  /**
   * Read and parse a JSON file
   */
  async readJson<T = unknown>(path: string): Promise<ParsedConfig<T>> {
    const content = await this.readFile(path)

    try {
      const data = JSON.parse(content) as T
      return {
        data,
        filePath: path,
        format: 'json',
      }
    } catch (error) {
      throw new Error(
        `Failed to parse JSON at ${path}: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  /**
   * Write data as JSON to a file
   */
  async writeJson<T>(
    path: string,
    data: T,
    options?: WriteOptions & { pretty?: boolean }
  ): Promise<FileOperationResult> {
    const { pretty = true, ...writeOptions } = options ?? {}
    const content = pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data)
    return this.writeFile(path, content + '\n', writeOptions)
  }

  /**
   * Read and parse a YAML file
   * Note: Requires yaml library to be available
   */
  async readYaml<T = unknown>(path: string): Promise<ParsedConfig<T>> {
    const content = await this.readFile(path)

    // Dynamic import to avoid bundling yaml if not needed
    try {
      const yaml = await import('yaml')
      const data = yaml.parse(content) as T
      return {
        data,
        filePath: path,
        format: 'yaml',
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('Cannot find module')) {
        throw new Error('YAML parsing requires the "yaml" package. Install it with: bun add yaml')
      }
      throw new Error(
        `Failed to parse YAML at ${path}: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  /**
   * Write data as YAML to a file
   */
  async writeYaml<T>(path: string, data: T, options?: WriteOptions): Promise<FileOperationResult> {
    try {
      const yaml = await import('yaml')
      const content = yaml.stringify(data)
      return this.writeFile(path, content, options)
    } catch (error) {
      if (error instanceof Error && error.message.includes('Cannot find module')) {
        throw new Error('YAML writing requires the "yaml" package. Install it with: bun add yaml')
      }
      throw error
    }
  }

  /**
   * Read a config file, auto-detecting format from extension
   */
  async readConfig<T = unknown>(path: string): Promise<ParsedConfig<T>> {
    const ext = path.toLowerCase().split('.').pop()

    switch (ext) {
      case 'json':
        return this.readJson<T>(path)
      case 'yaml':
      case 'yml':
        return this.readYaml<T>(path)
      default:
        // Try JSON first, then YAML
        try {
          return await this.readJson<T>(path)
        } catch {
          try {
            return await this.readYaml<T>(path)
          } catch {
            throw new Error(`Unable to parse config file: ${path}`)
          }
        }
    }
  }

  /**
   * Write a config file, auto-detecting format from extension
   */
  async writeConfig<T>(
    path: string,
    data: T,
    options?: WriteOptions
  ): Promise<FileOperationResult> {
    const ext = path.toLowerCase().split('.').pop()

    switch (ext) {
      case 'yaml':
      case 'yml':
        return this.writeYaml(path, data, options)
      case 'json':
      default:
        return this.writeJson(path, data, options)
    }
  }

  // ============================================
  // Validation
  // ============================================

  /**
   * Validate data against a schema
   * Generic validation - specific schema types should extend this
   */
  validate(
    data: unknown,
    validator: (data: unknown) => {
      valid: boolean
      errors?: Array<{ path: string; message: string }>
    }
  ): ValidationResult {
    const result = validator(data)
    return {
      valid: result.valid,
      errors: (result.errors ?? []).map((e) => ({
        path: e.path,
        message: e.message,
      })),
    }
  }

  /**
   * Read, parse, and validate a config file
   */
  async readAndValidate<T>(
    path: string,
    validator: (data: unknown) => {
      valid: boolean
      errors?: Array<{ path: string; message: string }>
    }
  ): Promise<{ config: ParsedConfig<T>; validation: ValidationResult }> {
    const config = await this.readConfig<T>(path)
    const validation = this.validate(config.data, validator)
    return { config, validation }
  }

  // ============================================
  // Backup Operations
  // ============================================

  /**
   * Create a backup of a file
   */
  async createBackup(
    path: string,
    suffix = '.bak'
  ): Promise<FileOperationResult & { backupPath?: string }> {
    const exists = await this.exists(path)
    if (!exists) {
      return { success: false, error: 'Source file does not exist' }
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupPath = `${path}.${timestamp}${suffix}`

    const result = await this.copy(path, backupPath)
    if (result.success) {
      return { ...result, backupPath }
    }
    return result
  }

  /**
   * List backups for a file
   */
  async listBackups(path: string, suffix = '.bak'): Promise<FileEntry[]> {
    const dir = path.substring(0, path.lastIndexOf('/') || path.lastIndexOf('\\'))
    const filename = path.substring(path.lastIndexOf('/') + 1 || path.lastIndexOf('\\') + 1)

    const entries = await this.list(dir)
    return entries.filter((entry) => entry.name.startsWith(filename) && entry.name.endsWith(suffix))
  }

  /**
   * Restore from a backup
   */
  async restoreBackup(backupPath: string, targetPath: string): Promise<FileOperationResult> {
    return this.copy(backupPath, targetPath, true)
  }
}

// Singleton instance - will be initialized with a provider
let fileSystemService: FileSystemService | null = null

/**
 * Initialize the file system service with a provider
 */
export function initFileSystem(provider: FileSystemProvider): FileSystemService {
  fileSystemService = new FileSystemService(provider)
  return fileSystemService
}

/**
 * Get the file system service instance
 */
export function getFileSystem(): FileSystemService {
  if (!fileSystemService) {
    throw new Error('FileSystemService not initialized. Call initFileSystem() first.')
  }
  return fileSystemService
}
