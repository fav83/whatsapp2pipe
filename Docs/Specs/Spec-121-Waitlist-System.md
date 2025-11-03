# Spec-121: Waitlist System

**Feature:** Feature 21 - Waitlist System for Users Without Beta Access
**Date:** 2025-11-03
**Status:** ✅ Complete (Specification)
**Implementation Status:** ⏳ Not Started
**Dependencies:** Spec-120a (Website Invite System), Spec-120b (Extension Beta Access Control)

---

**Related Docs:**
- [BRD-001-MVP-Pipedrive-WhatsApp.md](../BRDs/BRD-001-MVP-Pipedrive-WhatsApp.md) - Section 6.5 (Waitlist System)
- [Plan-001-MVP-Feature-Breakdown.md](../Plans/Plan-001-MVP-Feature-Breakdown.md) - Feature 21
- [Spec-120a-Website-Invite-System.md](Spec-120a-Website-Invite-System.md) - Invite system foundation
- [Spec-120b-Extension-Beta-Access.md](Spec-120b-Extension-Beta-Access.md) - Extension beta rejection states
- [Spec-119-Website-Pipedrive-Auth.md](Spec-119-Website-Pipedrive-Auth.md) - Website architecture

---

## 1. Overview

Implement a waitlist system that provides a path forward for users who don't have beta access. Users can sign up with their email (and optionally name) to be notified when invites become available. The waitlist has multiple entry points across the website and extension, all leading to a centralized `/waitlist` page.

**Why this matters:** Captures interest from potential users, builds a pipeline for future invite distribution, and prevents dead-ends in the user experience when users are rejected during closed beta.

**Architecture Pattern:** Centralized web form with backend API, simple email deduplication, manual admin workflow via SQL.

---

## 2. Objectives

- Create dedicated `/waitlist` page on website with email + name form
- Add multiple entry points: HomePage link, error page button, extension button
- Implement backend API endpoint for waitlist signups with deduplication
- Store waitlist entries in database with timestamps
- Provide simple admin SQL queries for waitlist management
- Update extension "Beta Access Required" state to link to waitlist
- Client-side email validation for better UX
- Server-side validation for security

---

## 3. Database Schema

### 3.1 New Table: Waitlist

**Purpose:** Store email addresses and optional names of users interested in beta access.

**SQL Schema:**
```sql
CREATE TABLE Waitlist (
    WaitlistId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Email NVARCHAR(255) NOT NULL,
    Name NVARCHAR(255) NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),

    CONSTRAINT UQ_Waitlist_Email UNIQUE (Email)
);

CREATE INDEX IX_Waitlist_CreatedAt ON Waitlist(CreatedAt DESC);
CREATE INDEX IX_Waitlist_UpdatedAt ON Waitlist(UpdatedAt DESC);
```

**C# Entity Model:**
```csharp
namespace WhatsApp2Pipe.Api.Models;

/// <summary>
/// Represents a waitlist entry for beta access.
/// </summary>
public class WaitlistEntry
{
    /// <summary>
    /// Primary key - Auto-generated GUID.
    /// </summary>
    public Guid WaitlistId { get; set; }

    /// <summary>
    /// Email address (required, unique).
    /// </summary>
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// User's name (optional).
    /// </summary>
    public string? Name { get; set; }

    /// <summary>
    /// Timestamp when user first joined waitlist.
    /// </summary>
    public DateTime CreatedAt { get; set; }

    /// <summary>
    /// Timestamp when user last submitted (for duplicate submissions).
    /// </summary>
    public DateTime UpdatedAt { get; set; }
}
```

**Entity Framework Configuration:**
```csharp
modelBuilder.Entity<WaitlistEntry>(entity =>
{
    entity.ToTable("Waitlist");

    entity.HasKey(w => w.WaitlistId);

    // Unique constraint on Email
    entity.HasIndex(w => w.Email)
          .IsUnique()
          .HasDatabaseName("UQ_Waitlist_Email");

    // Indexes for admin queries
    entity.HasIndex(w => w.CreatedAt)
          .HasDatabaseName("IX_Waitlist_CreatedAt");

    entity.HasIndex(w => w.UpdatedAt)
          .HasDatabaseName("IX_Waitlist_UpdatedAt");

    // Required fields
    entity.Property(w => w.Email)
          .IsRequired()
          .HasMaxLength(255);

    entity.Property(w => w.Name)
          .HasMaxLength(255);

    entity.Property(w => w.CreatedAt)
          .IsRequired();

    entity.Property(w => w.UpdatedAt)
          .IsRequired();
});
```

### 3.2 Entity Framework Migration

**Migration Name:** `AddWaitlistTable`

**Commands:**
```bash
cd Backend/WhatsApp2Pipe.Api
dotnet ef migrations add AddWaitlistTable
dotnet ef database update
```

**Migration Operations:**
1. Create `Waitlist` table with all columns
2. Add unique constraint on `Email`
3. Add indexes on `CreatedAt` and `UpdatedAt`

---

## 4. Backend Implementation

### 4.1 New Endpoint: POST /api/waitlist

**Location:** `Backend/WhatsApp2Pipe.Api/Functions/WaitlistFunction.cs`

**Purpose:** Accept waitlist signups from website.

**Request Body:**
```json
{
  "email": "user@example.com",
  "name": "John Doe"  // optional
}
```

**Response (200 OK - Success):**
```json
{
  "success": true,
  "message": "You're on the waitlist! We'll email you when access is available."
}
```
*Note: Same response for both new entries and duplicate submissions (no indication to user).*

**Response (400 Bad Request - Invalid Email):**
```json
{
  "success": false,
  "error": "Invalid email address"
}
```

**Response (400 Bad Request - Missing Email):**
```json
{
  "success": false,
  "error": "Email is required"
}
```

**Implementation:**
```csharp
using System.Net;
using System.Text.Json;
using System.Text.RegularExpressions;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using WhatsApp2Pipe.Api.Data;
using WhatsApp2Pipe.Api.Models;

namespace WhatsApp2Pipe.Api.Functions;

public class WaitlistFunction
{
    private readonly ILogger<WaitlistFunction> logger;
    private readonly Chat2DealDbContext dbContext;

    // Basic email regex pattern
    private static readonly Regex EmailRegex = new(
        @"^[^@\s]+@[^@\s]+\.[^@\s]+$",
        RegexOptions.Compiled | RegexOptions.IgnoreCase);

    public WaitlistFunction(
        ILogger<WaitlistFunction> logger,
        Chat2DealDbContext dbContext)
    {
        this.logger = logger;
        this.dbContext = dbContext;
    }

    [Function("Waitlist")]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "waitlist")]
        HttpRequestData req)
    {
        logger.LogInformation("Waitlist signup request received");

        try
        {
            // Parse request body
            var requestBody = await req.ReadAsStringAsync();
            if (string.IsNullOrWhiteSpace(requestBody))
            {
                return await CreateErrorResponse(req, "Request body is required");
            }

            var signupRequest = JsonSerializer.Deserialize<WaitlistSignupRequest>(
                requestBody,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

            if (signupRequest == null)
            {
                return await CreateErrorResponse(req, "Invalid request format");
            }

            // Validate email
            if (string.IsNullOrWhiteSpace(signupRequest.Email))
            {
                return await CreateErrorResponse(req, "Email is required");
            }

            var email = signupRequest.Email.Trim().ToLowerInvariant();

            if (!EmailRegex.IsMatch(email))
            {
                return await CreateErrorResponse(req, "Invalid email address");
            }

            // Check if email already exists
            var existingEntry = await dbContext.WaitlistEntries
                .FirstOrDefaultAsync(w => w.Email == email);

            if (existingEntry != null)
            {
                // Update existing entry
                logger.LogInformation("Updating existing waitlist entry for {Email}", email);

                existingEntry.UpdatedAt = DateTime.UtcNow;

                // Update name if provided and different
                if (!string.IsNullOrWhiteSpace(signupRequest.Name))
                {
                    existingEntry.Name = signupRequest.Name.Trim();
                }

                await dbContext.SaveChangesAsync();

                logger.LogInformation("Waitlist entry updated for {Email}", email);
            }
            else
            {
                // Create new entry
                logger.LogInformation("Creating new waitlist entry for {Email}", email);

                var newEntry = new WaitlistEntry
                {
                    WaitlistId = Guid.NewGuid(),
                    Email = email,
                    Name = string.IsNullOrWhiteSpace(signupRequest.Name)
                        ? null
                        : signupRequest.Name.Trim(),
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                dbContext.WaitlistEntries.Add(newEntry);
                await dbContext.SaveChangesAsync();

                logger.LogInformation("Waitlist entry created with ID {WaitlistId}", newEntry.WaitlistId);
            }

            // Return success response (same for both new and duplicate)
            return await CreateSuccessResponse(req);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error processing waitlist signup");
            return await CreateErrorResponse(req, "An error occurred. Please try again.");
        }
    }

    private async Task<HttpResponseData> CreateSuccessResponse(HttpRequestData req)
    {
        var response = req.CreateResponse(HttpStatusCode.OK);
        await response.WriteAsJsonAsync(new
        {
            success = true,
            message = "You're on the waitlist! We'll email you when access is available."
        });
        return response;
    }

    private async Task<HttpResponseData> CreateErrorResponse(HttpRequestData req, string error)
    {
        var response = req.CreateResponse(HttpStatusCode.BadRequest);
        await response.WriteAsJsonAsync(new
        {
            success = false,
            error
        });
        return response;
    }
}

/// <summary>
/// Request model for waitlist signup.
/// </summary>
public class WaitlistSignupRequest
{
    public string Email { get; set; } = string.Empty;
    public string? Name { get; set; }
}
```

**CORS Configuration:**

Ensure Azure Functions CORS allows website origin:
```
https://chat2deal.com
https://app.chat2deal.com
http://localhost:5173 (dev only)
```

**Acceptance Criteria:**
- ✅ Endpoint accepts POST requests with JSON body
- ✅ Validates email format server-side
- ✅ Rejects missing or invalid email with 400
- ✅ Creates new waitlist entry with timestamps
- ✅ Updates existing entry's UpdatedAt timestamp on duplicate
- ✅ Optionally updates Name on duplicate if provided
- ✅ Returns same success message for new and duplicate
- ✅ Logs all operations for debugging
- ✅ Handles errors gracefully

---

## 5. Website Frontend Implementation

### 5.1 New Page: WaitlistPage

**File:** `Website/src/pages/WaitlistPage.tsx`

**Features:**
- Clean, centered form layout (similar to HomePage)
- Email input (required) with real-time validation
- Name input (optional)
- Submit button (disabled until email is valid)
- Loading state during submission
- Success state that replaces form
- Error handling with retry

**Implementation:**
```tsx
import { useState, FormEvent } from 'react'
import { Header } from '../components/layout/Header'
import { Footer } from '../components/layout/Footer'
import { Button } from '../components/ui/button'
import { waitlistService } from '../services/waitlistService'

export default function WaitlistPage() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [emailError, setEmailError] = useState<string | null>(null)

  // Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  const validateEmail = (value: string): boolean => {
    if (!value.trim()) {
      setEmailError('Email is required')
      return false
    }
    if (!emailRegex.test(value)) {
      setEmailError('Please enter a valid email address')
      return false
    }
    setEmailError(null)
    return true
  }

  const handleEmailChange = (value: string) => {
    setEmail(value)
    if (value.trim()) {
      validateEmail(value)
    } else {
      setEmailError(null)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    // Validate email before submission
    if (!validateEmail(email)) {
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      await waitlistService.joinWaitlist(email.trim(), name.trim() || undefined)
      setIsSuccess(true)
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('An error occurred. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4">
        <div className="max-w-md w-full py-12">
          {!isSuccess ? (
            <>
              {/* Title */}
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Join the Waitlist
                </h1>
                <p className="text-base text-gray-600">
                  Chat2Deal is currently in closed beta. Sign up to be notified when we have space.
                </p>
              </div>

              {/* Form */}
              <div className="bg-white py-8 px-6 shadow-lg rounded-lg">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Email Field */}
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => handleEmailChange(e.target.value)}
                      onBlur={() => email.trim() && validateEmail(email)}
                      placeholder="your@email.com"
                      required
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        emailError
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                          : 'border-gray-300'
                      }`}
                    />
                    {emailError && (
                      <p className="mt-2 text-sm text-red-600">{emailError}</p>
                    )}
                  </div>

                  {/* Name Field */}
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Name (optional)
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      maxLength={255}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-3">
                      <p className="text-sm text-red-800">{error}</p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={!email.trim() || !!emailError || isSubmitting}
                    className="w-full"
                  >
                    {isSubmitting ? 'Joining...' : 'Join Waitlist'}
                  </Button>
                </form>
              </div>
            </>
          ) : (
            /* Success State */
            <div className="bg-white py-12 px-6 shadow-lg rounded-lg text-center">
              {/* Success Icon */}
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>

              {/* Success Message */}
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                You're on the waitlist!
              </h2>
              <p className="text-base text-gray-600">
                We'll email you when access is available.
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
```

**Acceptance Criteria:**
- ✅ Form displays with email (required) and name (optional) fields
- ✅ Email validation runs on blur and during typing
- ✅ Submit button disabled when email invalid or empty
- ✅ Loading state shown during submission
- ✅ Success message replaces form on successful submission
- ✅ Error message displayed on failure
- ✅ Form can be resubmitted after error
- ✅ Consistent styling with rest of website

---

### 5.2 New Service: waitlistService

**File:** `Website/src/services/waitlistService.ts`

**Purpose:** Handle API communication for waitlist signups.

**Implementation:**
```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:7071'

interface WaitlistResponse {
  success: boolean
  message?: string
  error?: string
}

class WaitlistService {
  /**
   * Join the waitlist
   */
  async joinWaitlist(email: string, name?: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/waitlist`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, name }),
    })

    const data: WaitlistResponse = await response.json()

    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Failed to join waitlist')
    }
  }
}

export const waitlistService = new WaitlistService()
```

**Acceptance Criteria:**
- ✅ Sends POST request to /api/waitlist
- ✅ Includes email and optional name in request body
- ✅ Throws error on failure with error message
- ✅ Returns successfully on 200 response

---

### 5.3 Updated Page: HomePage

**File:** `Website/src/pages/HomePage.tsx`

**Changes:** Add waitlist link below sign-in form.

**Implementation:**
```tsx
// After the sign-in card...

<p className="text-center text-sm text-gray-500 mt-6">
  Don't have an invite?{' '}
  <Link
    to="/waitlist"
    className="text-blue-600 hover:text-blue-700 font-medium underline"
  >
    Join the waitlist
  </Link>
  {' '}to get notified when we have space.
</p>
```

**Acceptance Criteria:**
- ✅ Link appears below sign-in form
- ✅ Link navigates to /waitlist page
- ✅ Link styling consistent with design system

---

### 5.4 Updated Page: AuthCallbackPage

**File:** `Website/src/pages/AuthCallbackPage.tsx`

**Changes:** Add "Join Waitlist" button for closed_beta and invalid_invite errors.

**Implementation:**
```tsx
import { Link } from 'react-router-dom'

// In the error display section...

if (error) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h2 className="text-2xl font-semibold text-red-600 mb-2">
          Authentication Failed
        </h2>
        <p className="text-gray-600 mb-6">{errorMessage}</p>

        {/* Show Join Waitlist button for beta access errors */}
        {(error === 'closed_beta' || error === 'invalid_invite') && (
          <Link
            to="/waitlist"
            className="inline-block mb-4 px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
          >
            Join Waitlist
          </Link>
        )}

        <p className="text-sm text-gray-500">
          Redirecting to home page...
        </p>
      </div>
    </div>
  )
}
```

**Acceptance Criteria:**
- ✅ "Join Waitlist" button appears for closed_beta error
- ✅ "Join Waitlist" button appears for invalid_invite error
- ✅ Button does NOT appear for other error types
- ✅ Button navigates to /waitlist page
- ✅ Button styled consistently with design system

---

### 5.5 Updated Router: App.tsx

**File:** `Website/src/App.tsx`

**Changes:** Add /waitlist route.

**Implementation:**
```tsx
import WaitlistPage from './pages/WaitlistPage'

// In Routes...
<Routes>
  <Route path="/" element={<HomePage />} />
  <Route path="/auth/callback" element={<AuthCallbackPage />} />
  <Route path="/dashboard" element={<DashboardPage />} />
  <Route path="/waitlist" element={<WaitlistPage />} />
</Routes>
```

**Acceptance Criteria:**
- ✅ /waitlist route added to router
- ✅ Route accessible via direct URL navigation
- ✅ Route accessible via Link navigation

---

## 6. Extension Changes

### 6.1 Modified Component: BetaAccessRequiredState

**File:** `Extension/src/components/states/BetaAccessRequiredState.tsx`

**Changes:** Replace "Request Beta Access" button with "Join Waitlist" button that opens website /waitlist page.

**Implementation:**
```tsx
export function BetaAccessRequiredState() {
  const WEBSITE_URL = import.meta.env.VITE_WEBSITE_URL || 'https://chat2deal.com'

  const handleJoinWaitlist = () => {
    window.open(`${WEBSITE_URL}/waitlist`, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="flex flex-col items-center justify-center h-full px-6 py-8 text-center">
      {/* Icon - Lock icon */}
      <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
        <svg
          className="w-8 h-8 text-amber-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
      </div>

      {/* Title */}
      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        Beta Access Required
      </h2>

      {/* Explanation */}
      <p className="text-sm text-gray-600 mb-6">
        Chat2Deal is currently in closed beta. Access is limited to invited users only.
      </p>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6 text-left">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">
          How to get access:
        </h3>
        <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
          <li>Join our waitlist to request beta access</li>
          <li>We'll email you with an invite code</li>
          <li>Sign up on our website with your invite</li>
          <li>Return here and sign in</li>
        </ol>
      </div>

      {/* CTA Button - UPDATED */}
      <button
        onClick={handleJoinWaitlist}
        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
      >
        Join Waitlist
        <svg
          className="ml-2 w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
          />
        </svg>
      </button>

      {/* Additional help */}
      <p className="text-xs text-gray-500 mt-6">
        Already have an account?{' '}
        <button
          onClick={() => window.location.reload()}
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          Try signing in again
        </button>
      </p>
    </div>
  )
}
```

**Key Changes:**
- Button text: "Request Beta Access" → "Join Waitlist"
- onClick: Opens `${WEBSITE_URL}/waitlist` in new tab with noopener/noreferrer
- Instructions updated: Step 1 mentions "Join our waitlist"

**Acceptance Criteria:**
- ✅ Button displays "Join Waitlist"
- ✅ Button opens website /waitlist page in new tab
- ✅ New tab has noopener and noreferrer attributes
- ✅ Website URL configurable via environment variable
- ✅ Instructions text updated to mention waitlist

---

## 7. Admin Operations

### 7.1 Viewing Waitlist Entries

**View all entries (most recent first):**
```sql
SELECT
    WaitlistId,
    Email,
    Name,
    CreatedAt,
    UpdatedAt,
    DATEDIFF(DAY, CreatedAt, GETUTCDATE()) AS DaysOnWaitlist,
    DATEDIFF(DAY, UpdatedAt, GETUTCDATE()) AS DaysSinceLastUpdate
FROM Waitlist
ORDER BY UpdatedAt DESC;
```

**Count total entries:**
```sql
SELECT COUNT(*) AS TotalWaitlistEntries FROM Waitlist;
```

**View recent signups (last 7 days):**
```sql
SELECT
    Email,
    Name,
    CreatedAt
FROM Waitlist
WHERE CreatedAt >= DATEADD(DAY, -7, GETUTCDATE())
ORDER BY CreatedAt DESC;
```

**Find users who resubmitted:**
```sql
SELECT
    Email,
    Name,
    CreatedAt AS FirstSignup,
    UpdatedAt AS LastSignup,
    DATEDIFF(DAY, CreatedAt, UpdatedAt) AS DaysBetweenSubmissions
FROM Waitlist
WHERE DATEDIFF(SECOND, CreatedAt, UpdatedAt) > 60  -- More than 1 minute difference
ORDER BY UpdatedAt DESC;
```

### 7.2 Converting Waitlist Users to Beta Users

**Manual workflow:**

**Step 1: Select users to invite**
```sql
-- Oldest waitlist entries first (FIFO)
SELECT TOP 10
    Email,
    Name,
    CreatedAt,
    DATEDIFF(DAY, CreatedAt, GETUTCDATE()) AS DaysWaiting
FROM Waitlist
ORDER BY CreatedAt ASC;
```

**Step 2: Create invite code**
```sql
INSERT INTO Invites (InviteId, Code, CreatedAt, UsageCount, Description)
VALUES (
    NEWID(),
    'waitlist-batch-nov-2024',
    GETUTCDATE(),
    0,
    'Waitlist batch invitation - November 2024'
);
```

**Step 3: Email users manually**
- Use email client or service to send invite codes
- Include link: `https://chat2deal.com/?i=waitlist-batch-nov-2024`

**Step 4: Remove from waitlist (optional)**
```sql
-- Delete specific users after emailing
DELETE FROM Waitlist
WHERE Email IN ('user1@example.com', 'user2@example.com');

-- OR mark as invited by updating name
UPDATE Waitlist
SET Name = '[INVITED] ' + ISNULL(Name, '')
WHERE Email IN ('user1@example.com', 'user2@example.com');
```

### 7.3 Waitlist Analytics

**Waitlist growth over time:**
```sql
SELECT
    CONVERT(DATE, CreatedAt) AS SignupDate,
    COUNT(*) AS NewSignups
FROM Waitlist
GROUP BY CONVERT(DATE, CreatedAt)
ORDER BY SignupDate DESC;
```

**Users with/without names:**
```sql
SELECT
    CASE WHEN Name IS NULL THEN 'No Name' ELSE 'Has Name' END AS NameStatus,
    COUNT(*) AS Count
FROM Waitlist
GROUP BY CASE WHEN Name IS NULL THEN 'No Name' ELSE 'Has Name' END;
```

---

## 8. Testing Strategy

### 8.1 Backend Testing

**Test Cases:**

1. **Valid new signup:**
   - POST /api/waitlist with `{ "email": "test@example.com", "name": "Test User" }`
   - Verify 200 response with success message
   - Verify database record created with both timestamps

2. **Valid new signup (email only):**
   - POST /api/waitlist with `{ "email": "test2@example.com" }`
   - Verify 200 response
   - Verify Name is null in database

3. **Duplicate signup:**
   - Create existing entry with email "duplicate@example.com"
   - POST /api/waitlist with same email
   - Verify 200 response (same success message)
   - Verify UpdatedAt timestamp changed
   - Verify CreatedAt unchanged

4. **Invalid email format:**
   - POST with `{ "email": "notanemail" }`
   - Verify 400 response with "Invalid email address" error

5. **Missing email:**
   - POST with `{ "name": "Test" }` (no email)
   - Verify 400 response with "Email is required" error

6. **Empty email:**
   - POST with `{ "email": "" }`
   - Verify 400 response

7. **Email normalization:**
   - POST with `{ "email": " TEST@EXAMPLE.COM " }`
   - Verify stored as "test@example.com" (trimmed, lowercase)

### 8.2 Frontend Testing

**Test Cases:**

1. **Email validation - empty:**
   - Leave email field empty
   - Verify submit button disabled
   - Verify no error message shown

2. **Email validation - invalid:**
   - Enter "notanemail"
   - Blur field
   - Verify error message "Please enter a valid email address"
   - Verify submit button disabled

3. **Email validation - valid:**
   - Enter "test@example.com"
   - Verify no error message
   - Verify submit button enabled

4. **Form submission - success:**
   - Enter valid email
   - Click submit
   - Verify loading state (button shows "Joining...")
   - Verify success message replaces form

5. **Form submission - error:**
   - Mock API failure
   - Submit form
   - Verify error message displayed
   - Verify form still visible (not replaced)
   - Verify can retry

6. **Navigation - HomePage link:**
   - Click "Join the waitlist" link on HomePage
   - Verify navigated to /waitlist page

7. **Navigation - Error page button:**
   - Trigger closed_beta error
   - Click "Join Waitlist" button
   - Verify navigated to /waitlist page

8. **Extension - Join Waitlist button:**
   - Trigger beta access rejection
   - Click "Join Waitlist" button
   - Verify new tab opens to /waitlist page

### 8.3 Manual Testing Checklist

**Happy Path:**
- [ ] Visit website / → Click "Join the waitlist" link → Navigate to /waitlist
- [ ] Enter valid email → Submit → See success message
- [ ] Close tab, reopen /waitlist → Submit same email → See success message (no error)
- [ ] Trigger auth error (closed_beta) → Click "Join Waitlist" → Navigate to /waitlist
- [ ] Install extension → Trigger beta rejection → Click "Join Waitlist" → New tab opens to /waitlist

**Error Paths:**
- [ ] Submit empty email → Button disabled
- [ ] Submit invalid email → See validation error
- [ ] Simulate network error → See error message, can retry
- [ ] Submit form twice rapidly → No duplicate entries created

**Admin Workflow:**
- [ ] Run SQL queries to view waitlist entries
- [ ] Verify entries sorted by UpdatedAt (most recent first)
- [ ] Simulate invite workflow: Query → Create invite → Email users → Remove from waitlist

---

## 9. Acceptance Criteria

### 9.1 Database

- ✅ Waitlist table created with correct schema
- ✅ Unique constraint on Email enforced
- ✅ Indexes on CreatedAt and UpdatedAt created
- ✅ Migration applied successfully

### 9.2 Backend

- ✅ POST /api/waitlist endpoint created
- ✅ Accepts email (required) and name (optional)
- ✅ Validates email format server-side
- ✅ Creates new entry with both timestamps
- ✅ Updates UpdatedAt on duplicate submission
- ✅ Returns 200 success for both new and duplicate
- ✅ Returns 400 for invalid/missing email
- ✅ Logs all operations
- ✅ CORS configured for website origin

### 9.3 Website

- ✅ /waitlist page created with form
- ✅ Email field (required) with validation
- ✅ Name field (optional)
- ✅ Client-side email validation with error messages
- ✅ Submit button disabled when email invalid
- ✅ Loading state during submission
- ✅ Success message replaces form
- ✅ Error handling with retry capability
- ✅ HomePage shows waitlist link
- ✅ AuthCallbackPage shows "Join Waitlist" button for errors
- ✅ /waitlist route added to router

### 9.4 Extension

- ✅ BetaAccessRequiredState updated
- ✅ "Join Waitlist" button replaces "Request Beta Access"
- ✅ Button opens website /waitlist in new tab
- ✅ Instructions updated to mention waitlist

### 9.5 Admin

- ✅ SQL queries documented for viewing waitlist
- ✅ Manual invite workflow documented
- ✅ Analytics queries provided

---

## 10. Security Considerations

### 10.1 Input Validation

**Client-Side:**
- Basic HTML5 email validation (`type="email"`)
- JavaScript regex validation for better UX
- Not relied upon for security (can be bypassed)

**Server-Side:**
- Required email validation (cannot be bypassed)
- Email format validation with regex
- Email normalization (trim, lowercase)
- Protection against SQL injection (EF Core parameterized queries)

### 10.2 Spam Prevention

**MVP Approach:**
- Deduplication by email (prevents multiple entries per email)
- Rate limiting via Azure Functions (default throttling)

**Future Enhancements:**
- CAPTCHA (reCAPTCHA, hCaptcha)
- IP-based rate limiting
- Email verification (double opt-in)
- Honeypot fields

### 10.3 Data Protection

**Storage:**
- Waitlist data stored in encrypted Azure SQL Database
- Email and name considered non-sensitive (no passwords, no PII beyond contact info)
- HTTPS enforced on all endpoints

**Privacy:**
- No automated email sending (manual admin process)
- Users provide implicit consent by submitting form
- No tracking cookies or analytics (beyond basic Azure logs)

---

## 11. Out of Scope (Future Enhancements)

The following are explicitly **not** part of this specification:

- ❌ Automated email notifications when users join waitlist
- ❌ Automated invite generation/distribution
- ❌ Admin API endpoints for waitlist management
- ❌ Admin dashboard UI for viewing waitlist
- ❌ Email verification (double opt-in)
- ❌ Unsubscribe/remove from waitlist feature
- ❌ CAPTCHA or spam prevention
- ❌ Priority queue system (all users FIFO via CreatedAt)
- ❌ Referral tracking (who referred whom)
- ❌ Source tracking (website vs extension)
- ❌ Analytics integration (Google Analytics, Mixpanel)
- ❌ Export to CSV
- ❌ Bulk email sending to waitlist
- ❌ Waitlist position display ("You're #452 on the list")
- ❌ Estimated wait time display

---

## 12. Implementation Checklist

### Phase 1: Database & Backend (1 day)
- [ ] Create WaitlistEntry entity model
- [ ] Configure entity in DbContext
- [ ] Create EF Core migration (AddWaitlistTable)
- [ ] Run migration on development database
- [ ] Create WaitlistFunction.cs
- [ ] Implement POST /api/waitlist endpoint
- [ ] Add email validation logic
- [ ] Implement upsert logic (insert or update)
- [ ] Add logging
- [ ] Configure CORS
- [ ] Test with Postman/curl

### Phase 2: Website Frontend (1-1.5 days)
- [ ] Create WaitlistPage.tsx component
- [ ] Implement form with email/name fields
- [ ] Add client-side email validation
- [ ] Implement loading/success/error states
- [ ] Create waitlistService.ts
- [ ] Update HomePage with waitlist link
- [ ] Update AuthCallbackPage with "Join Waitlist" button
- [ ] Add /waitlist route to App.tsx
- [ ] Test form submission
- [ ] Test navigation from all entry points

### Phase 3: Extension Updates (0.5 day)
- [ ] Update BetaAccessRequiredState.tsx
- [ ] Change button to "Join Waitlist"
- [ ] Update onClick handler to open website
- [ ] Update instructions text
- [ ] Configure VITE_WEBSITE_URL env variable
- [ ] Test button opens correct URL

### Phase 4: Testing & Documentation (0.5 day)
- [ ] Manual testing of all user flows
- [ ] Test duplicate email handling
- [ ] Test error scenarios
- [ ] Verify admin SQL queries work
- [ ] Document admin workflow
- [ ] Deploy backend to Azure
- [ ] Run database migration on production
- [ ] Deploy website
- [ ] Deploy extension update
- [ ] End-to-end testing in production

**Total Estimated Effort:** 3-4 days

---

## 13. Timeline Estimate

- **Database + Backend:** 1 day
- **Website Frontend:** 1-1.5 days
- **Extension Updates:** 0.5 day
- **Testing & Deployment:** 0.5 day

**Total:** 3-4 days (about 1 week)

---

## 14. Success Metrics (Post-Launch)

**Waitlist Growth:**
- Number of signups per day/week
- Conversion rate from rejection to waitlist signup
- Time from rejection to signup

**User Behavior:**
- % of rejected users who join waitlist
- % of waitlist users who resubmit (shows sustained interest)
- Entry point distribution (HomePage vs Error page vs Extension)

**Invite Conversion:**
- % of invited waitlist users who sign up
- Time from invite to signup
- Retention of waitlist-converted users vs. direct invites

---

## 15. Related Documentation

- [BRD-001: MVP Pipedrive WhatsApp](../BRDs/BRD-001-MVP-Pipedrive-WhatsApp.md) - Section 6.5
- [Plan-001: MVP Feature Breakdown](../Plans/Plan-001-MVP-Feature-Breakdown.md) - Feature 21
- [Spec-120a: Website Invite System](Spec-120a-Website-Invite-System.md) - Invite system foundation
- [Spec-120b: Extension Beta Access](Spec-120b-Extension-Beta-Access.md) - Extension beta rejection
- [Spec-119: Website Pipedrive Authentication](Spec-119-Website-Pipedrive-Auth.md) - Website architecture
- [Website Architecture](../Architecture/Website-Architecture.md) - Technical architecture

---

**Status:** Draft - Ready for implementation
**Owner:** Backend + Website + Extension teams
**Estimated Effort:** 3-4 days
