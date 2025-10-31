/**
 * Content Script Pipedrive Hook
 *
 * React hook for Pipedrive API operations
 * Sends messages to service worker and handles responses
 */

import { useState } from 'react'
import type { Person, CreatePersonData, AttachPhoneData } from '../../types/person'
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
  const [searchError, setSearchError] = useState<PipedriveError | null>(null)
  const [attachError, setAttachError] = useState<PipedriveError | null>(null)

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
   * Lookup person by phone number
   * Returns person or null if not found
   */
  const lookupByPhone = async (phone: string): Promise<Person | null> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await sendMessage<PipedriveResponse>({
        type: 'PIPEDRIVE_LOOKUP_BY_PHONE',
        phone,
      })

      if (response.type === 'PIPEDRIVE_LOOKUP_SUCCESS') {
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
      const errorMessage = err instanceof Error ? err.message : 'Lookup failed'
      setError({ message: errorMessage, statusCode: 500 })
      return null
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
   * Clear error state
   */
  const clearError = () => setError(null)
  const clearSearchError = () => setSearchError(null)
  const clearAttachError = () => setAttachError(null)

  return {
    isLoading,
    error,
    isSearching,
    isAttaching,
    searchError,
    attachError,
    lookupByPhone,
    searchByName,
    createPerson,
    attachPhone,
    clearError,
    clearSearchError,
    clearAttachError,
  }
}
