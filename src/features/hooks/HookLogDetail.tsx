/**
 * HookLogDetail Component
 * Shows detailed info for a single execution log entry
 */

import { CheckCircle2, XCircle, ShieldAlert, SkipForward, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatRelativeTime } from '@/lib/utils'
import type { HookLogEntry } from '@/types'

const RESULT_CONFIG: Record<
  string,
  { icon: React.ComponentType<{ className?: string }>; color: string; label: string }
> = {
  allow: { icon: CheckCircle2, color: 'text-green-500', label: 'Allowed' },
  block: { icon: ShieldAlert, color: 'text-yellow-500', label: 'Blocked' },
  error: { icon: XCircle, color: 'text-red-500', label: 'Error' },
  skip: { icon: SkipForward, color: 'text-muted-foreground', label: 'Skipped' },
}

interface Props {
  log: HookLogEntry
  onClose: () => void
}

export function HookLogDetail({ log, onClose }: Props) {
  const config = RESULT_CONFIG[log.result]
  const Icon = config.icon

  return (
    <div className="rounded-lg border bg-background p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={cn('h-4 w-4', config.color)} />
          <span className={cn('text-sm font-semibold', config.color)}>{config.label}</span>
          <span className="text-xs text-muted-foreground">{log.duration}ms</span>
        </div>
        <button
          onClick={onClose}
          className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          aria-label="Close log detail"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-3 text-xs">
        <div>
          <span className="font-medium text-muted-foreground">Timestamp</span>
          <p className="mt-0.5">
            {log.timestamp.toLocaleString()} ({formatRelativeTime(log.timestamp)})
          </p>
        </div>

        {log.triggeringTool && (
          <div>
            <span className="font-medium text-muted-foreground">Triggering Tool</span>
            <p className="mt-0.5 rounded bg-muted px-1.5 py-0.5 font-mono inline-block">
              {log.triggeringTool}
            </p>
          </div>
        )}

        {log.input && (
          <div>
            <span className="font-medium text-muted-foreground">Input</span>
            <pre className="mt-1 max-h-32 overflow-auto rounded border bg-muted/50 p-2 font-mono">
              {log.input}
            </pre>
          </div>
        )}

        {log.output && (
          <div>
            <span className="font-medium text-muted-foreground">Output</span>
            <pre className="mt-1 max-h-32 overflow-auto rounded border bg-muted/50 p-2 font-mono">
              {log.output}
            </pre>
          </div>
        )}

        {log.error && (
          <div>
            <span className="font-medium text-red-500">Error</span>
            <pre className="mt-1 max-h-32 overflow-auto rounded border border-red-500/20 bg-red-500/5 p-2 font-mono text-red-500">
              {log.error}
            </pre>
          </div>
        )}

        <div className="text-muted-foreground">
          Log ID: <span className="font-mono">{log.id}</span>
        </div>
      </div>
    </div>
  )
}
