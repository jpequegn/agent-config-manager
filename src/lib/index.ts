/**
 * Lib Module
 * Utility functions and services
 */

// Error types and utilities
export {
  AppError,
  FileSystemError,
  NetworkError,
  ConfigError,
  HarnessError,
  ValidationError,
  isAppError,
  wrapError,
  getUserMessage,
  getErrorCode,
} from './errors'

// Logging
export type { LogLevel, LogEntry, LogTransport } from './logger'
export { logger, logDebug, logInfo, logWarn, logError } from './logger'

// Retry utilities
export type { RetryConfig, RetryResult } from './retry'
export {
  retry,
  retryOrThrow,
  withRetry,
  RetryStrategies,
  withTimeout,
  retryWithTimeout,
} from './retry'
