/**
 * Migration Service
 * Cross-harness configuration migration
 */

export type {
  CompatibilityLevel,
  MigrationItemType,
  MigrationItemStatus,
  MigrationStep,
  CompatibilityResult,
  MigrationItem,
  MigrationPlan,
  MigrationBackup,
  MigrationResult,
} from './service'

export {
  checkCompatibility,
  analyzeMigration,
  createBackup,
  executeMigration,
  rollbackMigration,
  MIGRATION_STEPS,
} from './service'
