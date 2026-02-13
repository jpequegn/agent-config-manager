/**
 * Project Context Service
 * Exports project scanning, context file management, editing, and templates
 */

export {
  scanProjects,
  getProjectContext,
  getContextFileContent,
  getProjectStats,
  getContextTemplates,
  getTemplatesForHarness,
  validateContextFile,
  saveContextFile,
  createContextFile,
  CONTEXT_FILE_PATTERNS,
} from './service'
export type {
  ProjectContextStats,
  ContextFileValidationError,
  ContextFileValidationResult,
  ContextFileTemplate,
} from './service'
