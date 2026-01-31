/**
 * Mock File System Provider
 * In-memory implementation for development and testing
 */

import type { FileSystemProvider } from './service'
import type {
  FileEntry,
  ReadOptions,
  WriteOptions,
  ListOptions,
  WatchOptions,
  FileChangeEvent,
  FileWatcher,
  FileOperationResult,
} from './types'
import { normalizePath, dirname, basename } from './paths'

/** In-memory file entry */
interface MockFileEntry {
  type: 'file' | 'directory'
  content?: string
  binary?: Uint8Array
  createdAt: Date
  modifiedAt: Date
}

/**
 * Mock File System Provider
 * Stores files in memory - useful for testing and development
 */
export class MockFileSystemProvider implements FileSystemProvider {
  readonly name = 'mock'

  private files: Map<string, MockFileEntry> = new Map()
  private watchers: Map<string, Set<(event: FileChangeEvent) => void>> = new Map()

  constructor(initialFiles?: Record<string, string>) {
    // Create root directory
    this.files.set('/', { type: 'directory', createdAt: new Date(), modifiedAt: new Date() })

    // Add initial files if provided
    if (initialFiles) {
      for (const [path, content] of Object.entries(initialFiles)) {
        this.setFileSync(path, content)
      }
    }
  }

  isAvailable(): boolean {
    return true
  }

  private normPath(path: string): string {
    return normalizePath(path, 'macos') // Use Unix-style paths in mock
  }

  private setFileSync(path: string, content: string): void {
    const normalized = this.normPath(path)

    // Create parent directories
    const dir = dirname(normalized)
    if (dir !== '/' && dir !== '.') {
      this.mkdirSync(dir)
    }

    const now = new Date()
    const existing = this.files.get(normalized)

    this.files.set(normalized, {
      type: 'file',
      content,
      createdAt: existing?.createdAt ?? now,
      modifiedAt: now,
    })
  }

  private mkdirSync(path: string): void {
    const normalized = this.normPath(path)
    const parts = normalized.split('/').filter(Boolean)
    let current = ''

    for (const part of parts) {
      current = current + '/' + part
      if (!this.files.has(current)) {
        this.files.set(current, {
          type: 'directory',
          createdAt: new Date(),
          modifiedAt: new Date(),
        })
      }
    }
  }

  private notify(path: string, type: FileChangeEvent['type'], previousPath?: string): void {
    const event: FileChangeEvent = {
      type,
      path,
      previousPath,
      timestamp: new Date(),
    }

    // Notify watchers on the exact path
    const watchers = this.watchers.get(path)
    if (watchers) {
      for (const callback of watchers) {
        callback(event)
      }
    }

    // Notify watchers on parent directories
    let dir = dirname(path)
    while (dir && dir !== '/' && dir !== '.') {
      const dirWatchers = this.watchers.get(dir)
      if (dirWatchers) {
        for (const callback of dirWatchers) {
          callback(event)
        }
      }
      dir = dirname(dir)
    }
  }

  async readFile(path: string, _options?: ReadOptions): Promise<string> {
    const normalized = this.normPath(path)
    const entry = this.files.get(normalized)

    if (!entry) {
      throw new Error(`ENOENT: no such file or directory, open '${path}'`)
    }
    if (entry.type !== 'file') {
      throw new Error(`EISDIR: illegal operation on a directory, read '${path}'`)
    }

    return entry.content ?? ''
  }

  async readBinary(path: string): Promise<Uint8Array> {
    const normalized = this.normPath(path)
    const entry = this.files.get(normalized)

    if (!entry) {
      throw new Error(`ENOENT: no such file or directory, open '${path}'`)
    }
    if (entry.type !== 'file') {
      throw new Error(`EISDIR: illegal operation on a directory, read '${path}'`)
    }

    if (entry.binary) {
      return entry.binary
    }
    // Convert string content to binary
    return new TextEncoder().encode(entry.content ?? '')
  }

  async writeFile(
    path: string,
    content: string,
    options?: WriteOptions
  ): Promise<FileOperationResult> {
    const normalized = this.normPath(path)

    try {
      // Create parent directories if needed
      if (options?.createParents !== false) {
        const dir = dirname(normalized)
        if (dir !== '/' && dir !== '.') {
          this.mkdirSync(dir)
        }
      }

      // Check if parent exists
      const dir = dirname(normalized)
      if (dir !== '/' && dir !== '.' && !this.files.has(dir)) {
        return { success: false, error: `ENOENT: no such file or directory, open '${path}'` }
      }

      const existed = this.files.has(normalized)
      let backup: FileOperationResult['backup']

      // Create backup if requested and file exists
      if (existed && options?.backup !== false) {
        const backupPath = `${normalized}${options?.backupSuffix ?? '.bak'}`
        const existing = this.files.get(normalized)!
        this.files.set(backupPath, { ...existing })
        backup = {
          originalPath: normalized,
          backupPath,
          createdAt: new Date(),
          originalSize: existing.content?.length ?? existing.binary?.length ?? 0,
        }
      }

      const now = new Date()
      const existing = this.files.get(normalized)

      this.files.set(normalized, {
        type: 'file',
        content,
        createdAt: existing?.createdAt ?? now,
        modifiedAt: now,
      })

      this.notify(normalized, existed ? 'modify' : 'create')

      return { success: true, backup }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  async writeBinary(
    path: string,
    data: Uint8Array,
    options?: WriteOptions
  ): Promise<FileOperationResult> {
    const normalized = this.normPath(path)

    try {
      if (options?.createParents !== false) {
        const dir = dirname(normalized)
        if (dir !== '/' && dir !== '.') {
          this.mkdirSync(dir)
        }
      }

      const existed = this.files.has(normalized)
      const now = new Date()
      const existing = this.files.get(normalized)

      this.files.set(normalized, {
        type: 'file',
        binary: data,
        createdAt: existing?.createdAt ?? now,
        modifiedAt: now,
      })

      this.notify(normalized, existed ? 'modify' : 'create')

      return { success: true }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  async exists(path: string): Promise<boolean> {
    const normalized = this.normPath(path)
    return this.files.has(normalized)
  }

  async stat(path: string): Promise<FileEntry | null> {
    const normalized = this.normPath(path)
    const entry = this.files.get(normalized)

    if (!entry) {
      return null
    }

    const size = entry.type === 'file' ? (entry.content?.length ?? entry.binary?.length ?? 0) : 0

    return {
      name: basename(normalized),
      path: normalized,
      type: entry.type,
      size,
      createdAt: entry.createdAt,
      modifiedAt: entry.modifiedAt,
      isHidden: basename(normalized).startsWith('.'),
    }
  }

  async mkdir(path: string, recursive = true): Promise<FileOperationResult> {
    const normalized = this.normPath(path)

    try {
      if (recursive) {
        this.mkdirSync(normalized)
      } else {
        const parent = dirname(normalized)
        if (parent !== '/' && parent !== '.' && !this.files.has(parent)) {
          return { success: false, error: `ENOENT: no such file or directory, mkdir '${path}'` }
        }
        this.files.set(normalized, {
          type: 'directory',
          createdAt: new Date(),
          modifiedAt: new Date(),
        })
      }
      return { success: true }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  async remove(path: string, recursive = false): Promise<FileOperationResult> {
    const normalized = this.normPath(path)
    const entry = this.files.get(normalized)

    if (!entry) {
      return { success: false, error: `ENOENT: no such file or directory, unlink '${path}'` }
    }

    if (entry.type === 'directory') {
      // Check for children
      const children = Array.from(this.files.keys()).filter(
        (p) => p !== normalized && p.startsWith(normalized + '/')
      )

      if (children.length > 0 && !recursive) {
        return { success: false, error: `ENOTEMPTY: directory not empty, rmdir '${path}'` }
      }

      // Remove children
      for (const child of children) {
        this.files.delete(child)
      }
    }

    this.files.delete(normalized)
    this.notify(normalized, 'delete')

    return { success: true }
  }

  async copy(src: string, dest: string, overwrite = false): Promise<FileOperationResult> {
    const normalizedSrc = this.normPath(src)
    const normalizedDest = this.normPath(dest)

    const entry = this.files.get(normalizedSrc)
    if (!entry) {
      return { success: false, error: `ENOENT: no such file or directory, copyfile '${src}'` }
    }

    if (this.files.has(normalizedDest) && !overwrite) {
      return { success: false, error: `EEXIST: file already exists, copyfile '${dest}'` }
    }

    // Create parent directories
    const destDir = dirname(normalizedDest)
    if (destDir !== '/' && destDir !== '.') {
      this.mkdirSync(destDir)
    }

    this.files.set(normalizedDest, {
      ...entry,
      createdAt: new Date(),
      modifiedAt: new Date(),
    })

    this.notify(normalizedDest, 'create')

    return { success: true }
  }

  async move(src: string, dest: string, overwrite = false): Promise<FileOperationResult> {
    const normalizedSrc = this.normPath(src)
    const normalizedDest = this.normPath(dest)

    const copyResult = await this.copy(src, dest, overwrite)
    if (!copyResult.success) {
      return copyResult
    }

    this.files.delete(normalizedSrc)
    this.notify(normalizedDest, 'rename', normalizedSrc)

    return { success: true }
  }

  async list(path: string, options?: ListOptions): Promise<FileEntry[]> {
    const normalized = this.normPath(path)
    const entry = this.files.get(normalized)

    if (!entry) {
      throw new Error(`ENOENT: no such file or directory, scandir '${path}'`)
    }
    if (entry.type !== 'directory') {
      throw new Error(`ENOTDIR: not a directory, scandir '${path}'`)
    }

    const prefix = normalized === '/' ? '/' : normalized + '/'
    const entries: FileEntry[] = []

    for (const [filePath, fileEntry] of this.files.entries()) {
      if (filePath === normalized) continue

      const isDirectChild = filePath.startsWith(prefix)
      if (!isDirectChild) continue

      const relativePath = filePath.slice(prefix.length)
      const isNestedChild = relativePath.includes('/')

      if (!options?.recursive && isNestedChild) continue

      // Filter by type
      if (options?.type && fileEntry.type !== options.type) continue

      const name = basename(filePath)

      // Filter hidden files
      if (!options?.includeHidden && name.startsWith('.')) continue

      // Filter by pattern (simple glob matching)
      if (options?.pattern) {
        const regex = new RegExp(
          '^' + options.pattern.replace(/\*/g, '.*').replace(/\?/g, '.') + '$'
        )
        if (!regex.test(name)) continue
      }

      const size =
        fileEntry.type === 'file' ? (fileEntry.content?.length ?? fileEntry.binary?.length ?? 0) : 0

      entries.push({
        name,
        path: filePath,
        type: fileEntry.type,
        size,
        createdAt: fileEntry.createdAt,
        modifiedAt: fileEntry.modifiedAt,
        isHidden: name.startsWith('.'),
      })
    }

    return entries.sort((a, b) => a.name.localeCompare(b.name))
  }

  async watch(
    path: string,
    callback: (event: FileChangeEvent) => void,
    _options?: WatchOptions
  ): Promise<FileWatcher> {
    const normalized = this.normPath(path)

    if (!this.watchers.has(normalized)) {
      this.watchers.set(normalized, new Set())
    }
    this.watchers.get(normalized)!.add(callback)

    let active = true

    return {
      close: () => {
        active = false
        const watchers = this.watchers.get(normalized)
        if (watchers) {
          watchers.delete(callback)
          if (watchers.size === 0) {
            this.watchers.delete(normalized)
          }
        }
      },
      get isActive() {
        return active
      },
    }
  }

  async resolvePath(path: string): Promise<string> {
    // In mock, just normalize and expand ~ to /home/user
    let resolved = path
    if (resolved.startsWith('~')) {
      resolved = '/home/user' + resolved.slice(1)
    }
    if (resolved.includes('$HOME')) {
      resolved = resolved.replace(/\$HOME/g, '/home/user')
    }
    return this.normPath(resolved)
  }

  async getHomeDir(): Promise<string> {
    return '/home/user'
  }

  // ============================================
  // Mock-specific methods for testing
  // ============================================

  /**
   * Set a file directly (for test setup)
   */
  setFile(path: string, content: string): void {
    this.setFileSync(path, content)
  }

  /**
   * Get all files (for test assertions)
   */
  getAllFiles(): Map<string, MockFileEntry> {
    return new Map(this.files)
  }

  /**
   * Clear all files
   */
  clear(): void {
    this.files.clear()
    this.files.set('/', { type: 'directory', createdAt: new Date(), modifiedAt: new Date() })
  }
}
