// Service worker (background script) entry point
// Handles Chrome extension lifecycle and background tasks

import { serviceWorkerAuthService } from './authService'
import type { ExtensionMessage, AuthSignInSuccess, AuthSignInError } from '../types/messages'

console.log('[Service Worker] Loaded')

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

    // Run async OAuth flow with provided authUrl
    serviceWorkerAuthService
      .signIn(message.authUrl)
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

  sendResponse({ type: 'UNKNOWN_MESSAGE', received: message.type })
  return true
})

// Service worker lifecycle events
self.addEventListener('activate', () => {
  console.log('[Service Worker] Activated')
})

self.addEventListener('suspend', () => {
  console.log('[Service Worker] Suspending (Manifest V3 idle timeout)')
})

console.log('[Service Worker] Ready')
