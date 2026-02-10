/**
 * Skills Service Tests
 */

import { describe, it, expect } from 'vitest'
import { listSkills, getSkill, getSkillListStats, SKILL_CATEGORIES } from './service'

describe('SkillsService', () => {
  describe('listSkills', () => {
    it('should return a list of skill summaries', async () => {
      const skills = await listSkills()
      expect(skills.length).toBeGreaterThan(0)
    })

    it('should include required fields on each summary', async () => {
      const skills = await listSkills()
      for (const skill of skills) {
        expect(skill.id).toBeTruthy()
        expect(skill.name).toBeTruthy()
        expect(skill.harness).toBeTruthy()
        expect(skill.category).toBeTruthy()
        expect(skill.status).toBeTruthy()
      }
    })

    it('should filter by harness', async () => {
      const ccSkills = await listSkills({ harness: 'claude-code' })
      expect(ccSkills.length).toBeGreaterThan(0)
      for (const s of ccSkills) {
        expect(s.harness).toBe('claude-code')
      }
    })

    it('should filter by category', async () => {
      const devSkills = await listSkills({ category: 'development' })
      expect(devSkills.length).toBeGreaterThan(0)
      for (const s of devSkills) {
        expect(s.category).toBe('development')
      }
    })

    it('should filter by search text', async () => {
      const results = await listSkills({ searchText: 'commit' })
      expect(results.length).toBeGreaterThan(0)
    })

    it('should filter by status', async () => {
      const disabled = await listSkills({ status: 'disabled' })
      expect(disabled.length).toBeGreaterThan(0)
      for (const s of disabled) {
        expect(s.status).toBe('disabled')
      }
    })

    it('should return empty for non-matching filters', async () => {
      const results = await listSkills({ searchText: 'xyznonexistent123' })
      expect(results).toEqual([])
    })

    it('should combine filters', async () => {
      const results = await listSkills({
        harness: 'claude-code',
        category: 'development',
      })
      expect(results.length).toBeGreaterThan(0)
      for (const s of results) {
        expect(s.harness).toBe('claude-code')
        expect(s.category).toBe('development')
      }
    })
  })

  describe('getSkill', () => {
    it('should return full skill by ID', async () => {
      const skill = await getSkill('skill-cc-commit')
      expect(skill).not.toBeNull()
      expect(skill!.id).toBe('skill-cc-commit')
      expect(skill!.metadata.name).toBe('Commit')
      expect(skill!.content).toBeTruthy()
      expect(skill!.stats).toBeDefined()
    })

    it('should return null for unknown ID', async () => {
      const skill = await getSkill('nonexistent')
      expect(skill).toBeNull()
    })
  })

  describe('getSkillListStats', () => {
    it('should return aggregate statistics', async () => {
      const stats = await getSkillListStats()
      expect(stats.totalSkills).toBeGreaterThan(0)
      expect(stats.enabledSkills).toBeGreaterThan(0)
      expect(stats.byCategory.length).toBeGreaterThan(0)
      expect(stats.byHarness.length).toBeGreaterThan(0)
    })

    it('should have harness breakdown that sums to total', async () => {
      const stats = await getSkillListStats()
      const harnessTotal = stats.byHarness.reduce((sum, h) => sum + h.count, 0)
      expect(harnessTotal).toBe(stats.totalSkills)
    })

    it('should have category breakdown that sums to total', async () => {
      const stats = await getSkillListStats()
      const categoryTotal = stats.byCategory.reduce((sum, c) => sum + c.count, 0)
      expect(categoryTotal).toBe(stats.totalSkills)
    })

    it('should have consistent enabled + disabled + error counts', async () => {
      const stats = await getSkillListStats()
      // Enabled + disabled should be <= total (error skills exist too)
      expect(stats.enabledSkills).toBeLessThanOrEqual(stats.totalSkills)
      expect(stats.disabledSkills).toBeLessThanOrEqual(stats.totalSkills)
    })
  })

  describe('SKILL_CATEGORIES', () => {
    it('should export category list', () => {
      expect(SKILL_CATEGORIES.length).toBeGreaterThan(0)
      for (const cat of SKILL_CATEGORIES) {
        expect(cat.value).toBeTruthy()
        expect(cat.label).toBeTruthy()
      }
    })
  })
})
