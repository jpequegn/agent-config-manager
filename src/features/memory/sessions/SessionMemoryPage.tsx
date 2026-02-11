/**
 * SessionMemoryPage Component
 * Session memory management with bulk operations, tagging, export, and auto-prune
 */

import { useEffect, useCallback } from 'react'
import { RefreshCw, Database } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useSessionsStore } from '@/stores'
import { useSessionMemoryStore } from '@/stores/session-memory-store'
import { listSessions } from '@/services/sessions'
import { getAutoPruneRules } from '@/services/session-memory'
import { SessionSelectList } from './SessionSelectList'
import { BulkActions } from './BulkActions'
import { AutoPruneSettings } from './AutoPruneSettings'
import { ExportPanel } from './ExportPanel'
import type { SessionMemoryPanel } from '@/stores/session-memory-store'

const PANELS: { id: SessionMemoryPanel; label: string }[] = [
  { id: 'sessions', label: 'Sessions' },
  { id: 'prune', label: 'Auto-Prune' },
  { id: 'export', label: 'Export' },
]

export function SessionMemoryPage() {
  const sessions = useSessionsStore((s) => s.sessions)
  const isLoading = useSessionsStore((s) => s.isLoading)
  const activePanel = useSessionMemoryStore((s) => s.activePanel)
  const setActivePanel = useSessionMemoryStore((s) => s.setActivePanel)
  const selectedIds = useSessionMemoryStore((s) => s.selectedIds)
  const lastMessage = useSessionMemoryStore((s) => s.lastOperationMessage)

  const loadData = useCallback(async () => {
    const sessStore = useSessionsStore.getState()
    const memStore = useSessionMemoryStore.getState()
    sessStore.setIsLoading(true)
    try {
      const [sessionResults, rules] = await Promise.all([listSessions(), getAutoPruneRules()])
      sessStore.setSessions(sessionResults)
      memStore.setPruneRules(rules)
    } finally {
      sessStore.setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-6 py-4">
        <div className="flex items-center gap-3">
          <Database className="h-5 w-5 text-primary" aria-hidden="true" />
          <div>
            <h2 className="text-lg font-semibold">Session Memory</h2>
            <p className="text-sm text-muted-foreground">Manage, export, and prune session data</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && (
            <span className="text-sm text-muted-foreground">{selectedIds.size} selected</span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={isLoading}
            aria-label="Refresh session memory"
          >
            <RefreshCw className={cn('mr-2 h-3.5 w-3.5', isLoading && 'animate-spin')} />
            {isLoading ? 'Loading...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Operation result banner */}
      {lastMessage && (
        <div className="border-b bg-accent/30 px-6 py-2">
          <div className="flex items-center justify-between">
            <span className="text-sm">{lastMessage}</span>
            <button
              onClick={() => useSessionMemoryStore.getState().setLastOperationMessage(null)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Panel tabs */}
      <div className="border-b px-6">
        <div className="flex gap-4" role="tablist" aria-label="Session memory panels">
          {PANELS.map((panel) => (
            <button
              key={panel.id}
              role="tab"
              aria-selected={activePanel === panel.id}
              onClick={() => setActivePanel(panel.id)}
              className={cn(
                'border-b-2 px-1 py-3 text-sm font-medium transition-colors',
                activePanel === panel.id
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              {panel.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 overflow-hidden">
        {activePanel === 'sessions' && (
          <div className="flex flex-1 overflow-hidden">
            {/* Left: session list with checkboxes */}
            <div className="w-96 shrink-0 border-r overflow-auto">
              <SessionSelectList />
            </div>
            {/* Right: bulk actions */}
            <div className="flex-1 overflow-auto">
              <BulkActions sessions={sessions} />
            </div>
          </div>
        )}

        {activePanel === 'prune' && (
          <div className="flex-1 overflow-auto">
            <AutoPruneSettings />
          </div>
        )}

        {activePanel === 'export' && (
          <div className="flex-1 overflow-auto">
            <ExportPanel sessions={sessions} />
          </div>
        )}
      </div>
    </div>
  )
}
