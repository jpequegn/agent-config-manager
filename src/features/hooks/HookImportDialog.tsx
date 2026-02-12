/**
 * HookImportDialog Component
 * Import hooks from JSON file, paste, or URL
 */

import { useState, useCallback } from 'react'
import { Upload, Link, FileText, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { importHooks, importHooksFromUrl } from '@/services/hooks'
import type { HookImportResult } from '@/services/hooks'

type ImportMode = 'paste' | 'url'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImportComplete: () => void
}

export function HookImportDialog({ open, onOpenChange, onImportComplete }: Props) {
  const [mode, setMode] = useState<ImportMode>('paste')
  const [pasteContent, setPasteContent] = useState('')
  const [urlValue, setUrlValue] = useState('')
  const [isImporting, setIsImporting] = useState(false)
  const [result, setResult] = useState<HookImportResult | null>(null)

  const resetState = useCallback(() => {
    setPasteContent('')
    setUrlValue('')
    setResult(null)
    setIsImporting(false)
  }, [])

  const handleImport = useCallback(async () => {
    setIsImporting(true)
    setResult(null)

    try {
      let importResult: HookImportResult
      if (mode === 'paste') {
        importResult = await importHooks(pasteContent)
      } else {
        importResult = await importHooksFromUrl(urlValue)
      }
      setResult(importResult)
      if (importResult.success) {
        onImportComplete()
      }
    } finally {
      setIsImporting(false)
    }
  }, [mode, pasteContent, urlValue, onImportComplete])

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (ev) => {
      const content = ev.target?.result as string
      setPasteContent(content)
      setMode('paste')
    }
    reader.readAsText(file)
    e.target.value = ''
  }, [])

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o)
        if (!o) resetState()
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Import Hooks</DialogTitle>
          <DialogDescription>
            Import hooks from a JSON file, paste content, or URL
          </DialogDescription>
        </DialogHeader>

        {/* Mode selector */}
        <div className="flex gap-1 rounded-lg bg-muted p-1">
          <button
            onClick={() => setMode('paste')}
            className={cn(
              'flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
              mode === 'paste'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <FileText className="mr-1.5 inline-block h-3.5 w-3.5" />
            Paste / File
          </button>
          <button
            onClick={() => setMode('url')}
            className={cn(
              'flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
              mode === 'url'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Link className="mr-1.5 inline-block h-3.5 w-3.5" />
            From URL
          </button>
        </div>

        {/* Paste / file mode */}
        {mode === 'paste' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <label className="relative cursor-pointer">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="sr-only"
                  aria-label="Upload JSON file"
                />
                <span className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-accent transition-colors">
                  <Upload className="h-3.5 w-3.5" />
                  Upload File
                </span>
              </label>
              <span className="text-xs text-muted-foreground">or paste JSON below</span>
            </div>
            <textarea
              value={pasteContent}
              onChange={(e) => setPasteContent(e.target.value)}
              placeholder='{"version": 1, "hooks": [...]}'
              className="h-40 w-full rounded-md border bg-background px-3 py-2 text-xs font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              aria-label="Hook JSON content"
            />
          </div>
        )}

        {/* URL mode */}
        {mode === 'url' && (
          <div className="space-y-3">
            <Input
              value={urlValue}
              onChange={(e) => setUrlValue(e.target.value)}
              placeholder="https://example.com/hooks.json"
              aria-label="Hook source URL"
            />
            <p className="text-xs text-muted-foreground">
              Enter a URL that returns hook export JSON. Supports GitHub raw file URLs and API
              endpoints.
            </p>
          </div>
        )}

        {/* Result feedback */}
        {result && (
          <div
            className={cn(
              'rounded-lg border px-4 py-3',
              result.success
                ? 'border-green-500/30 bg-green-500/10'
                : 'border-red-500/30 bg-red-500/10'
            )}
          >
            <div className="flex items-center gap-2">
              {result.success ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
              <span
                className={cn(
                  'text-sm font-medium',
                  result.success ? 'text-green-500' : 'text-red-500'
                )}
              >
                {result.success
                  ? `Imported ${result.imported} hook${result.imported !== 1 ? 's' : ''}`
                  : 'Import failed'}
              </span>
            </div>
            {result.skipped > 0 && (
              <p className="mt-1 text-xs text-muted-foreground">
                {result.skipped} hook{result.skipped !== 1 ? 's' : ''} skipped
              </p>
            )}
            {result.errors.map((err, i) => (
              <p key={i} className="mt-1 text-xs text-red-500">
                {err}
              </p>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {result?.success ? 'Close' : 'Cancel'}
          </Button>
          {!result?.success && (
            <Button
              onClick={handleImport}
              disabled={isImporting || (mode === 'paste' ? !pasteContent.trim() : !urlValue.trim())}
            >
              <Upload className="mr-2 h-4 w-4" />
              {isImporting ? 'Importing...' : 'Import'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
