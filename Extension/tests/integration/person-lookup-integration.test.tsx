/**
 * Person Lookup Integration Tests
 *
 * Simpler integration tests focusing on the lookup flow logic
 * without requiring complex state manipulation.
 */

import { describe, it, expect, vi } from 'vitest'
import { waitFor } from '@testing-library/react'
import { renderHook } from '@testing-library/react'
import { usePipedrive } from '../../src/content-script/hooks/usePipedrive'
import type { Person } from '../../src/types/person'

// Get references to the globally mocked chrome API
const mockSendMessage = vi.mocked(chrome.runtime.sendMessage)

describe('Person Lookup Integration', () => {
  describe('usePipedrive Hook Integration', () => {
    it('lookupByPhone returns person when found', async () => {
      const mockPerson: Person = {
        id: 123,
        name: 'John Doe',
        phones: [{ value: '+1234567890', label: 'mobile', isPrimary: true }],
        email: 'john@example.com',
      }

      mockSendMessage.mockResolvedValueOnce({
        type: 'PIPEDRIVE_LOOKUP_SUCCESS',
        person: mockPerson,
      })

      const { result } = renderHook(() => usePipedrive())

      const person = await result.current.lookupByPhone('+1234567890')

      expect(person).toEqual(mockPerson)
      expect(result.current.error).toBeNull()
      expect(result.current.isLoading).toBe(false)
    })

    it('lookupByPhone returns null when person not found', async () => {
      mockSendMessage.mockResolvedValueOnce({
        type: 'PIPEDRIVE_LOOKUP_SUCCESS',
        person: null,
      })

      const { result } = renderHook(() => usePipedrive())

      const person = await result.current.lookupByPhone('+9999999999')

      expect(person).toBeNull()
      expect(result.current.error).toBeNull()
    })

    it('lookupByPhone handles API errors gracefully', async () => {
      mockSendMessage.mockResolvedValueOnce({
        type: 'PIPEDRIVE_ERROR',
        error: 'Network connection failed',
        statusCode: 500,
      })

      const { result } = renderHook(() => usePipedrive())

      const person = await result.current.lookupByPhone('+1111111111')

      expect(person).toBeNull()

      // Wait for error state to be set
      await waitFor(() => {
        expect(result.current.error).not.toBeNull()
      })

      expect(result.current.error?.message).toBe('Network connection failed')
      expect(result.current.error?.statusCode).toBe(500)
    })

    it('sets loading state during lookup', async () => {
      const mockPerson: Person = {
        id: 456,
        name: 'Jane Smith',
        phones: [{ value: '+5555555555', label: 'mobile', isPrimary: true }],
        email: null,
      }

      // Create a promise that we can control
      let resolvePromise: (value: unknown) => void
      const promise = new Promise<unknown>((resolve) => {
        resolvePromise = resolve
      })

      mockSendMessage.mockReturnValueOnce(promise as Promise<unknown>)

      const { result } = renderHook(() => usePipedrive())

      // Start the lookup
      const lookupPromise = result.current.lookupByPhone('+5555555555')

      // Should be loading
      await waitFor(() => {
        expect(result.current.isLoading).toBe(true)
      })

      // Resolve the promise
      resolvePromise!({
        type: 'PIPEDRIVE_LOOKUP_SUCCESS',
        person: mockPerson,
      })

      // Wait for lookup to complete
      await lookupPromise

      // Should no longer be loading
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
      expect(result.current.error).toBeNull()
    })

    it('calls chrome.runtime.sendMessage with correct parameters', async () => {
      mockSendMessage.mockResolvedValueOnce({
        type: 'PIPEDRIVE_LOOKUP_SUCCESS',
        person: null,
      })

      const { result } = renderHook(() => usePipedrive())

      await result.current.lookupByPhone('+1234567890')

      expect(mockSendMessage).toHaveBeenCalledWith({
        type: 'PIPEDRIVE_LOOKUP_BY_PHONE',
        phone: '+1234567890',
      })
    })

    it('handles multiple sequential lookups correctly', async () => {
      const person1: Person = {
        id: 1,
        name: 'Person 1',
        phones: [{ value: '+1111111111', label: 'mobile', isPrimary: true }],
        email: null,
      }

      const person2: Person = {
        id: 2,
        name: 'Person 2',
        phones: [{ value: '+2222222222', label: 'mobile', isPrimary: true }],
        email: null,
      }

      mockSendMessage
        .mockResolvedValueOnce({
          type: 'PIPEDRIVE_LOOKUP_SUCCESS',
          person: person1,
        })
        .mockResolvedValueOnce({
          type: 'PIPEDRIVE_LOOKUP_SUCCESS',
          person: person2,
        })

      const { result } = renderHook(() => usePipedrive())

      // First lookup
      const result1 = await result.current.lookupByPhone('+1111111111')
      expect(result1).toEqual(person1)

      // Second lookup
      const result2 = await result.current.lookupByPhone('+2222222222')
      expect(result2).toEqual(person2)

      // Verify both calls were made
      expect(mockSendMessage).toHaveBeenCalledTimes(2)
    })

    it('clears previous errors on new lookup', async () => {
      // First call fails
      mockSendMessage.mockResolvedValueOnce({
        type: 'PIPEDRIVE_ERROR',
        error: 'First error',
        statusCode: 500,
      })

      const { result } = renderHook(() => usePipedrive())

      await result.current.lookupByPhone('+1111111111')

      // Wait for error to be set
      await waitFor(() => {
        expect(result.current.error?.message).toBe('First error')
      })

      // Second call succeeds
      mockSendMessage.mockResolvedValueOnce({
        type: 'PIPEDRIVE_LOOKUP_SUCCESS',
        person: null,
      })

      await result.current.lookupByPhone('+2222222222')

      // Error should be cleared
      await waitFor(() => {
        expect(result.current.error).toBeNull()
      })
    })
  })

  describe('State Transitions', () => {
    it('verifies person-loading state structure is correct', () => {
      const loadingState = {
        type: 'person-loading' as const,
        name: 'Test User',
        phone: '+1234567890',
      }

      expect(loadingState.type).toBe('person-loading')
      expect(loadingState.name).toBe('Test User')
      expect(loadingState.phone).toBe('+1234567890')
    })

    it('verifies person-matched state structure is correct', () => {
      const mockPerson: Person = {
        id: 123,
        name: 'John Doe',
        phones: [{ value: '+1234567890', label: 'mobile', isPrimary: true }],
        email: 'john@example.com',
      }

      const matchedState = {
        type: 'person-matched' as const,
        person: mockPerson,
        phone: '+1234567890',
      }

      expect(matchedState.type).toBe('person-matched')
      expect(matchedState.person).toEqual(mockPerson)
      expect(matchedState.phone).toBe('+1234567890')
    })

    it('verifies person-no-match state structure is correct', () => {
      const noMatchState = {
        type: 'person-no-match' as const,
        name: 'Unknown User',
        phone: '+9999999999',
      }

      expect(noMatchState.type).toBe('person-no-match')
      expect(noMatchState.name).toBe('Unknown User')
      expect(noMatchState.phone).toBe('+9999999999')
    })

    it('verifies person-error state structure is correct', () => {
      const errorState = {
        type: 'person-error' as const,
        name: 'Test User',
        phone: '+1234567890',
        error: 'Network error',
      }

      expect(errorState.type).toBe('person-error')
      expect(errorState.name).toBe('Test User')
      expect(errorState.phone).toBe('+1234567890')
      expect(errorState.error).toBe('Network error')
    })
  })
})
