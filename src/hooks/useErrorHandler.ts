/**
 * Error Handling Hook
 * Provides convenient error handling with toast notifications
 */

import { useCallback } from 'react'
import { useUIStore } from '@/stores'
import { logger } from '@/lib/logger'
import { getUserMessage, isAppError } from '@/lib/errors'

/** Error handler options */
interface ErrorHandlerOptions {
  /** Custom error message to display */
  message?: string
  /** Whether to show a toast notification (default: true) */
  showToast?: boolean
  /** Whether to log the error (default: true) */
  log?: boolean
  /** Additional context for logging */
  context?: Record<string, unknown>
  /** Toast duration in ms */
  duration?: number
}

/**
 * Hook for handling errors with toast notifications
 */
export function useErrorHandler() {
  const addToast = useUIStore((state) => state.addToast)

  /**
   * Handle an error with optional toast and logging
   */
  const handleError = useCallback(
    (error: unknown, options: ErrorHandlerOptions = {}) => {
      const { message, showToast = true, log = true, context, duration } = options

      // Get user-friendly message
      const userMessage = message ?? getUserMessage(error)

      // Log the error
      if (log) {
        logger.logError(error, {
          userMessage,
          ...context,
        })
      }

      // Show toast notification
      if (showToast) {
        addToast({
          type: 'error',
          title: 'Error',
          message: userMessage,
          duration,
        })
      }

      // Return error details for further handling
      return {
        message: userMessage,
        code: isAppError(error) ? error.code : 'UNKNOWN_ERROR',
        recoverable: isAppError(error) ? error.recoverable : true,
      }
    },
    [addToast]
  )

  /**
   * Wrap an async function with error handling
   */
  const withErrorHandling = useCallback(
    <T>(
      fn: () => Promise<T>,
      options: ErrorHandlerOptions = {}
    ): (() => Promise<T | undefined>) => {
      return async () => {
        try {
          return await fn()
        } catch (error) {
          handleError(error, options)
          return undefined
        }
      }
    },
    [handleError]
  )

  /**
   * Execute an async function with error handling
   */
  const safeExecute = useCallback(
    async <T>(fn: () => Promise<T>, options: ErrorHandlerOptions = {}): Promise<T | undefined> => {
      try {
        return await fn()
      } catch (error) {
        handleError(error, options)
        return undefined
      }
    },
    [handleError]
  )

  return {
    handleError,
    withErrorHandling,
    safeExecute,
  }
}

/**
 * Hook for showing success/info toasts
 */
export function useToastNotifications() {
  const addToast = useUIStore((state) => state.addToast)
  const removeToast = useUIStore((state) => state.removeToast)
  const clearToasts = useUIStore((state) => state.clearToasts)

  const showSuccess = useCallback(
    (title: string, message?: string, duration?: number) => {
      addToast({ type: 'success', title, message, duration })
    },
    [addToast]
  )

  const showInfo = useCallback(
    (title: string, message?: string, duration?: number) => {
      addToast({ type: 'info', title, message, duration })
    },
    [addToast]
  )

  const showWarning = useCallback(
    (title: string, message?: string, duration?: number) => {
      addToast({ type: 'warning', title, message, duration })
    },
    [addToast]
  )

  const showError = useCallback(
    (title: string, message?: string, duration?: number) => {
      addToast({ type: 'error', title, message, duration })
    },
    [addToast]
  )

  return {
    showSuccess,
    showInfo,
    showWarning,
    showError,
    removeToast,
    clearToasts,
  }
}
