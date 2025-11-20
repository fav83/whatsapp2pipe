/**
 * Deals Integration Tests
 *
 * Integration tests for deals lookup, state management, and UI integration
 */

import { describe, it, expect, vi } from 'vitest'
import { waitFor } from '@testing-library/react'
import { renderHook } from '@testing-library/react'
import { usePipedrive } from '../../src/content-script/hooks/usePipedrive'
import type { Person } from '../../src/types/person'
import type { Deal, DealPipeline, DealStage } from '../../src/types/deal'

// Get references to the globally mocked chrome API
const mockSendMessage = vi.mocked(chrome.runtime.sendMessage)

describe('Deals Integration', () => {
  // Mock data
  const mockPerson: Person = {
    id: 123,
    name: 'John Doe',
    phones: [{ value: '+1234567890', label: 'mobile', isPrimary: true }],
    email: 'john@example.com',
  }

  const mockDeals: Deal[] = [
    {
      id: 1,
      title: 'Website Redesign',
      value: '$50,000.00',
      status: 'open',
      pipeline: { id: 1, name: 'Sales Pipeline' },
      stage: { id: 1, name: 'Proposal', order: 1 },
    },
    {
      id: 2,
      title: 'Mobile App Development',
      value: '$75,000.00',
      status: 'won',
      pipeline: { id: 1, name: 'Sales Pipeline' },
      stage: { id: 5, name: 'Closed Won', order: 5 },
    },
  ]

  describe('usePipedrive Hook with Deals', () => {
    it('lookupByPhone returns person and deals when both found', async () => {
      mockSendMessage.mockResolvedValueOnce({
        type: 'PIPEDRIVE_LOOKUP_SUCCESS',
        person: mockPerson,
        deals: mockDeals,
        dealsError: undefined,
      })

      const { result } = renderHook(() => usePipedrive())

      const response = await result.current.lookupByPhone('+1234567890')

      expect(response.person).toEqual(mockPerson)
      expect(response.deals).toEqual(mockDeals)
      expect(response.dealsError).toBeUndefined()
      expect(result.current.error).toBeNull()
      expect(result.current.isLoading).toBe(false)
    })

    it('lookupByPhone returns person with empty deals array when no deals', async () => {
      mockSendMessage.mockResolvedValueOnce({
        type: 'PIPEDRIVE_LOOKUP_SUCCESS',
        person: mockPerson,
        deals: [],
        dealsError: undefined,
      })

      const { result } = renderHook(() => usePipedrive())

      const response = await result.current.lookupByPhone('+1234567890')

      expect(response.person).toEqual(mockPerson)
      expect(response.deals).toEqual([])
      expect(response.dealsError).toBeUndefined()
    })

    it('lookupByPhone handles person found but deals error (graceful degradation)', async () => {
      mockSendMessage.mockResolvedValueOnce({
        type: 'PIPEDRIVE_LOOKUP_SUCCESS',
        person: mockPerson,
        deals: null,
        dealsError: 'Failed to fetch deals from Pipedrive',
      })

      const { result } = renderHook(() => usePipedrive())

      const response = await result.current.lookupByPhone('+1234567890')

      expect(response.person).toEqual(mockPerson)
      expect(response.deals).toBeNull()
      expect(response.dealsError).toBe('Failed to fetch deals from Pipedrive')
      // Overall lookup should not error - person was found
      expect(result.current.error).toBeNull()
    })

    it('lookupByPhone returns null person and null deals when not found', async () => {
      mockSendMessage.mockResolvedValueOnce({
        type: 'PIPEDRIVE_LOOKUP_SUCCESS',
        person: null,
        deals: [],
        dealsError: undefined,
      })

      const { result } = renderHook(() => usePipedrive())

      const response = await result.current.lookupByPhone('+9999999999')

      expect(response.person).toBeNull()
      expect(response.deals).toEqual([])
      expect(result.current.error).toBeNull()
    })

    it('lookupByPhone handles complete API failure', async () => {
      mockSendMessage.mockResolvedValueOnce({
        type: 'PIPEDRIVE_ERROR',
        error: 'Backend service unavailable',
        statusCode: 503,
      })

      const { result } = renderHook(() => usePipedrive())

      const response = await result.current.lookupByPhone('+1111111111')

      expect(response.person).toBeNull()
      expect(response.deals).toBeNull()

      // Wait for error state to be set
      await waitFor(() => {
        expect(result.current.error).not.toBeNull()
      })

      expect(result.current.error?.message).toBe('Backend service unavailable')
      expect(result.current.error?.statusCode).toBe(503)
    })

    it('sets loading state during lookup with deals', async () => {
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

      // Resolve the lookup
      resolvePromise!({
        type: 'PIPEDRIVE_LOOKUP_SUCCESS',
        person: mockPerson,
        deals: mockDeals,
      })

      // Wait for completion
      await lookupPromise

      // Should no longer be loading
      expect(result.current.isLoading).toBe(false)
    })

    it('handles deals with missing pipeline gracefully', async () => {
      const dealsWithMissingData: Deal[] = [
        {
          ...mockDeals[0],
          pipeline: null as unknown as DealPipeline,
        },
      ]

      mockSendMessage.mockResolvedValueOnce({
        type: 'PIPEDRIVE_LOOKUP_SUCCESS',
        person: mockPerson,
        deals: dealsWithMissingData,
      })

      const { result } = renderHook(() => usePipedrive())

      const response = await result.current.lookupByPhone('+1234567890')

      expect(response.deals).toEqual(dealsWithMissingData)
      expect(result.current.error).toBeNull()
    })

    it('handles deals with missing stage gracefully', async () => {
      const dealsWithMissingData: Deal[] = [
        {
          ...mockDeals[0],
          stage: null as unknown as DealStage,
        },
      ]

      mockSendMessage.mockResolvedValueOnce({
        type: 'PIPEDRIVE_LOOKUP_SUCCESS',
        person: mockPerson,
        deals: dealsWithMissingData,
      })

      const { result } = renderHook(() => usePipedrive())

      const response = await result.current.lookupByPhone('+1234567890')

      expect(response.deals).toEqual(dealsWithMissingData)
      expect(result.current.error).toBeNull()
    })

    it('handles large number of deals', async () => {
      const manyDeals: Deal[] = Array.from({ length: 50 }, (_, i) => ({
        id: i + 1,
        title: `Deal ${i + 1}`,
        value: `$${(i + 1) * 1000}.00`,
        status: i % 3 === 0 ? 'won' : i % 3 === 1 ? 'lost' : 'open',
        pipeline: { id: 1, name: 'Sales Pipeline' },
        stage: { id: 1, name: 'Proposal', order: 1 },
      })) as Deal[]

      mockSendMessage.mockResolvedValueOnce({
        type: 'PIPEDRIVE_LOOKUP_SUCCESS',
        person: mockPerson,
        deals: manyDeals,
      })

      const { result } = renderHook(() => usePipedrive())

      const response = await result.current.lookupByPhone('+1234567890')

      expect(response.deals).toHaveLength(50)
      expect(result.current.error).toBeNull()
    })

    it('handles deals with special characters in titles', async () => {
      const dealsWithSpecialChars: Deal[] = [
        {
          ...mockDeals[0],
          title: '<script>alert("XSS")</script>',
        },
        {
          ...mockDeals[1],
          title: 'Deal with "quotes" & ampersands',
        },
      ]

      mockSendMessage.mockResolvedValueOnce({
        type: 'PIPEDRIVE_LOOKUP_SUCCESS',
        person: mockPerson,
        deals: dealsWithSpecialChars,
      })

      const { result } = renderHook(() => usePipedrive())

      const response = await result.current.lookupByPhone('+1234567890')

      expect(response.deals).toEqual(dealsWithSpecialChars)
      expect(result.current.error).toBeNull()
    })
  })

  describe('Deals Sorting Order', () => {
    it('receives deals in backend-sorted order and maintains it', async () => {
      const sortedDeals: Deal[] = [
        {
          id: 1,
          title: 'Open Deal 1',
          value: '$10,000.00',
          status: 'open',
          pipeline: { id: 1, name: 'Sales' },
          stage: { id: 1, name: 'Proposal', order: 1 },
        },
        {
          id: 2,
          title: 'Open Deal 2',
          value: '$20,000.00',
          status: 'open',
          pipeline: { id: 1, name: 'Sales' },
          stage: { id: 2, name: 'Negotiation', order: 2 },
        },
        {
          id: 3,
          title: 'Won Deal',
          value: '$30,000.00',
          status: 'won',
          pipeline: { id: 1, name: 'Sales' },
          stage: { id: 5, name: 'Closed Won', order: 5 },
        },
        {
          id: 4,
          title: 'Lost Deal',
          value: '$40,000.00',
          status: 'lost',
          pipeline: { id: 1, name: 'Sales' },
          stage: { id: 6, name: 'Closed Lost', order: 6 },
        },
      ]

      mockSendMessage.mockResolvedValueOnce({
        type: 'PIPEDRIVE_LOOKUP_SUCCESS',
        person: mockPerson,
        deals: sortedDeals,
      })

      const { result } = renderHook(() => usePipedrive())

      const response = await result.current.lookupByPhone('+1234567890')

      // Verify order is maintained (backend handles sorting)
      expect(response.deals?.[0].title).toBe('Open Deal 1')
      expect(response.deals?.[1].title).toBe('Open Deal 2')
      expect(response.deals?.[2].title).toBe('Won Deal')
      expect(response.deals?.[3].title).toBe('Lost Deal')
    })
  })

  describe('Error Recovery', () => {
    it('allows retry after deals error', async () => {
      // First call fails
      mockSendMessage.mockResolvedValueOnce({
        type: 'PIPEDRIVE_ERROR',
        error: 'Network timeout',
        statusCode: 504,
      })

      const { result } = renderHook(() => usePipedrive())

      const firstResponse = await result.current.lookupByPhone('+1234567890')
      expect(firstResponse.person).toBeNull()
      expect(firstResponse.deals).toBeNull()

      // Second call succeeds
      mockSendMessage.mockResolvedValueOnce({
        type: 'PIPEDRIVE_LOOKUP_SUCCESS',
        person: mockPerson,
        deals: mockDeals,
      })

      const secondResponse = await result.current.lookupByPhone('+1234567890')
      expect(secondResponse.person).toEqual(mockPerson)
      expect(secondResponse.deals).toEqual(mockDeals)
    })

    it('clears previous error on successful lookup', async () => {
      // First call fails
      mockSendMessage.mockResolvedValueOnce({
        type: 'PIPEDRIVE_ERROR',
        error: 'Server error',
        statusCode: 500,
      })

      const { result } = renderHook(() => usePipedrive())

      await result.current.lookupByPhone('+1234567890')

      // Wait for error to be set
      await waitFor(() => {
        expect(result.current.error).not.toBeNull()
      })

      // Second call succeeds
      mockSendMessage.mockResolvedValueOnce({
        type: 'PIPEDRIVE_LOOKUP_SUCCESS',
        person: mockPerson,
        deals: mockDeals,
      })

      await result.current.lookupByPhone('+1234567890')

      // Error should be cleared
      expect(result.current.error).toBeNull()
    })
  })

  describe('Update Deal Integration', () => {
    it('complete update deal flow - from hook call to API to state update', async () => {
      const { result } = renderHook(() => usePipedrive())

      const originalDeal = mockDeals[0]
      const updatedDeal: Deal = {
        ...originalDeal,
        stage: { id: 2, name: 'Negotiation', order: 2 },
      }

      // Mock successful API response
      mockSendMessage.mockResolvedValueOnce({
        type: 'PIPEDRIVE_UPDATE_DEAL_SUCCESS',
        deal: updatedDeal,
      })

      // Call updateDeal
      const returnedDeal = await result.current.updateDeal(originalDeal.id, {
        pipelineId: 1,
        stageId: 2,
      })

      // Verify API was called with correct parameters
      expect(mockSendMessage).toHaveBeenCalledWith({
        type: 'PIPEDRIVE_UPDATE_DEAL',
        dealId: originalDeal.id,
        data: {
          pipelineId: 1,
          stageId: 2,
        },
      })

      // Verify returned deal matches updated deal
      expect(returnedDeal).toEqual(updatedDeal)

      // Verify loading state was managed correctly
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeNull()
    })

    it('error recovery flow - handles API failure and allows retry', async () => {
      const { result } = renderHook(() => usePipedrive())

      const dealId = mockDeals[0].id

      // First call fails
      mockSendMessage.mockResolvedValueOnce({
        type: 'PIPEDRIVE_ERROR',
        error: 'Network timeout',
        statusCode: 504,
      })

      const firstResult = await result.current.updateDeal(dealId, {
        pipelineId: 1,
        stageId: 2,
      })

      // Should return null on error
      expect(firstResult).toBeNull()

      // Wait for error to be set
      await waitFor(() => {
        expect(result.current.error).not.toBeNull()
      })

      expect(result.current.error?.message).toBe('Network timeout')
      expect(result.current.error?.statusCode).toBe(504)

      // Second call succeeds (retry)
      const updatedDeal: Deal = {
        ...mockDeals[0],
        stage: { id: 2, name: 'Negotiation', order: 2 },
      }

      mockSendMessage.mockResolvedValueOnce({
        type: 'PIPEDRIVE_UPDATE_DEAL_SUCCESS',
        deal: updatedDeal,
      })

      const secondResult = await result.current.updateDeal(dealId, {
        pipelineId: 1,
        stageId: 2,
      })

      // Should succeed on retry
      expect(secondResult).toEqual(updatedDeal)

      // Wait for error to be cleared
      await waitFor(() => {
        expect(result.current.error).toBeNull()
      })

      expect(result.current.isLoading).toBe(false)
    })
  })
})
