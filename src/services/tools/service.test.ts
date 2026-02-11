/**
 * Tools Service Tests
 */

import { describe, it, expect } from 'vitest'
import { listTools, getTool, listMCPServers, getToolListStats } from './service'

describe('ToolsService', () => {
  describe('listTools', () => {
    it('should return a list of tool summaries', async () => {
      const tools = await listTools()
      expect(tools.length).toBeGreaterThan(0)
    })

    it('should include required fields on each summary', async () => {
      const tools = await listTools()
      for (const tool of tools) {
        expect(tool.id).toBeTruthy()
        expect(tool.name).toBeTruthy()
        expect(tool.harness).toBeTruthy()
        expect(tool.description).toBeTruthy()
        expect(tool.status).toBeTruthy()
        expect(typeof tool.callCount).toBe('number')
        expect(typeof tool.isMCP).toBe('boolean')
      }
    })

    it('should filter by harness', async () => {
      const ccTools = await listTools({ harness: 'claude-code' })
      expect(ccTools.length).toBeGreaterThan(0)
      for (const t of ccTools) {
        expect(t.harness).toBe('claude-code')
      }
    })

    it('should filter by status', async () => {
      const deprecated = await listTools({ status: 'deprecated' })
      expect(deprecated.length).toBeGreaterThan(0)
      for (const t of deprecated) {
        expect(t.status).toBe('deprecated')
      }
    })

    it('should filter by search text', async () => {
      const results = await listTools({ searchText: 'bash' })
      expect(results.length).toBeGreaterThan(0)
    })

    it('should filter MCP-only tools', async () => {
      const mcpTools = await listTools({ mcpOnly: true })
      expect(mcpTools.length).toBeGreaterThan(0)
      for (const t of mcpTools) {
        expect(t.isMCP).toBe(true)
      }
    })

    it('should return empty for non-matching search', async () => {
      const results = await listTools({ searchText: 'xyznonexistent123' })
      expect(results).toEqual([])
    })

    it('should combine filters', async () => {
      const results = await listTools({
        harness: 'claude-code',
        mcpOnly: true,
      })
      expect(results.length).toBeGreaterThan(0)
      for (const t of results) {
        expect(t.harness).toBe('claude-code')
        expect(t.isMCP).toBe(true)
      }
    })
  })

  describe('getTool', () => {
    it('should return full tool by ID', async () => {
      const tool = await getTool('tool-cc-bash')
      expect(tool).not.toBeNull()
      expect(tool!.id).toBe('tool-cc-bash')
      expect(tool!.name).toBe('Bash')
      expect(tool!.parameters.length).toBeGreaterThan(0)
      expect(tool!.stats).toBeDefined()
    })

    it('should return null for unknown ID', async () => {
      const tool = await getTool('nonexistent')
      expect(tool).toBeNull()
    })
  })

  describe('listMCPServers', () => {
    it('should return MCP server summaries', async () => {
      const servers = await listMCPServers()
      expect(servers.length).toBeGreaterThan(0)
      for (const s of servers) {
        expect(s.id).toBeTruthy()
        expect(s.name).toBeTruthy()
        expect(s.status).toBeTruthy()
        expect(typeof s.toolCount).toBe('number')
        expect(typeof s.enabled).toBe('boolean')
      }
    })

    it('should include servers with different statuses', async () => {
      const servers = await listMCPServers()
      const statuses = new Set(servers.map((s) => s.status))
      expect(statuses.size).toBeGreaterThan(1)
    })
  })

  describe('getToolListStats', () => {
    it('should return aggregate statistics', async () => {
      const stats = await getToolListStats()
      expect(stats.totalTools).toBeGreaterThan(0)
      expect(stats.availableTools).toBeGreaterThan(0)
      expect(stats.byHarness.length).toBeGreaterThan(0)
    })

    it('should have harness breakdown that sums to total', async () => {
      const stats = await getToolListStats()
      const harnessTotal = stats.byHarness.reduce((sum, h) => sum + h.count, 0)
      expect(harnessTotal).toBe(stats.totalTools)
    })

    it('should have consistent MCP + built-in counts', async () => {
      const stats = await getToolListStats()
      expect(stats.mcpTools + stats.builtInTools).toBe(stats.totalTools)
    })
  })
})
