/**
 * ErrorState Component
 *
 * Displays user-friendly error messages with retry functionality.
 * Used when operations fail (network issues, API errors, etc.).
 */

interface ErrorStateProps {
  message: string
  onRetry: () => void
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="px-3 pt-3">
      <div className="text-sm text-text-secondary mb-3">{message}</div>
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-brand-primary text-white text-sm font-medium rounded-lg hover:bg-brand-primary-hover transition-colors"
      >
        Retry
      </button>
    </div>
  )
}
