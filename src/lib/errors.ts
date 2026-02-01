/**
 * Error Types and Utilities
 * Custom error classes and error handling utilities
 */

/** Base application error */
export class AppError extends Error {
  /** Error code for programmatic handling */
  readonly code: string
  /** Override name from Error */
  override readonly name: string = 'AppError'
  /** Whether this error is recoverable */
  readonly recoverable: boolean
  /** Additional context */
  readonly context?: Record<string, unknown>
  /** Original error if this wraps another */
  override readonly cause?: Error

  constructor(
    message: string,
    options: {
      code?: string
      recoverable?: boolean
      context?: Record<string, unknown>
      cause?: Error
    } = {}
  ) {
    super(message)
    this.code = options.code ?? 'UNKNOWN_ERROR'
    this.recoverable = options.recoverable ?? true
    this.context = options.context
    this.cause = options.cause
  }
}

/** File system related errors */
export class FileSystemError extends AppError {
  override readonly name = 'FileSystemError'
  readonly path?: string
  readonly operation?: string

  constructor(
    message: string,
    options: {
      code?: string
      path?: string
      operation?: string
      cause?: Error
    } = {}
  ) {
    super(message, {
      code: options.code ?? 'FS_ERROR',
      recoverable: true,
      context: { path: options.path, operation: options.operation },
      cause: options.cause,
    })
    this.path = options.path
    this.operation = options.operation
  }
}

/** Network/API related errors */
export class NetworkError extends AppError {
  override readonly name = 'NetworkError'
  readonly statusCode?: number
  readonly endpoint?: string

  constructor(
    message: string,
    options: {
      code?: string
      statusCode?: number
      endpoint?: string
      cause?: Error
    } = {}
  ) {
    super(message, {
      code: options.code ?? 'NETWORK_ERROR',
      recoverable: true,
      context: { statusCode: options.statusCode, endpoint: options.endpoint },
      cause: options.cause,
    })
    this.statusCode = options.statusCode
    this.endpoint = options.endpoint
  }
}

/** Configuration/parsing errors */
export class ConfigError extends AppError {
  override readonly name = 'ConfigError'
  readonly filePath?: string
  readonly validationErrors?: string[]

  constructor(
    message: string,
    options: {
      code?: string
      filePath?: string
      validationErrors?: string[]
      cause?: Error
    } = {}
  ) {
    super(message, {
      code: options.code ?? 'CONFIG_ERROR',
      recoverable: true,
      context: { filePath: options.filePath, validationErrors: options.validationErrors },
      cause: options.cause,
    })
    this.filePath = options.filePath
    this.validationErrors = options.validationErrors
  }
}

/** Harness-specific errors */
export class HarnessError extends AppError {
  override readonly name = 'HarnessError'
  readonly harnessType?: string

  constructor(
    message: string,
    options: {
      code?: string
      harnessType?: string
      cause?: Error
    } = {}
  ) {
    super(message, {
      code: options.code ?? 'HARNESS_ERROR',
      recoverable: true,
      context: { harnessType: options.harnessType },
      cause: options.cause,
    })
    this.harnessType = options.harnessType
  }
}

/** Validation errors */
export class ValidationError extends AppError {
  override readonly name = 'ValidationError'
  readonly field?: string
  readonly value?: unknown

  constructor(
    message: string,
    options: {
      code?: string
      field?: string
      value?: unknown
      cause?: Error
    } = {}
  ) {
    super(message, {
      code: options.code ?? 'VALIDATION_ERROR',
      recoverable: true,
      context: { field: options.field, value: options.value },
      cause: options.cause,
    })
    this.field = options.field
    this.value = options.value
  }
}

/**
 * Check if an error is an AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError
}

/**
 * Wrap an unknown error into an AppError
 */
export function wrapError(error: unknown, message?: string): AppError {
  if (error instanceof AppError) {
    return error
  }

  if (error instanceof Error) {
    return new AppError(message ?? error.message, {
      code: 'WRAPPED_ERROR',
      cause: error,
    })
  }

  return new AppError(message ?? String(error), {
    code: 'UNKNOWN_ERROR',
    context: { originalError: error },
  })
}

/**
 * Get a user-friendly error message
 */
export function getUserMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.message
  }

  if (error instanceof Error) {
    // Filter out technical details for user-facing messages
    if (error.message.includes('ENOENT')) {
      return 'File or directory not found'
    }
    if (error.message.includes('EACCES') || error.message.includes('EPERM')) {
      return 'Permission denied'
    }
    if (error.message.includes('ECONNREFUSED')) {
      return 'Connection refused'
    }
    if (error.message.includes('ETIMEDOUT')) {
      return 'Connection timed out'
    }
    return error.message
  }

  return 'An unexpected error occurred'
}

/**
 * Get error code for programmatic handling
 */
export function getErrorCode(error: unknown): string {
  if (error instanceof AppError) {
    return error.code
  }
  return 'UNKNOWN_ERROR'
}
