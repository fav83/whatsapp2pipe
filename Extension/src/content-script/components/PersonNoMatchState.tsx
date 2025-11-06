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
    <div className="p-3 space-y-3">
      {/* Section 2: Contact Info Card */}
      <div className="p-3 bg-white rounded-lg border border-border-secondary shadow-sm">
        <div className="text-base font-semibold text-text-primary mb-1">{contactName}</div>
        <div className="text-sm text-text-secondary">{phone}</div>
      </div>

      {/* Section 3: Create New Person */}
      <div className="p-3 bg-white rounded-lg border border-border-secondary shadow-sm">
        <h3 className="text-sm font-semibold text-text-primary mb-3">
          Add this contact to Pipedrive
        </h3>

        {/* Error Banner */}
        {error && (
          <div className="mb-3 px-3 py-2 bg-error-background border border-error-border rounded-lg flex items-start justify-between">
            <p className="text-sm text-error-text flex-1">{error}</p>
            <button
              onClick={dismissError}
              className="ml-2 text-error-text hover:text-error-text-hover"
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
          <div className="flex items-center gap-2 px-3 py-2 border border-solid border-border-primary rounded-lg bg-white focus-within:border-brand-primary focus-within:ring-1 focus-within:ring-brand-primary">
            <span className="text-text-secondary text-sm font-medium">T</span>
            <input
              type="text"
              value={name}
              onChange={handleNameChange}
              placeholder="Name"
              disabled={isCreating}
              className="flex-1 text-sm text-text-primary bg-transparent border-none outline-none disabled:opacity-60 placeholder:text-text-tertiary"
            />
          </div>
        </div>

        {/* Create Button */}
        <button
          onClick={handleCreate}
          disabled={isCreateDisabled}
          className="w-full h-[38px] px-4 py-2 bg-brand-primary text-white text-sm font-medium rounded-lg disabled:opacity-60 disabled:cursor-not-allowed hover:bg-brand-hover transition-colors flex items-center justify-center gap-2"
        >
          {isCreating ? <Spinner size="md" color="white" /> : 'Create'}
        </button>
      </div>

      {/* Section 4: Link to Existing Person */}
      <div className="p-3 bg-white rounded-lg border border-border-secondary shadow-sm">
        <p className="text-sm text-text-secondary mb-3">
          Or add the number <span className="font-medium text-text-primary">{phone}</span> to an
          existing contact
        </p>

        {bannerMessage && (
          <div className="mb-3 px-3 py-2 bg-error-background border border-error-border rounded-lg flex items-start justify-between">
            <p className="text-sm text-error-text flex-1">{bannerMessage}</p>
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
              className="ml-2 text-error-text hover:text-error-text-hover"
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
          <div className="w-full flex items-center gap-2 px-3 py-2 border border-solid border-border-primary rounded-lg bg-white focus-within:border-brand-primary focus-within:ring-1 focus-within:ring-brand-primary">
            <svg
              className="w-4 h-4 text-text-secondary shrink-0"
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
              className="flex-1 min-w-0 text-sm text-text-primary bg-transparent border-none outline-none disabled:opacity-60 placeholder:text-text-tertiary"
              aria-label="Search existing contacts"
            />
            <button
              type="submit"
              disabled={isSearchDisabled}
              className="w-[34px] h-[34px] bg-brand-primary text-white text-sm font-medium rounded-lg disabled:opacity-60 disabled:cursor-not-allowed hover:bg-brand-hover transition-colors flex items-center justify-center shrink-0"
              aria-label="Search"
              title="Search"
            >
              {isSearching ? (
                <Spinner size="md" color="white" />
              ) : (
                <>
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <span className="sr-only">Search</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Loading State */}
        {isSearching && (
          <div className="mt-3 space-y-2" aria-live="polite">
            {[0, 1, 2].map((key) => (
              <div
                key={key}
                className="h-12 rounded-lg bg-background-secondary animate-pulse"
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
                    className={`w-full text-left px-3 py-2 border-2 rounded-lg transition-colors cursor-pointer ${
                      isSelected
                        ? 'border-brand-primary hover:border-brand-hover bg-brand-secondary hover:bg-background-hover'
                        : 'border-border-primary bg-white hover:border-border-secondary hover:bg-background-main'
                    }`}
                  >
                    <div className="text-sm font-semibold text-text-primary">{person.name}</div>
                    {firstPhone && (
                      <div className="text-xs text-text-secondary">
                        {firstPhone.value}
                        {firstPhone.label ? ` • ${firstPhone.label}` : ''}
                      </div>
                    )}
                    {person.organizationName && (
                      <div className="text-xs text-text-secondary italic">
                        {person.organizationName}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>

            <button
              type="button"
              onClick={handleAttach}
              disabled={disableAttach}
              className="mt-3 w-full h-[38px] px-4 py-2 bg-brand-primary text-white text-sm font-medium rounded-lg disabled:opacity-60 disabled:cursor-not-allowed hover:bg-brand-hover transition-colors flex items-center justify-center gap-2"
            >
              {isAttaching ? <Spinner size="md" color="white" /> : 'Attach number'}
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isSearching && noResults && (
          <div className="mt-3 px-3 py-3 border border-dashed border-border-primary rounded-lg text-sm text-text-secondary">
            No contacts matched "{lastSearchTermRef.current}". Try initials or another keyword.
          </div>
        )}
      </div>
    </div>
  )
}
