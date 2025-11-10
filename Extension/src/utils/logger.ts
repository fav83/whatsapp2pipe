/**
 * Development-only logging utility
 *
 * All logging methods are no-ops in production mode.
 * Use this instead of direct console.log/warn/error calls.
 */

const isDevelopment = import.meta.env.MODE === 'development'

/**
 * Log general information (development only)
 */
export function log(...args: unknown[]): void {
  if (isDevelopment) {
    console.log(...args)
  }
}

/**
 * Log warnings (development only)
 */
export function warn(...args: unknown[]): void {
  if (isDevelopment) {
    console.warn(...args)
  }
}

/**
 * Log errors (development only)
 * Note: For errors that should be tracked in production, use errorLogger.ts instead
 */
export function error(...args: unknown[]): void {
  if (isDevelopment) {
    console.error(...args)
  }
}

/**
 * Log debug information (development only)
 */
export function debug(...args: unknown[]): void {
  if (isDevelopment) {
    console.debug(...args)
  }
}

/**
 * Log informational messages (development only)
 */
export function info(...args: unknown[]): void {
  if (isDevelopment) {
    console.info(...args)
  }
}

/**
 * Group related log messages (development only)
 */
export function group(label: string): void {
  if (isDevelopment) {
    console.group(label)
  }
}

/**
 * End a log group (development only)
 */
export function groupEnd(): void {
  if (isDevelopment) {
    console.groupEnd()
  }
}

/**
 * Log a table (development only)
 */
export function table(data: unknown): void {
  if (isDevelopment) {
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
