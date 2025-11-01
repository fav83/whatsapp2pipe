# Spec-117: User Avatar with Profile Dropdown

**Date:** 2025-11-01
**Status:** ✅ Complete
**Dependencies:** Spec-105a (OAuth), Spec-116 (User Entity Tracking)

---

## Overview

Replace the text "Sign out" button in the sidebar header with a circular avatar showing the first letter of the user's name. Clicking the avatar reveals a dropdown menu displaying the full user name and a sign-out action.

## Goals

- Provide visual confirmation of who is signed in
- Create a more professional, polished UI
- Maintain familiar interaction patterns (click to toggle, outside-click to close)
- Use minimal space in the header

## Technical Implementation

### Backend Changes

**File:** `Backend/WhatsApp2Pipe.Api/Functions/AuthCallbackFunction.cs`

Add `userName` parameter to OAuth redirect URL:
```csharp
var redirectUrl = $"https://{extensionId}.chromiumapp.org/" +
                $"?verification_code={Uri.EscapeDataString(session.VerificationCode)}" +
                $"&userName={Uri.EscapeDataString(user.Name)}" +
                $"&success=true";
```

User name is already available from Pipedrive `/users/me` API call during OAuth flow (Feature 16).

### Extension Changes

**Storage Schema:**
```typescript
{
  verification_code: string,
  userName: string  // New field
}
```

**Modified Files:**
- `Extension/src/service-worker/authService.ts` - Extract userName from OAuth callback URL
- `Extension/src/content-script/services/authService.ts` - Clear userName on sign out
- `Extension/src/content-script/hooks/useAuth.ts` - Add userName state and return from hook
- `Extension/src/content-script/App.tsx` - Replace sign out button with UserAvatar component

**New File:**
- `Extension/src/content-script/components/UserAvatar.tsx` - Avatar component with dropdown

### Component Design

**Avatar Circle:**
- 32px × 32px circular button
- Background: #667781 (neutral gray), Hover: #556168
- Text: First character of userName, uppercase, white, semi-bold
- Extracted via: `userName.charAt(0).toUpperCase()`

**Dropdown Menu:**
- 200px width, white background
- Right-aligned below avatar
- User name header (non-clickable, semi-bold, truncate with ellipsis)
- 1px divider
- "Sign out" menu item (clickable, hover background #F0F2F5)

**Interactions:**
- Click avatar → toggle menu
- Click outside or press Escape → close menu
- Click "Sign out" → close menu and sign out
- Uses document event listeners with ref-based outside-click detection

## Additional Changes

- **Branding:** Header label changed from "Pipedrive" to "Chat2Deal"
- **UI Layout:** DEV mode indicator moved from top to bottom of sidebar

## Acceptance Criteria

- [x] Backend returns userName in OAuth callback redirect URL
- [x] Extension stores userName in chrome.storage.local
- [x] Avatar circle displays first letter of userName
- [x] Avatar uses neutral gray background with white text
- [x] Clicking avatar toggles dropdown menu
- [x] Dropdown shows user name as header and "Sign out" item
- [x] Clicking outside or Escape closes menu
- [x] Sign out clears both verification_code and userName from storage
- [x] Works with various name formats (spaces, special characters, long names)

## Notes

- No breaking changes to existing authentication flow
- Graceful degradation: Falls back to 'User' if userName not provided
- All changes are additive, making rollback straightforward
