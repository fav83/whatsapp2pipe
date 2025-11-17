import React, { useEffect, useMemo, useRef, useState } from 'react'
import type { Deal } from '@/types/deal'

interface DealDropdownProps {
  deals: Deal[]
  selectedDealId: number | null
  onSelect: (dealId: number) => void
}

export const DealDropdown = React.memo(function DealDropdown({
  deals,
  selectedDealId,
  onSelect,
}: DealDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const selectedDeal = useMemo(
    () => deals.find((deal) => deal.id === selectedDealId) ?? null,
    [deals, selectedDealId]
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

  const getStatusBadgeClasses = (status: Deal['status']) => {
    switch (status) {
      case 'won':
        return 'bg-green-50 text-green-700 border border-green-200'
      case 'lost':
        return 'bg-red-50 text-red-700 border border-red-200'
      default:
        return null
    }
  }

  const getTitleClass = (status: Deal['status']) => {
    switch (status) {
      case 'won':
        return 'text-green-700'
      case 'lost':
        return 'text-red-600'
      default:
        return 'text-text-primary'
    }
  }

  const formatStatus = (status: Deal['status']) => status.charAt(0).toUpperCase() + status.slice(1)

  const handleSelect = (dealId: number) => {
    onSelect(dealId)
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="w-full px-3 py-2 bg-white text-left border border-solid border-border-primary hover:border-brand-primary rounded-lg text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary transition-colors flex items-center justify-between gap-3"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="min-w-0">
          <div
            className={`text-sm ${
              selectedDeal ? getTitleClass(selectedDeal.status) : 'text-text-tertiary'
            }`}
          >
            {selectedDeal ? selectedDeal.title || '(Untitled Deal)' : 'Select a deal...'}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {selectedDeal && getStatusBadgeClasses(selectedDeal.status) && (
            <span
              className={`px-2 py-0.5 text-[11px] font-semibold rounded-full ${getStatusBadgeClasses(
                selectedDeal.status
              )}`}
            >
              {formatStatus(selectedDeal.status)}
            </span>
          )}
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
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-20 mt-2 w-full bg-white border border-border-secondary rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {deals.map((deal) => {
            const isActive = deal.id === selectedDealId
            return (
              <button
                key={deal.id}
                type="button"
                onClick={() => handleSelect(deal.id)}
                className={`w-full px-3 py-2 text-left flex items-start justify-between gap-3 hover:bg-background-secondary transition-colors ${
                  isActive ? 'bg-background-tertiary' : ''
                }`}
                role="option"
                aria-selected={isActive}
              >
                <div className="min-w-0">
                  <div className={`text-sm ${getTitleClass(deal.status)} truncate`}>
                    {deal.title || '(Untitled Deal)'}
                  </div>
                </div>
                {getStatusBadgeClasses(deal.status) && (
                  <span
                    className={`mt-0.5 px-2 py-0.5 text-[11px] font-semibold rounded-full ${getStatusBadgeClasses(
                      deal.status
                    )}`}
                  >
                    {formatStatus(deal.status)}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
})
