/**
 * Hooks Service
 * Exports hook management operations
 */

export type { HookGroup, HookBulkResult, HookValidationResult } from './service'
export {
  listHooks,
  listHookSummaries,
  getHooksGroupedByTrigger,
  getHook,
  toggleHookStatus,
  reorderHooks,
  bulkEnableHooks,
  bulkDisableHooks,
  detectScriptLanguage,
  getMonacoLanguage,
  validateHookConfig,
  saveHook,
} from './service'
