// Content script entry point
// This script runs in the context of WhatsApp Web pages

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { ErrorBoundary } from './components/ErrorBoundary'
import { waitForWhatsAppLoad } from './whatsapp-loader'
import { logError } from '../utils/errorLogger'
import { sentryScope } from './sentry'
import { themeManager } from '../styles/ThemeManager'
import '../styles/content-script.css'
import { injectMomoTrustDisplay } from '../styles/loadBrandFont'

console.log('[Content Script] Loading on WhatsApp Web')
console.log('[Content Script] Development mode:', import.meta.env.DEV)
console.log('[Content Script] Mode:', import.meta.env.MODE)

// Global error handler for uncaught errors
window.addEventListener('error', (event: ErrorEvent) => {
  logError(
    'Uncaught error',
    event.error,
    {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      url: window.location.href,
    },
    sentryScope
  )
})

// Global handler for unhandled promise rejections
window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
  logError(
    'Unhandled promise rejection',
    event.reason,
    {
      promise: event.promise,
      url: window.location.href,
    },
    sentryScope
  )
})

// Listen for module raid errors from MAIN world and report to Sentry
document.addEventListener('whatsapp-module-raid-error', (e) => {
  try {
    const evt = e as CustomEvent<{
      phase: string
      reason: string
      timeoutMs?: number
      timestamp: number
    }>
    const detail = evt.detail || { phase: 'unknown', reason: 'unknown' }
    const err = new Error(`Module raid error (${detail.phase}): ${detail.reason}`)
    logError(
      'Module raid error',
      err,
      {
        phase: detail.phase,
        reason: detail.reason,
        timeoutMs: detail.timeoutMs,
        timestamp: detail.timestamp,
        url: window.location.href,
      },
      sentryScope
    )
  } catch (err) {
    // Fallback logging in case of detail access issues
    logError('Module raid error (unstructured)', err, { url: window.location.href }, sentryScope)
  }
})

// Expose test function for console testing (production-safe, only triggers Sentry)
interface WindowWithSentryTest extends Window {
  __testSentry?: (message?: string) => void
}
;(window as WindowWithSentryTest).__testSentry = (message?: string) => {
  const testError = new Error(message || `Manual Sentry test at ${new Date().toISOString()}`)
  logError('Manual Sentry test', testError, { triggered_from: 'console' }, sentryScope)
  console.log('✓ Sentry test error logged:', testError.message)
}

// Initialize sidebar after WhatsApp is fully loaded
async function init() {
  try {
    console.log('[Content Script] Waiting for WhatsApp Web to load...')

    // Wait for WhatsApp to be ready
    await waitForWhatsAppLoad()

    console.log('[Content Script] Initializing sidebar injection')

    // Adjust WhatsApp Web layout to make room for sidebar
    const whatsappContainer = document.querySelector('#app > div > div') as HTMLElement
    if (whatsappContainer) {
      whatsappContainer.style.marginRight = '350px'
      console.log('[Content Script] WhatsApp container adjusted for sidebar')
    }

    // Inject brand font (self-hosted) before rendering
    injectMomoTrustDisplay()

    // Create sidebar container
    const sidebarContainer = document.createElement('div')
    sidebarContainer.id = 'pipedrive-whatsapp-sidebar'

    // Core positioning (inline styles for critical layout)
    sidebarContainer.style.cssText = `
      position: fixed;
      top: 0;
      right: 0;
      width: 350px;
      height: 100vh;
      z-index: 999999;
    `

    // Append to body
    document.body.appendChild(sidebarContainer)
    console.log('[Content Script] Sidebar container injected')

    // Initialize theme before rendering React to prevent flicker
    await themeManager.initialize()
    console.log('[Content Script] Theme initialized')

    // Render React app into sidebar
    const root = ReactDOM.createRoot(sidebarContainer)
    root.render(
      <React.StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </React.StrictMode>
    )

    console.log('[Content Script] React app rendered')

    // Test message passing to service worker (development mode)
    if (import.meta.env.DEV) {
      testServiceWorkerConnection()
    }
  } catch (error) {
    // Log with full context
    logError(
      'Failed to initialize sidebar',
      error,
      {
        url: window.location.href,
      },
      sentryScope
    )
  }
}

function testServiceWorkerConnection() {
  chrome.runtime.sendMessage({ type: 'PING' }, (response) => {
    if (chrome.runtime.lastError) {
      console.error(
        '[Content Script] Failed to reach service worker:',
        chrome.runtime.lastError.message
      )
    } else {
      console.log('[Content Script] Service worker responded:', response)
    }
  })
}

// Start initialization
if (window.location.href.includes('web.whatsapp.com')) {
  init()
} else {
  console.warn('[Content Script] Not on WhatsApp Web, exiting')
}
