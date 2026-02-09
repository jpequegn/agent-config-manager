/**
 * LearningsPage Component
 * Main page for the learnings/knowledge base browser
 */

import { useEffect } from 'react'
import { RefreshCw, BookOpen, Download, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLearningsStore, useLearnings, useIsLearningsLoading } from '@/stores'
import { listLearnings, exportLearnings } from '@/services/learnings'
import { LearningsList } from './LearningsList'
import { LearningDetail } from './LearningDetail'

export function LearningsPage() {
  const learnings = useLearnings()
  const isLoading = useIsLearningsLoading()
  const setLearnings = useLearningsStore((s) => s.setLearnings)
  const setIsLoading = useLearningsStore((s) => s.setIsLoading)
  const searchQuery = useLearningsStore((s) => s.searchQuery)
  const filterCategory = useLearningsStore((s) => s.filterCategory)
  const filterHarness = useLearningsStore((s) => s.filterHarness)

  /** Load learnings with current filters */
  async function handleLoad() {
    setIsLoading(true)
    try {
      const results = await listLearnings({
        category: filterCategory ?? undefined,
        harness: filterHarness ?? undefined,
        search: searchQuery || undefined,
      })
      setLearnings(results)
    } finally {
      setIsLoading(false)
    }
  }

  /** Export all visible learnings as JSON */
  async function handleExport() {
    const ids = learnings.map((l) => l.id)
    if (ids.length === 0) return

    const data = await exportLearnings(ids, 'json')
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `learnings-export-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  /** Trigger file input for import */
  function handleImport() {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) return
      // In a real implementation, would call importLearnings() and refresh
      // For now, just reload the list
      handleLoad()
    }
    input.click()
  }

  // Auto-load on mount and when filters change
  useEffect(() => {
    handleLoad()
  }, [searchQuery, filterCategory, filterHarness]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex h-full flex-col">
      {/* Page header */}
      <div className="flex items-center justify-between border-b px-6 py-4">
        <div className="flex items-center gap-3">
          <BookOpen className="h-5 w-5 text-primary" />
          <div>
            <h1 className="text-lg font-semibold">Learnings</h1>
            <p className="text-sm text-muted-foreground">Browse and search your knowledge base</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExport} className="gap-1.5">
            <Download className="h-3.5 w-3.5" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={handleImport} className="gap-1.5">
            <Upload className="h-3.5 w-3.5" />
            Import
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLoad}
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Loading...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Two-panel layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel - Learnings list */}
        <div className="w-80 shrink-0 border-r">
          <LearningsList />
        </div>

        {/* Right panel - Learning detail */}
        <div className="flex-1">
          <LearningDetail />
        </div>
      </div>
    </div>
  )
}
