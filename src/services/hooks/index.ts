/**
 * Hooks Service
 * Exports hook management operations
 */

export type {
  HookGroup,
  HookBulkResult,
  HookValidationResult,
  HookExecutionStats,
  HookTestResult,
  TemplateCategory,
} from './service'
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
  getHookLogs,
  clearHookLogs,
  getHookExecutionStats,
  runHookTest,
  listTemplates,
  getTemplatesByCategory,
  getTemplate,
  TEMPLATE_CATEGORIES,
} from './service'
