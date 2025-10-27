/**
 * Content Script Authentication Service
 *
 * Handles OAuth 2.0 authentication with hybrid approach:
 * 1. Generates OAuth state with extension ID
 * 2. Fetches OAuth URL from backend with state parameter
 * 3. Passes URL and state to service worker to launch chrome.identity
 * 4. Service worker returns verification_code
 */

import { AUTH_CONFIG } from '../../config'
import type { AuthUrlResponse } from '../../types/auth'
import type { AuthSignInRequest, AuthSignInResponse } from '../../types/messages'

interface OAuthState {
  extensionId: string
  nonce: string
  timestamp: number
}

class AuthService {
  /**
   * Generates OAuth state parameter with extension ID
   * State format: base64({ extensionId, nonce, timestamp })
   *
   * This allows the backend to:
   * - Dynamically determine the extension ID for callback redirect
   * - Support multiple environments (dev/staging/prod) with one backend
   * - Provide CSRF protection via nonce
   */
  private generateOAuthState(): string {
    const stateData: OAuthState = {
      extensionId: chrome.runtime.id,
      nonce: crypto.randomUUID(), // For CSRF protection
      timestamp: Date.now(),
    }

    const stateJson = JSON.stringify(stateData)
    return btoa(stateJson)
  }

  /**
   * Initiates OAuth flow
   * Returns verification_code on success
   *
   * ARCHITECTURE:
   * - Content script generates state with extension ID
   * - Content script fetches OAuth URL (from WhatsApp origin - CORS allowed)
   * - Service worker launches chrome.identity popup (only available in SW context)
   * - Service worker validates state on callback
   */
  async signIn(): Promise<string> {
    try {
      // Step 1: Generate OAuth state with extension ID
      const state = this.generateOAuthState()
      console.log('[AuthService] Generated OAuth state with extension ID:', chrome.runtime.id)

      // Step 2: Fetch OAuth URL from backend with state parameter
      console.log('[AuthService] Fetching OAuth URL from backend...')
      const url = `${AUTH_CONFIG.backendUrl}${AUTH_CONFIG.endpoints.authStart}?state=${encodeURIComponent(state)}`
      const response = await fetch(url)

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

      // Step 3: Send OAuth URL and state to service worker to launch chrome.identity
      console.log('[AuthService] OAuth URL to send:', authUrl)
      console.log('[AuthService] Sending AUTH_SIGN_IN message to service worker...')
      const message: AuthSignInRequest = { type: 'AUTH_SIGN_IN', authUrl, state }
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
