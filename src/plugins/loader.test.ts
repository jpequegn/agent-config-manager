/**
 * Plugin Loader Tests
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { PluginLoader, validateManifest, validateModule } from './loader'
import type { PluginManifest, PluginModule } from './types'
import type { HarnessAdapter } from '@/adapters'

describe('validateManifest', () => {
  const validManifest: PluginManifest = {
    id: 'test-plugin',
    name: 'Test Plugin',
    version: '1.0.0',
    description: 'A test plugin',
    harnessType: 'claude-code',
    main: './index.ts',
  }

  it('should validate a correct manifest', () => {
    expect(validateManifest(validManifest)).toBe(true)
  })

  it('should reject null/undefined', () => {
    expect(validateManifest(null)).toBe(false)
    expect(validateManifest(undefined)).toBe(false)
  })

  it('should reject non-objects', () => {
    expect(validateManifest('string')).toBe(false)
    expect(validateManifest(123)).toBe(false)
    expect(validateManifest([])).toBe(false)
  })

  it('should reject missing id', () => {
    const { id: _id, ...noId } = validManifest
    expect(validateManifest(noId)).toBe(false)
  })

  it('should reject empty id', () => {
    expect(validateManifest({ ...validManifest, id: '' })).toBe(false)
  })

  it('should reject missing name', () => {
    const { name: _name, ...noName } = validManifest
    expect(validateManifest(noName)).toBe(false)
  })

  it('should reject missing version', () => {
    const { version: _version, ...noVersion } = validManifest
    expect(validateManifest(noVersion)).toBe(false)
  })

  it('should reject missing harnessType', () => {
    const { harnessType: _harnessType, ...noType } = validManifest
    expect(validateManifest(noType)).toBe(false)
  })

  it('should reject missing main', () => {
    const { main: _main, ...noMain } = validManifest
    expect(validateManifest(noMain)).toBe(false)
  })
})

describe('validateModule', () => {
  const validManifest: PluginManifest = {
    id: 'test-plugin',
    name: 'Test Plugin',
    version: '1.0.0',
    description: 'A test plugin',
    harnessType: 'claude-code',
    main: './index.ts',
  }

  const createAdapter = (() => ({
    type: 'claude-code',
    displayName: 'Test',
    detect: () => Promise.resolve({ type: 'claude-code', detected: true, status: 'active' }),
  })) as unknown as () => HarnessAdapter

  const validModule: PluginModule = {
    manifest: validManifest,
    createAdapter,
  }

  it('should validate a correct module', () => {
    expect(validateModule(validModule)).toBe(true)
  })

  it('should reject null/undefined', () => {
    expect(validateModule(null)).toBe(false)
    expect(validateModule(undefined)).toBe(false)
  })

  it('should reject missing manifest', () => {
    expect(validateModule({ createAdapter })).toBe(false)
  })

  it('should reject missing createAdapter', () => {
    expect(validateModule({ manifest: validManifest })).toBe(false)
  })

  it('should reject non-function createAdapter', () => {
    expect(validateModule({ manifest: validManifest, createAdapter: 'not-a-function' })).toBe(false)
  })

  it('should accept optional hooks as functions', () => {
    const withHooks = {
      ...validModule,
      onLoad: async () => {},
      onUnload: async () => {},
      onEnable: async () => {},
      onDisable: async () => {},
    }
    expect(validateModule(withHooks)).toBe(true)
  })

  it('should reject non-function hooks', () => {
    expect(validateModule({ ...validModule, onLoad: 'not-a-function' })).toBe(false)
    expect(validateModule({ ...validModule, onUnload: 123 })).toBe(false)
  })
})

describe('PluginLoader', () => {
  let loader: PluginLoader

  const validManifest: PluginManifest = {
    id: 'test-plugin',
    name: 'Test Plugin',
    version: '1.0.0',
    description: 'A test plugin',
    harnessType: 'claude-code',
    main: './index.ts',
  }

  const createAdapter = (() => ({
    type: 'claude-code',
    displayName: 'Test',
  })) as unknown as () => HarnessAdapter

  const validModule: PluginModule = {
    manifest: validManifest,
    createAdapter,
  }

  beforeEach(() => {
    loader = new PluginLoader()
  })

  describe('register', () => {
    it('should register a valid module', () => {
      const result = loader.register('test-source', validModule)
      expect(result.success).toBe(true)
      expect(result.module).toBe(validModule)
      expect(result.manifest).toBe(validManifest)
    })

    it('should reject invalid modules', () => {
      const result = loader.register('test-source', {} as PluginModule)
      expect(result.success).toBe(false)
      expect(result.error).toContain('Invalid plugin module')
    })

    it('should make module retrievable after registration', () => {
      loader.register('test-source', validModule)
      expect(loader.getModule('test-source')).toBe(validModule)
    })
  })

  describe('getModule', () => {
    it('should return undefined for unregistered source', () => {
      expect(loader.getModule('unknown')).toBeUndefined()
    })

    it('should return registered module', () => {
      loader.register('test-source', validModule)
      expect(loader.getModule('test-source')).toBe(validModule)
    })
  })

  describe('isLoaded', () => {
    it('should return false for unregistered source', () => {
      expect(loader.isLoaded('unknown')).toBe(false)
    })

    it('should return true for registered source', () => {
      loader.register('test-source', validModule)
      expect(loader.isLoaded('test-source')).toBe(true)
    })
  })

  describe('unload', () => {
    it('should return false for unregistered source', () => {
      expect(loader.unload('unknown')).toBe(false)
    })

    it('should unload registered module', () => {
      loader.register('test-source', validModule)
      expect(loader.unload('test-source')).toBe(true)
      expect(loader.isLoaded('test-source')).toBe(false)
    })
  })

  describe('getAllModules', () => {
    it('should return empty map when no modules', () => {
      expect(loader.getAllModules().size).toBe(0)
    })

    it('should return all registered modules', () => {
      loader.register('source1', validModule)
      loader.register('source2', validModule)
      const all = loader.getAllModules()
      expect(all.size).toBe(2)
      expect(all.has('source1')).toBe(true)
      expect(all.has('source2')).toBe(true)
    })
  })

  describe('clear', () => {
    it('should remove all modules', () => {
      loader.register('source1', validModule)
      loader.register('source2', validModule)
      loader.clear()
      expect(loader.getAllModules().size).toBe(0)
    })
  })

  describe('load', () => {
    it('should return cached module if already loaded', async () => {
      loader.register('test-source', validModule)
      const result = await loader.load('test-source')
      expect(result.success).toBe(true)
      expect(result.module).toBe(validModule)
    })

    it('should detect local paths', async () => {
      const result = await loader.load('/path/to/plugin')
      expect(result.success).toBe(false)
      expect(result.error).toContain('Local plugin loading not yet implemented')
    })

    it('should detect relative paths', async () => {
      const result = await loader.load('./path/to/plugin')
      expect(result.success).toBe(false)
      expect(result.error).toContain('Local plugin loading not yet implemented')
    })

    it('should treat non-path strings as npm packages', async () => {
      const result = await loader.load('some-npm-package')
      expect(result.success).toBe(false)
      expect(result.error).toContain('npm package loading not yet implemented')
    })
  })
})
