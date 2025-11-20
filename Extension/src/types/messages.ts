/**
 * Message Types for Chrome Extension Communication
 *
 * Defines message types for communication between:
 * - Content scripts <-> Service worker
 * - Popup <-> Service worker
 */

import type { Person, CreatePersonData, AttachPhoneData } from './person'
import type { UserConfig } from './config'
import type { Deal, CreateDealData, UpdateDealData } from './deal'

// ============================================================================
// Auth Messages
// ============================================================================

/**
 * Request to fetch OAuth URL from backend
 * Sent from: Content script
 * Handled by: Service worker
 *
 * Service worker fetches OAuth URL from backend (bypasses CORS restrictions)
 */
export interface AuthFetchUrlRequest {
  type: 'AUTH_FETCH_URL'
  state: string // OAuth state parameter (base64-encoded JSON with extensionId, nonce, timestamp)
}

/**
 * Response after successfully fetching OAuth URL
 * Sent from: Service worker
 * Received by: Content script
 */
export interface AuthFetchUrlSuccess {
  type: 'AUTH_FETCH_URL_SUCCESS'
  authUrl: string
}

/**
 * Response after failing to fetch OAuth URL
 * Sent from: Service worker
 * Received by: Content script
 */
export interface AuthFetchUrlError {
  type: 'AUTH_FETCH_URL_ERROR'
  error: string
}

/**
 * Union type for fetch URL responses
 */
export type AuthFetchUrlResponse = AuthFetchUrlSuccess | AuthFetchUrlError

/**
 * Request to initiate OAuth sign-in flow
 * Sent from: Content script
 * Handled by: Service worker
 *
 * Content script generates OAuth state with extension ID, then service worker fetches authUrl
 * from backend and launches chrome.identity, validating state on callback
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
// Pipedrive API Messages
// ============================================================================

/**
 * Pipedrive API Messages
 *
 * Discriminated unions for type-safe message passing
 * between content script and service worker
 */

// Request Messages (Content Script → Service Worker)

/**
 * Lookup person by phone number
 */
export interface PipedriveLookupByPhoneRequest {
  type: 'PIPEDRIVE_LOOKUP_BY_PHONE'
  phone: string // E.164 format
}

/**
 * Search persons by name
 */
export interface PipedriveSearchByNameRequest {
  type: 'PIPEDRIVE_SEARCH_BY_NAME'
  name: string
}

/**
 * Create new person
 */
export interface PipedriveCreatePersonRequest {
  type: 'PIPEDRIVE_CREATE_PERSON'
  data: CreatePersonData
}

/**
 * Attach WhatsApp phone to existing person
 */
export interface PipedriveAttachPhoneRequest {
  type: 'PIPEDRIVE_ATTACH_PHONE'
  data: AttachPhoneData
}

/**
 * Create a note in Pipedrive attached to a person
 */
export interface PipedriveCreateNoteRequest {
  type: 'PIPEDRIVE_CREATE_NOTE'
  personId: number
  content: string
}

/**
 * Create a deal in Pipedrive
 */
export interface PipedriveCreateDealRequest {
  type: 'PIPEDRIVE_CREATE_DEAL'
  data: CreateDealData
}

/**
 * Update deal pipeline and/or stage
 */
export interface PipedriveUpdateDealRequest {
  type: 'PIPEDRIVE_UPDATE_DEAL'
  dealId: number
  data: UpdateDealData
}

/**
 * Mark deal as won or lost
 */
export interface PipedriveMarkDealWonLostRequest {
  type: 'PIPEDRIVE_MARK_DEAL_WON_LOST'
  dealId: number
  status: 'won' | 'lost'
  lostReason?: string
}

/**
 * Union of all Pipedrive request messages
 */
export type PipedriveRequest =
  | PipedriveLookupByPhoneRequest
  | PipedriveSearchByNameRequest
  | PipedriveCreatePersonRequest
  | PipedriveAttachPhoneRequest
  | PipedriveCreateNoteRequest
  | PipedriveCreateDealRequest
  | PipedriveUpdateDealRequest
  | PipedriveMarkDealWonLostRequest

// Response Messages (Service Worker → Content Script)

/**
 * Successful lookup by phone
 * Returns single person or null if not found
 * Also returns deals array (or null if error) and optional dealsError
 */
export interface PipedriveLookupSuccess {
  type: 'PIPEDRIVE_LOOKUP_SUCCESS'
  person: Person | null
  deals: Deal[] | null
  dealsError?: string
}

/**
 * Successful search by name
 * Returns array of matching persons (can be empty)
 */
export interface PipedriveSearchSuccess {
  type: 'PIPEDRIVE_SEARCH_SUCCESS'
  persons: Person[]
}

/**
 * Successfully created person
 */
export interface PipedriveCreateSuccess {
  type: 'PIPEDRIVE_CREATE_SUCCESS'
  person: Person
}

/**
 * Successfully attached phone
 */
export interface PipedriveAttachSuccess {
  type: 'PIPEDRIVE_ATTACH_SUCCESS'
  person: Person
}

/**
 * Successfully created note
 */
export interface PipedriveCreateNoteSuccess {
  type: 'PIPEDRIVE_CREATE_NOTE_SUCCESS'
}

/**
 * Failed to create note
 */
export interface PipedriveCreateNoteError {
  type: 'PIPEDRIVE_CREATE_NOTE_ERROR'
  error: string
}

/**
 * Successfully created deal
 */
export interface PipedriveCreateDealSuccess {
  type: 'PIPEDRIVE_CREATE_DEAL_SUCCESS'
  deal: Deal
}

/**
 * Successfully updated deal
 */
export interface PipedriveUpdateDealSuccess {
  type: 'PIPEDRIVE_UPDATE_DEAL_SUCCESS'
  deal: Deal
}

/**
 * Successfully marked deal as won or lost
 */
export interface PipedriveMarkDealWonLostSuccess {
  type: 'PIPEDRIVE_MARK_DEAL_WON_LOST_SUCCESS'
  deal: Deal
}

/**
 * Pipedrive API error
 * Includes HTTP status code and user-friendly message
 */
export interface PipedriveError {
  type: 'PIPEDRIVE_ERROR'
  /** User-friendly error message (ready for display) */
  error: string
  /** HTTP status code from backend */
  statusCode: number
}

/**
 * Union of all Pipedrive response messages
 */
export type PipedriveResponse =
  | PipedriveLookupSuccess
  | PipedriveSearchSuccess
  | PipedriveCreateSuccess
  | PipedriveAttachSuccess
  | PipedriveCreateNoteSuccess
  | PipedriveCreateNoteError
  | PipedriveCreateDealSuccess
  | PipedriveUpdateDealSuccess
  | PipedriveMarkDealWonLostSuccess
  | PipedriveError

// ============================================================================
// Feedback Messages
// ============================================================================

/**
 * Submit user feedback
 */
export interface FeedbackSubmitRequest {
  type: 'FEEDBACK_SUBMIT'
  message: string
}

/**
 * Successful feedback submission
 */
export interface FeedbackSubmitSuccess {
  type: 'FEEDBACK_SUBMIT_SUCCESS'
}

/**
 * Feedback submission error
 */
export interface FeedbackSubmitError {
  type: 'FEEDBACK_SUBMIT_ERROR'
  error: string
  statusCode: number
}

/**
 * Union of all feedback responses
 */
export type FeedbackResponse = FeedbackSubmitSuccess | FeedbackSubmitError

// ============================================================================
// Config Messages
// ============================================================================

/**
 * Get user configuration
 */
export interface ConfigGetRequest {
  type: 'CONFIG_GET'
}

/**
 * Successful config fetch
 */
export interface ConfigGetSuccess {
  type: 'CONFIG_GET_SUCCESS'
  config: UserConfig
}

/**
 * Config fetch error
 */
export interface ConfigGetError {
  type: 'CONFIG_GET_ERROR'
  error: string
  statusCode: number
}

/**
 * Union of all config responses
 */
export type ConfigResponse = ConfigGetSuccess | ConfigGetError

// ============================================================================
// Tab Messages
// ============================================================================

/**
 * Request to open a URL in a new tab
 */
export interface TabOpenRequest {
  type: 'TAB_OPEN'
  url: string
}

/**
 * Successful tab open
 */
export interface TabOpenSuccess {
  type: 'TAB_OPEN_SUCCESS'
}

/**
 * Tab open error
 */
export interface TabOpenError {
  type: 'TAB_OPEN_ERROR'
  error: string
}

/**
 * Union of all tab responses
 */
export type TabResponse = TabOpenSuccess | TabOpenError

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
export type ExtensionMessage =
  | AuthFetchUrlRequest
  | AuthSignInRequest
  | PipedriveRequest
  | FeedbackSubmitRequest
  | ConfigGetRequest
  | TabOpenRequest
  | PingMessage

/**
 * All possible response types
 */
export type ExtensionResponse =
  | AuthFetchUrlResponse
  | AuthSignInResponse
  | PipedriveResponse
  | FeedbackResponse
  | ConfigResponse
  | TabResponse
  | PongMessage
