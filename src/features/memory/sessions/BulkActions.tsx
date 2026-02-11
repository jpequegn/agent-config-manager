/**
 * BulkActions Component
 * Actions panel for bulk session operations: delete, archive, tag
 */

import { useState } from 'react'
import { Trash2, Archive, Tag, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useSessionMemoryStore } from '@/stores/session-memory-store'
import {
  bulkDeleteSessions,
  bulkArchiveSessions,
  addTagsToSessions,
  removeTagsFromSessions,
} from '@/services/session-memory'
import type { SessionSummary } from '@/types'

interface Props {
  sessions: SessionSummary[]
}

export function BulkActions({ sessions }: Props) {
  const selectedIds = useSessionMemoryStore((s) => s.selectedIds)
  const isBulkOperating = useSessionMemoryStore((s) => s.isBulkOperating)
  const [tagInput, setTagInput] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)

  const selectedCount = selectedIds.size
  const hasSelection = selectedCount > 0

  // Get tags from selected sessions
  const selectedSessions = sessions.filter((s) => selectedIds.has(s.id))
  const selectedTags = new Set<string>()
  for (const s of selectedSessions) {
    for (const t of s.tags ?? []) selectedTags.add(t)
  }

  async function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    const store = useSessionMemoryStore.getState()
    store.setIsBulkOperating(true)
    try {
      const result = await bulkDeleteSessions([...selectedIds])
      store.setLastOperationMessage(result.message)
      store.clearSelection()
    } finally {
      store.setIsBulkOperating(false)
      setConfirmDelete(false)
    }
  }

  async function handleArchive() {
    const store = useSessionMemoryStore.getState()
    store.setIsBulkOperating(true)
    try {
      const result = await bulkArchiveSessions([...selectedIds])
      store.setLastOperationMessage(result.message)
      store.clearSelection()
    } finally {
      store.setIsBulkOperating(false)
    }
  }

  async function handleAddTag() {
    if (!tagInput.trim()) return
    const store = useSessionMemoryStore.getState()
    store.setIsBulkOperating(true)
    try {
      const tags = tagInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
      const result = await addTagsToSessions([...selectedIds], tags)
      store.setLastOperationMessage(result.message)
      setTagInput('')
    } finally {
      store.setIsBulkOperating(false)
    }
  }

  async function handleRemoveTag(tag: string) {
    const store = useSessionMemoryStore.getState()
    store.setIsBulkOperating(true)
    try {
      const result = await removeTagsFromSessions([...selectedIds], [tag])
      store.setLastOperationMessage(result.message)
    } finally {
      store.setIsBulkOperating(false)
    }
  }

  if (!hasSelection) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-muted-foreground">
        <Archive className="h-10 w-10" />
        <p className="text-sm">Select sessions to perform bulk operations</p>
        <p className="text-xs">Use checkboxes in the left panel to select sessions</p>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h3 className="mb-4 text-sm font-medium">
        Bulk Actions ({selectedCount} session{selectedCount !== 1 ? 's' : ''})
      </h3>

      <div className="space-y-6">
        {/* Delete */}
        <div className="rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trash2 className="h-4 w-4 text-destructive" />
              <div>
                <div className="text-sm font-medium">Delete Sessions</div>
                <div className="text-xs text-muted-foreground">
                  Permanently remove selected sessions
                </div>
              </div>
            </div>
            <Button
              variant={confirmDelete ? 'destructive' : 'outline'}
              size="sm"
              onClick={handleDelete}
              disabled={isBulkOperating}
            >
              {confirmDelete ? (
                <>
                  <AlertTriangle className="mr-1 h-3 w-3" />
                  Confirm Delete
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </div>
          {confirmDelete && (
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs text-destructive">
                This will permanently delete {selectedCount} session
                {selectedCount !== 1 ? 's' : ''}. This cannot be undone.
              </span>
              <button
                onClick={() => setConfirmDelete(false)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Archive */}
        <div className="rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Archive className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">Archive Sessions</div>
                <div className="text-xs text-muted-foreground">
                  Move selected sessions to archive storage
                </div>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleArchive} disabled={isBulkOperating}>
              Archive
            </Button>
          </div>
        </div>

        {/* Tagging */}
        <div className="rounded-lg border p-4">
          <div className="flex items-center gap-2 mb-3">
            <Tag className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="text-sm font-medium">Manage Tags</div>
              <div className="text-xs text-muted-foreground">
                Add or remove tags from selected sessions
              </div>
            </div>
          </div>

          {/* Add tags */}
          <div className="flex items-center gap-2">
            <Input
              placeholder="Add tags (comma-separated)..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
              className="h-8 text-xs"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddTag}
              disabled={isBulkOperating || !tagInput.trim()}
            >
              Add
            </Button>
          </div>

          {/* Existing tags on selected sessions */}
          {selectedTags.size > 0 && (
            <div className="mt-3">
              <div className="mb-1.5 text-xs text-muted-foreground">Tags on selected sessions:</div>
              <div className="flex flex-wrap gap-1.5">
                {[...selectedTags].sort().map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs"
                  >
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="text-muted-foreground hover:text-foreground"
                      aria-label={`Remove tag ${tag}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
