/**
 * HookExportDialog Component
 * Export selected or all hooks to shareable JSON format
 */

import { useState, useCallback } from 'react'
import { Download, Copy, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import type { HookExportData } from '@/services/hooks'

interface Props {
  onClose: () => void
  exportData: HookExportData
  hookCount: number
}

function HookExportContent({ onClose, exportData, hookCount }: Props) {
  const [copied, setCopied] = useState(false)

  const jsonString = JSON.stringify(exportData, null, 2)

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(jsonString)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [jsonString])

  const handleDownload = useCallback(() => {
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `hooks-export-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [jsonString])

  return (
    <DialogContent className="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>Export Hooks</DialogTitle>
        <DialogDescription>
          {hookCount > 0
            ? `Export ${hookCount} hook${hookCount !== 1 ? 's' : ''}`
            : 'Export all hooks'}{' '}
          to shareable JSON format
        </DialogDescription>
      </DialogHeader>

      {/* Stats */}
      <div className="flex items-center gap-4 text-sm">
        <span className="text-muted-foreground">
          {exportData.hooks.length} hook{exportData.hooks.length !== 1 ? 's' : ''}
        </span>
        <span className="text-muted-foreground">{jsonString.length.toLocaleString()} bytes</span>
      </div>

      {/* Preview */}
      <pre className="max-h-60 overflow-auto rounded-lg border bg-muted/50 p-3 text-xs font-mono">
        {jsonString}
      </pre>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 pt-2">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
        <Button variant="outline" onClick={handleCopy}>
          {copied ? (
            <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
          ) : (
            <Copy className="mr-2 h-4 w-4" />
          )}
          {copied ? 'Copied!' : 'Copy'}
        </Button>
        <Button onClick={handleDownload}>
          <Download className="mr-2 h-4 w-4" />
          Download JSON
        </Button>
      </div>
    </DialogContent>
  )
}

interface HookExportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  exportData: HookExportData | null
  selectedCount: number
}

export function HookExportDialog({
  open,
  onOpenChange,
  exportData,
  selectedCount,
}: HookExportDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open && exportData && (
        <HookExportContent
          onClose={() => onOpenChange(false)}
          exportData={exportData}
          hookCount={selectedCount}
        />
      )}
    </Dialog>
  )
}
