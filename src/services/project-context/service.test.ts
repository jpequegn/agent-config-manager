/**
 * Project Context Service Tests
 */

import { describe, it, expect } from 'vitest'
import {
  scanProjects,
  getProjectContext,
  getContextFileContent,
  getProjectStats,
  getContextTemplates,
  getTemplatesForHarness,
  validateContextFile,
  saveContextFile,
  createContextFile,
} from './service'

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

  describe('getContextTemplates', () => {
    it('should return a list of templates', () => {
      const templates = getContextTemplates()
      expect(templates.length).toBeGreaterThan(0)
    })

    it('should include templates for multiple harnesses', () => {
      const templates = getContextTemplates()
      const harnesses = new Set(templates.map((t) => t.harness))
      expect(harnesses.size).toBeGreaterThan(1)
    })

    it('should include required fields for each template', () => {
      const templates = getContextTemplates()
      for (const template of templates) {
        expect(template.id).toBeTruthy()
        expect(template.name).toBeTruthy()
        expect(template.description).toBeTruthy()
        expect(template.fileName).toBeTruthy()
        expect(template.content).toBeTruthy()
      }
    })
  })

  describe('getTemplatesForHarness', () => {
    it('should filter templates by harness', () => {
      const cursorTemplates = getTemplatesForHarness('cursor')
      expect(cursorTemplates.length).toBeGreaterThan(0)
      for (const template of cursorTemplates) {
        expect(template.harness).toBe('cursor')
      }
    })

    it('should return empty for harness with no templates', () => {
      const clineTemplates = getTemplatesForHarness('cline')
      expect(clineTemplates).toEqual([])
    })
  })

  describe('validateContextFile', () => {
    it('should pass valid markdown content', () => {
      const result = validateContextFile('# Heading\n\nContent here', 'claude-md', 'CLAUDE.md')
      expect(result.valid).toBe(true)
      expect(result.errors).toEqual([])
    })

    it('should fail empty content', () => {
      const result = validateContextFile('', 'claude-md', 'CLAUDE.md')
      expect(result.valid).toBe(false)
      expect(result.errors[0].message).toContain('empty')
    })

    it('should warn on markdown without heading', () => {
      const result = validateContextFile('Just some text', 'claude-md', 'CLAUDE.md')
      expect(result.valid).toBe(true) // warnings don't invalidate
      expect(
        result.errors.some((e) => e.severity === 'warning' && e.message.includes('heading'))
      ).toBe(true)
    })

    it('should fail invalid JSON', () => {
      const result = validateContextFile('{ invalid json }', 'other', '.continuerc.json')
      expect(result.valid).toBe(false)
      expect(result.errors[0].message).toContain('JSON syntax error')
    })

    it('should pass valid JSON', () => {
      const result = validateContextFile('{"key": "value"}', 'other', '.continuerc.json')
      expect(result.valid).toBe(true)
    })

    it('should fail YAML with tabs', () => {
      const result = validateContextFile('\tkey: value', 'other', '.aider.conf.yml')
      expect(result.valid).toBe(false)
      expect(result.errors[0].message).toContain('spaces')
    })

    it('should pass valid YAML', () => {
      const result = validateContextFile('key: value\nother: 42', 'other', '.aider.conf.yml')
      expect(result.valid).toBe(true)
    })

    it('should warn on very large files', () => {
      const largeContent = '# Heading\n' + 'x'.repeat(60000)
      const result = validateContextFile(largeContent, 'claude-md', 'CLAUDE.md')
      expect(
        result.errors.some((e) => e.severity === 'warning' && e.message.includes('large'))
      ).toBe(true)
    })
  })

  describe('saveContextFile', () => {
    it('should save content to existing file', async () => {
      const result = await saveContextFile(
        '~/Code/agent-config-manager/CLAUDE.md',
        '# Updated Content'
      )
      expect(result.success).toBe(true)

      // Verify content was updated
      const content = await getContextFileContent('~/Code/agent-config-manager/CLAUDE.md')
      expect(content).toBe('# Updated Content')
    })
  })

  describe('createContextFile', () => {
    it('should create a new file in a project', async () => {
      const result = await createContextFile(
        '~/Code/data-pipeline',
        '.cursorrules',
        'Python project rules',
        'cursorrules',
        'cursor'
      )
      expect(result.success).toBe(true)
      expect(result.file).toBeDefined()
      expect(result.file!.fileName).toBe('.cursorrules')
    })

    it('should fail for unknown project', async () => {
      const result = await createContextFile(
        '/nonexistent',
        'CLAUDE.md',
        '# Content',
        'claude-md',
        'claude-code'
      )
      expect(result.success).toBe(false)
      expect(result.error).toContain('not found')
    })

    it('should fail if file already exists', async () => {
      const result = await createContextFile(
        '~/Code/agent-config-manager',
        'CLAUDE.md',
        '# Content',
        'claude-md',
        'claude-code'
      )
      expect(result.success).toBe(false)
      expect(result.error).toContain('already exists')
    })
  })
})
