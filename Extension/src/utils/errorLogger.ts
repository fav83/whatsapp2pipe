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
