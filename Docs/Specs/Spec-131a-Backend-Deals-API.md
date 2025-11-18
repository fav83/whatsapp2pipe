# Spec-131a: Backend Deals API Service

**Feature:** Features 31, 32, 33 - Deal Auto-Lookup, Filtering/Sorting, and Display (Backend)
**Date:** 2025-01-17
**Status:** ✅ Complete
**Dependencies:** Spec-106a (Backend Pipedrive API Service)

---

## Implementation Split

Features 31, 32, and 33 from BRD-002 (Deals Management) are split into two independent specifications:

- **Spec-131a (This Document):** Backend Deals API Service - Azure Functions + C# + Pipedrive API integration
- **Spec-131b:** Extension Deals Display - TypeScript + React + UI Components

**Implementation Order:**
1. Spec-131a (Backend) - Can be developed and tested independently
2. Spec-131b (Extension) - Integrates with deployed backend

---

**Related Docs:**
- [BRD-002-Deals-Management.md](../BRDs/BRD-002-Deals-Management.md) - Features 31, 32, 33
- [Spec-106a-Backend-Pipedrive-API-Service.md](Spec-106a-Backend-Pipedrive-API-Service.md) - Pipedrive API foundation
- [Spec-131b-Extension-Deals-Display.md](Spec-131b-Extension-Deals-Display.md) - Extension counterpart

---

## 1. Overview

Implement backend API endpoint that returns person data + associated deals in a single response. The backend fetches deals from Pipedrive, enriches them with stage/pipeline metadata, formats currency values, and pre-sorts them for display.

**Why this matters:** The extension cannot efficiently fetch deals directly from Pipedrive because:
1. Deals require stage/pipeline metadata lookups (multiple API calls)
2. Currency formatting varies by locale
3. Sorting logic should be centralized for consistency
4. Extension would need to manage complex state for multiple concurrent API calls

**Architecture Pattern:** Unified Lookup - Extension sends phone → Backend returns person + deals in one response → Extension displays both sections.

---

## 2. Objectives

- Implement single HTTP endpoint that returns person + deals together
- Fetch deals from Pipedrive API v2 (`GET /v2/deals?person_id={id}`)
- Enrich deals with stage/pipeline metadata (name, order, pipeline_id)
- Format currency values as strings (e.g., "$50,000.00", "€30,000")
- Pre-sort deals by status (Open → Won → Lost) then by update time (most recent first)
- Handle partial failures gracefully (person succeeds even if deals fetch fails)
- Support BRD requirements: Features 31 (Auto-Lookup), 32 (Sorting), 33 (Display Data)

---

## 3. Architecture Overview

### 3.1 Component Structure

```
Backend/WhatsApp2Pipe.Api/
├── Functions/
│   └── PipedrivePersonsLookupFunction.cs          # NEW: GET /api/pipedrive/persons/lookup
├── Services/
│   ├── IPipedriveApiClient.cs                     # UPDATE: Add deals/stages/pipelines methods
│   ├── PipedriveApiClient.cs                      # UPDATE: Implement new methods
│   └── DealTransformService.cs                    # NEW: Transform and enrich deals
└── Models/
    └── PipedriveModels.cs                         # UPDATE: Add deal models
```

### 3.2 Data Flow

```
Extension
  ↓ GET /api/pipedrive/persons/lookup?phone={phone} (Authorization: Bearer {verification_code})
Backend Azure Function
  ↓ Validate verification_code
Azure Table Storage (Session)
  ↓ Retrieve access_token
Backend Azure Function
  ↓ Call Pipedrive API: Search person by phone
Pipedrive API (Person Search)
  ↓ Return person data
Backend Azure Function
  ↓ Call Pipedrive API: Get deals for person_id
Pipedrive API (Deals)
  ↓ Return deals array
Backend Azure Function
  ↓ Call Pipedrive API: Get all stages (cacheable)
Pipedrive API (Stages)
  ↓ Return stages array
Backend Azure Function
  ↓ Call Pipedrive API: Get all pipelines (cacheable)
Pipedrive API (Pipelines)
  ↓ Return pipelines array
Backend Azure Function (DealTransformService)
  ↓ Enrich deals with stage/pipeline metadata
  ↓ Format currency values
  ↓ Sort deals (Open → Won → Lost → by update_time)
Backend Azure Function
  ↓ Return { person, deals }
Extension
```

---

## 4. Functional Requirements

### 4.1 Endpoint: Lookup Person with Deals

**Endpoint:**
```
GET /api/pipedrive/persons/lookup?phone={phone}
Authorization: Bearer {verification_code}
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `phone` | string | Yes | Phone number in E.164 format (e.g., "+1234567890") |

**Success Response (200 OK):**
```json
{
  "person": {
    "id": 123,
    "name": "John Doe",
    "organizationName": "Acme Corp",
    "phones": [
      {
        "value": "+1234567890",
        "label": "mobile",
        "isPrimary": true
      }
    ],
    "email": "john@example.com"
  },
  "deals": [
    {
      "id": 456,
      "title": "Website Redesign Project",
      "value": "$50,000.00",
      "stage": {
        "id": 2,
        "name": "Proposal",
        "order": 2
      },
      "pipeline": {
        "id": 1,
        "name": "Sales Pipeline"
      },
      "status": "open"
    },
    {
      "id": 789,
      "title": "Mobile App Development",
      "value": "€30,000",
      "stage": {
        "id": 8,
        "name": "Won",
        "order": 99
      },
      "pipeline": {
        "id": 1,
        "name": "Sales Pipeline"
      },
      "status": "won"
    }
  ]
}
```

**Person Not Found (404 Not Found):**
```json
{
  "person": null,
  "deals": []
}
```

**Person Found, Deals Fetch Failed (200 OK - Partial Failure):**
```json
{
  "person": {
    "id": 123,
    "name": "John Doe",
    ...
  },
  "deals": null,
  "dealsError": "Failed to fetch deals from Pipedrive"
}
```

**Authentication Failed (401 Unauthorized):**
```json
{
  "error": "Invalid or expired verification code"
}
```

**Pipedrive API Error (502 Bad Gateway):**
```json
{
  "error": "Pipedrive API unavailable"
}
```

### 4.2 Deals Sorting Logic

Deals array must be pre-sorted by backend:

1. **Primary sort:** Status
   - `"open"` deals first
   - `"won"` deals second
   - `"lost"` deals last

2. **Secondary sort:** Update time (within each status group)
   - Most recently updated first
   - Uses Pipedrive's `update_time` field

**Example order:**
```
1. Open deals (newest update first)
   - Deal A (updated 2024-01-20)
   - Deal B (updated 2024-01-15)
2. Won deals (newest update first)
   - Deal C (updated 2024-01-10)
3. Lost deals (newest update first)
   - Deal D (updated 2024-01-05)
```

### 4.3 Currency Formatting

Backend must format currency values as strings using C# `CultureInfo`:

**Input from Pipedrive:**
```json
{
  "value": 50000,
  "currency": "USD"
}
```

**Output to Extension:**
```json
{
  "value": "$50,000.00"
}
```

**Supported currencies:** All ISO-4217 currency codes (USD, EUR, GBP, etc.)
**Format:** Use `decimal.ToString("C", culture)` with appropriate culture for currency

---

## 5. Technical Implementation

### 5.1 New Azure Function

**File:** `Backend/WhatsApp2Pipe.Api/Functions/PipedrivePersonsLookupFunction.cs`

```csharp
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using WhatsApp2Pipe.Api.Services;
using WhatsApp2Pipe.Api.Models;

namespace WhatsApp2Pipe.Api.Functions;

public class PipedrivePersonsLookupFunction
{
    private readonly ISessionService sessionService;
    private readonly IPipedriveApiClient pipedriveApiClient;
    private readonly DealTransformService dealTransformService;
    private readonly HttpRequestLogger httpRequestLogger;
    private readonly ILogger<PipedrivePersonsLookupFunction> logger;

    public PipedrivePersonsLookupFunction(
        ISessionService sessionService,
        IPipedriveApiClient pipedriveApiClient,
        DealTransformService dealTransformService,
        HttpRequestLogger httpRequestLogger,
        ILogger<PipedrivePersonsLookupFunction> logger)
    {
        this.sessionService = sessionService;
        this.pipedriveApiClient = pipedriveApiClient;
        this.dealTransformService = dealTransformService;
        this.httpRequestLogger = httpRequestLogger;
        this.logger = logger;
    }

    [Function("PipedrivePersonsLookupFunction")]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "pipedrive/persons/lookup")]
        HttpRequestData req)
    {
        await httpRequestLogger.LogRequestAsync(req);

        // Extract query parameters
        var query = System.Web.HttpUtility.ParseQueryString(req.Url.Query);
        var phone = query["phone"];

        if (string.IsNullOrEmpty(phone))
        {
            var badRequestResponse = req.CreateResponse(System.Net.HttpStatusCode.BadRequest);
            await badRequestResponse.WriteAsJsonAsync(new { error = "Phone parameter is required" });
            httpRequestLogger.LogResponse("PipedrivePersonsLookupFunction", 400);
            return badRequestResponse;
        }

        // Validate session
        var verificationCode = req.Headers.GetValues("Authorization").FirstOrDefault()?.Replace("Bearer ", "");
        if (string.IsNullOrEmpty(verificationCode))
        {
            var unauthorizedResponse = req.CreateResponse(System.Net.HttpStatusCode.Unauthorized);
            await unauthorizedResponse.WriteAsJsonAsync(new { error = "Authorization header required" });
            httpRequestLogger.LogResponse("PipedrivePersonsLookupFunction", 401);
            return unauthorizedResponse;
        }

        var session = await sessionService.GetSessionByVerificationCodeAsync(verificationCode);
        if (session == null)
        {
            var unauthorizedResponse = req.CreateResponse(System.Net.HttpStatusCode.Unauthorized);
            await unauthorizedResponse.WriteAsJsonAsync(new { error = "Invalid or expired verification code" });
            httpRequestLogger.LogResponse("PipedrivePersonsLookupFunction", 401);
            return unauthorizedResponse;
        }

        try
        {
            // Step 1: Search person by phone
            var searchResponse = await pipedriveApiClient.SearchPersonsAsync(session, phone, "phone");

            if (searchResponse.Data?.Items == null || searchResponse.Data.Items.Length == 0)
            {
                // Person not found
                var notFoundResponse = req.CreateResponse(System.Net.HttpStatusCode.NotFound);
                await notFoundResponse.WriteAsJsonAsync(new
                {
                    person = (object?)null,
                    deals = new object[0]
                });
                httpRequestLogger.LogResponse("PipedrivePersonsLookupFunction", 404);
                return notFoundResponse;
            }

            var person = searchResponse.Data.Items[0].Item;
            if (person == null)
            {
                var notFoundResponse = req.CreateResponse(System.Net.HttpStatusCode.NotFound);
                await notFoundResponse.WriteAsJsonAsync(new
                {
                    person = (object?)null,
                    deals = new object[0]
                });
                httpRequestLogger.LogResponse("PipedrivePersonsLookupFunction", 404);
                return notFoundResponse;
            }

            // Step 2: Fetch deals for person (with error handling)
            List<Deal>? transformedDeals = null;
            string? dealsError = null;

            try
            {
                // Fetch deals
                var dealsResponse = await pipedriveApiClient.GetPersonDealsAsync(session, person.Id);

                // Fetch stages and pipelines (for enrichment)
                var stagesResponse = await pipedriveApiClient.GetStagesAsync(session);
                var pipelinesResponse = await pipedriveApiClient.GetPipelinesAsync(session);

                // Transform and sort deals
                transformedDeals = dealTransformService.TransformDeals(
                    dealsResponse.Data ?? Array.Empty<PipedriveDeal>(),
                    stagesResponse.Data ?? Array.Empty<PipedriveStage>(),
                    pipelinesResponse.Data ?? Array.Empty<PipedrivePipeline>()
                );
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to fetch or transform deals for person {PersonId}", person.Id);
                dealsError = "Failed to fetch deals from Pipedrive";
            }

            // Step 3: Transform person
            var transformedPerson = TransformPerson(person);

            // Step 4: Return response
            var response = req.CreateResponse(System.Net.HttpStatusCode.OK);

            if (dealsError != null)
            {
                await response.WriteAsJsonAsync(new
                {
                    person = transformedPerson,
                    deals = (object?)null,
                    dealsError
                });
            }
            else
            {
                await response.WriteAsJsonAsync(new
                {
                    person = transformedPerson,
                    deals = transformedDeals
                });
            }

            httpRequestLogger.LogResponse("PipedrivePersonsLookupFunction", 200);
            return response;
        }
        catch (PipedriveUnauthorizedException)
        {
            var unauthorizedResponse = req.CreateResponse(System.Net.HttpStatusCode.Unauthorized);
            await unauthorizedResponse.WriteAsJsonAsync(new { error = "Pipedrive authentication failed" });
            httpRequestLogger.LogResponse("PipedrivePersonsLookupFunction", 401);
            return unauthorizedResponse;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error in PipedrivePersonsLookupFunction");
            var errorResponse = req.CreateResponse(System.Net.HttpStatusCode.InternalServerError);
            await errorResponse.WriteAsJsonAsync(new { error = "Internal server error" });
            httpRequestLogger.LogResponse("PipedrivePersonsLookupFunction", 500);
            return errorResponse;
        }
    }

    private object TransformPerson(PipedrivePerson person)
    {
        // Reuse existing person transformation logic
        return new
        {
            id = person.Id,
            name = person.Name,
            organizationName = person.OrganizationName,
            phones = person.Phone?.Select(p => new
            {
                value = p.Value,
                label = p.Label ?? "mobile",
                isPrimary = p.Primary
            }).ToArray() ?? Array.Empty<object>(),
            email = person.Email?.FirstOrDefault(e => e.Primary)?.Value
        };
    }
}
```

### 5.2 Update IPipedriveApiClient Interface

**File:** `Backend/WhatsApp2Pipe.Api/Services/IPipedriveApiClient.cs`

Add new methods:

```csharp
/// <summary>
/// Get all deals for a person (with automatic token refresh on 401)
/// </summary>
Task<PipedriveDealsResponse> GetPersonDealsAsync(Session session, int personId);

/// <summary>
/// Get all stages (with automatic token refresh on 401)
/// </summary>
Task<PipedriveStagesResponse> GetStagesAsync(Session session);

/// <summary>
/// Get all pipelines (with automatic token refresh on 401)
/// </summary>
Task<PipedrivePipelinesResponse> GetPipelinesAsync(Session session);
```

### 5.3 Implement PipedriveApiClient Methods

**File:** `Backend/WhatsApp2Pipe.Api/Services/PipedriveApiClient.cs`

```csharp
public async Task<PipedriveDealsResponse> GetPersonDealsAsync(Session session, int personId)
{
    var url = $"https://api.pipedrive.com/v2/deals?person_id={personId}&status=open,won,lost";
    return await SendPipedriveRequestAsync<PipedriveDealsResponse>(
        session,
        HttpMethod.Get,
        url,
        null
    );
}

public async Task<PipedriveStagesResponse> GetStagesAsync(Session session)
{
    var url = "https://api.pipedrive.com/v1/stages";
    return await SendPipedriveRequestAsync<PipedriveStagesResponse>(
        session,
        HttpMethod.Get,
        url,
        null
    );
}

public async Task<PipedrivePipelinesResponse> GetPipelinesAsync(Session session)
{
    var url = "https://api.pipedrive.com/v1/pipelines";
    return await SendPipedriveRequestAsync<PipedrivePipelinesResponse>(
        session,
        HttpMethod.Get,
        url,
        null
    );
}
```

### 5.4 New DealTransformService

**File:** `Backend/WhatsApp2Pipe.Api/Services/DealTransformService.cs`

```csharp
using System.Globalization;
using WhatsApp2Pipe.Api.Models;

namespace WhatsApp2Pipe.Api.Services;

public class DealTransformService
{
    /// <summary>
    /// Transform Pipedrive deals to extension format with enrichment and sorting
    /// </summary>
    public List<Deal> TransformDeals(
        PipedriveDeal[] pipedriveDeals,
        PipedriveStage[] stages,
        PipedrivePipeline[] pipelines)
    {
        // Create lookup maps for fast access
        var stageMap = stages.ToDictionary(s => s.Id);
        var pipelineMap = pipelines.ToDictionary(p => p.Id);

        var deals = new List<Deal>();

        foreach (var pdDeal in pipedriveDeals)
        {
            // Find stage
            if (!stageMap.TryGetValue(pdDeal.StageId, out var stage))
            {
                // Skip deals with invalid stage_id
                continue;
            }

            // Find pipeline
            if (!pipelineMap.TryGetValue(stage.PipelineId, out var pipeline))
            {
                // Skip deals with invalid pipeline_id
                continue;
            }

            deals.Add(new Deal
            {
                Id = pdDeal.Id,
                Title = pdDeal.Title,
                Value = FormatCurrency(pdDeal.Value, pdDeal.Currency),
                Stage = new DealStage
                {
                    Id = stage.Id,
                    Name = stage.Name,
                    Order = stage.OrderNr
                },
                Pipeline = new DealPipeline
                {
                    Id = pipeline.Id,
                    Name = pipeline.Name
                },
                Status = pdDeal.Status
            });
        }

        // Sort deals: open → won → lost, then by most recently updated
        return SortDeals(deals);
    }

    /// <summary>
    /// Format currency value based on currency code
    /// </summary>
    private string FormatCurrency(decimal value, string currencyCode)
    {
        try
        {
            var culture = GetCultureForCurrency(currencyCode);
            return value.ToString("C", culture);
        }
        catch
        {
            // Fallback: return value with currency code
            return $"{currencyCode} {value:N2}";
        }
    }

    /// <summary>
    /// Get CultureInfo for currency code
    /// </summary>
    private CultureInfo GetCultureForCurrency(string currencyCode)
    {
        return currencyCode.ToUpper() switch
        {
            "USD" => new CultureInfo("en-US"),
            "EUR" => new CultureInfo("de-DE"),
            "GBP" => new CultureInfo("en-GB"),
            "JPY" => new CultureInfo("ja-JP"),
            "CAD" => new CultureInfo("en-CA"),
            "AUD" => new CultureInfo("en-AU"),
            "CHF" => new CultureInfo("de-CH"),
            "CNY" => new CultureInfo("zh-CN"),
            "INR" => new CultureInfo("en-IN"),
            "BRL" => new CultureInfo("pt-BR"),
            _ => CultureInfo.InvariantCulture
        };
    }

    /// <summary>
    /// Sort deals by status (open → won → lost) then by update time
    /// </summary>
    private List<Deal> SortDeals(List<Deal> deals)
    {
        var statusOrder = new Dictionary<string, int>
        {
            { "open", 0 },
            { "won", 1 },
            { "lost", 2 }
        };

        return deals
            .OrderBy(d => statusOrder.ContainsKey(d.Status) ? statusOrder[d.Status] : 999)
            .ToList();
    }
}
```

**Note:** Sorting by `update_time` requires storing it in Deal model or using Pipedrive's order. For simplicity, we sort by status only in MVP. Update time sorting can be added later if needed.

---

## 6. Data Models

### 6.1 New Models in PipedriveModels.cs

**File:** `Backend/WhatsApp2Pipe.Api/Models/PipedriveModels.cs`

Add to existing file:

```csharp
/// <summary>
/// Deal object returned to extension
/// </summary>
public class Deal
{
    [JsonPropertyName("id")]
    public int Id { get; set; }

    [JsonPropertyName("title")]
    public string Title { get; set; } = string.Empty;

    [JsonPropertyName("value")]
    public string Value { get; set; } = string.Empty; // Formatted: "$50,000.00"

    [JsonPropertyName("stage")]
    public DealStage Stage { get; set; } = new();

    [JsonPropertyName("pipeline")]
    public DealPipeline Pipeline { get; set; } = new();

    [JsonPropertyName("status")]
    public string Status { get; set; } = string.Empty; // "open", "won", "lost"
}

public class DealStage
{
    [JsonPropertyName("id")]
    public int Id { get; set; }

    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("order")]
    public int Order { get; set; }
}

public class DealPipeline
{
    [JsonPropertyName("id")]
    public int Id { get; set; }

    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;
}

/// <summary>
/// Pipedrive raw deal response (from GET /v2/deals)
/// </summary>
public class PipedriveDeal
{
    [JsonPropertyName("id")]
    public int Id { get; set; }

    [JsonPropertyName("title")]
    public string Title { get; set; } = string.Empty;

    [JsonPropertyName("value")]
    public decimal Value { get; set; }

    [JsonPropertyName("currency")]
    public string Currency { get; set; } = string.Empty;

    [JsonPropertyName("stage_id")]
    public int StageId { get; set; }

    [JsonPropertyName("status")]
    public string Status { get; set; } = string.Empty;

    [JsonPropertyName("update_time")]
    public string? UpdateTime { get; set; }
}

/// <summary>
/// Pipedrive deals list response
/// </summary>
public class PipedriveDealsResponse
{
    [JsonPropertyName("success")]
    public bool Success { get; set; }

    [JsonPropertyName("data")]
    public PipedriveDeal[]? Data { get; set; }
}

/// <summary>
/// Pipedrive stage object
/// </summary>
public class PipedriveStage
{
    [JsonPropertyName("id")]
    public int Id { get; set; }

    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("order_nr")]
    public int OrderNr { get; set; }

    [JsonPropertyName("pipeline_id")]
    public int PipelineId { get; set; }
}

/// <summary>
/// Pipedrive stages list response
/// </summary>
public class PipedriveStagesResponse
{
    [JsonPropertyName("success")]
    public bool Success { get; set; }

    [JsonPropertyName("data")]
    public PipedriveStage[]? Data { get; set; }
}

/// <summary>
/// Pipedrive pipeline object
/// </summary>
public class PipedrivePipeline
{
    [JsonPropertyName("id")]
    public int Id { get; set; }

    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;
}

/// <summary>
/// Pipedrive pipelines list response
/// </summary>
public class PipedrivePipelinesResponse
{
    [JsonPropertyName("success")]
    public bool Success { get; set; }

    [JsonPropertyName("data")]
    public PipedrivePipeline[]? Data { get; set; }
}
```

---

## 7. Dependency Injection Registration

**File:** `Backend/WhatsApp2Pipe.Api/Program.cs`

Add service registration:

```csharp
services.AddScoped<DealTransformService>();
```

---

## 8. Testing Strategy

### 8.1 Manual Testing with Curl

**Test 1: Person with Deals**
```bash
curl -X GET "http://localhost:7071/api/pipedrive/persons/lookup?phone=%2B1234567890" \
  -H "Authorization: Bearer {verification_code}"
```

**Expected:** 200 OK with person + deals array

**Test 2: Person without Deals**
```bash
curl -X GET "http://localhost:7071/api/pipedrive/persons/lookup?phone=%2B9999999999" \
  -H "Authorization: Bearer {verification_code}"
```

**Expected:** 200 OK with person + empty deals array

**Test 3: Person Not Found**
```bash
curl -X GET "http://localhost:7071/api/pipedrive/persons/lookup?phone=%2B0000000000" \
  -H "Authorization: Bearer {verification_code}"
```

**Expected:** 404 Not Found with `person: null, deals: []`

**Test 4: Invalid Auth**
```bash
curl -X GET "http://localhost:7071/api/pipedrive/persons/lookup?phone=%2B1234567890" \
  -H "Authorization: Bearer invalid_code"
```

**Expected:** 401 Unauthorized

### 8.2 Verify Sorting

Check that deals in response are ordered:
1. Open deals first
2. Won deals second
3. Lost deals last

### 8.3 Verify Currency Formatting

Check that `value` field is formatted string:
- USD: "$50,000.00"
- EUR: "50.000,00 €" (or "€50,000.00" depending on culture)
- GBP: "£50,000.00"

### 8.4 Verify Stage/Pipeline Enrichment

Check that each deal has:
- `stage.name` (not just stage_id)
- `pipeline.name` (not just pipeline_id)
- `stage.order` for proper ordering

---

## 9. Deployment Notes

### 9.1 Environment Variables

No new environment variables required.

### 9.2 Azure Configuration

No changes to Azure configuration required.

### 9.3 Deployment Order

1. Deploy backend with new function
2. Test endpoint with curl
3. Verify sorting and formatting
4. Deploy extension (Spec-131b)

---

## 10. Performance Considerations

### 10.1 API Call Optimization

**Current approach:** 4 API calls per lookup
- 1 × Search person by phone
- 1 × Get deals for person
- 1 × Get all stages
- 1 × Get all pipelines

**Future optimization (if needed):**
- Cache stages/pipelines responses (TTL: 1 hour)
- Reduces to 2 API calls per lookup after cache warm-up

### 10.2 Response Size

Typical response size:
- Person: ~500 bytes
- Deal (each): ~200 bytes
- 10 deals: ~2.5 KB total

No pagination needed for MVP (persons typically have <50 deals).

---

## 11. Security Considerations

### 11.1 Authorization

- All requests require valid `verification_code` in Authorization header
- Session validation via Azure Table Storage
- OAuth tokens never exposed to extension

### 11.2 Data Privacy

- Backend logs contain full deal data (titles, values, etc.)
- Configure Application Insights retention policies (recommend 90 days)
- Use RBAC to restrict log access

---

## 12. Error Handling

### 12.1 Graceful Degradation

If deals fetch fails:
- Return person data successfully
- Set `deals: null` and `dealsError: "..."`
- Extension can display person section normally

### 12.2 Logging

Log all errors to Application Insights:
- Failed Pipedrive API calls
- Invalid stage/pipeline references
- Currency formatting failures

---

## 13. Success Criteria

- [x] New endpoint `GET /api/pipedrive/persons/lookup` deployed
- [x] Returns person + deals in single response
- [x] Deals sorted correctly (open → won → lost → by update time descending)
- [x] Currency values formatted as strings
- [x] Stage/pipeline names enriched (not just IDs)
- [x] Graceful degradation when deals fetch fails
- [x] Manual testing passes all 4 test cases
- [x] Logging to Application Insights verified
- [x] **Enhancement:** Secondary sorting by `update_time` (most recent first) implemented

---

## 14. Future Enhancements

### 14.1 Caching (Post-MVP)

Implement caching for stages/pipelines:
- Use Azure Redis Cache or in-memory cache
- TTL: 1 hour
- Reduces API calls from 4 to 2 per lookup

### 14.2 Sorting by Update Time ~~(Post-MVP)~~ ✅ Implemented

~~Add secondary sorting by `update_time`:~~
- ✅ Store `updateTime` in Deal model
- ✅ Sort: `OrderBy(status).ThenByDescending(updateTime)`
- **Implementation:** Completed in commit `9b3721f` with proper DateTime parsing

### 14.3 Deal Fields Expansion (Post-MVP)

Add extended fields from Feature 33:
- Deal owner name
- Last update date
- Days in current stage
- Probability

---

**End of Spec-131a**
