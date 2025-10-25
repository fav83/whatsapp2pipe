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
    <div className="px-5 pt-5">
      <div className="text-sm text-[#667781] mb-4">
        {message}
      </div>
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-[#00a884] text-white text-sm font-medium rounded-lg hover:bg-[#008f6f] transition-colors"
      >
        Retry
      </button>
    </div>
  )
}
