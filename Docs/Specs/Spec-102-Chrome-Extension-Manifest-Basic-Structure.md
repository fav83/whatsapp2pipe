# Spec-102: Chrome Extension Manifest & Basic Structure

**Feature:** Feature 2 - Chrome Extension Manifest & Basic Structure
**Date:** 2025-10-25
**Status:** Draft
**Dependencies:** Feature 1 (Project Foundation & Build Setup)
**Related Docs:**
- [BRD-001-MVP-Pipedrive-WhatsApp.md](../BRDs/BRD-001-MVP-Pipedrive-WhatsApp.md)
- [Chrome-Extension-Architecture.md](../Architecture/Chrome-Extension-Architecture.md)

---

## 1. Overview

Create Chrome Extension Manifest V3 configuration with all required permissions, define extension components (service worker, content script, popup), and implement basic extension loading on WhatsApp Web with minimal "hello world" functionality to verify the architecture.

**Why this matters:** This establishes the foundational Chrome extension architecture and verifies that all components can communicate properly before building complex features. It de-risks integration issues early.

---

## 2. Objectives

- Create valid Manifest V3 configuration
- Implement basic service worker (background script)
- Implement basic content script that loads on WhatsApp Web
- ~~Implement basic popup UI~~ *(Removed - extension has no popup action)*
- Verify extension loads and runs on WhatsApp Web
- Test message passing between components
- Create extension icons

---

## 3. Functional Requirements

### 3.1 Manifest V3 Configuration

**Description:** Create manifest.json with all required permissions and component definitions.

**File Location:** `public/manifest.json`

**Configuration:**

```json
{
  "manifest_version": 3,
  "name": "Chat2deal: Sync your Whatsapp to Pipedrive",
  "short_name": "Chat2deal",
  "version": "0.1.0",
  "description": "Find, create, and link Pipedrive contacts directly from WhatsApp Web conversations.",
  "author": "chat2deal.com",

  "permissions": [
    "storage",
    "tabs",
    "identity"
  ],

  "host_permissions": [
    "*://web.whatsapp.com/*",
    "http://localhost:7071/*",
    "https://api.chat2deal.com/*"
  ],

  "background": {
    "service_worker": "service-worker.js",
    "type": "module"
  },

  "content_scripts": [
    {
      "matches": ["*://web.whatsapp.com/*"],
      "js": ["content-script.js"],
      "css": ["assets/content-script.css"],
      "run_at": "document_idle"
    },
    {
      "matches": ["*://web.whatsapp.com/*"],
      "js": ["inspector-main.js"],
      "run_at": "document_start",
      "world": "MAIN"
    },
    {
      "matches": ["http://localhost:3000/*", "https://app.chat2deal.com/*"],
      "js": ["dashboard-bridge.js"],
      "run_at": "document_start"
    }
  ],

  "icons": {
    "16": "icons/icon16.png",
    "32": "icons/icon32.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  },

  "web_accessible_resources": [
    {
      "resources": ["assets/*", "chunks/*"],
      "matches": ["*://web.whatsapp.com/*"]
    }
  ],

  "content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'self'"
  }
}
```

**Permission Justifications (for Chrome Web Store):**
- **storage:** Store encrypted OAuth tokens and user preferences securely
- **tabs:** Detect WhatsApp Web tab state and manage extension behavior per tab
- **identity:** Enable chrome.identity.launchWebAuthFlow() for Pipedrive OAuth authentication
- **host_permissions (web.whatsapp.com):** Inject sidebar UI and extract chat metadata from WhatsApp Web
- **host_permissions (localhost:7071):** Development backend OAuth service
- **host_permissions (api.chat2deal.com):** Production backend OAuth and Pipedrive API service

**Key Manifest Features:**
- `run_at: "document_idle"` - Wait for WhatsApp to fully load before injection
- `type: "module"` - Allow ES modules in service worker
- `web_accessible_resources` - Allow content script to load React chunks
- CSP policy compliant with Manifest V3

**Acceptance Criteria:**
- [ ] manifest.json exists in public/ folder
- [ ] Extension loads in chrome://extensions without errors
- [ ] All permissions declared with clear purpose
- [ ] Version follows semantic versioning (starts at 0.1.0 for dev)

---

### 3.2 Extension Icons

**Description:** Create placeholder extension icons in required sizes.

**File Locations:**
- `public/icons/icon16.png` - 16×16px
- `public/icons/icon32.png` - 32×32px
- `public/icons/icon48.png` - 48×48px
- `public/icons/icon128.png` - 128×128px

**Icon Design (Placeholder):**
- Simple geometric design (e.g., "PD" letters or Pipedrive logo placeholder)
- Colors: Pipedrive brand green (#00A982) on white/transparent background
- Clear and recognizable at all sizes

**Generation Options:**
1. Manual creation in design tool (Figma, Illustrator)
2. Online icon generator
3. Simple SVG converted to PNG at 3 sizes

**Acceptance Criteria:**
- [ ] All four icon sizes exist (16px, 32px, 48px, 128px)
- [ ] Icons display correctly in chrome://extensions
- [ ] Icons are recognizable at 16px (smallest size)
- [ ] Icons follow Chat2Deal brand guidelines (see [Brand-Guide.md](../Brand-Guide.md))

---

### 3.3 Service Worker (Background Script)

**Description:** Implement basic service worker with lifecycle logging and message handling stub.

**File Location:** `src/service-worker/index.ts`

**Implementation:**

```typescript
// src/service-worker/index.ts

console.log('[Service Worker] Loaded')

// Listen for extension installation
chrome.runtime.onInstalled.addListener((details) => {
  console.log('[Service Worker] Extension installed:', details.reason)

  if (details.reason === 'install') {
    // First-time installation
    console.log('[Service Worker] First install - version', chrome.runtime.getManifest().version)
  } else if (details.reason === 'update') {
    // Extension updated
    console.log('[Service Worker] Updated from', details.previousVersion, 'to', chrome.runtime.getManifest().version)
  }
})

// Listen for messages from content script or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[Service Worker] Received message:', message, 'from', sender.tab ? 'content script' : 'popup')

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
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activated')
})

self.addEventListener('suspend', () => {
  console.log('[Service Worker] Suspending (Manifest V3 idle timeout)')
})

console.log('[Service Worker] Ready')
```

**Testing Utilities:**

```typescript
// src/service-worker/test-utils.ts (for debugging)

export function logStorageContents() {
  chrome.storage.local.get(null, (items) => {
    console.log('[Service Worker] Storage contents:', items)
  })
}

export function clearStorage() {
  chrome.storage.local.clear(() => {
    console.log('[Service Worker] Storage cleared')
  })
}

// Export for console debugging
;(globalThis as any).__serviceWorkerDebug = {
  logStorage: logStorageContents,
  clearStorage: clearStorage
}
```

**Acceptance Criteria:**
- [ ] Service worker loads without errors
- [ ] Installation event fires on first install
- [ ] Console logs visible in chrome://extensions service worker inspector
- [ ] Service worker responds to PING message from content script
- [ ] Service worker stays dormant when idle (Manifest V3 behavior)

---

### 3.4 Content Script - Basic Injection

**Description:** Implement content script that loads on WhatsApp Web and injects a placeholder UI element.

**File Location:** `src/content-script/index.tsx`

**Implementation:**

```typescript
// src/content-script/index.tsx

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
      console.error('[Content Script] Failed to reach service worker:', chrome.runtime.lastError.message)
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
```

**React App Component:**

```typescript
// src/content-script/App.tsx

import React, { useState } from 'react'

export default function App() {
  const [pingCount, setPingCount] = useState(0)

  const handlePing = () => {
    chrome.runtime.sendMessage({ type: 'PING' }, (response) => {
      console.log('Ping response:', response)
      setPingCount((c) => c + 1)
    })
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>
        Pipedrive for WhatsApp
      </h1>

      <div style={{
        padding: '12px',
        background: '#f0f0f0',
        borderRadius: '4px',
        marginBottom: '16px'
      }}>
        <p style={{ fontSize: '14px', margin: 0 }}>
          <strong>Status:</strong> Extension loaded ✓
        </p>
        <p style={{ fontSize: '12px', color: '#666', margin: '8px 0 0 0' }}>
          Version: {chrome.runtime.getManifest().version}
        </p>
      </div>

      <button
        onClick={handlePing}
        style={{
          padding: '8px 16px',
          background: '#00A982',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '14px'
        }}
      >
        Test Service Worker ({pingCount} pings)
      </button>

      <div style={{ marginTop: '16px', fontSize: '12px', color: '#999' }}>
        <p>Next: Sidebar injection, chat detection, Pipedrive auth</p>
      </div>
    </div>
  )
}
```

**Styling (Content Script Isolation):**

```css
/* src/styles/content-script.css */

/* Reset styles for sidebar to prevent WhatsApp CSS conflicts */
#pipedrive-whatsapp-sidebar * {
  all: initial;
  font-family: system-ui, -apple-system, sans-serif;
}

#pipedrive-whatsapp-sidebar {
  /* Sidebar container styles applied via inline styles for specificity */
}
```

**Acceptance Criteria:**
- [ ] Content script loads on web.whatsapp.com
- [ ] Sidebar container injected into DOM
- [ ] React app renders inside sidebar
- [ ] Sidebar visible on right side of screen
- [ ] Test button successfully pings service worker
- [ ] No CSS conflicts with WhatsApp UI
- [ ] Console logs confirm all steps

---

### 3.5 Popup UI - Extension Icon Click *(REMOVED)*

**Note:** The popup UI was removed in commit 496f14b. The extension now operates entirely through the WhatsApp Web sidebar injection and does not have a browser action popup. This simplifies the user experience - users interact with the extension only through the sidebar that appears on WhatsApp Web.

~~Original specification (for reference):~~

**Description:** Implement basic popup that displays when clicking the extension icon.

**File Location:** `src/popup/index.html`

**HTML:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pipedrive for WhatsApp</title>
  <style>
    body {
      width: 300px;
      min-height: 200px;
      margin: 0;
      padding: 0;
      font-family: system-ui, -apple-system, sans-serif;
    }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/popup/index.tsx"></script>
</body>
</html>
```

**React Popup:**

```typescript
// src/popup/index.tsx

import React from 'react'
import ReactDOM from 'react-dom/client'
import PopupApp from './PopupApp'

const root = ReactDOM.createRoot(document.getElementById('root')!)
root.render(
  <React.StrictMode>
    <PopupApp />
  </React.StrictMode>
)
```

```typescript
// src/popup/PopupApp.tsx

import React, { useState, useEffect } from 'react'

export default function PopupApp() {
  const [whatsappTabOpen, setWhatsappTabOpen] = useState(false)
  const [extensionVersion, setExtensionVersion] = useState('')

  useEffect(() => {
    // Get extension version
    setExtensionVersion(chrome.runtime.getManifest().version)

    // Check if WhatsApp Web tab is open
    chrome.tabs.query({ url: '*://web.whatsapp.com/*' }, (tabs) => {
      setWhatsappTabOpen(tabs.length > 0)
    })
  }, [])

  const openWhatsApp = () => {
    chrome.tabs.create({ url: 'https://web.whatsapp.com' })
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <img
          src="/icons/icon48.png"
          alt="Pipedrive WhatsApp"
          style={{ width: '48px', height: '48px' }}
        />
        <h1 style={{ fontSize: '16px', margin: '8px 0 4px 0' }}>
          Pipedrive for WhatsApp
        </h1>
        <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>
          v{extensionVersion}
        </p>
      </div>

      <div style={{
        padding: '12px',
        background: whatsappTabOpen ? '#e8f5e9' : '#fff3e0',
        borderRadius: '4px',
        marginBottom: '16px',
        border: `1px solid ${whatsappTabOpen ? '#4caf50' : '#ff9800'}`
      }}>
        <p style={{ fontSize: '14px', margin: 0 }}>
          {whatsappTabOpen ? (
            <>
              <strong>✓ WhatsApp Web is open</strong>
              <br />
              <span style={{ fontSize: '12px', color: '#666' }}>
                Sidebar active on WhatsApp tabs
              </span>
            </>
          ) : (
            <>
              <strong>WhatsApp Web not detected</strong>
              <br />
              <span style={{ fontSize: '12px', color: '#666' }}>
                Open WhatsApp Web to use this extension
              </span>
            </>
          )}
        </p>
      </div>

      {!whatsappTabOpen && (
        <button
          onClick={openWhatsApp}
          style={{
            width: '100%',
            padding: '10px',
            background: '#00A982',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          Open WhatsApp Web
        </button>
      )}

      <div style={{
        marginTop: '16px',
        paddingTop: '16px',
        borderTop: '1px solid #e0e0e0',
        fontSize: '12px',
        color: '#999'
      }}>
        <p style={{ margin: '4px 0' }}>
          <strong>Status:</strong> Extension loaded
        </p>
        <p style={{ margin: '4px 0' }}>
          <strong>Auth:</strong> Not implemented
        </p>
      </div>
    </div>
  )
}
```

**Acceptance Criteria:**
- [ ] Clicking extension icon opens popup
- [ ] Popup displays extension version
- [ ] Popup detects if WhatsApp Web tab is open
- [ ] "Open WhatsApp Web" button works
- [ ] Popup UI is clean and branded

---

### 3.6 Build Configuration Updates

**Description:** Update Vite config to properly build all extension components.

**Updates to vite.config.ts:**

```typescript
// vite.config.ts (additions/changes)

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { copyFileSync } from 'fs'

export default defineConfig({
  plugins: [
    react(),
    // Copy manifest to dist after build
    {
      name: 'copy-manifest',
      closeBundle() {
        copyFileSync(
          resolve(__dirname, 'public/manifest.json'),
          resolve(__dirname, 'dist/manifest.json')
        )
        console.log('✓ Copied manifest.json to dist/')
      }
    }
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        'content-script': resolve(__dirname, 'src/content-script/index.tsx'),
        'service-worker': resolve(__dirname, 'src/service-worker/index.ts'),
        'popup': resolve(__dirname, 'src/popup/index.html')
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'service-worker') {
            return 'service-worker.js'
          }
          if (chunkInfo.name === 'content-script') {
            return 'content-script.js'
          }
          return 'assets/[name].js'
        },
        chunkFileNames: 'chunks/[name].[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'content-script.css') {
            return 'assets/content-script.css'
          }
          return 'assets/[name].[hash].[ext]'
        }
      }
    },
    sourcemap: process.env.NODE_ENV === 'development'
  },
  // ... rest of config
})
```

**Public folder structure:**
```
public/
├── manifest.json
└── icons/
    ├── icon16.png
    ├── icon32.png
    ├── icon48.png
    └── icon128.png
```

**Build output verification (dist/):**
```
dist/
├── manifest.json
├── service-worker.js
├── content-script.js
├── inspector-main.js
├── dashboard-bridge.js
├── assets/
│   ├── content-script.css
│   └── (other assets)
├── chunks/
│   └── (code-split chunks)
└── icons/
    ├── icon16.png
    ├── icon32.png
    ├── icon48.png
    └── icon128.png
```

**Acceptance Criteria:**
- [ ] `npm run build` produces all required files
- [ ] manifest.json copied to dist/
- [ ] Icons copied to dist/icons/
- [ ] Service worker outputs as service-worker.js (no hash)
- [ ] Content script outputs as content-script.js (no hash)
- [ ] Extension loads from dist/ folder

---

### 3.7 Chrome Storage Test

**Description:** Implement basic test of chrome.storage API to verify permissions.

**Storage Test Utility:**

```typescript
// src/utils/storage-test.ts

export async function testChromeStorage(): Promise<boolean> {
  try {
    // Write test data
    await chrome.storage.local.set({ test_key: 'test_value', timestamp: Date.now() })
    console.log('[Storage Test] Write successful')

    // Read test data
    const result = await chrome.storage.local.get(['test_key', 'timestamp'])
    console.log('[Storage Test] Read successful:', result)

    // Clean up
    await chrome.storage.local.remove(['test_key', 'timestamp'])
    console.log('[Storage Test] Cleanup successful')

    return result.test_key === 'test_value'
  } catch (error) {
    console.error('[Storage Test] Failed:', error)
    return false
  }
}
```

**Integration in Content Script:**

```typescript
// src/content-script/App.tsx (add button)

import { testChromeStorage } from '../utils/storage-test'

// ... in component:

const [storageStatus, setStorageStatus] = useState<'untested' | 'success' | 'failed'>('untested')

const handleStorageTest = async () => {
  const success = await testChromeStorage()
  setStorageStatus(success ? 'success' : 'failed')
}

// ... in JSX:
<button onClick={handleStorageTest}>
  Test Storage ({storageStatus})
</button>
```

**Acceptance Criteria:**
- [ ] Storage write/read/delete works
- [ ] Console logs confirm storage operations
- [ ] Storage test button in sidebar shows success

---

## 4. Non-Functional Requirements

### 4.1 Performance
- Content script injection: < 500ms after WhatsApp loads
- Service worker response time: < 100ms for PING message
- Popup open time: < 200ms

### 4.2 Compatibility
- Chrome version: 120+ (latest Manifest V3 features)
- WhatsApp Web: Current production version (as of 2025-10-25)

### 4.3 Security
- Content Security Policy compliant
- No eval() or inline scripts
- Storage permissions properly scoped

---

## 5. Testing Strategy

### 5.1 Manual Testing Checklist

**Extension Installation:**
- [ ] Load unpacked extension from dist/ folder
- [ ] No errors in chrome://extensions
- [ ] Extension icon appears in toolbar

**Service Worker:**
- [ ] Service worker loads (check in chrome://extensions details)
- [ ] Installation log appears in service worker console
- [ ] Service worker responds to PING from content script

**Content Script on WhatsApp Web:**
- [ ] Navigate to web.whatsapp.com
- [ ] Sidebar appears on right side
- [ ] React app renders with "Test Service Worker" button
- [ ] Clicking button increments ping count
- [ ] Console logs show content script activity

**Popup:**
- [ ] Click extension icon
- [ ] Popup opens with correct UI
- [ ] Shows correct extension version
- [ ] Detects if WhatsApp tab is open
- [ ] "Open WhatsApp Web" button works (if tab not open)

**Storage:**
- [ ] Storage test button in sidebar works
- [ ] Console shows successful storage operations
- [ ] No permission errors

**Message Passing:**
- [ ] Content script can send messages to service worker
- [ ] Service worker can respond to content script
- [ ] No chrome.runtime.lastError messages

### 5.2 Automated Tests

**Unit Tests (Vitest):**

```typescript
// tests/unit/manifest.test.ts
import { describe, it, expect } from 'vitest'
import manifest from '../../public/manifest.json'

describe('Manifest V3 Configuration', () => {
  it('should have correct manifest version', () => {
    expect(manifest.manifest_version).toBe(3)
  })

  it('should have all required permissions', () => {
    expect(manifest.permissions).toContain('storage')
    expect(manifest.permissions).toContain('tabs')
    expect(manifest.permissions).toContain('identity')
  })

  it('should target WhatsApp Web', () => {
    expect(manifest.host_permissions).toContain('*://web.whatsapp.com/*')
  })

  it('should have valid version format', () => {
    expect(manifest.version).toMatch(/^\d+\.\d+\.\d+$/)
  })
})
```

### 5.3 E2E Tests (Playwright)

```typescript
// tests/e2e/basic-extension.spec.ts
import { test, expect, chromium } from '@playwright/test'
import path from 'path'

test('extension loads on WhatsApp Web', async () => {
  const extensionPath = path.resolve(__dirname, '../../dist')

  const context = await chromium.launchPersistentContext('', {
    headless: false,
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`
    ]
  })

  const page = await context.newPage()
  await page.goto('https://web.whatsapp.com')

  // Wait for WhatsApp to load
  await page.waitForTimeout(3000)

  // Check if sidebar was injected
  const sidebar = await page.$('#pipedrive-whatsapp-sidebar')
  expect(sidebar).toBeTruthy()

  // Check if React app rendered
  const heading = await page.textContent('#pipedrive-whatsapp-sidebar h1')
  expect(heading).toContain('Pipedrive for WhatsApp')

  await context.close()
})
```

**Acceptance Criteria:**
- [ ] All unit tests pass
- [ ] E2E test successfully loads extension
- [ ] E2E test verifies sidebar injection

---

## 6. Implementation Plan

### Phase 1: Manifest & Icons (30 minutes)
1. Create manifest.json with all permissions
2. Generate/create placeholder icons
3. Update Vite config to copy manifest and icons

### Phase 2: Service Worker (30 minutes)
4. Implement basic service worker with logging
5. Add message listener for PING
6. Test service worker loads and responds

### Phase 3: Content Script (1 hour)
7. Create content script entry point
8. Implement sidebar container injection
9. Create basic React app component
10. Test sidebar appears on WhatsApp Web

### Phase 4: Popup (30 minutes)
11. Create popup HTML and React app
12. Implement WhatsApp tab detection
13. Test popup opens and works

### Phase 5: Message Passing & Storage (30 minutes)
14. Implement PING/PONG test between components
15. Add storage test utility
16. Verify all communication works

### Phase 6: Testing & Documentation (1 hour)
17. Write unit tests for manifest
18. Write E2E test for extension loading
19. Update README with testing instructions
20. Final verification

**Total Estimated Time:** 4-5 hours

---

## 7. Acceptance Criteria Summary

- [ ] manifest.json valid and complete
- [ ] Extension loads without errors
- [ ] Service worker starts and logs installation
- [ ] Content script injects sidebar on WhatsApp Web
- [ ] React app renders in sidebar
- [ ] Popup opens when clicking extension icon
- [ ] Message passing works (content ↔ service worker)
- [ ] Chrome storage read/write works
- [ ] All three icon sizes present
- [ ] Build produces loadable extension in dist/
- [ ] Unit tests pass
- [ ] E2E test verifies extension loads
- [ ] Console logs confirm all components working

---

## 8. Dependencies & Blockers

**Dependencies:**
- Feature 1 (Project Foundation) must be complete
- Chrome Developer mode enabled
- Access to web.whatsapp.com (not blocked by network)

**Potential Blockers:**
- WhatsApp Web login required for full testing
- Corporate Chrome policies preventing extension loading
- CSP violations requiring manifest adjustments

**Mitigation:**
- Document WhatsApp login requirement
- Provide CSP debugging guide
- Test on personal Chrome profile if corporate restrictions exist

---

## 9. Known Issues & Limitations

**Current Limitations:**
- Sidebar position is fixed (not resizable or collapsible yet)
- No authentication (OAuth not implemented)
- No actual WhatsApp chat detection (just loads on page)
- Sidebar might overlap WhatsApp UI on small screens

**To Be Addressed in Future Features:**
- Feature 3: Sidebar show/hide toggle
- Feature 4: WhatsApp chat detection
- Feature 5: Pipedrive OAuth authentication

---

## 10. Future Considerations

**Post-MVP Enhancements:**
- Dynamic sidebar width/position
- Keyboard shortcuts (Ctrl+Shift+P to toggle)
- Dark mode matching WhatsApp theme
- Extension options page for settings
- Uninstall feedback survey

**Browser Compatibility:**
- Firefox port (Manifest V3 support)
- Edge compatibility (should work with minimal changes)

---

## 11. References

- [Chrome Extension Manifest V3 Migration](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [Content Scripts API](https://developer.chrome.com/docs/extensions/mv3/content_scripts/)
- [Service Workers in Extensions](https://developer.chrome.com/docs/extensions/mv3/service_workers/)
- [chrome.storage API](https://developer.chrome.com/docs/extensions/reference/storage/)
- [chrome.runtime messaging](https://developer.chrome.com/docs/extensions/mv3/messaging/)
- [Debugging Extensions](https://developer.chrome.com/docs/extensions/mv3/tut_debugging/)
