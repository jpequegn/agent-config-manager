/**
 * Plugin Manager Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { PluginManager } from './manager'
import { pluginLoader } from './loader'
import { adapterRegistry } from '@/adapters'
import type { HarnessAdapter } from '@/adapters'
import type { PluginModule, PluginManifest, PluginEvent } from './types'

describe('PluginManager', () => {
  let manager: PluginManager

  const validManifest: PluginManifest = {
    id: 'test-plugin',
    name: 'Test Plugin',
    version: '1.0.0',
    description: 'A test plugin',
    harnessType: 'claude-code',
    main: './index.ts',
  }

  // Mock adapter factory - casts to HarnessAdapter for testing
  const createMockAdapter = (() => ({
    type: 'claude-code' as const,
    displayName: 'Test',
    detect: () =>
      Promise.resolve({
        type: 'claude-code' as const,
        detected: true,
        status: 'active' as const,
        configPaths: {},
      }),
    getConfig: () => Promise.resolve({} as never),
    listSkills: () => Promise.resolve([]),
    getSkill: () => Promise.resolve(null),
    createSkill: () => Promise.resolve({} as never),
    updateSkill: () => Promise.resolve({} as never),
    deleteSkill: () => Promise.resolve(),
    setSkillStatus: () => Promise.resolve(),
    listHooks: () => Promise.resolve([]),
    getHook: () => Promise.resolve(null),
    createHook: () => Promise.resolve({} as never),
    updateHook: () => Promise.resolve({} as never),
    deleteHook: () => Promise.resolve(),
    setHookStatus: () => Promise.resolve(),
    testHook: () => Promise.resolve({ success: true }),
    listSessions: () => Promise.resolve([]),
    getSession: () => Promise.resolve(null),
    deleteSession: () => Promise.resolve(),
    exportSession: () => Promise.resolve(''),
    getMemoryStats: () => Promise.resolve({} as never),
    listMemoryEntries: () => Promise.resolve([]),
    getMemoryEntry: () => Promise.resolve(null),
    deleteMemoryEntry: () => Promise.resolve(),
    pruneMemory: () => Promise.resolve({} as never),
    getSettings: () => Promise.resolve({} as never),
    getSetting: () => Promise.resolve(null),
    setSetting: () => Promise.resolve(),
    resetSetting: () => Promise.resolve(),
    resetAllSettings: () => Promise.resolve(),
    listTools: () => Promise.resolve([]),
    getTool: () => Promise.resolve(null),
    listMCPServers: () => Promise.resolve([]),
    getMCPServer: () => Promise.resolve(null),
    addMCPServer: () => Promise.resolve({} as never),
    updateMCPServer: () => Promise.resolve({} as never),
    removeMCPServer: () => Promise.resolve(),
    setMCPServerStatus: () => Promise.resolve(),
    testMCPServer: () => Promise.resolve({ connected: true }),
  })) as unknown as () => HarnessAdapter

  const createValidModule = (overrides: Partial<PluginModule> = {}): PluginModule => ({
    manifest: validManifest,
    createAdapter: createMockAdapter,
    ...overrides,
  })

  beforeEach(() => {
    manager = new PluginManager()
    pluginLoader.clear()
    adapterRegistry.clear()
  })

  describe('installFromModule', () => {
    it('should install a valid module', () => {
      const module = createValidModule()
      const result = manager.installFromModule(module)

      expect(result.success).toBe(true)
      expect(result.plugin).toBeDefined()
      expect(result.plugin!.manifest.id).toBe('test-plugin')
      expect(result.plugin!.status).toBe('installed')
    })

    it('should reject invalid modules', () => {
      const result = manager.installFromModule({} as PluginModule)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Invalid plugin module')
    })

    it('should emit installed event', () => {
      const module = createValidModule()
      const events: PluginEvent[] = []
      manager.addEventListener((e) => events.push(e))

      manager.installFromModule(module)

      expect(events).toHaveLength(1)
      expect(events[0].type).toBe('installed')
      expect(events[0].pluginId).toBe('test-plugin')
    })
  })

  describe('load', () => {
    it('should load an installed plugin', async () => {
      const onLoad = vi.fn().mockResolvedValue(undefined)
      const module = createValidModule({ onLoad })
      manager.installFromModule(module)

      const result = await manager.load('test-plugin')

      expect(result).toBe(true)
      expect(onLoad).toHaveBeenCalled()
      expect(manager.get('test-plugin')!.status).toBe('loaded')
    })

    it('should return false for non-existent plugin', async () => {
      const result = await manager.load('non-existent')
      expect(result).toBe(false)
    })

    it('should return true if already loaded', async () => {
      const module = createValidModule()
      manager.installFromModule(module)
      await manager.load('test-plugin')

      const result = await manager.load('test-plugin')
      expect(result).toBe(true)
    })

    it('should handle load errors', async () => {
      const onLoad = vi.fn().mockRejectedValue(new Error('Load failed'))
      const module = createValidModule({ onLoad })
      manager.installFromModule(module)

      const result = await manager.load('test-plugin')

      expect(result).toBe(false)
      expect(manager.get('test-plugin')!.status).toBe('error')
      expect(manager.get('test-plugin')!.error).toBe('Load failed')
    })
  })

  describe('enable', () => {
    it('should enable a loaded plugin', async () => {
      const onEnable = vi.fn().mockResolvedValue(undefined)
      const module = createValidModule({ onEnable })
      manager.installFromModule(module)
      await manager.load('test-plugin')

      const result = await manager.enable('test-plugin')

      expect(result).toBe(true)
      expect(onEnable).toHaveBeenCalled()
      expect(manager.get('test-plugin')!.status).toBe('enabled')
    })

    it('should auto-load when enabling unloaded plugin', async () => {
      const module = createValidModule()
      manager.installFromModule(module)

      const result = await manager.enable('test-plugin')

      expect(result).toBe(true)
      expect(manager.get('test-plugin')!.status).toBe('enabled')
    })

    it('should register adapter with registry', async () => {
      const module = createValidModule()
      manager.installFromModule(module)

      await manager.enable('test-plugin')

      expect(adapterRegistry.has('claude-code')).toBe(true)
    })

    it('should return true if already enabled', async () => {
      const module = createValidModule()
      manager.installFromModule(module)
      await manager.enable('test-plugin')

      const result = await manager.enable('test-plugin')
      expect(result).toBe(true)
    })
  })

  describe('disable', () => {
    it('should disable an enabled plugin', async () => {
      const onDisable = vi.fn().mockResolvedValue(undefined)
      const module = createValidModule({ onDisable })
      manager.installFromModule(module)
      await manager.enable('test-plugin')

      const result = await manager.disable('test-plugin')

      expect(result).toBe(true)
      expect(onDisable).toHaveBeenCalled()
      expect(manager.get('test-plugin')!.status).toBe('disabled')
    })

    it('should unregister adapter from registry', async () => {
      const module = createValidModule()
      manager.installFromModule(module)
      await manager.enable('test-plugin')

      await manager.disable('test-plugin')

      expect(adapterRegistry.has('claude-code')).toBe(false)
    })

    it('should return true if not enabled', async () => {
      const module = createValidModule()
      manager.installFromModule(module)

      const result = await manager.disable('test-plugin')
      expect(result).toBe(true)
    })
  })

  describe('uninstall', () => {
    it('should uninstall a plugin', async () => {
      const onUnload = vi.fn().mockResolvedValue(undefined)
      const module = createValidModule({ onUnload })
      manager.installFromModule(module)

      const result = await manager.uninstall('test-plugin')

      expect(result).toBe(true)
      expect(onUnload).toHaveBeenCalled()
      expect(manager.isInstalled('test-plugin')).toBe(false)
    })

    it('should disable before uninstalling if enabled', async () => {
      const module = createValidModule()
      manager.installFromModule(module)
      await manager.enable('test-plugin')

      await manager.uninstall('test-plugin')

      expect(adapterRegistry.has('claude-code')).toBe(false)
    })

    it('should return false for non-existent plugin', async () => {
      const result = await manager.uninstall('non-existent')
      expect(result).toBe(false)
    })

    it('should emit uninstalled event', async () => {
      const module = createValidModule()
      manager.installFromModule(module)
      const events: PluginEvent[] = []
      manager.addEventListener((e) => events.push(e))

      await manager.uninstall('test-plugin')

      expect(events.some((e) => e.type === 'uninstalled')).toBe(true)
    })
  })

  describe('get/getAll', () => {
    it('should return undefined for non-existent plugin', () => {
      expect(manager.get('non-existent')).toBeUndefined()
    })

    it('should return installed plugin', () => {
      const module = createValidModule()
      manager.installFromModule(module)

      const plugin = manager.get('test-plugin')
      expect(plugin).toBeDefined()
      expect(plugin!.manifest.id).toBe('test-plugin')
    })

    it('should return all plugins', () => {
      const module1 = createValidModule()
      const module2 = createValidModule({
        manifest: { ...validManifest, id: 'test-plugin-2' },
      })
      manager.installFromModule(module1)
      manager.installFromModule(module2)

      const all = manager.getAll()
      expect(all).toHaveLength(2)
    })
  })

  describe('getByStatus/getEnabled', () => {
    it('should filter by status', async () => {
      const module1 = createValidModule()
      const module2 = createValidModule({
        manifest: { ...validManifest, id: 'test-plugin-2' },
      })
      manager.installFromModule(module1)
      manager.installFromModule(module2)
      await manager.enable('test-plugin')

      const enabled = manager.getByStatus('enabled')
      expect(enabled).toHaveLength(1)
      expect(enabled[0].manifest.id).toBe('test-plugin')
    })

    it('should get enabled plugins', async () => {
      const module = createValidModule()
      manager.installFromModule(module)
      await manager.enable('test-plugin')

      const enabled = manager.getEnabled()
      expect(enabled).toHaveLength(1)
    })
  })

  describe('isInstalled/isEnabled', () => {
    it('should check installation status', () => {
      expect(manager.isInstalled('test-plugin')).toBe(false)

      const module = createValidModule()
      manager.installFromModule(module)

      expect(manager.isInstalled('test-plugin')).toBe(true)
    })

    it('should check enabled status', async () => {
      const module = createValidModule()
      manager.installFromModule(module)

      expect(manager.isEnabled('test-plugin')).toBe(false)

      await manager.enable('test-plugin')

      expect(manager.isEnabled('test-plugin')).toBe(true)
    })
  })

  describe('config', () => {
    it('should get and set config', () => {
      const module = createValidModule()
      manager.installFromModule(module)

      manager.setConfig('test-plugin', { enabled: true, settings: { foo: 'bar' } })

      const config = manager.getConfig('test-plugin')
      expect(config).toBeDefined()
      expect(config!.enabled).toBe(true)
      expect(config!.settings).toEqual({ foo: 'bar' })
    })

    it('should return undefined for non-existent config', () => {
      expect(manager.getConfig('non-existent')).toBeUndefined()
    })
  })

  describe('events', () => {
    it('should add and remove event listeners', () => {
      const listener = vi.fn()
      manager.addEventListener(listener)

      const module = createValidModule()
      manager.installFromModule(module)

      expect(listener).toHaveBeenCalled()

      manager.removeEventListener(listener)
      manager.installFromModule(
        createValidModule({
          manifest: { ...validManifest, id: 'test-plugin-2' },
        })
      )

      // Should only have been called once (for first install)
      expect(listener).toHaveBeenCalledTimes(1)
    })

    it('should handle listener errors gracefully', () => {
      const badListener = vi.fn().mockImplementation(() => {
        throw new Error('Listener error')
      })
      const goodListener = vi.fn()

      manager.addEventListener(badListener)
      manager.addEventListener(goodListener)

      const module = createValidModule()
      manager.installFromModule(module)

      // Both should be called despite error
      expect(badListener).toHaveBeenCalled()
      expect(goodListener).toHaveBeenCalled()
    })
  })

  describe('clear', () => {
    it('should clear all plugins', () => {
      const module = createValidModule()
      manager.installFromModule(module)
      manager.setConfig('test-plugin', { enabled: true })

      manager.clear()

      expect(manager.getAll()).toHaveLength(0)
      expect(manager.getConfig('test-plugin')).toBeUndefined()
    })
  })
})
