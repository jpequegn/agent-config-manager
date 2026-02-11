/**
 * ToolDetail Component
 * Shows full tool information with tabbed interface
 */

import {
  Wrench,
  Server,
  Activity,
  Clock,
  BarChart3,
  FileCode,
  BookOpen,
  Info,
  AlertTriangle,
} from 'lucide-react'
import { cn, formatRelativeTime } from '@/lib/utils'
import { useSelectedTool, useActiveToolTab, useToolsStore } from '@/stores'
import type { HarnessType, ToolStatus } from '@/types'
import type { ToolDetailTab } from '@/stores/tools-store'

/** Harness badge colors */
const HARNESS_COLORS: Record<HarnessType, string> = {
  'claude-code': 'bg-orange-500/20 text-orange-400',
  cursor: 'bg-blue-500/20 text-blue-400',
  copilot: 'bg-purple-500/20 text-purple-400',
  cline: 'bg-green-500/20 text-green-400',
  continue: 'bg-teal-500/20 text-teal-400',
  aider: 'bg-amber-500/20 text-amber-400',
}

/** Status badge styles */
const STATUS_STYLES: Record<ToolStatus, string> = {
  available: 'bg-green-500/20 text-green-400',
  disabled: 'bg-gray-500/20 text-gray-400',
  error: 'bg-red-500/20 text-red-400',
  deprecated: 'bg-amber-500/20 text-amber-400',
}

/** Tab configuration */
const TABS: { id: ToolDetailTab; label: string; icon: typeof Info }[] = [
  { id: 'overview', label: 'Overview', icon: Info },
  { id: 'schema', label: 'Schema', icon: FileCode },
  { id: 'stats', label: 'Stats', icon: BarChart3 },
  { id: 'examples', label: 'Examples', icon: BookOpen },
]

export function ToolDetail() {
  const tool = useSelectedTool()
  const activeTab = useActiveToolTab()
  const setActiveTab = useToolsStore((s) => s.setActiveTab)

  if (!tool) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
        <Wrench className="h-12 w-12" />
        <p className="text-sm">Select a tool to view its details</p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col overflow-auto">
      {/* Header */}
      <div className="border-b px-6 py-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold leading-snug">{tool.name}</h2>
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-[10px] font-medium',
              STATUS_STYLES[tool.status]
            )}
          >
            {tool.status}
          </span>
          {!tool.isBuiltIn && (
            <span className="flex items-center gap-0.5 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
              <Server className="h-2.5 w-2.5" aria-hidden="true" />
              MCP
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{tool.description}</p>

        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-[10px] font-medium',
              HARNESS_COLORS[tool.harness]
            )}
          >
            {tool.harness}
          </span>
          {tool.category && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px]">{tool.category}</span>
          )}
          {tool.mcpServer && (
            <span className="flex items-center gap-1">
              <Server className="h-3 w-3" />
              {tool.mcpServer}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Activity className="h-3 w-3" />
            {tool.stats.callCount} calls
          </span>
          {tool.stats.lastUsed && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Last used {formatRelativeTime(tool.stats.lastUsed)}
            </span>
          )}
          <span>{tool.parameters.length} parameters</span>
        </div>

        {tool.status === 'deprecated' && (
          <div className="mt-3 flex items-start gap-2 rounded-md bg-amber-500/10 px-3 py-2 text-xs text-amber-400">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            This tool is deprecated and may be removed in a future version.
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b px-6" role="tablist" aria-label="Tool detail tabs">
        <div className="flex gap-0">
          {TABS.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`tabpanel-tool-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-xs font-medium transition-colors',
                  activeTab === tab.id
                    ? 'border-primary text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'overview' && (
          <div id="tabpanel-tool-overview" role="tabpanel" className="p-6">
            <h3 className="mb-3 text-sm font-medium">Parameters</h3>
            {tool.parameters.length > 0 ? (
              <div className="space-y-2">
                {tool.parameters.map((param) => (
                  <div key={param.name} className="rounded-md border px-4 py-3">
                    <div className="flex items-center gap-2">
                      <code className="text-xs font-semibold">{param.name}</code>
                      <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                        {param.type}
                      </span>
                      {param.required && (
                        <span className="text-[10px] font-medium text-red-400">required</span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{param.description}</p>
                    {param.defaultValue != null && (
                      <p className="mt-0.5 text-[10px] text-muted-foreground">
                        Default: <code>{JSON.stringify(param.defaultValue)}</code>
                      </p>
                    )}
                    {param.enum && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {param.enum.map((v) => (
                          <span
                            key={v}
                            className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]"
                          >
                            {v}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No parameters defined</p>
            )}

            {tool.returnType && (
              <div className="mt-4">
                <h3 className="mb-1 text-sm font-medium">Return Type</h3>
                <code className="text-xs text-muted-foreground">{tool.returnType}</code>
              </div>
            )}
          </div>
        )}

        {activeTab === 'schema' && (
          <div id="tabpanel-tool-schema" role="tabpanel" className="p-6">
            <pre className="overflow-auto rounded-md bg-muted p-4 font-mono text-xs leading-relaxed text-foreground">
              {JSON.stringify(
                {
                  name: tool.name,
                  description: tool.description,
                  parameters: {
                    type: 'object',
                    properties: Object.fromEntries(
                      tool.parameters.map((p) => [
                        p.name,
                        {
                          type: p.type,
                          description: p.description,
                          ...(p.defaultValue != null ? { default: p.defaultValue } : {}),
                          ...(p.enum ? { enum: p.enum } : {}),
                        },
                      ])
                    ),
                    required: tool.parameters.filter((p) => p.required).map((p) => p.name),
                  },
                },
                null,
                2
              )}
            </pre>
          </div>
        )}

        {activeTab === 'stats' && (
          <div id="tabpanel-tool-stats" role="tabpanel" className="p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <StatCard
                label="Total Calls"
                value={tool.stats.callCount.toString()}
                icon={Activity}
              />
              <StatCard
                label="Success"
                value={tool.stats.successCount.toString()}
                icon={Activity}
              />
              <StatCard label="Errors" value={tool.stats.errorCount.toString()} icon={Activity} />
              <StatCard
                label="Avg Execution Time"
                value={
                  tool.stats.avgExecutionTime
                    ? `${(tool.stats.avgExecutionTime / 1000).toFixed(1)}s`
                    : 'N/A'
                }
                icon={Clock}
              />
              <StatCard
                label="Success Rate"
                value={
                  tool.stats.callCount > 0
                    ? `${((tool.stats.successCount / tool.stats.callCount) * 100).toFixed(0)}%`
                    : 'N/A'
                }
                icon={BarChart3}
              />
              <StatCard
                label="Last Used"
                value={tool.stats.lastUsed ? formatRelativeTime(tool.stats.lastUsed) : 'Never'}
                icon={Clock}
              />
            </div>
          </div>
        )}

        {activeTab === 'examples' && (
          <div id="tabpanel-tool-examples" role="tabpanel" className="p-6">
            {tool.examples && tool.examples.length > 0 ? (
              <div className="space-y-4">
                {tool.examples.map((example, i) => (
                  <div key={i} className="rounded-md border px-4 py-3">
                    <h4 className="text-xs font-medium">{example.title}</h4>
                    <pre className="mt-2 overflow-auto rounded bg-muted p-3 font-mono text-[11px] leading-relaxed text-foreground">
                      {JSON.stringify(example.input, null, 2)}
                    </pre>
                    {example.output && (
                      <p className="mt-2 text-xs text-muted-foreground">Output: {example.output}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground">
                <BookOpen className="h-8 w-8" />
                <p className="text-sm">No examples available</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

/** Stat card sub-component */
function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: string
  icon: typeof Activity
}) {
  return (
    <div className="rounded-md border px-4 py-3">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
        {label}
      </div>
      <div className="mt-1 text-lg font-semibold">{value}</div>
    </div>
  )
}
