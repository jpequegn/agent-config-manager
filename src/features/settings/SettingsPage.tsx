/**
 * SettingsPage Component
 * Main page for settings viewer with category tree and settings list
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
import { listSettings, getSettingsRaw } from '@/services/settings'
import type { SettingValue } from '@/types'
import { SettingsTree } from './SettingsTree'
import { SettingsList } from './SettingsList'

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

  const modifiedCount = settings.filter((s) => s.current.isModified).length

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

          {/* Right panel - Settings list */}
          <div className="flex-1">
            <h2 className="sr-only">Settings List</h2>
            <SettingsList />
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
