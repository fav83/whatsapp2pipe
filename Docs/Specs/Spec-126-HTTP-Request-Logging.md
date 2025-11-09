# Spec-126: HTTP Request Logging to Log Analytics

**Status:** ✅ Complete (Implementation Complete, Pending Commit)
**Created:** 2025-01-09
**Updated:** 2025-01-09

## Overview

This specification defines the implementation of HTTP request logging for all Azure Function endpoints. The solution captures HTTP headers and body content from inbound requests and sends them to Log Analytics via Application Insights for debugging and monitoring purposes.

## Goals

1. **Comprehensive Logging**: Capture all HTTP request data (headers and body) for all function endpoints
2. **Non-Intrusive**: Logging failures must never affect function execution
3. **Correlation-Aware**: Preserve existing operation IDs for distributed tracing
4. **Stream-Safe**: Handle request body reading without breaking function logic
5. **Centralized**: Single reusable service that all functions can use
6. **Zero Filtering**: Log all data as-is for maximum debugging capability

## Architecture

### High-Level Flow

```
┌─────────────────┐
│ HTTP Request    │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────┐
│ Azure Function Handler      │
│                             │
│ 1. Call LogRequestAsync()   │
│ 2. Continue normal logic    │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ HttpRequestLogger           │
│                             │
│ - Read body                 │
│ - Reset stream              │
│ - Collect headers           │
│ - Send to App Insights      │
│ - Swallow exceptions        │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ Application Insights        │
│                             │
│ - Custom event telemetry    │
│ - Operation ID correlation  │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ Log Analytics               │
│                             │
│ - customEvents table        │
│ - KQL queries               │
└─────────────────────────────┘
```

### Component Design

**HttpRequestLogger Service:**
- Registered as scoped service in DI container
- Injected into function constructors
- Provides `LogRequestAsync(HttpRequestData req)` method
- Uses `TelemetryClient` to send custom events
- Uses `ILogger` for internal diagnostics

## Implementation Details

### 1. HttpRequestLogger Class

**Location:** `Backend/WhatsApp2Pipe.Api/Services/HttpRequestLogger.cs`

**Dependencies:**
- `TelemetryClient` (from Application Insights)
- `ILogger<HttpRequestLogger>` (for internal logging)

**Key Methods:**

```csharp
public async Task LogRequestAsync(HttpRequestData req)
```

**Implementation Logic:**

1. **Exception Wrapper**: Entire method wrapped in try-catch that swallows all exceptions
   - Catch block logs exception using `ILogger` for diagnostics
   - Never throws - function execution always continues

2. **Body Reading**:
   - Check `req.Body.CanSeek` - if false, skip body and note in telemetry
   - Read body using `StreamReader.ReadToEndAsync()`
   - Store original position before reading
   - Reset stream: `req.Body.Position = 0` after reading
   - Truncate if body exceeds 1MB (1,048,576 bytes) with note: `[TRUNCATED - Original size: X.XX MB]`

3. **Headers Collection**:
   - Iterate `req.Headers` and build dictionary
   - Serialize to JSON string using `JsonSerializer.Serialize()`

4. **Telemetry Creation**:
   - Create `EventTelemetry` with name "HttpRequest"
   - Add properties:
     - `Method` - req.Method
     - `Url` - req.Url.ToString()
     - `Headers` - JSON string
     - `Body` - body string (or "[Body not logged - stream not seekable]")
     - `Timestamp` - DateTime.UtcNow.ToString("o")

5. **Operation ID Preservation**:
   - Extract operation ID from current Activity or telemetry context
   - Set on EventTelemetry to maintain correlation

6. **Send Telemetry**:
   - Call `telemetryClient.TrackEvent(eventTelemetry)`

### 2. Service Registration

**Location:** `Backend/WhatsApp2Pipe.Api/Program.cs`

**Addition** (after line 40):

```csharp
// Register HTTP request logger
services.AddScoped<HttpRequestLogger>();
```

### 3. Function Integration Pattern

**Constructor Injection:**

```csharp
private readonly HttpRequestLogger httpRequestLogger;

public MyFunction(
    ILogger<MyFunction> logger,
    // ... other dependencies
    HttpRequestLogger httpRequestLogger)
{
    this.logger = logger;
    // ... other assignments
    this.httpRequestLogger = httpRequestLogger;
}
```

**Handler Usage:**

```csharp
[Function("MyFunction")]
public async Task<HttpResponseData> Run(
    [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "my-route")] HttpRequestData req)
{
    // FIRST LINE: Log the request
    await httpRequestLogger.LogRequestAsync(req);

    // Rest of function logic
    logger.LogInformation("[MyFunction] Function triggered");
    // ...
}
```

## Data Schema

### Application Insights Custom Event

**Event Name:** `HttpRequest`

**Properties:**

| Property | Type | Description | Example |
|----------|------|-------------|---------|
| `Method` | string | HTTP method | `"POST"` |
| `Url` | string | Full request URL | `"https://api.chat2deal.com/api/feedback"` |
| `Headers` | string (JSON) | All request headers | `"{\"Authorization\":\"Bearer xyz\",\"Content-Type\":\"application/json\"}"` |
| `Body` | string | Request body content | `"{\"message\":\"Great app!\"}"` |
| `Timestamp` | string (ISO 8601) | UTC timestamp | `"2025-01-09T14:30:00.000Z"` |

**System Properties** (automatic):
- `operation_Id` - Correlation ID from request context
- `timestamp` - Event timestamp (from Application Insights)
- `customDimensions` - Contains all properties above

## Log Analytics Queries

### View All HTTP Requests

```kql
customEvents
| where name == "HttpRequest"
| project
    timestamp,
    operation_Id,
    Method = customDimensions.Method,
    Url = customDimensions.Url,
    Headers = customDimensions.Headers,
    Body = customDimensions.Body
| order by timestamp desc
```

### Find Requests to Specific Endpoint

```kql
customEvents
| where name == "HttpRequest"
| where customDimensions.Url contains "/feedback"
| project timestamp, operation_Id, customDimensions
| order by timestamp desc
```

### View Requests with Specific Header

```kql
customEvents
| where name == "HttpRequest"
| where customDimensions.Headers contains "Authorization"
| project timestamp, customDimensions
```

### Count Requests by Endpoint

```kql
customEvents
| where name == "HttpRequest"
| extend Url = tostring(customDimensions.Url)
| summarize RequestCount = count() by Url
| order by RequestCount desc
```

## Error Handling

### Logging Failures

All exceptions in `HttpRequestLogger.LogRequestAsync()` are caught and logged using `ILogger`:

```csharp
catch (Exception ex)
{
    logger.LogError(ex, "[HttpRequestLogger] Failed to log HTTP request - this error is swallowed to prevent impact on function execution");
}
```

**Important:** The function handler continues execution even if logging fails completely.

### Stream Reading Failures

If `req.Body.CanSeek` is `false`:
- Body reading is skipped
- Telemetry includes: `Body = "[Body not logged - stream not seekable]"`
- Function continues normally

### Large Body Handling

If body exceeds 1MB (1,048,576 bytes):
- Body is truncated to 1MB
- Truncation note appended: `[TRUNCATED - Original size: X.XX MB]`
- Prevents Application Insights from rejecting large telemetry

## Functions to Update

The following functions should be updated to include HTTP request logging:

1. ✅ **AuthCallbackFunction** - `/api/auth/callback`
2. ✅ **AuthStartFunction** - `/api/auth/start`
3. ✅ **FeedbackFunction** - `/api/feedback`
4. ✅ **GetConfigFunction** - `/api/config`
5. ✅ **GetCurrentUserFunction** - `/api/user`
6. ✅ **PipedrivePersonsAttachPhoneFunction** - `/api/pipedrive/persons/{id}/attach-phone`
7. ✅ **PipedrivePersonsCreateFunction** - `/api/pipedrive/persons`
8. ✅ **PipedrivePersonsSearchFunction** - `/api/pipedrive/persons/search`
9. ✅ **WaitlistFunction** - `/api/waitlist`
10. ❌ **OptionsFunction** - Skip (CORS preflight, no meaningful data)

## Configuration

### Required NuGet Packages

All required packages are already installed:
- ✅ `Microsoft.ApplicationInsights.WorkerService` (v2.22.0)
- ✅ `Microsoft.Azure.Functions.Worker.ApplicationInsights` (v1.2.0)

### Application Insights Settings

No additional configuration required. The existing Application Insights setup in [Program.cs](c:\myproj\whatsapp2pipe\Backend\WhatsApp2Pipe.Api\Program.cs) (lines 18-19) is sufficient:

```csharp
services.AddApplicationInsightsTelemetryWorkerService();
services.ConfigureFunctionsApplicationInsights();
```

## Testing Strategy

### Unit Tests

1. **Test Body Reading and Reset**:
   - Create test request with body
   - Call `LogRequestAsync()`
   - Verify stream position is reset to 0
   - Verify body can be read again

2. **Test Exception Handling**:
   - Mock `TelemetryClient.TrackEvent()` to throw exception
   - Verify `LogRequestAsync()` doesn't throw
   - Verify function execution continues

3. **Test Large Body Truncation**:
   - Create request with body > 1MB
   - Verify body is truncated with note

4. **Test Non-Seekable Stream**:
   - Create request with non-seekable stream
   - Verify body logging is skipped with note

### Integration Tests

1. **End-to-End Logging**:
   - Deploy to Azure
   - Send test request to `/api/feedback`
   - Query Log Analytics for event
   - Verify all properties are present

2. **Operation ID Correlation**:
   - Send request with correlation header
   - Verify `operation_Id` matches in Log Analytics

## Security Considerations

### Sensitive Data in Logs

**⚠️ IMPORTANT:** This implementation logs ALL headers and body content without filtering, including:
- Authorization tokens
- API keys
- User credentials
- Personal information (PII)

**Recommendation:**
- Use Log Analytics RBAC to restrict access to the `customEvents` table
- Set appropriate retention policies
- Consider implementing PII filtering in future iterations if needed

### Data Retention

Application Insights/Log Analytics data retention should be configured according to compliance requirements:
- Default: 90 days
- Can be extended up to 730 days
- Configure in Azure Portal > Log Analytics workspace > Usage and estimated costs > Data retention

## Future Enhancements

1. **Response Logging**: Capture response status, headers, and body
2. **PII Filtering**: Redact sensitive data (tokens, emails, phone numbers)
3. **Selective Logging**: Configuration to enable/disable per endpoint
4. **Performance Metrics**: Track request duration and size
5. **Sampling**: Log only a percentage of requests in high-traffic scenarios

## Implementation Summary

### Files Implemented

**Backend (Complete):**
- ✅ `Services/HttpRequestLogger.cs` - HTTP request logging service (3213 bytes)
- ✅ `Functions/StatusFunction.cs` - New status endpoint for version checking (1854 bytes)
- ✅ `Program.cs` - Added HttpRequestLogger service registration
- ✅ `WhatsApp2Pipe.Api.csproj` - Added Microsoft.ApplicationInsights and diagnostic source packages

**Functions Updated (9 of 9):**
- ✅ `AuthCallbackFunction.cs` - Added HTTP logging
- ✅ `AuthStartFunction.cs` - Added HTTP logging
- ✅ `FeedbackFunction.cs` - Added HTTP logging
- ✅ `GetConfigFunction.cs` - Added HTTP logging
- ✅ `GetCurrentUserFunction.cs` - Added HTTP logging
- ✅ `PipedrivePersonsAttachPhoneFunction.cs` - Added HTTP logging
- ✅ `PipedrivePersonsCreateFunction.cs` - Added HTTP logging
- ✅ `PipedrivePersonsSearchFunction.cs` - Added HTTP logging
- ✅ `WaitlistFunction.cs` - Added HTTP logging

**Extension (Version Bump):**
- ✅ `package.json` - Version 0.32.157 → 0.32.158
- ✅ `manifest.json` - Version 0.32.157 → 0.32.158

### Implementation Details

**HttpRequestLogger Service:**
- Scoped service registered in DI container
- Injected into all 9 function constructors
- Method: `LogRequestAsync(HttpRequestData req)`
- Features:
  - Reads request body (with stream reset)
  - Collects all headers
  - Sends custom event to Application Insights
  - Preserves operation ID for correlation
  - Swallows all exceptions (non-intrusive)
  - Truncates bodies > 1MB with note
  - Handles non-seekable streams gracefully

**StatusFunction Endpoint:**
- New GET /api/status endpoint
- Returns `{ "version": "X.X.X.X" }` JSON response
- Always returns 200 OK (even on errors)
- No authentication required (public endpoint)
- Uses reflection to read assembly version
- Purpose: Health check and version verification

**Application Insights Integration:**
- Event name: "HttpRequest"
- Properties logged: Method, Url, Headers (JSON), Body, Timestamp
- Automatic correlation via operation_Id
- Queryable in Log Analytics via customEvents table

**Error Handling:**
- All exceptions in LogRequestAsync caught and swallowed
- Internal errors logged using ILogger for diagnostics
- Function execution never impacted by logging failures
- Non-seekable streams: Body skipped with note
- Large bodies (>1MB): Truncated with size note

**Security Considerations:**
- ⚠️ Logs ALL headers including Authorization tokens
- ⚠️ Logs ALL body content including PII
- Requires proper Log Analytics RBAC configuration
- Recommend 90-day retention for compliance
- Future enhancement: PII filtering/redaction

### Testing Status
- ⏳ Unit tests - Not implemented (manual testing only)
- ⏳ Integration tests - Pending Azure deployment
- ⏳ Log Analytics queries - Pending verification

### Deployment Status
- ⏳ Backend deployed to Azure - Pending
- ⏳ Log Analytics verification - Pending
- ⏳ Data retention configured - Pending
- ⏳ RBAC configured - Pending
- ⏳ Git commit - Pending

### KQL Query Examples

**View All HTTP Requests:**
```kql
customEvents
| where name == "HttpRequest"
| project timestamp, operation_Id,
    Method = customDimensions.Method,
    Url = customDimensions.Url,
    Headers = customDimensions.Headers,
    Body = customDimensions.Body
| order by timestamp desc
```

**Find Feedback Submissions:**
```kql
customEvents
| where name == "HttpRequest"
| where customDimensions.Url contains "/feedback"
| project timestamp, customDimensions
| order by timestamp desc
```

**Count Requests by Endpoint:**
```kql
customEvents
| where name == "HttpRequest"
| extend Url = tostring(customDimensions.Url)
| summarize RequestCount = count() by Url
| order by RequestCount desc
```

## Implementation Checklist

- ✅ Create `HttpRequestLogger.cs` in `Services/` folder
- ✅ Register service in `Program.cs`
- ✅ Update all 9 functions (skip OptionsFunction)
- ❌ Write unit tests
- ⏳ Deploy to Azure
- ⏳ Verify logs in Log Analytics
- ⏳ Document KQL queries for team
- ⏳ Configure data retention policy
- ⏳ Set up Log Analytics RBAC

## References

- [Application Insights API for custom events](https://learn.microsoft.com/en-us/azure/azure-monitor/app/api-custom-events-metrics)
- [Azure Functions Worker with Application Insights](https://learn.microsoft.com/en-us/azure/azure-functions/dotnet-isolated-process-guide#application-insights)
- [KQL Query Language](https://learn.microsoft.com/en-us/azure/data-explorer/kusto/query/)
