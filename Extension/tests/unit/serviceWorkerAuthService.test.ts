/**
 * Service Worker AuthService Unit Tests
 *
 * Tests OAuth flow logic in service worker context where chrome.identity is available.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { serviceWorkerAuthService } from '../../src/service-worker/authService'

describe('ServiceWorkerAuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset storage mock
    vi.mocked(chrome.storage.local.get).mockResolvedValue({})
  })

  describe('signIn()', () => {
    it('fetches OAuth URL from backend', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ authUrl: 'https://oauth.pipedrive.com/test' }),
      })
      global.fetch = mockFetch

      await serviceWorkerAuthService.signIn()

      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/api/auth/start'))
    })

    it('launches chrome.identity.launchWebAuthFlow', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ authUrl: 'https://oauth.pipedrive.com/test' }),
      })
      global.fetch = mockFetch

      await serviceWorkerAuthService.signIn()

      expect(chrome.identity.launchWebAuthFlow).toHaveBeenCalledWith({
        url: 'https://oauth.pipedrive.com/test',
        interactive: true,
      })
    })

    it('extracts verification_code from redirect URL', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ authUrl: 'https://oauth.pipedrive.com/test' }),
      })
      global.fetch = mockFetch

      vi.mocked(chrome.identity.launchWebAuthFlow).mockResolvedValue(
        'https://backend.com/callback?verification_code=abc123&success=true'
      )

      const result = await serviceWorkerAuthService.signIn()

      expect(result).toBe('abc123')
    })

    it('stores verification_code in chrome.storage.local', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ authUrl: 'https://oauth.pipedrive.com/test' }),
      })
      global.fetch = mockFetch

      vi.mocked(chrome.identity.launchWebAuthFlow).mockResolvedValue(
        'https://backend.com/callback?verification_code=xyz789'
      )

      await serviceWorkerAuthService.signIn()

      expect(chrome.storage.local.set).toHaveBeenCalledWith({
        verification_code: 'xyz789',
      })
    })

    it('throws error for user_denied', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ authUrl: 'https://oauth.pipedrive.com/test' }),
      })
      global.fetch = mockFetch

      vi.mocked(chrome.identity.launchWebAuthFlow).mockRejectedValue(new Error('user_denied'))

      await expect(serviceWorkerAuthService.signIn()).rejects.toThrow(
        'You cancelled the sign-in process'
      )
    })

    it('throws error when backend fetch fails', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      })
      global.fetch = mockFetch

      await expect(serviceWorkerAuthService.signIn()).rejects.toThrow(
        'Failed to start authentication'
      )
    })

    it('throws error when verification_code is missing', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ authUrl: 'https://oauth.pipedrive.com/test' }),
      })
      global.fetch = mockFetch

      vi.mocked(chrome.identity.launchWebAuthFlow).mockResolvedValue(
        'https://backend.com/callback?success=false'
      )

      await expect(serviceWorkerAuthService.signIn()).rejects.toThrow(
        'No verification code received'
      )
    })
  })
})
