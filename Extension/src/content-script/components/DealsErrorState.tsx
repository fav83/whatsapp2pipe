import React from 'react'

interface DealsErrorStateProps {
  error?: string
  onRetry: () => void
}

export const DealsErrorState = React.memo(function DealsErrorState({
  error,
  onRetry,
}: DealsErrorStateProps) {
  return (
    <div className="px-3 pt-3">
      <div className="p-3 bg-white rounded-lg border border-border-secondary shadow-sm space-y-3">
        {/* Header */}
        <div className="flex items-center gap-2">
          {/* Deals Icon */}
          <svg
            className="w-5 h-5 text-brand-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="text-sm font-semibold text-text-primary">Deals</h3>
        </div>

        {/* Error Message */}
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-sm text-red-700">Unable to load deals</div>
          {error && <div className="text-xs text-red-600 mt-1">{error}</div>}
        </div>

        {/* Retry Button */}
        <button
          onClick={onRetry}
          className="w-full px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-hover transition-colors text-sm font-medium"
        >
          Retry
        </button>
      </div>
    </div>
  )
})
