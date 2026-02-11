/**
 * AutoPruneSettings Component
 * Configure automatic session pruning rules
 */

import { Clock, HardDrive, Hash, Shield } from 'lucide-react'
import { formatBytes, formatRelativeTime } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { useSessionMemoryStore } from '@/stores/session-memory-store'
import { togglePruneRule } from '@/services/session-memory'

const RULE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'rule-1': Clock,
  'rule-2': Hash,
  'rule-3': HardDrive,
}

export function AutoPruneSettings() {
  const pruneRules = useSessionMemoryStore((s) => s.pruneRules)
  const setPruneRules = useSessionMemoryStore((s) => s.setPruneRules)

  async function handleToggle(ruleId: string) {
    const updated = await togglePruneRule(ruleId)
    if (updated) {
      setPruneRules(pruneRules.map((r) => (r.id === ruleId ? updated : r)))
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="h-5 w-5 text-primary" />
          <h3 className="text-sm font-medium">Auto-Prune Rules</h3>
        </div>
        <p className="text-xs text-muted-foreground">
          Configure automatic cleanup rules for session data. Rules run daily during idle time.
        </p>
      </div>

      <div className="space-y-4">
        {pruneRules.map((rule) => {
          const Icon = RULE_ICONS[rule.id] ?? Clock
          return (
            <div key={rule.id} className="rounded-lg border p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm font-medium">{rule.name}</div>
                    <div className="text-xs text-muted-foreground">{describeRule(rule)}</div>
                  </div>
                </div>
                <button
                  onClick={() => handleToggle(rule.id)}
                  className={cn(
                    'relative inline-flex h-5 w-9 items-center rounded-full transition-colors',
                    rule.enabled ? 'bg-primary' : 'bg-muted'
                  )}
                  role="switch"
                  aria-checked={rule.enabled}
                  aria-label={`${rule.enabled ? 'Disable' : 'Enable'} ${rule.name}`}
                >
                  <span
                    className={cn(
                      'inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform',
                      rule.enabled ? 'translate-x-[18px]' : 'translate-x-[3px]'
                    )}
                  />
                </button>
              </div>

              {/* Rule details */}
              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                {rule.olderThanDays && <span>Older than {rule.olderThanDays} days</span>}
                {rule.maxSessions && <span>Max {rule.maxSessions} sessions</span>}
                {rule.maxSizeBytes && <span>Max {formatBytes(rule.maxSizeBytes)}</span>}
                {rule.harnesses && <span>Harnesses: {rule.harnesses.join(', ')}</span>}
              </div>

              {/* Last run info */}
              {rule.lastRun && (
                <div className="mt-2 text-[10px] text-muted-foreground">
                  Last run {formatRelativeTime(rule.lastRun)}
                  {rule.lastPrunedCount !== undefined &&
                    ` — ${rule.lastPrunedCount} session${rule.lastPrunedCount !== 1 ? 's' : ''} pruned`}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {pruneRules.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 py-12 text-muted-foreground">
          <Shield className="h-10 w-10" />
          <p className="text-sm">No prune rules configured</p>
        </div>
      )}
    </div>
  )
}

function describeRule(rule: {
  olderThanDays?: number
  maxSessions?: number
  maxSizeBytes?: number
}): string {
  const parts: string[] = []
  if (rule.olderThanDays) parts.push(`sessions older than ${rule.olderThanDays} days`)
  if (rule.maxSessions) parts.push(`keep max ${rule.maxSessions} sessions`)
  if (rule.maxSizeBytes) parts.push(`max storage ${formatBytes(rule.maxSizeBytes)}`)
  return parts.join(', ') || 'No conditions set'
}
