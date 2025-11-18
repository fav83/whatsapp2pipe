import React, { useEffect, useId, useMemo, useRef, useState } from 'react'

interface DropdownOption {
  id: number
  label: string
}

interface StyledDropdownProps {
  options: DropdownOption[]
  value: number | null
  onChange: (value: number) => void
  placeholder?: string
  disabled?: boolean
}

export const StyledDropdown = React.memo(function StyledDropdown({
  options,
  value,
  onChange,
  placeholder = 'Select an option...',
  disabled = false,
}: StyledDropdownProps) {
  const listboxId = useId()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState<number>(-1)

  const selectedOption = useMemo(
    () => options.find((option) => option.id === value) ?? null,
    [options, value]
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
    if (!isOpen) return
    const selectedIndex = selectedOption
      ? options.findIndex((option) => option.id === selectedOption.id)
      : 0
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0)
  }, [isOpen, options, selectedOption])

  const toggleOpen = () => {
    if (disabled || options.length === 0) return
    setIsOpen((open) => !open)
  }

  const handleSelect = (option: DropdownOption) => {
    onChange(option.id)
    setIsOpen(false)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled || !options.length) return

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
      handleSelect(targetOption)
    } else if (event.key === 'Escape') {
      event.preventDefault()
      setIsOpen(false)
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={toggleOpen}
        className="w-full px-3 py-2 bg-white text-left border border-solid border-border-primary hover:border-brand-primary rounded-lg text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary transition-colors flex items-center justify-between gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-activedescendant={
          isOpen && activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined
        }
        aria-disabled={disabled}
        disabled={disabled}
        onKeyDown={handleKeyDown}
      >
        <div className="min-w-0">
          <div className={`text-sm ${selectedOption ? 'text-text-primary' : 'text-text-tertiary'}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </div>
        </div>

        <svg
          className={`w-4 h-4 text-text-tertiary transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && options.length > 0 && (
        <div
          id={listboxId}
          role="listbox"
          className="absolute z-20 mt-2 w-full bg-white border border-border-secondary rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {options.map((option, index) => {
            const isActive = option.id === value
            const isHighlighted = activeIndex >= 0 && activeIndex === index
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => handleSelect(option)}
                className={`w-full px-3 py-2 text-left flex items-start justify-between gap-3 hover:bg-background-secondary transition-colors ${
                  isActive ? 'bg-background-tertiary' : ''
                }`}
                role="option"
                id={`${listboxId}-option-${index}`}
                aria-selected={isActive || isHighlighted}
              >
                <div
                  className={`text-sm text-text-primary truncate ${
                    isHighlighted && !isActive ? 'bg-background-tertiary' : ''
                  }`}
                >
                  {option.label}
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
})
