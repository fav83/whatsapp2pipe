# Spec-137: Reopen Deal Flow

**Date:** 2025-01-22
**Status:** ✅ Complete
**Implemented:** 2025-01-22
**Related BRD:** [BRD-002: Deals Management](../BRDs/BRD-002-Deals-Management.md) (Feature 38)
**Dependencies:**
- [Spec-131b: Extension Deals Display](./Spec-131b-Extension-Deals-Display.md) (DealDetails component)
- [Spec-136: Mark Deal Won/Lost Flow](./Spec-136-Mark-Deal-Won-Lost-Flow.md) (UI patterns and status endpoint)

---

## 1. Overview

This specification defines the implementation for reopening won or lost deals back to open status directly from the WhatsApp Web extension sidebar. Users can reopen closed deals with a simple confirmation flow, returning them to the active pipeline for continued work.

### 1.1 Scope

**In Scope:**
- Reopen won or lost deals back to "open" status
- Simple confirmation flow before reopening
- API integration with Pipedrive to update deal status
- Immediate UI updates (status, buttons, dropdowns, dropdown position)
- Error handling and loading states
- Success notifications

**Out of Scope:**
- Reopening deleted/archived deals
- Bulk reopen operations
- Custom stage selection during reopen
- Reopen with reason/notes
- Undo functionality
- Deal timeline/history display

### 1.2 User Stories

**As a sales rep**, I want to reopen won deals when customers come back for additional purchases so that I can continue tracking the opportunity.

**As a sales rep**, I want to reopen lost deals when prospects reconsider so that I can move them back into my active pipeline without creating duplicate deals.

**As a sales manager**, I want my team to be able to quickly reactivate deals so that we maintain accurate pipeline data and don't lose historical context.

---

## 2. Technical Architecture

### 2.1 Component Structure

```
DealDetails.tsx (existing component - enhanced)
├── Deal information display (existing)
├── Pipeline/Stage (read-only for won/lost deals)
├── Lost reason display (for lost deals)
├── Reopen Button Section (NEW - for won/lost deals only)
│   ├── ReopenButton (NEW)
│   └── ReopenConfirmation (NEW - when Reopen clicked)
│       ├── Confirmation message
│       └── Confirm/Cancel buttons
├── Won/Lost Buttons Section (existing - for open deals only)
└── "Open in Pipedrive" link (existing)
```

### 2.2 State Management

**New state variables in DealDetails component:**

```typescript
// UI state for Reopen flow
const [isConfirmingReopen, setIsConfirmingReopen] = useState(false)

// Loading state
const [isReopening, setIsReopening] = useState(false)

// Error state
const [reopenError, setReopenError] = useState<string | null>(null)
```

### 2.3 Data Flow

```
User Action → Component State Update → API Call → Response Handling → UI Update

Example: Reopen Deal Flow
1. User clicks "Reopen" button
   → setIsConfirmingReopen(true)
2. User clicks "Confirm"
   → setIsReopening(true)
   → reopenDeal() API call
3. API success
   → onDealUpdated(updatedDeal) callback
   → setIsConfirmingReopen(false)
   → Deal moves to top of dropdown
   → showToast('Deal reopened')
4. API error
   → setReopenError(errorMessage)
   → setIsReopening(false)
   → Error banner shown
```

---

## 3. API Specification

### 3.1 Backend Endpoint: Reopen Deal (Extend Existing)

**Endpoint:** `PUT /api/pipedrive/deals/{dealId}/status` (EXISTING - extend to support "open")

**Request Headers:**
```
Authorization: Bearer {verification_code}
Content-Type: application/json
```

**Request Body:**

```json
{
  "status": "open"
}
```

**Request Validation:**
- `status` (required): Must be "won", "lost", or "open" (NEW - add "open" to validation)

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": 456,
    "title": "Website Redesign",
    "value": "$50,000.00",
    "stage": {
      "id": 5,
      "name": "Negotiation",
      "order": 5
    },
    "pipeline": {
      "id": 1,
      "name": "Sales Pipeline"
    },
    "status": "open",
    "lostReason": null,
    "updateTime": "2025-01-22T10:15:00Z"
  }
}
```

**Error Responses:**

```json
// 400 Bad Request - Invalid status
{
  "error": "Status must be 'won', 'lost', or 'open'"
}

// 404 Not Found
{
  "error": "Deal not found"
}

// 401 Unauthorized
{
  "error": "Invalid or expired session"
}

// 500 Internal Server Error
{
  "error": "Failed to update deal status"
}
```

### 3.2 Backend Implementation Changes

**File:** `/Backend/WhatsApp2Pipe.Api/Functions/MarkDealWonLostFunction.cs`

**Changes Required:**

1. **Update function name/route (OPTIONAL - consider renaming for clarity)**
   - Current: `MarkDealWonLostFunction` with route `"pipedrive/deals/{dealId}/status"`
   - Could rename to: `UpdateDealStatusFunction` (more generic)
   - **Decision:** Keep existing name and route for backward compatibility

2. **Update validation (Line 125-129)**

**BEFORE:**
```csharp
if (markRequest.Status != "won" && markRequest.Status != "lost")
{
    logger.LogWarning("[MarkDealWonLost] FAILED Step 4: Invalid status value: {Status}", markRequest.Status);
    return CreateErrorResponse(req, HttpStatusCode.BadRequest, "Status must be 'won' or 'lost'");
}
```

**AFTER:**
```csharp
if (markRequest.Status != "won" && markRequest.Status != "lost" && markRequest.Status != "open")
{
    logger.LogWarning("[MarkDealWonLost] FAILED Step 4: Invalid status value: {Status}", markRequest.Status);
    return CreateErrorResponse(req, HttpStatusCode.BadRequest, "Status must be 'won', 'lost', or 'open'");
}
```

3. **Update lost reason validation (Line 131-139)**

**BEFORE:**
```csharp
if (markRequest.Status == "lost")
{
    // Lost reason is optional, but if provided, it must not exceed 150 characters
    if (!string.IsNullOrWhiteSpace(markRequest.LostReason) && markRequest.LostReason.Length > 150)
    {
        logger.LogWarning("[MarkDealWonLost] FAILED Step 4: Lost reason too long: {Length}", markRequest.LostReason.Length);
        return CreateErrorResponse(req, HttpStatusCode.BadRequest, "Lost reason must be 150 characters or less");
    }
}
```

**AFTER:**
```csharp
if (markRequest.Status == "lost")
{
    // Lost reason is optional, but if provided, it must not exceed 150 characters
    if (!string.IsNullOrWhiteSpace(markRequest.LostReason) && markRequest.LostReason.Length > 150)
    {
        logger.LogWarning("[MarkDealWonLost] FAILED Step 4: Lost reason too long: {Length}", markRequest.LostReason.Length);
        return CreateErrorResponse(req, HttpStatusCode.BadRequest, "Lost reason must be 150 characters or less");
    }
}
else if (markRequest.Status == "open")
{
    // Reopening a deal - no lost reason should be provided
    // Pipedrive will handle clearing lost_reason field if needed
}
```

**Notes:**
- No changes needed to `PipedriveApiClient.MarkDealWonLostAsync()` - it already sends status to Pipedrive
- No changes needed to models - all types already support "open" status
- Pipedrive API handles `lost_reason` field automatically when status changes to "open"

### 3.3 Service Worker Integration

**File Location:** `/Extension/src/service-worker/index.ts`

**No changes required** - existing `handlePipedriveMarkDealWonLost` message handler already supports any status value.

Existing handler:
```typescript
async function handlePipedriveMarkDealWonLost(
  message: PipedriveMarkDealWonLostMessage
): Promise<PipedriveMarkDealWonLostSuccessMessage | PipedriveErrorMessage> {
  // ... existing implementation sends message.status to backend
  // Works for "won", "lost", and "open" without changes
}
```

### 3.4 Message Type Definitions

**File Location:** `/Extension/src/types/messages.ts`

**Update existing interface:**

**BEFORE:**
```typescript
export interface PipedriveMarkDealWonLostRequest {
  type: 'PIPEDRIVE_MARK_DEAL_WON_LOST'
  dealId: number
  status: 'won' | 'lost'
  lostReason?: string
}
```

**AFTER:**
```typescript
export interface PipedriveMarkDealWonLostRequest {
  type: 'PIPEDRIVE_MARK_DEAL_WON_LOST'
  dealId: number
  status: 'won' | 'lost' | 'open' // ← Add "open"
  lostReason?: string
}
```

### 3.5 Custom Hook Integration

**File Location:** `/Extension/src/content-script/hooks/usePipedrive.ts`

**Add new method:**

```typescript
export function usePipedrive() {
  // Existing methods...

  const reopenDeal = async (dealId: number): Promise<Deal> => {
    const response = await chrome.runtime.sendMessage({
      type: 'PIPEDRIVE_MARK_DEAL_WON_LOST',
      dealId,
      status: 'open'
    })

    if (response.type === 'PIPEDRIVE_ERROR') {
      throw new Error(response.error)
    }

    return response.deal
  }

  return {
    // Existing methods...
    markDealWonLost, // Existing
    reopenDeal // NEW
  }
}
```

---

## 4. UI Design Specification

### 4.1 Component Layout

**DealDetails Component Enhancement:**

```tsx
// Deal information display (existing)
{deal.status === 'won' && (
  <div className="status-badge status-won">Won ✓</div>
)}
{deal.status === 'lost' && (
  <div className="status-badge status-lost">Lost ✗</div>
)}

{/* Lost reason (if deal is lost) */}
{deal.status === 'lost' && deal.lostReason && (
  <div className="lost-reason-display">
    <span className="label">Lost Reason:</span>
    <span className="value">{deal.lostReason}</span>
  </div>
)}

{/* Pipeline/Stage (read-only for won/lost deals) */}
{(deal.status === 'won' || deal.status === 'lost') && (
  <div className="pipeline-stage-readonly">
    <div className="field">
      <span className="label">Pipeline:</span>
      <span className="value">{deal.pipeline.name}</span>
    </div>
    <div className="field">
      <span className="label">Stage:</span>
      <span className="value">{deal.stage.name}</span>
    </div>
  </div>
)}

{/* NEW: Reopen Button Section (for won/lost deals only) */}
{(deal.status === 'won' || deal.status === 'lost') && !isConfirmingReopen && (
  <div className="reopen-section">
    <button
      onClick={handleReopenClick}
      className="btn-reopen"
      aria-label="Reopen deal"
    >
      Reopen
    </button>
  </div>
)}

{/* Reopen Confirmation UI */}
{isConfirmingReopen && (
  <div className="reopen-confirmation">
    {reopenError && (
      <div className="error-banner">
        <span>{reopenError}</span>
        <button onClick={() => setReopenError(null)}>×</button>
      </div>
    )}
    <p className="confirmation-message">Reopen this deal?</p>
    <div className="action-buttons">
      <button
        onClick={handleConfirmReopen}
        disabled={isReopening}
        className="btn-confirm"
      >
        {isReopening ? (
          <>
            <span className="spinner" /> Saving...
          </>
        ) : (
          'Confirm'
        )}
      </button>
      <button
        onClick={handleCancelReopen}
        disabled={isReopening}
        className="btn-cancel"
      >
        Cancel
      </button>
    </div>
  </div>
)}

{/* Open in Pipedrive link (always at bottom) */}
<a href={pipedriveUrl} target="_blank" rel="noopener noreferrer">
  Open in Pipedrive →
</a>
```

### 4.2 Event Handlers

```typescript
const handleReopenClick = () => {
  setIsConfirmingReopen(true)
  setReopenError(null)
}

const handleCancelReopen = () => {
  setIsConfirmingReopen(false)
  setReopenError(null)
}

const handleConfirmReopen = async () => {
  setIsReopening(true)
  setReopenError(null)

  try {
    const updatedDeal = await reopenDeal(deal.id)

    // Update parent component with new deal data
    onDealUpdated(updatedDeal)

    // Close confirmation UI
    setIsConfirmingReopen(false)

    // Show success toast
    showToast('Deal reopened', 'success')
  } catch (error) {
    const errorMessage = error instanceof Error
      ? error.message
      : 'Failed to reopen deal'
    setReopenError(errorMessage)
    logError('Failed to reopen deal', error, { dealId: deal.id })
  } finally {
    setIsReopening(false)
  }
}
```

### 4.3 CSS Styling

**File Location:** `/Extension/src/styles/content-script.css`

```css
/* Reopen Section */
.reopen-section {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}

.btn-reopen {
  width: 100%;
  padding: 8px 16px;
  background: #2563eb; /* Brand primary */
  color: white;
  border: 1px solid #1d4ed8;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-reopen:hover:not(:disabled) {
  background: #1d4ed8;
}

.btn-reopen:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Reopen Confirmation */
.reopen-confirmation {
  margin-top: 16px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.reopen-confirmation .confirmation-message {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #374151;
}

/* Reuse existing action-buttons, btn-confirm, btn-cancel, error-banner styles from Spec-136 */
```

---

## 5. UI States & Flows

### 5.1 Initial State (Won/Lost Deal)

**Conditions:**
- Deal status is "won" or "lost"
- No confirmation UI active

**UI Display:**
- Deal information shown (title, value, status badge)
- Pipeline/stage shown as **read-only text** (not dropdowns)
- Lost reason displayed (if deal is lost)
- **Reopen** button visible
- "Open in Pipedrive" link at bottom
- No Won/Lost buttons (deal is closed)

**Visual (Lost Deal):**
```
┌─────────────────────────────────────┐
│ Deal Title: Website Redesign        │
│ Value: $50,000.00                   │
│ Status: Lost ✗                      │
│ Lost Reason: Customer chose         │
│              competitor             │
│ Pipeline: Sales Pipeline            │
│ Stage: Negotiation                  │
│                                     │
│ ─────────────────────────────────── │
│ [        Reopen        ]            │
│                                     │
│ [Open in Pipedrive →]               │
└─────────────────────────────────────┘
```

**Visual (Won Deal):**
```
┌─────────────────────────────────────┐
│ Deal Title: Website Redesign        │
│ Value: $50,000.00                   │
│ Status: Won ✓                       │
│ Pipeline: Sales Pipeline            │
│ Stage: Negotiation                  │
│                                     │
│ ─────────────────────────────────── │
│ [        Reopen        ]            │
│                                     │
│ [Open in Pipedrive →]               │
└─────────────────────────────────────┘
```

### 5.2 Reopen Confirmation State

**Trigger:** User clicks "Reopen" button

**State Changes:**
- `isConfirmingReopen = true`
- Reopen button hidden
- Confirmation UI displayed

**UI Display:**
- Deal information remains visible above
- Confirmation message: "Reopen this deal?"
- Confirm and Cancel buttons shown

**Visual:**
```
┌─────────────────────────────────────┐
│ Deal Title: Website Redesign        │
│ Value: $50,000.00                   │
│ Status: Won ✓                       │
│ Pipeline: Sales Pipeline            │
│ Stage: Negotiation                  │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Reopen this deal?               │ │
│ │                                 │ │
│ │ [ Confirm ] [ Cancel ]          │ │
│ └─────────────────────────────────┘ │
│                                     │
│ [Open in Pipedrive →]               │
└─────────────────────────────────────┘
```

### 5.3 Reopen Loading State

**Trigger:** User clicks "Confirm" button

**State Changes:**
- `isReopening = true`
- Confirm button shows spinner and "Saving..."
- Both buttons disabled

**Visual:**
```
┌─────────────────────────────────────┐
│ Deal Title: Website Redesign        │
│ Value: $50,000.00                   │
│ Status: Won ✓                       │
│ Pipeline: Sales Pipeline            │
│ Stage: Negotiation                  │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Reopen this deal?               │ │
│ │                                 │ │
│ │ [⟳ Saving...] [ Cancel ]        │ │
│ │  (disabled)    (disabled)       │ │
│ └─────────────────────────────────┘ │
│                                     │
│ [Open in Pipedrive →]               │
└─────────────────────────────────────┘
```

### 5.4 Reopen Success State

**Trigger:** API returns success

**State Changes:**
- `isConfirmingReopen = false`
- `isReopening = false`
- Deal object updated with `status: 'open'`
- Success toast displayed
- **Deal moves to TOP of dropdown list**

**UI Display:**
- Confirmation UI disappears
- Deal card updates to show Open status
- Pipeline/stage now shown as **editable dropdowns**
- Lost reason no longer displayed (if was lost deal)
- Reopen button no longer displayed
- **Won/Lost buttons NOW visible** (deal is open)
- Toast notification: "Deal reopened"

**Visual:**
```
┌─────────────────────────────────────┐
│ Deal Title: Website Redesign        │
│ Value: $50,000.00                   │
│ Pipeline: [Sales Pipeline ▼]        │ ← Now editable
│ Stage: [Negotiation ▼]              │ ← Now editable
│                                     │
│ [Open in Pipedrive →]               │
│                                     │
│ ─────────────────────────────────── │
│ [  Won ✓  ] [  Lost ✗  ]           │ ← Now visible
└─────────────────────────────────────┘

  [Toast: Deal reopened ✓]
```

**Dropdown Update:**
The deal now appears at the **top** of the dropdown list:
```
Deals dropdown:
  🔄 Website Redesign - $50,000.00  ← Moved to top (just reopened)
  🔄 Mobile App - $30,000.00
  🔄 Consulting - $15,000.00
  ✅ Previous Won Deal - $20,000.00
  ✗ Previous Lost Deal - $10,000.00
```

### 5.5 Reopen Error State

**Trigger:** API returns error

**State Changes:**
- `isReopening = false`
- `reopenError = error message`
- Error banner displayed

**UI Display:**
- Error banner appears above confirmation message
- Confirmation UI remains visible
- Confirm/Cancel buttons enabled for retry

**Visual:**
```
┌─────────────────────────────────────┐
│ Deal Title: Website Redesign        │
│ Value: $50,000.00                   │
│ Status: Won ✓                       │
│ Pipeline: Sales Pipeline            │
│ Stage: Negotiation                  │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ ┌───────────────────────────┐   │ │
│ │ │ ⚠ Failed to reopen deal.  │ × │ │
│ │ │   Try again.              │   │ │
│ │ └───────────────────────────┘   │ │
│ │                                 │ │
│ │ Reopen this deal?               │ │
│ │                                 │ │
│ │ [ Confirm ] [ Cancel ]          │ │
│ └─────────────────────────────────┘ │
│                                     │
│ [Open in Pipedrive →]               │
└─────────────────────────────────────┘
```

---

## 6. Parent Component Updates

### 6.1 DealsSection State Management

**File Location:** `/Extension/src/content-script/components/DealsSection.tsx`

When a deal is reopened, the parent `DealsSection` component must:

1. **Update the deals array** with the reopened deal's new data
2. **Re-sort the deals array** to move reopened deal to top
3. **Keep the deal selected** (don't change selected deal)

**Implementation:**

```typescript
// In DealsSection.tsx
const handleDealUpdated = (updatedDeal: Deal) => {
  // Update deals array with new deal data
  const updatedDeals = deals.map((d) => (d.id === updatedDeal.id ? updatedDeal : d))

  // If deal was reopened (status changed to 'open'), move it to top
  if (updatedDeal.status === 'open') {
    // Remove the reopened deal from its current position
    const otherDeals = updatedDeals.filter(d => d.id !== updatedDeal.id)

    // Place it at the top of the list
    const reorderedDeals = [updatedDeal, ...otherDeals]

    // Notify parent to update deals state
    onDealsUpdated?.(reorderedDeals)
  } else {
    // For won/lost updates, no reordering needed
    onDealsUpdated?.(updatedDeals)
  }
}
```

### 6.2 DealDetails Props Update

**File Location:** `/Extension/src/content-script/components/DealDetails.tsx`

**Add new prop for reopen functionality:**

```typescript
interface DealDetailsProps {
  deal: Deal
  pipelines: Pipeline[]
  stages: Stage[]
  onDealUpdated: (deal: Deal) => void

  // Add new prop for reopen (reuse existing markDealWonLost hook)
  // OR create separate reopenDeal prop
}
```

**Note:** Since we're extending the existing `markDealWonLost` message type to support "open" status, we can reuse the hook. However, for clarity, we'll add a dedicated `reopenDeal` method via `usePipedrive` hook.

---

## 7. Edge Cases & Error Handling

### 7.1 Validation Errors

**Deal Already Open:**
- **Trigger:** User somehow tries to reopen a deal that's already open (edge case - UI shouldn't show Reopen button)
- **Handling:**
  - Pipedrive API handles this gracefully (idempotent operation)
  - Returns the deal unchanged with status "open"
  - Extension shows success (no error needed)

### 7.2 Network Errors

**Request Timeout:**
- **Trigger:** API call takes too long
- **Handling:**
  - Service worker timeout after 30 seconds
  - Error banner: "Request timed out. Please try again."
  - Confirm/Cancel buttons remain enabled for retry

**No Internet Connection:**
- **Trigger:** User is offline
- **Handling:**
  - Fetch fails immediately
  - Error banner: "No internet connection. Please check your network."
  - User can retry when connection restored

**Server Error (500):**
- **Trigger:** Backend or Pipedrive API failure
- **Handling:**
  - Error banner: "Failed to reopen deal. Please try again."
  - Error logged to Sentry with context
  - Confirm/Cancel buttons enabled for retry

### 7.3 Authentication Errors

**Invalid/Expired Session (401):**
- **Trigger:** Verification code expired or invalid
- **Handling:**
  - Error banner: "Session expired. Please sign in again."
  - User redirected to sign-in flow (existing pattern)

**Missing Authorization:**
- **Trigger:** Verification code not found in storage
- **Handling:**
  - Error banner: "Not authenticated. Please sign in."
  - User redirected to sign-in flow

### 7.4 Deal Not Found Errors

**Deal Deleted in Pipedrive (404):**
- **Trigger:** Deal was deleted by another user
- **Handling:**
  - Error banner: "Deal not found. It may have been deleted."
  - Suggest refreshing deals list
  - Remove deal from local state after user acknowledges

### 7.5 Race Conditions

**Deal Updated by Another User:**
- **Trigger:** Deal status changed externally while user is reopening
- **Handling:**
  - Current implementation: Last write wins
  - Backend trusts Pipedrive API response
  - Show success and update with latest state from server

**Rapid Button Clicks:**
- **Trigger:** User clicks Reopen/Confirm buttons rapidly
- **Handling:**
  - Buttons disabled immediately on first click
  - Second click has no effect (button disabled)
  - Loading state prevents double-submission

### 7.6 Browser/Extension Issues

**Extension Reload During Operation:**
- **Trigger:** User reloads extension while reopening deal
- **Handling:**
  - All local state lost
  - API call may or may not complete
  - On reload, fetch fresh deal data from Pipedrive
  - User sees current state (may be reopened if API succeeded)

**WhatsApp Page Refresh:**
- **Trigger:** User refreshes WhatsApp Web
- **Handling:**
  - Extension re-initializes
  - Sidebar re-renders
  - Fresh deal data fetched
  - Any in-progress operations lost

### 7.7 Lost Reason Display

**Lost Reason After Reopen:**
- **Trigger:** Deal is reopened, Pipedrive may or may not clear `lost_reason` field
- **Handling:**
  - Extension UI only displays `lostReason` when `deal.status === 'lost'`
  - Even if Pipedrive keeps the value in database, it won't be shown for open deals
  - Clean UI with no historical clutter

---

## 8. Accessibility

### 8.1 Keyboard Navigation

**Tab Order:**
1. Reopen button
2. (When confirming) Confirm button → Cancel button

**Keyboard Shortcuts:**
- **Enter key** when focused on Reopen button → Opens confirmation
- **Enter key** in confirmation state → Confirms reopen (same as clicking Confirm)
- **Escape key** in confirmation state → Cancels operation (same as clicking Cancel)
- **Tab/Shift+Tab** → Navigate between interactive elements

### 8.2 Screen Reader Support

**ARIA Labels:**

```tsx
// Reopen button
<button
  onClick={handleReopenClick}
  className="btn-reopen"
  aria-label="Reopen deal"
>
  Reopen
</button>

// Confirmation buttons (reuse existing patterns from Spec-136)
<button
  onClick={handleConfirmReopen}
  disabled={isReopening}
  className="btn-confirm"
  aria-label="Confirm reopening deal"
>
  {isReopening ? 'Saving...' : 'Confirm'}
</button>

<button
  onClick={handleCancelReopen}
  disabled={isReopening}
  className="btn-cancel"
  aria-label="Cancel reopening deal"
>
  Cancel
</button>
```

**Live Regions:**

```tsx
// Error announcements
<div role="alert" aria-live="assertive">
  {reopenError && <p>{reopenError}</p>}
</div>

// Success announcements (via toast)
<div role="status" aria-live="polite">
  {toastMessage}
</div>
```

### 8.3 Focus Management

**Focus After Reopen Click:**
- Focus moves to "Confirm" button

**Focus After Cancel:**
- Focus returns to "Reopen" button

**Focus After Success:**
- Focus remains on deal card (natural tab order continues)

**Focus After Error:**
- Focus remains in error state (user can retry)

---

## 9. Performance Considerations

### 9.1 API Call Optimization

**Debouncing:**
- Not applicable (single-click action, not real-time input)

**Request Deduplication:**
- Buttons disabled during API call prevents duplicate requests
- No need for additional deduplication logic

**Response Caching:**
- No caching needed (single operation, not repeated)
- Fresh deal data returned from server after update

### 9.2 UI Rendering

**State Updates:**
- Minimal re-renders via React.memo on DealDetails
- Only affected components re-render when deal updates
- Parent components receive updated deal via callback

**List Reordering:**
- When deal is reopened, client-side re-sort moves it to top
- Efficient array manipulation (remove + prepend)
- No full list re-render, only position change

**CSS Transitions:**
- Smooth 200ms transitions on button hover states
- No heavy animations during loading states
- Spinner uses CSS animation (GPU-accelerated)

### 9.3 Bundle Size

**New Code Impact:**
- Estimated +1.5KB minified JS (reopen handlers, confirmation UI)
- Estimated +0.8KB minified CSS (reopen button styles)
- Total impact: ~2.3KB (negligible)
- Reuses existing confirmation UI patterns from Won/Lost flows

---

## 10. Testing Strategy

### 10.1 Unit Tests

**Component Tests (Vitest + React Testing Library):**

```typescript
describe('DealDetails - Reopen Action', () => {
  it('shows Reopen button for won deals', () => {
    const deal = createMockDeal({ status: 'won' })
    render(<DealDetails deal={deal} {...mockProps} />)

    expect(screen.getByRole('button', { name: /reopen deal/i })).toBeInTheDocument()
  })

  it('shows Reopen button for lost deals', () => {
    const deal = createMockDeal({ status: 'lost' })
    render(<DealDetails deal={deal} {...mockProps} />)

    expect(screen.getByRole('button', { name: /reopen deal/i })).toBeInTheDocument()
  })

  it('does not show Reopen button for open deals', () => {
    const deal = createMockDeal({ status: 'open' })
    render(<DealDetails deal={deal} {...mockProps} />)

    expect(screen.queryByRole('button', { name: /reopen deal/i })).not.toBeInTheDocument()
  })

  it('shows confirmation UI when Reopen button is clicked', () => {
    const deal = createMockDeal({ status: 'won' })
    render(<DealDetails deal={deal} {...mockProps} />)

    fireEvent.click(screen.getByRole('button', { name: /reopen deal/i }))

    expect(screen.getByText(/reopen this deal/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /confirm/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
  })

  it('calls reopenDeal with correct parameters on Confirm', async () => {
    const mockReopenDeal = vi.fn().mockResolvedValue(createMockDeal({ status: 'open' }))
    const deal = createMockDeal({ status: 'won', id: 123 })

    render(<DealDetails deal={deal} reopenDeal={mockReopenDeal} {...mockProps} />)

    fireEvent.click(screen.getByRole('button', { name: /reopen deal/i }))
    fireEvent.click(screen.getByRole('button', { name: /confirm/i }))

    await waitFor(() => {
      expect(mockReopenDeal).toHaveBeenCalledWith(123)
    })
  })

  it('updates deal card to show open state after successful reopen', async () => {
    const mockReopenDeal = vi.fn().mockResolvedValue(createMockDeal({ status: 'open' }))
    const mockOnDealUpdated = vi.fn()
    const deal = createMockDeal({ status: 'won' })

    render(
      <DealDetails
        deal={deal}
        reopenDeal={mockReopenDeal}
        onDealUpdated={mockOnDealUpdated}
        {...mockProps}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /reopen deal/i }))
    fireEvent.click(screen.getByRole('button', { name: /confirm/i }))

    await waitFor(() => {
      expect(mockOnDealUpdated).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'open' })
      )
    })
  })

  it('shows error banner on API failure', async () => {
    const mockReopenDeal = vi.fn().mockRejectedValue(new Error('Network error'))
    const deal = createMockDeal({ status: 'lost' })

    render(<DealDetails deal={deal} reopenDeal={mockReopenDeal} {...mockProps} />)

    fireEvent.click(screen.getByRole('button', { name: /reopen deal/i }))
    fireEvent.click(screen.getByRole('button', { name: /confirm/i }))

    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument()
    })
  })

  it('resets state when Cancel is clicked', () => {
    const deal = createMockDeal({ status: 'won' })
    render(<DealDetails deal={deal} {...mockProps} />)

    fireEvent.click(screen.getByRole('button', { name: /reopen deal/i }))
    expect(screen.getByText(/reopen this deal/i)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }))
    expect(screen.queryByText(/reopen this deal/i)).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /reopen deal/i })).toBeInTheDocument()
  })

  it('hides lost reason after successful reopen', async () => {
    const mockReopenDeal = vi.fn().mockResolvedValue(
      createMockDeal({ status: 'open', lostReason: null })
    )
    const deal = createMockDeal({
      status: 'lost',
      lostReason: 'Customer chose competitor'
    })

    const { rerender } = render(
      <DealDetails deal={deal} reopenDeal={mockReopenDeal} {...mockProps} />
    )

    // Lost reason visible before reopen
    expect(screen.getByText(/customer chose competitor/i)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /reopen deal/i }))
    fireEvent.click(screen.getByRole('button', { name: /confirm/i }))

    await waitFor(() => {
      expect(mockReopenDeal).toHaveBeenCalled()
    })

    // Simulate parent updating deal prop with reopened deal
    rerender(
      <DealDetails
        deal={createMockDeal({ status: 'open', lostReason: null })}
        reopenDeal={mockReopenDeal}
        {...mockProps}
      />
    )

    // Lost reason no longer visible
    expect(screen.queryByText(/customer chose competitor/i)).not.toBeInTheDocument()
  })

  it('shows Won/Lost buttons after successful reopen', async () => {
    const mockReopenDeal = vi.fn().mockResolvedValue(createMockDeal({ status: 'open' }))
    const deal = createMockDeal({ status: 'won' })

    const { rerender } = render(
      <DealDetails deal={deal} reopenDeal={mockReopenDeal} {...mockProps} />
    )

    fireEvent.click(screen.getByRole('button', { name: /reopen deal/i }))
    fireEvent.click(screen.getByRole('button', { name: /confirm/i }))

    await waitFor(() => {
      expect(mockReopenDeal).toHaveBeenCalled()
    })

    // Simulate parent updating deal prop
    rerender(
      <DealDetails
        deal={createMockDeal({ status: 'open' })}
        reopenDeal={mockReopenDeal}
        {...mockProps}
      />
    )

    // Won/Lost buttons now visible
    expect(screen.getByRole('button', { name: /mark deal as won/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /mark deal as lost/i })).toBeInTheDocument()
  })
})
```

### 10.2 Integration Tests

**Service Worker Tests:**

```typescript
describe('Service Worker - Reopen Deal', () => {
  it('sends correct request to backend for reopen', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: mockOpenDeal })
    })
    global.fetch = mockFetch

    const response = await handlePipedriveMarkDealWonLost({
      type: 'PIPEDRIVE_MARK_DEAL_WON_LOST',
      dealId: 456,
      status: 'open'
    })

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:7071/api/pipedrive/deals/456/status',
      expect.objectContaining({
        method: 'PUT',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'Authorization': expect.stringContaining('Bearer')
        }),
        body: JSON.stringify({ status: 'open' })
      })
    )

    expect(response.type).toBe('PIPEDRIVE_MARK_DEAL_WON_LOST_SUCCESS')
    expect(response.deal.status).toBe('open')
  })

  it('returns error message on failed reopen request', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Deal not found' })
    })

    const response = await handlePipedriveMarkDealWonLost({
      type: 'PIPEDRIVE_MARK_DEAL_WON_LOST',
      dealId: 999,
      status: 'open'
    })

    expect(response.type).toBe('PIPEDRIVE_ERROR')
    expect(response.error).toBe('Deal not found')
  })
})
```

### 10.3 Backend Tests

**Function Tests (C# xUnit):**

```csharp
[Fact]
public async Task MarkDealWonLost_ValidReopenRequest_ReturnsSuccess()
{
    // Arrange
    var dealId = 456;
    var request = CreateMockRequest(new { status = "open" });
    var mockSession = CreateValidSession();
    var mockDeal = CreateMockPipedriveDeal(dealId, "open");

    sessionService.GetSessionAsync(Arg.Any<string>()).Returns(mockSession);
    pipedriveApiClient.MarkDealWonLostAsync(mockSession, dealId, "open", null)
        .Returns(mockDeal);

    // Act
    var response = await function.Run(request);

    // Assert
    Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    var body = await DeserializeResponse<DealResponse>(response);
    Assert.True(body.Success);
    Assert.Equal("open", body.Data.Status);
}

[Fact]
public async Task MarkDealWonLost_InvalidStatus_ReturnsBadRequest()
{
    // Arrange
    var request = CreateMockRequest(new { status = "invalid" });
    var mockSession = CreateValidSession();

    sessionService.GetSessionAsync(Arg.Any<string>()).Returns(mockSession);

    // Act
    var response = await function.Run(request);

    // Assert
    Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    var body = await DeserializeResponse<ErrorResponse>(response);
    Assert.Contains("Status must be 'won', 'lost', or 'open'", body.Error);
}

[Fact]
public async Task MarkDealWonLost_ReopenWithLostReason_IgnoresLostReason()
{
    // Arrange - trying to reopen with lost reason (shouldn't be provided, but testing graceful handling)
    var dealId = 456;
    var request = CreateMockRequest(new {
        status = "open",
        lostReason = "Some reason" // Should be ignored
    });
    var mockSession = CreateValidSession();
    var mockDeal = CreateMockPipedriveDeal(dealId, "open");

    sessionService.GetSessionAsync(Arg.Any<string>()).Returns(mockSession);
    pipedriveApiClient.MarkDealWonLostAsync(mockSession, dealId, "open", Arg.Any<string>())
        .Returns(mockDeal);

    // Act
    var response = await function.Run(request);

    // Assert
    Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    // Pipedrive handles clearing lost_reason, we just pass status
}
```

### 10.4 E2E Tests (Manual Testing Checklist)

See **Section 11: Manual Testing Checklist** below.

---

## 11. Manual Testing Checklist

### 11.1 Reopen Won Deal - Happy Path

- [ ] Won deal displayed with "Won ✓" status
- [ ] Pipeline/Stage shown as read-only text (not dropdowns)
- [ ] "Reopen" button visible below deal info
- [ ] "Open in Pipedrive" link at bottom
- [ ] No Won/Lost buttons visible
- [ ] Click "Reopen" button
- [ ] Confirmation message "Reopen this deal?" appears
- [ ] Reopen button hidden during confirmation
- [ ] Click "Confirm" button
- [ ] Button shows spinner and "Saving..." text
- [ ] Both buttons disabled during API call
- [ ] Success toast appears: "Deal reopened"
- [ ] Deal card updates to show "open" status
- [ ] Pipeline/Stage now shown as editable dropdowns
- [ ] Won/Lost buttons now visible at bottom
- [ ] Reopen button no longer visible
- [ ] Deal moves to TOP of dropdown list
- [ ] Deal remains selected in dropdown
- [ ] Dropdown shows deal with 🔄 icon in Open section

### 11.2 Reopen Lost Deal - Happy Path

- [ ] Lost deal displayed with "Lost ✗" status
- [ ] Lost reason displayed in deal card
- [ ] Pipeline/Stage shown as read-only text
- [ ] "Reopen" button visible
- [ ] Click "Reopen" button
- [ ] Confirmation UI appears
- [ ] Click "Confirm"
- [ ] Loading state shown
- [ ] Success toast appears: "Deal reopened"
- [ ] Deal status changes to "open"
- [ ] Lost reason no longer displayed
- [ ] Pipeline/Stage now editable dropdowns
- [ ] Won/Lost buttons now visible
- [ ] Reopen button hidden
- [ ] Deal moves to top of dropdown
- [ ] Deal dropdown icon changes from ✗ to 🔄

### 11.3 Reopen - Cancel Flow

- [ ] Click "Reopen" button on won/lost deal
- [ ] Confirmation UI appears
- [ ] Click "Cancel" button
- [ ] Confirmation UI disappears
- [ ] Reopen button reappears
- [ ] Deal status remains unchanged (won/lost)
- [ ] No API call made

### 11.4 Reopen - Error Handling

- [ ] Disconnect internet before confirming reopen
- [ ] Click "Reopen" then "Confirm"
- [ ] Error banner appears with network error message
- [ ] Confirm/Cancel buttons remain visible and enabled
- [ ] Click X button on error banner to dismiss
- [ ] Reconnect internet and retry
- [ ] Success flow completes normally

### 11.5 Deal State After Reopen

- [ ] Reopened deal shows as "open" status
- [ ] Pipeline dropdown is functional and editable
- [ ] Stage dropdown is functional and editable
- [ ] Stage dropdown shows stages for current pipeline
- [ ] Can successfully change pipeline
- [ ] Stage dropdown updates when pipeline changes
- [ ] Can successfully change stage
- [ ] Can successfully mark reopened deal as Won
- [ ] Can successfully mark reopened deal as Lost

### 11.6 Dropdown Behavior

- [ ] Before reopen: Deal in Won/Lost section of dropdown
- [ ] After reopen: Deal appears at TOP of Open section
- [ ] Deal remains selected after reopen
- [ ] Other deals maintain their relative order
- [ ] Scroll position reasonable (deal visible)

### 11.7 Edge Cases

- [ ] Reopen deal, then reload extension → Deal remains open
- [ ] Reopen deal, then reload WhatsApp → Deal remains open
- [ ] Switch to different deal during Reopen confirmation → State resets correctly
- [ ] Have 2 browser windows open, reopen deal in one → Other window shows stale data until refresh (expected)
- [ ] Network timeout during API call → Error shown after timeout
- [ ] Session expires during operation → Redirected to sign-in

### 11.8 Accessibility Testing

- [ ] Tab to Reopen button using keyboard only
- [ ] Press Enter on Reopen button → Confirmation appears
- [ ] Tab to Confirm button in confirmation UI
- [ ] Press Enter on Confirm → Deal reopens
- [ ] Press Escape in confirmation UI → Cancels operation
- [ ] Screen reader announces "Reopen deal" button correctly
- [ ] Screen reader announces "Reopen this deal?" message
- [ ] Screen reader announces error messages
- [ ] Screen reader announces success toast
- [ ] Focus indicator visible on all interactive elements

### 11.9 Cross-Browser Testing

- [ ] Chrome (latest) - All flows work
- [ ] Chrome (1 version back) - All flows work
- [ ] Edge (latest) - All flows work
- [ ] Brave (latest) - All flows work

### 11.10 Performance Testing

- [ ] Reopen deal completes in < 2 seconds (normal network)
- [ ] UI remains responsive during API call
- [ ] No visual flicker or layout shifts
- [ ] Smooth transitions between states
- [ ] Dropdown reordering is instant and smooth

---

## 12. Acceptance Criteria

### 12.1 Feature 38: Reopen Deal

- [ ] "Reopen" button visible only for won/lost deals
- [ ] Button positioned below deal info, above "Open in Pipedrive" link
- [ ] Button styled with brand primary color (blue)
- [ ] Clicking button shows confirmation: "Reopen this deal?"
- [ ] Confirmation includes Confirm and Cancel buttons
- [ ] Clicking Confirm calls API to reopen deal (status = "open")
- [ ] Loading state shows spinner and "Saving..." on Confirm button
- [ ] Both buttons disabled during API call
- [ ] Success: Deal card updates to show "open" status
- [ ] Success: Pipeline/Stage change from read-only to editable dropdowns
- [ ] Success: Lost reason no longer displayed (if was lost deal)
- [ ] Success: Reopen button hidden
- [ ] Success: Won/Lost buttons now visible
- [ ] Success: Success toast displayed: "Deal reopened"
- [ ] Success: Deal moves to TOP of dropdown list
- [ ] Success: Deal remains selected in dropdown
- [ ] Success: Dropdown icon changes to 🔄 (open)
- [ ] Error: Error banner shown above confirmation
- [ ] Error: Banner is dismissible
- [ ] Error: Confirm/Cancel buttons remain for retry
- [ ] Cancel: Returns to normal state, deal remains won/lost
- [ ] Stage/pipeline immediately editable after reopen
- [ ] Can successfully change stage/pipeline after reopen
- [ ] Can successfully mark reopened deal as won/lost again

### 12.2 Backend API

- [ ] Endpoint `PUT /api/pipedrive/deals/{dealId}/status` accepts "open" status
- [ ] Validates status is "won", "lost", or "open"
- [ ] Returns 400 for invalid status values
- [ ] Returns 401 for invalid/expired session
- [ ] Returns 404 for non-existent deal
- [ ] Calls Pipedrive API: PUT /v1/deals/{id} with status = "open"
- [ ] Enriches response with stage/pipeline metadata
- [ ] Returns transformed Deal object with status = "open"
- [ ] Logs request and response via HttpRequestLogger
- [ ] Pipedrive handles lost_reason field clearing (backend doesn't explicitly clear it)

### 12.3 Error Handling

- [ ] Network errors show error banner with retry capability
- [ ] Authentication errors redirect to sign-in
- [ ] Validation errors show clear error messages
- [ ] All errors logged to Sentry with context (dealId, status)
- [ ] User can dismiss errors and retry
- [ ] Error states don't break UI

### 12.4 UI/UX

- [ ] Reopen button uses established UI design patterns
- [ ] Confirmation UI matches Won/Lost confirmation styling
- [ ] Error banners match existing error banner styling
- [ ] Loading states match existing loading patterns
- [ ] Success toasts match existing toast styling
- [ ] All text is clear, concise, and user-friendly
- [ ] Focus management works correctly
- [ ] Keyboard navigation works correctly
- [ ] Screen readers announce all states correctly
- [ ] Deal reordering in dropdown is smooth and immediate

### 12.5 Performance

- [ ] API calls complete in < 2 seconds on normal network
- [ ] UI remains responsive during operations
- [ ] No memory leaks from event handlers
- [ ] Component re-renders are minimized
- [ ] Dropdown reordering is instant (no lag)

---

## 13. Deployment Plan

### 13.1 Backend Deployment

1. **Merge backend changes:**
   - Updated `MarkDealWonLostFunction.cs` (validation changes)
   - No new files or models needed

2. **Run backend tests:**
   ```bash
   cd Backend/WhatsApp2Pipe.Api.Tests
   dotnet test
   ```

3. **Deploy to Azure Functions:**
   ```bash
   cd Backend/WhatsApp2Pipe.Api
   func azure functionapp publish chat2deal-api-prod
   ```

4. **Verify deployment:**
   - Test endpoint manually via Postman with `status: "open"`
   - Check Application Insights for logs
   - Verify no errors in function logs

### 13.2 Extension Deployment

1. **Merge extension changes:**
   - Updated `DealDetails.tsx` (add Reopen button and confirmation UI)
   - Updated `DealsSection.tsx` (handle deal reordering after reopen)
   - Updated `usePipedrive.ts` hook (add `reopenDeal` method)
   - Updated message type definitions (add "open" to status union)
   - Updated CSS styles (add Reopen button styles)

2. **Run extension tests:**
   ```bash
   cd Extension
   npm test
   npm run type-check
   npm run lint
   ```

3. **Build production extension:**
   ```bash
   npm run build
   ```

4. **Manual testing:**
   - Load unpacked extension from `dist/`
   - Run through manual testing checklist (Section 11)
   - Verify all acceptance criteria (Section 12)

5. **Upload to Chrome Web Store:**
   - Package extension as .zip
   - Update version number in manifest.json
   - Upload via Chrome Web Store Developer Dashboard
   - Update release notes to mention Feature 38 (Reopen Deal)

6. **Monitor deployment:**
   - Watch Sentry for any errors
   - Monitor Application Insights for API usage
   - Check user feedback/reviews

### 13.3 Rollback Plan

**If critical issues found:**

1. **Extension rollback:**
   - Revert to previous version in Chrome Web Store
   - Users auto-update to last stable version

2. **Backend rollback:**
   - Redeploy previous Azure Function version
   - Check Application Insights to verify rollback

3. **Post-rollback:**
   - Investigate issue in development environment
   - Fix issue
   - Re-test thoroughly
   - Redeploy with fix

---

## 14. Future Enhancements (Out of Scope)

### 14.1 Potential Improvements

**Reopen with Custom Stage:**
- Allow user to select which stage to reopen deal into
- Show stage dropdown in reopen confirmation UI
- Useful for complex pipeline workflows

**Reopen Reason/Notes:**
- Add optional "Why are you reopening this deal?" field
- Capture business context for analytics
- Helps track deal lifecycle patterns

**Bulk Reopen:**
- Select multiple won/lost deals
- Reopen all at once
- Useful for cleaning up old pipeline

**Undo Reopen:**
- "Undo" button in success toast
- Revert deal to previous won/lost status within 5 seconds
- Better error recovery

**Reopen Notifications:**
- Notify deal owner when someone else reopens their deal
- Team collaboration feature
- Requires webhook or polling

**Historical Status Tracking:**
- Show deal status history in UI
- "This deal was marked lost on Jan 15, reopened on Jan 22"
- Better context for sales managers

### 14.2 Related Features (Separate Specs)

- **Feature 39: Save Messages to Deal Notes** (Spec-138)
- Future deal management enhancements per BRD-002 Phase 2+

---

## 15. Open Questions

### 15.1 Resolved Questions

✅ **Q: Should reopen require confirmation or be one-click?**
**A:** Confirmation required (matches Won/Lost pattern, prevents accidents)

✅ **Q: Where should Reopen button be positioned?**
**A:** Below deal info, above "Open in Pipedrive" link

✅ **Q: What happens to stage when deal is reopened?**
**A:** Trust Pipedrive API to handle stage (keeps current stage)

✅ **Q: What should confirmation message say?**
**A:** "Reopen this deal?" (simple and consistent)

✅ **Q: What should success toast say?**
**A:** "Deal reopened" (simple confirmation)

✅ **Q: What happens to lost reason after reopen?**
**A:** Pipedrive handles it, UI doesn't display for open deals

✅ **Q: Should pipeline/stage be immediately editable after reopen?**
**A:** Yes, immediately editable (seamless experience)

✅ **Q: What happens to deal position in dropdown after reopen?**
**A:** Deal jumps to TOP of dropdown list (most recently updated)

✅ **Q: Which API endpoint to use?**
**A:** Extend existing `/status` endpoint to accept "open"

✅ **Q: Loading state during reopen?**
**A:** Just Confirm/Cancel buttons (matches Won/Lost pattern)

✅ **Q: Should backend validate deal is won/lost before reopening?**
**A:** No, let Pipedrive handle validation (simpler, more resilient)

### 15.2 Remaining Questions

**Q: Should we track reopen metrics in backend database?**
- Pro: Analytics on deal lifecycle patterns
- Con: Duplicate data, potential sync issues
- **Decision:** Defer to future. Use Pipedrive as source of truth for now.

**Q: Should we show reopen count in UI?**
- Example: "This deal has been reopened 2 times"
- Pro: Context for sales managers
- Con: Requires additional API calls or backend storage
- **Decision:** Defer to future enhancement.

---

## 16. Related Documentation

### 16.1 BRDs
- [BRD-002: Deals Management](../BRDs/BRD-002-Deals-Management.md) - Parent BRD for this spec

### 16.2 Specs
- [Spec-131a: Backend Deals API](./Spec-131a-Backend-Deals-API.md) - Deal fetching and enrichment
- [Spec-131b: Extension Deals Display](./Spec-131b-Extension-Deals-Display.md) - DealDetails component foundation
- [Spec-135: Change Deal Stage Flow](./Spec-135-Change-Deal-Stage-Flow.md) - UI state management patterns
- [Spec-136: Mark Deal Won/Lost Flow](./Spec-136-Mark-Deal-Won-Lost-Flow.md) - Status change patterns (DIRECT DEPENDENCY)

### 16.3 Architecture
- [Chrome Extension Architecture](../Architecture/Chrome-Extension-Architecture.md) - Overall architecture
- [UI Design Specification](../Architecture/UI-Design-Specification.md) - UI design system

### 16.4 External APIs
- Pipedrive API: `PUT /v1/deals/{id}` - Update deal endpoint
- Pipedrive API Documentation: Updating Deals (see Playground/pipedrive-dev-docs/docs/updating-a-deal.md)

---

**END OF SPEC-137**
