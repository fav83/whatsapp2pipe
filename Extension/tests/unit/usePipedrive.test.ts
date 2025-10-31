/**
 * Tests for usePipedrive React Hook
 */

import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { usePipedrive } from '../../src/content-script/hooks/usePipedrive'

describe('usePipedrive', () => {
  beforeEach(() => {
    // Mock chrome.runtime.sendMessage
    global.chrome = {
      runtime: {
        sendMessage: vi.fn(),
      },
    } as typeof chrome
  })

  describe('Initial State', () => {
    it('initializes with isLoading false', () => {
      const { result } = renderHook(() => usePipedrive())

      expect(result.current.isLoading).toBe(false)
      expect(result.current.isSearching).toBe(false)
      expect(result.current.isAttaching).toBe(false)
    })

    it('initializes with error null', () => {
      const { result } = renderHook(() => usePipedrive())

      expect(result.current.error).toBeNull()
      expect(result.current.searchError).toBeNull()
      expect(result.current.attachError).toBeNull()
    })

    it('exposes all expected methods', () => {
      const { result } = renderHook(() => usePipedrive())

      expect(result.current.lookupByPhone).toBeInstanceOf(Function)
      expect(result.current.searchByName).toBeInstanceOf(Function)
      expect(result.current.createPerson).toBeInstanceOf(Function)
      expect(result.current.attachPhone).toBeInstanceOf(Function)
      expect(result.current.clearError).toBeInstanceOf(Function)
      expect(result.current.clearSearchError).toBeInstanceOf(Function)
      expect(result.current.clearAttachError).toBeInstanceOf(Function)
    })
  })

  describe('lookupByPhone', () => {
    it('sets loading state during request', async () => {
      vi.mocked(chrome.runtime.sendMessage).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      )

      const { result } = renderHook(() => usePipedrive())

      expect(result.current.isLoading).toBe(false)

      const promise = result.current.lookupByPhone('+48123456789')

      await waitFor(() => {
        expect(result.current.isLoading).toBe(true)
      })

      await promise
    })

    it('returns person on success', async () => {
      const mockPerson = { id: 123, name: 'John', phones: [], email: null }
      vi.mocked(chrome.runtime.sendMessage).mockResolvedValue({
        type: 'PIPEDRIVE_LOOKUP_SUCCESS',
        person: mockPerson,
      })

      const { result } = renderHook(() => usePipedrive())
      const person = await result.current.lookupByPhone('+48123456789')

      expect(person).toEqual(mockPerson)
      expect(result.current.error).toBeNull()
      expect(result.current.isLoading).toBe(false)
    })

    it('returns null when not found', async () => {
      vi.mocked(chrome.runtime.sendMessage).mockResolvedValue({
        type: 'PIPEDRIVE_LOOKUP_SUCCESS',
        person: null,
      })

      const { result } = renderHook(() => usePipedrive())
      const person = await result.current.lookupByPhone('+48123456789')

      expect(person).toBeNull()
      expect(result.current.error).toBeNull()
    })

    it('returns null on error and sets error state', async () => {
      vi.mocked(chrome.runtime.sendMessage).mockResolvedValue({
        type: 'PIPEDRIVE_ERROR',
        error: 'Not found',
        statusCode: 404,
      })

      const { result } = renderHook(() => usePipedrive())
      const person = await result.current.lookupByPhone('+48123456789')

      expect(person).toBeNull()
      await waitFor(() => {
        expect(result.current.error).toMatchObject({
          message: 'Not found',
          statusCode: 404,
        })
      })
    })

    it('sends correct message type', async () => {
      vi.mocked(chrome.runtime.sendMessage).mockResolvedValue({
        type: 'PIPEDRIVE_LOOKUP_SUCCESS',
        person: null,
      })

      const { result } = renderHook(() => usePipedrive())
      await result.current.lookupByPhone('+48123456789')

      expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({
        type: 'PIPEDRIVE_LOOKUP_BY_PHONE',
        phone: '+48123456789',
      })
    })

    it('clears loading state after completion', async () => {
      vi.mocked(chrome.runtime.sendMessage).mockResolvedValue({
        type: 'PIPEDRIVE_LOOKUP_SUCCESS',
        person: null,
      })

      const { result } = renderHook(() => usePipedrive())
      await result.current.lookupByPhone('+48123456789')

      expect(result.current.isLoading).toBe(false)
    })
  })

  describe('searchByName', () => {
    it('sets isSearching during request', async () => {
      vi.mocked(chrome.runtime.sendMessage).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      )

      const { result } = renderHook(() => usePipedrive())
      const promise = result.current.searchByName('John')

      await waitFor(() => {
        expect(result.current.isSearching).toBe(true)
      })

      await promise
      expect(result.current.isSearching).toBe(false)
    })

    it('returns array of persons on success and clears search error', async () => {
      const mockPersons = [
        { id: 123, name: 'John', phones: [], email: null },
        { id: 456, name: 'John Doe', phones: [], email: null },
      ]
      vi.mocked(chrome.runtime.sendMessage).mockResolvedValue({
        type: 'PIPEDRIVE_SEARCH_SUCCESS',
        persons: mockPersons,
      })

      const { result } = renderHook(() => usePipedrive())
      const persons = await result.current.searchByName('John')

      expect(persons).toEqual(mockPersons)
      expect(result.current.searchError).toBeNull()
    })

    it('returns empty array when no matches without error', async () => {
      vi.mocked(chrome.runtime.sendMessage).mockResolvedValue({
        type: 'PIPEDRIVE_SEARCH_SUCCESS',
        persons: [],
      })

      const { result } = renderHook(() => usePipedrive())
      const persons = await result.current.searchByName('John')

      expect(persons).toEqual([])
      expect(result.current.searchError).toBeNull()
    })

    it('returns empty array and sets searchError on failure', async () => {
      vi.mocked(chrome.runtime.sendMessage).mockResolvedValue({
        type: 'PIPEDRIVE_ERROR',
        error: 'Network error',
        statusCode: 500,
      })

      const { result } = renderHook(() => usePipedrive())
      const persons = await result.current.searchByName('John')

      expect(persons).toEqual([])
      await waitFor(() => {
        expect(result.current.searchError).toMatchObject({
          message: 'Network error',
          statusCode: 500,
        })
      })
      expect(result.current.error).toBeNull()
    })

    it('sends correct message type', async () => {
      vi.mocked(chrome.runtime.sendMessage).mockResolvedValue({
        type: 'PIPEDRIVE_SEARCH_SUCCESS',
        persons: [],
      })

      const { result } = renderHook(() => usePipedrive())
      await result.current.searchByName('John')

      expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({
        type: 'PIPEDRIVE_SEARCH_BY_NAME',
        name: 'John',
      })
    })
  })

  describe('createPerson', () => {
    it('sends correct message with all data', async () => {
      const mockPerson = { id: 456, name: 'Jane', phones: [], email: null }
      vi.mocked(chrome.runtime.sendMessage).mockResolvedValue({
        type: 'PIPEDRIVE_CREATE_SUCCESS',
        person: mockPerson,
      })

      const { result } = renderHook(() => usePipedrive())
      await result.current.createPerson({
        name: 'Jane',
        phone: '+48123456789',
        email: 'jane@example.com',
      })

      expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({
        type: 'PIPEDRIVE_CREATE_PERSON',
        data: {
          name: 'Jane',
          phone: '+48123456789',
          email: 'jane@example.com',
        },
      })
    })

    it('returns created person on success', async () => {
      const mockPerson = { id: 456, name: 'Jane', phones: [], email: null }
      vi.mocked(chrome.runtime.sendMessage).mockResolvedValue({
        type: 'PIPEDRIVE_CREATE_SUCCESS',
        person: mockPerson,
      })

      const { result } = renderHook(() => usePipedrive())
      const person = await result.current.createPerson({
        name: 'Jane',
        phone: '+48123456789',
      })

      expect(person).toEqual(mockPerson)
      expect(result.current.error).toBeNull()
    })

    it('returns null on error and sets error state', async () => {
      vi.mocked(chrome.runtime.sendMessage).mockResolvedValue({
        type: 'PIPEDRIVE_ERROR',
        error: 'Validation failed',
        statusCode: 400,
      })

      const { result } = renderHook(() => usePipedrive())
      const person = await result.current.createPerson({
        name: 'Jane',
        phone: '+48123456789',
      })

      expect(person).toBeNull()
      await waitFor(() => {
        expect(result.current.error).toMatchObject({
          message: 'Validation failed',
          statusCode: 400,
        })
      })
    })

    it('works without optional email', async () => {
      const mockPerson = { id: 456, name: 'Jane', phones: [], email: null }
      vi.mocked(chrome.runtime.sendMessage).mockResolvedValue({
        type: 'PIPEDRIVE_CREATE_SUCCESS',
        person: mockPerson,
      })

      const { result } = renderHook(() => usePipedrive())
      const person = await result.current.createPerson({
        name: 'Jane',
        phone: '+48123456789',
      })

      expect(person).toEqual(mockPerson)
    })
  })

  describe('attachPhone', () => {
    it('sends correct message with personId and phone', async () => {
      const mockPerson = { id: 123, name: 'John', phones: [], email: null }
      vi.mocked(chrome.runtime.sendMessage).mockResolvedValue({
        type: 'PIPEDRIVE_ATTACH_SUCCESS',
        person: mockPerson,
      })

      const { result } = renderHook(() => usePipedrive())
      await result.current.attachPhone({
        personId: 123,
        phone: '+48123456789',
      })

      expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({
        type: 'PIPEDRIVE_ATTACH_PHONE',
        data: {
          personId: 123,
          phone: '+48123456789',
        },
      })
    })

    it('returns updated person on success and clears attachError', async () => {
      const mockPerson = {
        id: 123,
        name: 'John',
        phones: [{ value: '+48123456789', label: 'WhatsApp', isPrimary: false }],
        email: null,
      }
      vi.mocked(chrome.runtime.sendMessage).mockResolvedValue({
        type: 'PIPEDRIVE_ATTACH_SUCCESS',
        person: mockPerson,
      })

      const { result } = renderHook(() => usePipedrive())
      const person = await result.current.attachPhone({
        personId: 123,
        phone: '+48123456789',
      })

      expect(person).toEqual(mockPerson)
      expect(result.current.attachError).toBeNull()
    })

    it('returns null on error and sets attachError state', async () => {
      vi.mocked(chrome.runtime.sendMessage).mockResolvedValue({
        type: 'PIPEDRIVE_ERROR',
        error: 'Person not found',
        statusCode: 404,
      })

      const { result } = renderHook(() => usePipedrive())
      const person = await result.current.attachPhone({
        personId: 999,
        phone: '+48123456789',
      })

      expect(person).toBeNull()
      await waitFor(() => {
        expect(result.current.attachError).toMatchObject({
          message: 'Person not found',
          statusCode: 404,
        })
      })
      expect(result.current.error).toBeNull()
    })

    it('sets isAttaching during request', async () => {
      vi.mocked(chrome.runtime.sendMessage).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      )

      const { result } = renderHook(() => usePipedrive())
      const promise = result.current.attachPhone({
        personId: 123,
        phone: '+48123456789',
      })

      await waitFor(() => {
        expect(result.current.isAttaching).toBe(true)
      })

      await promise
      expect(result.current.isAttaching).toBe(false)
    })
  })

  describe('clearError helpers', () => {
    it('clearError resets general error state', async () => {
      vi.mocked(chrome.runtime.sendMessage).mockResolvedValue({
        type: 'PIPEDRIVE_ERROR',
        error: 'Test error',
        statusCode: 500,
      })

      const { result } = renderHook(() => usePipedrive())
      await result.current.lookupByPhone('+48123456789')

      await waitFor(() => {
        expect(result.current.error).not.toBeNull()
      })

      result.current.clearError()

      await waitFor(() => {
        expect(result.current.error).toBeNull()
      })
    })

    it('clearSearchError resets search error state', async () => {
      vi.mocked(chrome.runtime.sendMessage).mockResolvedValue({
        type: 'PIPEDRIVE_ERROR',
        error: 'Network error',
        statusCode: 500,
      })

      const { result } = renderHook(() => usePipedrive())
      await result.current.searchByName('John')

      await waitFor(() => {
        expect(result.current.searchError).not.toBeNull()
      })

      result.current.clearSearchError()
      await waitFor(() => {
        expect(result.current.searchError).toBeNull()
      })
    })

    it('clearAttachError resets attach error state', async () => {
      vi.mocked(chrome.runtime.sendMessage).mockResolvedValue({
        type: 'PIPEDRIVE_ERROR',
        error: 'Attach failed',
        statusCode: 500,
      })

      const { result } = renderHook(() => usePipedrive())
      await result.current.attachPhone({
        personId: 1,
        phone: '+111',
      })

      await waitFor(() => {
        expect(result.current.attachError).not.toBeNull()
      })

      result.current.clearAttachError()
      await waitFor(() => {
        expect(result.current.attachError).toBeNull()
      })
    })
  })

  describe('Error Handling', () => {
    it('handles unexpected response type', async () => {
      vi.mocked(chrome.runtime.sendMessage).mockResolvedValue({
        type: 'UNKNOWN_TYPE',
      })

      const { result } = renderHook(() => usePipedrive())
      const person = await result.current.lookupByPhone('+48123456789')

      expect(person).toBeNull()
      await waitFor(() => {
        expect(result.current.error).toMatchObject({
          message: expect.stringContaining('Unexpected response'),
          statusCode: 500,
        })
      })
    })

    it('handles sendMessage rejection', async () => {
      vi.mocked(chrome.runtime.sendMessage).mockRejectedValue(
        new Error('Service worker not responding')
      )

      const { result } = renderHook(() => usePipedrive())
      const person = await result.current.lookupByPhone('+48123456789')

      expect(person).toBeNull()
      await waitFor(() => {
        expect(result.current.error).toMatchObject({
          message: 'Service worker not responding',
          statusCode: 500,
        })
      })
    })

    it('clears previous error on new request', async () => {
      // First request fails
      vi.mocked(chrome.runtime.sendMessage).mockResolvedValueOnce({
        type: 'PIPEDRIVE_ERROR',
        error: 'First error',
        statusCode: 500,
      })

      const { result } = renderHook(() => usePipedrive())
      await result.current.lookupByPhone('+48123456789')

      await waitFor(() => {
        expect(result.current.error).toMatchObject({
          message: 'First error',
        })
      })

      // Second request succeeds
      vi.mocked(chrome.runtime.sendMessage).mockResolvedValueOnce({
        type: 'PIPEDRIVE_LOOKUP_SUCCESS',
        person: { id: 123, name: 'John', phones: [], email: null },
      })

      await result.current.lookupByPhone('+48999999999')

      await waitFor(() => {
        expect(result.current.error).toBeNull()
      })
    })
  })

  describe('Loading State Management', () => {
    it('clears loading state even when error occurs', async () => {
      vi.mocked(chrome.runtime.sendMessage).mockResolvedValue({
        type: 'PIPEDRIVE_ERROR',
        error: 'Error',
        statusCode: 500,
      })

      const { result } = renderHook(() => usePipedrive())
      await result.current.lookupByPhone('+48123456789')

      expect(result.current.isLoading).toBe(false)
    })

    it('manages loading state independently for different operations', async () => {
      vi.mocked(chrome.runtime.sendMessage).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ type: 'PIPEDRIVE_LOOKUP_SUCCESS', person: null }), 100)
          )
      )

      const { result } = renderHook(() => usePipedrive())

      const promise1 = result.current.lookupByPhone('+48123456789')

      await waitFor(() => {
        expect(result.current.isLoading).toBe(true)
      })

      await promise1

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
    })
  })
})
