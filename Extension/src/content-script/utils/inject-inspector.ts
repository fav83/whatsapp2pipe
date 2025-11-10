/**
 * Inject WhatsApp Inspector into Page Context
 *
 * Content scripts run in an isolated world and can't expose variables to the console.
 * This script injects the inspector code directly into the page's JavaScript context.
 */

import { whatsappInspector } from './WhatsAppInspector'

/**
 * Inject the inspector into the page context so it's accessible from the browser console
 *
 * Note: We can't use inline <script> tags due to WhatsApp's CSP.
 * Instead, we create a blob URL and inject as an external script.
 */
export function injectInspectorIntoPage(): void {
  // Serialize the inspector class code
  const inspectorCode = `
    (function() {
      // Define WhatsAppInspector in page context
      ${whatsappInspector.constructor.toString()}

      // Create instance and expose globally
      window.__whatsappInspector = new WhatsAppInspector();

      console.log('[Page Context] WhatsApp Inspector injected into page');
      console.log('[Page Context] Try: __whatsappInspector.inspectAll()');
    })();
  `

  // Create a blob URL to bypass CSP
  const blob = new Blob([inspectorCode], { type: 'application/javascript' })
  const blobUrl = URL.createObjectURL(blob)

  // Create script element with blob URL (external script, not inline)
  const script = document.createElement('script')
  script.src = blobUrl

  // Inject into the page
  script.onload = () => {
    URL.revokeObjectURL(blobUrl) // Clean up blob URL
    script.remove() // Remove script tag
    // Note: Can't use logger here as this runs in page context without access to logger
    console.log('[Content Script] Inspector successfully injected into page context')
  }

  script.onerror = () => {
    URL.revokeObjectURL(blobUrl)
    script.remove()
    // Note: Can't use logger here as this runs in page context without access to logger
    console.error('[Content Script] Failed to inject inspector into page context')
  }
  ;(document.head || document.documentElement).appendChild(script)
}
