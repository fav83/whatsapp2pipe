/**
 * PersonNoMatchState Component
 *
 * Displays form UI when no matching person is found in Pipedrive.
 * Shows two options: Create new person OR link to existing person.
 * Feature 10 implements Create functionality.
 * Feature 11 will implement Attach functionality.
 */

import { useEffect, useRef, useState } from 'react'
import { usePipedrive } from '../hooks/usePipedrive'
import { Spinner } from './Spinner'
import type { Person } from '../../types/person'

interface PersonNoMatchStateProps {
  contactName: string
  phone: string
  onPersonCreated: (person: Person) => void
  onPersonAttached: (person: Person) => void
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
  onPersonAttached,
}: PersonNoMatchStateProps) {
  const [name, setName] = useState(contactName)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<Person[]>([])
  const [selectedPersonId, setSelectedPersonId] = useState<number | null>(null)
  const [noResults, setNoResults] = useState(false)
  const [manualSearchError, setManualSearchError] = useState<string | null>(null)
  const [manualAttachError, setManualAttachError] = useState<string | null>(null)
  const searchRequestIdRef = useRef(0)
  const lastSearchTermRef = useRef('')

  const {
    createPerson,
    searchByName,
    attachPhone,
    isSearching,
    isAttaching,
    searchError,
    attachError,
    clearSearchError,
    clearAttachError,
  } = usePipedrive()

  // Check if Create button should be enabled
  const isCreateDisabled = !isValidName(name) || isCreating
  const trimmedSearchTerm = searchTerm.trim()
  const isSearchDisabled = trimmedSearchTerm.length < 2 || isSearching
  const selectedPerson = selectedPersonId
    ? (searchResults.find((person) => person.id === selectedPersonId) ?? null)
    : null
  const disableAttach = !selectedPerson || isAttaching

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

  /**
   * Handle search term change
   */
  function handleSearchTermChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSearchTerm(e.target.value)
    setManualSearchError(null)
    setManualAttachError(null)
    if (searchError) {
      clearSearchError()
    }
    if (attachError) {
      clearAttachError()
    }
  }

  /**
   * Run person search with current term
   */
  async function handleSearch(event?: React.FormEvent) {
    event?.preventDefault()
    if (isSearchDisabled) {
      return
    }

    setManualSearchError(null)
    setManualAttachError(null)
    clearSearchError()
    clearAttachError()
    setSelectedPersonId(null)
    setSearchResults([])
    setNoResults(false)

    const requestId = searchRequestIdRef.current + 1
    searchRequestIdRef.current = requestId
    lastSearchTermRef.current = trimmedSearchTerm

    try {
      const results = await searchByName(trimmedSearchTerm)

      // Ignore stale results
      if (searchRequestIdRef.current !== requestId) {
        return
      }

      setSearchResults(results)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Search failed'
      setManualSearchError(message)
    }
  }

  /**
   * Handle attach action
   */
  async function handleAttach() {
    if (!selectedPerson) {
      return
    }

    setManualAttachError(null)
    clearAttachError()

    try {
      const person = await attachPhone({
        personId: selectedPerson.id,
        phone,
      })

      if (person) {
        onPersonAttached(person)
      } else {
        setManualAttachError('Failed to attach phone. Please try again.')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to attach phone'
      setManualAttachError(message)
    }
  }

  /**
   * Compute "no results" once search resolves without errors
   */
  useEffect(() => {
    if (!isSearching && lastSearchTermRef.current) {
      if (searchResults.length === 0 && !searchError) {
        setNoResults(true)
      } else {
        setNoResults(false)
      }
    }
  }, [isSearching, searchResults, searchError])

  const bannerMessage =
    manualAttachError ?? attachError?.message ?? manualSearchError ?? searchError?.message ?? null

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

        {bannerMessage && (
          <div className="mb-3 px-3 py-2 bg-[#fef2f2] border border-[#fca5a5] rounded-lg flex items-start justify-between">
            <p className="text-sm text-[#dc2626] flex-1">{bannerMessage}</p>
            <button
              onClick={() => {
                setManualSearchError(null)
                setManualAttachError(null)
                if (searchError) {
                  clearSearchError()
                }
                if (attachError) {
                  clearAttachError()
                }
              }}
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

        <form onSubmit={handleSearch}>
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
              value={searchTerm}
              onChange={handleSearchTermChange}
              readOnly={isSearching}
              className="flex-1 text-sm text-[#111b21] bg-transparent border-none outline-none disabled:opacity-60"
              aria-label="Search existing contacts"
            />
            <button
              type="submit"
              disabled={isSearchDisabled}
              className="px-3 py-1.5 bg-[#00a884] text-white text-sm font-medium rounded-lg disabled:opacity-60 disabled:cursor-not-allowed hover:bg-[#008f6f] transition-colors flex items-center gap-2"
            >
              {isSearching && <Spinner size="sm" color="white" />}
              {isSearching ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>

        {/* Loading State */}
        {isSearching && (
          <div className="mt-4 space-y-2" aria-live="polite">
            {[0, 1, 2].map((key) => (
              <div
                key={key}
                className="h-12 rounded-lg bg-[#f0f2f5] animate-pulse"
                aria-hidden="true"
              />
            ))}
          </div>
        )}

        {/* Results List */}
        {!isSearching && searchResults.length > 0 && (
          <div className="mt-4">
            <div
              className={`max-h-56 overflow-y-auto space-y-2 pr-1 ${
                isAttaching ? 'opacity-60 pointer-events-none' : ''
              }`}
            >
              {searchResults.map((person) => {
                const firstPhone = person.phones?.[0]
                const isSelected = person.id === selectedPersonId
                return (
                  <button
                    key={person.id}
                    type="button"
                    onClick={() => setSelectedPersonId(person.id)}
                    className={`w-full text-left px-3 py-2 border rounded-lg transition-colors ${
                      isSelected
                        ? 'border-[#00a884] bg-[#e7f8f3]'
                        : 'border-[#d1d7db] bg-white hover:border-[#b3bcc2]'
                    }`}
                  >
                    <div className="text-sm font-semibold text-[#111b21]">{person.name}</div>
                    {firstPhone && (
                      <div className="text-xs text-[#667781]">
                        {firstPhone.value}
                        {firstPhone.label ? ` • ${firstPhone.label}` : ''}
                      </div>
                    )}
                    {person.organizationName && (
                      <div className="text-xs text-[#667781] italic">{person.organizationName}</div>
                    )}
                  </button>
                )
              })}
            </div>

            <button
              type="button"
              onClick={handleAttach}
              disabled={disableAttach}
              className="mt-3 w-full px-4 py-2 bg-[#00a884] text-white text-sm font-medium rounded-lg disabled:opacity-60 disabled:cursor-not-allowed hover:bg-[#008f6f] transition-colors flex items-center justify-center gap-2"
            >
              {isAttaching && <Spinner size="sm" color="white" />}
              {isAttaching ? 'Attaching...' : 'Attach number'}
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isSearching && noResults && (
          <div className="mt-4 px-3 py-3 border border-dashed border-[#d1d7db] rounded-lg text-sm text-[#667781]">
            No contacts matched "{lastSearchTermRef.current}". Try initials or another keyword.
          </div>
        )}
      </div>
    </div>
  )
}
