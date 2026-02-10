/**
 * ConversationsPage Component
 * Main page for the conversation/session browser
 */

import { useEffect } from 'react'
import { RefreshCw, History } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSessionsStore, useSessions, useIsSessionsLoading } from '@/stores'
import { listSessions } from '@/services/sessions'
import { SessionsList } from './SessionsList'
import { SessionDetail } from './SessionDetail'

export function ConversationsPage() {
  const sessions = useSessions()
  const isLoading = useIsSessionsLoading()
  const setSessions = useSessionsStore((s) => s.setSessions)
  const setIsLoading = useSessionsStore((s) => s.setIsLoading)
  const searchQuery = useSessionsStore((s) => s.searchQuery)
  const filterHarness = useSessionsStore((s) => s.filterHarness)
  const filterProject = useSessionsStore((s) => s.filterProject)
  const filterDateStart = useSessionsStore((s) => s.filterDateStart)
  const filterDateEnd = useSessionsStore((s) => s.filterDateEnd)
  const sortBy = useSessionsStore((s) => s.sortBy)
  const sortOrder = useSessionsStore((s) => s.sortOrder)

  /** Load sessions with current filters and sort */
  async function handleLoad() {
    setIsLoading(true)
    try {
      const results = await listSessions(
        {
          harness: filterHarness ?? undefined,
          project: filterProject ?? undefined,
          searchText: searchQuery || undefined,
          startDate: filterDateStart ?? undefined,
          endDate: filterDateEnd ?? undefined,
        },
        { sortBy, sortOrder }
      )
      setSessions(results)
    } finally {
      setIsLoading(false)
    }
  }

  // Auto-load on mount and when filters/sort change
  useEffect(() => {
    handleLoad()
  }, [searchQuery, filterHarness, filterProject, filterDateStart, filterDateEnd, sortBy, sortOrder]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex h-full flex-col">
      {/* Page header */}
      <div className="flex items-center justify-between border-b px-6 py-4">
        <div className="flex items-center gap-3">
          <History className="h-5 w-5 text-primary" aria-hidden="true" />
          <div>
            <h1 className="text-lg font-semibold">Sessions</h1>
            <p className="text-sm text-muted-foreground">Browse and search conversation history</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="text-sm text-muted-foreground"
            role="status"
            aria-live="polite"
            aria-label={`${sessions.length} session${sessions.length !== 1 ? 's' : ''} available`}
          >
            {sessions.length} session{sessions.length !== 1 ? 's' : ''}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLoad}
            disabled={isLoading}
            aria-label={isLoading ? 'Loading sessions' : 'Refresh sessions'}
            className="gap-2"
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
              aria-hidden="true"
            />
            {isLoading ? 'Loading...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Two-panel layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel - Sessions list */}
        <div className="w-80 shrink-0 border-r">
          <h2 className="sr-only">Sessions List</h2>
          <SessionsList />
        </div>

        {/* Right panel - Session detail */}
        <div className="flex-1">
          <h2 className="sr-only">Session Details</h2>
          <SessionDetail />
        </div>
      </div>
    </div>
  )
}
