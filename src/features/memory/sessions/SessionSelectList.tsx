/**
 * SessionSelectList Component
 * Session list with checkboxes for bulk selection and tag display
 */

import { useSessionsStore } from '@/stores'
import { useSessionMemoryStore } from '@/stores/session-memory-store'
import { cn, formatRelativeTime } from '@/lib/utils'
import type { HarnessType } from '@/types'

const HARNESS_COLORS: Record<HarnessType, string> = {
  'claude-code': 'bg-orange-500/20 text-orange-400',
  cursor: 'bg-blue-500/20 text-blue-400',
  copilot: 'bg-purple-500/20 text-purple-400',
  cline: 'bg-green-500/20 text-green-400',
  continue: 'bg-teal-500/20 text-teal-400',
  aider: 'bg-amber-500/20 text-amber-400',
}

export function SessionSelectList() {
  const sessions = useSessionsStore((s) => s.sessions)
  const selectedIds = useSessionMemoryStore((s) => s.selectedIds)
  const selectAll = useSessionMemoryStore((s) => s.selectAll)
  const toggleSelected = useSessionMemoryStore((s) => s.toggleSelected)
  const setSelectAll = useSessionMemoryStore((s) => s.setSelectAll)

  const allIds = sessions.map((s) => s.id)

  return (
    <div className="flex flex-col">
      {/* Select all header */}
      <div className="flex items-center gap-3 border-b px-4 py-3">
        <input
          type="checkbox"
          checked={selectAll}
          onChange={(e) => setSelectAll(e.target.checked, allIds)}
          className="h-4 w-4 rounded border-muted-foreground"
          aria-label="Select all sessions"
        />
        <span className="text-sm font-medium">
          {selectAll ? `All ${sessions.length} selected` : 'Select all'}
        </span>
        {selectedIds.size > 0 && !selectAll && (
          <span className="text-xs text-muted-foreground">{selectedIds.size} selected</span>
        )}
      </div>

      {/* Session rows */}
      <div className="flex-1 overflow-auto">
        {sessions.map((session) => {
          const isSelected = selectedIds.has(session.id)
          return (
            <label
              key={session.id}
              className={cn(
                'flex cursor-pointer items-start gap-3 border-b px-4 py-3 transition-colors hover:bg-accent/50',
                isSelected && 'bg-accent/30'
              )}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggleSelected(session.id)}
                className="mt-0.5 h-4 w-4 rounded border-muted-foreground"
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium leading-snug truncate">{session.title}</div>
                <div className="mt-1 flex items-center gap-2">
                  <span
                    className={cn(
                      'rounded-full px-1.5 py-0.5 text-[10px] font-medium',
                      HARNESS_COLORS[session.harness]
                    )}
                  >
                    {session.harness}
                  </span>
                  {session.project && (
                    <span className="text-xs text-muted-foreground truncate">
                      {session.project}
                    </span>
                  )}
                </div>
                <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{formatRelativeTime(session.startedAt)}</span>
                  <span>{session.messageCount} msgs</span>
                </div>
                {session.tags && session.tags.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {session.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </label>
          )
        })}
      </div>
    </div>
  )
}
