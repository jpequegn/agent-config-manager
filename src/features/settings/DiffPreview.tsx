/**
 * DiffPreview Component
 * Shows pending changes before saving with save/discard controls
 */

import { useState, useEffect } from 'react'
import { Save, X, ArrowRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { getPendingChanges, saveAllChanges, discardAllChanges } from '@/services/settings'
import type { PendingChange } from '@/services/settings'

interface Props {
  onSaved: () => void
  onDiscarded: () => void
  refreshTrigger: number
}

export function DiffPreview({ onSaved, onDiscarded, refreshTrigger }: Props) {
  const [changes, setChanges] = useState<PendingChange[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [saveResult, setSaveResult] = useState<string | null>(null)

  useEffect(() => {
    getPendingChanges().then(setChanges)
  }, [refreshTrigger])

  if (changes.length === 0) return null

  async function handleSave() {
    setIsSaving(true)
    setSaveResult(null)
    try {
      const result = await saveAllChanges()
      if (result.success) {
        setSaveResult(`Saved ${result.savedCount} setting(s)`)
        setChanges([])
        onSaved()
      } else {
        setSaveResult(`Errors: ${result.errors.map((e) => e.message).join(', ')}`)
      }
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDiscard() {
    await discardAllChanges()
    setChanges([])
    onDiscarded()
  }

  return (
    <div className="border-t bg-muted/30">
      <div className="flex items-center justify-between px-6 py-2">
        <span className="text-xs font-medium">
          {changes.length} pending change{changes.length !== 1 ? 's' : ''}
        </span>
        <div className="flex items-center gap-2">
          {saveResult && (
            <span className="text-xs text-green-400" role="status">
              {saveResult}
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleDiscard}
            className="h-7 gap-1.5 text-xs"
          >
            <X className="h-3 w-3" />
            Discard
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className="h-7 gap-1.5 text-xs"
          >
            {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
            {isSaving ? 'Saving...' : 'Save All'}
          </Button>
        </div>
      </div>

      {/* Change list */}
      <div className="max-h-48 overflow-auto border-t">
        {changes.map((change) => (
          <div
            key={change.key}
            className="flex items-center gap-3 border-b px-6 py-2 last:border-b-0"
          >
            <span className="min-w-[120px] text-xs font-medium">{change.name}</span>
            <span className="font-mono text-[10px] text-muted-foreground">{change.key}</span>
            <div className="ml-auto flex items-center gap-2">
              <span
                className={cn(
                  'rounded px-1.5 py-0.5 font-mono text-[10px] line-through',
                  'bg-red-500/10 text-red-400'
                )}
              >
                {formatValue(change.oldValue)}
              </span>
              <ArrowRight className="h-3 w-3 text-muted-foreground" />
              <span
                className={cn(
                  'rounded px-1.5 py-0.5 font-mono text-[10px]',
                  'bg-green-500/10 text-green-400'
                )}
              >
                {formatValue(change.newValue)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function formatValue(value: unknown): string {
  if (typeof value === 'boolean') return String(value)
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}
