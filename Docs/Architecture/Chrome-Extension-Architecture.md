# Chrome Extension Architecture
## Pipedrive × WhatsApp Web Integration

**Date:** 2025-10-25
**Version:** 1.0
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
- **UI Components:** shadcn/ui (Tailwind CSS + Radix UI)
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
│   │   │   ├── ui/             # shadcn/ui components
│   │   │   ├── PersonCard.tsx
│   │   │   ├── CreatePersonModal.tsx
│   │   │   └── AttachPersonModal.tsx
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

**Primary UI States:**
1. **Not Authenticated:** Sign-in prompt with Pipedrive branding
2. **No Chat Selected:** Idle state, instructions
3. **Group Chat / Unsupported:** "1:1 chats only" message
4. **Loading:** Skeleton UI while querying Pipedrive
5. **Person Matched:** Person card with details + "Open in Pipedrive"
6. **No Match:** Create Person + Attach to Existing buttons
7. **Create Flow:** Modal with form (name, email optional)
8. **Attach Flow:** Search modal with person picker
9. **Success:** Confirmation + Person card
10. **Error:** Clear error message + retry action

**Visual Consistency:**
- All states use consistent spacing and typography
- Error states never block return to safe state
- Loading states show immediate feedback (<100ms)
- Success states include clear next actions

---

## 7. Testing Strategy

### 7.1 Testing Layers

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
  - PersonCard rendering with real data
  - CreatePersonModal form validation and submission
  - AttachPersonModal search and selection flow
  - AuthContext state changes
  - usePipedrive hook integration (with chrome.runtime.sendMessage mocking)

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

### 7.2 Test Environment Setup

**Mocking Strategy:**
- **Chrome APIs:** Mock `chrome.storage`, `chrome.runtime`, `chrome.identity`
- **Pipedrive API:** MSW (Mock Service Worker) for HTTP mocking
- **WhatsApp DOM:** Fixture HTML structures for different chat states
- **Sentry:** Mock in tests to prevent noise

**Test Data:**
- Fixture persons with various phone formats
- Test phone numbers and JIDs
- Mock OAuth tokens and responses

**CI Considerations (Future):**
- Unit/integration run on every push
- E2E runs on pull requests (slower, more resource-intensive)
- Coverage reports generated (target: 80%+ for services/utils)

---

## 8. Build & Development Workflow

### 8.1 Vite Configuration

**Build Targets:**
- **Content Script:** Bundle React app for injection into WhatsApp Web
- **Service Worker:** Separate bundle (no DOM APIs, service worker context)
- **Popup (optional):** Small standalone React app

**Vite Setup:**
```typescript
// vite.config.ts structure
export default defineConfig({
  base: './', // CRITICAL: Enable relative asset loading for Chrome extensions
  build: {
    rollupOptions: {
      input: {
        'content-script': 'src/content-script/index.tsx',
        'service-worker': 'src/service-worker/index.ts',
        'popup': 'src/popup/index.tsx'
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: 'chunks/[name].[hash].js'
      }
    }
  },
  plugins: [
    react(),
    // Chrome extension specific plugins
  ]
})
```

**Chrome Extension Asset Loading:**
- **`base: './'`** - Essential for Chrome extensions. Vite defaults to absolute paths (`/assets/...`) which fail in extension context. Relative paths (`./assets/...`) ensure proper loading.
- Without this setting, CSS and JavaScript assets will fail to load with CORS or path resolution errors.

**Key Features:**
- TypeScript compilation
- Hot Module Replacement (HMR) for development
- Source maps for debugging
- Tree shaking and minification for production
- Tailwind CSS processing

**Critical: Content Script Module Bundling**

Chrome Manifest V3 content scripts do not support ES modules (no `type: "module"`). When Vite builds multiple entry points (content-script, popup, service-worker) that share dependencies (React), it automatically code-splits shared libraries into separate chunk files with ES6 import/export statements. This breaks content scripts.

**Problem:**
```javascript
// Generated content-script.js (BROKEN)
import{j as e,r as i,c as a,R as c}from"./chunks/client.Ds7D3P6J.js"
// Chrome Error: Uncaught SyntaxError: Cannot use import statement outside a module
```

**Solution - Custom Vite Plugin (`inline-chunks`):**

The plugin inlines all chunk dependencies into content-script.js at build time:

```typescript
// Extension/vite.config.ts
{
  name: 'inline-chunks',
  closeBundle() {
    const contentScriptPath = resolve(__dirname, 'dist/content-script.js')
    const chunksDir = resolve(__dirname, 'dist/chunks')

    if (existsSync(contentScriptPath) && existsSync(chunksDir)) {
      let contentScript = readFileSync(contentScriptPath, 'utf-8')
      const importRegex = /import\{([^}]+)\}from"\.\/chunks\/([^"]+)"/g
      const matches = [...contentScript.matchAll(importRegex)]

      if (matches.length > 0) {
        const chunksToInline = new Map()

        // Collect chunk contents and variable mappings
        for (const match of matches) {
          const importedVars = match[1]
          const chunkFileName = match[2]
          const chunkFile = resolve(__dirname, 'dist/chunks', chunkFileName)

          if (existsSync(chunkFile) && !chunksToInline.has(chunkFileName)) {
            let chunkContent = readFileSync(chunkFile, 'utf-8')

            // Remove export statement from chunk
            const exportRegex = /export\{([^}]+)\};?\s*$/m
            const exportMatch = chunkContent.match(exportRegex)

            if (exportMatch) {
              const exportedVars = exportMatch[1]
              chunkContent = chunkContent.replace(exportRegex, '')
              chunksToInline.set(chunkFileName, {
                content: chunkContent,
                exports: exportedVars,
                imports: importedVars
              })
            }
          }
        }

        // Inline chunks with proper variable scoping
        for (const [chunkFileName, { content, exports, imports }] of chunksToInline) {
          // Build export name to actual variable mapping
          // exports format: "Td as R,Io as c,Ld as j,$u as r"
          const exportMap = new Map()
          for (const pair of exports.split(',').map(s => s.trim())) {
            const parts = pair.split(' as ')
            if (parts.length === 2) {
              const [actualVar, exportedAs] = parts
              exportMap.set(exportedAs, actualVar)
            }
          }

          // Wrap chunk in IIFE to prevent variable name collisions
          const preservedVars = Array.from(exportMap.values())
          const returnStatement = `return {${preservedVars.join(',')}};`
          const iife = `const __chunk__=(function(){${content}${returnStatement}})();`

          // Map imported names to chunk variables
          // imports format: "j as e,r as i,c as a,R as c"
          const adjustedMappings = []
          for (const pair of imports.split(',').map(s => s.trim())) {
            const parts = pair.split(' as ')
            if (parts.length === 2) {
              const [importedName, localName] = parts
              const actualVar = exportMap.get(importedName)
              if (actualVar) {
                adjustedMappings.push(`const ${localName}=__chunk__.${actualVar};`)
              }
            }
          }

          const inlinedCode = iife + '\n' + adjustedMappings.join('')

          // Replace import statement with inlined code
          const firstImportRegex = new RegExp(
            `import\\{[^}]+\\}from"\\.\/chunks\/${chunkFileName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`
          )
          contentScript = contentScript.replace(firstImportRegex, inlinedCode)
        }

        // Remove any remaining import statements (duplicates in string literals)
        contentScript = contentScript.replace(
          /import\{[^}]+\}from"\.\/chunks\/[^"]+"/g,
          '/* chunk already inlined */'
        )

        writeFileSync(contentScriptPath, contentScript)
        console.log('✓ Inlined chunks into content-script.js')
      }
    }
  }
}
```

**How It Works:**

1. **Detects chunk imports** in content-script.js after Vite build completes
2. **Reads chunk files** (e.g., `chunks/client.Ds7D3P6J.js` containing React)
3. **Removes export statements** from chunk content
4. **Wraps chunk in IIFE** to create isolated scope and prevent variable name collisions with content script code
5. **Creates variable mappings** from import names to actual chunk variables via `__chunk__` object
6. **Replaces import statements** with the IIFE + variable declarations
7. **Result**: Single self-contained content-script.js file (~142KB) with no import/export statements

**Why IIFE is Critical:**

The inlined React chunk contains minified variable names (like `var b=`) that can collide with content script variables. Wrapping in an IIFE creates a closure scope:

```javascript
// WITHOUT IIFE (BROKEN - variable collision)
var b={exports:{}}; // From React chunk
async function b(){...} // Content script function - COLLISION!

// WITH IIFE (WORKS - isolated scope)
const __chunk__=(function(){
  var b={exports:{}}; // Scoped to IIFE
  return {Td,Io,Ld,$u}; // Only exports needed
})();
const e=__chunk__.Ld; // Map to content script variables
async function b(){...} // Content script function - NO COLLISION
```

**Build Output:**
- content-script.js: ~142KB (React + app code bundled)
- No import/export statements
- Works in Chrome content script context
- Popup and service-worker still use normal code-splitting

### 8.2 CSS in Content Scripts

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

### 8.3 Development Environment

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

### 8.4 Code Quality Workflow

**Pre-commit Hooks (Husky + lint-staged):**
```json
// .husky/pre-commit
npx lint-staged

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

---

## 9. Deployment & Distribution

### 9.1 Build Process

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

### 9.2 Chrome Web Store Submission

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

### 9.3 Versioning Strategy

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

### 9.4 Release Phases (from BRD)

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

## 10. Error Handling & Monitoring

### 10.1 Error Categories & Handling

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

### 10.2 Sentry Integration

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

### 10.3 Logging Strategy

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

## 11. Performance & Optimization

### 11.1 Bundle Size Optimization

**Target Bundle Sizes:**
- Content script (with React + UI): ~150-200KB gzipped
- Service worker: ~20-30KB gzipped
- Popup (optional): ~50KB gzipped

**Optimization Strategies:**
- Tree-shaking via Vite (remove unused code)
- Tailwind CSS purging (only include used classes)
- Code splitting (lazy load modals, non-critical components)
- Minimize dependencies (evaluate each package size)
- shadcn/ui components (only copy what's needed, not full library)

**Lazy Loading:**
```typescript
// Lazy load modals (not needed on initial render)
const CreatePersonModal = lazy(() => import('./components/CreatePersonModal'))
const AttachPersonModal = lazy(() => import('./components/AttachPersonModal'))
```

### 11.2 Runtime Performance

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

### 11.3 Memory Management

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

## 12. Constraints, Risks & Future Considerations

### 12.1 Technical Constraints

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

### 12.2 Risk Mitigation

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

### 12.3 Future Architecture Considerations

**Post-MVP Features (from BRD Section 11):**
- Group chat support (requires participant picker UI)
- Activities/Notes (new API endpoints, more complex UI)
- Deals integration (pipeline views, stage management)
- Phone normalization (add country detection service)
- Organizations (extend person linking model)

**Scalability:**
- Multi-CRM support (abstract Pipedrive service layer)
- Firefox/Edge extension (Web Extensions API compatibility)
- Telegram Web (similar architecture, different DOM extraction)
- Offline support (IndexedDB cache for offline resilience)

**Architecture Evolution:**
- Consider backend service for phone normalization/matching
- Webhook integration for bidirectional sync
- Analytics dashboard (aggregated usage metrics)

### 12.4 Documentation Requirements

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

## 13. Manifest V3 Configuration

### 13.1 Required Permissions

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

### 13.2 Permission Justifications

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

### Why shadcn/ui?
- Customizable (copy-paste, not locked into npm package)
- Built on Radix UI (accessibility built-in)
- Tailwind-based (consistent with modern stack)
- Lightweight (only include what's needed)

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

**End of Architecture Document**
