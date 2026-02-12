/**
 * HooksPage Component
 * Main hooks list and management interface
 */

import { useEffect, useCallback, useState } from 'react'
import { RefreshCw, Webhook, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useHooksStore } from '@/stores/hooks-store'
import { getHooksGroupedByTrigger, toggleHookStatus } from '@/services/hooks'
import { HookGroupSection } from './HookGroupSection'
import { BulkHookActions } from './BulkHookActions'
import { HookEditor } from './HookEditor'
import { HookTemplatesGallery } from './HookTemplatesGallery'
import type { HookTrigger, HookTemplate } from '@/types'

const TRIGGER_FILTERS: { value: HookTrigger | null; label: string }[] = [
  { value: null, label: 'All Triggers' },
  { value: 'PreToolUse', label: 'Pre Tool Use' },
  { value: 'PostToolUse', label: 'Post Tool Use' },
  { value: 'Notification', label: 'Notification' },
  { value: 'Stop', label: 'Stop' },
  { value: 'SessionStart', label: 'Session Start' },
  { value: 'SessionEnd', label: 'Session End' },
  { value: 'PreCommit', label: 'Pre Commit' },
  { value: 'PostCommit', label: 'Post Commit' },
]

export function HooksPage() {
  const [editorOpen, setEditorOpen] = useState(false)
  const [editingHookId, setEditingHookId] = useState<string | null>(null)
  const [editorTemplate, setEditorTemplate] = useState<HookTemplate | null>(null)
  const hookGroups = useHooksStore((s) => s.hookGroups)
  const isLoading = useHooksStore((s) => s.isLoading)
  const filterTrigger = useHooksStore((s) => s.filterTrigger)
  const selectedIds = useHooksStore((s) => s.selectedIds)
  const selectAll = useHooksStore((s) => s.selectAll)
  const lastMessage = useHooksStore((s) => s.lastMessage)
  const setHookGroups = useHooksStore((s) => s.setHookGroups)
  const setIsLoading = useHooksStore((s) => s.setIsLoading)
  const setFilterTrigger = useHooksStore((s) => s.setFilterTrigger)
  const toggleSelected = useHooksStore((s) => s.toggleSelected)
  const setSelectAll = useHooksStore((s) => s.setSelectAll)
  const setLastMessage = useHooksStore((s) => s.setLastMessage)

  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const groups = await getHooksGroupedByTrigger()
      setHookGroups(groups)
    } finally {
      setIsLoading(false)
    }
  }, [setHookGroups, setIsLoading])

  useEffect(() => {
    loadData()
  }, [loadData])

  const filteredGroups = filterTrigger
    ? hookGroups.filter((g) => g.trigger === filterTrigger)
    : hookGroups

  const allHookIds = filteredGroups.flatMap((g) => g.hooks.map((h) => h.id))
  const totalHooks = allHookIds.length

  const handleToggleStatus = useCallback(
    async (id: string) => {
      await toggleHookStatus(id)
      const groups = await getHooksGroupedByTrigger()
      setHookGroups(groups)
    },
    [setHookGroups]
  )

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-6 py-4">
        <div className="flex items-center gap-3">
          <Webhook className="h-5 w-5 text-primary" aria-hidden="true" />
          <div>
            <h2 className="text-lg font-semibold">Hooks</h2>
            <p className="text-sm text-muted-foreground">Manage automation hooks by trigger type</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {totalHooks > 0 && (
            <span className="text-sm text-muted-foreground">{totalHooks} hooks</span>
          )}
          <Button
            size="sm"
            onClick={() => {
              setEditingHookId(null)
              setEditorTemplate(null)
              setEditorOpen(true)
            }}
            aria-label="Create new hook"
          >
            <Plus className="mr-2 h-3.5 w-3.5" />
            New Hook
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={isLoading}
            aria-label="Refresh hooks list"
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
              onClick={() => setLastMessage(null)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Toolbar: filters + select all + bulk actions */}
      <div className="border-b px-6 py-3">
        <div className="flex items-center gap-4">
          {/* Trigger filter */}
          <div className="flex flex-wrap gap-1.5">
            {TRIGGER_FILTERS.map((f) => (
              <button
                key={f.label}
                onClick={() => setFilterTrigger(f.value)}
                className={cn(
                  'rounded-full px-2.5 py-1 text-xs font-medium transition-colors',
                  filterTrigger === f.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-accent'
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-3">
            {/* Select all */}
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={selectAll}
                onChange={(e) => setSelectAll(e.target.checked, allHookIds)}
                className="h-3.5 w-3.5 rounded border-muted-foreground"
                aria-label="Select all hooks"
              />
              Select all
            </label>
          </div>
        </div>
      </div>

      {/* Bulk actions bar */}
      {selectedIds.size > 0 && (
        <div className="border-b px-6 py-2">
          <BulkHookActions />
        </div>
      )}

      {/* Hook groups + templates */}
      <div className="flex-1 overflow-auto px-6 py-4">
        {/* Templates gallery */}
        <div className="mb-6">
          <HookTemplatesGallery
            onUseTemplate={(tpl) => {
              setEditingHookId(null)
              setEditorTemplate(tpl)
              setEditorOpen(true)
            }}
          />
        </div>

        {filteredGroups.map((group) => (
          <HookGroupSection
            key={group.trigger}
            trigger={group.trigger}
            hooks={group.hooks}
            selectedIds={selectedIds}
            onToggleSelect={toggleSelected}
            onToggleStatus={handleToggleStatus}
            onEdit={(id) => {
              setEditingHookId(id)
              setEditorTemplate(null)
              setEditorOpen(true)
            }}
          />
        ))}

        {filteredGroups.length === 0 && !isLoading && (
          <div className="py-12 text-center text-sm text-muted-foreground">
            {filterTrigger
              ? `No hooks found for trigger "${filterTrigger}"`
              : 'No hooks configured'}
          </div>
        )}
      </div>
      {/* Hook editor dialog */}
      <HookEditor
        hookId={editingHookId}
        open={editorOpen}
        onOpenChange={(open) => {
          setEditorOpen(open)
          if (!open) setEditorTemplate(null)
        }}
        template={editorTemplate}
      />
    </div>
  )
}
