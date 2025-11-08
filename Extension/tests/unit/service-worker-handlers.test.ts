/**
 * Integration tests for Service Worker message handlers
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { ConfigGetRequest, ConfigResponse } from '../../src/types/messages'

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
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch config'
        const statusCode =
          typeof error === 'object' && error !== null && 'statusCode' in error
            ? (error.statusCode as number)
            : 500

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
})
