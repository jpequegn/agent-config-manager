/**
 * Skills Service
 * Exports skill browsing, management, and retrieval
 */

export type { SkillListStats, SkillFilterOptions, SkillValidationResult } from './service'
export {
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
