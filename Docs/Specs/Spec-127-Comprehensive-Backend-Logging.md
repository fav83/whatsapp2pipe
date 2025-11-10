# Spec-127: Comprehensive Backend Logging Enhancement

**Status:** ✅ Complete (Implemented)
**Created:** 2025-01-09
**Updated:** 2025-01-10

## Overview

This specification enhances the backend logging system to provide complete visibility into all HTTP traffic and Pipedrive API interactions. It builds upon Spec-126 (HTTP Request Logging) by adding HTTP response logging and fixing Application Insights configuration to ensure all ILogger traces are captured.

## Goals

1. **Complete HTTP Traffic Visibility**: Log all inbound requests (✅ done) AND all outbound responses
2. **Pipedrive API Transparency**: Ensure all Pipedrive API calls are logged and visible in Application Insights
3. **Zero Sampling**: Capture every single request/response without sampling or filtering
4. **No PII Filtering**: Log all data as-is for maximum debugging capability
5. **Fix ILogger Integration**: Resolve configuration issues preventing traces from appearing in Application Insights
6. **Always Enabled**: Logging must be enabled in all environments with no disable options

## Current State

### What's Working ✅

**HTTP Request Logging (Spec-126):**
- Custom events in Application Insights (`customEvents` table)
- Captures: Method, URL, Headers (JSON), Body, Timestamp
- Successfully logs all inbound requests
- Queryable with KQL

**Pipedrive API Logging (Existing):**
- `PipedriveApiLogger` service implemented
- Logs requests and responses using `ILogger.LogInformation()`
- Captures: Method, URL, Headers (sanitized), Body, Status Code

### What's Not Working ❌

**ILogger Traces Missing:**
- Despite `PipedriveApiLogger` and functions using `ILogger`, traces don't appear in Application Insights
- Only generic Azure Functions execution traces visible
- Root cause: .NET 8 isolated worker logging configuration issues

**No Response Logging:**
- HTTP responses are not logged at all
- No visibility into what the backend returns to clients
- Can't correlate request → response for debugging

**Sampling Enabled:**
- Current `host.json` has sampling enabled
- Violates requirement to log every single request

## Architecture

### Logging Components

```
┌─────────────────────────────────────────────────────────────┐
│                    HTTP Request Flow                        │
└─────────────────────────────────────────────────────────────┘

1. Inbound Request
   ↓
   [HttpRequestLogger.LogRequestAsync()]
   ↓
   Application Insights → customEvents table
   ✅ Already implemented (Spec-126)

2. Function Processing
   ↓
   [Function logic with ILogger calls]
   ↓
   Application Insights → traces table
   ⚠️ Not working - needs config fix

3. Pipedrive API Call
   ↓
   [PipedriveApiLogger.LogRequest() / LogResponse()]
   ↓
   Application Insights → traces table
   ⚠️ Not working - needs config fix

4. Outbound Response
   ↓
   [HttpRequestLogger.LogResponse()]
   ↓
   Application Insights → traces table
   ❌ Not implemented yet
```

### Technology Stack

- **Custom Events**: Application Insights `customEvents` table (for inbound requests)
- **Structured Logging**: `ILogger` → Application Insights `traces` table (for responses and Pipedrive)
- **Correlation**: Operation IDs for distributed tracing
- **Serialization**: `System.Text.Json` for JSON formatting
- **Service Registration**: Scoped service in DI container

## Implementation Design

### Part 1: Fix Application Insights Configuration

**Problem:** ILogger traces don't reach Application Insights due to configuration issues in .NET 8 isolated worker.

**Solution:** Three-part configuration fix:

#### 1.1 Disable Sampling in `host.json`

**File:** `Backend/WhatsApp2Pipe.Api/host.json`

**Changes:**
```json
{
  "version": "2.0",
  "logging": {
    "applicationInsights": {
      "samplingSettings": {
        "isEnabled": false  // ← Changed from true
      },
      "enableLiveMetricsFilters": true
    },
    "logLevel": {
      "default": "Information",
      "Microsoft.AspNetCore": "Warning",
      "WhatsApp2Pipe.Api": "Information",           // ← New
      "WhatsApp2Pipe.Api.Functions": "Information", // ← New
      "WhatsApp2Pipe.Api.Services": "Information"   // ← New
    }
  },
  // ... rest unchanged
}
```

**Rationale:**
- `isEnabled: false` - Disables sampling to ensure every log is captured
- Explicit log categories - Ensures our custom namespaces are logged at Information level

#### 1.2 Configure Logging in `Program.cs`

**File:** `Backend/WhatsApp2Pipe.Api/Program.cs`

**Add using:**
```csharp
using Microsoft.Extensions.Logging;
```

**Add configuration** (after `ConfigureFunctionsApplicationInsights()`):
```csharp
services.AddApplicationInsightsTelemetryWorkerService();
services.ConfigureFunctionsApplicationInsights();

// Configure logging to ensure all ILogger output reaches Application Insights
services.Configure<LoggerFilterOptions>(options =>
{
    // Remove default filter that might suppress logs
    var defaultRule = options.Rules.FirstOrDefault(rule =>
        rule.ProviderName == "Microsoft.Extensions.Logging.ApplicationInsights.ApplicationInsightsLoggerProvider");
    if (defaultRule != null)
    {
        options.Rules.Remove(defaultRule);
    }
});
```

**Rationale:**
- Removes default Application Insights logger filter that may suppress Information-level logs
- Ensures all `ILogger` calls reach Application Insights traces table

### Part 2: HTTP Response Logging

**Problem:** No visibility into HTTP responses sent to clients.

**Solution:** Extend `HttpRequestLogger` service with response logging methods.

#### 2.1 Add Response Logging Methods

**File:** `Backend/WhatsApp2Pipe.Api/Services/HttpRequestLogger.cs`

**New methods to add:**

```csharp
/// <summary>
/// Log HTTP response with status code only (for simple responses)
/// </summary>
public void LogResponse(string functionName, int statusCode)
{
    try
    {
        logger.LogInformation(
            "[HTTP Response] Function: {FunctionName}, Status: {StatusCode}, Body: None",
            functionName,
            statusCode
        );
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "[HttpRequestLogger] Failed to log HTTP response");
    }
}

/// <summary>
/// Log HTTP response with JSON object body
/// </summary>
public void LogResponse(string functionName, int statusCode, object responseData)
{
    try
    {
        var bodyJson = JsonSerializer.Serialize(responseData);
        logger.LogInformation(
            "[HTTP Response] Function: {FunctionName}, Status: {StatusCode}, Body: {Body}",
            functionName,
            statusCode,
            bodyJson
        );
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "[HttpRequestLogger] Failed to log HTTP response");
    }
}

/// <summary>
/// Log HTTP response with pre-serialized string body
/// </summary>
public void LogResponse(string functionName, int statusCode, string responseBody)
{
    try
    {
        logger.LogInformation(
            "[HTTP Response] Function: {FunctionName}, Status: {StatusCode}, Body: {Body}",
            functionName,
            statusCode,
            responseBody
        );
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "[HttpRequestLogger] Failed to log HTTP response");
    }
}

/// <summary>
/// Log HTTP response with full details (status, headers, body)
/// </summary>
public void LogResponse(string functionName, int statusCode, Dictionary<string, string>? headers, object? responseData)
{
    try
    {
        var headersJson = headers != null ? JsonSerializer.Serialize(headers) : "None";
        var bodyJson = responseData != null ? JsonSerializer.Serialize(responseData) : "None";

        logger.LogInformation(
            "[HTTP Response] Function: {FunctionName}, Status: {StatusCode}, Headers: {Headers}, Body: {Body}",
            functionName,
            statusCode,
            headersJson,
            bodyJson
        );
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "[HttpRequestLogger] Failed to log HTTP response");
    }
}
```

**Design Decisions:**

1. **Multiple Overloads**: Different methods for different response types (status-only, with object, with string, with headers)
2. **Synchronous**: `ILogger` is synchronous, no async needed
3. **Error Handling**: All exceptions caught and swallowed (logged but don't impact function)
4. **Structured Logging**: Uses ILogger placeholders (`{FunctionName}`) for queryable fields
5. **JSON Serialization**: Automatically serializes objects for logging
6. **Consistent Format**: All logs start with `[HTTP Response]` prefix for easy filtering

#### 2.2 Function Integration Pattern

**Usage Pattern 1: Simple Status Response**
```csharp
[Function("MyFunction")]
public async Task<HttpResponseData> Run([HttpTrigger] HttpRequestData req)
{
    await httpRequestLogger.LogRequestAsync(req);

    // ... function logic

    var response = req.CreateResponse(HttpStatusCode.OK);
    httpRequestLogger.LogResponse("MyFunction", 200);
    return response;
}
```

**Usage Pattern 2: JSON Object Response**
```csharp
[Function("MyFunction")]
public async Task<HttpResponseData> Run([HttpTrigger] HttpRequestData req)
{
    await httpRequestLogger.LogRequestAsync(req);

    // ... function logic
    var data = new { message = "Success", userId = 123 };

    var response = req.CreateResponse(HttpStatusCode.OK);
    response.Headers.Add("Content-Type", "application/json");
    var json = JsonSerializer.Serialize(data);
    await response.WriteStringAsync(json);

    httpRequestLogger.LogResponse("MyFunction", 200, data);
    return response;
}
```

**Usage Pattern 3: Error Response**
```csharp
catch (Exception ex)
{
    logger.LogError(ex, "[MyFunction] Error processing request");
    var response = req.CreateResponse(HttpStatusCode.InternalServerError);
    httpRequestLogger.LogResponse("MyFunction", 500);
    return response;
}
```

### Part 3: Pipedrive Logging Enhancement

**Current State:** `PipedriveApiLogger` already logs comprehensively but traces don't appear in Application Insights.

**Solution:** No code changes needed for `PipedriveApiLogger` - the configuration fixes in Part 1 will make existing logs visible.

**Verification:**
After deploying Part 1 fixes, the following logs should appear in Application Insights traces:

```
[Pipedrive API Request] Method: GET, URL: https://api.pipedrive.com/v1/persons/search?..., Headers: {...}, Body: None
[Pipedrive API Response] Method: GET, URL: https://api.pipedrive.com/v1/persons/search?..., Status: 200, Body: {...}
```

## Data Schema

### Application Insights Traces (ILogger)

**Log Entry Format:**

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `timestamp` | datetime | UTC timestamp | `2025-01-09T14:30:00.000Z` |
| `message` | string | Log message with placeholders | `[HTTP Response] Function: {FunctionName}, Status: {StatusCode}, Body: {Body}` |
| `severityLevel` | int | Log level (1=Info, 3=Error) | `1` |
| `customDimensions.FunctionName` | string | Function name | `"PipedrivePersonsSearch"` |
| `customDimensions.StatusCode` | int | HTTP status code | `200` |
| `customDimensions.Body` | string | JSON response body | `"[{\"id\":123,\"name\":\"John\"}]"` |
| `customDimensions.Headers` | string | JSON headers (optional) | `"{\"Content-Type\":\"application/json\"}"` |
| `operation_Id` | string | Correlation ID | `"5bdd8ceafe3b91650b10d2b74674ff2"` |

## KQL Queries

### View All HTTP Responses

```kql
traces
| where message startswith "[HTTP Response]"
| project
    timestamp,
    operation_Id,
    FunctionName = customDimensions.FunctionName,
    StatusCode = customDimensions.StatusCode,
    Body = customDimensions.Body,
    Headers = customDimensions.Headers
| order by timestamp desc
```

### View All Pipedrive API Calls

```kql
traces
| where message contains "Pipedrive API"
| project
    timestamp,
    operation_Id,
    message,
    Method = customDimensions.Method,
    Url = customDimensions.Url,
    StatusCode = customDimensions.StatusCode,
    Body = customDimensions.Body
| order by timestamp desc
```

### Correlate Request → Response

```kql
let operationId = "5bdd8ceafe3b91650b10d2b74674ff2"; // Replace with actual operation_Id
union
    (customEvents | where name == "HttpRequest" and operation_Id == operationId),
    (traces | where message startswith "[HTTP Response]" and operation_Id == operationId)
| project timestamp, type = itemType, details = customDimensions
| order by timestamp asc
```

### Find Failed Responses (4xx/5xx)

```kql
traces
| where message startswith "[HTTP Response]"
| where toint(customDimensions.StatusCode) >= 400
| project
    timestamp,
    operation_Id,
    FunctionName = customDimensions.FunctionName,
    StatusCode = customDimensions.StatusCode,
    Body = customDimensions.Body
| order by timestamp desc
```

### Count Responses by Function and Status

```kql
traces
| where message startswith "[HTTP Response]"
| extend
    FunctionName = tostring(customDimensions.FunctionName),
    StatusCode = toint(customDimensions.StatusCode)
| summarize Count = count() by FunctionName, StatusCode
| order by FunctionName asc, StatusCode asc
```

## Functions to Update

All 9 HTTP-triggered functions need response logging:

1. ✅ **AuthCallbackFunction** - `/api/auth/callback`
2. ✅ **AuthStartFunction** - `/api/auth/start`
3. ✅ **FeedbackFunction** - `/api/feedback`
4. ✅ **GetConfigFunction** - `/api/config`
5. ✅ **GetCurrentUserFunction** - `/api/user`
6. ✅ **PipedrivePersonsAttachPhoneFunction** - `/api/pipedrive/persons/{id}/attach-phone`
7. ✅ **PipedrivePersonsCreateFunction** - `/api/pipedrive/persons`
8. ✅ **PipedrivePersonsSearchFunction** - `/api/pipedrive/persons/search`
9. ✅ **WaitlistFunction** - `/api/waitlist`
10. ✅ **StatusFunction** - `/api/status`
11. ❌ **OptionsFunction** - Skip (CORS preflight, already skipped in Spec-126)

## Error Handling

### Response Logging Failures

All exceptions in response logging methods are caught and logged:

```csharp
catch (Exception ex)
{
    logger.LogError(ex, "[HttpRequestLogger] Failed to log HTTP response");
}
```

**Important:** Function execution continues even if response logging fails.

### Serialization Errors

If `JsonSerializer.Serialize()` throws (circular references, etc.):
- Exception is caught and logged
- Function continues normally
- Response is still returned to client

## Testing Strategy

### Part 1: Configuration Testing

**Local Testing:**
1. Run Azure Functions locally: `func start`
2. Send test requests to endpoints
3. Check console output for `[HTTP Response]` and `[Pipedrive API]` logs
4. Verify logs include all expected fields

**Azure Testing:**
1. Deploy updated `host.json` and `Program.cs`
2. Trigger functions via extension or API calls
3. Query Application Insights traces table with KQL
4. Verify logs appear with structured data in `customDimensions`

### Part 2: Response Logging Testing

**Unit Tests:**
1. Test each overload of `LogResponse()` methods
2. Verify JSON serialization works for different object types
3. Test exception handling (serialization failures)
4. Verify logging doesn't throw exceptions

**Integration Tests:**
1. Update all 10 functions with response logging
2. Test each endpoint and verify response logs appear
3. Test error scenarios (401, 500, etc.) and verify error responses logged
4. Verify operation ID correlation between request and response

### Part 3: End-to-End Testing

**Scenario: Person Search Flow**
1. Extension sends search request to backend
2. Verify `customEvents` has HTTP request entry
3. Verify `traces` has Pipedrive API request entry
4. Verify `traces` has Pipedrive API response entry
5. Verify `traces` has HTTP response entry
6. All entries share same `operation_Id`

**KQL Verification:**
```kql
let operationId = "<test-operation-id>";
union
    (customEvents | where operation_Id == operationId | extend type="HttpRequest"),
    (traces | where operation_Id == operationId | extend type="Log")
| project timestamp, type, message, customDimensions
| order by timestamp asc
```

## Security Considerations

### Sensitive Data in Logs

**⚠️ CRITICAL:** This implementation logs ALL data without filtering, including:
- Authorization tokens (in request headers)
- API keys
- User credentials
- Personal information (PII): names, emails, phone numbers
- Pipedrive API responses with customer data

**Mitigation:**
- Use Log Analytics RBAC to restrict access to `traces` and `customEvents` tables
- Set appropriate data retention policies (recommend 90 days)
- Document that logs contain sensitive data in deployment notes
- Consider implementing PII redaction in future iterations if needed

### Data Retention

Configure Application Insights/Log Analytics retention:
- Default: 90 days
- Maximum: 730 days (2 years)
- Configure in: Azure Portal > Log Analytics workspace > Usage and estimated costs > Data retention

### Compliance Considerations

- **GDPR**: Logs contain personal data; document retention and access policies
- **Access Control**: Only authorized personnel should access Application Insights
- **Audit Trail**: Log Analytics provides audit trail of who queries the data

## Performance Considerations

### Logging Overhead

**Impact:**
- ILogger logging is lightweight (microseconds per call)
- JSON serialization adds ~1-5ms per response (depends on object size)
- Network latency to Application Insights: async, non-blocking

**Mitigation:**
- Response logging is synchronous but fast (no await needed)
- Exceptions are caught and don't impact function execution
- Application Insights batches telemetry for efficiency

### Storage Costs

**Estimate** (based on 1000 requests/day):
- HTTP Request logs: ~5KB per request × 1000 = 5MB/day
- HTTP Response logs: ~3KB per response × 1000 = 3MB/day
- Pipedrive API logs: ~10KB per request × 200 = 2MB/day
- **Total: ~10MB/day = 300MB/month = 3.6GB/year**

At current Azure pricing (~$2.76/GB), estimated cost: **~$10/year** for logging at this volume.

### Sampling Disabled Impact

With sampling disabled:
- **100% of logs captured** (required for debugging)
- Higher Application Insights ingestion volume
- Higher storage costs (but still minimal for this scale)
- No performance impact on functions (telemetry is async)

## Implementation Checklist

### Phase 1: Configuration Fix
- [x] Update `host.json` - Disable sampling, add log categories
- [x] Update `Program.cs` - Add LoggerFilterOptions configuration
- [x] Add `using Microsoft.Extensions.Logging;` to Program.cs
- [x] Deploy to Azure
- [x] Verify ILogger traces appear in Application Insights
- [x] Verify Pipedrive API logs are visible

### Phase 2: Response Logging Service
- [x] Add 4 overloaded `LogResponse()` methods to `HttpRequestLogger.cs`
- [x] Add `using System.Text.Json;` if needed
- [x] Add error handling (try-catch) to all methods
- [ ] Write unit tests for response logging (deferred)
- [ ] Test JSON serialization edge cases (deferred)

### Phase 3: Function Integration
- [x] Update AuthCallbackFunction - Add response logging
- [x] Update AuthStartFunction - Add response logging
- [x] Update FeedbackFunction - Add response logging
- [x] Update GetConfigFunction - Add response logging
- [x] Update GetCurrentUserFunction - Add response logging
- [x] Update PipedrivePersonsAttachPhoneFunction - Add response logging
- [x] Update PipedrivePersonsCreateFunction - Add response logging
- [x] Update PipedrivePersonsSearchFunction - Add response logging
- [x] Update WaitlistFunction - Add response logging
- [x] Update StatusFunction - Add response logging

### Phase 4: Testing & Verification
- [x] Test locally with `func start`
- [x] Deploy to Azure
- [x] Run end-to-end test scenarios
- [x] Verify all logs appear in Application Insights
- [x] Test KQL queries for request/response correlation
- [x] Document KQL queries for team (in this spec)
- [x] Verify no sampling is occurring

### Phase 5: Documentation & Deployment
- [x] Update deployment documentation with logging info (CLAUDE.md, Chrome-Extension-Architecture.md)
- [ ] Configure Log Analytics data retention (90 days) - Manual Azure Portal configuration
- [ ] Set up Log Analytics RBAC - Manual Azure Portal configuration
- [ ] Create saved KQL queries in Azure Portal - Manual Azure Portal configuration
- [ ] Train team on querying logs - Deferred until team onboarding

## Migration from Spec-126

This spec **extends** Spec-126 (HTTP Request Logging):

**Unchanged:**
- HTTP request logging via custom events (keep as-is)
- `HttpRequestLogger.LogRequestAsync()` method (unchanged)
- All functions already call `LogRequestAsync()` (no changes needed)

**New:**
- Response logging methods in `HttpRequestLogger` service
- Configuration fixes in `host.json` and `Program.cs`
- Response logging calls added to all functions

**No Breaking Changes:** Existing request logging continues to work unchanged.

## Future Enhancements

1. **Response Timing**: Calculate and log request-to-response duration
2. **PII Filtering**: Redact sensitive data (tokens, emails, phone numbers) before logging
3. **Selective Logging**: Configuration to enable/disable per endpoint or environment
4. **Log Aggregation**: Create Azure Dashboard with common queries and visualizations
5. **Alerting**: Set up alerts for error rates, slow responses, Pipedrive failures
6. **Distributed Tracing**: Enhance correlation between extension → backend → Pipedrive
7. **Structured Exception Logging**: Enhanced error logging with stack traces and context

## References

- [Spec-126: HTTP Request Logging](Spec-126-HTTP-Request-Logging.md) - Foundation for this spec
- [Application Insights for Azure Functions Isolated Worker](https://learn.microsoft.com/en-us/azure/azure-functions/dotnet-isolated-process-guide#application-insights)
- [Configure logging in host.json](https://learn.microsoft.com/en-us/azure/azure-functions/functions-host-json#logging)
- [ILogger in .NET](https://learn.microsoft.com/en-us/dotnet/core/extensions/logging)
- [KQL Query Language](https://learn.microsoft.com/en-us/azure/data-explorer/kusto/query/)
- [Application Insights Sampling](https://learn.microsoft.com/en-us/azure/azure-monitor/app/sampling)
