/**
 * SessionsList Component
 * Filterable, sortable list of conversation sessions with debounced search
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Search, MessageSquare, Loader2, ArrowUpDown, Folder, CalendarDays, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn, formatRelativeTime } from '@/lib/utils'
import { useSessionsStore, useSessions, useSelectedSession, useIsSessionsLoading } from '@/stores'
import type { SessionSortBy } from '@/stores'
import { getSession, getSessionListStats } from '@/services/sessions'
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

/** Sort option labels */
const SORT_LABELS: Record<SessionSortBy, string> = {
  recent: 'Most Recent',
  duration: 'Duration',
  messages: 'Message Count',
}

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

/** Format date to YYYY-MM-DD for input[type=date] */
function toDateInputValue(date: Date): string {
  return date.toISOString().slice(0, 10)
}

export function SessionsList() {
  const sessions = useSessions()
  const selectedSession = useSelectedSession()
  const isLoading = useIsSessionsLoading()
  const searchQuery = useSessionsStore((s) => s.searchQuery)
  const filterHarness = useSessionsStore((s) => s.filterHarness)
  const filterProject = useSessionsStore((s) => s.filterProject)
  const filterDateStart = useSessionsStore((s) => s.filterDateStart)
  const filterDateEnd = useSessionsStore((s) => s.filterDateEnd)
  const sortBy = useSessionsStore((s) => s.sortBy)
  const sortOrder = useSessionsStore((s) => s.sortOrder)
  const setSearchQuery = useSessionsStore((s) => s.setSearchQuery)
  const setFilterHarness = useSessionsStore((s) => s.setFilterHarness)
  const setFilterProject = useSessionsStore((s) => s.setFilterProject)
  const setFilterDateStart = useSessionsStore((s) => s.setFilterDateStart)
  const setFilterDateEnd = useSessionsStore((s) => s.setFilterDateEnd)
  const setSortBy = useSessionsStore((s) => s.setSortBy)
  const setSortOrder = useSessionsStore((s) => s.setSortOrder)
  const selectSession = useSessionsStore((s) => s.selectSession)

  // Local input state for debounce
  const [localSearch, setLocalSearch] = useState(searchQuery)
  const [projects, setProjects] = useState<string[]>([])

  // Debounced search - update store 300ms after typing stops
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(localSearch)
    }, 300)
    return () => clearTimeout(timer)
  }, [localSearch, setSearchQuery])

  // Sync local state if store search query changes externally (e.g. clearFilters)
  useEffect(() => {
    setLocalSearch(searchQuery)
  }, [searchQuery])

  // Load project list on mount
  useEffect(() => {
    getSessionListStats().then((stats) => setProjects(stats.projects))
  }, [])

  const hasActiveFilters = useMemo(
    () =>
      filterHarness !== null ||
      filterProject !== null ||
      filterDateStart !== null ||
      filterDateEnd !== null,
    [filterHarness, filterProject, filterDateStart, filterDateEnd]
  )

  const handleSelect = useCallback(
    async (summary: SessionSummary) => {
      const full = await getSession(summary.id)
      selectSession(full)
    },
    [selectSession]
  )

  return (
    <div className="flex h-full flex-col">
      {/* Search */}
      <div className="relative p-3">
        <Search className="absolute left-6 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search sessions..."
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Filter row: harness pills + sort + project + date */}
      <div className="space-y-2 px-3 pb-3">
        {/* Harness filter pills */}
        <div className="flex flex-wrap gap-1.5">
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

        {/* Sort + Project + Date controls */}
        <div className="flex items-center gap-1.5">
          {/* Sort dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-7 gap-1 px-2 text-xs">
                <ArrowUpDown className="h-3 w-3" />
                {SORT_LABELS[sortBy]}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-44">
              <DropdownMenuLabel className="text-xs">Sort by</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
                value={sortBy}
                onValueChange={(v) => setSortBy(v as SessionSortBy)}
              >
                <DropdownMenuRadioItem value="recent">Most Recent</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="duration">Duration</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="messages">Message Count</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-xs">Order</DropdownMenuLabel>
              <DropdownMenuRadioGroup
                value={sortOrder}
                onValueChange={(v) => setSortOrder(v as 'asc' | 'desc')}
              >
                <DropdownMenuRadioItem value="desc">Descending</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="asc">Ascending</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Project filter dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant={filterProject ? 'secondary' : 'outline'}
                size="sm"
                className="h-7 gap-1 px-2 text-xs"
              >
                <Folder className="h-3 w-3" />
                {filterProject ?? 'Project'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuLabel className="text-xs">Filter by project</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
                value={filterProject ?? ''}
                onValueChange={(v) => setFilterProject(v || null)}
              >
                <DropdownMenuRadioItem value="">All projects</DropdownMenuRadioItem>
                {projects.map((project) => (
                  <DropdownMenuRadioItem key={project} value={project}>
                    {project}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Date range toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant={filterDateStart || filterDateEnd ? 'secondary' : 'outline'}
                size="sm"
                className="h-7 gap-1 px-2 text-xs"
              >
                <CalendarDays className="h-3 w-3" />
                Date
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 p-3">
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">From</label>
                <input
                  type="date"
                  className="w-full rounded-md border bg-background px-2 py-1 text-xs"
                  value={filterDateStart ? toDateInputValue(filterDateStart) : ''}
                  onChange={(e) =>
                    setFilterDateStart(e.target.value ? new Date(e.target.value) : null)
                  }
                />
                <label className="text-xs font-medium text-muted-foreground">To</label>
                <input
                  type="date"
                  className="w-full rounded-md border bg-background px-2 py-1 text-xs"
                  value={filterDateEnd ? toDateInputValue(filterDateEnd) : ''}
                  onChange={(e) =>
                    setFilterDateEnd(e.target.value ? new Date(e.target.value) : null)
                  }
                />
                {(filterDateStart || filterDateEnd) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-full text-xs"
                    onClick={() => {
                      setFilterDateStart(null)
                      setFilterDateEnd(null)
                    }}
                  >
                    Clear dates
                  </Button>
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Clear all filters */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 px-2 text-xs text-muted-foreground"
              onClick={() => useSessionsStore.getState().clearFilters()}
            >
              <X className="h-3 w-3" />
              Clear
            </Button>
          )}
        </div>
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
