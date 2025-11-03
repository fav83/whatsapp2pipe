/**
 * Error Codes
 *
 * Standardized error codes shared across the application.
 * These error codes are used for OAuth errors, API errors, and other application errors.
 *
 * IMPORTANT: Keep these in sync with backend error codes.
 */

/**
 * OAuth and authentication error codes
 */
export const OAuthErrorCode = {
  /** User denied OAuth authorization */
  ACCESS_DENIED: 'access_denied',
  /** Missing authorization code in callback */
  MISSING_CODE: 'missing_code',
  /** Missing or invalid state parameter */
  MISSING_STATE: 'missing_state',
  /** Invalid or expired state parameter */
  INVALID_STATE: 'invalid_state',
  /** Failed to exchange authorization code for tokens */
  TOKEN_EXCHANGE_FAILED: 'token_exchange_failed',
  /** Failed to fetch user profile from Pipedrive */
  USER_PROFILE_FETCH_FAILED: 'user_profile_fetch_failed',
  /** Failed to create user record in database */
  USER_CREATION_FAILED: 'user_creation_failed',
  /** Server configuration error */
  CONFIG_ERROR: 'config_error',
  /** Internal server error */
  INTERNAL_ERROR: 'internal_error',
  /** Closed beta - no invite code provided */
  CLOSED_BETA: 'closed_beta',
  /** Invalid invite code */
  INVALID_INVITE: 'invalid_invite',
  /** Beta access required - extension user not in database */
  BETA_ACCESS_REQUIRED: 'beta_access_required',
} as const

export type OAuthErrorCode = (typeof OAuthErrorCode)[keyof typeof OAuthErrorCode]

/**
 * Type guard to check if a string is a valid OAuth error code
 */
export function isOAuthErrorCode(error: string): error is OAuthErrorCode {
  return Object.values(OAuthErrorCode).includes(error as OAuthErrorCode)
}
