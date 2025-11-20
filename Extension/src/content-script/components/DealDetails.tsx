import React, { useState, useRef, useEffect, useMemo, useId } from 'react'
import { X } from 'lucide-react'
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
  // Editing state
  const [selectedPipelineId, setSelectedPipelineId] = useState(deal.pipeline.id)
  const [selectedStageId, setSelectedStageId] = useState(deal.stage.id)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Track original values for cancel and change detection
  const originalPipelineId = useRef(deal.pipeline.id)
  const originalStageId = useRef(deal.stage.id)

  // Hooks
  const { updateDeal } = usePipedrive()
  const { showToast } = useToast()

  // Update refs when deal prop changes (after successful save)
  useEffect(() => {
    originalPipelineId.current = deal.pipeline.id
    originalStageId.current = deal.stage.id
    setSelectedPipelineId(deal.pipeline.id)
    setSelectedStageId(deal.stage.id)
  }, [deal.pipeline.id, deal.stage.id])

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

        {/* Pipeline Dropdown */}
        <CustomDropdown
          options={pipelines}
          selectedId={selectedPipelineId}
          onSelect={handlePipelineChange}
          disabled={isSaving}
          placeholder="Select pipeline..."
        />

        {/* Stage Dropdown */}
        <CustomDropdown
          options={currentStages}
          selectedId={selectedStageId}
          onSelect={handleStageChange}
          disabled={isSaving}
          placeholder="Select stage..."
        />

        {/* Save/Cancel Buttons (only if hasChanges) */}
        {hasChanges && (
          <div className="flex gap-2 pt-2">
            <button
              onClick={handleCancel}
              disabled={isSaving}
              type="button"
              className="flex-1 px-4 py-2 border border-border-secondary text-text-primary text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
      </div>
    )
  }

  // Render for won/lost deals (read-only)
  return (
    <div className="mt-3 space-y-2">
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
    </div>
  )
})
