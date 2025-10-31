interface ErrorContext {
  [key: string]: unknown
}

/**
 * Logs error with structured format
 *
 * Format: [chat2deal-pipe][timestamp][version] context: errorMessage
 *
 * @param context - Where error occurred (e.g., "Failed to initialize sidebar")
 * @param error - Error object or message
 * @param additionalContext - Extra data (URL, component stack, etc.)
 */
export function logError(context: string, error: unknown, additionalContext?: ErrorContext): void {
  const timestamp = new Date().toISOString()
  const version = chrome.runtime.getManifest().version

  const errorMessage = error instanceof Error ? error.message : String(error)
  const stackTrace = error instanceof Error ? error.stack : undefined

  console.error(
    `[chat2deal-pipe][${timestamp}][${version}] ${context}: ${errorMessage}`,
    stackTrace || '',
    additionalContext || {}
  )
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
