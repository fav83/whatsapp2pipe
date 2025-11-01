# Plan-002: Azure SQL Database Migration

**Status**: Draft
**Created**: 2025-11-01
**Last Updated**: 2025-11-01

## Executive Summary

This plan outlines the complete migration of session and state management from Azure Table Storage to Azure SQL Database (Chat2DealDb). The refactoring eliminates all Azure Storage dependencies and consolidates data persistence into a single SQL database.

**Migration Strategy**: Hard cutover with no data migration
**User Impact**: All users must re-authenticate after deployment
**Extension Changes**: None required
**Timeline**: Single deployment cycle

---

## Table of Contents

1. [Current State Analysis](#1-current-state-analysis)
2. [Target Architecture](#2-target-architecture)
3. [Data Model Design](#3-data-model-design)
4. [Service Layer Refactoring](#4-service-layer-refactoring)
5. [Function Updates](#5-function-updates)
6. [Configuration Changes](#6-configuration-changes)
7. [Implementation Steps](#7-implementation-steps)
8. [Testing Strategy](#8-testing-strategy)
9. [Deployment Plan](#9-deployment-plan)
10. [Rollback Plan](#10-rollback-plan)

---

## 1. Current State Analysis

### 1.1 Azure Table Storage Usage

**Sessions Table** (`sessions`)
- **Purpose**: OAuth token storage (60-day lifetime)
- **Identifier**: VerificationCode (32-char random string)
- **Key Columns**: AccessToken, RefreshToken, ApiDomain, ExpiresAt, SessionExpiresAt, ExtensionId
- **Access Pattern**: Lookup by verification code on every API call
- **Current Issue**: No relationship to User entity, cannot track which sessions belong to which user

**States Table** (`states`)
- **Purpose**: CSRF protection for OAuth (5-minute lifetime, one-time use)
- **Identifier**: SHA256 hash of state value (first 32 hex chars)
- **Key Columns**: StateValue, CreatedAt, ExpiresAt
- **Access Pattern**: Validate and delete (consume) during OAuth callback
- **Current Issue**: Separate storage system adds complexity

### 1.2 Service Layer

**TableStorageService** (`Services/TableStorageService.cs`)
- Implements `ITableStorageService`
- Handles both session and state operations
- Uses Azure.Data.Tables SDK
- Configured via `AzureSettings` class

**Dependencies**:
- `AuthStartFunction` - Stores CSRF states
- `AuthCallbackFunction` - Validates states, creates sessions
- `PipedrivePersonsSearchFunction` - Retrieves sessions for token validation
- `PipedrivePersonsCreateFunction` - Retrieves sessions for token validation
- `PipedrivePersonsAttachPhoneFunction` - Retrieves sessions for token validation

### 1.3 Current Database (Azure SQL)

**Existing Tables**: Companies, Users
**ORM**: Entity Framework Core 8.x
**DbContext**: `Chat2DealDbContext`
**Connection**: `ConnectionStrings:Chat2DealDb`

**User Entity** already tracks:
- `UserId` (GUID primary key)
- `CompanyId` (GUID foreign key)
- `PipedriveUserId` (int)
- OAuth activity timestamps (CreatedAt, LastLoginAt)

---

## 2. Target Architecture

### 2.1 Architecture Goals

1. **Single Database**: All persistence in Azure SQL (Chat2DealDb)
2. **User Tracking**: Sessions linked to Users via foreign keys
3. **Multi-Device Support**: One user can have multiple active sessions
4. **Clean Separation**: Remove all Azure Storage dependencies
5. **EF Core Patterns**: Follow existing User/Company entity patterns

### 2.2 Data Flow

```
OAuth Flow (Session Creation):
1. Extension → AuthStart → Validate state → Store state in SQL
2. User authorizes → Pipedrive redirects → AuthCallback
3. AuthCallback → Validate state in SQL → Exchange code for tokens
4. AuthCallback → Create/update User in SQL → Create Session in SQL
5. Extension receives verification code → Stores in chrome.storage

API Request Flow (Session Validation):
1. Extension → API Function with Bearer token (verification code)
2. API Function → SqlSessionService.GetSessionAsync(verificationCode)
3. SqlSessionService → EF Core query → Session with User/Company navigation
4. Validate expiration → Call Pipedrive API with tokens
```

### 2.3 Technology Stack

- **Database**: Azure SQL Server (existing Chat2DealDb)
- **ORM**: Entity Framework Core 8.x
- **Service Layer**: `SqlSessionService` implementing `ISessionService`
- **Migration**: EF Core code-first migrations
- **Dependency Injection**: Microsoft.Extensions.DependencyInjection

---

## 3. Data Model Design

### 3.1 Session Entity

**File**: `Backend/WhatsApp2Pipe.Api/Models/Session.cs`

```csharp
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WhatsApp2Pipe.Api.Models;

public class Session
{
    // Primary Key
    [Key]
    public Guid SessionId { get; set; }

    // Unique identifier for session lookup (Bearer token)
    [Required]
    [MaxLength(32)]
    public string VerificationCode { get; set; } = string.Empty;

    // Foreign Keys (MANDATORY)
    [Required]
    public Guid UserId { get; set; }

    [Required]
    public Guid CompanyId { get; set; }

    // Pipedrive OAuth tokens
    [Required]
    public string AccessToken { get; set; } = string.Empty;

    [Required]
    public string RefreshToken { get; set; } = string.Empty;

    [Required]
    [MaxLength(255)]
    public string ApiDomain { get; set; } = string.Empty;

    // Token expiration (from Pipedrive OAuth response)
    [Required]
    public DateTime ExpiresAt { get; set; }

    // Session expiration (60 days from creation)
    [Required]
    public DateTime SessionExpiresAt { get; set; }

    // Extension that created this session
    [Required]
    [MaxLength(255)]
    public string ExtensionId { get; set; } = string.Empty;

    // Audit timestamp
    [Required]
    public DateTime CreatedAt { get; set; }

    // Navigation properties
    [ForeignKey(nameof(UserId))]
    public User User { get; set; } = null!;

    [ForeignKey(nameof(CompanyId))]
    public Company Company { get; set; } = null!;
}
```

**Table Name**: `Sessions`

**Indexes**:
- Primary Key: `SessionId` (GUID, clustered index)
- Unique Index: `VerificationCode` (for Bearer token lookups)
- Index: `UserId` (for user session queries)
- Index: `CompanyId` (for company session queries)
- Composite Index: `(UserId, CompanyId)` (for user-company queries)

**Foreign Key Constraints**:
- `UserId` → `Users.UserId` (ON DELETE RESTRICT)
- `CompanyId` → `Companies.CompanyId` (ON DELETE RESTRICT)

**Relationships**:
- One User can have multiple Sessions (one-to-many)
- One Company can have multiple Sessions (one-to-many)
- Session belongs to one User and one Company

### 3.2 State Entity

**File**: `Backend/WhatsApp2Pipe.Api/Models/State.cs`

```csharp
using System.ComponentModel.DataAnnotations;

namespace WhatsApp2Pipe.Api.Models;

public class State
{
    // Primary Key
    [Key]
    public Guid StateId { get; set; }

    // SHA256 hash of state (first 32 hex chars, for lookup)
    [Required]
    [MaxLength(64)]
    public string StateHash { get; set; } = string.Empty;

    // Full base64-encoded state value
    [Required]
    public string StateValue { get; set; } = string.Empty;

    // Timestamps
    [Required]
    public DateTime CreatedAt { get; set; }

    [Required]
    public DateTime ExpiresAt { get; set; }
}
```

**Table Name**: `States`

**Indexes**:
- Primary Key: `StateId` (GUID, clustered index)
- Unique Index: `StateHash` (for state validation lookups)

**Notes**:
- No UserId/CompanyId columns (states created before authentication)
- Short lifetime (5 minutes)
- One-time use (deleted after validation)

### 3.3 DbContext Updates

**File**: `Backend/WhatsApp2Pipe.Api/Models/Chat2DealDbContext.cs`

```csharp
public class Chat2DealDbContext : DbContext
{
    public Chat2DealDbContext(DbContextOptions<Chat2DealDbContext> options)
        : base(options)
    {
    }

    // Existing DbSets
    public DbSet<Company> Companies { get; set; }
    public DbSet<User> Users { get; set; }

    // NEW DbSets
    public DbSet<Session> Sessions { get; set; }
    public DbSet<State> States { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Existing configurations for Company and User
        // ...

        // Session configuration
        modelBuilder.Entity<Session>(entity =>
        {
            entity.HasKey(e => e.SessionId);

            entity.HasIndex(e => e.VerificationCode)
                .IsUnique()
                .HasDatabaseName("IX_Sessions_VerificationCode");

            entity.HasIndex(e => e.UserId)
                .HasDatabaseName("IX_Sessions_UserId");

            entity.HasIndex(e => e.CompanyId)
                .HasDatabaseName("IX_Sessions_CompanyId");

            entity.HasIndex(e => new { e.UserId, e.CompanyId })
                .HasDatabaseName("IX_Sessions_UserId_CompanyId");

            entity.HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Company)
                .WithMany()
                .HasForeignKey(e => e.CompanyId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // State configuration
        modelBuilder.Entity<State>(entity =>
        {
            entity.HasKey(e => e.StateId);

            entity.HasIndex(e => e.StateHash)
                .IsUnique()
                .HasDatabaseName("IX_States_StateHash");
        });
    }
}
```

---

## 4. Service Layer Refactoring

### 4.1 New Service Interface

**File**: `Backend/WhatsApp2Pipe.Api/Services/ISessionService.cs`

```csharp
namespace WhatsApp2Pipe.Api.Services;

public interface ISessionService
{
    // Session operations
    Task<Session> CreateSessionAsync(
        Guid userId,
        Guid companyId,
        string accessToken,
        string refreshToken,
        string apiDomain,
        int expiresIn,
        string extensionId);

    Task<Session?> GetSessionAsync(string verificationCode);

    Task UpdateSessionAsync(Session session);

    Task DeleteSessionAsync(string verificationCode);

    // State operations (CSRF)
    Task StoreStateAsync(string state);

    Task<bool> ValidateAndConsumeStateAsync(string state);
}
```

### 4.2 Service Implementation

**File**: `Backend/WhatsApp2Pipe.Api/Services/SqlSessionService.cs`

```csharp
using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using WhatsApp2Pipe.Api.Models;

namespace WhatsApp2Pipe.Api.Services;

public class SqlSessionService : ISessionService
{
    private readonly Chat2DealDbContext dbContext;
    private readonly ILogger<SqlSessionService> logger;
    private const int SessionExpirationDays = 60;
    private const int StateExpirationMinutes = 5;

    public SqlSessionService(
        Chat2DealDbContext dbContext,
        ILogger<SqlSessionService> logger)
    {
        this.dbContext = dbContext;
        this.logger = logger;
    }

    // Session operations
    public async Task<Session> CreateSessionAsync(
        Guid userId,
        Guid companyId,
        string accessToken,
        string refreshToken,
        string apiDomain,
        int expiresIn,
        string extensionId)
    {
        var verificationCode = GenerateVerificationCode();
        var now = DateTime.UtcNow;

        var session = new Session
        {
            SessionId = Guid.NewGuid(),
            VerificationCode = verificationCode,
            UserId = userId,
            CompanyId = companyId,
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            ApiDomain = apiDomain,
            ExpiresAt = now.AddSeconds(expiresIn),
            SessionExpiresAt = now.AddDays(SessionExpirationDays),
            ExtensionId = extensionId,
            CreatedAt = now
        };

        dbContext.Sessions.Add(session);
        await dbContext.SaveChangesAsync();

        logger.LogInformation(
            "Created session {VerificationCode} for user {UserId} in company {CompanyId}",
            verificationCode, userId, companyId);

        return session;
    }

    public async Task<Session?> GetSessionAsync(string verificationCode)
    {
        var session = await dbContext.Sessions
            .Include(s => s.User)
            .Include(s => s.Company)
            .FirstOrDefaultAsync(s => s.VerificationCode == verificationCode);

        if (session == null)
        {
            logger.LogWarning("Session not found: {VerificationCode}", verificationCode);
            return null;
        }

        // Check if session expired
        if (session.SessionExpiresAt < DateTime.UtcNow)
        {
            logger.LogInformation(
                "Session expired: {VerificationCode}, expired at {ExpiresAt}",
                verificationCode, session.SessionExpiresAt);

            // Lazy deletion
            dbContext.Sessions.Remove(session);
            await dbContext.SaveChangesAsync();

            return null;
        }

        return session;
    }

    public async Task UpdateSessionAsync(Session session)
    {
        dbContext.Sessions.Update(session);
        await dbContext.SaveChangesAsync();

        logger.LogInformation(
            "Updated session {VerificationCode} for user {UserId}",
            session.VerificationCode, session.UserId);
    }

    public async Task DeleteSessionAsync(string verificationCode)
    {
        var session = await dbContext.Sessions
            .FirstOrDefaultAsync(s => s.VerificationCode == verificationCode);

        if (session != null)
        {
            dbContext.Sessions.Remove(session);
            await dbContext.SaveChangesAsync();

            logger.LogInformation("Deleted session {VerificationCode}", verificationCode);
        }
    }

    // State operations (CSRF)
    public async Task StoreStateAsync(string state)
    {
        var stateHash = ComputeStateHash(state);
        var now = DateTime.UtcNow;

        var stateEntity = new State
        {
            StateId = Guid.NewGuid(),
            StateHash = stateHash,
            StateValue = state,
            CreatedAt = now,
            ExpiresAt = now.AddMinutes(StateExpirationMinutes)
        };

        dbContext.States.Add(stateEntity);
        await dbContext.SaveChangesAsync();

        logger.LogInformation("Stored state with hash {StateHash}", stateHash);
    }

    public async Task<bool> ValidateAndConsumeStateAsync(string state)
    {
        var stateHash = ComputeStateHash(state);
        var now = DateTime.UtcNow;

        var stateEntity = await dbContext.States
            .FirstOrDefaultAsync(s => s.StateHash == stateHash && s.StateValue == state);

        if (stateEntity == null)
        {
            logger.LogWarning("State not found: {StateHash}", stateHash);
            return false;
        }

        // Check expiration
        if (stateEntity.ExpiresAt < now)
        {
            logger.LogWarning(
                "State expired: {StateHash}, expired at {ExpiresAt}",
                stateHash, stateEntity.ExpiresAt);

            // Delete expired state
            dbContext.States.Remove(stateEntity);
            await dbContext.SaveChangesAsync();

            return false;
        }

        // Consume state (one-time use)
        dbContext.States.Remove(stateEntity);
        await dbContext.SaveChangesAsync();

        logger.LogInformation("Validated and consumed state {StateHash}", stateHash);
        return true;
    }

    // Private helpers
    private static string GenerateVerificationCode()
    {
        const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        var random = new char[32];

        using (var rng = RandomNumberGenerator.Create())
        {
            var bytes = new byte[32];
            rng.GetBytes(bytes);

            for (int i = 0; i < 32; i++)
            {
                random[i] = chars[bytes[i] % chars.Length];
            }
        }

        return new string(random);
    }

    private static string ComputeStateHash(string state)
    {
        using var sha256 = SHA256.Create();
        var hashBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(state));

        // Take first 128 bits (16 bytes) = 32 hex characters
        var sb = new StringBuilder(32);
        for (int i = 0; i < 16; i++)
        {
            sb.Append(hashBytes[i].ToString("x2"));
        }

        return sb.ToString();
    }
}
```

### 4.3 Dependency Injection Registration

**File**: `Backend/WhatsApp2Pipe.Api/Program.cs`

```csharp
// REMOVE old registration
// builder.Services.AddSingleton<ITableStorageService, TableStorageService>();

// ADD new registration
builder.Services.AddScoped<ISessionService, SqlSessionService>();
```

**Lifetime**: `Scoped` (one instance per HTTP request, aligned with DbContext lifetime)

---

## 5. Function Updates

### 5.1 AuthStartFunction

**File**: `Backend/WhatsApp2Pipe.Api/Functions/AuthStartFunction.cs`

**Changes**:
```csharp
// BEFORE
private readonly ITableStorageService tableStorageService;

public AuthStartFunction(
    ITableStorageService tableStorageService,
    IOAuthService oauthService,
    IOptions<PipedriveSettings> pipedriveSettings,
    ILogger<AuthStartFunction> logger)
{
    this.tableStorageService = tableStorageService;
    // ...
}

// Store state
await tableStorageService.StoreStateAsync(state);

// AFTER
private readonly ISessionService sessionService;

public AuthStartFunction(
    ISessionService sessionService,
    IOAuthService oauthService,
    IOptions<PipedriveSettings> pipedriveSettings,
    ILogger<AuthStartFunction> logger)
{
    this.sessionService = sessionService;
    // ...
}

// Store state
await sessionService.StoreStateAsync(state);
```

**Impact**: Minimal - only dependency injection changes

### 5.2 AuthCallbackFunction

**File**: `Backend/WhatsApp2Pipe.Api/Functions/AuthCallbackFunction.cs`

**Changes**:
```csharp
// BEFORE
private readonly ITableStorageService tableStorageService;

public AuthCallbackFunction(
    ITableStorageService tableStorageService,
    IOAuthService oauthService,
    IPipedriveApiClient pipedriveApiClient,
    IUserService userService,
    ILogger<AuthCallbackFunction> logger)
{
    this.tableStorageService = tableStorageService;
    // ...
}

// Validate state
var stateValid = await tableStorageService.ValidateAndConsumeStateAsync(state);

// Create session (BEFORE - no user context)
var session = await tableStorageService.CreateSessionAsync(
    tokenResponse.AccessToken,
    tokenResponse.RefreshToken,
    tokenResponse.ApiDomain,
    tokenResponse.ExpiresIn,
    stateObj.ExtensionId);

// AFTER
private readonly ISessionService sessionService;

public AuthCallbackFunction(
    ISessionService sessionService,
    IOAuthService oauthService,
    IPipedriveApiClient pipedriveApiClient,
    IUserService userService,
    ILogger<AuthCallbackFunction> logger)
{
    this.sessionService = sessionService;
    // ...
}

// Validate state
var stateValid = await sessionService.ValidateAndConsumeStateAsync(state);

// Create/update user FIRST (already exists in code)
var user = await userService.CreateOrUpdateUserAsync(userData);

// Create session (AFTER - with user context)
var session = await sessionService.CreateSessionAsync(
    user.UserId,              // NEW: User foreign key
    user.CompanyId,           // NEW: Company foreign key
    tokenResponse.AccessToken,
    tokenResponse.RefreshToken,
    tokenResponse.ApiDomain,
    tokenResponse.ExpiresIn,
    stateObj.ExtensionId);
```

**Impact**: Moderate - adds UserId/CompanyId parameters from user entity

### 5.3 Pipedrive API Functions

**Files**:
- `Backend/WhatsApp2Pipe.Api/Functions/PipedrivePersonsSearchFunction.cs`
- `Backend/WhatsApp2Pipe.Api/Functions/PipedrivePersonsCreateFunction.cs`
- `Backend/WhatsApp2Pipe.Api/Functions/PipedrivePersonsAttachPhoneFunction.cs`

**Changes** (same pattern for all):
```csharp
// BEFORE
private readonly ITableStorageService tableStorageService;

public PipedrivePersonsSearchFunction(
    ITableStorageService tableStorageService,
    IPipedriveApiClient pipedriveApiClient,
    PersonTransformService personTransformService,
    ILogger<PipedrivePersonsSearchFunction> logger)
{
    this.tableStorageService = tableStorageService;
    // ...
}

// Get session
var session = await tableStorageService.GetSessionAsync(verificationCode);

// AFTER
private readonly ISessionService sessionService;

public PipedrivePersonsSearchFunction(
    ISessionService sessionService,
    IPipedriveApiClient pipedriveApiClient,
    PersonTransformService personTransformService,
    ILogger<PipedrivePersonsSearchFunction> logger)
{
    this.sessionService = sessionService;
    // ...
}

// Get session
var session = await sessionService.GetSessionAsync(verificationCode);
```

**Impact**: Minimal - only dependency injection changes

---

## 6. Configuration Changes

### 6.1 Remove AzureSettings Class

**File**: `Backend/WhatsApp2Pipe.Api/Configuration/AzureSettings.cs`

**Action**: DELETE this file entirely

### 6.2 Update local.settings.json

**File**: `Backend/WhatsApp2Pipe.Api/local.settings.json`

**REMOVE** these settings:
```json
{
  "Values": {
    "Azure__StorageConnectionString": "...",
    "Azure__SessionTableName": "sessions",
    "Azure__StateTableName": "states",
    "Azure__SessionExpirationDays": "60",
    "Azure__StateExpirationMinutes": "5"
  }
}
```

**KEEP** these settings:
```json
{
  "ConnectionStrings": {
    "Chat2DealDb": "Server=localhost;Database=chat2deal-dev;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True"
  }
}
```

### 6.3 Update Program.cs

**File**: `Backend/WhatsApp2Pipe.Api/Program.cs`

**REMOVE** this configuration binding:
```csharp
// REMOVE
builder.Services.Configure<AzureSettings>(
    builder.Configuration.GetSection("Azure"));
```

**KEEP** existing DbContext configuration:
```csharp
// Keep as-is
builder.Services.AddDbContext<Chat2DealDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("Chat2DealDb")));
```

### 6.4 Update .csproj (if needed)

**File**: `Backend/WhatsApp2Pipe.Api/WhatsApp2Pipe.Api.csproj`

**REMOVE** (if present):
```xml
<PackageReference Include="Azure.Data.Tables" Version="..." />
```

**Note**: Run `dotnet remove package Azure.Data.Tables` to remove the NuGet package

---

## 7. Implementation Steps

### Phase 1: Data Model Setup

**Step 1.1**: Create Session entity
- File: `Backend/WhatsApp2Pipe.Api/Models/Session.cs`
- Add all properties, foreign keys, navigation properties
- Follow patterns from User.cs and Company.cs

**Step 1.2**: Create State entity
- File: `Backend/WhatsApp2Pipe.Api/Models/State.cs`
- No foreign keys needed
- Keep simple structure

**Step 1.3**: Update DbContext
- File: `Backend/WhatsApp2Pipe.Api/Models/Chat2DealDbContext.cs`
- Add `DbSet<Session> Sessions`
- Add `DbSet<State> States`
- Configure indexes and foreign keys in `OnModelCreating`

**Step 1.4**: Create EF Core migration
```bash
cd Backend/WhatsApp2Pipe.Api
dotnet ef migrations add AddSessionsAndStates
```

**Step 1.5**: Review migration
- File: `Backend/WhatsApp2Pipe.Api/Migrations/YYYYMMDD_AddSessionsAndStates.cs`
- Verify all columns, indexes, foreign keys are correct

**Step 1.6**: Apply migration to local database
```bash
dotnet ef database update
```

**Step 1.7**: Verify database schema
- Check Sessions table created with all indexes
- Check States table created with unique index
- Verify foreign key constraints on UserId and CompanyId

### Phase 2: Service Layer

**Step 2.1**: Create ISessionService interface
- File: `Backend/WhatsApp2Pipe.Api/Services/ISessionService.cs`
- Define all session and state methods

**Step 2.2**: Implement SqlSessionService
- File: `Backend/WhatsApp2Pipe.Api/Services/SqlSessionService.cs`
- Implement all methods with EF Core
- Add logging throughout
- Include lazy deletion for expired sessions

**Step 2.3**: Update dependency injection
- File: `Backend/WhatsApp2Pipe.Api/Program.cs`
- Remove `ITableStorageService` registration
- Add `ISessionService` registration with Scoped lifetime

**Step 2.4**: Remove old service files
- DELETE: `Backend/WhatsApp2Pipe.Api/Services/TableStorageService.cs`
- DELETE: `Backend/WhatsApp2Pipe.Api/Services/ITableStorageService.cs`

### Phase 3: Function Updates

**Step 3.1**: Update AuthStartFunction
- Replace `ITableStorageService` with `ISessionService` in constructor
- Update `StoreStateAsync` call (no signature change)
- Test OAuth initiation flow

**Step 3.2**: Update AuthCallbackFunction
- Replace `ITableStorageService` with `ISessionService` in constructor
- Update `CreateSessionAsync` to pass `userId` and `companyId` (get from `user` entity)
- Ensure user creation happens before session creation
- Test complete OAuth flow

**Step 3.3**: Update PipedrivePersonsSearchFunction
- Replace `ITableStorageService` with `ISessionService` in constructor
- Update `GetSessionAsync` call (no signature change)
- Test person search with Bearer token

**Step 3.4**: Update PipedrivePersonsCreateFunction
- Replace `ITableStorageService` with `ISessionService` in constructor
- Update `GetSessionAsync` call (no signature change)
- Test person creation

**Step 3.5**: Update PipedrivePersonsAttachPhoneFunction
- Replace `ITableStorageService` with `ISessionService` in constructor
- Update `GetSessionAsync` call (no signature change)
- Test phone attachment

### Phase 4: Configuration Cleanup

**Step 4.1**: Delete AzureSettings class
- DELETE: `Backend/WhatsApp2Pipe.Api/Configuration/AzureSettings.cs`

**Step 4.2**: Remove Azure Storage configuration
- File: `Backend/WhatsApp2Pipe.Api/local.settings.json`
- Remove all `Azure__*` settings
- Keep `ConnectionStrings:Chat2DealDb`

**Step 4.3**: Update Program.cs
- Remove `AzureSettings` configuration binding
- Keep DbContext configuration

**Step 4.4**: Remove Azure Storage NuGet package
```bash
cd Backend/WhatsApp2Pipe.Api
dotnet remove package Azure.Data.Tables
```

**Step 4.5**: Clean and rebuild
```bash
dotnet clean
dotnet build
```

### Phase 5: Testing

**Step 5.1**: Unit test SqlSessionService
- Test session creation with UserId/CompanyId
- Test session retrieval by verification code
- Test expired session handling (lazy deletion)
- Test state validation and consumption

**Step 5.2**: Integration test OAuth flow
- Test full OAuth flow from start to callback
- Verify User/Company entities created
- Verify Session created with correct foreign keys
- Verify state consumed after validation

**Step 5.3**: Integration test API functions
- Test person search with valid session
- Test person search with expired session (expect 401)
- Test person search with invalid verification code (expect 401)
- Test person create and attach phone flows

**Step 5.4**: Manual testing with Chrome extension
- Clear existing sessions in extension
- Perform OAuth authentication
- Verify extension receives verification code
- Test person search, create, attach flows
- Verify all functionality works identically to before

---

## 8. Testing Strategy

### 8.1 Unit Tests

**Test SqlSessionService** (`Tests/Services/SqlSessionServiceTests.cs`)

```csharp
[Fact]
public async Task CreateSessionAsync_WithValidData_CreatesSession()
{
    // Arrange
    var userId = Guid.NewGuid();
    var companyId = Guid.NewGuid();

    // Act
    var session = await sessionService.CreateSessionAsync(
        userId, companyId, "access", "refresh", "api.pipedrive.com", 3600, "ext123");

    // Assert
    Assert.NotNull(session);
    Assert.Equal(userId, session.UserId);
    Assert.Equal(companyId, session.CompanyId);
    Assert.Equal(32, session.VerificationCode.Length);
}

[Fact]
public async Task GetSessionAsync_WithExpiredSession_ReturnsNullAndDeletes()
{
    // Test lazy deletion of expired sessions
}

[Fact]
public async Task ValidateAndConsumeStateAsync_WithValidState_ReturnsTrue()
{
    // Test one-time state consumption
}
```

### 8.2 Integration Tests

**Test OAuth Flow** (`Tests/Integration/OAuthFlowTests.cs`)

```csharp
[Fact]
public async Task CompleteOAuthFlow_CreatesUserAndSession()
{
    // 1. Call AuthStart with state
    // 2. Verify state stored in database
    // 3. Call AuthCallback with code and state
    // 4. Verify User created/updated
    // 5. Verify Session created with UserId/CompanyId
    // 6. Verify state consumed (deleted)
}
```

**Test API Functions** (`Tests/Integration/PipedriveFunctionsTests.cs`)

```csharp
[Fact]
public async Task SearchPersons_WithValidSession_ReturnsResults()
{
    // Create test session in database
    // Call search function with verification code
    // Verify success
}

[Fact]
public async Task SearchPersons_WithExpiredSession_Returns401()
{
    // Create expired session in database
    // Call search function
    // Verify 401 Unauthorized
}
```

### 8.3 Manual Testing Checklist

**Prerequisites**:
- Local SQL database running
- Backend running locally (`func start`)
- Chrome extension built and loaded

**Test Cases**:

1. **OAuth Authentication**
   - [ ] Clear extension storage
   - [ ] Click "Connect Pipedrive" in extension
   - [ ] Complete Pipedrive OAuth flow
   - [ ] Verify extension shows "Connected" state
   - [ ] Verify Session exists in SQL database
   - [ ] Verify UserId and CompanyId populated correctly

2. **Person Search**
   - [ ] Open WhatsApp chat
   - [ ] Sidebar loads with person search
   - [ ] Search finds correct person
   - [ ] No errors in console

3. **Person Creation**
   - [ ] Open WhatsApp chat with unknown number
   - [ ] Click "Create New Person"
   - [ ] Fill form and submit
   - [ ] Verify person created in Pipedrive
   - [ ] Verify phone attached

4. **Session Expiration**
   - [ ] Manually update Session.SessionExpiresAt to past date
   - [ ] Attempt person search
   - [ ] Verify 401 error
   - [ ] Verify session deleted from database
   - [ ] Verify extension shows "Disconnected" state

5. **Multi-Session Support**
   - [ ] Authenticate from Chrome browser
   - [ ] Authenticate from Edge browser (same user)
   - [ ] Verify two sessions exist in database
   - [ ] Verify both extensions work simultaneously

---

## 9. Deployment Plan

### 9.1 Pre-Deployment Checklist

- [ ] All code changes committed
- [ ] All unit tests passing
- [ ] All integration tests passing
- [ ] Manual testing completed
- [ ] Database migration script reviewed
- [ ] Configuration settings prepared for production

### 9.2 Deployment Steps

**Step 1**: Backup current Azure Table Storage data (optional)
```bash
# Export sessions and states tables for audit/rollback
# Not required for MVP, but recommended for production
```

**Step 2**: Deploy database migration
```bash
# Option A: Run migration from local machine
cd Backend/WhatsApp2Pipe.Api
dotnet ef database update --connection "Server=<azure-sql-server>;Database=Chat2DealDb;..."

# Option B: Include migration in deployment (automatic on first run)
# EF Core will apply pending migrations on startup if configured
```

**Step 3**: Update Azure Function App settings
- Navigate to Azure Portal → Function App → Configuration
- REMOVE Azure Storage settings:
  - `Azure__StorageConnectionString`
  - `Azure__SessionTableName`
  - `Azure__StateTableName`
  - `Azure__SessionExpirationDays`
  - `Azure__StateExpirationMinutes`
- VERIFY SQL connection string exists:
  - `ConnectionStrings:Chat2DealDb`
- Save changes and restart Function App

**Step 4**: Deploy backend code
```bash
cd Backend/WhatsApp2Pipe.Api
func azure functionapp publish <function-app-name>
```

**Step 5**: Verify deployment
- Check Function App logs in Azure Portal
- Verify no startup errors
- Test OAuth flow manually
- Test API endpoints with Postman/curl

### 9.3 Post-Deployment Verification

- [ ] OAuth authentication works (creates sessions in SQL)
- [ ] Person search works with Bearer token
- [ ] Person create works
- [ ] Expired sessions return 401
- [ ] No errors in Application Insights logs
- [ ] Extension users can authenticate successfully

### 9.4 User Communication

**Notification**: Send to all extension users

> **Action Required: Re-authentication Needed**
>
> We've upgraded our backend infrastructure to improve performance and reliability. As part of this upgrade, all existing sessions have been invalidated.
>
> **What you need to do**:
> 1. Open the WhatsApp2Pipe extension
> 2. Click "Connect Pipedrive" to re-authenticate
> 3. Complete the Pipedrive OAuth flow
>
> This is a one-time action. After re-authenticating, everything will work as before.
>
> If you experience any issues, please contact support.

---

## 10. Rollback Plan

### 10.1 Rollback Triggers

Initiate rollback if:
- OAuth flow fails consistently (>50% failure rate)
- API functions return 500 errors (database connection issues)
- Session validation fails incorrectly
- Critical bugs discovered in production

### 10.2 Rollback Steps

**Step 1**: Redeploy previous backend version
```bash
# Deploy last known good version from git
git checkout <previous-commit-hash>
cd Backend/WhatsApp2Pipe.Api
func azure functionapp publish <function-app-name>
```

**Step 2**: Restore Azure Storage configuration
- Navigate to Azure Portal → Function App → Configuration
- ADD Azure Storage settings:
  - `Azure__StorageConnectionString=<connection-string>`
  - `Azure__SessionTableName=sessions`
  - `Azure__StateTableName=states`
  - `Azure__SessionExpirationDays=60`
  - `Azure__StateExpirationMinutes=5`
- Save and restart Function App

**Step 3**: Verify rollback successful
- Test OAuth flow
- Test API endpoints
- Check logs for errors

**Step 4**: Communicate with users
> We've temporarily rolled back to our previous system. You may need to re-authenticate again. We apologize for the inconvenience and are working on a fix.

### 10.3 Database Rollback

**Option A**: Leave new tables in place
- Sessions and States tables remain but unused
- No data loss for Users/Companies
- Can retry migration after fixes

**Option B**: Remove new tables
```sql
-- Only if absolutely necessary
DROP TABLE Sessions;
DROP TABLE States;

-- Remove EF Core migration record
DELETE FROM __EFMigrationsHistory
WHERE MigrationId = '<migration-id-for-sessions-states>';
```

**Recommendation**: Use Option A. Leave new tables in place but unused. This allows for faster retry of the migration once issues are fixed.

---

## 11. Success Metrics

### 11.1 Technical Metrics

- **Zero Azure Storage dependencies** in codebase
- **100% of OAuth flows** create sessions in SQL with UserId/CompanyId
- **All API functions** successfully retrieve sessions from SQL
- **Database query performance** < 50ms for session lookups
- **No increase** in API error rates post-deployment

### 11.2 User Metrics

- **User re-authentication rate** = 100% (expected, one-time)
- **OAuth success rate** ≥ 95%
- **API success rate** ≥ 99% (excluding invalid tokens)
- **User complaints** = 0 (excluding re-auth requirement)

### 11.3 Monitoring

**Key Queries to Monitor**:

```sql
-- Count active sessions
SELECT COUNT(*) FROM Sessions WHERE SessionExpiresAt > GETUTCDATE();

-- Count sessions per user
SELECT UserId, COUNT(*) as SessionCount
FROM Sessions
GROUP BY UserId
ORDER BY SessionCount DESC;

-- Check for orphaned sessions (invalid foreign keys - shouldn't happen)
SELECT * FROM Sessions
WHERE UserId NOT IN (SELECT UserId FROM Users)
   OR CompanyId NOT IN (SELECT CompanyId FROM Companies);

-- Monitor state table size (should be small, <100 rows typically)
SELECT COUNT(*) FROM States;
```

**Application Insights Queries**:
- Monitor `SqlSessionService` log entries
- Track OAuth flow completion rates
- Monitor 401 errors (expired sessions)
- Track database query durations

---

## 12. Future Enhancements

### 12.1 Session Management Features

**User Dashboard** (post-MVP):
- Display all active sessions for a user
- Show device/browser information (ExtensionId)
- Allow users to revoke individual sessions
- "Revoke all sessions" button

**Admin Dashboard** (post-MVP):
- Company-level session analytics
- Monitor active users
- Force-revoke sessions if needed

### 12.2 Performance Optimizations

**Caching Layer** (if needed):
- Cache active sessions in Redis for faster lookups
- Reduce SQL database load for high-traffic scenarios
- Cache invalidation on session update/delete

**Automatic Cleanup** (post-MVP):
- Azure Function timer trigger (daily)
- Delete expired sessions and states
- Keep database size manageable

### 12.3 Security Enhancements

**Token Encryption** (post-MVP):
- Encrypt AccessToken and RefreshToken at application level
- Use Azure Key Vault for encryption keys
- Decrypt on retrieval for API calls

**Session Rotation**:
- Implement session refresh mechanism
- Generate new verification codes periodically
- Improve security posture

---

## 13. Risks and Mitigations

### 13.1 Identified Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| All users logged out after deployment | High | 100% | Clear communication, simple re-auth process |
| Database migration fails | High | Low | Test migrations locally, have rollback plan |
| EF Core performance issues | Medium | Low | Index optimization, query monitoring |
| Foreign key constraint violations | High | Low | Ensure User/Company created before Session |
| Missing Azure Storage package causes build failure | Low | Medium | Test build after package removal |

### 13.2 Mitigation Strategies

**Risk 1: User Impact**
- **Mitigation**: Proactive email/notification before deployment
- **Acceptance**: Users expect occasional re-authentication in MVP
- **Support**: Prepare support documentation for re-auth process

**Risk 2: Migration Failure**
- **Mitigation**: Test migration on local database first
- **Mitigation**: Run migration manually before code deployment
- **Recovery**: Rollback code, investigate migration issues offline

**Risk 3: Performance**
- **Mitigation**: Comprehensive indexing strategy (implemented)
- **Mitigation**: Use EF Core tracking optimization (AsNoTracking for read-only queries)
- **Monitoring**: Application Insights query duration tracking

**Risk 4: Foreign Key Violations**
- **Mitigation**: Ensure AuthCallbackFunction creates User BEFORE Session
- **Mitigation**: Add null checks and validation
- **Testing**: Integration tests verify correct order of operations

---

## 14. Appendix

### 14.1 SQL Schema Reference

**Sessions Table**:
```sql
CREATE TABLE [dbo].[Sessions] (
    [SessionId] UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
    [VerificationCode] NVARCHAR(32) NOT NULL,
    [UserId] UNIQUEIDENTIFIER NOT NULL,
    [CompanyId] UNIQUEIDENTIFIER NOT NULL,
    [AccessToken] NVARCHAR(MAX) NOT NULL,
    [RefreshToken] NVARCHAR(MAX) NOT NULL,
    [ApiDomain] NVARCHAR(255) NOT NULL,
    [ExpiresAt] DATETIME2 NOT NULL,
    [SessionExpiresAt] DATETIME2 NOT NULL,
    [ExtensionId] NVARCHAR(255) NOT NULL,
    [CreatedAt] DATETIME2 NOT NULL,

    CONSTRAINT [FK_Sessions_Users]
        FOREIGN KEY ([UserId]) REFERENCES [Users]([UserId]) ON DELETE NO ACTION,
    CONSTRAINT [FK_Sessions_Companies]
        FOREIGN KEY ([CompanyId]) REFERENCES [Companies]([CompanyId]) ON DELETE NO ACTION
);

CREATE UNIQUE INDEX [IX_Sessions_VerificationCode] ON [Sessions]([VerificationCode]);
CREATE INDEX [IX_Sessions_UserId] ON [Sessions]([UserId]);
CREATE INDEX [IX_Sessions_CompanyId] ON [Sessions]([CompanyId]);
CREATE INDEX [IX_Sessions_UserId_CompanyId] ON [Sessions]([UserId], [CompanyId]);
```

**States Table**:
```sql
CREATE TABLE [dbo].[States] (
    [StateId] UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
    [StateHash] NVARCHAR(64) NOT NULL,
    [StateValue] NVARCHAR(MAX) NOT NULL,
    [CreatedAt] DATETIME2 NOT NULL,
    [ExpiresAt] DATETIME2 NOT NULL
);

CREATE UNIQUE INDEX [IX_States_StateHash] ON [States]([StateHash]);
```

### 14.2 Configuration Reference

**local.settings.json** (after migration):
```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "dotnet-isolated",

    "Pipedrive__ClientId": "your-client-id",
    "Pipedrive__ClientSecret": "your-client-secret",
    "Pipedrive__RedirectUri": "http://localhost:7071/api/auth/callback",
    "Pipedrive__AuthorizationEndpoint": "https://oauth.pipedrive.com/oauth/authorize",
    "Pipedrive__TokenEndpoint": "https://oauth.pipedrive.com/oauth/token",
    "Pipedrive__ApiBaseUrl": "https://api.pipedrive.com/v1"
  },
  "ConnectionStrings": {
    "Chat2DealDb": "Server=localhost;Database=chat2deal-dev;Trusted_Connection=True;MultipleActiveResultSes=true;TrustServerCertificate=True"
  }
}
```

### 14.3 Useful Commands

**Entity Framework**:
```bash
# Create migration
dotnet ef migrations add AddSessionsAndStates

# Apply migration
dotnet ef database update

# Rollback migration
dotnet ef database update PreviousMigrationName

# Generate SQL script
dotnet ef migrations script > migration.sql

# Remove last migration (if not applied)
dotnet ef migrations remove
```

**Azure Functions**:
```bash
# Run locally
func start

# Deploy to Azure
func azure functionapp publish <function-app-name>

# View logs
func azure functionapp logstream <function-app-name>
```

**Database Queries**:
```sql
-- Check migration history
SELECT * FROM __EFMigrationsHistory ORDER BY MigrationId DESC;

-- View all sessions with user info
SELECT s.*, u.Name, u.Email, c.CompanyName
FROM Sessions s
JOIN Users u ON s.UserId = u.UserId
JOIN Companies c ON s.CompanyId = c.CompanyId;

-- Find expired sessions
SELECT * FROM Sessions WHERE SessionExpiresAt < GETUTCDATE();

-- Count active sessions per company
SELECT c.CompanyName, COUNT(s.SessionId) as ActiveSessions
FROM Companies c
LEFT JOIN Sessions s ON c.CompanyId = s.CompanyId
    AND s.SessionExpiresAt > GETUTCDATE()
GROUP BY c.CompanyName;
```

---

## 15. Document Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-11-01 | Initial | Complete implementation plan created |

---

## 16. Approval and Sign-off

**Technical Review**: [ ] Approved
**Architecture Review**: [ ] Approved
**Security Review**: [ ] Approved
**Ready for Implementation**: [ ] Yes / [ ] No

---

**End of Implementation Plan**
