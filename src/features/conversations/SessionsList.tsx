/**
 * SessionsList Component
 * Filterable list of conversation sessions
 */

import { Search, MessageSquare, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn, formatRelativeTime } from '@/lib/utils'
import { useSessionsStore, useSessions, useSelectedSession, useIsSessionsLoading } from '@/stores'
import { getSession } from '@/services/sessions'
import type { HarnessType, SessionSummary } from '@/types'

/** Harness display colors */
const HARNESS_COLORS: Record<HarnessType, string> = {
  'claude-code': 'bg-orange-500/20 text-orange-400',
  cursor: 'bg-blue-500/20 text-blue-400',
  copilot: 'bg-purple-500/20 text-purple-400',
  cline: 'bg-green-500/20 text-green-400',
  continue: 'bg-teal-500/20 text-teal-400',
  aider: 'bg-amber-500/20 text-amber-400',
}

/** Harness labels */
const HARNESS_LABELS: { value: HarnessType; label: string }[] = [
  { value: 'claude-code', label: 'Claude Code' },
  { value: 'cursor', label: 'Cursor' },
  { value: 'copilot', label: 'Copilot' },
  { value: 'cline', label: 'Cline' },
  { value: 'continue', label: 'Continue' },
  { value: 'aider', label: 'Aider' },
]

/** Format duration from ms to readable string */
function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
}

export function SessionsList() {
  const sessions = useSessions()
  const selectedSession = useSelectedSession()
  const isLoading = useIsSessionsLoading()
  const searchQuery = useSessionsStore((s) => s.searchQuery)
  const filterHarness = useSessionsStore((s) => s.filterHarness)
  const setSearchQuery = useSessionsStore((s) => s.setSearchQuery)
  const setFilterHarness = useSessionsStore((s) => s.setFilterHarness)
  const selectSession = useSessionsStore((s) => s.selectSession)

  async function handleSelect(summary: SessionSummary) {
    const full = await getSession(summary.id)
    selectSession(full)
  }

  return (
    <div className="flex h-full flex-col">
      {/* Search */}
      <div className="relative p-3">
        <Search className="absolute left-6 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search sessions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Harness filter */}
      <div className="flex flex-wrap gap-1.5 px-3 pb-3">
        <Button
          variant={filterHarness === null ? 'secondary' : 'ghost'}
          size="sm"
          className="h-6 px-2 text-xs"
          onClick={() => setFilterHarness(null)}
        >
          All
        </Button>
        {HARNESS_LABELS.map(({ value, label }) => (
          <Button
            key={value}
            variant={filterHarness === value ? 'secondary' : 'ghost'}
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={() => setFilterHarness(filterHarness === value ? null : value)}
          >
            {label}
          </Button>
        ))}
      </div>

      {/* Sessions list */}
      <div className="flex-1 overflow-y-auto px-3 pb-3">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="text-sm">Loading sessions...</span>
          </div>
        ) : sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground">
            <MessageSquare className="h-8 w-8" />
            <span className="text-sm">No sessions found</span>
          </div>
        ) : (
          <div className="space-y-1">
            {sessions.map((session) => (
              <button
                key={session.id}
                onClick={() => handleSelect(session)}
                className={cn(
                  'flex w-full flex-col gap-1.5 rounded-lg border p-2.5 text-left transition-colors',
                  'hover:bg-accent/50',
                  selectedSession?.id === session.id
                    ? 'border-primary bg-accent'
                    : 'border-transparent'
                )}
              >
                <span className="text-sm font-medium leading-snug">{session.title}</span>
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'rounded-full px-1.5 py-0.5 text-[10px] font-medium',
                      HARNESS_COLORS[session.harness]
                    )}
                  >
                    {session.harness}
                  </span>
                  {session.project && (
                    <span className="text-xs text-muted-foreground">{session.project}</span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{formatRelativeTime(session.startedAt)}</span>
                  <span>{session.messageCount} msgs</span>
                  <span>{formatDuration(session.duration)}</span>
                </div>
                {session.lastMessagePreview && (
                  <p className="line-clamp-2 text-xs text-muted-foreground/70">
                    {session.lastMessagePreview}
                  </p>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
