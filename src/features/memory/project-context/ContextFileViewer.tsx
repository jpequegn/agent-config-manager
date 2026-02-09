/**
 * ContextFileViewer Component
 * Dialog that displays the content of a context file with metadata
 */

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { formatBytes, formatRelativeTime } from '@/lib/utils'
import { useProjectContextStore, useSelectedFile } from '@/stores'
import { useEffect, useState } from 'react'
import { getContextFileContent } from '@/services/project-context'
import { Loader2 } from 'lucide-react'

/** Harness display names */
const HARNESS_NAMES: Record<string, string> = {
  'claude-code': 'Claude Code',
  cursor: 'Cursor',
  copilot: 'GitHub Copilot',
  cline: 'Cline',
  continue: 'Continue',
  aider: 'Aider',
}

/** Custom hook for loading file content */
function useFileContent(filePath: string | null) {
  // Track which file path the current content belongs to
  const [loadedPath, setLoadedPath] = useState<string | null>(null)
  const [content, setContent] = useState('')

  useEffect(() => {
    if (!filePath) return

    let cancelled = false

    getContextFileContent(filePath).then((result) => {
      if (!cancelled) {
        setContent(result)
        setLoadedPath(filePath)
      }
    })

    return () => {
      cancelled = true
    }
  }, [filePath])

  // Derive loading state: loading when we have a file path but haven't loaded it yet
  const isLoading = filePath !== null && loadedPath !== filePath

  return { content: isLoading ? '' : content, isLoading }
}

export function ContextFileViewer() {
  const selectedFile = useSelectedFile()
  const selectFile = useProjectContextStore((s) => s.selectFile)
  const { content, isLoading } = useFileContent(selectedFile?.filePath ?? null)

  return (
    <Dialog open={selectedFile !== null} onOpenChange={(open) => !open && selectFile(null)}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">{selectedFile?.fileName}</DialogTitle>
          <DialogDescription asChild>
            <div className="flex items-center gap-3 text-xs">
              <span>{HARNESS_NAMES[selectedFile?.harness ?? ''] ?? selectedFile?.harness}</span>
              <span>{selectedFile ? formatBytes(selectedFile.size) : ''}</span>
              <span>
                {selectedFile ? `Modified ${formatRelativeTime(selectedFile.lastModified)}` : ''}
              </span>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto rounded-md border bg-muted/50 p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-foreground">
              {content}
            </pre>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
