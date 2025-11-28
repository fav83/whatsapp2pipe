# Chrome Extension Architecture
## Pipedrive × WhatsApp Web Integration

**Date:** 2025-11-04
**Version:** 1.1
**Status:** Approved

---

## 1. Overview & Technology Stack

### 1.1 Project Overview

This Chrome extension integrates WhatsApp Web with Pipedrive CRM, enabling users to find, create, and link Pipedrive contacts directly from WhatsApp conversations without context switching. The extension injects a sidebar into WhatsApp Web that provides real-time contact lookup and management capabilities.

### 1.2 Core Technology Stack

**Runtime & Build:**
- **Manifest Version:** V3 (Chrome Extensions Manifest V3)
- **Build Tool:** Vite 5.x
- **Package Manager:** npm
- **TypeScript:** 5.x (strict mode)
- **Target:** Modern browsers (ES2020+)

**Frontend Framework:**
- **UI Framework:** React 18.x
- **Language:** TypeScript
- **UI Components:** Custom React components with Tailwind CSS utility classes
- **Styling:** Tailwind CSS 3.x

**State & Data Management:**
- **API State:** Custom React hooks with built-in loading/error management
- **Client State:** React Context API + React useState
- **Storage:** chrome.storage.local with Web Crypto API encryption

**Infrastructure & Tooling:**
- **Error Tracking:** Sentry
- **Testing:** Vitest (unit/integration) + Testing Library + Playwright (E2E)
- **Code Quality:** ESLint + Prettier + Husky + lint-staged
- **Environment Config:** .env files (development, production)

---

## 2. Extension Structure & Components

### 2.1 Chrome Extension Components

**Service Worker (background.js):**
- Handles OAuth callbacks and token refresh
- Makes authenticated Pipedrive API requests on behalf of content script
- Event-driven, dormant when idle (Manifest V3 requirement)
- Manages chrome.identity API for Pipedrive OAuth flow
- Message passing architecture for content script communication

**Content Script (content.js):**
- Injected into `*://web.whatsapp.com/*`
- Extracts phone numbers and chat metadata from WhatsApp DOM
- Renders the entire React sidebar application directly into the page
- Observes DOM for chat switches
- Handles Pipedrive API communication via service worker message passing
- Uses custom React hooks (usePipedrive) for state management
- Accesses encrypted tokens from chrome.storage.local

**Popup (optional for MVP):**
- Small popup UI when clicking extension icon
- Shows sign-in status, quick settings, or link to WhatsApp Web
- Minimal - most interaction happens in sidebar

### 2.2 Folder Structure

**Important:** All extension source code is located under the `Extension/` folder at the project root.

```
whatsapp2pipe/
├── Extension/                  # All extension source code
│   ├── public/
│   │   ├── manifest.json       # Chrome extension manifest
│   │   └── icons/              # Extension icons (16, 48, 128px)
│   ├── src/
│   │   ├── content-script/     # WhatsApp Web integration
│   │   │   ├── index.tsx       # Entry point, sidebar injection
│   │   │   ├── dom-observer.ts # Watch for chat switches
│   │   │   └── phone-extractor.ts  # Extract JID/phone from DOM
│   │   ├── service-worker/     # Background script
│   │   │   ├── index.ts        # Service worker entry & message handlers
│   │   │   ├── authService.ts  # OAuth flow management
│   │   │   └── pipedriveApiService.ts  # Pipedrive API client
│   │   ├── popup/              # Extension popup (optional)
│   │   │   └── index.tsx
│   │   ├── components/         # Shared React components
│   │   │   ├── PersonMatchedCard.tsx
│   │   │   ├── PersonNoMatchState.tsx
│   │   │   ├── PersonLookupLoading.tsx
│   │   │   ├── PersonLookupError.tsx
│   │   │   └── Spinner.tsx
│   │   ├── hooks/              # Custom React hooks
│   │   │   ├── useAuth.ts      # OAuth authentication hook
│   │   │   ├── usePipedrive.ts # Pipedrive API operations hook
│   │   │   └── useWhatsAppChat.ts # Current chat state
│   │   ├── contexts/           # React Context providers
│   │   │   └── AuthContext.tsx # Auth state & tokens
│   │   ├── services/           # Business logic & API
│   │   │   ├── pipedrive.ts    # Pipedrive API functions
│   │   │   └── encryption.ts   # Web Crypto API token encryption
│   │   ├── utils/              # Helper functions
│   │   │   ├── logger.ts       # Sentry integration
│   │   │   └── phone-parser.ts # JID to phone conversion
│   │   ├── types/              # TypeScript definitions
│   │   │   ├── person.ts       # Person domain models
│   │   │   ├── messages.ts     # Message passing types
│   │   │   └── whatsapp.ts
│   │   └── styles/             # Global styles
│   │       └── globals.css     # Tailwind imports
│   ├── tests/
│   │   ├── unit/
│   │   ├── integration/
│   │   └── e2e/
│   ├── .env.development
│   ├── .env.production
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── package.json
├── Docs/                       # Documentation
│   ├── Architecture/
│   ├── BRDs/
│   ├── Plans/
│   └── Specs/
└── .gitignore
```

---

## 3. State Management & Data Flow

### 3.1 State Management Strategy

**API State (Custom React Hooks):**
- Custom `usePipedrive()` hook manages all Pipedrive API operations
- Built-in loading and error state management
- Graceful degradation (returns null/empty array on errors)
- Service worker message passing for API calls
- No caching layer in MVP (simple, straightforward)
- Hook methods:
  - `lookupByPhone(phone)` - Person lookup by phone
  - `searchByName(name)` - Person search by name
  - `createPerson(data)` - Create new person
  - `attachPhone(data)` - Attach phone to existing person

**Client State (React Context + useState):**
- Authentication state (tokens, user info, sign-in status)
- Current chat/phone number (from WhatsApp detection)
- UI state (modals, forms, etc.)
- Simple, predictable state flow

**Persistent Storage:**
- `chrome.storage.local` - Encrypted OAuth tokens
- Encryption via Web Crypto API (AES-GCM)
- Decryption key stored in service worker memory during session

### 3.2 Data Flow Architecture

**Chat Switch Flow:**
```
User switches WhatsApp chat
    ↓
DOM Observer detects change (content-script/dom-observer.ts)
    ↓
Extract JID → parse phone number (utils/phone-parser.ts)
    ↓
React sidebar re-renders with new phone
    ↓
Component calls usePipedrive().lookupByPhone() (hooks/usePipedrive.ts)
    ↓
Hook sends message to service worker
    ↓
Service worker makes authenticated API request
    ↓
Response sent back to hook, UI updates (components/PersonCard.tsx)
```

**Authentication Flow:**
```
User clicks "Sign in with Pipedrive"
    ↓
Content script sends message to service worker
    ↓
Service worker launches chrome.identity.launchWebAuthFlow()
    ↓
OAuth callback returns tokens
    ↓
Service worker encrypts tokens (services/encryption.ts)
    ↓
Stores in chrome.storage.local
    ↓
Notifies content script of success
    ↓
AuthContext updates, sidebar shows authenticated state
```

**API Request Flow:**
```
Component calls usePipedrive hook method
    ↓
Hook sends message to service worker (chrome.runtime.sendMessage)
    ↓
Service worker receives message and validates request
    ↓
Service worker retrieves verification_code from chrome.storage
    ↓
Service worker makes fetch request with Authorization header
    ↓
Backend validates session and calls Pipedrive API
    ↓
Response sent back to service worker
    ↓
Service worker sends response message to hook
    ↓
Hook updates loading/error state and returns data
    ↓
Component re-renders with new data
```

---

## 4. Security & Privacy

### 4.1 Authentication & Token Security

**OAuth Implementation:**
- Pipedrive OAuth 2.0 with PKCE flow
- Leverages `chrome.identity.launchWebAuthFlow()` API
- No server required for token exchange (client-side PKCE)
- Tokens never exposed in plain text

**Token Storage:**
- Encrypted using Web Crypto API (AES-GCM, 256-bit)
- Storage: `chrome.storage.local` (encrypted tokens only)
- Decryption key: Held in service worker memory during active session
- Automatic token refresh handled by service worker

**Security Principles:**
- Least privilege permissions (no `<all_urls>`, no `webRequest`)
- Content Security Policy (CSP) compliant
- No remote code execution (Manifest V3 requirement)
- No eval() or inline scripts

### 4.2 Data Privacy

**Data Collection (Minimal):**
- **From WhatsApp:** JID/phone number, display name only
- **NO message content** read or transmitted
- **NO attachments, files, or media** accessed
- **NO group chat data** processed

**Data Transmission:**
- Only to Pipedrive API (HTTPS only)
- Phone numbers and names for contact matching
- No third-party services except Sentry (opt-in, anonymized)

**Data Storage:**
- No persistent caching of WhatsApp → Pipedrive mappings in MVP
- No caching layer (simple, fresh requests every time)
- chrome.storage.local: encrypted tokens only

### 4.3 Error Tracking & Telemetry

**Sentry Integration:**
- Real-time error and performance monitoring
- PII filtering: phone numbers, names, tokens stripped from reports
- Anonymous user IDs only (no real identities)
- Stack traces with source maps for debugging
- Breadcrumbs track user actions before errors

**Privacy Compliance:**
- Requires Privacy Policy disclosure (per BRD Section 13.3)
- Optional telemetry mentioned in BRD Section 6
- User-facing error messages never expose sensitive data

### 4.4 Logging Architecture

The extension uses a dual-logger approach with clear separation between development and production environments.

#### Development Logger (`Extension/src/utils/logger.ts`)

**Purpose:** Development-only console logging (automatically disabled in production)

**Features:**
- All methods are no-ops in production (zero runtime overhead)
- Supports all console methods: `log`, `warn`, `error`, `debug`, `info`, `group`, `groupEnd`, `table`
- Environment-aware: checks `import.meta.env.MODE === 'development'`
- No Sentry integration (local debugging only)

**Usage Pattern:**
```typescript
import * as logger from '@/utils/logger'

// Component initialization
logger.log('[PersonCard] Rendering with:', person)

// API calls
logger.group('Pipedrive API Request')
logger.log('Endpoint:', endpoint)
logger.log('Payload:', payload)
logger.groupEnd()

// State changes
logger.debug('Store state updated:', newState)

// Performance tracking
logger.table(performanceMetrics)
```

**When to Use:**
- Debugging component lifecycle
- Tracing data flow and state changes
- Local development troubleshooting
- Performance monitoring during development
- Any logging that should NOT appear in production

#### Error Logger (`Extension/src/utils/errorLogger.ts`)

**Purpose:** Production error tracking with Sentry integration

**Features:**
- Structured error format: `[chat2deal-pipe][timestamp][version] context: errorMessage`
- Development: Logs to console with full details
- Production: Only sends to Sentry (no console output)
- Smart filtering: Skips expected errors (404, validation, user cancellations)
- Isolated Sentry scopes: Each error uses cloned scope to prevent conflicts
- Automatic context enrichment: timestamp, version, custom dimensions

**Usage Pattern:**
```typescript
import { logError } from '@/utils/errorLogger'
import * as Sentry from '@sentry/browser'

try {
  const person = await createPerson(data)
} catch (error) {
  logError(
    'Failed to create person in Pipedrive',
    error,
    {
      userId: user.id,
      statusCode: error.response?.status,
      endpoint: '/api/pipedrive/persons'
    },
    Sentry.getCurrentScope()
  )
  // Handle error in UI
}
```

**When to Use:**
- API failures that users encounter
- Unexpected errors that break functionality
- Integration failures (Pipedrive API, authentication)
- Data processing errors
- Any error that needs production visibility

**When NOT to Use:**
- Expected errors (404 not found, validation failures)
- User-initiated cancellations
- Development debugging (use `logger.ts` instead)

#### Error Filtering Logic

The `errorLogger` automatically skips Sentry capture for:

1. **404 Not Found** - Expected when person doesn't exist in Pipedrive
2. **Validation Errors** - User input issues (handled in UI)
3. **User Cancellations** - Intentional user actions

Example:
```typescript
const skipSentry =
  additionalContext?.statusCode === 404 ||
  context.includes('Form validation') ||
  context.includes('User cancelled')
```

#### Logging Strategy Decision Tree

```
Is this a production error that needs tracking?
├─ YES → Use errorLogger.logError() with Sentry scope
│   └─ Appears in Sentry dashboard with full context
│
└─ NO → Use logger.* methods
    └─ Appears in console during development only
```

**Examples:**

| Scenario | Logger to Use | Rationale |
|----------|---------------|-----------|
| API call fails with 500 | `errorLogger.logError()` | Production error needs tracking |
| Component renders | `logger.log()` | Development debugging only |
| Person not found (404) | `errorLogger.logError()` but filtered | Logged locally, skipped in Sentry |
| User clicks button | `logger.debug()` | Development tracing only |
| Auth token expired | `errorLogger.logError()` | Production issue needs tracking |
| State updated | `logger.log()` | Development debugging only |
| Pipedrive API timeout | `errorLogger.logError()` | Production error needs tracking |
| Form validation fails | UI error message only | Expected user error, no logging needed |

#### Helper Functions

**Extract Error Messages:**
```typescript
import { getErrorMessage } from '@/utils/errorLogger'

// Safely extract message from any error type
const message = getErrorMessage(error, 'Failed to complete operation')
```

Handles:
- `Error` instances → `error.message`
- Objects with `message` property → `String(error.message)`
- Unknown types → fallback message

#### Source Maps and Debug Workflow

**Build Process:**
1. `npm run build` - Creates production build with inline source maps
2. `npm run upload-sourcemaps` - Injects Debug IDs and uploads to Sentry
3. **CRITICAL:** Reload extension in Chrome after upload
4. Without reload: "Missing source file with a matching Debug ID" errors

**Debug IDs:**
- Injected during source map upload (not during build)
- Link minified code to original TypeScript source
- Enable accurate stack traces in Sentry
- Must reload extension for changes to take effect

**Verification:**
```typescript
// Dev mode components for testing
<DevModeIndicator />  // Shows dev banner with Sentry test button
<SentryTest />        // Manual Sentry integration testing
```

Both components are automatically hidden in production builds.

#### Best Practices

1. **Never use `console.log()` directly** - Always use `logger.*` or `errorLogger.*`
2. **Provide clear context** - Include operation description, not just generic "error occurred"
3. **Add relevant IDs** - Include userId, personId, etc. for debugging
4. **Include status codes** - Helps diagnose API failures
5. **Use structured data** - Pass objects for additional context, not concatenated strings
6. **Consider production impact** - Only use `errorLogger` for issues users would report
7. **Test locally first** - Verify logging works with `logger.*` before adding `errorLogger`

#### Performance Considerations

**Development Logger:**
- Zero overhead in production (all methods are no-ops)
- Conditional compilation removes dead code during build
- No runtime performance impact in production builds

**Error Logger:**
- Minimal overhead: ~1-2ms per error log
- Sentry capture is asynchronous (doesn't block UI)
- Console logging only in development
- Smart filtering reduces Sentry noise

---

## 5. API Integration & Communication

### 5.1 Pipedrive API Service Layer

**Service Architecture:**
- Service worker API client in `service-worker/pipedriveApiService.ts`
- Content script hook in `content-script/hooks/usePipedrive.ts`
- Message passing between content script and service worker
- Type-safe with discriminated unions (`types/messages.ts`)
- Return typed responses (TypeScript interfaces in `types/person.ts`)

**Service Worker API Client:**
```typescript
// service-worker/pipedriveApiService.ts
class PipedriveApiService {
  async lookupByPhone(phone: string): Promise<Person | null>
  async searchByName(name: string): Promise<Person[]>
  async createPerson(data: CreatePersonData): Promise<Person>
  async attachPhone(data: AttachPhoneData): Promise<Person>
}
```

**Content Script Hook:**
```typescript
// content-script/hooks/usePipedrive.ts
export function usePipedrive() {
  return {
    isLoading: boolean,
    error: PipedriveError | null,
    lookupByPhone: (phone: string) => Promise<Person | null>,
    searchByName: (name: string) => Promise<Person[]>,
    createPerson: (data: CreatePersonData) => Promise<Person | null>,
    attachPhone: (data: AttachPhoneData) => Promise<Person | null>,
    clearError: () => void
  }
}
```

**Error Handling:**
- Service worker converts HTTP status codes to user-friendly messages
- 401 (unauthorized): "Authentication expired. Please sign in again."
- 404 (not found): "Person not found"
- 429 (rate limit): "Too many requests. Please try again in a moment."
- 500 (server error): "Server error. Please try again later."
- Hook returns null/empty array on errors (graceful degradation)
- All errors logged to Sentry with context

### 5.2 Extension Message Passing

**Content Script ↔ Service Worker Communication:**
- All API calls go through message passing architecture
- Content script sends typed messages via `chrome.runtime.sendMessage()`
- Service worker handles messages and responds asynchronously
- Type-safe with discriminated unions for compile-time validation

**Message Types:**
```typescript
// Request messages (Content Script → Service Worker)
- PIPEDRIVE_LOOKUP_BY_PHONE
- PIPEDRIVE_SEARCH_BY_NAME
- PIPEDRIVE_CREATE_PERSON
- PIPEDRIVE_ATTACH_PHONE
- AUTH_SIGN_IN

// Response messages (Service Worker → Content Script)
- PIPEDRIVE_LOOKUP_SUCCESS
- PIPEDRIVE_SEARCH_SUCCESS
- PIPEDRIVE_CREATE_SUCCESS
- PIPEDRIVE_ATTACH_SUCCESS
- PIPEDRIVE_ERROR
- AUTH_SIGN_IN_SUCCESS
- AUTH_SIGN_IN_ERROR
```

**Communication Flow:**
```typescript
// Content script hook sends message
const response = await chrome.runtime.sendMessage({
  type: 'PIPEDRIVE_LOOKUP_BY_PHONE',
  phone: '+48123456789'
})

// Service worker handles message
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'PIPEDRIVE_LOOKUP_BY_PHONE') {
    handleLookup(message, sendResponse)
    return true  // Keep sendResponse channel open
  }
})

// Service worker responds
sendResponse({
  type: 'PIPEDRIVE_LOOKUP_SUCCESS',
  person: {...}
})
```

**Benefits:**
- Clean separation: Service worker = API layer, Content script = UI layer
- Service worker has full chrome API access (storage, identity, fetch)
- Content script stays focused on React UI and WhatsApp DOM
- Type safety prevents message type mismatches

---

## 6. UI/UX Architecture

### 6.1 Component Library & Styling

**Tailwind CSS v3:**
- Utility-first CSS framework for rapid UI development
- Configured with PostCSS for build-time processing
- Custom components built with Tailwind utility classes
- No component library dependency (custom implementations)

**Configuration Files:**
- `tailwind.config.js` - Tailwind configuration with content scanning
- `postcss.config.js` - PostCSS pipeline (Tailwind + Autoprefixer)
- `src/styles/content-script.css` - Main stylesheet with Tailwind directives

**Content Scanning:**
```javascript
// tailwind.config.js
content: [
  "./index.html",
  "./src/**/*.{js,ts,jsx,tsx}",
]
```

**Build Integration:**
- Vite processes CSS through PostCSS during build
- Tailwind scans all `.tsx` and `.ts` files for utility class usage
- Only used utility classes are included in final CSS bundle
- Tree-shaking reduces bundle size (~10-11 KB typical)

**Styling Approach:**
- All components use Tailwind utility classes
- WhatsApp Web color palette for consistency:
  - Primary text: `#111b21`
  - Secondary text: `#667781`
  - Borders: `#d1d7db`
  - Backgrounds: `#f0f2f5`, white
  - Accent (green): `#00a884`
- Responsive utilities ensure 350px sidebar width compatibility
- No aggressive CSS resets (avoids overriding utility classes)

**Key Components Implemented:**
- `PersonLookupLoading` - Skeleton loading UI
- `PersonMatchedCard` - Person display with Pipedrive link
- `PersonNoMatchState` - Create/attach form layout
- `PersonLookupError` - Error display with retry
- `ContactWarningCard` - Invalid phone warning
- `GroupChatState` - Group chat indicator
- `WelcomeState` - Unauthenticated welcome screen
- `AuthenticatingState` - OAuth flow loading

### 6.2 Sidebar Injection Strategy

**Injection Approach:**
- Content script creates sidebar container div
- Injects into WhatsApp Web DOM (right side)
- React app renders into this container
- CSS scoped to prevent WhatsApp style conflicts

**Positioning & Layout:**
- Fixed position sidebar (350px width, per Spec-103)
- Right side of viewport
- **Pushes WhatsApp content left** by adjusting WhatsApp container's `marginRight`
- Does not overlay - WhatsApp content resizes to accommodate sidebar
- Always visible (no toggle, per Spec-103)

**WhatsApp Layout Adjustment:**

To prevent the sidebar from overlaying WhatsApp content, the content script adjusts the WhatsApp Web layout:

```typescript
// Extension/src/content-script/index.tsx
async function init() {
  await waitForWhatsAppLoad()

  // Adjust WhatsApp Web layout to make room for sidebar
  const whatsappContainer = document.querySelector('#app > div > div') as HTMLElement
  if (whatsappContainer) {
    whatsappContainer.style.marginRight = '350px'
    console.log('[Content Script] WhatsApp container adjusted for sidebar')
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
  `

  document.body.appendChild(sidebarContainer)
  // ... render React app
}
```

**Why This Approach:**
- Sidebar uses `position: fixed` for reliable positioning
- WhatsApp container gets `marginRight: 350px` to shrink and make room
- Result: WhatsApp and sidebar sit side-by-side without overlap
- WhatsApp content remains fully functional and clickable

### 6.3 Application States

**Primary UI States (SidebarState union):**
1. **Welcome:** Default splash when no chat context is available.
2. **Contact:** Transitional state used to kick off lookup; immediately flips to loading.
3. **Contact Warning:** Shown when a 1:1 chat lacks a phone number.\*
4. **Group Chat:** Messaging that only direct chats are supported.
5. **Loading:** Skeleton UI while `lookupByPhone()` is running.
6. **Person Matched:** Displays `PersonMatchedCard` with "Open in Pipedrive".
7. **Person No Match:** `PersonNoMatchState` with inline Create + Attach flows.
8. **Person Error:** Friendly error copy with retry CTA.

\*Contact warning is primarily temporary until WhatsApp exposes the phone number again.

**Visual Consistency:**
- All states use consistent spacing and typography
- Error states never block return to safe state
- Loading states show immediate feedback (<100ms)
- Success states include clear next actions

---

## 7. Theme Management System

### 7.1 Architecture Overview

The extension implements a centralized, runtime-switchable theming system that enables instant theme changes without rebuild or component re-render. The system uses CSS custom properties (CSS variables) mapped to Tailwind utility classes, providing a clean separation between theme definitions and component styling.

**Core Architecture:**
```
colors.ts (Palette Definitions)
    ↓
ThemeManager (CSS Variable Application)
    ↓
tailwind.config.js (Variable Mapping)
    ↓
Components (Semantic Utility Classes)
```

### 7.2 Color System Components

**File Structure:**
```
Extension/src/styles/
├── colors.ts           # Centralized palette definitions (45+ themes)
├── ThemeManager.ts     # Theme selection, persistence, CSS variable application
└── content-script.css  # Global styles and Tailwind directives

Extension/
└── tailwind.config.js  # CSS variable mapping to Tailwind utilities
```

**Key Files:**

1. **[colors.ts](../../Extension/src/styles/colors.ts)** - Centralized palette definitions
   - 45+ pre-built color palettes (Tailwind 500/600-series + custom)
   - Each palette defines semantic categories: brand, text, background, border, state colors
   - Type-safe palette structure with TypeScript interfaces
   - Active palette exported for build-time defaults

2. **[ThemeManager.ts](../../Extension/src/styles/ThemeManager.ts)** - Theme management singleton
   - Loads saved theme from Chrome Storage on initialization
   - Applies theme by setting CSS variables on sidebar root element
   - Persists theme changes to Chrome Storage
   - Notifies listeners of theme changes
   - Provides API: `initialize()`, `setTheme()`, `getCurrentTheme()`, `addListener()`

3. **[tailwind.config.js](../../Extension/tailwind.config.js)** - Tailwind integration
   - Maps CSS variables to Tailwind utility classes
   - Enables semantic token usage: `bg-brand-primary`, `text-secondary`, etc.
   - Color utilities work with any active theme

### 7.3 Semantic Color Categories

All colors are organized by semantic purpose rather than specific values:

| Category | CSS Variables | Tailwind Classes | Usage |
|----------|--------------|------------------|-------|
| **Brand** | `--brand-primary`<br>`--brand-hover`<br>`--brand-secondary` | `bg-brand-primary`<br>`text-brand-primary`<br>`border-brand-primary` | Action buttons, links, accent colors |
| **Text** | `--text-primary`<br>`--text-secondary`<br>`--text-tertiary`<br>`--text-avatar-hover` | `text-primary`<br>`text-secondary`<br>`text-tertiary` | Text content by hierarchy |
| **Background** | `--background-main`<br>`--background-secondary`<br>`--background-tertiary`<br>`--background-hover` | `bg-background-main`<br>`bg-background-secondary` | Surface backgrounds and layouts |
| **Border** | `--border-primary`<br>`--border-secondary` | `border-primary`<br>`border-secondary` | Dividers and component borders |
| **Button** | `--button-primary-bg`<br>`--button-primary-bg-hover`<br>`--button-secondary-bg` | `bg-button-primary-bg`<br>`hover:bg-button-primary-bg-hover` | Button states |
| **Loading** | `--loading-spinner` | `border-loading-spinner` | Loading indicators |
| **Dev Mode** | `--dev-bg`<br>`--dev-border`<br>`--dev-badge-bg` | `bg-dev-background`<br>`border-dev-border` | Development indicator |

### 7.4 Theme Definition Structure

Each theme palette follows a consistent structure:

```typescript
// Extension/src/styles/colors.ts
const exampleTheme = {
  brand: {
    primary: '#0891b2',        // Main brand color
    'primary-hover': '#0e7490', // Hover state
    'primary-light': '#cffafe', // Light variant
    'primary-light-hover': '#67e8f9', // Light variant hover
  },
  text: {
    primary: '#0a0a0a',         // Main text
    secondary: '#525252',       // Supporting text
    tertiary: '#a3a3a3',        // De-emphasized text
    'avatar-hover': '#404040',  // Avatar hover state
  },
  background: {
    primary: '#ffffff',         // Card backgrounds
    secondary: '#ecfeff',       // Subtle backgrounds
    tertiary: '#f0f9ff',        // Alternative backgrounds
    main: '#f5f5f5',           // Body background
  },
  border: {
    primary: '#d4d4d4',         // Main borders
    secondary: '#e5e5e5',       // Subtle borders
  },
  error: {
    text: '#dc2626',
    'text-hover': '#991b1b',
    background: '#fef2f2',
    border: '#fca5a5',
  },
  warning: {
    background: '#fef3c7',
    border: '#fbbf24',
    icon: '#f59e0b',
  },
  success: {
    background: '#d1fae5',
    border: '#10b981',
  },
  loading: {
    spinner: '#0891b2',         // Matches brand primary
  },
  dev: {
    background: '#fde68a',
    border: '#f59e0b',
    'badge-background': '#fef3c7',
    'badge-text': '#78350f',
    'button-background': '#f59e0b',
    'button-border': '#d97706',
  },
}
```

### 7.5 Theme Management Flow

**Initialization:**
```
Content script renders sidebar
    ↓
ThemeManager.initialize() called
    ↓
Loads saved theme from chrome.storage.local
    ↓
Applies CSS variables to #pipedrive-whatsapp-sidebar
    ↓
Tailwind utilities reflect active theme
```

**Theme Change:**
```
User selects new theme (future: settings UI)
    ↓
ThemeManager.setTheme(themeName)
    ↓
Applies new palette as CSS variables
    ↓
Persists to chrome.storage.local
    ↓
Notifies listeners (optional: for UI updates)
    ↓
Components re-render with new theme automatically
```

**CSS Variable Application:**
```typescript
// Extension/src/styles/ThemeManager.ts
private applyCSSVariables(palette: ColorPalette): void {
  const sidebar = document.getElementById('pipedrive-whatsapp-sidebar')
  if (!sidebar) return

  // Apply all CSS variables to sidebar root
  sidebar.style.setProperty('--brand-primary', palette.brand.primary)
  sidebar.style.setProperty('--text-primary', palette.text.primary)
  // ... all other variables
}
```

### 7.6 Component Usage

**Semantic Token Approach:**
Components use semantic token names via Tailwind utility classes, making them theme-agnostic:

```tsx
// ✅ CORRECT - Uses semantic tokens
<button className="bg-brand-primary hover:bg-brand-hover text-white rounded-lg">
  Create Person
</button>

<div className="bg-background-secondary border border-primary rounded-lg p-4">
  <h3 className="text-primary font-semibold">Contact Info</h3>
  <p className="text-secondary">+48 123 456 789</p>
</div>

// ❌ INCORRECT - Hardcoded colors (not theme-aware)
<button className="bg-[#00a884] hover:bg-[#008f6f]">
  Create Person
</button>
```

**Benefits:**
- Components automatically adapt to theme changes
- No component code changes required for new themes
- Consistent semantic meaning across themes
- Type-safe with Tailwind IntelliSense

### 7.7 Available Themes

**Tailwind 600-Series (22 themes):**
- modernBlue, professionalPurple, oceanTeal, sunsetOrange
- deepIndigo, forestGreen, rosePink, crimsonRed
- goldenAmber, brightYellow, freshLime, vibrantEmerald
- coolCyan, clearSky, royalPurple, vividFuchsia
- softPink, slateGray, neutralGray, modernZinc
- pureNeutral, warmStone

**Tailwind 500-Series (23 themes):**
- slate500, gray500, zinc500, neutral500, stone500
- red500, orange500, amber500, yellow500, lime500
- green500, emerald500, teal500, cyan500, sky500
- blue500, indigo500, violet500, purple500, fuchsia500
- pink500, rose500

**Special Themes:**
- whatsappGreen - Original WhatsApp-inspired green theme

**Default Theme:** coolCyan (Cyan 600) - set in `colors.ts` active export

### 7.8 Adding New Themes

To add a new color palette:

1. **Define palette in colors.ts:**
```typescript
// Extension/src/styles/colors.ts
const customTheme = {
  brand: { /* ... */ },
  text: { /* ... */ },
  background: { /* ... */ },
  border: { /* ... */ },
  error: { /* ... */ },
  warning: { /* ... */ },
  success: { /* ... */ },
  loading: { /* ... */ },
  dev: { /* ... */ },
}

// Add to palettes export
export const palettes = {
  // ... existing themes
  customTheme,
}
```

2. **Add metadata to ThemeManager.ts:**
```typescript
// Extension/src/styles/ThemeManager.ts
export const THEME_METADATA: ThemeMetadata[] = [
  // ... existing themes
  {
    name: 'customTheme',
    displayName: 'Custom Theme',
    category: 'Custom',
    primaryColor: '#ff6b6b',
  },
]
```

3. **Set as active (optional):**
```typescript
// Extension/src/styles/colors.ts
export const colors = customTheme  // Default for build
```

**Theme Structure Requirements:**
- All semantic categories must be defined
- State colors (error, warning, success) should remain consistent for accessibility
- Dev mode colors can use same values across themes
- Test theme with all UI states (loading, error, success, etc.)

### 7.9 Persistence & Storage

**Storage Strategy:**
- Theme preference stored in `chrome.storage.local`
- Key: `'theme'`
- Value: Theme name string (e.g., `'coolCyan'`)
- Default: `'indigo500'` (hardcoded in ThemeManager)

**Initialization:**
```typescript
// Extension/src/styles/ThemeManager.ts
async initialize(): Promise<void> {
  const result = await chrome.storage.local.get('theme')
  if (result.theme && palettes[result.theme]) {
    this.currentTheme = result.theme
  }
  this.applyTheme(this.currentTheme)
}
```

**Persistence:**
```typescript
async setTheme(themeName: ThemeName): Promise<void> {
  this.currentTheme = themeName
  this.applyTheme(themeName)
  await chrome.storage.local.set({ theme: themeName })
}
```

### 7.10 Future Enhancements

**Potential Features:**
- Theme selector UI in sidebar settings
- Custom theme builder (user-defined colors)
- Automatic theme based on time of day
- Sync theme across devices via Chrome Sync
- Light/dark mode toggle (requires dual palette definitions)
- Theme preview before selection
- Export/import custom themes

**Accessibility Considerations:**
- All themes should maintain WCAG AA contrast ratios
- State colors (error, warning, success) should be distinguishable
- Focus indicators should be visible in all themes
- Test with screen readers and keyboard navigation

---

## 8. Testing Strategy

### 8.1 Testing Layers

**Unit Tests (Vitest):**
- **Target:** Utility functions, services, hooks (non-UI logic)
- **Location:** `tests/unit/`
- **Coverage:**
  - `utils/phone-parser.ts` - JID to phone conversion
  - `services/pipedrive.ts` - API functions (mocked fetch)
  - `services/encryption.ts` - Token encryption/decryption
  - Custom hooks logic (with React hooks testing utilities)

**Integration Tests (Vitest + Testing Library):**
- **Target:** Component interactions, user flows, context providers
- **Location:** `tests/integration/`
- **Coverage:**
  - PersonMatchedCard rendering with real data
  - PersonNoMatchState create & attach interactions
  - AuthContext state changes
  - usePipedrive hook integration (with chrome.runtime.sendMessage mocking)
  - Full App component in various states (person-matched, person-no-match, etc.)

**E2E Tests (Playwright):**
- **Target:** Full extension behavior in real Chrome
- **Location:** `tests/e2e/`
- **Coverage:**
  - Extension loads on WhatsApp Web
  - Sidebar injection and visibility
  - OAuth sign-in flow (using test Pipedrive account)
  - Chat switch triggers person lookup
  - Create person end-to-end
  - Attach to existing person end-to-end
  - Error states (network failures, API errors)

### 8.2 Test Environment Setup

**Mocking Strategy:**
- **Chrome APIs:** Mock `chrome.storage`, `chrome.runtime`, `chrome.identity`
- **Pipedrive API:** MSW (Mock Service Worker) for HTTP mocking
- **WhatsApp DOM:** Fixture HTML structures for different chat states
- **Sentry:** Mock in tests to prevent noise

**Test Data:**
- Fixture persons with various phone formats
- Test phone numbers and JIDs
- Mock OAuth tokens and responses

**Test Configuration:**
- Test files excluded from type-check (`tsconfig.json`): `tests/**/*`, `src/**/*.test.ts`, `src/**/*.test.tsx`
- Reason: Test files have different type requirements (@testing-library/jest-dom matchers)
- Production code has strict type checking, test code can be more lenient
- Tests are validated by running them, not by type-checking

**CI Considerations (Future):**
- Unit/integration run on every push
- E2E runs on pull requests (slower, more resource-intensive)
- Coverage reports generated (target: 80%+ for services/utils)

### 8.3 Testing Gaps & Lessons Learned

**Why Integration Tests Are Critical:**

The `selectedDealId` ReferenceError bug demonstrated the importance of integration testing:
- **Issue:** State defined in `App` component but not passed as props to `SidebarContent`
- **Root Cause:** No integration tests rendering full App component tree
- **Impact:** Bug reached production despite passing all existing tests
- **Lesson:** Unit tests alone aren't sufficient for prop-drilling validation

**Testing Best Practices:**

1. **Test Full Component Trees**
   - Integration tests catch prop-drilling bugs that unit tests miss
   - Render App component in various states (person-matched, person-no-match, with deals)
   - Verify state flows correctly from parent to child components

2. **Always Pass State Through Props**
   - Don't assume child components can access parent state
   - TypeScript catches these errors when type-check is run during build

3. **Run Type-Check Before Building**
   - Catches prop-drilling errors at compile-time
   - Prevents runtime ReferenceErrors
   - Zero cost at runtime (types are stripped)

4. **Fix Type Errors Immediately**
   - Don't let type errors accumulate
   - Each error makes the next harder to find
   - Use type assertions sparingly and only when interfacing with untyped code

**Prevention Checklist:**

Before adding features involving state management:
- [ ] Define prop interfaces explicitly
- [ ] Pass all required props to child components
- [ ] Run `npm run type-check` to verify
- [ ] Write integration tests for full component tree
- [ ] Test in browser before committing

---

## 9. Build & Development Workflow

### 9.1 Vite Configuration

**Build Targets:**
- **Content Script:** Bundle React app for injection into WhatsApp Web
- **Inspector Main:** MAIN world script for WhatsApp Web integration
- **Service Worker:** Separate bundle (no DOM APIs, service worker context)
- **Popup (optional):** Small standalone React app

**Vite Setup:**

The build system uses four separate Vite configurations to ensure proper source maps for Sentry:

1. **vite.content.config.ts** - Content script with IIFE format and `inlineDynamicImports: true`
2. **vite.inspector.config.ts** - Inspector script with IIFE format and `inlineDynamicImports: true`
3. **vite.dashboard-bridge.config.ts** - Dashboard bridge with IIFE format and `inlineDynamicImports: true`
4. **vite.config.ts** - Service worker, popup, and source map separation

**Build Command:**
```bash
# Four-pass build for accurate source maps
npm run build
# Executes:
# 1. vite build --config vite.content.config.ts --mode production
# 2. vite build --config vite.inspector.config.ts --mode production
# 3. vite build --config vite.dashboard-bridge.config.ts --mode production
# 4. vite build --mode production
```

**Main Vite Configuration:**
```typescript
// vite.config.ts structure
export default defineConfig({
  base: './', // CRITICAL: Enable relative asset loading for Chrome extensions
  build: {
    outDir: 'dist',
    emptyOutDir: false, // Don't wipe dist; earlier builds have emitted files
    rollupOptions: {
      input: {
        // content-script and inspector are built in separate configs
        'service-worker': resolve(__dirname, 'src/service-worker/index.ts'),
        popup: resolve(__dirname, 'src/popup/index.html'),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'service-worker') {
            return '[name].js'
          }
          return 'assets/[name].[hash].js'
        },
        // ... other output options
      }
    }
  },
  plugins: [
    react(),
    // separate-sourcemaps plugin (moves .map files to sourcemaps/)
  ]
})
```

**Chrome Extension Asset Loading:**
- **`base: './'`** - Essential for Chrome extensions. Vite defaults to absolute paths (`/assets/...`) which fail in extension context. Relative paths (`./assets/...`) ensure proper loading.
- Without this setting, CSS and JavaScript assets will fail to load with CORS or path resolution errors.

**Key Features:**
- TypeScript compilation
- Hot Module Replacement (HMR) for development
- Source maps for debugging (moved to separate `sourcemaps/` directory)
- Tree shaking and minification for production
- Tailwind CSS processing
- Sentry Debug ID injection (during source map upload)

**Critical: Content Script Single-File Bundling**

Chrome Manifest V3 content scripts do not support ES modules (no `type: "module"`). To avoid import/export issues, content scripts must be bundled as single files.

**Problem:**
```javascript
// Generated content-script.js (BROKEN - with code splitting)
import{j as e,r as i,c as a,R as c}from"./chunks/client.Ds7D3P6J.js"
// Chrome Error: Uncaught SyntaxError: Cannot use import statement outside a module
```

**Solution - Separate Build Configuration:**

Content scripts and bridges are built using separate Vite configs with IIFE format and `inlineDynamicImports: true`:

```typescript
// Extension/vite.content.config.ts
export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true, // First build, wipe dist
    sourcemap: true,
    rollupOptions: {
      input: resolve(__dirname, 'src/content-script/index.tsx'),
      output: {
        entryFileNames: 'content-script.js',
        format: 'iife', // Prevent global scope pollution with WhatsApp Web
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'content-script.css') {
            return 'assets/content-script.css'
          }
          return 'assets/[name].[hash].[ext]'
        },
        inlineDynamicImports: true, // Bundle as single file
      }
    }
  },
  plugins: [react()]
})
```

**How It Works:**

1. **First Build Pass** (vite.content.config.ts):
   - Builds content-script.js as single IIFE file with `inlineDynamicImports: true`
   - All React dependencies bundled inline (~142KB)
   - CSS is inlined into content-script.js and injected via `<style>` tag at runtime
   - No separate CSS file in dist/ (CSS handling changed from stable path to inline)
   - Source map: `content-script.js.map` (later moved to `sourcemaps/`)

2. **Second Build Pass** (vite.inspector.config.ts):
   - Builds inspector-main.js as single IIFE file with `inlineDynamicImports: true`
   - `emptyOutDir: false` preserves content-script.js from first pass
   - Source map: `inspector-main.js.map` (later moved to `sourcemaps/`)

3. **Third Build Pass** (vite.dashboard-bridge.config.ts):
   - Builds dashboard-bridge.js as single IIFE file with `inlineDynamicImports: true`
   - `emptyOutDir: false` preserves previous outputs
   - Source map: `dashboard-bridge.js.map` (later moved to `sourcemaps/`)

4. **Fourth Build Pass** (vite.config.ts):
   - Builds service-worker.js and popup.html
   - `emptyOutDir: false` preserves all content scripts from previous passes
   - Runs `separate-sourcemaps` plugin to move all `.map` files to `sourcemaps/`

**Build Output:**
- content-script.js: ~142KB (React + app code + CSS bundled as single IIFE file)
- inspector-main.js: Single IIFE file (no imports)
- dashboard-bridge.js: Single IIFE file (no imports)
- service-worker.js: Separate bundle
- No separate CSS files (CSS inlined into JavaScript)
- No import/export statements in content scripts
- All source maps moved to `sourcemaps/` directory

**Why This Approach:**
- **IIFE format:** Prevents global scope pollution with WhatsApp Web's own JavaScript
- **Single-file bundles:** Work reliably in Chrome Manifest V3 content script context
- **Accurate source maps:** Separate builds ensure each entry point has correct source maps for Sentry
- **Inlined CSS:** Eliminates need for stable CSS path in manifest.json, simplifies deployment
- **Security:** Source maps separated and never shipped to users

### 9.2 CSS in Content Scripts

**Tailwind CSS Integration:**

Content scripts require special CSS handling to avoid conflicts with host page styles (WhatsApp Web). The extension uses Tailwind CSS v3 with PostCSS for utility-first styling.

**Configuration:**
```javascript
// tailwind.config.js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

// postcss.config.js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

**CSS File Structure:**
```css
/* Extension/src/styles/content-script.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Sidebar container base styles */
#pipedrive-whatsapp-sidebar {
  box-sizing: border-box;
  font-family: system-ui, -apple-system, ...;
  font-size: 14px;
  line-height: 1.5;
}

/* Ensure box-sizing for all children */
#pipedrive-whatsapp-sidebar * {
  box-sizing: border-box;
}
```

**Critical: Avoid Aggressive CSS Resets**

**Problem:** Using `all: revert` or `all: unset` CSS resets will override all Tailwind utility classes, breaking component styling:

```css
/* ❌ BROKEN - Overrides all Tailwind utilities */
#pipedrive-whatsapp-sidebar * {
  all: revert;
  box-sizing: border-box;
}
```

When this reset is applied, utility classes like `text-sm`, `bg-white`, `rounded-lg`, etc., have no effect because `all: revert` resets ALL CSS properties, including those set by utility classes.

**Solution:** Use targeted resets only for necessary properties:

```css
/* ✅ WORKS - Minimal targeted reset */
#pipedrive-whatsapp-sidebar {
  box-sizing: border-box;
  font-family: system-ui, ...;
}

#pipedrive-whatsapp-sidebar * {
  box-sizing: border-box;  /* Only reset box-sizing */
}
```

**Build Process:**
1. Vite triggers PostCSS during CSS processing
2. Tailwind scans all `.tsx`/`.ts` files for utility class usage
3. Only used utility classes are included in output CSS
4. Final CSS bundle: ~10-11 KB (minified, before gzip)
5. CSS injected into content script via Vite's CSS import handling

**Best Practices:**
- Scope all custom styles to `#pipedrive-whatsapp-sidebar` selector
- Use Tailwind utilities instead of custom CSS when possible
- Avoid global style resets that affect utility classes
- Test CSS changes in production build (some issues only appear after minification)

### 9.3 Development Environment

**Local Development:**
- Navigate to `Extension/` directory: `cd Extension`
- `npm run dev` - Build in watch mode
- Load unpacked extension in Chrome (chrome://extensions)
- Select the `Extension/dist/` folder when loading
- Changes trigger rebuild, manual extension reload required
- Source maps enabled for debugging in DevTools

**Environment Variables:**

**Architecture Note:** The extension only communicates with the backend Azure Functions service. All Pipedrive API credentials (client_id, client_secret) are securely stored server-side. OAuth redirect URLs are dynamically constructed by the backend using the pattern `https://{extensionId}.chromiumapp.org/`, which Chrome recognizes as a special pattern that automatically closes OAuth popups.

```
# .env.development
# Sentry (disabled in dev)
VITE_SENTRY_DSN=your_sentry_dsn
VITE_SENTRY_ENABLED=false

# Environment
VITE_ENV=development

# Dev Indicator
VITE_SHOW_DEV_INDICATOR=true

# Backend OAuth Service
VITE_BACKEND_URL=http://localhost:7071

# .env.production
# Sentry (enabled in prod)
VITE_SENTRY_DSN=your_sentry_dsn
VITE_SENTRY_ENABLED=true

# Environment
VITE_ENV=production

# Dev Indicator
VITE_SHOW_DEV_INDICATOR=false

# Backend OAuth Service
VITE_BACKEND_URL=https://your-backend-url.azurewebsites.net
```

### 9.4 Code Quality Workflow

**Type Safety Enforcement:**

The build system enforces TypeScript type safety at multiple stages to prevent runtime errors:

1. **Build-time Type Checking** (`package.json`):
   ```json
   "build": "npm run type-check && node ./scripts/increment-version.cjs && ..."
   ```
   - Type errors fail the build **before** any compilation
   - Catches prop-drilling bugs (like `selectedDealId`) before deployment
   - Zero-cost abstraction - no runtime overhead, compile-time safety only

2. **Pre-commit Type Checking** (`.husky/pre-commit`):
   ```bash
   npm run type-check && npx lint-staged
   ```
   - Type errors caught **before** commits are created
   - Prevents accumulation of type debt
   - Works alongside existing ESLint and Prettier checks
   - Developers can't accidentally commit code with type errors

3. **Comprehensive Testing Script** (`package.json`):
   ```json
   "test:all": "npm run type-check && npm run lint && npm run test"
   ```
   - Single command to verify code quality before pushing
   - Ensures all checks pass: types, linting, and tests
   - Can be used in CI/CD pipelines

**Pre-commit Hooks (Husky + lint-staged):**
```json
// .husky/pre-commit
npm run type-check && npx lint-staged

// lint-staged config
{
  "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
  "*.{css,json,md}": ["prettier --write"]
}
```

**ESLint Configuration:**
- React recommended rules
- TypeScript strict rules
- React Hooks rules (prevent deps issues)
- Import sorting
- Unused vars detection

**Prettier Configuration:**
- Consistent formatting (semi-colons, quotes, spacing)
- Line width: 100 characters
- Integrated with Tailwind (class sorting plugin)

**TypeScript Configuration Highlights:**

Key fixes for production code type safety:

1. **Sentry Integration** (`src/content-script/sentry.ts`, `src/service-worker/sentry.ts`):
   - Added `BrowserOptions` type import and type assertion for `beforeSend`
   - Fixed type mismatch between `sanitizeEvent` and Sentry's expected type

2. **Window Type Extensions** (`src/types/window.d.ts`):
   - Global window type extensions for Sentry: `Sentry?: typeof SentryBrowser`

3. **WhatsApp Integration** (`src/content-script/utils/WhatsAppInspector.ts`):
   - Uses `// @ts-nocheck` directive for reverse-engineered WhatsApp internals
   - Reason: No type definitions exist for undocumented WhatsApp APIs

4. **Type Assertions** (`src/utils/sentryFilters.ts`):
   - Used sparingly for Sentry event sanitization
   - Documented why assertions are needed
   - Pattern: `sanitizeValue(data) as typeof data`

**Developer Workflow:**

Before committing:
```bash
npm run test:all  # Run all checks: type-check + lint + test
```

If type-check fails:
1. Fix the type errors (don't ignore them)
2. Use type assertions sparingly and only when necessary
3. Document why type assertions are needed

When adding new code:
- Define prop interfaces explicitly
- Pass all required props to child components
- Run `npm run type-check` frequently during development

---

## 10. Deployment & Distribution

### 10.1 Build Process

**Production Build:**
```bash
# Navigate to Extension directory
cd Extension

# Build for production
npm run build

# Output structure:
Extension/dist/
├── manifest.json           # Generated from public/manifest.json
├── content-script.js       # Bundled React sidebar app
├── service-worker.js       # Background script
├── popup.js               # Extension popup (optional)
├── popup.html
├── icons/
└── chunks/                # Code-split chunks
```

**Build Optimization:**
- Minification and tree-shaking
- CSS purging (Tailwind removes unused styles)
- Source maps excluded from production (security)
- Sentry source map upload (separate step, for debugging)

### 10.2 Chrome Web Store Submission

**Manual Deployment Process:**
1. Navigate to Extension directory: `cd Extension`
2. Run `npm run build` with production env
3. Test built extension locally (load unpacked from `Extension/dist/`)
4. Create ZIP archive of `Extension/dist/` folder
5. Upload to Chrome Web Store Developer Dashboard
6. Fill in store listing (description, screenshots, privacy policy)
7. Submit for review

**Store Listing Requirements:**
- Extension name and description
- Icons (128x128, 48x48, 16x16)
- Screenshots (1280x800 or 640x400)
- Privacy policy URL (required for OAuth and Sentry)
- Detailed permission justifications

**Review Considerations:**
- Manifest V3 compliance
- Clear permission justifications in listing
- Privacy policy disclosure (OAuth, Sentry, data handling)
- No obfuscated code (Vite bundles are readable)

### 10.3 Versioning Strategy

**Semantic Versioning:**
- Format: `MAJOR.MINOR.PATCH`
- MVP Launch: `1.0.0`
- Bug fixes: Increment PATCH (1.0.1)
- New features: Increment MINOR (1.1.0)
- Breaking changes: Increment MAJOR (2.0.0)

**Version Updates:**
- Update in `package.json` and `manifest.json`
- Manual process for MVP
- Git tags for releases (`v1.0.0`)

### 10.4 Release Phases (from BRD)

**Alpha (Internal):**
- Unpacked extension
- Internal team testing
- Pipedrive sandbox environment

**Beta (Private Testing):**
- Unlisted Chrome Web Store listing
- Share with select users via link
- Production Pipedrive API
- Gather feedback, iterate

**GA (Public Launch):**
- Public Chrome Web Store listing
- Production environment
- Monitoring via Sentry
- Support via GitHub issues or email

---

## 11. Error Handling & Monitoring

### 11.1 Error Categories & Handling

**API Errors:**
- **401 Unauthorized:** Clear auth state, prompt re-login
- **403 Forbidden:** Show "Permission denied" message
- **429 Rate Limited:** Show "Too many requests" message, allow manual retry
- **500 Server Error:** Retry automatically, log to Sentry
- **Network Error:** Show "Check connection" message, allow retry

**WhatsApp DOM Errors:**
- **JID extraction fails:** Show "Unable to detect chat" message
- **Chat type unsupported:** Show "1:1 chats only" notice
- **WhatsApp layout changed:** Graceful degradation, log to Sentry for hotfix

**Extension Errors:**
- **Storage access fails:** Fallback to session-only auth
- **OAuth flow interrupted:** Clear state, allow retry
- **Content script injection fails:** Log to Sentry, silent failure

**React Errors:**
- Error boundaries wrap major sections (sidebar, modals)
- Fallback UI with "Something went wrong" + reload button
- Errors logged to Sentry with component stack

### 11.2 Sentry Integration

**Initialization:**
```typescript
// Both content-script and service-worker initialize Sentry
Sentry.init({
  dsn: VITE_SENTRY_DSN,
  environment: import.meta.env.MODE, // 'development' or 'production'
  enabled: VITE_SENTRY_ENABLED,
  tracesSampleRate: 0.1, // 10% performance monitoring
  beforeSend: (event) => {
    // Strip PII: phone numbers, names, tokens
    return sanitizeEvent(event);
  }
})
```

**What Gets Logged:**
- Unhandled exceptions and promise rejections
- API errors (with sanitized request/response)
- Performance metrics (API call duration)
- Breadcrumbs (user actions: "Switched chat", "Clicked Create Person")
- User context (anonymous extension ID only, no real identity)

**What Gets Filtered:**
- Phone numbers (regex-based PII filter)
- Person names
- OAuth tokens and API keys
- WhatsApp message content (never accessed anyway)

**Source Maps and Debug IDs:**

The extension uses Sentry Debug IDs for reliable stack trace de-minification. Debug IDs are unique identifiers that link production JavaScript files to their source maps.

**Critical Workflow:**

1. **Build:** Run `npm run build` to create production bundles
2. **Upload:** Run `npm run upload-sourcemaps` to inject Debug IDs and upload to Sentry
3. **Reload:** **MUST reload the extension in Chrome** after upload
4. **Test:** Hard-refresh WhatsApp Web and reproduce errors

**Why Reload is Critical:**

- Debug IDs are injected into JavaScript files during `npm run upload-sourcemaps` (not during build)
- Chrome must run the JavaScript files that contain the injected Debug IDs
- Without reloading, the old code (without Debug IDs) is still running, causing source map mismatches
- Sentry will show "Missing source file with a matching Debug ID" errors if you skip this step

**Source Map Upload Script:**

```bash
# Extension/scripts/upload-sourcemaps.cjs
# 1. Injects Debug IDs into dist/*.js files
# 2. Uploads dist/*.js and sourcemaps/*.map to Sentry
# 3. Associates via Debug IDs (no release name required)
```

**Configuration:**

```bash
# Extension/.env.production
SENTRY_ORG=your-org-slug
SENTRY_PROJECT=your-project-slug
```

**Troubleshooting:**

- **"Missing source file with a matching Debug ID"** → Rebuild, re-upload, and reload extension
- **Stack traces still minified** → Verify Debug ID in Sentry Issue matches uploaded artifact
- **Source maps not found** → Check Sentry → Settings → Source Maps for uploaded files

See Extension/DEPLOYMENT.md for complete deployment workflow.

### 11.3 Logging Strategy

**Console Logging (Development):**
- `utils/logger.ts` wrapper around console
- Log levels: error, warn, info, debug
- Disabled in production (except errors to Sentry)

**User-Facing Messages:**
- Toast notifications for transient errors
- Inline error states for form validation
- Clear, actionable error messages (no technical jargon)
- Always provide retry or escape action

---

## 12. Performance & Optimization

### 12.1 Bundle Size Optimization

**Target Bundle Sizes:**
- Content script (with React + UI): ~150-200KB gzipped
- Service worker: ~20-30KB gzipped
- Popup (optional): ~50KB gzipped

**Optimization Strategies:**
- Tree-shaking via Vite (remove unused code)
- Tailwind CSS purging (only include used classes)
- Code splitting (lazy load modals, non-critical components)
- Minimize dependencies (evaluate each package size)
- Custom components with Tailwind CSS (no heavy UI library dependencies)

**Lazy Loading:**
```typescript
// Example: defer rarely used UI until needed
const PersonNoMatchState = lazy(() => import('./components/PersonNoMatchState'))
const PersonLookupError = lazy(() => import('./components/PersonLookupError'))
```

### 12.2 Runtime Performance

**DOM Observation:**
- Debounce chat switch detection (prevent rapid-fire queries)
- Use MutationObserver efficiently (disconnect when not needed)
- Throttle WhatsApp DOM queries

**API Request Optimization:**
- Debounce chat switches (200ms) to prevent rapid-fire lookups
- Simple fresh requests (no caching complexity for MVP)
- User can manually retry failed requests
- Future: Add caching if performance becomes an issue

**Rendering Performance:**
- React.memo for expensive components
- Virtual scrolling if person search returns many results
- Skeleton loading states (perceived performance)
- Avoid unnecessary re-renders (proper dependency arrays)

### 12.3 Memory Management

**Memory Efficiency:**
- No caching layer in MVP (minimal memory footprint)
- React component state only (cleared on unmount)
- No persistent data structures

**Service Worker Lifecycle:**
- Designed to be dormant (Manifest V3)
- No memory leaks from event listeners
- Cleanup on service worker termination

**Content Script:**
- Clean up MutationObserver on unload
- Remove injected DOM elements if needed
- No global variable pollution in WhatsApp's context

---

## 13. Constraints, Risks & Future Considerations

### 13.1 Technical Constraints

**Chrome Extension Limitations:**
- Manifest V3 service workers are ephemeral (~30s idle timeout)
- No persistent background process
- Content Security Policy restrictions (no eval, no inline scripts)
- Storage quota limits (chrome.storage.local: ~10MB)
- No access to chrome.identity API from content scripts (must use service worker)

**WhatsApp Web Dependencies:**
- Relies on WhatsApp's DOM structure (subject to change)
- JID format must remain stable for phone extraction
- No official WhatsApp API for extensions
- Changes require monitoring and quick hotfixes

**Pipedrive API:**
- Rate limits (exact limits depend on plan tier)
- Phone search must support exact match
- Custom phone field labels ("WhatsApp") must be supported
- OAuth token expiry requires refresh flow

### 13.2 Risk Mitigation

**WhatsApp DOM Changes:**
- **Risk:** WhatsApp updates break phone extraction
- **Mitigation:**
  - Isolate DOM selectors in single module
  - Multiple fallback strategies
  - Sentry alerts on extraction failures
  - Quick hotfix release process

**API Rate Limiting:**
- **Risk:** Heavy usage triggers Pipedrive rate limits
- **Mitigation:**
  - Debounce chat switches (200ms)
  - User-friendly error messages on 429 errors
  - Manual retry option (no automatic retries)
  - Future: Add caching if rate limiting becomes an issue

**Token Security:**
- **Risk:** Token theft from storage
- **Mitigation:**
  - Encryption with Web Crypto API
  - Minimal permissions (reduces attack surface)
  - Tokens auto-expire (OAuth refresh flow)

**Extension Store Rejection:**
- **Risk:** Chrome Web Store rejects due to permissions/privacy
- **Mitigation:**
  - Minimal permissions requested
  - Clear privacy policy
  - Detailed permission justifications
  - No obfuscated code

### 13.3 Future Architecture Considerations

**Implemented Features:**
- ✅ Notes integration (create notes from chat messages - Spec-130b)
- ✅ Deals integration (view, create deals with pipeline/stage management - Spec-131a/b, Spec-134)

**Post-MVP Features:**
- Group chat support (requires participant picker UI)
- Activities/Tasks management (requires activity type selection, due dates)
- Advanced deal management (update stages, mark won/lost, reopen deals)
- Phone normalization (add country detection service)
- Organizations (extend person linking model)
- Deal products and participants management

**Scalability:**
- Multi-CRM support (abstract Pipedrive service layer)
- Firefox/Edge extension (Web Extensions API compatibility)
- Telegram Web (similar architecture, different DOM extraction)
- Offline support (IndexedDB cache for offline resilience)

**Architecture Evolution:**
- Consider backend service for phone normalization/matching
- Webhook integration for bidirectional sync
- Analytics dashboard (aggregated usage metrics)

### 13.4 Documentation Requirements

**Developer Documentation:**
- Setup instructions (navigate to Extension/, npm install, load extension)
- Architecture overview (this document)
- API service documentation
- Testing guide
- Contributing guidelines
- Note: All extension code is under Extension/ directory

**User Documentation:**
- Installation guide
- OAuth setup walkthrough
- Feature tutorial (with screenshots/Loom video)
- Troubleshooting (common issues)
- Privacy policy (required for store listing)

---

## 14. Manifest V3 Configuration

### 14.1 Required Permissions

```json
{
  "manifest_version": 3,
  "name": "Pipedrive for WhatsApp Web",
  "version": "1.0.0",
  "permissions": [
    "storage",
    "tabs",
    "identity"
  ],
  "host_permissions": [
    "*://web.whatsapp.com/*"
  ],
  "background": {
    "service_worker": "service-worker.js"
  },
  "content_scripts": [
    {
      "matches": ["*://web.whatsapp.com/*"],
      "js": ["content-script.js"],
      "css": ["content-script.css"]
    }
  ],
  "action": {
    "default_popup": "popup.html",
    "default_icon": {
      "16": "icons/icon16.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    }
  }
}
```

### 14.2 Permission Justifications

- **storage:** Store encrypted OAuth tokens securely
- **tabs:** Detect WhatsApp Web tab state and navigation
- **identity:** Enable chrome.identity.launchWebAuthFlow() for OAuth
- **host_permissions (web.whatsapp.com):** Inject sidebar and extract chat data

---

## Appendix: Technology Decision Rationale

### Why React + TypeScript + Vite?
- **React:** Component reusability, rich ecosystem, team familiarity
- **TypeScript:** Type safety reduces bugs, better IDE support, scales well
- **Vite:** Fast builds, modern dev experience, excellent HMR

### Why NOT TanStack Query?
- **Decision:** Custom `usePipedrive()` hook is sufficient for MVP
- **Rationale:**
  - Simple use cases don't justify the added complexity
  - No need for caching, background refetching, or optimistic updates in MVP
  - Custom hook provides clean loading/error states with minimal code
  - Reduces bundle size (~15KB saved)
  - Can add TanStack Query later if caching becomes necessary

### Why NOT shadcn/ui?
- **Decision:** Custom React components with Tailwind CSS utility classes are sufficient for MVP
- **Rationale:**
  - Simple UI requirements (buttons, inputs, cards, forms) don't justify the added bundle size
  - shadcn/ui + Radix UI primitives would add 30-50 KB (doubling/tripling extension size)
  - No complex interactive components needed (modals, command palettes, dropdowns)
  - All required components (Features 8-11) built and tested without shadcn/ui
  - Tailwind utilities provide sufficient styling flexibility
  - Can add shadcn/ui post-MVP if complex components become necessary

### Why Sentry?
- Industry standard for error tracking
- Supports Chrome extensions natively
- Source maps for production debugging
- Performance monitoring included

### Why npm over pnpm/yarn/bun?
- Simplicity and universal compatibility
- No additional setup required
- Team preference for straightforward tooling

---

## 15. Feature Flags System

The extension supports runtime feature flags for gradual rollout and feature gating. Flags are simple boolean toggles controlled from the backend.

### How It Works

1. **Backend defines flags** in Azure App Settings (`FeatureFlags__flagName=true/false`)
2. **Extension fetches flags** via `/api/config` on startup (alongside pipelines/stages)
3. **Flags are cached** in `chrome.storage.local` for resilience
4. **Components check flags** using the `useFeatureFlags()` hook
5. **Disabled features are hidden** — UI elements don't render when their flag is `false`

### Quick Reference

| Aspect | Value |
|--------|-------|
| Storage | Azure App Settings |
| Delivery | `/api/config` response |
| Refresh | On page load only |
| Backend default | Missing App Setting → `false` (opt-in) |
| Extension fallback | Backend unreachable → `false` (fail-safe) |
| Access | `useFeatureFlags()` hook |

### Usage Pattern

```tsx
const { isEnabled } = useFeatureFlags(config?.featureFlags);

{isEnabled('enableDeals') && <DealsSection />}
```

### Adding New Flags

1. Add property to backend `FeatureFlagsSettings.cs`
2. Add to `FeatureFlagsDto.cs` and map in `GetConfigFunction`
3. Add to extension `FeatureFlags` type
4. Wrap UI with `isEnabled()` checks

**Full specification:** [Spec-140: Feature Flags System](../Specs/Spec-140-Feature-Flags-System.md)

---

## Related Documentation

- [Website Architecture](Website-Architecture.md) - User dashboard web application architecture
- [UI Design Specification](UI-Design-Specification.md) - Complete UI design specification with visual system
- [BRD-001: MVP Pipedrive WhatsApp](../BRDs/BRD-001-MVP-Pipedrive-WhatsApp.md) - Business requirements for the MVP

---

**End of Architecture Document**
