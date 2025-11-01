# Spec-114: Sentry Error Tracking Integration

**Feature:** Feature 14 - Sentry Error Tracking Integration
**Date:** 2025-11-01
**Status:** Draft
**Dependencies:** Feature 12 (UI States & Error Handling - Spec-112), Feature 6 (Pipedrive API Service Layer), Feature 8 (Authentication UI State)

---

## 1. Overview

This specification defines the integration of Sentry error tracking into the Chrome extension to provide **production debugging and hotfix capabilities**. The integration follows Sentry's **shared environment best practices** to avoid polluting WhatsApp Web's global state while capturing comprehensive error information with strict privacy protections.

### 1.1 Scope

**In Scope:**
- Sentry SDK integration with manual BrowserClient + Scope pattern (no global pollution)
- Comprehensive error capture: all errors, critical warnings, API failures
- Strict PII redaction (phone numbers, names, emails, tokens, JIDs)
- Manual breadcrumbs for user action tracking (standard detail level)
- Integration with existing errorLogger.ts (dual logging: console + Sentry)
- Source map generation and manual upload process
- Automatic version tagging from manifest.json
- Environment differentiation (development/production tags)
- 100% error sampling (capture all errors)
- Content script and service worker monitoring

**Out of Scope:**
- Performance monitoring and transaction tracing (disabled)
- User analytics or behavioral tracking
- Custom dashboards or alerting rules (use Sentry defaults)
- Automated deployment/CI integration (manual uploads for MVP)
- Popup monitoring (minimal/unused component)
- Automatic integrations (GlobalHandlers, BrowserApiErrors, Breadcrumbs)

### 1.2 Primary Goal

**Production Debugging & Hotfixes** - Enable rapid identification and resolution of bugs that reach production by capturing high-fidelity error information with full reproduction context.

### 1.3 Integration with Existing Infrastructure

This feature **extends** Feature 12 (UI States & Error Handling) by adding remote error tracking:

- **Keeps** existing `errorLogger.ts` console logging (dual logging approach)
- **Leverages** existing Error Boundary and global error handlers
- **Adds** Sentry SDK alongside, not replacing, current error infrastructure
- **Both systems work in parallel**: console for local debugging, Sentry for production

---

## 2. Technical Architecture

### 2.1 Sentry SDK Installation & Configuration

**Package:**
```bash
npm install @sentry/browser --save
```

**Version:** Latest stable (@sentry/browser ^8.x)

**Bundle Size Impact:** ~30-35KB gzipped (acceptable for error tracking benefits)

### 2.2 Content Script Initialization (Shared Environment)

**Location:** `Extension/src/content-script/sentry.ts` (new file)

**Implementation:**
```typescript
import { BrowserClient, Scope, defaultStackParser, makeFetchTransport } from '@sentry/browser'
import { sanitizeEvent } from '../utils/sentryFilters'

// Create isolated Sentry client (does NOT pollute global state)
const sentryClient = new BrowserClient({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  enabled: import.meta.env.VITE_SENTRY_ENABLED === 'true',
  environment: import.meta.env.VITE_ENV || 'development',
  release: chrome.runtime.getManifest().version,

  // Critical: Disable all automatic integrations for shared environments
  integrations: [],

  // Manual error capture only
  transport: makeFetchTransport,
  stackParser: defaultStackParser,

  // PII filtering
  beforeSend: sanitizeEvent,

  // No performance monitoring
  tracesSampleRate: 0,

  // 100% error sampling
  sampleRate: 1.0,
})

// Create isolated scope
const sentryScope = new Scope()
sentryScope.setClient(sentryClient)

// Initialize client
sentryClient.init()

// Set default tags
sentryScope.setTag('context', 'content-script')
sentryScope.setTag('extension_id', chrome.runtime.id)

// Export for use in errorLogger
export { sentryClient, sentryScope }
```

**Key Points:**
- Uses `BrowserClient` + `Scope` instead of `Sentry.init()` (no global pollution)
- `integrations: []` disables all automatic integrations
- No GlobalHandlers, BrowserApiErrors, or Breadcrumbs integrations
- Completely isolated from WhatsApp Web's global state

### 2.3 Service Worker Initialization (Isolated Context)

**Location:** `Extension/src/service-worker/sentry.ts` (new file)

**Implementation:**
```typescript
import { BrowserClient, Scope, defaultStackParser, makeFetchTransport } from '@sentry/browser'
import { sanitizeEvent } from '../utils/sentryFilters'

// Service worker is isolated, but use same pattern for consistency
const sentryClient = new BrowserClient({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  enabled: import.meta.env.VITE_SENTRY_ENABLED === 'true',
  environment: import.meta.env.VITE_ENV || 'development',
  release: chrome.runtime.getManifest().version,

  integrations: [],
  transport: makeFetchTransport,
  stackParser: defaultStackParser,

  beforeSend: sanitizeEvent,
  tracesSampleRate: 0,
  sampleRate: 1.0,
})

const sentryScope = new Scope()
sentryScope.setClient(sentryClient)
sentryClient.init()

sentryScope.setTag('context', 'service-worker')
sentryScope.setTag('extension_id', chrome.runtime.id)

export { sentryClient, sentryScope }
```

**Why Same Pattern:**
- Consistency across both contexts
- Easier to maintain
- Service worker could theoretically conflict with other extensions
- Manual capture gives us more control

### 2.4 Shared Environment Best Practices

**Critical Requirements** (from Sentry documentation):

1. **Don't use `Sentry.init()`** - Pollutes global state, causes cross-contamination
2. **Use manual client + scope** - `new BrowserClient()` + `new Scope()`
3. **Disable automatic integrations** - `integrations: []`
4. **Manual error capture only** - `scope.captureException()`, `scope.addBreadcrumb()`
5. **No global handlers** - We handle errors manually via errorLogger.ts

**Why This Matters:**
- WhatsApp Web may use Sentry themselves (unknown)
- Using `Sentry.init()` in content script could contaminate their error tracking
- Our errors could end up in WhatsApp's Sentry project, or vice versa
- Manual client/scope approach ensures complete isolation

---

## 3. PII Filtering & Data Sanitization

### 3.1 PII Categories to Redact

**Strict redaction** of all personally identifiable information:

1. **Phone Numbers** - All formats: +48123456789, 48123456789, (123) 456-7890, etc.
2. **Person Names** - First name, last name, full name
3. **Email Addresses** - Any email pattern
4. **WhatsApp JIDs** - Since they contain phone numbers (e.g., 48123123123@c.us)
5. **OAuth Tokens** - verification_code, access_token, refresh_token
6. **Pipedrive API Keys** - Any API credentials

### 3.2 Sanitization Implementation

**Location:** `Extension/src/utils/sentryFilters.ts` (new file)

**Implementation:**
```typescript
import type { Event, EventHint } from '@sentry/browser'

// PII redaction patterns
const PHONE_PATTERN = /[\+\(]?[0-9]{1,4}[\)\-\s]?[(]?[0-9]{1,3}[)]?[\-\s]?[0-9]{1,4}[\-\s]?[0-9]{1,4}[\-\s]?[0-9]{1,9}/g
const EMAIL_PATTERN = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
const JID_PATTERN = /[0-9]{10,15}@c\.us/g
const TOKEN_PATTERN = /(verification_code|access_token|refresh_token|bearer)\s*[:=]\s*[^\s,}]+/gi

/**
 * Recursively sanitize object/array/string values
 */
function sanitizeValue(value: any): any {
  if (typeof value === 'string') {
    return value
      .replace(PHONE_PATTERN, '[PHONE_REDACTED]')
      .replace(EMAIL_PATTERN, '[EMAIL_REDACTED]')
      .replace(JID_PATTERN, '[JID_REDACTED]')
      .replace(TOKEN_PATTERN, '$1: [TOKEN_REDACTED]')
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeValue)
  }

  if (value && typeof value === 'object') {
    const sanitized: any = {}
    for (const [key, val] of Object.entries(value)) {
      // Redact entire value if key suggests sensitive data
      if (/phone|email|name|token|jid|password|secret/i.test(key)) {
        sanitized[key] = '[REDACTED]'
      } else {
        sanitized[key] = sanitizeValue(val)
      }
    }
    return sanitized
  }

  return value
}

/**
 * beforeSend handler for Sentry
 * Strips all PII from error events before sending
 */
export function sanitizeEvent(event: Event, hint?: EventHint): Event | null {
  // Sanitize error message
  if (event.message) {
    event.message = sanitizeValue(event.message)
  }

  // Sanitize exception values
  if (event.exception?.values) {
    event.exception.values = event.exception.values.map(exception => ({
      ...exception,
      value: exception.value ? sanitizeValue(exception.value) : exception.value,
    }))
  }

  // Sanitize breadcrumbs
  if (event.breadcrumbs) {
    event.breadcrumbs = event.breadcrumbs.map(breadcrumb => ({
      ...breadcrumb,
      message: breadcrumb.message ? sanitizeValue(breadcrumb.message) : breadcrumb.message,
      data: breadcrumb.data ? sanitizeValue(breadcrumb.data) : breadcrumb.data,
    }))
  }

  // Sanitize contexts (extra data)
  if (event.contexts) {
    event.contexts = sanitizeValue(event.contexts)
  }

  // Sanitize request data
  if (event.request) {
    event.request = sanitizeValue(event.request)
  }

  // Sanitize extra data
  if (event.extra) {
    event.extra = sanitizeValue(event.extra)
  }

  return event
}
```

### 3.3 Sanitization Approach

**Strategy:** Strict redaction (replace with `[REDACTED]`) instead of hashing

**Rationale:**
- Public Chrome extension must meet highest privacy standards
- GDPR compliance requires minimizing PII exposure
- Hash-based pseudonymization still reveals patterns
- Strict redaction eliminates all PII exposure risk
- Debugging is still possible with context (error type, stack trace, breadcrumbs)

---

## 4. Breadcrumbs (User Action Tracking)

### 4.1 Breadcrumb Strategy

Following Sentry's shared environment best practices, we'll use **manual breadcrumbs only** (no automatic Breadcrumbs integration).

**Breadcrumb Utility Location:** `Extension/src/utils/breadcrumbs.ts` (new file)

**Implementation:**
```typescript
import type { Breadcrumb } from '@sentry/browser'
import type { sentryScope } from '../content-script/sentry'

/**
 * Log a breadcrumb for user action tracking
 * Only records if Sentry is enabled
 */
export function logBreadcrumb(
  message: string,
  category: string,
  data?: Record<string, any>,
  scope?: typeof sentryScope
): void {
  if (!scope || import.meta.env.VITE_SENTRY_ENABLED !== 'true') {
    return
  }

  const breadcrumb: Breadcrumb = {
    message,
    category,
    level: 'info',
    timestamp: Date.now() / 1000,
    data: data || {},
  }

  scope.addBreadcrumb(breadcrumb)
}
```

### 4.2 Breadcrumb Categories & Events

**Standard breadcrumbs** (actions + UI interactions):

**Authentication Flow:**
- `auth.sign_in_clicked` - User clicked "Sign in with Pipedrive"
- `auth.sign_in_success` - OAuth flow completed successfully
- `auth.sign_in_failed` - OAuth flow failed
- `auth.sign_out` - User signed out

**Chat Detection:**
- `whatsapp.chat_switched` - User switched to different chat (data: chatType)
- `whatsapp.chat_detected` - 1:1 chat detected with phone number
- `whatsapp.group_chat` - Group chat detected (unsupported)
- `whatsapp.no_phone` - 1:1 chat without phone number

**Person Lookup:**
- `pipedrive.lookup_started` - Auto-lookup initiated
- `pipedrive.lookup_matched` - Person found in Pipedrive
- `pipedrive.lookup_no_match` - No person found
- `pipedrive.lookup_failed` - API error during lookup

**Person Creation:**
- `ui.create_person_clicked` - User clicked "Create Person" button
- `ui.create_person_form_opened` - Create form displayed
- `ui.create_person_submitted` - Form submitted
- `pipedrive.create_person_success` - Person created successfully
- `pipedrive.create_person_failed` - Creation failed

**Attach Phone Flow:**
- `ui.attach_phone_clicked` - User clicked "Attach to Existing"
- `ui.attach_search_started` - Name search initiated (data: query)
- `ui.attach_person_selected` - Person selected from results
- `pipedrive.attach_phone_success` - Phone attached successfully
- `pipedrive.attach_phone_failed` - Attachment failed

**UI Interactions:**
- `ui.open_in_pipedrive` - User clicked "Open in Pipedrive" link
- `ui.retry_clicked` - User clicked retry on error state
- `ui.form_validated` - Form validation triggered (data: errors)

**API Calls:**
- `api.request_started` - API request initiated (data: endpoint, method)
- `api.request_success` - API request succeeded (data: statusCode)
- `api.request_failed` - API request failed (data: statusCode, errorMessage)

### 4.3 Breadcrumb Detail Level

**Standard** - Actions + UI interactions (not full state changes)

**Rationale:**
- Balance between context and noise
- Major actions provide sufficient reproduction steps
- UI interactions help understand user intent
- Full state tracking would be too verbose (100-item limit)
- PII filtering would redact most detailed data anyway

---

## 5. Integration with errorLogger.ts

### 5.1 Enhanced errorLogger Implementation

**Location:** `Extension/src/utils/errorLogger.ts` (modify existing)

**Current Implementation:**
```typescript
export function logError(
  context: string,
  error: unknown,
  additionalContext?: ErrorContext
): void {
  const timestamp = new Date().toISOString()
  const version = chrome.runtime.getManifest().version

  const errorMessage = error instanceof Error ? error.message : String(error)
  const stackTrace = error instanceof Error ? error.stack : undefined

  console.error(
    `[chat2deal-pipe][${timestamp}][${version}] ${context}: ${errorMessage}`,
    stackTrace || '',
    additionalContext || {}
  )
}
```

**Enhanced Implementation:**
```typescript
import type { sentryScope } from '../content-script/sentry'

export function logError(
  context: string,
  error: unknown,
  additionalContext?: ErrorContext,
  scope?: typeof sentryScope // Optional: passed from content-script or service-worker
): void {
  const timestamp = new Date().toISOString()
  const version = chrome.runtime.getManifest().version

  const errorMessage = error instanceof Error ? error.message : String(error)
  const stackTrace = error instanceof Error ? error.stack : undefined

  // Always log to console (development debugging)
  console.error(
    `[chat2deal-pipe][${timestamp}][${version}] ${context}: ${errorMessage}`,
    stackTrace || '',
    additionalContext || {}
  )

  // Also send to Sentry if enabled and scope provided
  if (scope && import.meta.env.VITE_SENTRY_ENABLED === 'true') {
    // Skip expected errors
    const skipSentry =
      additionalContext?.statusCode === 404 || // Person not found
      context.includes('Form validation') ||    // Validation errors
      context.includes('User cancelled')        // User actions

    if (!skipSentry) {
      scope.setContext('error_context', {
        context,
        timestamp,
        version,
        ...additionalContext,
      })

      if (error instanceof Error) {
        scope.captureException(error)
      } else {
        scope.captureMessage(`${context}: ${String(error)}`, 'error')
      }
    }
  }
}
```

**Usage Pattern:**
```typescript
// Content script
import { sentryScope } from './sentry'
logError('React component error', error, { componentStack }, sentryScope)

// Service worker
import { sentryScope } from './sentry'
logError('API request failed', error, { endpoint: '/api/person' }, sentryScope)
```

### 5.2 Errors NOT Sent to Sentry

**Intentional exclusions** (to reduce noise):

1. **404 errors from person lookup** - Expected state, not a bug
2. **User cancellation** - User explicitly closed OAuth popup
3. **Expected validation errors** - Form validation failures
4. **Rate limiting (429)** - Expected behavior under heavy usage (logged but not as error)

---

## 6. Error Capture Integration Points

### 6.1 Error Boundary Integration

**Location:** `Extension/src/content-script/components/ErrorBoundary.tsx` (modify existing)

**Enhanced Implementation:**
```typescript
import { sentryScope } from '../sentry'
import { logBreadcrumb } from '../../utils/breadcrumbs'

componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
  logBreadcrumb(
    'React component crashed',
    'react.error_boundary',
    { componentStack: errorInfo.componentStack?.slice(0, 500) }, // Truncate for brevity
    sentryScope
  )

  logError('React component error', error, {
    componentStack: errorInfo.componentStack,
    url: window.location.href
  }, sentryScope) // Pass scope to logError
}
```

### 6.2 Global Error Handlers Integration

**Content Script Global Handlers**

**Location:** `Extension/src/content-script/index.tsx` (modify existing)

```typescript
import { sentryScope } from './sentry'

window.addEventListener('error', (event: ErrorEvent) => {
  logError('Uncaught error', event.error, {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    url: window.location.href
  }, sentryScope)
})

window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
  logError('Unhandled promise rejection', event.reason, {
    promise: event.promise,
    url: window.location.href
  }, sentryScope)
})
```

**Service Worker Global Handlers**

**Location:** `Extension/src/service-worker/index.ts` (modify existing)

```typescript
import { sentryScope } from './sentry'

self.addEventListener('error', (event: ErrorEvent) => {
  logError('Service Worker uncaught error', event.error, {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno
  }, sentryScope)
})

self.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
  logError('Service Worker unhandled promise rejection', event.reason, {
    promise: event.promise
  }, sentryScope)
})
```

### 6.3 API Error Capture

**Location:** `Extension/src/service-worker/pipedriveApiService.ts` (modify existing)

**Enhanced makeRequest() Method:**
```typescript
import { logError } from '../utils/errorLogger'
import { logBreadcrumb } from '../utils/breadcrumbs'
import { sentryScope } from './sentry'

private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  try {
    logBreadcrumb(
      'API request started',
      'api.request_started',
      { endpoint, method: options.method || 'GET' },
      sentryScope
    )

    const verificationCode = await this.getVerificationCode()
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${verificationCode}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      const statusCode = response.status
      let errorMessage: string

      switch (statusCode) {
        case 401:
          await chrome.storage.local.remove('verification_code')
          errorMessage = 'Authentication expired. Please sign in again.'
          break
        case 404:
          errorMessage = 'Person not found'
          break
        case 429:
          errorMessage = 'Too many requests. Please try again in a moment.'
          break
        case 500:
          errorMessage = 'Server error. Please try again later.'
          break
        default:
          errorMessage = 'An error occurred. Please try again.'
      }

      // Log API errors to Sentry (except 404 - expected state)
      if (statusCode !== 404) {
        logBreadcrumb(
          'API request failed',
          'api.request_failed',
          { endpoint, statusCode, errorMessage },
          sentryScope
        )

        logError('API request failed', new Error(errorMessage), {
          endpoint,
          statusCode,
          method: options.method || 'GET',
        }, sentryScope)
      }

      throw { statusCode, message: errorMessage }
    }

    logBreadcrumb(
      'API request success',
      'api.request_success',
      { endpoint, statusCode: response.status },
      sentryScope
    )

    return response.json()

  } catch (error) {
    // If error is already structured (thrown from response.ok check), re-throw
    if (typeof error === 'object' && error !== null && 'statusCode' in error) {
      throw error
    }

    // Network error - log to Sentry
    logBreadcrumb(
      'API network error',
      'api.network_error',
      { endpoint, errorMessage: error.message },
      sentryScope
    )

    logError('Network error', error, {
      endpoint,
      method: options.method || 'GET',
    }, sentryScope)

    throw {
      statusCode: 0,
      message: 'Unable to connect. Check your internet connection.'
    }
  }
}
```

---

## 7. Environment Configuration

### 7.1 Environment Variables

**Development Environment** (`.env.development`):

```bash
# Sentry Configuration
VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
VITE_SENTRY_ENABLED=true
VITE_ENV=development

# Backend OAuth Service
VITE_BACKEND_URL=http://localhost:7071

# Dev Indicator
VITE_SHOW_DEV_INDICATOR=true
```

**Production Environment** (`.env.production`):

```bash
# Sentry Configuration
VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
VITE_SENTRY_ENABLED=true
VITE_ENV=production

# Backend OAuth Service
VITE_BACKEND_URL=https://your-backend-url.azurewebsites.net

# Dev Indicator
VITE_SHOW_DEV_INDICATOR=false
```

**Local Override** (`.env.local` - optional, gitignored):

```bash
# Use this to override settings during local development
# Example: Disable Sentry locally while testing
VITE_SENTRY_ENABLED=false

# Or use a different Sentry project for local testing
VITE_SENTRY_DSN=https://different-dsn@sentry.io/test-project
```

### 7.2 TypeScript Type Definitions

**Location:** `Extension/src/vite-env.d.ts` (extend existing)

```typescript
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SENTRY_DSN: string
  readonly VITE_SENTRY_ENABLED: string
  readonly VITE_ENV: 'development' | 'production'
  readonly VITE_BACKEND_URL: string
  readonly VITE_SHOW_DEV_INDICATOR: string
  readonly DEV: boolean
  readonly PROD: boolean
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

### 7.3 Sentry Project Setup

**Sentry Dashboard Configuration:**

1. **Create Sentry Project:**
   - Platform: JavaScript
   - Project name: `whatsapp2pipe`
   - Team: (your team)

2. **Project Settings:**
   - Enable: "Enhanced Privacy" mode
   - Data Scrubbing: Enable default scrubbers (credit cards, SSNs, etc.)
   - IP Addresses: Set to "Prevent Storing IP Addresses"
   - Security & Privacy → Sensitive Data: Add custom patterns for phone numbers

3. **Inbound Filters:**
   - **CRITICAL**: Go to Project Settings → Inbound Filters
   - **DISABLE** "Filter out errors known to be caused by browser extensions"
   - Reason: Our extension IS a browser extension, so we need these events

4. **Alerts (Optional):**
   - New issue created: Email notification
   - Issue frequency spike: Email if issue goes from 0 to 10+ in 1 hour
   - Unhandled exceptions: Immediate email for critical errors

5. **Environments:**
   - Default environments: `development`, `production`
   - Filter by environment in Issues dashboard

---

## 8. Source Maps & Release Tracking

### 8.1 Vite Source Map Configuration

**Location:** `Extension/vite.config.ts` (modify existing)

**Add source map generation for production:**

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // ... existing config

  build: {
    sourcemap: true, // Generate source maps for production

    rollupOptions: {
      // ... existing rollupOptions
    }
  },

  // ... rest of config
})
```

**Output:**
- `content-script.js.map`
- `service-worker.js.map`

**Security Note:** Source maps are NOT included in the Chrome extension bundle. They're generated in `dist/` but only uploaded to Sentry separately.

### 8.2 Manual Source Map Upload Process

**After building for production:**

```bash
# Step 1: Build extension with source maps
cd Extension
npm run build

# Step 2: Verify source maps exist
ls dist/*.map
# Should see: content-script.js.map, service-worker.js.map

# Step 3: Install Sentry CLI (one-time setup)
npm install -g @sentry/cli

# Step 4: Authenticate Sentry CLI (one-time setup)
# Get auth token from: Sentry → Settings → Account → API → Auth Tokens
sentry-cli login

# Step 5: Upload source maps
sentry-cli releases new <version>
sentry-cli releases files <version> upload-sourcemaps ./dist --ext map --ext js
sentry-cli releases finalize <version>

# Example for version 1.0.0:
sentry-cli releases new 1.0.0
sentry-cli releases files 1.0.0 upload-sourcemaps ./dist --ext map --ext js
sentry-cli releases finalize 1.0.0
```

**Where `<version>` comes from:**
- Read from `Extension/public/manifest.json` → `version` field
- Must match exactly what's sent in Sentry events (auto-read from manifest at runtime)

### 8.3 Automated Source Map Upload Script (Optional)

**Location:** `Extension/scripts/upload-sourcemaps.sh` (new file)

```bash
#!/bin/bash
set -e

# Read version from manifest.json
VERSION=$(node -p "require('./public/manifest.json').version")

echo "📦 Uploading source maps for version $VERSION..."

# Create release in Sentry
sentry-cli releases new "$VERSION"

# Upload source maps
sentry-cli releases files "$VERSION" upload-sourcemaps ./dist \
  --ext map \
  --ext js \
  --rewrite

# Finalize release
sentry-cli releases finalize "$VERSION"

echo "✅ Source maps uploaded successfully for version $VERSION"
```

**Make executable:**
```bash
chmod +x scripts/upload-sourcemaps.sh
```

**Usage:**
```bash
# After npm run build
npm run upload-sourcemaps

# Or manually
./scripts/upload-sourcemaps.sh
```

**Add to package.json:**
```json
{
  "scripts": {
    "upload-sourcemaps": "./scripts/upload-sourcemaps.sh"
  }
}
```

### 8.4 Release Tracking in Sentry

**Automatic release tagging** (already implemented in sentry initialization):

```typescript
// Extension/src/content-script/sentry.ts
const sentryClient = new BrowserClient({
  // ...
  release: chrome.runtime.getManifest().version, // e.g., "1.0.0"
  // ...
})
```

**Sentry Dashboard Benefits:**
- "First seen in this release" badge on issues
- Release comparison: which version introduced a bug
- Deploy tracking: correlate errors with specific versions
- Regression detection: issues that reappear in new releases

---

## 9. Testing Strategy

### 9.1 Unit Tests for PII Filtering

**Location:** `Extension/tests/unit/sentryFilters.test.ts` (new file)

**Coverage:**
- Phone number redaction (all formats)
- Email redaction
- WhatsApp JID redaction
- Token redaction (verification_code, access_token, bearer)
- Nested object/array sanitization
- Sensitive key detection (phone, email, name, token)

**Test Example:**
```typescript
it('redacts phone numbers from error messages', () => {
  const event = { message: 'Lookup failed for +48123456789' }
  const sanitized = sanitizeEvent(event)
  expect(sanitized.message).toBe('Lookup failed for [PHONE_REDACTED]')
})
```

### 9.2 Integration Tests for Error Capture

**Location:** `Extension/tests/integration/sentry-integration.test.ts` (new file)

**Coverage:**
- errorLogger sends to both console and Sentry
- Error objects → captureException
- String errors → captureMessage
- 404 errors excluded from Sentry
- Breadcrumb utility adds breadcrumbs correctly
- Sentry disabled when scope not provided

### 9.3 Manual Testing Checklist

**Development Environment Testing:**
- [ ] Sentry initialization (no errors in console)
- [ ] Error capture (appears in Sentry dashboard within 30s)
- [ ] PII filtering (phone/email/name redacted)
- [ ] Breadcrumbs (user journey visible)

**Production Environment Testing:**
- [ ] Production build with source maps
- [ ] Source map upload process
- [ ] Production errors show readable stack traces
- [ ] Environment tag shows "production"

**Shared Environment Isolation:**
- [ ] No `window.Sentry` global (check console)
- [ ] No `window.__SENTRY__` global
- [ ] Extension errors only in our Sentry project

**Specific Error Scenarios:**
- [ ] React Error Boundary crash
- [ ] API errors (500, network failure)
- [ ] Global handlers (uncaught error, unhandled rejection)
- [ ] Service worker errors

### 9.4 Performance Testing

- [ ] Bundle size impact (~30-35KB increase acceptable)
- [ ] No runtime performance degradation
- [ ] Memory stable after 30 minutes usage

### 9.5 Edge Case Testing

- [ ] Sentry service unavailable (extension continues working)
- [ ] Rate limiting (100+ errors in succession)
- [ ] Multiple tabs (all errors captured correctly)

---

## 10. Implementation Plan

### Phase 1: Core Setup & PII Filtering (2 hours)

1. Install Sentry SDK: `npm install @sentry/browser`
2. Create `Extension/src/utils/sentryFilters.ts`
3. Write PII filtering unit tests
4. Verify all PII patterns caught

**Files Created:**
- `Extension/src/utils/sentryFilters.ts`
- `Extension/tests/unit/sentryFilters.test.ts`

### Phase 2: Sentry Client Initialization (1.5 hours)

6. Create `Extension/src/content-script/sentry.ts`
7. Create `Extension/src/service-worker/sentry.ts`
8. Configure with `integrations: []`
9. Import `sanitizeEvent` as `beforeSend`
10. Set version, environment, tags

**Files Created:**
- `Extension/src/content-script/sentry.ts`
- `Extension/src/service-worker/sentry.ts`

### Phase 3: Breadcrumbs Utility (1 hour)

12. Create `Extension/src/utils/breadcrumbs.ts`
13. Add TypeScript types
14. Write unit tests

**Files Created:**
- `Extension/src/utils/breadcrumbs.ts`
- `Extension/tests/unit/breadcrumbs.test.ts`

### Phase 4: Enhanced errorLogger Integration (1.5 hours)

16. Modify `Extension/src/utils/errorLogger.ts`
17. Add Sentry capture logic
18. Add exclusion logic (404, validation)
19. Write integration tests

**Files Modified:**
- `Extension/src/utils/errorLogger.ts`

**Files Created:**
- `Extension/tests/integration/sentry-integration.test.ts`

### Phase 5: Error Boundary Integration (30 minutes)

21. Import `sentryScope` in ErrorBoundary
22. Add breadcrumb in `componentDidCatch`
23. Pass scope to `logError()`

**Files Modified:**
- `Extension/src/content-script/components/ErrorBoundary.tsx`

### Phase 6: Global Error Handlers Integration (30 minutes)

25. Modify content script global handlers
26. Modify service worker handlers
27. Pass `sentryScope` to all `logError()` calls

**Files Modified:**
- `Extension/src/content-script/index.tsx`
- `Extension/src/service-worker/index.ts`

### Phase 7: API Error Capture (1 hour)

30. Modify `pipedriveApiService.ts`
31. Add breadcrumbs for API lifecycle
32. Add error capture (except 404)

**Files Modified:**
- `Extension/src/service-worker/pipedriveApiService.ts`

### Phase 8: Breadcrumb Integration Points (2 hours)

36. Add breadcrumbs to auth flow
37. Add breadcrumbs to chat detection
38. Add breadcrumbs to person lookup/create/attach
39. Add breadcrumbs to UI interactions

**Files Modified:**
- `Extension/src/content-script/hooks/useAuth.ts`
- `Extension/src/content-script/services/authService.ts`
- `Extension/src/content-script/whatsapp-integration/chat-monitor-main.ts`
- `Extension/src/content-script/hooks/usePipedrive.ts`
- `Extension/src/content-script/components/PersonNoMatchState.tsx`
- `Extension/src/content-script/components/PersonMatchedCard.tsx`

### Phase 9: Environment Configuration (30 minutes)

43. Add Sentry DSN to `.env.development` and `.env.production`
44. Extend `vite-env.d.ts`
45. Create Sentry project
46. Disable browser extension filter

**Files Modified:**
- `Extension/.env.development`
- `Extension/.env.production`
- `Extension/src/vite-env.d.ts`

### Phase 10: Source Maps Setup (1 hour)

49. Modify `vite.config.ts` (sourcemap: true)
50. Install Sentry CLI
51. Create upload script
52. Test upload process

**Files Modified:**
- `Extension/vite.config.ts`
- `Extension/package.json`

**Files Created:**
- `Extension/scripts/upload-sourcemaps.sh`

### Phase 11: Testing & Verification (3 hours)

56. Run all unit tests
57. Run integration tests
58. Manual testing: development, production, isolation
59. Performance testing
60. Edge case testing

### Phase 12: Documentation (1 hour)

64. Create this spec document
65. Update Plan-001
66. Update CLAUDE.md

**Total Estimated Time:** 14-16 hours

---

## 11. Acceptance Criteria

### 11.1 Sentry Integration Setup

- [ ] **AC-1:** @sentry/browser installed (~30-35KB)
- [ ] **AC-2:** Content script uses BrowserClient + Scope
- [ ] **AC-3:** Service worker uses BrowserClient + Scope
- [ ] **AC-4:** Both use `integrations: []`
- [ ] **AC-5:** `sanitizeEvent` as `beforeSend`
- [ ] **AC-6:** Version from manifest.json
- [ ] **AC-7:** Environment tag from VITE_ENV
- [ ] **AC-8:** Extension ID tagged
- [ ] **AC-9:** Context tag differentiates scripts

### 11.2 PII Filtering

- [ ] **AC-10:** Phone numbers redacted (all formats)
- [ ] **AC-11:** Email addresses redacted
- [ ] **AC-12:** WhatsApp JIDs redacted
- [ ] **AC-13:** OAuth tokens redacted
- [ ] **AC-14:** Person names redacted
- [ ] **AC-15:** Recursive sanitization works
- [ ] **AC-16:** Sensitive keys redacted
- [ ] **AC-17:** All PII filtering tests pass

### 11.3 Error Capture

- [ ] **AC-18:** Error Boundary errors captured
- [ ] **AC-19:** Global uncaught errors captured
- [ ] **AC-20:** Unhandled rejections captured
- [ ] **AC-21:** Service worker errors captured
- [ ] **AC-22:** API errors captured (401, 429, 500)
- [ ] **AC-23:** Network errors captured (statusCode: 0)
- [ ] **AC-24:** 404 errors NOT captured
- [ ] **AC-25:** Validation errors NOT captured
- [ ] **AC-26:** User cancellation NOT captured

### 11.4 Breadcrumbs

- [ ] **AC-27:** Auth flow breadcrumbs
- [ ] **AC-28:** Chat detection breadcrumbs
- [ ] **AC-29:** Person lookup breadcrumbs
- [ ] **AC-30:** Create Person breadcrumbs
- [ ] **AC-31:** Attach Phone breadcrumbs
- [ ] **AC-32:** UI interaction breadcrumbs
- [ ] **AC-33:** API request breadcrumbs
- [ ] **AC-34:** Breadcrumbs have correct format
- [ ] **AC-35:** Respect 100-item limit
- [ ] **AC-36:** Only sent when enabled

### 11.5 Dual Logging

- [ ] **AC-37:** Console logging in all environments
- [ ] **AC-38:** Sentry when enabled + scope provided
- [ ] **AC-39:** Console keeps [chat2deal-pipe] prefix
- [ ] **AC-40:** Sentry includes all context
- [ ] **AC-41:** Both systems work in parallel

### 11.6 Shared Environment Isolation

- [ ] **AC-42:** No `window.Sentry` global
- [ ] **AC-43:** No `window.__SENTRY__` global
- [ ] **AC-44:** Manual BrowserClient + Scope pattern
- [ ] **AC-45:** No automatic integrations
- [ ] **AC-46:** Manual error capture only
- [ ] **AC-47:** No errors in WhatsApp's tracking

### 11.7 Environment Configuration

- [ ] **AC-48:** DSN in both .env files
- [ ] **AC-49:** ENABLED=true in both
- [ ] **AC-50:** TypeScript types defined
- [ ] **AC-51:** Sentry project created
- [ ] **AC-52:** Browser extension filter disabled
- [ ] **AC-53:** Events visible with correct tags

### 11.8 Source Maps & Releases

- [ ] **AC-54:** Vite generates source maps
- [ ] **AC-55:** Upload script created
- [ ] **AC-56:** Source maps uploaded with release
- [ ] **AC-57:** Production stack traces readable
- [ ] **AC-58:** Source maps NOT in bundle
- [ ] **AC-59:** Release matches manifest version
- [ ] **AC-60:** Dashboard shows release info

### 11.9 Testing

- [ ] **AC-61:** PII filtering tests pass (100%)
- [ ] **AC-62:** Breadcrumb tests pass
- [ ] **AC-63:** Integration tests pass
- [ ] **AC-64:** Manual testing complete
- [ ] **AC-65:** No global pollution verified
- [ ] **AC-66:** Bundle size acceptable
- [ ] **AC-67:** No performance degradation

### 11.10 Documentation

- [ ] **AC-68:** Spec document created
- [ ] **AC-69:** Plan-001 updated
- [ ] **AC-70:** CLAUDE.md updated
- [ ] **AC-71:** Source map upload documented
- [ ] **AC-72:** Testing checklist documented
- [ ] **AC-73:** Troubleshooting guide included

---

## 12. Design Decisions & Rationale

### 12.1 Why Manual BrowserClient + Scope?

**Decision:** Use `new BrowserClient()` and `new Scope()` instead of `Sentry.init()`

**Rationale:** Chrome extensions run in shared environment (WhatsApp Web). `Sentry.init()` pollutes global state and could cross-contaminate with WhatsApp's own error tracking. Manual client/scope provides complete isolation.

### 12.2 Why Disable All Automatic Integrations?

**Decision:** `integrations: []`

**Rationale:** Sentry docs warn automatic integrations rely on global state. GlobalHandlers would conflict with WhatsApp. Manual capture gives full control.

### 12.3 Why Dual Logging?

**Decision:** Keep console.error AND send to Sentry

**Rationale:** Development needs console (immediate feedback), production needs remote tracking. Both serve different purposes.

### 12.4 Why Strict PII Redaction?

**Decision:** Replace with `[REDACTED]` instead of hashing

**Rationale:** Public extension must meet highest privacy standards. GDPR compliance. User trust more important than marginal debugging benefit.

### 12.5 Why 100% Error Sampling?

**Decision:** `sampleRate: 1.0`

**Rationale:** Primary goal is bug detection. Missing critical bugs unacceptable. Small user base initially. Can adjust later.

### 12.6 Why No Performance Monitoring?

**Decision:** `tracesSampleRate: 0`

**Rationale:** Primary goal is error debugging. Performance monitoring adds overhead and complexity. Not needed for MVP.

### 12.7 Why Exclude 404 Errors?

**Decision:** Don't capture 404 "Person not found"

**Rationale:** Expected user flow, not a bug. Would create noise. UI handles gracefully.

### 12.8 Why Standard Breadcrumbs?

**Decision:** Actions + UI interactions (not full state)

**Rationale:** Balance context vs noise. Sufficient for reproduction. 100-item limit.

### 12.9 Why Same Sentry Project?

**Decision:** Same DSN for dev & prod, differentiate by tag

**Rationale:** Simplifies setup. Easy filtering. Both environments use same code.

### 12.10 Why Manual Source Map Upload?

**Decision:** Manual script after build

**Rationale:** No CI/CD yet. Aligns with manual release workflow. Can automate later.

---

## 13. Troubleshooting Guide

### 13.1 Errors Not Appearing in Sentry

**Symptoms:** Error triggered, nothing in Sentry

**Possible Causes:**
- VITE_SENTRY_ENABLED=false
- Invalid DSN
- Error excluded by filter (404, validation)
- Browser extension inbound filter enabled

**Resolution:**
- Check .env: VITE_SENTRY_ENABLED=true
- Verify DSN correct
- Check exclusion logic in logError()
- Disable browser extension filter in Sentry

### 13.2 Source Maps Not Working

**Symptoms:** Minified code in stack traces

**Possible Causes:**
- Source maps not uploaded
- Version mismatch
- Release not finalized

**Resolution:**
- Verify dist/*.map files exist
- Re-upload with correct version
- Check manifest.json version matches

### 13.3 PII Leaking

**Symptoms:** Phone/email visible in Sentry

**Possible Causes:**
- Regex doesn't match format
- PII in unexpected location
- beforeSend not applied

**Resolution:**
- Update regex patterns
- Add unit test for format
- Check event structure

### 13.4 Too Many Events

**Symptoms:** Quota exceeded

**Possible Causes:**
- Error storm
- Development errors counted

**Resolution:**
- Fix underlying bug
- Lower sampleRate to 0.5
- Filter development environment

### 13.5 Performance Degraded

**Symptoms:** Extension slow

**Possible Causes:**
- Too many breadcrumbs
- Large payloads
- Blocking requests

**Resolution:**
- Throttle breadcrumbs
- Limit context size
- Verify async requests

### 13.6 Global Pollution

**Symptoms:** Multiple Sentry instances warning

**Possible Causes:**
- Used Sentry.init() instead of BrowserClient
- Conflict with WhatsApp

**Resolution:**
- Verify BrowserClient + Scope pattern
- Check window.Sentry === undefined
- Ensure integrations: []

---

## 14. Future Enhancements (Post-MVP)

### 14.1 Advanced PII Filtering
- Hash-based correlation
- Smart redaction (partial info)

### 14.2 Performance Monitoring
- API response times
- React component performance

### 14.3 Advanced Breadcrumbs
- Network breadcrumbs
- State change tracking

### 14.4 Alerting & Notifications
- Slack integration
- Custom alert rules

### 14.5 User Feedback Integration
- Report issue widget
- User context enrichment

### 14.6 Session Replay
- Visual error reproduction
- DOM snapshot recording

### 14.7 Release Health Tracking
- Crash-free sessions
- Adoption rate monitoring

### 14.8 CI/CD Integration
- Automated source map upload
- GitHub Actions integration

---

## 15. Known Limitations

### 15.1 Bundle Size Impact
~30-35KB increase (acceptable trade-off)

### 15.2 Shared Environment Constraints
Cannot use automatic integrations

### 15.3 PII Filtering Edge Cases
Regex may miss unusual formats

### 15.4 Source Map Upload
Manual process, can be forgotten

### 15.5 Sentry Service Availability
Extension continues if Sentry down

### 15.6 Rate Limiting
Errors dropped during severe storms

### 15.7 Network Overhead
HTTP request per error (minimal impact)

### 15.8 Privacy Regulations
GDPR considerations (mitigated by strict PII redaction)

---

## 16. References

### 16.1 Related Documents

- [Plan-001-MVP-Feature-Breakdown.md](../Plans/Plan-001-MVP-Feature-Breakdown.md) - Feature 14
- [Spec-112-UI-States-Error-Handling.md](Spec-112-UI-States-Error-Handling.md) - Feature 12
- [Chrome-Extension-Architecture.md](../Architecture/Chrome-Extension-Architecture.md) - Architecture
- [BRD-001-MVP-Pipedrive-WhatsApp.md](../BRDs/BRD-001-MVP-Pipedrive-WhatsApp.md) - Privacy requirements

### 16.2 External References

- [Sentry JavaScript SDK Documentation](https://docs.sentry.io/platforms/javascript/)
- [Sentry Best Practices for Shared Environments](https://docs.sentry.io/platforms/javascript/best-practices/shared-environments/)
- [Sentry Chrome Extension Guide](https://docs.sentry.io/platforms/javascript/guides/chrome-extension/)
- [Sentry Source Maps Documentation](https://docs.sentry.io/platforms/javascript/sourcemaps/)
- [Sentry CLI Documentation](https://docs.sentry.io/cli/)
- [Sentry beforeSend Hook](https://docs.sentry.io/platforms/javascript/configuration/filtering/#using-beforesend)

### 16.3 Code References

- `Extension/src/utils/errorLogger.ts` - Feature 12 error logging
- `Extension/src/content-script/components/ErrorBoundary.tsx` - Error Boundary
- `Extension/src/content-script/index.tsx` - Global handlers
- `Extension/src/service-worker/index.ts` - Service worker handlers
- `Extension/src/service-worker/pipedriveApiService.ts` - API error handling

---

**End of Specification**
