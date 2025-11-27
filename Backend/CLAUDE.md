# Backend Development Guide

This document contains development guidelines specific to the Chat2Deal Azure Functions backend (.NET 8).

## Logging

**IMPORTANT:** Backend logging is always enabled in all environments with no sampling.

### HTTP Request/Response Logging

All HTTP traffic is automatically logged via `HttpRequestLogger` service:

```csharp
[Function("MyFunction")]
public async Task<HttpResponseData> Run(
    [HttpTrigger] HttpRequestData req,
    HttpRequestLogger httpRequestLogger)
{
    // Log incoming request (automatic via middleware)
    await httpRequestLogger.LogRequestAsync(req);

    // ... function logic ...

    // Log outgoing response (required in each function)
    var response = req.CreateResponse(HttpStatusCode.OK);
    httpRequestLogger.LogResponse("MyFunction", 200);
    return response;
}
```

### Response Logging Overloads

```csharp
// Simple status code only
httpRequestLogger.LogResponse("MyFunction", 200);

// With JSON object body
httpRequestLogger.LogResponse("MyFunction", 200, responseData);

// With pre-serialized string body
httpRequestLogger.LogResponse("MyFunction", 200, jsonString);

// With full details (headers + body)
httpRequestLogger.LogResponse("MyFunction", 200, headers, responseData);
```

### What's Logged

- **Requests** → Application Insights `customEvents` table
  - Method, URL, headers (JSON), body, timestamp, correlation ID
- **Responses** → Application Insights `traces` table
  - Function name, status code, headers (optional), body, correlation ID
- **Pipedrive API** → Application Insights `traces` table
  - All API requests/responses with full details

### Configuration

**WhatsApp2Pipe.Api/host.json:**
```json
{
  "logging": {
    "applicationInsights": {
      "samplingSettings": {
        "isEnabled": false  // ⚠️ CRITICAL: Disabled for complete log capture
      }
    },
    "logLevel": {
      "WhatsApp2Pipe.Api": "Information",
      "WhatsApp2Pipe.Api.Functions": "Information",
      "WhatsApp2Pipe.Api.Services": "Information"
    }
  }
}
```

**WhatsApp2Pipe.Api/Program.cs:**
```csharp
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

### Querying Logs in Application Insights

**View all HTTP responses:**
```kql
traces
| where message startswith "[HTTP Response]"
| project
    timestamp,
    operation_Id,
    FunctionName = customDimensions.FunctionName,
    StatusCode = customDimensions.StatusCode,
    Body = customDimensions.Body
| order by timestamp desc
```

**View all Pipedrive API calls:**
```kql
traces
| where message contains "Pipedrive API"
| project
    timestamp,
    operation_Id,
    Method = customDimensions.Method,
    Url = customDimensions.Url,
    StatusCode = customDimensions.StatusCode
| order by timestamp desc
```

**Correlate request → response:**
```kql
let operationId = "<operation-id>";
union
    (customEvents | where name == "HttpRequest" and operation_Id == operationId),
    (traces | where message startswith "[HTTP Response]" and operation_Id == operationId)
| project timestamp, type = itemType, details = customDimensions
| order by timestamp asc
```

### Logging Best Practices

1. **Always call `httpRequestLogger.LogResponse()` before returning responses**
2. **Use appropriate overload based on response type**
3. **Logging failures are caught and don't impact function execution**
4. **Include relevant IDs (userId, personId, etc.) in context**
5. **Add status codes when available**

### Security

- Backend logs contain ALL data (tokens, PII) - use RBAC to restrict access
- Configure Application Insights retention policies (recommend 90 days)

## Authentication

### OAuth Flow (Current Implementation)

The backend handles OAuth authentication for both extension and website users:

1. User clicks "Sign in with Pipedrive" (no invite required)
2. Backend generates OAuth URL and redirects to Pipedrive
3. User authorizes on Pipedrive
4. Backend checks if user exists in database
5. **NEW USER:** Creates user record (with optional invite link if provided)
6. **EXISTING USER:** Updates LastLoginAt timestamp
7. Backend creates session and returns verification_code
8. User is authenticated and redirected to dashboard/extension

### Key Changes in AuthCallbackFunction.cs

**Open Access Model:**
- **New users allowed** - Both extension and website users can sign in without invites
- **Invite code optional** - If provided and valid, linked to user account for tracking
- **No rejection logic** - All Pipedrive users proceed to authenticated state
- **Invite infrastructure preserved** - Database tables remain but are not enforced

## Code Style

### C# Naming Conventions

**IMPORTANT:** Follow these naming conventions:

- **Do NOT** use underscore prefix for any variables, including private fields
- Use `camelCase` for private fields, parameters, and local variables
- Use `PascalCase` for public properties, methods, and classes
- Use descriptive, meaningful names

**Examples:**

```csharp
// ❌ INCORRECT - Do not use underscore prefix
private readonly ILogger<MyClass> _logger;
private readonly IMyService _myService;

// ✅ CORRECT - Use camelCase without underscore
private readonly ILogger<MyClass> logger;
private readonly IMyService myService;

public class MyService
{
    private readonly HttpClient httpClient;  // ✅ Correct
    private readonly string apiKey;          // ✅ Correct

    public MyService(HttpClient httpClient, string apiKey)
    {
        // Use 'this.' when parameter name matches field name
        this.httpClient = httpClient;
        this.apiKey = apiKey;
    }

    public async Task<string> GetDataAsync(string id)
    {
        var result = await httpClient.GetAsync($"/api/{id}");
        return await result.Content.ReadAsStringAsync();
    }
}
```

## Documentation References

- [Spec-127-Comprehensive-Backend-Logging.md](../Docs/Specs/Spec-127-Comprehensive-Backend-Logging.md) - Complete backend logging specification
- [Pipedrive API Documentation](../Docs/External/Pipedrive/) - Pipedrive API reference materials
