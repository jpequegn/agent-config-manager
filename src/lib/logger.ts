/**
 * Logging Service
 * Centralized logging with different levels and transports
 */

/** Log levels */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

/** Log entry */
export interface LogEntry {
  level: LogLevel
  message: string
  timestamp: Date
  context?: Record<string, unknown>
  error?: Error
  stack?: string
}

/** Log transport interface */
export interface LogTransport {
  name: string
  log(entry: LogEntry): void
}

/** Console transport - logs to browser console */
class ConsoleTransport implements LogTransport {
  name = 'console'

  log(entry: LogEntry): void {
    const { level, message, timestamp, context, error } = entry
    const time = timestamp.toISOString()
    const prefix = `[${time}] [${level.toUpperCase()}]`

    switch (level) {
      case 'debug':
        console.debug(prefix, message, context ?? '')
        break
      case 'info':
        console.info(prefix, message, context ?? '')
        break
      case 'warn':
        console.warn(prefix, message, context ?? '')
        break
      case 'error':
        console.error(prefix, message, context ?? '', error ?? '')
        break
    }
  }
}

/** Memory transport - stores logs in memory (useful for debugging/export) */
class MemoryTransport implements LogTransport {
  name = 'memory'
  private logs: LogEntry[] = []
  private maxLogs: number

  constructor(maxLogs = 1000) {
    this.maxLogs = maxLogs
  }

  log(entry: LogEntry): void {
    this.logs.push(entry)
    // Trim if exceeds max
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs)
    }
  }

  getLogs(): LogEntry[] {
    return [...this.logs]
  }

  getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.logs.filter((log) => log.level === level)
  }

  clear(): void {
    this.logs = []
  }

  export(): string {
    return JSON.stringify(this.logs, null, 2)
  }
}

/** Logger configuration */
interface LoggerConfig {
  /** Minimum log level to capture */
  minLevel: LogLevel
  /** Whether logging is enabled */
  enabled: boolean
  /** Transports to use */
  transports: LogTransport[]
}

/** Log level priority (lower = more important) */
const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
}

/**
 * Logger class
 */
class Logger {
  private config: LoggerConfig
  private memoryTransport: MemoryTransport

  constructor() {
    this.memoryTransport = new MemoryTransport()
    this.config = {
      minLevel: import.meta.env.DEV ? 'debug' : 'info',
      enabled: true,
      transports: [new ConsoleTransport(), this.memoryTransport],
    }
  }

  /** Check if a level should be logged */
  private shouldLog(level: LogLevel): boolean {
    if (!this.config.enabled) return false
    return LOG_LEVEL_PRIORITY[level] <= LOG_LEVEL_PRIORITY[this.config.minLevel]
  }

  /** Create and dispatch a log entry */
  private log(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
    error?: Error
  ): void {
    if (!this.shouldLog(level)) return

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      context,
      error,
      stack: error?.stack,
    }

    for (const transport of this.config.transports) {
      try {
        transport.log(entry)
      } catch (e) {
        // Don't let transport errors break logging
        console.error(`Logger transport ${transport.name} failed:`, e)
      }
    }
  }

  /** Log debug message */
  debug(message: string, context?: Record<string, unknown>): void {
    this.log('debug', message, context)
  }

  /** Log info message */
  info(message: string, context?: Record<string, unknown>): void {
    this.log('info', message, context)
  }

  /** Log warning message */
  warn(message: string, context?: Record<string, unknown>): void {
    this.log('warn', message, context)
  }

  /** Log error message */
  error(message: string, error?: Error | unknown, context?: Record<string, unknown>): void {
    const err = error instanceof Error ? error : undefined
    const ctx = error instanceof Error ? context : { ...(context ?? {}), error }
    this.log('error', message, ctx, err)
  }

  /** Set minimum log level */
  setLevel(level: LogLevel): void {
    this.config.minLevel = level
  }

  /** Enable/disable logging */
  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled
  }

  /** Add a custom transport */
  addTransport(transport: LogTransport): void {
    this.config.transports.push(transport)
  }

  /** Remove a transport by name */
  removeTransport(name: string): void {
    this.config.transports = this.config.transports.filter((t) => t.name !== name)
  }

  /** Get all logs from memory */
  getLogs(): LogEntry[] {
    return this.memoryTransport.getLogs()
  }

  /** Get logs by level from memory */
  getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.memoryTransport.getLogsByLevel(level)
  }

  /** Clear memory logs */
  clearLogs(): void {
    this.memoryTransport.clear()
  }

  /** Export logs as JSON */
  exportLogs(): string {
    return this.memoryTransport.export()
  }

  /** Log an error with automatic context extraction */
  logError(error: unknown, context?: Record<string, unknown>): void {
    if (error instanceof Error) {
      this.error(error.message, error, {
        name: error.name,
        ...context,
      })
    } else {
      this.error('Unknown error', undefined, { error, ...context })
    }
  }
}

/** Global logger instance */
export const logger = new Logger()

/** Convenience exports */
export const logDebug = logger.debug.bind(logger)
export const logInfo = logger.info.bind(logger)
export const logWarn = logger.warn.bind(logger)
export const logError = logger.error.bind(logger)
