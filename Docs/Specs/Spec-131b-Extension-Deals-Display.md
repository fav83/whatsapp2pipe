# Spec-131b: Extension Deals Display

**Feature:** Features 31, 32, 33 - Deal Auto-Lookup, Filtering/Sorting, and Display (Extension)
**Date:** 2025-01-17
**Status:** ✅ Complete
**Dependencies:** Spec-131a (Backend Deals API Service must be deployed)

---

## Implementation Split

Features 31, 32, and 33 from BRD-002 (Deals Management) are split into two independent specifications:

- **Spec-131a:** Backend Deals API Service - Azure Functions + C# + Pipedrive API integration
- **Spec-131b (This Document):** Extension Deals Display - TypeScript + React + UI Components

**Implementation Order:**
1. Spec-131a (Backend) - Must be deployed first
2. Spec-131b (Extension) - Integrates with deployed backend

---

**Related Docs:**
- [BRD-002-Deals-Management.md](../BRDs/BRD-002-Deals-Management.md) - Features 31, 32, 33
- [Spec-131a-Backend-Deals-API.md](Spec-131a-Backend-Deals-API.md) - Backend counterpart
- [Chrome-Extension-Architecture.md](../Architecture/Chrome-Extension-Architecture.md) - Extension architecture
- [UI-Design-Specification.md](../Architecture/UI-Design-Specification.md) - UI design system

---

## 1. Overview

Implement extension UI that displays deals associated with a matched person. When user switches to a WhatsApp chat, the extension auto-fetches person + deals in a single API call and displays deals in a dropdown selector below the person card.

**Why this matters:** Sales users need to see active deals at a glance when chatting with contacts. The dropdown pattern (inspired by competitor Pipechat) allows users to quickly scan all deals and select one to view details.

**User Experience Flow:**
1. User switches to WhatsApp chat with contact
2. Extension auto-looks up person by phone (existing Feature 9)
3. Backend returns person + deals in one response (NEW)
4. Extension displays PersonMatchedCard (existing)
5. Extension displays DealsSection below (NEW - separate card)
6. User selects deal from dropdown to view details

---

## 2. Objectives

- Display deals in separate section below PersonMatchedCard
- Implement dropdown selector showing all deal titles
- Color-code dropdown options by status (green=won, red/gray=lost, default=open)
- Display minimal deal details when selected (title, value, pipeline, stage)
- Show loading skeleton while deals fetch
- Handle empty state (no deals) with "Create Deal" button
- Handle error state with retry button
- Support BRD requirements: Features 31 (Auto-Lookup), 32 (Display Sorted), 33 (Display Fields)

---

## 3. Architecture Overview

### 3.1 Component Structure

```
Extension/src/
├── types/
│   ├── deal.ts                          # NEW: Deal type definitions
│   └── messages.ts                      # UPDATE: Add lookup message types
├── content-script/
│   ├── App.tsx                          # UPDATE: Add deals to person-matched state
│   ├── components/
│   │   ├── PersonMatchedCard.tsx        # NO CHANGES
│   │   ├── DealsSection.tsx             # NEW: Main deals section
│   │   ├── DealDropdown.tsx             # NEW: Dropdown selector
│   │   ├── DealDetails.tsx              # NEW: Selected deal display
│   │   ├── DealsLoadingSkeleton.tsx     # NEW: Loading placeholder
│   │   └── DealsErrorState.tsx          # NEW: Error display with retry
│   └── hooks/
│       └── usePipedrive.ts              # UPDATE: Add lookupByPhone method
└── service-worker/
    └── index.ts                         # UPDATE: Handle new lookup endpoint
```

### 3.2 Data Flow

```
User switches WhatsApp chat
  ↓
App.tsx (contact detected)
  ↓
usePipedrive.lookupByPhone(phone)
  ↓
Service Worker (chrome.runtime.sendMessage)
  ↓
Backend: GET /api/pipedrive/persons/lookup?phone={phone}
  ↓
Service Worker (receives response)
  ↓
usePipedrive (returns { person, deals, dealsError })
  ↓
App.tsx (setState person-matched with deals)
  ↓
Render PersonMatchedCard + DealsSection
```

---

## 4. Functional Requirements

### 4.1 Feature 31: Deal Auto-Lookup

**Trigger:** User switches to 1:1 WhatsApp chat with person who has phone number

**Behavior:**
- Extension calls single API endpoint: `GET /api/pipedrive/persons/lookup?phone={phone}`
- Backend returns `{ person, deals }` in one response
- Extension stores both in `person-matched` state
- Both PersonMatchedCard and DealsSection render together

**No user action required** - deals fetch automatically with person lookup.

### 4.2 Feature 32: Deal Display (Pre-Sorted)

**Backend handles sorting** - extension displays deals in exact order received:
1. Open deals (most recently updated first)
2. Won deals (most recently updated first)
3. Lost deals (most recently updated first)

**Extension does NOT sort** - just displays backend order in dropdown.

### 4.3 Feature 33: Deal Display Fields

**Dropdown Options:**
- Show deal title only (e.g., "Website Redesign Project")
- Color-code by status:
  - Open: Default text color
  - Won: Green text (`text-green-600`)
  - Lost: Gray text (`text-gray-500`)

**Selected Deal Details (below dropdown):**
- Title (bold, larger text)
- Value (formatted string from backend, e.g., "$50,000.00")
- Pipeline name
- Stage name

**NOT displayed in MVP:** Owner, last update date, days in stage, probability

---

## 5. UI Components Design

### 5.1 DealsSection Component

**File:** `Extension/src/content-script/components/DealsSection.tsx`

**Props:**
```typescript
interface DealsSectionProps {
  personId: number
  personName: string
  deals: Deal[] | null
  dealsError?: string
}
```

**Rendering Logic:**
```typescript
if (deals === null) {
  return <DealsErrorState error={dealsError} onRetry={handleRetry} />
}

if (deals.length === 0) {
  return <DealsEmptyState />
}

return (
  <div className="p-3 space-y-3">
    <div className="text-base font-semibold text-text-primary">Deals</div>
    <DealDropdown deals={deals} selectedDealId={selectedDealId} onSelect={setSelectedDealId} />
    {selectedDealId && (
      <DealDetails deal={deals.find(d => d.id === selectedDealId)} />
    )}
  </div>
)
```

**Visual Design:**
- Separate card with same styling as PersonMatchedCard
- Appears directly below PersonMatchedCard with consistent spacing
- White background, border, rounded corners

### 5.2 DealDropdown Component

**File:** `Extension/src/content-script/components/DealDropdown.tsx`

**Props:**
```typescript
interface DealDropdownProps {
  deals: Deal[]
  selectedDealId: number | null
  onSelect: (dealId: number) => void
}
```

**Implementation:**
```typescript
export function DealDropdown({ deals, selectedDealId, onSelect }: DealDropdownProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'won':
        return 'text-green-600'
      case 'lost':
        return 'text-gray-500'
      default:
        return 'text-text-primary'
    }
  }

  return (
    <select
      value={selectedDealId ?? ''}
      onChange={(e) => onSelect(Number(e.target.value))}
      className="w-full px-3 py-2 border border-border-secondary rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
    >
      <option value="">Select a deal...</option>
      {deals.map((deal) => (
        <option
          key={deal.id}
          value={deal.id}
          className={getStatusColor(deal.status)}
        >
          {deal.title}
        </option>
      ))}
    </select>
  )
}
```

**Styling:**
- Full width dropdown
- Placeholder: "Select a deal..."
- Border matches existing UI (`border-border-secondary`)
- Focus ring in brand color
- Option text color based on status

**Note:** CSS color classes on `<option>` may have limited browser support. If colors don't appear, consider alternative approaches (custom dropdown component or status indicators in text).

### 5.3 DealDetails Component

**File:** `Extension/src/content-script/components/DealDetails.tsx`

**Props:**
```typescript
interface DealDetailsProps {
  deal: Deal | undefined
}
```

**Implementation:**
```typescript
export function DealDetails({ deal }: DealDetailsProps) {
  if (!deal) return null

  return (
    <div className="p-3 bg-white rounded-lg border border-border-secondary shadow-sm space-y-2">
      {/* Deal Title */}
      <div className="text-base font-semibold text-text-primary">
        {deal.title}
      </div>

      {/* Value */}
      <div className="text-sm text-text-secondary">
        <span className="font-medium">Value:</span> {deal.value}
      </div>

      {/* Pipeline */}
      <div className="text-sm text-text-secondary">
        <span className="font-medium">Pipeline:</span> {deal.pipeline.name}
      </div>

      {/* Stage */}
      <div className="text-sm text-text-secondary">
        <span className="font-medium">Stage:</span> {deal.stage.name}
      </div>
    </div>
  )
}
```

**Styling:**
- White card with border and shadow (matches PersonMatchedCard)
- Title: Large, bold, primary text color
- Fields: Small text, secondary color
- Labels: Medium weight
- Vertical spacing between fields

### 5.4 DealsLoadingSkeleton Component

**File:** `Extension/src/content-script/components/DealsLoadingSkeleton.tsx`

**Props:**
```typescript
interface DealsLoadingSkeletonProps {}
```

**Implementation:**
```typescript
export function DealsLoadingSkeleton() {
  return (
    <div className="p-3 space-y-3">
      {/* Header */}
      <div className="text-base font-semibold text-text-primary">Deals</div>

      {/* Skeleton Dropdown */}
      <div className="w-full h-10 bg-gray-200 rounded-lg animate-pulse"></div>

      {/* Skeleton Details Box */}
      <div className="p-3 bg-gray-100 rounded-lg border border-border-secondary space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
        <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse"></div>
      </div>
    </div>
  )
}
```

**When shown:**
- During `person-loading` state (while backend is fetching person + deals)
- Can be rendered alongside PersonLookupLoading or as part of unified loading

### 5.5 DealsErrorState Component

**File:** `Extension/src/content-script/components/DealsErrorState.tsx`

**Props:**
```typescript
interface DealsErrorStateProps {
  error?: string
  onRetry: () => void
}
```

**Implementation:**
```typescript
export function DealsErrorState({ error, onRetry }: DealsErrorStateProps) {
  return (
    <div className="p-3 space-y-3">
      {/* Header */}
      <div className="text-base font-semibold text-text-primary">Deals</div>

      {/* Error Message */}
      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
        <div className="text-sm text-red-700">Unable to load deals</div>
        {error && (
          <div className="text-xs text-red-600 mt-1">{error}</div>
        )}
      </div>

      {/* Retry Button */}
      <button
        onClick={onRetry}
        className="w-full px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-hover transition-colors text-sm font-medium"
      >
        Retry
      </button>
    </div>
  )
}
```

**When shown:**
- Backend returned `{ person: {...}, deals: null, dealsError: "..." }`
- Person section displays normally, deals section shows error

**Retry behavior:**
- Clicking "Retry" re-triggers person lookup API call
- Uses same retry mechanism as PersonLookupError component

### 5.6 DealsEmptyState Component

**File:** `Extension/src/content-script/components/DealsSection.tsx` (can be inline)

**Implementation:**
```typescript
function DealsEmptyState() {
  return (
    <div className="p-3 space-y-3">
      {/* Header */}
      <div className="text-base font-semibold text-text-primary">Deals</div>

      {/* Empty Message */}
      <div className="p-4 bg-gray-50 border border-border-secondary rounded-lg text-center">
        <div className="text-sm text-text-secondary mb-3">No deals yet</div>

        {/* Create Deal Button (placeholder for Feature 36) */}
        <button className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-hover transition-colors text-sm font-medium">
          Create Deal
        </button>
      </div>
    </div>
  )
}
```

**When shown:**
- Backend returned `{ person: {...}, deals: [] }` (empty array)

**Note:** "Create Deal" button is placeholder for Feature 36 (out of scope for Features 31-33).

---

## 6. Type Definitions

### 6.1 New Deal Types

**File:** `Extension/src/types/deal.ts` (new file)

```typescript
export interface Deal {
  id: number
  title: string
  value: string // Formatted: "$50,000.00"
  stage: DealStage
  pipeline: DealPipeline
  status: 'open' | 'won' | 'lost'
}

export interface DealStage {
  id: number
  name: string
  order: number
}

export interface DealPipeline {
  id: number
  name: string
}
```

### 6.2 Update Message Types

**File:** `Extension/src/types/messages.ts`

Add new message types:

```typescript
// Request: Lookup person by phone (replaces PIPEDRIVE_LOOKUP_BY_PHONE)
export interface PipedriveLookupByPhoneRequest {
  type: 'PIPEDRIVE_LOOKUP_BY_PHONE'
  phone: string
}

// Success response with person + deals
export interface PipedriveLookupSuccessResponse {
  type: 'PIPEDRIVE_LOOKUP_SUCCESS'
  person: Person | null
  deals: Deal[] | null
  dealsError?: string
}

// Update existing unions
export type PipedriveRequest =
  | PipedriveLookupByPhoneRequest
  | PipedriveSearchByNameRequest
  | PipedriveCreatePersonRequest
  | PipedriveAttachPhoneRequest
  | PipedriveCreateNoteRequest

export type PipedriveResponse =
  | PipedriveLookupSuccessResponse
  | PipedriveSearchSuccessResponse
  | PipedriveCreateSuccessResponse
  | PipedriveAttachSuccessResponse
  | PipedriveCreateNoteSuccessResponse
  | PipedriveCreateNoteErrorResponse
  | PipedriveErrorResponse
```

---

## 7. State Management Updates

### 7.1 Update App.tsx State

**File:** `Extension/src/content-script/App.tsx`

Update `SidebarState` type:

```typescript
type SidebarState =
  | { type: 'welcome' }
  | { type: 'contact'; name: string; phone: string }
  | { type: 'contact-warning'; name: string; warning: string }
  | { type: 'group-chat' }
  | { type: 'person-loading'; name: string; phone: string }
  | {
      type: 'person-matched'
      person: Person
      phone: string
      deals: Deal[] | null
      dealsError?: string
    }
  | { type: 'person-no-match'; name: string; phone: string }
  | { type: 'person-error'; name: string; phone: string; error: string }
```

**Key changes:**
- Added `deals: Deal[] | null` to `person-matched` state
- Added `dealsError?: string` for graceful degradation

### 7.2 Update SidebarContent Component

**File:** `Extension/src/content-script/App.tsx`

Update `person-matched` case:

```typescript
case 'person-matched':
  return (
    <>
      <PersonMatchedCard
        name={state.person.name}
        phone={state.phone}
        pipedriveUrl={getPipedriveUrl(state.person.id)}
        personId={state.person.id}
      />

      <DealsSection
        personId={state.person.id}
        personName={state.person.name}
        deals={state.deals}
        dealsError={state.dealsError}
      />
    </>
  )
```

### 7.3 Update handlePersonLookup

**File:** `Extension/src/content-script/App.tsx`

Update lookup success handling:

```typescript
const handlePersonLookup = useCallback(
  async (phone: string, name: string) => {
    logger.log('[SidebarContent] handlePersonLookup called for:', phone)

    try {
      // Call lookupByPhone which now returns { person, deals, dealsError }
      const result = await lookupByPhone(phone)

      logger.log(
        '[SidebarContent] Lookup completed for:',
        phone,
        'Result:',
        result.person ? 'matched' : 'no match',
        'Deals:',
        result.deals?.length ?? 'error'
      )

      setState((currentState) => {
        if (
          currentState.type === 'person-loading' &&
          'phone' in currentState &&
          currentState.phone === phone
        ) {
          if (result.person) {
            logger.log('[SidebarContent] Updating state to person-matched for:', phone)
            return {
              type: 'person-matched',
              person: result.person,
              phone,
              deals: result.deals,
              dealsError: result.dealsError,
            }
          } else {
            logger.log('[SidebarContent] Updating state to person-no-match for:', phone)
            return {
              type: 'person-no-match',
              name,
              phone,
            }
          }
        }
        logger.log('[SidebarContent] Ignoring stale result for:', phone)
        return currentState
      })
    } catch (err) {
      logger.log('[SidebarContent] Lookup error for:', phone, err)
      setState((currentState) => {
        if (
          currentState.type === 'person-loading' &&
          'phone' in currentState &&
          currentState.phone === phone
        ) {
          return {
            type: 'person-error',
            name,
            phone,
            error: err instanceof Error ? err.message : 'Lookup failed',
          }
        }
        return currentState
      })
    }
  },
  [lookupByPhone, setState]
)
```

---

## 8. Service Integration

### 8.1 Update usePipedrive Hook

**File:** `Extension/src/content-script/hooks/usePipedrive.ts`

Update `lookupByPhone` method:

```typescript
/**
 * Lookup person by phone number (returns person + deals)
 * Returns object with person, deals, and optional dealsError
 */
const lookupByPhone = async (
  phone: string
): Promise<{
  person: Person | null
  deals: Deal[] | null
  dealsError?: string
}> => {
  setIsLoading(true)
  setError(null)

  try {
    const response = await sendMessage<PipedriveResponse>({
      type: 'PIPEDRIVE_LOOKUP_BY_PHONE',
      phone,
    })

    if (response.type === 'PIPEDRIVE_LOOKUP_SUCCESS') {
      return {
        person: response.person,
        deals: response.deals,
        dealsError: response.dealsError,
      }
    } else if (response.type === 'PIPEDRIVE_ERROR') {
      setError({
        message: response.error,
        statusCode: response.statusCode,
      })
      return {
        person: null,
        deals: null,
      }
    }

    throw new Error('Unexpected response type')
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Lookup failed'
    setError({ message: errorMessage, statusCode: 500 })
    return {
      person: null,
      deals: null,
    }
  } finally {
    setIsLoading(false)
  }
}
```

**Key changes:**
- Returns object instead of just `Person | null`
- Includes `deals` and `dealsError` fields
- Maintains backward compatibility (person can still be null)

### 8.2 Update Service Worker Handler

**File:** `Extension/src/service-worker/index.ts`

Update Pipedrive lookup handler:

```typescript
async function handlePipedriveLookupByPhone(phone: string): Promise<PipedriveResponse> {
  const verificationCode = await getVerificationCode()

  if (!verificationCode) {
    return {
      type: 'PIPEDRIVE_ERROR',
      error: 'Not authenticated',
      statusCode: 401,
    }
  }

  try {
    // Call new backend endpoint
    const response = await fetch(
      `${BACKEND_URL}/api/pipedrive/persons/lookup?phone=${encodeURIComponent(phone)}`,
      {
        headers: {
          Authorization: `Bearer ${verificationCode}`,
        },
      }
    )

    if (!response.ok) {
      if (response.status === 404) {
        // Person not found
        return {
          type: 'PIPEDRIVE_LOOKUP_SUCCESS',
          person: null,
          deals: [],
        }
      }

      return {
        type: 'PIPEDRIVE_ERROR',
        error: `HTTP ${response.status}`,
        statusCode: response.status,
      }
    }

    const data = await response.json()

    // Return person + deals (or error)
    return {
      type: 'PIPEDRIVE_LOOKUP_SUCCESS',
      person: data.person,
      deals: data.deals,
      dealsError: data.dealsError,
    }
  } catch (error) {
    return {
      type: 'PIPEDRIVE_ERROR',
      error: error instanceof Error ? error.message : 'Lookup failed',
      statusCode: 500,
    }
  }
}
```

**Key changes:**
- Calls new `/api/pipedrive/persons/lookup` endpoint
- Returns deals alongside person
- Handles partial failure (deals: null, dealsError present)

---

## 9. Testing Strategy

### 9.1 Manual Testing Scenarios

**Test 1: Person with Multiple Deals**
1. Open WhatsApp Web
2. Switch to chat with contact who has deals in Pipedrive
3. Verify:
   - PersonMatchedCard appears
   - DealsSection appears below
   - Dropdown shows all deal titles
   - Won deals are green, lost deals are gray
   - Selecting deal shows details (title, value, pipeline, stage)

**Test 2: Person with No Deals**
1. Switch to chat with contact who has no deals
2. Verify:
   - PersonMatchedCard appears
   - DealsSection shows empty state
   - "No deals yet" message displayed
   - "Create Deal" button present (disabled/placeholder)

**Test 3: Deals Fetch Error**
1. Disconnect from network or simulate backend error
2. Switch to chat with contact
3. Verify:
   - PersonMatchedCard appears normally
   - DealsSection shows error state
   - "Unable to load deals" message displayed
   - Retry button present and functional

**Test 4: Loading State**
1. Slow down network (Chrome DevTools → Network → Slow 3G)
2. Switch to chat with contact
3. Verify:
   - Loading skeleton appears
   - Skeleton matches final layout
   - Smooth transition to loaded state

**Test 5: Rapid Chat Switching**
1. Quickly switch between multiple contacts
2. Verify:
   - No stale data displayed (race condition check)
   - Correct deals shown for current contact
   - No flickering or UI glitches

### 9.2 Edge Cases

**Empty Deal Title:**
- Deal with empty string title should show "(Untitled Deal)" in dropdown

**Very Long Deal Title:**
- Long titles should truncate with ellipsis in dropdown
- Full title should display in details view

**Missing Stage/Pipeline:**
- Should not crash
- Display "Unknown Stage" or "Unknown Pipeline"

**Invalid Deal Status:**
- Status not "open", "won", or "lost"
- Default to open status styling

---

## 10. Styling Guidelines

### 10.1 Color System

Use existing Tailwind CSS color tokens from project:

**Text Colors:**
- Primary: `text-text-primary` (#333333)
- Secondary: `text-text-secondary` (#666666)
- Success (Won): `text-green-600` (#16a34a)
- Error/Lost: `text-gray-500` (#6b7280)

**Background Colors:**
- Card: `bg-white`
- Error: `bg-red-50`
- Empty state: `bg-gray-50`
- Skeleton: `bg-gray-200`

**Border Colors:**
- Primary: `border-border-primary`
- Secondary: `border-border-secondary`
- Error: `border-red-200`

**Brand Colors:**
- Primary: `bg-brand-primary`
- Hover: `bg-brand-hover`

### 10.2 Spacing

Follow existing component spacing:
- Card padding: `p-3`
- Vertical spacing: `space-y-3`
- Button padding: `px-4 py-2`

### 10.3 Typography

- Section header: `text-base font-semibold`
- Deal title: `text-base font-semibold`
- Labels: `text-sm font-medium`
- Values: `text-sm`
- Error messages: `text-sm` (primary), `text-xs` (details)

---

## 11. Accessibility

### 11.1 Keyboard Navigation

- Dropdown fully keyboard accessible (native `<select>`)
- Tab order: Dropdown → Retry button (if error)
- Enter/Space to open dropdown
- Arrow keys to navigate options
- Enter to select

### 11.2 Screen Readers

- Section labeled "Deals"
- Dropdown has implicit label from section header
- Empty state message announced
- Error state message announced
- Retry button has clear label

### 11.3 Focus Management

- Dropdown receives focus ring on focus
- Focus ring color: brand primary
- Focus ring width: 2px

---

## 12. Performance Considerations

### 12.1 Component Optimization

**React.memo for child components:**
```typescript
export const DealDropdown = React.memo(DealDropdownComponent)
export const DealDetails = React.memo(DealDetailsComponent)
```

**Reason:** Prevent unnecessary re-renders when parent re-renders but props unchanged

### 12.2 State Management

**Local state for selected deal:**
- Store `selectedDealId` in DealsSection component
- Don't lift to App.tsx unless needed
- Reduces global state updates

### 12.3 Data Loading

**Single API call:**
- Person + deals fetched together (no waterfall)
- Loading time: ~500ms typical
- No pagination needed (persons typically have <50 deals)

---

## 13. Error Handling

### 13.1 Graceful Degradation

**Person succeeds, deals fail:**
- Display PersonMatchedCard normally
- Display DealsErrorState with retry
- User can still interact with person section

**Network error:**
- Show error state with retry button
- Retry re-triggers full person lookup

**Invalid response:**
- Log error to Sentry
- Show generic error message
- Don't crash app

### 13.2 Logging

**Console logging (development):**
```typescript
logger.log('[DealsSection] Rendering with', deals?.length, 'deals')
logger.log('[DealDropdown] Selected deal:', selectedDealId)
```

**Error logging (production):**
```typescript
logError('Failed to render deals', error, { personId, dealsCount: deals?.length })
```

---

## 14. Success Criteria

- [x] DealsSection component implemented and renders below PersonMatchedCard
- [x] Dropdown shows all deal titles in backend-sorted order
- [x] Won deals display in green, lost deals in gray
- [x] Selected deal shows title, value, pipeline, stage
- [x] Loading skeleton displays during fetch
- [x] Empty state shows "No deals yet" message
- [x] Error state shows retry button and works correctly
- [x] All 5 manual test scenarios pass
- [x] No console errors or warnings
- [x] Keyboard navigation works correctly (Arrow Up/Down, Enter, Space, Escape)
- [x] UI matches existing design system
- [x] **Enhancement:** Full ARIA attributes for accessibility (combobox, listbox, aria-activedescendant)

---

## 15. Future Enhancements

### 15.1 Extended Deal Fields (Post-MVP)

Add fields from Feature 33 extended fields:
- Deal owner name
- Last update date
- Days in current stage
- Probability percentage

### 15.2 Deal Actions (Post-MVP)

Feature 35+ from BRD-002:
- Change deal stage (dropdown)
- Update deal value
- Add note to deal
- Open deal in Pipedrive

### 15.3 Deal Filtering (Post-MVP)

Feature 32 filtering:
- Filter by pipeline (multi-select)
- Filter by status (show/hide won/lost)
- Search deals by title

### 15.4 Custom Dropdown Component (Post-MVP)

If native `<option>` color-coding doesn't work:
- Build custom dropdown with proper color support
- Add status badges/icons
- Improve visual hierarchy

---

## 16. Dependencies

### 16.1 External Dependencies

No new npm packages required.

### 16.2 Internal Dependencies

- Spec-131a backend must be deployed and tested
- Existing person lookup flow must work correctly
- Tailwind CSS configured and working

---

## 17. Deployment Notes

### 17.1 Build Steps

```bash
cd Extension
npm run build
```

### 17.2 Testing Before Release

1. Test with backend in local development mode
2. Test with backend in staging environment
3. Test with backend in production
4. Verify Sentry error tracking works

### 17.3 Rollout Plan

1. Deploy backend (Spec-131a)
2. Test backend endpoints with curl
3. Build and test extension locally
4. Load unpacked extension in Chrome
5. Test all manual scenarios
6. Package extension: `npm run package`
7. Upload to Chrome Web Store (internal testing track)
8. Test with real users (beta testers)
9. Promote to production

---

**End of Spec-131b**
