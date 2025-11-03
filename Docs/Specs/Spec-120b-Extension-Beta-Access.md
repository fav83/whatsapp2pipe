# Spec-120b: Extension Beta Access Control (Closed Beta)

**Feature:** Feature 20 - Closed Beta Invite System (Extension)
**Date:** 2025-11-03
**Status:** ✅ Complete (Specification)
**Implementation Status:** ✅ Complete (Backend + Extension UI)
**Dependencies:** Spec-120a (Website Invite System), Spec-105b (Extension OAuth Integration)

---

## Implementation Split

Feature 20 (Closed Beta Invite System) is split into two independent specifications:

- **Spec-120a:** Website Invite System - React UI + Backend OAuth Integration
- **Spec-120b (This Document):** Extension Beta Access Control - Extension error states for rejected users

**Implementation Order:**
1. Spec-120a (Website + Backend) - Database migration, backend validation, website UI
2. Spec-120b (Extension) - Extension UI changes for rejected user state

---

**Related Docs:**
- [BRD-001-MVP-Pipedrive-WhatsApp.md](../BRDs/BRD-001-MVP-Pipedrive-WhatsApp.md) - Section 6.4 (Closed Beta Invite System)
- [Plan-001-MVP-Feature-Breakdown.md](../Plans/Plan-001-MVP-Feature-Breakdown.md) - Feature 20
- [Spec-120a-Website-Invite-System.md](Spec-120a-Website-Invite-System.md) - Website invite system foundation
- [Spec-105b-Extension-OAuth-Integration.md](Spec-105b-Extension-OAuth-Integration.md) - Extension OAuth architecture
- [Spec-112-UI-States-Error-Handling.md](Spec-112-UI-States-Error-Handling.md) - Extension UI states and error patterns

---

## 1. Overview

Implement beta access control for the Chrome extension. New users (not in database) attempting to sign in via the extension are rejected by the backend during OAuth callback. The extension displays a dedicated "Beta Access Required" error state explaining that access is limited to invited users only.

**Why this matters:** Prevents unauthorized extension signups during closed beta. Users must sign up via the website with an invite code before they can use the extension.

**User Flow:** New user installs extension → Clicks "Sign in with Pipedrive" → Completes OAuth → Backend rejects (user not in database) → Extension shows "Beta Access Required" state.

**Architecture Pattern:** Backend rejects new users, extension handles error gracefully with dedicated UI state.

---

## 2. Objectives

- Reject new extension users (not in database) during OAuth callback
- Return `error=beta_access_required` to extension
- Display dedicated "Beta Access Required" UI state in sidebar
- Provide clear explanation and guidance for rejected users
- Allow existing users to sign in normally
- No invite input field in extension (must sign up via website)

---

## 3. Backend Changes

### 3.1 Modified Function: AuthCallbackFunction

**Location:** `Backend/WhatsApp2Pipe.Api/Functions/AuthCallbackFunction.cs`

**Changes:** Add extension-specific new user rejection logic.

**Implementation:**

The backend already has the core logic from Spec-120a. For extension clients, we need to ensure new users are rejected when no invite code is provided (which is always the case for extensions since they don't have invite input).

**Extension OAuth callback logic:**

```csharp
// After fetching user profile from Pipedrive /users/me...

// Detect client type from state
var isExtensionClient = stateData.Type == "extension";
var inviteCode = stateData.InviteCode;

logger.LogInformation("Processing OAuth callback for client type: {Type}", stateData.Type);

// Try to find existing user
var existingUser = await userService.GetUserByPipedriveIdAsync(
    userResponse.Data.Id,
    userResponse.Data.CompanyId);

if (existingUser != null)
{
    // EXISTING USER: Proceed normally
    logger.LogInformation("Existing user {UserId} found", existingUser.UserId);

    // Update LastLoginAt
    existingUser.LastLoginAt = DateTime.UtcNow;
    await userService.UpdateUserAsync(existingUser);

    // Create session
    var clientIdentifier = !string.IsNullOrEmpty(stateData.ExtensionId)
        ? stateData.ExtensionId
        : "web";

    var session = await sessionService.CreateSessionAsync(
        existingUser.UserId,
        existingUser.CompanyId,
        tokenResponse.AccessToken,
        tokenResponse.RefreshToken,
        tokenResponse.ApiDomain,
        tokenResponse.ExpiresIn,
        clientIdentifier);

    // Redirect based on client type
    if (isExtensionClient)
    {
        // Extension success redirect
        var redirectUrl = $"https://{stateData.ExtensionId}.chromiumapp.org/" +
                        $"?verification_code={Uri.EscapeDataString(session.VerificationCode)}" +
                        $"&userName={Uri.EscapeDataString(existingUser.Name)}" +
                        $"&success=true";

        var response = req.CreateResponse(HttpStatusCode.Redirect);
        response.Headers.Add("Location", redirectUrl);
        return response;
    }
    else
    {
        // Website success redirect
        var websiteCallbackUrl = configuration["WEBSITE_CALLBACK_URL"];
        var redirectUrl = $"{websiteCallbackUrl}?verification_code={Uri.EscapeDataString(session.VerificationCode)}";

        var response = req.CreateResponse(HttpStatusCode.Redirect);
        response.Headers.Add("Location", redirectUrl);
        return response;
    }
}
else
{
    // NEW USER
    logger.LogInformation("New user detected for client type: {Type}", stateData.Type);

    if (isExtensionClient)
    {
        // EXTENSION: Reject new users (no invite mechanism in extension)
        logger.LogWarning("New user attempted signup via extension - rejected (beta access required)");

        // Redirect to extension with error
        var redirectUrl = $"https://{stateData.ExtensionId}.chromiumapp.org/" +
                        $"?error=beta_access_required";

        var response = req.CreateResponse(HttpStatusCode.Redirect);
        response.Headers.Add("Location", redirectUrl);
        return response;
    }
    else
    {
        // WEBSITE: Validate invite code (existing logic from Spec-120a)
        if (string.IsNullOrWhiteSpace(inviteCode))
        {
            logger.LogWarning("New user attempted website signup without invite code");
            return CreateHtmlErrorResponse(req, HttpStatusCode.Forbidden, "closed_beta");
        }

        var invite = await dbContext.Invites.FirstOrDefaultAsync(i => i.Code == inviteCode);

        if (invite == null)
        {
            logger.LogWarning("New user provided invalid invite code: {InviteCode}", inviteCode);
            return CreateHtmlErrorResponse(req, HttpStatusCode.Forbidden, "invalid_invite");
        }

        // Create user and link to invite
        var newUser = await userService.CreateOrUpdateUserAsync(userResponse.Data, invite.InviteId);

        // Increment invite usage count
        invite.UsageCount++;
        await dbContext.SaveChangesAsync();

        logger.LogInformation("New user {UserId} created via website with invite {InviteId}", newUser.UserId, invite.InviteId);

        // Create session and redirect to website (existing logic)
        // ...
    }
}
```

**Key Points:**
- Extension new users are always rejected (no invite mechanism)
- Error code: `beta_access_required`
- Redirect to `chromiumapp.org` with error parameter
- Website flow unchanged (validates invite as per Spec-120a)

---

## 4. Extension Frontend Changes

### 4.1 New Component: BetaAccessRequiredState

**Location:** `Extension/src/components/states/BetaAccessRequiredState.tsx`

**Purpose:** Display dedicated error state when new user is rejected during closed beta.

**Implementation:**

```tsx
import React from 'react'

export function BetaAccessRequiredState() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 py-8 text-center">
      {/* Icon */}
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
          <li>Visit our website to request a beta invite</li>
          <li>Sign up with your invite code</li>
          <li>Return here and sign in</li>
        </ol>
      </div>

      {/* CTA Button */}
      <a
        href="https://chat2deal.com" // TODO: Update with actual website URL
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
      >
        Request Beta Access
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
      </a>

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

**Design Notes:**
- Lock icon with amber color scheme (warning, not error)
- Clear title and explanation
- Numbered instructions for obtaining access
- CTA button to website for requesting beta access
- "Try signing in again" link for users who already signed up via website

### 4.2 Modified Component: AuthManager

**Location:** `Extension/src/components/AuthManager.tsx` (or similar auth orchestration component)

**Changes:** Handle `beta_access_required` error from OAuth callback.

**Implementation:**

```tsx
import { useState, useEffect } from 'react'
import { WelcomeState } from './states/WelcomeState'
import { AuthenticatingState } from './states/AuthenticatingState'
import { BetaAccessRequiredState } from './states/BetaAccessRequiredState'
// ... other imports

export function AuthManager() {
  const [authStatus, setAuthStatus] = useState<'checking' | 'authenticated' | 'unauthenticated' | 'authenticating' | 'beta_required'>('checking')
  // ... other state

  useEffect(() => {
    // Check for OAuth callback errors
    const urlParams = new URLSearchParams(window.location.search)
    const error = urlParams.get('error')

    if (error === 'beta_access_required') {
      console.log('New user rejected - beta access required')
      setAuthStatus('beta_required')
      return
    }

    // ... existing auth check logic
  }, [])

  const handleSignIn = async () => {
    setAuthStatus('authenticating')

    try {
      await authService.signIn()
      // ... handle success
    } catch (error) {
      console.error('Sign-in failed:', error)
      // Check if error is beta access rejection
      if (error.message?.includes('beta_access_required')) {
        setAuthStatus('beta_required')
      } else {
        setAuthStatus('unauthenticated')
      }
    }
  }

  // Render states
  if (authStatus === 'beta_required') {
    return <BetaAccessRequiredState />
  }

  if (authStatus === 'authenticating') {
    return <AuthenticatingState />
  }

  if (authStatus === 'unauthenticated') {
    return <WelcomeState onSignIn={handleSignIn} />
  }

  // ... other states
}
```

### 4.3 Modified Service: authService

**Location:** `Extension/src/services/authService.ts`

**Changes:** Detect `beta_access_required` error in OAuth callback URL.

**Implementation:**

```typescript
class AuthService {
  // ... existing methods ...

  /**
   * Handle OAuth callback
   */
  async handleOAuthCallback(callbackUrl: string): Promise<{ success: boolean; error?: string }> {
    const url = new URL(callbackUrl)
    const params = url.searchParams

    // Check for errors
    const error = params.get('error')
    if (error) {
      console.error('OAuth callback error:', error)

      if (error === 'beta_access_required') {
        // New user rejected - beta access required
        return { success: false, error: 'beta_access_required' }
      }

      return { success: false, error }
    }

    // Extract verification code
    const verificationCode = params.get('verification_code')
    const userName = params.get('userName')

    if (!verificationCode) {
      console.error('No verification code in callback')
      return { success: false, error: 'no_verification_code' }
    }

    // Store credentials
    await chrome.storage.local.set({
      verificationCode,
      userName: userName || null
    })

    return { success: true }
  }

  // ... existing methods ...
}

export const authService = new AuthService()
```

---

## 5. User Experience Flow

### 5.1 Happy Path (Existing User)

1. User installs Chat2Deal extension
2. User clicks "Sign in with Pipedrive" in sidebar
3. OAuth popup opens
4. User authorizes on Pipedrive
5. Backend finds existing user record
6. Backend creates session and redirects with `verification_code`
7. Extension stores `verification_code`
8. Extension shows authenticated sidebar with chat monitoring

### 5.2 Rejection Path (New User)

1. User installs Chat2Deal extension
2. User clicks "Sign in with Pipedrive" in sidebar
3. OAuth popup opens
4. User authorizes on Pipedrive
5. Backend does NOT find user record (new user)
6. Backend detects extension client (no invite code provided)
7. Backend redirects to `chromiumapp.org/?error=beta_access_required`
8. Extension detects error parameter
9. Extension displays **BetaAccessRequiredState** component
10. User sees explanation and "Request Beta Access" button
11. User clicks button → Opens website in new tab
12. User requests invite via website, receives invite code
13. User signs up on website with invite code
14. User returns to extension and clicks "Try signing in again"
15. Extension retries OAuth flow
16. Backend finds user record (created via website)
17. Sign-in succeeds

---

## 6. Testing Strategy

### 6.1 Manual Testing

**Test Case 1: Existing User Sign-In**
1. User record exists in database
2. Install extension
3. Click "Sign in with Pipedrive"
4. Complete OAuth
5. ✅ Verify: Sign-in succeeds, sidebar shows authenticated state

**Test Case 2: New User Rejection**
1. User record does NOT exist in database
2. Install extension
3. Click "Sign in with Pipedrive"
4. Complete OAuth
5. ✅ Verify: Extension shows "Beta Access Required" state
6. ✅ Verify: Error message explains closed beta
7. ✅ Verify: "Request Beta Access" button opens website

**Test Case 3: New User After Website Signup**
1. User signs up via website with invite code
2. User record created in database
3. Install extension (or reload if already installed)
4. Click "Sign in with Pipedrive" (or "Try signing in again")
5. Complete OAuth
6. ✅ Verify: Sign-in succeeds, sidebar shows authenticated state

**Test Case 4: Error Persistence**
1. Trigger `beta_access_required` error
2. Close and reopen extension
3. ✅ Verify: Error state persists until user takes action

**Test Case 5: Recovery Flow**
1. User sees "Beta Access Required" state
2. User clicks "Try signing in again"
3. ✅ Verify: OAuth flow restarts
4. ✅ Verify: If still not signed up, error reappears
5. ✅ Verify: If signed up via website, sign-in succeeds

### 6.2 Backend Testing

**Test OAuth callback with extension client:**

**Existing user:**
```
GET /api/auth/callback?code=xxx&state=<encoded-state>
State: { "Type": "extension", "ExtensionId": "abc123", "InviteCode": null }
Pipedrive /users/me: { "id": 12345, "company_id": 67890, ... }
Database: User exists with PipedriveUserId=12345, CompanyId matches
Expected: Redirect to chromiumapp.org with verification_code
```

**New user:**
```
GET /api/auth/callback?code=xxx&state=<encoded-state>
State: { "Type": "extension", "ExtensionId": "abc123", "InviteCode": null }
Pipedrive /users/me: { "id": 99999, "company_id": 88888, ... }
Database: User NOT found
Expected: Redirect to chromiumapp.org with error=beta_access_required
```

---

## 7. Acceptance Criteria

### 7.1 Backend

- ✅ Extension OAuth callback detects new users (not in database)
- ✅ New extension users rejected with `error=beta_access_required`
- ✅ Redirect to `chromiumapp.org` includes error parameter
- ✅ Existing extension users sign in normally
- ✅ No session created for rejected users
- ✅ Logging captures rejection events

### 7.2 Extension

- ✅ `BetaAccessRequiredState` component created
- ✅ Component displays lock icon, title, explanation
- ✅ Component shows numbered instructions
- ✅ "Request Beta Access" button opens website in new tab
- ✅ "Try signing in again" link restarts OAuth flow
- ✅ `authService.handleOAuthCallback()` detects `beta_access_required` error
- ✅ `AuthManager` renders `BetaAccessRequiredState` on error
- ✅ Error state persists until user takes action

### 7.3 User Experience

- ✅ Rejected users see clear explanation of closed beta
- ✅ Users understand how to get access (website signup)
- ✅ Users can retry sign-in after website signup
- ✅ No confusing error messages or dead ends

---

## 8. Error Handling & Edge Cases

### 8.1 Edge Cases

**Case 1: User signed up via website, extension still shows error**
- Cause: Extension cached error state
- Solution: "Try signing in again" button clears state and retries OAuth

**Case 2: User clicks "Request Beta Access" multiple times**
- Behavior: Opens website in new tab each time
- Acceptable: User can close extra tabs

**Case 3: Website URL not configured**
- Fallback: Button links to placeholder URL or is disabled
- Log warning in console

**Case 4: OAuth popup closed before completion**
- Behavior: Extension remains in unauthenticated state
- User can click "Sign in" again

### 8.2 Error Logging

**Console Logs:**
```typescript
// On beta access rejection
console.log('OAuth callback error: beta_access_required')
console.log('New user attempted sign-in - beta access required')

// On successful sign-in after rejection
console.log('User successfully authenticated after website signup')
```

**Sentry Events (if enabled):**
```typescript
Sentry.captureMessage('New user rejected - beta access required', {
  level: 'info',
  tags: { flow: 'oauth', client: 'extension', reason: 'beta_access_required' }
})
```

---

## 9. UI Design Specifications

### 9.1 BetaAccessRequiredState Layout

**Container:**
- Full sidebar height
- Vertically centered content
- Horizontal padding: 24px
- Vertical padding: 32px

**Icon:**
- Lock icon (SVG)
- Size: 64×64px
- Background: Amber-100 circle (rounded-full)
- Icon color: Amber-600
- Margin bottom: 16px

**Title:**
- Text: "Beta Access Required"
- Font size: 20px (text-xl)
- Font weight: 600 (font-semibold)
- Color: Gray-900
- Margin bottom: 8px

**Explanation:**
- Font size: 14px (text-sm)
- Color: Gray-600
- Margin bottom: 24px

**Instructions Box:**
- Background: Blue-50
- Border: 1px solid Blue-200
- Border radius: 6px
- Padding: 16px
- Margin bottom: 24px

**CTA Button:**
- Background: Blue-600
- Hover: Blue-700
- Text color: White
- Font size: 14px (text-sm)
- Font weight: 500
- Padding: 8px 16px
- Border radius: 6px
- External link icon (16×16px) on the right

**Secondary Action:**
- Font size: 12px (text-xs)
- Color: Gray-500
- Link color: Blue-600
- Margin top: 24px

### 9.2 Responsive Considerations

- Extension sidebar width is fixed (350px)
- Component designed for 350px width
- Content wraps appropriately on narrow viewports
- Button does not overflow

---

## 10. Configuration

### 10.1 Website URL Configuration

**Environment Variable:**
```env
VITE_WEBSITE_URL=https://chat2deal.com
```

**Usage in BetaAccessRequiredState:**
```tsx
const WEBSITE_URL = import.meta.env.VITE_WEBSITE_URL || 'https://chat2deal.com'

<a href={WEBSITE_URL} target="_blank" rel="noopener noreferrer">
  Request Beta Access
</a>
```

---

## 11. Out of Scope

The following are explicitly **not** part of Spec-120b:

- ❌ Invite code input in extension UI
- ❌ Extension-based signup flow
- ❌ Automatic retry mechanism after website signup
- ❌ In-extension messaging to prompt website signup
- ❌ Deep linking from website back to extension
- ❌ Browser notifications for signup completion

---

## 12. Future Enhancements (Post-MVP)

**Potential improvements after MVP:**

- Deep link from website to extension after successful signup
- Browser notification when user completes website signup
- In-extension "Open website to sign up" flow with better UX
- Automatic sign-in retry when extension detects new user record
- Beta waitlist signup directly from extension (POST to backend API)

---

## 13. Related Documentation

- [BRD-001: MVP Pipedrive WhatsApp](../BRDs/BRD-001-MVP-Pipedrive-WhatsApp.md) - Section 6.4
- [Plan-001: MVP Feature Breakdown](../Plans/Plan-001-MVP-Feature-Breakdown.md) - Feature 20
- [Spec-120a: Website Invite System](Spec-120a-Website-Invite-System.md) - Website invite foundation
- [Spec-105b: Extension OAuth Integration](Spec-105b-Extension-OAuth-Integration.md) - Extension OAuth architecture
- [Spec-112: UI States & Error Handling](Spec-112-UI-States-Error-Handling.md) - Extension error patterns
- [Chrome Extension Architecture](../Architecture/Chrome-Extension-Architecture.md) - Extension technical architecture

---

**Status:** Draft - Ready for implementation
**Owner:** Extension team
**Estimated Effort:** 1-2 days
