/**
 * Tools Store
 * Manages tool registry state: list, selection, search, filters
 */

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { HarnessType, Tool, ToolSummary, ToolStatus, MCPServerSummary } from '@/types'

/** Detail panel tab */
export type ToolDetailTab = 'overview' | 'schema' | 'stats' | 'examples'

/** Tools store state */
interface ToolsState {
  /** List of tool summaries */
  tools: ToolSummary[]
  /** Currently selected tool (full entry) */
  selectedTool: Tool | null
  /** MCP server summaries */
  mcpServers: MCPServerSummary[]
  /** Whether loading is in progress */
  isLoading: boolean
  /** Search query */
  searchQuery: string
  /** Harness filter */
  filterHarness: HarnessType | null
  /** Status filter */
  filterStatus: ToolStatus | null
  /** MCP-only filter */
  filterMCPOnly: boolean
  /** Active detail tab */
  activeTab: ToolDetailTab
}

/** Tools store actions */
interface ToolsActions {
  setTools: (tools: ToolSummary[]) => void
  selectTool: (tool: Tool | null) => void
  setMCPServers: (servers: MCPServerSummary[]) => void
  setIsLoading: (isLoading: boolean) => void
  setSearchQuery: (query: string) => void
  setFilterHarness: (harness: HarnessType | null) => void
  setFilterStatus: (status: ToolStatus | null) => void
  setFilterMCPOnly: (mcpOnly: boolean) => void
  setActiveTab: (tab: ToolDetailTab) => void
  clearFilters: () => void
}

type ToolsStore = ToolsState & ToolsActions

const initialState: ToolsState = {
  tools: [],
  selectedTool: null,
  mcpServers: [],
  isLoading: false,
  searchQuery: '',
  filterHarness: null,
  filterStatus: null,
  filterMCPOnly: false,
  activeTab: 'overview' as ToolDetailTab,
}

export const useToolsStore = create<ToolsStore>()(
  devtools(
    (set) => ({
      ...initialState,

      setTools: (tools) => set({ tools }, false, 'setTools'),

      selectTool: (tool) => set({ selectedTool: tool, activeTab: 'overview' }, false, 'selectTool'),

      setMCPServers: (servers) => set({ mcpServers: servers }, false, 'setMCPServers'),

      setIsLoading: (isLoading) => set({ isLoading }, false, 'setIsLoading'),

      setSearchQuery: (query) => set({ searchQuery: query }, false, 'setSearchQuery'),

      setFilterHarness: (harness) => set({ filterHarness: harness }, false, 'setFilterHarness'),

      setFilterStatus: (status) => set({ filterStatus: status }, false, 'setFilterStatus'),

      setFilterMCPOnly: (mcpOnly) => set({ filterMCPOnly: mcpOnly }, false, 'setFilterMCPOnly'),

      setActiveTab: (tab) => set({ activeTab: tab }, false, 'setActiveTab'),

      clearFilters: () =>
        set(
          {
            searchQuery: '',
            filterHarness: null,
            filterStatus: null,
            filterMCPOnly: false,
          },
          false,
          'clearFilters'
        ),
    }),
    { name: 'ToolsStore' }
  )
)

/** Selector hooks */
export const useTools = () => useToolsStore((s) => s.tools)
export const useSelectedTool = () => useToolsStore((s) => s.selectedTool)
export const useMCPServers = () => useToolsStore((s) => s.mcpServers)
export const useIsToolsLoading = () => useToolsStore((s) => s.isLoading)
export const useActiveToolTab = () => useToolsStore((s) => s.activeTab)
