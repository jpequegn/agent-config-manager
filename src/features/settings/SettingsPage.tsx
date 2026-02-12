/**
 * SettingsPage Component
 * Main page for settings editor with inline editing, validation, diff preview, and save/discard
 */

import { useEffect, useState } from 'react'
import { RefreshCw, Settings2, List, Code } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  useSettingsStore,
  useSettingsList,
  useIsSettingsLoading,
  useSettingsViewMode,
} from '@/stores'
import { listSettings, getSettingsRaw, updateSetting, resetSetting } from '@/services/settings'
import type { SettingValue } from '@/types'
import { SettingsTree } from './SettingsTree'
import { SettingsList } from './SettingsList'
import { DiffPreview } from './DiffPreview'

export function SettingsPage() {
  const settings = useSettingsList()
  const isLoading = useIsSettingsLoading()
  const viewMode = useSettingsViewMode()
  const setSettings = useSettingsStore((s) => s.setSettings)
  const setIsLoading = useSettingsStore((s) => s.setIsLoading)
  const setViewMode = useSettingsStore((s) => s.setViewMode)
  const searchQuery = useSettingsStore((s) => s.searchQuery)
  const activeCategory = useSettingsStore((s) => s.activeCategory)
  const modifiedOnly = useSettingsStore((s) => s.modifiedOnly)

  const [rawData, setRawData] = useState<Record<string, SettingValue> | null>(null)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [message, setMessage] = useState<string | null>(null)

  /** Load settings with current filters */
  async function handleLoad() {
    setIsLoading(true)
    try {
      const [results, raw] = await Promise.all([
        listSettings({
          searchText: searchQuery || undefined,
          modifiedOnly: modifiedOnly || undefined,
        }),
        getSettingsRaw(),
      ])
      setSettings(results)
      setRawData(raw)
    } finally {
      setIsLoading(false)
    }
  }

  // Auto-load on mount and when filters change
  useEffect(() => {
    handleLoad()
  }, [searchQuery, activeCategory, modifiedOnly]) // eslint-disable-line react-hooks/exhaustive-deps

  // Clear message after delay
  useEffect(() => {
    if (!message) return
    const timer = setTimeout(() => setMessage(null), 3000)
    return () => clearTimeout(timer)
  }, [message])

  const modifiedCount = settings.filter((s) => s.current.isModified).length

  async function handleUpdateSetting(key: string, value: SettingValue) {
    const result = await updateSetting(key, value)
    if (!result.success && result.error) {
      setValidationErrors((prev) => ({ ...prev, [key]: result.error! }))
    } else {
      setValidationErrors((prev) => {
        const next = { ...prev }
        delete next[key]
        return next
      })
      setRefreshTrigger((n) => n + 1)
    }
  }

  async function handleResetSetting(key: string) {
    await resetSetting(key)
    setValidationErrors((prev) => {
      const next = { ...prev }
      delete next[key]
      return next
    })
    setRefreshTrigger((n) => n + 1)
  }

  function handleSaved() {
    setMessage('Settings saved')
    handleLoad()
  }

  function handleDiscarded() {
    setMessage('Changes discarded')
    setValidationErrors({})
    handleLoad()
  }

  return (
    <div className="flex h-full flex-col">
      {/* Page header */}
      <div className="flex items-center justify-between border-b px-6 py-4">
        <div className="flex items-center gap-3">
          <Settings2 className="h-5 w-5 text-primary" aria-hidden="true" />
          <div>
            <h1 className="text-lg font-semibold">Settings</h1>
            <p className="text-sm text-muted-foreground">View and manage configuration</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {message && (
            <span className="text-xs text-green-400" role="status">
              {message}
            </span>
          )}
          <span className="text-sm text-muted-foreground" role="status" aria-live="polite">
            {modifiedCount} modified / {settings.length} total
          </span>

          {/* View mode toggle */}
          <div className="flex rounded-md border">
            <button
              onClick={() => setViewMode('tree')}
              className={cn(
                'flex items-center gap-1 px-2.5 py-1.5 text-xs transition-colors',
                viewMode === 'tree'
                  ? 'bg-accent text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              aria-label="Tree view"
            >
              <List className="h-3.5 w-3.5" aria-hidden="true" />
              Tree
            </button>
            <button
              onClick={() => setViewMode('raw')}
              className={cn(
                'flex items-center gap-1 border-l px-2.5 py-1.5 text-xs transition-colors',
                viewMode === 'raw'
                  ? 'bg-accent text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              aria-label="Raw JSON view"
            >
              <Code className="h-3.5 w-3.5" aria-hidden="true" />
              Raw
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleLoad}
            disabled={isLoading}
            aria-label={isLoading ? 'Loading settings' : 'Refresh settings'}
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

      {/* Content */}
      {viewMode === 'tree' ? (
        <div className="flex flex-1 overflow-hidden">
          {/* Left panel - Category tree */}
          <div className="w-64 shrink-0 border-r">
            <h2 className="sr-only">Settings Categories</h2>
            <SettingsTree />
          </div>

          {/* Right panel - Settings list with inline editing */}
          <div className="flex flex-1 flex-col overflow-hidden">
            <div className="flex-1 overflow-auto">
              <h2 className="sr-only">Settings List</h2>
              <SettingsList
                onUpdate={handleUpdateSetting}
                onReset={handleResetSetting}
                validationErrors={validationErrors}
              />
            </div>

            {/* Diff preview */}
            <DiffPreview
              onSaved={handleSaved}
              onDiscarded={handleDiscarded}
              refreshTrigger={refreshTrigger}
            />
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-auto p-6">
          <pre className="overflow-auto rounded-md bg-muted p-4 font-mono text-xs leading-relaxed text-foreground">
            {rawData ? JSON.stringify(rawData, null, 2) : 'Loading...'}
          </pre>
        </div>
      )}
    </div>
  )
}
