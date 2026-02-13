/**
 * ProjectContextPage Component
 * Main page for project context management with two-panel layout and editing
 */

import { useEffect, useState } from 'react'
import { RefreshCw, FolderSearch, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  useProjectContextStore,
  useProjects,
  useSelectedProject,
  useIsProjectScanning,
} from '@/stores'
import { scanProjects } from '@/services/project-context'
import type { ProjectContextFile } from '@/types'
import { ProjectList } from './ProjectList'
import { ProjectDetail } from './ProjectDetail'
import { ContextFileViewer } from './ContextFileViewer'
import { ContextFileEditor } from './ContextFileEditor'

export function ProjectContextPage() {
  const projects = useProjects()
  const selectedProject = useSelectedProject()
  const isScanning = useIsProjectScanning()
  const setProjects = useProjectContextStore((s) => s.setProjects)
  const setIsScanning = useProjectContextStore((s) => s.setIsScanning)

  const [editorOpen, setEditorOpen] = useState(false)
  const [editingFile, setEditingFile] = useState<ProjectContextFile | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  /** Scan for projects */
  async function handleScan() {
    setIsScanning(true)
    try {
      const results = await scanProjects()
      setProjects(results)
    } finally {
      setIsScanning(false)
    }
  }

  // Auto-scan on mount
  useEffect(() => {
    if (projects.length === 0) {
      handleScan()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Clear message after delay
  useEffect(() => {
    if (!message) return
    const timer = setTimeout(() => setMessage(null), 3000)
    return () => clearTimeout(timer)
  }, [message])

  function handleEditFile(file: ProjectContextFile) {
    setEditingFile(file)
    setEditorOpen(true)
  }

  function handleCreateFile() {
    setEditingFile(null)
    setEditorOpen(true)
  }

  function handleEditorSaved() {
    setMessage(editingFile ? 'File saved' : 'File created')
    handleScan()
  }

  return (
    <div className="flex h-full flex-col">
      {/* Page header */}
      <div className="flex items-center justify-between border-b px-6 py-4">
        <div className="flex items-center gap-3">
          <FolderSearch className="h-5 w-5 text-primary" aria-hidden="true" />
          <div>
            <h1 className="text-lg font-semibold">Project Context</h1>
            <p className="text-sm text-muted-foreground">
              Manage context files across your projects
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {message && (
            <span className="text-xs text-green-400" role="status">
              {message}
            </span>
          )}
          {selectedProject && (
            <Button variant="outline" size="sm" className="gap-2" onClick={handleCreateFile}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              New Context File
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleScan}
            disabled={isScanning}
            aria-label={
              isScanning ? 'Scanning projects' : `Rescan projects (${projects.length} found)`
            }
            className="gap-2"
          >
            <RefreshCw
              className={`h-4 w-4 ${isScanning ? 'animate-spin' : ''}`}
              aria-hidden="true"
            />
            {isScanning ? 'Scanning...' : 'Rescan'}
          </Button>
        </div>
      </div>

      {/* Two-panel layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel - Project list */}
        <div className="w-80 shrink-0 border-r">
          <h2 className="sr-only">Project List</h2>
          <ProjectList />
        </div>

        {/* Right panel - Project detail */}
        <div className="flex-1">
          <h2 className="sr-only">Project Details</h2>
          <ProjectDetail onEditFile={handleEditFile} />
        </div>
      </div>

      {/* File viewer dialog */}
      <ContextFileViewer />

      {/* File editor dialog */}
      <ContextFileEditor
        file={editingFile}
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        onSaved={handleEditorSaved}
        projectPath={selectedProject?.projectPath}
      />
    </div>
  )
}
