// Content script entry point
// This script runs in the context of WhatsApp Web pages

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import '../styles/content-script.css'

console.log('[Content Script] Loading on WhatsApp Web')

// Wait for DOM to be fully loaded
function init() {
  console.log('[Content Script] Initializing sidebar injection')

  // Check if we're on WhatsApp Web
  if (!window.location.href.includes('web.whatsapp.com')) {
    console.warn('[Content Script] Not on WhatsApp Web, exiting')
    return
  }

  // Create sidebar container
  const sidebarContainer = document.createElement('div')
  sidebarContainer.id = 'pipedrive-whatsapp-sidebar'
  sidebarContainer.style.cssText = `
    position: fixed;
    top: 0;
    right: 0;
    width: 350px;
    height: 100vh;
    z-index: 999999;
    background: white;
    border-left: 1px solid #e0e0e0;
    box-shadow: -2px 0 8px rgba(0,0,0,0.1);
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

  // Test message passing to service worker
  testServiceWorkerConnection()
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

// Wait for WhatsApp to load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init)
} else {
  // DOM already loaded
  setTimeout(init, 1000) // Small delay to ensure WhatsApp is ready
}
