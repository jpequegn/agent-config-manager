/**
 * Unified Search Service Tests
 */

import { describe, it, expect, beforeEach } from 'vitest'
import {
  searchAll,
  addRecentSearch,
  getRecentSearches,
  clearRecentSearches,
  TYPE_LABELS,
} from './service'

describe('UnifiedSearchService', () => {
  describe('searchAll', () => {
    it('should return empty results for empty query', async () => {
      const results = await searchAll({ query: '' })
      expect(results).toEqual([])
    })

    it('should return empty results for whitespace query', async () => {
      const results = await searchAll({ query: '   ' })
      expect(results).toEqual([])
    })

    it('should return grouped results for a broad query', async () => {
      const results = await searchAll({ query: 'code' })
      expect(results.length).toBeGreaterThan(0)

      // Each group should have type and label
      for (const group of results) {
        expect(group.type).toBeTruthy()
        expect(group.label).toBeTruthy()
        expect(group.results.length).toBeGreaterThan(0)
      }
    })

    it('should find skills by name', async () => {
      const results = await searchAll({ query: 'commit' })
      const skillGroup = results.find((g) => g.type === 'skill')
      expect(skillGroup).toBeDefined()
      expect(skillGroup!.results.length).toBeGreaterThan(0)
    })

    it('should find settings by name', async () => {
      const results = await searchAll({ query: 'theme' })
      const settingGroup = results.find((g) => g.type === 'setting')
      expect(settingGroup).toBeDefined()
      expect(settingGroup!.results.length).toBeGreaterThan(0)
    })

    it('should find projects by name', async () => {
      const results = await searchAll({ query: 'dashboard' })
      const projectGroup = results.find((g) => g.type === 'project')
      expect(projectGroup).toBeDefined()
      expect(projectGroup!.results.length).toBeGreaterThan(0)
    })

    it('should sort results by relevance score', async () => {
      const results = await searchAll({ query: 'code' })
      for (const group of results) {
        for (let i = 1; i < group.results.length; i++) {
          expect(group.results[i - 1].score).toBeGreaterThanOrEqual(group.results[i].score)
        }
      }
    })

    it('should respect maxResultsPerGroup', async () => {
      const results = await searchAll({ query: 'a', maxResultsPerGroup: 2 })
      for (const group of results) {
        expect(group.results.length).toBeLessThanOrEqual(2)
      }
    })

    it('should include type and id in each result', async () => {
      const results = await searchAll({ query: 'code' })
      for (const group of results) {
        for (const result of group.results) {
          expect(result.id).toBeTruthy()
          expect(result.type).toBeTruthy()
          expect(result.title).toBeTruthy()
          expect(result.score).toBeGreaterThan(0)
        }
      }
    })

    it('should return no results for non-matching query', async () => {
      const results = await searchAll({ query: 'xyznonexistentquery123' })
      expect(results).toEqual([])
    })
  })

  describe('recentSearches', () => {
    beforeEach(() => {
      clearRecentSearches()
    })

    it('should start empty', () => {
      expect(getRecentSearches()).toEqual([])
    })

    it('should add a recent search', () => {
      addRecentSearch('test query')
      expect(getRecentSearches()).toEqual(['test query'])
    })

    it('should add multiple searches in order', () => {
      addRecentSearch('first')
      addRecentSearch('second')
      addRecentSearch('third')
      expect(getRecentSearches()).toEqual(['third', 'second', 'first'])
    })

    it('should deduplicate searches', () => {
      addRecentSearch('query')
      addRecentSearch('other')
      addRecentSearch('query')
      expect(getRecentSearches()).toEqual(['query', 'other'])
    })

    it('should limit to max recent searches', () => {
      for (let i = 0; i < 15; i++) {
        addRecentSearch(`query-${i}`)
      }
      expect(getRecentSearches().length).toBeLessThanOrEqual(8)
    })

    it('should not add empty queries', () => {
      addRecentSearch('')
      addRecentSearch('   ')
      expect(getRecentSearches()).toEqual([])
    })

    it('should clear recent searches', () => {
      addRecentSearch('test')
      clearRecentSearches()
      expect(getRecentSearches()).toEqual([])
    })

    it('should return a copy of recent searches', () => {
      addRecentSearch('test')
      const searches = getRecentSearches()
      searches.push('modified')
      expect(getRecentSearches()).toEqual(['test'])
    })
  })

  describe('TYPE_LABELS', () => {
    it('should have labels for all result types', () => {
      expect(TYPE_LABELS.skill).toBe('Skills')
      expect(TYPE_LABELS.hook).toBe('Hooks')
      expect(TYPE_LABELS.setting).toBe('Settings')
      expect(TYPE_LABELS.project).toBe('Projects')
      expect(TYPE_LABELS.tool).toBe('Tools')
      expect(TYPE_LABELS.session).toBe('Sessions')
      expect(TYPE_LABELS.learning).toBe('Learnings')
    })
  })
})
