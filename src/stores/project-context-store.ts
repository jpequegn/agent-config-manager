/**
 * Project Context Store
 * Manages project context scanning, selection, and filtering state
 */

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { HarnessType, ProjectContext, ProjectContextFile } from '@/types'

/** Project context store state */
interface ProjectContextState {
  /** Discovered projects with context files */
  projects: ProjectContext[]
  /** Currently selected project */
  selectedProject: ProjectContext | null
  /** Currently selected context file (for viewer) */
  selectedFile: ProjectContextFile | null
  /** Whether a scan is in progress */
  isScanning: boolean
  /** Search query for filtering projects */
  searchQuery: string
  /** Filter by harness type */
  filterHarness: HarnessType | null
}

/** Project context store actions */
interface ProjectContextActions {
  /** Set the discovered projects */
  setProjects: (projects: ProjectContext[]) => void
  /** Select a project */
  selectProject: (project: ProjectContext | null) => void
  /** Select a context file for viewing */
  selectFile: (file: ProjectContextFile | null) => void
  /** Set scanning state */
  setIsScanning: (isScanning: boolean) => void
  /** Set search query */
  setSearchQuery: (query: string) => void
  /** Set harness filter */
  setFilterHarness: (harness: HarnessType | null) => void
  /** Clear all selections */
  clearSelection: () => void
}

/** Combined store type */
type ProjectContextStore = ProjectContextState & ProjectContextActions

/** Initial state */
const initialState: ProjectContextState = {
  projects: [],
  selectedProject: null,
  selectedFile: null,
  isScanning: false,
  searchQuery: '',
  filterHarness: null,
}

/**
 * Project context store
 */
export const useProjectContextStore = create<ProjectContextStore>()(
  devtools(
    (set) => ({
      ...initialState,

      setProjects: (projects) => set({ projects }, false, 'setProjects'),

      selectProject: (project) =>
        set({ selectedProject: project, selectedFile: null }, false, 'selectProject'),

      selectFile: (file) => set({ selectedFile: file }, false, 'selectFile'),

      setIsScanning: (isScanning) => set({ isScanning }, false, 'setIsScanning'),

      setSearchQuery: (query) => set({ searchQuery: query }, false, 'setSearchQuery'),

      setFilterHarness: (harness) => set({ filterHarness: harness }, false, 'setFilterHarness'),

      clearSelection: () =>
        set({ selectedProject: null, selectedFile: null }, false, 'clearSelection'),
    }),
    { name: 'ProjectContextStore' }
  )
)

/** Selector hooks */
export const useProjects = () => useProjectContextStore((state) => state.projects)
export const useSelectedProject = () => useProjectContextStore((state) => state.selectedProject)
export const useSelectedFile = () => useProjectContextStore((state) => state.selectedFile)
export const useIsProjectScanning = () => useProjectContextStore((state) => state.isScanning)
