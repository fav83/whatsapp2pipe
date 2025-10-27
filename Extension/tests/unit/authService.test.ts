/**
 * AuthService Unit Tests
 *
 * Tests message passing to service worker, response handling,
 * storage operations, and error handling.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { authService } from '../../src/content-script/services/authService'
import type { AuthSignInSuccess, AuthSignInError } from '../../src/types/messages'

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset storage mock
    vi.mocked(chrome.storage.local.get).mockResolvedValue({})
  })

  describe('signIn()', () => {
    it('sends AUTH_SIGN_IN message to service worker', async () => {
      const successResponse: AuthSignInSuccess = {
        type: 'AUTH_SIGN_IN_SUCCESS',
        verificationCode: 'test_code_123',
      }
      vi.mocked(chrome.runtime.sendMessage).mockResolvedValue(successResponse)

      await authService.signIn()

      expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({
        type: 'AUTH_SIGN_IN',
      })
    })

    it('returns verification_code on success', async () => {
      const successResponse: AuthSignInSuccess = {
        type: 'AUTH_SIGN_IN_SUCCESS',
        verificationCode: 'abc123',
      }
      vi.mocked(chrome.runtime.sendMessage).mockResolvedValue(successResponse)

      const result = await authService.signIn()

      expect(result).toBe('abc123')
    })

    it('throws error when service worker returns error', async () => {
      const errorResponse: AuthSignInError = {
        type: 'AUTH_SIGN_IN_ERROR',
        error: 'You cancelled the sign-in process',
      }
      vi.mocked(chrome.runtime.sendMessage).mockResolvedValue(errorResponse)

      await expect(authService.signIn()).rejects.toThrow('You cancelled the sign-in process')
    })

    it('throws error when service worker returns unexpected response', async () => {
      vi.mocked(chrome.runtime.sendMessage).mockResolvedValue({
        type: 'UNKNOWN',
      })

      await expect(authService.signIn()).rejects.toThrow('Unexpected response from service worker')
    })

    it('throws error when sendMessage fails', async () => {
      vi.mocked(chrome.runtime.sendMessage).mockRejectedValue(
        new Error('Service worker not responding')
      )

      await expect(authService.signIn()).rejects.toThrow('Service worker not responding')
    })
  })

  describe('isAuthenticated()', () => {
    it('returns true when verification_code exists', async () => {
      vi.mocked(chrome.storage.local.get).mockResolvedValue({
        verification_code: 'test_code',
      })

      const result = await authService.isAuthenticated()

      expect(result).toBe(true)
    })

    it('returns false when no verification_code', async () => {
      vi.mocked(chrome.storage.local.get).mockResolvedValue({})

      const result = await authService.isAuthenticated()

      expect(result).toBe(false)
    })

    it('calls chrome.storage.local.get with correct key', async () => {
      await authService.isAuthenticated()

      expect(chrome.storage.local.get).toHaveBeenCalledWith('verification_code')
    })
  })

  describe('getVerificationCode()', () => {
    it('returns stored code when it exists', async () => {
      vi.mocked(chrome.storage.local.get).mockResolvedValue({
        verification_code: 'stored_code_123',
      })

      const result = await authService.getVerificationCode()

      expect(result).toBe('stored_code_123')
    })

    it('returns null when no code exists', async () => {
      vi.mocked(chrome.storage.local.get).mockResolvedValue({})

      const result = await authService.getVerificationCode()

      expect(result).toBeNull()
    })
  })

  describe('signOut()', () => {
    it('removes verification_code from storage', async () => {
      await authService.signOut()

      expect(chrome.storage.local.remove).toHaveBeenCalledWith('verification_code')
    })
  })
})
