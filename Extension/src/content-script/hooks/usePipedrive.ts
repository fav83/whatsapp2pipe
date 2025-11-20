/**
 * Content Script Pipedrive Hook
 *
 * React hook for Pipedrive API operations
 * Sends messages to service worker and handles responses
 */

import { useState } from 'react'
import type { Person, CreatePersonData, AttachPhoneData } from '../../types/person'
import type { Deal, CreateDealData, UpdateDealData } from '../../types/deal'
import type { PipedriveRequest, PipedriveResponse } from '../../types/messages'

interface PipedriveError {
  message: string
  statusCode: number
}

export function usePipedrive() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<PipedriveError | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [isAttaching, setIsAttaching] = useState(false)
  const [isCreatingNote, setIsCreatingNote] = useState(false)
  const [isCreatingDeal, setIsCreatingDeal] = useState(false)
  const [searchError, setSearchError] = useState<PipedriveError | null>(null)
  const [attachError, setAttachError] = useState<PipedriveError | null>(null)
  const [createNoteError, setCreateNoteError] = useState<string | null>(null)
  const [createDealError, setCreateDealError] = useState<PipedriveError | null>(null)

  /**
   * Sends message to service worker and waits for response
   */
  const sendMessage = async <T extends PipedriveResponse>(
    message: PipedriveRequest
  ): Promise<T> => {
    const response = await chrome.runtime.sendMessage(message)
    return response as T
  }

  /**
   * Lookup person by phone number (returns person + deals)
   * Returns object with person, deals, and optional dealsError
   */
  const lookupByPhone = async (
    phone: string
  ): Promise<{
    person: Person | null
    deals: Deal[] | null
    dealsError?: string
  }> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await sendMessage<PipedriveResponse>({
        type: 'PIPEDRIVE_LOOKUP_BY_PHONE',
        phone,
      })

      if (response.type === 'PIPEDRIVE_LOOKUP_SUCCESS') {
        return {
          person: response.person,
          deals: response.deals,
          dealsError: response.dealsError,
        }
      } else if (response.type === 'PIPEDRIVE_ERROR') {
        setError({
          message: response.error,
          statusCode: response.statusCode,
        })
        return {
          person: null,
          deals: null,
        }
      }

      throw new Error('Unexpected response type')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Lookup failed'
      setError({ message: errorMessage, statusCode: 500 })
      return {
        person: null,
        deals: null,
      }
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Search persons by name
   * Returns array of matching persons (empty if none found)
   */
  const searchByName = async (name: string): Promise<Person[]> => {
    setIsSearching(true)
    setSearchError(null)

    try {
      const response = await sendMessage<PipedriveResponse>({
        type: 'PIPEDRIVE_SEARCH_BY_NAME',
        name,
      })

      if (response.type === 'PIPEDRIVE_SEARCH_SUCCESS') {
        return response.persons
      } else if (response.type === 'PIPEDRIVE_ERROR') {
        setSearchError({
          message: response.error,
          statusCode: response.statusCode,
        })
        return []
      }

      throw new Error('Unexpected response type')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Search failed'
      setSearchError({ message: errorMessage, statusCode: 500 })
      return []
    } finally {
      setIsSearching(false)
    }
  }

  /**
   * Create new person with WhatsApp phone
   */
  const createPerson = async (data: CreatePersonData): Promise<Person | null> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await sendMessage<PipedriveResponse>({
        type: 'PIPEDRIVE_CREATE_PERSON',
        data,
      })

      if (response.type === 'PIPEDRIVE_CREATE_SUCCESS') {
        return response.person
      } else if (response.type === 'PIPEDRIVE_ERROR') {
        setError({
          message: response.error,
          statusCode: response.statusCode,
        })
        return null
      }

      throw new Error('Unexpected response type')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create person'
      setError({ message: errorMessage, statusCode: 500 })
      return null
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Attach WhatsApp phone to existing person
   */
  const attachPhone = async (data: AttachPhoneData): Promise<Person | null> => {
    setIsAttaching(true)
    setAttachError(null)

    try {
      const response = await sendMessage<PipedriveResponse>({
        type: 'PIPEDRIVE_ATTACH_PHONE',
        data,
      })

      if (response.type === 'PIPEDRIVE_ATTACH_SUCCESS') {
        return response.person
      } else if (response.type === 'PIPEDRIVE_ERROR') {
        setAttachError({
          message: response.error,
          statusCode: response.statusCode,
        })
        return null
      }

      throw new Error('Unexpected response type')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to attach phone'
      setAttachError({ message: errorMessage, statusCode: 500 })
      return null
    } finally {
      setIsAttaching(false)
    }
  }

  /**
   * Create a note in Pipedrive attached to a person
   */
  const createNote = async (personId: number, content: string): Promise<boolean> => {
    setIsCreatingNote(true)
    setCreateNoteError(null)

    try {
      const response = await sendMessage<PipedriveResponse>({
        type: 'PIPEDRIVE_CREATE_NOTE',
        personId,
        content,
      })

      if (response.type === 'PIPEDRIVE_CREATE_NOTE_SUCCESS') {
        return true
      } else if (response.type === 'PIPEDRIVE_CREATE_NOTE_ERROR') {
        setCreateNoteError(response.error)
        return false
      }

      // Unexpected response type
      setCreateNoteError('Unexpected error occurred')
      return false
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create note'
      setCreateNoteError(errorMessage)
      return false
    } finally {
      setIsCreatingNote(false)
    }
  }

  /**
   * Create a deal in Pipedrive linked to a person
   */
  const createDeal = async (data: CreateDealData): Promise<Deal | null> => {
    setIsCreatingDeal(true)
    setCreateDealError(null)

    try {
      const response = await sendMessage<PipedriveResponse>({
        type: 'PIPEDRIVE_CREATE_DEAL',
        data,
      })

      if (response.type === 'PIPEDRIVE_CREATE_DEAL_SUCCESS') {
        return response.deal
      } else if (response.type === 'PIPEDRIVE_ERROR') {
        setCreateDealError({
          message: response.error,
          statusCode: response.statusCode,
        })
        return null
      }

      throw new Error('Unexpected response type')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create deal'
      setCreateDealError({ message: errorMessage, statusCode: 500 })
      return null
    } finally {
      setIsCreatingDeal(false)
    }
  }

  /**
   * Update deal pipeline and/or stage
   */
  const updateDeal = async (dealId: number, data: UpdateDealData): Promise<Deal | null> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await sendMessage<PipedriveResponse>({
        type: 'PIPEDRIVE_UPDATE_DEAL',
        dealId,
        data,
      })

      if (response.type === 'PIPEDRIVE_UPDATE_DEAL_SUCCESS') {
        return response.deal
      } else if (response.type === 'PIPEDRIVE_ERROR') {
        setError({
          message: response.error,
          statusCode: response.statusCode,
        })
        return null
      }

      throw new Error('Unexpected response type')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update deal'
      setError({ message: errorMessage, statusCode: 500 })
      return null
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Mark deal as won or lost
   */
  const markDealWonLost = async (
    dealId: number,
    status: 'won' | 'lost',
    lostReason?: string
  ): Promise<Deal | null> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await sendMessage<PipedriveResponse>({
        type: 'PIPEDRIVE_MARK_DEAL_WON_LOST',
        dealId,
        status,
        lostReason,
      })

      if (response.type === 'PIPEDRIVE_MARK_DEAL_WON_LOST_SUCCESS') {
        return response.deal
      } else if (response.type === 'PIPEDRIVE_ERROR') {
        setError({
          message: response.error,
          statusCode: response.statusCode,
        })
        return null
      }

      throw new Error('Unexpected response type')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update deal status'
      setError({ message: errorMessage, statusCode: 500 })
      return null
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Clear error state
   */
  const clearError = () => setError(null)
  const clearSearchError = () => setSearchError(null)
  const clearAttachError = () => setAttachError(null)
  const clearCreateDealError = () => setCreateDealError(null)

  return {
    isLoading,
    error,
    isSearching,
    isAttaching,
    isCreatingNote,
    isCreatingDeal,
    searchError,
    attachError,
    createNoteError,
    createDealError,
    lookupByPhone,
    searchByName,
    createPerson,
    attachPhone,
    createNote,
    createDeal,
    updateDeal,
    markDealWonLost,
    clearError,
    clearSearchError,
    clearAttachError,
    clearCreateDealError,
  }
}
