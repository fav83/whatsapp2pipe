/**
 * PersonNoMatchState Component
 *
 * Displays form UI when no matching person is found in Pipedrive.
 * Shows two options: Create new person OR link to existing person.
 * Feature 10 implements Create functionality.
 * Feature 11 will implement Attach functionality.
 */

import { useState } from 'react'
import { usePipedrive } from '../hooks/usePipedrive'
import { Spinner } from './Spinner'
import type { Person } from '../../types/person'

interface PersonNoMatchStateProps {
  contactName: string
  phone: string
  onPersonCreated: (person: Person) => void
}

/**
 * Validate person name
 * Returns true if name is valid, false otherwise
 */
export function isValidName(name: string): boolean {
  const trimmed = name.trim()

  // Must be at least 2 characters
  if (trimmed.length < 2) {
    return false
  }

  // Only Unicode letters, spaces, hyphens, and apostrophes
  // Supports international characters (João, Łukasz, Мария, etc.)
  const validPattern = /^[\p{L}\s'-]+$/u
  return validPattern.test(trimmed)
}

export function PersonNoMatchState({
  contactName,
  phone,
  onPersonCreated,
}: PersonNoMatchStateProps) {
  const [name, setName] = useState(contactName)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { createPerson } = usePipedrive()

  // Check if Create button should be enabled
  const isCreateDisabled = !isValidName(name) || isCreating

  /**
   * Handle Create button click
   */
  async function handleCreate() {
    if (isCreateDisabled) return

    setIsCreating(true)
    setError(null)

    try {
      const person = await createPerson({
        name: name.trim(),
        phone,
      })

      if (person) {
        // Success: notify parent to transition to person-matched state
        onPersonCreated(person)
      } else {
        // API returned null (error already set in usePipedrive)
        setError('Failed to create contact. Please try again.')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create contact')
    } finally {
      setIsCreating(false)
    }
  }

  /**
   * Handle name input change
   */
  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    setName(e.target.value)
    // Clear error when user starts typing
    if (error) {
      setError(null)
    }
  }

  /**
   * Handle error dismiss
   */
  function dismissError() {
    setError(null)
  }

  return (
    <div className="px-5 pt-5">
      {/* Contact Info Header */}
      <div className="mb-4">
        <div className="text-base font-semibold text-[#111b21] mb-1">{contactName}</div>
        <div className="text-sm text-[#667781]">{phone}</div>
      </div>

      {/* Section 1: Create New Person */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-[#111b21] mb-3">Add this contact to Pipedrive</h3>

        {/* Error Banner */}
        {error && (
          <div className="mb-3 px-3 py-2 bg-[#fef2f2] border border-[#fca5a5] rounded-lg flex items-start justify-between">
            <p className="text-sm text-[#dc2626] flex-1">{error}</p>
            <button
              onClick={dismissError}
              className="ml-2 text-[#dc2626] hover:text-[#991b1b]"
              aria-label="Dismiss error"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        )}

        {/* Name Input */}
        <div className="mb-4">
          <div className="flex items-center gap-2 px-3 py-2 border border-[#d1d7db] rounded-lg bg-white">
            <span className="text-[#667781] text-sm font-medium">T</span>
            <input
              type="text"
              value={name}
              onChange={handleNameChange}
              placeholder="Name"
              disabled={isCreating}
              className="flex-1 text-sm text-[#111b21] bg-transparent border-none outline-none disabled:opacity-60"
            />
          </div>
        </div>

        {/* Create Button */}
        <button
          onClick={handleCreate}
          disabled={isCreateDisabled}
          className="w-full px-4 py-2 bg-[#00a884] text-white text-sm font-medium rounded-lg disabled:opacity-60 disabled:cursor-not-allowed hover:bg-[#008f6f] transition-colors flex items-center justify-center gap-2"
        >
          {isCreating && <Spinner size="sm" color="white" />}
          {isCreating ? 'Creating...' : 'Create'}
        </button>
      </div>

      {/* Section 2: Link to Existing Person */}
      <div className="pt-4 border-t border-[#d1d7db]">
        <p className="text-sm text-[#667781] mb-3">
          Or add the number <span className="font-medium text-[#111b21]">{phone}</span> to an
          existing contact
        </p>

        {/* Search Input */}
        <div className="flex items-center gap-2 px-3 py-2 border border-[#d1d7db] rounded-lg bg-white">
          <svg
            className="w-4 h-4 text-[#667781]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search contact..."
            disabled
            className="flex-1 text-sm text-[#111b21] bg-transparent border-none outline-none disabled:opacity-60"
          />
        </div>
      </div>
    </div>
  )
}
