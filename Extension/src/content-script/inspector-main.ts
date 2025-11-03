/**
 * Inspector Main World Script
 *
 * This script runs in the MAIN world (page context) instead of ISOLATED world.
 * This makes it directly accessible from the browser console.
 *
 * IMPORTANT: Module raid and Store access must be initialized IMMEDIATELY on page load,
 * before WhatsApp's modules finish loading.
 *
 * Note: MAIN world scripts cannot access chrome.* APIs.
 * This file works with WhatsApp's undocumented internal APIs.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { WhatsAppInspector } from './utils/WhatsAppInspector'
import { initializeStoreAccess } from './whatsapp-integration/store-accessor'
import { startChatMonitoring } from './whatsapp-integration/chat-monitor-main'

// --- Spec-118: Loading overlay helpers (reliable, sidebar-based trigger) ---
function waitForSidebarContainer(timeoutMs = 10000): Promise<boolean> {
  const start = Date.now()
  return new Promise((resolve) => {
    const check = () => {
      const sidebar = document.getElementById('pipedrive-whatsapp-sidebar')
      if (sidebar) {
        resolve(true)
        return
      }
      if (Date.now() - start >= timeoutMs) {
        resolve(false)
        return
      }
      setTimeout(check, 50)
    }
    check()
  })
}

function createLoadingOverlay(): HTMLElement {
  const overlay = document.createElement('div')
  overlay.id = 'chat2deal-loading-overlay'
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    right: 0;
    width: 350px;
    height: 100vh;
    background: #f0f2f5;
    z-index: 10000000;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  `

  const spinner = document.createElement('div')
  spinner.style.cssText = `
    width: 48px;
    height: 48px;
    border: 4px solid rgba(0, 0, 0, 0.1);
    border-top-color: #54656f;
    border-radius: 50%;
    animation: chat2deal-spin 0.8s linear infinite;
  `

  const text = document.createElement('span')
  text.textContent = 'Initializing Chat2Deal...'
  text.style.cssText = `
    color: #54656f;
    font-size: 16px;
    font-weight: 400;
    margin-top: 16px;
    text-align: center;
  `

  overlay.appendChild(spinner)
  overlay.appendChild(text)

  if (!document.getElementById('chat2deal-spin')) {
    const style = document.createElement('style')
    style.id = 'chat2deal-spin'
    style.textContent = `
      @keyframes chat2deal-spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `
    document.head?.appendChild(style)
  }

  return overlay
}

function showOverlayIfNeeded(initDoneRef: () => boolean): void {
  // Only show if not already present and init still in progress
  if (initDoneRef() || document.getElementById('chat2deal-loading-overlay')) return
  const overlay = createLoadingOverlay()
  document.body.appendChild(overlay)
  try {
    console.log('[Main World] Loading overlay displayed (sidebar detected)')
  } catch {
    // Ignore errors during logging
  }
}

function removeLoadingOverlay(): void {
  const overlay = document.getElementById('chat2deal-loading-overlay')
  if (overlay) overlay.remove()
  const styles = document.getElementById('chat2deal-spin')
  if (styles) styles.remove()
}

// Optional: Dispatch error events to ISOLATED world for Sentry logging
function reportModuleRaidError(details: { phase: string; reason: string; timeoutMs?: number }) {
  try {
    const evt = new CustomEvent('whatsapp-module-raid-error', {
      detail: {
        phase: details.phase,
        reason: details.reason,
        timeoutMs: details.timeoutMs,
        timestamp: Date.now(),
      },
    })
    document.dispatchEvent(evt)
  } catch {
    // Best-effort; do not throw
  }
}

// Expose testing hooks without changing runtime behavior
// Tests set window.__whatsappInspectorInitialized = true before importing this file
;(function exposeTestHooks() {
  try {
    ;(window as any).__overlayTest = {
      waitForSidebarContainer,
      createLoadingOverlay,
      removeLoadingOverlay,
      showOverlayIfNeeded,
    }
  } catch {
    // no-op in environments without window
  }
})()

// Prevent multiple initializations (use global singleton)
const win = window as any

if (!win.__whatsappInspectorInitialized) {
  win.__whatsappInspectorInitialized = true

  console.log('[Main World] WhatsApp Inspector initializing...')

  // Create inspector instance
  const inspector = new WhatsAppInspector()

  // Expose inspector globally
  win.__whatsappInspector = inspector

  console.log('[Main World] WhatsApp Inspector loaded')
  console.log('[Main World] Waiting for webpack chunks...')

  // Track completion so overlay logic is race-safe
  let initializationCompleted = false

  // Show overlay as soon as our sidebar container exists (covers the right area)
  ;(async () => {
    const hasSidebar = await waitForSidebarContainer(15000)
    if (hasSidebar) {
      showOverlayIfNeeded(() => initializationCompleted)
    }
  })()

  // CRITICAL: Initialize module raid as soon as webpack is available
  // Poll for webpack chunks and initialize immediately when found
  let webpackCheckCount = 0
  let moduleRaidInitialized = false
  let timeoutReported = false
  const maxChecks = 1200 // 1200 * 50ms = 60 seconds

  const checkForWebpack = setInterval(() => {
    // Safety check: stop if already initialized or timeout already reported
    if (moduleRaidInitialized || timeoutReported) {
      clearInterval(checkForWebpack)
      return
    }

    webpackCheckCount++
    const webpackChunk = win.webpackChunkbuild || win.webpackChunkwhatsapp_web_client

    if (webpackChunk) {
      clearInterval(checkForWebpack)
      moduleRaidInitialized = true

      try {
        console.log(
          `[Main World] Webpack chunk found after ${webpackCheckCount * 50}ms, initializing module raid...`
        )
        inspector.initializeModuleRaidEarly()
        console.log(
          '[Main World] Module raid initialization complete. Try: __whatsappInspector.inspectAll()'
        )

        // Also initialize Store access for production chat detection
        console.log('[Main World] Initializing WhatsApp Store access...')
        const storeInitialized = initializeStoreAccess()
        if (storeInitialized) {
          console.log('[Main World] Store access initialized successfully')
        } else {
          console.warn('[Main World] Store access initialization failed')
        }

        // Start chat monitoring in MAIN world
        console.log('[Main World] Starting chat monitoring...')
        startChatMonitoring()
      } catch (err) {
        console.error('[Main World] Module raid error:', err)
        reportModuleRaidError({
          phase: 'module-raid',
          reason: err instanceof Error ? err.message : 'unknown',
        })
      }

      // Mark complete and remove overlay after short dwell
      initializationCompleted = true
      setTimeout(() => removeLoadingOverlay(), 300)
    } else if (webpackCheckCount >= maxChecks && !timeoutReported) {
      clearInterval(checkForWebpack)
      timeoutReported = true
      console.log('[Main World] ⚠️  Webpack chunks not found after 60 seconds')
      reportModuleRaidError({ phase: 'webpack-detection', reason: 'timeout', timeoutMs: 60000 })
      // Timeout case: still let the rest of the app work, but remove overlay after 1s
      initializationCompleted = true
      setTimeout(() => removeLoadingOverlay(), 1000)
    }
  }, 50)
} else {
  console.log('[Main World] WhatsApp Inspector already initialized, skipping')
}
