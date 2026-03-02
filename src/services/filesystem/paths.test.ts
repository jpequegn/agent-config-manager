/**
 * Path Utilities Tests
 */

import { describe, it, expect, vi, afterEach } from 'vitest'
import {
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
  type OperatingSystem,
} from './paths'

describe('detectOS', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('detects macOS from platform', () => {
    vi.spyOn(navigator, 'platform', 'get').mockReturnValue('MacIntel')
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue('Chrome')
    expect(detectOS()).toBe('macos')
  })

  it('detects macOS from userAgent', () => {
    vi.spyOn(navigator, 'platform', 'get').mockReturnValue('')
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue('Mozilla/5.0 (Macintosh)')
    expect(detectOS()).toBe('macos')
  })

  it('detects Windows from platform', () => {
    vi.spyOn(navigator, 'platform', 'get').mockReturnValue('Win32')
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue('Chrome')
    expect(detectOS()).toBe('windows')
  })

  it('detects Linux from platform', () => {
    vi.spyOn(navigator, 'platform', 'get').mockReturnValue('Linux x86_64')
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue('Chrome')
    expect(detectOS()).toBe('linux')
  })

  it('returns unknown for unrecognised platform', () => {
    vi.spyOn(navigator, 'platform', 'get').mockReturnValue('PlayStation')
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue('PlayStation')
    expect(detectOS()).toBe('unknown')
  })
})

describe('getPathSeparator', () => {
  it('returns / for macos', () => {
    expect(getPathSeparator('macos')).toBe('/')
  })

  it('returns / for linux', () => {
    expect(getPathSeparator('linux')).toBe('/')
  })

  it('returns \\ for windows', () => {
    expect(getPathSeparator('windows')).toBe('\\')
  })

  it('returns / for unknown', () => {
    expect(getPathSeparator('unknown')).toBe('/')
  })
})

describe('normalizePath (unix)', () => {
  const os: OperatingSystem = 'macos'

  it('returns path unchanged when already normalized', () => {
    expect(normalizePath('/home/user/file.txt', os)).toBe('/home/user/file.txt')
  })

  it('replaces backslashes with forward slashes', () => {
    expect(normalizePath('home\\user\\file.txt', os)).toBe('home/user/file.txt')
  })

  it('removes trailing slash', () => {
    expect(normalizePath('/home/user/', os)).toBe('/home/user')
  })

  it('collapses multiple slashes', () => {
    expect(normalizePath('/home//user///file.txt', os)).toBe('/home/user/file.txt')
  })

  it('leaves single / unchanged', () => {
    expect(normalizePath('/', os)).toBe('/')
  })
})

describe('normalizePath (windows)', () => {
  const os: OperatingSystem = 'windows'

  it('replaces forward slashes with backslashes', () => {
    expect(normalizePath('C:/Users/user', os)).toBe('C:\\Users\\user')
  })

  it('removes trailing backslash', () => {
    expect(normalizePath('C:\\Users\\user\\', os)).toBe('C:\\Users\\user')
  })
})

describe('joinPath', () => {
  it('joins unix paths', () => {
    vi.spyOn(navigator, 'platform', 'get').mockReturnValue('MacIntel')
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue('Mac')
    const result = joinPath('/home', 'user', 'file.txt')
    expect(result).toBe('/home/user/file.txt')
    vi.restoreAllMocks()
  })

  it('filters empty segments', () => {
    vi.spyOn(navigator, 'platform', 'get').mockReturnValue('MacIntel')
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue('Mac')
    const result = joinPath('/home', '', 'file.txt')
    expect(result).toBe('/home/file.txt')
    vi.restoreAllMocks()
  })

  it('removes leading slashes from non-first segments', () => {
    vi.spyOn(navigator, 'platform', 'get').mockReturnValue('MacIntel')
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue('Mac')
    const result = joinPath('/home', '/user', 'file.txt')
    expect(result).toBe('/home/user/file.txt')
    vi.restoreAllMocks()
  })
})

describe('dirname', () => {
  it('returns parent directory', () => {
    vi.spyOn(navigator, 'platform', 'get').mockReturnValue('MacIntel')
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue('Mac')
    expect(dirname('/home/user/file.txt')).toBe('/home/user')
    vi.restoreAllMocks()
  })

  it('returns / for root file', () => {
    vi.spyOn(navigator, 'platform', 'get').mockReturnValue('MacIntel')
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue('Mac')
    expect(dirname('/file.txt')).toBe('/')
    vi.restoreAllMocks()
  })

  it('returns . for no directory', () => {
    vi.spyOn(navigator, 'platform', 'get').mockReturnValue('MacIntel')
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue('Mac')
    expect(dirname('file.txt')).toBe('.')
    vi.restoreAllMocks()
  })
})

describe('basename', () => {
  it('returns the file name', () => {
    vi.spyOn(navigator, 'platform', 'get').mockReturnValue('MacIntel')
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue('Mac')
    expect(basename('/home/user/file.txt')).toBe('file.txt')
    vi.restoreAllMocks()
  })

  it('strips extension when provided', () => {
    vi.spyOn(navigator, 'platform', 'get').mockReturnValue('MacIntel')
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue('Mac')
    expect(basename('/home/user/file.txt', '.txt')).toBe('file')
    vi.restoreAllMocks()
  })

  it('returns the string when no separator found', () => {
    vi.spyOn(navigator, 'platform', 'get').mockReturnValue('MacIntel')
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue('Mac')
    expect(basename('file.txt')).toBe('file.txt')
    vi.restoreAllMocks()
  })
})

describe('extname', () => {
  it('returns the file extension', () => {
    expect(extname('file.txt')).toBe('.txt')
  })

  it('returns empty string for no extension', () => {
    expect(extname('file')).toBe('')
  })

  it('returns empty string for dotfiles', () => {
    expect(extname('.bashrc')).toBe('')
  })

  it('returns last extension for multiple dots', () => {
    expect(extname('archive.tar.gz')).toBe('.gz')
  })
})

describe('isAbsolute', () => {
  it('returns true for unix absolute paths', () => {
    expect(isAbsolute('/home/user', 'macos')).toBe(true)
  })

  it('returns false for unix relative paths', () => {
    expect(isAbsolute('home/user', 'macos')).toBe(false)
  })

  it('returns true for Windows drive paths', () => {
    expect(isAbsolute('C:\\Users\\user', 'windows')).toBe(true)
  })

  it('returns true for Windows UNC paths', () => {
    expect(isAbsolute('\\\\server\\share', 'windows')).toBe(true)
  })

  it('returns false for Windows relative paths', () => {
    expect(isAbsolute('Users\\user', 'windows')).toBe(false)
  })
})

describe('resolvePath', () => {
  it('joins relative path onto base', () => {
    vi.spyOn(navigator, 'platform', 'get').mockReturnValue('MacIntel')
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue('Mac')
    expect(resolvePath('/home/user', 'docs', 'file.txt')).toBe('/home/user/docs/file.txt')
    vi.restoreAllMocks()
  })

  it('replaces base with absolute path', () => {
    vi.spyOn(navigator, 'platform', 'get').mockReturnValue('MacIntel')
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue('Mac')
    expect(resolvePath('/home/user', '/etc/config')).toBe('/etc/config')
    vi.restoreAllMocks()
  })
})

describe('relativePath', () => {
  it('returns . for same path', () => {
    vi.spyOn(navigator, 'platform', 'get').mockReturnValue('MacIntel')
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue('Mac')
    expect(relativePath('/home/user', '/home/user')).toBe('.')
    vi.restoreAllMocks()
  })

  it('returns relative path to sibling', () => {
    vi.spyOn(navigator, 'platform', 'get').mockReturnValue('MacIntel')
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue('Mac')
    expect(relativePath('/home/user/a', '/home/user/b')).toBe('../b')
    vi.restoreAllMocks()
  })

  it('returns relative path to child', () => {
    vi.spyOn(navigator, 'platform', 'get').mockReturnValue('MacIntel')
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue('Mac')
    expect(relativePath('/home/user', '/home/user/docs')).toBe('docs')
    vi.restoreAllMocks()
  })
})

describe('getCommonPaths', () => {
  it('returns macOS paths', () => {
    const paths = getCommonPaths('macos')
    expect(paths.home).toBe('$HOME')
    expect(paths.config).toBe('$HOME/.config')
  })

  it('returns Linux paths', () => {
    const paths = getCommonPaths('linux')
    expect(paths.home).toBe('$HOME')
  })

  it('returns Windows paths', () => {
    const paths = getCommonPaths('windows')
    expect(paths.home).toBe('%USERPROFILE%')
    expect(paths.config).toBe('%APPDATA%')
  })

  it('returns fallback paths for unknown OS', () => {
    const paths = getCommonPaths('unknown')
    expect(paths.home).toBe('~')
  })
})

describe('getHarnessConfigLocations', () => {
  it('includes all six harnesses', () => {
    vi.spyOn(navigator, 'platform', 'get').mockReturnValue('MacIntel')
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue('Mac')
    const locs = getHarnessConfigLocations('macos')
    expect(locs.claudeCode).toBeDefined()
    expect(locs.cursor).toBeDefined()
    expect(locs.copilot).toBeDefined()
    expect(locs.cline).toBeDefined()
    expect(locs.continue).toBeDefined()
    expect(locs.aider).toBeDefined()
    vi.restoreAllMocks()
  })

  it('contains .claude in the Claude Code global path for macOS', () => {
    const locs = getHarnessConfigLocations('macos')
    expect(locs.claudeCode.global).toContain('.claude')
  })

  it('aider project config is .aider.conf.yml', () => {
    const locs = getHarnessConfigLocations('macos')
    expect(locs.aider.project).toBe('.aider.conf.yml')
  })
})
