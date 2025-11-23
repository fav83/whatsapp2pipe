import React, { useState, useRef, useEffect, useMemo, useId } from 'react'
import { X, Pencil } from 'lucide-react'
import type { Deal, Pipeline, Stage } from '@/types/deal'
import { usePipedrive } from '../hooks/usePipedrive'
import { useToast } from '../context/ToastContext'
import { Spinner } from './Spinner'
import { logError } from '@/utils/errorLogger'
import * as logger from '@/utils/logger'
import * as Sentry from '@sentry/browser'

/**
 * Custom Dropdown Component for Pipeline/Stage Selection
 */
interface DropdownOption {
  id: number
  name: string
}

interface CustomDropdownProps {
  options: DropdownOption[]
  selectedId: number
  onSelect: (id: number) => void
  disabled?: boolean
  placeholder?: string
}

function CustomDropdown({
  options,
  selectedId,
  onSelect,
  disabled = false,
  placeholder = 'Select...',
}: CustomDropdownProps) {
  const listboxId = useId()
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState<number>(-1)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const selectedOption = useMemo(
    () => options.find((opt) => opt.id === selectedId) ?? null,
    [options, selectedId]
  )

  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      const selectedIndex = selectedOption
        ? options.findIndex((opt) => opt.id === selectedOption.id)
        : 0
      setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0)
    }
  }, [isOpen, selectedOption, options])

  const handleSelect = (id: number) => {
    onSelect(id)
    setIsOpen(false)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (!options.length || disabled) return

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      if (!isOpen) {
        setIsOpen(true)
        return
      }
      setActiveIndex((prev) => (prev + 1) % options.length)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      if (!isOpen) {
        setIsOpen(true)
        return
      }
      setActiveIndex((prev) => (prev - 1 + options.length) % options.length)
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      if (!isOpen) {
        setIsOpen(true)
        return
      }
      const targetOption = options[activeIndex] ?? options[0]
      handleSelect(targetOption.id)
    } else if (event.key === 'Escape') {
      event.preventDefault()
      setIsOpen(false)
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen((open) => !open)}
        disabled={disabled}
        className="w-full px-3 py-2 bg-white text-left border border-solid border-border-primary hover:border-brand-primary rounded-lg text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary transition-colors flex items-center justify-between gap-3 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-activedescendant={
          isOpen && activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined
        }
        onKeyDown={handleKeyDown}
      >
        <div className="min-w-0">
          <div className="text-sm text-text-primary">
            {selectedOption ? selectedOption.name : placeholder}
          </div>
        </div>

        <svg
          className={`w-4 h-4 text-text-tertiary transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && !disabled && (
        <div
          id={listboxId}
          role="listbox"
          className="absolute z-20 mt-2 w-full bg-white border border-border-secondary rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {options.map((option, index) => {
            const isActive = option.id === selectedId
            const isHighlighted = activeIndex >= 0 && activeIndex === index
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => handleSelect(option.id)}
                className={`w-full px-3 py-2 text-left hover:bg-background-secondary transition-colors ${
                  isActive ? 'bg-background-tertiary' : ''
                } ${isHighlighted && !isActive ? 'bg-background-tertiary' : ''}`}
                role="option"
                id={`${listboxId}-option-${index}`}
                aria-selected={isActive || isHighlighted}
              >
                <div className="text-sm text-text-primary">{option.name}</div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

interface DealDetailsProps {
  deal: Deal
  pipelines: Pipeline[]
  stages: Stage[]
  onDealUpdated?: (updatedDeal: Deal) => void
}

export const DealDetails = React.memo(function DealDetails({
  deal,
  pipelines,
  stages,
  onDealUpdated,
}: DealDetailsProps) {
  /**
   * Get Pipedrive URL for deal
   * TODO: Get company domain from backend/auth session
   */
  function getPipedriveDealUrl(dealId: number): string {
    // For now, use a placeholder domain
    // This should be replaced with actual domain from auth session
    return `https://app.pipedrive.com/deal/${dealId}`
  }

  // Editing state
  const [selectedPipelineId, setSelectedPipelineId] = useState(deal.pipeline.id)
  const [selectedStageId, setSelectedStageId] = useState(deal.stage.id)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isEditingPipeline, setIsEditingPipeline] = useState(false)
  const [isEditingStage, setIsEditingStage] = useState(false)

  // Won/Lost state
  const [isConfirmingWon, setIsConfirmingWon] = useState(false)
  const [isEnteringLostReason, setIsEnteringLostReason] = useState(false)
  const [lostReason, setLostReason] = useState('')
  const [isMarkingWon, setIsMarkingWon] = useState(false)
  const [isMarkingLost, setIsMarkingLost] = useState(false)
  const [wonError, setWonError] = useState<string | null>(null)
  const [lostError, setLostError] = useState<string | null>(null)

  // Reopen state
  const [isConfirmingReopen, setIsConfirmingReopen] = useState(false)
  const [isReopening, setIsReopening] = useState(false)
  const [reopenError, setReopenError] = useState<string | null>(null)

  // Track original values for cancel and change detection
  const originalPipelineId = useRef(deal.pipeline.id)
  const originalStageId = useRef(deal.stage.id)

  // Hooks
  const { updateDeal, markDealWonLost, reopenDeal } = usePipedrive()
  const { showToast } = useToast()

  // Update refs when deal prop changes (after successful save)
  useEffect(() => {
    originalPipelineId.current = deal.pipeline.id
    originalStageId.current = deal.stage.id
    setSelectedPipelineId(deal.pipeline.id)
    setSelectedStageId(deal.stage.id)
  }, [deal.pipeline.id, deal.stage.id])

  // Reset all transient UI state when switching deals
  useEffect(() => {
    setIsConfirmingReopen(false)
    setIsReopening(false)
    setReopenError(null)
    setIsConfirmingWon(false)
    setIsEnteringLostReason(false)
    setLostReason('')
    setIsMarkingWon(false)
    setIsMarkingLost(false)
    setWonError(null)
    setLostError(null)
    setError(null)
    setIsEditingPipeline(false)
    setIsEditingStage(false)
  }, [deal.id])

  // Get stages for currently selected pipeline
  const currentStages = useMemo(() => {
    return stages
      .filter((s) => s.pipelineId === selectedPipelineId)
      .sort((a, b) => a.orderNr - b.orderNr)
  }, [stages, selectedPipelineId])

  // Check if user made changes
  const hasChanges =
    selectedPipelineId !== originalPipelineId.current || selectedStageId !== originalStageId.current

  // Check if deal is editable (only open deals)
  const isEditable = deal.status === 'open'

  /**
   * Handle pipeline change
   */
  const handlePipelineChange = (newPipelineId: number) => {
    setSelectedPipelineId(newPipelineId)

    // Clear any existing error
    setError(null)

    // Update stages dropdown to show stages from new pipeline
    const newStages = stages
      .filter((s) => s.pipelineId === newPipelineId)
      .sort((a, b) => a.orderNr - b.orderNr)

    // Auto-select first stage of new pipeline
    if (newStages.length > 0) {
      setSelectedStageId(newStages[0].id)
    } else {
      // Edge case: pipeline has no stages (shouldn't happen in practice)
      logger.warn('[DealDetails] Pipeline has no stages:', newPipelineId)
      setSelectedStageId(0)
    }
  }

  /**
   * Handle stage change
   */
  const handleStageChange = (newStageId: number) => {
    setSelectedStageId(newStageId)
    setError(null) // Clear error on change
  }

  /**
   * Handle save
   */
  const handleSave = async () => {
    // Prevent double submission
    if (isSaving) return

    // Clear previous error
    setError(null)

    // Set loading state
    setIsSaving(true)

    try {
      // Call API via usePipedrive hook
      const updatedDeal = await updateDeal(deal.id, {
        pipelineId: selectedPipelineId,
        stageId: selectedStageId,
      })

      if (updatedDeal) {
        // Success: show toast
        showToast('Deal updated successfully')

        // Notify parent to update deals array
        onDealUpdated?.(updatedDeal)

        // Hide buttons immediately by updating refs to match new values
        originalPipelineId.current = selectedPipelineId
        originalStageId.current = selectedStageId

        // Exit editing mode
        setIsEditingPipeline(false)
        setIsEditingStage(false)
      } else {
        // API returned null (error handled by hook)
        const errorMessage = 'Failed to update deal. Please try again.'
        setError(errorMessage)
        // Keep changed values - let user retry or cancel manually
      }
    } catch (err) {
      // Unexpected error
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.'
      setError(errorMessage)
      // Keep changed values - let user retry or cancel manually

      logError('Failed to update deal', err, { dealId: deal.id }, Sentry.getCurrentScope())
    } finally {
      setIsSaving(false)
    }
  }

  /**
   * Handle cancel
   */
  const handleCancel = () => {
    // Revert to original values
    setSelectedPipelineId(originalPipelineId.current)
    setSelectedStageId(originalStageId.current)

    // Clear any error
    setError(null)

    // Exit editing mode
    setIsEditingPipeline(false)
    setIsEditingStage(false)
  }

  /**
   * Won/Lost Event Handlers
   */
  const handleWonClick = () => {
    setIsConfirmingWon(true)
    setWonError(null)
  }

  const handleCancelWon = () => {
    setIsConfirmingWon(false)
    setWonError(null)
  }

  const handleConfirmWon = async () => {
    setIsMarkingWon(true)
    setWonError(null)

    try {
      const updatedDeal = await markDealWonLost(deal.id, 'won')

      if (updatedDeal) {
        onDealUpdated?.(updatedDeal)
        setIsConfirmingWon(false)
        showToast('Deal marked as won')
      } else {
        setWonError('Failed to mark deal as won')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to mark deal as won'
      setWonError(errorMessage)
      logError('Failed to mark deal as won', err, { dealId: deal.id }, Sentry.getCurrentScope())
    } finally {
      setIsMarkingWon(false)
    }
  }

  const handleLostClick = () => {
    setIsEnteringLostReason(true)
    setLostReason('')
    setLostError(null)
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
    const trimmedReason = lostReason.trim()

    setIsMarkingLost(true)
    setLostError(null)

    try {
      // Lost reason is optional - only send if provided
      const updatedDeal = await markDealWonLost(
        deal.id,
        'lost',
        trimmedReason.length > 0 ? trimmedReason : undefined
      )

      if (updatedDeal) {
        onDealUpdated?.(updatedDeal)
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
        { dealId: deal.id, lostReason: trimmedReason },
        Sentry.getCurrentScope()
      )
    } finally {
      setIsMarkingLost(false)
    }
  }

  /**
   * Reopen Event Handlers
   */
  const handleReopenClick = () => {
    setIsConfirmingReopen(true)
    setReopenError(null)
  }

  const handleCancelReopen = () => {
    setIsConfirmingReopen(false)
    setReopenError(null)
  }

  const handleConfirmReopen = async () => {
    setIsReopening(true)
    setReopenError(null)

    try {
      const updatedDeal = await reopenDeal(deal.id)

      // Update parent component with new deal data
      onDealUpdated?.(updatedDeal)

      // Close confirmation UI
      setIsConfirmingReopen(false)

      // Show success toast
      showToast('Deal reopened')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to reopen deal'
      setReopenError(errorMessage)
      logError('Failed to reopen deal', error, { dealId: deal.id }, Sentry.getCurrentScope())
    } finally {
      setIsReopening(false)
    }
  }

  // Render for editable (open) deals
  if (isEditable) {
    return (
      <div className="mt-3 space-y-2">
        {/* Error Banner (if error) */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <div className="flex-1 text-sm text-red-800">{error}</div>
            <button
              onClick={() => setError(null)}
              aria-label="Dismiss error"
              className="hover:bg-red-100 rounded p-0.5"
              type="button"
            >
              <X className="w-4 h-4 text-red-600" />
            </button>
          </div>
        )}

        {/* Value */}
        <div className="text-sm text-text-secondary">
          <span className="font-medium">Value:</span> {deal.value}
        </div>

        {/* Pipeline - Label with Edit Icon or Dropdown */}
        {!isEditingPipeline ? (
          <div className="group flex items-center justify-between text-sm text-text-secondary">
            <div>
              <span className="font-medium">Pipeline:</span>{' '}
              {pipelines.find((p) => p.id === selectedPipelineId)?.name || 'Unknown'}
            </div>
            <button
              onClick={() => {
                setIsEditingPipeline(true)
                setIsEditingStage(true)
              }}
              className="p-1 hover:bg-gray-100 rounded invisible group-hover:visible"
              aria-label="Edit pipeline"
              type="button"
            >
              <Pencil className="w-3.5 h-3.5 text-text-tertiary" />
            </button>
          </div>
        ) : (
          <CustomDropdown
            options={pipelines}
            selectedId={selectedPipelineId}
            onSelect={handlePipelineChange}
            disabled={isSaving}
            placeholder="Select pipeline..."
          />
        )}

        {/* Stage - Label with Edit Icon or Dropdown */}
        {!isEditingStage ? (
          <div className="group flex items-center justify-between text-sm text-text-secondary">
            <div>
              <span className="font-medium">Stage:</span>{' '}
              {currentStages.find((s) => s.id === selectedStageId)?.name || 'Unknown'}
            </div>
            <button
              onClick={() => setIsEditingStage(true)}
              className="p-1 hover:bg-gray-100 rounded invisible group-hover:visible"
              aria-label="Edit stage"
              type="button"
            >
              <Pencil className="w-3.5 h-3.5 text-text-tertiary" />
            </button>
          </div>
        ) : (
          <CustomDropdown
            options={currentStages}
            selectedId={selectedStageId}
            onSelect={handleStageChange}
            disabled={isSaving}
            placeholder="Select stage..."
          />
        )}

        {/* Save/Cancel Buttons (only if hasChanges) */}
        {hasChanges && (
          <div className="flex gap-2 pt-2">
            <button
              onClick={handleCancel}
              disabled={isSaving}
              type="button"
              className="flex-1 px-4 py-2 bg-white border text-brand-primary text-sm font-medium rounded-lg hover:bg-brand-primary hover:text-white hover:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ border: '1px solid #665F98', borderColor: '#665F98' }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              type="button"
              className="flex-1 px-4 py-2 bg-brand-primary text-white text-sm font-medium rounded-lg hover:bg-brand-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <span className="flex items-center justify-center gap-2">
                  <Spinner size="sm" color="white" />
                  Saving...
                </span>
              ) : (
                'Save'
              )}
            </button>
          </div>
        )}

        {/* Won/Lost Buttons (only if no changes and not in won/lost flow) */}
        {!hasChanges && !isConfirmingWon && !isEnteringLostReason && (
          <div className="flex gap-2 pt-2 border-t border-border-primary">
            <button
              onClick={handleWonClick}
              disabled={isSaving}
              type="button"
              className="flex-1 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <span className="text-base">✓</span> Won
            </button>
            <button
              onClick={handleLostClick}
              disabled={isSaving}
              type="button"
              className="flex-1 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <span className="text-base">✗</span> Lost
            </button>
          </div>
        )}

        {/* Open in Pipedrive Link */}
        <a
          href={getPipedriveDealUrl(deal.id)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-brand-primary hover:text-brand-hover text-sm font-bold underline transition-colors"
        >
          <span>Open in Pipedrive</span>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </a>

        {/* Won Confirmation UI */}
        {isConfirmingWon && (
          <div className="mt-4 p-4 bg-gray-50 border border-border-primary rounded-lg">
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
          <div className="mt-4 p-4 bg-gray-50 border border-border-primary rounded-lg">
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
      </div>
    )
  }

  // Render for won/lost deals (read-only)
  return (
    <div className="mt-3 space-y-2">
      {/* Status */}
      <div className="text-sm text-text-secondary">
        <span className="font-medium">Status:</span>{' '}
        <span className={deal.status === 'won' ? 'text-green-600' : 'text-red-600'}>
          {deal.status === 'won' ? '✓ Won' : '✗ Lost'}
        </span>
      </div>

      {/* Lost Reason (if deal is lost) */}
      {deal.status === 'lost' && deal.lostReason && (
        <div className="text-sm text-text-secondary">
          <span className="font-medium">Lost Reason:</span> {deal.lostReason}
        </div>
      )}

      {/* Value */}
      <div className="text-sm text-text-secondary">
        <span className="font-medium">Value:</span> {deal.value}
      </div>

      {/* Pipeline (read-only text) */}
      <div className="text-sm text-text-secondary">
        <span className="font-medium">Pipeline:</span> {deal.pipeline.name}
      </div>

      {/* Stage (read-only text) */}
      <div className="text-sm text-text-secondary">
        <span className="font-medium">Stage:</span> {deal.stage.name}
      </div>

      {/* Reopen Button Section (for won/lost deals only) */}
      {!isConfirmingReopen && (
        <div className="pt-2 border-t border-border-primary">
          <button
            onClick={handleReopenClick}
            className="w-full px-4 py-2 bg-brand-primary text-white text-sm font-medium rounded-lg hover:bg-brand-hover transition-colors flex items-center justify-center gap-2"
            aria-label="Reopen deal"
            type="button"
          >
            Reopen
          </button>
        </div>
      )}

      {/* Reopen Confirmation UI */}
      {isConfirmingReopen && (
        <div className="mt-2 p-4 bg-gray-50 border border-border-primary rounded-lg">
          {reopenError && (
            <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <div className="flex-1 text-sm text-red-800">{reopenError}</div>
              <button
                onClick={() => setReopenError(null)}
                aria-label="Dismiss error"
                className="hover:bg-red-100 rounded p-0.5"
                type="button"
              >
                <X className="w-4 h-4 text-red-600" />
              </button>
            </div>
          )}
          <p className="text-sm text-text-primary mb-3">Reopen this deal?</p>
          <div className="flex gap-2">
            <button
              onClick={handleConfirmReopen}
              disabled={isReopening}
              type="button"
              className="flex-1 px-4 py-2 bg-brand-primary text-white text-sm font-medium rounded-lg hover:bg-brand-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isReopening ? (
                <span className="flex items-center justify-center gap-2">
                  <Spinner size="sm" color="white" />
                  Saving...
                </span>
              ) : (
                'Confirm'
              )}
            </button>
            <button
              onClick={handleCancelReopen}
              disabled={isReopening}
              type="button"
              className="flex-1 px-4 py-2 bg-white border text-brand-primary text-sm font-medium rounded-lg hover:bg-brand-primary hover:text-white hover:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ border: '1px solid #665F98', borderColor: '#665F98' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Open in Pipedrive Link */}
      <a
        href={getPipedriveDealUrl(deal.id)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-brand-primary hover:text-brand-hover text-sm font-bold underline transition-colors"
      >
        <span>Open in Pipedrive</span>
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
          />
        </svg>
      </a>
    </div>
  )
})
