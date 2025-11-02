# Pipedrive × WhatsApp Web Overlay — MVP Business Requirements (BRD)

**Date:** 2025-10-25

**Owner:** A F  
**Market & Language (Launch):** Global — English only  
**Distribution:** Public Chrome Web Store listing

---

## 1) Executive Summary
Build a lightweight Chrome extension that adds a sidebar to **WhatsApp Web** to **find or create Pipedrive People** based on the phone number of the current chat. The MVP focuses strictly on **contact capture and linking** (no Deals, Activities, or Notes), enabling fast adoption and rapid validation of the problem/solution fit.

**Core value:** Sales teams and founders can push WhatsApp conversations into Pipedrive as proper contacts **without leaving WhatsApp** or doing tab/context switching.

---

## 2) Goals & Non‑Goals (MVP)
### Goals
- Let a user **see the matching Pipedrive Person** for the current 1:1 WhatsApp chat.
- If no match, let the user **Create a new Person** (pre-filled with WhatsApp display name → fallback to phone).
- If no match, let the user **Attach the WhatsApp number to an existing Person** via **name search**.
- Provide **Open in Pipedrive** deep link to the matched/created Person.
- Require **no data entry beyond essentials** (name optional edit, phone mandatory).

### Non‑Goals (explicitly out of scope for MVP)
- Deals (create/update, stages, Won/Lost)  
- Activities / Reminders  
- Saving WhatsApp messages as Notes  
- Group chats support  
- Organization linking  
- Templates, quick-replies, hotkeys  
- Attachments/files sync  
- Multi-language UI (English only)  
- Mobile apps; Telegram Web; other browsers

---

## 3) Target Users & Use Cases
### Personas
- **Founder/Closer:** Handles inbound WhatsApp leads, needs to get them into Pipedrive quickly.  
- **SDR/AE:** Chats with prospects on WhatsApp and must avoid losing contact data.

### Primary Use Cases
1. **Auto-lookup on chat switch**: User switches to a WhatsApp chat; the sidebar shows the matched Person or prompts to create/attach.
2. **Create Person from WhatsApp chat**: No match exists; user creates a Person with a pre-filled name (display name) and phone (saved with label **“WhatsApp”**, **not primary**).
3. **Attach number to existing Person**: No match exists; user searches by **name** in Pipedrive, selects a Person, and attaches the WhatsApp number (label **“WhatsApp”**, **not primary**).
4. **Open in Pipedrive**: From a matched/created Person, user jumps directly to the Person in Pipedrive.

---

## 4) Scope — Functional Requirements

### 4.1 WhatsApp Web Detection (1:1 only)
- The extension displays a right-side **sidebar panel** on web.whatsapp.com.  
- On **chat focus/switch**, the extension extracts the **JID** (e.g., `48123123123@c.us`) and derives the **raw phone string** (no heuristics).  
- If a numeric phone cannot be derived (e.g., group chats), show a **“1:1 chats only”** notice.

**Acceptance Criteria**
- [ ] Sidebar loads on WhatsApp Web.  
- [ ] For any 1:1 chat, a raw phone value is produced from JID.  
- [ ] For non-1:1 chats, user sees a clear unsupported notice.

### 4.2 Pipedrive Sign‑In
- User authenticates with **Pipedrive OAuth** (extension-based PKCE if feasible; otherwise fallback server—implementation detail; business copy: “Sign in with Pipedrive”).  
- On success, store tokens securely and maintain session until sign out or expiry.

**Acceptance Criteria**
- [ ] “Sign in with Pipedrive” flow works end-to-end.  
- [ ] If not signed in, the sidebar shows a friendly sign-in call-to-action.

### 4.3 Person Auto‑Lookup
- On each chat switch, the extension **queries Pipedrive People** for an **exact phone match** using the raw string (no formatting heuristics).  
- If **match found**, display a **Person card**:
  - Person name  
  - Phone numbers list  
  - **Open in Pipedrive** button
- If **no match**, present two actions:
  - **Create Person**
  - **Add number to existing Person**

**Acceptance Criteria**
- [ ] Exact-match lookup returns a Person when the phone exists in Pipedrive.  
- [ ] Person card displays correctly with deep link.  
- [ ] No match → “Create” and “Attach to existing” options are visible.

### 4.4 Create Person
- Pre-fill **Name** with WhatsApp **display name** (fallback to phone).  
- **Email** field present but **optional** (empty by default).  
- On save, create a Pipedrive Person with:
  - **Name** (editable before save)  
  - **Phone** saved as a **new phone field** with label **“WhatsApp”**, **not primary**  
- After creation, show the Person card with deep link.

**Acceptance Criteria**
- [ ] Create modal shows Name (pre-filled, editable) and optional Email.  
- [ ] Person is created with the WhatsApp phone stored as label “WhatsApp”, not primary.  
- [ ] Success state shows Person card and “Open in Pipedrive.”

### 4.5 Attach Number to Existing Person
- “Attach to existing” opens a **search** (Pipedrive People) by **name only**.  
- Selecting a Person adds the WhatsApp phone as a **new phone** with label **“WhatsApp”**, **not primary**.  
- On success, show the Person card with deep link.

**Acceptance Criteria**
- [ ] Search returns relevant People by name.  
- [ ] Selected Person is updated with a new phone entry labeled “WhatsApp”, not primary.  
- [ ] Success state shows Person card and “Open in Pipedrive.”

### 4.6 States & Errors
- **Not signed in:** Show branded sign-in prompt.
- **No match:** Show Create + Attach choices.
- **API errors:** Show concise error toasts; allow retry.
- **Rate limits:** Detect and show a temporary "Try again soon." message.
- **Connectivity:** Show offline state if Pipedrive is unreachable.

**Acceptance Criteria**
- [ ] Each state above has a visible, understandable UI.
- [ ] Errors never block the user from returning to a safe state.

### 4.7 Extension Initialization & Loading States (Feature 18) (✅ Complete - Spec-118)
During extension initialization, the extension performs critical setup (webpack detection, module raid, chat monitoring). Users should see visual feedback during this process.

**Loading Overlay (Implemented):**
- Full-height overlay covering entire sidebar area (350px × 100vh) during module raid initialization
- Overlay shows large spinner (48×48px) and "Initializing Chat2Deal..." text, vertically centered
- Conditionally displayed when `#pipedrive-whatsapp-sidebar` container exists (sidebar-based trigger)
- Positioned where sidebar will be (right: 0, top: 0), with WhatsApp light gray background (#f0f2f5)
- 300ms dwell time on success, 1000ms on timeout for better visibility

**Success Behavior:**
- Overlay disappears after 300ms delay when module raid succeeds
- Sidebar loads normally with full chat monitoring functionality

**Failure Behavior:**
- Overlay disappears after 1000ms delay on timeout/failure (no persistent error display)
- Timeout logged to console AND reported to Sentry via custom events (`whatsapp-module-raid-error`)
- Sidebar loads in degraded mode (shows welcome state, chat monitoring inactive)
- Future enhancement: DOM-based contact detection as fallback (separate spec)

**Acceptance Criteria**
- [✅] Loading overlay appears during initialization with correct visual design
- [✅] Overlay removes with delay when module raid completes (success or failure)
- [✅] Module raid failures logged to console and reported to Sentry via custom events
- [✅] Sidebar loads normally even if module raid fails (degraded mode)
- [✅] No console errors during normal operation
- [✅] Test hooks exposed for unit and integration testing

---

## 5) UX Overview (Happy Path)
1. User opens WhatsApp Web → extension sidebar appears.  
2. User signs in with Pipedrive.  
3. User clicks a 1:1 chat.  
4. Extension auto-looks up the phone in Pipedrive.  
5. **If match:** Person card with **Open in Pipedrive**.  
6. **If no match:** User picks **Create Person** or **Attach to existing**.  
7. Confirmation state → Person card with deep link.

---

## 6) Data Model & Privacy (Business-Level)

### 6.1 WhatsApp Data Collection
- **Data read from WhatsApp:** chat JID/phone, display name (no message content).
- **Data sent to Pipedrive:** People read/search; People create/update (phones).
- **No message content, files, or attachments** are collected or transmitted.
- **No persistent caching** of chat→Person mappings in MVP.

### 6.2 Backend User Tracking (Feature 16) (✅ Complete - Spec-116)
To enable analytics and multi-tenancy support, the backend maintains user and company records in Azure SQL Database:

**Companies Table:**
- Stores Pipedrive company information (company name, domain)
- One record per Pipedrive company
- Created automatically during first OAuth from that company

**Users Table:**
- Stores Pipedrive user profile information (name, email)
- One record per Pipedrive user per company
- Created automatically during OAuth authentication
- Activity tracking: CreatedAt (first login), LastLoginAt (most recent login)
- Supports multi-company users (same person in different Pipedrive accounts)

**Data Flow:**
- During OAuth sign-in, backend fetches user profile from Pipedrive `/users/me` API
- User and company records created/updated automatically
- No manual user registration required
- Data stored: user name, email, company name, company domain, timestamps
- **No session linkage in MVP** (Sessions stored separately in Table Storage)

**Implementation Status:**
- ✅ Entity Framework Core 8.x with code-first migrations
- ✅ Normalized database schema: Companies ← Users relationship
- ✅ Database migration applied: `chat2deal-dev` on localhost SQL Server
- ✅ OAuth scope unchanged: `contacts:full` (no changes - `/users/me` uses base scope)
- ✅ Build successful with no errors

**Privacy & Security:**
- User data (names, emails) stored in encrypted Azure SQL Database
- Access restricted to backend only (not exposed to extension)
- Data used for: business analytics, user activity tracking, future billing
- Users implicitly consent by signing in with Pipedrive OAuth

### 6.3 Telemetry
- **Telemetry (optional later):** anonymous event counts only (DAU, lookups, creates, attaches).

---

## 7) Metrics & Success Criteria
- **Activation:** % of users who complete Pipedrive sign-in on first session.  
- **Core Action Rate:** % of chat views that result in a successful **match** OR **create/attach**.  
- **Time-to-Contact:** Median time from chat open to Person created/attached (**target < 30s**).  
- **7‑day Retention:** Users who perform ≥1 contact action in week 2.  
- **Quality Signal (later):** % of creates subsequently enriched in Pipedrive (emails, orgs).

---

## 8) Release Plan
- **Alpha (internal):** Unpacked extension; smoke tests with real Pipedrive sandbox.  
- **Beta:** Private test group; validate sign-in, lookup accuracy, create/attach flow.  
- **GA:** Public Chrome Web Store listing + lightweight landing page.

---

## 9) Assumptions & Constraints
- WhatsApp Web **exposes stable chat identifiers** (JID) for 1:1 chats.  
- Pipedrive API supports **phone search** and **adding phone fields** with custom labels.  
- Users accept English-only UI at launch.  
- No server required if OAuth PKCE works; otherwise minimal backend for token exchange (implementation detail).

---

## 10) Risks & Mitigations
- **WhatsApp DOM changes** break extraction → Monitor + hotfix; DOM selectors isolated.  
- **Phone exact-match misses variants** → Accept as MVP trade-off; plan heuristics V2.  
- **User attaches wrong Person** → Show **name clearly** in confirmation; allow quick undo (V2).  
- **Pipedrive rate limits** → Backoff + user-facing guidance; avoid chat-switch thrash (debounce).

---

## 11) Future Roadmap (Post‑MVP)
- Group chats with **participant picker**.  
- **Activities** on Person (follow-ups).  
- **Notes** from selected WhatsApp messages.  
- **Deals**: create + stage updates.  
- **Phone normalization heuristics** (+ default country setting).  
- **Organizations**: link/pick/create.  
- **Templates** (copy-to-clipboard, variables).  
- **Analytics dashboard** and simple billing.

---

## 12) Out‑of‑Scope (Reiterated)
- Telegram Web, mobile apps, Safari/Firefox.  
- Attachments and message sync.  
- Multi-language UI.  
- CRM support beyond Pipedrive.

---

## 13) Open Questions (for Business)
1. Do we want a **light landing page** at GA (1‑pager) or rely solely on the Chrome listing?  
2. Any **pricing** at MVP (free) vs. gating later features under paid tiers?  
3. Do we need a **Privacy Policy** link in-extension at launch, or only on the website?  
4. Should we show a **small badge** when a Person is matched (e.g., “In CRM”) for clarity?

---

## 14) Acceptance — Definition of "Done" (MVP)
- [ ] Public Chrome listing live; installation works.
- [ ] User can **sign in** with Pipedrive.
- [ ] 1:1 chat → **auto-lookup** executes reliably.
- [ ] **Match path** shows Person + deep link.
- [ ] **No-match paths**: **Create Person** and **Attach to existing** both work with label "WhatsApp", not primary.
- [ ] Error and empty states are implemented and understandable.
- [ ] Documentation (README + short Loom demo) published.

---

## Related Documentation

- [Chrome Extension Architecture](../Architecture/Chrome-Extension-Architecture.md) - Technical architecture for the Chrome extension
- [Website Architecture](../Architecture/Website-Architecture.md) - User dashboard web application architecture
- [UI Design Specification](../Architecture/UI-Design-Specification.md) - Complete UI design specification with visual system
- [Plan-001: MVP Feature Breakdown](../Plans/Plan-001-MVP-Feature-Breakdown.md) - MVP broken down into implementable features
