/**
 * Service Worker Authentication Service
 *
 * Handles OAuth 2.0 authentication flow with Pipedrive using chrome.identity API.
 * This MUST run in service worker context as chrome.identity is not available in content scripts.
 *
 * ARCHITECTURE:
 * - Content script fetches OAuth URL from backend (to avoid CORS issues)
 * - Service worker receives authUrl and launches chrome.identity popup
 */

class ServiceWorkerAuthService {
  /**
   * Launches OAuth popup with provided URL
   * Returns verification_code on success
   *
   * NOTE: This method runs in service worker context where chrome.identity is available
   * The authUrl is provided by the content script (which fetches it from the backend)
   */
  async signIn(authUrl: string): Promise<string> {
    try {
      // Launch OAuth popup (chrome.identity available in service worker)
      console.log('[SW AuthService] Launching OAuth popup with URL:', authUrl)
      const redirectUrl = await chrome.identity.launchWebAuthFlow({
        url: authUrl,
        interactive: true,
      })

      console.log('[SW AuthService] OAuth popup completed, redirect URL received')

      // Extract verification_code from redirect URL
      const verificationCode = this.extractVerificationCode(redirectUrl)
      if (!verificationCode) {
        console.error('[SW AuthService] No verification code in redirect URL:', redirectUrl)
        throw new Error('No verification code received')
      }

      console.log('[SW AuthService] Verification code extracted successfully')

      // Store verification_code
      await chrome.storage.local.set({ verification_code: verificationCode })
      console.log('[SW AuthService] Verification code stored in chrome.storage.local')

      return verificationCode
    } catch (error) {
      // Handle specific OAuth errors
      if (error instanceof Error) {
        console.error('[SW AuthService] Authentication error:', error)

        // User cancelled the OAuth flow
        if (error.message.includes('user_denied') || error.message.includes('cancelled')) {
          throw new Error('You cancelled the sign-in process')
        }

        // Rethrow specific errors as-is
        if (error.message.includes('No verification code received')) {
          throw error
        }
      }

      // Unknown error - rethrow
      throw error
    }
  }

  /**
   * Extracts verification_code from OAuth callback URL
   * Example URL: https://.../api/auth/callback?verification_code=xxx&success=true
   */
  private extractVerificationCode(redirectUrl: string): string | null {
    try {
      const url = new URL(redirectUrl)
      return url.searchParams.get('verification_code')
    } catch (error) {
      console.error('[SW AuthService] Failed to parse redirect URL:', error)
      return null
    }
  }
}

export const serviceWorkerAuthService = new ServiceWorkerAuthService()
