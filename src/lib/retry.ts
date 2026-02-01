/**
 * Retry Utilities
 * Utilities for retrying failed async operations with configurable strategies
 */

import { logger } from './logger'

/** Retry configuration */
export interface RetryConfig {
  /** Maximum number of attempts (including initial) */
  maxAttempts: number
  /** Initial delay in ms before first retry */
  initialDelay: number
  /** Maximum delay in ms between retries */
  maxDelay: number
  /** Multiplier for exponential backoff */
  backoffMultiplier: number
  /** Whether to add jitter to delays */
  jitter: boolean
  /** Function to determine if error is retryable */
  isRetryable?: (error: unknown) => boolean
  /** Callback on each retry attempt */
  onRetry?: (attempt: number, error: unknown, delay: number) => void
}

/** Default retry configuration */
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  initialDelay: 1000,
  maxDelay: 30000,
  backoffMultiplier: 2,
  jitter: true,
  isRetryable: () => true,
}

/** Result of a retry operation */
export interface RetryResult<T> {
  success: boolean
  data?: T
  error?: Error
  attempts: number
  totalTime: number
}

/**
 * Calculate delay for a retry attempt with exponential backoff
 */
function calculateDelay(attempt: number, config: RetryConfig): number {
  // Exponential backoff
  let delay = config.initialDelay * Math.pow(config.backoffMultiplier, attempt - 1)

  // Cap at max delay
  delay = Math.min(delay, config.maxDelay)

  // Add jitter (±25%)
  if (config.jitter) {
    const jitterRange = delay * 0.25
    delay = delay + (Math.random() * jitterRange * 2 - jitterRange)
  }

  return Math.round(delay)
}

/**
 * Sleep for a specified duration
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Retry an async operation with configurable strategy
 */
export async function retry<T>(
  operation: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<RetryResult<T>> {
  const finalConfig = { ...DEFAULT_RETRY_CONFIG, ...config }
  const startTime = Date.now()
  let lastError: Error | undefined

  for (let attempt = 1; attempt <= finalConfig.maxAttempts; attempt++) {
    try {
      const data = await operation()
      return {
        success: true,
        data,
        attempts: attempt,
        totalTime: Date.now() - startTime,
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      // Check if we should retry
      const shouldRetry =
        attempt < finalConfig.maxAttempts && (finalConfig.isRetryable?.(error) ?? true)

      if (!shouldRetry) {
        break
      }

      // Calculate and apply delay
      const delay = calculateDelay(attempt, finalConfig)

      // Log retry attempt
      logger.warn(`Retry attempt ${attempt}/${finalConfig.maxAttempts}`, {
        error: lastError.message,
        delay,
      })

      // Call retry callback
      finalConfig.onRetry?.(attempt, error, delay)

      // Wait before retrying
      await sleep(delay)
    }
  }

  return {
    success: false,
    error: lastError,
    attempts: finalConfig.maxAttempts,
    totalTime: Date.now() - startTime,
  }
}

/**
 * Retry with automatic unwrapping - throws on failure
 */
export async function retryOrThrow<T>(
  operation: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const result = await retry(operation, config)

  if (!result.success) {
    throw result.error ?? new Error('Operation failed after retries')
  }

  return result.data as T
}

/**
 * Create a retryable version of a function
 */
export function withRetry<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  config: Partial<RetryConfig> = {}
): (...args: Parameters<T>) => Promise<RetryResult<Awaited<ReturnType<T>>>> {
  return async (...args: Parameters<T>) => {
    return retry(() => fn(...args) as Promise<Awaited<ReturnType<T>>>, config)
  }
}

/**
 * Predefined retry strategies
 */
export const RetryStrategies = {
  /** Quick retry for fast operations */
  quick: {
    maxAttempts: 3,
    initialDelay: 100,
    maxDelay: 1000,
    backoffMultiplier: 2,
    jitter: true,
  } satisfies Partial<RetryConfig>,

  /** Standard retry for most operations */
  standard: {
    maxAttempts: 3,
    initialDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2,
    jitter: true,
  } satisfies Partial<RetryConfig>,

  /** Aggressive retry for critical operations */
  aggressive: {
    maxAttempts: 5,
    initialDelay: 500,
    maxDelay: 30000,
    backoffMultiplier: 2,
    jitter: true,
  } satisfies Partial<RetryConfig>,

  /** Patient retry for slow operations */
  patient: {
    maxAttempts: 5,
    initialDelay: 2000,
    maxDelay: 60000,
    backoffMultiplier: 2,
    jitter: true,
  } satisfies Partial<RetryConfig>,

  /** Network-specific retry (only retry on transient errors) */
  network: {
    maxAttempts: 3,
    initialDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2,
    jitter: true,
    isRetryable: (error: unknown) => {
      if (error instanceof Error) {
        const message = error.message.toLowerCase()
        // Retry on network-related errors
        return (
          message.includes('network') ||
          message.includes('timeout') ||
          message.includes('econnrefused') ||
          message.includes('econnreset') ||
          message.includes('fetch')
        )
      }
      return false
    },
  } satisfies Partial<RetryConfig>,
}

/**
 * Timeout wrapper for promises
 */
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  message?: string
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(message ?? `Operation timed out after ${timeoutMs}ms`))
    }, timeoutMs)

    promise
      .then((result) => {
        clearTimeout(timer)
        resolve(result)
      })
      .catch((error) => {
        clearTimeout(timer)
        reject(error)
      })
  })
}

/**
 * Combine retry with timeout
 */
export async function retryWithTimeout<T>(
  operation: () => Promise<T>,
  timeoutMs: number,
  retryConfig: Partial<RetryConfig> = {}
): Promise<RetryResult<T>> {
  return retry(() => withTimeout(operation(), timeoutMs), retryConfig)
}
