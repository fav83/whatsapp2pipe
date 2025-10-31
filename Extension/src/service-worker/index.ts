// Service worker (background script) entry point
// Handles Chrome extension lifecycle and background tasks

import { serviceWorkerAuthService } from './authService'
import { pipedriveApiService } from './pipedriveApiService'
import { logError, getErrorMessage } from '../utils/errorLogger'
import type {
  ExtensionMessage,
  AuthSignInSuccess,
  AuthSignInError,
  PipedriveRequest,
  PipedriveResponse,
} from '../types/messages'

console.log('[Service Worker] Loaded')

// Global error handler for uncaught errors
self.addEventListener('error', (event: ErrorEvent) => {
  logError('Service Worker uncaught error', event.error, {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
  })
})

// Global handler for unhandled promise rejections
self.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
  logError('Service Worker unhandled promise rejection', event.reason, {
    promise: event.promise,
  })
})

// Listen for extension installation
chrome.runtime.onInstalled.addListener((details) => {
  console.log('[Service Worker] Extension installed:', details.reason)

  if (details.reason === 'install') {
    // First-time installation
    console.log('[Service Worker] First install - version', chrome.runtime.getManifest().version)
  } else if (details.reason === 'update') {
    // Extension updated
    console.log(
      '[Service Worker] Updated from',
      details.previousVersion,
      'to',
      chrome.runtime.getManifest().version
    )
  }
})

// Listen for messages from content script or popup
chrome.runtime.onMessage.addListener((message: ExtensionMessage, sender, sendResponse) => {
  console.log(
    '[Service Worker] Received message:',
    message,
    'from',
    sender.tab ? 'content script' : 'popup'
  )

  if (message.type === 'PING') {
    sendResponse({ type: 'PONG', timestamp: Date.now() })
    return true // Keep channel open for async response
  }

  // Handle OAuth sign-in requests
  if (message.type === 'AUTH_SIGN_IN') {
    console.log('[Service Worker] Handling AUTH_SIGN_IN request')
    console.log('[Service Worker] Message authUrl:', message.authUrl)
    console.log('[Service Worker] Full message:', JSON.stringify(message))

    // Validate authUrl exists
    if (!message.authUrl || typeof message.authUrl !== 'string') {
      console.error('[Service Worker] Invalid or missing authUrl in message')
      const response: AuthSignInError = {
        type: 'AUTH_SIGN_IN_ERROR',
        error: 'Invalid authentication request: missing OAuth URL',
      }
      sendResponse(response)
      return true
    }

    // Validate state exists
    if (!message.state || typeof message.state !== 'string') {
      console.error('[Service Worker] Invalid or missing state in message')
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
        console.log('[Service Worker] Sign-in successful, sending response')
        const response: AuthSignInSuccess = {
          type: 'AUTH_SIGN_IN_SUCCESS',
          verificationCode,
        }
        sendResponse(response)
      })
      .catch((error) => {
        console.error('[Service Worker] Sign-in failed:', error)
        const response: AuthSignInError = {
          type: 'AUTH_SIGN_IN_ERROR',
          error: error instanceof Error ? error.message : 'Authentication failed',
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

  sendResponse({ type: 'UNKNOWN_MESSAGE', received: message.type })
  return true
})

/**
 * Handle lookup by phone
 */
async function handlePipedriveLookup(
  message: PipedriveRequest,
  sendResponse: (response: PipedriveResponse) => void
) {
  try {
    if (message.type !== 'PIPEDRIVE_LOOKUP_BY_PHONE') return

    const person = await pipedriveApiService.lookupByPhone(message.phone)

    sendResponse({
      type: 'PIPEDRIVE_LOOKUP_SUCCESS',
      person,
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

// Service worker lifecycle events
self.addEventListener('activate', () => {
  console.log('[Service Worker] Activated')
})

self.addEventListener('suspend', () => {
  console.log('[Service Worker] Suspending (Manifest V3 idle timeout)')
})

console.log('[Service Worker] Ready')
