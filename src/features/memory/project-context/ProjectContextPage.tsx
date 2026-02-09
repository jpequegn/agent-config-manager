/**
 * ProjectContextPage Component
 * Main page for project context management with two-panel layout
 */

import { useEffect } from 'react'
import { RefreshCw, FolderSearch } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useProjectContextStore, useProjects, useIsProjectScanning } from '@/stores'
import { scanProjects } from '@/services/project-context'
import { ProjectList } from './ProjectList'
import { ProjectDetail } from './ProjectDetail'
import { ContextFileViewer } from './ContextFileViewer'

export function ProjectContextPage() {
  const projects = useProjects()
  const isScanning = useIsProjectScanning()
  const setProjects = useProjectContextStore((s) => s.setProjects)
  const setIsScanning = useProjectContextStore((s) => s.setIsScanning)

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

  return (
    <div className="flex h-full flex-col">
      {/* Page header */}
      <div className="flex items-center justify-between border-b px-6 py-4">
        <div className="flex items-center gap-3">
          <FolderSearch className="h-5 w-5 text-primary" />
          <div>
            <h1 className="text-lg font-semibold">Project Context</h1>
            <p className="text-sm text-muted-foreground">
              Manage context files across your projects
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleScan}
          disabled={isScanning}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isScanning ? 'animate-spin' : ''}`} />
          {isScanning ? 'Scanning...' : 'Rescan'}
        </Button>
      </div>

      {/* Two-panel layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel - Project list */}
        <div className="w-80 shrink-0 border-r">
          <ProjectList />
        </div>

        {/* Right panel - Project detail */}
        <div className="flex-1">
          <ProjectDetail />
        </div>
      </div>

      {/* File viewer dialog */}
      <ContextFileViewer />
    </div>
  )
}
