/**
 * External Context Service
 * Exports external drive/context integration operations
 */

export type {
  SyncMode,
  SyncStatus,
  SyncDirection,
  ExternalDrive,
  SyncConfig,
  SyncTarget,
  SyncResult,
  ExternalContextStats,
} from './service'
export {
  detectDrives,
  getConnectedDrives,
  getSyncConfig,
  updateSyncConfig,
  toggleSyncTarget,
  triggerSync,
  initializeDriveContext,
  getExternalContextStats,
} from './service'
