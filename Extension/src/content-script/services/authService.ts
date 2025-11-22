/**
 * Content Script Authentication Service
 *
 * Handles OAuth 2.0 authentication with hybrid approach:
 * 1. Generates OAuth state with extension ID
 * 2. Asks service worker to fetch OAuth URL from backend (bypasses CORS)
 * 3. Service worker launches chrome.identity with OAuth URL
 * 4. Service worker returns verification_code
 */

import type {
  AuthFetchUrlRequest,
  AuthFetchUrlResponse,
  AuthSignInRequest,
  AuthSignInResponse,
} from '../../types/messages'
import type { AuthError } from '../../types/auth'
import logger from '../../utils/logger'

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
   * - Content script asks service worker to fetch OAuth URL (bypasses CORS)
   * - Service worker launches chrome.identity popup (only available in SW context)
   * - Service worker validates state on callback
   */
  async signIn(): Promise<string> {
    try {
      // Step 1: Generate OAuth state with extension ID
      const state = this.generateOAuthState()
      logger.log('[AuthService] Generated OAuth state with extension ID:', chrome.runtime.id)

      // Step 2: Ask service worker to fetch OAuth URL from backend (bypasses CORS)
      logger.log('[AuthService] Requesting service worker to fetch OAuth URL...')
      const fetchMessage: AuthFetchUrlRequest = { type: 'AUTH_FETCH_URL', state }
      const fetchResponse = (await chrome.runtime.sendMessage(fetchMessage)) as AuthFetchUrlResponse

      if (fetchResponse.type === 'AUTH_FETCH_URL_ERROR') {
        logger.error('[AuthService] Failed to fetch OAuth URL:', fetchResponse.error)
        throw new Error(fetchResponse.error)
      }

      const authUrl = fetchResponse.authUrl
      logger.log('[AuthService] Received OAuth URL from service worker')

      // Step 3: Send OAuth URL and state to service worker to launch chrome.identity
      logger.log('[AuthService] Sending AUTH_SIGN_IN message to service worker...')
      const signInMessage: AuthSignInRequest = { type: 'AUTH_SIGN_IN', authUrl, state }

      // Send message to service worker and wait for response
      const signInResponse = (await chrome.runtime.sendMessage(signInMessage)) as AuthSignInResponse

      logger.log('[AuthService] Received response from service worker:', signInResponse.type)

      if (signInResponse.type === 'AUTH_SIGN_IN_SUCCESS') {
        logger.log('[AuthService] Sign-in successful')
        return signInResponse.verificationCode
      } else if (signInResponse.type === 'AUTH_SIGN_IN_ERROR') {
        logger.error('[AuthService] Sign-in failed:', signInResponse.error)
        throw new Error(signInResponse.error)
      } else {
        throw new Error('Unexpected response from service worker')
      }
    } catch (error) {
      logger.error('[AuthService] Authentication error:', error)

      // Handle specific errors
      if (error instanceof Error) {
        // Rethrow specific errors as-is
        if (
          error.message.includes('Failed to start authentication') ||
          error.message.includes('Failed to fetch OAuth URL') ||
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
   * Signs out (clears verification_code and userName)
   */
  async signOut(): Promise<void> {
    await chrome.storage.local.remove(['verification_code', 'userName'])
    logger.log('[AuthService] User signed out, verification code and userName removed')
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
