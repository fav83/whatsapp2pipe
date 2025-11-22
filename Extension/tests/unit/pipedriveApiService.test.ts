/**
 * Tests for Service Worker Pipedrive API Service
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { pipedriveApiService } from '../../src/service-worker/pipedriveApiService'

describe('PipedriveApiService', () => {
  beforeEach(() => {
    // Mock chrome.storage.local and chrome.runtime.getManifest
    global.chrome = {
      storage: {
        local: {
          get: vi.fn().mockResolvedValue({ verification_code: 'test_code' }),
        },
      },
      runtime: {
        getManifest: vi.fn(() => ({
          version: '1.0.0',
          manifest_version: 3,
          name: 'Test Extension',
        })),
      },
    } as typeof chrome

    // Mock fetch
    global.fetch = vi.fn()
  })

  describe('lookupByPhone', () => {
    it('sends correct request with authorization header', async () => {
      const mockPerson = { id: 123, name: 'John', phones: [], email: null }
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => [mockPerson],
      } as Response)

      const result = await pipedriveApiService.lookupByPhone('+48123456789')

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/pipedrive/persons/search'),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test_code',
          }),
        })
      )
      expect(result).toEqual(mockPerson)
    })

    it('includes phone in query string with proper encoding', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => [],
      } as Response)

      await pipedriveApiService.lookupByPhone('+48 123 456 789')

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('term=%2B48%20123%20456%20789'),
        expect.any(Object)
      )
    })

    it('includes fields=phone in query string', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => [],
      } as Response)

      await pipedriveApiService.lookupByPhone('+48123456789')

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('fields=phone'),
        expect.any(Object)
      )
    })

    it('returns first person when multiple matches', async () => {
      const person1 = { id: 123, name: 'John', phones: [], email: null }
      const person2 = { id: 456, name: 'Jane', phones: [], email: null }
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => [person1, person2],
      } as Response)

      const result = await pipedriveApiService.lookupByPhone('+48123456789')

      expect(result).toEqual(person1)
    })

    it('returns null when no matches', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => [],
      } as Response)

      const result = await pipedriveApiService.lookupByPhone('+48123456789')

      expect(result).toBeNull()
    })
  })

  describe('searchByName', () => {
    it('sends correct request with authorization header', async () => {
      const mockPersons = [
        { id: 123, name: 'John', phones: [], email: null },
        { id: 456, name: 'John Doe', phones: [], email: null },
      ]
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockPersons,
      } as Response)

      const result = await pipedriveApiService.searchByName('John')

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/pipedrive/persons/search'),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test_code',
          }),
        })
      )
      expect(result).toEqual(mockPersons)
    })

    it('includes name in query string with proper encoding', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => [],
      } as Response)

      await pipedriveApiService.searchByName('John Doe')

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('term=John%20Doe'),
        expect.any(Object)
      )
    })

    it('includes fields=name in query string', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => [],
      } as Response)

      await pipedriveApiService.searchByName('John')

      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('fields=name'), expect.any(Object))
    })

    it('returns empty array when no matches', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => [],
      } as Response)

      const result = await pipedriveApiService.searchByName('John')

      expect(result).toEqual([])
    })

    it('returns all matching persons', async () => {
      const mockPersons = [
        { id: 123, name: 'John', phones: [], email: null },
        { id: 456, name: 'John Doe', phones: [], email: null },
      ]
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockPersons,
      } as Response)

      const result = await pipedriveApiService.searchByName('John')

      expect(result).toHaveLength(2)
      expect(result).toEqual(mockPersons)
    })
  })

  describe('createPerson', () => {
    it('sends POST request with correct payload', async () => {
      const mockPerson = { id: 456, name: 'Jane', phones: [], email: null }
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockPerson,
      } as Response)

      await pipedriveApiService.createPerson({
        name: 'Jane',
        phone: '+48123456789',
        email: 'jane@example.com',
      })

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/pipedrive/persons'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer test_code',
            'Content-Type': 'application/json',
          }),
          body: expect.stringContaining('Jane'),
        })
      )
    })

    it('includes email in payload when provided', async () => {
      const mockPerson = { id: 456, name: 'Jane', phones: [], email: 'jane@example.com' }
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockPerson,
      } as Response)

      await pipedriveApiService.createPerson({
        name: 'Jane',
        phone: '+48123456789',
        email: 'jane@example.com',
      })

      const callArgs = vi.mocked(fetch).mock.calls[0]
      const body = JSON.parse(callArgs[1]?.body as string)
      expect(body.email).toBe('jane@example.com')
    })

    it('works without email', async () => {
      const mockPerson = { id: 456, name: 'Jane', phones: [], email: null }
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockPerson,
      } as Response)

      const result = await pipedriveApiService.createPerson({
        name: 'Jane',
        phone: '+48123456789',
      })

      expect(result).toEqual(mockPerson)
    })

    it('returns created person', async () => {
      const mockPerson = { id: 456, name: 'Jane', phones: [], email: null }
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockPerson,
      } as Response)

      const result = await pipedriveApiService.createPerson({
        name: 'Jane',
        phone: '+48123456789',
      })

      expect(result).toEqual(mockPerson)
    })
  })

  describe('attachPhone', () => {
    it('sends POST request to correct endpoint', async () => {
      const mockPerson = { id: 123, name: 'John', phones: [], email: null }
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockPerson,
      } as Response)

      await pipedriveApiService.attachPhone({
        personId: 123,
        phone: '+48123456789',
      })

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/pipedrive/persons/123/attach-phone'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer test_code',
            'Content-Type': 'application/json',
          }),
        })
      )
    })

    it('includes phone in request body', async () => {
      const mockPerson = { id: 123, name: 'John', phones: [], email: null }
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockPerson,
      } as Response)

      await pipedriveApiService.attachPhone({
        personId: 123,
        phone: '+48123456789',
      })

      const callArgs = vi.mocked(fetch).mock.calls[0]
      const body = JSON.parse(callArgs[1]?.body as string)
      expect(body.phone).toBe('+48123456789')
    })

    it('returns updated person', async () => {
      const mockPerson = {
        id: 123,
        name: 'John',
        phones: [{ value: '+48123456789', label: 'WhatsApp', isPrimary: false }],
        email: null,
      }
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockPerson,
      } as Response)

      const result = await pipedriveApiService.attachPhone({
        personId: 123,
        phone: '+48123456789',
      })

      expect(result).toEqual(mockPerson)
    })
  })

  describe('getConfig', () => {
    it('sends GET request to /api/config', async () => {
      const mockConfig = { message: 'Test message' }
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockConfig,
      } as Response)

      await pipedriveApiService.getConfig()

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/config'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            Authorization: 'Bearer test_code',
          }),
        })
      )
    })

    it('returns config with message when available', async () => {
      const mockConfig = { message: 'Check out our **new features**!' }
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockConfig,
      } as Response)

      const result = await pipedriveApiService.getConfig()

      expect(result).toEqual(mockConfig)
      expect(result.message).toBe('Check out our **new features**!')
    })

    it('returns config with null message when not set', async () => {
      const mockConfig = { message: null }
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockConfig,
      } as Response)

      const result = await pipedriveApiService.getConfig()

      expect(result).toEqual({ message: null })
      expect(result.message).toBeNull()
    })

    it('includes authorization header', async () => {
      const mockConfig = { message: 'Test' }
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockConfig,
      } as Response)

      await pipedriveApiService.getConfig()

      const callArgs = vi.mocked(fetch).mock.calls[0]
      const headers = callArgs[1]?.headers as Record<string, string>
      expect(headers.Authorization).toBe('Bearer test_code')
    })

    it('handles 401 error', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 401,
      } as Response)

      await expect(pipedriveApiService.getConfig()).rejects.toMatchObject({
        statusCode: 401,
        message: expect.stringContaining('Authentication expired'),
      })
    })

    it('handles 500 server error', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 500,
      } as Response)

      await expect(pipedriveApiService.getConfig()).rejects.toMatchObject({
        statusCode: 500,
        message: expect.stringContaining('Server error'),
      })
    })

    it('handles network error', async () => {
      vi.mocked(fetch).mockRejectedValue(new Error('Network error'))

      await expect(pipedriveApiService.getConfig()).rejects.toMatchObject({
        statusCode: 0,
        message: expect.stringContaining('Unable to connect'),
      })
    })

    it('requires authentication', async () => {
      global.chrome = {
        storage: {
          local: {
            get: vi.fn().mockResolvedValue({}),
          },
        },
        runtime: {
          getManifest: vi.fn(() => ({ version: '1.0.0' })),
        },
      } as typeof chrome

      await expect(pipedriveApiService.getConfig()).rejects.toMatchObject({
        statusCode: 401,
        message: 'Not authenticated',
      })
    })
  })

  describe('submitFeedback', () => {
    it('sends POST request to /api/feedback', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      } as Response)

      await pipedriveApiService.submitFeedback('This is my feedback')

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/feedback'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer test_code',
            'Content-Type': 'application/json',
          }),
        })
      )
    })

    it('includes message in request body', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      } as Response)

      await pipedriveApiService.submitFeedback('My feedback message')

      const callArgs = vi.mocked(fetch).mock.calls[0]
      const body = JSON.parse(callArgs[1]?.body as string)
      expect(body.message).toBe('My feedback message')
    })

    it('includes extension version in request body', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      } as Response)

      await pipedriveApiService.submitFeedback('My feedback message')

      const callArgs = vi.mocked(fetch).mock.calls[0]
      const body = JSON.parse(callArgs[1]?.body as string)
      expect(body.extensionVersion).toBe('1.0.0')
    })

    it('returns void on success', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      } as Response)

      const result = await pipedriveApiService.submitFeedback('My feedback')
      expect(result).toBeUndefined()
    })

    it('handles 401 error', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 401,
      } as Response)

      await expect(pipedriveApiService.submitFeedback('My feedback')).rejects.toMatchObject({
        statusCode: 401,
        message: expect.stringContaining('Authentication expired'),
      })
    })

    it('handles 500 server error', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 500,
      } as Response)

      await expect(pipedriveApiService.submitFeedback('My feedback')).rejects.toMatchObject({
        statusCode: 500,
        message: expect.stringContaining('Server error'),
      })
    })

    it('handles network error', async () => {
      vi.mocked(fetch).mockRejectedValue(new Error('Network error'))

      await expect(pipedriveApiService.submitFeedback('My feedback')).rejects.toMatchObject({
        statusCode: 0,
        message: expect.stringContaining('Unable to connect'),
      })
    })

    it('requires authentication', async () => {
      global.chrome = {
        storage: {
          local: {
            get: vi.fn().mockResolvedValue({}),
          },
        },
        runtime: {
          getManifest: vi.fn(() => ({ version: '1.0.0' })),
        },
      } as typeof chrome

      await expect(pipedriveApiService.submitFeedback('My feedback')).rejects.toMatchObject({
        statusCode: 401,
        message: 'Not authenticated',
      })
    })
  })

  describe('markDealWonLost', () => {
    const mockDeal = {
      id: 123,
      title: 'Test Deal',
      value: '$50,000.00',
      status: 'won',
      stage: { id: 1, name: 'Closed', order: 5 },
      pipeline: { id: 1, name: 'Sales' },
      updateTime: '2025-01-22 10:00:00',
    }

    it('sends PUT request to correct endpoint for won status', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: mockDeal }),
      } as Response)

      await pipedriveApiService.markDealWonLost(123, 'won')

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/pipedrive/deals/123/status'),
        expect.objectContaining({
          method: 'PUT',
          headers: expect.objectContaining({
            Authorization: 'Bearer test_code',
            'Content-Type': 'application/json',
          }),
        })
      )
    })

    it('sends PUT request to correct endpoint for lost status', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: { ...mockDeal, status: 'lost' } }),
      } as Response)

      await pipedriveApiService.markDealWonLost(123, 'lost', 'Budget constraints')

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/pipedrive/deals/123/status'),
        expect.objectContaining({
          method: 'PUT',
        })
      )
    })

    it('sends PUT request to correct endpoint for open status (reopen)', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: { ...mockDeal, status: 'open' } }),
      } as Response)

      await pipedriveApiService.markDealWonLost(123, 'open')

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/pipedrive/deals/123/status'),
        expect.objectContaining({
          method: 'PUT',
          headers: expect.objectContaining({
            Authorization: 'Bearer test_code',
            'Content-Type': 'application/json',
          }),
        })
      )
    })

    it('includes status in request body for won', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: mockDeal }),
      } as Response)

      await pipedriveApiService.markDealWonLost(123, 'won')

      const callArgs = vi.mocked(fetch).mock.calls[0]
      const body = JSON.parse(callArgs[1]?.body as string)
      expect(body.status).toBe('won')
    })

    it('includes status and lostReason in request body for lost', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: { ...mockDeal, status: 'lost' } }),
      } as Response)

      await pipedriveApiService.markDealWonLost(123, 'lost', 'Budget constraints')

      const callArgs = vi.mocked(fetch).mock.calls[0]
      const body = JSON.parse(callArgs[1]?.body as string)
      expect(body.status).toBe('lost')
      expect(body.lostReason).toBe('Budget constraints')
    })

    it('includes status in request body for open (reopen)', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: { ...mockDeal, status: 'open' } }),
      } as Response)

      await pipedriveApiService.markDealWonLost(123, 'open')

      const callArgs = vi.mocked(fetch).mock.calls[0]
      const body = JSON.parse(callArgs[1]?.body as string)
      expect(body.status).toBe('open')
    })

    it('does not include lostReason for won status', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: mockDeal }),
      } as Response)

      await pipedriveApiService.markDealWonLost(123, 'won')

      const callArgs = vi.mocked(fetch).mock.calls[0]
      const body = JSON.parse(callArgs[1]?.body as string)
      expect(body.lostReason).toBeUndefined()
    })

    it('does not include lostReason for open status (reopen)', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: { ...mockDeal, status: 'open' } }),
      } as Response)

      await pipedriveApiService.markDealWonLost(123, 'open')

      const callArgs = vi.mocked(fetch).mock.calls[0]
      const body = JSON.parse(callArgs[1]?.body as string)
      expect(body.lostReason).toBeUndefined()
    })

    it('returns updated deal on success', async () => {
      const updatedDeal = { ...mockDeal, status: 'won' }
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: updatedDeal }),
      } as Response)

      const result = await pipedriveApiService.markDealWonLost(123, 'won')

      expect(result).toEqual(updatedDeal)
    })

    it('handles 404 not found error', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => ({ error: 'Deal not found' }),
      } as Response)

      await expect(pipedriveApiService.markDealWonLost(123, 'won')).rejects.toMatchObject({
        statusCode: 404,
        message: expect.stringContaining('not found'),
      })
    })

    it('handles 400 bad request error', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({ error: 'Invalid status' }),
      } as Response)

      await expect(pipedriveApiService.markDealWonLost(123, 'won')).rejects.toMatchObject({
        statusCode: 400,
      })
    })
  })

  describe('Error Handling', () => {
    it('handles 401 unauthorized error', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 401,
      } as Response)

      await expect(pipedriveApiService.lookupByPhone('+48123456789')).rejects.toMatchObject({
        statusCode: 401,
        message: expect.stringContaining('Authentication expired'),
      })
    })

    it('handles 404 not found error', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 404,
      } as Response)

      await expect(pipedriveApiService.lookupByPhone('+48123456789')).rejects.toMatchObject({
        statusCode: 404,
        message: expect.stringContaining('Person not found'),
      })
    })

    it('handles 429 rate limit error', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 429,
      } as Response)

      await expect(pipedriveApiService.searchByName('John')).rejects.toMatchObject({
        statusCode: 429,
        message: expect.stringContaining('Too many requests'),
      })
    })

    it('handles 500 server error', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 500,
      } as Response)

      await expect(
        pipedriveApiService.createPerson({ name: 'Test', phone: '+48123' })
      ).rejects.toMatchObject({
        statusCode: 500,
        message: expect.stringContaining('Server error'),
      })
    })

    it('handles generic error for unknown status codes', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 418,
      } as Response)

      await expect(pipedriveApiService.lookupByPhone('+48123456789')).rejects.toMatchObject({
        statusCode: 418,
        message: expect.stringContaining('An error occurred'),
      })
    })

    it('throws error when verification_code is missing', async () => {
      global.chrome = {
        storage: {
          local: {
            get: vi.fn().mockResolvedValue({}),
          },
        },
      } as typeof chrome

      await expect(pipedriveApiService.lookupByPhone('+48123456789')).rejects.toThrow(
        'Not authenticated'
      )
    })
  })
})
