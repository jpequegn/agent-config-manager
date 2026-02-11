/**
 * HookCard Component
 * Displays a single hook with name, harness badge, trigger, toggle, and stats
 */

import { GripVertical, AlertCircle, Pencil } from 'lucide-react'
import { cn } from '@/lib/utils'
import { harnessConfigs } from '@/components/harness/harness-config'
import type { HookSummary } from '@/types'

interface Props {
  hook: HookSummary
  isSelected: boolean
  onToggleSelect: () => void
  onToggleStatus: () => void
  onEdit: () => void
}

export function HookCard({ hook, isSelected, onToggleSelect, onToggleStatus, onEdit }: Props) {
  const harnessConfig = harnessConfigs[hook.harness]
  const isEnabled = hook.status === 'enabled'
  const isError = hook.status === 'error'

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-lg border px-3 py-3 transition-colors',
        isSelected && 'bg-accent/30 border-accent',
        isError && 'border-red-500/30'
      )}
    >
      {/* Drag handle */}
      <GripVertical
        className="h-4 w-4 shrink-0 cursor-grab text-muted-foreground"
        aria-hidden="true"
      />

      {/* Checkbox */}
      <input
        type="checkbox"
        checked={isSelected}
        onChange={onToggleSelect}
        className="h-4 w-4 shrink-0 rounded border-muted-foreground"
        aria-label={`Select ${hook.name}`}
      />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium truncate">{hook.name}</span>
          {isError && <AlertCircle className="h-3.5 w-3.5 shrink-0 text-red-500" />}
        </div>
        <div className="mt-1 flex items-center gap-2">
          <span
            className={cn(
              'rounded-full px-1.5 py-0.5 text-[10px] font-medium',
              harnessConfig.bgColor,
              harnessConfig.textColor
            )}
          >
            {harnessConfig.shortName}
          </span>
          {hook.toolMatcher && (
            <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
              {hook.toolMatcher}
            </span>
          )}
        </div>
      </div>

      {/* Edit + Stats */}
      <div className="flex shrink-0 items-center gap-4 text-xs text-muted-foreground">
        <button
          onClick={onEdit}
          className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          aria-label={`Edit ${hook.name}`}
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <div className="text-right">
          <div>{hook.runCount} runs</div>
          {hook.blockCount > 0 && <div className="text-yellow-500">{hook.blockCount} blocked</div>}
        </div>

        {/* Enable/disable toggle */}
        <button
          role="switch"
          aria-checked={isEnabled}
          aria-label={`${isEnabled ? 'Disable' : 'Enable'} ${hook.name}`}
          onClick={onToggleStatus}
          disabled={isError}
          className={cn(
            'relative h-5 w-9 shrink-0 rounded-full transition-colors',
            isEnabled ? 'bg-primary' : 'bg-muted',
            isError && 'cursor-not-allowed opacity-50'
          )}
        >
          <span
            className={cn(
              'absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white transition-transform',
              isEnabled && 'translate-x-4'
            )}
          />
        </button>
      </div>
    </div>
  )
}
