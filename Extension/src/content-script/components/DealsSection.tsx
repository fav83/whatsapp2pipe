import React, { useState } from 'react'
import type { Deal } from '@/types/deal'
import { DealDropdown } from './DealDropdown'
import { DealDetails } from './DealDetails'
import { DealsErrorState } from './DealsErrorState'

interface DealsSectionProps {
  personId: number
  personName: string
  deals: Deal[] | null
  dealsError?: string
  onRetry?: () => void
}

function DealsEmptyState() {
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

        {/* Empty Message */}
        <div className="p-4 bg-gray-50 border border-border-secondary rounded-lg text-center">
          <div className="text-sm text-text-secondary mb-3">No deals yet</div>

          {/* Create Deal Button (placeholder for Feature 36) - matches "Select messages" button styling */}
          <button className="px-4 py-2 bg-brand-primary hover:bg-brand-hover text-white text-sm font-medium rounded transition-colors">
            Create Deal
          </button>
        </div>
      </div>
    </div>
  )
}

export function DealsSection({
  personId: _personId,
  personName: _personName,
  deals,
  dealsError,
  onRetry,
}: DealsSectionProps) {
  const [selectedDealId, setSelectedDealId] = useState<number | null>(null)

  // Error state: deals fetch failed
  if (deals === null) {
    return <DealsErrorState error={dealsError} onRetry={onRetry || (() => {})} />
  }

  // Empty state: no deals for this person
  if (deals.length === 0) {
    return <DealsEmptyState />
  }

  // Success state: display deals
  const selectedDeal = deals.find((d) => d.id === selectedDealId)

  return (
    <div className="px-3 pt-3">
      <div className="p-3 bg-white rounded-lg border border-border-secondary shadow-sm">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
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

        <DealDropdown deals={deals} selectedDealId={selectedDealId} onSelect={setSelectedDealId} />
        {selectedDealId && <DealDetails deal={selectedDeal} />}
      </div>
    </div>
  )
}
