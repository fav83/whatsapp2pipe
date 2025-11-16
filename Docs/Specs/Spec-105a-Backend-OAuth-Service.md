# Spec-105a: Backend OAuth Service (Azure Functions)

**Feature:** Feature 5 - Pipedrive OAuth Authentication (Backend)
**Date:** 2025-10-26
**Status:** ✅ Complete
**Implementation Date:** 2025-10-27
**Implementation Commits:** 1368e3c, 2f24914, cc5b645
**Dependencies:** Pipedrive Developer Hub app registration, Azure subscription

**📝 Implementation Note:** This specification originally described Azure Table Storage for session management. The implementation was later migrated to Azure SQL Database with Entity Framework Core (see SqlSessionService). Recent enhancements (2025-11-15):
- **Retry Logic:** Added `EnableRetryOnFailure()` for Azure SQL transient failure handling (commit 80132d9)
- **Transaction Handling:** Updated to use `ExecuteInTransactionAsync()` for compatibility with retry strategy (commit b5aad28)

---

## Implementation Split

Feature 5 (Pipedrive OAuth Authentication) is split into two independent specifications:

- **Spec-105a (This Document):** Backend OAuth Service - Azure Functions + C# + Azure Table Storage
- **Spec-105b:** Extension OAuth Integration - TypeScript + React + chrome.identity API

**Implementation Order:**
1. Spec-105a (Backend) - Can be tested independently with Postman/REST clients
2. Spec-105b (Extension) - Depends on Spec-105a backend being deployed

---

**Related Docs:**
- [BRD-001-MVP-Pipedrive-WhatsApp.md](../BRDs/BRD-001-MVP-Pipedrive-WhatsApp.md) - Section 4.2 (Pipedrive Sign-In)
- [Plan-001-MVP-Feature-Breakdown.md](../Plans/Plan-001-MVP-Feature-Breakdown.md) - Feature 5
- [Pipedrive OAuth Documentation](../External/Pipedrive/docs/marketplace-oauth-authorization.md)
- [Pipedrive Scopes Documentation](../External/Pipedrive/docs/marketplace-scopes-and-permissions-explanations.md)

---

## 1. Overview

Implement a secure OAuth 2.0 authentication backend using Azure Functions (C#) that handles Pipedrive OAuth authorization code flow, token exchange, session management, and token refresh. This service stores OAuth tokens server-side in Azure Table Storage and issues session identifiers (verification_code) to the Chrome extension.

**Why this matters:** Pipedrive's OAuth flow requires a client_secret that cannot be exposed in browser extension code. The backend ensures secure token storage and management while providing the extension with a simple session-based authentication mechanism.

**Architecture Pattern:** Backend-first authentication with session-based API (inspired by Pipechat's security model, but using REST API instead of iframe).

---

## 2. Objectives

- Implement OAuth 2.0 Authorization Code flow with Pipedrive
- Securely exchange authorization codes for access/refresh tokens
- Generate and manage session identifiers (verification_code)
- Store sessions in Azure Table Storage with 60-day TTL
- Implement automatic token refresh on 401 errors
- Provide REST API endpoints for OAuth flow
- Validate state parameters for CSRF protection
- Handle OAuth errors gracefully

---

## 3. Architecture Overview

### 3.1 Technology Stack

- **Runtime:** Azure Functions v4 with .NET 8 isolated worker model
- **Language:** C# 12
- **Storage:** Azure Table Storage (encrypted at rest by default)
- **HTTP Client:** System.Net.Http.HttpClient for Pipedrive API calls
- **OAuth Scope:** `contacts:full` (Person CRUD operations)

### 3.2 Project Structure

```
Whatsapp2pipe/
└── Backend/
    └── src/
        ├── Whatsapp2Pipe.Functions/           # Main Azure Functions project
        │   ├── Functions/
        │   │   └── AuthFunctions.cs            # OAuth endpoints
        │   ├── Models/
        │   │   ├── SessionEntity.cs            # Table Storage entity
        │   │   ├── AuthUrlResponse.cs          # /auth/start response
        │   │   └── PipedriveTokenResponse.cs   # Token exchange response
        │   ├── Services/
        │   │   ├── IPipedriveOAuthService.cs   # OAuth interface
        │   │   ├── PipedriveOAuthService.cs    # OAuth implementation
        │   │   ├── ISessionService.cs          # Session interface
        │   │   └── SessionService.cs           # Session management
        │   ├── Configuration/
        │   │   └── PipedriveConfig.cs          # Configuration model
        │   ├── host.json                       # Azure Functions host config
        │   ├── local.settings.json             # Local dev settings (gitignored)
        │   ├── .gitignore
        │   └── Whatsapp2Pipe.Functions.csproj
        └── Whatsapp2Pipe.Tests/                # Unit tests
            ├── Services/
            │   ├── PipedriveOAuthServiceTests.cs
            │   └── SessionServiceTests.cs
            └── Whatsapp2Pipe.Tests.csproj
```

### 3.3 Data Flow

```
Extension requests OAuth URL
    ↓
GET /api/auth/start
    ↓
Generate OAuth URL with:
    - client_id
    - redirect_uri (Azure Function callback)
    - scope=contacts:full
    - state=<random-guid> (CSRF protection)
    ↓
Store state in memory/cache (5-min TTL)
    ↓
Return { authUrl: "https://oauth.pipedrive.com/..." }
    ↓
Extension opens OAuth popup
    ↓
User authorizes on Pipedrive
    ↓
Pipedrive redirects to:
GET /api/auth/callback?code=xxx&state=yyy
    ↓
Validate state parameter
    ↓
Exchange code for tokens:
POST https://oauth.pipedrive.com/oauth/token
    - Authorization: Basic <base64(client_id:client_secret)>
    - Body: grant_type=authorization_code&code=xxx&redirect_uri=...
    ↓
Receive tokens:
    - access_token (expires in 60 min)
    - refresh_token (expires in 60 days if unused)
    - api_domain (e.g., "company.pipedrive.com")
    - scope, expires_in
    ↓
Generate verification_code (GUID)
    ↓
Store session in Azure Table Storage:
    - PartitionKey: verification_code
    - RowKey: verification_code
    - AccessToken, RefreshToken, ApiDomain
    - ExpiresAt, CreatedAt, LastUsedAt
    ↓
Return HTML page with:
    - JavaScript to pass verification_code to extension
    - window.close() to close popup
```

---

## 4. Functional Requirements

### 4.1 Endpoint: GET /api/auth/start

**Purpose:** Generate Pipedrive OAuth authorization URL for chrome.identity.launchWebAuthFlow()

**Request:**
```http
GET /api/auth/start
Host: <function-app>.azurewebsites.net
```

**Response (200 OK):**
```json
{
  "authUrl": "https://oauth.pipedrive.com/oauth/authorize?client_id=xxx&redirect_uri=https%3A%2F%2F<function-app>.azurewebsites.net%2Fapi%2Fauth%2Fcallback&state=<guid>&scope=contacts:full"
}
```

**Response (500 Internal Server Error):**
```json
{
  "error": "Failed to generate auth URL"
}
```

**Implementation Requirements:**
- Generate random state parameter (GUID)
- Store state with 5-minute TTL (in-memory cache or Azure Table Storage)
- Build OAuth URL with correct query parameters
- URL-encode redirect_uri
- Return JSON response

**Acceptance Criteria:**
- ✅ Generates valid Pipedrive OAuth URL
- ✅ State parameter is unique per request
- ✅ State stored for validation in callback
- ✅ Redirect URI matches Azure Function callback endpoint
- ✅ Scope is exactly "contacts:full"

---

### 4.2 Endpoint: GET /api/auth/callback

**Purpose:** Receive OAuth authorization code, exchange for tokens, create session

**Request:**
```http
GET /api/auth/callback?code=123.456.xxx&state=<guid>
Host: <function-app>.azurewebsites.net
```

**Query Parameters:**
- `code` (required) - Authorization code from Pipedrive
- `state` (required) - CSRF token for validation
- `error` (optional) - Error code if user denied authorization

**Success Response (200 OK):**
```html
<!DOCTYPE html>
<html>
<head><title>Authentication Successful</title></head>
<body>
  <h1>Signing in...</h1>
  <script>
    // Redirect to same endpoint with verification_code
    // chrome.identity.launchWebAuthFlow will capture this URL
    window.location.href = window.location.origin + window.location.pathname +
      '?verification_code=<GUID>&success=true';
    setTimeout(() => window.close(), 100);
  </script>
</body>
</html>
```

**User Denied Response (200 OK):**
```html
<!DOCTYPE html>
<html>
<head><title>Authentication Cancelled</title></head>
<body>
  <h1>Authentication cancelled</h1>
  <script>
    window.location.href = window.location.origin + window.location.pathname +
      '?error=user_denied';
    setTimeout(() => window.close(), 100);
  </script>
</body>
</html>
```

**Error Response (200 OK):**
```html
<!DOCTYPE html>
<html>
<head><title>Authentication Failed</title></head>
<body>
  <h1>Authentication failed</h1>
  <script>
    window.location.href = window.location.origin + window.location.pathname +
      '?error=auth_failed';
    setTimeout(() => window.close(), 100);
  </script>
</body>
</html>
```

**Implementation Requirements:**
1. **Validate State Parameter:**
   - Check if state exists in cache/storage
   - Reject if missing or invalid (CSRF attack)
   - Delete state after validation (one-time use)

2. **Handle User Denial:**
   - If `error=user_denied` in query params, return user denial HTML
   - No token exchange needed

3. **Exchange Authorization Code:**
   - POST to `https://oauth.pipedrive.com/oauth/token`
   - Headers: `Authorization: Basic <base64(client_id:client_secret)>`
   - Content-Type: `application/x-www-form-urlencoded`
   - Body: `grant_type=authorization_code&code=<code>&redirect_uri=<redirect_uri>`
   - Handle 5-minute code expiration

4. **Create Session:**
   - Generate verification_code (GUID)
   - Parse token response: access_token, refresh_token, api_domain, expires_in, scope
   - Calculate ExpiresAt = DateTime.UtcNow.AddSeconds(expires_in)
   - Store in Azure Table Storage (see section 5.1)

5. **Return Success HTML:**
   - Include verification_code in redirect URL
   - JavaScript to redirect and close window

**Acceptance Criteria:**
- ✅ State parameter validated successfully
- ✅ Invalid state returns error (CSRF protection)
- ✅ User denial handled gracefully
- ✅ Authorization code exchanged for tokens
- ✅ Session created in Azure Table Storage
- ✅ verification_code returned to extension via URL
- ✅ Expired authorization codes handled with error message

---

### 4.3 Token Refresh Strategy

**Trigger:** Any Pipedrive API call that returns 401 Unauthorized (implemented in future specs)

**Implementation:**
1. Detect 401 response from Pipedrive API
2. Retrieve session from Azure Table Storage
3. Check if access token is expired (`ExpiresAt < DateTime.UtcNow`)
4. Refresh token:
   ```http
   POST https://oauth.pipedrive.com/oauth/token
   Authorization: Basic <base64(client_id:client_secret)>
   Content-Type: application/x-www-form-urlencoded

   grant_type=refresh_token&refresh_token=<refresh_token>
   ```
5. Update session in Azure Table Storage:
   - AccessToken = new_access_token
   - RefreshToken = new_refresh_token (same token, expiry extended)
   - ExpiresAt = DateTime.UtcNow.AddSeconds(expires_in)
   - LastUsedAt = DateTime.UtcNow
6. Retry original API request with new access token
7. Return result transparently to extension

**Refresh Token Expiration (60 days):**
- If refresh fails with 401/403, session is invalid
- Delete session from Azure Table Storage
- Return 401 to extension with `{ error: "session_expired" }`
- Extension must clear verification_code and prompt re-authentication

**Acceptance Criteria:**
- ✅ Access token refreshed automatically on 401 errors
- ✅ Session updated with new tokens and expiry
- ✅ Original API request retried after refresh
- ✅ Expired refresh token triggers session deletion
- ✅ Extension receives session_expired error

**Note:** Full token refresh implementation will be in Spec-106 (Pipedrive API Service Layer). This spec only defines the contract.

---

## 5. Data Models

### 5.1 Azure Table Storage Schema

**Table Name:** `PipedriveAuthSessions`

**Entity Model (C#):**
```csharp
using Azure;
using Azure.Data.Tables;

namespace Whatsapp2Pipe.Functions.Models
{
    public class SessionEntity : ITableEntity
    {
        // ITableEntity properties
        public string PartitionKey { get; set; } = default!; // verification_code
        public string RowKey { get; set; } = default!;       // verification_code (same)
        public DateTimeOffset? Timestamp { get; set; }
        public ETag ETag { get; set; }

        // Session data
        public string AccessToken { get; set; } = default!;
        public string RefreshToken { get; set; } = default!;
        public string ApiDomain { get; set; } = default!;
        public DateTime ExpiresAt { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime LastUsedAt { get; set; }
        public string Scope { get; set; } = default!; // Should be "contacts:full"
    }
}
```

**Index Strategy:**
- Primary Key: `PartitionKey` = verification_code
- RowKey: Same as PartitionKey (simple single-entity-per-partition model)
- No secondary indexes needed for MVP

**TTL/Cleanup:**
- Sessions expire after 60 days of inactivity (matching Pipedrive refresh token lifecycle)
- Manual cleanup: Periodic job queries `LastUsedAt < DateTime.UtcNow.AddDays(-60)` and deletes
- No automatic cleanup in MVP (admin script/manual task)

---

### 5.2 Response Models

**AuthUrlResponse.cs:**
```csharp
namespace Whatsapp2Pipe.Functions.Models
{
    public class AuthUrlResponse
    {
        public string AuthUrl { get; set; } = default!;
    }
}
```

**PipedriveTokenResponse.cs:**
```csharp
using System.Text.Json.Serialization;

namespace Whatsapp2Pipe.Functions.Models
{
    public class PipedriveTokenResponse
    {
        [JsonPropertyName("access_token")]
        public string AccessToken { get; set; } = default!;

        [JsonPropertyName("token_type")]
        public string TokenType { get; set; } = default!; // "bearer"

        [JsonPropertyName("refresh_token")]
        public string RefreshToken { get; set; } = default!;

        [JsonPropertyName("scope")]
        public string Scope { get; set; } = default!;

        [JsonPropertyName("expires_in")]
        public int ExpiresIn { get; set; } // Seconds (3600 = 60 minutes)

        [JsonPropertyName("api_domain")]
        public string ApiDomain { get; set; } = default!; // e.g., "company.pipedrive.com"
    }
}
```

---

## 6. Configuration & Secrets

### 6.1 Azure Function App Settings

**Environment Variables (Required):**

```
PIPEDRIVE_CLIENT_ID=<your-client-id>
PIPEDRIVE_CLIENT_SECRET=<your-client-secret>
PIPEDRIVE_REDIRECT_URI=https://<your-function-app>.azurewebsites.net/api/auth/callback
AZURE_STORAGE_CONNECTION_STRING=<connection-string>
```

**Storage:**
- ✅ Azure Function App Settings (encrypted at rest)
- ❌ Never commit to source control
- ✅ Use different values for dev/staging/prod

**Configuration Model (C#):**
```csharp
namespace Whatsapp2Pipe.Functions.Configuration
{
    public class PipedriveConfig
    {
        public string ClientId { get; set; } = default!;
        public string ClientSecret { get; set; } = default!;
        public string RedirectUri { get; set; } = default!;
        public string Scope { get; set; } = "contacts:full";
        public string AuthorizeUrl { get; set; } = "https://oauth.pipedrive.com/oauth/authorize";
        public string TokenUrl { get; set; } = "https://oauth.pipedrive.com/oauth/token";
    }
}
```

### 6.2 Local Development Settings

**local.settings.json (gitignored):**
```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "dotnet-isolated",
    "PIPEDRIVE_CLIENT_ID": "your-dev-client-id",
    "PIPEDRIVE_CLIENT_SECRET": "your-dev-client-secret",
    "PIPEDRIVE_REDIRECT_URI": "http://localhost:7071/api/auth/callback",
    "AZURE_STORAGE_CONNECTION_STRING": "UseDevelopmentStorage=true"
  }
}
```

**Note:** Use Azurite for local Table Storage emulation.

---

## 7. Service Layer Design

### 7.1 IPipedriveOAuthService

**Interface:**
```csharp
namespace Whatsapp2Pipe.Functions.Services
{
    public interface IPipedriveOAuthService
    {
        /// <summary>
        /// Generates Pipedrive OAuth authorization URL with state parameter
        /// </summary>
        Task<string> GenerateAuthUrlAsync(string state);

        /// <summary>
        /// Exchanges authorization code for access and refresh tokens
        /// </summary>
        Task<PipedriveTokenResponse> ExchangeCodeForTokensAsync(
            string code,
            string redirectUri);

        /// <summary>
        /// Refreshes access token using refresh token
        /// </summary>
        Task<PipedriveTokenResponse> RefreshAccessTokenAsync(
            string refreshToken);
    }
}
```

### 7.2 ISessionService

**Interface:**
```csharp
namespace Whatsapp2Pipe.Functions.Services
{
    public interface ISessionService
    {
        /// <summary>
        /// Stores OAuth state parameter with 5-minute TTL for CSRF validation
        /// </summary>
        Task StoreStateAsync(string state);

        /// <summary>
        /// Validates and consumes state parameter (one-time use)
        /// </summary>
        Task<bool> ValidateAndConsumeStateAsync(string state);

        /// <summary>
        /// Creates new session and returns verification_code
        /// </summary>
        Task<string> CreateSessionAsync(
            PipedriveTokenResponse tokenResponse);

        /// <summary>
        /// Retrieves session by verification_code
        /// </summary>
        Task<SessionEntity?> GetSessionAsync(string verificationCode);

        /// <summary>
        /// Updates session with new tokens after refresh
        /// </summary>
        Task UpdateSessionAsync(SessionEntity session);

        /// <summary>
        /// Deletes session (sign-out or expired refresh token)
        /// </summary>
        Task DeleteSessionAsync(string verificationCode);
    }
}
```

---

## 8. Error Handling

### 8.1 Error Scenarios

| Error Scenario | HTTP Status | Response | Log Level |
|----------------|-------------|----------|-----------|
| User denies authorization | 200 OK | HTML with `?error=user_denied` | Information |
| Invalid state parameter (CSRF) | 200 OK | HTML with `?error=invalid_state` | Warning |
| Authorization code expired | 200 OK | HTML with `?error=invalid_code` | Warning |
| Token exchange fails | 200 OK | HTML with `?error=auth_failed` | Error |
| Pipedrive API timeout | 200 OK | HTML with `?error=timeout` | Error |
| Missing configuration | 500 | JSON error | Critical |
| Azure Table Storage error | 500 | JSON error | Error |

**Note:** OAuth callback returns 200 OK with error in query param because chrome.identity.launchWebAuthFlow() captures the redirect URL regardless of HTTP status.

### 8.2 Logging Strategy

**Comprehensive Logging:** All HTTP requests/responses are automatically logged via the `HttpRequestLogger` service. See [Spec-127-Comprehensive-Backend-Logging.md](Spec-127-Comprehensive-Backend-Logging.md) for complete logging architecture.

**OAuth-Specific Events to Log:**
- ✅ OAuth flow start (state generated)
- ✅ OAuth callback received (code, state)
- ✅ State validation result
- ✅ Token exchange success/failure
- ✅ Session creation
- ✅ Token refresh events
- ❌ Never log: access_token, refresh_token, client_secret, authorization code

**Log Levels:**
- Information: Normal flow (auth start, callback success, session created)
- Warning: User denial, invalid state, expired code
- Error: Token exchange failures, API timeouts, storage errors
- Critical: Missing configuration, unhandled exceptions

**Function Pattern:**
```csharp
[Function("AuthCallback")]
public async Task<HttpResponseData> Run(
    [HttpTrigger] HttpRequestData req,
    HttpRequestLogger httpRequestLogger)
{
    // Request logging (automatic)
    await httpRequestLogger.LogRequestAsync(req);

    // OAuth logic...
    var result = await processOAuthCallback(code, state);

    // Response logging (required)
    var response = req.CreateResponse(HttpStatusCode.OK);
    httpRequestLogger.LogResponse("AuthCallback", 200, result);

    return response;
}
```

**What's Logged:**
- All HTTP requests → Application Insights `customEvents` table
- All HTTP responses → Application Insights `traces` table
- No sampling - 100% of traffic captured
- Correlation IDs for distributed tracing

---

## 9. Security Considerations

### 9.1 CSRF Protection

**Implementation:**
1. Generate random state parameter (GUID) in `/api/auth/start`
2. Store state in Azure Table Storage or in-memory cache with 5-minute TTL
3. Include state in OAuth URL query parameter
4. Pipedrive returns state unchanged in callback
5. Validate state matches stored value in `/api/auth/callback`
6. Delete state after validation (one-time use)
7. Reject callback if state missing, invalid, or expired

**Acceptance Criteria:**
- ✅ State parameter generated and stored for each auth request
- ✅ State validated in callback before token exchange
- ✅ Invalid state rejected with error
- ✅ State consumed after first use (cannot replay)

### 9.2 Token Security

**Best Practices:**
- ✅ Access/refresh tokens stored in Azure Table Storage (encrypted at rest)
- ✅ Client secret stored in Azure App Settings (encrypted)
- ✅ HTTPS enforced for all endpoints
- ✅ Tokens never logged or returned to extension
- ✅ verification_code is unpredictable GUID (not sequential)
- ✅ Authorization code exchanged immediately (5-min expiry)

### 9.3 Session Security

**Session Lifecycle:**
- Created: On successful OAuth callback
- Used: On each Pipedrive API call (updates LastUsedAt)
- Expired: After 60 days of inactivity
- Revoked: On user sign-out or refresh token expiration

**verification_code Properties:**
- Format: GUID (Guid.NewGuid())
- Entropy: 128 bits (unguessable)
- Stored: Extension chrome.storage.local, Backend Azure Table Storage
- Transmitted: HTTPS only

---

## 10. Testing Strategy

### 10.1 Unit Tests

**Test Coverage (Whatsapp2Pipe.Tests):**

**PipedriveOAuthServiceTests:**
- ✅ GenerateAuthUrlAsync includes all required parameters
- ✅ GenerateAuthUrlAsync URL-encodes redirect_uri
- ✅ ExchangeCodeForTokensAsync builds correct HTTP request
- ✅ ExchangeCodeForTokensAsync includes Basic Auth header
- ✅ ExchangeCodeForTokensAsync parses token response correctly
- ✅ RefreshAccessTokenAsync builds correct refresh request
- ✅ RefreshAccessTokenAsync handles 401 errors (expired refresh token)

**SessionServiceTests:**
- ✅ StoreStateAsync stores state with TTL
- ✅ ValidateAndConsumeStateAsync returns true for valid state
- ✅ ValidateAndConsumeStateAsync returns false for invalid state
- ✅ ValidateAndConsumeStateAsync deletes state after validation
- ✅ CreateSessionAsync generates unique verification_code
- ✅ CreateSessionAsync stores session in Table Storage
- ✅ GetSessionAsync retrieves session by verification_code
- ✅ GetSessionAsync returns null for non-existent session
- ✅ UpdateSessionAsync updates tokens and ExpiresAt
- ✅ DeleteSessionAsync removes session from storage

**Mocking:**
- HttpClient for Pipedrive API calls
- TableClient for Azure Table Storage operations

### 10.2 Integration Tests

**End-to-End OAuth Flow (Manual):**
1. ✅ Call `/api/auth/start`, verify OAuth URL format
2. ✅ Open OAuth URL in browser, authorize with Pipedrive sandbox
3. ✅ Verify callback receives code and state
4. ✅ Verify tokens exchanged successfully
5. ✅ Verify session created in Azure Table Storage
6. ✅ Verify verification_code returned in redirect URL

**Error Scenarios:**
1. ✅ Invalid state parameter → Error returned
2. ✅ User clicks "Cancel" → user_denied error
3. ✅ Expired authorization code → invalid_code error
4. ✅ Invalid client_id/client_secret → auth_failed error

**Token Refresh (Manual):**
1. ✅ Create session with valid tokens
2. ✅ Manually expire access token (set ExpiresAt in past)
3. ✅ Trigger refresh (will be tested in Spec-106)
4. ✅ Verify new tokens stored in session

### 10.3 Load Testing (Post-MVP)

**Not required for MVP, but consider:**
- Concurrent OAuth flows (state collision risk)
- Table Storage throughput limits
- Azure Functions cold start times

---

## 11. Deployment & DevOps

### 11.1 Azure Resources Required

**Resource Group:** `rg-whatsapp2pipe-<env>`

**Azure Function App:**
- Name: `func-whatsapp2pipe-<env>`
- Runtime: .NET 8 Isolated
- Plan: Consumption (serverless)
- Region: (Your preferred region)

**Azure Storage Account:**
- Name: `stwhatsapp2pipe<env>`
- Purpose: Table Storage for sessions
- Replication: LRS (Locally-redundant storage)
- Table: `PipedriveAuthSessions`

**Application Insights:**
- Name: `appi-whatsapp2pipe-<env>`
- Purpose: Logging and monitoring

### 11.2 Deployment Pipeline (Future)

**Not required for MVP, but recommended for production:**
- GitHub Actions or Azure DevOps pipeline
- Automated build and deployment
- Environment-specific configurations (dev/staging/prod)
- Automated tests in CI/CD

**Manual Deployment (MVP):**
- Publish from Visual Studio or VS Code
- Use Azure Functions Core Tools CLI
- Manually configure App Settings in Azure Portal

### 11.3 Monitoring

**Key Metrics (Application Insights):**
- OAuth flow success rate
- Token exchange failures
- Token refresh success rate
- Average session duration
- Active sessions count
- API response times

**Alerts (Post-MVP):**
- Token exchange failure rate > 5%
- Azure Table Storage errors
- Function execution failures

---

## 12. Dependencies

### 12.1 External Dependencies

**Pipedrive:**
- ✅ Developer Hub account created
- ✅ App registered with OAuth 2.0
- ✅ Client ID and Client Secret obtained
- ✅ Redirect URI registered: `https://<function-app>.azurewebsites.net/api/auth/callback`
- ✅ Scope `contacts:full` enabled

**Azure:**
- ✅ Azure subscription
- ✅ Resource group created
- ✅ Function App deployed
- ✅ Storage Account with Table Storage
- ✅ Application Insights configured

### 12.2 NuGet Packages

**Whatsapp2Pipe.Functions.csproj:**
```xml
<ItemGroup>
  <PackageReference Include="Microsoft.Azure.Functions.Worker" Version="1.21.0" />
  <PackageReference Include="Microsoft.Azure.Functions.Worker.Extensions.Http" Version="3.1.0" />
  <PackageReference Include="Microsoft.Azure.Functions.Worker.Sdk" Version="1.17.0" />
  <PackageReference Include="Azure.Data.Tables" Version="12.8.3" />
  <PackageReference Include="Microsoft.ApplicationInsights.WorkerService" Version="2.22.0" />
  <PackageReference Include="Microsoft.Extensions.Configuration" Version="8.0.0" />
  <PackageReference Include="Microsoft.Extensions.DependencyInjection" Version="8.0.0" />
</ItemGroup>
```

**Whatsapp2Pipe.Tests.csproj:**
```xml
<ItemGroup>
  <PackageReference Include="Microsoft.NET.Test.Sdk" Version="17.9.0" />
  <PackageReference Include="xUnit" Version="2.6.6" />
  <PackageReference Include="xunit.runner.visualstudio" Version="2.5.6" />
  <PackageReference Include="Moq" Version="4.20.70" />
  <PackageReference Include="FluentAssertions" Version="6.12.0" />
</ItemGroup>
```

---

## 13. Acceptance Criteria (Spec-105a Complete)

### 13.1 Functional Requirements

- ✅ `GET /api/auth/start` returns valid Pipedrive OAuth URL
- ✅ State parameter generated and stored with 5-min TTL
- ✅ `GET /api/auth/callback` validates state parameter
- ✅ Authorization code exchanged for access/refresh tokens
- ✅ Session created in Azure Table Storage with verification_code
- ✅ verification_code returned to extension via redirect URL
- ✅ User denial handled gracefully (error=user_denied)
- ✅ Invalid state rejected (CSRF protection)
- ✅ Token refresh logic implemented (contract defined)

### 13.2 Non-Functional Requirements

- ✅ All secrets stored in Azure App Settings (not in code)
- ✅ HTTPS enforced for all endpoints
- ✅ Tokens never logged or exposed
- ✅ Unit tests with >80% code coverage
- ✅ Integration tests pass with Pipedrive sandbox
- ✅ Deployed to Azure (dev/staging environment)
- ✅ Application Insights logging configured

### 13.3 Testing Verification

**Manual Test Checklist:**
- [ ] Call `/api/auth/start`, verify OAuth URL format
- [ ] Open OAuth URL, complete authorization with Pipedrive sandbox
- [ ] Verify callback receives code and state
- [ ] Verify verification_code returned in redirect URL
- [ ] Check Azure Table Storage for session entity
- [ ] Verify session contains access_token, refresh_token, api_domain
- [ ] Test user denial flow (click "Cancel" on Pipedrive)
- [ ] Test invalid state parameter (CSRF protection)
- [ ] Test expired authorization code (wait 6 minutes)

---

## 14. Out of Scope (Deferred to Later Specs)

The following are explicitly **not** part of Spec-105a:

- ❌ Pipedrive API service layer (Spec-106)
- ❌ Person lookup/search/create endpoints (Spec-106)
- ❌ Extension UI integration (Spec-105b)
- ❌ chrome.identity.launchWebAuthFlow implementation (Spec-105b)
- ❌ Sign-out endpoint (Future spec)
- ❌ Session status check endpoint (Future spec)
- ❌ Automated session cleanup job (Post-MVP)
- ❌ Rate limiting (Post-MVP)
- ❌ CI/CD pipeline (Post-MVP)

---

## 15. Next Steps

After Spec-105a completion:

1. **Spec-105b:** Extension OAuth Integration
   - Implement chrome.identity.launchWebAuthFlow()
   - Store verification_code in chrome.storage.local
   - Build authentication UI states

2. **Spec-106:** Pipedrive API Service Layer
   - Build authenticated API client using verification_code
   - Implement Person lookup, search, create endpoints
   - Integrate token refresh in API calls

---

## 16. References

- [Pipedrive OAuth Authorization Guide](../External/Pipedrive/docs/marketplace-oauth-authorization.md)
- [Pipedrive Scopes and Permissions](../External/Pipedrive/docs/marketplace-scopes-and-permissions-explanations.md)
- [Azure Functions Isolated Worker](https://learn.microsoft.com/en-us/azure/azure-functions/dotnet-isolated-process-guide)
- [Azure Table Storage SDK](https://learn.microsoft.com/en-us/azure/storage/tables/table-storage-quickstart-portal)
- [OAuth 2.0 RFC 6749](https://tools.ietf.org/html/rfc6749)

---

## 17. Implementation Summary

### Completion Status
✅ **Completed on 2025-10-27**

### Implementation Commits
1. **1368e3c** - Initial backend OAuth service implementation
   - Azure Functions project setup
   - AuthStart and AuthCallback endpoints
   - OAuth service and Table Storage integration
   - Session and state management

2. **2f24914** - Bug fixes and workspace configuration
   - Fixed verification code extraction
   - Added VSCode Azure Functions workspace config

3. **cc5b645** - OAuth state management enhancements
   - Added OAuthState model and validation
   - Implemented dynamic extension ID support
   - Added CORS configuration for WhatsApp origins
   - Enhanced security with state validation

### Key Achievements
✅ All endpoints implemented and tested
✅ OAuth flow working with Pipedrive
✅ Session management with Azure Table Storage
✅ CSRF protection via state validation
✅ Dynamic extension ID support (no hardcoding)
✅ Automatic popup closure via chromiumapp.org redirect
✅ CORS configured for WhatsApp Web
✅ Comprehensive error handling and logging

### Files Implemented
- ✅ `Functions/AuthStartFunction.cs` - OAuth initialization endpoint
- ✅ `Functions/AuthCallbackFunction.cs` - OAuth callback handler
- ✅ `Services/OAuthService.cs` - Pipedrive OAuth integration
- ✅ `Services/TableStorageService.cs` - Session/state storage
- ✅ `Services/OAuthStateValidator.cs` - State validation and security
- ✅ `Models/` - All data models (OAuthState, Session, State, Responses)
- ✅ `Configuration/` - Settings classes for Pipedrive and Azure

### Build Status
✅ Production build successful (no errors/warnings)
✅ Ready for Azure deployment

### Testing Status
- ✅ Manual testing with Postman completed
- ✅ OAuth flow validated end-to-end
- ✅ State validation tested
- ✅ Error handling verified
- [ ] Azure deployment testing pending
- [ ] End-to-end testing with extension pending

### Deployment Checklist
- [x] Code implementation complete
- [x] Local testing completed
- [ ] Azure Function App deployed
- [ ] Environment variables configured in Azure
- [ ] Application Insights configured
- [ ] CORS verified in production
- [ ] Integration testing with extension

---

**Status:** ✅ Complete - Deployed and tested locally
**Owner:** Backend team
**Actual Effort:** 3 days (implementation + state management enhancements)
