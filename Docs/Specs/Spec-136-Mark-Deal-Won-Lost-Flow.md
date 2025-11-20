# Spec-136: Mark Deal as Won/Lost Flow

**Date:** 2025-01-20
**Status:** Draft
**Related BRD:** [BRD-002: Deals Management](../BRDs/BRD-002-Deals-Management.md) (Features 36 & 37)
**Dependencies:**
- [Spec-131b: Extension Deals Display](./Spec-131b-Extension-Deals-Display.md) (DealDetails component)
- [Spec-135: Change Deal Stage Flow](./Spec-135-Change-Deal-Stage-Flow.md) (UI patterns)

---

## 1. Overview

This specification defines the implementation for marking deals as Won or Lost directly from the WhatsApp Web extension sidebar. Users can close deals with a simple confirmation flow for wins, and provide a required lost reason when marking deals as lost.

### 1.1 Scope

**In Scope:**
- Mark open deals as Won with simple confirmation
- Mark open deals as Lost with required lost reason input
- Inline UI patterns for both flows
- API integration with Pipedrive to update deal status
- Error handling and loading states
- Success notifications and card state updates

**Out of Scope:**
- Reopen Deal functionality (Feature 38 - separate spec)
- Deal deletion
- Win notes or additional win metadata
- Lost reason predefined lists or dropdowns
- Deal timeline/history display

### 1.2 User Stories

**As a sales rep**, I want to mark deals as won with a quick confirmation so that I can celebrate victories without leaving WhatsApp.

**As a sales rep**, I want to mark deals as lost with a reason so that I can track why opportunities didn't convert and maintain data quality.

**As a sales manager**, I want lost reasons captured so that I can analyze pipeline health and improve conversion rates.

---

## 2. Technical Architecture

### 2.1 Component Structure

```
DealDetails.tsx (existing component - enhanced)
├── Deal information display (existing)
├── Pipeline/Stage dropdowns (existing)
├── "Open in Pipedrive" link (existing)
└── Deal Close Actions Section (NEW)
    ├── WonLostButtons (NEW - for open deals)
    │   ├── Won button
    │   └── Lost button
    ├── WonConfirmation (NEW - when Won clicked)
    │   ├── Confirmation message
    │   └── Confirm/Cancel buttons
    └── LostReasonForm (NEW - when Lost clicked)
        ├── Lost reason input field
        ├── Character counter
        └── Confirm/Cancel buttons
```

### 2.2 State Management

**New state variables in DealDetails component:**

```typescript
// UI state for Won/Lost flows
const [isConfirmingWon, setIsConfirmingWon] = useState(false)
const [isEnteringLostReason, setIsEnteringLostReason] = useState(false)
const [lostReason, setLostReason] = useState('')

// Loading states
const [isMarkingWon, setIsMarkingWon] = useState(false)
const [isMarkingLost, setIsMarkingLost] = useState(false)

// Error states
const [wonError, setWonError] = useState<string | null>(null)
const [lostError, setLostError] = useState<string | null>(null)
```

### 2.3 Data Flow

```
User Action → Component State Update → API Call → Response Handling → UI Update

Example: Mark as Won Flow
1. User clicks "Won ✓" button
   → setIsConfirmingWon(true)
2. User clicks "Confirm"
   → setIsMarkingWon(true)
   → markDealAsWon() API call
3. API success
   → onDealUpdated(updatedDeal) callback
   → setIsConfirmingWon(false)
   → showToast('Deal marked as won')
4. API error
   → setWonError(errorMessage)
   → setIsMarkingWon(false)
   → Error banner shown
```

---

## 3. API Specification

### 3.1 Backend Endpoint: Mark Deal as Won/Lost

**New Endpoint:** `PUT /api/pipedrive/deals/{dealId}/status`

**Request Headers:**
```
Authorization: Bearer {verification_code}
Content-Type: application/json
```

**Request Body:**

```typescript
// Mark as Won
{
  "status": "won"
}

// Mark as Lost
{
  "status": "lost",
  "lostReason": "Customer chose competitor product"
}
```

**Request Validation:**
- `status` (required): Must be "won" or "lost"
- `lostReason` (required if status = "lost"): Non-empty string, 1-150 characters

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
    "status": "won",
    "updateTime": "2025-01-20T14:30:00Z"
  }
}
```

**Response (200 OK - Lost):**

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
    "status": "lost",
    "lostReason": "Customer chose competitor product",
    "updateTime": "2025-01-20T14:30:00Z"
  }
}
```

**Error Responses:**

```json
// 400 Bad Request - Missing lost reason
{
  "error": "Lost reason is required when marking deal as lost"
}

// 400 Bad Request - Lost reason too long
{
  "error": "Lost reason must be 150 characters or less"
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

### 3.2 Backend Implementation

**New Function:** `MarkDealWonLostFunction.cs`

**File Location:** `/Backend/WhatsApp2Pipe.Api/Functions/MarkDealWonLostFunction.cs`

**Implementation Steps:**

1. **Extract and validate Authorization header**
   - Check Bearer token presence
   - Extract verification_code

2. **Validate session**
   - Call `sessionService.GetSessionAsync(verificationCode)`
   - Check session exists and not expired

3. **Parse and validate request body**
   - Deserialize JSON to `MarkDealWonLostRequest`
   - Validate `status` is "won" or "lost"
   - If status = "lost", validate `lostReason` is present and 1-150 chars

4. **Call Pipedrive API**
   - Use `pipedriveApiClient.MarkDealWonLostAsync(session, dealId, status, lostReason)`
   - Pipedrive endpoint: `PUT /v1/deals/{dealId}`
   - Body: `{ "status": "won" }` or `{ "status": "lost", "lost_reason": "..." }`

5. **Fetch enrichment data**
   - Get stages via `pipedriveApiClient.GetStagesAsync(session)`
   - Get pipelines via `pipedriveApiClient.GetPipelinesAsync(session)`

6. **Transform deal response**
   - Use `DealTransformService.TransformDeal(deal, stages, pipelines)`
   - Enrich with stage/pipeline metadata
   - Format currency values

7. **Return response**
   - 200 OK with transformed deal object
   - Log response via `httpRequestLogger.LogResponse()`

8. **Error handling**
   - 400 for validation errors
   - 401 for invalid session
   - 404 if deal not found
   - 500 for Pipedrive API errors

**New Models:**

**File Location:** `/Backend/WhatsApp2Pipe.Api/Models/PipedriveModels.cs`

```csharp
/// <summary>
/// Request to mark deal as won or lost (from extension to backend)
/// </summary>
public class MarkDealWonLostRequest
{
    [JsonPropertyName("status")]
    public string Status { get; set; } = string.Empty; // "won" or "lost"

    [JsonPropertyName("lostReason")]
    public string? LostReason { get; set; }
}
```

**Update PipedriveDeal model:**

```csharp
public class PipedriveDeal
{
    // Existing properties...

    [JsonPropertyName("lost_reason")]
    public string? LostReason { get; set; }
}
```

**Update Deal model (returned to extension):**

```csharp
public class Deal
{
    // Existing properties...

    [JsonPropertyName("lostReason")]
    public string? LostReason { get; set; }
}
```

### 3.3 Service Worker Integration

**File Location:** `/Extension/src/service-worker/index.ts`

**New Message Handler:**

```typescript
async function handlePipedriveMarkDealWonLost(
  message: PipedriveMarkDealWonLostMessage
): Promise<PipedriveMarkDealWonLostSuccessMessage | PipedriveErrorMessage> {
  try {
    const { verificationCode } = await chrome.storage.local.get('verification_code')

    if (!verificationCode) {
      return {
        type: 'PIPEDRIVE_ERROR',
        error: 'Not authenticated'
      }
    }

    const response = await fetch(
      `${BACKEND_URL}/api/pipedrive/deals/${message.dealId}/status`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${verificationCode}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: message.status,
          lostReason: message.lostReason
        })
      }
    )

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to update deal status')
    }

    const data = await response.json()

    return {
      type: 'PIPEDRIVE_MARK_DEAL_WON_LOST_SUCCESS',
      deal: data.data
    }
  } catch (error) {
    logError('Failed to mark deal won/lost', error)
    return {
      type: 'PIPEDRIVE_ERROR',
      error: error instanceof Error ? error.message : 'Failed to update deal status'
    }
  }
}
```

**Register Handler:**

```typescript
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Existing handlers...

  if (message.type === 'PIPEDRIVE_MARK_DEAL_WON_LOST') {
    handlePipedriveMarkDealWonLost(message).then(sendResponse)
    return true
  }

  // ...
})
```

### 3.4 Message Type Definitions

**File Location:** `/Extension/src/types/messages.ts`

```typescript
// Request message
export interface PipedriveMarkDealWonLostMessage {
  type: 'PIPEDRIVE_MARK_DEAL_WON_LOST'
  dealId: number
  status: 'won' | 'lost'
  lostReason?: string
}

// Success response
export interface PipedriveMarkDealWonLostSuccessMessage {
  type: 'PIPEDRIVE_MARK_DEAL_WON_LOST_SUCCESS'
  deal: Deal
}

// Error response (existing type reused)
export interface PipedriveErrorMessage {
  type: 'PIPEDRIVE_ERROR'
  error: string
}
```

### 3.5 Custom Hook Integration

**File Location:** `/Extension/src/content-script/hooks/usePipedrive.ts`

**New Hook Method:**

```typescript
export function usePipedrive() {
  // Existing methods...

  const markDealWonLost = async (
    dealId: number,
    status: 'won' | 'lost',
    lostReason?: string
  ): Promise<Deal> => {
    const response = await chrome.runtime.sendMessage({
      type: 'PIPEDRIVE_MARK_DEAL_WON_LOST',
      dealId,
      status,
      lostReason
    })

    if (response.type === 'PIPEDRIVE_ERROR') {
      throw new Error(response.error)
    }

    return response.deal
  }

  return {
    // Existing methods...
    markDealWonLost
  }
}
```

---

## 4. UI Design Specification

### 4.1 Component Layout

**DealDetails Component Enhancement:**

```tsx
// Existing deal details content...

{/* NEW: Deal Close Actions Section */}
{deal.status === 'open' && !isConfirmingWon && !isEnteringLostReason && (
  <div className="deal-close-actions">
    <button
      onClick={handleWonClick}
      className="btn-won"
      disabled={isEditingStage}
    >
      <span className="icon">✓</span> Won
    </button>
    <button
      onClick={handleLostClick}
      className="btn-lost"
      disabled={isEditingStage}
    >
      <span className="icon">✗</span> Lost
    </button>
  </div>
)}

{/* Won Confirmation UI */}
{isConfirmingWon && (
  <div className="won-confirmation">
    {wonError && (
      <div className="error-banner">
        <span>{wonError}</span>
        <button onClick={() => setWonError(null)}>×</button>
      </div>
    )}
    <p className="confirmation-message">Mark this deal as won?</p>
    <div className="action-buttons">
      <button
        onClick={handleConfirmWon}
        disabled={isMarkingWon}
        className="btn-confirm"
      >
        {isMarkingWon ? (
          <>
            <span className="spinner" /> Saving...
          </>
        ) : (
          'Confirm'
        )}
      </button>
      <button
        onClick={handleCancelWon}
        disabled={isMarkingWon}
        className="btn-cancel"
      >
        Cancel
      </button>
    </div>
  </div>
)}

{/* Lost Reason Form */}
{isEnteringLostReason && (
  <div className="lost-reason-form">
    {lostError && (
      <div className="error-banner">
        <span>{lostError}</span>
        <button onClick={() => setLostError(null)}>×</button>
      </div>
    )}
    <div className="form-field">
      <label htmlFor="lost-reason">Why was this deal lost?</label>
      <input
        type="text"
        id="lost-reason"
        value={lostReason}
        onChange={handleLostReasonChange}
        placeholder="Why was this deal lost?"
        maxLength={150}
        disabled={isMarkingLost}
        autoFocus
      />
      <div className="character-counter">
        {lostReason.length}/150
      </div>
    </div>
    <div className="action-buttons">
      <button
        onClick={handleConfirmLost}
        disabled={isMarkingLost || lostReason.trim().length === 0}
        className="btn-confirm"
      >
        {isMarkingLost ? (
          <>
            <span className="spinner" /> Saving...
          </>
        ) : (
          'Confirm'
        )}
      </button>
      <button
        onClick={handleCancelLost}
        disabled={isMarkingLost}
        className="btn-cancel"
      >
        Cancel
      </button>
    </div>
  </div>
)}
```

### 4.2 Event Handlers

```typescript
const handleWonClick = () => {
  setIsConfirmingWon(true)
  setWonError(null)
}

const handleCancelWon = () => {
  setIsConfirmingWon(false)
  setWonError(null)
}

const handleConfirmWon = async () => {
  setIsMarkingWon(true)
  setWonError(null)

  try {
    const updatedDeal = await markDealWonLost(deal.id, 'won')
    onDealUpdated(updatedDeal)
    setIsConfirmingWon(false)
    showToast('Deal marked as won', 'success')
  } catch (error) {
    const errorMessage = error instanceof Error
      ? error.message
      : 'Failed to mark deal as won'
    setWonError(errorMessage)
    logError('Failed to mark deal as won', error, { dealId: deal.id })
  } finally {
    setIsMarkingWon(false)
  }
}

const handleLostClick = () => {
  setIsEnteringLostReason(true)
  setLostReason('')
  setLostError(null)
}

const handleCancelLost = () => {
  setIsEnteringLostReason(false)
  setLostReason('')
  setLostError(null)
}

const handleLostReasonChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setLostReason(e.target.value)
}

const handleConfirmLost = async () => {
  const trimmedReason = lostReason.trim()

  if (trimmedReason.length === 0) {
    setLostError('Lost reason is required')
    return
  }

  setIsMarkingLost(true)
  setLostError(null)

  try {
    const updatedDeal = await markDealWonLost(deal.id, 'lost', trimmedReason)
    onDealUpdated(updatedDeal)
    setIsEnteringLostReason(false)
    setLostReason('')
    showToast('Deal marked as lost', 'success')
  } catch (error) {
    const errorMessage = error instanceof Error
      ? error.message
      : 'Failed to mark deal as lost'
    setLostError(errorMessage)
    logError('Failed to mark deal as lost', error, {
      dealId: deal.id,
      lostReason: trimmedReason
    })
  } finally {
    setIsMarkingLost(false)
  }
}
```

### 4.3 CSS Styling

**File Location:** `/Extension/src/styles/content-script.css`

```css
/* Deal Close Actions Section */
.deal-close-actions {
  display: flex;
  gap: 8px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}

.btn-won,
.btn-lost {
  flex: 1;
  padding: 8px 16px;
  border: 1px solid;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.btn-won {
  background: #10b981;
  color: white;
  border-color: #059669;
}

.btn-won:hover:not(:disabled) {
  background: #059669;
}

.btn-lost {
  background: #ef4444;
  color: white;
  border-color: #dc2626;
}

.btn-lost:hover:not(:disabled) {
  background: #dc2626;
}

.btn-won:disabled,
.btn-lost:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Won Confirmation */
.won-confirmation {
  margin-top: 16px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.confirmation-message {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #374151;
}

/* Lost Reason Form */
.lost-reason-form {
  margin-top: 16px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.form-field {
  margin-bottom: 12px;
}

.form-field label {
  display: block;
  margin-bottom: 6px;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
}

.form-field input[type="text"] {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  transition: border-color 0.2s;
}

.form-field input[type="text"]:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.form-field input[type="text"]:disabled {
  background: #f3f4f6;
  cursor: not-allowed;
}

.character-counter {
  margin-top: 4px;
  font-size: 12px;
  color: #6b7280;
  text-align: right;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 8px;
}

.btn-confirm,
.btn-cancel {
  flex: 1;
  padding: 8px 16px;
  border: 1px solid;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.btn-confirm {
  background: #2563eb;
  color: white;
  border-color: #1d4ed8;
}

.btn-confirm:hover:not(:disabled) {
  background: #1d4ed8;
}

.btn-confirm:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-cancel {
  background: white;
  color: #374151;
  border-color: #d1d5db;
}

.btn-cancel:hover:not(:disabled) {
  background: #f9fafb;
}

.btn-cancel:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Error Banner */
.error-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  margin-bottom: 12px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  color: #dc2626;
  font-size: 13px;
}

.error-banner button {
  background: none;
  border: none;
  color: #dc2626;
  font-size: 18px;
  cursor: pointer;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.error-banner button:hover {
  opacity: 0.7;
}

/* Spinner */
.spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

---

## 5. UI States & Flows

### 5.1 Initial State (Open Deal)

**Conditions:**
- Deal status is "open"
- No confirmation/form UI active
- Not currently editing stage

**UI Display:**
- Deal information shown (title, value, pipeline, stage)
- Pipeline/stage dropdowns visible
- "Open in Pipedrive" link visible
- **Won ✓** and **Lost ✗** buttons visible at bottom
- Both buttons enabled

**Visual:**
```
┌─────────────────────────────────────┐
│ Deal Title: Website Redesign        │
│ Value: $50,000.00                   │
│ Pipeline: Sales Pipeline            │
│ Stage: Negotiation                  │
│                                     │
│ [Open in Pipedrive →]               │
│                                     │
│ ─────────────────────────────────── │
│ [  Won ✓  ] [  Lost ✗  ]           │
└─────────────────────────────────────┘
```

### 5.2 Won Confirmation State

**Trigger:** User clicks "Won ✓" button

**State Changes:**
- `isConfirmingWon = true`
- Won/Lost buttons hidden
- Confirmation UI displayed

**UI Display:**
- Deal information remains visible above
- Confirmation message: "Mark this deal as won?"
- Confirm and Cancel buttons shown

**Visual:**
```
┌─────────────────────────────────────┐
│ Deal Title: Website Redesign        │
│ Value: $50,000.00                   │
│ Pipeline: Sales Pipeline            │
│ Stage: Negotiation                  │
│                                     │
│ [Open in Pipedrive →]               │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Mark this deal as won?          │ │
│ │                                 │ │
│ │ [ Confirm ] [ Cancel ]          │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### 5.3 Won Loading State

**Trigger:** User clicks "Confirm" button

**State Changes:**
- `isMarkingWon = true`
- Confirm button shows spinner and "Saving..."
- Both buttons disabled

**Visual:**
```
┌─────────────────────────────────────┐
│ Deal Title: Website Redesign        │
│ Value: $50,000.00                   │
│ Pipeline: Sales Pipeline            │
│ Stage: Negotiation                  │
│                                     │
│ [Open in Pipedrive →]               │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Mark this deal as won?          │ │
│ │                                 │ │
│ │ [⟳ Saving...] [ Cancel ]        │ │
│ │  (disabled)    (disabled)       │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### 5.4 Won Success State

**Trigger:** API returns success

**State Changes:**
- `isConfirmingWon = false`
- `isMarkingWon = false`
- Deal object updated with `status: 'won'`
- Success toast displayed

**UI Display:**
- Confirmation UI disappears
- Deal card updates to show Won status
- Won/Lost buttons no longer displayed (deal is closed)
- Toast notification: "Deal marked as won"

**Visual:**
```
┌─────────────────────────────────────┐
│ Deal Title: Website Redesign        │
│ Value: $50,000.00                   │
│ Status: Won ✓                       │
│ Pipeline: Sales Pipeline            │
│ Stage: Negotiation                  │
│                                     │
│ [Open in Pipedrive →]               │
│                                     │
│ (No Won/Lost buttons - deal closed)│
└─────────────────────────────────────┘

  [Toast: Deal marked as won ✓]
```

### 5.5 Won Error State

**Trigger:** API returns error

**State Changes:**
- `isMarkingWon = false`
- `wonError = error message`
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
│ Pipeline: Sales Pipeline            │
│ Stage: Negotiation                  │
│                                     │
│ [Open in Pipedrive →]               │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ ┌───────────────────────────┐   │ │
│ │ │ ⚠ Failed to mark deal     │ × │ │
│ │ │   as won. Try again.      │   │ │
│ │ └───────────────────────────┘   │ │
│ │                                 │ │
│ │ Mark this deal as won?          │ │
│ │                                 │ │
│ │ [ Confirm ] [ Cancel ]          │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### 5.6 Lost Reason Entry State

**Trigger:** User clicks "Lost ✗" button

**State Changes:**
- `isEnteringLostReason = true`
- `lostReason = ''`
- Won/Lost buttons hidden
- Lost reason form displayed

**UI Display:**
- Lost reason form with label and input field
- Character counter: "0/150"
- Confirm button disabled (reason required)
- Cancel button enabled

**Visual:**
```
┌─────────────────────────────────────┐
│ Deal Title: Website Redesign        │
│ Value: $50,000.00                   │
│ Pipeline: Sales Pipeline            │
│ Stage: Negotiation                  │
│                                     │
│ [Open in Pipedrive →]               │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Why was this deal lost?         │ │
│ │ ┌─────────────────────────────┐ │ │
│ │ │ [cursor here]               │ │ │
│ │ └─────────────────────────────┘ │ │
│ │                           0/150 │ │
│ │                                 │ │
│ │ [ Confirm ] [ Cancel ]          │ │
│ │ (disabled)                      │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### 5.7 Lost Reason Entered State

**Trigger:** User types in lost reason input

**State Changes:**
- `lostReason` updated with input value
- Character counter updates
- Confirm button enabled when reason length > 0

**Visual:**
```
┌─────────────────────────────────────┐
│ Deal Title: Website Redesign        │
│ Value: $50,000.00                   │
│ Pipeline: Sales Pipeline            │
│ Stage: Negotiation                  │
│                                     │
│ [Open in Pipedrive →]               │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Why was this deal lost?         │ │
│ │ ┌─────────────────────────────┐ │ │
│ │ │ Customer chose competitor   │ │ │
│ │ └─────────────────────────────┘ │ │
│ │                          25/150 │ │
│ │                                 │ │
│ │ [ Confirm ] [ Cancel ]          │ │
│ │ (enabled)                       │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### 5.8 Lost Loading State

**Trigger:** User clicks "Confirm" button

**State Changes:**
- `isMarkingLost = true`
- Confirm button shows spinner and "Saving..."
- Both buttons disabled
- Input field disabled

**Visual:**
```
┌─────────────────────────────────────┐
│ Deal Title: Website Redesign        │
│ Value: $50,000.00                   │
│ Pipeline: Sales Pipeline            │
│ Stage: Negotiation                  │
│                                     │
│ [Open in Pipedrive →]               │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Why was this deal lost?         │ │
│ │ ┌─────────────────────────────┐ │ │
│ │ │ Customer chose competitor   │ │ │
│ │ │         (disabled)          │ │ │
│ │ └─────────────────────────────┘ │ │
│ │                          25/150 │ │
│ │                                 │ │
│ │ [⟳ Saving...] [ Cancel ]        │ │
│ │  (disabled)    (disabled)       │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### 5.9 Lost Success State

**Trigger:** API returns success

**State Changes:**
- `isEnteringLostReason = false`
- `isMarkingLost = false`
- `lostReason = ''`
- Deal object updated with `status: 'lost'` and `lostReason`
- Success toast displayed

**UI Display:**
- Lost reason form disappears
- Deal card updates to show Lost status
- Lost reason displayed in deal card
- Won/Lost buttons no longer displayed
- Toast notification: "Deal marked as lost"

**Visual:**
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
│ [Open in Pipedrive →]               │
│                                     │
│ (No Won/Lost buttons - deal closed)│
└─────────────────────────────────────┘

  [Toast: Deal marked as lost ✓]
```

### 5.10 Lost Error State

**Trigger:** API returns error

**State Changes:**
- `isMarkingLost = false`
- `lostError = error message`
- Error banner displayed

**UI Display:**
- Error banner appears above form
- Lost reason form remains visible
- Input field enabled
- Confirm/Cancel buttons enabled for retry

**Visual:**
```
┌─────────────────────────────────────┐
│ Deal Title: Website Redesign        │
│ Value: $50,000.00                   │
│ Pipeline: Sales Pipeline            │
│ Stage: Negotiation                  │
│                                     │
│ [Open in Pipedrive →]               │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ ┌───────────────────────────┐   │ │
│ │ │ ⚠ Failed to mark deal     │ × │ │
│ │ │   as lost. Try again.     │   │ │
│ │ └───────────────────────────┘   │ │
│ │                                 │ │
│ │ Why was this deal lost?         │ │
│ │ ┌─────────────────────────────┐ │ │
│ │ │ Customer chose competitor   │ │ │
│ │ └─────────────────────────────┘ │ │
│ │                          25/150 │ │
│ │                                 │ │
│ │ [ Confirm ] [ Cancel ]          │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### 5.11 Won/Lost Deals State

**Conditions:**
- Deal status is "won" or "lost"

**UI Display:**
- Deal information shown with status indicator
- Pipeline/stage shown as read-only text (not editable)
- Lost reason displayed (if deal is lost)
- "Open in Pipedrive" link visible
- No Won/Lost buttons (deal is closed)
- Reopen button will appear here when Feature 38 is implemented

**Visual (Won):**
```
┌─────────────────────────────────────┐
│ Deal Title: Website Redesign        │
│ Value: $50,000.00                   │
│ Status: Won ✓                       │
│ Pipeline: Sales Pipeline            │
│ Stage: Negotiation                  │
│                                     │
│ [Open in Pipedrive →]               │
│                                     │
│ (Future: Reopen button here)        │
└─────────────────────────────────────┘
```

**Visual (Lost):**
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
│ [Open in Pipedrive →]               │
│                                     │
│ (Future: Reopen button here)        │
└─────────────────────────────────────┘
```

---

## 6. Edge Cases & Error Handling

### 6.1 Validation Errors

**Empty Lost Reason:**
- **Trigger:** User submits lost form with empty or whitespace-only reason
- **Handling:**
  - Confirm button disabled when `lostReason.trim().length === 0`
  - Client-side validation prevents submission
  - If somehow submitted, backend returns 400 error
  - Error displayed: "Lost reason is required"

**Lost Reason Too Long:**
- **Trigger:** User exceeds 150 character limit
- **Handling:**
  - Input field has `maxLength={150}` attribute (prevents typing beyond limit)
  - Character counter shows "150/150" when limit reached
  - Backend validates and returns 400 if limit somehow exceeded
  - Error displayed: "Lost reason must be 150 characters or less"

### 6.2 Network Errors

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
  - Error banner: "Failed to update deal status. Please try again."
  - Error logged to Sentry with context
  - Confirm/Cancel buttons enabled for retry

### 6.3 Authentication Errors

**Invalid/Expired Session (401):**
- **Trigger:** Verification code expired or invalid
- **Handling:**
  - Error banner: "Session expired. Please sign in again."
  - User redirected to sign-in flow (existing pattern)
  - Deal state preserved if possible

**Missing Authorization:**
- **Trigger:** Verification code not found in storage
- **Handling:**
  - Error banner: "Not authenticated. Please sign in."
  - User redirected to sign-in flow

### 6.4 Deal Not Found Errors

**Deal Deleted in Pipedrive (404):**
- **Trigger:** Deal was deleted by another user
- **Handling:**
  - Error banner: "Deal not found. It may have been deleted."
  - Suggest refreshing deals list
  - Remove deal from local state after user acknowledges

### 6.5 Race Conditions

**Deal Updated by Another User:**
- **Trigger:** Deal status changed externally while user is editing
- **Handling:**
  - Current implementation: Last write wins
  - Future enhancement: Detect conflict and prompt user
  - For now: Show success and update with latest state from server

**Rapid Button Clicks:**
- **Trigger:** User clicks Won/Lost buttons rapidly
- **Handling:**
  - Buttons disabled immediately on first click
  - Second click has no effect (button disabled)
  - Loading state prevents double-submission

### 6.6 Concurrent Operations

**Stage Change While Confirming Won/Lost:**
- **Trigger:** User is in Won/Lost flow, stage dropdown is also being edited
- **Handling:**
  - Won/Lost buttons disabled when `isEditingStage === true`
  - User must complete/cancel stage edit before closing deal
  - Prevents conflicting API calls

**Cancel During API Call:**
- **Trigger:** User clicks Cancel while API request is in flight
- **Handling:**
  - API request continues (cannot abort mid-flight)
  - Cancel button disabled during loading
  - After API completes, state resets normally

### 6.7 Browser/Extension Issues

**Extension Reload During Operation:**
- **Trigger:** User reloads extension while marking deal
- **Handling:**
  - All local state lost
  - API call may or may not complete
  - On reload, fetch fresh deal data from Pipedrive
  - User sees current state (may be marked won/lost if API succeeded)

**WhatsApp Page Refresh:**
- **Trigger:** User refreshes WhatsApp Web
- **Handling:**
  - Extension re-initializes
  - Sidebar re-renders
  - Fresh deal data fetched
  - Any in-progress operations lost

### 6.8 Input Validation

**Special Characters in Lost Reason:**
- **Trigger:** User enters HTML, emojis, or special characters
- **Handling:**
  - All characters allowed (Pipedrive accepts any string)
  - Backend sanitizes before sending to Pipedrive
  - Display as-is in UI (no special rendering)

**Copy-Paste Long Text:**
- **Trigger:** User pastes text longer than 150 characters
- **Handling:**
  - Input field `maxLength={150}` truncates to 150 chars
  - Character counter shows "150/150"
  - No error shown (silent truncation)

---

## 7. Data State Updates

### 7.1 Deal Object Updates

**After Successful Won:**

```typescript
// Before
{
  id: 456,
  title: "Website Redesign",
  value: "$50,000.00",
  stage: { id: 5, name: "Negotiation", order: 5 },
  pipeline: { id: 1, name: "Sales Pipeline" },
  status: "open",
  updateTime: "2025-01-15T10:00:00Z"
}

// After
{
  id: 456,
  title: "Website Redesign",
  value: "$50,000.00",
  stage: { id: 5, name: "Negotiation", order: 5 }, // Stage unchanged
  pipeline: { id: 1, name: "Sales Pipeline" },
  status: "won", // ← Updated
  updateTime: "2025-01-20T14:30:00Z" // ← Updated
}
```

**After Successful Lost:**

```typescript
// Before
{
  id: 456,
  title: "Website Redesign",
  value: "$50,000.00",
  stage: { id: 5, name: "Negotiation", order: 5 },
  pipeline: { id: 1, name: "Sales Pipeline" },
  status: "open",
  updateTime: "2025-01-15T10:00:00Z"
}

// After
{
  id: 456,
  title: "Website Redesign",
  value: "$50,000.00",
  stage: { id: 5, name: "Negotiation", order: 5 }, // Stage unchanged
  pipeline: { id: 1, name: "Sales Pipeline" },
  status: "lost", // ← Updated
  lostReason: "Customer chose competitor", // ← Added
  updateTime: "2025-01-20T14:30:00Z" // ← Updated
}
```

### 7.2 Parent Component Updates

**DealsSection State Update:**

```typescript
// In DealsSection.tsx
const handleDealUpdated = (updatedDeal: Deal) => {
  // Update deals array with new deal data
  const updatedDeals = deals.map(d =>
    d.id === updatedDeal.id ? updatedDeal : d
  )

  // Trigger re-sort (won/lost deals move to respective sections)
  // Deals are already sorted by backend: open → won → lost

  // Notify parent (App.tsx)
  onDealsUpdated(updatedDeals)
}
```

**Deal Dropdown Update:**

```typescript
// Deal remains selected in dropdown
// Dropdown option text may update to show status icon
// Example: "Website Redesign - $50,000.00" becomes
// "✓ Website Redesign - $50,000.00" (won) or
// "✗ Website Redesign - $50,000.00" (lost)
```

### 7.3 Dropdown Sorting After Won/Lost

**Current Sorting (from backend):**
1. Open deals (most recently updated first)
2. Won deals (most recently updated first)
3. Lost deals (most recently updated first)

**After marking deal as won:**
- Deal moves from "Open" section to "Won" section in dropdown
- Appears at top of Won section (most recently updated)
- If dropdown is re-sorted on frontend, this happens automatically

**After marking deal as lost:**
- Deal moves from "Open" section to "Lost" section
- Appears at top of Lost section (most recently updated)

**Note:** Backend currently handles sorting. Frontend displays deals in server-provided order. No client-side re-sort required unless we implement real-time updates.

---

## 8. Accessibility

### 8.1 Keyboard Navigation

**Tab Order:**
1. Won button
2. Lost button
3. (When confirming won) Confirm button → Cancel button
4. (When entering lost reason) Input field → Confirm button → Cancel button

**Keyboard Shortcuts:**
- **Enter key** in lost reason input → Submit form (same as clicking Confirm)
- **Escape key** in any modal state → Cancel operation (same as clicking Cancel)
- **Tab/Shift+Tab** → Navigate between interactive elements

### 8.2 Screen Reader Support

**ARIA Labels:**

```tsx
// Won button
<button
  onClick={handleWonClick}
  className="btn-won"
  aria-label="Mark deal as won"
>
  <span aria-hidden="true">✓</span> Won
</button>

// Lost button
<button
  onClick={handleLostClick}
  className="btn-lost"
  aria-label="Mark deal as lost"
>
  <span aria-hidden="true">✗</span> Lost
</button>

// Lost reason input
<input
  type="text"
  id="lost-reason"
  aria-label="Lost reason"
  aria-required="true"
  aria-describedby="lost-reason-counter"
  value={lostReason}
  onChange={handleLostReasonChange}
/>

<div id="lost-reason-counter" className="character-counter">
  {lostReason.length}/150 characters
</div>
```

**Live Regions:**

```tsx
// Error announcements
<div role="alert" aria-live="assertive">
  {wonError && <p>{wonError}</p>}
  {lostError && <p>{lostError}</p>}
</div>

// Success announcements (via toast)
<div role="status" aria-live="polite">
  {toastMessage}
</div>
```

### 8.3 Focus Management

**Focus After Won Click:**
- Focus moves to "Confirm" button

**Focus After Lost Click:**
- Focus moves to lost reason input field (autofocus)

**Focus After Cancel:**
- Focus returns to original button (Won or Lost)

**Focus After Success:**
- Focus remains on deal card (natural tab order)

**Focus After Error:**
- Focus remains in error state (user can retry)

---

## 9. Performance Considerations

### 9.1 API Call Optimization

**Debouncing:**
- Not applicable (single-click actions, not real-time input)

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

**CSS Transitions:**
- Smooth 200ms transitions on button hover states
- No heavy animations during loading states
- Spinner uses CSS animation (GPU-accelerated)

### 9.3 Bundle Size

**New Code Impact:**
- Estimated +2KB minified JS (event handlers, state management)
- Estimated +1.5KB minified CSS (new button styles, form styles)
- Total impact: ~3.5KB (negligible)

---

## 10. Testing Strategy

### 10.1 Unit Tests

**Component Tests (Vitest + React Testing Library):**

```typescript
describe('DealDetails - Won/Lost Actions', () => {
  it('shows Won and Lost buttons for open deals', () => {
    const deal = createMockDeal({ status: 'open' })
    render(<DealDetails deal={deal} {...mockProps} />)

    expect(screen.getByRole('button', { name: /mark deal as won/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /mark deal as lost/i })).toBeInTheDocument()
  })

  it('does not show Won/Lost buttons for won deals', () => {
    const deal = createMockDeal({ status: 'won' })
    render(<DealDetails deal={deal} {...mockProps} />)

    expect(screen.queryByRole('button', { name: /mark deal as won/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /mark deal as lost/i })).not.toBeInTheDocument()
  })

  it('shows confirmation UI when Won button is clicked', () => {
    const deal = createMockDeal({ status: 'open' })
    render(<DealDetails deal={deal} {...mockProps} />)

    fireEvent.click(screen.getByRole('button', { name: /mark deal as won/i }))

    expect(screen.getByText(/mark this deal as won/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /confirm/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
  })

  it('shows lost reason form when Lost button is clicked', () => {
    const deal = createMockDeal({ status: 'open' })
    render(<DealDetails deal={deal} {...mockProps} />)

    fireEvent.click(screen.getByRole('button', { name: /mark deal as lost/i }))

    expect(screen.getByLabelText(/why was this deal lost/i)).toBeInTheDocument()
    expect(screen.getByText(/0\/150/)).toBeInTheDocument()
  })

  it('disables Confirm button when lost reason is empty', () => {
    const deal = createMockDeal({ status: 'open' })
    render(<DealDetails deal={deal} {...mockProps} />)

    fireEvent.click(screen.getByRole('button', { name: /mark deal as lost/i }))

    const confirmButton = screen.getByRole('button', { name: /confirm/i })
    expect(confirmButton).toBeDisabled()
  })

  it('enables Confirm button when lost reason is entered', () => {
    const deal = createMockDeal({ status: 'open' })
    render(<DealDetails deal={deal} {...mockProps} />)

    fireEvent.click(screen.getByRole('button', { name: /mark deal as lost/i }))

    const input = screen.getByLabelText(/why was this deal lost/i)
    fireEvent.change(input, { target: { value: 'Customer chose competitor' } })

    const confirmButton = screen.getByRole('button', { name: /confirm/i })
    expect(confirmButton).toBeEnabled()
  })

  it('calls markDealWonLost with correct parameters on Won confirm', async () => {
    const mockMarkDealWonLost = vi.fn().mockResolvedValue(createMockDeal({ status: 'won' }))
    const deal = createMockDeal({ status: 'open' })

    render(<DealDetails deal={deal} markDealWonLost={mockMarkDealWonLost} {...mockProps} />)

    fireEvent.click(screen.getByRole('button', { name: /mark deal as won/i }))
    fireEvent.click(screen.getByRole('button', { name: /confirm/i }))

    await waitFor(() => {
      expect(mockMarkDealWonLost).toHaveBeenCalledWith(deal.id, 'won', undefined)
    })
  })

  it('calls markDealWonLost with lost reason on Lost confirm', async () => {
    const mockMarkDealWonLost = vi.fn().mockResolvedValue(createMockDeal({ status: 'lost' }))
    const deal = createMockDeal({ status: 'open' })

    render(<DealDetails deal={deal} markDealWonLost={mockMarkDealWonLost} {...mockProps} />)

    fireEvent.click(screen.getByRole('button', { name: /mark deal as lost/i }))

    const input = screen.getByLabelText(/why was this deal lost/i)
    fireEvent.change(input, { target: { value: 'Too expensive' } })

    fireEvent.click(screen.getByRole('button', { name: /confirm/i }))

    await waitFor(() => {
      expect(mockMarkDealWonLost).toHaveBeenCalledWith(deal.id, 'lost', 'Too expensive')
    })
  })

  it('shows error banner on API failure', async () => {
    const mockMarkDealWonLost = vi.fn().mockRejectedValue(new Error('Network error'))
    const deal = createMockDeal({ status: 'open' })

    render(<DealDetails deal={deal} markDealWonLost={mockMarkDealWonLost} {...mockProps} />)

    fireEvent.click(screen.getByRole('button', { name: /mark deal as won/i }))
    fireEvent.click(screen.getByRole('button', { name: /confirm/i }))

    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument()
    })
  })

  it('resets state when Cancel is clicked', () => {
    const deal = createMockDeal({ status: 'open' })
    render(<DealDetails deal={deal} {...mockProps} />)

    fireEvent.click(screen.getByRole('button', { name: /mark deal as won/i }))
    expect(screen.getByText(/mark this deal as won/i)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }))
    expect(screen.queryByText(/mark this deal as won/i)).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /mark deal as won/i })).toBeInTheDocument()
  })
})
```

### 10.2 Integration Tests

**Service Worker Tests:**

```typescript
describe('Service Worker - Mark Deal Won/Lost', () => {
  it('sends correct request to backend for won deal', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: mockWonDeal })
    })
    global.fetch = mockFetch

    const response = await handlePipedriveMarkDealWonLost({
      type: 'PIPEDRIVE_MARK_DEAL_WON_LOST',
      dealId: 456,
      status: 'won'
    })

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:7071/api/pipedrive/deals/456/status',
      expect.objectContaining({
        method: 'PUT',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'Authorization': expect.stringContaining('Bearer')
        }),
        body: JSON.stringify({ status: 'won' })
      })
    )

    expect(response.type).toBe('PIPEDRIVE_MARK_DEAL_WON_LOST_SUCCESS')
  })

  it('sends correct request with lost reason for lost deal', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: mockLostDeal })
    })
    global.fetch = mockFetch

    await handlePipedriveMarkDealWonLost({
      type: 'PIPEDRIVE_MARK_DEAL_WON_LOST',
      dealId: 456,
      status: 'lost',
      lostReason: 'Too expensive'
    })

    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        body: JSON.stringify({
          status: 'lost',
          lostReason: 'Too expensive'
        })
      })
    )
  })

  it('returns error message on failed request', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Deal not found' })
    })

    const response = await handlePipedriveMarkDealWonLost({
      type: 'PIPEDRIVE_MARK_DEAL_WON_LOST',
      dealId: 999,
      status: 'won'
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
public async Task MarkDealWonLost_ValidWonRequest_ReturnsSuccess()
{
    // Arrange
    var dealId = 456;
    var request = CreateMockRequest(new { status = "won" });
    var mockSession = CreateValidSession();
    var mockDeal = CreateMockPipedriveDeal(dealId, "won");

    sessionService.GetSessionAsync(Arg.Any<string>()).Returns(mockSession);
    pipedriveApiClient.MarkDealWonLostAsync(mockSession, dealId, "won", null)
        .Returns(mockDeal);

    // Act
    var response = await function.Run(request);

    // Assert
    Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    var body = await DeserializeResponse<DealResponse>(response);
    Assert.True(body.Success);
    Assert.Equal("won", body.Data.Status);
}

[Fact]
public async Task MarkDealWonLost_MissingLostReason_ReturnsBadRequest()
{
    // Arrange
    var request = CreateMockRequest(new { status = "lost" }); // No lostReason
    var mockSession = CreateValidSession();

    sessionService.GetSessionAsync(Arg.Any<string>()).Returns(mockSession);

    // Act
    var response = await function.Run(request);

    // Assert
    Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    var body = await DeserializeResponse<ErrorResponse>(response);
    Assert.Contains("Lost reason is required", body.Error);
}

[Fact]
public async Task MarkDealWonLost_LostReasonTooLong_ReturnsBadRequest()
{
    // Arrange
    var longReason = new string('a', 151); // 151 characters
    var request = CreateMockRequest(new {
        status = "lost",
        lostReason = longReason
    });
    var mockSession = CreateValidSession();

    sessionService.GetSessionAsync(Arg.Any<string>()).Returns(mockSession);

    // Act
    var response = await function.Run(request);

    // Assert
    Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    var body = await DeserializeResponse<ErrorResponse>(response);
    Assert.Contains("150 characters or less", body.Error);
}

[Fact]
public async Task MarkDealWonLost_InvalidSession_ReturnsUnauthorized()
{
    // Arrange
    var request = CreateMockRequest(new { status = "won" });

    sessionService.GetSessionAsync(Arg.Any<string>()).Returns((Session)null);

    // Act
    var response = await function.Run(request);

    // Assert
    Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
}
```

### 10.4 E2E Tests (Manual Testing Checklist)

See **Section 11: Manual Testing Checklist** below.

---

## 11. Manual Testing Checklist

### 11.1 Mark Deal as Won - Happy Path

- [ ] Open deal displayed with Won/Lost buttons visible at bottom
- [ ] Click "Won ✓" button
- [ ] Confirmation message "Mark this deal as won?" appears
- [ ] Won/Lost buttons hidden during confirmation
- [ ] Click "Confirm" button
- [ ] Button shows spinner and "Saving..." text
- [ ] Both buttons disabled during API call
- [ ] Success toast appears: "Deal marked as won"
- [ ] Deal card updates to show status "Won ✓"
- [ ] Won/Lost buttons no longer displayed (deal closed)
- [ ] Deal value remains unchanged
- [ ] Deal remains selected in dropdown
- [ ] Dropdown shows deal with ✓ icon in Won section

### 11.2 Mark Deal as Won - Cancel Flow

- [ ] Open deal displayed with Won/Lost buttons
- [ ] Click "Won ✓" button
- [ ] Confirmation UI appears
- [ ] Click "Cancel" button
- [ ] Confirmation UI disappears
- [ ] Won/Lost buttons reappear
- [ ] Deal status remains "open"

### 11.3 Mark Deal as Won - Error Handling

- [ ] Disconnect internet before clicking Confirm
- [ ] Click "Won ✓" then "Confirm"
- [ ] Error banner appears with network error message
- [ ] Confirm/Cancel buttons remain visible and enabled
- [ ] Click X button on error banner to dismiss
- [ ] Reconnect internet and retry
- [ ] Success flow completes normally

### 11.4 Mark Deal as Lost - Happy Path

- [ ] Open deal displayed with Won/Lost buttons
- [ ] Click "Lost ✗" button
- [ ] Lost reason form appears
- [ ] Input field has focus (autofocus)
- [ ] Placeholder text: "Why was this deal lost?"
- [ ] Character counter shows "0/150"
- [ ] Confirm button is disabled (empty reason)
- [ ] Type lost reason: "Customer chose competitor"
- [ ] Character counter updates: "25/150"
- [ ] Confirm button becomes enabled
- [ ] Click "Confirm" button
- [ ] Button shows spinner and "Saving..." text
- [ ] Input field disabled during API call
- [ ] Both buttons disabled during API call
- [ ] Success toast appears: "Deal marked as lost"
- [ ] Deal card updates to show status "Lost ✗"
- [ ] Lost reason displayed in deal card
- [ ] Won/Lost buttons no longer displayed
- [ ] Deal remains selected in dropdown
- [ ] Dropdown shows deal with ✗ icon in Lost section

### 11.5 Mark Deal as Lost - Input Validation

- [ ] Click "Lost ✗" button
- [ ] Try to click Confirm without entering reason
- [ ] Confirm button is disabled
- [ ] Type single space character
- [ ] Confirm button remains disabled (whitespace-only)
- [ ] Type valid reason
- [ ] Confirm button becomes enabled
- [ ] Type or paste 150+ characters
- [ ] Input truncates at 150 characters
- [ ] Character counter shows "150/150"
- [ ] Confirm button remains enabled

### 11.6 Mark Deal as Lost - Cancel Flow

- [ ] Click "Lost ✗" button
- [ ] Lost reason form appears
- [ ] Type partial reason: "Too exp"
- [ ] Click "Cancel" button
- [ ] Lost reason form disappears
- [ ] Won/Lost buttons reappear
- [ ] Click "Lost ✗" again
- [ ] Form appears with empty input (previous input not retained)

### 11.7 Mark Deal as Lost - Error Handling

- [ ] Click "Lost ✗" button
- [ ] Enter lost reason
- [ ] Disconnect internet
- [ ] Click "Confirm"
- [ ] Error banner appears with network error
- [ ] Input field remains visible with entered text
- [ ] Confirm/Cancel buttons enabled for retry
- [ ] Dismiss error banner
- [ ] Edit lost reason if needed
- [ ] Reconnect internet and retry
- [ ] Success flow completes

### 11.8 Button State Management

- [ ] Open deal shows Won/Lost buttons
- [ ] Won deal does not show Won/Lost buttons
- [ ] Lost deal does not show Won/Lost buttons
- [ ] Won/Lost buttons disabled when stage editing is active
- [ ] Stage dropdowns disabled when Won confirmation is active
- [ ] Stage dropdowns disabled when Lost form is active

### 11.9 Accessibility Testing

- [ ] Tab through buttons using keyboard only
- [ ] Tab order: Won → Lost → (or form fields)
- [ ] Press Enter on Won button (same as click)
- [ ] Press Enter in lost reason input (submits form)
- [ ] Press Escape in Won confirmation (cancels)
- [ ] Press Escape in Lost form (cancels)
- [ ] Screen reader announces button labels correctly
- [ ] Screen reader announces error messages
- [ ] Screen reader announces success toasts
- [ ] Focus indicator visible on all interactive elements

### 11.10 Edge Cases

- [ ] Mark deal as won, then reload extension → Deal remains won
- [ ] Mark deal as lost, then reload WhatsApp → Deal remains lost with reason
- [ ] Switch to different deal during Won confirmation → State resets correctly
- [ ] Create new deal, immediately mark as won → Works correctly
- [ ] Have 2 browser windows open, mark deal as won in one → Other window shows stale data until refresh (expected)
- [ ] Network timeout during API call → Error shown after timeout
- [ ] Session expires during operation → Redirected to sign-in

### 11.11 Cross-Browser Testing

- [ ] Chrome (latest) - All flows work
- [ ] Chrome (1 version back) - All flows work
- [ ] Edge (latest) - All flows work
- [ ] Brave (latest) - All flows work

### 11.12 Performance Testing

- [ ] Mark deal as won completes in < 2 seconds (normal network)
- [ ] Mark deal as lost completes in < 2 seconds (normal network)
- [ ] UI remains responsive during API calls
- [ ] No visual flicker or layout shifts
- [ ] Smooth transitions between states

---

## 12. Acceptance Criteria

### 12.1 Feature 36: Mark Deal as Won

- [ ] "Won ✓" button visible only for open deals
- [ ] Button positioned at bottom of deal card, left side
- [ ] Clicking button shows confirmation: "Mark this deal as won?"
- [ ] Confirmation includes Confirm and Cancel buttons
- [ ] Clicking Confirm calls API to mark deal as won
- [ ] Loading state shows spinner and "Saving..." on Confirm button
- [ ] Both buttons disabled during API call
- [ ] Success: Deal card updates to show "Won" status
- [ ] Success: Success toast displayed: "Deal marked as won"
- [ ] Success: Won/Lost buttons no longer displayed
- [ ] Error: Error banner shown above confirmation
- [ ] Error: Banner is dismissible
- [ ] Error: Confirm/Cancel buttons remain for retry
- [ ] Cancel: Returns to normal state, deal remains open
- [ ] Deal remains selected in dropdown after marking as won
- [ ] Deal moves to Won section in dropdown (visual update)

### 12.2 Feature 37: Mark Deal as Lost

- [ ] "Lost ✗" button visible only for open deals
- [ ] Button positioned at bottom of deal card, right side
- [ ] Clicking button shows inline lost reason form
- [ ] Form includes label: "Why was this deal lost?"
- [ ] Form includes text input with placeholder
- [ ] Form includes character counter: "X/150"
- [ ] Input field has autofocus on form display
- [ ] Input field maxLength is 150 characters
- [ ] Confirm button disabled when reason is empty or whitespace-only
- [ ] Confirm button enabled when reason has content
- [ ] Clicking Confirm calls API with status and lost reason
- [ ] Loading state shows spinner and "Saving..." on Confirm button
- [ ] Input field and buttons disabled during API call
- [ ] Success: Deal card updates to show "Lost" status
- [ ] Success: Lost reason displayed in deal card
- [ ] Success: Success toast displayed: "Deal marked as lost"
- [ ] Success: Won/Lost buttons no longer displayed
- [ ] Error: Error banner shown above form
- [ ] Error: Banner is dismissible
- [ ] Error: Form remains visible with entered text for retry
- [ ] Cancel: Returns to normal state, entered text discarded
- [ ] Deal remains selected in dropdown after marking as lost
- [ ] Deal moves to Lost section in dropdown (visual update)

### 12.3 Backend API

- [ ] Endpoint `PUT /api/pipedrive/deals/{dealId}/status` implemented
- [ ] Validates request has valid session (Authorization header)
- [ ] Validates status is "won" or "lost"
- [ ] Validates lostReason is present when status = "lost"
- [ ] Validates lostReason length is 1-150 characters
- [ ] Returns 400 for missing/invalid lostReason
- [ ] Returns 401 for invalid/expired session
- [ ] Returns 404 for non-existent deal
- [ ] Calls Pipedrive API: PUT /v1/deals/{id}
- [ ] Enriches response with stage/pipeline metadata
- [ ] Returns transformed Deal object
- [ ] Logs request and response via HttpRequestLogger

### 12.4 Error Handling

- [ ] Network errors show error banner with retry capability
- [ ] Authentication errors redirect to sign-in
- [ ] Validation errors show clear error messages
- [ ] All errors logged to Sentry with context (dealId, status, lostReason)
- [ ] Error states don't lose user input
- [ ] User can dismiss errors and retry

### 12.5 UI/UX

- [ ] Won/Lost buttons use established UI design patterns
- [ ] Inline forms match Create Deal form styling
- [ ] Error banners match existing error banner styling
- [ ] Loading states match existing loading patterns
- [ ] Success toasts match existing toast styling
- [ ] All text is clear, concise, and user-friendly
- [ ] Character counter updates in real-time
- [ ] Focus management works correctly
- [ ] Keyboard navigation works correctly
- [ ] Screen readers announce all states correctly

### 12.6 Performance

- [ ] API calls complete in < 2 seconds on normal network
- [ ] UI remains responsive during operations
- [ ] No memory leaks from event handlers
- [ ] Component re-renders are minimized

---

## 13. Deployment Plan

### 13.1 Backend Deployment

1. **Merge backend changes:**
   - `MarkDealWonLostFunction.cs`
   - Updated `PipedriveModels.cs`
   - Updated `IPipedriveApiClient.cs`
   - Updated `PipedriveApiClient.cs`

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
   - Test endpoint manually via Postman
   - Check Application Insights for logs
   - Verify no errors in function logs

### 13.2 Extension Deployment

1. **Merge extension changes:**
   - Updated `DealDetails.tsx`
   - Updated `usePipedrive.ts` hook
   - Updated service worker message handlers
   - Updated message type definitions
   - Updated CSS styles

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
   - Update release notes to mention Features 36 & 37

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

**Won Notes:**
- Add optional win notes field when marking as won
- Capture "What helped you win this deal?"
- Improve sales insights and playbook development

**Lost Reason Analytics:**
- Track most common lost reasons
- Show trends over time
- Help identify sales process improvements

**Bulk Actions:**
- Mark multiple deals as won/lost in one operation
- Useful for cleaning up old pipeline

**Undo Action:**
- "Undo" button in success toast
- Revert deal to open status within 5 seconds
- Better error recovery

**Deal Templates:**
- Pre-configured lost reasons per pipeline
- Faster data entry with predefined options

### 14.2 Related Features (Separate Specs)

- **Feature 38: Reopen Deal** (Spec-137)
- **Feature 39: Save Messages to Deal Notes** (Spec-138)

---

## 15. Open Questions

### 15.1 Resolved Questions

✅ **Q: Should lost reason be required or optional?**
**A:** Required. Forces data quality and sales insights.

✅ **Q: What should lost reason input be? Dropdown or free-text?**
**A:** Single-line text input (max 150 chars). Simple, flexible, no API dependency.

✅ **Q: Should Won require confirmation or be one-click?**
**A:** Simple confirmation with Confirm/Cancel buttons. Prevents accidental wins.

✅ **Q: Where should Won/Lost buttons be positioned?**
**A:** Bottom of deal card, below all other content. Clear action area.

✅ **Q: Should we show predefined lost reasons?**
**A:** No. Free-text input only. Pipedrive API has no endpoint for predefined reasons.

### 15.2 Remaining Questions

**Q: Should we track Win/Loss metrics in backend database?**
- Pro: Analytics without hitting Pipedrive API
- Con: Duplicate data, potential sync issues
- **Decision:** Defer to future. Use Pipedrive as source of truth for now.

**Q: Should we notify other open browser tabs when deal status changes?**
- Pro: Real-time sync across windows
- Con: Complexity, edge cases
- **Decision:** Defer to future. Refresh on tab focus is sufficient for MVP.

---

## 16. Related Documentation

### 16.1 BRDs
- [BRD-002: Deals Management](../BRDs/BRD-002-Deals-Management.md) - Parent BRD for this spec

### 16.2 Specs
- [Spec-131a: Backend Deals API](./Spec-131a-Backend-Deals-API.md) - Deal fetching and enrichment
- [Spec-131b: Extension Deals Display](./Spec-131b-Extension-Deals-Display.md) - DealDetails component foundation
- [Spec-134: Create Deal Flow](./Spec-134-Create-Deal-Flow.md) - Inline form patterns
- [Spec-135: Change Deal Stage Flow](./Spec-135-Change-Deal-Stage-Flow.md) - UI state management patterns

### 16.3 Architecture
- [Chrome Extension Architecture](../Architecture/Chrome-Extension-Architecture.md) - Overall architecture
- [UI Design Specification](../Architecture/UI-Design-Specification.md) - UI design system

### 16.4 External APIs
- Pipedrive API: `PUT /v1/deals/{id}` - Update deal endpoint

---

**END OF SPEC-136**
