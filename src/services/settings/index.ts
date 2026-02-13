/**
 * Settings Service
 * Exports settings browsing, editing, and validation
 */

export type {
  SettingsListStats,
  SettingsFilterOptions,
  SettingEntry,
  PendingChange,
  SettingValidationError,
} from './service'
export {
  listSettings,
  getSetting,
  getSettingsRaw,
  getSettingsStats,
  SETTING_CATEGORIES,
  validateSettingValue,
  updateSetting,
  resetSetting,
  getPendingChanges,
  saveAllChanges,
  discardAllChanges,
  hasPendingChanges,
} from './service'
