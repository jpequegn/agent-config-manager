/**
 * Services Module
 * Exports all service modules
 */

// File system service
export * from './filesystem'

// Detection service
export * from './detection'

// Project context service
export * from './project-context'

// Learnings service
export * from './learnings'

// Sessions service
export * from './sessions'

// Skills service
export * from './skills'

// Tools service
export * from './tools'

// Settings service
export * from './settings'

// Memory service
export * from './memory'

// Session memory service
export * from './session-memory'

// External context service
export * from './external-context'

// Hooks service
export * from './hooks'

// Unified search service
export * from './search'

// Migration service
export * from './migration'

// Sync & backup service
export type {
  BackupType,
  BackupStatus,
  BackupContents,
  Backup,
  HarnessSyncState,
  RotationConfig,
  RestoreResult,
  BackupStats,
} from './sync-backup'
export {
  listBackups,
  getBackup,
  deleteBackup,
  restoreBackup,
  getSyncStates,
  syncHarness,
  syncAll,
  getBackupStats,
  getRotationConfig,
  updateRotationConfig,
  runRotation,
} from './sync-backup'
// Note: createBackup and SyncStatus not re-exported here to avoid conflicts
// Import directly from '@/services/sync-backup' when needed
