// Content script entry point
// This script runs in the context of WhatsApp Web pages

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { ErrorBoundary } from './components/ErrorBoundary'
import { ToastProvider } from './context/ToastContext'
import { waitForWhatsAppLoad } from './whatsapp-loader'
import { logError } from '../utils/errorLogger'
import { sentryScope } from './sentry'
import { themeManager } from '../styles/ThemeManager'
import logger from '../utils/logger'
import '../styles/content-script.css'
import { injectMomoTrustDisplay } from '../styles/loadBrandFont'

const SIDEBAR_WIDTH_PX = 350

function applyWhatsAppLayoutSpacing() {
  // Ensure body reserves space for the sidebar without overlapping content
  const styleId = 'chat2deal-sidebar-layout'
  let layoutStyle = document.getElementById(styleId) as HTMLStyleElement | null

  if (!layoutStyle) {
    layoutStyle = document.createElement('style')
    layoutStyle.id = styleId
    document.head.appendChild(layoutStyle)
  }

  layoutStyle.textContent = `
    :root { --chat2deal-sidebar-width: ${SIDEBAR_WIDTH_PX}px; }
    body.chat2deal-sidebar-active {
      box-sizing: border-box;
      padding-right: var(--chat2deal-sidebar-width);
      overflow-x: hidden;
    }
    body.chat2deal-sidebar-active #app,
    body.chat2deal-sidebar-active #app > div,
    body.chat2deal-sidebar-active #app > div > div {
      box-sizing: border-box;
      width: 100% !important;
    }
  `

  document.body.classList.add('chat2deal-sidebar-active')

  // Fallback inline padding for the primary container (DOM structure can change)
  const containerSelectors = ['#app > div > div', '#app > div', '#app']
  for (const selector of containerSelectors) {
    const el = document.querySelector(selector) as HTMLElement | null
    if (el) {
      el.style.boxSizing = 'border-box'
      el.style.paddingRight = `${SIDEBAR_WIDTH_PX}px`
      break
    }
  }
}

logger.log('[Content Script] Loading on WhatsApp Web')
logger.log('[Content Script] Development mode:', import.meta.env.DEV)
logger.log('[Content Script] Mode:', import.meta.env.MODE)

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
  logger.log('✓ Sentry test error logged:', testError.message)
}

// Initialize sidebar after WhatsApp is fully loaded
async function init() {
  try {
    logger.log('[Content Script] Waiting for WhatsApp Web to load...')

    // Wait for WhatsApp to be ready
    await waitForWhatsAppLoad()

    logger.log('[Content Script] Initializing sidebar injection')

    // Adjust WhatsApp Web layout to make room for sidebar
    applyWhatsAppLayoutSpacing()
    logger.log('[Content Script] WhatsApp layout adjusted for sidebar')

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
      width: ${SIDEBAR_WIDTH_PX}px;
      height: 100vh;
      z-index: 999999;
    `

    // Append to body
    document.body.appendChild(sidebarContainer)
    logger.log('[Content Script] Sidebar container injected')

    // Initialize theme before rendering React to prevent flicker
    await themeManager.initialize()
    logger.log('[Content Script] Theme initialized')

    // Render React app into sidebar
    const root = ReactDOM.createRoot(sidebarContainer)
    root.render(
      <React.StrictMode>
        <ErrorBoundary>
          <ToastProvider>
            <App />
          </ToastProvider>
        </ErrorBoundary>
      </React.StrictMode>
    )

    logger.log('[Content Script] React app rendered')

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
      logger.error(
        '[Content Script] Failed to reach service worker:',
        chrome.runtime.lastError.message
      )
    } else {
      logger.log('[Content Script] Service worker responded:', response)
    }
  })
}

// Start initialization
if (window.location.href.includes('web.whatsapp.com')) {
  init()
} else {
  logger.warn('[Content Script] Not on WhatsApp Web, exiting')
}
