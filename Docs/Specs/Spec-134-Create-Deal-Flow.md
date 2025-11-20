# Spec-134: Create Deal Flow

**Feature:** Feature 34 - Create New Deal
**Date:** 2025-01-18
**Status:** ✅ Complete
**Implementation Date:** 2025-01-18
**Dependencies:**
- Spec-131a (Backend Deals API Service - deployed)
- Spec-131b (Extension Deals Display - deployed)
- Spec-110 (Create Person Flow - pattern reference)

---

## 1. Overview

This specification defines the Create Deal functionality that enables users to create new Pipedrive deals directly from the WhatsApp sidebar when viewing a matched person. The user can quickly create a deal with minimal required fields (title, pipeline, stage) while optional value can be added.

### 1.1 Scope

**In Scope:**
- Inline create deal form within DealsSection
- Form toggle via "+ Create" button in section header
- Title field with pre-fill pattern "[Person Name] Deal"
- Optional value field (numeric input, no currency selector)
- Pipeline dropdown (pre-selects default pipeline with order_nr=0)
- Stage dropdown (dynamically populated based on pipeline, auto-selects first stage)
- Form validation (title required, pipeline required, stage required)
- Form submission with loading state
- Success flow: form closes, new deal auto-selected, toast notification
- Error handling with inline error banner
- Integration with existing ToastContext
- Pipelines/stages data from config endpoint

**Out of Scope:**
- Email or custom fields
- Organization linking
- Deal products/participants
- Expected close date or probability fields
- Deal editing after creation
- Deal deletion
- Advanced validation (duplicate detection)
- Multi-currency support (uses account default)

### 1.2 User Flow

```
User viewing matched person with deals section
    ↓
User clicks "+ Create" button in deals card header
    ↓
Form fetches pipelines/stages from config endpoint (cached)
    ↓
[If loading] Show form skeleton with disabled fields
    ↓
Form displays with pre-filled/pre-selected values:
  - Title: "[Person Name] Deal"
  - Pipeline: Default pipeline (order_nr=0)
  - Stage: First stage of default pipeline
  - Value: empty (optional)
    ↓
User reviews/edits title (optional)
User changes pipeline (optional - updates stage dropdown)
User changes stage (optional)
User enters value (optional)
    ↓
[If invalid] Create button disabled
    ↓
User clicks "Create" button
    ↓
Button shows "Creating..." with spinner
All fields disabled during submission
    ↓
API call to backend: POST /api/pipedrive/deals
    ↓
    ├─→ Success:
    │     - Form closes
    │     - Deal dropdown reappears with new deal
    │     - New deal auto-selected in dropdown
    │     - DealDetails shows new deal
    │     - Green toast: "Deal created successfully"
    │
    └─→ Error:
          - Error banner appears above form fields
          - Form remains open and editable
          - User can dismiss error or retry
```

---

## 2. Objectives

- Enable users to create Pipedrive deals without leaving WhatsApp
- Provide inline, friction-free form submission (no modal dialogs)
- Pre-fill/pre-select form fields to minimize user input
- Validate input client-side before submission
- Handle errors gracefully with clear recovery path
- Maintain consistency with existing Create Person flow patterns
- Ensure created deal is linked to current person automatically
- Provide clear success feedback via toast notification

---

## 3. Component Specifications

### 3.1 CreateDealForm Component (New)

**File:** `Extension/src/content-script/components/CreateDealForm.tsx`

**Props Interface:**
```typescript
interface CreateDealFormProps {
  personId: number
  personName: string
  pipelines: Pipeline[]
  stages: Stage[]
  onDealCreated: (deal: Deal) => void
  onCancel: () => void
}

interface Pipeline {
  id: number
  name: string
  orderNr: number
  active: boolean
}

interface Stage {
  id: number
  name: string
  orderNr: number
  pipelineId: number
}
```

**Component State:**
```typescript
interface CreateDealFormState {
  title: string
  value: string // Stored as string for input, converted to number on submit
  selectedPipelineId: number | null
  selectedStageId: number | null
  isCreating: boolean
  error: string | null
}
```

**State Initialization:**
```typescript
// Find default pipeline (order_nr = 0)
const defaultPipeline = pipelines.find(p => p.orderNr === 0) || pipelines[0]

// Get stages for default pipeline
const defaultStages = stages
  .filter(s => s.pipelineId === defaultPipeline.id)
  .sort((a, b) => a.orderNr - b.orderNr)

const firstStage = defaultStages[0]

const [title, setTitle] = useState(`${personName} Deal`)
const [value, setValue] = useState('')
const [selectedPipelineId, setSelectedPipelineId] = useState(defaultPipeline?.id || null)
const [selectedStageId, setSelectedStageId] = useState(firstStage?.id || null)
const [isCreating, setIsCreating] = useState(false)
const [error, setError] = useState<string | null>(null)
```

### 3.2 Form Layout Structure

```tsx
<div className="p-3 space-y-3">
  {/* Error Banner (if error) */}
  {error && (
    <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
      <div className="flex-1 text-sm text-red-800">{error}</div>
      <button onClick={() => setError(null)} aria-label="Dismiss error">
        <X className="w-4 h-4 text-red-600" />
      </button>
    </div>
  )}

  {/* Title Field */}
  <div>
    <label className="block text-xs font-medium text-text-secondary mb-1">
      Title *
    </label>
    <input
      type="text"
      value={title}
      onChange={(e) => setTitle(e.target.value)}
      disabled={isCreating}
      placeholder="Deal title"
      className="w-full px-3 py-2 border border-border-secondary rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary disabled:bg-gray-50 disabled:text-gray-500"
    />
  </div>

  {/* Value Field */}
  <div>
    <label className="block text-xs font-medium text-text-secondary mb-1">
      Value
    </label>
    <input
      type="number"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      disabled={isCreating}
      placeholder="0"
      className="w-full px-3 py-2 border border-border-secondary rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary disabled:bg-gray-50 disabled:text-gray-500"
    />
  </div>

  {/* Pipeline Dropdown */}
  <div>
    <label className="block text-xs font-medium text-text-secondary mb-1">
      Pipeline *
    </label>
    <select
      value={selectedPipelineId || ''}
      onChange={handlePipelineChange}
      disabled={isCreating}
      className="w-full px-3 py-2 border border-border-secondary rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary disabled:bg-gray-50 disabled:text-gray-500"
    >
      {pipelines.map(pipeline => (
        <option key={pipeline.id} value={pipeline.id}>
          {pipeline.name}
        </option>
      ))}
    </select>
  </div>

  {/* Stage Dropdown */}
  <div>
    <label className="block text-xs font-medium text-text-secondary mb-1">
      Stage *
    </label>
    <select
      value={selectedStageId || ''}
      onChange={(e) => setSelectedStageId(Number(e.target.value))}
      disabled={isCreating}
      className="w-full px-3 py-2 border border-border-secondary rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary disabled:bg-gray-50 disabled:text-gray-500"
    >
      {currentStages.map(stage => (
        <option key={stage.id} value={stage.id}>
          {stage.name}
        </option>
      ))}
    </select>
  </div>

  {/* Action Buttons */}
  <div className="flex gap-2 pt-2">
    <button
      onClick={onCancel}
      disabled={isCreating}
      className="flex-1 px-4 py-2 border border-border-secondary text-text-primary text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      Cancel
    </button>
    <button
      onClick={handleCreate}
      disabled={isSubmitDisabled}
      className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
        isSubmitDisabled
          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
          : 'bg-brand-primary text-white hover:bg-brand-hover cursor-pointer'
      }`}
    >
      {isCreating ? (
        <span className="flex items-center justify-center gap-2">
          <Spinner size="sm" color="white" />
          Creating...
        </span>
      ) : (
        'Create'
      )}
    </button>
  </div>
</div>
```

### 3.3 Form Loading Skeleton

**Shown while fetching pipelines/stages from config endpoint:**

```tsx
<div className="p-3 space-y-3">
  {/* Title Skeleton */}
  <div>
    <div className="h-3 w-12 bg-gray-200 rounded mb-1 animate-pulse"></div>
    <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
  </div>

  {/* Value Skeleton */}
  <div>
    <div className="h-3 w-12 bg-gray-200 rounded mb-1 animate-pulse"></div>
    <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
  </div>

  {/* Pipeline Skeleton */}
  <div>
    <div className="h-3 w-16 bg-gray-200 rounded mb-1 animate-pulse"></div>
    <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
  </div>

  {/* Stage Skeleton */}
  <div>
    <div className="h-3 w-12 bg-gray-200 rounded mb-1 animate-pulse"></div>
    <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
  </div>

  {/* Button Skeleton */}
  <div className="flex gap-2 pt-2">
    <div className="flex-1 h-10 bg-gray-200 rounded animate-pulse"></div>
    <div className="flex-1 h-10 bg-gray-200 rounded animate-pulse"></div>
  </div>
</div>
```

---

## 4. Validation Logic

### 4.1 Title Validation

**Rule:** Title must be non-empty after trimming whitespace

```typescript
const isValidTitle = (title: string): boolean => {
  return title.trim().length > 0
}
```

**Test Cases:**
| Input | Valid? | Reason |
|-------|--------|--------|
| `""` | ❌ | Empty |
| `"  "` | ❌ | Only whitespace |
| `"A"` | ✅ | Non-empty |
| `"Deal #123"` | ✅ | Valid with symbols |
| `"Q1 2025 Project"` | ✅ | Valid with numbers |
| `"  Deal  "` | ✅ | Whitespace trimmed |

### 4.2 Value Validation

**Rule:** Value is optional, no validation required

- Empty string = no value sent to API
- If provided, must be valid number (HTML input type="number" handles this)

### 4.3 Pipeline & Stage Validation

**Rule:** Both must be selected

- Pipeline: Pre-selected, user can change
- Stage: Pre-selected, user can change
- Both IDs must be non-null

### 4.4 Submit Button Enable Logic

```typescript
const isSubmitDisabled =
  !isValidTitle(title) ||
  selectedPipelineId === null ||
  selectedStageId === null ||
  isCreating
```

**Button enabled when:**
- Title is valid (non-empty after trim)
- Pipeline is selected
- Stage is selected
- Form is not currently submitting

---

## 5. Form Submission Logic

### 5.1 Handle Create Function

```typescript
const handleCreate = async () => {
  // Prevent double submission
  if (isSubmitDisabled) return

  // Clear previous error
  setError(null)

  // Set loading state
  setIsCreating(true)

  try {
    // Prepare data
    const dealData: CreateDealData = {
      title: title.trim(),
      personId,
      pipelineId: selectedPipelineId!,
      stageId: selectedStageId!,
    }

    // Add value if provided
    if (value && value.trim() !== '') {
      const numericValue = parseFloat(value)
      if (!isNaN(numericValue) && numericValue > 0) {
        dealData.value = numericValue
      }
    }

    // Call API via usePipedrive hook
    const deal = await createDeal(dealData)

    if (deal) {
      // Success: notify parent to transition state
      onDealCreated(deal)
      // Note: Component will unmount as parent handles state transition

      // Show success toast (parent will handle this after state transition)
      showToast('Deal created successfully')
    } else {
      // API returned null (error handled by hook)
      const errorMessage = error?.message || 'Failed to create deal. Please try again.'
      setError(errorMessage)
      setIsCreating(false)
    }
  } catch (err) {
    // Unexpected error
    const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.'
    setError(errorMessage)
    setIsCreating(false)
  }
}
```

### 5.2 Handle Pipeline Change

```typescript
const handlePipelineChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  const newPipelineId = Number(e.target.value)
  setSelectedPipelineId(newPipelineId)

  // Update stages dropdown
  const newStages = stages
    .filter(s => s.pipelineId === newPipelineId)
    .sort((a, b) => a.orderNr - b.orderNr)

  // Auto-select first stage of new pipeline
  if (newStages.length > 0) {
    setSelectedStageId(newStages[0].id)
  } else {
    setSelectedStageId(null)
  }
}
```

### 5.3 Handle Cancel

```typescript
const handleCancel = () => {
  // Close form immediately, discard all changes
  onCancel()
}
```

---

## 6. Parent Integration

### 6.1 DealsSection Component Updates

**File:** `Extension/src/content-script/components/DealsSection.tsx`

**Add State:**
```typescript
const [isCreatingDeal, setIsCreatingDeal] = useState(false)
```

**Update Header to Include Create Button:**
```tsx
<div className="flex items-center justify-between mb-3">
  <div className="flex items-center gap-2">
    <svg className="w-5 h-5 text-brand-primary" {...}>
      {/* Deals Icon */}
    </svg>
    <h3 className="text-sm font-semibold text-text-primary">Deals</h3>
  </div>

  {/* Create Deal Button - Always visible */}
  <button
    onClick={() => setIsCreatingDeal(true)}
    className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-brand-primary hover:bg-brand-primary hover:bg-opacity-10 rounded transition-colors"
    aria-label="Create deal"
  >
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
    Create
  </button>
</div>
```

**Conditional Rendering Logic:**
```tsx
// If creating deal, show form
if (isCreatingDeal) {
  return (
    <div className="px-3 pt-3">
      <div className="p-3 bg-white rounded-lg border border-border-secondary shadow-sm">
        {/* Header with Create button (still visible) */}
        <div className="flex items-center justify-between mb-3">
          {/* ... header content ... */}
        </div>

        {/* Show form */}
        <CreateDealForm
          personId={personId}
          personName={personName}
          pipelines={pipelines}
          stages={stages}
          onDealCreated={handleDealCreated}
          onCancel={() => setIsCreatingDeal(false)}
        />
      </div>
    </div>
  )
}

// Otherwise show normal deals display (dropdown + selected deal)
```

### 6.2 Callback Implementation

```typescript
const handleDealCreated = (deal: Deal) => {
  // Close form
  setIsCreatingDeal(false)

  // Add new deal to deals array
  const updatedDeals = [...deals, deal]

  // Sort deals (backend sorting logic: open → won → lost, by update_time desc)
  // For new deal, it will be at the top of open deals

  // Auto-select the new deal
  setSelectedDealId(deal.id)

  // Parent (App.tsx) needs to be notified to update deals state
  // This requires adding onDealsUpdated callback to DealsSectionProps
  onDealsUpdated?.(updatedDeals)
}
```

### 6.3 App.tsx Integration

**Update SidebarState:**
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
      pipelines: Pipeline[]  // NEW
      stages: Stage[]        // NEW
    }
  | { type: 'person-no-match'; name: string; phone: string }
  | { type: 'person-error'; name: string; phone: string; error: string }
```

**Pass Pipelines/Stages to DealsSection:**
```tsx
case 'person-matched':
  return (
    <>
      <PersonMatchedCard {...} />

      <DealsSection
        personId={state.person.id}
        personName={state.person.name}
        deals={state.deals}
        dealsError={state.dealsError}
        pipelines={state.pipelines}  // NEW
        stages={state.stages}        // NEW
        onRetry={handlePersonLookup}
        onDealsUpdated={(updatedDeals) => {
          setState(prev => ({ ...prev, deals: updatedDeals }))
        }}
      />
    </>
  )
```

---

## 7. API Integration

### 7.1 Config Endpoint Enhancement

**Endpoint:** `GET /api/config`

**Current Response:**
```json
{
  "message": "..."
}
```

**Enhanced Response:**
```json
{
  "message": "...",
  "pipelines": [
    {
      "id": 1,
      "name": "Sales Pipeline",
      "orderNr": 0,
      "active": true
    },
    {
      "id": 2,
      "name": "Partner Pipeline",
      "orderNr": 1,
      "active": true
    }
  ],
  "stages": [
    {
      "id": 1,
      "name": "Qualified",
      "orderNr": 0,
      "pipelineId": 1
    },
    {
      "id": 2,
      "name": "Contact Made",
      "orderNr": 1,
      "pipelineId": 1
    },
    {
      "id": 3,
      "name": "Demo Scheduled",
      "orderNr": 2,
      "pipelineId": 1
    }
  ]
}
```

**Backend Changes Required:**
- `GetConfigFunction.cs`: Inject `IPipedriveApiClient`, fetch pipelines/stages, include in response
- `PipedrivePipeline`: Add `OrderNr` and `Active` properties
- Response models updated

### 7.2 Create Deal Endpoint (New)

**Endpoint:** `POST /api/pipedrive/deals`

**Request:**
```json
{
  "title": "John Smith Deal",
  "personId": 123,
  "pipelineId": 1,
  "stageId": 1,
  "value": 50000  // Optional
}
```

**Response (201 Created):**
```json
{
  "id": 456,
  "title": "John Smith Deal",
  "value": "$50,000.00",
  "stage": {
    "id": 1,
    "name": "Qualified",
    "order": 0
  },
  "pipeline": {
    "id": 1,
    "name": "Sales Pipeline"
  },
  "status": "open"
}
```

**Error Responses:**
- 400 Bad Request - Missing required fields or invalid data
- 401 Unauthorized - Invalid verification_code or session expired
- 429 Too Many Requests - Rate limit exceeded
- 500 Internal Server Error - Pipedrive API error

**Backend Implementation:**
- New function: `CreateDealFunction.cs`
- Validates session
- Calls Pipedrive `POST /v1/deals` with:
  - `title` (from request)
  - `person_id` (from request)
  - `pipeline_id` (from request - optional for Pipedrive, required by us)
  - `stage_id` (from request)
  - `value` (from request, optional)
  - `user_id` (from session - authenticated user as owner)
  - `status` = "open"
- Enriches response with stage/pipeline metadata (like existing deals)
- Returns transformed deal matching frontend Deal type

### 7.3 Extension Service Integration

**File:** `Extension/src/content-script/hooks/usePipedrive.ts`

**Add Method:**
```typescript
/**
 * Create new deal linked to person
 */
const createDeal = async (data: CreateDealData): Promise<Deal | null> => {
  setIsLoading(true)
  setError(null)

  try {
    const response = await sendMessage<PipedriveResponse>({
      type: 'PIPEDRIVE_CREATE_DEAL',
      data,
    })

    if (response.type === 'PIPEDRIVE_CREATE_DEAL_SUCCESS') {
      return response.deal
    } else if (response.type === 'PIPEDRIVE_ERROR') {
      setError({
        message: response.error,
        statusCode: response.statusCode,
      })
      return null
    }

    throw new Error('Unexpected response type')
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to create deal'
    setError({ message: errorMessage, statusCode: 500 })
    return null
  } finally {
    setIsLoading(false)
  }
}

// Export in return object
return {
  // ... existing exports
  createDeal,
}
```

**Type Definitions:**

**File:** `Extension/src/types/deal.ts`
```typescript
export interface CreateDealData {
  title: string
  personId: number
  pipelineId: number
  stageId: number
  value?: number
}
```

**File:** `Extension/src/types/messages.ts`
```typescript
// Request
export interface PipedriveCreateDealRequest {
  type: 'PIPEDRIVE_CREATE_DEAL'
  data: CreateDealData
}

// Success Response
export interface PipedriveCreateDealSuccessResponse {
  type: 'PIPEDRIVE_CREATE_DEAL_SUCCESS'
  deal: Deal
}

// Update unions
export type PipedriveRequest =
  | PipedriveLookupByPhoneRequest
  | PipedriveSearchByNameRequest
  | PipedriveCreatePersonRequest
  | PipedriveAttachPhoneRequest
  | PipedriveCreateNoteRequest
  | PipedriveCreateDealRequest  // NEW

export type PipedriveResponse =
  | PipedriveLookupSuccessResponse
  | PipedriveSearchSuccessResponse
  | PipedriveCreateSuccessResponse
  | PipedriveAttachSuccessResponse
  | PipedriveCreateNoteSuccessResponse
  | PipedriveCreateNoteErrorResponse
  | PipedriveCreateDealSuccessResponse  // NEW
  | PipedriveErrorResponse
```

**File:** `Extension/src/service-worker/index.ts`

**Add Handler:**
```typescript
async function handlePipedriveCreateDeal(data: CreateDealData): Promise<PipedriveResponse> {
  const verificationCode = await getVerificationCode()

  if (!verificationCode) {
    return {
      type: 'PIPEDRIVE_ERROR',
      error: 'Not authenticated',
      statusCode: 401,
    }
  }

  try {
    const response = await fetch(
      `${BACKEND_URL}/api/pipedrive/deals`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${verificationCode}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return {
        type: 'PIPEDRIVE_ERROR',
        error: errorData.error || `HTTP ${response.status}`,
        statusCode: response.status,
      }
    }

    const deal = await response.json()

    return {
      type: 'PIPEDRIVE_CREATE_DEAL_SUCCESS',
      deal,
    }
  } catch (error) {
    return {
      type: 'PIPEDRIVE_ERROR',
      error: error instanceof Error ? error.message : 'Failed to create deal',
      statusCode: 500,
    }
  }
}

// Add to message handler
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // ... existing handlers

  if (message.type === 'PIPEDRIVE_CREATE_DEAL') {
    handlePipedriveCreateDeal(message.data).then(sendResponse)
    return true
  }

  // ... rest of handlers
})
```

---

## 8. UI/UX Specifications

### 8.1 Visual Design

**Design Principles:**
- Match existing DealsSection styling
- Consistent with Create Person flow patterns
- Clear visual hierarchy for form fields
- Accessible form labels and inputs

**Color Palette:**
- Primary text: `text-text-primary`
- Secondary text: `text-text-secondary`
- Border: `border-border-secondary`
- Background: `bg-white`
- Brand primary: `bg-brand-primary`
- Brand hover: `bg-brand-hover`
- Error red (bg): `bg-red-50`
- Error red (border): `border-red-200`
- Error red (text): `text-red-800`

### 8.2 Button States

**Create Button - Enabled:**
```css
bg-brand-primary text-white hover:bg-brand-hover cursor-pointer
```

**Create Button - Disabled:**
```css
bg-gray-300 text-gray-500 cursor-not-allowed
```

**Create Button - Loading:**
```css
bg-brand-primary text-white cursor-not-allowed
// Content: <Spinner /> + "Creating..."
```

**Cancel Button:**
```css
border border-border-secondary text-text-primary hover:bg-gray-50
disabled:opacity-50 disabled:cursor-not-allowed
```

### 8.3 Input States

**Normal:**
```css
border-border-secondary bg-white text-text-primary
focus:ring-2 focus:ring-brand-primary
```

**Disabled (during submission):**
```css
disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
```

### 8.4 Layout Spacing

**Vertical Spacing:**
- Form container: `p-3`
- Between fields: `space-y-3`
- Label margin: `mb-1`
- Buttons top padding: `pt-2`

**Horizontal Spacing:**
- Input padding: `px-3 py-2`
- Button padding: `px-4 py-2`
- Button gap: `gap-2`

---

## 9. Toast Notification Integration

### 9.1 Success Toast

**After successful deal creation:**
```typescript
import { useToast } from '../context/ToastContext'

const { showToast } = useToast()

// On success
showToast('Deal created successfully')
```

**Toast Behavior:**
- Green background with checkmark icon
- Message: "Deal created successfully"
- Auto-dismisses after 5 seconds
- Manual dismiss via X button
- Positioned at bottom of sidebar with slide-up animation

**Note:** Toast logic is handled by existing `ToastContext` (Spec-130b pattern). No new implementation needed.

---

## 10. Testing Requirements

### 10.1 Unit Tests

**File:** `Extension/tests/unit/CreateDealForm.test.tsx`

**Validation Tests:**
```typescript
describe('Title Validation', () => {
  it('returns false for empty string', () => {
    expect(isValidTitle("")).toBe(false)
  })

  it('returns false for whitespace only', () => {
    expect(isValidTitle("  ")).toBe(false)
  })

  it('returns true for non-empty string', () => {
    expect(isValidTitle("Deal")).toBe(true)
  })

  it('returns true after trimming whitespace', () => {
    expect(isValidTitle("  Deal  ")).toBe(true)
  })

  it('returns true for deal with symbols', () => {
    expect(isValidTitle("Deal #123")).toBe(true)
  })
})
```

**Component Tests:**
```typescript
describe('CreateDealForm', () => {
  const mockPipelines = [
    { id: 1, name: 'Sales', orderNr: 0, active: true },
    { id: 2, name: 'Partner', orderNr: 1, active: true },
  ]
  const mockStages = [
    { id: 1, name: 'Qualified', orderNr: 0, pipelineId: 1 },
    { id: 2, name: 'Contact Made', orderNr: 1, pipelineId: 1 },
    { id: 3, name: 'Discovery', orderNr: 0, pipelineId: 2 },
  ]
  const mockOnDealCreated = vi.fn()
  const mockOnCancel = vi.fn()

  const defaultProps = {
    personId: 123,
    personName: 'John Smith',
    pipelines: mockPipelines,
    stages: mockStages,
    onDealCreated: mockOnDealCreated,
    onCancel: mockOnCancel,
  }

  it('renders with pre-filled title', () => {
    render(<CreateDealForm {...defaultProps} />)
    const input = screen.getByDisplayValue('John Smith Deal')
    expect(input).toBeInTheDocument()
  })

  it('pre-selects default pipeline (orderNr=0)', () => {
    render(<CreateDealForm {...defaultProps} />)
    const select = screen.getByLabelText(/pipeline/i)
    expect(select).toHaveValue('1') // Sales pipeline
  })

  it('pre-selects first stage of default pipeline', () => {
    render(<CreateDealForm {...defaultProps} />)
    const select = screen.getByLabelText(/stage/i)
    expect(select).toHaveValue('1') // Qualified
  })

  it('title field is editable', () => {
    render(<CreateDealForm {...defaultProps} />)
    const input = screen.getByDisplayValue('John Smith Deal')

    fireEvent.change(input, { target: { value: 'Custom Deal' } })
    expect(input).toHaveValue('Custom Deal')
  })

  it('value field is optional', () => {
    render(<CreateDealForm {...defaultProps} />)
    const input = screen.getByPlaceholderText('0')
    expect(input).toHaveValue(null)
  })

  it('updates stages when pipeline changes', () => {
    render(<CreateDealForm {...defaultProps} />)
    const pipelineSelect = screen.getByLabelText(/pipeline/i)

    // Change to Partner pipeline
    fireEvent.change(pipelineSelect, { target: { value: '2' } })

    // Stage should update to first stage of Partner pipeline
    const stageSelect = screen.getByLabelText(/stage/i)
    expect(stageSelect).toHaveValue('3') // Discovery
  })

  it('Create button disabled when title is empty', () => {
    render(<CreateDealForm {...defaultProps} />)
    const input = screen.getByDisplayValue('John Smith Deal')
    const button = screen.getByRole('button', { name: /create/i })

    fireEvent.change(input, { target: { value: '' } })
    expect(button).toBeDisabled()
  })

  it('Create button enabled when all required fields valid', () => {
    render(<CreateDealForm {...defaultProps} />)
    const button = screen.getByRole('button', { name: /create/i })
    expect(button).not.toBeDisabled()
  })

  it('shows loading state when creating', async () => {
    const mockCreateDeal = vi.fn(() => new Promise(() => {})) // Never resolves
    vi.mocked(usePipedrive).mockReturnValue({
      createDeal: mockCreateDeal,
      error: null,
      isLoading: true,
    })

    render(<CreateDealForm {...defaultProps} />)
    const button = screen.getByRole('button', { name: /create/i })

    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText(/creating/i)).toBeInTheDocument()
    })
    expect(button).toBeDisabled()
  })

  it('calls onDealCreated on successful creation', async () => {
    const mockDeal = {
      id: 456,
      title: 'John Smith Deal',
      value: '$0',
      stage: { id: 1, name: 'Qualified', order: 0 },
      pipeline: { id: 1, name: 'Sales' },
      status: 'open',
    }
    const mockCreateDeal = vi.fn().mockResolvedValue(mockDeal)
    vi.mocked(usePipedrive).mockReturnValue({
      createDeal: mockCreateDeal,
      error: null,
      isLoading: false,
    })

    render(<CreateDealForm {...defaultProps} />)
    const button = screen.getByRole('button', { name: /create/i })

    fireEvent.click(button)

    await waitFor(() => {
      expect(mockOnDealCreated).toHaveBeenCalledWith(mockDeal)
    })
  })

  it('shows error banner on creation failure', async () => {
    const mockCreateDeal = vi.fn().mockResolvedValue(null)
    const mockError = { message: 'Failed to create deal', statusCode: 500 }
    vi.mocked(usePipedrive).mockReturnValue({
      createDeal: mockCreateDeal,
      error: mockError,
      isLoading: false,
    })

    render(<CreateDealForm {...defaultProps} />)
    const button = screen.getByRole('button', { name: /create/i })

    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText(/failed to create deal/i)).toBeInTheDocument()
    })
    expect(mockOnDealCreated).not.toHaveBeenCalled()
  })

  it('error banner can be dismissed', async () => {
    const mockCreateDeal = vi.fn().mockResolvedValue(null)
    const mockError = { message: 'Network error', statusCode: 500 }
    vi.mocked(usePipedrive).mockReturnValue({
      createDeal: mockCreateDeal,
      error: mockError,
      isLoading: false,
    })

    render(<CreateDealForm {...defaultProps} />)
    const button = screen.getByRole('button', { name: /create/i })

    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument()
    })

    const dismissButton = screen.getByLabelText(/dismiss error/i)
    fireEvent.click(dismissButton)

    expect(screen.queryByText(/network error/i)).not.toBeInTheDocument()
  })

  it('Cancel button calls onCancel', () => {
    render(<CreateDealForm {...defaultProps} />)
    const button = screen.getByRole('button', { name: /cancel/i })

    fireEvent.click(button)
    expect(mockOnCancel).toHaveBeenCalled()
  })

  it('sends correct data on submission', async () => {
    const mockCreateDeal = vi.fn().mockResolvedValue({
      id: 456,
      title: 'Custom Deal',
      value: '$50,000.00',
      stage: { id: 1, name: 'Qualified', order: 0 },
      pipeline: { id: 1, name: 'Sales' },
      status: 'open',
    })
    vi.mocked(usePipedrive).mockReturnValue({
      createDeal: mockCreateDeal,
      error: null,
      isLoading: false,
    })

    render(<CreateDealForm {...defaultProps} />)

    // Edit title
    const titleInput = screen.getByDisplayValue('John Smith Deal')
    fireEvent.change(titleInput, { target: { value: 'Custom Deal' } })

    // Add value
    const valueInput = screen.getByPlaceholderText('0')
    fireEvent.change(valueInput, { target: { value: '50000' } })

    // Submit
    const button = screen.getByRole('button', { name: /create/i })
    fireEvent.click(button)

    await waitFor(() => {
      expect(mockCreateDeal).toHaveBeenCalledWith({
        title: 'Custom Deal',
        personId: 123,
        pipelineId: 1,
        stageId: 1,
        value: 50000,
      })
    })
  })

  it('does not send value if empty', async () => {
    const mockCreateDeal = vi.fn().mockResolvedValue({
      id: 456,
      title: 'John Smith Deal',
      value: '$0',
      stage: { id: 1, name: 'Qualified', order: 0 },
      pipeline: { id: 1, name: 'Sales' },
      status: 'open',
    })
    vi.mocked(usePipedrive).mockReturnValue({
      createDeal: mockCreateDeal,
      error: null,
      isLoading: false,
    })

    render(<CreateDealForm {...defaultProps} />)
    const button = screen.getByRole('button', { name: /create/i })

    fireEvent.click(button)

    await waitFor(() => {
      expect(mockCreateDeal).toHaveBeenCalledWith({
        title: 'John Smith Deal',
        personId: 123,
        pipelineId: 1,
        stageId: 1,
        // value not included
      })
    })
  })
})
```

### 10.2 Integration Tests

**File:** `Extension/tests/integration/create-deal-flow.test.tsx`

```typescript
describe('Create Deal Integration', () => {
  it('full flow: open form → fill fields → create → success', async () => {
    const mockDeal = {
      id: 456,
      title: 'Integration Test Deal',
      value: '$25,000.00',
      stage: { id: 1, name: 'Qualified', order: 0 },
      pipeline: { id: 1, name: 'Sales' },
      status: 'open',
    }
    const mockCreateDeal = vi.fn().mockResolvedValue(mockDeal)
    vi.mocked(usePipedrive).mockReturnValue({
      createDeal: mockCreateDeal,
      error: null,
      isLoading: false,
    })

    const mockOnDealCreated = vi.fn()
    render(<CreateDealForm {...defaultProps} onDealCreated={mockOnDealCreated} />)

    // User edits title
    const titleInput = screen.getByDisplayValue('John Smith Deal')
    fireEvent.change(titleInput, { target: { value: 'Integration Test Deal' } })

    // User adds value
    const valueInput = screen.getByPlaceholderText('0')
    fireEvent.change(valueInput, { target: { value: '25000' } })

    // User submits
    const createButton = screen.getByRole('button', { name: /create/i })
    fireEvent.click(createButton)

    // Loading state shown
    await waitFor(() => {
      expect(screen.getByText(/creating/i)).toBeInTheDocument()
    })

    // Success callback fired
    await waitFor(() => {
      expect(mockOnDealCreated).toHaveBeenCalledWith(mockDeal)
    })
  })

  it('error flow: creation fails → error shown → retry succeeds', async () => {
    let callCount = 0
    const mockCreateDeal = vi.fn(() => {
      callCount++
      if (callCount === 1) {
        return Promise.resolve(null) // First call fails
      } else {
        return Promise.resolve({
          id: 456,
          title: 'John Smith Deal',
          value: '$0',
          stage: { id: 1, name: 'Qualified', order: 0 },
          pipeline: { id: 1, name: 'Sales' },
          status: 'open',
        })
      }
    })

    const mockError = { message: 'Network error', statusCode: 500 }
    vi.mocked(usePipedrive).mockReturnValue({
      createDeal: mockCreateDeal,
      error: callCount === 1 ? mockError : null,
      isLoading: false,
    })

    const mockOnDealCreated = vi.fn()
    render(<CreateDealForm {...defaultProps} onDealCreated={mockOnDealCreated} />)

    // First attempt
    const createButton = screen.getByRole('button', { name: /create/i })
    fireEvent.click(createButton)

    // Error appears
    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument()
    })

    // Retry
    fireEvent.click(createButton)

    // Success
    await waitFor(() => {
      expect(mockOnDealCreated).toHaveBeenCalled()
    })
  })
})
```

### 10.3 Manual Testing Checklist

**Setup:**
- [ ] Load extension in Chrome
- [ ] Authenticate with Pipedrive
- [ ] Open WhatsApp Web
- [ ] Switch to contact with matched person

**Form Display:**
- [ ] "+ Create" button visible in deals section header
- [ ] Click button → form appears
- [ ] Deal dropdown hides when form opens
- [ ] Form shows loading skeleton during pipelines/stages fetch
- [ ] Form displays with all fields after loading

**Pre-filled Values:**
- [ ] Title pre-filled with "[Person Name] Deal" pattern
- [ ] Pipeline pre-selected (default with order_nr=0)
- [ ] Stage pre-selected (first stage of default pipeline)
- [ ] Value field empty

**Field Interaction:**
- [ ] Title field is editable
- [ ] Value field accepts numeric input
- [ ] Pipeline dropdown shows all active pipelines
- [ ] Changing pipeline updates stage dropdown
- [ ] Stage dropdown shows stages for selected pipeline only
- [ ] Stage auto-selects first stage when pipeline changes

**Validation:**
- [ ] Clear title → Create button disabled (gray)
- [ ] Type 1 character → Create button enabled (green)
- [ ] Only whitespace → Create button disabled
- [ ] Valid title + selected pipeline/stage → Create button enabled

**Submission:**
- [ ] Click Create with valid data
- [ ] Button shows spinner and "Creating..." text
- [ ] All fields disabled during submission
- [ ] Cannot change values while creating

**Success Flow:**
- [ ] After ~500ms, form closes
- [ ] Deal dropdown reappears
- [ ] New deal appears in dropdown (at top of open deals)
- [ ] New deal is auto-selected
- [ ] DealDetails shows new deal
- [ ] Green toast appears: "Deal created successfully"
- [ ] Toast auto-dismisses after 5 seconds
- [ ] Verify in Pipedrive: deal exists with correct data

**Error Flow:**
- [ ] Disconnect network
- [ ] Click Create
- [ ] Red error banner appears above form
- [ ] Error message is user-friendly
- [ ] Form remains editable
- [ ] Click X on error banner → banner dismisses
- [ ] Reconnect network
- [ ] Click Create again → success flow

**Cancel Behavior:**
- [ ] Make changes to title
- [ ] Click Cancel
- [ ] Form closes immediately
- [ ] Deal dropdown reappears
- [ ] No deal created

**Edge Cases:**
- [ ] Account with 10+ pipelines → dropdown scrollable
- [ ] Account with 1 pipeline → still works
- [ ] Pipeline with 15+ stages → dropdown scrollable
- [ ] Very long deal title (100+ chars) → handled gracefully
- [ ] Value with decimals (e.g., "50000.50") → works
- [ ] Value with commas or currency symbols → handled/ignored
- [ ] Switch to different chat during creation → no errors

**Empty State:**
- [ ] Person with no deals → "+ Create" button visible in empty state
- [ ] Click button → form appears (same as when deals exist)
- [ ] Create deal → transitions to normal deals display with new deal

---

## 11. Acceptance Criteria

### 11.1 Functional Requirements

- [x] **AC-1:** "+ Create" button visible in deals section header (all states)
- [x] **AC-2:** Clicking button opens create deal form inline
- [x] **AC-3:** Form hides deal dropdown while open
- [x] **AC-4:** Form shows loading skeleton while fetching pipelines/stages
- [x] **AC-5:** Title field pre-filled with "[Person Name] Deal" pattern
- [x] **AC-6:** Title field is editable
- [x] **AC-7:** Value field is optional and accepts numeric input
- [x] **AC-8:** Pipeline dropdown pre-selects default pipeline (order_nr=0)
- [x] **AC-9:** Stage dropdown pre-selects first stage of default pipeline
- [x] **AC-10:** Changing pipeline updates stage dropdown dynamically
- [x] **AC-11:** Stage auto-selects first stage when pipeline changes
- [x] **AC-12:** Create button disabled when title empty or whitespace only
- [x] **AC-13:** Create button enabled when title valid + pipeline/stage selected
- [x] **AC-14:** Clicking Create triggers API call with correct data
- [x] **AC-15:** During creation, button shows spinner and "Creating..." text
- [x] **AC-16:** During creation, all fields are disabled
- [x] **AC-17:** On success, form closes immediately
- [x] **AC-18:** On success, new deal appears in dropdown (top of open deals)
- [x] **AC-19:** On success, new deal is auto-selected
- [x] **AC-20:** On success, green toast shown: "Deal created successfully"
- [x] **AC-21:** On error, red error banner appears above form
- [x] **AC-22:** After error, form remains open and editable
- [x] **AC-23:** Error banner is dismissible via X button
- [x] **AC-24:** Cancel button closes form immediately, discards changes
- [x] **AC-25:** Deal created in Pipedrive with correct person link
- [x] **AC-26:** Deal owner is authenticated user (automatic)
- [x] **AC-27:** Deal status is "open" (automatic)
- [x] **AC-28:** Title is trimmed before submission
- [x] **AC-29:** Value only sent if non-empty and valid number
- [x] **AC-30:** Currency not sent (Pipedrive uses account default)

### 11.2 UI/UX Requirements

- [x] **AC-31:** Form styling matches existing DealsSection design
- [x] **AC-32:** "+ Create" button styling clear and accessible
- [x] **AC-33:** Create button uses brand green when enabled
- [x] **AC-34:** Create button uses gray when disabled
- [x] **AC-35:** Error banner uses red color scheme (red-50, red-200, red-800)
- [x] **AC-36:** Loading spinner visible and animated during submission
- [x] **AC-37:** Form labels clearly identify required fields (*)
- [x] **AC-38:** All inputs have proper focus states (brand-primary ring)
- [x] **AC-39:** Toast notification matches existing pattern (green, checkmark icon)
- [x] **AC-40:** Form layout responsive within 350px sidebar width

### 11.3 Technical Requirements

- [x] **AC-41:** Uses config endpoint to get pipelines/stages
- [x] **AC-42:** Pipelines/stages fetched on sidebar init, cached for session
- [x] **AC-43:** Creates deal via `POST /api/pipedrive/deals`
- [x] **AC-44:** Backend returns enriched deal (stage/pipeline metadata)
- [x] **AC-45:** Extension stores pipelines/stages in App state
- [x] **AC-46:** CreateDealForm receives pipelines/stages as props
- [x] **AC-47:** Form filters stages by pipelineId locally
- [x] **AC-48:** Uses existing ToastContext for success message
- [x] **AC-49:** Uses existing usePipedrive hook pattern
- [x] **AC-50:** Type definitions added for all new interfaces
- [x] **AC-51:** Service worker handles PIPEDRIVE_CREATE_DEAL message
- [x] **AC-52:** Test coverage ≥80% for CreateDealForm
- [x] **AC-53:** No console errors during normal operation
- [x] **AC-54:** Proper error logging to Sentry (production)

---

## 12. Implementation Plan

### Phase 1: Backend - Config Endpoint Enhancement
**Tasks:**
1. Update `PipedrivePipeline` model to include `OrderNr` and `Active` properties
2. Update `GetConfigFunction.cs` to inject `IPipedriveApiClient`
3. Fetch pipelines and stages in config endpoint
4. Include pipelines/stages in config response
5. Test config endpoint with curl

**Files Modified:**
- `Backend/WhatsApp2Pipe.Api/Models/PipedriveModels.cs`
- `Backend/WhatsApp2Pipe.Api/Functions/GetConfigFunction.cs`

**Estimated Time:** 1 hour

---

### Phase 2: Backend - Create Deal Endpoint
**Tasks:**
6. Create `CreateDealFunction.cs` (new Azure Function)
7. Implement session validation
8. Call Pipedrive POST /v1/deals API
9. Enrich response with stage/pipeline metadata (reuse DealTransformService logic)
10. Add error handling and logging
11. Test endpoint with curl

**Files Created:**
- `Backend/WhatsApp2Pipe.Api/Functions/CreateDealFunction.cs`

**Estimated Time:** 2 hours

---

### Phase 3: Extension - Type Definitions
**Tasks:**
12. Add `CreateDealData` interface to `deal.ts`
13. Add `Pipeline` and `Stage` interfaces (if not exist)
14. Add message types to `messages.ts` (CREATE_DEAL request/response)
15. Update union types

**Files Modified:**
- `Extension/src/types/deal.ts`
- `Extension/src/types/messages.ts`

**Estimated Time:** 30 minutes

---

### Phase 4: Extension - Service Worker Handler
**Tasks:**
16. Add `handlePipedriveCreateDeal` function to service worker
17. Add message listener for PIPEDRIVE_CREATE_DEAL
18. Test with mock data

**Files Modified:**
- `Extension/src/service-worker/index.ts`

**Estimated Time:** 45 minutes

---

### Phase 5: Extension - usePipedrive Hook
**Tasks:**
19. Add `createDeal` method to hook
20. Handle loading and error states
21. Return Deal object on success

**Files Modified:**
- `Extension/src/content-script/hooks/usePipedrive.ts`

**Estimated Time:** 30 minutes

---

### Phase 6: Extension - CreateDealForm Component
**Tasks:**
22. Create CreateDealForm.tsx component file
23. Implement form fields (title, value, pipeline, stage)
24. Implement pre-fill/pre-select logic
25. Implement pipeline change handler (updates stages)
26. Implement validation logic
27. Implement submit handler
28. Implement cancel handler
29. Add error banner
30. Add loading skeleton
31. Style form (match existing design system)

**Files Created:**
- `Extension/src/content-script/components/CreateDealForm.tsx`

**Estimated Time:** 3 hours

---

### Phase 7: Extension - DealsSection Integration
**Tasks:**
32. Add "+ Create" button to DealsSection header
33. Add `isCreatingDeal` state
34. Add conditional rendering for form vs deals display
35. Add `handleDealCreated` callback
36. Add `onDealsUpdated` prop to pass to parent
37. Test form toggle behavior

**Files Modified:**
- `Extension/src/content-script/components/DealsSection.tsx`

**Estimated Time:** 1.5 hours

---

### Phase 8: Extension - App.tsx Integration
**Tasks:**
38. Update SidebarState to include pipelines/stages
39. Fetch config on sidebar init
40. Store pipelines/stages in state
41. Pass pipelines/stages to DealsSection
42. Implement onDealsUpdated handler
43. Test full flow end-to-end

**Files Modified:**
- `Extension/src/content-script/App.tsx`

**Estimated Time:** 1 hour

---

### Phase 9: Testing - Unit Tests
**Tasks:**
44. Write validation logic tests (5 tests)
45. Write CreateDealForm component tests (20 tests)
46. Write integration tests (2 tests)
47. Verify coverage ≥80%

**Files Created:**
- `Extension/tests/unit/CreateDealForm.test.tsx`
- `Extension/tests/integration/create-deal-flow.test.tsx`

**Estimated Time:** 2 hours

---

### Phase 10: Testing - Manual Testing
**Tasks:**
48. Run through manual testing checklist
49. Test all validation scenarios
50. Test success flow end-to-end
51. Test error flow with network disconnect
52. Test edge cases (many pipelines/stages, empty states)
53. Verify deal created correctly in Pipedrive
54. Test toast notification behavior
55. Cross-browser testing

**Estimated Time:** 2 hours

---

### Phase 11: Polish & Documentation
**Tasks:**
56. Code review (self-review)
57. Verify all acceptance criteria met
58. Update CLAUDE.md if needed
59. Update BRD-002 to mark Feature 34 complete
60. Create implementation summary (optional)

**Files Modified:**
- `CLAUDE.md`
- `Docs/BRDs/BRD-002-Deals-Management.md`
- `Docs/Specs/Spec-134-Create-Deal-Flow.md` (this file - update status)

**Estimated Time:** 30 minutes

---

**Total Estimated Time:** 15-16 hours

**Implementation Order:**
- Phases 1-2: Backend (3 hours)
- Phases 3-5: Extension infrastructure (1.75 hours)
- Phases 6-8: Extension UI (5.5 hours)
- Phase 9: Unit tests (2 hours)
- Phase 10: Manual testing (2 hours)
- Phase 11: Polish & documentation (30 minutes)

---

## 13. Design Decisions & Rationale

### 13.1 Why Inline Form (Not Modal)?

**Decision:** Form appears inline within DealsSection, not in a modal dialog

**Rationale:**
- Consistent with Create Person flow (Spec-110)
- Less jarring than modal overlay
- Maintains context (user can still see chat)
- Faster interaction (no modal open/close animations)
- Simpler state management

**Tradeoff:** Takes vertical space in sidebar. Acceptable since form is temporary.

### 13.2 Why Pre-fill Title with Pattern?

**Decision:** Pre-fill title with "[Person Name] Deal" (e.g., "John Smith Deal")

**Rationale:**
- Matches BRD-002 specification
- Reduces user typing (can submit with default)
- Provides context (which person the deal is for)
- User can easily edit if needed
- Consistent pattern across all deal creations

**Example:** WhatsApp contact "John Smith" → "John Smith Deal"

### 13.3 Why Pre-select Pipeline & Stage?

**Decision:** Pre-select default pipeline (order_nr=0) and first stage

**Rationale:**
- Fastest path to deal creation (minimal clicks)
- Most users create deals in default pipeline
- First stage is usually correct starting point
- User can change if needed
- Reduces form friction significantly

**Tradeoff:** Assumes defaults are correct. Mitigated by making dropdowns editable.

### 13.4 Why Stage Dropdown (Not Expanded List)?

**Decision:** Use dropdown for stages, not expanded clickable list

**Rationale:**
- More compact (fits in 350px sidebar width)
- Consistent with pipeline dropdown pattern
- Works well with many stages (20+)
- Standard HTML select behavior (accessible)
- Less visual complexity

**Tradeoff:** Less visual than expanded list. Acceptable for standard form pattern.

### 13.5 Why No Currency Input?

**Decision:** Don't collect currency, let Pipedrive use account default

**Rationale:**
- Pipedrive applies account default automatically
- Reduces form complexity (one less field)
- Most users work in single currency
- Matches BRD-002 specification
- Can add currency picker later if needed

**Tradeoff:** Cannot create multi-currency deals. Acceptable for MVP.

### 13.6 Why Fetch Pipelines/Stages from Config?

**Decision:** Extend config endpoint to include pipelines/stages, fetch on init

**Rationale:**
- Config endpoint already called on sidebar init
- Avoids additional API call when form opens
- Data available immediately (no loading delay)
- Config endpoint is critical infrastructure (extension unusable if fails)
- Natural place for "setup" data

**Tradeoff:** Slightly larger config response. Minimal impact (~1-2KB).

### 13.7 Why Auto-select New Deal After Creation?

**Decision:** Form closes, new deal appears in dropdown and is auto-selected

**Rationale:**
- Immediate visual confirmation of success
- User sees the deal they just created
- Can verify title, value, pipeline, stage
- Consistent with Create Person flow (shows PersonMatchedCard)
- No ambiguity about success state

**Alternative Considered:** Show deal in dropdown but don't select. Rejected as less clear.

### 13.8 Why Toast Notification (Not Just Visual Update)?

**Decision:** Show green toast "Deal created successfully" in addition to visual update

**Rationale:**
- Explicit success confirmation
- Clear feedback for user
- Consistent with Create Note flow (Spec-130b)
- User might miss visual change (if not looking at dropdown)
- Standard UX pattern for async actions

**Note:** Form closing + deal appearing + toast provides triple confirmation.

### 13.9 Why Error Banner Above Form (Not Toast)?

**Decision:** Show persistent error banner above form fields

**Rationale:**
- Consistent with Create Person flow (Spec-110)
- Error needs to be read and understood (not auto-dismiss)
- User may need to fix input or retry
- Banner keeps form visible for corrections
- Dismissible when user is ready

**Tradeoff:** Takes vertical space. Acceptable since errors should be rare.

### 13.10 Why Discard Changes on Cancel (No Confirmation)?

**Decision:** Cancel button closes form immediately, no warning

**Rationale:**
- Cancel is explicit user intent (expects discard)
- Adding confirmation adds friction
- User can quickly reopen form if accidental
- Form data is minimal (easy to re-enter)
- Consistent with common form patterns

**Tradeoff:** Accidental cancels lose data. Mitigated by explicit Cancel button (hard to click accidentally).

---

## 14. Future Enhancements (Post-MVP)

### 14.1 Additional Fields

**Expected Close Date:**
- Date picker for when deal is expected to close
- Useful for pipeline forecasting
- Pipedrive field: `expected_close_date`

**Probability:**
- Percentage input for deal probability
- Useful for weighted forecasting
- Pipedrive field: `probability`

**Organization Linking:**
- Dropdown to select organization
- Link deal to both person AND organization
- Requires fetching organizations list

**Custom Fields:**
- Support configurable custom fields
- Show only fields marked "required" or "important"
- Different fields per pipeline (if configured)

### 14.2 Form Enhancements

**Remember Last Values:**
- Remember user's last-selected pipeline/stage
- Pre-select on next form open
- Stored in localStorage
- Adapts to user habits

**Deal Templates:**
- Pre-configured deal templates (e.g., "Standard Sale", "Partner Deal")
- Template includes title pattern, pipeline, stage, value
- User can create custom templates
- Quick access dropdown

**Duplicate Detection:**
- Check if similar deal exists for person
- Show warning: "Similar deal found: [Deal Title]"
- Allow user to proceed or cancel
- Prevents duplicate deals

**Validation Warnings (Not Errors):**
- Warn if value seems unusually high/low
- Warn if title is very short
- User can override warnings
- Soft guidance without blocking

### 14.3 UX Improvements

**Keyboard Shortcuts:**
- Enter to submit (when valid)
- Escape to cancel
- Tab navigation through fields
- Power user optimization

**Form Auto-save:**
- Save form state to localStorage every 5 seconds
- Restore if user closes form accidentally
- Or restore after extension crash/reload
- Prevent data loss

**Success Animation:**
- Subtle animation when form closes
- Confetti or checkmark animation
- Celebrate first deal creation
- Gamification element

**Bulk Deal Creation:**
- Create multiple deals at once
- Useful for group members or lists
- Different person per deal
- Same pipeline/stage for all

### 14.4 Performance Optimizations

**Optimistic UI:**
- Show deal in dropdown immediately (optimistic)
- If API fails, revert and show error
- Faster perceived performance
- Better UX for slow connections

**Pipeline/Stage Caching:**
- Cache pipelines/stages in localStorage
- Use cached data if config fetch fails
- Fallback for offline/error scenarios
- Improve reliability

**Form Prefetch:**
- Prefetch pipelines/stages on hover "+ Create" button
- Data ready before form opens
- Eliminates loading skeleton
- Smoother interaction

---

## 15. Known Limitations

### 15.1 Design Limitations (By Design)

**No Custom Fields:**
- Cannot set custom deal fields during creation
- Must be added later in Pipedrive
- Intentional for MVP simplicity

**No Organization Linking:**
- Deal only linked to person, not organization
- Organization can be added manually in Pipedrive
- Future enhancement

**No Multi-currency:**
- Cannot select currency (uses account default)
- Acceptable for most single-currency users
- Future enhancement for international teams

**No Deal Editing:**
- Cannot edit deal after creation
- "Open in Pipedrive" link for editing
- Spec-135+ will add editing features

### 15.2 Technical Limitations

**Client-Side Validation Only:**
- No real-time duplicate checking
- No Pipedrive custom field validation
- Backend performs final validation

**No Offline Support:**
- Requires network connection to create deal
- No queue for offline creation
- Browser extension limitation

**Session-Based Caching:**
- Pipelines/stages cached for session only
- Lost on sidebar reload
- No persistent localStorage cache (MVP)

### 15.3 Edge Cases

**Many Pipelines (20+):**
- Dropdown becomes long and harder to scan
- Still functional but less optimal UX
- Future: search/filter dropdown

**Many Stages (30+):**
- Same issue as pipelines
- Rare in practice (most pipelines have 5-10 stages)

**Inactive Pipelines:**
- Config endpoint returns active pipelines only
- User cannot create deals in inactive pipelines
- Expected behavior

**Pipeline/Stage Changes During Session:**
- If admin changes pipelines/stages in Pipedrive
- Extension shows stale cached data until reload
- Acceptable for MVP (rare scenario)

---

## 16. Open Questions

### 16.1 Resolved During Planning

- ✅ Should form be inline or modal? **Answer:** Inline
- ✅ How to pre-fill title? **Answer:** "[Person Name] Deal"
- ✅ Should pipeline/stage be pre-selected? **Answer:** Yes, default pipeline + first stage
- ✅ Where to get pipelines/stages? **Answer:** Config endpoint
- ✅ Should we validate title strictly? **Answer:** No, just non-empty
- ✅ How to show success? **Answer:** Close form + auto-select deal + toast
- ✅ How to show errors? **Answer:** Banner above form (like person creation)
- ✅ Should cancel warn about losing data? **Answer:** No, discard immediately

### 16.2 For Implementation Phase

**Deal Value Formatting:**
- Should we format value input with commas as user types?
- **Recommendation:** No formatting during input, keep it simple (HTML number input)

**Pipeline Order When Multiple Have order_nr=0:**
- What if multiple pipelines have order_nr=0? (misconfiguration)
- **Recommendation:** Use first in array, log warning

**Stage Selection After Error:**
- If user changes pipeline during error state, should error clear?
- **Recommendation:** Yes, clear error on any field change

**Config Fetch Failure Handling:**
- If config fails, should we retry automatically?
- **Note:** Moot point - config failure makes entire extension unusable (not deal-specific)

---

## 17. Security & Privacy Considerations

### 17.1 Data Handling

**Form Input Data:**
- Title: User-entered, no automatic scraping
- Value: User-entered, optional
- Pipeline/Stage: User-selected from Pipedrive data
- Person ID: From context (already matched)

**Data Transmission:**
- All data sent via HTTPS
- Authorization via verification_code (Bearer token)
- No local storage of form data (ephemeral state)

**Error Messages:**
- Do not expose technical details (stack traces, API keys)
- User-friendly messages only
- Sensitive info filtered by backend

### 17.2 Authentication

**Authorization:**
- All API calls include verification_code in Authorization header
- Backend validates session before creating deal
- Invalid/expired sessions return 401

**Session Management:**
- Uses existing OAuth session from Spec-105a
- No additional authentication required
- Session stored securely in backend (Azure Table Storage)

### 17.3 Data Minimization

**Only Required Fields:**
- Title, person ID, pipeline, stage (minimum for deal creation)
- Value optional (user choice)
- No unnecessary data collected

**No Tracking:**
- No analytics or tracking of created deals
- No telemetry on form usage
- Privacy-focused design

---

## 18. References

### 18.1 Related Documents

- [BRD-002-Deals-Management.md](../BRDs/BRD-002-Deals-Management.md) - Feature 34 requirements
- [Spec-131a-Backend-Deals-API.md](Spec-131a-Backend-Deals-API.md) - Backend deals API (deployed)
- [Spec-131b-Extension-Deals-Display.md](Spec-131b-Extension-Deals-Display.md) - Deals display UI (deployed)
- [Spec-110-Create-Person-Flow.md](Spec-110-Create-Person-Flow.md) - Similar pattern reference
- [Spec-130b-Extension-Create-Note-From-Chat.md](Spec-130b-Extension-Create-Note-From-Chat.md) - Toast pattern reference
- [Chrome-Extension-Architecture.md](../Architecture/Chrome-Extension-Architecture.md) - Overall architecture
- [UI-Design-Specification.md](../Architecture/UI-Design-Specification.md) - Design system

### 18.2 External References

- [Pipedrive API - Deals Endpoint](https://developers.pipedrive.com/docs/api/v1/Deals#addDeal) - Create deal API
- [Pipedrive API - Pipelines](https://developers.pipedrive.com/docs/api/v1/Pipelines) - Pipelines API
- [Pipedrive API - Stages](https://developers.pipedrive.com/docs/api/v1/Stages) - Stages API

### 18.3 Code References

- `Extension/src/content-script/components/DealsSection.tsx` - Component to modify
- `Extension/src/content-script/hooks/usePipedrive.ts` - API hook to extend
- `Extension/src/content-script/context/ToastContext.tsx` - Toast notification system
- `Extension/src/types/deal.ts` - Deal type definitions
- `Extension/src/types/messages.ts` - Message type definitions
- `Backend/WhatsApp2Pipe.Api/Functions/GetConfigFunction.cs` - Config endpoint to extend
- `Backend/WhatsApp2Pipe.Api/Models/PipedriveModels.cs` - Model definitions

---

## 19. Glossary

**Deal:** A sales opportunity record in Pipedrive CRM

**Pipeline:** A sequence of stages representing the sales process (e.g., "Sales Pipeline", "Partner Pipeline")

**Stage:** A step in the pipeline (e.g., "Qualified", "Proposal", "Negotiation", "Won")

**Default Pipeline:** The pipeline with `order_nr = 0` in Pipedrive (used as default for new deals)

**Person ID:** The unique identifier for a contact in Pipedrive (automatically linked to deals)

**Verification Code:** Session identifier issued by backend after OAuth, used for API authentication

**Deal Owner:** The Pipedrive user assigned as responsible for the deal (defaults to authenticated user)

**Deal Value:** The monetary amount of the deal (optional field)

**Currency:** The currency for the deal value (uses account default, not selectable in MVP)

**Config Endpoint:** Backend endpoint (`GET /api/config`) that returns configuration and metadata including pipelines/stages

**Inline Form:** Form that appears within the page/component (not in a modal dialog)

**Toast Notification:** Temporary message that appears at bottom of sidebar with auto-dismiss

**Pre-fill:** Automatically populate form field with suggested value (user can edit)

**Pre-select:** Automatically select dropdown option (user can change)

---

**END OF SPEC-134**
