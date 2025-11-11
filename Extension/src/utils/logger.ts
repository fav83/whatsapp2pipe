/**
 * Logging utility
 *
 * Logging methods are enabled based on:
 * - Development mode (MODE === 'development')
 * - Console logging flag (VITE_CONSOLE_LOGGING_ENABLED === 'true')
 *
 * Use this instead of direct console.log/warn/error calls.
 */

const isDevelopment = import.meta.env.MODE === 'development'
const consoleLoggingEnabled = import.meta.env.VITE_CONSOLE_LOGGING_ENABLED === 'true'
const isLoggingEnabled = isDevelopment || consoleLoggingEnabled

/**
 * Log general information
 */
export function log(...args: unknown[]): void {
  if (isLoggingEnabled) {
    console.log(...args)
  }
}

/**
 * Log warnings
 */
export function warn(...args: unknown[]): void {
  if (isLoggingEnabled) {
    console.warn(...args)
  }
}

/**
 * Log errors
 * Note: For errors that should be tracked in production, use errorLogger.ts instead
 */
export function error(...args: unknown[]): void {
  if (isLoggingEnabled) {
    console.error(...args)
  }
}

/**
 * Log debug information
 */
export function debug(...args: unknown[]): void {
  if (isLoggingEnabled) {
    console.debug(...args)
  }
}

/**
 * Log informational messages
 */
export function info(...args: unknown[]): void {
  if (isLoggingEnabled) {
    console.info(...args)
  }
}

/**
 * Group related log messages
 */
export function group(label: string): void {
  if (isLoggingEnabled) {
    console.group(label)
  }
}

/**
 * End a log group
 */
export function groupEnd(): void {
  if (isLoggingEnabled) {
    console.groupEnd()
  }
}

/**
 * Log a table
 */
export function table(data: unknown): void {
  if (isLoggingEnabled) {
    console.table(data)
  }
}

// Default export with all methods
export default {
  log,
  warn,
  error,
  debug,
  info,
  group,
  groupEnd,
  table,
}
