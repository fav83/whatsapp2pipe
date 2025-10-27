/**
 * Message Types for Chrome Extension Communication
 *
 * Defines message types for communication between:
 * - Content scripts <-> Service worker
 * - Popup <-> Service worker
 */

// ============================================================================
// Auth Messages
// ============================================================================

/**
 * Request to initiate OAuth sign-in flow
 * Sent from: Content script
 * Handled by: Service worker
 *
 * Content script generates OAuth state with extension ID, fetches authUrl from backend,
 * then passes both to service worker which launches chrome.identity and validates state on callback
 */
export interface AuthSignInRequest {
  type: 'AUTH_SIGN_IN'
  authUrl: string
  state: string // OAuth state parameter (base64-encoded JSON with extensionId, nonce, timestamp)
}

/**
 * Response after successful OAuth sign-in
 * Sent from: Service worker
 * Received by: Content script
 */
export interface AuthSignInSuccess {
  type: 'AUTH_SIGN_IN_SUCCESS'
  verificationCode: string
}

/**
 * Response after failed OAuth sign-in
 * Sent from: Service worker
 * Received by: Content script
 */
export interface AuthSignInError {
  type: 'AUTH_SIGN_IN_ERROR'
  error: string
}

/**
 * Union type for all auth responses
 */
export type AuthSignInResponse = AuthSignInSuccess | AuthSignInError

// ============================================================================
// General Messages
// ============================================================================

/**
 * Ping message for testing connectivity
 */
export interface PingMessage {
  type: 'PING'
}

/**
 * Pong response to ping
 */
export interface PongMessage {
  type: 'PONG'
  timestamp: number
}

// ============================================================================
// Message Union Types
// ============================================================================

/**
 * All possible message types that can be sent
 */
export type ExtensionMessage = AuthSignInRequest | PingMessage

/**
 * All possible response types
 */
export type ExtensionResponse = AuthSignInResponse | PongMessage
