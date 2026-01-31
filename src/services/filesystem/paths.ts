/**
 * Path Utilities
 * Cross-platform path resolution and manipulation
 */

/** Detected operating system */
export type OperatingSystem = 'macos' | 'linux' | 'windows' | 'unknown'

/**
 * Detect the current operating system
 */
export function detectOS(): OperatingSystem {
  if (typeof navigator === 'undefined') {
    return 'unknown'
  }

  const platform = navigator.platform.toLowerCase()
  const userAgent = navigator.userAgent.toLowerCase()

  if (platform.includes('mac') || userAgent.includes('mac')) {
    return 'macos'
  }
  if (platform.includes('win') || userAgent.includes('win')) {
    return 'windows'
  }
  if (platform.includes('linux') || userAgent.includes('linux')) {
    return 'linux'
  }

  return 'unknown'
}

/**
 * Get the path separator for the current OS
 */
export function getPathSeparator(os?: OperatingSystem): string {
  const currentOS = os ?? detectOS()
  return currentOS === 'windows' ? '\\' : '/'
}

/**
 * Normalize a path for the current OS
 */
export function normalizePath(path: string, os?: OperatingSystem): string {
  const currentOS = os ?? detectOS()
  const sep = getPathSeparator(currentOS)
  const otherSep = sep === '/' ? '\\' : '/'

  // Replace all separators with the correct one
  let normalized = path.split(otherSep).join(sep)

  // Remove trailing separator (except for root)
  if (normalized.length > 1 && normalized.endsWith(sep)) {
    normalized = normalized.slice(0, -1)
  }

  // Collapse multiple separators
  const regex = new RegExp(`\\${sep}+`, 'g')
  normalized = normalized.replace(regex, sep)

  return normalized
}

/**
 * Join path segments
 */
export function joinPath(...segments: string[]): string {
  const sep = getPathSeparator()
  const joined = segments
    .filter((s) => s.length > 0)
    .map((s, i) => {
      // Remove leading separator except for first segment
      if (i > 0 && (s.startsWith('/') || s.startsWith('\\'))) {
        s = s.slice(1)
      }
      // Remove trailing separator
      if (s.endsWith('/') || s.endsWith('\\')) {
        s = s.slice(0, -1)
      }
      return s
    })
    .join(sep)

  return normalizePath(joined)
}

/**
 * Get the directory name from a path
 */
export function dirname(path: string): string {
  const normalized = normalizePath(path)
  const sep = getPathSeparator()
  const lastSep = normalized.lastIndexOf(sep)

  if (lastSep === -1) {
    return '.'
  }
  if (lastSep === 0) {
    return sep
  }

  return normalized.slice(0, lastSep)
}

/**
 * Get the base name from a path
 */
export function basename(path: string, ext?: string): string {
  const normalized = normalizePath(path)
  const sep = getPathSeparator()
  const lastSep = normalized.lastIndexOf(sep)
  let base = lastSep === -1 ? normalized : normalized.slice(lastSep + 1)

  if (ext && base.endsWith(ext)) {
    base = base.slice(0, -ext.length)
  }

  return base
}

/**
 * Get the file extension
 */
export function extname(path: string): string {
  const base = basename(path)
  const lastDot = base.lastIndexOf('.')

  if (lastDot === -1 || lastDot === 0) {
    return ''
  }

  return base.slice(lastDot)
}

/**
 * Check if a path is absolute
 */
export function isAbsolute(path: string, os?: OperatingSystem): boolean {
  const currentOS = os ?? detectOS()

  if (currentOS === 'windows') {
    // Windows: C:\, D:\, \\server\share, etc.
    return /^[a-zA-Z]:[\\/]/.test(path) || path.startsWith('\\\\')
  }

  // Unix: starts with /
  return path.startsWith('/')
}

/**
 * Resolve a path relative to a base
 */
export function resolvePath(base: string, ...paths: string[]): string {
  let result = base

  for (const path of paths) {
    if (isAbsolute(path)) {
      result = path
    } else {
      result = joinPath(result, path)
    }
  }

  return normalizePath(result)
}

/**
 * Get relative path from one path to another
 */
export function relativePath(from: string, to: string): string {
  const sep = getPathSeparator()
  const fromParts = normalizePath(from).split(sep).filter(Boolean)
  const toParts = normalizePath(to).split(sep).filter(Boolean)

  // Find common prefix
  let commonLength = 0
  const minLength = Math.min(fromParts.length, toParts.length)

  for (let i = 0; i < minLength; i++) {
    if (fromParts[i] === toParts[i]) {
      commonLength++
    } else {
      break
    }
  }

  // Build relative path
  const upCount = fromParts.length - commonLength
  const downParts = toParts.slice(commonLength)

  const relativeParts = [...Array(upCount).fill('..'), ...downParts]

  return relativeParts.length > 0 ? relativeParts.join(sep) : '.'
}

/** Common paths for different harnesses */
export interface HarnessPaths {
  /** User home directory */
  home: string
  /** Application config directory */
  config: string
  /** Application data directory */
  data: string
  /** Cache directory */
  cache: string
}

/**
 * Get common paths for the current OS
 * Note: These are templates - actual resolution happens at runtime
 */
export function getCommonPaths(os?: OperatingSystem): HarnessPaths {
  const currentOS = os ?? detectOS()

  switch (currentOS) {
    case 'macos':
      return {
        home: '$HOME',
        config: '$HOME/.config',
        data: '$HOME/Library/Application Support',
        cache: '$HOME/Library/Caches',
      }
    case 'linux':
      return {
        home: '$HOME',
        config: '$XDG_CONFIG_HOME || $HOME/.config',
        data: '$XDG_DATA_HOME || $HOME/.local/share',
        cache: '$XDG_CACHE_HOME || $HOME/.cache',
      }
    case 'windows':
      return {
        home: '%USERPROFILE%',
        config: '%APPDATA%',
        data: '%LOCALAPPDATA%',
        cache: '%LOCALAPPDATA%\\Temp',
      }
    default:
      return {
        home: '~',
        config: '~/.config',
        data: '~/.local/share',
        cache: '~/.cache',
      }
  }
}

/** Known harness config locations */
export interface HarnessConfigLocations {
  claudeCode: {
    global: string
    project: string
  }
  cursor: {
    global: string
    workspace: string
  }
  copilot: {
    global: string
  }
  cline: {
    global: string
  }
  continue: {
    global: string
  }
  aider: {
    global: string
    project: string
  }
}

/**
 * Get known config file locations for each harness
 * Uses path templates that need runtime resolution
 */
export function getHarnessConfigLocations(os?: OperatingSystem): HarnessConfigLocations {
  const currentOS = os ?? detectOS()
  const paths = getCommonPaths(currentOS)

  return {
    claudeCode: {
      global: joinPath(paths.home, '.claude'),
      project: 'CLAUDE.md',
    },
    cursor: {
      global: joinPath(paths.config, 'Cursor'),
      workspace: '.cursor',
    },
    copilot: {
      global: joinPath(paths.config, 'github-copilot'),
    },
    cline: {
      global: joinPath(paths.config, 'cline'),
    },
    continue: {
      global: joinPath(paths.home, '.continue'),
    },
    aider: {
      global: joinPath(paths.home, '.aider.conf.yml'),
      project: '.aider.conf.yml',
    },
  }
}
