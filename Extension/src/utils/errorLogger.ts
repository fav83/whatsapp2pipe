import type { Scope } from '@sentry/browser'

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

  // Always log to console (development debugging)
  console.error(
    `[chat2deal-pipe][${timestamp}][${version}] ${context}: ${errorMessage}`,
    stackTrace || '',
    additionalContext || {}
  )

  // Also send to Sentry if enabled and scope provided
  if (scope && import.meta.env.VITE_SENTRY_ENABLED === 'true') {
    // Skip expected errors
    const skipSentry =
      additionalContext?.statusCode === 404 || // Person not found
      context.includes('Form validation') || // Validation errors
      context.includes('User cancelled') // User actions

    if (!skipSentry) {
      console.log('[errorLogger] Capturing to Sentry:', context)

      // Clone scope to avoid conflicts with concurrent captures
      const isolatedScope = scope.clone()
      isolatedScope.setContext('error_context', {
        context,
        timestamp,
        version,
        ...additionalContext,
      })

      if (error instanceof Error) {
        isolatedScope.captureException(error)
      } else {
        isolatedScope.captureMessage(`${context}: ${String(error)}`, 'error')
      }

      console.log('[errorLogger] Sentry capture completed')
    } else {
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
