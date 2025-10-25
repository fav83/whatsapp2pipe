// Content script entry point
// This script runs in the context of WhatsApp Web pages

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { waitForWhatsAppLoad } from './whatsapp-loader'
import '../styles/content-script.css'

console.log('[Content Script] Loading on WhatsApp Web')

// Initialize sidebar after WhatsApp is fully loaded
async function init() {
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

  // Render React app into sidebar
  const root = ReactDOM.createRoot(sidebarContainer)
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )

  console.log('[Content Script] React app rendered')

  // Test message passing to service worker (development mode)
  if (import.meta.env.DEV) {
    testServiceWorkerConnection()
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
