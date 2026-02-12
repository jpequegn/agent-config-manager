/**
 * Skills Service Tests
 */

import { describe, it, expect } from 'vitest'
import {
  listSkills,
  getSkill,
  getSkillListStats,
  SKILL_CATEGORIES,
  validateSkillContent,
  saveSkill,
  toggleSkillStatus,
  duplicateSkill,
  duplicateSkillToHarness,
  deleteSkill,
} from './service'

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

  describe('validateSkillContent', () => {
    it('should pass for valid content', async () => {
      const result = await validateSkillContent(
        'My Skill',
        '# My Skill\n\nDoes things.',
        'development'
      )
      expect(result.valid).toBe(true)
      expect(result.errors).toEqual([])
    })

    it('should fail for empty name', async () => {
      const result = await validateSkillContent('', '# Content', 'development')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Skill name is required')
    })

    it('should fail for empty content', async () => {
      const result = await validateSkillContent('Name', '', 'development')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Skill content is required')
    })

    it('should warn for short content', async () => {
      const result = await validateSkillContent('Name', '# Short', 'development')
      expect(result.warnings.length).toBeGreaterThan(0)
    })

    it('should warn when content lacks heading', async () => {
      const result = await validateSkillContent(
        'Name',
        'No heading here, just text content.',
        'development'
      )
      expect(result.warnings).toContain('Skill content should start with a markdown heading')
    })
  })

  describe('saveSkill', () => {
    it('should create a new skill', async () => {
      const skill = await saveSkill({
        name: 'New Test Skill',
        description: 'A brand new skill',
        category: 'testing',
        content: '# New Test Skill\n\nContent here.',
        harness: 'claude-code',
      })
      expect(skill.id).toBeTruthy()
      expect(skill.metadata.name).toBe('New Test Skill')
      expect(skill.status).toBe('enabled')
    })

    it('should update an existing skill', async () => {
      const skills = await listSkills()
      const existing = skills[0]
      const updated = await saveSkill(
        {
          name: 'Updated Name',
          description: 'Updated desc',
          category: 'core',
          content: '# Updated',
          harness: existing.harness,
        },
        existing.id
      )
      expect(updated.metadata.name).toBe('Updated Name')
    })

    it('should throw for unknown skill ID on update', async () => {
      await expect(
        saveSkill(
          {
            name: 'X',
            description: 'X',
            category: 'core',
            content: '# X',
            harness: 'claude-code',
          },
          'nonexistent-id'
        )
      ).rejects.toThrow()
    })
  })

  describe('toggleSkillStatus', () => {
    it('should toggle from enabled to disabled', async () => {
      const skills = await listSkills({ status: 'enabled' })
      const id = skills[0].id
      const toggled = await toggleSkillStatus(id)
      expect(toggled.status).toBe('disabled')
    })

    it('should throw for unknown ID', async () => {
      await expect(toggleSkillStatus('nonexistent')).rejects.toThrow()
    })
  })

  describe('duplicateSkill', () => {
    it('should create a copy with (copy) suffix', async () => {
      const skills = await listSkills()
      const original = skills[0]
      const copy = await duplicateSkill(original.id)
      expect(copy.metadata.name).toContain('(copy)')
      expect(copy.id).not.toBe(original.id)
      expect(copy.status).toBe('disabled')
      expect(copy.stats.invocationCount).toBe(0)
    })

    it('should throw for unknown ID', async () => {
      await expect(duplicateSkill('nonexistent')).rejects.toThrow()
    })
  })

  describe('duplicateSkillToHarness', () => {
    it('should duplicate to a different harness', async () => {
      const skills = await listSkills({ harness: 'claude-code' })
      const original = skills[0]
      const copy = await duplicateSkillToHarness(original.id, 'cursor')
      expect(copy.harness).toBe('cursor')
      expect(copy.id).not.toBe(original.id)
      expect(copy.status).toBe('disabled')
    })

    it('should throw for unknown ID', async () => {
      await expect(duplicateSkillToHarness('nonexistent', 'cursor')).rejects.toThrow()
    })
  })

  describe('deleteSkill', () => {
    it('should delete an existing skill', async () => {
      const created = await saveSkill({
        name: 'To Delete',
        description: 'Will be deleted',
        category: 'custom',
        content: '# To Delete',
        harness: 'cline',
      })
      const result = await deleteSkill(created.id)
      expect(result.success).toBe(true)

      const skill = await getSkill(created.id)
      expect(skill).toBeNull()
    })

    it('should return failure for unknown ID', async () => {
      const result = await deleteSkill('nonexistent')
      expect(result.success).toBe(false)
    })
  })
})
