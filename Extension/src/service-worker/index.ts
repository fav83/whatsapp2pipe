// Service worker (background script) entry point
// Handles Chrome extension lifecycle and background tasks

import { serviceWorkerAuthService } from './authService'
import { pipedriveApiService } from './pipedriveApiService'
import { logError, getErrorMessage } from '../utils/errorLogger'
import { sentryScope } from './sentry'
import { AUTH_CONFIG } from '../config'
import logger from '../utils/logger'
import type {
  ExtensionMessage,
  AuthFetchUrlSuccess,
  AuthFetchUrlError,
  AuthSignInSuccess,
  AuthSignInError,
  PipedriveRequest,
  PipedriveResponse,
  FeedbackSubmitRequest,
  FeedbackResponse,
  ConfigGetRequest,
  ConfigResponse,
  TabOpenRequest,
  TabResponse,
} from '../types/messages'
import type { AuthUrlResponse } from '../types/auth'

logger.log('[Service Worker] Loaded')

// Global error handler for uncaught errors
self.addEventListener('error', (event: ErrorEvent) => {
  logError(
    'Service Worker uncaught error',
    event.error,
    {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    },
    sentryScope
  )
})

// Global handler for unhandled promise rejections
self.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
  logError(
    'Service Worker unhandled promise rejection',
    event.reason,
    {
      promise: event.promise,
    },
    sentryScope
  )
})

/**
 * Register inspector-main.js content script programmatically
 * This script must run in the MAIN world to access WhatsApp's internal APIs
 */
async function registerInspectorScript() {
  try {
    // First, unregister any existing registration to avoid duplicates
    const existingScripts = await chrome.scripting.getRegisteredContentScripts()
    const inspectorScript = existingScripts.find((s) => s.id === 'inspector-main')

    if (inspectorScript) {
      await chrome.scripting.unregisterContentScripts({ ids: ['inspector-main'] })
      logger.log('[Service Worker] Unregistered existing inspector-main script')
    }

    // Register the inspector-main.js script with MAIN world execution
    await chrome.scripting.registerContentScripts([
      {
        id: 'inspector-main',
        matches: ['*://web.whatsapp.com/*'],
        js: ['inspector-main.js'],
        runAt: 'document_start',
        world: 'MAIN',
      },
    ])
    logger.log('[Service Worker] Successfully registered inspector-main script in MAIN world')
  } catch (error) {
    logger.error('[Service Worker] Failed to register inspector-main script:', error)
    logError('Failed to register inspector-main script', error, {}, sentryScope)
  }
}

// Listen for extension installation
chrome.runtime.onInstalled.addListener((details) => {
  logger.log('[Service Worker] Extension installed:', details.reason)

  if (details.reason === 'install') {
    // First-time installation
    logger.log('[Service Worker] First install - version', chrome.runtime.getManifest().version)
  } else if (details.reason === 'update') {
    // Extension updated
    logger.log(
      '[Service Worker] Updated from',
      details.previousVersion,
      'to',
      chrome.runtime.getManifest().version
    )
  }

  // Register inspector-main.js script programmatically
  registerInspectorScript()
})

// Listen for messages from content script or popup
chrome.runtime.onMessage.addListener((message: ExtensionMessage, sender, sendResponse) => {
  logger.log(
    '[Service Worker] Received message:',
    message,
    'from',
    sender.tab ? 'content script' : 'popup'
  )

  if (message.type === 'PING') {
    sendResponse({ type: 'PONG', timestamp: Date.now() })
    return true // Keep channel open for async response
  }

  // Handle OAuth URL fetch requests (bypasses CORS)
  if (message.type === 'AUTH_FETCH_URL') {
    logger.log('[Service Worker] Handling AUTH_FETCH_URL request')

    // Validate state exists
    if (!message.state || typeof message.state !== 'string') {
      logger.error('[Service Worker] Invalid or missing state in message')
      const response: AuthFetchUrlError = {
        type: 'AUTH_FETCH_URL_ERROR',
        error: 'Invalid request: missing OAuth state',
      }
      sendResponse(response)
      return true
    }

    // Fetch OAuth URL from backend (no CORS restrictions in service worker)
    const url = `${AUTH_CONFIG.backendUrl}${AUTH_CONFIG.endpoints.authStart}?state=${encodeURIComponent(message.state)}`
    fetch(url)
      .then(async (response) => {
        if (!response.ok) {
          logger.error(
            '[Service Worker] Failed to fetch OAuth URL:',
            response.status,
            response.statusText
          )
          throw new Error('Failed to start authentication')
        }
        return response.json() as Promise<AuthUrlResponse>
      })
      .then((data) => {
        logger.log('[Service Worker] Successfully fetched OAuth URL')
        const response: AuthFetchUrlSuccess = {
          type: 'AUTH_FETCH_URL_SUCCESS',
          authUrl: data.AuthorizationUrl,
        }
        sendResponse(response)
      })
      .catch((error) => {
        logger.error('[Service Worker] Failed to fetch OAuth URL:', error)
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch OAuth URL'
        const response: AuthFetchUrlError = {
          type: 'AUTH_FETCH_URL_ERROR',
          error: errorMessage,
        }
        sendResponse(response)
      })

    return true // Keep channel open for async response
  }

  // Handle OAuth sign-in requests
  if (message.type === 'AUTH_SIGN_IN') {
    logger.log('[Service Worker] Handling AUTH_SIGN_IN request')
    logger.log('[Service Worker] Message authUrl:', message.authUrl)
    logger.log('[Service Worker] Full message:', JSON.stringify(message))

    // Validate authUrl exists
    if (!message.authUrl || typeof message.authUrl !== 'string') {
      logger.error('[Service Worker] Invalid or missing authUrl in message')
      const response: AuthSignInError = {
        type: 'AUTH_SIGN_IN_ERROR',
        error: 'Invalid authentication request: missing OAuth URL',
      }
      sendResponse(response)
      return true
    }

    // Validate state exists
    if (!message.state || typeof message.state !== 'string') {
      logger.error('[Service Worker] Invalid or missing state in message')
      const response: AuthSignInError = {
        type: 'AUTH_SIGN_IN_ERROR',
        error: 'Invalid authentication request: missing OAuth state',
      }
      sendResponse(response)
      return true
    }

    // Run async OAuth flow with provided authUrl and state
    serviceWorkerAuthService
      .signIn(message.authUrl, message.state)
      .then((verificationCode) => {
        logger.log('[Service Worker] Sign-in successful, sending response')
        const response: AuthSignInSuccess = {
          type: 'AUTH_SIGN_IN_SUCCESS',
          verificationCode,
        }
        sendResponse(response)
      })
      .catch((error) => {
        logger.error('[Service Worker] Sign-in failed:', error)

        // Log to Sentry (skip expected errors like user cancellation and beta access)
        const errorMessage = error instanceof Error ? error.message : 'Authentication failed'
        const skipSentry =
          errorMessage.includes('cancelled') ||
          errorMessage.includes('user_denied') ||
          errorMessage === 'beta_access_required'

        if (!skipSentry) {
          logError('Service Worker AUTH_SIGN_IN failed', error, {}, sentryScope)
        }

        const response: AuthSignInError = {
          type: 'AUTH_SIGN_IN_ERROR',
          error: errorMessage,
        }
        sendResponse(response)
      })

    return true // Keep channel open for async response
  }

  // Handle Pipedrive API requests
  if (message.type === 'PIPEDRIVE_LOOKUP_BY_PHONE') {
    handlePipedriveLookup(message, sendResponse)
    return true
  }

  if (message.type === 'PIPEDRIVE_SEARCH_BY_NAME') {
    handlePipedriveSearch(message, sendResponse)
    return true
  }

  if (message.type === 'PIPEDRIVE_CREATE_PERSON') {
    handlePipedriveCreate(message, sendResponse)
    return true
  }

  if (message.type === 'PIPEDRIVE_ATTACH_PHONE') {
    handlePipedriveAttach(message, sendResponse)
    return true
  }

  if (message.type === 'PIPEDRIVE_CREATE_NOTE') {
    handlePipedriveCreateNote(message, sendResponse)
    return true
  }

  if (message.type === 'PIPEDRIVE_CREATE_DEAL') {
    handlePipedriveCreateDeal(message, sendResponse)
    return true
  }

  if (message.type === 'PIPEDRIVE_UPDATE_DEAL') {
    handlePipedriveUpdateDeal(message, sendResponse)
    return true
  }

  // Handle feedback submission
  if (message.type === 'FEEDBACK_SUBMIT') {
    handleFeedbackSubmit(message, sendResponse)
    return true
  }

  // Handle config fetch
  if (message.type === 'CONFIG_GET') {
    handleConfigGet(message, sendResponse)
    return true
  }

  // Handle tab open
  if (message.type === 'TAB_OPEN') {
    handleTabOpen(message, sendResponse)
    return true
  }

  // If all known message types are handled above, TypeScript narrows `message` to `never` here.
  // Avoid accessing `message.type` to keep this branch type-safe.
  sendResponse({ type: 'UNKNOWN_MESSAGE' })
  return true
})

/**
 * Handle lookup by phone (returns person + deals)
 */
async function handlePipedriveLookup(
  message: PipedriveRequest,
  sendResponse: (response: PipedriveResponse) => void
) {
  try {
    if (message.type !== 'PIPEDRIVE_LOOKUP_BY_PHONE') return

    const result = await pipedriveApiService.lookupByPhone(message.phone)

    sendResponse({
      type: 'PIPEDRIVE_LOOKUP_SUCCESS',
      person: result.person,
      deals: result.deals,
      dealsError: result.dealsError,
    })
  } catch (error) {
    const errorMessage = getErrorMessage(error, 'Lookup failed')
    const statusCode =
      typeof error === 'object' && error !== null && 'statusCode' in error
        ? (error.statusCode as number)
        : 500
    sendResponse({
      type: 'PIPEDRIVE_ERROR',
      error: errorMessage,
      statusCode,
    })
  }
}

/**
 * Handle search by name
 */
async function handlePipedriveSearch(
  message: PipedriveRequest,
  sendResponse: (response: PipedriveResponse) => void
) {
  try {
    if (message.type !== 'PIPEDRIVE_SEARCH_BY_NAME') return

    const persons = await pipedriveApiService.searchByName(message.name)

    sendResponse({
      type: 'PIPEDRIVE_SEARCH_SUCCESS',
      persons,
    })
  } catch (error) {
    const errorMessage = getErrorMessage(error, 'Search failed')
    const statusCode =
      typeof error === 'object' && error !== null && 'statusCode' in error
        ? (error.statusCode as number)
        : 500
    sendResponse({
      type: 'PIPEDRIVE_ERROR',
      error: errorMessage,
      statusCode,
    })
  }
}

/**
 * Handle create person
 */
async function handlePipedriveCreate(
  message: PipedriveRequest,
  sendResponse: (response: PipedriveResponse) => void
) {
  try {
    if (message.type !== 'PIPEDRIVE_CREATE_PERSON') return

    const person = await pipedriveApiService.createPerson(message.data)

    sendResponse({
      type: 'PIPEDRIVE_CREATE_SUCCESS',
      person,
    })
  } catch (error) {
    const errorMessage = getErrorMessage(error, 'Failed to create person')
    const statusCode =
      typeof error === 'object' && error !== null && 'statusCode' in error
        ? (error.statusCode as number)
        : 500
    sendResponse({
      type: 'PIPEDRIVE_ERROR',
      error: errorMessage,
      statusCode,
    })
  }
}

/**
 * Handle attach phone
 */
async function handlePipedriveAttach(
  message: PipedriveRequest,
  sendResponse: (response: PipedriveResponse) => void
) {
  try {
    if (message.type !== 'PIPEDRIVE_ATTACH_PHONE') return

    const person = await pipedriveApiService.attachPhone(message.data)

    sendResponse({
      type: 'PIPEDRIVE_ATTACH_SUCCESS',
      person,
    })
  } catch (error) {
    const errorMessage = getErrorMessage(error, 'Failed to attach phone')
    const statusCode =
      typeof error === 'object' && error !== null && 'statusCode' in error
        ? (error.statusCode as number)
        : 500
    sendResponse({
      type: 'PIPEDRIVE_ERROR',
      error: errorMessage,
      statusCode,
    })
  }
}

/**
 * Handle create note
 */
async function handlePipedriveCreateNote(
  message: PipedriveRequest,
  sendResponse: (response: PipedriveResponse) => void
) {
  try {
    if (message.type !== 'PIPEDRIVE_CREATE_NOTE') return

    await pipedriveApiService.createNote(message.personId, message.content)

    sendResponse({
      type: 'PIPEDRIVE_CREATE_NOTE_SUCCESS',
    })
  } catch (error) {
    const errorMessage = getErrorMessage(error, 'Failed to create note')
    sendResponse({
      type: 'PIPEDRIVE_CREATE_NOTE_ERROR',
      error: errorMessage,
    })
  }
}

/**
 * Type guard to check if error has statusCode property
 */
function isApiError(error: unknown): error is { statusCode: number; message: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'statusCode' in error &&
    typeof (error as { statusCode: unknown }).statusCode === 'number'
  )
}

/**
 * Handle create deal
 */
async function handlePipedriveCreateDeal(
  message: PipedriveRequest,
  sendResponse: (response: PipedriveResponse) => void
) {
  try {
    if (message.type !== 'PIPEDRIVE_CREATE_DEAL') return

    const deal = await pipedriveApiService.createDeal(message.data)

    sendResponse({
      type: 'PIPEDRIVE_CREATE_DEAL_SUCCESS',
      deal,
    })
  } catch (error) {
    const statusCode = isApiError(error) ? error.statusCode : 500
    const errorMessage = getErrorMessage(error, 'Failed to create deal')

    sendResponse({
      type: 'PIPEDRIVE_ERROR',
      error: errorMessage,
      statusCode,
    })
  }
}

/**
 * Handle update deal
 */
async function handlePipedriveUpdateDeal(
  message: PipedriveRequest,
  sendResponse: (response: PipedriveResponse) => void
) {
  try {
    if (message.type !== 'PIPEDRIVE_UPDATE_DEAL') return

    const deal = await pipedriveApiService.updateDeal(message.dealId, message.data)

    sendResponse({
      type: 'PIPEDRIVE_UPDATE_DEAL_SUCCESS',
      deal,
    })
  } catch (error) {
    const statusCode = isApiError(error) ? error.statusCode : 500
    const errorMessage = getErrorMessage(error, 'Failed to update deal')

    sendResponse({
      type: 'PIPEDRIVE_ERROR',
      error: errorMessage,
      statusCode,
    })
  }
}

/**
 * Handle feedback submission
 */
async function handleFeedbackSubmit(
  message: FeedbackSubmitRequest,
  sendResponse: (response: FeedbackResponse) => void
) {
  try {
    if (message.type !== 'FEEDBACK_SUBMIT') return

    await pipedriveApiService.submitFeedback(message.message)

    sendResponse({
      type: 'FEEDBACK_SUBMIT_SUCCESS',
    })
  } catch (error) {
    const errorMessage = getErrorMessage(error, 'Failed to submit feedback')
    const statusCode =
      typeof error === 'object' && error !== null && 'statusCode' in error
        ? (error.statusCode as number)
        : 500
    sendResponse({
      type: 'FEEDBACK_SUBMIT_ERROR',
      error: errorMessage,
      statusCode,
    })
  }
}

/**
 * Handle config fetch
 */
async function handleConfigGet(
  message: ConfigGetRequest,
  sendResponse: (response: ConfigResponse) => void
) {
  try {
    if (message.type !== 'CONFIG_GET') return

    const config = await pipedriveApiService.getConfig()

    sendResponse({
      type: 'CONFIG_GET_SUCCESS',
      config,
    })
  } catch (error) {
    const errorMessage = getErrorMessage(error, 'Failed to fetch config')
    const statusCode =
      typeof error === 'object' && error !== null && 'statusCode' in error
        ? (error.statusCode as number)
        : 500
    sendResponse({
      type: 'CONFIG_GET_ERROR',
      error: errorMessage,
      statusCode,
    })
  }
}

/**
 * Handle tab open
 */
async function handleTabOpen(
  message: TabOpenRequest,
  sendResponse: (response: TabResponse) => void
) {
  try {
    if (message.type !== 'TAB_OPEN') return

    await chrome.tabs.create({ url: message.url })

    sendResponse({
      type: 'TAB_OPEN_SUCCESS',
    })
  } catch (error) {
    const errorMessage = getErrorMessage(error, 'Failed to open tab')
    sendResponse({
      type: 'TAB_OPEN_ERROR',
      error: errorMessage,
    })
  }
}

// Service worker lifecycle events
self.addEventListener('activate', () => {
  logger.log('[Service Worker] Activated')
})

self.addEventListener('suspend', () => {
  logger.log('[Service Worker] Suspending (Manifest V3 idle timeout)')
})

logger.log('[Service Worker] Ready')
