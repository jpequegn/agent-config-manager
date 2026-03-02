/**
 * SessionSelectList Component
 * Session list with checkboxes for bulk selection and tag display.
 * Uses virtualization for smooth rendering of large session lists.
 */

import { useRef, useCallback, memo } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useSessionsStore } from '@/stores'
import { useSessionMemoryStore } from '@/stores/session-memory-store'
import { cn, formatRelativeTime } from '@/lib/utils'
import type { HarnessType, SessionSummary } from '@/types'

const HARNESS_COLORS: Record<HarnessType, string> = {
  'claude-code': 'bg-orange-500/20 text-orange-400',
  cursor: 'bg-blue-500/20 text-blue-400',
  copilot: 'bg-purple-500/20 text-purple-400',
  cline: 'bg-green-500/20 text-green-400',
  continue: 'bg-teal-500/20 text-teal-400',
  aider: 'bg-amber-500/20 text-amber-400',
}

interface SessionRowProps {
  session: SessionSummary
  isSelected: boolean
  onToggle: (id: string) => void
}

const SessionRow = memo(function SessionRow({ session, isSelected, onToggle }: SessionRowProps) {
  return (
    <label
      className={cn(
        'flex cursor-pointer items-start gap-3 border-b px-4 py-3 transition-colors hover:bg-accent/50',
        isSelected && 'bg-accent/30'
      )}
    >
      <input
        type="checkbox"
        checked={isSelected}
        onChange={() => onToggle(session.id)}
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
            <span className="text-xs text-muted-foreground truncate">{session.project}</span>
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
})

export function SessionSelectList() {
  const sessions = useSessionsStore((s) => s.sessions)
  const selectedIds = useSessionMemoryStore((s) => s.selectedIds)
  const selectAll = useSessionMemoryStore((s) => s.selectAll)
  const toggleSelected = useSessionMemoryStore((s) => s.toggleSelected)
  const setSelectAll = useSessionMemoryStore((s) => s.setSelectAll)

  const allIds = sessions.map((s) => s.id)
  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: sessions.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 88, // estimated row height in px
    overscan: 10,
  })

  const handleToggle = useCallback((id: string) => toggleSelected(id), [toggleSelected])

  return (
    <div className="flex flex-col h-full">
      {/* Select all header */}
      <div className="flex items-center gap-3 border-b px-4 py-3 flex-shrink-0">
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

      {/* Virtualized session rows */}
      <div ref={parentRef} className="flex-1 overflow-auto">
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualizer.getVirtualItems().map((virtualItem) => {
            const session = sessions[virtualItem.index]
            return (
              <div
                key={virtualItem.key}
                data-index={virtualItem.index}
                ref={virtualizer.measureElement}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              >
                <SessionRow
                  session={session}
                  isSelected={selectedIds.has(session.id)}
                  onToggle={handleToggle}
                />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
