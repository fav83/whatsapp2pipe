import type { Scope } from '@sentry/browser'

const isDevelopment = import.meta.env.MODE === 'development'
const consoleLoggingEnabled = import.meta.env.VITE_CONSOLE_LOGGING_ENABLED === 'true'
const isLoggingEnabled = isDevelopment || consoleLoggingEnabled

interface ErrorContext {
  [key: string]: unknown
  statusCode?: number
}

/**
 * Logs error with structured format
 *
 * Format: [chat2deal-pipe][timestamp][version] context: errorMessage
 *
 * @param context - Where error occurred (e.g., "Failed to initialize sidebar")
 * @param error - Error object or message
 * @param additionalContext - Extra data (URL, component stack, etc.)
 * @param scope - Optional Sentry scope for remote error tracking
 */
export function logError(
  context: string,
  error: unknown,
  additionalContext?: ErrorContext,
  scope?: Scope
): void {
  const timestamp = new Date().toISOString()
  const version = chrome.runtime.getManifest().version

  const errorMessage = error instanceof Error ? error.message : String(error)
  const stackTrace = error instanceof Error ? error.stack : undefined

  // Log to console if logging is enabled
  if (isLoggingEnabled) {
    console.error(
      `[chat2deal-pipe][${timestamp}][${version}] ${context}: ${errorMessage}`,
      stackTrace || '',
      additionalContext || {}
    )
  }

  // Also send to Sentry if enabled and scope provided
  if (scope && import.meta.env.VITE_SENTRY_ENABLED === 'true') {
    // Skip expected errors
    const skipSentry =
      additionalContext?.statusCode === 404 || // Person not found
      context.includes('Form validation') || // Validation errors
      context.includes('User cancelled') // User actions

    if (!skipSentry) {
      if (isLoggingEnabled) {
        console.log('[errorLogger] Capturing to Sentry:', context)
      }

      // Clone scope to avoid conflicts with concurrent captures
      const isolatedScope = scope.clone()
      isolatedScope.setContext('error_context', {
        context,
        timestamp,
        version,
        ...additionalContext,
      })

      // Get the client from the scope and use it to capture
      const client = scope.getClient()
      if (client) {
        if (error instanceof Error) {
          client.captureException(error, {}, isolatedScope)
        } else {
          client.captureMessage(`${context}: ${String(error)}`, 'error', {}, isolatedScope)
        }
        if (isLoggingEnabled) {
          console.log('[errorLogger] Sentry capture completed')
        }
      } else if (isLoggingEnabled) {
        console.warn('[errorLogger] No Sentry client available')
      }
    } else if (isLoggingEnabled) {
      console.log('[errorLogger] Skipping Sentry (expected error):', context)
    }
  }
}

/**
 * Extract error message from unknown error type
 * Handles Error instances, structured errors with message property, and unknown errors
 *
 * @param error - The error to extract message from
 * @param fallback - Fallback message if error message cannot be extracted
 * @returns The extracted or fallback error message
 */
export function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return String(error.message)
  }
  return fallback
}
