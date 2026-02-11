/**
 * HarnessBreakdown Component
 * Per-harness storage usage bars
 */

import { formatBytes } from '@/lib/utils'
import { harnessConfigs } from '@/components/harness/harness-config'
import type { MemoryUsageByHarness } from '@/types'

interface Props {
  byHarness: MemoryUsageByHarness[]
}

export function HarnessBreakdown({ byHarness }: Props) {
  // Sort by size descending
  const sorted = [...byHarness].sort((a, b) => b.totalSize - a.totalSize)

  return (
    <div className="flex flex-col gap-3">
      {sorted.map((h) => {
        const config = harnessConfigs[h.harness]
        return (
          <div key={h.harness}>
            <div className="mb-1 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: config?.brandColor ?? '#6B7280' }}
                />
                <span className="text-sm">{config?.name ?? h.harness}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>{h.entryCount.toLocaleString()} entries</span>
                <span>{formatBytes(h.totalSize)}</span>
              </div>
            </div>
            <div className="h-2 w-full rounded-full bg-muted">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${h.percentage}%`,
                  backgroundColor: config?.brandColor ?? '#6B7280',
                }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
