/**
 * CommunityHooksDialog Component
 * Browse and import hooks from community sources
 */

import { useState, useEffect, useCallback } from 'react'
import { Globe, Star, Tag, Download, ExternalLink, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { listCommunitySources, importHooksFromUrl } from '@/services/hooks'
import type { CommunityHookSource, HookImportResult } from '@/services/hooks'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImportComplete: () => void
}

export function CommunityHooksDialog({ open, onOpenChange, onImportComplete }: Props) {
  const [sources, setSources] = useState<CommunityHookSource[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [importingId, setImportingId] = useState<string | null>(null)
  const [importedIds, setImportedIds] = useState<Set<string>>(new Set())
  const [lastResult, setLastResult] = useState<HookImportResult | null>(null)

  useEffect(() => {
    if (!open) {
      setImportedIds(new Set())
      setLastResult(null)
      return
    }

    setIsLoading(true)
    listCommunitySources()
      .then(setSources)
      .finally(() => setIsLoading(false))
  }, [open])

  const handleImport = useCallback(
    async (source: CommunityHookSource) => {
      setImportingId(source.id)
      setLastResult(null)

      try {
        const result = await importHooksFromUrl(source.url)
        setLastResult(result)
        if (result.success) {
          setImportedIds((prev) => new Set(prev).add(source.id))
          onImportComplete()
        }
      } finally {
        setImportingId(null)
      }
    },
    [onImportComplete]
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Community Hook Sources</DialogTitle>
          <DialogDescription>Browse and import hooks shared by the community</DialogDescription>
        </DialogHeader>

        {/* Result feedback */}
        {lastResult && (
          <div
            className={cn(
              'rounded-lg border px-4 py-2 text-sm',
              lastResult.success
                ? 'border-green-500/30 bg-green-500/10 text-green-500'
                : 'border-red-500/30 bg-red-500/10 text-red-500'
            )}
          >
            {lastResult.success
              ? `Imported ${lastResult.imported} hook${lastResult.imported !== 1 ? 's' : ''}`
              : `Import failed: ${lastResult.errors.join(', ')}`}
          </div>
        )}

        {/* Sources list */}
        <div className="flex-1 overflow-auto space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <span className="text-sm text-muted-foreground">Loading community sources...</span>
            </div>
          ) : (
            sources.map((source) => {
              const isImported = importedIds.has(source.id)
              const isImporting = importingId === source.id

              return (
                <div
                  key={source.id}
                  className={cn(
                    'rounded-lg border p-4 transition-colors',
                    isImported && 'border-green-500/30 bg-green-500/5'
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 shrink-0 text-primary" />
                        <h4 className="text-sm font-medium truncate">{source.name}</h4>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                        {source.description}
                      </p>
                      <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{source.author}</span>
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          {source.stars}
                        </span>
                        <span>{source.hookCount} hooks</span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {source.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
                          >
                            <Tag className="h-2.5 w-2.5" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-col items-end gap-2">
                      {isImported ? (
                        <span className="flex items-center gap-1.5 text-xs text-green-500">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Imported
                        </span>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleImport(source)}
                          disabled={isImporting}
                        >
                          <Download className="mr-1.5 h-3.5 w-3.5" />
                          {isImporting ? 'Importing...' : 'Import'}
                        </Button>
                      )}
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <ExternalLink className="h-2.5 w-2.5" />
                        View source
                      </a>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        <div className="flex items-center justify-end pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
