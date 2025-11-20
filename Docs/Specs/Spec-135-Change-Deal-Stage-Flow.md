# Spec-135: Change Deal Stage Flow

**Feature:** Feature 35 - Change Deal Stage (and Pipeline)
**Date:** 2025-01-20
**Status:** ✅ Complete
**Dependencies:**
- Spec-131a (Backend Deals API Service - deployed)
- Spec-131b (Extension Deals Display - deployed)
- Spec-134 (Create Deal Flow - deployed)

---

## 1. Overview

This specification defines the Change Deal Stage (and Pipeline) functionality that enables users to move deals through their sales pipeline directly from the WhatsApp sidebar. Users can change both the pipeline and stage of open deals, with changes saved via explicit Save/Cancel buttons.

### 1.1 Scope

**In Scope:**
- Editable pipeline dropdown for open deals
- Editable stage dropdown for open deals (dynamically filtered by selected pipeline)
- Save/Cancel buttons that appear when user makes changes
- Dynamic stage dropdown update when pipeline changes
- Auto-selection of first stage when pipeline changes
- Form validation (pipeline and stage required)
- Loading state during save operation
- Success feedback via toast notification
- Error handling with inline error banner
- Read-only display for won/lost deals (no editing)
- Integration with existing DealTransformService for response enrichment

**Out of Scope:**
- Editing other deal fields (title, value, owner, etc.) - covered by future specs
- Expected close date or probability fields
- Custom fields
- Deal deletion
- Stage-specific required field validation (Pipedrive enforces this)
- Undo/redo functionality
- Bulk deal updates
- Deal history/audit trail display

### 1.2 User Flow

```
User viewing open deal in DealDetails component
    ↓
Pipeline and Stage displayed as dropdowns (always enabled)
    ↓
User changes pipeline dropdown
    ↓
Stage dropdown automatically updates to show stages from new pipeline
First stage of new pipeline auto-selects
Save/Cancel buttons appear below stage dropdown
    ↓
[Alternative: User changes stage dropdown only]
Save/Cancel buttons appear below stage dropdown
    ↓
User clicks "Save" button
    ↓
Button shows "Saving..." with spinner
Both dropdowns disabled during save
    ↓
API call to backend: PUT /api/pipedrive/deals/{dealId}
    ↓
    ├─→ Success:
    │     - Save/Cancel buttons hide
    │     - Dropdowns remain enabled with new values
    │     - Green toast: "Deal updated successfully"
    │     - Deal dropdown in DealsSection updates (if needed)
    │
    └─→ Error:
          - Error banner appears above deal title
          - Dropdowns remain in changed state (enabled)
          - Save/Cancel buttons remain visible
          - User can dismiss error or retry
```

---

## 2. Objectives

- Enable users to move deals through pipeline stages without leaving WhatsApp
- Support both pipeline and stage changes in a single operation
- Provide clear visual feedback for editable vs non-editable deals (open vs won/lost)
- Implement dynamic UI updates when pipeline changes (stage dropdown updates)
- Validate changes client-side before submission
- Handle errors gracefully with clear recovery path
- Maintain consistency with existing Create Deal and Person flows
- Ensure saved changes are reflected in both DealDetails and DealsSection
- Provide clear success feedback via toast notification

---

## 3. Component Specifications

### 3.1 Update DealDetails Component

**File:** `Extension/src/content-script/components/DealDetails.tsx`

**Updated Props Interface:**
```typescript
interface DealDetailsProps {
  deal: Deal
  pipelines: Pipeline[]       // NEW: Needed for pipeline dropdown
  stages: Stage[]             // NEW: Needed for stage dropdown
  onDealUpdated?: (updatedDeal: Deal) => void  // NEW: Callback when deal saved
}
```

**Component State:**
```typescript
// Editing state
const [selectedPipelineId, setSelectedPipelineId] = useState(deal.pipeline.id)
const [selectedStageId, setSelectedStageId] = useState(deal.stage.id)
const [isSaving, setIsSaving] = useState(false)
const [error, setError] = useState<string | null>(null)

// Track original values for cancel and change detection
const originalPipelineId = useRef(deal.pipeline.id)
const originalStageId = useRef(deal.stage.id)

// Update refs when deal prop changes (after successful save)
useEffect(() => {
  originalPipelineId.current = deal.pipeline.id
  originalStageId.current = deal.stage.id
  setSelectedPipelineId(deal.pipeline.id)
  setSelectedStageId(deal.stage.id)
}, [deal.pipeline.id, deal.stage.id])
```

**Computed Values:**
```typescript
// Get stages for currently selected pipeline
const currentStages = useMemo(() => {
  return stages
    .filter(s => s.pipelineId === selectedPipelineId)
    .sort((a, b) => a.orderNr - b.orderNr)
}, [stages, selectedPipelineId])

// Check if user made changes
const hasChanges =
  selectedPipelineId !== originalPipelineId.current ||
  selectedStageId !== originalStageId.current

// Check if deal is editable (only open deals)
const isEditable = deal.status === 'open'
```

**Key Behaviors:**
- Pipeline and stage shown as dropdowns for open deals, read-only text for won/lost deals
- Save/Cancel buttons only appear when `hasChanges === true`
- When pipeline changes, stage dropdown updates and first stage auto-selects
- useEffect updates original values when deal prop changes (after parent updates from save)

### 3.2 Component Layout Structure

**For Open Deals (isEditable === true):**

```tsx
<div className="p-3 bg-white rounded-lg border border-border-secondary shadow-sm space-y-2">
  {/* Error Banner (if error) */}
  {error && (
    <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
      <div className="flex-1 text-sm text-red-800">{error}</div>
      <button
        onClick={() => setError(null)}
        aria-label="Dismiss error"
        className="hover:bg-red-100 rounded p-0.5"
      >
        <X className="w-4 h-4 text-red-600" />
      </button>
    </div>
  )}

  {/* Deal Title */}
  <div className="text-base font-semibold text-text-primary">
    {deal.title}
  </div>

  {/* Value */}
  <div className="text-sm text-text-secondary">
    <span className="font-medium">Value:</span> {deal.value}
  </div>

  {/* Pipeline Dropdown */}
  <div>
    <label className="block text-xs font-medium text-text-secondary mb-1">
      Pipeline
    </label>
    <select
      value={selectedPipelineId}
      onChange={handlePipelineChange}
      disabled={isSaving}
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
      Stage
    </label>
    <select
      value={selectedStageId}
      onChange={(e) => {
        setSelectedStageId(Number(e.target.value))
        setError(null) // Clear error on change
      }}
      disabled={isSaving}
      className="w-full px-3 py-2 border border-border-secondary rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary disabled:bg-gray-50 disabled:text-gray-500"
    >
      {currentStages.map(stage => (
        <option key={stage.id} value={stage.id}>
          {stage.name}
        </option>
      ))}
    </select>
  </div>

  {/* Save/Cancel Buttons (only if hasChanges) */}
  {hasChanges && (
    <div className="flex gap-2 pt-2">
      <button
        onClick={handleCancel}
        disabled={isSaving}
        className="flex-1 px-4 py-2 border border-border-secondary text-text-primary text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Cancel
      </button>
      <button
        onClick={handleSave}
        disabled={isSaving}
        className="flex-1 px-4 py-2 bg-brand-primary text-white text-sm font-medium rounded-lg hover:bg-brand-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSaving ? (
          <span className="flex items-center justify-center gap-2">
            <Spinner size="sm" color="white" />
            Saving...
          </span>
        ) : (
          'Save'
        )}
      </button>
    </div>
  )}
</div>
```

**For Won/Lost Deals (isEditable === false):**

```tsx
<div className="p-3 bg-white rounded-lg border border-border-secondary shadow-sm space-y-2">
  {/* Deal Title */}
  <div className="text-base font-semibold text-text-primary">
    {deal.title}
  </div>

  {/* Value */}
  <div className="text-sm text-text-secondary">
    <span className="font-medium">Value:</span> {deal.value}
  </div>

  {/* Pipeline (read-only text) */}
  <div className="text-sm text-text-secondary">
    <span className="font-medium">Pipeline:</span> {deal.pipeline.name}
  </div>

  {/* Stage (read-only text) */}
  <div className="text-sm text-text-secondary">
    <span className="font-medium">Stage:</span> {deal.stage.name}
  </div>
</div>
```

---

## 4. Handler Functions

### 4.1 Pipeline Change Handler

```typescript
const handlePipelineChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  const newPipelineId = Number(e.target.value)
  setSelectedPipelineId(newPipelineId)

  // Clear any existing error
  setError(null)

  // Update stages dropdown to show stages from new pipeline
  const newStages = stages
    .filter(s => s.pipelineId === newPipelineId)
    .sort((a, b) => a.orderNr - b.orderNr)

  // Auto-select first stage of new pipeline
  if (newStages.length > 0) {
    setSelectedStageId(newStages[0].id)
  } else {
    // Edge case: pipeline has no stages (shouldn't happen in practice)
    logger.warn('[DealDetails] Pipeline has no stages:', newPipelineId)
    setSelectedStageId(0)
  }
}
```

**Behavior:**
- Updates pipeline state
- Clears any existing error
- Filters stages by new pipeline ID
- Sorts stages by order number
- Auto-selects first stage
- Logs warning if pipeline has no stages

### 4.2 Save Handler

```typescript
const { updateDeal } = usePipedrive()
const { showToast } = useToast()

const handleSave = async () => {
  // Prevent double submission
  if (isSaving) return

  // Clear previous error
  setError(null)

  // Set loading state
  setIsSaving(true)

  try {
    // Call API via usePipedrive hook
    const updatedDeal = await updateDeal(deal.id, {
      pipelineId: selectedPipelineId,
      stageId: selectedStageId
    })

    if (updatedDeal) {
      // Success: show toast
      showToast('Deal updated successfully')

      // Notify parent to update deals array
      onDealUpdated?.(updatedDeal)

      // Note: Component will re-render with new deal prop from parent
      // useEffect will update originalPipelineId and originalStageId refs
    } else {
      // API returned null (error handled by hook)
      const errorMessage = 'Failed to update deal. Please try again.'
      setError(errorMessage)
    }
  } catch (err) {
    // Unexpected error
    const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.'
    setError(errorMessage)
    logError('Failed to update deal', err, { dealId: deal.id })
  } finally {
    setIsSaving(false)
  }
}
```

**Behavior:**
- Prevents double submission via `isSaving` check
- Clears previous error state
- Sets loading state (disables dropdowns, shows spinner)
- Calls `updateDeal` from usePipedrive hook
- On success:
  - Shows success toast
  - Calls `onDealUpdated` callback to update parent
  - Component re-renders with new deal prop
  - useEffect updates original values
- On error:
  - Sets error message
  - Logs error to Sentry (production)
  - Keeps dropdowns in changed state for retry
- Always clears loading state in finally block

### 4.3 Cancel Handler

```typescript
const handleCancel = () => {
  // Revert to original values
  setSelectedPipelineId(originalPipelineId.current)
  setSelectedStageId(originalStageId.current)

  // Clear any error
  setError(null)
}
```

**Behavior:**
- Reverts pipeline dropdown to original value
- Reverts stage dropdown to original value
- Clears error state
- Save/Cancel buttons automatically hide (hasChanges becomes false)

---

## 5. Parent Integration

### 5.1 DealsSection Component Updates

**File:** `Extension/src/content-script/components/DealsSection.tsx`

**Pass Props to DealDetails:**
```tsx
{selectedDealId && selectedDeal && (
  <DealDetails
    deal={selectedDeal}
    pipelines={pipelines}      // NEW: Pass pipelines array
    stages={stages}            // NEW: Pass stages array
    onDealUpdated={handleDealUpdated}  // NEW: Handle updates
  />
)}
```

**Handle Deal Update Callback:**
```typescript
const handleDealUpdated = (updatedDeal: Deal) => {
  // Update deals array with new deal data
  const updatedDeals = deals.map(d =>
    d.id === updatedDeal.id ? updatedDeal : d
  )

  // Update local state
  setDeals(updatedDeals)

  // Notify parent (App.tsx) to update its state
  onDealsUpdated?.(updatedDeals)
}
```

**Note:** `onDealsUpdated` callback already exists in DealsSection from Spec-134 (Create Deal). We reuse this pattern.

### 5.2 App.tsx Integration

**File:** `Extension/src/content-script/App.tsx`

**No changes needed** - App.tsx already:
- Stores `pipelines` and `stages` in `person-matched` state (from Spec-134)
- Passes them to DealsSection as props
- Has `onDealsUpdated` handler that updates state

**Existing implementation (from Spec-134):**
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
        pipelines={state.pipelines}
        stages={state.stages}
        onRetry={handlePersonLookup}
        onDealsUpdated={(updatedDeals) => {
          setState(prev => ({ ...prev, deals: updatedDeals }))
        }}
      />
    </>
  )
```

---

## 6. API Integration

### 6.1 Backend Endpoint (New)

**Endpoint:** `PUT /api/pipedrive/deals/{dealId}`

**Request:**
```http
PUT /api/pipedrive/deals/456
Authorization: Bearer {verification_code}
Content-Type: application/json

{
  "pipelineId": 2,
  "stageId": 5
}
```

**Success Response (200 OK):**
```json
{
  "id": 456,
  "title": "Website Redesign Project",
  "value": "$50,000.00",
  "stage": {
    "id": 5,
    "name": "Negotiation",
    "order": 3
  },
  "pipeline": {
    "id": 2,
    "name": "Enterprise Pipeline"
  },
  "status": "open"
}
```

**Error Responses:**
- 400 Bad Request - Missing or invalid `pipelineId` or `stageId`
- 401 Unauthorized - Invalid `verification_code` or session expired
- 404 Not Found - Deal ID does not exist
- 429 Too Many Requests - Rate limit exceeded
- 500 Internal Server Error - Pipedrive API error

### 6.2 Backend Implementation

**New Azure Function:**

**File:** `Backend/WhatsApp2Pipe.Api/Functions/UpdateDealFunction.cs`

```csharp
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using System.Text.Json.Serialization;
using WhatsApp2Pipe.Api.Services;
using WhatsApp2Pipe.Api.Models;

namespace WhatsApp2Pipe.Api.Functions;

public class UpdateDealFunction
{
    private readonly ISessionService sessionService;
    private readonly IPipedriveApiClient pipedriveApiClient;
    private readonly DealTransformService dealTransformService;
    private readonly HttpRequestLogger httpRequestLogger;
    private readonly ILogger<UpdateDealFunction> logger;

    public UpdateDealFunction(
        ISessionService sessionService,
        IPipedriveApiClient pipedriveApiClient,
        DealTransformService dealTransformService,
        HttpRequestLogger httpRequestLogger,
        ILogger<UpdateDealFunction> logger)
    {
        this.sessionService = sessionService;
        this.pipedriveApiClient = pipedriveApiClient;
        this.dealTransformService = dealTransformService;
        this.httpRequestLogger = httpRequestLogger;
        this.logger = logger;
    }

    [Function("UpdateDealFunction")]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Anonymous, "put", Route = "pipedrive/deals/{dealId}")]
        HttpRequestData req,
        int dealId)
    {
        await httpRequestLogger.LogRequestAsync(req);

        // Validate session
        var verificationCode = req.Headers.GetValues("Authorization")
            .FirstOrDefault()?.Replace("Bearer ", "");

        if (string.IsNullOrEmpty(verificationCode))
        {
            var unauthorizedResponse = req.CreateResponse(System.Net.HttpStatusCode.Unauthorized);
            await unauthorizedResponse.WriteAsJsonAsync(new { error = "Authorization header required" });
            httpRequestLogger.LogResponse("UpdateDealFunction", 401);
            return unauthorizedResponse;
        }

        var session = await sessionService.GetSessionByVerificationCodeAsync(verificationCode);
        if (session == null)
        {
            var unauthorizedResponse = req.CreateResponse(System.Net.HttpStatusCode.Unauthorized);
            await unauthorizedResponse.WriteAsJsonAsync(new { error = "Invalid or expired verification code" });
            httpRequestLogger.LogResponse("UpdateDealFunction", 401);
            return unauthorizedResponse;
        }

        try
        {
            // Parse request body
            var updateData = await req.ReadFromJsonAsync<UpdateDealRequest>();
            if (updateData == null)
            {
                var badRequestResponse = req.CreateResponse(System.Net.HttpStatusCode.BadRequest);
                await badRequestResponse.WriteAsJsonAsync(new { error = "Request body is required" });
                httpRequestLogger.LogResponse("UpdateDealFunction", 400);
                return badRequestResponse;
            }

            // Validate required fields
            if (updateData.PipelineId <= 0 || updateData.StageId <= 0)
            {
                var badRequestResponse = req.CreateResponse(System.Net.HttpStatusCode.BadRequest);
                await badRequestResponse.WriteAsJsonAsync(new { error = "pipelineId and stageId are required and must be positive integers" });
                httpRequestLogger.LogResponse("UpdateDealFunction", 400);
                return badRequestResponse;
            }

            logger.LogInformation(
                "Updating deal {DealId} to stage {StageId} (pipeline {PipelineId})",
                dealId, updateData.StageId, updateData.PipelineId
            );

            // Update deal via Pipedrive API
            // Note: Pipedrive automatically updates pipeline when stage belongs to different pipeline
            var updatedPipedriveDeal = await pipedriveApiClient.UpdateDealAsync(
                session,
                dealId,
                updateData.StageId
            );

            // Fetch stages and pipelines for enrichment
            var stagesResponse = await pipedriveApiClient.GetStagesAsync(session);
            var pipelinesResponse = await pipedriveApiClient.GetPipelinesAsync(session);

            // Transform single deal with enrichment
            var transformedDeals = dealTransformService.TransformDeals(
                new[] { updatedPipedriveDeal },
                stagesResponse.Data ?? Array.Empty<PipedriveStage>(),
                pipelinesResponse.Data ?? Array.Empty<PipedrivePipeline>()
            );

            if (transformedDeals.Count == 0)
            {
                logger.LogError("Failed to transform updated deal {DealId}", dealId);
                var errorResponse = req.CreateResponse(System.Net.HttpStatusCode.InternalServerError);
                await errorResponse.WriteAsJsonAsync(new { error = "Failed to transform deal data" });
                httpRequestLogger.LogResponse("UpdateDealFunction", 500);
                return errorResponse;
            }

            var transformedDeal = transformedDeals[0];

            logger.LogInformation(
                "Deal {DealId} updated successfully: stage={StageName}, pipeline={PipelineName}",
                dealId, transformedDeal.Stage.Name, transformedDeal.Pipeline.Name
            );

            var response = req.CreateResponse(System.Net.HttpStatusCode.OK);
            await response.WriteAsJsonAsync(transformedDeal);
            httpRequestLogger.LogResponse("UpdateDealFunction", 200, transformedDeal);
            return response;
        }
        catch (PipedriveNotFoundException ex)
        {
            logger.LogWarning(ex, "Deal {DealId} not found", dealId);
            var notFoundResponse = req.CreateResponse(System.Net.HttpStatusCode.NotFound);
            await notFoundResponse.WriteAsJsonAsync(new { error = $"Deal {dealId} not found" });
            httpRequestLogger.LogResponse("UpdateDealFunction", 404);
            return notFoundResponse;
        }
        catch (PipedriveUnauthorizedException ex)
        {
            logger.LogError(ex, "Pipedrive authentication failed for deal {DealId}", dealId);
            var unauthorizedResponse = req.CreateResponse(System.Net.HttpStatusCode.Unauthorized);
            await unauthorizedResponse.WriteAsJsonAsync(new { error = "Pipedrive authentication failed" });
            httpRequestLogger.LogResponse("UpdateDealFunction", 401);
            return unauthorizedResponse;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error updating deal {DealId}", dealId);
            var errorResponse = req.CreateResponse(System.Net.HttpStatusCode.InternalServerError);
            await errorResponse.WriteAsJsonAsync(new { error = "Internal server error" });
            httpRequestLogger.LogResponse("UpdateDealFunction", 500);
            return errorResponse;
        }
    }
}

public class UpdateDealRequest
{
    [JsonPropertyName("pipelineId")]
    public int PipelineId { get; set; }

    [JsonPropertyName("stageId")]
    public int StageId { get; set; }
}
```

### 6.3 Update PipedriveApiClient

**Add Interface Method:**

**File:** `Backend/WhatsApp2Pipe.Api/Services/IPipedriveApiClient.cs`

```csharp
/// <summary>
/// Update deal stage (and implicitly pipeline via stage's pipeline_id)
/// </summary>
Task<PipedriveDeal> UpdateDealAsync(Session session, int dealId, int stageId);
```

**Implement Method:**

**File:** `Backend/WhatsApp2Pipe.Api/Services/PipedriveApiClient.cs`

```csharp
public async Task<PipedriveDeal> UpdateDealAsync(Session session, int dealId, int stageId)
{
    var url = $"https://api.pipedrive.com/v1/deals/{dealId}";
    var body = new { stage_id = stageId };

    var response = await SendPipedriveRequestAsync<PipedriveDealSingleResponse>(
        session,
        HttpMethod.Put,
        url,
        body
    );

    if (response.Data == null)
    {
        throw new PipedriveNotFoundException($"Deal {dealId} not found");
    }

    return response.Data;
}
```

**Add Response Model:**

**File:** `Backend/WhatsApp2Pipe.Api/Models/PipedriveModels.cs`

```csharp
/// <summary>
/// Pipedrive single deal response (for PUT /v1/deals/{id})
/// </summary>
public class PipedriveDealSingleResponse
{
    [JsonPropertyName("success")]
    public bool Success { get; set; }

    [JsonPropertyName("data")]
    public PipedriveDeal? Data { get; set; }
}

/// <summary>
/// Exception thrown when Pipedrive resource not found (404)
/// </summary>
public class PipedriveNotFoundException : Exception
{
    public PipedriveNotFoundException(string message) : base(message) { }
}
```

**Update SendPipedriveRequestAsync to handle 404:**

```csharp
// In PipedriveApiClient.cs, inside SendPipedriveRequestAsync method:

if (response.StatusCode == System.Net.HttpStatusCode.NotFound)
{
    throw new PipedriveNotFoundException("Resource not found");
}
```

### 6.4 Extension Service Worker Handler

**File:** `Extension/src/service-worker/index.ts`

```typescript
async function handlePipedriveUpdateDeal(
  dealId: number,
  data: UpdateDealData
): Promise<PipedriveResponse> {
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
      `${BACKEND_URL}/api/pipedrive/deals/${dealId}`,
      {
        method: 'PUT',
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
      type: 'PIPEDRIVE_UPDATE_DEAL_SUCCESS',
      deal,
    }
  } catch (error) {
    return {
      type: 'PIPEDRIVE_ERROR',
      error: error instanceof Error ? error.message : 'Failed to update deal',
      statusCode: 500,
    }
  }
}

// Add to message handler
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // ... existing handlers

  if (message.type === 'PIPEDRIVE_UPDATE_DEAL') {
    handlePipedriveUpdateDeal(message.dealId, message.data).then(sendResponse)
    return true
  }

  // ... rest of handlers
})
```

### 6.5 Extension usePipedrive Hook

**File:** `Extension/src/content-script/hooks/usePipedrive.ts`

```typescript
/**
 * Update deal pipeline and/or stage
 */
const updateDeal = async (
  dealId: number,
  data: UpdateDealData
): Promise<Deal | null> => {
  setIsLoading(true)
  setError(null)

  try {
    const response = await sendMessage<PipedriveResponse>({
      type: 'PIPEDRIVE_UPDATE_DEAL',
      dealId,
      data,
    })

    if (response.type === 'PIPEDRIVE_UPDATE_DEAL_SUCCESS') {
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
    const errorMessage = err instanceof Error ? err.message : 'Failed to update deal'
    setError({ message: errorMessage, statusCode: 500 })
    return null
  } finally {
    setIsLoading(false)
  }
}

// Export in return object
return {
  // ... existing exports
  updateDeal,
}
```

---

## 7. Type Definitions

### 7.1 New Types in deal.ts

**File:** `Extension/src/types/deal.ts`

```typescript
export interface UpdateDealData {
  pipelineId: number
  stageId: number
}

// Pipeline and Stage interfaces already exist from Spec-134
// Included here for reference:

export interface Pipeline {
  id: number
  name: string
  orderNr: number
  active: boolean
}

export interface Stage {
  id: number
  name: string
  orderNr: number
  pipelineId: number
}
```

### 7.2 Update Message Types

**File:** `Extension/src/types/messages.ts`

```typescript
// Request: Update deal pipeline/stage
export interface PipedriveUpdateDealRequest {
  type: 'PIPEDRIVE_UPDATE_DEAL'
  dealId: number
  data: UpdateDealData
}

// Success Response
export interface PipedriveUpdateDealSuccessResponse {
  type: 'PIPEDRIVE_UPDATE_DEAL_SUCCESS'
  deal: Deal
}

// Update unions
export type PipedriveRequest =
  | PipedriveLookupByPhoneRequest
  | PipedriveSearchByNameRequest
  | PipedriveCreatePersonRequest
  | PipedriveAttachPhoneRequest
  | PipedriveCreateNoteRequest
  | PipedriveCreateDealRequest
  | PipedriveUpdateDealRequest  // NEW

export type PipedriveResponse =
  | PipedriveLookupSuccessResponse
  | PipedriveSearchSuccessResponse
  | PipedriveCreateSuccessResponse
  | PipedriveAttachSuccessResponse
  | PipedriveCreateNoteSuccessResponse
  | PipedriveCreateNoteErrorResponse
  | PipedriveCreateDealSuccessResponse
  | PipedriveUpdateDealSuccessResponse  // NEW
  | PipedriveErrorResponse
```

---

## 8. UI/UX Specifications

### 8.1 Visual Design

**Design Principles:**
- Match existing DealsSection and DealDetails styling
- Consistent with Create Deal form patterns
- Clear distinction between editable (open) and read-only (won/lost) deals
- Familiar dropdown styling (matches deal selector and create deal form)

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
- Disabled gray (bg): `bg-gray-50`
- Disabled gray (text): `text-gray-500`

### 8.2 Button States

**Save Button - Enabled:**
```css
bg-brand-primary text-white hover:bg-brand-hover cursor-pointer
```

**Save Button - Disabled (while saving):**
```css
bg-brand-primary text-white opacity-50 cursor-not-allowed
```

**Save Button - Loading:**
```css
bg-brand-primary text-white
// Content: <Spinner /> + "Saving..."
```

**Cancel Button - Enabled:**
```css
border border-border-secondary text-text-primary hover:bg-gray-50
```

**Cancel Button - Disabled (while saving):**
```css
border border-border-secondary text-text-primary opacity-50 cursor-not-allowed
```

### 8.3 Dropdown States

**Normal (enabled):**
```css
border-border-secondary bg-white text-text-primary
focus:ring-2 focus:ring-brand-primary
```

**Disabled (during save):**
```css
bg-gray-50 text-gray-500 cursor-not-allowed
```

### 8.4 Layout Spacing

**Vertical Spacing:**
- Card padding: `p-3`
- Between fields: `space-y-2`
- Label margin: `mb-1`
- Buttons top padding: `pt-2`

**Horizontal Spacing:**
- Dropdown padding: `px-3 py-2`
- Button padding: `px-4 py-2`
- Button gap: `gap-2`

---

## 9. Testing Strategy

### 9.1 Unit Tests

**File:** `Extension/tests/unit/DealDetails.test.tsx`

**Component Rendering Tests:**
```typescript
describe('DealDetails - Open Deal', () => {
  const mockOpenDeal: Deal = {
    id: 456,
    title: 'Test Deal',
    value: '$50,000.00',
    stage: { id: 1, name: 'Qualified', order: 0 },
    pipeline: { id: 1, name: 'Sales Pipeline' },
    status: 'open',
  }

  const mockPipelines: Pipeline[] = [
    { id: 1, name: 'Sales Pipeline', orderNr: 0, active: true },
    { id: 2, name: 'Partner Pipeline', orderNr: 1, active: true },
  ]

  const mockStages: Stage[] = [
    { id: 1, name: 'Qualified', orderNr: 0, pipelineId: 1 },
    { id: 2, name: 'Contact Made', orderNr: 1, pipelineId: 1 },
    { id: 3, name: 'Discovery', orderNr: 0, pipelineId: 2 },
  ]

  it('renders pipeline as dropdown for open deal', () => {
    render(<DealDetails deal={mockOpenDeal} pipelines={mockPipelines} stages={mockStages} />)
    const select = screen.getByLabelText(/pipeline/i)
    expect(select).toBeInTheDocument()
    expect(select.tagName).toBe('SELECT')
  })

  it('renders stage as dropdown for open deal', () => {
    render(<DealDetails deal={mockOpenDeal} pipelines={mockPipelines} stages={mockStages} />)
    const select = screen.getByLabelText(/stage/i)
    expect(select).toBeInTheDocument()
    expect(select.tagName).toBe('SELECT')
  })

  it('pre-selects current pipeline in dropdown', () => {
    render(<DealDetails deal={mockOpenDeal} pipelines={mockPipelines} stages={mockStages} />)
    const select = screen.getByLabelText(/pipeline/i) as HTMLSelectElement
    expect(select.value).toBe('1')
  })

  it('pre-selects current stage in dropdown', () => {
    render(<DealDetails deal={mockOpenDeal} pipelines={mockPipelines} stages={mockStages} />)
    const select = screen.getByLabelText(/stage/i) as HTMLSelectElement
    expect(select.value).toBe('1')
  })

  it('does not show Save/Cancel buttons initially', () => {
    render(<DealDetails deal={mockOpenDeal} pipelines={mockPipelines} stages={mockStages} />)
    expect(screen.queryByRole('button', { name: /save/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /cancel/i })).not.toBeInTheDocument()
  })

  it('shows Save/Cancel buttons when stage changes', () => {
    render(<DealDetails deal={mockOpenDeal} pipelines={mockPipelines} stages={mockStages} />)
    const stageSelect = screen.getByLabelText(/stage/i)

    fireEvent.change(stageSelect, { target: { value: '2' } })

    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
  })

  it('shows Save/Cancel buttons when pipeline changes', () => {
    render(<DealDetails deal={mockOpenDeal} pipelines={mockPipelines} stages={mockStages} />)
    const pipelineSelect = screen.getByLabelText(/pipeline/i)

    fireEvent.change(pipelineSelect, { target: { value: '2' } })

    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
  })

  it('updates stage dropdown when pipeline changes', () => {
    render(<DealDetails deal={mockOpenDeal} pipelines={mockPipelines} stages={mockStages} />)
    const pipelineSelect = screen.getByLabelText(/pipeline/i)
    const stageSelect = screen.getByLabelText(/stage/i) as HTMLSelectElement

    // Initially shows stages from pipeline 1
    expect(stageSelect.options.length).toBe(2) // Qualified, Contact Made

    // Change to pipeline 2
    fireEvent.change(pipelineSelect, { target: { value: '2' } })

    // Now shows stages from pipeline 2
    expect(stageSelect.options.length).toBe(1) // Discovery
    expect(stageSelect.value).toBe('3') // Auto-selected first stage
  })

  it('reverts to original values when Cancel clicked', () => {
    render(<DealDetails deal={mockOpenDeal} pipelines={mockPipelines} stages={mockStages} />)
    const stageSelect = screen.getByLabelText(/stage/i) as HTMLSelectElement

    // Change stage
    fireEvent.change(stageSelect, { target: { value: '2' } })
    expect(stageSelect.value).toBe('2')

    // Click Cancel
    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    fireEvent.click(cancelButton)

    // Reverted to original
    expect(stageSelect.value).toBe('1')
    expect(screen.queryByRole('button', { name: /save/i })).not.toBeInTheDocument()
  })

  it('calls updateDeal when Save clicked', async () => {
    const mockUpdateDeal = vi.fn().mockResolvedValue(mockOpenDeal)
    vi.mocked(usePipedrive).mockReturnValue({
      updateDeal: mockUpdateDeal,
      error: null,
      isLoading: false,
    })

    render(<DealDetails deal={mockOpenDeal} pipelines={mockPipelines} stages={mockStages} />)

    // Change stage
    const stageSelect = screen.getByLabelText(/stage/i)
    fireEvent.change(stageSelect, { target: { value: '2' } })

    // Click Save
    const saveButton = screen.getByRole('button', { name: /save/i })
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(mockUpdateDeal).toHaveBeenCalledWith(456, {
        pipelineId: 1,
        stageId: 2
      })
    })
  })

  it('shows loading state when saving', async () => {
    const mockUpdateDeal = vi.fn(() => new Promise(() => {})) // Never resolves
    vi.mocked(usePipedrive).mockReturnValue({
      updateDeal: mockUpdateDeal,
      error: null,
      isLoading: true,
    })

    render(<DealDetails deal={mockOpenDeal} pipelines={mockPipelines} stages={mockStages} />)

    // Change and save
    const stageSelect = screen.getByLabelText(/stage/i)
    fireEvent.change(stageSelect, { target: { value: '2' } })

    const saveButton = screen.getByRole('button', { name: /save/i })
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(screen.getByText(/saving/i)).toBeInTheDocument()
    })

    // Dropdowns disabled
    expect(screen.getByLabelText(/pipeline/i)).toBeDisabled()
    expect(screen.getByLabelText(/stage/i)).toBeDisabled()
  })

  it('shows error banner on save failure', async () => {
    const mockUpdateDeal = vi.fn().mockResolvedValue(null)
    const mockError = { message: 'Network error', statusCode: 500 }
    vi.mocked(usePipedrive).mockReturnValue({
      updateDeal: mockUpdateDeal,
      error: mockError,
      isLoading: false,
    })

    render(<DealDetails deal={mockOpenDeal} pipelines={mockPipelines} stages={mockStages} />)

    // Change and save
    const stageSelect = screen.getByLabelText(/stage/i)
    fireEvent.change(stageSelect, { target: { value: '2' } })

    const saveButton = screen.getByRole('button', { name: /save/i })
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(screen.getByText(/failed to update deal/i)).toBeInTheDocument()
    })

    // Save/Cancel buttons still visible
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
  })

  it('error banner can be dismissed', async () => {
    const mockUpdateDeal = vi.fn().mockResolvedValue(null)
    const mockError = { message: 'Network error', statusCode: 500 }
    vi.mocked(usePipedrive).mockReturnValue({
      updateDeal: mockUpdateDeal,
      error: mockError,
      isLoading: false,
    })

    render(<DealDetails deal={mockOpenDeal} pipelines={mockPipelines} stages={mockStages} />)

    // Trigger error
    const stageSelect = screen.getByLabelText(/stage/i)
    fireEvent.change(stageSelect, { target: { value: '2' } })
    const saveButton = screen.getByRole('button', { name: /save/i })
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(screen.getByText(/failed to update deal/i)).toBeInTheDocument()
    })

    // Dismiss error
    const dismissButton = screen.getByLabelText(/dismiss error/i)
    fireEvent.click(dismissButton)

    expect(screen.queryByText(/failed to update deal/i)).not.toBeInTheDocument()
  })

  it('calls onDealUpdated callback on success', async () => {
    const updatedDeal = { ...mockOpenDeal, stage: { id: 2, name: 'Contact Made', order: 1 } }
    const mockUpdateDeal = vi.fn().mockResolvedValue(updatedDeal)
    const mockOnDealUpdated = vi.fn()

    vi.mocked(usePipedrive).mockReturnValue({
      updateDeal: mockUpdateDeal,
      error: null,
      isLoading: false,
    })

    render(
      <DealDetails
        deal={mockOpenDeal}
        pipelines={mockPipelines}
        stages={mockStages}
        onDealUpdated={mockOnDealUpdated}
      />
    )

    // Change and save
    const stageSelect = screen.getByLabelText(/stage/i)
    fireEvent.change(stageSelect, { target: { value: '2' } })

    const saveButton = screen.getByRole('button', { name: /save/i })
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(mockOnDealUpdated).toHaveBeenCalledWith(updatedDeal)
    })
  })
})

describe('DealDetails - Won/Lost Deal', () => {
  const mockWonDeal: Deal = {
    id: 789,
    title: 'Won Deal',
    value: '$100,000.00',
    stage: { id: 5, name: 'Won', order: 99 },
    pipeline: { id: 1, name: 'Sales Pipeline' },
    status: 'won',
  }

  it('renders pipeline as read-only text for won deal', () => {
    render(<DealDetails deal={mockWonDeal} pipelines={[]} stages={[]} />)
    expect(screen.queryByLabelText(/pipeline/i)).not.toBeInTheDocument()
    expect(screen.getByText(/pipeline:/i)).toBeInTheDocument()
    expect(screen.getByText('Sales Pipeline')).toBeInTheDocument()
  })

  it('renders stage as read-only text for won deal', () => {
    render(<DealDetails deal={mockWonDeal} pipelines={[]} stages={[]} />)
    expect(screen.queryByLabelText(/stage/i)).not.toBeInTheDocument()
    expect(screen.getByText(/stage:/i)).toBeInTheDocument()
    expect(screen.getByText('Won')).toBeInTheDocument()
  })

  it('does not show Save/Cancel buttons for won deal', () => {
    render(<DealDetails deal={mockWonDeal} pipelines={[]} stages={[]} />)
    expect(screen.queryByRole('button', { name: /save/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /cancel/i })).not.toBeInTheDocument()
  })
})
```

### 9.2 Integration Tests

**File:** `Extension/tests/integration/update-deal-flow.test.tsx`

```typescript
describe('Update Deal Integration', () => {
  it('full flow: change stage → save → success', async () => {
    const originalDeal = {
      id: 456,
      title: 'Test Deal',
      value: '$50,000.00',
      stage: { id: 1, name: 'Qualified', order: 0 },
      pipeline: { id: 1, name: 'Sales Pipeline' },
      status: 'open',
    }

    const updatedDeal = {
      ...originalDeal,
      stage: { id: 2, name: 'Contact Made', order: 1 }
    }

    const mockUpdateDeal = vi.fn().mockResolvedValue(updatedDeal)
    const mockOnDealUpdated = vi.fn()
    const mockShowToast = vi.fn()

    vi.mocked(usePipedrive).mockReturnValue({
      updateDeal: mockUpdateDeal,
      error: null,
      isLoading: false,
    })

    vi.mocked(useToast).mockReturnValue({
      showToast: mockShowToast,
    })

    render(
      <DealDetails
        deal={originalDeal}
        pipelines={mockPipelines}
        stages={mockStages}
        onDealUpdated={mockOnDealUpdated}
      />
    )

    // User changes stage
    const stageSelect = screen.getByLabelText(/stage/i)
    fireEvent.change(stageSelect, { target: { value: '2' } })

    // Verify Save button appears
    const saveButton = screen.getByRole('button', { name: /save/i })
    expect(saveButton).toBeInTheDocument()

    // User clicks Save
    fireEvent.click(saveButton)

    // Loading state shown
    await waitFor(() => {
      expect(screen.getByText(/saving/i)).toBeInTheDocument()
    })

    // Success: callback fired, toast shown
    await waitFor(() => {
      expect(mockOnDealUpdated).toHaveBeenCalledWith(updatedDeal)
      expect(mockShowToast).toHaveBeenCalledWith('Deal updated successfully')
    })

    // Buttons hidden
    expect(screen.queryByRole('button', { name: /save/i })).not.toBeInTheDocument()
  })

  it('error flow: save fails → error shown → retry succeeds', async () => {
    let callCount = 0
    const mockUpdateDeal = vi.fn(() => {
      callCount++
      if (callCount === 1) {
        return Promise.resolve(null) // First call fails
      } else {
        return Promise.resolve(updatedDeal) // Second call succeeds
      }
    })

    const mockError = { message: 'Network error', statusCode: 500 }

    vi.mocked(usePipedrive).mockReturnValue({
      updateDeal: mockUpdateDeal,
      error: callCount === 1 ? mockError : null,
      isLoading: false,
    })

    render(<DealDetails deal={originalDeal} {...props} />)

    // Change and save
    const stageSelect = screen.getByLabelText(/stage/i)
    fireEvent.change(stageSelect, { target: { value: '2' } })

    const saveButton = screen.getByRole('button', { name: /save/i })
    fireEvent.click(saveButton)

    // Error appears
    await waitFor(() => {
      expect(screen.getByText(/failed to update deal/i)).toBeInTheDocument()
    })

    // Retry
    fireEvent.click(saveButton)

    // Success
    await waitFor(() => {
      expect(mockOnDealUpdated).toHaveBeenCalled()
    })
  })
})
```

### 9.3 Manual Testing Checklist

**Setup:**
- [ ] Load extension in Chrome
- [ ] Authenticate with Pipedrive
- [ ] Open WhatsApp Web
- [ ] Switch to contact with matched person who has open deals

**Display Tests (Open Deals):**
- [ ] Pipeline shows as dropdown (not text)
- [ ] Stage shows as dropdown (not text)
- [ ] Pipeline dropdown populated with all active pipelines
- [ ] Stage dropdown populated with stages from current pipeline only
- [ ] Dropdown styling matches deal selector and create deal form
- [ ] No Save/Cancel buttons visible initially

**Display Tests (Won/Lost Deals):**
- [ ] Select a won deal from dropdown
- [ ] Pipeline shows as read-only text (no dropdown)
- [ ] Stage shows as read-only text (no dropdown)
- [ ] No Save/Cancel buttons
- [ ] Select a lost deal and verify same behavior

**Interaction Tests:**
- [ ] Change stage dropdown → Save/Cancel buttons appear immediately
- [ ] Change pipeline dropdown → Save/Cancel buttons appear immediately
- [ ] Change pipeline → stage dropdown updates to show new pipeline's stages
- [ ] Change pipeline → first stage of new pipeline auto-selects
- [ ] Change pipeline → stage value changes (not just dropdown options)
- [ ] Change stage, click Cancel → dropdowns revert to original values
- [ ] Change stage, click Cancel → Save/Cancel buttons disappear
- [ ] Cancel, then change again → Save/Cancel reappears correctly

**Save Success Flow:**
- [ ] Change stage and click Save
- [ ] Save button shows spinner + "Saving..." text
- [ ] Both dropdowns disabled (grayed out) during save
- [ ] After ~500ms, Save/Cancel buttons disappear
- [ ] Dropdowns remain enabled with new values
- [ ] Green toast appears: "Deal updated successfully"
- [ ] Toast auto-dismisses after 5 seconds
- [ ] Deal dropdown in DealsSection reflects updated stage name (if visible)
- [ ] Verify in Pipedrive: deal has new stage
- [ ] Select different deal and come back → original deal shows updated stage

**Save Error Flow:**
- [ ] Disconnect network (DevTools → Offline)
- [ ] Change stage and click Save
- [ ] Red error banner appears above deal title
- [ ] Error message says "Failed to update deal. Please try again."
- [ ] Dropdowns remain in changed state (still show changed values)
- [ ] Dropdowns are enabled (not disabled)
- [ ] Save/Cancel buttons remain visible
- [ ] Click X on error banner → banner dismisses
- [ ] Banner dismissed but Save/Cancel still visible
- [ ] Reconnect network (DevTools → Online)
- [ ] Click Save again → success flow works

**Pipeline Change Flow:**
- [ ] Change pipeline from "Sales Pipeline" to "Partner Pipeline"
- [ ] Stage dropdown immediately updates to show Partner stages
- [ ] First Partner stage is auto-selected
- [ ] Click Save
- [ ] Success: verify deal moved to new pipeline AND new stage in Pipedrive
- [ ] Verify both pipeline and stage names updated in extension

**Edge Cases:**
- [ ] Pipeline with only 1 stage → stage dropdown shows the single stage
- [ ] Account with 10+ pipelines → dropdown scrollable, all visible
- [ ] Pipeline with 15+ stages → dropdown scrollable, all visible
- [ ] Change pipeline 3 times, then save → saves final pipeline/stage
- [ ] Change pipeline, change stage manually, save → both changes saved
- [ ] Click Save rapidly multiple times → only one request sent (loading state prevents double-submit)
- [ ] Switch to different chat during save → no console errors, operation completes
- [ ] Switch to different deal while Save/Cancel visible → buttons disappear (component unmounts)
- [ ] Very long pipeline name (50+ chars) → truncates with ellipsis in dropdown

**Validation:**
- [ ] Cannot have empty pipeline selection (always has value from props)
- [ ] Cannot have empty stage selection (always has value from auto-select)
- [ ] Save button always enabled when changes made (no client-side blocking)
- [ ] Pipedrive enforces stage rules (extension just sends API request)

---

## 10. Acceptance Criteria

### 10.1 Functional Requirements

- [ ] **AC-1:** Open deals display pipeline as enabled dropdown
- [ ] **AC-2:** Open deals display stage as enabled dropdown
- [ ] **AC-3:** Won deals display pipeline as read-only text (no dropdown)
- [ ] **AC-4:** Lost deals display pipeline as read-only text (no dropdown)
- [ ] **AC-5:** Won deals display stage as read-only text (no dropdown)
- [ ] **AC-6:** Lost deals display stage as read-only text (no dropdown)
- [ ] **AC-7:** Pipeline dropdown populated with all active pipelines
- [ ] **AC-8:** Stage dropdown populated with stages from current pipeline only
- [ ] **AC-9:** Stage dropdown sorted by `orderNr` ascending
- [ ] **AC-10:** Changing pipeline dropdown shows Save/Cancel buttons
- [ ] **AC-11:** Changing stage dropdown shows Save/Cancel buttons
- [ ] **AC-12:** Save/Cancel buttons hidden initially (no changes)
- [ ] **AC-13:** Changing pipeline updates stage dropdown immediately
- [ ] **AC-14:** First stage of new pipeline auto-selects when pipeline changes
- [ ] **AC-15:** Cancel button reverts both dropdowns to original values
- [ ] **AC-16:** Cancel button hides Save/Cancel buttons
- [ ] **AC-17:** Save button triggers API call with `pipelineId` and `stageId`
- [ ] **AC-18:** During save, Save button shows spinner + "Saving..." text
- [ ] **AC-19:** During save, both dropdowns disabled (grayed out)
- [ ] **AC-20:** During save, Cancel button disabled
- [ ] **AC-21:** On success, Save/Cancel buttons hide
- [ ] **AC-22:** On success, dropdowns remain enabled with new values
- [ ] **AC-23:** On success, green toast shown: "Deal updated successfully"
- [ ] **AC-24:** On success, `onDealUpdated` callback called with updated deal
- [ ] **AC-25:** On error, red error banner appears above deal title
- [ ] **AC-26:** On error, dropdowns remain in changed state (enabled)
- [ ] **AC-27:** On error, Save/Cancel buttons remain visible
- [ ] **AC-28:** Error banner is dismissible via X button
- [ ] **AC-29:** After error dismiss, Save/Cancel still visible (user can retry)
- [ ] **AC-30:** Deal updated in Pipedrive with correct pipeline and stage

### 10.2 UI/UX Requirements

- [ ] **AC-31:** Dropdown styling matches deal selector dropdown
- [ ] **AC-32:** Dropdown styling matches create deal form dropdowns
- [ ] **AC-33:** Save button uses brand green when enabled
- [ ] **AC-34:** Save button shows gray with opacity when disabled
- [ ] **AC-35:** Cancel button uses secondary style (border, no background)
- [ ] **AC-36:** Error banner uses red color scheme (red-50, red-200, red-800)
- [ ] **AC-37:** Loading spinner visible and animated during save
- [ ] **AC-38:** Dropdowns have proper focus states (brand-primary ring)
- [ ] **AC-39:** Toast notification matches existing pattern (green, checkmark icon)
- [ ] **AC-40:** Layout responsive within 350px sidebar width
- [ ] **AC-41:** No layout shift when Save/Cancel buttons appear
- [ ] **AC-42:** DealDetails card maintains same height as much as possible

### 10.3 Technical Requirements

- [ ] **AC-43:** Uses `PUT /api/pipedrive/deals/{dealId}` endpoint
- [ ] **AC-44:** Backend sends `stage_id` to Pipedrive API
- [ ] **AC-45:** Pipedrive automatically updates pipeline when stage changes
- [ ] **AC-46:** Backend enriches response with stage/pipeline metadata
- [ ] **AC-47:** Extension passes `pipelines` and `stages` props to DealDetails
- [ ] **AC-48:** Component uses `useRef` to track original values
- [ ] **AC-49:** Component uses `useEffect` to update refs when deal prop changes
- [ ] **AC-50:** Uses existing ToastContext for success message
- [ ] **AC-51:** Uses existing usePipedrive hook pattern
- [ ] **AC-52:** Type definitions added for `UpdateDealData`
- [ ] **AC-53:** Service worker handles `PIPEDRIVE_UPDATE_DEAL` message
- [ ] **AC-54:** Backend validates session via verification_code
- [ ] **AC-55:** Backend returns 404 if deal not found
- [ ] **AC-56:** Backend returns 401 if unauthorized
- [ ] **AC-57:** Backend logs all operations to Application Insights
- [ ] **AC-58:** No console errors during normal operation
- [ ] **AC-59:** Proper error logging to Sentry (production)
- [ ] **AC-60:** Test coverage ≥80% for DealDetails component

---

## 11. Implementation Plan

### Phase 1: Backend - Update Deal Endpoint
**Tasks:**
1. Add `PipedriveNotFoundException` exception class to `PipedriveModels.cs`
2. Add `PipedriveDealSingleResponse` model to `PipedriveModels.cs`
3. Update `IPipedriveApiClient` interface with `UpdateDealAsync` method
4. Implement `UpdateDealAsync` in `PipedriveApiClient.cs`
5. Update `SendPipedriveRequestAsync` to throw `PipedriveNotFoundException` on 404
6. Create `UpdateDealFunction.cs` Azure Function
7. Add `UpdateDealRequest` model to function file
8. Test endpoint with curl

**Files Modified:**
- `Backend/WhatsApp2Pipe.Api/Models/PipedriveModels.cs`
- `Backend/WhatsApp2Pipe.Api/Services/IPipedriveApiClient.cs`
- `Backend/WhatsApp2Pipe.Api/Services/PipedriveApiClient.cs`

**Files Created:**
- `Backend/WhatsApp2Pipe.Api/Functions/UpdateDealFunction.cs`

**Estimated Time:** 2 hours

---

### Phase 2: Extension - Type Definitions
**Tasks:**
9. Add `UpdateDealData` interface to `deal.ts`
10. Add message types to `messages.ts` (UPDATE_DEAL request/response)
11. Update union types for `PipedriveRequest` and `PipedriveResponse`

**Files Modified:**
- `Extension/src/types/deal.ts`
- `Extension/src/types/messages.ts`

**Estimated Time:** 15 minutes

---

### Phase 3: Extension - Service Worker Handler
**Tasks:**
12. Add `handlePipedriveUpdateDeal` function to service worker
13. Add message listener for `PIPEDRIVE_UPDATE_DEAL`
14. Test with mock data

**Files Modified:**
- `Extension/src/service-worker/index.ts`

**Estimated Time:** 30 minutes

---

### Phase 4: Extension - usePipedrive Hook
**Tasks:**
15. Add `updateDeal` method to hook
16. Handle loading and error states
17. Return Deal object on success

**Files Modified:**
- `Extension/src/content-script/hooks/usePipedrive.ts`

**Estimated Time:** 30 minutes

---

### Phase 5: Extension - DealDetails Component Updates
**Tasks:**
18. Update `DealDetailsProps` interface (add pipelines, stages, onDealUpdated)
19. Add component state (selectedPipelineId, selectedStageId, isSaving, error)
20. Add refs for original values (originalPipelineId, originalStageId)
21. Add useEffect to update refs when deal prop changes
22. Add computed values (currentStages, hasChanges, isEditable)
23. Implement `handlePipelineChange` function
24. Implement `handleSave` function
25. Implement `handleCancel` function
26. Update JSX for open deals (dropdowns + Save/Cancel buttons)
27. Update JSX for won/lost deals (read-only text)
28. Add error banner rendering
29. Style dropdowns and buttons

**Files Modified:**
- `Extension/src/content-script/components/DealDetails.tsx`

**Estimated Time:** 3 hours

---

### Phase 6: Extension - DealsSection Integration
**Tasks:**
30. Add `handleDealUpdated` callback function
31. Pass `pipelines`, `stages`, `onDealUpdated` props to DealDetails
32. Test integration with DealsSection

**Files Modified:**
- `Extension/src/content-script/components/DealsSection.tsx`

**Estimated Time:** 30 minutes

---

### Phase 7: Testing - Unit Tests
**Tasks:**
33. Write DealDetails rendering tests (open deals - 10 tests)
34. Write DealDetails rendering tests (won/lost deals - 3 tests)
35. Write interaction tests (pipeline change, save, cancel - 8 tests)
36. Write integration tests (2 tests)
37. Verify coverage ≥80%

**Files Created:**
- `Extension/tests/unit/DealDetails.test.tsx` (update existing file)
- `Extension/tests/integration/update-deal-flow.test.tsx`

**Estimated Time:** 2.5 hours

---

### Phase 8: Testing - Manual Testing
**Tasks:**
38. Run through manual testing checklist (50+ scenarios)
39. Test with real Pipedrive account
40. Test all validation scenarios
41. Test success flow end-to-end
42. Test error flow with network disconnect
43. Test edge cases (many pipelines/stages, rapid changes)
44. Verify deal updated correctly in Pipedrive
45. Test toast notification behavior
46. Test won/lost deal display (read-only)
47. Cross-browser testing (Chrome, Edge)

**Estimated Time:** 2.5 hours

---

### Phase 9: Polish & Documentation
**Tasks:**
48. Code review (self-review)
49. Verify all acceptance criteria met (60 criteria)
50. Update BRD-002 to mark Feature 35 complete
51. Update CLAUDE.md if needed
52. Create implementation summary (optional)

**Files Modified:**
- `Docs/BRDs/BRD-002-Deals-Management.md`
- `CLAUDE.md` (if needed)
- `Docs/Specs/Spec-135-Change-Deal-Stage-Flow.md` (update status to ✅ Complete)

**Estimated Time:** 45 minutes

---

**Total Estimated Time:** 12-13 hours

**Implementation Order:**
- Phase 1: Backend (2 hours)
- Phases 2-4: Extension infrastructure (1.25 hours)
- Phases 5-6: Extension UI (3.5 hours)
- Phase 7: Unit tests (2.5 hours)
- Phase 8: Manual testing (2.5 hours)
- Phase 9: Polish & documentation (45 minutes)

---

## 12. Design Decisions & Rationale

### 12.1 Why Both Pipeline AND Stage Editable?

**Decision:** Allow changing both pipeline and stage, not just stage

**Rationale:**
- Users sometimes need to move deals between pipelines (e.g., from "Sales" to "Partner Channel")
- BRD-002 section 4.5 mentions "stage dropdown" but doesn't explicitly forbid pipeline changes
- Create Deal flow (Spec-134) allows pipeline selection, establishing precedent
- Pipedrive supports changing pipeline via stage change (automatic)
- Minimal additional complexity (one extra dropdown)

**Tradeoff:** Slightly more complex UI, but provides full deal management capability

### 12.2 Why Always Show as Dropdowns (No Edit Button)?

**Decision:** Pipeline and stage always shown as dropdowns for open deals

**Rationale:**
- Clearer affordance - user immediately sees these fields are editable
- Faster interaction - no extra click to enter "edit mode"
- Simpler state management - no separate "view vs edit" modes
- Consistent with web form patterns - editable fields are always editable
- Save/Cancel buttons provide clear edit boundary (changes vs no changes)

**Tradeoff:** Slightly more visual weight, but acceptable for primary action

### 12.3 Why Save/Cancel Buttons (Not Auto-Save)?

**Decision:** Show explicit Save/Cancel buttons after changes, don't auto-save

**Rationale:**
- User confidence - explicit confirmation before permanent change
- Error recovery - user can cancel if they made mistake
- Batch changes - user can change both pipeline and stage before saving (single API call)
- Matches Create Deal pattern (Spec-134) - consistent UX
- Prevents accidental changes (e.g., clicking wrong dropdown option)

**Alternative Considered:** Auto-save on dropdown change. Rejected as too aggressive and error-prone.

### 12.4 Why Dynamic Stage Dropdown Update?

**Decision:** Stage dropdown automatically updates when pipeline changes

**Rationale:**
- Stages belong to pipelines - only valid stages should be selectable
- Prevents invalid state (stage from pipeline A, pipeline B selected)
- Matches Create Deal flow pattern (Spec-134)
- Clear user feedback - dropdown options change immediately
- Auto-selecting first stage is helpful default (user can change if needed)

**Implementation:** Filter stages by `pipelineId`, sort by `orderNr`, auto-select first

### 12.5 Why Auto-Select First Stage?

**Decision:** When pipeline changes, automatically select first stage of new pipeline

**Rationale:**
- Prevents invalid state (no stage selected)
- First stage is usually correct starting point for new pipeline
- User can easily change if different stage desired
- Reduces friction - user doesn't have to manually select stage after pipeline change
- Matches Create Deal flow pattern (Spec-134)

**Alternative Considered:** Clear stage selection and require manual selection. Rejected as extra friction.

### 12.6 Why useRef for Original Values?

**Decision:** Use `useRef` to track original pipeline/stage IDs, not `useState`

**Rationale:**
- Refs don't trigger re-renders when updated
- Original values only need to update when deal prop changes (via useEffect)
- Comparing current vs original is simple: `selectedPipelineId !== originalPipelineId.current`
- Prevents unnecessary re-renders during editing
- Clean separation: state = current editing values, refs = baseline for comparison

**Alternative Considered:** useState for original values. Rejected as unnecessary re-renders.

### 12.7 Why Error Banner (Not Toast)?

**Decision:** Show persistent error banner above deal title (not auto-dismissing toast)

**Rationale:**
- Consistent with Create Deal error pattern (Spec-134)
- Errors need to be read and understood (not auto-dismiss)
- User may need to retry or fix issue
- Banner keeps form visible for corrections
- Dismissible when user is ready (X button)
- Toast is for transient success messages, not errors requiring action

**Tradeoff:** Takes vertical space, but errors should be rare

### 12.8 Why Pipedrive Handles Pipeline Change?

**Decision:** Backend only sends `stage_id` to Pipedrive, not `pipeline_id`

**Rationale:**
- Pipedrive API design: stages belong to pipelines (stage has `pipeline_id` property)
- Changing stage to one from different pipeline automatically moves deal
- No need to send separate `pipeline_id` parameter
- Simpler API request body
- Pipedrive enforces data integrity (prevents invalid pipeline/stage combinations)

**Frontend Still Sends Both:** Extension sends both to backend for validation and logging, but backend only forwards `stage_id` to Pipedrive

### 12.9 Why No Confirmation Dialog?

**Decision:** Save without confirmation dialog (just click Save button)

**Rationale:**
- Save button is explicit confirmation ("Save" label is clear)
- Cancel button provides escape hatch if user changed mind
- Confirmation dialogs add friction for common action
- Moving deals through stages is frequent workflow - shouldn't require double confirmation
- User can undo in Pipedrive if needed (change stage back)

**Tradeoff:** Accidental saves possible, but mitigated by explicit Save button (not auto-save)

### 12.10 Why Read-Only for Won/Lost Deals?

**Decision:** Won and lost deals show pipeline/stage as read-only text, not editable

**Rationale:**
- Won/lost deals are "closed" - changing stage would be unusual workflow
- Pipedrive has separate "Reopen Deal" action for won/lost deals (Feature 38)
- Prevents accidental stage changes on closed deals
- Clearer visual distinction between active vs closed deals
- Matches Pipedrive's own UI pattern (won/lost deals have limited editing)

**Future Enhancement:** Feature 38 will add "Reopen Deal" button to move won/lost deals back to open status

---

## 13. Future Enhancements (Post-MVP)

### 13.1 Optimistic UI Updates

**Description:** Update UI immediately when Save clicked (before API response)

**Benefits:**
- Faster perceived performance
- Better UX for slow connections
- Reduced waiting time

**Implementation:**
- Update dropdowns to new values immediately
- Hide Save/Cancel buttons
- Show subtle loading indicator
- If API fails, revert and show error

**Considerations:**
- More complex state management
- Need to handle race conditions
- User might switch deals before API completes

### 13.2 Keyboard Shortcuts

**Description:** Add keyboard shortcuts for common actions

**Shortcuts:**
- `Enter` to save (when dropdowns have focus)
- `Escape` to cancel
- `Tab` to navigate between dropdowns
- Arrow keys for dropdown navigation (native browser behavior)

**Benefits:**
- Power user optimization
- Faster workflow for frequent changes
- Accessibility improvement

### 13.3 Stage Change Confirmation (Optional)

**Description:** Optional confirmation dialog for certain stage changes

**Use Cases:**
- Moving to "Lost" stage (requires lost reason - Feature 37)
- Moving to "Won" stage (final stage - Feature 36)
- Moving backwards in pipeline (e.g., from Negotiation back to Qualified)

**Configuration:**
- User setting to enable/disable confirmations
- Per-stage configuration (which stages require confirmation)

### 13.4 Bulk Stage Updates

**Description:** Change stage for multiple deals at once

**UI:**
- Multi-select deals in dropdown (checkboxes)
- Single stage picker
- "Update X deals" button
- Confirm dialog with list of deals

**Use Cases:**
- Moving multiple deals to next stage after meeting
- Batch updates after pipeline review
- Cleaning up stale deals

### 13.5 Stage Change Reasons

**Description:** Optional note when changing stage

**UI:**
- Text area appears when stage changes
- Optional field (can be left empty)
- Saved as note on deal in Pipedrive

**Use Cases:**
- Document why deal moved to lost
- Note customer feedback when advancing
- Audit trail for stage changes

### 13.6 Pipeline/Stage Favorites

**Description:** Mark frequently used pipelines/stages as favorites

**UI:**
- Star icon next to pipeline/stage names
- Favorites shown at top of dropdown
- Saved per user in localStorage

**Benefits:**
- Faster access to common pipelines/stages
- Reduces scrolling in long lists
- Personalized workflow

### 13.7 Recent Stage Changes History

**Description:** Show recent stage changes for deal

**UI:**
- "History" section in DealDetails
- List of stage changes with timestamps
- Shows who changed stage and when

**Data:**
- Fetch from Pipedrive API (deal updates endpoint)
- Display last 5 changes
- Link to full history in Pipedrive

### 13.8 Stage Change Notifications

**Description:** Browser notifications when deal stage changes

**Use Cases:**
- Other team member moved deal
- Deal moved by automation/workflow
- Customer action triggered stage change (if Pipedrive webhooks)

**Implementation:**
- WebSocket connection to backend
- Backend listens to Pipedrive webhooks
- Push notifications to extension

---

## 14. Known Limitations

### 14.1 Design Limitations (By Design)

**No Stage-Specific Validation:**
- Extension doesn't validate stage-specific required fields
- Pipedrive enforces rules (may reject stage change if fields missing)
- User sees generic error, must go to Pipedrive to fix

**No Undo Functionality:**
- No built-in undo for stage changes
- User must manually change stage back
- Pipedrive maintains history (can view but not revert)

**No Deal Editing Beyond Stage:**
- Cannot edit title, value, owner, etc. from extension
- Only pipeline and stage editable
- Future specs will add field editing

**No Custom Fields:**
- Cannot set custom deal fields during stage change
- Must be edited in Pipedrive
- Future enhancement may add custom field support

### 14.2 Technical Limitations

**Client-Side Validation Limited:**
- No real-time checking of stage-specific requirements
- No duplicate stage change detection
- Backend/Pipedrive performs final validation

**No Offline Support:**
- Requires network connection to save changes
- No queue for offline changes
- Browser extension limitation (no local database)

**Session-Based Pipelines/Stages:**
- Pipelines/stages cached for session only
- Lost on sidebar reload
- No persistent localStorage cache (MVP)

### 14.3 Edge Cases

**Many Pipelines (20+):**
- Dropdown becomes long and harder to scan
- Still functional but less optimal UX
- Future: search/filter dropdown

**Many Stages (30+):**
- Same issue as pipelines
- Rare in practice (most pipelines have 5-10 stages)

**Pipeline/Stage Changes During Session:**
- If admin changes pipelines/stages in Pipedrive
- Extension shows stale cached data until reload
- Acceptable for MVP (rare scenario)

**Concurrent Updates:**
- If two users update same deal simultaneously
- Last write wins (Pipedrive API behavior)
- No conflict resolution or locking

---

## 15. Security & Privacy Considerations

### 15.1 Authentication

**Authorization:**
- All API calls include verification_code in Authorization header
- Backend validates session before updating deal
- Invalid/expired sessions return 401
- OAuth tokens never exposed to extension

**Session Management:**
- Uses existing OAuth session from Spec-105a
- No additional authentication required
- Session stored securely in backend (Azure Table Storage)

### 15.2 Data Handling

**Form Input Data:**
- Pipeline ID: User-selected from Pipedrive data
- Stage ID: User-selected from Pipedrive data
- Deal ID: From context (already loaded)
- No user-entered text (only selections)

**Data Transmission:**
- All data sent via HTTPS
- Authorization via verification_code (Bearer token)
- No local storage of sensitive data

**Error Messages:**
- Do not expose technical details (stack traces, API keys)
- User-friendly messages only
- Sensitive info filtered by backend

### 15.3 Data Minimization

**Only Required Fields:**
- Deal ID, pipeline ID, stage ID (minimum for update)
- No unnecessary data collected
- No tracking of stage changes (besides backend logs)

**No Analytics:**
- No telemetry on stage changes
- No user behavior tracking
- Privacy-focused design

---

## 16. References

### 16.1 Related Documents

- [BRD-002-Deals-Management.md](../BRDs/BRD-002-Deals-Management.md) - Feature 35 requirements
- [Spec-131a-Backend-Deals-API.md](Spec-131a-Backend-Deals-API.md) - Backend deals API (deployed)
- [Spec-131b-Extension-Deals-Display.md](Spec-131b-Extension-Deals-Display.md) - Deals display UI (deployed)
- [Spec-134-Create-Deal-Flow.md](Spec-134-Create-Deal-Flow.md) - Create deal flow (pattern reference)
- [Chrome-Extension-Architecture.md](../Architecture/Chrome-Extension-Architecture.md) - Overall architecture
- [UI-Design-Specification.md](../Architecture/UI-Design-Specification.md) - Design system

### 16.2 External References

- [Pipedrive API - Deals Endpoint](https://developers.pipedrive.com/docs/api/v1/Deals#updateDeal) - Update deal API
- [Pipedrive API - Stages](https://developers.pipedrive.com/docs/api/v1/Stages) - Stages API

### 16.3 Code References

- `Extension/src/content-script/components/DealDetails.tsx` - Component to modify
- `Extension/src/content-script/components/DealsSection.tsx` - Parent component
- `Extension/src/content-script/hooks/usePipedrive.ts` - API hook to extend
- `Extension/src/content-script/context/ToastContext.tsx` - Toast notification system
- `Extension/src/types/deal.ts` - Deal type definitions
- `Extension/src/types/messages.ts` - Message type definitions
- `Backend/WhatsApp2Pipe.Api/Services/PipedriveApiClient.cs` - API client to extend
- `Backend/WhatsApp2Pipe.Api/Services/DealTransformService.cs` - Deal transformation service

---

## 17. Glossary

**Deal:** A sales opportunity record in Pipedrive CRM

**Pipeline:** A sequence of stages representing the sales process (e.g., "Sales Pipeline", "Partner Pipeline")

**Stage:** A step in the pipeline (e.g., "Qualified", "Proposal", "Negotiation", "Won")

**Open Deal:** Deal with status "open" (still in progress, not won or lost)

**Won Deal:** Deal with status "won" (successfully closed)

**Lost Deal:** Deal with status "lost" (closed without success)

**Stage Change:** Moving a deal from one stage to another within the same or different pipeline

**Pipeline Change:** Moving a deal from one pipeline to another (implicitly changes stage)

**Verification Code:** Session identifier issued by backend after OAuth, used for API authentication

**Deal Enrichment:** Adding stage/pipeline metadata (names, order) to deal data from Pipedrive API

**DealTransformService:** Backend service that enriches deals with stage/pipeline metadata and formats currency

**hasChanges:** Boolean flag indicating if user changed pipeline or stage (triggers Save/Cancel button display)

**Original Values:** Pipeline and stage IDs when DealDetails component first renders (tracked via useRef)

**Dynamic Dropdown:** Dropdown that updates its options based on another dropdown's value (stage updates when pipeline changes)

**Auto-Select:** Automatically choosing first option in dropdown (first stage when pipeline changes)

**Graceful Degradation:** Showing error but keeping form functional (user can dismiss error and retry)

---

**END OF SPEC-135**
