/**
 * Project Context Store Tests
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { useProjectContextStore } from './project-context-store'
import type { ProjectContext, ProjectContextFile } from '@/types'

const mockFile: ProjectContextFile = {
  type: 'claude-md',
  fileName: 'CLAUDE.md',
  filePath: '~/Code/test-project/CLAUDE.md',
  size: 4096,
  harness: 'claude-code',
  lastModified: new Date(),
}

const mockProject: ProjectContext = {
  projectName: 'test-project',
  projectPath: '~/Code/test-project',
  lastModified: new Date(),
  contextFiles: [mockFile],
}

describe('ProjectContextStore', () => {
  beforeEach(() => {
    const store = useProjectContextStore.getState()
    store.setProjects([])
    store.selectProject(null)
    store.setIsScanning(false)
    store.setSearchQuery('')
    store.setFilterHarness(null)
  })

  it('should start with defaults after reset', () => {
    const state = useProjectContextStore.getState()
    expect(state.projects).toEqual([])
    expect(state.selectedProject).toBeNull()
    expect(state.selectedFile).toBeNull()
    expect(state.isScanning).toBe(false)
    expect(state.searchQuery).toBe('')
    expect(state.filterHarness).toBeNull()
  })

  it('should set projects', () => {
    useProjectContextStore.getState().setProjects([mockProject])
    expect(useProjectContextStore.getState().projects).toEqual([mockProject])
  })

  it('should select a project and clear file selection', () => {
    useProjectContextStore.getState().selectFile(mockFile)
    useProjectContextStore.getState().selectProject(mockProject)
    const state = useProjectContextStore.getState()
    expect(state.selectedProject).toEqual(mockProject)
    expect(state.selectedFile).toBeNull()
  })

  it('should select a file', () => {
    useProjectContextStore.getState().selectFile(mockFile)
    expect(useProjectContextStore.getState().selectedFile).toEqual(mockFile)
  })

  it('should set scanning state', () => {
    useProjectContextStore.getState().setIsScanning(true)
    expect(useProjectContextStore.getState().isScanning).toBe(true)
  })

  it('should set search query', () => {
    useProjectContextStore.getState().setSearchQuery('test')
    expect(useProjectContextStore.getState().searchQuery).toBe('test')
  })

  it('should set harness filter', () => {
    useProjectContextStore.getState().setFilterHarness('cursor')
    expect(useProjectContextStore.getState().filterHarness).toBe('cursor')
  })

  it('should clear harness filter', () => {
    useProjectContextStore.getState().setFilterHarness('cursor')
    useProjectContextStore.getState().setFilterHarness(null)
    expect(useProjectContextStore.getState().filterHarness).toBeNull()
  })

  it('should clear selection', () => {
    useProjectContextStore.getState().selectProject(mockProject)
    useProjectContextStore.getState().selectFile(mockFile)
    useProjectContextStore.getState().clearSelection()
    const state = useProjectContextStore.getState()
    expect(state.selectedProject).toBeNull()
    expect(state.selectedFile).toBeNull()
  })
})
