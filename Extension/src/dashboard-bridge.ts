/**
 * Dashboard Bridge Content Script
 *
 * Lightweight script that runs on the Chat2Deal dashboard domain.
 * Responds to extension detection pings from the website.
 *
 * Security: Validates message origin to prevent unauthorized communication.
 */

const ALLOWED_ORIGINS = ['http://localhost:3000', 'https://app.chat2deal.com']

// Read version from manifest at runtime
const EXTENSION_VERSION = chrome.runtime.getManifest().version

// Always log initialization for debugging
console.log('[Chat2Deal Extension] Dashboard bridge initialized', EXTENSION_VERSION)
console.log('[Chat2Deal Extension] Listening for messages on:', window.location.href)
console.log('[Chat2Deal Extension] Allowed origins:', ALLOWED_ORIGINS)

/**
 * Message listener for extension detection pings
 */
window.addEventListener('message', (event: MessageEvent) => {
  console.log('[Chat2Deal Extension] Received message:', {
    origin: event.origin,
    type: event.data?.type,
    nonce: event.data?.nonce,
    allowed: ALLOWED_ORIGINS.includes(event.origin),
  })

  // Validate origin - only respond to messages from dashboard domain
  if (!ALLOWED_ORIGINS.includes(event.origin)) {
    return
  }

  // Check for ping message with nonce
  if (event.data?.type === 'EXTENSION_PING' && event.data?.nonce) {
    console.log(
      '[Chat2Deal Extension] Responding with PONG, version:',
      EXTENSION_VERSION,
      'nonce:',
      event.data.nonce
    )

    // Respond immediately with pong + metadata + echoed nonce
    window.postMessage(
      {
        type: 'EXTENSION_PONG',
        nonce: event.data.nonce, // Echo back the nonce for verification
        version: EXTENSION_VERSION,
        installed: true,
      },
      event.origin
    )
  }
})
