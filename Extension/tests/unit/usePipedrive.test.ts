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

    it('returns person and deals on success', async () => {
      const mockPerson = { id: 123, name: 'John', phones: [], email: null }
      const mockDeals = [
        {
          id: 1,
          title: 'Test Deal',
          value: '$1,000.00',
          status: 'open' as const,
          pipeline: { id: 1, name: 'Sales' },
          stage: { id: 1, name: 'Proposal', order: 1 },
        },
      ]
      vi.mocked(chrome.runtime.sendMessage).mockResolvedValue({
        type: 'PIPEDRIVE_LOOKUP_SUCCESS',
        person: mockPerson,
        deals: mockDeals,
      })

      const { result } = renderHook(() => usePipedrive())
      const response = await result.current.lookupByPhone('+48123456789')

      expect(response.person).toEqual(mockPerson)
      expect(response.deals).toEqual(mockDeals)
      expect(result.current.error).toBeNull()
      expect(result.current.isLoading).toBe(false)
    })

    it('returns null person with empty deals when not found', async () => {
      vi.mocked(chrome.runtime.sendMessage).mockResolvedValue({
        type: 'PIPEDRIVE_LOOKUP_SUCCESS',
        person: null,
        deals: [],
      })

      const { result } = renderHook(() => usePipedrive())
      const response = await result.current.lookupByPhone('+48123456789')

      expect(response.person).toBeNull()
      expect(response.deals).toEqual([])
      expect(result.current.error).toBeNull()
    })

    it('returns person with null deals and dealsError on partial failure', async () => {
      const mockPerson = { id: 123, name: 'John', phones: [], email: null }
      vi.mocked(chrome.runtime.sendMessage).mockResolvedValue({
        type: 'PIPEDRIVE_LOOKUP_SUCCESS',
        person: mockPerson,
        deals: null,
        dealsError: 'Failed to fetch deals',
      })

      const { result } = renderHook(() => usePipedrive())
      const response = await result.current.lookupByPhone('+48123456789')

      expect(response.person).toEqual(mockPerson)
      expect(response.deals).toBeNull()
      expect(response.dealsError).toBe('Failed to fetch deals')
      expect(result.current.error).toBeNull() // Overall request succeeded
    })

    it('returns null person and null deals on complete error', async () => {
      vi.mocked(chrome.runtime.sendMessage).mockResolvedValue({
        type: 'PIPEDRIVE_ERROR',
        error: 'Not found',
        statusCode: 404,
      })

      const { result } = renderHook(() => usePipedrive())
      const response = await result.current.lookupByPhone('+48123456789')

      expect(response.person).toBeNull()
      expect(response.deals).toBeNull()
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
        deals: [],
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
        deals: [],
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
      const response = await result.current.lookupByPhone('+48123456789')

      expect(response.person).toBeNull()
      expect(response.deals).toBeNull()
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
      const response = await result.current.lookupByPhone('+48123456789')

      expect(response.person).toBeNull()
      expect(response.deals).toBeNull()
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
        deals: [],
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

  describe('markDealWonLost', () => {
    it('successfully marks deal as won', async () => {
      const mockDeal = {
        id: 123,
        title: 'Test Deal',
        value: '$50,000.00',
        stage: { id: 5, name: 'Won', order: 99 },
        pipeline: { id: 1, name: 'Sales Pipeline' },
        status: 'won' as const,
        updateTime: '2025-01-20 15:30:00',
      }
      vi.mocked(chrome.runtime.sendMessage).mockResolvedValue({
        type: 'PIPEDRIVE_MARK_DEAL_WON_LOST_SUCCESS',
        deal: mockDeal,
      })

      const { result } = renderHook(() => usePipedrive())
      const deal = await result.current.markDealWonLost(123, 'won')

      expect(deal).toEqual(mockDeal)
      expect(result.current.error).toBeNull()
      expect(result.current.isLoading).toBe(false)
    })

    it('successfully marks deal as lost with reason', async () => {
      const mockDeal = {
        id: 456,
        title: 'Lost Deal',
        value: '$30,000.00',
        stage: { id: 6, name: 'Lost', order: 100 },
        pipeline: { id: 1, name: 'Sales Pipeline' },
        status: 'lost' as const,
        lostReason: 'Customer chose competitor',
        updateTime: '2025-01-20 16:00:00',
      }
      vi.mocked(chrome.runtime.sendMessage).mockResolvedValue({
        type: 'PIPEDRIVE_MARK_DEAL_WON_LOST_SUCCESS',
        deal: mockDeal,
      })

      const { result } = renderHook(() => usePipedrive())
      const deal = await result.current.markDealWonLost(456, 'lost', 'Customer chose competitor')

      expect(deal).toEqual(mockDeal)
      expect(result.current.error).toBeNull()
      expect(result.current.isLoading).toBe(false)
    })

    it('sets loading state during request', async () => {
      vi.mocked(chrome.runtime.sendMessage).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      )

      const { result } = renderHook(() => usePipedrive())

      expect(result.current.isLoading).toBe(false)

      const promise = result.current.markDealWonLost(123, 'won')

      await waitFor(() => {
        expect(result.current.isLoading).toBe(true)
      })

      await promise
    })

    it('returns null and sets error on deal not found', async () => {
      vi.mocked(chrome.runtime.sendMessage).mockResolvedValue({
        type: 'PIPEDRIVE_ERROR',
        error: 'Deal not found',
        statusCode: 404,
      })

      const { result } = renderHook(() => usePipedrive())
      const deal = await result.current.markDealWonLost(999, 'won')

      expect(deal).toBeNull()
      await waitFor(() => {
        expect(result.current.error).toMatchObject({
          message: 'Deal not found',
          statusCode: 404,
        })
      })
      expect(result.current.isLoading).toBe(false)
    })

    it('returns null and sets error on authentication failure', async () => {
      vi.mocked(chrome.runtime.sendMessage).mockResolvedValue({
        type: 'PIPEDRIVE_ERROR',
        error: 'Invalid or expired session',
        statusCode: 401,
      })

      const { result } = renderHook(() => usePipedrive())
      const deal = await result.current.markDealWonLost(123, 'won')

      expect(deal).toBeNull()
      await waitFor(() => {
        expect(result.current.error).toMatchObject({
          message: 'Invalid or expired session',
          statusCode: 401,
        })
      })
    })

    it('returns null and sets error on validation failure', async () => {
      vi.mocked(chrome.runtime.sendMessage).mockResolvedValue({
        type: 'PIPEDRIVE_ERROR',
        error: 'Lost reason is required when marking deal as lost',
        statusCode: 400,
      })

      const { result } = renderHook(() => usePipedrive())
      const deal = await result.current.markDealWonLost(123, 'lost')

      expect(deal).toBeNull()
      await waitFor(() => {
        expect(result.current.error).toMatchObject({
          message: 'Lost reason is required when marking deal as lost',
          statusCode: 400,
        })
      })
    })

    it('sends correct message with won status', async () => {
      vi.mocked(chrome.runtime.sendMessage).mockResolvedValue({
        type: 'PIPEDRIVE_MARK_DEAL_WON_LOST_SUCCESS',
        deal: {
          id: 123,
          title: 'Deal',
          value: '$1,000.00',
          stage: { id: 1, name: 'Won', order: 99 },
          pipeline: { id: 1, name: 'Sales' },
          status: 'won' as const,
        },
      })

      const { result } = renderHook(() => usePipedrive())
      await result.current.markDealWonLost(123, 'won')

      expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({
        type: 'PIPEDRIVE_MARK_DEAL_WON_LOST',
        dealId: 123,
        status: 'won',
        lostReason: undefined,
      })
    })

    it('sends correct message with lost status and reason', async () => {
      vi.mocked(chrome.runtime.sendMessage).mockResolvedValue({
        type: 'PIPEDRIVE_MARK_DEAL_WON_LOST_SUCCESS',
        deal: {
          id: 456,
          title: 'Deal',
          value: '$2,000.00',
          stage: { id: 1, name: 'Lost', order: 100 },
          pipeline: { id: 1, name: 'Sales' },
          status: 'lost' as const,
          lostReason: 'Budget constraints',
        },
      })

      const { result } = renderHook(() => usePipedrive())
      await result.current.markDealWonLost(456, 'lost', 'Budget constraints')

      expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({
        type: 'PIPEDRIVE_MARK_DEAL_WON_LOST',
        dealId: 456,
        status: 'lost',
        lostReason: 'Budget constraints',
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
      await result.current.markDealWonLost(123, 'won')

      await waitFor(() => {
        expect(result.current.error).toMatchObject({
          message: 'First error',
        })
      })

      // Second request succeeds
      vi.mocked(chrome.runtime.sendMessage).mockResolvedValueOnce({
        type: 'PIPEDRIVE_MARK_DEAL_WON_LOST_SUCCESS',
        deal: {
          id: 123,
          title: 'Deal',
          value: '$1,000.00',
          stage: { id: 1, name: 'Won', order: 99 },
          pipeline: { id: 1, name: 'Sales' },
          status: 'won' as const,
        },
      })

      await result.current.markDealWonLost(123, 'won')

      await waitFor(() => {
        expect(result.current.error).toBeNull()
      })
    })

    it('handles unexpected response type', async () => {
      vi.mocked(chrome.runtime.sendMessage).mockResolvedValue({
        type: 'UNKNOWN_TYPE',
      } as unknown as chrome.runtime.MessageResponse)

      const { result } = renderHook(() => usePipedrive())
      const deal = await result.current.markDealWonLost(123, 'won')

      expect(deal).toBeNull()
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
      const deal = await result.current.markDealWonLost(123, 'won')

      expect(deal).toBeNull()
      await waitFor(() => {
        expect(result.current.error).toMatchObject({
          message: 'Service worker not responding',
          statusCode: 500,
        })
      })
    })

    it('clears loading state even when error occurs', async () => {
      vi.mocked(chrome.runtime.sendMessage).mockResolvedValue({
        type: 'PIPEDRIVE_ERROR',
        error: 'Error',
        statusCode: 500,
      })

      const { result } = renderHook(() => usePipedrive())
      await result.current.markDealWonLost(123, 'won')

      expect(result.current.isLoading).toBe(false)
    })
  })
})
