/**
 * PersonLookupError Component
 *
 * Displays error state when person lookup fails.
 * Shows user-friendly error message and retry button.
 */

interface PersonLookupErrorProps {
  errorMessage: string
  onRetry: () => void
}

export function PersonLookupError({ errorMessage, onRetry }: PersonLookupErrorProps) {
  return (
    <div className="px-5 pt-5">
      {/* Error Icon */}
      <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-red-50">
        <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>

      {/* Error Message */}
      <div className="text-sm text-[#667781] mb-4">{errorMessage}</div>

      {/* Retry Button */}
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-[#00a884] text-white text-sm font-medium rounded-lg hover:bg-[#008f6f] transition-colors"
      >
        Try again
      </button>
    </div>
  )
}
