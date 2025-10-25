// Service worker (background script) entry point
// Handles Chrome extension lifecycle and background tasks

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
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
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

  // Future: Handle OAuth requests here
  if (message.type === 'AUTH_REQUEST') {
    sendResponse({ type: 'AUTH_NOT_IMPLEMENTED', message: 'OAuth flow not yet implemented' })
    return true
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
