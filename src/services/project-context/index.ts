/**
 * Project Context Service
 * Exports project scanning and context file management
 */

export {
  scanProjects,
  getProjectContext,
  getContextFileContent,
  getProjectStats,
  CONTEXT_FILE_PATTERNS,
} from './service'
export type { ProjectContextStats } from './service'
