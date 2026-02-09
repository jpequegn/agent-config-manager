/**
 * Learnings Service Tests
 */

import { describe, it, expect } from 'vitest'
import {
  listLearnings,
  getLearning,
  getLearningStats,
  exportLearnings,
  importLearnings,
  LEARNING_CATEGORIES,
} from './service'

describe('LearningsService', () => {
  describe('listLearnings', () => {
    it('should return a list of learning summaries', async () => {
      const learnings = await listLearnings()
      expect(learnings.length).toBeGreaterThan(0)
    })

    it('should include required fields on each summary', async () => {
      const learnings = await listLearnings()
      for (const learning of learnings) {
        expect(learning.id).toBeTruthy()
        expect(learning.title).toBeTruthy()
        expect(learning.type).toBe('learning')
        expect(learning.size).toBeGreaterThan(0)
        expect(learning.createdAt).toBeInstanceOf(Date)
      }
    })

    it('should filter by category', async () => {
      const debugging = await listLearnings({ category: 'debugging' })
      expect(debugging.length).toBeGreaterThan(0)
      for (const l of debugging) {
        expect(l.category).toBe('debugging')
      }
    })

    it('should filter by harness', async () => {
      const cursorLearnings = await listLearnings({ harness: 'cursor' })
      expect(cursorLearnings.length).toBeGreaterThan(0)
      for (const l of cursorLearnings) {
        expect(l.harness).toBe('cursor')
      }
    })

    it('should filter by search query', async () => {
      const results = await listLearnings({ search: 'zustand' })
      expect(results.length).toBeGreaterThan(0)
      for (const l of results) {
        const titleMatch = l.title.toLowerCase().includes('zustand')
        // Content is not on summary, so just check title matches
        expect(titleMatch || l.id === 'learn-001' || l.id === 'learn-004').toBe(true)
      }
    })

    it('should return empty for non-matching filters', async () => {
      const results = await listLearnings({ search: 'xyznonexistent123' })
      expect(results).toEqual([])
    })
  })

  describe('getLearning', () => {
    it('should return full entry by ID', async () => {
      const learning = await getLearning('learn-001')
      expect(learning).not.toBeNull()
      expect(learning!.id).toBe('learn-001')
      expect(learning!.content).toBeTruthy()
      expect(learning!.metadata).toBeDefined()
    })

    it('should return null for unknown ID', async () => {
      const learning = await getLearning('nonexistent')
      expect(learning).toBeNull()
    })
  })

  describe('getLearningStats', () => {
    it('should return aggregate statistics', async () => {
      const stats = await getLearningStats()
      expect(stats.totalLearnings).toBeGreaterThan(0)
      expect(stats.totalSize).toBeGreaterThan(0)
      expect(stats.byCategory.length).toBeGreaterThan(0)
      expect(stats.byHarness.length).toBeGreaterThan(0)
    })

    it('should have category breakdown that sums to total', async () => {
      const stats = await getLearningStats()
      const categoryTotal = stats.byCategory.reduce((sum, c) => sum + c.count, 0)
      expect(categoryTotal).toBe(stats.totalLearnings)
    })

    it('should have harness breakdown that sums to total', async () => {
      const stats = await getLearningStats()
      const harnessTotal = stats.byHarness.reduce((sum, h) => sum + h.count, 0)
      expect(harnessTotal).toBe(stats.totalLearnings)
    })
  })

  describe('exportLearnings', () => {
    it('should export as JSON', async () => {
      const all = await listLearnings()
      const ids = all.map((l) => l.id)
      const json = await exportLearnings(ids, 'json')
      const parsed = JSON.parse(json)
      expect(Array.isArray(parsed)).toBe(true)
      expect(parsed.length).toBe(all.length)
    })

    it('should export as markdown', async () => {
      const data = await exportLearnings(['learn-001'], 'markdown')
      expect(data).toContain('# Zustand persist')
      expect(data).toContain('**Category:**')
    })

    it('should return empty array for no matching IDs', async () => {
      const json = await exportLearnings(['nonexistent'], 'json')
      expect(JSON.parse(json)).toEqual([])
    })
  })

  describe('importLearnings', () => {
    it('should return count of imported entries', async () => {
      const count = await importLearnings(JSON.stringify([{ id: '1' }, { id: '2' }]))
      expect(count).toBe(2)
    })

    it('should return 0 for invalid JSON', async () => {
      const count = await importLearnings('not json')
      expect(count).toBe(0)
    })
  })

  describe('LEARNING_CATEGORIES', () => {
    it('should have all 8 categories', () => {
      expect(LEARNING_CATEGORIES).toHaveLength(8)
      const values = LEARNING_CATEGORIES.map((c) => c.value)
      expect(values).toContain('debugging')
      expect(values).toContain('architecture')
      expect(values).toContain('patterns')
      expect(values).toContain('other')
    })
  })
})
