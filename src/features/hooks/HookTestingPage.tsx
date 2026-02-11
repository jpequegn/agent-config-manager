/**
 * HookTestingPage Component
 * Hook testing interface with test runner, execution logs, and stats
 */

import { useEffect, useCallback, useState } from 'react'
import { ArrowLeft, RefreshCw, Activity } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  listHookSummaries,
  getHookLogs,
  clearHookLogs,
  getHookExecutionStats,
} from '@/services/hooks'
import { useHookLogsStore } from '@/stores/hook-logs-store'
import { HookTestRunner } from './HookTestRunner'
import { HookLogsTable } from './HookLogsTable'
import { HookLogDetail } from './HookLogDetail'
import type { HookSummary, HookResult } from '@/types'

export function HookTestingPage() {
  const [hooks, setHooks] = useState<HookSummary[]>([])
  const [isLoadingHooks, setIsLoadingHooks] = useState(true)

  const hookId = useHookLogsStore((s) => s.hookId)
  const logs = useHookLogsStore((s) => s.logs)
  const resultFilter = useHookLogsStore((s) => s.resultFilter)
  const isLoading = useHookLogsStore((s) => s.isLoading)
  const stats = useHookLogsStore((s) => s.stats)
  const selectedLogId = useHookLogsStore((s) => s.selectedLogId)
  const setHookId = useHookLogsStore((s) => s.setHookId)
  const setLogs = useHookLogsStore((s) => s.setLogs)
  const setResultFilter = useHookLogsStore((s) => s.setResultFilter)
  const setIsLoading = useHookLogsStore((s) => s.setIsLoading)
  const setStats = useHookLogsStore((s) => s.setStats)
  const setSelectedLogId = useHookLogsStore((s) => s.setSelectedLogId)

  // Load hooks list
  useEffect(() => {
    listHookSummaries().then((summaries) => {
      setHooks(summaries.filter((h) => h.status !== 'error'))
      setIsLoadingHooks(false)
    })
  }, [])

  // Load logs and stats when hookId changes
  const loadLogsAndStats = useCallback(async () => {
    if (!hookId) return
    setIsLoading(true)
    try {
      const [logsData, statsData] = await Promise.all([
        getHookLogs(hookId, resultFilter),
        getHookExecutionStats(hookId),
      ])
      setLogs(logsData)
      setStats(statsData)
    } finally {
      setIsLoading(false)
    }
  }, [hookId, resultFilter, setIsLoading, setLogs, setStats])

  useEffect(() => {
    loadLogsAndStats()
  }, [loadLogsAndStats])

  const handleFilterChange = useCallback(
    (filter: HookResult | null) => {
      setResultFilter(filter)
    },
    [setResultFilter]
  )

  const handleClearLogs = useCallback(async () => {
    if (!hookId) return
    await clearHookLogs(hookId)
    setLogs([])
    const statsData = await getHookExecutionStats(hookId)
    setStats(statsData)
  }, [hookId, setLogs, setStats])

  const selectedLog = logs.find((l) => l.id === selectedLogId)
  const selectedHook = hooks.find((h) => h.id === hookId)

  // Hook selector view
  if (!hookId) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div className="flex items-center gap-3">
            <Activity className="h-5 w-5 text-primary" aria-hidden="true" />
            <div>
              <h2 className="text-lg font-semibold">Hook Testing & Logs</h2>
              <p className="text-sm text-muted-foreground">
                Select a hook to test and view execution logs
              </p>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-auto px-6 py-4">
          {isLoadingHooks ? (
            <div className="py-12 text-center text-sm text-muted-foreground">Loading hooks...</div>
          ) : hooks.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No hooks available for testing
            </div>
          ) : (
            <div className="grid gap-2">
              {hooks.map((hook) => (
                <button
                  key={hook.id}
                  onClick={() => setHookId(hook.id)}
                  className="flex items-center justify-between rounded-lg border px-4 py-3 text-left transition-colors hover:bg-accent/50"
                >
                  <div>
                    <div className="text-sm font-medium">{hook.name}</div>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      {hook.trigger}
                      {hook.toolMatcher && (
                        <span className="ml-2 rounded bg-muted px-1.5 py-0.5 font-mono">
                          {hook.toolMatcher}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    <div>{hook.runCount} runs</div>
                    {hook.blockCount > 0 && (
                      <div className="text-yellow-500">{hook.blockCount} blocked</div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Hook testing view
  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-6 py-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setHookId(null)}
            aria-label="Back to hook list"
          >
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Back
          </Button>
          <div>
            <h2 className="text-lg font-semibold">{selectedHook?.name ?? 'Hook'}</h2>
            <p className="text-sm text-muted-foreground">Test execution and view logs</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={loadLogsAndStats}
          disabled={isLoading}
          aria-label="Refresh logs"
        >
          <RefreshCw className={cn('mr-2 h-3.5 w-3.5', isLoading && 'animate-spin')} />
          Refresh
        </Button>
      </div>

      {/* Stats bar */}
      {stats && (
        <div className="flex items-center gap-6 border-b px-6 py-3">
          <div className="text-xs">
            <span className="text-muted-foreground">Total: </span>
            <span className="font-medium">{stats.totalRuns}</span>
          </div>
          <div className="text-xs">
            <span className="text-green-500">Allowed: </span>
            <span className="font-medium">{stats.allowCount}</span>
          </div>
          <div className="text-xs">
            <span className="text-yellow-500">Blocked: </span>
            <span className="font-medium">{stats.blockCount}</span>
          </div>
          <div className="text-xs">
            <span className="text-red-500">Errors: </span>
            <span className="font-medium">{stats.errorCount}</span>
          </div>
          <div className="text-xs">
            <span className="text-muted-foreground">Avg: </span>
            <span className="font-medium">{stats.avgDuration}ms</span>
          </div>
          <div className="text-xs">
            <span className="text-muted-foreground">Max: </span>
            <span className="font-medium">{stats.maxDuration}ms</span>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-auto px-6 py-4 space-y-6">
        {/* Test runner */}
        <HookTestRunner hookId={hookId} />

        {/* Logs table */}
        <HookLogsTable
          logs={logs}
          resultFilter={resultFilter}
          onFilterChange={handleFilterChange}
          onSelectLog={setSelectedLogId}
          selectedLogId={selectedLogId}
          onClearLogs={handleClearLogs}
        />

        {/* Log detail */}
        {selectedLog && <HookLogDetail log={selectedLog} onClose={() => setSelectedLogId(null)} />}
      </div>
    </div>
  )
}
