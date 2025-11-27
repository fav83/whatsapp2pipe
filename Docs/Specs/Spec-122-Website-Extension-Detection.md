# Spec-122: Website Extension Detection & Installation Prompt

**Feature:** Website Extension Installation Detection
**Date:** 2025-11-03
**Status:** 📝 Draft (Specification)
**Implementation Status:** ⏳ Not Started
**Dependencies:** Spec-119 (Website Pipedrive Authentication)

---

## Implementation Context

This specification adds extension installation detection to the website dashboard using postMessage communication between the website and a new Chrome extension content script. The feature guides users through the complete product setup by showing whether they have installed the Chrome extension and providing a clear path to the Chrome Web Store.

---

**Related Docs:**
- [Website-Architecture.md](../Architecture/Website-Architecture.md) - Website architecture and technology stack
- [Chrome-Extension-Architecture.md](../Architecture/Chrome-Extension-Architecture.md) - Extension architecture
- [Spec-119-Website-Pipedrive-Auth.md](Spec-119-Website-Pipedrive-Auth.md) - Website OAuth and dashboard

---

## 1. Overview

Implement postMessage-based handshake between the website dashboard and Chrome extension to detect installation status. Display extension status in a card on the dashboard with appropriate call-to-action buttons based on detection result.

**Why this matters:** Users need to install both the website (for account management) AND the Chrome extension (for WhatsApp integration). This feature ensures users are aware of the extension requirement and provides a seamless installation path.

**Architecture Pattern:** Simple postMessage ping/pong with retry logic. Extension content script injected on dashboard domain responds with version metadata. No backend involved.

---

## 2. Objectives

- Detect Chrome extension installation status on website dashboard
- Display installation status to authenticated users
- Provide clear CTA for extension installation (link to Chrome Web Store)
- Support responsive design (desktop and mobile)
- Minimize false negatives with retry logic
- Maintain consistent UI styling with existing dashboard components
- Configure Chrome Web Store URL via environment variables
- Ensure security with origin validation

---

## 3. Architecture Overview

### 3.1 Communication Pattern

**postMessage Handshake:**

```
┌──────────────────────────────────────────────────────────────┐
│                    Website Dashboard                         │
│              (https://app.chat2deal.com)                     │
└──────────────────────────────────────────────────────────────┘
                           │
                           │ window.postMessage()
                           │ { type: 'EXTENSION_PING' }
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│               Chrome Extension Content Script                │
│          (injected on app.chat2deal.com)                     │
│                                                              │
│  Listens: window.addEventListener('message', ...)           │
│  Validates: event.origin === dashboard domain               │
│  Responds: window.postMessage({                             │
│    type: 'EXTENSION_PONG',                                  │
│    version: '0.32.66',                                      │
│    installed: true                                          │
│  })                                                          │
└──────────────────────────────────────────────────────────────┘
                           │
                           │ window.postMessage()
                           │ { type: 'EXTENSION_PONG', version: '...' }
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│                    Website Dashboard                         │
│                                                              │
│  Listens: window.addEventListener('message', ...)           │
│  Validates: event.origin === 'chrome-extension://[id]'      │
│  Updates state: extensionInstalled = true                   │
└──────────────────────────────────────────────────────────────┘
```

### 3.2 Retry Logic

**Timeline:**

```
Page Load
    ↓
T = 0ms: Send EXTENSION_PING (attempt 1)
    ↓
    ├─ Extension responds → Detection success ✓
    │
    └─ No response within 500ms
        ↓
T = 500ms: Send EXTENSION_PING (attempt 2)
    ↓
    ├─ Extension responds → Detection success ✓
    │
    └─ No response
        ↓
T = 1000ms: Detection timeout → Assume NOT installed
```

### 3.3 Component Architecture

**Website (Dashboard):**

```
DashboardPage.tsx
    ↓
    ├── UserProfile.tsx (left column)
    │
    └── ExtensionStatus.tsx (right column, NEW)
            ↓
            useExtensionDetection() hook (NEW)
                ↓
                - Sends EXTENSION_PING on mount
                - Listens for EXTENSION_PONG
                - Returns: { installed: boolean, version: string | null, loading: boolean }
```

**Extension:**

```
manifest.json
    ↓
    content_scripts (NEW entry)
        ↓
        matches: ["http://localhost:3000/*", "https://app.chat2deal.com/*"]
        js: ["dashboard-bridge.js"] (NEW file)
            ↓
            - Listens for EXTENSION_PING
            - Validates origin
            - Responds with EXTENSION_PONG + metadata
```

---

## 4. Detailed Design

### 4.1 Extension Content Script (dashboard-bridge.js)

**Purpose:** Lightweight script injected on dashboard domain that responds to ping messages.

**File Location:** `Extension/src/dashboard-bridge.ts`

**Build Output:** `Extension/dist/dashboard-bridge.js`

**Implementation:**

```typescript
// Extension/src/dashboard-bridge.ts

/**
 * Dashboard Bridge Content Script
 *
 * Lightweight script that runs on the Chat2Deal dashboard domain.
 * Responds to extension detection pings from the website.
 *
 * Security: Validates message origin to prevent unauthorized communication.
 */

const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'https://app.chat2deal.com',
];

// Read version from manifest at build time
const EXTENSION_VERSION = chrome.runtime.getManifest().version;

/**
 * Message listener for extension detection pings
 */
window.addEventListener('message', (event: MessageEvent) => {
  // Validate origin - only respond to messages from dashboard domain
  if (!ALLOWED_ORIGINS.includes(event.origin)) {
    return;
  }

  // Check for ping message
  if (event.data?.type === 'EXTENSION_PING') {
    // Respond immediately with pong + metadata
    window.postMessage(
      {
        type: 'EXTENSION_PONG',
        version: EXTENSION_VERSION,
        installed: true,
      },
      event.origin
    );
  }
});

// Log initialization (development only)
if (import.meta.env.DEV) {
  console.log('[Chat2Deal] Dashboard bridge initialized', EXTENSION_VERSION);
}
```

**Security Considerations:**
- Origin validation prevents responding to malicious websites
- No sensitive data in messages (version is public information)
- Script runs in ISOLATED world (cannot access page variables)
- No DOM manipulation or data collection

**Bundle Size:** ~1 KB (minified)

### 4.2 Extension Manifest Changes

**File:** `Extension/public/manifest.json`

**Changes:**

```json
{
  "content_scripts": [
    // ... existing WhatsApp Web content scripts ...

    // NEW: Dashboard bridge content script
    {
      "matches": [
        "http://localhost:3000/*",
        "https://app.chat2deal.com/*"
      ],
      "js": ["dashboard-bridge.js"],
      "run_at": "document_start"
    }
  ]
}
```

**Rationale:**
- `document_start`: Load as early as possible to catch pings
- Separate entry from WhatsApp scripts (different domain, different purpose)
- Minimal permissions required (no host_permissions needed)

### 4.3 Extension Build Configuration

**File:** `Extension/vite.dashboard-bridge.config.ts` (NEW)

```typescript
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: false, // Don't clear dist/ (other builds use it)
    rollupOptions: {
      input: {
        'dashboard-bridge': resolve(__dirname, 'src/dashboard-bridge.ts'),
      },
      output: {
        entryFileNames: '[name].js',
        format: 'iife', // Self-contained bundle
        inlineDynamicImports: true, // Single file (no chunks)
      },
    },
    sourcemap: true,
  },
});
```

**Build Command Update:**

`Extension/package.json`:

```json
{
  "scripts": {
    "build": "npm run build:content && npm run build:inspector && npm run build:dashboard && npm run build:main",
    "build:dashboard": "vite build --config vite.dashboard-bridge.config.ts --mode production"
  }
}
```

### 4.4 Website Hook: useExtensionDetection

**File:** `Website/src/hooks/useExtensionDetection.ts` (NEW)

```typescript
import { useState, useEffect } from 'react';

export interface ExtensionStatus {
  installed: boolean;
  version: string | null;
  loading: boolean;
}

/**
 * Custom hook to detect Chrome extension installation status
 *
 * Uses postMessage handshake with retry logic:
 * - Attempt 1: Immediate (0ms)
 * - Attempt 2: After 500ms
 * - Timeout: 1000ms total
 *
 * @returns Extension installation status
 */
export function useExtensionDetection(): ExtensionStatus {
  const [status, setStatus] = useState<ExtensionStatus>({
    installed: false,
    version: null,
    loading: true,
  });

  useEffect(() => {
    let timeoutId: number;
    let retryTimeoutId: number;
    let detected = false;

    // Message listener for PONG response
    const handleMessage = (event: MessageEvent) => {
      // Validate origin: Must come from chrome-extension://
      if (!event.origin.startsWith('chrome-extension://')) {
        return;
      }

      // Check for pong message
      if (event.data?.type === 'EXTENSION_PONG' && !detected) {
        detected = true;

        // Clear timeouts
        clearTimeout(timeoutId);
        clearTimeout(retryTimeoutId);

        // Update state
        setStatus({
          installed: true,
          version: event.data.version || null,
          loading: false,
        });

        // Log detection (development only)
        if (import.meta.env.DEV) {
          console.log('[Extension Detection] Detected:', event.data.version);
        }
      }
    };

    // Add message listener
    window.addEventListener('message', handleMessage);

    // Attempt 1: Send ping immediately
    window.postMessage({ type: 'EXTENSION_PING' }, window.location.origin);

    // Attempt 2: Retry after 500ms if not detected
    retryTimeoutId = window.setTimeout(() => {
      if (!detected) {
        window.postMessage({ type: 'EXTENSION_PING' }, window.location.origin);
      }
    }, 500);

    // Timeout: After 1000ms, assume not installed
    timeoutId = window.setTimeout(() => {
      if (!detected) {
        setStatus({
          installed: false,
          version: null,
          loading: false,
        });

        if (import.meta.env.DEV) {
          console.log('[Extension Detection] Timeout - extension not detected');
        }
      }
    }, 1000);

    // Cleanup
    return () => {
      window.removeEventListener('message', handleMessage);
      clearTimeout(timeoutId);
      clearTimeout(retryTimeoutId);
    };
  }, []); // Run once on mount

  return status;
}
```

### 4.5 Website Component: ExtensionStatus

**File:** `Website/src/components/dashboard/ExtensionStatus.tsx` (NEW)

```typescript
import { ExternalLink, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useExtensionDetection } from '@/hooks/useExtensionDetection';

/**
 * Detects mobile/tablet devices based on viewport width
 */
function isMobileDevice(): boolean {
  return window.innerWidth < 768; // Tailwind 'md' breakpoint
}

export function ExtensionStatus() {
  const { installed, version, loading } = useExtensionDetection();
  const isMobile = isMobileDevice();

  // Environment variable for Chrome Web Store URL
  const storeUrl = import.meta.env.VITE_EXTENSION_STORE_URL || '#';

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Chrome Extension</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-500">
            Checking extension status...
          </div>
        </CardContent>
      </Card>
    );
  }

  // Mobile/tablet: Show informational message
  if (isMobile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Chrome Extension</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-gray-600">
            Extension available for desktop Chrome
          </p>
          <a
            href={storeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:underline inline-flex items-center gap-1"
          >
            View in Chrome Web Store
            <ExternalLink className="h-3 w-3" />
          </a>
        </CardContent>
      </Card>
    );
  }

  // Desktop: Extension NOT installed
  if (!installed) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Chrome Extension</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Get started with the Chat2Deal extension
          </p>
          <Button asChild size="lg" className="w-full">
            <a
              href={storeUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Install Extension
              <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Desktop: Extension IS installed
  return (
    <Card>
      <CardHeader>
        <CardTitle>Chrome Extension</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-green-600">
          <CheckCircle2 className="h-5 w-5" />
          <span className="font-medium">Extension installed</span>
        </div>
        {version && (
          <p className="text-xs text-gray-500">Version {version}</p>
        )}
        <a
          href={storeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-gray-500 hover:text-gray-700 inline-flex items-center gap-1"
        >
          View in Chrome Web Store
          <ExternalLink className="h-3 w-3" />
        </a>
      </CardContent>
    </Card>
  );
}
```

### 4.6 Dashboard Layout Changes

**File:** `Website/src/pages/DashboardPage.tsx`

**Changes:**

```typescript
import { ExtensionStatus } from '../components/dashboard/ExtensionStatus'

// ... existing code ...

return (
  <div className="min-h-screen flex flex-col bg-gray-50">
    <Header />

    <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Dashboard
      </h1>

      {/* Two-column responsive grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left column: User Profile */}
        <div>
          {user && <UserProfile user={user} onSignOut={signOut} />}
        </div>

        {/* Right column: Extension Status */}
        <div>
          <ExtensionStatus />
        </div>
      </div>
    </main>
  </div>
)
```

**Responsive Behavior:**
- `grid-cols-1`: Mobile - single column (stacked)
- `md:grid-cols-2`: Desktop - two columns (side-by-side)
- `gap-6`: Consistent spacing between columns

### 4.7 Environment Configuration

**File:** `Website/.env.development`

```bash
VITE_BACKEND_URL=http://localhost:7071
VITE_WEBSITE_URL=http://localhost:3000
VITE_EXTENSION_STORE_URL=https://chrome.google.com/webstore/detail/YOUR_EXTENSION_ID_HERE
```

**File:** `Website/.env.production`

```bash
VITE_BACKEND_URL=https://func-whatsapp2pipe-prod.azurewebsites.net
VITE_WEBSITE_URL=https://app.chat2deal.com
VITE_EXTENSION_STORE_URL=https://chrome.google.com/webstore/detail/YOUR_EXTENSION_ID_HERE
```

**Note:** Replace `YOUR_EXTENSION_ID_HERE` with actual Chrome Web Store extension ID once published.

---

## 5. Security Considerations

### 5.1 Origin Validation

**Website → Extension:**
- Extension content script validates `event.origin` against whitelist
- Only responds to messages from `localhost:3000` or `app.chat2deal.com`
- Prevents malicious websites from probing for extension

**Extension → Website:**
- Website validates `event.origin` starts with `chrome-extension://`
- Ensures response comes from browser extension, not injected script
- Prevents XSS attacks from spoofing extension responses

### 5.2 Message Content

**No Sensitive Data:**
- Extension version is public information (visible in Chrome Web Store)
- No user data, tokens, or session identifiers in messages
- No potential for data leakage

**Simple Protocol:**
- Two message types only: `EXTENSION_PING` and `EXTENSION_PONG`
- No complex parsing or evaluation of message payloads
- Reduces attack surface

### 5.3 Content Script Isolation

**Chrome Extension Security Model:**
- Content script runs in **isolated world** (separate JavaScript context)
- Cannot access page variables or functions
- Cannot be accessed by page scripts
- postMessage is the ONLY communication channel

---

## 6. Edge Cases & Error Handling

### 6.1 Extension Loads After Website

**Scenario:** User has extension installed, but it loads slower than website.

**Solution:** Retry logic (0ms, 500ms) catches late responses.

**Test Case:**
1. Slow down extension loading via Chrome DevTools (throttling)
2. Verify detection succeeds within 500ms retry

### 6.2 Extension Disabled/Uninstalled

**Scenario:** User disables or uninstalls extension while dashboard is open.

**Behavior:** No real-time detection (by design). Detection only occurs on page load.

**User Impact:** Low. User must refresh page to see updated status. Acceptable trade-off for simplicity.

### 6.3 Browser Blocks postMessage

**Scenario:** Browser extension or security software blocks postMessage.

**Behavior:** Detection times out after 1000ms, shows "not installed" state.

**User Impact:** User sees install button even though extension is installed. Clicking button opens Chrome Web Store, which shows "Already installed" message. Minor UX degradation, but not breaking.

### 6.4 Multiple Tabs Open

**Scenario:** User has multiple dashboard tabs open simultaneously.

**Behavior:** Each tab performs independent detection. No interference.

**Performance:** Minimal. Single ping message per tab, ~1ms processing time.

### 6.5 Chrome Web Store Link Invalid

**Scenario:** Environment variable not configured or contains invalid URL.

**Behavior:** Button links to `#` (no-op) or invalid URL (404).

**Mitigation:**
- Default fallback URL in code
- Build-time validation (future enhancement)
- Manual testing before deployment

---

## 7. Testing Strategy

### 7.1 Unit Tests

**Extension (Vitest):**

```typescript
// Extension/tests/dashboard-bridge.test.ts

describe('dashboard-bridge', () => {
  it('responds to EXTENSION_PING from allowed origin', () => {
    // Test postMessage listener
  });

  it('ignores EXTENSION_PING from unauthorized origin', () => {
    // Test origin validation
  });

  it('includes version in EXTENSION_PONG', () => {
    // Test metadata in response
  });
});
```

**Website (Vitest + React Testing Library):**

```typescript
// Website/tests/useExtensionDetection.test.ts

describe('useExtensionDetection', () => {
  it('returns loading state initially', () => {
    // Test initial state
  });

  it('detects extension on first ping', () => {
    // Mock postMessage response
  });

  it('retries after 500ms if no response', () => {
    // Test retry logic with fake timers
  });

  it('times out after 1000ms', () => {
    // Test timeout behavior
  });
});

// Website/tests/ExtensionStatus.test.tsx

describe('ExtensionStatus', () => {
  it('shows loading state while detecting', () => {});

  it('shows install button when not installed', () => {});

  it('shows success message when installed', () => {});

  it('shows mobile message on mobile devices', () => {});
});
```

### 7.2 Integration Tests

**Manual Testing Checklist:**

**Desktop Chrome (Extension Installed):**
- [ ] Dashboard loads
- [ ] Extension status shows "Extension installed" within 1 second
- [ ] Version number displays correctly
- [ ] "View in Chrome Web Store" link opens correct URL in new tab

**Desktop Chrome (Extension NOT Installed):**
- [ ] Dashboard loads
- [ ] Extension status shows "Install Extension" button within 1 second
- [ ] Button opens Chrome Web Store in new tab
- [ ] Chrome Web Store shows extension listing

**Mobile/Tablet:**
- [ ] Dashboard loads
- [ ] Extension status shows "Extension available for desktop Chrome"
- [ ] Chrome Web Store link opens in new tab
- [ ] Layout is responsive (stacked cards on mobile)

**Edge Cases:**
- [ ] Multiple dashboard tabs open → Each detects independently
- [ ] Extension installed mid-session → Status updates after page refresh
- [ ] Network throttling (Slow 3G) → Detection succeeds within timeout
- [ ] Extension disabled → Shows "not installed" (expected)

### 7.3 E2E Tests (Playwright)

```typescript
// Website/e2e/extension-detection.spec.ts

test.describe('Extension Detection', () => {
  test('shows install button when extension not installed', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByRole('button', { name: 'Install Extension' })).toBeVisible();
  });

  // Note: Testing "installed" state requires mocking extension or manual setup
});
```

---

## 8. Performance Considerations

### 8.1 Bundle Size Impact

**Extension:**
- New file: `dashboard-bridge.js` (~1 KB minified)
- Manifest changes: Negligible (~50 bytes)
- **Total extension size increase:** ~1 KB

**Website:**
- New hook: `useExtensionDetection.ts` (~1 KB)
- New component: `ExtensionStatus.tsx` (~2 KB)
- **Total website bundle increase:** ~3 KB

**Impact:** Minimal. Both increases are well within acceptable limits.

### 8.2 Runtime Performance

**Detection Overhead:**
- Two postMessage calls (0ms, 500ms)
- Message listener (event-based, no polling)
- Timeout after 1000ms (automatically cleaned up)

**CPU Impact:** Negligible (<1ms per detection)

**Memory Impact:** Negligible (~100 bytes for state)

**Network Impact:** None (no API calls)

### 8.3 Page Load Impact

**Critical Rendering Path:**
- Detection runs AFTER page paint (useEffect)
- Does not block initial render
- Loading state shown during detection

**Time to Interactive:**
- No impact (detection is async)

---

## 9. Deployment Plan

### 9.1 Phase 1: Extension Changes

**Steps:**
1. Create `Extension/src/dashboard-bridge.ts`
2. Create `Extension/vite.dashboard-bridge.config.ts`
3. Update `Extension/package.json` build scripts
4. Update `Extension/public/manifest.json` content_scripts
5. Test locally: Load unpacked extension, verify detection on localhost:3000
6. Build production: `npm run build`
7. Package: `npm run package`
8. Deploy to Chrome Web Store (via Developer Dashboard)

**Testing:**
- Manual testing on localhost:3000 (development)
- Manual testing on app.chat2deal.com (production)

### 9.2 Phase 2: Website Changes

**Steps:**
1. Create `Website/src/hooks/useExtensionDetection.ts`
2. Create `Website/src/components/dashboard/ExtensionStatus.tsx`
3. Update `Website/src/pages/DashboardPage.tsx` layout
4. Add `VITE_EXTENSION_STORE_URL` to `.env.development` and `.env.production`
5. Test locally: `npm run dev`, verify detection with/without extension
6. Build production: `npm run build`
7. Deploy to Azure Static Web Apps

**Testing:**
- Unit tests: `npm test`
- E2E tests: `npm run test:e2e`
- Manual testing on localhost:3000
- Manual testing on app.chat2deal.com (staging)
- Production smoke test after deployment

### 9.3 Rollback Plan

**If issues arise:**

**Extension:**
1. Revert manifest.json content_scripts change
2. Rebuild and redeploy extension
3. Detection will timeout (shows "not installed") - graceful degradation

**Website:**
1. Revert DashboardPage.tsx changes (remove ExtensionStatus component)
2. Rebuild and redeploy website
3. Dashboard works normally without extension status

**No database changes, no backend changes** - rollback is simple.

---

## 10. Future Enhancements

### 10.1 Real-Time Detection

**Feature:** Detect extension install/uninstall without page refresh.

**Implementation:**
- Add window focus event listener
- Re-run detection when user returns to dashboard tab
- Update state dynamically

**Use Case:** User installs extension while dashboard is open in another tab.

### 10.2 Extension Health Check

**Feature:** Verify extension is functioning correctly, not just installed.

**Implementation:**
- Extend ping/pong protocol to include "health" status
- Extension checks critical functionality (WhatsApp detection, OAuth state)
- Dashboard shows warning if extension is installed but unhealthy

**Use Case:** Extension installed but broken due to permissions issue.

### 10.3 Version Compatibility Check

**Feature:** Warn users if extension version is outdated.

**Implementation:**
- Backend endpoint returns minimum required extension version
- Website compares detected version with minimum
- Show warning banner if version is too old

**Use Case:** User has old extension version that's incompatible with new backend.

### 10.4 Quick Actions

**Feature:** Provide helpful links when extension is installed.

**Implementation:**
- Add "Open WhatsApp Web" button (opens web.whatsapp.com in new tab)
- Add "View Help Docs" link
- Add "Report Issue" link

**Use Case:** Guide users to next steps after confirming extension is installed.

---

## 11. Success Metrics

### 11.1 Technical Metrics

**Detection Accuracy:**
- **Target:** >99% detection accuracy (true positives + true negatives)
- **Measurement:** Compare detection result with Chrome extension API check (manual verification)

**Detection Speed:**
- **Target:** 95th percentile detection time <500ms
- **Measurement:** Log detection timestamps in development mode

**False Negative Rate:**
- **Target:** <1% (extension installed but not detected)
- **Measurement:** User reports + manual testing

### 11.2 User Metrics

**Extension Installation Rate:**
- **Baseline:** Current installation rate (before feature)
- **Target:** +10% increase in installations from dashboard users
- **Measurement:** Track Chrome Web Store referrals from dashboard

**Time to Extension Install:**
- **Target:** Median time from dashboard sign-in to extension install <5 minutes
- **Measurement:** Compare user creation timestamp with first extension session

### 11.3 Monitoring

**Client-Side Logging (Development):**
- Log detection attempts and results
- Log timeout events
- Log origin validation failures

**Analytics (Future):**
- Track extension status (installed/not installed) as dashboard page view property
- Track "Install Extension" button clicks
- Track Chrome Web Store link clicks

---

## 12. Open Questions

1. **Chrome Web Store URL:** Should we link to specific extension page or general Chrome Web Store search? (Decision: Specific page, configured via env var)

2. **Extension Version Display:** Should we show version number to users? (Decision: Yes, helps with support/debugging)

3. **Mobile Detection Method:** User agent string or viewport width? (Decision: Viewport width - more reliable for responsive design)

4. **Retry Count:** Two attempts sufficient, or should we add more? (Decision: Two is sufficient based on testing)

5. **Loading State Duration:** Show loading for full 1000ms or hide immediately after detection? (Decision: Hide immediately for faster feedback)

---

## 13. Acceptance Criteria

**Extension:**
- [ ] `dashboard-bridge.js` content script created
- [ ] Manifest updated with new content_scripts entry for dashboard domains
- [ ] Build configuration updated to bundle dashboard bridge
- [ ] Content script responds to EXTENSION_PING with EXTENSION_PONG + version
- [ ] Origin validation prevents responses to unauthorized domains
- [ ] Script runs on `localhost:3000` and `app.chat2deal.com`
- [ ] Bundle size increase <2 KB

**Website:**
- [ ] `useExtensionDetection` hook created with retry logic
- [ ] `ExtensionStatus` component created with two display states
- [ ] Dashboard layout updated with two-column grid
- [ ] Environment variables configured for Chrome Web Store URL
- [ ] Mobile detection shows appropriate message (no install button)
- [ ] Loading state displays during detection
- [ ] "Not installed" state shows prominent install button
- [ ] "Installed" state shows success message + version + store link
- [ ] Chrome Web Store links open in new tab

**Testing:**
- [ ] Unit tests pass for hook and component
- [ ] Manual testing checklist complete (all scenarios)
- [ ] Detection succeeds within 500ms on desktop
- [ ] Detection times out gracefully after 1000ms when extension not installed
- [ ] No console errors during normal operation
- [ ] Responsive layout works on mobile/tablet

**Documentation:**
- [ ] Spec document complete (this document)
- [ ] BRD updated with Feature 22
- [ ] CLAUDE.md updated with extension detection instructions (if needed)

---

## 14. Related Documentation

- [BRD-001: MVP Pipedrive WhatsApp](../BRDs/BRD-001-MVP-Pipedrive-WhatsApp.md) - Business requirements (Section 6.7)
- [Website-Architecture.md](../Architecture/Website-Architecture.md) - Website architecture and technology stack
- [Chrome-Extension-Architecture.md](../Architecture/Chrome-Extension-Architecture.md) - Extension architecture and build system
- [Spec-119: Website Pipedrive Authentication](Spec-119-Website-Pipedrive-Auth.md) - Website OAuth and dashboard foundation

---

**End of Specification**
