# Pipedrive × WhatsApp Web — Deals Management (BRD-002)

**Date:** 2025-01-17

**Owner:** A F
**Market & Language:** Global — English only
**Distribution:** Chrome Web Store (existing extension update)

---

## 1) Executive Summary

Extend the Chat2Deal Chrome extension to support **Pipedrive Deals management** directly from WhatsApp Web. Building on the successful Person management features (BRD-001), this release adds complete deal lifecycle management: viewing, creating, updating stages, and closing deals (won/lost) without leaving WhatsApp conversations.

**Core value:** Sales teams can manage their entire sales pipeline — from contact capture to deal closure — within a single WhatsApp Web interface, eliminating context switching and accelerating sales cycles.

**Feature parity goal:** Match Pipechat's deals functionality while maintaining our superior UX and technical architecture.

---

## 2) Goals & Non-Goals

### Goals
- Let users **view all deals** associated with the current WhatsApp contact (including open, won, and lost deals)
- Enable **quick deal creation** with minimal required fields (title, pipeline, stage, optional value)
- Support **deal stage management** (move deals through pipeline stages via dropdown)
- Allow users to **close deals** (mark as Won or Lost with required lost reason)
- Enable **reopening closed deals** back to open status when needed
- Extend **"Create Note from Chat"** feature to save WhatsApp messages to deal notes (not just Person notes)
- Provide **"Open in Pipedrive"** deep link for full deal management
- Maintain **feature parity with Pipechat** for deals functionality

### Non-Goals (explicitly out of scope for this release)
- Activities/Tasks management on deals
- Deal products attachment/management
- Deal participants management
- Organization linking to deals
- Custom fields display or editing
- Deal labels/tags support
- Expected close date field
- Probability field management
- Deal timeline/history display in extension
- Deal deletion from extension
- Deal field editing (title, value, etc.) after creation

---

## 3) Target Users & Use Cases

### Personas
- **Sales Representatives:** Managing active deals through qualification, proposal, and closing stages
- **Account Managers:** Tracking multiple deals per customer across different pipelines
- **Founders/Closers:** Moving fast on WhatsApp conversations and need instant deal context

### Primary Use Cases
1. **View deal context during chat:** User switches to WhatsApp chat and sees all associated deals (open/won/lost) with status indicators
2. **Create deal from conversation:** Prospect shows interest; user creates deal in seconds without leaving WhatsApp
3. **Progress deals through stages:** User moves deal from "Qualified" to "Proposal Sent" to "Negotiation" via dropdown
4. **Close deals quickly:** User marks deal as Won (one click) or Lost (with required reason selection)
5. **Reopen deals:** Customer comes back after initial rejection; user reopens lost deal to active status
6. **Save conversation to deal:** User selects WhatsApp messages and saves as note on specific deal for context/documentation

---

## 4) Scope — Functional Requirements

### 4.1 Deal Auto-Lookup (Feature 31) - ✅ Complete

When user switches to a 1:1 WhatsApp chat with a matched Person, extension automatically fetches all associated deals from Pipedrive.

**Behavior:**
- Query Pipedrive Deals API for all deals linked to the matched Person
- Fetch deals regardless of status (open, won, lost)
- Include deals from all pipelines
- Refresh deal data on every chat switch (always up-to-date)

**Acceptance Criteria:**
- [ ] On chat switch with matched Person, deals are fetched automatically
- [ ] All deal statuses (open/won/lost) are retrieved
- [ ] Deals from all pipelines are included
- [ ] Loading state shown during fetch (use existing Person loading patterns)
- [ ] API errors handled gracefully (use existing error handling patterns)

---

### 4.2 Deal Selector Dropdown (Feature 32) - ✅ Complete

Display all deals for the current Person in a dropdown selector with status indicators.

**Dropdown Behavior:**
- No default selection — shows "Select a deal..." placeholder
- User must explicitly select which deal to view/work with
- List sorted by status groups: Open deals first, then Won, then Lost
- Within each status group, sort by most recently updated first

**Display Format:**
- Each deal item shows: `[Status Icon] Deal Title - $Value`
- Status icons:
  - 🔄 for Open deals
  - ✅ for Won deals
  - ❌ for Lost deals
- Pipeline name shown in deal details after selection (not in dropdown)

**Empty State:**
- If Person has no deals, show: "No deals yet for this contact"
- Display prominent "Create Deal" button
- Deal selector dropdown not shown in empty state

**No Person State:**
- If no Person matched, hide deals section entirely
- Deals section only appears after Person is matched/created

**Acceptance Criteria:**
- [ ] Dropdown displays all deals with correct status icons
- [ ] Deals grouped by status (Open, Won, Lost) with proper sorting
- [ ] No default selection — user must choose explicitly
- [ ] Empty state with "Create Deal" button when Person has no deals
- [ ] Deals section hidden when no Person matched
- [ ] Deal value formatted with currency symbol (match Pipedrive's format)

---

### 4.3 Deal Display (Feature 33) - ✅ Complete

When user selects a deal from dropdown, display comprehensive deal information in a card below.

**Core Fields Displayed:**
- Deal title
- Deal value (with currency, formatted per Pipedrive)
- Current stage (editable dropdown — see 4.5)
- Status (Open/Won/Lost)
- Pipeline name

**Extended Fields Displayed:**
- Deal owner name
- Last update date
- Days in current stage
- Probability (if set)

**UI Elements:**
- "Open in Pipedrive" link (deep link to deal detail page)
- Stage dropdown for changing stages (4.5)
- "Mark as Won" button (visible only for open deals — see 4.6)
- "Mark as Lost" button (visible only for open deals — see 4.7)
- "Reopen Deal" button (visible only for won/lost deals — see 4.8)

**Not Displayed:**
- Expected close date
- Custom fields
- Labels/tags
- Deal timeline/history
- Products, participants, activities

**Acceptance Criteria:**
- [ ] All specified fields displayed correctly
- [ ] "Open in Pipedrive" link works (opens correct deal in new tab)
- [ ] Action buttons shown/hidden based on deal status
- [ ] Deal card positioned below dropdown selector
- [ ] Deal card scrollable if content exceeds sidebar height

---

### 4.4 Create New Deal (Feature 34) - ✅ Complete

Allow users to create new deals linked to the current Person with minimal friction.

**Creation Trigger:**
- "Create Deal" button visible when:
  - Person is matched (deals section visible)
  - User is viewing empty state OR has selected a deal

**Creation Flow:**
- Inline form appears in sidebar (not modal)
- Form fields:
  1. **Title** (required) — Pre-filled with "[Person Name] Deal" (e.g., "Alexander M Deal"), user can edit
  2. **Pipeline** (required) — Dropdown showing all available pipelines for the authenticated user
  3. **Stage** (required) — Dropdown showing stages for selected pipeline (dynamically updates when pipeline changes)
  4. **Value** (optional) — Numeric input, currency uses account default (no currency picker)
- Save / Cancel buttons

**Deal Creation:**
- POST to Pipedrive Deals API with:
  - `title` (user-provided or edited)
  - `person_id` (matched Person ID)
  - `pipeline_id` (selected)
  - `stage_id` (selected)
  - `value` (if provided)
  - `currency` (account default)
  - `user_id` (authenticated user — auto-assigned as owner)
  - `status` = "open"

**Post-Creation:**
- Form closes
- New deal appears in dropdown selector
- New deal auto-selected in dropdown
- Deal card displays with full details

**Acceptance Criteria:**
- [ ] "Create Deal" button visible in appropriate states
- [ ] Inline form displays with all specified fields
- [ ] Title pre-filled with "[Person Name] Deal" pattern
- [ ] Pipeline dropdown populated with user's pipelines
- [ ] Stage dropdown updates dynamically based on selected pipeline
- [ ] Value field accepts numeric input (optional)
- [ ] Deal created successfully and linked to Person
- [ ] New deal automatically selected after creation
- [ ] API errors shown with existing error handling pattern

---

### 4.5 Change Deal Stage (Feature 35) - ✅ Complete

Allow users to move deals through pipeline stages and pipelines via dropdowns in deal card.

**Implementation (Spec-135):**
- Both pipeline and stage shown as dropdowns for open deals
- Stage dropdown dynamically updates when pipeline changes (filtered by selected pipeline)
- First stage of new pipeline auto-selects when pipeline changes
- Save/Cancel buttons appear when changes are made (explicit confirmation)
- Loading state during save with disabled dropdowns
- Success toast notification on successful update
- Error banner for failures with retry option
- Won/lost deals show pipeline/stage as read-only text (not editable)

**Backend API:**
- PUT to `/api/pipedrive/deals/{id}` with `pipelineId` and `stageId`
- Backend sends `stage_id` to Pipedrive (pipeline updated automatically via stage's pipeline association)
- Response enriched with stage/pipeline metadata via DealTransformService

**Acceptance Criteria:**
- [x] Current stage and pipeline displayed as dropdowns for open deals
- [x] Pipeline dropdown shows all active pipelines
- [x] Stage dropdown shows stages from currently selected pipeline only
- [x] Stage dropdown updates dynamically when pipeline changes
- [x] First stage auto-selects when pipeline changes
- [x] Save/Cancel buttons appear when changes are made
- [x] Save button shows loading state with spinner
- [x] Success: Deal card updates with new stage/pipeline, success toast shown
- [x] Failure: Error banner shown with dismissible message, Save/Cancel remain visible for retry
- [x] Won/lost deals show stage/pipeline as read-only text (no editing)

---

### 4.6 Mark Deal as Won (Feature 36) - ✅ Complete

Allow users to mark open deals as Won with confirmation.

**Implementation (Spec-136):**
- "Won ✓" button visible at bottom of deal card (only for open deals)
- Button styled with success color (green)
- Clicking shows confirmation UI: "Mark this deal as won?"
- Confirm/Cancel buttons with loading states
- Backend endpoint: `PUT /api/pipedrive/deals/{dealId}/status` with `status: "won"`

**Post-Win Behavior:**
- Deal card updates to show "Won ✓" status
- "Mark as Won" / "Mark as Lost" buttons hidden (deal closed)
- "Open in Pipedrive" link visible at bottom
- Deal remains in current stage (Pipedrive behavior)
- Success toast: "Deal marked as won"

**Acceptance Criteria:**
- [x] "Won ✓" button visible for open deals only
- [x] Confirmation UI shown with Confirm/Cancel buttons
- [x] Loading state during API call
- [x] Deal status updates immediately in card
- [x] Action buttons update correctly (hide Won/Lost buttons)
- [x] Error handling with dismissible error banner and retry
- [x] "Open in Pipedrive" link visible at bottom of deal card

---

### 4.7 Mark Deal as Lost (Feature 37) - ✅ Complete

Allow users to mark open deals as Lost with optional lost reason input.

**Implementation (Spec-136):**
- "Lost ✗" button visible at bottom of deal card (only for open deals)
- Button styled with danger color (red)
- Clicking shows inline lost reason form
- Text input field (max 150 characters), autofocus enabled
- Character counter: "X/150"
- Lost reason is **OPTIONAL** (user can submit empty reason)
- Confirm/Cancel buttons with loading states

**Lost Reason Form:**
- Single-line text input (not dropdown)
- Label: "Why was this deal lost? (optional)"
- Placeholder: "Enter reason (optional)"
- If provided, must be ≤150 characters
- Backend validates length but doesn't require reason

**API Call:**
- PUT to `/api/pipedrive/deals/{dealId}/status` with:
  - `status` = "lost"
  - `lostReason` = entered text (or `undefined` if empty)

**Post-Lost Behavior:**
- Deal card updates to show "Lost ✗" status
- Lost reason displayed in deal card if provided
- "Mark as Won" / "Mark as Lost" buttons hidden
- "Open in Pipedrive" link visible at bottom
- Success toast: "Deal marked as lost"

**Acceptance Criteria:**
- [x] "Lost ✗" button visible for open deals only
- [x] Clicking shows inline lost reason form with autofocus
- [x] Lost reason is OPTIONAL (Confirm button enabled even when empty)
- [x] Character counter updates in real-time
- [x] Input field maxLength enforced at 150 characters
- [x] Loading state during API call
- [x] Deal marked as lost with or without reason
- [x] Lost reason displayed in deal card if provided
- [x] Action buttons update correctly (hide Won/Lost buttons)
- [x] Error handling with dismissible error banner and retry
- [x] Cancel button resets form and returns to normal state
- [x] "Open in Pipedrive" link visible at bottom of deal card

---

### 4.8 Reopen Closed Deal (Feature 38) - ✅ Complete

Allow users to reopen won or lost deals back to open status.

**UI Implementation:**
- "Reopen Deal" button visible in deal card (only for won/lost deals)
- Button styled neutrally (secondary color)
- One-click action (no confirmation dialog)

**API Call:**
- PATCH to Pipedrive `/deals/{id}` with `status` = "open"
- Deal returns to its last stage (Pipedrive determines stage automatically)

**Post-Reopen Behavior:**
- Deal status changes to "Open"
- Status icon in dropdown changes to 🔄
- "Reopen Deal" button hidden
- "Mark as Won" / "Mark as Lost" buttons now visible
- Stage dropdown becomes editable again

**Acceptance Criteria:**
- [ ] "Reopen Deal" button visible for won/lost deals only
- [ ] One-click reopens deal (no confirmation needed)
- [ ] Deal status updates to "Open" immediately
- [ ] Status icon and action buttons update correctly
- [ ] Stage dropdown becomes editable
- [ ] Error handling if API call fails

---

### 4.9 Save WhatsApp Messages to Deal Notes (Feature 39) - ✅ Complete

Extend existing "Create Note from Chat" feature (Spec-130b) to support saving selected WhatsApp messages to Deal notes (not just Person notes).

**Current Functionality:**
- User selects WhatsApp messages
- Clicks "Create Note from Chat" button
- Messages saved to Person notes in Pipedrive

**Extended Functionality:**
- When user clicks "Create Note from Chat", show choice:
  - Save to **Person** (existing behavior)
  - Save to **Deal** (new behavior)

**Deal Note Behavior:**
- If "Save to Deal" selected and a deal is currently selected in dropdown:
  - Save note to the selected deal's notes
  - Use Pipedrive `/notes` API with `deal_id` parameter
- If "Save to Deal" selected but no deal selected:
  - Show error: "Please select a deal first"
  - Do not proceed with save

**Note Format:**
- Same as Person notes (per Spec-130b):
  - Formatted WhatsApp message content
  - Timestamps
  - Sender information

**Acceptance Criteria:**
- [ ] "Create Note from Chat" button shows destination choice (Person vs Deal)
- [ ] If deal selected: note saved to that deal in Pipedrive
- [ ] If no deal selected: error shown, save prevented
- [ ] Note format matches existing Person notes format
- [ ] Success confirmation shown after save
- [ ] Error handling for API failures
- [ ] Feature works seamlessly with existing Person notes functionality

---

### 4.10 Deals Section Positioning & Layout (Feature 40) - ✅ Complete

Define how Deals UI is positioned within the existing sidebar layout.

**Layout Structure:**
- **Top:** Fixed header (logo + user avatar)
- **Below header:** Person information section (existing)
- **Below Person:** Deals section (new)
  - Deal selector dropdown
  - Selected deal card (when deal chosen)
  - "Create Deal" button/form (when creating)

**Scrolling Behavior:**
- Person section: fixed/minimal height
- Deals section: scrollable if content exceeds remaining viewport height
- User can scroll within deals section independently

**Responsive Behavior:**
- Deals section adapts to sidebar width (350px)
- Long deal titles truncate with ellipsis
- Deal values format to fit available space

**Acceptance Criteria:**
- [ ] Deals section positioned below Person section
- [ ] Both sections visible simultaneously (no tabs, no replacing)
- [ ] Deals section scrollable when content exceeds height
- [ ] Layout works at 350px sidebar width
- [ ] No overlap or layout breaking with long content

---

## 5) UX Overview (Happy Path)

1. User opens WhatsApp Web → extension sidebar loads
2. User signs in with Pipedrive (if not already authenticated)
3. User clicks a 1:1 chat → Person auto-lookup finds match
4. Extension fetches all deals for matched Person
5. **Scenario A: No deals exist**
   - User sees "No deals yet" empty state
   - User clicks "Create Deal"
   - Fills title (pre-filled), selects pipeline + stage, optionally adds value
   - Saves → new deal appears and is selected
6. **Scenario B: Multiple deals exist**
   - User sees dropdown with all deals (grouped by Open/Won/Lost)
   - User selects deal from dropdown
   - Deal card displays with full details
   - User moves deal to next stage via dropdown → saves immediately
   - User marks deal as Won → deal status updates, buttons change
7. **Scenario C: Save conversation to deal**
   - User selects WhatsApp messages
   - Clicks "Create Note from Chat"
   - Chooses "Save to Deal"
   - Note saved to currently selected deal
8. User clicks "Open in Pipedrive" → deal opens in new tab for full management

---

## 6) Data Model & Privacy (Business-Level)

### 6.1 WhatsApp Data Collection

No changes from BRD-001:
- **Data read from WhatsApp:** chat JID/phone, display name (no message content except when user explicitly selects messages for notes)
- **Data sent to Pipedrive:** Deals read/search/create/update
- **No message content** sent to Pipedrive except when user explicitly saves selected messages as notes

### 6.2 Pipedrive OAuth Scopes

**Current Scopes (BRD-001):**
- `contacts:full` — Person management

**New Scopes (BRD-002):**
- `deals:full` — Full deal management (read, create, update, delete — though we don't implement delete)

**Scope Update Strategy:**
- Extension will request both `contacts:full` AND `deals:full` during OAuth flow
- Existing users must re-authorize to grant `deals:full` scope
- New users grant both scopes on first sign-in
- Pipedrive OAuth consent screen will show new permission

### 6.3 Data Storage

**No new backend storage required:**
- All deal data fetched from Pipedrive API in real-time (no caching)
- No deal-specific data stored in backend database
- User/session data remains unchanged from BRD-001

### 6.4 Telemetry (Optional)

- Deal views count (DAU)
- Deal creations count
- Stage changes count
- Deal closures (won/lost) count
- No PII or deal content logged

---

## 7) Metrics & Success Criteria

### Activation Metrics
- **% of users who view at least one deal** within first 7 days of deals feature release
- **% of users who create at least one deal** from WhatsApp within first session

### Engagement Metrics
- **Deals viewed per session** (average)
- **Deals created per active user per week**
- **Stage changes per deal** (average)
- **Deal closure rate** (won + lost / total deals created) tracked at 7-day, 30-day intervals

### Efficiency Metrics
- **Time to create deal** from "Create Deal" click to successful save (target: < 20 seconds)
- **Deal stage changes per session** (measure of active deal management)

### Quality Signals
- **% of deals with value entered** at creation (indicates data quality)
- **Lost reasons distribution** (understand why deals fail)

### Retention
- **7-day retention:** Users who perform ≥1 deal action in week 2
- **% of users who use both Person AND Deals features** (integration indicator)

---

## 8) Release Plan

### Phase 1: Backend & API Integration
- Implement Pipedrive Deals API service in backend (similar to Person API service — Spec-106a pattern)
- Add deals-related endpoints: GET deals by person, POST create deal, PATCH update deal
- Update OAuth flow to request `deals:full` scope
- Test API integration with Pipedrive sandbox

### Phase 2: Extension Frontend
- Implement deal selector dropdown (Feature 32)
- Implement deal display card (Feature 33)
- Implement create deal form (Feature 34)
- Test with real Pipedrive accounts

### Phase 3: Deal Actions
- Implement stage change dropdown (Feature 35)
- Implement Win/Lost/Reopen buttons (Features 36, 37, 38)
- Implement lost reason picker
- Test all action flows

### Phase 4: Notes Integration
- Extend "Create Note from Chat" to support deal notes (Feature 39)
- Test message selection → deal note save flow

### Phase 5: Testing & Polish
- Manual testing per comprehensive checklist
- Fix bugs and edge cases
- Performance optimization (if needed)
- Error handling verification

### Phase 6: Deployment
- Update Chrome Web Store listing (mention Deals feature)
- Deploy backend with deals API support
- Release extension update
- Force OAuth re-authorization for existing users (new scope)
- Monitor Sentry for errors
- Collect user feedback

---

## 9) Assumptions & Constraints

- **Pipedrive API stability:** Deals API endpoints remain stable and documented
- **OAuth scope changes:** Forcing re-authorization is acceptable user experience (one-time friction)
- **Person-first model:** All deals MUST be linked to a Person (matches our WhatsApp context)
- **No organization support:** Acceptable for V1; organizations can be linked manually in Pipedrive later
- **Real-time refresh:** Fetching deals on every chat switch is performant enough (no caching needed)
- **Currency handling:** Account default currency is sufficient (no multi-currency support)
- **Stage validation:** Pipedrive API enforces stage rules; we don't need client-side validation
- **No activities/products:** Users accept that these must be managed in Pipedrive (not in extension)

---

## 10) Risks & Mitigations

### Risk: OAuth Re-authorization Friction
**Impact:** Existing users must re-authorize to grant `deals:full` scope; some may abandon
**Mitigation:**
- Clear messaging in extension: "New feature requires re-authorization"
- Show benefits of Deals feature prominently
- One-click re-auth flow (pre-fill OAuth URL)

### Risk: Pipedrive API Rate Limits
**Impact:** Fetching deals on every chat switch may hit rate limits for power users
**Mitigation:**
- Monitor rate limit headers in API responses
- Implement exponential backoff if rate limited
- Show user-friendly "Rate limit reached, try again in X seconds" message
- Consider adding manual refresh button to reduce automatic fetches (future enhancement)

### Risk: Complex Pipeline Configurations
**Impact:** Users with 10+ pipelines or 20+ stages may have poor UX in dropdowns
**Mitigation:**
- Use searchable/filterable dropdowns (if needed)
- Test with real accounts that have many pipelines
- Truncate long pipeline/stage names with ellipsis + tooltip

### Risk: Feature Parity Expectation
**Impact:** Users compare to Pipechat and expect ALL features (activities, products, etc.)
**Mitigation:**
- Clear communication: "Deals V1 focuses on core deal management"
- Roadmap transparency: "Activities and products coming in future releases"
- Deliver superior UX in core features to offset missing advanced features

### Risk: No Deal Editing After Creation
**Impact:** Users frustrated they can't edit deal title/value in extension after creating
**Mitigation:**
- Prominent "Open in Pipedrive" link for full editing
- Ensure link works seamlessly (opens correct deal)
- Consider adding field editing in V2 if user feedback demands it

---

## 11) Future Roadmap (Post-V1)

### Phase 2 Enhancements
- **Deal field editing:** Allow editing title, value, owner after deal creation
- **Expected close date:** Add date picker for close date field
- **Probability management:** Show and edit deal probability %
- **Deal timeline:** Display deal history/activity timeline in extension
- **Custom fields support:** Show relevant custom deal fields (configurable)

### Phase 3 Advanced Features
- **Activities on deals:** Create tasks, schedule calls, log meetings
- **Deal products:** Attach products to deals, manage product quantities/pricing
- **Deal participants:** Add/remove participants from deals
- **Organization linking:** Link deals to organizations during creation

### Phase 4 Intelligence
- **Deal insights:** Show deal age, health score, next actions recommendations
- **Pipeline analytics:** Show user's pipeline stats (conversion rates, avg deal value)
- **Smart stage suggestions:** Recommend next stage based on conversation content (AI)
- **Deal templates:** Pre-configured deal templates for common scenarios

### Phase 5 Automation
- **Auto-deal creation:** Automatically create deal when certain keywords detected in chat
- **Stage auto-progression:** Auto-move deal when certain actions completed
- **Deal duplicates detection:** Warn if creating similar deal to existing one

---

## 12) Out-of-Scope (Reiterated)

**Explicitly NOT included in this release:**
- Activities/Tasks management
- Deal products attachment/management
- Deal participants management
- Organization linking (deals are Person-only)
- Custom fields display/editing
- Deal labels/tags
- Expected close date field
- Probability field
- Deal timeline/history in extension
- Deal deletion from extension
- Field editing after deal creation (title, value, etc.)
- Deal duplication
- Deal merging
- Deal followers management
- Deal files/attachments
- Multi-currency support (uses account default only)
- Deal filtering/searching (all deals shown)
- Bulk deal actions
- Deal templates

---

## 13) Open Questions (for Business)

1. **Re-authorization UX:** Should we force immediate re-auth when deals feature launches, or allow users to continue using Person features and prompt re-auth when they try to access Deals?

2. **Deals empty state CTA:** Should "Create Deal" button in empty state be styled more prominently (e.g., larger, primary color) to drive adoption?

3. **Lost reason customization:** Should we allow users to configure lost reasons in extension settings, or always use Pipedrive account's configured reasons?

4. **Deal selector visibility:** Should deal selector be always visible (even when no deal selected), or only show after user clicks "View Deals" / "Manage Deals" button?

5. **Stage change confirmation:** Should we add optional confirmation dialog for stage changes (e.g., "Move to Proposal Sent?") or keep it instant?

6. **Won deals celebration:** Should we show a celebratory animation/confetti when deal is marked Won (gamification)?

7. **Deal creation defaults:** Should we remember user's last-selected pipeline and default to it in future deal creations?

---

## 14) Acceptance — Definition of "Done" (V1)

- [ ] OAuth flow requests and successfully grants `deals:full` scope
- [ ] Existing users can re-authorize with new scope
- [ ] Deal auto-lookup fetches all deals for matched Person on every chat switch
- [ ] Deal selector dropdown displays all deals (open/won/lost) with status icons
- [ ] Deals sorted and grouped correctly (Open → Won → Lost)
- [ ] No default deal selected; user must choose explicitly
- [ ] Empty state shown when Person has no deals
- [ ] Deals section hidden when no Person matched
- [ ] Selected deal displays all specified fields correctly
- [ ] "Open in Pipedrive" link works (opens correct deal in new tab)
- [ ] Create deal form works with all required fields (title, pipeline, stage)
- [ ] Title pre-filled with "[Person Name] Deal" pattern
- [ ] Stage dropdown updates dynamically based on selected pipeline
- [ ] New deals created successfully and auto-selected after creation
- [ ] Stage dropdown in deal card allows changing stages
- [ ] Stage changes save immediately and update UI
- [ ] "Mark as Won" button marks deal won with one click
- [ ] "Mark as Lost" button shows lost reason picker (required selection)
- [ ] Lost deals saved with selected lost reason
- [ ] "Reopen Deal" button reopens won/lost deals to open status
- [ ] "Create Note from Chat" supports saving to selected deal
- [ ] Error states handled gracefully (match Person error patterns)
- [ ] Loading states shown during API calls (match Person loading patterns)
- [ ] All acceptance criteria in sections 4.1–4.10 are met
- [ ] Manual testing checklist completed (to be created in Spec phase)
- [ ] No console errors during normal operation
- [ ] Sentry integration captures deal-related errors with proper context

---

## 15) Related Documentation

### Current Documentation (BRD-001 Foundation)
- [BRD-001: MVP Pipedrive × WhatsApp](./BRD-001-MVP-Pipedrive-WhatsApp.md) - Person management foundation
- [Chrome Extension Architecture](../Architecture/Chrome-Extension-Architecture.md) - Technical architecture
- [UI Design Specification](../Architecture/UI-Design-Specification.md) - UI design system
- [Spec-106a: Backend Pipedrive API Service](../Specs/Spec-106a-Backend-Pipedrive-API-Service.md) - Backend API pattern to follow
- [Spec-106b: Extension Pipedrive API Integration](../Specs/Spec-106b-Extension-Pipedrive-API-Integration.md) - Extension API pattern to follow
- [Spec-130b: Create Note from Chat](../Specs/Spec-130b-Extension-Create-Note-From-Chat.md) - Existing feature to extend

### Future Specs (To Be Created for BRD-002)
- Spec-31: Deals API Backend Service (similar to Spec-106a)
- Spec-32: Extension Deals API Integration (similar to Spec-106b)
- Spec-33: Deal Selector & Display UI
- Spec-34: Create Deal Flow
- Spec-35: Deal Stage Management
- Spec-36: Deal Win/Lost/Reopen Actions
- Spec-37: Deal Notes Integration (extend Spec-130b)
- Spec-38: OAuth Scope Update & Re-authorization Flow
- Testing/Manual/Deals-Testing-Checklist.md

---

**END OF BRD-002**
