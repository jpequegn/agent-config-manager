/**
 * ToolsPage Component
 * Main page for the tool registry with card grid, detail view, and MCP status
 */

import { useEffect } from 'react'
import { RefreshCw, Wrench, Server } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useToolsStore, useTools, useIsToolsLoading, useMCPServers } from '@/stores'
import { listTools, getTool, listMCPServers } from '@/services/tools'
import { ToolGrid } from './ToolGrid'
import { ToolDetail } from './ToolDetail'
import type { MCPServerStatus, MCPServerSummary } from '@/types'

/** MCP status dot colors */
const MCP_STATUS_DOT: Record<MCPServerStatus, string> = {
  connected: 'bg-green-500',
  disconnected: 'bg-gray-500',
  connecting: 'bg-amber-500 animate-pulse',
  error: 'bg-red-500',
}

export function ToolsPage() {
  const tools = useTools()
  const isLoading = useIsToolsLoading()
  const mcpServers = useMCPServers()
  const setTools = useToolsStore((s) => s.setTools)
  const setIsLoading = useToolsStore((s) => s.setIsLoading)
  const setMCPServers = useToolsStore((s) => s.setMCPServers)
  const selectTool = useToolsStore((s) => s.selectTool)
  const searchQuery = useToolsStore((s) => s.searchQuery)
  const filterHarness = useToolsStore((s) => s.filterHarness)
  const filterStatus = useToolsStore((s) => s.filterStatus)
  const filterMCPOnly = useToolsStore((s) => s.filterMCPOnly)

  /** Load tools with current filters */
  async function handleLoad() {
    setIsLoading(true)
    try {
      const [toolResults, serverResults] = await Promise.all([
        listTools({
          harness: filterHarness ?? undefined,
          status: filterStatus ?? undefined,
          searchText: searchQuery || undefined,
          mcpOnly: filterMCPOnly || undefined,
        }),
        listMCPServers(),
      ])
      setTools(toolResults)
      setMCPServers(serverResults)
    } finally {
      setIsLoading(false)
    }
  }

  /** Select a tool by ID */
  async function handleSelectTool(toolId: string) {
    const tool = await getTool(toolId)
    selectTool(tool)
  }

  // Auto-load on mount and when filters change
  useEffect(() => {
    handleLoad()
  }, [searchQuery, filterHarness, filterStatus, filterMCPOnly]) // eslint-disable-line react-hooks/exhaustive-deps

  const availableCount = tools.filter((t) => t.status === 'available').length

  return (
    <div className="flex h-full flex-col">
      {/* Page header */}
      <div className="flex items-center justify-between border-b px-6 py-4">
        <div className="flex items-center gap-3">
          <Wrench className="h-5 w-5 text-primary" aria-hidden="true" />
          <div>
            <h1 className="text-lg font-semibold">Tools</h1>
            <p className="text-sm text-muted-foreground">Browse tools and MCP servers</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground" role="status" aria-live="polite">
            {availableCount} available / {tools.length} total
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLoad}
            disabled={isLoading}
            aria-label={isLoading ? 'Loading tools' : 'Refresh tools'}
            className="gap-2"
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
              aria-hidden="true"
            />
            {isLoading ? 'Loading...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* MCP Status Bar */}
      {mcpServers.length > 0 && (
        <div className="flex items-center gap-4 border-b bg-muted/30 px-6 py-2">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Server className="h-3.5 w-3.5" aria-hidden="true" />
            MCP Servers
          </div>
          <div
            className="flex flex-wrap items-center gap-3"
            role="list"
            aria-label="MCP server statuses"
          >
            {mcpServers.map((server) => (
              <MCPStatusBadge key={server.id} server={server} />
            ))}
          </div>
        </div>
      )}

      {/* Two-panel layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel - Tool grid */}
        <div className="w-[50%] shrink-0 border-r">
          <h2 className="sr-only">Tool List</h2>
          <ToolGrid onSelect={handleSelectTool} />
        </div>

        {/* Right panel - Tool detail */}
        <div className="flex-1">
          <h2 className="sr-only">Tool Details</h2>
          <ToolDetail />
        </div>
      </div>
    </div>
  )
}

/** MCP server status badge */
function MCPStatusBadge({ server }: { server: MCPServerSummary }) {
  return (
    <div role="listitem" className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <span className={cn('h-2 w-2 rounded-full', MCP_STATUS_DOT[server.status])} />
      <span>{server.name}</span>
      <span className="text-[10px]">({server.toolCount})</span>
    </div>
  )
}
