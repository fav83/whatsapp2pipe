# Spec-130a: Backend Notes API

**Status:** Draft
**Created:** 2025-01-11
**Updated:** 2025-01-11

---

## Overview

This specification defines the backend Azure Function for creating notes in Pipedrive from WhatsApp conversations. The endpoint receives formatted note content from the Chrome extension and creates a note in Pipedrive linked to a specific person.

---

## Business Requirements

### User Story

**As a** sales representative using WhatsApp Web
**I want to** save selected WhatsApp messages as a note in Pipedrive
**So that** I can capture important conversation details in my CRM without manual copying

### Key Requirements

1. **Note Creation**: Create notes in Pipedrive with formatted WhatsApp conversation content
2. **Person Linkage**: Automatically link notes to the matched Pipedrive person
3. **Authentication**: Use existing session-based authentication (Bearer token)
4. **Token Refresh**: Automatically refresh expired Pipedrive access tokens
5. **Error Handling**: Provide clear error responses for all failure scenarios
6. **Logging**: Comprehensive request/response logging for debugging

---

## API Specification

### Endpoint

**URL:** `POST /api/pipedrive/notes`
**Authorization:** Bearer token (verification_code from session)
**Content-Type:** `application/json`

### Request

#### Headers

```
Authorization: Bearer {verification_code}
Content-Type: application/json
```

#### Body

```json
{
  "personId": 123,
  "content": "=== WhatsApp Conversation ===\n[10:30 11/01/2025] John Doe: Hello\n[10:31 11/01/2025] Sarah Smith: Hi there"
}
```

**Field Descriptions:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `personId` | integer | Yes | Pipedrive person ID to attach note to |
| `content` | string | Yes | Formatted note content (multi-line text) |

#### Validation Rules

- `personId` must be > 0
- `content` must not be null or empty
- `content` must not be only whitespace
- Authorization header must be present and valid format
- Session must exist and not be expired

### Response

#### Success Response

**Status Code:** `201 Created`
**Body:** Empty

#### Error Responses

**401 Unauthorized - Session Expired**

```json
{
  "error": "session_expired",
  "message": "Refresh token expired, please sign in again"
}
```

**Occurs when:** Refresh token is expired or revoked (30+ days inactive, password change, app deauthorization)

**401 Unauthorized - Missing/Invalid Token**

**Status Code:** `401 Unauthorized`
**Body:** Empty

**Occurs when:** Authorization header missing or invalid format

**400 Bad Request**

**Status Code:** `400 Bad Request`
**Body:** Plain text error message

**Examples:**
- "Request body is required"
- "Invalid request body"
- "PersonId is required"
- "Content is required"
- "PersonId must be greater than 0"

**429 Rate Limit Exceeded**

**Status Code:** `429 Too Many Requests`
**Body:** Empty

**Occurs when:** Pipedrive API rate limit exceeded

**500 Internal Server Error**

**Status Code:** `500 Internal Server Error`
**Body:** Empty

**Occurs when:** Unexpected server error or Pipedrive API failure

---

## Implementation Details

### Azure Function

**Class:** `PipedriveNotesCreateFunction`
**File:** `Backend/WhatsApp2Pipe.Api/Functions/PipedriveNotesCreateFunction.cs`
**Route:** `api/pipedrive/notes`
**Methods:** `POST`, `OPTIONS`

### Dependencies

```csharp
public PipedriveNotesCreateFunction(
    ILogger<PipedriveNotesCreateFunction> logger,
    ISessionService sessionService,
    IPipedriveApiClient pipedriveApiClient,
    HttpRequestLogger httpRequestLogger)
```

### Request Processing Flow

```
1. Handle OPTIONS (CORS preflight)
   ├─ Return 200 OK

2. Validate Authorization Header
   ├─ Check header exists
   ├─ Check "Bearer " prefix
   ├─ Extract verification_code
   └─ If invalid → 401 Unauthorized

3. Retrieve Session
   ├─ Call sessionService.GetSessionAsync(verificationCode)
   ├─ Check session exists and not expired
   └─ If invalid → 401 Unauthorized

4. Parse Request Body
   ├─ Deserialize JSON to CreateNoteRequest
   ├─ Check body not null/empty
   └─ If invalid → 400 Bad Request

5. Validate Request Fields
   ├─ Check personId > 0
   ├─ Check content not empty
   ├─ Check content not whitespace only
   └─ If invalid → 400 Bad Request with specific message

6. Call Pipedrive API
   ├─ pipedriveApiClient.CreateNoteAsync(session, personId, content)
   ├─ Automatic token refresh on 401 from Pipedrive
   ├─ Retry once after refresh
   └─ If refresh fails → 401 with session_expired

7. Return Success
   ├─ Return 201 Created
   ├─ Empty response body
   └─ Log response via HttpRequestLogger

8. Handle Exceptions
   ├─ PipedriveUnauthorizedException → 401 with session_expired
   ├─ PipedriveRateLimitException → 429
   └─ Any other exception → 500
```

### Data Models

#### Request Model

**File:** `Backend/WhatsApp2Pipe.Api/Models/NoteModels.cs`

```csharp
using System.ComponentModel.DataAnnotations;

namespace WhatsApp2Pipe.Api.Models;

/// <summary>
/// Request to create a note in Pipedrive
/// </summary>
public class CreateNoteRequest
{
    /// <summary>
    /// Pipedrive person ID to attach note to (required)
    /// </summary>
    [Required]
    public int PersonId { get; set; }

    /// <summary>
    /// Note content - formatted WhatsApp conversation (required)
    /// </summary>
    [Required]
    public string Content { get; set; } = string.Empty;
}
```

#### Pipedrive API Models

**File:** `Backend/WhatsApp2Pipe.Api/Models/PipedriveModels.cs`

Add to existing file:

```csharp
/// <summary>
/// Pipedrive note object (from API response)
/// </summary>
public class PipedriveNote
{
    [JsonPropertyName("id")]
    public int Id { get; set; }

    [JsonPropertyName("content")]
    public string Content { get; set; } = string.Empty;

    [JsonPropertyName("person_id")]
    public int? PersonId { get; set; }

    [JsonPropertyName("add_time")]
    public string? AddTime { get; set; }

    [JsonPropertyName("update_time")]
    public string? UpdateTime { get; set; }

    [JsonPropertyName("active_flag")]
    public bool ActiveFlag { get; set; }
}

/// <summary>
/// Request to create a note via Pipedrive API
/// </summary>
public class PipedriveCreateNoteRequest
{
    [JsonPropertyName("content")]
    public string Content { get; set; } = string.Empty;

    [JsonPropertyName("person_id")]
    public int PersonId { get; set; }
}

/// <summary>
/// Response from Pipedrive note creation API
/// </summary>
public class PipedriveNoteResponse
{
    [JsonPropertyName("success")]
    public bool Success { get; set; }

    [JsonPropertyName("data")]
    public PipedriveNote? Data { get; set; }
}
```

### Pipedrive API Client

**File:** `Backend/WhatsApp2Pipe.Api/Services/IPipedriveApiClient.cs`

Add method to interface:

```csharp
/// <summary>
/// Create a note in Pipedrive attached to a person
/// </summary>
/// <param name="session">User session with access token</param>
/// <param name="personId">Pipedrive person ID to attach note to</param>
/// <param name="content">Note content (plain text or HTML)</param>
/// <returns>Created note object</returns>
/// <exception cref="PipedriveUnauthorizedException">Thrown when refresh token is expired</exception>
/// <exception cref="PipedriveRateLimitException">Thrown when rate limit exceeded</exception>
Task<PipedriveNoteResponse> CreateNoteAsync(Session session, int personId, string content);
```

**File:** `Backend/WhatsApp2Pipe.Api/Services/PipedriveApiClient.cs`

Implementation:

```csharp
public async Task<PipedriveNoteResponse> CreateNoteAsync(Session session, int personId, string content)
{
    var request = new PipedriveCreateNoteRequest
    {
        Content = content,
        PersonId = personId
    };

    var requestBody = JsonSerializer.Serialize(request, jsonOptions);

    logger.LogInformation(
        "[Pipedrive API] POST /notes - PersonId: {PersonId}, ContentLength: {Length}",
        personId,
        content.Length
    );

    return await ExecuteWithTokenRefreshAsync(
        session,
        async (token) =>
        {
            var httpRequest = new HttpRequestMessage(HttpMethod.Post, $"{pipedriveBaseUrl}/notes")
            {
                Content = new StringContent(requestBody, Encoding.UTF8, "application/json")
            };
            httpRequest.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

            var response = await httpClient.SendAsync(httpRequest);

            if (response.StatusCode == HttpStatusCode.TooManyRequests)
            {
                logger.LogWarning("[Pipedrive API] Rate limit exceeded - Status: 429");
                throw new PipedriveRateLimitException();
            }

            var responseBody = await response.Content.ReadAsStringAsync();

            logger.LogInformation(
                "[Pipedrive API] POST /notes response - Status: {StatusCode}, Body: {Body}",
                (int)response.StatusCode,
                responseBody
            );

            response.EnsureSuccessStatusCode();

            var noteResponse = JsonSerializer.Deserialize<PipedriveNoteResponse>(responseBody, jsonOptions);

            if (noteResponse == null || !noteResponse.Success)
            {
                logger.LogError("[Pipedrive API] Note creation failed - Success: false");
                throw new InvalidOperationException("Failed to create note in Pipedrive");
            }

            return noteResponse;
        }
    );
}
```

### Function Implementation

**File:** `Backend/WhatsApp2Pipe.Api/Functions/PipedriveNotesCreateFunction.cs`

```csharp
using System.Net;
using System.Text.Json;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using WhatsApp2Pipe.Api.Models;
using WhatsApp2Pipe.Api.Services;

namespace WhatsApp2Pipe.Api.Functions;

public class PipedriveNotesCreateFunction
{
    private readonly ILogger<PipedriveNotesCreateFunction> logger;
    private readonly ISessionService sessionService;
    private readonly IPipedriveApiClient pipedriveApiClient;
    private readonly HttpRequestLogger httpRequestLogger;

    public PipedriveNotesCreateFunction(
        ILogger<PipedriveNotesCreateFunction> logger,
        ISessionService sessionService,
        IPipedriveApiClient pipedriveApiClient,
        HttpRequestLogger httpRequestLogger)
    {
        this.logger = logger;
        this.sessionService = sessionService;
        this.pipedriveApiClient = pipedriveApiClient;
        this.httpRequestLogger = httpRequestLogger;
    }

    [Function("PipedriveNotesCreate")]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", "options", Route = "pipedrive/notes")] HttpRequestData req)
    {
        // Handle CORS preflight
        if (req.Method.Equals("OPTIONS", StringComparison.OrdinalIgnoreCase))
        {
            return req.CreateResponse(HttpStatusCode.OK);
        }

        await httpRequestLogger.LogRequestAsync(req);

        logger.LogInformation("PipedriveNotesCreate function triggered");

        try
        {
            // Extract and validate Authorization header
            if (!req.Headers.TryGetValues("Authorization", out var authHeaders))
            {
                logger.LogWarning("Missing Authorization header");
                var unauthorizedResponse = req.CreateResponse(HttpStatusCode.Unauthorized);
                httpRequestLogger.LogResponse("PipedriveNotesCreate", (int)HttpStatusCode.Unauthorized);
                return unauthorizedResponse;
            }

            var authHeader = authHeaders.FirstOrDefault();
            if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer "))
            {
                logger.LogWarning("Invalid Authorization header format");
                var unauthorizedResponse = req.CreateResponse(HttpStatusCode.Unauthorized);
                httpRequestLogger.LogResponse("PipedriveNotesCreate", (int)HttpStatusCode.Unauthorized);
                return unauthorizedResponse;
            }

            var verificationCode = authHeader.Substring("Bearer ".Length);

            // Retrieve session from database
            var session = await sessionService.GetSessionAsync(verificationCode);
            if (session == null)
            {
                logger.LogWarning("Invalid or expired verification code");
                var unauthorizedResponse = req.CreateResponse(HttpStatusCode.Unauthorized);
                httpRequestLogger.LogResponse("PipedriveNotesCreate", (int)HttpStatusCode.Unauthorized);
                return unauthorizedResponse;
            }

            // Parse request body
            var requestBody = await req.ReadAsStringAsync();
            if (string.IsNullOrEmpty(requestBody))
            {
                logger.LogWarning("Empty request body");
                var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
                await badRequestResponse.WriteStringAsync("Request body is required");
                httpRequestLogger.LogResponse("PipedriveNotesCreate", (int)HttpStatusCode.BadRequest, "Request body is required");
                return badRequestResponse;
            }

            var createRequest = JsonSerializer.Deserialize<CreateNoteRequest>(requestBody, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            if (createRequest == null)
            {
                logger.LogWarning("Invalid request body");
                var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
                await badRequestResponse.WriteStringAsync("Invalid request body");
                httpRequestLogger.LogResponse("PipedriveNotesCreate", (int)HttpStatusCode.BadRequest, "Invalid request body");
                return badRequestResponse;
            }

            // Validate required fields
            if (createRequest.PersonId <= 0)
            {
                logger.LogWarning("Invalid personId: {PersonId}", createRequest.PersonId);
                var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
                await badRequestResponse.WriteStringAsync("PersonId must be greater than 0");
                httpRequestLogger.LogResponse("PipedriveNotesCreate", (int)HttpStatusCode.BadRequest, "PersonId must be greater than 0");
                return badRequestResponse;
            }

            if (string.IsNullOrWhiteSpace(createRequest.Content))
            {
                logger.LogWarning("Missing or empty content");
                var badRequestResponse = req.CreateResponse(HttpStatusCode.BadRequest);
                await badRequestResponse.WriteStringAsync("Content is required");
                httpRequestLogger.LogResponse("PipedriveNotesCreate", (int)HttpStatusCode.BadRequest, "Content is required");
                return badRequestResponse;
            }

            // Call Pipedrive API
            logger.LogInformation(
                "Creating note in Pipedrive: personId={PersonId}, contentLength={Length}",
                createRequest.PersonId,
                createRequest.Content.Length
            );

            var pipedriveResponse = await pipedriveApiClient.CreateNoteAsync(
                session,
                createRequest.PersonId,
                createRequest.Content
            );

            if (pipedriveResponse.Data == null)
            {
                logger.LogError("Pipedrive returned null data");
                var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
                httpRequestLogger.LogResponse("PipedriveNotesCreate", (int)HttpStatusCode.InternalServerError);
                return errorResponse;
            }

            logger.LogInformation("Note created successfully: id={NoteId}", pipedriveResponse.Data.Id);

            // Return 201 Created with empty body
            var response = req.CreateResponse(HttpStatusCode.Created);
            httpRequestLogger.LogResponse("PipedriveNotesCreate", (int)HttpStatusCode.Created);
            return response;
        }
        catch (PipedriveUnauthorizedException ex)
        {
            logger.LogWarning(ex, "Token refresh failed - session_expired");
            var response = req.CreateResponse(HttpStatusCode.Unauthorized);
            var errorBody = new { error = "session_expired", message = "Refresh token expired, please sign in again" };
            await response.WriteAsJsonAsync(errorBody);
            httpRequestLogger.LogResponse("PipedriveNotesCreate", (int)HttpStatusCode.Unauthorized, errorBody);
            return response;
        }
        catch (PipedriveRateLimitException)
        {
            logger.LogWarning("Pipedrive rate limit exceeded");
            var rateLimitResponse = req.CreateResponse((HttpStatusCode)429);
            httpRequestLogger.LogResponse("PipedriveNotesCreate", 429);
            return rateLimitResponse;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error creating note in Pipedrive");
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            httpRequestLogger.LogResponse("PipedriveNotesCreate", (int)HttpStatusCode.InternalServerError);
            return errorResponse;
        }
    }
}
```

---

## Testing

### Unit Tests

**File:** `Backend/WhatsApp2Pipe.Api.Tests/Functions/PipedriveNotesCreateFunctionTests.cs`

**Test Cases:**

1. **OPTIONS Request** → Returns 200 OK
2. **Valid Request** → Returns 201 Created, calls Pipedrive API correctly
3. **Missing Authorization Header** → Returns 401 Unauthorized
4. **Invalid Authorization Format** → Returns 401 Unauthorized
5. **Invalid Session** → Returns 401 Unauthorized
6. **Empty Request Body** → Returns 400 Bad Request with message
7. **Null Request Body** → Returns 400 Bad Request with message
8. **PersonId = 0** → Returns 400 Bad Request
9. **PersonId < 0** → Returns 400 Bad Request
10. **Empty Content** → Returns 400 Bad Request
11. **Whitespace Content** → Returns 400 Bad Request
12. **Token Refresh Success** → Returns 201 Created
13. **Token Refresh Failure** → Returns 401 with session_expired
14. **Rate Limit** → Returns 429
15. **Pipedrive API Error** → Returns 500

### Integration Tests

**Test with Postman:**

1. **Create Valid Note:**
   - POST `/api/pipedrive/notes`
   - Valid Bearer token
   - Valid personId and content
   - Expected: 201 Created

2. **Invalid Session:**
   - Invalid/expired Bearer token
   - Expected: 401 Unauthorized

3. **Validation Errors:**
   - Missing personId: 400
   - Empty content: 400

4. **Person Not Found:**
   - Invalid personId (doesn't exist in Pipedrive)
   - Expected: 500 or Pipedrive error

---

## Logging

### Request Logging

```
[PipedriveNotesCreate] Function triggered
[PipedriveNotesCreate] Creating note in Pipedrive: personId=123, contentLength=245
```

### Success Logging

```
[Pipedrive API] POST /notes - PersonId: 123, ContentLength: 245
[Pipedrive API] POST /notes response - Status: 200, Body: {...}
[PipedriveNotesCreate] Note created successfully: id=456
```

### Error Logging

```
[PipedriveNotesCreate] Missing Authorization header
[PipedriveNotesCreate] Invalid or expired verification code
[PipedriveNotesCreate] Invalid personId: 0
[PipedriveNotesCreate] Missing or empty content
[Pipedrive API] Rate limit exceeded - Status: 429
[PipedriveNotesCreate] Token refresh failed - session_expired
[PipedriveNotesCreate] Error creating note in Pipedrive
```

### Application Insights Queries

**View all note creation requests:**

```kql
customEvents
| where name == "HttpRequest"
| where customDimensions.Url contains "/api/pipedrive/notes"
| project timestamp, operation_Id, Body = customDimensions.Body
| order by timestamp desc
```

**View note creation responses:**

```kql
traces
| where message startswith "[HTTP Response]"
| where customDimensions.FunctionName == "PipedriveNotesCreate"
| project
    timestamp,
    operation_Id,
    StatusCode = customDimensions.StatusCode
| order by timestamp desc
```

**Correlate request and response:**

```kql
let operationId = "<operation-id>";
union
    (customEvents | where name == "HttpRequest" and operation_Id == operationId),
    (traces | where message startswith "[HTTP Response]" and operation_Id == operationId)
| project timestamp, type = itemType, details = customDimensions
| order by timestamp asc
```

---

## Security Considerations

1. **Authentication:** All requests require valid Bearer token (verification_code)
2. **Authorization:** Users can only create notes for persons in their own Pipedrive account
3. **Input Validation:** Strict validation of personId and content
4. **Token Storage:** Access/refresh tokens stored securely in Azure SQL with encryption
5. **Logging:** Full request/response logging (contains user data - RBAC required for access)
6. **Rate Limiting:** Pipedrive API rate limits enforced (429 returned to client)

---

## Performance Considerations

1. **Response Time:** Typically < 2 seconds (depends on Pipedrive API)
2. **Content Size:** No explicit limit enforced (Pipedrive may have limits)
3. **Concurrent Requests:** Azure Functions auto-scales to handle load
4. **Token Refresh:** Adds ~1 second if access token expired (rare in normal use)

---

## Deployment

### Environment Variables

No new environment variables required. Uses existing:

- `PipedriveBaseUrl` - Pipedrive API base URL
- `SqlConnectionString` - Azure SQL connection string

### Deployment Steps

1. Build solution: `dotnet build`
2. Run tests: `dotnet test`
3. Deploy via Azure Functions VS Code extension or CI/CD
4. Verify function appears in Azure Portal
5. Test with Postman using production URL

### Monitoring

- Monitor Application Insights for errors and performance
- Set up alerts for 500 errors or high latency
- Review logs regularly for token refresh failures

---

## Future Enhancements

1. **Deal Linkage:** Support linking notes to deals in addition to persons
2. **Batch Creation:** Create multiple notes in single request
3. **Rich Content:** Support HTML formatting in note content
4. **Attachments:** Support attaching media files to notes
5. **Templates:** Note templates for common scenarios

---

## References

- [Pipedrive Notes API Documentation](../../External/Pipedrive/docs/api/v1/addnote.md)
- [Spec-105a: Backend OAuth Service](Spec-105a-Backend-OAuth-Service.md)
- [Spec-106a: Backend Pipedrive API Service](Spec-106a-Backend-Pipedrive-API-Service.md)
- [Chrome Extension Architecture](../Architecture/Chrome-Extension-Architecture.md)

---

## Appendix: Example Requests

### Successful Note Creation

**Request:**
```http
POST https://api.chat2deal.com/api/pipedrive/notes
Authorization: Bearer abc123def456
Content-Type: application/json

{
  "personId": 123,
  "content": "=== WhatsApp Conversation ===\n[14:30 11/01/2025] John Doe: Hi, I'm interested in the product\n[14:32 11/01/2025] Sarah Smith: Hello! I'd be happy to help.\n[14:35 11/01/2025] John Doe: What's the price?\n[14:36 11/01/2025] Sarah Smith: It's $5,900."
}
```

**Response:**
```http
HTTP/1.1 201 Created
```

### Validation Error

**Request:**
```http
POST https://api.chat2deal.com/api/pipedrive/notes
Authorization: Bearer abc123def456
Content-Type: application/json

{
  "personId": 0,
  "content": ""
}
```

**Response:**
```http
HTTP/1.1 400 Bad Request

PersonId must be greater than 0
```

### Session Expired

**Request:**
```http
POST https://api.chat2deal.com/api/pipedrive/notes
Authorization: Bearer expired_token
Content-Type: application/json

{
  "personId": 123,
  "content": "Note content"
}
```

**Response:**
```http
HTTP/1.1 401 Unauthorized
Content-Type: application/json

{
  "error": "session_expired",
  "message": "Refresh token expired, please sign in again"
}
```
