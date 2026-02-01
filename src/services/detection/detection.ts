/**
 * Harness Detection Service
 * Automatically detects installed AI coding harnesses
 */

import type { HarnessType, DetectionResult, HarnessConfigPaths, HarnessStatus } from '@/types'
import type { FileSystemProvider } from '../filesystem/service'
import { detectOS, type OperatingSystem } from '../filesystem/paths'

/** Join paths with the correct separator for the given OS */
function joinPathForOS(os: OperatingSystem, ...segments: string[]): string {
  const sep = os === 'windows' ? '\\' : '/'
  return segments
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
}

/** Detection configuration for a harness */
interface HarnessDetectionConfig {
  type: HarnessType
  /** Paths to check (relative to home directory) */
  globalPaths: string[]
  /** Project-level config file patterns */
  projectPatterns?: string[]
  /** Additional paths for specific OS */
  osPaths?: Partial<Record<OperatingSystem, string[]>>
  /** Get config paths from detected locations */
  getConfigPaths: (
    os: OperatingSystem,
    homePath: string,
    detectedPath?: string
  ) => HarnessConfigPaths
}

/** All harness detection configurations */
const harnessDetectionConfigs: HarnessDetectionConfig[] = [
  {
    type: 'claude-code',
    globalPaths: ['.claude'],
    projectPatterns: ['CLAUDE.md', '.claude.md'],
    getConfigPaths: (os, _home, detected) => ({
      settings: detected ? joinPathForOS(os, detected, 'settings.json') : undefined,
      skills: detected ? joinPathForOS(os, detected, 'commands') : undefined,
      memory: detected ? joinPathForOS(os, detected, 'memory') : undefined,
      hooks: detected ? joinPathForOS(os, detected, 'hooks') : undefined,
      projectConfig: 'CLAUDE.md',
    }),
  },
  {
    type: 'cursor',
    globalPaths: ['.cursor'],
    osPaths: {
      macos: ['Library/Application Support/Cursor'],
      windows: ['AppData/Roaming/Cursor'],
      linux: ['.config/Cursor'],
    },
    projectPatterns: ['.cursor', '.cursorrules'],
    getConfigPaths: (os, _home, detected) => ({
      settings: detected ? joinPathForOS(os, detected, 'settings.json') : undefined,
      projectConfig: '.cursorrules',
    }),
  },
  {
    type: 'copilot',
    globalPaths: ['.config/github-copilot'],
    osPaths: {
      macos: ['Library/Application Support/GitHub Copilot'],
      windows: ['AppData/Local/GitHub Copilot'],
      linux: ['.config/github-copilot'],
    },
    getConfigPaths: (os, _home, detected) => ({
      settings: detected ? joinPathForOS(os, detected, 'settings.json') : undefined,
    }),
  },
  {
    type: 'cline',
    globalPaths: ['.cline', '.config/cline'],
    osPaths: {
      macos: ['Library/Application Support/Cline'],
      windows: ['AppData/Roaming/Cline'],
    },
    getConfigPaths: (os, _home, detected) => ({
      settings: detected ? joinPathForOS(os, detected, 'settings.json') : undefined,
      memory: detected ? joinPathForOS(os, detected, 'memory') : undefined,
    }),
  },
  {
    type: 'continue',
    globalPaths: ['.continue'],
    getConfigPaths: (os, _home, detected) => ({
      settings: detected ? joinPathForOS(os, detected, 'config.json') : undefined,
      skills: detected ? joinPathForOS(os, detected, 'prompts') : undefined,
    }),
  },
  {
    type: 'aider',
    globalPaths: ['.aider.conf.yml', '.aider.model.settings.yml', '.aiderignore'],
    projectPatterns: ['.aider.conf.yml', '.aider.chat.history.md', '.aiderignore'],
    getConfigPaths: (os, home, _detected) => ({
      settings: joinPathForOS(os, home, '.aider.conf.yml'),
      projectConfig: '.aider.conf.yml',
    }),
  },
]

/**
 * Harness Detection Service
 * Scans the filesystem to detect installed AI coding harnesses
 */
export class HarnessDetectionService {
  private fs: FileSystemProvider
  private homePath: string
  private os: OperatingSystem

  constructor(fs: FileSystemProvider, homePath: string, os?: OperatingSystem) {
    this.fs = fs
    this.homePath = homePath
    this.os = os ?? detectOS()
  }

  /**
   * Join paths using the service's OS setting
   */
  private joinPath(...segments: string[]): string {
    return joinPathForOS(this.os, ...segments)
  }

  /**
   * Detect all supported harnesses
   */
  async detectAll(): Promise<DetectionResult[]> {
    const results = await Promise.all(
      harnessDetectionConfigs.map((config) => this.detectHarness(config))
    )
    return results
  }

  /**
   * Detect a specific harness type
   */
  async detect(type: HarnessType): Promise<DetectionResult> {
    const config = harnessDetectionConfigs.find((c) => c.type === type)
    if (!config) {
      return this.createNotFoundResult(type)
    }
    return this.detectHarness(config)
  }

  /**
   * Detect a harness based on its configuration
   */
  private async detectHarness(config: HarnessDetectionConfig): Promise<DetectionResult> {
    try {
      // Build list of paths to check
      const pathsToCheck = [...config.globalPaths]

      // Add OS-specific paths
      if (config.osPaths && config.osPaths[this.os]) {
        pathsToCheck.push(...config.osPaths[this.os]!)
      }

      // Check each path
      let detectedPath: string | undefined
      for (const relativePath of pathsToCheck) {
        const fullPath = this.joinPath(this.homePath, relativePath)
        const exists = await this.fs.exists(fullPath)
        if (exists) {
          detectedPath = fullPath
          break
        }
      }

      if (detectedPath) {
        const configPaths = config.getConfigPaths(this.os, this.homePath, detectedPath)
        return {
          type: config.type,
          detected: true,
          status: 'detected' as HarnessStatus,
          configPaths,
        }
      }

      return this.createNotFoundResult(config.type)
    } catch (error) {
      return {
        type: config.type,
        detected: false,
        status: 'disabled' as HarnessStatus,
        configPaths: {},
        error: error instanceof Error ? error.message : 'Unknown detection error',
      }
    }
  }

  /**
   * Create a result for a harness that wasn't found
   */
  private createNotFoundResult(type: HarnessType): DetectionResult {
    return {
      type,
      detected: false,
      status: 'disabled' as HarnessStatus,
      configPaths: {},
    }
  }

  /**
   * Check if a specific harness is installed
   */
  async isInstalled(type: HarnessType): Promise<boolean> {
    const result = await this.detect(type)
    return result.detected
  }

  /**
   * Get config paths for a detected harness
   */
  async getConfigPaths(type: HarnessType): Promise<HarnessConfigPaths | null> {
    const result = await this.detect(type)
    return result.detected ? result.configPaths : null
  }
}

/**
 * Create a detection service instance
 */
export function createDetectionService(
  fs: FileSystemProvider,
  homePath: string,
  os?: OperatingSystem
): HarnessDetectionService {
  return new HarnessDetectionService(fs, homePath, os)
}
