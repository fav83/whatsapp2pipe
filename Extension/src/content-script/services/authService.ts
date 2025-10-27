/**
 * Content Script Authentication Service
 *
 * Handles OAuth 2.0 authentication with hybrid approach:
 * 1. Fetches OAuth URL from backend (content script context - CORS works)
 * 2. Passes URL to service worker to launch chrome.identity
 * 3. Service worker returns verification_code
 */

import { AUTH_CONFIG } from '../../config'
import type { AuthUrlResponse } from '../../types/auth'
import type { AuthSignInRequest, AuthSignInResponse } from '../../types/messages'

class AuthService {
  /**
   * Initiates OAuth flow
   * Returns verification_code on success
   *
   * ARCHITECTURE:
   * - Content script fetches OAuth URL (from WhatsApp origin - CORS allowed)
   * - Service worker launches chrome.identity popup (only available in SW context)
   */
  async signIn(): Promise<string> {
    try {
      // Step 1: Fetch OAuth URL from backend (in content script context to avoid CORS issues)
      console.log('[AuthService] Fetching OAuth URL from backend...')
      const response = await fetch(`${AUTH_CONFIG.backendUrl}${AUTH_CONFIG.endpoints.authStart}`)

      if (!response.ok) {
        console.error(
          '[AuthService] Failed to fetch OAuth URL:',
          response.status,
          response.statusText
        )
        throw new Error('Failed to start authentication')
      }

      const data: AuthUrlResponse = await response.json()
      console.log('[AuthService] Backend response:', JSON.stringify(data))
      const authUrl = data.AuthorizationUrl
      console.log('[AuthService] Received OAuth URL from backend')

      // Step 2: Send OAuth URL to service worker to launch chrome.identity
      console.log('[AuthService] OAuth URL to send:', authUrl)
      console.log('[AuthService] Sending AUTH_SIGN_IN message to service worker...')
      const message: AuthSignInRequest = { type: 'AUTH_SIGN_IN', authUrl }
      console.log('[AuthService] Message object:', JSON.stringify(message))

      // Send message to service worker and wait for response
      const swResponse = (await chrome.runtime.sendMessage(message)) as AuthSignInResponse

      console.log('[AuthService] Received response from service worker:', swResponse.type)

      if (swResponse.type === 'AUTH_SIGN_IN_SUCCESS') {
        console.log('[AuthService] Sign-in successful')
        return swResponse.verificationCode
      } else if (swResponse.type === 'AUTH_SIGN_IN_ERROR') {
        console.error('[AuthService] Sign-in failed:', swResponse.error)
        throw new Error(swResponse.error)
      } else {
        throw new Error('Unexpected response from service worker')
      }
    } catch (error) {
      console.error('[AuthService] Authentication error:', error)

      // Handle specific errors
      if (error instanceof Error) {
        // Network or fetch errors
        if (error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
          throw new Error('Could not connect to server')
        }

        // Rethrow specific errors as-is
        if (
          error.message.includes('Failed to start authentication') ||
          error.message.includes('You cancelled the sign-in process')
        ) {
          throw error
        }
      }

      // Rethrow unknown errors
      throw error
    }
  }

  /**
   * Checks if user is authenticated (has verification_code)
   */
  async isAuthenticated(): Promise<boolean> {
    const result = await chrome.storage.local.get('verification_code')
    return !!result.verification_code
  }

  /**
   * Gets stored verification_code
   */
  async getVerificationCode(): Promise<string | null> {
    const result = await chrome.storage.local.get('verification_code')
    return result.verification_code || null
  }

  /**
   * Signs out (clears verification_code)
   */
  async signOut(): Promise<void> {
    await chrome.storage.local.remove('verification_code')
    console.log('[AuthService] User signed out, verification code removed')
  }

  /**
   * Creates a structured auth error
   */
  private createError(type: AuthError['type'], message: string): AuthError {
    return {
      type,
      message,
    } as AuthError
  }
}

export const authService = new AuthService()
