# Spec-111: Attach Number to Existing Person Flow

**Feature:** Feature 11 - Attach Number to Existing Person  
**Date:** 2025-10-31  
**Status:** ✅ Complete (Implementation successful)  
**Dependencies:** Feature 9 (Person Auto-Lookup Flow - Spec-109), Feature 10 (Create Person Flow - Spec-110), Feature 6 (Pipedrive API Service Layer - Spec-106a/106b)

---

## 1. Overview

This specification defines the workflow that lets users attach the current WhatsApp phone number to an existing Pipedrive person when no automatic match is found. The experience lives inline inside `PersonNoMatchState`, allowing agents to either create a new contact or search for an existing one without leaving the sidebar.

### 1.1 Scope

**In Scope**
- Extend `PersonNoMatchState` with an interactive “Attach to existing person” section.
- Implement guarded search input (minimum two characters) plus explicit submit button.
- Display latest search results in an inline list (max 10) showing name, first phone, and organization.
- Enable select-then-attach interaction with dedicated confirmation button.
- Integrate with `usePipedrive().searchByName` and `usePipedrive().attachPhone`.
- Surface inline loading, empty-state, and error feedback for search and attach operations.
- Transition to matched-person UI on success via `onPersonAttached`.
- Ensure attached phones use label `WhatsApp` with `isPrimary = false`.

**Out of Scope**
- Keyboard navigation for the results list (mouse/tap only for MVP).
- Pagination or infinite scroll beyond first 10 results.
- Debounced live search or automatic query execution.
- Modifying backend attach endpoint semantics.
- Undo/remove newly attached numbers.

### 1.2 User Flow

```
Chat changes → Auto lookup finds no match
    ↓
PersonNoMatchState renders Create + Attach sections
    ↓
User types ≥2 characters in search field
    ↓
User presses Enter or clicks Search
    ↓
Sidebar calls searchByName → shows loading placeholder
    ↓
├─→ Results list (≤10, name + first phone + org)
│     ↓
│   User selects a person (card highlight)
│     ↓
│   User clicks “Attach number”
│     ↓
│   attachPhone({ personId, phone, label: "WhatsApp", isPrimary: false })
│     ↓
│   Success → Parent receives onPersonAttached(person)
│             → Matched-person card renders with updated data
│
└─→ No results → Inline empty state with retry guidance
```

---

## 2. Objectives

- Deliver the BRD requirement for attaching the WhatsApp number to an existing Pipedrive contact.
- Keep the workflow inline to maintain context and reinforce parity with the create flow.
- Provide clear validation and messaging for searches, errors, and success outcomes.
- Reuse existing API surface while introducing minimal incremental UI state.
- Preserve accessibility fundamentals (focus order, aria-live updates, keyboard compatibility for form controls).

---

## 3. UX & UI Specifications

### 3.1 PersonNoMatchState Layout

- Section order stays “Create new person” first, followed by “Attach to existing person.”
- Add divider (`border-t`) between sections for clarity.
- Attach header copy: “Or add the number {phone} to an existing contact.”
- Search row:
  - Text input (empty by default, placeholder “Search contact…”).
  - Primary button label `Search`.
  - Button disabled until trimmed input length ≥ 2.
  - Pressing Enter fires the same handler as clicking `Search`.
- While searching:
  - Button text swaps to “Searching…” with spinner.
  - Input `readOnly` to prevent edits mid-request.
  - Render skeleton list (three placeholder rows) underneath.

### 3.2 Results List

- Replace prior list on every search completion (no accumulation).
- Cap at 10 items; truncate extra results client-side.
- Card contents:
  - **Line 1:** Person name (bold, `text-[#111b21]`).
  - **Line 2:** First phone value with label (if present) in muted text.
  - **Line 3 (optional):** Organization name (if provided) in muted italic.
- Card interaction:
  - Click selects the card, applying highlight background + left border accent.
  - Only one selection allowed at a time.
  - Updating selection clears previous highlight.
- Display scroll container if >5 results (max-height ~220px).

### 3.3 Attach Action

- “Attach number” button sits below list, hidden until a selection exists.
- Button fills width, primary styling consistent with Create button.
- Disabled state when selection cleared or attach in progress.
- Attaching state:
  - Button text “Attaching…” plus spinner.
  - Result list dims (`opacity-50`) and pointer events disabled.

### 3.4 Empty & Error States

- Empty search result:
  - Card-sized message with neutral illustration icon.
  - Text: “No contacts matched ‘{term}’. Try initials or another keyword.”
- Search error:
  - Inline red banner above results. Copy examples:
    - 401: “Session expired. Please sign in again.”
    - Network/500: “Couldn’t reach Pipedrive. Try again in a moment.”
  - Include dismiss (X) button to clear banner.
- Attach error:
  - Same banner area reused, message “Failed to attach phone. Please try again.”
  - Keep selection so user can retry without re-searching.

### 3.5 Success Transition & Accessibility

- On attach success:
  - Invoke `onPersonAttached(updatedPerson)`.
  - Parent container immediately switches to matched-person view (Feature 9 UI).
  - Focus management: `PersonMatchedCard` receives focus via `ref.focus()` or first interactive child.
  - Announce success via visually hidden `aria-live="polite"` message (“WhatsApp number added to {name}.”).

---

## 4. Data & Messaging Architecture

### 4.1 Content Script State

- Extend `PersonNoMatchState` with new state variables:
  - `searchTerm`
  - `searchResults: Person[]`
  - `selectedPersonId: number | null`
  - `isSearching`, `isAttaching`
  - `attachError`, `searchError`
- Reset `searchResults` and `selectedPersonId` when:
  - Chat changes (component remount) or new search initiated.
  - Search term cleared below 2 characters.
- Provide `onPersonAttached(person: Person)` prop mirroring `onPersonCreated`.

### 4.2 usePipedrive Hook Enhancements

- Maintain shared state structure while exposing dedicated helpers:
  - `searchByName(name: string): Promise<Person[]>`
  - `attachPhone(data: AttachPhoneData): Promise<Person | null>`
- Introduce operation-specific loading booleans inside the hook or return metadata object (e.g., `searchState`, `attachState`). Minimal API change: keep existing return signature but add `isSearching`, `isAttaching`, `searchError`, `attachError`.
- Ensure errors reset only for the scoped operation; provide `clearSearchError()` and `clearAttachError()` as needed.
- Hook continues to wrap `chrome.runtime.sendMessage` with `PIPEDRIVE_SEARCH_BY_NAME` & `PIPEDRIVE_ATTACH_PHONE`. No network logic change required.

### 4.3 Service Worker & Backend

- `pipedriveApiService.searchByName` already calls `/api/pipedrive/persons/search`. Confirm backend returns:
  - `id`, `name`, `phones` array, optional `organizationName`.
- Service worker should trim list to 10 before returning to content script (avoid extra UI trimming duplication).
- `attachPhone` request body: `{ phone }` (unchanged). Service ensures:
  - Adds phone with label `WhatsApp`, `isPrimary = false`.
  - If number already exists, backend returns person without error (current behavior).
- No new endpoints required.

---

## 5. Validation, Edge Cases & Internationalization

- Search input enforces minimum two characters after trimming spaces.
- Allow international characters; use same regex as name validation for display but do not block submission.
- Support numbers that already belong to the person: backend returns up-to-date person; front-end treats as success.
- Handle unauthorized responses by clearing local session and prompting re-authentication.
- Loading states must tolerate rapid successive searches (ignore stale responses by tracking request token or comparing term).
- Mirror existing i18n approach (static English strings). Strings defined in component for now; future localization can lift them.

---

## 6. Telemetry & Logging

- Content script: wrap search and attach calls with optional debug logs (`console.debug`) gated by existing debug flag to avoid leaking PII (log hashed phone or last 4 digits only).
- Service worker: maintain existing console logs; ensure production build strips verbose logging via build config.
- Consider future analytics hook to measure attach usage (out of scope for MVP).

---

## 7. Testing Strategy

**Unit Tests (Vitest)**
- `PersonNoMatchState` renders attach section with disabled search button when input < 2 chars.
- Selecting result enables attach button.
- Error banners appear for simulated search/attach failures and can be dismissed.
- Success flow invokes `onPersonAttached` with returned person.

**Integration Tests (Vitest + Testing Library)**
- Mock `usePipedrive` responses to validate loading states, empty state, and success transition.
- Ensure a second search replaces previous results and clears selection.

**E2E Tests (Playwright)**
- Scenario: no-match chat → search for known contact → select → attach → verify matched card shows WhatsApp number with `WhatsApp` label.
- Negative scenario: simulate backend 500 on attach → verify error banner and ability to retry.

**Manual Regression**
- Confirm Create flow (Feature 10) still works.
- Verify authentication expiry leads to sign-in prompt.
- Test across light/dark WhatsApp themes for contrast (future dark mode TBD).

---

## 8. Implementation Notes & TODOs

- Update docs references (Plan-001 status once implemented).
- After rollout, revisit Parking Lot item for keyboard navigation if requested.
- Coordinate with backend owners to ensure attach endpoint continues returning organization name (if missing, extend transform service).
- Post-implementation checklist: rotate any staging secrets used during testing; update manual testing doc in `Docs/Specs/Spec-103-Implementation-Summary.md`.

---

## 9. Acceptance Criteria

1. When no match is found, agents can search by name (min 2 chars) and see inline results.
2. Selecting a person enables an attach button that adds the WhatsApp number labeled `WhatsApp`, `isPrimary=false`.
3. Success transitions to matched-person view showing the updated phone list.
4. Search and attach errors surface inline and allow retry without reloading the sidebar.
5. Empty search returns show a “No contacts matched” state with retry guidance.
6. Existing create flow remains unaffected, and the attach section is fully accessible via keyboard for form elements.

---

> **Status:** Ready for implementation planning.
