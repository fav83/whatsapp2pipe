/**
 * Inspector Main World Script
 *
 * This script runs in the MAIN world (page context) instead of ISOLATED world.
 * This makes it directly accessible from the browser console.
 *
 * IMPORTANT: Module raid must be initialized IMMEDIATELY on page load,
 * before WhatsApp's modules finish loading.
 *
 * Note: MAIN world scripts cannot access chrome.* APIs.
 * This file works with WhatsApp's undocumented internal APIs.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { WhatsAppInspector } from './utils/WhatsAppInspector'

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

  // CRITICAL: Initialize module raid as soon as webpack is available
  // Poll for webpack chunks and initialize immediately when found
  let webpackCheckCount = 0
  let moduleRaidInitialized = false
  const maxChecks = 100 // 100 * 50ms = 5 seconds

  const checkForWebpack = setInterval(() => {
    // Safety check: stop if already initialized
    if (moduleRaidInitialized) {
      clearInterval(checkForWebpack)
      return
    }

    webpackCheckCount++
    const webpackChunk = win.webpackChunkbuild || win.webpackChunkwhatsapp_web_client

    if (webpackChunk) {
      clearInterval(checkForWebpack)
      moduleRaidInitialized = true

      console.log(
        `[Main World] Webpack chunk found after ${webpackCheckCount * 50}ms, initializing module raid...`
      )
      inspector.initializeModuleRaidEarly()
      console.log(
        '[Main World] Module raid initialization complete. Try: __whatsappInspector.inspectAll()'
      )
    } else if (webpackCheckCount >= maxChecks) {
      clearInterval(checkForWebpack)
      console.log('[Main World] ⚠️  Webpack chunks not found after 5 seconds')
    }
  }, 50)
} else {
  console.log('[Main World] WhatsApp Inspector already initialized, skipping')
}
