/**
 * StorageDonutChart Component
 * Recharts PieChart showing storage breakdown by type or harness
 */

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { formatBytes } from '@/lib/utils'
import { harnessConfigs } from '@/components/harness/harness-config'
import type { MemoryStats } from '@/types'

const TYPE_COLORS: Record<string, string> = {
  session: '#3B82F6',
  learning: '#8B5CF6',
  'project-context': '#10B981',
  'codebase-index': '#F59E0B',
}

const TYPE_LABELS: Record<string, string> = {
  session: 'Sessions',
  learning: 'Learnings',
  'project-context': 'Project Context',
  'codebase-index': 'Codebase Indexes',
}

interface Props {
  stats: MemoryStats
  view: 'type' | 'harness'
}

export function StorageDonutChart({ stats, view }: Props) {
  const data =
    view === 'type'
      ? stats.byType.map((t) => ({
          name: TYPE_LABELS[t.type] ?? t.type,
          value: t.totalSize,
          color: TYPE_COLORS[t.type] ?? '#6B7280',
          count: t.entryCount,
          percentage: t.percentage,
        }))
      : stats.byHarness.map((h) => ({
          name: harnessConfigs[h.harness]?.name ?? h.harness,
          value: h.totalSize,
          color: harnessConfigs[h.harness]?.brandColor ?? '#6B7280',
          count: h.entryCount,
          percentage: h.percentage,
        }))

  return (
    <div className="flex items-center gap-4">
      <div className="h-48 w-48 flex-shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={75}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.[0]) return null
                const item = payload[0].payload as (typeof data)[0]
                return (
                  <div className="rounded-md border bg-popover px-3 py-2 text-xs shadow-md">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-muted-foreground">
                      {formatBytes(item.value)} ({item.percentage}%)
                    </div>
                    <div className="text-muted-foreground">
                      {item.count.toLocaleString()} entries
                    </div>
                  </div>
                )
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex flex-col gap-2">
        {data.map((item) => (
          <div key={item.name} className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: item.color }} />
            <span className="text-xs">{item.name}</span>
            <span className="text-xs text-muted-foreground">{formatBytes(item.value)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
