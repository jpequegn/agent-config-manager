/**
 * HookLogsTable Component
 * Displays execution logs in a table with result filtering
 */

import { CheckCircle2, XCircle, ShieldAlert, SkipForward, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { formatRelativeTime } from '@/lib/utils'
import type { HookLogEntry, HookResult } from '@/types'

const RESULT_FILTERS: { value: HookResult | null; label: string }[] = [
  { value: null, label: 'All' },
  { value: 'allow', label: 'Allowed' },
  { value: 'block', label: 'Blocked' },
  { value: 'error', label: 'Errors' },
  { value: 'skip', label: 'Skipped' },
]

const RESULT_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  allow: CheckCircle2,
  block: ShieldAlert,
  error: XCircle,
  skip: SkipForward,
}

const RESULT_COLOR: Record<string, string> = {
  allow: 'text-green-500',
  block: 'text-yellow-500',
  error: 'text-red-500',
  skip: 'text-muted-foreground',
}

interface Props {
  logs: HookLogEntry[]
  resultFilter: HookResult | null
  onFilterChange: (filter: HookResult | null) => void
  onSelectLog: (id: string) => void
  selectedLogId: string | null
  onClearLogs: () => void
}

export function HookLogsTable({
  logs,
  resultFilter,
  onFilterChange,
  onSelectLog,
  selectedLogId,
  onClearLogs,
}: Props) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-semibold">Execution Logs</h4>
          <span className="text-xs text-muted-foreground">({logs.length} entries)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {RESULT_FILTERS.map((f) => (
              <button
                key={f.label}
                onClick={() => onFilterChange(f.value)}
                className={cn(
                  'rounded px-2 py-0.5 text-[10px] font-medium transition-colors',
                  resultFilter === f.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-accent'
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={onClearLogs} aria-label="Clear logs">
            <Trash2 className="mr-1.5 h-3 w-3" />
            Clear
          </Button>
        </div>
      </div>

      {logs.length === 0 ? (
        <div className="py-8 text-center text-sm text-muted-foreground">
          {resultFilter ? `No ${resultFilter} logs found` : 'No execution logs'}
        </div>
      ) : (
        <div className="max-h-80 overflow-auto rounded-md border">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-muted/80 backdrop-blur-sm">
              <tr className="border-b">
                <th className="px-3 py-2 text-left font-medium">Result</th>
                <th className="px-3 py-2 text-left font-medium">Time</th>
                <th className="px-3 py-2 text-left font-medium">Duration</th>
                <th className="px-3 py-2 text-left font-medium">Tool</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => {
                const Icon = RESULT_ICON[log.result]
                return (
                  <tr
                    key={log.id}
                    onClick={() => onSelectLog(log.id)}
                    className={cn(
                      'cursor-pointer border-b transition-colors hover:bg-accent/50',
                      selectedLogId === log.id && 'bg-accent/30'
                    )}
                  >
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1.5">
                        <Icon className={cn('h-3.5 w-3.5', RESULT_COLOR[log.result])} />
                        <span className={cn('capitalize', RESULT_COLOR[log.result])}>
                          {log.result}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">
                      {formatRelativeTime(log.timestamp)}
                    </td>
                    <td className="px-3 py-2 font-mono">{log.duration}ms</td>
                    <td className="px-3 py-2">
                      {log.triggeringTool && (
                        <span className="rounded bg-muted px-1.5 py-0.5 font-mono">
                          {log.triggeringTool}
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
