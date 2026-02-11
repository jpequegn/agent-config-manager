/**
 * Tools Store Tests
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { useToolsStore } from './tools-store'
import type { Tool, ToolSummary, MCPServerSummary } from '@/types'

const mockSummary: ToolSummary = {
  id: 'tool-test-001',
  name: 'TestTool',
  harness: 'claude-code',
  description: 'A test tool',
  status: 'available',
  callCount: 10,
  isMCP: false,
}

const mockTool: Tool = {
  id: 'tool-test-001',
  name: 'TestTool',
  harness: 'claude-code',
  description: 'A test tool',
  parameters: [{ name: 'input', type: 'string', description: 'Input value', required: true }],
  status: 'available',
  stats: { callCount: 10, successCount: 9, errorCount: 1 },
  isBuiltIn: true,
}

const mockServer: MCPServerSummary = {
  id: 'mcp-test',
  name: 'TestServer',
  harness: 'claude-code',
  status: 'connected',
  toolCount: 3,
  enabled: true,
}

describe('ToolsStore', () => {
  beforeEach(() => {
    const store = useToolsStore.getState()
    store.setTools([])
    store.selectTool(null)
    store.setMCPServers([])
    store.setIsLoading(false)
    store.setSearchQuery('')
    store.setFilterHarness(null)
    store.setFilterStatus(null)
    store.setFilterMCPOnly(false)
    store.setActiveTab('overview')
  })

  it('should start with defaults after reset', () => {
    const state = useToolsStore.getState()
    expect(state.tools).toEqual([])
    expect(state.selectedTool).toBeNull()
    expect(state.mcpServers).toEqual([])
    expect(state.isLoading).toBe(false)
    expect(state.searchQuery).toBe('')
    expect(state.filterHarness).toBeNull()
    expect(state.filterStatus).toBeNull()
    expect(state.filterMCPOnly).toBe(false)
    expect(state.activeTab).toBe('overview')
  })

  it('should set tools list', () => {
    useToolsStore.getState().setTools([mockSummary])
    expect(useToolsStore.getState().tools).toEqual([mockSummary])
  })

  it('should select a tool', () => {
    useToolsStore.getState().selectTool(mockTool)
    expect(useToolsStore.getState().selectedTool).toEqual(mockTool)
  })

  it('should reset tab when selecting a new tool', () => {
    useToolsStore.getState().setActiveTab('stats')
    useToolsStore.getState().selectTool(mockTool)
    expect(useToolsStore.getState().activeTab).toBe('overview')
  })

  it('should clear selected tool', () => {
    useToolsStore.getState().selectTool(mockTool)
    useToolsStore.getState().selectTool(null)
    expect(useToolsStore.getState().selectedTool).toBeNull()
  })

  it('should set MCP servers', () => {
    useToolsStore.getState().setMCPServers([mockServer])
    expect(useToolsStore.getState().mcpServers).toEqual([mockServer])
  })

  it('should set loading state', () => {
    useToolsStore.getState().setIsLoading(true)
    expect(useToolsStore.getState().isLoading).toBe(true)
  })

  it('should set search query', () => {
    useToolsStore.getState().setSearchQuery('test')
    expect(useToolsStore.getState().searchQuery).toBe('test')
  })

  it('should set active tab', () => {
    useToolsStore.getState().setActiveTab('schema')
    expect(useToolsStore.getState().activeTab).toBe('schema')
  })

  it('should set MCP-only filter', () => {
    useToolsStore.getState().setFilterMCPOnly(true)
    expect(useToolsStore.getState().filterMCPOnly).toBe(true)
  })

  it('should clear all filters', () => {
    useToolsStore.getState().setSearchQuery('test')
    useToolsStore.getState().setFilterHarness('cursor')
    useToolsStore.getState().setFilterStatus('available')
    useToolsStore.getState().setFilterMCPOnly(true)
    useToolsStore.getState().clearFilters()
    const state = useToolsStore.getState()
    expect(state.searchQuery).toBe('')
    expect(state.filterHarness).toBeNull()
    expect(state.filterStatus).toBeNull()
    expect(state.filterMCPOnly).toBe(false)
  })
})
