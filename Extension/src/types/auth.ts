/**
 * Authentication Types
 *
 * Defines types for OAuth authentication flow and state management
 */

/**
 * Authentication state discriminated union
 */
export type AuthState =
  | 'unauthenticated'
  | 'authenticating'
  | 'authenticated'
  | 'error'
  | 'beta_required'

/**
 * Response from backend /api/auth/start endpoint
 * Backend returns AuthorizationUrl (PascalCase)
 */
export interface AuthUrlResponse {
  AuthorizationUrl: string
}

/**
 * Auth error types for specific error handling
 */
export type AuthErrorType = 'user_denied' | 'auth_failed' | 'network_error' | 'unknown'

/**
 * Structured auth error
 */
export interface AuthError {
  type: AuthErrorType
  message: string
  originalError?: Error
}

/**
 * Chrome storage schema for auth data
 */
export interface AuthStorage {
  verification_code?: string
}
