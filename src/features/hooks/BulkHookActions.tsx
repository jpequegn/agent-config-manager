/**
 * BulkHookActions Component
 * Bulk enable/disable actions for selected hooks
 */

import { useCallback } from 'react'
import { Power, PowerOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useHooksStore } from '@/stores/hooks-store'
import { bulkEnableHooks, bulkDisableHooks, getHooksGroupedByTrigger } from '@/services/hooks'

export function BulkHookActions() {
  const selectedIds = useHooksStore((s) => s.selectedIds)
  const isBulkOperating = useHooksStore((s) => s.isBulkOperating)
  const setIsBulkOperating = useHooksStore((s) => s.setIsBulkOperating)
  const setLastMessage = useHooksStore((s) => s.setLastMessage)
  const setHookGroups = useHooksStore((s) => s.setHookGroups)
  const clearSelection = useHooksStore((s) => s.clearSelection)

  const handleBulkEnable = useCallback(async () => {
    const ids = [...useHooksStore.getState().selectedIds]
    setIsBulkOperating(true)
    try {
      const result = await bulkEnableHooks(ids)
      setLastMessage(result.message)
      const groups = await getHooksGroupedByTrigger()
      setHookGroups(groups)
      clearSelection()
    } finally {
      setIsBulkOperating(false)
    }
  }, [setIsBulkOperating, setLastMessage, setHookGroups, clearSelection])

  const handleBulkDisable = useCallback(async () => {
    const ids = [...useHooksStore.getState().selectedIds]
    setIsBulkOperating(true)
    try {
      const result = await bulkDisableHooks(ids)
      setLastMessage(result.message)
      const groups = await getHooksGroupedByTrigger()
      setHookGroups(groups)
      clearSelection()
    } finally {
      setIsBulkOperating(false)
    }
  }, [setIsBulkOperating, setLastMessage, setHookGroups, clearSelection])

  if (selectedIds.size === 0) return null

  return (
    <div className="flex items-center gap-2 rounded-lg border bg-accent/30 px-4 py-2">
      <span className="text-sm font-medium">{selectedIds.size} selected</span>
      <div className="ml-auto flex gap-2">
        <Button variant="outline" size="sm" onClick={handleBulkEnable} disabled={isBulkOperating}>
          <Power className="mr-2 h-3.5 w-3.5" />
          Enable All
        </Button>
        <Button variant="outline" size="sm" onClick={handleBulkDisable} disabled={isBulkOperating}>
          <PowerOff className="mr-2 h-3.5 w-3.5" />
          Disable All
        </Button>
      </div>
    </div>
  )
}
