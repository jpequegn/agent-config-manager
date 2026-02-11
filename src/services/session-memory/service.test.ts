/**
 * Session Memory Service Tests
 */

import { describe, it, expect } from 'vitest'
import {
  getAutoPruneRules,
  togglePruneRule,
  bulkDeleteSessions,
  bulkArchiveSessions,
  addTagsToSessions,
  removeTagsFromSessions,
  exportSessions,
  getAllSessionTags,
} from './service'
import type { SessionSummary } from '@/types'

const mockSessions: SessionSummary[] = [
  {
    id: 'test-1',
    harness: 'claude-code',
    title: 'Test Session',
    startedAt: new Date(),
    duration: 60000,
    messageCount: 5,
    tags: ['feature'],
  },
  {
    id: 'test-2',
    harness: 'cursor',
    title: 'Another Session',
    project: 'my-project',
    startedAt: new Date(),
    endedAt: new Date(),
    duration: 120000,
    messageCount: 10,
    tags: ['bugfix'],
  },
]

describe('SessionMemoryService', () => {
  describe('getAutoPruneRules', () => {
    it('should return prune rules', async () => {
      const rules = await getAutoPruneRules()
      expect(rules.length).toBeGreaterThan(0)
      for (const rule of rules) {
        expect(rule.id).toBeTruthy()
        expect(rule.name).toBeTruthy()
        expect(typeof rule.enabled).toBe('boolean')
      }
    })
  })

  describe('togglePruneRule', () => {
    it('should toggle a rule', async () => {
      const rules = await getAutoPruneRules()
      const originalEnabled = rules[0].enabled
      const toggled = await togglePruneRule(rules[0].id)
      expect(toggled).not.toBeNull()
      expect(toggled!.enabled).toBe(!originalEnabled)
      // Toggle back
      await togglePruneRule(rules[0].id)
    })

    it('should return null for unknown rule', async () => {
      const result = await togglePruneRule('nonexistent')
      expect(result).toBeNull()
    })
  })

  describe('bulkDeleteSessions', () => {
    it('should return success result', async () => {
      const result = await bulkDeleteSessions(['sess-1', 'sess-2'])
      expect(result.success).toBe(true)
      expect(result.affected).toBe(2)
      expect(result.message).toContain('2')
    })
  })

  describe('bulkArchiveSessions', () => {
    it('should return success result', async () => {
      const result = await bulkArchiveSessions(['sess-1'])
      expect(result.success).toBe(true)
      expect(result.affected).toBe(1)
    })
  })

  describe('addTagsToSessions', () => {
    it('should return success result', async () => {
      const result = await addTagsToSessions(['sess-1'], ['tag1', 'tag2'])
      expect(result.success).toBe(true)
      expect(result.message).toContain('2 tags')
    })
  })

  describe('removeTagsFromSessions', () => {
    it('should return success result', async () => {
      const result = await removeTagsFromSessions(['sess-1'], ['tag1'])
      expect(result.success).toBe(true)
      expect(result.message).toContain('1 tag')
    })
  })

  describe('exportSessions', () => {
    it('should export as JSON', async () => {
      const result = await exportSessions(mockSessions, 'json')
      expect(result.format).toBe('json')
      expect(result.filename).toContain('.json')
      expect(result.size).toBeGreaterThan(0)
      const parsed = JSON.parse(result.content)
      expect(parsed.length).toBe(2)
    })

    it('should export as Markdown', async () => {
      const result = await exportSessions(mockSessions, 'markdown')
      expect(result.format).toBe('markdown')
      expect(result.filename).toContain('.md')
      expect(result.content).toContain('# Sessions Export')
      expect(result.content).toContain('Test Session')
      expect(result.content).toContain('Another Session')
    })
  })

  describe('getAllSessionTags', () => {
    it('should return sorted tag list', async () => {
      const tags = await getAllSessionTags()
      expect(tags.length).toBeGreaterThan(0)
      // Check sorted
      const sorted = [...tags].sort()
      expect(tags).toEqual(sorted)
    })
  })
})
