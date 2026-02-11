/**
 * MemoryDashboard Component
 * Memory management overview with storage charts and health indicators
 */

import { useEffect, useCallback } from 'react'
import { RefreshCw, Database, HardDrive, FileText, Brain } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { formatBytes } from '@/lib/utils'
import { useMemoryStore } from '@/stores/memory-store'
import { getMemoryDashboard } from '@/services/memory'
import { StorageDonutChart } from './StorageDonutChart'
import { HarnessBreakdown } from './HarnessBreakdown'
import { StorageHealthCard } from './StorageHealthCard'
import type { MemoryType } from '@/types'

const TYPE_ICONS: Record<MemoryType, React.ComponentType<{ className?: string }>> = {
  session: Database,
  learning: Brain,
  'project-context': FileText,
  'codebase-index': HardDrive,
}

const TYPE_LABELS: Record<MemoryType, string> = {
  session: 'Sessions',
  learning: 'Learnings',
  'project-context': 'Project Context',
  'codebase-index': 'Codebase Indexes',
}

export function MemoryDashboard() {
  const stats = useMemoryStore((s) => s.stats)
  const health = useMemoryStore((s) => s.health)
  const isLoading = useMemoryStore((s) => s.isLoading)
  const breakdownView = useMemoryStore((s) => s.breakdownView)
  const setBreakdownView = useMemoryStore((s) => s.setBreakdownView)

  const loadDashboard = useCallback(async () => {
    const store = useMemoryStore.getState()
    store.setIsLoading(true)
    try {
      const data = await getMemoryDashboard()
      store.setStats(data.stats)
      store.setHealth(data.health)
    } finally {
      store.setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadDashboard()
  }, [loadDashboard])

  return (
    <div className="flex h-full flex-col overflow-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-6 py-4">
        <div>
          <h2 className="text-lg font-semibold">Memory Dashboard</h2>
          <p className="text-sm text-muted-foreground">Storage usage and health monitoring</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadDashboard}
            disabled={isLoading}
            aria-label="Refresh dashboard"
          >
            <RefreshCw className={cn('mr-2 h-3.5 w-3.5', isLoading && 'animate-spin')} />
            {isLoading ? 'Loading...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {/* Summary cards row */}
        {stats && (
          <div className="mb-6 grid grid-cols-4 gap-4">
            <SummaryCard
              label="Total Entries"
              value={stats.totalEntries.toLocaleString()}
              description={`Across ${stats.byHarness.length} harnesses`}
            />
            <SummaryCard
              label="Total Storage"
              value={formatBytes(stats.totalSize)}
              description="All memory types combined"
            />
            <SummaryCard
              label="Memory Types"
              value={stats.byType.length.toString()}
              description="Sessions, learnings, context, indexes"
            />
            <SummaryCard
              label="Storage Locations"
              value={
                stats.storageLocations.filter((s) => s.isConnected).toString().length > 0
                  ? `${stats.storageLocations.filter((s) => s.isConnected).length} / ${stats.storageLocations.length}`
                  : '0'
              }
              description="Connected locations"
            />
          </div>
        )}

        {/* Charts row */}
        <div className="mb-6 grid grid-cols-2 gap-6">
          {/* Donut chart */}
          <div className="rounded-lg border p-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-medium">Storage Breakdown</h3>
              <div className="flex rounded-md border" role="group">
                <button
                  onClick={() => setBreakdownView('type')}
                  className={cn(
                    'px-3 py-1 text-xs transition-colors',
                    breakdownView === 'type'
                      ? 'bg-accent font-medium'
                      : 'text-muted-foreground hover:bg-accent/50'
                  )}
                >
                  By Type
                </button>
                <button
                  onClick={() => setBreakdownView('harness')}
                  className={cn(
                    'border-l px-3 py-1 text-xs transition-colors',
                    breakdownView === 'harness'
                      ? 'bg-accent font-medium'
                      : 'text-muted-foreground hover:bg-accent/50'
                  )}
                >
                  By Harness
                </button>
              </div>
            </div>
            {stats && <StorageDonutChart stats={stats} view={breakdownView} />}
          </div>

          {/* Per-harness breakdown */}
          <div className="rounded-lg border p-4">
            <h3 className="mb-4 text-sm font-medium">Harness Usage</h3>
            {stats && <HarnessBreakdown byHarness={stats.byHarness} />}
          </div>
        </div>

        {/* Type breakdown cards */}
        {stats && (
          <div className="mb-6">
            <h3 className="mb-3 text-sm font-medium">By Memory Type</h3>
            <div className="grid grid-cols-4 gap-4">
              {stats.byType.map((typeUsage) => {
                const Icon = TYPE_ICONS[typeUsage.type]
                return (
                  <div key={typeUsage.type} className="rounded-lg border p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{TYPE_LABELS[typeUsage.type]}</span>
                    </div>
                    <div className="text-2xl font-bold">
                      {typeUsage.entryCount.toLocaleString()}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {formatBytes(typeUsage.totalSize)} ({typeUsage.percentage}%)
                    </div>
                    {/* Usage bar */}
                    <div className="mt-2 h-1.5 w-full rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${typeUsage.percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Storage health */}
        {health.length > 0 && (
          <div>
            <h3 className="mb-3 text-sm font-medium">Storage Health</h3>
            <div className="grid grid-cols-3 gap-4">
              {health.map((h) => (
                <StorageHealthCard key={h.location.name} health={h} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function SummaryCard({
  label,
  value,
  description,
}: {
  label: string
  value: string
  description: string
}) {
  return (
    <div className="rounded-lg border p-4">
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-bold">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{description}</div>
    </div>
  )
}
