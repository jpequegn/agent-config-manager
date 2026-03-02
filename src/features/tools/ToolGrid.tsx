/**
 * ToolGrid Component
 * Displays tools in a card grid with search and filtering
 */

import { useState, useEffect, useMemo, memo } from 'react'
import { Search, X, Server, Filter } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useTools, useToolsStore, useSelectedTool } from '@/stores'
import type { HarnessType, ToolStatus, ToolSummary } from '@/types'

/** Harness label colors */
const HARNESS_COLORS: Record<HarnessType, string> = {
  'claude-code': 'bg-orange-500/20 text-orange-400',
  cursor: 'bg-blue-500/20 text-blue-400',
  copilot: 'bg-purple-500/20 text-purple-400',
  cline: 'bg-green-500/20 text-green-400',
  continue: 'bg-teal-500/20 text-teal-400',
  aider: 'bg-amber-500/20 text-amber-400',
}

/** Status indicator colors */
const STATUS_DOT: Record<ToolStatus, string> = {
  available: 'bg-green-500',
  disabled: 'bg-gray-500',
  error: 'bg-red-500',
  deprecated: 'bg-amber-500',
}

interface ToolGridProps {
  onSelect: (toolId: string) => void
}

export function ToolGrid({ onSelect }: ToolGridProps) {
  const tools = useTools()
  const selectedTool = useSelectedTool()
  const searchQuery = useToolsStore((s) => s.searchQuery)
  const setSearchQuery = useToolsStore((s) => s.setSearchQuery)
  const filterHarness = useToolsStore((s) => s.filterHarness)
  const setFilterHarness = useToolsStore((s) => s.setFilterHarness)
  const filterMCPOnly = useToolsStore((s) => s.filterMCPOnly)
  const setFilterMCPOnly = useToolsStore((s) => s.setFilterMCPOnly)
  const clearFilters = useToolsStore((s) => s.clearFilters)

  // Debounced local search state
  const [localSearch, setLocalSearch] = useState(searchQuery)

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(localSearch)
    }, 300)
    return () => clearTimeout(timer)
  }, [localSearch, setSearchQuery])

  const hasFilters = searchQuery || filterHarness || filterMCPOnly

  // Get unique harnesses from tools (memoized to avoid recomputing on every render)
  const harnesses = useMemo(() => [...new Set(tools.map((t) => t.harness))], [tools])

  return (
    <div className="flex h-full flex-col overflow-auto">
      {/* Search and filters */}
      <div className="border-b px-4 py-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search tools..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="h-8 pl-8 text-xs"
          />
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {/* Harness filter badges */}
          {harnesses.map((h) => (
            <button
              key={h}
              onClick={() => setFilterHarness(filterHarness === h ? null : h)}
              className={cn(
                'rounded-full px-2 py-0.5 text-[10px] font-medium transition-opacity',
                HARNESS_COLORS[h],
                filterHarness && filterHarness !== h && 'opacity-40'
              )}
            >
              {h}
            </button>
          ))}

          {/* MCP filter */}
          <button
            onClick={() => setFilterMCPOnly(!filterMCPOnly)}
            className={cn(
              'flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium transition-opacity',
              filterMCPOnly ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
            )}
          >
            <Server className="h-2.5 w-2.5" />
            MCP
          </button>

          {hasFilters && (
            <button
              onClick={() => {
                clearFilters()
                setLocalSearch('')
              }}
              className="flex items-center gap-0.5 text-[10px] text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Tool cards grid */}
      <div className="flex-1 overflow-auto p-4">
        {tools.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground">
            <Filter className="h-8 w-8" />
            <p className="text-sm">No tools found</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {tools.map((tool) => (
              <ToolCard
                key={tool.id}
                tool={tool}
                isSelected={selectedTool?.id === tool.id}
                onClick={() => onSelect(tool.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/** Individual tool card - memoized to prevent re-render when other tools change */
const ToolCard = memo(function ToolCard({
  tool,
  isSelected,
  onClick,
}: {
  tool: ToolSummary
  isSelected: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col gap-2 rounded-lg border p-3 text-left transition-colors hover:bg-accent/50',
        isSelected && 'border-primary bg-accent/30'
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={cn('h-2 w-2 rounded-full', STATUS_DOT[tool.status])} />
          <span className="text-sm font-medium">{tool.name}</span>
        </div>
        {tool.isMCP && (
          <span className="flex items-center gap-0.5 rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-medium text-primary">
            <Server className="h-2.5 w-2.5" />
            MCP
          </span>
        )}
      </div>

      <p className="line-clamp-2 text-xs text-muted-foreground">{tool.description}</p>

      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
        <span
          className={cn('rounded-full px-1.5 py-0.5 font-medium', HARNESS_COLORS[tool.harness])}
        >
          {tool.harness}
        </span>
        <span>{tool.callCount} calls</span>
      </div>
    </button>
  )
})
