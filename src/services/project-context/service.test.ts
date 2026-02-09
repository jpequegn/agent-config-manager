/**
 * Project Context Service Tests
 */

import { describe, it, expect } from 'vitest'
import { scanProjects, getProjectContext, getContextFileContent, getProjectStats } from './service'

describe('ProjectContextService', () => {
  describe('scanProjects', () => {
    it('should return a list of projects', async () => {
      const projects = await scanProjects()
      expect(projects.length).toBeGreaterThan(0)
    })

    it('should include project names and paths', async () => {
      const projects = await scanProjects()
      for (const project of projects) {
        expect(project.projectName).toBeTruthy()
        expect(project.projectPath).toBeTruthy()
        expect(project.lastModified).toBeInstanceOf(Date)
      }
    })

    it('should include context files for each project', async () => {
      const projects = await scanProjects()
      for (const project of projects) {
        expect(project.contextFiles.length).toBeGreaterThan(0)
        for (const file of project.contextFiles) {
          expect(file.fileName).toBeTruthy()
          expect(file.filePath).toBeTruthy()
          expect(file.harness).toBeTruthy()
          expect(file.size).toBeGreaterThan(0)
          expect(file.lastModified).toBeInstanceOf(Date)
        }
      }
    })
  })

  describe('getProjectContext', () => {
    it('should return a specific project by path', async () => {
      const project = await getProjectContext('~/Code/agent-config-manager')
      expect(project).not.toBeNull()
      expect(project!.projectName).toBe('agent-config-manager')
    })

    it('should return null for unknown project path', async () => {
      const project = await getProjectContext('/nonexistent/path')
      expect(project).toBeNull()
    })
  })

  describe('getContextFileContent', () => {
    it('should return content for known file paths', async () => {
      const content = await getContextFileContent('~/Code/agent-config-manager/CLAUDE.md')
      expect(content).toContain('Agent Config Manager')
    })

    it('should return fallback for unknown file paths', async () => {
      const content = await getContextFileContent('/nonexistent/file.md')
      expect(content).toContain('File not found')
    })
  })

  describe('getProjectStats', () => {
    it('should return aggregate statistics', async () => {
      const stats = await getProjectStats()
      expect(stats.totalProjects).toBeGreaterThan(0)
      expect(stats.totalContextFiles).toBeGreaterThan(0)
      expect(stats.totalSize).toBeGreaterThan(0)
      expect(stats.byHarness.length).toBeGreaterThan(0)
    })

    it('should have correct total file count', async () => {
      const projects = await scanProjects()
      const expectedFileCount = projects.reduce((sum, p) => sum + p.contextFiles.length, 0)
      const stats = await getProjectStats()
      expect(stats.totalContextFiles).toBe(expectedFileCount)
    })

    it('should have harness breakdown that sums to total', async () => {
      const stats = await getProjectStats()
      const harnessTotal = stats.byHarness.reduce((sum, h) => sum + h.count, 0)
      expect(harnessTotal).toBe(stats.totalContextFiles)
    })
  })
})
