# Spec-104: WhatsApp Chat Detection & Phone Extraction

**Feature:** Feature 4 - WhatsApp Chat Detection & Phone Extraction
**Date:** 2025-10-25
**Status:** Split into two parts (see below)
**Dependencies:** Feature 3 (WhatsApp Web Sidebar Injection)

---

## Implementation Split

This specification has been split into two implementation phases:

### Part 1: WhatsApp Contact Extraction Research ✅ **COMPLETED**
- **Status:** Complete (v0.31.0)
- **PR:** #1 - [WhatsApp contact extraction research and implementation](https://github.com/fav83/whatsapp2pipe/pull/1)
- **Scope:** Section 4.2 - WhatsApp Internal State Research
- **Deliverables:**
  - ✅ WhatsAppInspector utility implemented (`Extension/src/content-script/utils/WhatsAppInspector.ts`)
  - ✅ Module Raid approach tested and documented
  - ✅ DOM Parsing approach tested and documented (deferred to Parking Lot)
  - ✅ Architecture documentation created:
    - [WhatsApp-Contact-Extraction-Module-Raid.md](../Architecture/WhatsApp-Contact-Extraction-Module-Raid.md)
    - [WhatsApp-Contact-Extraction-DOM-Parsing.md](../Architecture/WhatsApp-Contact-Extraction-DOM-Parsing.md)
  - ✅ Parking Lot updated with DOM parsing future work
- **Key Findings:**
  - Module Raid successfully extracts phone (+prefix), contact name, chat type
  - DOM Parsing partially working but not production-ready (close button issue)
  - Module Raid chosen as primary method for MVP

### Part 2: Chat Detection & Production Integration 📋 **NOT STARTED**
- **Status:** Not Started
- **Scope:** Sections 4.1, 4.3-4.7 - Full production implementation
- **Deliverables:**
  - ChatDetector orchestrator (UrlMonitor + HeaderObserver)
  - Production extraction abstractions (JidExtractor, PhoneParser, WhatsAppChatExtractor)
  - UI components (ContactWarningCard, GroupChatState)
  - App.tsx integration with automatic chat detection
  - Complete test suite
- **Blockers:** None - ready to start after Part 1 merge

---
**Related Docs:**
- [BRD-001-MVP-Pipedrive-WhatsApp.md](../BRDs/BRD-001-MVP-Pipedrive-WhatsApp.md)
- [Chrome-Extension-Architecture.md](../Architecture/Chrome-Extension-Architecture.md)
- [Plan-001-MVP-Feature-Breakdown.md](../Plans/Plan-001-MVP-Feature-Breakdown.md)
- [Spec-103-WhatsApp-Sidebar-Injection.md](Spec-103-WhatsApp-Sidebar-Injection.md)

---

## 1. Overview

Implement robust detection of WhatsApp chat switches and extraction of contact information (JID, display name, phone number) to enable automatic Pipedrive person lookup. This feature bridges WhatsApp Web's UI with the extension's sidebar, providing the core data foundation for all Pipedrive integration features.

**Why this matters:** Without reliable chat detection and phone extraction, the extension cannot automatically match WhatsApp conversations to Pipedrive contacts. This is the critical data layer that enables the entire MVP value proposition.

**Scope Note:** This feature focuses solely on detection and extraction. Pipedrive API integration and person lookup are handled in later features (Features 5-9).

---

## 2. Objectives

- Detect when user switches to a different chat in WhatsApp Web
- Extract JID (Jabber ID) from WhatsApp's internal state
- Parse phone number from JID with minimal normalization
- Extract contact display name from WhatsApp DOM
- Distinguish between 1:1 chats and group chats
- Update sidebar state with extracted data
- Handle extraction failures gracefully with user-facing warnings
- Provide abstraction layer for easy maintenance when WhatsApp changes

---

## 3. Architecture Overview

### 3.1 Component Structure

```
Extension/src/content-script/
├── chat-detection/
│   ├── chat-detector.ts           # Main detection orchestrator
│   ├── url-monitor.ts              # URL hash change detection
│   ├── header-observer.ts          # MutationObserver on header
│   └── types.ts                    # Shared types
├── whatsapp-extractor/
│   ├── whatsapp-inspector.ts       # Research utility (dev mode only)
│   ├── chat-extractor.ts           # Main extraction class
│   ├── jid-extractor.ts            # JID extraction strategies
│   ├── phone-parser.ts             # Phone number normalization
│   └── types.ts                    # WhatsApp data types
└── App.tsx                         # Updated with chat detection integration
```

### 3.2 Data Flow

```
User switches chat in WhatsApp Web
    ↓
URL changes (#/chat/48123123123@c.us) OR Header content mutates
    ↓
ChatDetector detects change (debounced 250ms)
    ↓
App state → { type: 'loading' }
    ↓
WhatsAppChatExtractor.getCurrentChat() called
    ↓
    ├─ Extract JID (3 attempts, 100ms apart)
    ├─ Extract display name from header
    └─ Detect group vs 1:1 from JID suffix
    ↓
Success?
    ├─ YES (1:1 with phone):
    │   └─ State → { type: 'contact', name, phone }
    │
    ├─ YES (1:1 without phone):
    │   └─ State → { type: 'contact-warning', name, warning }
    │
    ├─ Group chat:
    │   └─ State → { type: 'group-chat' }
    │
    └─ FAIL:
        └─ State → { type: 'error', message, onRetry }
```

---

## 4. Functional Requirements

### 4.1 Chat Switch Detection 📋 **PART 2 - NOT STARTED**

**Description:** Detect when the user switches to a different chat in WhatsApp Web.

**Status:** 📋 Not Started - Part 2 implementation

#### 4.1.1 URL Monitoring (Primary Method)

**Implementation:**

```typescript
// Extension/src/content-script/chat-detection/url-monitor.ts

export class UrlMonitor {
  private currentHash: string = ''
  private callback: (chatId: string | null) => void

  constructor(callback: (chatId: string | null) => void) {
    this.callback = callback
    this.currentHash = window.location.hash
  }

  start(): void {
    // Listen for hash changes
    window.addEventListener('hashchange', this.handleHashChange)

    // Check initial state
    this.handleHashChange()
  }

  stop(): void {
    window.removeEventListener('hashchange', this.handleHashChange)
  }

  private handleHashChange = (): void => {
    const newHash = window.location.hash

    if (newHash === this.currentHash) {
      return // No change
    }

    this.currentHash = newHash
    const chatId = this.extractChatIdFromHash(newHash)
    this.callback(chatId)
  }

  private extractChatIdFromHash(hash: string): string | null {
    // WhatsApp URL patterns:
    // #/            -> No chat selected
    // #/chat/48123123123@c.us -> 1:1 chat
    // #/chat/123456789@g.us -> Group chat

    const chatMatch = hash.match(/#\/chat\/([^\/]+)/)
    return chatMatch ? chatMatch[1] : null
  }
}
```

**Behavior:**
- Listens to `hashchange` event on window
- Extracts chat ID from URL hash (format: `#/chat/{jid}`)
- Triggers callback with chat ID or `null` if no chat selected
- Handles page load state (initial hash check)

**Acceptance Criteria:**
- [ ] Detects chat switches via URL changes
- [ ] Extracts JID from URL hash correctly
- [ ] Handles "no chat selected" state (hash = `#/`)
- [ ] Works on initial page load
- [ ] Cleanup on component unmount

#### 4.1.2 Header MutationObserver (Backup Method)

**Implementation:**

```typescript
// Extension/src/content-script/chat-detection/header-observer.ts

export class HeaderObserver {
  private observer: MutationObserver | null = null
  private callback: () => void
  private lastHeaderText: string = ''

  constructor(callback: () => void) {
    this.callback = callback
  }

  start(): void {
    const header = document.querySelector('header[role="banner"]')

    if (!header) {
      console.warn('[HeaderObserver] Header element not found')
      return
    }

    this.lastHeaderText = this.getHeaderText(header)

    this.observer = new MutationObserver(() => {
      const newText = this.getHeaderText(header)

      if (newText !== this.lastHeaderText) {
        this.lastHeaderText = newText
        this.callback()
      }
    })

    this.observer.observe(header, {
      childList: true,
      subtree: true,
      characterData: true
    })

    console.log('[HeaderObserver] Started observing header')
  }

  stop(): void {
    if (this.observer) {
      this.observer.disconnect()
      this.observer = null
    }
  }

  private getHeaderText(header: Element): string {
    const nameSpan = header.querySelector('span[dir="auto"]')
    return nameSpan?.textContent || ''
  }
}
```

**Behavior:**
- Observes `header[role="banner"]` for DOM mutations
- Triggers callback when header text changes (contact name change)
- Acts as backup when URL doesn't change but chat does
- Minimal performance impact (checks text content only)

**Acceptance Criteria:**
- [ ] Observes header element for changes
- [ ] Detects contact name changes
- [ ] Triggers callback only when text actually changes (not on every mutation)
- [ ] Cleanup disconnects observer properly
- [ ] Handles case where header element doesn't exist

#### 4.1.3 Chat Detection Orchestrator

**Implementation:**

```typescript
// Extension/src/content-script/chat-detection/chat-detector.ts

import { UrlMonitor } from './url-monitor'
import { HeaderObserver } from './header-observer'

export type ChatDetectionCallback = () => void

export class ChatDetector {
  private urlMonitor: UrlMonitor
  private headerObserver: HeaderObserver
  private callback: ChatDetectionCallback
  private debounceTimer: number | null = null
  private readonly DEBOUNCE_MS = 250

  constructor(callback: ChatDetectionCallback) {
    this.callback = callback

    this.urlMonitor = new UrlMonitor(this.handleDetection)
    this.headerObserver = new HeaderObserver(this.handleDetection)
  }

  start(): void {
    console.log('[ChatDetector] Starting detection')
    this.urlMonitor.start()
    this.headerObserver.start()
  }

  stop(): void {
    console.log('[ChatDetector] Stopping detection')
    this.urlMonitor.stop()
    this.headerObserver.stop()

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
    }
  }

  private handleDetection = (): void => {
    // Debounce to avoid rapid-fire calls
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
    }

    this.debounceTimer = window.setTimeout(() => {
      console.log('[ChatDetector] Chat change detected')
      this.callback()
    }, this.DEBOUNCE_MS)
  }
}
```

**Behavior:**
- Combines URL monitoring and header observation
- Debounces detection by 250ms to handle rapid chat switches
- Single callback for all detection methods
- Clean start/stop lifecycle

**Acceptance Criteria:**
- [ ] Starts both URL and header detection
- [ ] Debounces rapid chat switches (250ms)
- [ ] Calls callback only once per debounced change
- [ ] Proper cleanup on stop
- [ ] No memory leaks from timers

---

### 4.2 WhatsApp Internal State Research ✅ **PART 1 - COMPLETED**

**Description:** Research phase to identify the most reliable method for accessing WhatsApp's internal React state to extract JID and chat data.

**Status:** ✅ Complete (v0.31.0)
**Implementation:** [Extension/src/content-script/utils/WhatsAppInspector.ts](../../../Extension/src/content-script/utils/WhatsAppInspector.ts)
**Documentation:**
- [WhatsApp-Contact-Extraction-Module-Raid.md](../Architecture/WhatsApp-Contact-Extraction-Module-Raid.md)
- [WhatsApp-Contact-Extraction-DOM-Parsing.md](../Architecture/WhatsApp-Contact-Extraction-DOM-Parsing.md)

#### 4.2.1 WhatsApp Inspector Utility (Implemented) ✅

**Actual Implementation:** [Extension/src/content-script/utils/WhatsAppInspector.ts](../../../Extension/src/content-script/utils/WhatsAppInspector.ts)

The WhatsAppInspector utility was implemented as a development tool that tests two extraction methods:

**Method 1: Webpack Module Raid** ✅ **PRIMARY METHOD**
- Intercepts WhatsApp's internal webpack modules
- Extracts JID (Jabber ID) from active chat
- Parses phone number from JID with E.164 format (+prefix)
- Extracts contact name from internal state
- Detects chat type (individual vs group)
- **Status:** Working reliably on WhatsApp v2.3000+
- **Documentation:** [WhatsApp-Contact-Extraction-Module-Raid.md](../Architecture/WhatsApp-Contact-Extraction-Module-Raid.md)

**Method 2: DOM Parsing** ⏸️ **DEFERRED TO PARKING LOT**
- Programmatically opens contact info panel
- Searches DOM for phone numbers using regex
- Extracts formatted phone numbers with spaces
- **Issues:** Close button detection broken on v2.3000+, visual side effects
- **Status:** Implemented but disabled, moved to Parking Lot
- **Documentation:** [WhatsApp-Contact-Extraction-DOM-Parsing.md](../Architecture/WhatsApp-Contact-Extraction-DOM-Parsing.md)

**Usage:**
1. Build extension: `npm run build` (from Extension/ directory)
2. Load extension in Chrome
3. Navigate to WhatsApp Web
4. Open browser console
5. Run `window.__whatsappInspector.run()` to test extraction

**Results:**
- ✅ Module Raid successfully extracts: phone (+34679297297), name (Massimo Magnani), chat type (individual)
- ⏸️ DOM Parsing works but has close button issue - deferred to future work
- ✅ Module Raid chosen as primary extraction method for MVP

**Acceptance Criteria:**
- ✅ Inspector runs in MAIN world (has access to WhatsApp internals)
- ✅ Tests Module Raid extraction method
- ✅ Tests DOM Parsing extraction method (disabled in production)
- ✅ Logs comprehensive results to console
- ✅ Exposes global debug function: `window.__whatsappInspector`
- ✅ Documented findings in architecture docs

#### 4.2.2 Research Documentation (Completed) ✅

**Completed Documentation:**
- ✅ [WhatsApp-Contact-Extraction-Module-Raid.md](../Architecture/WhatsApp-Contact-Extraction-Module-Raid.md)
- ✅ [WhatsApp-Contact-Extraction-DOM-Parsing.md](../Architecture/WhatsApp-Contact-Extraction-DOM-Parsing.md)

**Research Findings Summary:**

**WhatsApp Web Version Tested:** v2.3000.1028950586

**METHOD 1: Webpack Module Raid**
- **Status:** Available
- **Reliability:** High
- **Structure:** WhatsApp v2.3000+ uses Comet architecture with `require('__debug').modulesMap`
- **Extraction:** Successfully extracts JID, phone (+prefix), name, chat type from internal modules
- **Example Output:**
  ```
  JID: 34679297297@c.us
  Phone: +34679297297
  Name: Massimo Magnani
  Type: individual
  ```

**METHOD 2: DOM Parsing**
- **Status:** Partially Available
- **Reliability:** Medium-Low
- **Structure:** Opens contact info panel via header click, searches DOM for phone regex
- **Issues:** Close button detection broken, visual side effects
- **Example Output:**
  ```
  Phone: +34 679 29 72 97 (formatted with spaces)
  Name: Massimo Magnani (Gran Canaria Airbnb)
  ```

**CHOSEN METHOD: Webpack Module Raid**
- **Reason:** Fast, reliable, no visual side effects, works on v2.3000+
- **Fallback:** DOM Parsing deferred to Parking Lot (needs close button fix)
- **Trade-off:** Phone format is compact (+34679297297) instead of formatted (+34 679 29 72 97)

**Acceptance Criteria:**
- ✅ All methods tested and documented
- ✅ Best method chosen with clear reasoning
- ✅ Fallback strategy documented (DOM in Parking Lot)
- ✅ Example data structures captured in docs
- ✅ Date and WhatsApp version recorded

---

### 4.3 JID Extraction 📋 **PART 2 - NOT STARTED**

**Description:** Extract the JID (Jabber ID) from WhatsApp's internal state using the method identified during research.

**Status:** 📋 Not Started - Part 2 implementation
**Note:** This section will use the Module Raid method identified in Part 1 (Section 4.2)

#### 4.3.1 JID Extractor with Multiple Strategies

**Implementation:**

```typescript
// Extension/src/content-script/whatsapp-extractor/jid-extractor.ts

export interface JidExtractionResult {
  jid: string | null
  method: string | null
  attempts: number
}

export class JidExtractor {
  /**
   * Extract JID with retry logic
   */
  async extractJid(maxAttempts: number = 3, delayMs: number = 100): Promise<JidExtractionResult> {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const result = this.tryExtractJid()

      if (result.jid) {
        console.log(`[JID Extractor] Success on attempt ${attempt} using ${result.method}`)
        return { ...result, attempts: attempt }
      }

      if (attempt < maxAttempts) {
        await this.delay(delayMs)
      }
    }

    console.warn(`[JID Extractor] Failed after ${maxAttempts} attempts`)
    return { jid: null, method: null, attempts: maxAttempts }
  }

  private tryExtractJid(): Omit<JidExtractionResult, 'attempts'> {
    // Try methods in priority order
    const methods = [
      { name: 'window.Store', fn: () => this.extractFromWindowStore() },
      { name: 'React Fiber', fn: () => this.extractFromReactFiber() },
      { name: 'Webpack', fn: () => this.extractFromWebpack() }
    ]

    for (const { name, fn } of methods) {
      try {
        const jid = fn()
        if (jid) {
          return { jid, method: name }
        }
      } catch (error) {
        console.debug(`[JID Extractor] ${name} failed:`, error)
      }
    }

    return { jid: null, method: null }
  }

  private extractFromWindowStore(): string | null {
    // Implementation based on research findings
    // TODO: Update after research phase

    // @ts-expect-error - WhatsApp internals
    const activeChat = window.Store?.Chat?.getActive?.()
    return activeChat?.id || null
  }

  private extractFromReactFiber(): string | null {
    // Implementation based on research findings
    // TODO: Update after research phase
    return null
  }

  private extractFromWebpack(): string | null {
    // Implementation based on research findings
    // TODO: Update after research phase
    return null
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}
```

**Behavior:**
- Tries up to 3 times to extract JID (configurable)
- 100ms delay between attempts (handles timing issues)
- Tests multiple methods in priority order
- Returns JID, method used, and number of attempts
- Logs success/failure for monitoring

**Acceptance Criteria:**
- [ ] Extracts JID successfully when WhatsApp state is ready
- [ ] Retries up to 3 times with delays
- [ ] Tries multiple extraction methods
- [ ] Returns method name that succeeded (for telemetry)
- [ ] Handles timing issues gracefully
- [ ] Logs attempts and results

---

### 4.4 Phone Number Parsing 📋 **PART 2 - NOT STARTED**

**Description:** Parse phone number from JID with minimal normalization.

**Status:** 📋 Not Started - Part 2 implementation

**Implementation:**

```typescript
// Extension/src/content-script/whatsapp-extractor/phone-parser.ts

export interface PhoneParseResult {
  phone: string | null
  isGroup: boolean
  originalJid: string
}

export class PhoneParser {
  /**
   * Parse phone number from JID
   * Minimal normalization: remove suffix, keep only digits
   */
  parsePhone(jid: string): PhoneParseResult {
    if (!jid) {
      return { phone: null, isGroup: false, originalJid: jid }
    }

    // Detect group chat by suffix
    const isGroup = jid.endsWith('@g.us')

    if (isGroup) {
      return { phone: null, isGroup: true, originalJid: jid }
    }

    // Extract phone from 1:1 chat JID
    // Format: 48123123123@c.us
    const phoneMatch = jid.match(/^([0-9]+)@c\.us$/)

    if (!phoneMatch) {
      console.warn('[Phone Parser] Unexpected JID format:', jid)
      return { phone: null, isGroup: false, originalJid: jid }
    }

    const phone = phoneMatch[1]

    console.log('[Phone Parser] Parsed phone:', phone, 'from JID:', jid)
    return { phone, isGroup: false, originalJid: jid }
  }
}
```

**Normalization Rules:**
- Remove `@c.us` or `@g.us` suffix
- Keep only digits (no formatting)
- No country code detection or modification
- No validation beyond format check

**Examples:**
- Input: `48123123123@c.us` → Output: `48123123123`
- Input: `1234567890@c.us` → Output: `1234567890`
- Input: `123456@g.us` → Output: `null` (group chat)

**Acceptance Criteria:**
- [ ] Extracts digits from JID correctly
- [ ] Preserves leading zeros
- [ ] Detects group chats via `@g.us` suffix
- [ ] Returns null for group chats
- [ ] Returns null for malformed JIDs
- [ ] Logs parsing results
- [ ] No country code heuristics applied

---

### 4.5 Display Name Extraction 📋 **PART 2 - NOT STARTED**

**Description:** Extract contact display name from WhatsApp header DOM.

**Status:** 📋 Not Started - Part 2 implementation

**Implementation:**

```typescript
// Extension/src/content-script/whatsapp-extractor/chat-extractor.ts (partial)

export class WhatsAppChatExtractor {
  /**
   * Extract display name from header
   */
  extractDisplayName(): string | null {
    const header = document.querySelector('header[role="banner"]')

    if (!header) {
      console.warn('[Chat Extractor] Header not found')
      return null
    }

    // Primary selector: first span with dir="auto"
    const nameSpan = header.querySelector('span[dir="auto"]')
    const name = nameSpan?.textContent?.trim()

    if (!name) {
      console.warn('[Chat Extractor] Display name not found in header')
      return null
    }

    console.log('[Chat Extractor] Extracted display name:', name)
    return name
  }
}
```

**Behavior:**
- Queries `header[role="banner"]` element
- Finds first `span[dir="auto"]` (contains contact/group name)
- Returns trimmed text content
- Returns `null` if header or name not found

**Acceptance Criteria:**
- [ ] Extracts display name from header
- [ ] Handles missing header gracefully
- [ ] Returns null if name element not found
- [ ] Trims whitespace from name
- [ ] Logs extraction result

---

### 4.6 Complete Chat Extraction 📋 **PART 2 - NOT STARTED**

**Description:** Orchestrate all extraction steps into a single interface.

**Status:** 📋 Not Started - Part 2 implementation

**Implementation:**

```typescript
// Extension/src/content-script/whatsapp-extractor/chat-extractor.ts

import { JidExtractor } from './jid-extractor'
import { PhoneParser } from './phone-parser'

export interface ChatData {
  jid: string | null
  phone: string | null
  displayName: string | null
  isGroup: boolean
  extractionMethod: string | null
}

export class WhatsAppChatExtractor {
  private jidExtractor: JidExtractor
  private phoneParser: PhoneParser

  constructor() {
    this.jidExtractor = new JidExtractor()
    this.phoneParser = new PhoneParser()
  }

  /**
   * Extract complete chat data with retry logic
   */
  async getCurrentChat(): Promise<ChatData> {
    console.log('[Chat Extractor] Extracting current chat data...')

    // Extract JID (with retries)
    const { jid, method: extractionMethod } = await this.jidExtractor.extractJid(3, 100)

    // Parse phone from JID
    const { phone, isGroup } = this.phoneParser.parsePhone(jid || '')

    // Extract display name from DOM
    const displayName = this.extractDisplayName()

    const chatData: ChatData = {
      jid,
      phone,
      displayName,
      isGroup,
      extractionMethod
    }

    console.log('[Chat Extractor] Extraction complete:', chatData)
    return chatData
  }

  /**
   * Extract display name from header (implementation from 4.5)
   */
  private extractDisplayName(): string | null {
    // Implementation from section 4.5
    const header = document.querySelector('header[role="banner"]')
    if (!header) return null

    const nameSpan = header.querySelector('span[dir="auto"]')
    return nameSpan?.textContent?.trim() || null
  }
}
```

**Behavior:**
- Extracts JID with retry logic (up to 3 attempts)
- Parses phone number from JID
- Extracts display name from DOM
- Detects group chats
- Returns complete `ChatData` object
- Logs full extraction result

**Acceptance Criteria:**
- [ ] Orchestrates all extraction steps
- [ ] Returns complete chat data structure
- [ ] Handles partial failures (e.g., JID fails but name succeeds)
- [ ] Logs comprehensive extraction results
- [ ] Includes extraction method for telemetry

---

### 4.7 Sidebar State Integration 📋 **PART 2 - NOT STARTED**

**Description:** Integrate chat detection and extraction with sidebar state management.

**Status:** 📋 Not Started - Part 2 implementation

#### 4.7.1 Extended State Types

**Implementation:**

```typescript
// Extension/src/content-script/App.tsx (updated)

type SidebarState =
  | { type: 'welcome' }
  | { type: 'loading' }
  | { type: 'contact'; name: string; phone: string }
  | { type: 'contact-warning'; name: string; warning: string }
  | { type: 'group-chat' }
  | { type: 'error'; message: string; onRetry: () => void }
```

**New States:**
- `contact-warning`: 1:1 chat but phone extraction failed
- `group-chat`: User selected a group chat (unsupported)

#### 4.7.2 Contact Warning Component

**Implementation:**

```tsx
// Extension/src/content-script/components/ContactWarningCard.tsx

interface ContactWarningCardProps {
  name: string
  warning: string
}

export function ContactWarningCard({ name, warning }: ContactWarningCardProps) {
  return (
    <div className="mx-5 mt-5">
      {/* Contact name card */}
      <div className="p-4 bg-[#f0f2f5] rounded-lg mb-3">
        <div className="text-base font-semibold text-[#111b21]">
          {name}
        </div>
      </div>

      {/* Warning message */}
      <div className="flex items-start gap-2 p-3 bg-[#fff4e5] border border-[#ffcc00] rounded-lg">
        <span className="text-[#e9730c] text-lg">⚠️</span>
        <div className="flex-1">
          <p className="text-sm text-[#111b21] font-medium mb-1">
            Phone number unavailable
          </p>
          <p className="text-xs text-[#667781]">
            {warning}
          </p>
        </div>
      </div>
    </div>
  )
}
```

**Visual Specifications:**
- Contact name in standard card (same as ContactInfoCard)
- Warning box below with yellow/amber colors
- Warning icon (⚠️) on left
- Two-line message: bold title + explanation
- WhatsApp-compatible color scheme

**Acceptance Criteria:**
- [ ] Displays contact name prominently
- [ ] Shows warning message clearly
- [ ] Uses amber/yellow warning colors
- [ ] Icon visible and appropriately sized
- [ ] Text is readable and concise

#### 4.7.3 Group Chat Component

**Implementation:**

```tsx
// Extension/src/content-script/components/GroupChatState.tsx

export function GroupChatState() {
  return (
    <div className="px-5 pt-5">
      <div className="p-4 bg-[#f0f2f5] rounded-lg">
        <p className="text-sm text-[#667781] text-center">
          Group chats are not supported
        </p>
        <p className="text-xs text-[#667781] text-center mt-2">
          Please select a 1:1 chat to view contact information
        </p>
      </div>
    </div>
  )
}
```

**Visual Specifications:**
- Gray info box (not error red)
- Centered text
- Two-line message: main message + instruction
- Same styling as other info states

**Acceptance Criteria:**
- [ ] Clear message about group chat limitation
- [ ] Suggests action (select 1:1 chat)
- [ ] Styled consistently with other states
- [ ] Not alarming (info, not error)

#### 4.7.4 App Integration with Chat Detection

**Implementation:**

```tsx
// Extension/src/content-script/App.tsx (complete integration)

import { useState, useEffect } from 'react'
import { ChatDetector } from './chat-detection/chat-detector'
import { WhatsAppChatExtractor } from './whatsapp-extractor/chat-extractor'
import { WelcomeState } from './components/WelcomeState'
import { ContactInfoCard } from './components/ContactInfoCard'
import { ContactWarningCard } from './components/ContactWarningCard'
import { GroupChatState } from './components/GroupChatState'
import { LoadingState } from './components/LoadingState'
import { ErrorState } from './components/ErrorState'

type SidebarState =
  | { type: 'welcome' }
  | { type: 'loading' }
  | { type: 'contact'; name: string; phone: string }
  | { type: 'contact-warning'; name: string; warning: string }
  | { type: 'group-chat' }
  | { type: 'error'; message: string; onRetry: () => void }

export default function App() {
  const [state, setState] = useState<SidebarState>({ type: 'welcome' })

  useEffect(() => {
    const chatExtractor = new WhatsAppChatExtractor()
    const chatDetector = new ChatDetector(async () => {
      await handleChatSwitch(chatExtractor, setState)
    })

    chatDetector.start()

    // Cleanup on unmount
    return () => {
      chatDetector.stop()
    }
  }, [])

  return (
    <div className="h-full flex flex-col bg-white border-l border-[#d1d7db]">
      <header className="flex-shrink-0 px-5 py-4 border-b border-[#d1d7db]">
        <h1 className="text-[17px] font-semibold text-[#111b21]">Pipedrive</h1>
      </header>

      <main className="flex-1 overflow-y-auto">
        <SidebarContent state={state} setState={setState} />
      </main>
    </div>
  )
}

/**
 * Handle chat switch detection
 */
async function handleChatSwitch(
  extractor: WhatsAppChatExtractor,
  setState: React.Dispatch<React.SetStateAction<SidebarState>>
) {
  console.log('[App] Chat switch detected')

  // Show loading state
  setState({ type: 'loading' })

  try {
    // Extract chat data
    const chatData = await extractor.getCurrentChat()

    // Determine state based on extraction results
    if (!chatData.displayName) {
      // No chat selected or couldn't extract anything
      setState({ type: 'welcome' })
      return
    }

    if (chatData.isGroup) {
      // Group chat detected
      setState({ type: 'group-chat' })
      return
    }

    if (chatData.phone) {
      // 1:1 chat with phone extracted successfully
      setState({
        type: 'contact',
        name: chatData.displayName,
        phone: chatData.phone
      })
      return
    }

    // 1:1 chat but phone extraction failed
    setState({
      type: 'contact-warning',
      name: chatData.displayName,
      warning: 'Searching by name only - matching may be less accurate'
    })

  } catch (error) {
    console.error('[App] Chat extraction failed:', error)

    setState({
      type: 'error',
      message: 'Unable to detect chat information',
      onRetry: () => handleChatSwitch(extractor, setState)
    })
  }
}

function SidebarContent({
  state,
  setState
}: {
  state: SidebarState
  setState: React.Dispatch<React.SetStateAction<SidebarState>>
}) {
  switch (state.type) {
    case 'welcome':
      return <WelcomeState />
    case 'loading':
      return <LoadingState />
    case 'contact':
      return <ContactInfoCard name={state.name} phone={state.phone} />
    case 'contact-warning':
      return <ContactWarningCard name={state.name} warning={state.warning} />
    case 'group-chat':
      return <GroupChatState />
    case 'error':
      return <ErrorState message={state.message} onRetry={state.onRetry} />
  }
}
```

**Flow:**
1. App mounts → Start ChatDetector
2. User switches chat → ChatDetector fires callback
3. Show loading state
4. Extract chat data (JID, phone, name, isGroup)
5. Determine appropriate state:
   - No name → welcome
   - Group → group-chat
   - 1:1 with phone → contact
   - 1:1 without phone → contact-warning
   - Error → error with retry
6. Update state → UI re-renders

**Acceptance Criteria:**
- [ ] Chat detector starts on mount
- [ ] Chat detector stops on unmount (cleanup)
- [ ] Loading state shown during extraction
- [ ] Correct state chosen based on extraction results
- [ ] Error handling with retry functionality
- [ ] All state transitions work smoothly
- [ ] No memory leaks from detector

---

## 5. Non-Functional Requirements

### 5.1 Performance

- **Detection latency:** < 300ms from chat switch to sidebar update start
- **Extraction latency:** < 500ms for complete chat data extraction
- **Debounce overhead:** 250ms maximum delay for rapid chat switches
- **Memory usage:** Chat detector should not leak memory on repeated switches
- **CPU usage:** MutationObserver should have minimal CPU impact

### 5.2 Reliability

- **JID extraction success rate:** > 95% when WhatsApp state is stable
- **Display name extraction:** 100% when header element exists
- **Group detection accuracy:** 100% (based on JID suffix)
- **Retry effectiveness:** 3 attempts should handle timing issues in most cases
- **Graceful degradation:** Extension remains functional even if JID extraction fails

### 5.3 Maintainability

- **Abstraction layer:** Clear separation between detection and extraction
- **Documentation:** All WhatsApp internal access methods documented
- **Research artifacts:** Inspector utility preserved for future updates
- **Logging:** Comprehensive console logs for debugging
- **Sentry integration:** All extraction failures logged with context

### 5.4 Compatibility

- **WhatsApp Web versions:** Current production version (as of 2025-10-25)
- **Browser:** Chrome 120+ (Manifest V3)
- **Screen sizes:** Works at all screen sizes (sidebar always 350px)
- **WhatsApp languages:** Works regardless of WhatsApp language setting

---

## 6. Testing Strategy

### 6.1 Unit Tests

```typescript
// tests/unit/phone-parser.test.ts

import { describe, it, expect } from 'vitest'
import { PhoneParser } from '../../src/content-script/whatsapp-extractor/phone-parser'

describe('PhoneParser', () => {
  const parser = new PhoneParser()

  describe('parsePhone', () => {
    it('extracts phone from 1:1 chat JID', () => {
      const result = parser.parsePhone('48123123123@c.us')

      expect(result.phone).toBe('48123123123')
      expect(result.isGroup).toBe(false)
      expect(result.originalJid).toBe('48123123123@c.us')
    })

    it('preserves leading zeros', () => {
      const result = parser.parsePhone('0048123123123@c.us')

      expect(result.phone).toBe('0048123123123')
    })

    it('detects group chats', () => {
      const result = parser.parsePhone('123456789@g.us')

      expect(result.phone).toBeNull()
      expect(result.isGroup).toBe(true)
    })

    it('handles malformed JIDs', () => {
      const result = parser.parsePhone('invalid-jid')

      expect(result.phone).toBeNull()
      expect(result.isGroup).toBe(false)
    })

    it('handles empty JID', () => {
      const result = parser.parsePhone('')

      expect(result.phone).toBeNull()
      expect(result.isGroup).toBe(false)
    })
  })
})
```

```typescript
// tests/unit/url-monitor.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { UrlMonitor } from '../../src/content-script/chat-detection/url-monitor'

describe('UrlMonitor', () => {
  beforeEach(() => {
    // Reset location hash
    window.location.hash = ''
  })

  it('extracts chat ID from hash', () => {
    const callback = vi.fn()
    const monitor = new UrlMonitor(callback)

    window.location.hash = '#/chat/48123123123@c.us'
    window.dispatchEvent(new HashChangeEvent('hashchange'))

    expect(callback).toHaveBeenCalledWith('48123123123@c.us')
  })

  it('returns null for no chat selected', () => {
    const callback = vi.fn()
    const monitor = new UrlMonitor(callback)

    window.location.hash = '#/'
    window.dispatchEvent(new HashChangeEvent('hashchange'))

    expect(callback).toHaveBeenCalledWith(null)
  })

  it('does not trigger callback for same hash', () => {
    const callback = vi.fn()
    const monitor = new UrlMonitor(callback)

    window.location.hash = '#/chat/123@c.us'
    window.dispatchEvent(new HashChangeEvent('hashchange'))

    callback.mockClear()

    // Same hash again
    window.dispatchEvent(new HashChangeEvent('hashchange'))

    expect(callback).not.toHaveBeenCalled()
  })

  it('cleans up event listener on stop', () => {
    const callback = vi.fn()
    const monitor = new UrlMonitor(callback)

    monitor.start()
    monitor.stop()

    window.location.hash = '#/chat/123@c.us'
    window.dispatchEvent(new HashChangeEvent('hashchange'))

    expect(callback).not.toHaveBeenCalled()
  })
})
```

### 6.2 Integration Tests

```typescript
// tests/integration/chat-detection.test.tsx

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import App from '../../src/content-script/App'

describe('Chat Detection Integration', () => {
  beforeEach(() => {
    // Mock WhatsApp DOM
    document.body.innerHTML = `
      <header role="banner">
        <span dir="auto">John Doe</span>
      </header>
    `

    // Mock window.Store (or chosen method)
    // @ts-expect-error - Mocking WhatsApp internals
    window.Store = {
      Chat: {
        getActive: () => ({
          id: '48123123123@c.us',
          name: 'John Doe',
          isGroup: false
        })
      }
    }
  })

  it('shows contact info when chat is detected', async () => {
    render(<App />)

    // Initial state: welcome
    expect(screen.getByText('Select a chat to view contact information')).toBeInTheDocument()

    // Simulate chat switch
    window.location.hash = '#/chat/48123123123@c.us'
    window.dispatchEvent(new HashChangeEvent('hashchange'))

    // Should show loading
    await waitFor(() => {
      expect(screen.getByRole('status')).toBeInTheDocument() // Loading spinner
    })

    // Should show contact info
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('48123123123')).toBeInTheDocument()
    })
  })

  it('shows group chat message for groups', async () => {
    // @ts-expect-error - Mocking WhatsApp internals
    window.Store.Chat.getActive = () => ({
      id: '123456789@g.us',
      name: 'Team Group',
      isGroup: true
    })

    render(<App />)

    window.location.hash = '#/chat/123456789@g.us'
    window.dispatchEvent(new HashChangeEvent('hashchange'))

    await waitFor(() => {
      expect(screen.getByText('Group chats are not supported')).toBeInTheDocument()
    })
  })

  it('shows warning when JID extraction fails', async () => {
    // @ts-expect-error - Mocking WhatsApp internals
    window.Store.Chat.getActive = () => null

    render(<App />)

    window.location.hash = '#/chat/48123123123@c.us'
    window.dispatchEvent(new HashChangeEvent('hashchange'))

    await waitFor(() => {
      expect(screen.getByText('Phone number unavailable')).toBeInTheDocument()
      expect(screen.getByText('John Doe')).toBeInTheDocument() // Name still shown
    })
  })
})
```

### 6.3 Manual Testing Checklist

**Chat Detection:**
- [ ] Switching between 1:1 chats updates sidebar immediately
- [ ] Selecting a group chat shows "not supported" message
- [ ] Deselecting a chat returns to welcome state
- [ ] Rapid chat switching (clicking multiple chats quickly) works smoothly
- [ ] Chat detection works on initial page load (opening WhatsApp Web with chat already selected)
- [ ] Chat detection works after page refresh

**Data Extraction:**
- [ ] Phone number extracted correctly from various JID formats
- [ ] Display name shown correctly in sidebar
- [ ] Leading zeros in phone numbers preserved
- [ ] Group chats detected correctly (100% accuracy)
- [ ] JID extraction succeeds on first attempt (most cases)
- [ ] Retry logic handles timing issues when WhatsApp state loads slowly

**Error Handling:**
- [ ] Warning message shown when phone extraction fails
- [ ] Contact name still shown even when phone unavailable
- [ ] Error state shown when extraction completely fails
- [ ] Retry button works and re-attempts extraction
- [ ] No crashes or blank states on any chat type

**State Transitions:**
- [ ] Loading spinner shown during extraction
- [ ] Smooth transition from loading to contact/warning/error
- [ ] No flickering or UI jumps during transitions
- [ ] All states render correctly

**Performance:**
- [ ] Chat detection latency < 300ms
- [ ] No lag when switching between chats
- [ ] No memory leaks after 50+ chat switches
- [ ] CPU usage remains low during idle

### 6.4 E2E Tests (Playwright)

```typescript
// tests/e2e/chat-detection.spec.ts

import { test, expect } from '@playwright/test'

test('detects and displays chat information', async ({ page, context }) => {
  // Note: Requires WhatsApp Web login
  await page.goto('https://web.whatsapp.com')

  // Wait for WhatsApp to load
  await page.waitForSelector('div[role="grid"]', { timeout: 30000 })

  // Wait for sidebar
  await page.waitForSelector('#pipedrive-whatsapp-sidebar')

  // Should show welcome state initially
  const welcomeText = await page.textContent('#pipedrive-whatsapp-sidebar main')
  expect(welcomeText).toContain('Select a chat')

  // Click on a chat (assuming at least one chat exists)
  const firstChat = await page.waitForSelector('div[role="grid"] > div[role="row"]')
  await firstChat.click()

  // Wait for chat to load
  await page.waitForSelector('header[role="banner"] span[dir="auto"]')

  // Sidebar should show contact info or warning
  await page.waitForTimeout(1000) // Wait for debounce + extraction

  const sidebarContent = await page.textContent('#pipedrive-whatsapp-sidebar main')

  // Should show either:
  // - Contact name + phone (success)
  // - Contact name + warning (partial success)
  // - Group chat message (group)
  expect(sidebarContent).toBeTruthy()
  expect(sidebarContent).not.toContain('Select a chat') // Not welcome state anymore
})
```

**Note:** E2E tests require manual WhatsApp Web login and may be brittle. Focus on unit and integration tests for CI/CD.

---

## 7. Implementation Plan

### Part 1: Research & Foundation ✅ **COMPLETED**

**Actual Time:** 8-10 hours (including troubleshooting, documentation, and git workflow)

**Completed Tasks:**
1. ✅ Created WhatsAppInspector utility
2. ✅ Tested Module Raid and DOM Parsing methods on live WhatsApp Web
3. ✅ Documented findings in comprehensive architecture docs
4. ✅ Chose Module Raid as primary method, DOM Parsing deferred
5. ✅ Created detailed documentation

**Delivered:**
- ✅ `Extension/src/content-script/utils/WhatsAppInspector.ts`
- ✅ `Extension/src/content-script/inspector-main.ts` (MAIN world entry point)
- ✅ [WhatsApp-Contact-Extraction-Module-Raid.md](../Architecture/WhatsApp-Contact-Extraction-Module-Raid.md)
- ✅ [WhatsApp-Contact-Extraction-DOM-Parsing.md](../Architecture/WhatsApp-Contact-Extraction-DOM-Parsing.md)
- ✅ Updated [Parking-Lot.md](../Plans/Parking-Lot.md) with DOM parsing entry
- ✅ PR #1 merged

---

### Part 2: Production Implementation 📋 **NOT STARTED**

**Estimated Time:** 12-17 hours

#### Phase 1: Detection Infrastructure (2-3 hours) 📋

**Tasks:**
1. Implement UrlMonitor class
2. Implement HeaderObserver class
3. Implement ChatDetector orchestrator
4. Write unit tests for detection classes
5. Test detection on live WhatsApp Web

**Deliverables:**
- `chat-detection/url-monitor.ts`
- `chat-detection/header-observer.ts`
- `chat-detection/chat-detector.ts`
- Unit tests passing

#### Phase 2: Production Extraction Classes (3-4 hours) 📋

**Tasks:**
6. Implement JidExtractor based on Module Raid (from Part 1)
7. Implement PhoneParser with normalization
8. Implement display name extraction
9. Implement WhatsAppChatExtractor orchestrator
10. Write unit tests for extraction classes
11. Test extraction on various chat types

**Deliverables:**
- `whatsapp-extractor/jid-extractor.ts`
- `whatsapp-extractor/phone-parser.ts`
- `whatsapp-extractor/chat-extractor.ts`
- Unit tests passing

#### Phase 3: UI Integration (2-3 hours) 📋

**Tasks:**
12. Extend SidebarState types
13. Create ContactWarningCard component
14. Create GroupChatState component
15. Integrate ChatDetector with App.tsx
16. Implement handleChatSwitch logic
17. Write integration tests

**Deliverables:**
- Updated `App.tsx`
- `components/ContactWarningCard.tsx`
- `components/GroupChatState.tsx`
- Integration tests passing

#### Phase 4: Testing & Polish (2-3 hours) 📋

**Tasks:**
18. Complete manual testing checklist
19. Fix any bugs found during testing
20. Add console logging for debugging
21. Test error handling and retry flows
22. Verify performance requirements met
23. Update documentation

**Deliverables:**
- All tests passing
- Manual testing checklist complete
- Documentation updated
- Feature ready for review

**Part 2 Total Estimated Time:** 9-13 hours
**Overall Total (Part 1 + Part 2):** 17-23 hours

---

## 8. Error Handling & Edge Cases

### 8.1 Extraction Failures

**Scenario:** JID extraction fails after 3 attempts

**Behavior:**
- Display name still shown if available
- Show warning: "Phone number unavailable - searching by name only"
- Allow user to proceed with name-based search
- Log failure to Sentry with context

**User Impact:** Reduced matching accuracy, but extension remains functional

### 8.2 Malformed JIDs

**Scenario:** JID extracted but doesn't match expected format

**Behavior:**
- Parse attempt returns `null` for phone
- Treat as extraction failure (show warning)
- Log malformed JID to Sentry (for monitoring WhatsApp changes)

**User Impact:** Same as extraction failure

### 8.3 Missing Display Name

**Scenario:** Header element exists but name extraction fails

**Behavior:**
- Return to welcome state (no chat selected)
- Do not show error state
- Log warning to console

**User Impact:** Sidebar shows "Select a chat" message

### 8.4 Group Chat Detection

**Scenario:** User selects a group chat

**Behavior:**
- Detect via JID suffix (`@g.us`)
- Show group-chat state with clear message
- Do not attempt phone extraction
- Do not show error state

**User Impact:** Clear guidance to select 1:1 chat instead

### 8.5 Rapid Chat Switching

**Scenario:** User clicks through multiple chats quickly

**Behavior:**
- Debounce detection by 250ms
- Cancel in-progress extraction when new chat selected
- Only process the final chat in the sequence
- Show loading state during debounce

**User Impact:** Smooth experience, no lag or duplicate requests

### 8.6 WhatsApp State Not Ready

**Scenario:** Chat just opened, WhatsApp internal state not initialized yet

**Behavior:**
- Retry extraction 3 times with 100ms delays
- Most timing issues resolved by retries
- If all retries fail, show warning state

**User Impact:** Slight delay (< 500ms) but successful extraction in most cases

### 8.7 WhatsApp DOM Changes

**Scenario:** WhatsApp Web update changes DOM structure

**Behavior:**
- Header selector fails → display name extraction returns null
- JID extraction may still work (internal state more stable)
- Show appropriate state based on what succeeded
- Log failures to Sentry for monitoring

**User Impact:** Partial degradation, alerts dev team to update selectors

---

## 9. Monitoring & Observability

### 9.1 Console Logging

**Development Mode:**
- All extraction attempts logged with results
- Detection events logged (URL changes, header mutations)
- State transitions logged
- Method used for JID extraction logged

**Production Mode:**
- Errors only (failures logged to Sentry)
- Critical events (extraction method changes)

### 9.2 Sentry Integration

**Events to Track:**
- JID extraction failures (with attempt count)
- Malformed JID formats (with sanitized examples)
- Display name extraction failures
- Detection method changes (e.g., window.Store stopped working)
- Unexpected error states

**Context to Include:**
- Extraction method attempted
- Number of retry attempts
- WhatsApp Web version (if detectable)
- Browser version
- Sanitized error messages (no PII)

**PII Filtering:**
- Never log actual phone numbers
- Never log contact names
- Never log full JIDs
- Log only extraction method and success/failure

### 9.3 Telemetry Metrics (Future)

**Potential Metrics:**
- JID extraction success rate by method
- Average extraction latency
- Retry attempt distribution
- Most common error types
- Detection latency (chat switch to sidebar update)

---

## 10. Dependencies & Blockers

**Dependencies:**
- Feature 3 (WhatsApp Web Sidebar Injection) - ✅ Complete
- React and TypeScript setup - ✅ Complete
- Tailwind CSS configured - ✅ Complete

**External Dependencies:**
- WhatsApp Web's internal structure (unstable)
- WhatsApp Web DOM selectors (may change with updates)

**Potential Blockers:**
- WhatsApp Web update that changes internal state access
- WhatsApp Web update that changes DOM structure
- Browser security restrictions on accessing page globals

**Mitigation Strategies:**
- Multiple extraction methods with fallbacks
- Abstraction layer for easy updates
- Comprehensive error handling
- Sentry monitoring for early detection of breakage
- Regular manual testing on WhatsApp Web updates

---

## 11. Acceptance Criteria Summary

### Part 1: Research ✅ **COMPLETED**

**✅ Research & Investigation:**
- ✅ WhatsAppInspector utility created
- ✅ Module Raid method tested and working
- ✅ DOM Parsing method tested (deferred)
- ✅ Phone extraction working (+prefix)
- ✅ Contact name extraction working
- ✅ Chat type detection working
- ✅ Research findings documented comprehensively

**✅ Documentation:**
- ✅ Module Raid approach documented
- ✅ DOM Parsing approach documented
- ✅ Architecture decisions recorded
- ✅ Code comments comprehensive
- ✅ Parking Lot updated with future work

---

### Part 2: Production Implementation 📋 **NOT STARTED**

**📋 Core Functionality:**
- [ ] Chat switches detected via URL changes
- [ ] Chat switches detected via header mutations (backup)
- [ ] Detection debounced by 250ms
- [ ] JID extracted with retry logic (3 attempts)
- [ ] Phone number parsed from JID correctly
- [ ] Display name extracted from header
- [ ] Group chats detected via JID suffix
- [ ] Sidebar state updated based on extraction results

**📋 UI States:**
- [ ] Loading state shown during extraction
- [ ] Contact card shown with phone (success case)
- [ ] Warning card shown without phone (partial success)
- [ ] Group chat message shown for groups
- [ ] Error state shown on complete failure
- [ ] Retry button works in error state

**📋 Error Handling:**
- [ ] Extraction failures handled gracefully
- [ ] User warned when phone unavailable
- [ ] Extension remains functional on failures
- [ ] All errors logged to Sentry

**📋 Performance:**
- [ ] Detection latency < 300ms
- [ ] Extraction latency < 500ms
- [ ] No memory leaks from detector
- [ ] No performance degradation after many switches

**📋 Testing:**
- [ ] All unit tests passing (>80% coverage)
- [ ] All integration tests passing
- [ ] Manual testing checklist complete
- [ ] No regressions in existing features

---

## 12. Future Enhancements (Parking Lot)

**Not in MVP Scope:**

1. **Phone Number Heuristics**
   - Country code detection and normalization
   - Multiple format attempts for Pipedrive matching
   - Requires: Phone number library, country detection logic

2. **Advanced Group Chat Support**
   - Participant selection for group chats
   - Multiple person lookup for group members
   - Requires: Complete UX redesign, more complex state management

3. **Extraction Method Auto-Switching**
   - Automatically switch methods when one stops working
   - Requires: More sophisticated monitoring and failover logic

4. **WhatsApp Web Version Detection**
   - Detect WhatsApp version and adjust extraction accordingly
   - Requires: Version detection mechanism, version-specific strategies

5. **Prefetching**
   - Prefetch person data for visible chats
   - Requires: Pipedrive API integration (Feature 9)

6. **Chat Metadata Caching**
   - Cache JID → phone mappings locally
   - Reduce extraction attempts on revisited chats
   - Requires: chrome.storage usage, cache invalidation strategy

---

## 13. Related Documentation

**Implementation Files:**
- [Extension/src/content-script/chat-detection/](../../../Extension/src/content-script/chat-detection/) - Detection modules
- [Extension/src/content-script/whatsapp-extractor/](../../../Extension/src/content-script/whatsapp-extractor/) - Extraction modules
- [Extension/src/content-script/App.tsx](../../../Extension/src/content-script/App.tsx) - Main integration

**Test Files:**
- [Extension/tests/unit/phone-parser.test.ts](../../../Extension/tests/unit/phone-parser.test.ts) - Phone parsing tests
- [Extension/tests/unit/url-monitor.test.ts](../../../Extension/tests/unit/url-monitor.test.ts) - URL monitoring tests
- [Extension/tests/integration/chat-detection.test.tsx](../../../Extension/tests/integration/chat-detection.test.tsx) - Integration tests

**External References:**
- [WhatsApp Web DOM Analysis](https://gist.github.com/fav83/f268cc335121f41a5c64b6553d7a272d) - Claude's WhatsApp Web inspection
- [Chrome Extension Content Scripts](https://developer.chrome.com/docs/extensions/mv3/content_scripts/)
- [MutationObserver API](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver)

---

**End of Specification**
