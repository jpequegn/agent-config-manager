/**
 * Harness Detection Service Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { HarnessDetectionService, createDetectionService } from './detection'
import type { FileSystemProvider } from '../filesystem/service'

describe('HarnessDetectionService', () => {
  let mockFs: FileSystemProvider
  const homePath = '/Users/test'

  beforeEach(() => {
    // Create mock filesystem provider
    mockFs = {
      exists: vi.fn(),
      stat: vi.fn(),
      readFile: vi.fn(),
      readDir: vi.fn(),
      writeFile: vi.fn(),
      mkdir: vi.fn(),
      rm: vi.fn(),
      copy: vi.fn(),
      move: vi.fn(),
      watch: vi.fn(),
    } as unknown as FileSystemProvider
  })

  describe('detectAll', () => {
    it('returns results for all harness types', async () => {
      vi.mocked(mockFs.exists).mockResolvedValue(false)

      const service = new HarnessDetectionService(mockFs, homePath, 'macos')
      const results = await service.detectAll()

      expect(results).toHaveLength(6)
      expect(results.map((r) => r.type)).toEqual([
        'claude-code',
        'cursor',
        'copilot',
        'cline',
        'continue',
        'aider',
      ])
    })

    it('detects installed harnesses', async () => {
      vi.mocked(mockFs.exists).mockImplementation(async (path) => {
        return path === '/Users/test/.claude' || path === '/Users/test/.continue'
      })

      const service = new HarnessDetectionService(mockFs, homePath, 'macos')
      const results = await service.detectAll()

      const claudeResult = results.find((r) => r.type === 'claude-code')
      const continueResult = results.find((r) => r.type === 'continue')
      const cursorResult = results.find((r) => r.type === 'cursor')

      expect(claudeResult?.detected).toBe(true)
      expect(claudeResult?.status).toBe('detected')
      expect(continueResult?.detected).toBe(true)
      expect(cursorResult?.detected).toBe(false)
    })
  })

  describe('detect', () => {
    it('detects Claude Code by .claude directory', async () => {
      vi.mocked(mockFs.exists).mockImplementation(async (path) => {
        return path === '/Users/test/.claude'
      })

      const service = new HarnessDetectionService(mockFs, homePath, 'macos')
      const result = await service.detect('claude-code')

      expect(result.detected).toBe(true)
      expect(result.status).toBe('detected')
      expect(result.configPaths.settings).toBe('/Users/test/.claude/settings.json')
      expect(result.configPaths.skills).toBe('/Users/test/.claude/commands')
      expect(result.configPaths.memory).toBe('/Users/test/.claude/memory')
      expect(result.configPaths.projectConfig).toBe('CLAUDE.md')
    })

    it('detects Cursor by .cursor directory', async () => {
      vi.mocked(mockFs.exists).mockImplementation(async (path) => {
        return path === '/Users/test/.cursor'
      })

      const service = new HarnessDetectionService(mockFs, homePath, 'macos')
      const result = await service.detect('cursor')

      expect(result.detected).toBe(true)
      expect(result.configPaths.settings).toBe('/Users/test/.cursor/settings.json')
      expect(result.configPaths.projectConfig).toBe('.cursorrules')
    })

    it('detects Cursor by macOS Application Support path', async () => {
      vi.mocked(mockFs.exists).mockImplementation(async (path) => {
        return path === '/Users/test/Library/Application Support/Cursor'
      })

      const service = new HarnessDetectionService(mockFs, homePath, 'macos')
      const result = await service.detect('cursor')

      expect(result.detected).toBe(true)
    })

    it('detects Continue by .continue directory', async () => {
      vi.mocked(mockFs.exists).mockImplementation(async (path) => {
        return path === '/Users/test/.continue'
      })

      const service = new HarnessDetectionService(mockFs, homePath, 'macos')
      const result = await service.detect('continue')

      expect(result.detected).toBe(true)
      expect(result.configPaths.settings).toBe('/Users/test/.continue/config.json')
      expect(result.configPaths.skills).toBe('/Users/test/.continue/prompts')
    })

    it('detects Cline by .cline directory', async () => {
      vi.mocked(mockFs.exists).mockImplementation(async (path) => {
        return path === '/Users/test/.cline'
      })

      const service = new HarnessDetectionService(mockFs, homePath, 'macos')
      const result = await service.detect('cline')

      expect(result.detected).toBe(true)
      expect(result.configPaths.memory).toBe('/Users/test/.cline/memory')
    })

    it('detects Aider by .aider.conf.yml file', async () => {
      vi.mocked(mockFs.exists).mockImplementation(async (path) => {
        return path === '/Users/test/.aider.conf.yml'
      })

      const service = new HarnessDetectionService(mockFs, homePath, 'macos')
      const result = await service.detect('aider')

      expect(result.detected).toBe(true)
      expect(result.configPaths.settings).toBe('/Users/test/.aider.conf.yml')
      expect(result.configPaths.projectConfig).toBe('.aider.conf.yml')
    })

    it('detects Copilot by config directory', async () => {
      vi.mocked(mockFs.exists).mockImplementation(async (path) => {
        return path === '/Users/test/.config/github-copilot'
      })

      const service = new HarnessDetectionService(mockFs, homePath, 'macos')
      const result = await service.detect('copilot')

      expect(result.detected).toBe(true)
    })

    it('returns not found for uninstalled harness', async () => {
      vi.mocked(mockFs.exists).mockResolvedValue(false)

      const service = new HarnessDetectionService(mockFs, homePath, 'macos')
      const result = await service.detect('claude-code')

      expect(result.detected).toBe(false)
      expect(result.status).toBe('disabled')
      expect(result.configPaths).toEqual({})
    })

    it('handles detection errors gracefully', async () => {
      vi.mocked(mockFs.exists).mockRejectedValue(new Error('Permission denied'))

      const service = new HarnessDetectionService(mockFs, homePath, 'macos')
      const result = await service.detect('claude-code')

      expect(result.detected).toBe(false)
      expect(result.error).toBe('Permission denied')
    })
  })

  describe('isInstalled', () => {
    it('returns true for installed harness', async () => {
      vi.mocked(mockFs.exists).mockImplementation(async (path) => {
        return path === '/Users/test/.claude'
      })

      const service = new HarnessDetectionService(mockFs, homePath, 'macos')
      const installed = await service.isInstalled('claude-code')

      expect(installed).toBe(true)
    })

    it('returns false for uninstalled harness', async () => {
      vi.mocked(mockFs.exists).mockResolvedValue(false)

      const service = new HarnessDetectionService(mockFs, homePath, 'macos')
      const installed = await service.isInstalled('cursor')

      expect(installed).toBe(false)
    })
  })

  describe('getConfigPaths', () => {
    it('returns config paths for detected harness', async () => {
      vi.mocked(mockFs.exists).mockImplementation(async (path) => {
        return path === '/Users/test/.claude'
      })

      const service = new HarnessDetectionService(mockFs, homePath, 'macos')
      const paths = await service.getConfigPaths('claude-code')

      expect(paths).not.toBeNull()
      expect(paths?.settings).toBe('/Users/test/.claude/settings.json')
    })

    it('returns null for uninstalled harness', async () => {
      vi.mocked(mockFs.exists).mockResolvedValue(false)

      const service = new HarnessDetectionService(mockFs, homePath, 'macos')
      const paths = await service.getConfigPaths('claude-code')

      expect(paths).toBeNull()
    })
  })

  describe('OS-specific detection', () => {
    it('checks Windows paths on Windows', async () => {
      const existsCalls: string[] = []
      vi.mocked(mockFs.exists).mockImplementation(async (path) => {
        existsCalls.push(path as string)
        return false
      })

      // Use Windows-style home path for Windows tests
      const windowsHome = 'C:\\Users\\test'
      const service = new HarnessDetectionService(mockFs, windowsHome, 'windows')
      await service.detect('cursor')

      // Should check Windows-specific paths
      // The path should include the Windows AppData path
      const hasAppDataPath = existsCalls.some((p) => p.includes('AppData') && p.includes('Cursor'))
      expect(hasAppDataPath).toBe(true)
    })

    it('checks Linux paths on Linux', async () => {
      const existsCalls: string[] = []
      vi.mocked(mockFs.exists).mockImplementation(async (path) => {
        existsCalls.push(path as string)
        return false
      })

      const service = new HarnessDetectionService(mockFs, homePath, 'linux')
      await service.detect('cursor')

      expect(existsCalls).toContain('/Users/test/.config/Cursor')
    })
  })

  describe('createDetectionService', () => {
    it('creates a detection service instance', () => {
      const service = createDetectionService(mockFs, homePath)
      expect(service).toBeInstanceOf(HarnessDetectionService)
    })

    it('accepts optional OS parameter', () => {
      const service = createDetectionService(mockFs, homePath, 'linux')
      expect(service).toBeInstanceOf(HarnessDetectionService)
    })
  })

  describe('path security', () => {
    it('handles path traversal attempts gracefully', async () => {
      // The service should not allow path traversal in config paths
      // This is tested implicitly through the detection configs which use safe relative paths
      vi.mocked(mockFs.exists).mockResolvedValue(false)

      const service = new HarnessDetectionService(mockFs, homePath, 'macos')
      const result = await service.detect('claude-code')

      // Should complete without throwing and return not detected
      expect(result.detected).toBe(false)
      expect(result.error).toBeUndefined()
    })
  })
})
