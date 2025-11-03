# Spec-120: Website Invite System (Closed Beta Access Control)

**Feature:** Feature 20 - Closed Beta Invite System (Website)
**Date:** 2025-11-03
**Status:** Draft
**Dependencies:** Spec-119 (Website Pipedrive Authentication), Spec-105a (Backend OAuth Service)

---

## Implementation Split

Feature 20 (Closed Beta Invite System) is split into two independent specifications:

- **Spec-120 (This Document):** Website Invite System - React UI + Backend OAuth Integration
- **Spec-121:** Extension Beta Access Control - Extension error states for rejected users

**Implementation Order:**
1. Spec-120 (Website + Backend) - Database migration, backend validation, website UI
2. Spec-121 (Extension) - Extension UI changes for rejected user state

---

**Related Docs:**
- [BRD-001-MVP-Pipedrive-WhatsApp.md](../BRDs/BRD-001-MVP-Pipedrive-WhatsApp.md) - Section 6.4 (Closed Beta Invite System)
- [Plan-001-MVP-Feature-Breakdown.md](../Plans/Plan-001-MVP-Feature-Breakdown.md) - Feature 20
- [Spec-119-Website-Pipedrive-Auth.md](Spec-119-Website-Pipedrive-Auth.md) - Website authentication foundation
- [Spec-105a-Backend-OAuth-Service.md](Spec-105a-Backend-OAuth-Service.md) - Backend OAuth architecture

---

## 1. Overview

Implement invite-based access control for the Chat2Deal closed beta. New users must provide a valid invite code when signing up via the website. Existing users can sign in without an invite. Invites are multi-use unlimited codes that track usage but don't expire or get consumed.

**Why this matters:** Controls access during closed beta, prevents unauthorized signups, enables tracking of invite effectiveness, and provides flexibility for different marketing campaigns.

**Architecture Pattern:** Server-side validation with client-side UX enhancement. Invite codes passed through OAuth state parameter for security.

---

## 2. Objectives

- Add invite code input field to website sign-in page (required field)
- Support URL parameter `?i=my-invite` to auto-fill invite field
- Pass invite code through OAuth state parameter
- Validate invite server-side during OAuth callback for new users
- Create database schema for invites and user-invite relationships
- Track invite usage count on successful signups
- Allow existing users to bypass invite requirement
- Display appropriate error messages for invalid/missing invites

---

## 3. Database Schema Changes

### 3.1 New Table: Invites

**Purpose:** Store invite codes created by admin/DBA via manual database insertion.

**C# Entity Model:**
```csharp
namespace WhatsApp2Pipe.Api.Models;

/// <summary>
/// Represents an invite code for closed beta access.
/// </summary>
public class Invite
{
    /// <summary>
    /// Primary key - Auto-generated GUID.
    /// </summary>
    public Guid InviteId { get; set; }

    /// <summary>
    /// Invite code string (e.g., "early-access-2024", "twitter-campaign").
    /// Unique, max 100 characters.
    /// </summary>
    public string Code { get; set; } = string.Empty;

    /// <summary>
    /// Timestamp when invite was created.
    /// </summary>
    public DateTime CreatedAt { get; set; }

    /// <summary>
    /// Number of users who have signed up with this invite.
    /// Incremented on each successful signup.
    /// </summary>
    public int UsageCount { get; set; }

    /// <summary>
    /// Optional description for admin reference (e.g., "Twitter campaign Nov 2024").
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Navigation property - Users who signed up with this invite.
    /// </summary>
    public ICollection<User> Users { get; set; } = new List<User>();
}
```

**Table Configuration (Chat2DealDbContext.cs):**
```csharp
modelBuilder.Entity<Invite>(entity =>
{
    entity.ToTable("Invites");

    entity.HasKey(i => i.InviteId);

    // Unique constraint on Code
    entity.HasIndex(i => i.Code)
          .IsUnique()
          .HasDatabaseName("IX_Invites_Code");

    // Required fields
    entity.Property(i => i.Code)
          .IsRequired()
          .HasMaxLength(100);

    entity.Property(i => i.CreatedAt)
          .IsRequired();

    entity.Property(i => i.UsageCount)
          .IsRequired();

    entity.Property(i => i.Description)
          .HasMaxLength(500);

    // One-to-Many relationship
    entity.HasMany(i => i.Users)
          .WithOne(u => u.Invite)
          .HasForeignKey(u => u.InviteId)
          .OnDelete(DeleteBehavior.Restrict);
});
```

### 3.2 Modified Table: Users

**Changes:** Add nullable foreign key to Invites table.

**Updated C# Entity Model:**
```csharp
public class User
{
    public Guid UserId { get; set; }
    public Guid CompanyId { get; set; }
    public int PipedriveUserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime LastLoginAt { get; set; }

    // NEW: Nullable foreign key to Invites
    public Guid? InviteId { get; set; }

    // Navigation properties
    public Company Company { get; set; } = null!;
    public Invite? Invite { get; set; } // NEW: Navigation property
}
```

**Table Configuration Update:**
```csharp
modelBuilder.Entity<User>(entity =>
{
    // ... existing configuration ...

    // NEW: Foreign key relationship
    entity.HasOne(u => u.Invite)
          .WithMany(i => i.Users)
          .HasForeignKey(u => u.InviteId)
          .OnDelete(DeleteBehavior.Restrict);
});
```

### 3.3 Entity Framework Migration

**Migration Name:** `AddInviteSystem`

**Commands:**
```bash
cd Backend/WhatsApp2Pipe.Api
dotnet ef migrations add AddInviteSystem
dotnet ef database update
```

**Migration Operations:**
1. Create `Invites` table
2. Add `InviteId` column to `Users` table (nullable)
3. Create unique index on `Invites.Code`
4. Create foreign key constraint `Users.InviteId → Invites.InviteId`

---

## 4. Backend Changes

### 4.1 Modified Model: OAuthState

**Location:** `Backend/WhatsApp2Pipe.Api/Models/OAuthState.cs`

**Changes:** Add `InviteCode` property.

```csharp
namespace WhatsApp2Pipe.Api.Models;

public class OAuthState
{
    public string Type { get; set; } = default!; // "web" or "extension"
    public string? ExtensionId { get; set; }
    public string? InviteCode { get; set; } // NEW: Invite code for signup
    public long Timestamp { get; set; }
}
```

### 4.2 Modified Function: AuthStartFunction

**Location:** `Backend/WhatsApp2Pipe.Api/Functions/AuthStartFunction.cs`

**Changes:** Extract `inviteCode` from query parameters and include in OAuthState.

**Modified Run method:**
```csharp
[Function("AuthStart")]
public async Task<HttpResponseData> Run(
    [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "auth/start")] HttpRequestData req)
{
    logger.LogInformation("AuthStart endpoint called");

    try
    {
        // Parse query parameters
        var query = QueryHelpers.ParseQuery(req.Url.Query);
        var type = query.TryGetValue("type", out var typeValue) ? typeValue.ToString() : "extension";
        var extensionId = query.TryGetValue("extensionId", out var extIdValue) ? extIdValue.ToString() : null;
        var inviteCode = query.TryGetValue("inviteCode", out var inviteValue) ? inviteValue.ToString() : null; // NEW

        // Build OAuth state
        var state = new OAuthState
        {
            Type = type,
            ExtensionId = extensionId,
            InviteCode = inviteCode, // NEW
            Timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds()
        };

        // ... rest of existing logic ...
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Error in AuthStart endpoint");
        return await CreateJsonErrorResponse(req, HttpStatusCode.InternalServerError, "Failed to start authentication");
    }
}
```

### 4.3 Modified Function: AuthCallbackFunction

**Location:** `Backend/WhatsApp2Pipe.Api/Functions/AuthCallbackFunction.cs`

**Changes:** Add invite validation logic for new users.

**Modified user creation logic:**
```csharp
// After fetching user profile from Pipedrive /users/me...

// Extract invite code from state
var inviteCode = stateData.InviteCode;

logger.LogInformation("Checking if user exists in database");

// Try to find existing user
var existingUser = await userService.GetUserByPipedriveIdAsync(
    userResponse.Data.Id,
    userResponse.Data.CompanyId);

if (existingUser != null)
{
    // EXISTING USER: Update LastLoginAt and proceed normally
    logger.LogInformation("Existing user {UserId} found, updating LastLoginAt", existingUser.UserId);
    existingUser.LastLoginAt = DateTime.UtcNow;
    await userService.UpdateUserAsync(existingUser);

    // Create session (existing logic)
    var session = await sessionService.CreateSessionAsync(/* ... */);

    // Return success redirect (existing logic)
}
else
{
    // NEW USER: Validate invite code
    logger.LogInformation("New user detected, validating invite code");

    if (string.IsNullOrWhiteSpace(inviteCode))
    {
        logger.LogWarning("New user attempted signup without invite code");
        return CreateHtmlErrorResponse(req, HttpStatusCode.Forbidden, "closed_beta");
    }

    // Validate invite exists in database
    var invite = await dbContext.Invites
        .FirstOrDefaultAsync(i => i.Code == inviteCode);

    if (invite == null)
    {
        logger.LogWarning("New user provided invalid invite code: {InviteCode}", inviteCode);
        return CreateHtmlErrorResponse(req, HttpStatusCode.Forbidden, "invalid_invite");
    }

    logger.LogInformation("Valid invite code provided: {InviteCode}", inviteCode);

    // Create user and link to invite
    var newUser = await userService.CreateOrUpdateUserAsync(userResponse.Data, invite.InviteId);

    // Increment invite usage count
    invite.UsageCount++;
    await dbContext.SaveChangesAsync();

    logger.LogInformation("New user {UserId} created with invite {InviteId}", newUser.UserId, invite.InviteId);

    // Create session (existing logic)
    var session = await sessionService.CreateSessionAsync(/* ... */);

    // Return success redirect (existing logic)
}
```

**New error HTML responses:**
```csharp
private string GenerateErrorHtml(string error)
{
    var errorMessages = new Dictionary<string, string>
    {
        // ... existing errors ...
        { "closed_beta", "Chat2Deal is currently in closed beta. Access is limited to invited users only." },
        { "invalid_invite", "Invalid invite code. Please check your invite and try again." }
    };

    // ... existing HTML generation ...
}
```

### 4.4 Modified Service: IUserService

**Location:** `Backend/WhatsApp2Pipe.Api/Services/IUserService.cs`

**Changes:** Add optional `inviteId` parameter to user creation.

**Modified interface:**
```csharp
public interface IUserService
{
    /// <summary>
    /// Create or update user and company based on Pipedrive user data.
    /// </summary>
    /// <param name="userData">Pipedrive user data from /users/me</param>
    /// <param name="inviteId">Optional invite ID for new users (null for existing users)</param>
    Task<User> CreateOrUpdateUserAsync(PipedriveUserData userData, Guid? inviteId = null);

    // ... existing methods ...
}
```

### 4.5 Modified Service: UserService

**Location:** `Backend/WhatsApp2Pipe.Api/Services/UserService.cs`

**Changes:** Set `InviteId` when creating new users.

**Modified implementation:**
```csharp
public async Task<User> CreateOrUpdateUserAsync(PipedriveUserData userData, Guid? inviteId = null)
{
    // ... existing company creation logic ...

    // Find or create User
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
            LastLoginAt = DateTime.UtcNow,
            InviteId = inviteId // NEW: Set invite ID for new users
        };

        dbContext.Users.Add(user);
        logger.LogInformation("Created user {UserId} with invite {InviteId}", user.UserId, inviteId);
    }
    else
    {
        // Existing user - update LastLoginAt only
        user.LastLoginAt = DateTime.UtcNow;
        logger.LogInformation("Updated LastLoginAt for user {UserId}", user.UserId);
    }

    await dbContext.SaveChangesAsync();
    return user;
}
```

---

## 5. Website Frontend Changes

### 5.1 Modified Page: HomePage (Sign-In Page)

**Location:** `Website/src/pages/HomePage.tsx`

**Changes:** Add invite code input field, URL parameter handling, and form validation.

**Implementation:**
```tsx
import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { authService } from '../services/authService'
import { Button } from '../components/ui/button'

export default function HomePage() {
  const [searchParams] = useSearchParams()
  const [inviteCode, setInviteCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Auto-fill invite from URL parameter ?i=my-invite
  useEffect(() => {
    const inviteParam = searchParams.get('i')
    if (inviteParam) {
      setInviteCode(inviteParam)
    }
  }, [searchParams])

  const handleSignIn = () => {
    if (!inviteCode.trim()) {
      return // Prevent submission if empty (button should be disabled anyway)
    }

    setIsLoading(true)
    authService.startAuth(inviteCode.trim())
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Chat2Deal
          </h1>
          <p className="text-lg text-gray-600">
            Capture WhatsApp conversations in Pipedrive
          </p>
        </div>

        <div className="bg-white py-8 px-6 shadow-lg rounded-lg">
          <div className="space-y-6">
            <div>
              <label htmlFor="inviteCode" className="block text-sm font-medium text-gray-700 mb-2">
                Invite Code *
              </label>
              <input
                type="text"
                id="inviteCode"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                placeholder="Enter your invite code"
                maxLength={100}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="mt-2 text-sm text-gray-500">
                Chat2Deal is currently in closed beta. An invite code is required to sign up.
              </p>
            </div>

            <Button
              onClick={handleSignIn}
              disabled={!inviteCode.trim() || isLoading}
              className="w-full"
            >
              {isLoading ? 'Redirecting...' : 'Sign in with Pipedrive'}
            </Button>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500">
          Don't have an invite? Contact us for beta access.
        </p>
      </div>
    </div>
  )
}
```

### 5.2 Modified Service: authService

**Location:** `Website/src/services/authService.ts`

**Changes:** Accept `inviteCode` parameter in `startAuth()` method.

**Modified implementation:**
```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:7071'

class AuthService {
  // ... existing methods ...

  /**
   * Start OAuth flow with invite code
   */
  startAuth(inviteCode: string): void {
    const params = new URLSearchParams({
      type: 'web',
      inviteCode: inviteCode
    })

    const authUrl = `${API_BASE_URL}/api/auth/start?${params.toString()}`
    window.location.href = authUrl
  }

  // ... existing methods ...
}

export const authService = new AuthService()
```

### 5.3 Modified Page: AuthCallbackPage

**Location:** `Website/src/pages/AuthCallbackPage.tsx`

**Changes:** Add error handling for new error types.

**Modified error handling:**
```tsx
function getErrorMessage(error: string): string {
  switch (error) {
    case 'user_denied':
      return 'You cancelled the sign-in process'
    case 'invalid_state':
      return 'Invalid authentication state'
    case 'auth_failed':
      return 'Authentication failed. Please try again.'
    case 'closed_beta':
      return 'Chat2Deal is currently in closed beta. Access is limited to invited users only.'
    case 'invalid_invite':
      return 'Invalid invite code. Please check your invite and try again.'
    default:
      return 'An error occurred during authentication'
  }
}
```

---

## 6. Testing Strategy

### 6.1 Database Testing

**Manual SQL Commands:**

**Create test invite:**
```sql
INSERT INTO Invites (InviteId, Code, CreatedAt, UsageCount, Description)
VALUES (NEWID(), 'test-invite-2024', GETUTCDATE(), 0, 'Test invite for development');
```

**Query invites:**
```sql
SELECT * FROM Invites;
```

**Query users with invite information:**
```sql
SELECT
    u.UserId,
    u.Name,
    u.Email,
    i.Code AS InviteCode,
    i.UsageCount
FROM Users u
LEFT JOIN Invites i ON u.InviteId = i.InviteId;
```

### 6.2 Backend Testing

**Test Cases:**

1. **New user with valid invite:**
   - Navigate to `http://localhost:5173/?i=test-invite-2024`
   - Complete OAuth flow
   - Verify user created with `InviteId` set
   - Verify `Invites.UsageCount` incremented

2. **New user without invite:**
   - Navigate to `http://localhost:5173/`
   - Leave invite field empty
   - Attempt sign-in → Button should be disabled

3. **New user with invalid invite:**
   - Enter invalid invite code
   - Complete OAuth flow
   - Verify error message: "Invalid invite code"

4. **Existing user without invite:**
   - Existing user signs in without entering invite
   - OAuth flow should succeed
   - Verify `InviteId` remains null

5. **Existing user with invite:**
   - Existing user enters any invite code
   - OAuth flow should succeed
   - Verify `InviteId` unchanged (not updated)

### 6.3 Frontend Testing

**Test Cases:**

1. **URL parameter auto-fill:**
   - Visit `/?i=my-invite-code`
   - Verify invite field pre-filled
   - Verify field is editable

2. **Form validation:**
   - Empty invite field → Button disabled
   - Non-empty invite field → Button enabled

3. **Error display:**
   - Trigger `closed_beta` error
   - Verify error message displays correctly
   - Trigger `invalid_invite` error
   - Verify error message displays correctly

---

## 7. Acceptance Criteria

### 7.1 Database

- ✅ `Invites` table created with correct schema
- ✅ `Users.InviteId` column added (nullable)
- ✅ Foreign key constraint created
- ✅ Unique index on `Invites.Code`
- ✅ Migration applied successfully

### 7.2 Backend

- ✅ `OAuthState` includes `InviteCode` field
- ✅ `AuthStart` extracts invite from query parameter
- ✅ `AuthCallback` validates invite for new users
- ✅ New user without invite → `closed_beta` error
- ✅ New user with invalid invite → `invalid_invite` error
- ✅ New user with valid invite → User created with `InviteId`
- ✅ `Invites.UsageCount` incremented on signup
- ✅ Existing user → Invite ignored, sign-in succeeds

### 7.3 Website

- ✅ Sign-in page shows invite input field (required)
- ✅ URL parameter `?i=code` auto-fills invite field
- ✅ Sign-in button disabled when invite empty
- ✅ `authService.startAuth(inviteCode)` passes invite to backend
- ✅ Error messages display for `closed_beta` and `invalid_invite`
- ✅ Help text explains closed beta requirement

---

## 8. Security Considerations

### 8.1 Server-Side Validation

- ✅ Invite validation performed server-side only (client-side is UX only)
- ✅ Cannot bypass validation with browser dev tools
- ✅ Invite code passed through OAuth state parameter (CSRF protected)
- ✅ State parameter validated before invite check

### 8.2 Data Protection

- ✅ Invite codes stored in encrypted Azure SQL Database
- ✅ No sensitive data in invite codes (public strings)
- ✅ HTTPS enforced on all endpoints
- ✅ Existing users protected from accidental invite association

---

## 9. Admin Operations

### 9.1 Creating Invites

**Manual SQL insertion (by admin/DBA):**

```sql
-- Create single-purpose invite
INSERT INTO Invites (InviteId, Code, CreatedAt, UsageCount, Description)
VALUES (NEWID(), 'early-access-nov-2024', GETUTCDATE(), 0, 'Early access program November 2024');

-- Create campaign-specific invite
INSERT INTO Invites (InviteId, Code, CreatedAt, UsageCount, Description)
VALUES (NEWID(), 'twitter-launch', GETUTCDATE(), 0, 'Twitter launch campaign');

-- Create generic beta invite
INSERT INTO Invites (InviteId, Code, CreatedAt, UsageCount, Description)
VALUES (NEWID(), 'beta', GETUTCDATE(), 0, 'Generic beta access invite');
```

### 9.2 Monitoring Invite Usage

**Query invite statistics:**

```sql
-- List all invites with usage stats
SELECT
    Code,
    UsageCount,
    Description,
    CreatedAt,
    (SELECT COUNT(*) FROM Users WHERE InviteId = i.InviteId) AS UserCount
FROM Invites i
ORDER BY UsageCount DESC;

-- Find users who signed up with specific invite
SELECT
    u.Name,
    u.Email,
    u.CreatedAt AS SignupDate,
    i.Code AS InviteCode
FROM Users u
INNER JOIN Invites i ON u.InviteId = i.InviteId
WHERE i.Code = 'early-access-nov-2024'
ORDER BY u.CreatedAt DESC;
```

### 9.3 Deactivating Invites

**Option 1: Delete invite (only if no users):**
```sql
DELETE FROM Invites WHERE Code = 'old-invite' AND UsageCount = 0;
```

**Option 2: Rename invite to mark inactive (preserves history):**
```sql
UPDATE Invites
SET Code = 'DISABLED-old-invite',
    Description = 'DISABLED: ' + ISNULL(Description, '')
WHERE Code = 'old-invite';
```

---

## 10. Out of Scope

The following are explicitly **not** part of Spec-120:

- ❌ Admin API endpoints for invite creation/management
- ❌ Admin UI for invite management
- ❌ Invite expiration dates
- ❌ Invite usage limits (single-use or N-use limits)
- ❌ Invite analytics dashboard
- ❌ Automated invite generation
- ❌ Email invite sending
- ❌ Extension invite input UI (covered in Spec-121)

---

## 11. Future Enhancements (Post-MVP)

**Potential improvements after MVP:**

- Admin API endpoints for CRUD operations on invites
- Admin dashboard page showing invite statistics and user signups
- Invite expiration dates (ValidUntil column)
- Invite usage limits (MaxUses column, single-use invites)
- Invite categories/tags for analytics
- Automated invite generation for campaigns
- Email invitation system with unique codes per recipient

---

## 12. Related Documentation

- [BRD-001: MVP Pipedrive WhatsApp](../BRDs/BRD-001-MVP-Pipedrive-WhatsApp.md) - Section 6.4
- [Plan-001: MVP Feature Breakdown](../Plans/Plan-001-MVP-Feature-Breakdown.md) - Feature 20
- [Spec-119: Website Pipedrive Authentication](Spec-119-Website-Pipedrive-Auth.md) - Website OAuth foundation
- [Spec-121: Extension Beta Access](Spec-121-Extension-Beta-Access.md) - Extension error states
- [Spec-105a: Backend OAuth Service](Spec-105a-Backend-OAuth-Service.md) - OAuth architecture
- [Website Architecture](../Architecture/Website-Architecture.md) - Website technical architecture

---

**Status:** Draft - Ready for implementation
**Owner:** Backend + Website teams
**Estimated Effort:** 2-3 days
