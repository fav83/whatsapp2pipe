import React, { useState } from 'react'
import type { Deal, Pipeline, Stage } from '@/types/deal'
import { DealDropdown } from './DealDropdown'
import { DealDetails } from './DealDetails'
import { DealsErrorState } from './DealsErrorState'
import { CreateDealForm } from './CreateDealForm'
import { Plus } from 'lucide-react'

interface DealsSectionProps {
  personId: number
  personName: string
  deals: Deal[] | null
  dealsError?: string
  pipelines?: Pipeline[]
  stages?: Stage[]
  selectedDealId?: number | null
  onSelectedDealChanged?: (dealId: number | null) => void
  onRetry?: () => void
  onDealsUpdated?: (deals: Deal[]) => void
}

function DealsEmptyState({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <div className="px-3 pt-3">
      <div className="p-3 bg-white rounded-lg border border-border-secondary shadow-sm space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
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

          {/* Create Deal Button */}
          <button
            onClick={onCreateClick}
            className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-brand-primary hover:bg-brand-primary hover:text-white rounded transition-colors"
            aria-label="Create deal"
          >
            <Plus className="w-4 h-4" />
            Create
          </button>
        </div>

        {/* Empty Message */}
        <div className="p-4 bg-gray-50 border border-border-secondary rounded-lg text-center">
          <div className="text-sm text-text-secondary">No deals yet</div>
        </div>
      </div>
    </div>
  )
}

export function DealsSection({
  personId,
  personName,
  deals,
  dealsError,
  pipelines = [],
  stages = [],
  selectedDealId: externalSelectedDealId,
  onSelectedDealChanged,
  onRetry,
  onDealsUpdated,
}: DealsSectionProps) {
  const [internalSelectedDealId, setInternalSelectedDealId] = useState<number | null>(null)
  const [isCreatingDeal, setIsCreatingDeal] = useState(false)

  // Use external selectedDealId if provided, otherwise use internal state
  const selectedDealId = externalSelectedDealId !== undefined ? externalSelectedDealId : internalSelectedDealId
  const setSelectedDealId = (dealId: number | null) => {
    if (onSelectedDealChanged) {
      onSelectedDealChanged(dealId)
    } else {
      setInternalSelectedDealId(dealId)
    }
  }

  // Handle deal created
  const handleDealCreated = (deal: Deal) => {
    // Close form
    setIsCreatingDeal(false)

    // Add new deal to the top of the deals array
    const updatedDeals = [deal, ...(deals || [])]

    // Auto-select the new deal
    setSelectedDealId(deal.id)

    // Notify parent to update deals state
    onDealsUpdated?.(updatedDeals)
  }

  // Handle deal updated
  const handleDealUpdated = (updatedDeal: Deal) => {
    // Update deals array with new deal data
    const updatedDeals = deals?.map((d) => (d.id === updatedDeal.id ? updatedDeal : d)) || []

    // If deal was reopened (status changed to 'open'), move it to top
    if (updatedDeal.status === 'open') {
      // Remove the reopened deal from its current position
      const otherDeals = updatedDeals.filter((d) => d.id !== updatedDeal.id)

      // Place it at the top of the list
      const reorderedDeals = [updatedDeal, ...otherDeals]

      // Notify parent to update deals state
      onDealsUpdated?.(reorderedDeals)
    } else {
      // For won/lost updates, no reordering needed
      onDealsUpdated?.(updatedDeals)
    }
  }

  // Error state: deals fetch failed
  if (deals === null) {
    return <DealsErrorState error={dealsError} onRetry={onRetry || (() => {})} />
  }

  // Empty state: no deals for this person
  if (deals.length === 0 && !isCreatingDeal) {
    return <DealsEmptyState onCreateClick={() => setIsCreatingDeal(true)} />
  }

  // If creating deal, show form
  if (isCreatingDeal) {
    return (
      <div className="px-3 pt-3">
        <div className="p-3 bg-white rounded-lg border border-border-secondary shadow-sm">
          {/* Header with Create button (still visible) */}
          <div className="flex items-center justify-between mb-3">
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

            {/* Create Deal Button */}
            <button
              onClick={() => setIsCreatingDeal(true)}
              className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-brand-primary hover:bg-brand-primary hover:text-white rounded transition-colors"
              aria-label="Create deal"
            >
              <Plus className="w-4 h-4" />
              Create
            </button>
          </div>

          {/* Show form */}
          <CreateDealForm
            personId={personId}
            personName={personName}
            pipelines={pipelines}
            stages={stages}
            onDealCreated={handleDealCreated}
            onCancel={() => setIsCreatingDeal(false)}
          />
        </div>
      </div>
    )
  }

  // Success state: display deals
  const selectedDeal = deals.find((d) => d.id === selectedDealId)

  return (
    <div className="px-3 pt-3">
      <div className="p-3 bg-white rounded-lg border border-border-secondary shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
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

          {/* Create Deal Button */}
          <button
            onClick={() => setIsCreatingDeal(true)}
            className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-brand-primary hover:bg-brand-primary hover:text-white rounded transition-colors"
            aria-label="Create deal"
          >
            <Plus className="w-4 h-4" />
            Create
          </button>
        </div>

        <DealDropdown deals={deals} selectedDealId={selectedDealId} onSelect={setSelectedDealId} />
        {selectedDealId && selectedDeal && (
          <DealDetails
            deal={selectedDeal}
            pipelines={pipelines}
            stages={stages}
            onDealUpdated={handleDealUpdated}
          />
        )}
      </div>
    </div>
  )
}
