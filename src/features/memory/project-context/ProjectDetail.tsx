/**
 * ProjectDetail Component
 * Shows context files and stats for the selected project
 */

import { FileText, FolderOpen, Eye, Pencil } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn, formatBytes, formatRelativeTime } from '@/lib/utils'
import { useProjectContextStore, useSelectedProject } from '@/stores'
import type { HarnessType, ProjectContextFile } from '@/types'

/** Harness badge colors */
const HARNESS_COLORS: Record<HarnessType, string> = {
  'claude-code': 'bg-orange-500/20 text-orange-400',
  cursor: 'bg-blue-500/20 text-blue-400',
  copilot: 'bg-purple-500/20 text-purple-400',
  cline: 'bg-green-500/20 text-green-400',
  continue: 'bg-yellow-500/20 text-yellow-400',
  aider: 'bg-red-500/20 text-red-400',
}

const HARNESS_LABELS: Record<HarnessType, string> = {
  'claude-code': 'Claude Code',
  cursor: 'Cursor',
  copilot: 'GitHub Copilot',
  cline: 'Cline',
  continue: 'Continue',
  aider: 'Aider',
}

interface ProjectDetailProps {
  onEditFile?: (file: ProjectContextFile) => void
}

export function ProjectDetail({ onEditFile }: ProjectDetailProps = {}) {
  const selectedProject = useSelectedProject()
  const selectFile = useProjectContextStore((s) => s.selectFile)

  if (!selectedProject) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
        <FolderOpen className="h-12 w-12" />
        <p className="text-sm">Select a project to view its context files</p>
      </div>
    )
  }

  const totalSize = selectedProject.contextFiles.reduce((sum, f) => sum + f.size, 0)

  return (
    <div className="flex h-full flex-col gap-4 overflow-auto p-4">
      {/* Project header */}
      <div>
        <h2 className="text-xl font-semibold">{selectedProject.projectName}</h2>
        <p className="text-sm text-muted-foreground">{selectedProject.projectPath}</p>
        <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
          <span>{selectedProject.contextFiles.length} context files</span>
          <span>{formatBytes(totalSize)} total</span>
          <span>Last modified {formatRelativeTime(selectedProject.lastModified)}</span>
        </div>
      </div>

      {/* Context files */}
      <div className="grid gap-3">
        {selectedProject.contextFiles.map((file) => (
          <Card key={file.filePath} className="transition-colors hover:bg-accent/30">
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  {file.fileName}
                </CardTitle>
                <div className="flex gap-1">
                  {onEditFile && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 gap-1.5 text-xs"
                      onClick={() => onEditFile(file)}
                      aria-label={`Edit ${file.fileName}`}
                    >
                      <Pencil className="h-3 w-3" />
                      Edit
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-1.5 text-xs"
                    onClick={() => selectFile(file)}
                  >
                    <Eye className="h-3 w-3" />
                    View
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-0">
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 text-[10px] font-medium',
                    HARNESS_COLORS[file.harness]
                  )}
                >
                  {HARNESS_LABELS[file.harness]}
                </span>
                <span className="text-xs text-muted-foreground">{formatBytes(file.size)}</span>
                <span className="text-xs text-muted-foreground">
                  {formatRelativeTime(file.lastModified)}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
