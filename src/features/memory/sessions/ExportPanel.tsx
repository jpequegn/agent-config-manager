/**
 * ExportPanel Component
 * Export sessions in JSON or Markdown format
 */

import { useState } from 'react'
import { Download, FileJson, FileText, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn, formatBytes } from '@/lib/utils'
import { useSessionMemoryStore } from '@/stores/session-memory-store'
import { exportSessions } from '@/services/session-memory'
import type { SessionExportFormat, SessionExportData } from '@/services/session-memory'
import type { SessionSummary } from '@/types'

interface Props {
  sessions: SessionSummary[]
}

const FORMAT_OPTIONS: {
  id: SessionExportFormat
  label: string
  description: string
  icon: React.ComponentType<{ className?: string }>
}[] = [
  {
    id: 'json',
    label: 'JSON',
    description: 'Machine-readable format for data processing',
    icon: FileJson,
  },
  {
    id: 'markdown',
    label: 'Markdown',
    description: 'Human-readable format for documentation',
    icon: FileText,
  },
]

export function ExportPanel({ sessions }: Props) {
  const selectedIds = useSessionMemoryStore((s) => s.selectedIds)
  const [format, setFormat] = useState<SessionExportFormat>('json')
  const [isExporting, setIsExporting] = useState(false)
  const [exportResult, setExportResult] = useState<SessionExportData | null>(null)

  const sessionsToExport =
    selectedIds.size > 0 ? sessions.filter((s) => selectedIds.has(s.id)) : sessions

  const exportCount = sessionsToExport.length
  const isSubset = selectedIds.size > 0

  async function handleExport() {
    setIsExporting(true)
    setExportResult(null)
    try {
      const result = await exportSessions(sessionsToExport, format)
      setExportResult(result)
      useSessionMemoryStore
        .getState()
        .setLastOperationMessage(
          `Exported ${exportCount} session${exportCount !== 1 ? 's' : ''} as ${format.toUpperCase()}`
        )
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Download className="h-5 w-5 text-primary" />
          <h3 className="text-sm font-medium">Export Sessions</h3>
        </div>
        <p className="text-xs text-muted-foreground">
          {isSubset
            ? `Export ${exportCount} selected session${exportCount !== 1 ? 's' : ''}`
            : `Export all ${exportCount} session${exportCount !== 1 ? 's' : ''}`}
        </p>
      </div>

      {/* Format selection */}
      <div className="mb-6">
        <div className="mb-2 text-xs font-medium text-muted-foreground">Export Format</div>
        <div className="grid grid-cols-2 gap-3">
          {FORMAT_OPTIONS.map((opt) => {
            const Icon = opt.icon
            const isActive = format === opt.id
            return (
              <button
                key={opt.id}
                onClick={() => {
                  setFormat(opt.id)
                  setExportResult(null)
                }}
                className={cn(
                  'flex items-start gap-3 rounded-lg border p-4 text-left transition-colors',
                  isActive ? 'border-primary bg-primary/5' : 'hover:bg-accent/50'
                )}
              >
                <Icon
                  className={cn(
                    'h-5 w-5 mt-0.5',
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  )}
                />
                <div>
                  <div className="text-sm font-medium">{opt.label}</div>
                  <div className="text-xs text-muted-foreground">{opt.description}</div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Export button */}
      <Button onClick={handleExport} disabled={isExporting || exportCount === 0} className="w-full">
        <Download className="mr-2 h-4 w-4" />
        {isExporting
          ? 'Exporting...'
          : `Export ${exportCount} Session${exportCount !== 1 ? 's' : ''} as ${format.toUpperCase()}`}
      </Button>

      {/* Export result */}
      {exportResult && (
        <div className="mt-6 rounded-lg border p-4">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium">Export Complete</span>
          </div>
          <div className="space-y-1 text-xs text-muted-foreground">
            <div>File: {exportResult.filename}</div>
            <div>Size: {formatBytes(exportResult.size)}</div>
            <div>Format: {exportResult.format.toUpperCase()}</div>
          </div>

          {/* Preview */}
          <div className="mt-3">
            <div className="mb-1 text-xs font-medium text-muted-foreground">Preview</div>
            <pre className="max-h-48 overflow-auto rounded-md bg-muted p-3 text-[11px] leading-relaxed">
              {exportResult.content.slice(0, 1000)}
              {exportResult.content.length > 1000 && '\n... (truncated)'}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}
