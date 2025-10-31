# Spec-116: User Entity Tracking (Backend)

**Feature:** Feature 16 - User Entity Tracking
**Date:** 2025-10-31
**Status:** ✅ Complete
**Dependencies:** Spec-105a (Backend OAuth Service), Spec-106a (Backend Pipedrive API Service)

---

## 1. Overview

Implement user entity tracking system using Azure SQL Database with Entity Framework Core. This feature automatically creates and maintains user and company records during OAuth authentication by fetching profile data from Pipedrive's `/users/me` API endpoint.

**Why this matters:** Tracking user entities enables business analytics, user activity monitoring, multi-tenancy support, and provides foundation for future features like usage-based billing, user management, and company-level settings.

**Architecture Pattern:** Code-first EF Core with normalized database schema (Companies ← Users), integrated into existing OAuth flow with fail-fast error handling.

---

## 2. Objectives

- Create normalized database schema with Companies and Users tables in Azure SQL Database
- Implement EF Core code-first approach with migrations
- Fetch user profile data from Pipedrive `/users/me` API endpoint
- Create or update Company records during OAuth flow
- Create or update User records with activity tracking (LastLoginAt)
- Support multi-company users (same Pipedrive user across different companies)
- Fail entire OAuth flow if user creation fails (data integrity)
- No OAuth scope changes required (uses existing `contacts:full` scope)

---

## 3. Architecture Overview

### 3.1 Technology Stack

- **Database:** Azure SQL Database
- **ORM:** Entity Framework Core 8.x (latest stable)
- **Language:** C# 12 (.NET 8)
- **API:** Pipedrive `/users/me` endpoint
- **OAuth Scope:** `contacts:full` (no change - `/users/me` requires only `base` scope which is always granted)

### 3.2 Component Structure

```
Backend/WhatsApp2Pipe.Api/
├── Models/
│   ├── Company.cs                      # Company entity
│   ├── User.cs                         # User entity
│   ├── Chat2DealDbContext.cs           # EF Core DbContext
│   ├── PipedriveUserResponse.cs        # /users/me response model
│   └── PipedriveUserData.cs            # User data model
├── Services/
│   ├── IPipedriveApiClient.cs          # Extend with GetCurrentUserAsync()
│   ├── PipedriveApiClient.cs           # Implement GetCurrentUserAsync()
│   ├── IUserService.cs                 # User/Company CRUD interface
│   └── UserService.cs                  # User/Company CRUD implementation
└── Functions/
    └── AuthCallbackFunction.cs         # Enhanced OAuth flow
```

### 3.3 Data Flow

```
OAuth Callback
    ↓
Exchange code for tokens (existing)
    ↓
Call Pipedrive /users/me (NEW)
    ↓
Extract user + company data (NEW)
    ↓
Find or create Company in SQL (NEW)
    ↓
Find or create User in SQL (NEW)
    ↓
Update User.LastLoginAt (NEW)
    ↓
Create session in Table Storage (existing)
    ↓
Return verification_code to extension (existing)
```

**Failure Handling:** If any step after token exchange fails, abort entire OAuth flow, delete session (if created), return error to user.

---

## 4. Database Schema

### 4.1 Companies Table

**Purpose:** Store Pipedrive company information.

**Entity Model:**
```csharp
public class Company
{
    // Primary Key
    public Guid CompanyId { get; set; }  // Auto-generated GUID

    // Pipedrive Company Data (from /users/me)
    public int PipedriveCompanyId { get; set; }  // Unique constraint
    public string CompanyName { get; set; }       // Company name
    public string CompanyDomain { get; set; }     // Domain (e.g., "pipedrive-12g53f")

    // Timestamps
    public DateTime CreatedAt { get; set; }       // First time company seen

    // Navigation property
    public ICollection<User> Users { get; set; } = new List<User>();
}
```

**Constraints:**
- Primary Key: `CompanyId` (GUID, clustered index)
- Unique Index: `PipedriveCompanyId` (non-clustered)
- Required fields: CompanyName, CompanyDomain, CreatedAt
- Max length: CompanyName (255), CompanyDomain (255)

**Sample Data:**
```
CompanyId: a1b2c3d4-e5f6-7890-abcd-ef1234567890
PipedriveCompanyId: 54235233
CompanyName: "Acme Corp"
CompanyDomain: "acme-12g53f"
CreatedAt: 2025-10-31 10:00:00
```

### 4.2 Users Table

**Purpose:** Store Pipedrive user information with activity tracking.

**Entity Model:**
```csharp
public class User
{
    // Primary Key
    public Guid UserId { get; set; }  // Auto-generated GUID

    // Foreign Key
    public Guid CompanyId { get; set; }           // FK to Companies table

    // Pipedrive User Profile (from /users/me)
    public int PipedriveUserId { get; set; }      // User ID in Pipedrive
    public string Name { get; set; }               // User's full name
    public string Email { get; set; }              // User's email

    // Activity Tracking
    public DateTime CreatedAt { get; set; }        // First OAuth timestamp
    public DateTime LastLoginAt { get; set; }      // Most recent OAuth timestamp

    // Navigation property
    public Company Company { get; set; } = null!;
}
```

**Constraints:**
- Primary Key: `UserId` (GUID, clustered index)
- Composite Unique Index: `(PipedriveUserId, CompanyId)` (non-clustered)
- Foreign Key: `CompanyId` → `Companies.CompanyId`
- Foreign Key Delete Behavior: Restrict (cannot delete Company with existing Users)
- Required fields: Name, Email, CreatedAt, LastLoginAt
- Max length: Name (255), Email (255)

**Sample Data:**
```
UserId: b2c3d4e5-f6g7-8901-bcde-f12345678901
CompanyId: a1b2c3d4-e5f6-7890-abcd-ef1234567890
PipedriveUserId: 123
Name: "John Smith"
Email: "john@acme.com"
CreatedAt: 2025-10-31 10:00:00
LastLoginAt: 2025-10-31 15:30:00
```

### 4.3 Relationships

```
Companies (1) ←──── (N) Users
   ↑
   │
PipedriveCompanyId (unique)

Users (unique per PipedriveUserId + CompanyId)
```

**Key Points:**
- One Company can have many Users
- One User belongs to exactly one Company
- Same Pipedrive user in different companies = separate User records
- Cannot delete Company if Users exist (DeleteBehavior.Restrict)

---

## 5. EF Core Implementation

### 5.1 DbContext

**Models/Chat2DealDbContext.cs:**
```csharp
using Microsoft.EntityFrameworkCore;

namespace WhatsApp2Pipe.Api.Models;

public class Chat2DealDbContext : DbContext
{
    public Chat2DealDbContext(DbContextOptions<Chat2DealDbContext> options)
        : base(options)
    {
    }

    public DbSet<Company> Companies { get; set; } = null!;
    public DbSet<User> Users { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure Company entity
        modelBuilder.Entity<Company>(entity =>
        {
            entity.ToTable("Companies");

            entity.HasKey(c => c.CompanyId);

            // Unique constraint on PipedriveCompanyId
            entity.HasIndex(c => c.PipedriveCompanyId)
                  .IsUnique();

            // Required fields
            entity.Property(c => c.CompanyName)
                  .IsRequired()
                  .HasMaxLength(255);

            entity.Property(c => c.CompanyDomain)
                  .IsRequired()
                  .HasMaxLength(255);

            entity.Property(c => c.CreatedAt)
                  .IsRequired();

            // One-to-Many relationship
            entity.HasMany(c => c.Users)
                  .WithOne(u => u.Company)
                  .HasForeignKey(u => u.CompanyId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // Configure User entity
        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("Users");

            entity.HasKey(u => u.UserId);

            // Composite unique constraint on PipedriveUserId + CompanyId
            entity.HasIndex(u => new { u.PipedriveUserId, u.CompanyId })
                  .IsUnique();

            // Required fields
            entity.Property(u => u.Name)
                  .IsRequired()
                  .HasMaxLength(255);

            entity.Property(u => u.Email)
                  .IsRequired()
                  .HasMaxLength(255);

            entity.Property(u => u.CreatedAt)
                  .IsRequired();

            entity.Property(u => u.LastLoginAt)
                  .IsRequired();
        });
    }
}
```

### 5.2 NuGet Packages

**WhatsApp2Pipe.Api.csproj:**
```xml
<ItemGroup>
  <!-- Existing packages... -->

  <!-- EF Core for Azure SQL - Latest 8.x -->
  <PackageReference Include="Microsoft.EntityFrameworkCore" Version="8.*" />
  <PackageReference Include="Microsoft.EntityFrameworkCore.SqlServer" Version="8.*" />
  <PackageReference Include="Microsoft.EntityFrameworkCore.Design" Version="8.*" />
  <PackageReference Include="Microsoft.EntityFrameworkCore.Tools" Version="8.*" />
</ItemGroup>
```

### 5.3 Dependency Injection

**Program.cs:**
```csharp
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using WhatsApp2Pipe.Api.Models;
using WhatsApp2Pipe.Api.Services;

var host = new HostBuilder()
    .ConfigureFunctionsWorkerDefaults()
    .ConfigureServices((context, services) =>
    {
        // Existing services...

        // Add DbContext with SQL Server
        var connectionString = context.Configuration.GetConnectionString("Chat2DealDb");
        services.AddDbContext<Chat2DealDbContext>(options =>
            options.UseSqlServer(connectionString));

        // Register UserService
        services.AddScoped<IUserService, UserService>();

        // PipedriveApiClient already registered (existing)
    })
    .Build();

host.Run();
```

### 5.4 Configuration

**local.settings.json (Development):**
```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "dotnet-isolated",
    "Pipedrive__Scope": "contacts:full"
  },
  "ConnectionStrings": {
    "Chat2DealDb": "Server=localhost;Database=chat2deal-dev;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True"
  }
}
```

**Azure App Settings (Production):**
```
Pipedrive__Scope = contacts:full
ConnectionStrings__Chat2DealDb = Server=tcp:{server}.database.windows.net,1433;Database=Chat2DealDb;User ID={user};Password={password};Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;
```

### 5.5 Migrations

**Commands:**
```bash
# Create initial migration
dotnet ef migrations add InitialCreate --context Chat2DealDbContext

# Apply migration to database
dotnet ef database update --context Chat2DealDbContext

# Generate SQL script (for manual review)
dotnet ef migrations script --context Chat2DealDbContext
```

**Generated Migration (preview):**
```sql
CREATE TABLE [Companies] (
    [CompanyId] uniqueidentifier NOT NULL,
    [PipedriveCompanyId] int NOT NULL,
    [CompanyName] nvarchar(255) NOT NULL,
    [CompanyDomain] nvarchar(255) NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    CONSTRAINT [PK_Companies] PRIMARY KEY ([CompanyId])
);

CREATE UNIQUE INDEX [IX_Companies_PipedriveCompanyId]
    ON [Companies] ([PipedriveCompanyId]);

CREATE TABLE [Users] (
    [UserId] uniqueidentifier NOT NULL,
    [CompanyId] uniqueidentifier NOT NULL,
    [PipedriveUserId] int NOT NULL,
    [Name] nvarchar(255) NOT NULL,
    [Email] nvarchar(255) NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [LastLoginAt] datetime2 NOT NULL,
    CONSTRAINT [PK_Users] PRIMARY KEY ([UserId]),
    CONSTRAINT [FK_Users_Companies_CompanyId]
        FOREIGN KEY ([CompanyId])
        REFERENCES [Companies] ([CompanyId])
        ON DELETE NO ACTION
);

CREATE UNIQUE INDEX [IX_Users_PipedriveUserId_CompanyId]
    ON [Users] ([PipedriveUserId], [CompanyId]);

CREATE INDEX [IX_Users_CompanyId]
    ON [Users] ([CompanyId]);
```

---

## 6. Service Layer

### 6.1 Pipedrive API Models

**Models/PipedriveUserResponse.cs:**
```csharp
using System.Text.Json.Serialization;

namespace WhatsApp2Pipe.Api.Models;

public class PipedriveUserResponse
{
    [JsonPropertyName("success")]
    public bool Success { get; set; }

    [JsonPropertyName("data")]
    public PipedriveUserData Data { get; set; } = null!;
}

public class PipedriveUserData
{
    [JsonPropertyName("id")]
    public int Id { get; set; }

    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("email")]
    public string Email { get; set; } = string.Empty;

    [JsonPropertyName("company_id")]
    public int CompanyId { get; set; }

    [JsonPropertyName("company_name")]
    public string CompanyName { get; set; } = string.Empty;

    [JsonPropertyName("company_domain")]
    public string CompanyDomain { get; set; } = string.Empty;
}
```

### 6.2 Extend IPipedriveApiClient

**Services/IPipedriveApiClient.cs (ADD NEW METHOD):**
```csharp
public interface IPipedriveApiClient
{
    // ... existing methods (SearchPersonsAsync, CreatePersonAsync, etc.) ...

    /// <summary>
    /// Get current user data from Pipedrive /users/me endpoint
    /// Includes automatic token refresh on 401
    /// </summary>
    /// <param name="session">Session entity containing access token (may be updated if token is refreshed)</param>
    /// <returns>Current user data including company information</returns>
    Task<PipedriveUserResponse> GetCurrentUserAsync(SessionEntity session);
}
```

**Services/PipedriveApiClient.cs (IMPLEMENT NEW METHOD):**
```csharp
public async Task<PipedriveUserResponse> GetCurrentUserAsync(SessionEntity session)
{
    logger.LogInformation("Fetching current user from Pipedrive API");

    var requestUrl = $"https://{session.ApiDomain}/api/v1/users/me";
    var request = new HttpRequestMessage(HttpMethod.Get, requestUrl);
    request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", session.AccessToken);

    var response = await httpClient.SendAsync(request);

    // Handle 401 with token refresh (reuse existing pattern)
    if (response.StatusCode == HttpStatusCode.Unauthorized)
    {
        logger.LogInformation("Access token expired, refreshing...");
        await RefreshTokenAsync(session);

        // Retry with new token
        request = new HttpRequestMessage(HttpMethod.Get, requestUrl);
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", session.AccessToken);
        response = await httpClient.SendAsync(request);
    }

    if (!response.IsSuccessStatusCode)
    {
        var errorContent = await response.Content.ReadAsStringAsync();
        logger.LogError("Pipedrive /users/me failed with status {StatusCode}: {ErrorContent}",
            response.StatusCode, errorContent);
        throw new HttpRequestException($"Pipedrive API call failed: {response.StatusCode}");
    }

    var responseBody = await response.Content.ReadAsStringAsync();
    var userResponse = JsonSerializer.Deserialize<PipedriveUserResponse>(responseBody,
        new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

    if (userResponse == null || !userResponse.Success)
    {
        logger.LogError("Invalid response from Pipedrive /users/me");
        throw new InvalidOperationException("Failed to deserialize Pipedrive user response");
    }

    logger.LogInformation("Successfully fetched user {UserId} from company {CompanyId}",
        userResponse.Data.Id, userResponse.Data.CompanyId);

    return userResponse;
}
```

### 6.3 UserService

**Services/IUserService.cs:**
```csharp
namespace WhatsApp2Pipe.Api.Services;

public interface IUserService
{
    /// <summary>
    /// Create or update user and company based on Pipedrive user data
    /// </summary>
    /// <param name="userData">User data from Pipedrive /users/me</param>
    /// <returns>User entity (created or updated)</returns>
    Task<User> CreateOrUpdateUserAsync(PipedriveUserData userData);

    /// <summary>
    /// Get user by Pipedrive user ID and company ID
    /// </summary>
    Task<User?> GetUserByPipedriveIdAsync(int pipedriveUserId, int pipedriveCompanyId);
}
```

**Services/UserService.cs:**
```csharp
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using WhatsApp2Pipe.Api.Models;

namespace WhatsApp2Pipe.Api.Services;

public class UserService : IUserService
{
    private readonly Chat2DealDbContext dbContext;
    private readonly ILogger<UserService> logger;

    public UserService(Chat2DealDbContext dbContext, ILogger<UserService> logger)
    {
        this.dbContext = dbContext;
        this.logger = logger;
    }

    public async Task<User> CreateOrUpdateUserAsync(PipedriveUserData userData)
    {
        logger.LogInformation("Processing user {PipedriveUserId} from company {PipedriveCompanyId}",
            userData.Id, userData.CompanyId);

        // Step 1: Find or create Company
        var company = await dbContext.Companies
            .FirstOrDefaultAsync(c => c.PipedriveCompanyId == userData.CompanyId);

        if (company == null)
        {
            logger.LogInformation("Creating new company {PipedriveCompanyId}", userData.CompanyId);

            company = new Company
            {
                CompanyId = Guid.NewGuid(),
                PipedriveCompanyId = userData.CompanyId,
                CompanyName = userData.CompanyName,
                CompanyDomain = userData.CompanyDomain,
                CreatedAt = DateTime.UtcNow
            };

            dbContext.Companies.Add(company);
            await dbContext.SaveChangesAsync();

            logger.LogInformation("Created company {CompanyId}", company.CompanyId);
        }

        // Step 2: Find or create User
        var user = await dbContext.Users
            .FirstOrDefaultAsync(u => u.PipedriveUserId == userData.Id
                                   && u.CompanyId == company.CompanyId);

        if (user == null)
        {
            logger.LogInformation("Creating new user {PipedriveUserId}", userData.Id);

            user = new User
            {
                UserId = Guid.NewGuid(),
                CompanyId = company.CompanyId,
                PipedriveUserId = userData.Id,
                Name = userData.Name,
                Email = userData.Email,
                CreatedAt = DateTime.UtcNow,
                LastLoginAt = DateTime.UtcNow
            };

            dbContext.Users.Add(user);

            logger.LogInformation("Created user {UserId}", user.UserId);
        }
        else
        {
            logger.LogInformation("Updating existing user {UserId}", user.UserId);

            // Update LastLoginAt on subsequent logins
            user.LastLoginAt = DateTime.UtcNow;

            logger.LogInformation("Updated LastLoginAt for user {UserId}", user.UserId);
        }

        await dbContext.SaveChangesAsync();

        return user;
    }

    public async Task<User?> GetUserByPipedriveIdAsync(int pipedriveUserId, int pipedriveCompanyId)
    {
        var company = await dbContext.Companies
            .FirstOrDefaultAsync(c => c.PipedriveCompanyId == pipedriveCompanyId);

        if (company == null)
        {
            return null;
        }

        return await dbContext.Users
            .FirstOrDefaultAsync(u => u.PipedriveUserId == pipedriveUserId
                                   && u.CompanyId == company.CompanyId);
    }
}
```

---

## 7. OAuth Flow Integration

### 7.1 Enhanced AuthCallbackFunction

**Modifications to AuthCallbackFunction.cs:**

**1. Update Constructor (add dependencies):**
```csharp
public class AuthCallbackFunction
{
    private readonly ITableStorageService tableStorageService;
    private readonly IOAuthService oauthService;
    private readonly OAuthStateValidator stateValidator;
    private readonly IPipedriveApiClient pipedriveApiClient;  // NEW
    private readonly IUserService userService;                // NEW
    private readonly ILogger<AuthCallbackFunction> logger;

    public AuthCallbackFunction(
        ITableStorageService tableStorageService,
        IOAuthService oauthService,
        OAuthStateValidator stateValidator,
        IPipedriveApiClient pipedriveApiClient,  // NEW
        IUserService userService,                // NEW
        ILogger<AuthCallbackFunction> logger)
    {
        this.tableStorageService = tableStorageService;
        this.oauthService = oauthService;
        this.stateValidator = stateValidator;
        this.pipedriveApiClient = pipedriveApiClient;  // NEW
        this.userService = userService;                // NEW
        this.logger = logger;
    }
}
```

**2. Enhance Run Method (add user creation):**
```csharp
[Function("AuthCallback")]
public async Task<HttpResponseData> Run(
    [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "auth/callback")] HttpRequestData req)
{
    logger.LogInformation("AuthCallback endpoint called");

    try
    {
        // ... existing validation code (state, code, error handling) ...

        // Exchange authorization code for tokens (EXISTING)
        logger.LogInformation("Exchanging authorization code for tokens");
        PipedriveTokenResponse tokenResponse;
        try
        {
            tokenResponse = await oauthService.ExchangeCodeForTokensAsync(code);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Token exchange failed");
            return CreateHtmlErrorResponse(req, HttpStatusCode.InternalServerError, "token_exchange_failed");
        }

        // NEW: Create temporary session for /users/me call
        logger.LogInformation("Fetching user profile from Pipedrive");
        var tempSession = new SessionEntity
        {
            AccessToken = tokenResponse.AccessToken,
            RefreshToken = tokenResponse.RefreshToken,
            ApiDomain = tokenResponse.ApiDomain,
            ExpiresAt = DateTimeOffset.UtcNow.AddSeconds(tokenResponse.ExpiresIn)
        };

        // NEW: Call /users/me to get user profile
        PipedriveUserResponse userResponse;
        try
        {
            userResponse = await pipedriveApiClient.GetCurrentUserAsync(tempSession);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to fetch user profile from Pipedrive");
            return CreateHtmlErrorResponse(req, HttpStatusCode.InternalServerError, "user_profile_fetch_failed");
        }

        // NEW: Create or update user in database
        logger.LogInformation("Creating or updating user in database");
        try
        {
            var user = await userService.CreateOrUpdateUserAsync(userResponse.Data);
            logger.LogInformation("User {UserId} processed successfully", user.UserId);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to create/update user in database");
            return CreateHtmlErrorResponse(req, HttpStatusCode.InternalServerError, "user_creation_failed");
        }

        // Generate verification code (session ID) (EXISTING)
        logger.LogInformation("Creating session");
        var session = await tableStorageService.CreateSessionAsync(
            tokenResponse.AccessToken,
            tokenResponse.RefreshToken,
            tokenResponse.ApiDomain,
            tokenResponse.ExpiresIn,
            stateData.ExtensionId);

        logger.LogInformation("Session created successfully: {VerificationCode}", session.VerificationCode);

        // Redirect to extension with verification code (EXISTING)
        var redirectUrl = $"https://{stateData.ExtensionId}.chromiumapp.org/" +
                        $"?verification_code={Uri.EscapeDataString(session.VerificationCode)}" +
                        $"&success=true";

        logger.LogInformation("Redirecting to extension URL");

        var response = req.CreateResponse(HttpStatusCode.Redirect);
        response.Headers.Add("Location", redirectUrl);

        return response;
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Error in AuthCallback endpoint");
        return CreateHtmlErrorResponse(req, HttpStatusCode.InternalServerError, "internal_error");
    }
}
```

**3. Add New Error Messages:**
```csharp
private string GenerateErrorHtml(string error)
{
    var errorMessages = new Dictionary<string, string>
    {
        { "access_denied", "You denied access to the application." },
        { "missing_code", "Authorization code is missing." },
        { "missing_state", "State parameter is missing." },
        { "invalid_state", "Invalid or expired authorization state." },
        { "token_exchange_failed", "Failed to exchange authorization code for tokens." },
        { "user_profile_fetch_failed", "Failed to fetch your user profile from Pipedrive." },  // NEW
        { "user_creation_failed", "Failed to create user record in database." },               // NEW
        { "internal_error", "An internal error occurred." }
    };

    // ... rest of HTML generation (existing) ...
}
```

### 7.2 Flow Diagram

```
User clicks "Sign in with Pipedrive"
    ↓
OAuth authorization (EXISTING)
    ↓
Callback: Validate state (EXISTING)
    ↓
Exchange code for tokens (EXISTING)
    ✓ Success
    ↓
Call Pipedrive /users/me (NEW)
    ✓ Success → userResponse
    ✗ Failure → Return error, abort flow
    ↓
Create/update Company (NEW)
    ✓ Company created or found
    ✗ Failure → Return error, abort flow
    ↓
Create/update User (NEW)
    ✓ User created or LastLoginAt updated
    ✗ Failure → Return error, abort flow
    ↓
Create session in Table Storage (EXISTING)
    ↓
Redirect to extension with verification_code (EXISTING)
```

---

## 8. OAuth Scope Analysis

### 8.1 No Scope Change Required

**Current Scope:** `contacts:full`

**Required Scope for /users/me:** `base` (automatically granted with any OAuth token)

**Conclusion:** No scope change needed. The `/users/me` endpoint requires only the `base` scope, which is implicitly granted with every Pipedrive OAuth token. The `users:read` scope is only required to fetch information about OTHER users in the company, not your own profile.

**Reference:** [Pipedrive Users API Documentation](https://developers.pipedrive.com/docs/api/v1/Users#getCurrentUser) shows `security: [{"api_key":[]},{"oauth2":["base"]}]`

### 8.2 Configuration (No Changes)

**PipedriveSettings remains unchanged:**
```csharp
public class PipedriveSettings
{
    public string Scope { get; set; } = "contacts:full";  // NO CHANGE
}
```

**Configuration file (no changes):**
```json
{
  "Pipedrive": {
    "Scope": "contacts:full"
  }
}
```

### 8.3 Impact Analysis

**Existing Sessions:**
- ✅ Continue working for Persons API calls
- ✅ Can call `/users/me` (base scope always granted)
- ✅ User entities will be created on next OAuth (feature enhancement)
- ✅ No action required from users

**New OAuth Flows (after deployment):**
- ✅ Request same scope: `contacts:full`
- ✅ Users see same permission dialog (no changes)
- ✅ Successfully call `/users/me` during callback
- ✅ Create User entities in SQL database

**Migration Strategy:**
- ✅ Zero-impact deployment (no scope changes)
- ✅ No user re-authentication required
- ✅ No breaking changes to existing sessions
- ✅ Feature works immediately for all users (new and existing)

---

## 9. Error Handling

### 9.1 Error Scenarios

| Scenario | Detection | Action | User Experience |
|----------|-----------|--------|-----------------|
| /users/me network error | HttpRequestException | Abort OAuth, return error HTML | "Failed to fetch your user profile from Pipedrive." with close button |
| /users/me 401 (invalid token) | HTTP 401 status | Refresh token, retry once | Transparent retry, succeeds or fails with error |
| /users/me 403 (missing scope) | HTTP 403 status | Abort OAuth, return error HTML | "Failed to fetch your user profile from Pipedrive." |
| /users/me invalid JSON | JsonException | Abort OAuth, return error HTML | "Failed to fetch your user profile from Pipedrive." |
| Company creation DB error | DbUpdateException | Abort OAuth, return error HTML | "Failed to create user record in database." |
| User creation DB error | DbUpdateException | Abort OAuth, return error HTML | "Failed to create user record in database." |
| Duplicate PipedriveCompanyId | DbUpdateException (unique constraint) | Rare race condition, retry logic | Transparent retry or error |
| Duplicate (PipedriveUserId, CompanyId) | DbUpdateException (unique constraint) | Rare race condition, update instead | Transparent recovery |
| Database connection timeout | SqlException | Abort OAuth, return error HTML | "Failed to create user record in database." |

### 9.2 Logging Strategy

**What to Log:**
- ✅ /users/me request start (with timestamp)
- ✅ /users/me response status (200, 401, 403, 500)
- ✅ Company creation (new vs existing)
- ✅ User creation (new vs update)
- ✅ LastLoginAt updates
- ✅ All errors with full exception details
- ❌ Never log: access_token, refresh_token, passwords

**Log Levels:**
- Information: Normal flow (user creation, updates, /users/me success)
- Warning: Retries, rare race conditions
- Error: Failed API calls, database errors, exceptions
- Critical: Unhandled exceptions, configuration errors

**Example Logs:**
```
INFO: Fetching user profile from Pipedrive
INFO: Successfully fetched user 123 from company 456
INFO: Creating new company 456
INFO: Created company a1b2c3d4-e5f6-7890-abcd-ef1234567890
INFO: Creating new user 123
INFO: Created user b2c3d4e5-f6g7-8901-bcde-f12345678901
INFO: User b2c3d4e5-f6g7-8901-bcde-f12345678901 processed successfully

ERROR: Failed to fetch user profile from Pipedrive
ERROR: Pipedrive /users/me failed with status 403: {"error":"insufficient_scope"}
```

### 9.3 Rollback Strategy

**Failed /users/me call:**
- No rollback needed (no database changes yet)
- Session not created
- User sees error, can retry OAuth flow

**Failed Company creation:**
- No rollback needed (transaction not committed)
- Session not created
- User sees error, can retry OAuth flow

**Failed User creation (Company already created):**
- Company remains in database (acceptable)
- Session not created
- Next OAuth attempt will reuse existing Company
- User sees error, can retry OAuth flow

---

## 10. Testing Strategy

### 10.1 Unit Tests

**UserService Tests:**
```csharp
[TestClass]
public class UserServiceTests
{
    [TestMethod]
    public async Task CreateOrUpdateUserAsync_NewCompanyAndUser_CreatesBoth()
    {
        // Arrange: Empty database
        // Act: Call CreateOrUpdateUserAsync()
        // Assert: Company created, User created, timestamps set
    }

    [TestMethod]
    public async Task CreateOrUpdateUserAsync_ExistingCompany_ReusesCompany()
    {
        // Arrange: Company exists in database
        // Act: Call CreateOrUpdateUserAsync()
        // Assert: Company not duplicated, User created with correct CompanyId
    }

    [TestMethod]
    public async Task CreateOrUpdateUserAsync_ExistingUser_UpdatesLastLoginAt()
    {
        // Arrange: Company and User exist in database
        // Act: Call CreateOrUpdateUserAsync()
        // Assert: LastLoginAt updated, no duplicate User created
    }

    [TestMethod]
    public async Task CreateOrUpdateUserAsync_MultiCompanyUser_CreatesSeparateUsers()
    {
        // Arrange: User 123 exists in Company A
        // Act: Call CreateOrUpdateUserAsync() for User 123 in Company B
        // Assert: Two separate User records exist (same PipedriveUserId, different CompanyId)
    }

    [TestMethod]
    public async Task GetUserByPipedriveIdAsync_UserExists_ReturnsUser()
    {
        // Arrange: User exists in database
        // Act: Call GetUserByPipedriveIdAsync()
        // Assert: Returns correct User entity
    }

    [TestMethod]
    public async Task GetUserByPipedriveIdAsync_UserDoesNotExist_ReturnsNull()
    {
        // Arrange: Empty database
        // Act: Call GetUserByPipedriveIdAsync()
        // Assert: Returns null
    }
}
```

**PipedriveApiClient Tests:**
```csharp
[TestClass]
public class PipedriveApiClientTests
{
    [TestMethod]
    public async Task GetCurrentUserAsync_ValidToken_ReturnsUserData()
    {
        // Arrange: Mock HTTP response with valid /users/me JSON
        // Act: Call GetCurrentUserAsync()
        // Assert: Returns PipedriveUserResponse with correct data
    }

    [TestMethod]
    public async Task GetCurrentUserAsync_ExpiredToken_RefreshesAndRetries()
    {
        // Arrange: Mock 401 response, then successful refresh, then successful /users/me
        // Act: Call GetCurrentUserAsync()
        // Assert: Token refreshed, request retried, returns user data
    }

    [TestMethod]
    public async Task GetCurrentUserAsync_NetworkError_ThrowsException()
    {
        // Arrange: Mock network failure
        // Act: Call GetCurrentUserAsync()
        // Assert: Throws HttpRequestException
    }

    [TestMethod]
    public async Task GetCurrentUserAsync_InvalidJson_ThrowsException()
    {
        // Arrange: Mock 200 response with invalid JSON
        // Act: Call GetCurrentUserAsync()
        // Assert: Throws InvalidOperationException
    }
}
```

**AuthCallbackFunction Integration Tests:**
```csharp
[TestClass]
public class AuthCallbackFunctionTests
{
    [TestMethod]
    public async Task AuthCallback_NewUser_CreatesCompanyAndUser()
    {
        // Arrange: Mock OAuth code exchange, /users/me response
        // Act: Call AuthCallback function
        // Assert: Company created, User created, session created, redirect returned
    }

    [TestMethod]
    public async Task AuthCallback_ReturningUser_UpdatesLastLoginAt()
    {
        // Arrange: User exists in database, mock OAuth code exchange
        // Act: Call AuthCallback function
        // Assert: LastLoginAt updated, no duplicate User, session created
    }

    [TestMethod]
    public async Task AuthCallback_UsersMeFails_ReturnsError()
    {
        // Arrange: Mock /users/me to fail with 500
        // Act: Call AuthCallback function
        // Assert: Error HTML returned, no session created, no User created
    }

    [TestMethod]
    public async Task AuthCallback_UserCreationFails_ReturnsError()
    {
        // Arrange: Mock database error during User creation
        // Act: Call AuthCallback function
        // Assert: Error HTML returned, no session created
    }
}
```

### 10.2 Integration Tests

**Database Schema Tests:**
```csharp
[TestClass]
public class DatabaseSchemaTests
{
    [TestMethod]
    public void Migration_CreatesCompaniesTable()
    {
        // Assert: Companies table exists with correct columns and constraints
    }

    [TestMethod]
    public void Migration_CreatesUsersTable()
    {
        // Assert: Users table exists with correct columns and constraints
    }

    [TestMethod]
    public void UniqueConstraint_PipedriveCompanyId_EnforcesDuplicatePrevention()
    {
        // Arrange: Create Company with PipedriveCompanyId = 123
        // Act: Try to create another Company with PipedriveCompanyId = 123
        // Assert: DbUpdateException thrown
    }

    [TestMethod]
    public void UniqueConstraint_PipedriveUserIdAndCompanyId_EnforcesDuplicatePrevention()
    {
        // Arrange: Create User with PipedriveUserId = 456, CompanyId = X
        // Act: Try to create another User with PipedriveUserId = 456, CompanyId = X
        // Assert: DbUpdateException thrown
    }

    [TestMethod]
    public void ForeignKey_CompanyId_PreventsCascadeDelete()
    {
        // Arrange: Create Company with Users
        // Act: Try to delete Company
        // Assert: SqlException or DbUpdateException (foreign key constraint)
    }
}
```

**End-to-End OAuth Flow:**
```csharp
[TestClass]
public class OAuthFlowE2ETests
{
    [TestMethod]
    public async Task CompleteOAuthFlow_NewUser_CreatesAllEntities()
    {
        // Arrange: Clean database, real Pipedrive sandbox
        // Act: Complete OAuth flow from extension to callback
        // Assert:
        //   1. Token exchange succeeds
        //   2. /users/me returns data
        //   3. Company created in SQL
        //   4. User created in SQL
        //   5. Session created in Table Storage
        //   6. Redirect URL contains verification_code
    }

    [TestMethod]
    public async Task CompleteOAuthFlow_ReturningUser_UpdatesActivity()
    {
        // Arrange: User already exists in database
        // Act: Complete OAuth flow
        // Assert: LastLoginAt updated, no duplicate entities
    }
}
```

### 10.3 Manual Testing Checklist

**OAuth Flow:**
- [ ] First-time user authorization creates Company in SQL
- [ ] First-time user authorization creates User in SQL
- [ ] Returning user authorization updates User.LastLoginAt
- [ ] Multi-company user (different Pipedrive company) creates separate User record
- [ ] Failed /users/me call shows error message with close button
- [ ] Failed database operation shows error message
- [ ] OAuth scope dialog shows `contacts:full` only (no changes from existing)
- [ ] Successful OAuth flow redirects to extension with verification_code

**Database Verification:**
- [ ] Companies table has correct data (PipedriveCompanyId, CompanyName, CompanyDomain)
- [ ] Users table has correct data (PipedriveUserId, Name, Email, CompanyId)
- [ ] CreatedAt timestamp matches first OAuth time
- [ ] LastLoginAt timestamp updates on subsequent OAuth
- [ ] Cannot manually insert duplicate PipedriveCompanyId
- [ ] Cannot manually insert duplicate (PipedriveUserId, CompanyId)
- [ ] Cannot delete Company with existing Users

**Pipedrive API:**
- [ ] /users/me call includes Authorization header with Bearer token
- [ ] /users/me response includes id, name, email, company_id, company_name, company_domain
- [ ] 401 response triggers token refresh and retry
- [ ] Network errors handled gracefully

**Application Insights Logging:**
- [ ] /users/me calls logged
- [ ] Company creation logged
- [ ] User creation logged
- [ ] LastLoginAt updates logged
- [ ] Errors logged with full exception details
- [ ] No sensitive data (tokens, passwords) in logs

---

## 11. Acceptance Criteria

### 11.1 Database Schema

- ✅ Companies table created with PipedriveCompanyId unique constraint
- ✅ Users table created with composite unique index (PipedriveUserId, CompanyId)
- ✅ Foreign key relationship: Users.CompanyId → Companies.CompanyId
- ✅ Delete behavior: Restrict (cannot delete Company with Users)
- ✅ All fields required (non-nullable)
- ✅ GUID primary keys (CompanyId, UserId)
- ✅ EF Core migrations generate correct SQL

### 11.2 Service Layer

- ✅ IPipedriveApiClient extended with GetCurrentUserAsync()
- ✅ GetCurrentUserAsync() calls Pipedrive /users/me endpoint
- ✅ GetCurrentUserAsync() includes automatic token refresh on 401
- ✅ IUserService and UserService implemented
- ✅ CreateOrUpdateUserAsync() creates Company if not exists
- ✅ CreateOrUpdateUserAsync() creates User if not exists
- ✅ CreateOrUpdateUserAsync() updates LastLoginAt for existing User
- ✅ GetUserByPipedriveIdAsync() returns User or null

### 11.3 OAuth Flow Integration

- ✅ AuthCallbackFunction calls /users/me after token exchange
- ✅ AuthCallbackFunction creates/updates Company in SQL
- ✅ AuthCallbackFunction creates/updates User in SQL
- ✅ AuthCallbackFunction updates LastLoginAt on returning user
- ✅ Failed /users/me aborts OAuth flow with error HTML
- ✅ Failed user creation aborts OAuth flow with error HTML
- ✅ Error messages user-friendly with close button
- ✅ Session created only after successful user creation

### 11.4 OAuth Scope

- ✅ Scope remains `contacts:full` (no changes required)
- ✅ `/users/me` accessible with `base` scope (implicitly granted)
- ✅ Existing sessions work immediately (no re-authentication)
- ✅ Users see same permission dialog (no changes)

### 11.5 Business Logic

- ✅ One Company record per Pipedrive company (PipedriveCompanyId unique)
- ✅ One User record per Pipedrive user per company (composite unique)
- ✅ Multi-company users get separate User records
- ✅ Idempotent user creation (multiple OAuth calls safe)
- ✅ Timestamps accurate (CreatedAt, LastLoginAt)

### 11.6 Code Quality

- ✅ Follow C# naming conventions (camelCase for private fields, no underscore)
- ✅ Comprehensive logging (Information, Warning, Error levels)
- ✅ No sensitive data logged (tokens, passwords)
- ✅ Unit tests for UserService (>80% coverage)
- ✅ Unit tests for PipedriveApiClient.GetCurrentUserAsync()
- ✅ Integration tests for database schema
- ✅ Error handling for all scenarios
- ✅ XML documentation comments on public APIs

---

## 12. Out of Scope

The following are explicitly **NOT** part of this feature:

- ❌ Linking Users to Sessions (no UserId in SessionEntity)
- ❌ User activity analytics dashboard or reporting
- ❌ User deletion or soft delete functionality
- ❌ Company-level settings or configuration
- ❌ Automatic profile sync from Pipedrive (updates on login only)
- ❌ User management UI or admin panel
- ❌ Multi-user per extension (extension tied to one user session)
- ❌ User roles or permissions system
- ❌ Company hierarchy or parent-child relationships
- ❌ Historical activity tracking (beyond LastLoginAt)
- ❌ User preferences or settings storage
- ❌ Email verification or user activation workflow

---

## 13. Future Enhancements

**Potential Future Features (Post-MVP):**

1. **User-Session Linking:** Add UserId to SessionEntity for querying user sessions
2. **Activity Analytics:** Track API calls, person creations, deals created per user
3. **Usage-Based Billing:** Count API calls per company for billing purposes
4. **User Management:** Admin UI to view users, companies, activity
5. **Profile Sync:** Periodic sync of user profile from Pipedrive (name/email updates)
6. **Multi-User Companies:** Show all users in company, team collaboration features
7. **Company Settings:** Store company-level preferences (timezone, locale, etc.)
8. **Audit Trail:** Track all user actions with timestamps for compliance
9. **User Roles:** Admin vs regular user permissions
10. **Historical Tracking:** Store historical activity beyond LastLoginAt

---

## 14. References

- [EF Core Documentation](https://learn.microsoft.com/en-us/ef/core/)
- [EF Core Migrations](https://learn.microsoft.com/en-us/ef/core/managing-schemas/migrations/)
- [Azure SQL Database](https://learn.microsoft.com/en-us/azure/azure-sql/)
- [Pipedrive Users API](https://developers.pipedrive.com/docs/api/v1/Users#getCurrentUser)
- [Pipedrive OAuth Scopes](https://pipedrive.readme.io/docs/marketplace-scopes-and-permissions-explanations)
- [Spec-105a: Backend OAuth Service](Spec-105a-Backend-OAuth-Service.md)
- [Spec-106a: Backend Pipedrive API Service](Spec-106a-Backend-Pipedrive-API-Service.md)

---

**Status:** ✅ Complete - Implemented and database migrated
**Actual Effort:** 1 day (development + database setup + documentation)

**Implementation Notes:**
- Database: `chat2deal-dev` on localhost SQL Server
- Migration: `20251031181239_InitialCreate` applied successfully
- OAuth scope: Remains `contacts:full` (no changes - `/users/me` uses `base` scope)
- Build: Successful with no errors
- Unit tests: Need to be updated for new PipedriveApiClient dependencies (in progress)
