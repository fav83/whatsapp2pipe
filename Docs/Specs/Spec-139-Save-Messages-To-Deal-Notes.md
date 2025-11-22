# Spec-139: Save WhatsApp Messages to Deal Notes

**Status:** ✅ Complete
**Created:** 2025-01-22
**Updated:** 2025-01-22
**Implemented:** 2025-01-22

---

## Overview

This specification extends the existing "Create Note from Chat" feature (Spec-130b) to support saving selected WhatsApp messages to **Deal notes** in addition to Person (Contact) notes. When a deal is selected, users can choose whether to save the conversation to the Contact or to the specific Deal.

---

## Business Requirements

### User Story

**As a** sales representative managing deals on WhatsApp Web
**I want to** save important conversation excerpts to specific deals
**So that** I can document deal-specific discussions (negotiations, pricing, commitments) directly on the deal record

### Key Requirements

1. **Contextual UI:** Button changes based on deal selection state
   - No deal selected → Regular button (saves to Contact only)
   - Deal selected → Split button with dropdown menu (choose Contact or Deal)

2. **Destination Choice:** When deal is selected, user can choose:
   - "Save to Contact" (existing Person notes behavior)
   - "Save to Deal" (new Deal notes behavior)

3. **Identical Format:** Note format is the same for both Contact and Deal notes

4. **Backend Separation:** Use separate API endpoints for clarity:
   - `POST /api/pipedrive/notes/person`
   - `POST /api/pipedrive/notes/deal`

5. **Positioning:** CreateNoteFromChat component stays in current position (below Person card, maintains existing layout)

---

## User Flow

### Flow 1: No Deal Selected (Existing Behavior)

```
1. User opens WhatsApp chat with matched Person
2. User clicks "Select messages" in CreateNoteFromChat section
   └─ Section expands, shows message list
3. User reviews/selects messages
4. User sees regular button: "Create Note"
5. User clicks "Create Note"
   ├─ API call to POST /api/pipedrive/notes/person
   ├─ Toast: "Note created successfully"
   └─ Section collapses
```

### Flow 2: Deal Selected (New Behavior)

```
1. User opens WhatsApp chat with matched Person
2. User selects a deal from Deals dropdown
3. User clicks "Select messages" in CreateNoteFromChat section
   └─ Section expands, shows message list
4. User reviews/selects messages
5. User sees split button: "Create Note ▼"
6. User clicks dropdown arrow (▼)
   └─ Menu appears:
       - "Save to Contact"
       - "Save to Deal"
7a. User clicks "Save to Contact"
    ├─ API call to POST /api/pipedrive/notes/person
    ├─ Toast: "Note created successfully"
    └─ Section collapses

7b. User clicks "Save to Deal"
    ├─ API call to POST /api/pipedrive/notes/deal
    ├─ Toast: "Note created successfully"
    └─ Section collapses
```

---

## UI Specification

### Button States

#### State 1: No Deal Selected (Regular Button)

```
┌─────────────────────────────────────┐
│  [All | None]                       │
│                                     │
│  ┌───────────────────────────────┐ │
│  │       Create Note             │ │
│  └───────────────────────────────┘ │
└─────────────────────────────────────┘
```

**Styling:**
- Full-width button
- Primary color: `bg-brand-primary hover:bg-brand-hover`
- Text: "Create Note"
- Behavior: Directly saves to Person (no menu)

#### State 2: Deal Selected (Split Button with Dropdown)

```
┌─────────────────────────────────────┐
│  [All | None]                       │
│                                     │
│  ┌──────────────────────────┬────┐ │
│  │   Create Note            │ ▼  │ │
│  └──────────────────────────┴────┘ │
│                                     │
│  ┌───────────────────────────────┐ │ (menu appears on click)
│  │  Save to Contact              │ │
│  │  Save to Deal                 │ │
│  └───────────────────────────────┘ │
└─────────────────────────────────────┘
```

**Styling:**
- Split button: main button + dropdown toggle
- Main button: `bg-brand-primary hover:bg-brand-hover` with text "Create Note"
- Dropdown toggle: Small chevron icon (▼), same background as main button
- Dropdown menu:
  - Positioned below button
  - `bg-white border border-border-secondary rounded-lg shadow-lg`
  - Two menu items: "Save to Contact" / "Save to Deal"
  - Each item: `hover:bg-background-secondary` on hover

### Visual Design Reference

The split button follows the same pattern as this design:

```
┌──────────────────────┬────┐
│  Save changes        │ ▼  │  ← Main action + dropdown toggle
└──────────────────────┴────┘
       ↓ (on click dropdown toggle)
┌──────────────────────────┐
│ Save and schedule        │
│ Save and publish         │
│ Export PDF               │
└──────────────────────────┘
```

### Component Positioning

**Layout remains unchanged:**

```
┌─────────────────────────────────────┐
│  [Person Card]                      │
│  - Name, phone, Open in Pipedrive   │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  [Create Note from Chat]            │
│  - Collapsed/Expanded state         │
│  - Message selection                │
│  - Create Note button (context)     │  ← Button changes based on deal selection
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  [Deals Section]                    │
│  - Deal dropdown                    │
│  - Selected deal details            │
│  - Create Deal button               │
└─────────────────────────────────────┘
```

---

## Technical Specification

### Frontend Changes

#### Component: CreateNoteFromChat.tsx

**New Props:**

```typescript
interface CreateNoteFromChatProps {
  personId: number
  contactName: string
  userName: string
  selectedDealId?: number | null  // NEW: Current selected deal ID
  selectedDealTitle?: string      // NEW: Deal title for context (optional)
}
```

**New State:**

```typescript
const [isDropdownOpen, setIsDropdownOpen] = useState(false)
```

**Button Rendering Logic:**

```typescript
// Determine if deal is selected
const hasDealSelected = selectedDealId !== null && selectedDealId !== undefined

// Render button based on state
if (!hasDealSelected) {
  // Regular button - saves to Person
  return (
    <button
      onClick={() => handleCreateNote('person')}
      disabled={isCreateButtonDisabled}
      className="w-full px-4 py-2 bg-brand-primary hover:bg-brand-hover text-white text-sm font-medium rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
    >
      {isCreatingNote ? (
        <>
          <Spinner />
          Creating...
        </>
      ) : (
        'Create Note'
      )}
    </button>
  )
} else {
  // Split button with dropdown
  return (
    <div className="relative">
      <div className="flex">
        {/* Main button area - opens dropdown */}
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          disabled={isCreateButtonDisabled}
          className="w-full px-4 py-2 bg-brand-primary hover:bg-brand-hover text-white text-sm font-medium rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isCreatingNote ? (
            <>
              <Spinner />
              Creating...
            </>
          ) : (
            <>
              Create Note
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </>
          )}
        </button>
      </div>

      {/* Dropdown menu */}
      {isDropdownOpen && (
        <div className="absolute z-10 mt-2 w-full bg-white border border-border-secondary rounded-lg shadow-lg">
          <button
            onClick={() => handleMenuItemClick('person')}
            className="w-full px-4 py-2 text-left text-sm hover:bg-background-secondary transition-colors"
          >
            Save to Contact
          </button>
          <button
            onClick={() => handleMenuItemClick('deal')}
            className="w-full px-4 py-2 text-left text-sm hover:bg-background-secondary transition-colors"
          >
            Save to Deal
          </button>
        </div>
      )}
    </div>
  )
}
```

**New Handler:**

```typescript
const handleMenuItemClick = async (destination: 'person' | 'deal') => {
  // Close dropdown
  setIsDropdownOpen(false)

  // Create note to selected destination
  await handleCreateNote(destination)
}

const handleCreateNote = async (destination: 'person' | 'deal') => {
  // Get selected messages
  const selected = messages.filter((m) => selectedMessageIds.has(m.id))

  if (selected.length === 0) {
    return // Should not happen (button disabled)
  }

  // Format as note content
  const content = formatMessagesAsNote(selected)

  // Call appropriate API based on destination
  let success = false
  if (destination === 'person') {
    success = await createPersonNote(personId, content)
  } else {
    // destination === 'deal'
    if (!selectedDealId) {
      // Should not happen (button only shows when deal selected)
      return
    }
    success = await createDealNote(selectedDealId, content)
  }

  if (success) {
    // Immediately collapse and reset state
    setIsExpanded(false)
    setMessages([])
    setSelectedMessageIds(new Set())

    // Show success toast
    showToast('Note created successfully')
  }
}
```

#### Hook: usePipedrive.ts

**Add new method:**

```typescript
const [isCreatingDealNote, setIsCreatingDealNote] = useState(false)
const [createDealNoteError, setCreateDealNoteError] = useState<string | null>(null)

const createDealNote = async (dealId: number, content: string): Promise<boolean> => {
  setIsCreatingDealNote(true)
  setCreateDealNoteError(null)

  try {
    const response = await chrome.runtime.sendMessage({
      type: 'PIPEDRIVE_CREATE_DEAL_NOTE',
      dealId,
      content
    })

    if (response.type === 'PIPEDRIVE_CREATE_DEAL_NOTE_SUCCESS') {
      return true
    } else if (response.type === 'PIPEDRIVE_CREATE_DEAL_NOTE_ERROR') {
      setCreateDealNoteError(response.error)
      return false
    }

    // Unexpected response type
    setCreateDealNoteError('Unexpected error occurred')
    return false
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to create note'
    setCreateDealNoteError(errorMessage)
    return false
  } finally {
    setIsCreatingDealNote(false)
  }
}

// Rename existing createNote to createPersonNote for clarity
const createPersonNote = async (personId: number, content: string): Promise<boolean> => {
  // Existing implementation
  // ...
}

// Return both methods
return {
  // ... existing methods
  createPersonNote,
  createDealNote,
  isCreatingNote: isCreatingNote || isCreatingDealNote,
  createNoteError: createNoteError || createDealNoteError
}
```

#### Message Types: types/messages.ts

**Add new message types:**

```typescript
// Request from content script to service worker
export interface PipedriveCreateDealNoteRequest {
  type: 'PIPEDRIVE_CREATE_DEAL_NOTE'
  dealId: number
  content: string
}

// Success response
export interface PipedriveCreateDealNoteSuccess {
  type: 'PIPEDRIVE_CREATE_DEAL_NOTE_SUCCESS'
}

// Error response
export interface PipedriveCreateDealNoteError {
  type: 'PIPEDRIVE_CREATE_DEAL_NOTE_ERROR'
  error: string
}

// Add to message union type
export type Message =
  | /* existing message types */
  | PipedriveCreateDealNoteRequest
  | PipedriveCreateDealNoteSuccess
  | PipedriveCreateDealNoteError
```

#### Service Worker: pipedriveApiService.ts

**Add new method:**

```typescript
/**
 * Create a note in Pipedrive attached to a deal
 * @param dealId - Pipedrive deal ID
 * @param content - Formatted note content
 * @throws Error with user-friendly message on failure
 */
async createDealNote(dealId: number, content: string): Promise<void> {
  const verificationCode = await chrome.storage.local.get('verification_code')
    .then(result => result.verification_code)

  if (!verificationCode) {
    throw new Error('Not authenticated')
  }

  const response = await fetch(`${AUTH_CONFIG.backendUrl}/api/pipedrive/notes/deal`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${verificationCode}`
    },
    body: JSON.stringify({
      dealId,
      content
    })
  })

  // Handle status codes (same pattern as createPersonNote)
  if (response.status === 201) {
    return // Success
  }

  if (response.status === 401) {
    try {
      const errorData = await response.json()
      if (errorData.error === 'session_expired') {
        throw new Error('Session expired. Please sign in again.')
      }
    } catch {
      // Fall through to generic unauthorized
    }
    throw new Error('Unauthorized. Please sign in again.')
  }

  if (response.status === 400) {
    const errorText = await response.text()
    throw new Error(errorText || 'Invalid request')
  }

  if (response.status === 404) {
    throw new Error('Deal not found')
  }

  if (response.status === 429) {
    throw new Error('Rate limit exceeded. Please try again later.')
  }

  // Generic error for 500 or other status codes
  throw new Error('Failed to create note. Please try again.')
}
```

**Rename existing method for consistency:**

```typescript
// Rename createNote → createPersonNote
async createPersonNote(personId: number, content: string): Promise<void> {
  // Update endpoint from /api/pipedrive/notes to /api/pipedrive/notes/person
  const response = await fetch(`${AUTH_CONFIG.backendUrl}/api/pipedrive/notes/person`, {
    // ... rest of implementation
  })
}
```

#### Service Worker: index.ts

**Add message handler:**

```typescript
// In message handler switch statement
case 'PIPEDRIVE_CREATE_DEAL_NOTE':
  try {
    await pipedriveApiService.createDealNote(
      message.dealId,
      message.content
    )
    sendResponse({
      type: 'PIPEDRIVE_CREATE_DEAL_NOTE_SUCCESS'
    })
  } catch (error) {
    sendResponse({
      type: 'PIPEDRIVE_CREATE_DEAL_NOTE_ERROR',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
  return true // Keep channel open for async response
```

**Update existing handler:**

```typescript
// Rename PIPEDRIVE_CREATE_NOTE → PIPEDRIVE_CREATE_PERSON_NOTE for clarity
case 'PIPEDRIVE_CREATE_PERSON_NOTE':
  try {
    await pipedriveApiService.createPersonNote(
      message.personId,
      message.content
    )
    sendResponse({
      type: 'PIPEDRIVE_CREATE_PERSON_NOTE_SUCCESS'
    })
  } catch (error) {
    sendResponse({
      type: 'PIPEDRIVE_CREATE_PERSON_NOTE_ERROR',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
  return true
```

#### Integration: PersonMatchedCard.tsx / Sidebar.tsx

**Update props passed to CreateNoteFromChat:**

```typescript
// In PersonMatchedCard or parent component that renders CreateNoteFromChat
<CreateNoteFromChat
  personId={person.id}
  contactName={person.name}
  userName={userName}
  selectedDealId={selectedDealId}  // NEW: Pass selected deal ID from DealsSection
  selectedDealTitle={selectedDeal?.title}  // NEW: Optional deal title
/>
```

**Data Flow:**

- `DealsSection` component manages `selectedDealId` state
- Parent component (Sidebar.tsx or PersonMatchedCard.tsx) receives `selectedDealId` from DealsSection
- Parent passes `selectedDealId` to CreateNoteFromChat
- CreateNoteFromChat uses it to determine button state

---

### Backend Changes

#### New Endpoint: POST /api/pipedrive/notes/deal

**File:** `Backend/WhatsApp2Pipe.Api/Functions/CreateDealNoteFunction.cs`

```csharp
using System.Net;
using System.Text.Json;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using WhatsApp2Pipe.Api.Services;

namespace WhatsApp2Pipe.Api.Functions
{
    public class CreateDealNoteFunction
    {
        private readonly ILogger<CreateDealNoteFunction> logger;
        private readonly PipedriveApiService pipedriveApiService;
        private readonly SessionService sessionService;
        private readonly HttpRequestLogger httpRequestLogger;

        public CreateDealNoteFunction(
            ILogger<CreateDealNoteFunction> logger,
            PipedriveApiService pipedriveApiService,
            SessionService sessionService,
            HttpRequestLogger httpRequestLogger)
        {
            this.logger = logger;
            this.pipedriveApiService = pipedriveApiService;
            this.sessionService = sessionService;
            this.httpRequestLogger = httpRequestLogger;
        }

        [Function("CreateDealNote")]
        public async Task<HttpResponseData> Run(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "pipedrive/notes/deal")]
            HttpRequestData req)
        {
            await httpRequestLogger.LogRequestAsync(req);

            try
            {
                // Authenticate
                var session = await sessionService.ValidateSessionAsync(req);
                if (session == null)
                {
                    var unauthorizedResponse = req.CreateResponse(HttpStatusCode.Unauthorized);
                    await unauthorizedResponse.WriteAsJsonAsync(new { error = "session_expired" });
                    httpRequestLogger.LogResponse("CreateDealNote", 401, unauthorizedResponse);
                    return unauthorizedResponse;
                }

                // Parse request body
                var requestBody = await new StreamReader(req.Body).ReadToEndAsync();
                var request = JsonSerializer.Deserialize<CreateDealNoteRequest>(
                    requestBody,
                    new JsonSerializerOptions { PropertyNameCaseInsensitive = true }
                );

                if (request == null || request.DealId <= 0 || string.IsNullOrWhiteSpace(request.Content))
                {
                    var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
                    await badRequestResponse.WriteStringAsync("Invalid request: dealId and content are required");
                    httpRequestLogger.LogResponse("CreateDealNote", 400, badRequestResponse);
                    return badRequestResponse;
                }

                // Create note via Pipedrive API
                await pipedriveApiService.CreateNoteAsync(
                    session.PipedriveApiToken,
                    session.PipedriveDomain,
                    dealId: request.DealId,
                    content: request.Content
                );

                // Success
                var response = req.CreateResponse(HttpStatusCode.Created);
                await response.WriteAsJsonAsync(new { success = true });
                httpRequestLogger.LogResponse("CreateDealNote", 201, response);
                return response;
            }
            catch (PipedriveApiException ex) when (ex.StatusCode == 404)
            {
                var notFoundResponse = req.CreateResponse(HttpStatusCode.NotFound);
                await notFoundResponse.WriteStringAsync("Deal not found");
                httpRequestLogger.LogResponse("CreateDealNote", 404, notFoundResponse);
                return notFoundResponse;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to create deal note");
                var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
                await errorResponse.WriteStringAsync("Failed to create note");
                httpRequestLogger.LogResponse("CreateDealNote", 500, errorResponse);
                return errorResponse;
            }
        }
    }

    public class CreateDealNoteRequest
    {
        public int DealId { get; set; }
        public string Content { get; set; } = string.Empty;
    }
}
```

#### Update Existing Endpoint: POST /api/pipedrive/notes/person

**File:** `Backend/WhatsApp2Pipe.Api/Functions/CreatePersonNoteFunction.cs`

**Change:**
- Rename from `CreateNoteFunction.cs` to `CreatePersonNoteFunction.cs`
- Update route from `Route = "pipedrive/notes"` to `Route = "pipedrive/notes/person"`
- Update function name attribute: `[Function("CreatePersonNote")]`
- Keep all other logic identical

#### Service: PipedriveApiService.cs

**Update CreateNoteAsync method signature:**

```csharp
/// <summary>
/// Create a note in Pipedrive attached to a person or deal
/// </summary>
/// <param name="apiToken">Pipedrive API token</param>
/// <param name="domain">Pipedrive domain</param>
/// <param name="personId">Person ID (optional, mutually exclusive with dealId)</param>
/// <param name="dealId">Deal ID (optional, mutually exclusive with personId)</param>
/// <param name="content">Note content</param>
public async Task CreateNoteAsync(
    string apiToken,
    string domain,
    int? personId = null,
    int? dealId = null,
    string content = "")
{
    if (personId == null && dealId == null)
    {
        throw new ArgumentException("Either personId or dealId must be provided");
    }

    if (personId != null && dealId != null)
    {
        throw new ArgumentException("Cannot provide both personId and dealId");
    }

    var requestBody = new
    {
        content,
        person_id = personId,
        deal_id = dealId
    };

    var response = await SendPipedriveRequestAsync(
        apiToken,
        domain,
        HttpMethod.Post,
        "/v1/notes",
        requestBody
    );

    // Pipedrive returns 201 Created on success
    if (!response.IsSuccessStatusCode)
    {
        var errorContent = await response.Content.ReadAsStringAsync();
        logger.LogError(
            "Failed to create note. Status: {StatusCode}, Response: {Response}",
            response.StatusCode,
            errorContent
        );
        throw new PipedriveApiException(
            $"Failed to create note: {response.StatusCode}",
            response.StatusCode
        );
    }
}
```

---

## Note Format

**Identical format for both Contact and Deal notes:**

```
=== WhatsApp Conversation ===
[14:30 11/01/2025] John Doe: Hi, I'm interested in the Aurelia Duo 2G
[14:32 11/01/2025] Sarah Smith: Hello John! Yes, we have it in stock.
[14:35 11/01/2025] John Doe: What's the price?
[14:36 11/01/2025] Sarah Smith: Machine is $5,900. Recommended grinder is $1,150.
```

**No differences between Person and Deal note formatting.**

---

## Error Handling

### Error Scenarios & User Messages

| Scenario | Cause | UI Message | User Action |
|----------|-------|------------|-------------|
| Deal not found (404) | Deal deleted after selection | "Deal not found" | Inline error, allow retry |
| Network error | Backend unreachable | "Failed to create note. Please check your connection." | Inline error, allow retry |
| Session expired | Refresh token expired (30+ days) | "Session expired. Please sign in again." | Sign out and re-authenticate |
| Rate limit | Too many API requests | "Rate limit exceeded. Please try again later." | Wait and retry |
| Generic error | Unknown failure | "Failed to create note. Please try again." | Inline error, allow retry |

### Edge Cases

1. **Deal deleted between selection and save:** Show "Deal not found" error, note creation UI stays open
2. **Deal status changed to won/lost:** Note still saves successfully (won/lost deals can have notes)
3. **User switches deals during message selection:** Split button updates based on new selectedDealId
4. **User deselects deal during message selection:** Button changes from split to regular (saves to Person)

### Logging

**Development (logger.ts):**
```typescript
logger.log('[CreateNoteFromChat] Creating note to destination:', destination)
logger.log('[CreateNoteFromChat] Deal ID:', dealId)
logger.log('[CreateNoteFromChat] Message count:', selectedMessages.length)
```

**Production (errorLogger.ts):**
```typescript
logError(
  'Failed to create deal note',
  error,
  {
    dealId,
    messageCount: selectedMessages.length,
    errorType: 'deal_note_creation_failed'
  },
  Sentry.getCurrentScope()
)
```

**Backend (Application Insights):**
- All HTTP requests/responses logged via `HttpRequestLogger`
- Pipedrive API calls logged with request/response details
- Errors logged with context (dealId, sessionId, userId)

---

## Testing

### Unit Tests

**CreateNoteFromChat.test.tsx:**
- Render with no deal selected → Shows regular button
- Render with deal selected → Shows split button with dropdown
- Click dropdown → Menu opens with "Save to Contact" / "Save to Deal"
- Click "Save to Contact" → Calls createPersonNote
- Click "Save to Deal" → Calls createDealNote
- Deal deselected during message selection → Button changes to regular
- Success (Person) → Toast shown, section collapses
- Success (Deal) → Toast shown, section collapses
- Error (Person) → Error shown inline, stays expanded
- Error (Deal) → Error shown inline, stays expanded

**pipedriveApiService.test.ts:**
- createDealNote success → Returns 201
- createDealNote with invalid dealId → Throws error
- createDealNote with 404 → Throws "Deal not found"
- createPersonNote success → Returns 201

### Integration Tests

**Backend/Tests/CreateDealNoteTests.cs:**
- Valid request with dealId → Note created successfully
- Missing dealId → Returns 400
- Missing content → Returns 400
- Deal not found → Returns 404
- Invalid session → Returns 401

### Manual Testing Checklist

**Prerequisites:**
- [ ] Extension loaded in Chrome
- [ ] WhatsApp Web open
- [ ] Authenticated with Pipedrive
- [ ] Person matched with deals

**No Deal Selected:**
- [ ] Open "Create Note from Chat" section
- [ ] Button shows "Create Note" (regular, no dropdown)
- [ ] Click button → Note saves to Person
- [ ] Toast: "Note created successfully"
- [ ] Section collapses

**Deal Selected:**
- [ ] Select a deal from Deals dropdown
- [ ] Open "Create Note from Chat" section
- [ ] Button shows "Create Note ▼" (split button)
- [ ] Click dropdown arrow → Menu appears
- [ ] Menu shows "Save to Contact" / "Save to Deal"
- [ ] Click "Save to Contact" → Note saves to Person
- [ ] Toast: "Note created successfully"
- [ ] Section collapses
- [ ] Repeat: Click "Save to Deal" → Note saves to Deal
- [ ] Toast: "Note created successfully"
- [ ] Section collapses

**Dynamic State Changes:**
- [ ] Select deal → Button becomes split
- [ ] Deselect deal → Button becomes regular
- [ ] Switch between deals → Button stays split
- [ ] Create note while deal selected → Works correctly

**Error Scenarios:**
- [ ] Network error → Error message shown inline
- [ ] Session expired → "Session expired" error
- [ ] Deal deleted (404) → "Deal not found" error
- [ ] User can retry after error

**Verification in Pipedrive:**
- [ ] Open Person in Pipedrive → Note exists on timeline
- [ ] Open Deal in Pipedrive → Note exists on timeline
- [ ] Note format matches specification

---

## Deployment

### Build Steps

1. Run tests: `npm test`
2. Build production: `npm run build`
3. Verify `dist/` contains no source maps
4. Test locally: Load unpacked extension
5. Upload source maps: `npm run upload-sourcemaps`
6. **Reload extension in Chrome** (critical for Debug IDs)
7. Test error tracking in Sentry

### Files Modified

**New Files:**
- `Backend/WhatsApp2Pipe.Api/Functions/CreateDealNoteFunction.cs`
- `Backend/Tests/CreateDealNoteTests.cs`

**Modified Files:**

**Extension:**
- `Extension/src/content-script/components/CreateNoteFromChat.tsx` (button state logic)
- `Extension/src/content-script/hooks/usePipedrive.ts` (add createDealNote method)
- `Extension/src/types/messages.ts` (new message types)
- `Extension/src/service-worker/pipedriveApiService.ts` (add createDealNote method)
- `Extension/src/service-worker/index.ts` (new message handler)
- `Extension/src/content-script/components/PersonMatchedCard.tsx` or `Sidebar.tsx` (pass selectedDealId prop)

**Backend:**
- `Backend/WhatsApp2Pipe.Api/Functions/CreateNoteFunction.cs` → Rename to `CreatePersonNoteFunction.cs`
- `Backend/WhatsApp2Pipe.Api/Services/PipedriveApiService.cs` (update CreateNoteAsync signature)

---

## Performance Considerations

| Scenario | Expected Performance |
|----------|---------------------|
| Button state change (deal select/deselect) | Instant (React state update) |
| Dropdown menu open/close | < 50ms |
| API request (Person note) | < 2s (depends on backend/Pipedrive) |
| API request (Deal note) | < 2s (depends on backend/Pipedrive) |

---

## Acceptance Criteria

- [ ] When no deal selected, regular "Create Note" button shown
- [ ] When deal selected, split button "Create Note ▼" shown
- [ ] Clicking dropdown arrow opens menu with "Save to Contact" / "Save to Deal"
- [ ] Clicking "Save to Contact" creates note on Person
- [ ] Clicking "Save to Deal" creates note on selected Deal
- [ ] Toast shows "Note created successfully" for both destinations
- [ ] Section collapses after successful note creation
- [ ] Button changes dynamically when deal is selected/deselected
- [ ] Error handling works for both Person and Deal note creation
- [ ] Note format is identical for both destinations
- [ ] Backend endpoints `/api/pipedrive/notes/person` and `/api/pipedrive/notes/deal` work correctly
- [ ] All unit tests pass
- [ ] Manual testing checklist completed
- [ ] Notes appear correctly in Pipedrive (both Person and Deal timelines)

---

## Future Enhancements

1. **Remember last destination:** Store user's last choice (Contact/Deal) and default to it next time
2. **Attach to both:** Option to save note to both Contact AND Deal simultaneously
3. **Deal preview in menu:** Show deal title in "Save to Deal" menu item for clarity
4. **Batch save:** Save same messages to multiple deals at once
5. **Note templates:** Pre-format notes with custom templates per destination

---

## References

- [Spec-130b: Extension - Create Note from Chat](Spec-130b-Extension-Create-Note-From-Chat.md) - Original Person notes implementation
- [BRD-002: Deals Management](../BRDs/BRD-002-Deals-Management.md) - Feature 39 business requirements
- [Spec-131b: Extension Deals Display](Spec-131b-Extension-Deals-Display.md) - Deal selection and display
- [Chrome Extension Architecture](../Architecture/Chrome-Extension-Architecture.md) - Technical architecture
- [UI Design Specification](../Architecture/UI-Design-Specification.md) - UI design system

---

## Appendix: API Request/Response Examples

### Create Person Note

**Request:**
```http
POST /api/pipedrive/notes/person
Authorization: Bearer {verification_code}
Content-Type: application/json

{
  "personId": 123,
  "content": "=== WhatsApp Conversation ===\n[14:30 11/01/2025] John Doe: Hi..."
}
```

**Response (Success):**
```http
HTTP/1.1 201 Created
Content-Type: application/json

{
  "success": true
}
```

### Create Deal Note

**Request:**
```http
POST /api/pipedrive/notes/deal
Authorization: Bearer {verification_code}
Content-Type: application/json

{
  "dealId": 456,
  "content": "=== WhatsApp Conversation ===\n[14:30 11/01/2025] John Doe: Hi..."
}
```

**Response (Success):**
```http
HTTP/1.1 201 Created
Content-Type: application/json

{
  "success": true
}
```

**Response (Deal Not Found):**
```http
HTTP/1.1 404 Not Found
Content-Type: text/plain

Deal not found
```

---

**END OF SPEC-139**
