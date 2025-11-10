# Spec-109: Person Auto-Lookup Flow

**Feature:** Feature 9 - Person Auto-Lookup Flow
**Date:** 2025-10-30
**Status:** ✅ Complete
**Dependencies:** Feature 8 (Authentication UI), Feature 6 (Pipedrive API Service Layer)

---

## 1. Overview

This specification defines the automatic person lookup flow that triggers when a user switches to a 1:1 WhatsApp chat. The extension will automatically query Pipedrive to find a matching person by phone number and display the results in the sidebar.

### 1.1 Scope

**In Scope:**
- Automatic lookup trigger on chat switch
- Loading state with skeleton UI
- Matched person display with "Open in Pipedrive" link
- No match state with full UI layout (non-functional buttons)
- Error state with retry functionality
- Integration with existing authentication and chat detection

**Out of Scope (Handled by Subsequent Features):**
- Create Person functionality (Feature 10, see Spec-110)
- Attach to Existing Person functionality (Feature 11, see Spec-111)
- Form validation and submission
- Search implementation
- Result caching

### 1.2 User Flow

```
User switches to 1:1 chat
    ↓
Extension detects chat with phone number
    ↓
Immediately show loading state (skeleton + WhatsApp name)
    ↓
Call Pipedrive API: lookupByPhone(phone)
    ↓
    ├─→ Match Found → Show PersonMatchedCard
    ├─→ No Match → Show PersonNoMatchState (with form UI)
    └─→ API Error → Show error state with retry
```

---

## 2. UI States & Components

### 2.1 Loading State

**Component:** `PersonLookupLoading.tsx`

**When Shown:**
- Immediately when user switches to a 1:1 chat
- While `usePipedrive().lookupByPhone()` is executing

**UI Elements:**
- WhatsApp contact name (visible immediately, not skeleton)
- Phone number (visible immediately)
- Skeleton/shimmer placeholders for additional content
- Subtle loading indicator or shimmer animation

**Visual Design:**
- Matches WhatsApp Web theme
- Smooth skeleton animation (shimmer effect)
- Maintains same layout dimensions as matched state

**Props:**
```typescript
interface PersonLookupLoadingProps {
  contactName: string  // From WhatsApp
  phone: string        // From WhatsApp (E.164 format)
}
```

### 2.2 Matched State

**Component:** `PersonMatchedCard.tsx`

**When Shown:**
- When `lookupByPhone()` returns a Person object
- Match found in Pipedrive

**UI Elements:**
- Person's name (from Pipedrive)
- Phone number (the WhatsApp phone that matched)
- "Open in Pipedrive" button/link
- Card-style container with padding

**Visual Design:**
- Clean, simple card layout
- WhatsApp color theme:
  - Background: white (`#ffffff`)
  - Border: `#d1d7db`
  - Text primary: `#111b21`
  - Text secondary: `#667781`
- "Open in Pipedrive" link:
  - Pipedrive green for button/link
  - Opens in new tab (`target="_blank"`)
  - External link icon (optional)

**Props:**
```typescript
interface PersonMatchedCardProps {
  name: string          // Person name from Pipedrive
  phone: string         // Matched phone (E.164 format)
  pipedriveUrl: string  // URL to person's Pipedrive profile
}
```

**Pipedrive URL Format:**
- `https://[company-domain].pipedrive.com/person/[person-id]`
- Company domain should come from backend (part of auth session)
- Person ID from matched Person object

### 2.3 No Match State

**Component:** `PersonNoMatchState.tsx`

**When Shown:**
- When `lookupByPhone()` returns `null`
- No person found in Pipedrive with matching phone

**UI Elements (Two Sections):**

**Section 1: Create New Person**
- Heading: "Add this contact to Pipedrive"
- Name input field:
  - Label icon: `T` or text "Name"
  - Pre-filled with WhatsApp contact name
  - Full width
  - Border: subtle gray
- Email input field:
  - Label icon: `@` or text "Email"
  - Placeholder: "Email"
  - Empty by default
  - Optional (no validation)
  - Full width
- "Create" button:
  - Green background (Pipedrive brand color)
  - White text
  - Centered
  - Disabled/non-functional in Feature 9 (placeholder only)

**Section 2: Link to Existing**
- Separator text: "Or add the number"
- Phone number display: Show the WhatsApp phone (e.g., "+34 646 85 26 30")
- Text continuation: "to an existing contact"
- Search input field:
  - Placeholder: "Search contact..."
  - Search icon (magnifying glass)
  - Full width
  - Disabled/non-functional in Feature 9 (placeholder only)

**Visual Design:**
- Two distinct sections with visual separation
- Section 1 appears more prominent (primary action)
- Section 2 appears as secondary option
- Consistent padding and spacing
- Matches reference screenshot provided by user

**Props:**
```typescript
interface PersonNoMatchStateProps {
  contactName: string  // Pre-fill name field
  phone: string        // Display in "Or add the number..." section
}
```

**Notes:**
- During Feature 9 these controls shipped as placeholders.
- Features 10 & 11 (Specs 110/111) layered on full create + attach functionality.
- This spec focuses on the layout and state transitions only.

### 2.4 Error State

**Component:** `PersonLookupError.tsx`

**When Shown:**
- When `lookupByPhone()` encounters an error
- API failure, network error, rate limit, etc.

**UI Elements:**
- Error icon or indicator
- Error message (user-friendly, from API response)
- "Try again" button
- Centered layout

**Visual Design:**
- Alert/error styling (subtle red accent)
- Clear, actionable message
- Prominent retry button
- Replaces entire content area (not a banner)

**Error Messages (from existing usePipedrive hook):**
- 401: "Authentication expired. Please sign in again."
- 404: "Person not found"
- 429: "Too many requests. Please try again in a moment."
- 500: "Server error. Please try again later."
- Network: "Check connection and try again."

**Props:**
```typescript
interface PersonLookupErrorProps {
  errorMessage: string
  onRetry: () => void
}
```

**Retry Behavior:**
- Clicking "Try again" re-triggers `lookupByPhone()`
- Shows loading state while retrying
- Same error handling applies (can fail again)

---

## 3. Technical Implementation

### 3.1 App State Management

**Extend `SidebarState` in `App.tsx`:**

```typescript
type SidebarState =
  | { type: 'welcome' }
  | { type: 'contact'; name: string; phone: string }
  | { type: 'contact-warning'; name: string; warning: string }
  | { type: 'group-chat' }
  // NEW: Person lookup states
  | { type: 'person-loading'; name: string; phone: string }
  | { type: 'person-matched'; person: Person; phone: string }
  | { type: 'person-no-match'; name: string; phone: string }
  | { type: 'person-error'; name: string; phone: string; error: string }
```

### 3.2 Lookup Trigger Logic

**In `App.tsx` or new `SidebarContent` component:**

```typescript
// When state changes to 'contact', trigger lookup
useEffect(() => {
  if (state.type === 'contact' && authState === 'authenticated') {
    // Show loading immediately
    setState({
      type: 'person-loading',
      name: state.name,
      phone: state.phone
    })

    // Trigger lookup
    handlePersonLookup(state.phone, state.name)
  }
}, [state.type, state.phone]) // Re-run on phone change

async function handlePersonLookup(phone: string, name: string) {
  const person = await lookupByPhone(phone)

  if (error) {
    setState({
      type: 'person-error',
      name,
      phone,
      error: error.message
    })
  } else if (person) {
    setState({
      type: 'person-matched',
      person,
      phone
    })
  } else {
    setState({
      type: 'person-no-match',
      name,
      phone
    })
  }
}
```

**Key Points:**
- No debounce - immediate trigger on chat switch
- Loading state set synchronously before async lookup
- Uses existing `usePipedrive().lookupByPhone()` hook
- No caching - fresh lookup every time

### 3.3 Pipedrive URL Construction

**Person profile URL format:**
```
https://{company-domain}.pipedrive.com/person/{person-id}
```

**Implementation Options:**

**Option A: Backend provides full URL**
- Backend includes `pipedrive_url` field in Person response
- Extension just uses the URL directly
- Recommended approach (backend knows correct domain)

**Option B: Extension constructs URL**
- Extension stores company domain during auth
- Constructs URL: `https://${domain}.pipedrive.com/person/${person.id}`
- Requires domain storage in auth state

**Recommendation:** Use Option A (backend provides URL) for simplicity and reliability.

### 3.4 Component Integration

**Render logic in `SidebarContent` component:**

```typescript
function SidebarContent({ state }: SidebarContentProps) {
  const { lookupByPhone, error } = usePipedrive()

  switch (state.type) {
    case 'welcome':
      return <WelcomeState />

    case 'contact':
      // This state should immediately transition to person-loading
      return null

    case 'person-loading':
      return <PersonLookupLoading
        contactName={state.name}
        phone={state.phone}
      />

    case 'person-matched':
      return <PersonMatchedCard
        name={state.person.name}
        phone={state.phone}
        pipedriveUrl={state.person.pipedriveUrl} // From backend
      />

    case 'person-no-match':
      return <PersonNoMatchState
        contactName={state.name}
        phone={state.phone}
      />

    case 'person-error':
      return <PersonLookupError
        errorMessage={state.error}
        onRetry={() => handleRetry(state.phone, state.name)}
      />

    case 'contact-warning':
      return <ContactWarningCard
        name={state.name}
        warning={state.warning}
      />

    case 'group-chat':
      return <GroupChatState />
  }
}
```

---

## 4. Backend Changes (if needed)

### 4.1 Person Response Enhancement

**Current Person interface:**
```typescript
interface Person {
  id: number
  name: string
  organizationName?: string | null
  phones: Phone[]
  email: string | null
}
```

**Proposed Addition:**
```typescript
interface Person {
  id: number
  name: string
  phones: Phone[]
  email: string | null
  pipedriveUrl: string  // NEW: Full URL to person's profile
}
```

**Backend Implementation:**
- `PersonsSearch` endpoint includes `pipedrive_url` in response
- Format: `https://{company-domain}.pipedrive.com/person/{id}`
- Company domain retrieved from session (stored during OAuth)

**Alternative:** If backend doesn't provide URL, extension can construct it using person ID and stored domain from auth session.

---

## 5. Testing Requirements

### 5.1 Unit Tests

**Component Tests (Vitest + Testing Library):**

1. **PersonLookupLoading.tsx**
   - Renders contact name correctly
   - Renders phone number
   - Shows skeleton/shimmer elements

2. **PersonMatchedCard.tsx**
   - Renders person name from props
   - Renders phone number
   - Renders "Open in Pipedrive" link with correct href
   - Link opens in new tab (target="_blank")

3. **PersonNoMatchState.tsx**
   - Pre-fills name field with contact name
   - Email field is empty
   - Phone number displayed in "Or add..." section
   - Create button renders (even if disabled)
   - Search field renders (even if disabled)

4. **PersonLookupError.tsx**
   - Renders error message
   - Renders retry button
   - Calls onRetry callback when button clicked

### 5.2 Integration Tests

**App.tsx Integration:**

1. **Successful Lookup Flow**
   - Mock `lookupByPhone` to return Person object
   - Switch to contact state
   - Verify loading state appears
   - Verify matched state appears with correct data

2. **No Match Flow**
   - Mock `lookupByPhone` to return null
   - Switch to contact state
   - Verify loading state appears
   - Verify no-match state appears with form UI

3. **Error Flow**
   - Mock `lookupByPhone` to throw error
   - Switch to contact state
   - Verify error state appears with message
   - Click retry button
   - Verify loading state appears again

4. **Chat Switch Behavior**
   - Switch to chat A → verify lookup triggered
   - Switch to chat B → verify new lookup triggered
   - Switch back to chat A → verify lookup triggered again (no cache)

### 5.3 Manual Testing Checklist

- [ ] Load WhatsApp Web with extension
- [ ] Sign in with Pipedrive
- [ ] Switch to contact that exists in Pipedrive
  - [ ] Loading state appears immediately
  - [ ] Matched card appears with correct name/phone
  - [ ] "Open in Pipedrive" link works (new tab)
- [ ] Switch to contact not in Pipedrive
  - [ ] Loading state appears
  - [ ] No match state appears with form UI
  - [ ] Name is pre-filled
  - [ ] Phone number shown in "Or add..." text
- [ ] Test error handling (disconnect network)
  - [ ] Error state appears with message
  - [ ] Click "Try again" → loading state
  - [ ] Reconnect network → matched/no-match state
- [ ] Rapid chat switching
  - [ ] No crashes or race conditions
  - [ ] Latest chat's lookup result displays
- [ ] UI styling
  - [ ] All states match WhatsApp theme
  - [ ] Consistent spacing/padding
  - [ ] Responsive within 350px sidebar width

---

## 6. Acceptance Criteria

### 6.1 Functional Requirements

- [x] **AC-1:** When user switches to 1:1 chat, loading state appears immediately (no delay)
- [x] **AC-2:** When match found, PersonMatchedCard displays person name, phone, and "Open in Pipedrive" link
- [x] **AC-3:** "Open in Pipedrive" link opens correct person profile in new tab
- [x] **AC-4:** When no match found, PersonNoMatchState displays full form UI with pre-filled name
- [x] **AC-5:** No match state shows phone number in "Or add the number [phone]..." text
- [x] **AC-6:** When API error occurs, error state displays with user-friendly message
- [x] **AC-7:** Retry button in error state re-triggers lookup and shows loading state
- [x] **AC-8:** Every chat switch triggers fresh lookup (no caching)
- [x] **AC-9:** Lookup only triggers when authenticated
- [x] **AC-10:** Group chats do not trigger lookup (existing GroupChatState shown)

### 6.2 UI/UX Requirements

- [x] **AC-11:** All states styled consistently with WhatsApp Web theme
- [x] **AC-12:** Loading state shows skeleton/shimmer animation
- [x] **AC-13:** No match state layout matches provided screenshot
- [x] **AC-14:** All states fit within 350px sidebar width
- [x] **AC-15:** Smooth transitions between states (no jarring layout shifts)
- [x] **AC-16:** No console errors or warnings during lookup flow

### 6.3 Technical Requirements

- [x] **AC-17:** Uses existing `usePipedrive().lookupByPhone()` hook
- [x] **AC-18:** Integrates with existing App.tsx state machine
- [x] **AC-19:** All components use TypeScript with proper types
- [x] **AC-20:** Test coverage ≥80% for new components
- [x] **AC-21:** No new API endpoints required (uses existing PersonsSearch)
- [x] **AC-22:** Code follows project conventions (see CLAUDE.md)

---

## 7. Implementation Plan

### Phase 1: Component Creation
1. Create `PersonLookupLoading.tsx` with skeleton UI
2. Create `PersonMatchedCard.tsx` with link functionality
3. Create `PersonNoMatchState.tsx` with full form layout (non-functional)
4. Create `PersonLookupError.tsx` with retry button

### Phase 2: State Management
5. Extend `SidebarState` type in App.tsx with new states
6. Add lookup trigger logic (useEffect on contact state)
7. Implement `handlePersonLookup` function
8. Wire up state transitions (loading → matched/no-match/error)

### Phase 3: Integration
9. Update `SidebarContent` render logic for new states
10. Implement retry functionality
11. Add Pipedrive URL construction (or use backend URL)
12. Test integration with existing auth and chat detection

### Phase 4: Testing
13. Write unit tests for all new components
14. Write integration tests for lookup flow
15. Manual testing with real Pipedrive account
16. Fix bugs and edge cases

### Phase 5: Polish
17. Refine skeleton animation
18. Match styling to WhatsApp theme exactly
19. Ensure smooth transitions
20. Final code review and cleanup

---

## 8. Design Decisions & Rationale

### 8.1 Why Immediate Lookup (No Debounce)?

**Decision:** Trigger lookup immediately on chat switch (0ms delay)

**Rationale:**
- Loading state provides immediate feedback
- User expects instant response when switching chats
- Debouncing would add perceived latency
- If rapid switching becomes an issue, we can add debounce later

### 8.2 Why No Caching?

**Decision:** Always perform fresh lookup (no result caching)

**Rationale:**
- Keeps implementation simple for MVP
- Ensures data is always fresh (person may have been updated)
- API calls are fast enough (<500ms typical)
- If rate limiting becomes an issue, we can add caching in post-MVP

### 8.3 Why Full UI in No Match State?

**Decision:** Show complete form UI even though buttons are non-functional

**Rationale:**
- Provides visual context for future functionality
- User sees clear next steps (create or link)
- Easier to wire up functionality in Features 10 & 11
- Matches user's design vision from screenshot

### 8.4 Why Replace Content on Error (Not Banner)?

**Decision:** Error state replaces entire content area

**Rationale:**
- Clear, focused error handling
- Retry action is prominent and obvious
- Consistent with loading/matched/no-match state pattern
- Simpler state management (one state at a time)

---

## 9. Future Enhancements (Post-MVP)

### 9.1 Performance Optimizations
- Add result caching with TTL (5-10 minutes)
- Implement debouncing if rapid switching becomes issue
- Add request deduplication (cancel in-flight requests on new switch)

### 9.2 UX Improvements
- Add subtle transition animations between states
- Show "last updated" timestamp on matched cards
- Add "refresh" button to manually re-lookup
- Show loading progress indicator for slow connections

### 9.3 Additional Data
- Show person's organization in matched card
- Show person's photo/avatar if available
- Display multiple phone numbers if exist
- Show recent deals or activities

### 9.4 Advanced Features
- Fuzzy matching by name if phone lookup fails
- "Did you mean?" suggestions for near matches
- Inline editing of matched person details
- Quick actions (call, email) from matched card

---

## 10. Open Questions

### 10.1 Resolved
- ✅ When to trigger lookup? **Answer:** Immediately on chat switch
- ✅ Cache results? **Answer:** No, always fresh
- ✅ What to show on match? **Answer:** Name + phone + link
- ✅ What to show on no match? **Answer:** Full form UI (non-functional)
- ✅ Error handling approach? **Answer:** Replace content with error state

### 10.2 To Be Resolved
- ⏳ Backend provides Pipedrive URL or extension constructs it?
  - **Recommendation:** Backend provides full URL
  - **Action:** Confirm with backend implementation

- ⏳ Should loading state show phone number or just name?
  - **Recommendation:** Show both (name + phone) for clarity
  - **Action:** Decide during implementation

- ⏳ Exact green color for Create button?
  - **Recommendation:** Use Pipedrive brand green: `#4caf50` or similar
  - **Action:** Match during UI polish phase

---

## 11. References

### Related Documents
- [Plan-001-MVP-Feature-Breakdown.md](../Plans/Plan-001-MVP-Feature-Breakdown.md) - Feature 9 definition
- [Chrome-Extension-Architecture.md](../Architecture/Chrome-Extension-Architecture.md) - Overall architecture
- [Spec-106b-Extension-Pipedrive-API-Integration.md](Spec-106b-Extension-Pipedrive-API-Integration.md) - usePipedrive hook
- BRD-001-MVP-Pipedrive-WhatsApp.md - Product requirements

### External References
- WhatsApp Web Design System (color palette, typography)
- Pipedrive Brand Guidelines (green color, logo usage)
- React Testing Library Documentation
- Chrome Extension Best Practices

---

## 12. Implementation Notes

### 12.1 Completion Summary

**Implementation Date:** 2025-10-30
**Status:** ✅ All acceptance criteria met

**Components Implemented:**
- `PersonLookupLoading.tsx` - Loading skeleton with contact info header
- `PersonMatchedCard.tsx` - Matched person display with Pipedrive link
- `PersonNoMatchState.tsx` - Create/attach form UI (non-functional, styling only)
- `PersonLookupError.tsx` - Error display with retry functionality

**State Management:**
- Extended `SidebarState` type with 4 new person states
- Integrated lookup trigger in `App.tsx` on contact state change
- Automatic state transitions: loading → matched/no-match/error
- Retry functionality re-triggers lookup from error state

**Testing:**
- 35 unit tests for components (PersonLookupComponents.test.tsx)
- 11 integration tests for lookup flow (person-lookup-integration.test.tsx)
- All 46 tests passing
- Test coverage >80%

**Styling:**
- Tailwind CSS v3 installed and configured
- WhatsApp-style design with matching color palette
- Responsive layout within 350px sidebar width
- All components styled consistently

### 12.2 Tailwind CSS Setup

**Problem Encountered:**
Initial implementation used component-level inline styles, but styling was needed for complex layouts. Tailwind CSS was not previously configured in the project.

**Solution Implemented:**
1. Installed Tailwind CSS v3 with PostCSS and Autoprefixer
2. Created `tailwind.config.js` with content path scanning
3. Created `postcss.config.js` for PostCSS processing
4. Added Tailwind directives to `content-script.css`
5. Removed aggressive CSS reset (`all: revert`) that was overriding utility classes

**Configuration Details:**
- **Tailwind Version:** v3.x (better compatibility with Vite)
- **Content Paths:** `./src/**/*.{js,ts,jsx,tsx}`
- **Build Integration:** PostCSS processes Tailwind during Vite build
- **CSS Output:** ~10-11 KB (includes only used utility classes)

**Key Lesson:**
Avoid using `all: revert` or similar aggressive CSS resets in content scripts, as they will override all utility classes. Use targeted resets for specific properties only.

### 12.3 Backend Integration

**Pipedrive URL:**
Currently using placeholder URL construction in frontend:
```typescript
const pipedriveUrl = `https://alexander-sandbox12.pipedrive.com/person/${person.id}`
```

**Recommendation for Future:**
Backend should provide full `pipedriveUrl` in Person response to avoid hardcoding domain. This would require:
1. Store company domain during OAuth (from Pipedrive API response)
2. Include `pipedrive_url` field in PersonsSearch response
3. Format: `https://{domain}.pipedrive.com/person/{id}`

### 12.4 Known Limitations

**Non-Functional UI Elements (By Design):**
- Create Person form (name, email inputs and Create button)
- Search contact input field
- These will be implemented in Features 10 & 11

**No Caching:**
- Fresh lookup performed on every chat switch
- No result caching or deduplication
- Can be added in post-MVP if rate limiting becomes an issue

**No Debouncing:**
- Lookup triggers immediately on chat switch
- Can be added later if rapid switching causes issues

### 12.5 Manual Testing Results

**Tested Scenarios:**
- ✅ Switch to contact with match → PersonMatchedCard displays correctly
- ✅ Switch to contact without match → PersonNoMatchState shows form UI
- ✅ Contact name and phone visible in no-match state
- ✅ "Open in Pipedrive" link opens correct person profile
- ✅ Network error → Error state with retry button
- ✅ Retry button re-triggers lookup successfully
- ✅ Rapid chat switching → No crashes or race conditions
- ✅ Tailwind styles applied correctly in all states
- ✅ WhatsApp color theme matching

**Issues Resolved:**
1. **Missing Contact Info in No-Match State** - Added contact name/phone header
2. **Tailwind Styles Not Applied** - Fixed by setting up Tailwind CSS v3
3. **CSS Reset Conflict** - Removed `all: revert` that was overriding utilities

---

**End of Specification**
