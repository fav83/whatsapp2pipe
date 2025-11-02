import { CONFIG } from '../config/constants'
import type { OAuthState } from '../types/auth'

class AuthService {
  /**
   * Initiates OAuth flow by redirecting to backend auth start endpoint
   */
  signIn(): void {
    // Generate OAuth state for website
    const state: OAuthState = {
      type: 'web',
      nonce: this.generateNonce(),
      timestamp: Date.now(),
    }

    // Encode state as base64 (backend expects base64-encoded JSON)
    const stateJson = JSON.stringify(state)
    const stateBase64 = btoa(stateJson)
    const stateParam = encodeURIComponent(stateBase64)

    // Redirect to backend auth start
    // Backend will redirect to Pipedrive OAuth
    window.location.href = `${CONFIG.backendUrl}${CONFIG.endpoints.authStart}?state=${stateParam}`
  }

  /**
   * Handles OAuth callback by extracting and storing verification_code
   */
  handleCallback(verificationCode: string): void {
    localStorage.setItem(
      CONFIG.storage.verificationCodeKey,
      verificationCode
    )
  }

  /**
   * Checks if user is authenticated (has verification_code)
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem(CONFIG.storage.verificationCodeKey)
  }

  /**
   * Gets stored verification_code
   */
  getVerificationCode(): string | null {
    return localStorage.getItem(CONFIG.storage.verificationCodeKey)
  }

  /**
   * Signs out (clears verification_code)
   */
  signOut(): void {
    localStorage.removeItem(CONFIG.storage.verificationCodeKey)
  }

  /**
   * Generates random nonce for CSRF protection
   */
  private generateNonce(): string {
    return Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
  }
}

export const authService = new AuthService()
