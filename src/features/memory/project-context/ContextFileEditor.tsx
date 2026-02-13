/**
 * ContextFileEditor Component
 * Dialog for editing context files with live preview, template insertion, and validation
 */

import { useEffect, useState } from 'react'
import { AlertTriangle, Eye, Pencil, FileText, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { cn, formatBytes } from '@/lib/utils'
import type { ProjectContextFile, HarnessType } from '@/types'
import {
  getContextFileContent,
  saveContextFile,
  validateContextFile,
  getContextTemplates,
  createContextFile,
  type ContextFileValidationError,
  type ContextFileTemplate,
} from '@/services/project-context'

/** Harness display names */
const HARNESS_NAMES: Record<string, string> = {
  'claude-code': 'Claude Code',
  cursor: 'Cursor',
  copilot: 'GitHub Copilot',
  cline: 'Cline',
  continue: 'Continue',
  aider: 'Aider',
}

type EditorTab = 'edit' | 'preview'

interface ContextFileEditorProps {
  /** File to edit (null = create new) */
  file: ProjectContextFile | null
  /** Whether the dialog is open */
  open: boolean
  /** Called when dialog should close */
  onClose: () => void
  /** Called after a successful save */
  onSaved: () => void
  /** Project path (for creating new files) */
  projectPath?: string
}

export function ContextFileEditor({
  file,
  open,
  onClose,
  onSaved,
  projectPath,
}: ContextFileEditorProps) {
  const [content, setContent] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<EditorTab>('edit')
  const [validationErrors, setValidationErrors] = useState<ContextFileValidationError[]>([])
  const [message, setMessage] = useState<string | null>(null)
  const [showTemplates, setShowTemplates] = useState(false)

  // For new file creation
  const [newFileName, setNewFileName] = useState('')
  const [newFileHarness, setNewFileHarness] = useState<HarnessType>('claude-code')

  const isNewFile = file === null
  const fileName = isNewFile ? newFileName : file.fileName
  const fileType = isNewFile ? inferFileType(newFileName) : file.type

  /** Load existing file content */
  useEffect(() => {
    if (!open) return

    if (file) {
      setIsLoading(true)
      getContextFileContent(file.filePath).then((result) => {
        setContent(result)
        setIsLoading(false)
      })
    } else {
      setContent('')
      setNewFileName('')
      setNewFileHarness('claude-code')
    }
    setActiveTab('edit')
    setValidationErrors([])
    setMessage(null)
    setShowTemplates(false)
  }, [open, file])

  /** Run validation when content or fileName changes */
  useEffect(() => {
    if (!content.trim() || !fileName) {
      setValidationErrors([])
      return
    }
    const result = validateContextFile(content, fileType, fileName)
    setValidationErrors(result.errors)
  }, [content, fileName, fileType])

  /** Clear message after delay */
  useEffect(() => {
    if (!message) return
    const timer = setTimeout(() => setMessage(null), 3000)
    return () => clearTimeout(timer)
  }, [message])

  const hasErrors = validationErrors.some((e) => e.severity === 'error')
  const hasWarnings = validationErrors.some((e) => e.severity === 'warning')

  async function handleSave() {
    if (hasErrors) return

    setIsSaving(true)
    try {
      if (isNewFile && projectPath) {
        const result = await createContextFile(
          projectPath,
          newFileName,
          content,
          fileType,
          newFileHarness
        )
        if (!result.success) {
          setMessage(result.error ?? 'Failed to create file')
          return
        }
      } else if (file) {
        const result = await saveContextFile(file.filePath, content)
        if (!result.success) {
          setMessage(result.error ?? 'Failed to save')
          return
        }
      }
      onSaved()
      onClose()
    } finally {
      setIsSaving(false)
    }
  }

  function handleInsertTemplate(template: ContextFileTemplate) {
    setContent(template.content)
    if (isNewFile) {
      setNewFileName(template.fileName)
      setNewFileHarness(template.harness)
    }
    setShowTemplates(false)
  }

  const templates = getContextTemplates()

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="flex max-h-[85vh] max-w-4xl flex-col">
        <DialogHeader>
          <DialogTitle>{isNewFile ? 'Create Context File' : `Edit ${file.fileName}`}</DialogTitle>
          <DialogDescription asChild>
            <div className="flex items-center gap-3 text-xs">
              {!isNewFile && (
                <>
                  <span>{HARNESS_NAMES[file.harness] ?? file.harness}</span>
                  <span>{formatBytes(file.size)}</span>
                </>
              )}
              {message && <span className="text-yellow-400">{message}</span>}
            </div>
          </DialogDescription>
        </DialogHeader>

        {/* New file fields */}
        {isNewFile && (
          <div className="flex gap-3">
            <div className="flex-1">
              <label htmlFor="new-file-name" className="mb-1 block text-xs font-medium">
                File Name
              </label>
              <input
                id="new-file-name"
                type="text"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                placeholder="e.g. CLAUDE.md, .cursorrules"
                className="w-full rounded-md border bg-background px-3 py-1.5 text-sm"
              />
            </div>
            <div>
              <label htmlFor="new-file-harness" className="mb-1 block text-xs font-medium">
                Harness
              </label>
              <select
                id="new-file-harness"
                value={newFileHarness}
                onChange={(e) => setNewFileHarness(e.target.value as HarnessType)}
                className="rounded-md border bg-background px-3 py-1.5 text-sm"
              >
                {Object.entries(HARNESS_NAMES).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Tab bar + Template button */}
        <div className="flex items-center justify-between">
          <div className="flex rounded-md border">
            <button
              onClick={() => setActiveTab('edit')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 text-xs transition-colors',
                activeTab === 'edit'
                  ? 'bg-accent text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              aria-label="Editor"
            >
              <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
              Edit
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={cn(
                'flex items-center gap-1.5 border-l px-3 py-1.5 text-xs transition-colors',
                activeTab === 'preview'
                  ? 'bg-accent text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              aria-label="Preview"
            >
              <Eye className="h-3.5 w-3.5" aria-hidden="true" />
              Preview
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs"
            onClick={() => setShowTemplates(!showTemplates)}
          >
            <FileText className="h-3.5 w-3.5" aria-hidden="true" />
            {showTemplates ? 'Hide Templates' : 'Insert Template'}
          </Button>
        </div>

        {/* Template picker */}
        {showTemplates && (
          <div className="grid max-h-40 gap-2 overflow-auto rounded-md border p-3">
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => handleInsertTemplate(template)}
                className="flex items-start gap-3 rounded-md border p-2 text-left transition-colors hover:bg-accent/50"
              >
                <FileText className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">{template.name}</div>
                  <div className="text-xs text-muted-foreground">{template.description}</div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Editor / Preview */}
        <div className="flex-1 overflow-hidden rounded-md border">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : activeTab === 'edit' ? (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="h-full min-h-[300px] w-full resize-none bg-muted/30 p-4 font-mono text-sm leading-relaxed text-foreground outline-none"
              placeholder="Enter file content..."
              aria-label="File content editor"
              spellCheck={false}
            />
          ) : (
            <div className="h-full min-h-[300px] overflow-auto bg-muted/30 p-4">
              <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-foreground">
                {content || 'No content to preview'}
              </pre>
            </div>
          )}
        </div>

        {/* Validation errors */}
        {validationErrors.length > 0 && (
          <div className="space-y-1">
            {validationErrors.map((error, i) => (
              <div
                key={i}
                className={cn(
                  'flex items-center gap-2 rounded-md px-3 py-1.5 text-xs',
                  error.severity === 'error'
                    ? 'bg-red-500/10 text-red-400'
                    : 'bg-yellow-500/10 text-yellow-400'
                )}
              >
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                {error.line && <span>Line {error.line}:</span>}
                <span>{error.message}</span>
              </div>
            ))}
          </div>
        )}

        <DialogFooter>
          <div className="flex items-center gap-2">
            {hasWarnings && !hasErrors && (
              <span className="text-xs text-yellow-400">Warnings present</span>
            )}
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving || hasErrors || (isNewFile && !newFileName)}
            >
              {isSaving ? 'Saving...' : isNewFile ? 'Create File' : 'Save Changes'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/** Infer file type from file name */
function inferFileType(fileName: string): ProjectContextFile['type'] {
  if (fileName === 'CLAUDE.md') return 'claude-md'
  if (fileName === '.cursorrules') return 'cursorrules'
  if (fileName.includes('copilot-instructions')) return 'copilot-instructions'
  return 'other'
}
