import React, { useState, useRef, useEffect } from 'react'
import type { Deal, Pipeline, Stage } from '@/types/deal'
import { DealDropdown } from './DealDropdown'
import { DealDetails } from './DealDetails'
import { DealsErrorState } from './DealsErrorState'
import { CreateDealForm } from './CreateDealForm'
import { Plus, Check, X } from 'lucide-react'
import { Spinner } from './Spinner'
import { usePipedrive } from '../hooks/usePipedrive'
import { useToast } from '../context/ToastContext'
import { logError } from '@/utils/errorLogger'
import * as Sentry from '@sentry/browser'

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
  const [showCloseMenu, setShowCloseMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Won/Lost confirmation state
  const [isConfirmingWon, setIsConfirmingWon] = useState(false)
  const [isEnteringLostReason, setIsEnteringLostReason] = useState(false)
  const [lostReason, setLostReason] = useState('')
  const [isMarkingWon, setIsMarkingWon] = useState(false)
  const [isMarkingLost, setIsMarkingLost] = useState(false)
  const [wonError, setWonError] = useState<string | null>(null)
  const [lostError, setLostError] = useState<string | null>(null)

  // Hooks
  const { markDealWonLost } = usePipedrive()
  const { showToast } = useToast()

  // Close menu on outside click
  useEffect(() => {
    if (!showCloseMenu) return

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowCloseMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showCloseMenu])

  // Use external selectedDealId if provided, otherwise use internal state
  const selectedDealId = externalSelectedDealId !== undefined ? externalSelectedDealId : internalSelectedDealId
  const setSelectedDealId = (dealId: number | null) => {
    if (onSelectedDealChanged) {
      onSelectedDealChanged(dealId)
    } else {
      setInternalSelectedDealId(dealId)
    }
  }

  // Won/Lost handlers
  const handleWonClick = () => {
    setIsConfirmingWon(true)
    setWonError(null)
    setShowCloseMenu(false)
  }

  const handleCancelWon = () => {
    setIsConfirmingWon(false)
    setWonError(null)
  }

  const handleConfirmWon = async () => {
    if (!selectedDealId) return

    setIsMarkingWon(true)
    setWonError(null)

    try {
      const updatedDeal = await markDealWonLost(selectedDealId, 'won')

      if (updatedDeal) {
        onDealsUpdated?.(deals?.map((d) => (d.id === updatedDeal.id ? updatedDeal : d)) || [])
        setIsConfirmingWon(false)
        showToast('Deal marked as won')
      } else {
        setWonError('Failed to mark deal as won')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to mark deal as won'
      setWonError(errorMessage)
      logError('Failed to mark deal as won', err, { dealId: selectedDealId }, Sentry.getCurrentScope())
    } finally {
      setIsMarkingWon(false)
    }
  }

  const handleLostClick = () => {
    setIsEnteringLostReason(true)
    setLostReason('')
    setLostError(null)
    setShowCloseMenu(false)
  }

  const handleCancelLost = () => {
    setIsEnteringLostReason(false)
    setLostReason('')
    setLostError(null)
  }

  const handleLostReasonChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLostReason(e.target.value)
  }

  const handleConfirmLost = async () => {
    if (!selectedDealId) return

    const trimmedReason = lostReason.trim()

    setIsMarkingLost(true)
    setLostError(null)

    try {
      const updatedDeal = await markDealWonLost(
        selectedDealId,
        'lost',
        trimmedReason.length > 0 ? trimmedReason : undefined
      )

      if (updatedDeal) {
        onDealsUpdated?.(deals?.map((d) => (d.id === updatedDeal.id ? updatedDeal : d)) || [])
        setIsEnteringLostReason(false)
        setLostReason('')
        showToast('Deal marked as lost')
      } else {
        setLostError('Failed to mark deal as lost')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to mark deal as lost'
      setLostError(errorMessage)
      logError(
        'Failed to mark deal as lost',
        err,
        { dealId: selectedDealId, lostReason: trimmedReason },
        Sentry.getCurrentScope()
      )
    } finally {
      setIsMarkingLost(false)
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

          <div className="flex items-center gap-0">
            {/* Create Deal Button */}
            <button
              onClick={() => setIsCreatingDeal(true)}
              className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-brand-primary hover:bg-brand-primary hover:text-white rounded transition-colors"
              aria-label="Create deal"
            >
              <Plus className="w-4 h-4" />
              Create
            </button>

            {/* Complete Menu Button (only show when deal is selected and open) */}
            {selectedDealId && selectedDeal && selectedDeal.status === 'open' && (
              <div className="relative -ml-1" ref={menuRef}>
                <button
                  onClick={() => setShowCloseMenu(!showCloseMenu)}
                  className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-brand-primary hover:bg-brand-primary hover:text-white rounded transition-colors"
                  aria-label="Complete deal"
                >
                  <Check className="w-4 h-4" />
                  Complete
                </button>
                {showCloseMenu && (
                  <div className="absolute right-0 mt-1 bg-white border border-border-secondary rounded-lg shadow-lg py-1 z-10">
                    <button
                      onClick={handleWonClick}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-green-600 whitespace-nowrap"
                    >
                      <span className="text-base">✓</span> Mark as Won
                    </button>
                    <button
                      onClick={handleLostClick}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600 whitespace-nowrap"
                    >
                      <span className="text-base">✗</span> Mark as Lost
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Won Confirmation UI */}
        {isConfirmingWon && (
          <div className="mb-3 p-4 bg-gray-50 border border-border-primary rounded-lg">
            {wonError && (
              <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <div className="flex-1 text-sm text-red-800">{wonError}</div>
                <button
                  onClick={() => setWonError(null)}
                  aria-label="Dismiss error"
                  className="hover:bg-red-100 rounded p-0.5"
                  type="button"
                >
                  <X className="w-4 h-4 text-red-600" />
                </button>
              </div>
            )}
            <p className="text-sm text-text-primary mb-3">Mark this deal as won?</p>
            <div className="flex gap-2">
              <button
                onClick={handleConfirmWon}
                disabled={isMarkingWon}
                type="button"
                className="flex-1 px-4 py-2 bg-brand-primary text-white text-sm font-medium rounded-lg hover:bg-brand-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isMarkingWon ? (
                  <span className="flex items-center justify-center gap-2">
                    <Spinner size="sm" color="white" />
                    Saving...
                  </span>
                ) : (
                  'Confirm'
                )}
              </button>
              <button
                onClick={handleCancelWon}
                disabled={isMarkingWon}
                type="button"
                className="flex-1 px-4 py-2 bg-white border text-brand-primary text-sm font-medium rounded-lg hover:bg-brand-primary hover:text-white hover:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ border: '1px solid #665F98', borderColor: '#665F98' }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Lost Reason Form */}
        {isEnteringLostReason && (
          <div className="mb-3 p-4 bg-gray-50 border border-border-primary rounded-lg">
            {lostError && (
              <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <div className="flex-1 text-sm text-red-800">{lostError}</div>
                <button
                  onClick={() => setLostError(null)}
                  aria-label="Dismiss error"
                  className="hover:bg-red-100 rounded p-0.5"
                  type="button"
                >
                  <X className="w-4 h-4 text-red-600" />
                </button>
              </div>
            )}
            <div className="mb-3">
              <label
                htmlFor="lost-reason"
                className="block text-sm font-medium text-text-primary mb-2"
              >
                Why was this deal lost? (optional)
              </label>
              <input
                type="text"
                id="lost-reason"
                value={lostReason}
                onChange={handleLostReasonChange}
                placeholder="Enter reason (optional)"
                maxLength={150}
                disabled={isMarkingLost}
                autoFocus
                className="w-full px-3 py-2 border border-border-primary rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <div className="mt-1 text-xs text-text-tertiary text-right">
                {lostReason.length}/150
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleConfirmLost}
                disabled={isMarkingLost}
                type="button"
                className="flex-1 px-4 py-2 bg-brand-primary text-white text-sm font-medium rounded-lg hover:bg-brand-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isMarkingLost ? (
                  <span className="flex items-center justify-center gap-2">
                    <Spinner size="sm" color="white" />
                    Saving...
                  </span>
                ) : (
                  'Confirm'
                )}
              </button>
              <button
                onClick={handleCancelLost}
                disabled={isMarkingLost}
                type="button"
                className="flex-1 px-4 py-2 bg-white border text-brand-primary text-sm font-medium rounded-lg hover:bg-brand-primary hover:text-white hover:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ border: '1px solid #665F98', borderColor: '#665F98' }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

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
