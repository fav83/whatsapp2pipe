import React from 'react'

export const DealsLoadingSkeleton = React.memo(function DealsLoadingSkeleton() {
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

        {/* Skeleton Dropdown */}
        <div className="w-full h-10 bg-gray-200 rounded-lg animate-pulse"></div>

        {/* Skeleton Details */}
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
          <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
        </div>
      </div>
    </div>
  )
})
