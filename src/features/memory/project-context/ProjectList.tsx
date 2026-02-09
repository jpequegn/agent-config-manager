/**
 * ProjectList Component
 * Filterable list of discovered projects with context files
 */

import { Search, FolderOpen, FileText, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn, formatRelativeTime } from '@/lib/utils'
import {
  useProjectContextStore,
  useProjects,
  useSelectedProject,
  useIsProjectScanning,
} from '@/stores'
import type { HarnessType, ProjectContext } from '@/types'

/** Harness badge colors */
const HARNESS_COLORS: Record<HarnessType, string> = {
  'claude-code': 'bg-orange-500/20 text-orange-400',
  cursor: 'bg-blue-500/20 text-blue-400',
  copilot: 'bg-purple-500/20 text-purple-400',
  cline: 'bg-green-500/20 text-green-400',
  continue: 'bg-yellow-500/20 text-yellow-400',
  aider: 'bg-red-500/20 text-red-400',
}

/** Harness short labels */
const HARNESS_LABELS: Record<HarnessType, string> = {
  'claude-code': 'Claude',
  cursor: 'Cursor',
  copilot: 'Copilot',
  cline: 'Cline',
  continue: 'Continue',
  aider: 'Aider',
}

/** All filterable harnesses */
const ALL_HARNESSES: HarnessType[] = [
  'claude-code',
  'cursor',
  'copilot',
  'cline',
  'continue',
  'aider',
]

export function ProjectList() {
  const projects = useProjects()
  const selectedProject = useSelectedProject()
  const isScanning = useIsProjectScanning()
  const searchQuery = useProjectContextStore((s) => s.searchQuery)
  const filterHarness = useProjectContextStore((s) => s.filterHarness)
  const setSearchQuery = useProjectContextStore((s) => s.setSearchQuery)
  const setFilterHarness = useProjectContextStore((s) => s.setFilterHarness)
  const selectProject = useProjectContextStore((s) => s.selectProject)

  // Filter projects
  const filtered = projects.filter((p) => {
    const matchesSearch =
      !searchQuery || p.projectName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesHarness = !filterHarness || p.contextFiles.some((f) => f.harness === filterHarness)
    return matchesSearch && matchesHarness
  })

  /** Get unique harnesses present in a project */
  function getProjectHarnesses(project: ProjectContext): HarnessType[] {
    return [...new Set(project.contextFiles.map((f) => f.harness))]
  }

  return (
    <div className="flex h-full flex-col">
      {/* Search */}
      <div className="relative p-3">
        <Search className="absolute left-6 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search projects..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Harness filter */}
      <div className="flex flex-wrap gap-1.5 px-3 pb-3">
        <Button
          variant={filterHarness === null ? 'secondary' : 'ghost'}
          size="sm"
          className="h-6 px-2 text-xs"
          onClick={() => setFilterHarness(null)}
        >
          All
        </Button>
        {ALL_HARNESSES.map((harness) => (
          <Button
            key={harness}
            variant={filterHarness === harness ? 'secondary' : 'ghost'}
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={() => setFilterHarness(filterHarness === harness ? null : harness)}
          >
            {HARNESS_LABELS[harness]}
          </Button>
        ))}
      </div>

      {/* Project list */}
      <div className="flex-1 overflow-y-auto px-3 pb-3">
        {isScanning ? (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="text-sm">Scanning projects...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground">
            <FolderOpen className="h-8 w-8" />
            <span className="text-sm">No projects found</span>
          </div>
        ) : (
          <div className="space-y-1.5">
            {filtered.map((project) => (
              <button
                key={project.projectPath}
                onClick={() => selectProject(project)}
                className={cn(
                  'flex w-full flex-col gap-1.5 rounded-lg border p-3 text-left transition-colors',
                  'hover:bg-accent/50',
                  selectedProject?.projectPath === project.projectPath
                    ? 'border-primary bg-accent'
                    : 'border-transparent'
                )}
              >
                <div className="flex items-center gap-2">
                  <FolderOpen className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="font-medium text-sm">{project.projectName}</span>
                </div>
                <div className="flex items-center gap-2 pl-6">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <FileText className="h-3 w-3" />
                    <span>{project.contextFiles.length} files</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatRelativeTime(project.lastModified)}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1 pl-6">
                  {getProjectHarnesses(project).map((harness) => (
                    <span
                      key={harness}
                      className={cn(
                        'rounded-full px-1.5 py-0.5 text-[10px] font-medium',
                        HARNESS_COLORS[harness]
                      )}
                    >
                      {HARNESS_LABELS[harness]}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
