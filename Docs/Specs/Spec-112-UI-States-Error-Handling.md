# Spec-112: UI States & Error Handling

**Feature:** Feature 12 - UI States & Error Handling
**Date:** 2025-10-31
**Status:** ✅ Complete
**Dependencies:** All previous features (1-11), particularly Feature 6 (Pipedrive API Service Layer), Feature 8 (Authentication UI State), and Feature 9 (Person Auto-Lookup Flow)

---

## 1. Overview

This specification defines the defensive error handling infrastructure that completes the extension's reliability layer. While Features 9-11 implemented specific error states for user-facing operations (person lookup, creation, attachment), Feature 12 adds **safety nets** for unexpected failures: React component crashes, global JavaScript errors, initialization failures, and enhanced network error detection.

### 1.1 Scope

**In Scope:**
- React Error Boundary component wrapping entire `<App />`
- Global error handlers for content script (uncaught errors, unhandled promise rejections)
- Global error handlers for service worker (same events in different context)
- Try-catch wrapper for sidebar initialization function
- Network error detection and differentiation in service worker
- Automatic sign-out on 401 authentication errors
- Structured error logging utility with consistent format
- Enhanced error messages for connection failures

**Out of Scope:**
- User-facing error analytics/telemetry (Feature 14 - Sentry)
- Error recovery strategies beyond retry buttons
- Custom error pages or elaborate fallback UIs
- Error prevention (input sanitization, schema validation)
- Backend error handling (separate Azure Functions concern)
- Proactive monitoring or alerting

### 1.2 Scope Clarification: What's Already Implemented

**✅ Already Complete (Features 9-11):**
- User-facing error states for specific operations (PersonLookupError, error banners in forms)
- Retry mechanisms (user clicks retry button)
- User-friendly error messages from API (401, 404, 429, 500)
- Graceful degradation (API methods return null/[] on errors)
- Loading states for async operations
- Error state management in React hooks (usePipedrive, useAuth)

**🆕 New in Feature 12:**
- **Defensive layers** catching errors that escape component-level handling
- **Global safety nets** preventing silent failures or complete crashes
- **Structured logging** providing diagnostics for production issues
- **Auto-recovery** for authentication expiration
- **Network vs API error differentiation** for better user guidance

---

## 2. Objectives

- **Prevent catastrophic failures** - Never leave user with completely broken sidebar
- **Provide diagnostic data** - Log all errors with rich context for debugging production issues
- **Maintain simplicity** - Minimal UI complexity, focus on reliability over elaborate error UX
- **Enable recovery** - Auto-signout on 401, clear error messages guide user actions
- **Differentiate error types** - Network failures vs API errors require different user responses
- **Establish standards** - Consistent error logging format across all contexts

---

## 3. Component Specifications

### 3.1 React Error Boundary Component

**Purpose:** Catch unhandled React component errors (render errors, lifecycle errors, event handler errors in child components) and display fallback UI instead of crashing entire sidebar.

**Location:** `Extension/src/content-script/components/ErrorBoundary.tsx` (new file)

**Implementation:** Class component (Error Boundaries must be class components in React)

**Interface:**
```typescript
interface ErrorBoundaryProps {
  children: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}
```

**Lifecycle Methods:**
```typescript
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state to render fallback UI
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error with structured format
    logError('React component error', error, {
      componentStack: errorInfo.componentStack,
      url: window.location.href
    })
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback onReset={() => window.location.reload()} />
    }
    return this.props.children
  }
}
```

### 3.2 Error Fallback UI Component

**Purpose:** Display user-friendly error message when Error Boundary catches an error.

**Location:** `Extension/src/content-script/components/ErrorBoundary.tsx` (same file as boundary)

**Design:**
```
┌─────────────────────────────────────────────┐
│                                             │
│  Pipedrive                                  │  ← Header (unchanged)
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│                  ⚠️                          │  ← Error icon
│                                             │
│   Something went wrong with the             │
│   Pipedrive sidebar                         │
│                                             │
│   ┌─────────────────────────────────────┐   │
│   │      Reload Page                    │   │  ← Single action button
│   └─────────────────────────────────────┘   │
│                                             │
└─────────────────────────────────────────────┘
```

**UI Specifications:**
- Centered vertically and horizontally in sidebar
- WhatsApp color scheme (gray text, green button)
- Error icon: ⚠️ (warning triangle emoji or SVG)
- Message: "Something went wrong with the Pipedrive sidebar"
- Button: "Reload Page" (calls `window.location.reload()`)
- Button styling: Same as other primary buttons (WhatsApp green)

**Interface:**
```typescript
interface ErrorFallbackProps {
  onReset: () => void
}

function ErrorFallback({ onReset }: ErrorFallbackProps) {
  return (
    <div className="h-full flex flex-col items-center justify-center px-8 text-center">
      <div className="text-5xl mb-4">⚠️</div>
      <p className="text-[#667781] text-sm mb-6">
        Something went wrong with the Pipedrive sidebar
      </p>
      <button
        onClick={onReset}
        className="px-6 py-2 bg-[#00a884] text-white text-sm font-medium rounded-lg hover:bg-[#008f6f] transition-colors"
      >
        Reload Page
      </button>
    </div>
  )
}
```

### 3.3 Error Boundary Integration

**Location:** `Extension/src/content-script/index.tsx`

**Before:**
```typescript
const root = ReactDOM.createRoot(sidebarContainer)
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

**After:**
```typescript
import { ErrorBoundary } from './components/ErrorBoundary'

const root = ReactDOM.createRoot(sidebarContainer)
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
)
```

---

## 4. Global Error Handlers

### 4.1 Content Script Global Error Handlers

**Purpose:** Catch errors that escape all other error handling (bugs, unexpected failures, third-party script conflicts).

**Location:** `Extension/src/content-script/index.tsx` (before `init()` call)

**Implementation:**
```typescript
// Add after imports, before init() function

// Global error handler for uncaught errors
window.addEventListener('error', (event: ErrorEvent) => {
  logError('Uncaught error', event.error, {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    url: window.location.href
  })
})

// Global handler for unhandled promise rejections
window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
  logError('Unhandled promise rejection', event.reason, {
    promise: event.promise,
    url: window.location.href
  })
})
```

**Behavior:**
- Log only - no user notification
- No UI changes
- Extension continues running normally
- Provides diagnostics for bugs that slip through testing

### 4.2 Service Worker Global Error Handlers

**Purpose:** Same as content script handlers, but for service worker context (OAuth flows, API calls, message handling).

**Location:** `Extension/src/service-worker/index.ts` (after imports, before message listeners)

**Implementation:**
```typescript
// Add after imports, before runtime.onInstalled listener

// Global error handler for uncaught errors
self.addEventListener('error', (event: ErrorEvent) => {
  logError('Service Worker uncaught error', event.error, {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno
  })
})

// Global handler for unhandled promise rejections
self.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
  logError('Service Worker unhandled promise rejection', event.reason, {
    promise: event.promise
  })
})
```

**Note:** Service workers use `self` instead of `window`.

---

## 5. Initialization Error Handling

### 5.1 Sidebar Init Function Error Handling

**Purpose:** Catch failures during sidebar initialization (WhatsApp DOM structure changed, React mounting failed, extension conflicts).

**Location:** `Extension/src/content-script/index.tsx`

**Before:**
```typescript
async function init() {
  console.log('[Content Script] Waiting for WhatsApp Web to load...')
  await waitForWhatsAppLoad()
  // ... DOM manipulation and React mounting
}
```

**After:**
```typescript
async function init() {
  try {
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
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </React.StrictMode>
    )

    console.log('[Content Script] React app rendered')

    // Test message passing to service worker (development mode)
    if (import.meta.env.DEV) {
      testServiceWorkerConnection()
    }

  } catch (error) {
    // Log with full context
    logError('Failed to initialize sidebar', error, {
      url: window.location.href
    })
  }
}
```

**Behavior:**
- If any step fails, catch and log
- No user notification (silent failure)
- Sidebar simply doesn't appear
- Error details in console help debugging

---

## 6. Network Error Detection

### 6.1 Enhanced Error Detection in Service Worker

**Purpose:** Differentiate network failures (no internet, DNS failure, timeout) from API errors (401, 500, etc.) to provide better user guidance.

**Location:** `Extension/src/service-worker/pipedriveApiService.ts`

**Current `makeRequest()` Method:**
```typescript
private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const verificationCode = await this.getVerificationCode()

  const response = await fetch(`${this.baseUrl}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${verificationCode}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  // Handle HTTP errors
  if (!response.ok) {
    const statusCode = response.status
    let errorMessage: string

    switch (statusCode) {
      case 401:
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

    throw { statusCode, message: errorMessage }
  }

  return response.json()
}
```

**Enhanced Version:**
```typescript
private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  try {
    const verificationCode = await this.getVerificationCode()

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${verificationCode}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    // Handle HTTP errors
    if (!response.ok) {
      const statusCode = response.status
      let errorMessage: string

      switch (statusCode) {
        case 401:
          // Clear authentication on 401
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

      throw { statusCode, message: errorMessage }
    }

    return response.json()

  } catch (error) {
    // If error is already structured (thrown from response.ok check), re-throw
    if (typeof error === 'object' && error !== null && 'statusCode' in error) {
      throw error
    }

    // Otherwise, this is a network error (fetch threw before getting response)
    throw {
      statusCode: 0,
      message: 'Unable to connect. Check your internet connection.'
    }
  }
}
```

**Key Changes:**
1. Wrap entire method in try-catch
2. If `fetch()` throws (network error) → statusCode: 0, connection message
3. If HTTP error (response.ok === false) → existing error messages
4. On 401 error → automatically clear `verification_code` from storage

### 6.2 Error Code Semantics

**statusCode: 0** → Network failure
- No internet connection
- DNS resolution failed
- Request timeout
- CORS blocked (unlikely in extension context)
- Message: "Unable to connect. Check your internet connection."

**statusCode: 401** → Authentication expired
- verification_code invalid or expired
- Session cleared from backend
- Message: "Authentication expired. Please sign in again."
- **Automatic action:** Clear verification_code, return to sign-in screen

**statusCode: 404** → Resource not found
- Person doesn't exist (rare, should be caught earlier)
- Message: "Person not found"

**statusCode: 429** → Rate limit exceeded
- Too many API requests in short time
- Message: "Too many requests. Please try again in a moment."

**statusCode: 500** → Server error
- Backend or Pipedrive API failure
- Message: "Server error. Please try again later."

**statusCode: 400, other** → Generic error
- Invalid request, unknown error
- Message: "An error occurred. Please try again."

---

## 7. Automatic Sign-out on 401

### 7.1 Behavior

**Current State:** 401 errors throw error message but leave user on current screen with broken state.

**New Behavior:**
1. Service worker detects 401 in `makeRequest()`
2. Clears `verification_code` from `chrome.storage.local`
3. Storage change event triggers in all content scripts
4. `useAuth` hook listeners detect change
5. All sidebars transition to `authState: 'unauthenticated'`
6. User sees WelcomeState (sign-in screen)

### 7.2 Implementation

**Service Worker (pipedriveApiService.ts):**
```typescript
case 401:
  // Clear authentication on 401
  await chrome.storage.local.remove('verification_code')
  errorMessage = 'Authentication expired. Please sign in again.'
  break
```

**Content Script (useAuth.ts):**
Already implemented - storage listener automatically updates state:
```typescript
// Listen for storage changes (e.g., sign-in in another tab)
useEffect(() => {
  const handleStorageChange = (
    changes: { [key: string]: chrome.storage.StorageChange },
    areaName: string
  ) => {
    if (areaName === 'local' && changes.verification_code) {
      const newValue = changes.verification_code.newValue

      if (newValue) {
        setVerificationCode(newValue)
        setAuthState('authenticated')
      } else {
        // ← This triggers on 401 auto-signout
        setVerificationCode(null)
        setAuthState('unauthenticated')
      }
    }
  }

  chrome.storage.onChanged.addListener(handleStorageChange)
  return () => chrome.storage.onChanged.removeListener(handleStorageChange)
}, [])
```

**User Experience:**
- User is looking at PersonMatchedCard
- API call returns 401 (session expired)
- Service worker clears verification_code
- Sidebar immediately transitions to WelcomeState
- User clicks "Sign in with Pipedrive"
- After OAuth, returns to normal operation

---

## 8. Structured Error Logging

### 8.1 Logging Utility

**Purpose:** Consistent error logging format across all contexts (Error Boundary, global handlers, init errors).

**Location:** `Extension/src/utils/errorLogger.ts` (new file)

**Interface:**
```typescript
interface ErrorContext {
  [key: string]: any
}

/**
 * Logs error with structured format
 *
 * Format: [chat2deal-pipe][timestamp][version] context: errorMessage
 *
 * @param context - Where error occurred (e.g., "Failed to initialize sidebar")
 * @param error - Error object or message
 * @param additionalContext - Extra data (URL, component stack, etc.)
 */
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

### 8.2 Usage Examples

**Error Boundary:**
```typescript
componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
  logError('React component error', error, {
    componentStack: errorInfo.componentStack,
    url: window.location.href
  })
}
```

**Global Error Handler:**
```typescript
window.addEventListener('error', (event: ErrorEvent) => {
  logError('Uncaught error', event.error, {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    url: window.location.href
  })
})
```

**Init Error:**
```typescript
catch (error) {
  logError('Failed to initialize sidebar', error, {
    url: window.location.href
  })
}
```

**Service Worker Error:**
```typescript
self.addEventListener('error', (event: ErrorEvent) => {
  logError('Service Worker uncaught error', event.error, {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno
  })
})
```

### 8.3 Log Format Example

**Console Output:**
```
[chat2deal-pipe][2025-10-31T14:23:45.123Z][1.0.0] React component error: Cannot read property 'name' of null
  at PersonMatchedCard.tsx:42:15
  at ... (stack trace)
  { componentStack: "in PersonMatchedCard...", url: "https://web.whatsapp.com" }

[chat2deal-pipe][2025-10-31T14:24:12.456Z][1.0.0] Failed to initialize sidebar: Cannot find element #app
  at init (index.tsx:24)
  { url: "https://web.whatsapp.com" }

[chat2deal-pipe][2025-10-31T14:25:33.789Z][1.0.0] Uncaught error: Unexpected token < in JSON
  at response.json() (pipedriveApiService.ts:68)
  { message: "...", filename: "content-script.js", lineno: 1234, colno: 56, url: "https://web.whatsapp.com" }
```

**Information Captured:**
- **Prefix:** `[chat2deal-pipe]` - identifies extension logs
- **Timestamp:** ISO format with milliseconds
- **Version:** Extension version (helps identify version-specific bugs)
- **Context:** Human-readable description of where error occurred
- **Error Message:** Actual error message
- **Stack Trace:** Full stack trace for debugging
- **Additional Context:** URL, component stack, filename, line numbers, etc.

---

## 9. Testing Strategy

### 9.1 Unit Tests

**Error Boundary Tests:**
```typescript
// Extension/tests/unit/ErrorBoundary.test.tsx

describe('ErrorBoundary', () => {
  it('renders children when no error', () => {
    render(
      <ErrorBoundary>
        <div>Test Content</div>
      </ErrorBoundary>
    )
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('renders fallback UI when error thrown', () => {
    const ThrowError = () => {
      throw new Error('Test error')
    }

    // Suppress console.error for this test
    const consoleError = jest.spyOn(console, 'error').mockImplementation()

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    )

    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /reload page/i })).toBeInTheDocument()

    consoleError.mockRestore()
  })

  it('calls window.location.reload on button click', () => {
    const reloadMock = vi.fn()
    Object.defineProperty(window.location, 'reload', {
      value: reloadMock,
      writable: true
    })

    const ThrowError = () => {
      throw new Error('Test error')
    }

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    )

    const button = screen.getByRole('button', { name: /reload page/i })
    fireEvent.click(button)

    expect(reloadMock).toHaveBeenCalled()
  })

  it('logs error with structured format', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation()

    const ThrowError = () => {
      throw new Error('Test error')
    }

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    )

    expect(consoleError).toHaveBeenCalledWith(
      expect.stringContaining('[chat2deal-pipe]'),
      expect.any(String),
      expect.objectContaining({ componentStack: expect.any(String) })
    )

    consoleError.mockRestore()
  })
})
```

**Error Logger Tests:**
```typescript
// Extension/tests/unit/errorLogger.test.ts

describe('errorLogger', () => {
  it('logs with correct format', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation()

    logError('Test context', new Error('Test error'), { extra: 'data' })

    expect(consoleError).toHaveBeenCalledWith(
      expect.stringMatching(/\[chat2deal-pipe\]\[\d{4}-\d{2}-\d{2}T.*\]\[.*\] Test context: Test error/),
      expect.any(String),
      { extra: 'data' }
    )

    consoleError.mockRestore()
  })

  it('handles non-Error objects', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation()

    logError('Test context', 'String error')

    expect(consoleError).toHaveBeenCalledWith(
      expect.stringContaining('String error'),
      '',
      {}
    )

    consoleError.mockRestore()
  })
})
```

### 9.2 Integration Tests

**Network Error Detection:**
```typescript
describe('Network Error Detection', () => {
  it('differentiates network error from API error', async () => {
    // Mock fetch to throw (network error)
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

    const service = new PipedriveApiService()

    try {
      await service.lookupByPhone('+48123456789')
    } catch (error) {
      expect(error).toEqual({
        statusCode: 0,
        message: 'Unable to connect. Check your internet connection.'
      })
    }
  })

  it('handles 401 error correctly', async () => {
    // Mock fetch to return 401
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401
    })

    const service = new PipedriveApiService()

    try {
      await service.lookupByPhone('+48123456789')
    } catch (error) {
      expect(error).toEqual({
        statusCode: 401,
        message: 'Authentication expired. Please sign in again.'
      })
    }

    // Verify verification_code was cleared
    const result = await chrome.storage.local.get('verification_code')
    expect(result.verification_code).toBeUndefined()
  })
})
```

### 9.3 Manual Testing

**Error Boundary:**
- [ ] Inject code to throw error in PersonMatchedCard
- [ ] Verify fallback UI appears with "Something went wrong" message
- [ ] Click "Reload Page" button → page reloads
- [ ] Check console → error logged with [chat2deal-pipe] prefix

**Global Error Handlers:**
- [ ] Inject code to throw uncaught error in setTimeout
- [ ] Check console → error logged
- [ ] Sidebar continues working normally

**Init Error Handling:**
- [ ] Modify WhatsApp DOM to break selector
- [ ] Reload page
- [ ] Check console → "Failed to initialize sidebar" logged
- [ ] Sidebar doesn't appear (silent failure)

**Network Error Detection:**
- [ ] Disconnect internet
- [ ] Try to create person
- [ ] Verify error message: "Unable to connect. Check your internet connection."
- [ ] Reconnect internet → retry works

**Auto Sign-out on 401:**
- [ ] Manually delete verification_code from storage
- [ ] Trigger API call (lookup person)
- [ ] Verify sidebar returns to sign-in screen automatically
- [ ] Sign in again → works normally

---

## 10. Acceptance Criteria

### 10.1 Error Boundary

- [ ] **AC-1:** Error Boundary component wraps entire `<App />` in index.tsx
- [ ] **AC-2:** When React component throws error, fallback UI appears instead of blank sidebar
- [ ] **AC-3:** Fallback UI displays "Something went wrong" message
- [ ] **AC-4:** Fallback UI has "Reload Page" button that calls window.location.reload()
- [ ] **AC-5:** Error is logged to console with [chat2deal-pipe] prefix and full context
- [ ] **AC-6:** Fallback UI matches WhatsApp design (colors, spacing, typography)

### 10.2 Global Error Handlers

- [ ] **AC-7:** Content script has global 'error' event listener
- [ ] **AC-8:** Content script has global 'unhandledrejection' event listener
- [ ] **AC-9:** Service worker has global 'error' event listener
- [ ] **AC-10:** Service worker has global 'unhandledrejection' event listener
- [ ] **AC-11:** All global handlers log errors with structured format
- [ ] **AC-12:** Global errors do NOT show user notifications (log only)
- [ ] **AC-13:** Extension continues running after global errors

### 10.3 Initialization Error Handling

- [ ] **AC-14:** init() function wrapped in try-catch
- [ ] **AC-15:** Init errors logged with full context (URL, stack trace)
- [ ] **AC-16:** Init failure results in silent failure (no user notification)
- [ ] **AC-17:** Sidebar doesn't appear if init fails

### 10.4 Network Error Detection

- [ ] **AC-18:** Network failures (fetch throws) return statusCode: 0
- [ ] **AC-19:** Network errors show message: "Unable to connect. Check your internet connection."
- [ ] **AC-20:** API errors (401, 404, 429, 500) return appropriate statusCode
- [ ] **AC-21:** API errors show existing user-friendly messages
- [ ] **AC-22:** Error objects always include { statusCode: number, message: string }

### 10.5 Auto Sign-out on 401

- [ ] **AC-23:** 401 errors automatically clear verification_code from storage
- [ ] **AC-24:** Storage change triggers useAuth hook listeners
- [ ] **AC-25:** Sidebar automatically transitions to unauthenticated state
- [ ] **AC-26:** User sees WelcomeState (sign-in screen) after 401
- [ ] **AC-27:** 401 error message remains: "Authentication expired. Please sign in again."

### 10.6 Structured Logging

- [ ] **AC-28:** errorLogger utility created in utils/errorLogger.ts
- [ ] **AC-29:** All logs include [chat2deal-pipe] prefix
- [ ] **AC-30:** All logs include ISO timestamp
- [ ] **AC-31:** All logs include extension version
- [ ] **AC-32:** All logs include context string, error message, and stack trace
- [ ] **AC-33:** Error Boundary uses errorLogger
- [ ] **AC-34:** Global handlers use errorLogger
- [ ] **AC-35:** Init error uses errorLogger

### 10.7 Code Quality

- [ ] **AC-36:** No TypeScript errors
- [ ] **AC-37:** Test coverage ≥70% for new components
- [ ] **AC-38:** No console warnings during normal operation
- [ ] **AC-39:** Error logs only appear when actual errors occur

---

## 11. Implementation Plan

### Phase 1: Error Logger Utility (30 minutes)

**Tasks:**
1. Create `Extension/src/utils/errorLogger.ts`
2. Implement `logError()` function
3. Add TypeScript interfaces (ErrorContext)
4. Write unit tests for logger
5. Verify log format in console

**Files:**
- `Extension/src/utils/errorLogger.ts` (new)
- `Extension/tests/unit/errorLogger.test.ts` (new)

### Phase 2: Error Boundary Component (1 hour)

**Tasks:**
6. Create `Extension/src/content-script/components/ErrorBoundary.tsx`
7. Implement class component with lifecycle methods
8. Create ErrorFallback UI component
9. Import and use errorLogger
10. Write unit tests for Error Boundary
11. Test fallback UI appearance

**Files:**
- `Extension/src/content-script/components/ErrorBoundary.tsx` (new)
- `Extension/tests/unit/ErrorBoundary.test.tsx` (new)

### Phase 3: Error Boundary Integration (15 minutes)

**Tasks:**
12. Import ErrorBoundary in index.tsx
13. Wrap `<App />` with `<ErrorBoundary>`
14. Test with intentional error throw
15. Verify fallback UI displays

**Files:**
- `Extension/src/content-script/index.tsx`

### Phase 4: Content Script Global Handlers (30 minutes)

**Tasks:**
16. Add window.addEventListener('error') in index.tsx
17. Add window.addEventListener('unhandledrejection') in index.tsx
18. Use errorLogger in both handlers
19. Test with intentional uncaught errors
20. Verify logs appear with correct format

**Files:**
- `Extension/src/content-script/index.tsx`

### Phase 5: Service Worker Global Handlers (30 minutes)

**Tasks:**
21. Add self.addEventListener('error') in service-worker/index.ts
22. Add self.addEventListener('unhandledrejection') in service-worker/index.ts
23. Import and use errorLogger
24. Test with intentional service worker errors
25. Verify logs appear

**Files:**
- `Extension/src/service-worker/index.ts`

### Phase 6: Init Error Handling (15 minutes)

**Tasks:**
26. Wrap init() function body in try-catch
27. Use errorLogger in catch block
28. Test by breaking WhatsApp selector
29. Verify error logged and sidebar doesn't appear

**Files:**
- `Extension/src/content-script/index.tsx`

### Phase 7: Network Error Detection (45 minutes)

**Tasks:**
30. Wrap makeRequest() in try-catch
31. Detect network errors (fetch throws)
32. Return statusCode: 0 for network errors
33. Keep existing API error handling
34. Write unit tests for error detection
35. Test with network disconnected

**Files:**
- `Extension/src/service-worker/pipedriveApiService.ts`
- `Extension/tests/unit/pipedriveApiService.test.ts`

### Phase 8: Auto Sign-out on 401 (20 minutes)

**Tasks:**
36. Add chrome.storage.local.remove() in 401 case
37. Test by manually triggering 401
38. Verify verification_code cleared
39. Verify sidebar returns to sign-in screen
40. Test re-authentication flow works

**Files:**
- `Extension/src/service-worker/pipedriveApiService.ts`

### Phase 9: Integration Testing (1 hour)

**Tasks:**
41. Write integration test: Error Boundary catches component error
42. Write integration test: Network error detection
43. Write integration test: 401 auto sign-out flow
44. Write integration test: Global error handlers
45. Run all tests and verify passing

**Files:**
- `Extension/tests/integration/error-handling.test.tsx` (new)

### Phase 10: Manual Testing (1.5 hours)

**Tasks:**
46. Test Error Boundary with various component errors
47. Test global handlers with uncaught errors
48. Test init error handling
49. Test network error detection (disconnect internet)
50. Test 401 auto sign-out
51. Test all existing features still work
52. Verify log format correctness
53. Cross-browser testing

### Phase 11: Documentation & Review (30 minutes)

**Tasks:**
54. Update CLAUDE.md with Feature 12 completion
55. Update Plan-001 to mark Feature 12 complete
56. Update this spec status to "Complete"
57. Take screenshots of fallback UI
58. Final code review

**Files:**
- `CLAUDE.md`
- `Docs/Plans/Plan-001-MVP-Feature-Breakdown.md`
- `Docs/Specs/Spec-112-UI-States-Error-Handling.md`

---

**Total Estimated Time:** 6-7 hours

**Breakdown:**
- Implementation: 3.5 hours (Phases 1-8)
- Testing: 2.5 hours (Phases 9-10)
- Documentation: 30 minutes (Phase 11)

---

## 12. Design Decisions & Rationale

### 12.1 Why Single Error Boundary (Not Multiple)?

**Decision:** One boundary wrapping entire `<App />`

**Rationale:**
- Simplest for MVP - one fallback UI, one implementation
- Any component crash shows same recovery path (reload page)
- Avoids complexity of granular boundary placement
- Good enough for production (most apps use single boundary)
- Can add granular boundaries later if needed

**Tradeoff:** Entire sidebar crashes on any component error. Acceptable because errors should be rare and reload is acceptable recovery.

### 12.2 Why Minimal Fallback UI (No Error Details)?

**Decision:** Simple "Something went wrong" message, no technical details

**Rationale:**
- Technical errors confuse users
- Stack traces expose implementation details
- Security: don't leak internal structure
- Simplicity: one message covers all error types
- Diagnostics: detailed logs in console for developers

**Tradeoff:** Users can't self-diagnose. Mitigated by providing clear action (reload page).

### 12.3 Why Log-Only Global Handlers (No User Notification)?

**Decision:** Global error handlers log to console but don't show UI

**Rationale:**
- Global errors are bugs, not expected failures
- Should be caught in testing, rare in production
- Alerting user on every uncaught error is disruptive
- Logs provide diagnostics without UX disruption
- Error Boundary catches most user-impacting errors

**Tradeoff:** Silent failures for some edge cases. Acceptable for MVP.

### 12.4 Why Silent Init Failure (No Error UI)?

**Decision:** If init fails, sidebar doesn't appear (no error message)

**Rationale:**
- Init failures are extremely rare (WhatsApp DOM change, extension conflict)
- Showing error in this case is complex (no React, no sidebar)
- Could inject plain DOM error, but adds complexity
- Logs provide diagnostics for debugging
- Users can report "sidebar missing" issue

**Tradeoff:** User doesn't know why sidebar is missing. Acceptable trade for simplicity.

### 12.5 Why Auto Sign-out on 401 (Not Manual)?

**Decision:** Automatically clear verification_code and return to sign-in

**Rationale:**
- 401 means session is invalid - continuing is futile
- Automatic action prevents user confusion (stuck in error state)
- Forces fresh authentication
- Matches expected behavior (other apps auto-signout on auth expiry)
- Existing storage listener architecture makes this trivial

**Tradeoff:** Slightly disruptive if user is mid-action. But action would fail anyway due to 401.

### 12.6 Why Differentiate Network vs API Errors?

**Decision:** statusCode: 0 for network, specific codes for API errors

**Rationale:**
- Different user actions needed:
  - Network error → "Check connection" (user's problem)
  - API error → "Try again later" (server problem)
- Better user guidance improves UX
- Helps user understand if issue is on their end
- Minimal complexity (one try-catch wrapper)

**Tradeoff:** Slightly more complex error handling. Worth it for UX improvement.

### 12.7 Why Structured Logging (Not Simple console.error)?

**Decision:** Prefix, timestamp, version, context in every log

**Rationale:**
- Production debugging: need to know WHEN and WHAT VERSION
- User screenshots: logs identify extension source
- Context: logs explain WHERE error occurred
- Correlation: timestamp helps match user reports to logs
- Professional: looks intentional, not debug leftovers

**Tradeoff:** More verbose logs. Worth it for production support.

### 12.8 Why `[chat2deal-pipe]` Prefix (Not `[Pipedrive]`)?

**Decision:** Use project name in logs

**Rationale:**
- Unique identifier (distinguishes from other extensions)
- Searchable (easy to grep console)
- Professional (shows intentional logging)
- Consistent with project identity

---

## 13. Future Enhancements (Post-MVP)

### 13.1 Error Boundary Improvements

**Granular Boundaries:**
- Boundary around PersonNoMatchState (form errors don't crash entire app)
- Boundary around authentication flow
- Each boundary with context-specific fallback

**Better Fallback UI:**
- Show last known good state (e.g., keep header, show error in body)
- "Report Issue" button with pre-filled error context
- Retry mechanism without full page reload

**Error Recovery:**
- Reset component state without reload
- Automatic retry with exponential backoff
- Recover from error and continue (if possible)

### 13.2 Advanced Error Differentiation

**API Error Subtypes:**
- 400 errors: parse response body for field-specific errors
- 500 errors: detect Pipedrive-specific vs backend errors
- Rate limit (429): show countdown timer before retry

**Network Error Details:**
- Differentiate timeout vs DNS vs connection refused
- Detect offline mode vs slow connection
- Show appropriate guidance for each

### 13.3 Error Analytics (Feature 14 Integration)

**Sentry Integration:**
- Send errors to Sentry for monitoring
- Group errors by type, version, user
- Track error frequency and trends
- Alert on spike in errors

**Privacy-Preserving Analytics:**
- Hash/redact PII (names, phone numbers)
- Anonymize user identifiers
- Aggregate error counts

### 13.4 User-Facing Improvements

**Error Explanations:**
- Context-aware help text ("This usually means...")
- Link to documentation/FAQ
- Suggest common fixes

**Status Page Integration:**
- Check backend health before showing error
- Display "System Status" if backend down
- Link to status page

**Retry Strategies:**
- Smart retry with exponential backoff
- Queue failed operations for retry
- Show retry countdown

### 13.5 Developer Experience

**Error Replay:**
- Capture user actions leading to error
- Replay in dev environment
- Debug production issues locally

**Enhanced Logging:**
- Conditional logging levels (debug, info, warn, error)
- Log sanitization (remove PII automatically)
- Structured logging (JSON format for parsing)

**Error Simulation:**
- Dev mode: inject errors for testing
- Test all error states easily
- Verify error handling works

---

## 14. Known Limitations

### 14.1 Error Boundary Scope

**Single Boundary:**
- Any component error crashes entire sidebar
- Cannot isolate errors to specific sections
- User must reload entire page

**Mitigation:** Errors should be rare with proper testing.

### 14.2 Init Error Handling

**Silent Failure:**
- User doesn't know why sidebar is missing
- No recovery mechanism without page reload
- Hard to diagnose for non-technical users

**Mitigation:** Comprehensive logging helps support diagnose issues.

### 14.3 Global Error Handlers

**Log Only:**
- No user notification for uncaught errors
- User might not realize something broke
- Bugs could go unreported

**Mitigation:** Error Boundary catches most critical errors. Global handlers are safety net for edge cases.

### 14.4 Network Error Detection

**Limited Granularity:**
- Can't differentiate timeout vs DNS vs connection refused
- All network errors show same message
- User guidance could be more specific

**Mitigation:** Generic "check connection" message covers most cases.

### 14.5 Retry Mechanisms

**No Smart Retry:**
- User must manually click retry
- No exponential backoff
- No queue for failed operations

**Mitigation:** Acceptable for MVP. Can enhance in future.

---

## 15. Security & Privacy Considerations

### 15.1 Error Logging

**No PII in Logs:**
- Don't log phone numbers, names, email
- Hash or redact sensitive data
- Component stack OK (no user data)
- URL OK (WhatsApp Web domain)

**No Security Details:**
- Don't log verification_code
- Don't log OAuth tokens
- Don't log API keys
- Stack traces OK (implementation details only)

### 15.2 Error Messages

**User-Facing:**
- Generic messages only
- No technical details
- No internal structure exposure
- No API endpoints or URLs

**Console Logs:**
- Detailed logs OK (developers only)
- Assume adversary has console access
- Still don't log secrets

### 15.3 Error Boundary Fallback

**Minimal Information:**
- No error message shown to user
- No stack trace visible
- Reload is safe operation
- No data loss on reload

---

## 16. References

### 16.1 Related Documents

- [Plan-001-MVP-Feature-Breakdown.md](../Plans/Plan-001-MVP-Feature-Breakdown.md) - Feature 12 definition
- [Chrome-Extension-Architecture.md](../Architecture/Chrome-Extension-Architecture.md) - Overall architecture
- [Spec-106a-Backend-Pipedrive-API-Service.md](Spec-106a-Backend-Pipedrive-API-Service.md) - Backend API error handling
- [Spec-106b-Extension-Pipedrive-API-Integration.md](Spec-106b-Extension-Pipedrive-API-Integration.md) - usePipedrive hook error handling

### 16.2 External References

- [React Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary) - Official React docs
- [MDN: GlobalEventHandlers.onerror](https://developer.mozilla.org/en-US/docs/Web/API/GlobalEventHandlers/onerror) - Error event
- [MDN: unhandledrejection](https://developer.mozilla.org/en-US/docs/Web/API/Window/unhandledrejection_event) - Promise rejection event
- [Chrome Extensions: Error Handling](https://developer.chrome.com/docs/extensions/mv3/tut_debugging/) - Debugging extensions

### 16.3 Code References

- `Extension/src/content-script/index.tsx` - Init function and React mounting
- `Extension/src/content-script/hooks/usePipedrive.ts` - API error handling
- `Extension/src/content-script/hooks/useAuth.ts` - Auth state and storage listeners
- `Extension/src/service-worker/pipedriveApiService.ts` - API calls and error detection
- `Extension/src/service-worker/index.ts` - Message handling and service worker lifecycle

---

## 17. Glossary

**Error Boundary:** React component that catches JavaScript errors in child component tree and displays fallback UI

**Global Error Handler:** Event listener for uncaught errors and unhandled promise rejections

**Network Error:** Failure to reach server (no internet, DNS failure, timeout) - fetch() throws before getting response

**API Error:** Server returns error response (401, 404, 429, 500) - fetch() succeeds but response.ok is false

**Structured Logging:** Consistent log format with prefix, timestamp, version, context, and additional data

**Silent Failure:** Error occurs but user sees no notification (logs only)

**Auto Sign-out:** Automatically clearing authentication and returning to sign-in screen (triggered by 401 errors)

**Fallback UI:** Alternative UI shown when error occurs (replaces broken component)

**statusCode: 0:** Special error code indicating network failure (not HTTP status code)

**verification_code:** Session identifier stored in chrome.storage.local for API authentication

---

**End of Specification**
