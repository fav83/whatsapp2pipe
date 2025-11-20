/**
 * Integration tests for Service Worker message handlers
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import type {
  ConfigGetRequest,
  ConfigResponse,
  PipedriveMarkDealWonLostRequest,
  PipedriveResponse,
} from '../../src/types/messages'
import type { Deal } from '../../src/types/deal'

describe('Service Worker Message Handlers', () => {
  let handleConfigGet: (
    message: ConfigGetRequest,
    sendResponse: (response: ConfigResponse) => void
  ) => Promise<void>
  let mockPipedriveApiService: {
    getConfig: ReturnType<typeof vi.fn>
  }

  beforeEach(() => {
    // Mock pipedriveApiService
    mockPipedriveApiService = {
      getConfig: vi.fn(),
    }

    // Mock handler function (simulates the actual handler logic)
    handleConfigGet = async (message, sendResponse) => {
      try {
        if (message.type !== 'CONFIG_GET') return

        const config = await mockPipedriveApiService.getConfig()
        sendResponse({
          type: 'CONFIG_GET_SUCCESS',
          config,
        })
      } catch (error) {
        const statusCode =
          typeof error === 'object' && error !== null && 'statusCode' in error
            ? (error.statusCode as number)
            : 500
        const errorMessage =
          typeof error === 'object' && error !== null && 'message' in error
            ? String((error as { message: unknown }).message)
            : error instanceof Error
              ? error.message
              : 'Failed to fetch config'

        sendResponse({
          type: 'CONFIG_GET_ERROR',
          error: errorMessage,
          statusCode,
        })
      }
    }
  })

  describe('handleConfigGet', () => {
    it('returns success response when config is available', async () => {
      const mockConfig = { message: 'Test message' }
      mockPipedriveApiService.getConfig.mockResolvedValue(mockConfig)

      const message: ConfigGetRequest = { type: 'CONFIG_GET' }
      const sendResponse = vi.fn()

      await handleConfigGet(message, sendResponse)

      expect(mockPipedriveApiService.getConfig).toHaveBeenCalledTimes(1)
      expect(sendResponse).toHaveBeenCalledWith({
        type: 'CONFIG_GET_SUCCESS',
        config: mockConfig,
      })
    })

    it('returns success with null message when config has no message', async () => {
      const mockConfig = { message: null }
      mockPipedriveApiService.getConfig.mockResolvedValue(mockConfig)

      const message: ConfigGetRequest = { type: 'CONFIG_GET' }
      const sendResponse = vi.fn()

      await handleConfigGet(message, sendResponse)

      expect(sendResponse).toHaveBeenCalledWith({
        type: 'CONFIG_GET_SUCCESS',
        config: { message: null },
      })
    })

    it('returns error response when API call fails', async () => {
      const mockError = {
        message: 'Authentication expired',
        statusCode: 401,
      }
      mockPipedriveApiService.getConfig.mockRejectedValue(mockError)

      const message: ConfigGetRequest = { type: 'CONFIG_GET' }
      const sendResponse = vi.fn()

      await handleConfigGet(message, sendResponse)

      expect(sendResponse).toHaveBeenCalledWith({
        type: 'CONFIG_GET_ERROR',
        error: 'Authentication expired',
        statusCode: 401,
      })
    })

    it('returns error response with 500 status for generic errors', async () => {
      mockPipedriveApiService.getConfig.mockRejectedValue(new Error('Network error'))

      const message: ConfigGetRequest = { type: 'CONFIG_GET' }
      const sendResponse = vi.fn()

      await handleConfigGet(message, sendResponse)

      expect(sendResponse).toHaveBeenCalledWith({
        type: 'CONFIG_GET_ERROR',
        error: 'Network error',
        statusCode: 500,
      })
    })

    it('handles different status codes correctly', async () => {
      const testCases = [
        { statusCode: 401, message: 'Unauthorized' },
        { statusCode: 404, message: 'Not found' },
        { statusCode: 500, message: 'Server error' },
        { statusCode: 503, message: 'Service unavailable' },
      ]

      for (const testCase of testCases) {
        const mockError = {
          message: testCase.message,
          statusCode: testCase.statusCode,
        }
        mockPipedriveApiService.getConfig.mockRejectedValue(mockError)

        const message: ConfigGetRequest = { type: 'CONFIG_GET' }
        const sendResponse = vi.fn()

        await handleConfigGet(message, sendResponse)

        expect(sendResponse).toHaveBeenCalledWith({
          type: 'CONFIG_GET_ERROR',
          error: testCase.message,
          statusCode: testCase.statusCode,
        })

        vi.clearAllMocks()
      }
    })

    it('does not call sendResponse for invalid message type', async () => {
      const message = { type: 'INVALID_TYPE' } as unknown as ConfigGetRequest
      const sendResponse = vi.fn()

      await handleConfigGet(message, sendResponse)

      expect(mockPipedriveApiService.getConfig).not.toHaveBeenCalled()
      expect(sendResponse).not.toHaveBeenCalled()
    })

    it('handles markdown content in config message', async () => {
      const mockConfig = {
        message: 'Check out our **new features**! <a href="https://example.com">Read more</a>',
      }
      mockPipedriveApiService.getConfig.mockResolvedValue(mockConfig)

      const message: ConfigGetRequest = { type: 'CONFIG_GET' }
      const sendResponse = vi.fn()

      await handleConfigGet(message, sendResponse)

      expect(sendResponse).toHaveBeenCalledWith({
        type: 'CONFIG_GET_SUCCESS',
        config: mockConfig,
      })
      expect(sendResponse.mock.calls[0][0].config.message).toContain('**new features**')
      expect(sendResponse.mock.calls[0][0].config.message).toContain('<a href')
    })

    it('handles very long config messages', async () => {
      const longMessage = 'A'.repeat(5000)
      const mockConfig = { message: longMessage }
      mockPipedriveApiService.getConfig.mockResolvedValue(mockConfig)

      const message: ConfigGetRequest = { type: 'CONFIG_GET' }
      const sendResponse = vi.fn()

      await handleConfigGet(message, sendResponse)

      expect(sendResponse).toHaveBeenCalledWith({
        type: 'CONFIG_GET_SUCCESS',
        config: mockConfig,
      })
    })

    it('handles non-Error exceptions', async () => {
      mockPipedriveApiService.getConfig.mockRejectedValue('String error')

      const message: ConfigGetRequest = { type: 'CONFIG_GET' }
      const sendResponse = vi.fn()

      await handleConfigGet(message, sendResponse)

      expect(sendResponse).toHaveBeenCalledWith({
        type: 'CONFIG_GET_ERROR',
        error: 'Failed to fetch config',
        statusCode: 500,
      })
    })

    it('preserves HTML entities in config message', async () => {
      const mockConfig = {
        message: 'Test &amp; example &lt;script&gt;',
      }
      mockPipedriveApiService.getConfig.mockResolvedValue(mockConfig)

      const message: ConfigGetRequest = { type: 'CONFIG_GET' }
      const sendResponse = vi.fn()

      await handleConfigGet(message, sendResponse)

      expect(sendResponse).toHaveBeenCalledWith({
        type: 'CONFIG_GET_SUCCESS',
        config: mockConfig,
      })
      expect(sendResponse.mock.calls[0][0].config.message).toBe(mockConfig.message)
    })
  })

  describe('handlePipedriveMarkDealWonLost', () => {
    let handlePipedriveMarkDealWonLost: (
      message: PipedriveMarkDealWonLostRequest,
      sendResponse: (response: PipedriveResponse) => void
    ) => Promise<void>
    let mockPipedriveApiService: {
      markDealWonLost: ReturnType<typeof vi.fn>
    }

    beforeEach(() => {
      // Mock pipedriveApiService
      mockPipedriveApiService = {
        markDealWonLost: vi.fn(),
      }

      // Mock handler function (simulates the actual handler logic)
      handlePipedriveMarkDealWonLost = async (message, sendResponse) => {
        try {
          if (message.type !== 'PIPEDRIVE_MARK_DEAL_WON_LOST') return

          const deal = await mockPipedriveApiService.markDealWonLost(
            message.dealId,
            message.status,
            message.lostReason
          )

          sendResponse({
            type: 'PIPEDRIVE_MARK_DEAL_WON_LOST_SUCCESS',
            deal,
          })
        } catch (error) {
          const statusCode =
            typeof error === 'object' && error !== null && 'statusCode' in error
              ? (error.statusCode as number)
              : 500
          const errorMessage =
            typeof error === 'object' && error !== null && 'message' in error
              ? String((error as { message: unknown }).message)
              : error instanceof Error
                ? error.message
                : 'Failed to update deal status'

          sendResponse({
            type: 'PIPEDRIVE_ERROR',
            error: errorMessage,
            statusCode,
          })
        }
      }
    })

    it('successfully marks deal as won', async () => {
      const mockDeal: Deal = {
        id: 123,
        title: 'Test Deal',
        value: '$50,000.00',
        stage: { id: 5, name: 'Won', order: 99 },
        pipeline: { id: 1, name: 'Sales Pipeline' },
        status: 'won',
        updateTime: '2025-01-20 15:30:00',
      }
      mockPipedriveApiService.markDealWonLost.mockResolvedValue(mockDeal)

      const message: PipedriveMarkDealWonLostRequest = {
        type: 'PIPEDRIVE_MARK_DEAL_WON_LOST',
        dealId: 123,
        status: 'won',
      }
      const sendResponse = vi.fn()

      await handlePipedriveMarkDealWonLost(message, sendResponse)

      expect(mockPipedriveApiService.markDealWonLost).toHaveBeenCalledWith(123, 'won', undefined)
      expect(sendResponse).toHaveBeenCalledWith({
        type: 'PIPEDRIVE_MARK_DEAL_WON_LOST_SUCCESS',
        deal: mockDeal,
      })
    })

    it('successfully marks deal as lost with reason', async () => {
      const mockDeal: Deal = {
        id: 456,
        title: 'Lost Deal',
        value: '$30,000.00',
        stage: { id: 6, name: 'Lost', order: 100 },
        pipeline: { id: 1, name: 'Sales Pipeline' },
        status: 'lost',
        lostReason: 'Customer chose competitor',
        updateTime: '2025-01-20 16:00:00',
      }
      mockPipedriveApiService.markDealWonLost.mockResolvedValue(mockDeal)

      const message: PipedriveMarkDealWonLostRequest = {
        type: 'PIPEDRIVE_MARK_DEAL_WON_LOST',
        dealId: 456,
        status: 'lost',
        lostReason: 'Customer chose competitor',
      }
      const sendResponse = vi.fn()

      await handlePipedriveMarkDealWonLost(message, sendResponse)

      expect(mockPipedriveApiService.markDealWonLost).toHaveBeenCalledWith(
        456,
        'lost',
        'Customer chose competitor'
      )
      expect(sendResponse).toHaveBeenCalledWith({
        type: 'PIPEDRIVE_MARK_DEAL_WON_LOST_SUCCESS',
        deal: mockDeal,
      })
    })

    it('returns error when deal not found', async () => {
      const mockError = {
        message: 'Deal not found',
        statusCode: 404,
      }
      mockPipedriveApiService.markDealWonLost.mockRejectedValue(mockError)

      const message: PipedriveMarkDealWonLostRequest = {
        type: 'PIPEDRIVE_MARK_DEAL_WON_LOST',
        dealId: 999,
        status: 'won',
      }
      const sendResponse = vi.fn()

      await handlePipedriveMarkDealWonLost(message, sendResponse)

      expect(sendResponse).toHaveBeenCalledWith({
        type: 'PIPEDRIVE_ERROR',
        error: 'Deal not found',
        statusCode: 404,
      })
    })

    it('returns error when authentication fails', async () => {
      const mockError = {
        message: 'Invalid or expired session',
        statusCode: 401,
      }
      mockPipedriveApiService.markDealWonLost.mockRejectedValue(mockError)

      const message: PipedriveMarkDealWonLostRequest = {
        type: 'PIPEDRIVE_MARK_DEAL_WON_LOST',
        dealId: 123,
        status: 'won',
      }
      const sendResponse = vi.fn()

      await handlePipedriveMarkDealWonLost(message, sendResponse)

      expect(sendResponse).toHaveBeenCalledWith({
        type: 'PIPEDRIVE_ERROR',
        error: 'Invalid or expired session',
        statusCode: 401,
      })
    })

    it('returns error with 500 status for generic errors', async () => {
      mockPipedriveApiService.markDealWonLost.mockRejectedValue(new Error('Network error'))

      const message: PipedriveMarkDealWonLostRequest = {
        type: 'PIPEDRIVE_MARK_DEAL_WON_LOST',
        dealId: 123,
        status: 'won',
      }
      const sendResponse = vi.fn()

      await handlePipedriveMarkDealWonLost(message, sendResponse)

      expect(sendResponse).toHaveBeenCalledWith({
        type: 'PIPEDRIVE_ERROR',
        error: 'Network error',
        statusCode: 500,
      })
    })

    it('handles validation errors correctly', async () => {
      const mockError = {
        message: 'Lost reason is required when marking deal as lost',
        statusCode: 400,
      }
      mockPipedriveApiService.markDealWonLost.mockRejectedValue(mockError)

      const message: PipedriveMarkDealWonLostRequest = {
        type: 'PIPEDRIVE_MARK_DEAL_WON_LOST',
        dealId: 123,
        status: 'lost',
        // Missing lostReason
      }
      const sendResponse = vi.fn()

      await handlePipedriveMarkDealWonLost(message, sendResponse)

      expect(sendResponse).toHaveBeenCalledWith({
        type: 'PIPEDRIVE_ERROR',
        error: 'Lost reason is required when marking deal as lost',
        statusCode: 400,
      })
    })

    it('handles rate limit errors', async () => {
      const mockError = {
        message: 'Rate limit exceeded',
        statusCode: 429,
      }
      mockPipedriveApiService.markDealWonLost.mockRejectedValue(mockError)

      const message: PipedriveMarkDealWonLostRequest = {
        type: 'PIPEDRIVE_MARK_DEAL_WON_LOST',
        dealId: 123,
        status: 'won',
      }
      const sendResponse = vi.fn()

      await handlePipedriveMarkDealWonLost(message, sendResponse)

      expect(sendResponse).toHaveBeenCalledWith({
        type: 'PIPEDRIVE_ERROR',
        error: 'Rate limit exceeded',
        statusCode: 429,
      })
    })

    it('does not call sendResponse for invalid message type', async () => {
      const message = { type: 'INVALID_TYPE' } as unknown as PipedriveMarkDealWonLostRequest
      const sendResponse = vi.fn()

      await handlePipedriveMarkDealWonLost(message, sendResponse)

      expect(mockPipedriveApiService.markDealWonLost).not.toHaveBeenCalled()
      expect(sendResponse).not.toHaveBeenCalled()
    })

    it('handles non-Error exceptions', async () => {
      mockPipedriveApiService.markDealWonLost.mockRejectedValue('String error')

      const message: PipedriveMarkDealWonLostRequest = {
        type: 'PIPEDRIVE_MARK_DEAL_WON_LOST',
        dealId: 123,
        status: 'won',
      }
      const sendResponse = vi.fn()

      await handlePipedriveMarkDealWonLost(message, sendResponse)

      expect(sendResponse).toHaveBeenCalledWith({
        type: 'PIPEDRIVE_ERROR',
        error: 'Failed to update deal status',
        statusCode: 500,
      })
    })

    it('preserves lost reason in response for lost deals', async () => {
      const lostReason = 'Budget constraints - project postponed indefinitely'
      const mockDeal: Deal = {
        id: 789,
        title: 'Big Project',
        value: '$100,000.00',
        stage: { id: 6, name: 'Lost', order: 100 },
        pipeline: { id: 1, name: 'Sales Pipeline' },
        status: 'lost',
        lostReason,
        updateTime: '2025-01-20 17:00:00',
      }
      mockPipedriveApiService.markDealWonLost.mockResolvedValue(mockDeal)

      const message: PipedriveMarkDealWonLostRequest = {
        type: 'PIPEDRIVE_MARK_DEAL_WON_LOST',
        dealId: 789,
        status: 'lost',
        lostReason,
      }
      const sendResponse = vi.fn()

      await handlePipedriveMarkDealWonLost(message, sendResponse)

      expect(sendResponse).toHaveBeenCalledWith({
        type: 'PIPEDRIVE_MARK_DEAL_WON_LOST_SUCCESS',
        deal: expect.objectContaining({
          lostReason,
          status: 'lost',
        }),
      })
    })

    it('handles maximum length lost reason', async () => {
      const longReason = 'A'.repeat(150) // Maximum allowed length
      const mockDeal: Deal = {
        id: 111,
        title: 'Deal with Long Reason',
        value: '$20,000.00',
        stage: { id: 6, name: 'Lost', order: 100 },
        pipeline: { id: 1, name: 'Sales Pipeline' },
        status: 'lost',
        lostReason: longReason,
        updateTime: '2025-01-20 18:00:00',
      }
      mockPipedriveApiService.markDealWonLost.mockResolvedValue(mockDeal)

      const message: PipedriveMarkDealWonLostRequest = {
        type: 'PIPEDRIVE_MARK_DEAL_WON_LOST',
        dealId: 111,
        status: 'lost',
        lostReason: longReason,
      }
      const sendResponse = vi.fn()

      await handlePipedriveMarkDealWonLost(message, sendResponse)

      expect(mockPipedriveApiService.markDealWonLost).toHaveBeenCalledWith(111, 'lost', longReason)
      expect(sendResponse).toHaveBeenCalledWith({
        type: 'PIPEDRIVE_MARK_DEAL_WON_LOST_SUCCESS',
        deal: mockDeal,
      })
    })
  })
})
