/**
 * Migration Service Tests
 */

import { describe, it, expect } from 'vitest'
import {
  checkCompatibility,
  analyzeMigration,
  createBackup,
  executeMigration,
  rollbackMigration,
  MIGRATION_STEPS,
} from './service'

describe('Migration Service', () => {
  describe('checkCompatibility', () => {
    it('should return compatibility between claude-code and cursor', async () => {
      const result = await checkCompatibility('claude-code', 'cursor')
      expect(result.source).toBe('claude-code')
      expect(result.target).toBe('cursor')
      expect(result.score).toBeGreaterThan(0)
      expect(result.level).toBeTruthy()
      expect(result.summary).toBeTruthy()
    })

    it('should return higher score for closely related harnesses', async () => {
      const ccToCline = await checkCompatibility('claude-code', 'cline')
      const ccToAider = await checkCompatibility('claude-code', 'aider')
      expect(ccToCline.score).toBeGreaterThan(ccToAider.score)
    })

    it('should include warnings for partial compatibility', async () => {
      const result = await checkCompatibility('claude-code', 'copilot')
      expect(result.warnings.length).toBeGreaterThan(0)
    })

    it('should detect unsupported features', async () => {
      const result = await checkCompatibility('claude-code', 'aider')
      expect(result.unsupportedFeatures.length).toBeGreaterThan(0)
    })

    it('should set level based on score', async () => {
      const high = await checkCompatibility('claude-code', 'cline')
      expect(high.level).toBe('full')

      const low = await checkCompatibility('copilot', 'aider')
      expect(['minimal', 'partial']).toContain(low.level)
    })
  })

  describe('analyzeMigration', () => {
    it('should return a migration plan', async () => {
      const plan = await analyzeMigration('claude-code', 'cursor')
      expect(plan.id).toBeTruthy()
      expect(plan.source).toBe('claude-code')
      expect(plan.target).toBe('cursor')
      expect(plan.items.length).toBeGreaterThan(0)
      expect(plan.compatibility).toBeTruthy()
    })

    it('should include skills in the plan', async () => {
      const plan = await analyzeMigration('claude-code', 'cursor')
      const skills = plan.items.filter((i) => i.type === 'skill')
      expect(skills.length).toBeGreaterThan(0)
    })

    it('should include hooks if source has them', async () => {
      const plan = await analyzeMigration('claude-code', 'cursor')
      const hooks = plan.items.filter((i) => i.type === 'hook')
      expect(hooks.length).toBeGreaterThan(0)
    })

    it('should include settings in the plan', async () => {
      const plan = await analyzeMigration('claude-code', 'cursor')
      const settings = plan.items.filter((i) => i.type === 'setting')
      expect(settings.length).toBeGreaterThan(0)
    })

    it('should have all items selected by default (except some hooks)', async () => {
      const plan = await analyzeMigration('claude-code', 'cursor')
      const selectedCount = plan.items.filter((i) => i.selected).length
      expect(selectedCount).toBeGreaterThan(0)
    })

    it('should set compatibility on each item', async () => {
      const plan = await analyzeMigration('claude-code', 'cursor')
      for (const item of plan.items) {
        expect(['full', 'partial', 'minimal', 'none']).toContain(item.compatibility)
      }
    })

    it('should transform content for target', async () => {
      const plan = await analyzeMigration('claude-code', 'cursor')
      const skill = plan.items.find((i) => i.type === 'skill')!
      expect(skill.targetContent).toContain('cursor')
    })
  })

  describe('createBackup', () => {
    it('should create a backup from a plan', async () => {
      const plan = await analyzeMigration('claude-code', 'cursor')
      const backup = await createBackup(plan)
      expect(backup.id).toBeTruthy()
      expect(backup.migrationId).toBe(plan.id)
      expect(backup.itemCount).toBeGreaterThan(0)
      expect(backup.size).toBeGreaterThan(0)
    })

    it('should only count selected items', async () => {
      const plan = await analyzeMigration('claude-code', 'cursor')
      const selectedCount = plan.items.filter((i) => i.selected).length
      const backup = await createBackup(plan)
      expect(backup.itemCount).toBe(selectedCount)
    })
  })

  describe('executeMigration', () => {
    it('should execute a migration and return results', async () => {
      const plan = await analyzeMigration('claude-code', 'cline')
      const backup = await createBackup(plan)
      const result = await executeMigration(plan, backup)

      expect(result.id).toBeTruthy()
      expect(result.planId).toBe(plan.id)
      expect(result.source).toBe('claude-code')
      expect(result.target).toBe('cline')
      expect(result.items.length).toBe(plan.items.length)
      expect(result.duration).toBeGreaterThanOrEqual(0)
    })

    it('should have correct item counts', async () => {
      const plan = await analyzeMigration('claude-code', 'cline')
      const backup = await createBackup(plan)
      const result = await executeMigration(plan, backup)

      const total =
        result.migratedItems + result.skippedItems + result.failedItems + result.warningItems
      expect(total).toBe(result.totalItems + result.skippedItems)
    })

    it('should mark unselected items as skipped', async () => {
      const plan = await analyzeMigration('claude-code', 'cursor')
      // Deselect first item
      if (plan.items.length > 0) {
        plan.items[0].selected = false
      }
      const backup = await createBackup(plan)
      const result = await executeMigration(plan, backup)

      const skipped = result.items.filter((i) => i.status === 'skipped')
      expect(skipped.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('rollbackMigration', () => {
    it('should rollback successfully', async () => {
      const plan = await analyzeMigration('claude-code', 'cursor')
      const backup = await createBackup(plan)
      const result = await executeMigration(plan, backup)
      const rollback = await rollbackMigration(result)

      expect(rollback.success).toBe(true)
      expect(rollback.message).toContain('rolled back')
    })
  })

  describe('MIGRATION_STEPS', () => {
    it('should have 5 steps', () => {
      expect(MIGRATION_STEPS).toHaveLength(5)
    })

    it('should start with select and end with result', () => {
      expect(MIGRATION_STEPS[0].step).toBe('select')
      expect(MIGRATION_STEPS[4].step).toBe('result')
    })

    it('should have labels for each step', () => {
      for (const step of MIGRATION_STEPS) {
        expect(step.label).toBeTruthy()
      }
    })
  })
})
