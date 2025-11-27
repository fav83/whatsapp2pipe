# Spec-125: Admin Config Message Banner

**Feature:** Feature 25 - Admin Config Message Banner
**Date:** 2025-11-08
**Status:** ✅ Complete (Implementation Pending Commit)
**Dependencies:** Spec-105a (Backend OAuth Service), Spec-105b (Extension OAuth Integration)

---

## 1. Overview

Implement an admin-configurable message banner system that displays important announcements, updates, or notifications to authenticated users at the top of the extension sidebar. Messages are rendered as Markdown with inline HTML support, allowing rich formatting and clickable links.

**Why this matters:** Provides a centralized, low-friction communication channel to inform all users about product updates, maintenance windows, new features, or important notices without requiring extension updates or direct user contact. This improves user experience by keeping users informed and reduces support burden.

**Architecture Pattern:** Backend configuration endpoint → Extension fetches on initialization → React component renders Markdown banner → User can dismiss temporarily. Follows existing patterns for authentication, API services, and UI components.

---

## 2. Objectives

- Provide admins with a centralized way to communicate with all users
- Display messages prominently at the top of the sidebar (visible across all states)
- Support rich formatting via Markdown with inline HTML
- Allow users to dismiss messages temporarily (UI state only)
- Ensure security through HTML sanitization
- Fail gracefully if config endpoint is unavailable
- Minimal implementation complexity (no database required for MVP)

---

## 3. Architecture Overview

### 3.1 Technology Stack

**Extension:**
- **UI Framework:** React 18 + TypeScript
- **Styling:** Tailwind CSS (existing color system and utilities)
- **Markdown Rendering:** react-markdown with rehype plugins
- **HTML Sanitization:** rehype-sanitize with custom schema
- **API Client:** Fetch API (following existing pipedriveApiService.ts patterns)
- **State Management:** Component-level React state (useState)

**Backend:**
- **Language:** C# 12 (.NET 8)
- **Function Runtime:** Azure Functions (.NET 8 isolated)
- **Authentication:** Session validation (existing pattern from GetCurrentUserFunction)
- **Storage:** Configuration setting (environment variable, Azure App Configuration, or hard-coded constant)

### 3.2 Component Structure

```
Extension/src/
├── content-script/
│   ├── components/
│   │   └── ConfigMessageBanner.tsx        # Banner component
│   ├── App.tsx                             # Integrate banner
│   └── types/
│       └── config.ts                       # TypeScript types
├── service-worker/
│   └── pipedriveApiService.ts              # Add getConfig() method
└── package.json                            # Add dependencies

Backend/WhatsApp2Pipe.Api/
├── Functions/
│   └── GetConfigFunction.cs                # GET /api/config endpoint
└── appsettings.json                        # Configuration (optional)
```

### 3.3 Data Flow

```
Sidebar initializes (authenticated user)
    ↓
Extension calls GET /api/config
    ↓
Backend validates session → returns { message: string | null }
    ↓
Extension receives response
    ↓
If message exists and not dismissed:
    → Render ConfigMessageBanner below header
    → Parse Markdown with HTML support
    → Sanitize HTML output
    → Display banner with X button
    ↓
User clicks X
    → Set showBanner = false (UI state only)
    → Banner disappears
    ↓
User reloads page
    → Config fetched again
    → Banner reappears if message still exists
```

**Error Handling:** If API call fails (network error, 500, timeout), log to Sentry silently and continue sidebar initialization without banner.

---

## 4. Backend Implementation

### 4.1 Configuration Storage (MVP)

**Option 1: Environment Variable (Recommended for MVP)**
```json
// appsettings.json or Azure App Settings
{
  "ConfigMessage": "Check out our **new features** and <a href=\"https://chat2deal.com/updates\" target=\"_blank\">learn more</a>!"
}
```

**Option 2: Hard-coded Constant**
```csharp
// GetConfigFunction.cs
private const string CONFIG_MESSAGE = null; // Set to null to hide, or Markdown string to show
```

**Option 3: Azure App Configuration**
- Create config entry: `Chat2Deal:ConfigMessage`
- Fetch via `IConfiguration` in function
- Allows runtime updates without redeployment

**Future Enhancement:** Database table `Config` with columns: ConfigId (GUID), Key (string), Value (string), UpdatedAt (DateTime). Supports per-company messages via CompanyId foreign key.

### 4.2 API Endpoint

**Functions/GetConfigFunction.cs:**
```csharp
using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using WhatsApp2Pipe.Api.Services;

namespace WhatsApp2Pipe.Api.Functions;

public class GetConfigFunction
{
    private readonly ILogger<GetConfigFunction> logger;
    private readonly ISessionService sessionService;
    private readonly IConfiguration configuration;

    public GetConfigFunction(
        ILogger<GetConfigFunction> logger,
        ISessionService sessionService,
        IConfiguration configuration)
    {
        this.logger = logger;
        this.sessionService = sessionService;
        this.configuration = configuration;
    }

    [Function("GetConfig")]
    public async Task<IActionResult> Run(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "config")]
        HttpRequestData req)
    {
        logger.LogInformation("Config request received");

        try
        {
            // 1. Extract and validate Authorization header
            if (!req.Headers.TryGetValues("Authorization", out var authHeaders))
            {
                logger.LogWarning("Missing Authorization header");
                return new UnauthorizedObjectResult(new { error = "Missing authorization" });
            }

            var authHeader = authHeaders.FirstOrDefault();
            if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer "))
            {
                logger.LogWarning("Invalid Authorization header format");
                return new UnauthorizedObjectResult(new { error = "Invalid authorization format" });
            }

            var verificationCode = authHeader.Substring("Bearer ".Length).Trim();

            // 2. Validate session
            var session = await sessionService.GetSessionByVerificationCodeAsync(verificationCode);
            if (session == null || session.SessionExpiresAt < DateTime.UtcNow)
            {
                logger.LogWarning("Invalid or expired session");
                return new UnauthorizedObjectResult(new { error = "Invalid or expired session" });
            }

            // 3. Get config message from configuration
            var configMessage = configuration["ConfigMessage"];

            // 4. Return config (null if not set)
            return new OkObjectResult(new { message = configMessage });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to process config request");
            return new ObjectResult(new { error = "Internal server error" })
            {
                StatusCode = 500
            };
        }
    }
}
```

**Key Implementation Notes:**
1. Uses existing session validation pattern (same as GetCurrentUserFunction)
2. No database queries needed for MVP (reads from configuration)
3. Returns `{ "message": null }` when ConfigMessage is not set
4. Returns `{ "message": "markdown content" }` when set
5. Authentication required (prevents anonymous access)
6. Lightweight and fast (no external API calls)

**Response Format:**
```json
// When message exists
{
  "message": "Check out our **new features** and <a href=\"https://chat2deal.com/updates\" target=\"_blank\">learn more</a>!"
}

// When no message configured
{
  "message": null
}
```

**HTTP Status Codes:**
- 200 OK: Success (message may be null)
- 401 Unauthorized: Missing/invalid/expired session
- 500 Internal Server Error: Unexpected error

---

## 5. Extension Implementation

### 5.1 TypeScript Types

**Extension/src/types/config.ts:**
```typescript
export interface UserConfig {
  message: string | null;
}
```

### 5.2 API Service Function

**Extension/src/service-worker/pipedriveApiService.ts:**

Add new method following existing patterns:

```typescript
/**
 * Get user configuration (e.g., admin messages)
 */
async getConfig(): Promise<UserConfig> {
  return this.makeRequest<UserConfig>('/api/config');
}
```

**Error Handling:**
- Uses existing `makeRequest()` method
- Throws on HTTP errors (caught by calling code)
- Network errors propagate to caller
- 401 Unauthorized clears auth state (existing behavior)

**Import:**
```typescript
import type { UserConfig } from '../types/config';
```

### 5.3 ConfigMessageBanner Component

**Extension/src/content-script/components/ConfigMessageBanner.tsx:**

```typescript
import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';

interface ConfigMessageBannerProps {
  markdown: string;
  onDismiss: () => void;
}

// Custom sanitization schema - allow safe HTML tags and attributes
const sanitizeSchema = {
  ...defaultSchema,
  tagNames: [
    ...(defaultSchema.tagNames || []),
    'p', 'a', 'strong', 'em', 'br', 'ul', 'ol', 'li', 'b', 'i'
  ],
  attributes: {
    ...defaultSchema.attributes,
    a: ['href', 'target', 'rel']
  }
};

export const ConfigMessageBanner: React.FC<ConfigMessageBannerProps> = ({
  markdown,
  onDismiss
}) => {
  return (
    <div
      className="bg-blue-50 border-b border-solid border-blue-200 px-4 py-3 flex items-start gap-3"
      role="region"
      aria-label="Admin message"
    >
      {/* Message Content */}
      <div className="flex-1 text-sm text-gray-800 prose prose-sm max-w-none">
        <ReactMarkdown
          rehypePlugins={[
            rehypeRaw,
            [rehypeSanitize, sanitizeSchema]
          ]}
          components={{
            // Ensure links have noopener noreferrer for security
            a: ({ node, ...props }) => (
              <a
                {...props}
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline"
              />
            ),
            // Style paragraphs
            p: ({ node, ...props }) => (
              <p {...props} className="m-0" />
            )
          }}
        >
          {markdown}
        </ReactMarkdown>
      </div>

      {/* Close Button */}
      <button
        onClick={onDismiss}
        className="flex-shrink-0 w-5 h-5 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors"
        aria-label="Dismiss message"
        type="button"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 4L4 12M4 4L12 12"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
};
```

**Design Details:**
- Background: `bg-blue-50` (light blue for info/announcement tone)
- Border: Bottom border with `border-blue-200` to separate from content
- Padding: `px-4 py-3` (16px horizontal, 12px vertical)
- Layout: Flexbox with message on left (flex-1) and close button on right (flex-shrink-0)
- Text: `text-sm` (14px), `text-gray-800` for readability
- Close button: 20×20px clickable area, 14×14px X icon
- Links: Blue color with underline, hover state
- Prose: Tailwind typography for Markdown styles

**Accessibility:**
- `role="region"` with `aria-label="Admin message"`
- Close button has `aria-label="Dismiss message"`
- Links automatically get `rel="noopener noreferrer"` for security
- Keyboard accessible (Tab to close button, Enter to dismiss)

**Security:**
- rehype-sanitize with custom schema
- Allows safe tags: p, a, strong, em, br, ul, ol, li, b, i
- Allows safe attributes: href, target, rel on links
- Strips dangerous tags: script, iframe, object, embed
- Strips dangerous attributes: onclick, onerror, onload
- Prevents XSS attacks from malicious Markdown

### 5.4 App.tsx Integration

**Extension/src/content-script/App.tsx:**

```typescript
import { ConfigMessageBanner } from './components/ConfigMessageBanner';
import { pipedriveApiService } from '../service-worker/pipedriveApiService';
import type { UserConfig } from '../types/config';

// Add state for config message
const [configMessage, setConfigMessage] = useState<string | null>(null);
const [showConfigMessage, setShowConfigMessage] = useState<boolean>(false);

// Fetch config on authentication
useEffect(() => {
  if (authState === 'authenticated') {
    fetchConfig();
  }
}, [authState]);

const fetchConfig = async () => {
  try {
    const config = await pipedriveApiService.getConfig();
    if (config.message) {
      setConfigMessage(config.message);
      setShowConfigMessage(true);
    }
  } catch (error) {
    // Silent failure - log to Sentry only
    console.error('Failed to fetch config:', error);
    if (window.Sentry) {
      window.Sentry.captureException(error, {
        tags: { context: 'config_fetch' }
      });
    }
  }
};

const handleDismissConfigMessage = () => {
  setShowConfigMessage(false);
};

// In return statement:
return (
  <div id="pipedrive-whatsapp-sidebar" className="...">
    {/* Fixed Header */}
    <header className="...">
      {/* Logo, User Avatar, etc. */}
    </header>

    {/* Config Message Banner - conditionally rendered */}
    {authState === 'authenticated' && showConfigMessage && configMessage && (
      <ConfigMessageBanner
        markdown={configMessage}
        onDismiss={handleDismissConfigMessage}
      />
    )}

    {/* Scrollable Body */}
    <div className="...">
      {/* Existing sidebar states */}
    </div>

    {/* Feedback Button, Dev Indicator, etc. */}
  </div>
);
```

**Integration Notes:**
- Fetch config once when `authState` becomes 'authenticated'
- Only render banner when: authenticated AND message exists AND not dismissed
- Dismissal sets `showConfigMessage = false` (UI state only, no persistence)
- Page reload resets `showConfigMessage` to true (if message still exists)
- Error handling: Silent failure with Sentry logging

### 5.5 NPM Dependencies

**Extension/package.json:**

Add to dependencies:
```json
{
  "dependencies": {
    "react-markdown": "^9.0.0",
    "rehype-raw": "^7.0.0",
    "rehype-sanitize": "^6.0.0"
  }
}
```

**Installation:**
```bash
cd Extension
npm install react-markdown rehype-raw rehype-sanitize
```

**Bundle Size Impact:**
- react-markdown: ~45 KB (minified + gzipped)
- rehype-raw: ~5 KB
- rehype-sanitize: ~8 KB
- **Total:** ~58 KB added to bundle

**Note:** These are already dependencies for Feature 24 (if implemented), so no additional size impact if both features use the same libraries.

---

## 6. UI Design Specification

### 6.1 Visual Design

**Position:**
- Immediately below fixed header (logo + avatar)
- Above all scrollable content
- Visible across ALL sidebar states

**Dimensions:**
- Width: Full sidebar width (350px)
- Height: Auto (min ~48px, expands with content)
- Max height: None (should be concise, but no hard limit)

**Colors:**
- Background: `bg-blue-50` (#eff6ff)
- Border: `border-blue-200` (#bfdbfe) bottom border only
- Text: `text-gray-800` (#1f2937)
- Links: `text-blue-600` (#2563eb) hover `text-blue-800` (#1e40af)
- Close button: `text-gray-500` (#6b7280) hover `text-gray-700` (#374151)

**Typography:**
- Text size: 14px (text-sm)
- Line height: 1.5
- Font family: Inherited from body (system font stack)
- Links: Underlined

**Spacing:**
- Padding: 12px vertical, 16px horizontal
- Gap between message and close button: 12px
- Paragraph spacing: 0 (single paragraph expected)

**Interactive States:**
- Close button hover: Color change from gray-500 to gray-700
- Link hover: Color change from blue-600 to blue-800
- No focus ring on banner itself (only on interactive elements)

### 6.2 Layout Structure

```
┌────────────────────────────────────────────────────┐
│ [Fixed Header: Logo + Avatar]                      │
├────────────────────────────────────────────────────┤
│ [Message text with possible links...] [X]          │  ← Config Banner
├────────────────────────────────────────────────────┤
│                                                    │
│ [Scrollable Content: Sidebar States]              │
│                                                    │
└────────────────────────────────────────────────────┘
```

**Flexbox Layout:**
```html
<div class="flex items-start gap-3">
  <div class="flex-1">[Message]</div>
  <button class="flex-shrink-0">[X]</button>
</div>
```

**Z-index:** Not needed (banner is in normal document flow)

### 6.3 Responsive Behavior

**Fixed Sidebar Width (350px):**
- Banner always full width of sidebar
- No mobile considerations (extension only works on desktop)
- Long messages wrap to multiple lines (no horizontal scroll)

**Content Overflow:**
- Message text wraps naturally
- Links can break at word boundaries
- Very long URLs may need `word-break: break-all` (optional enhancement)

### 6.4 Accessibility

**ARIA Attributes:**
```html
<div role="region" aria-label="Admin message">
  <div class="...">
    <ReactMarkdown>...</ReactMarkdown>
  </div>
  <button aria-label="Dismiss message">×</button>
</div>
```

**Keyboard Navigation:**
- Tab: Focus close button
- Enter/Space: Dismiss banner
- Links within message are keyboard accessible (Tab to link, Enter to follow)

**Screen Reader:**
- Banner announces as "Admin message" region
- Close button announces as "Dismiss message button"
- Links announce as standard links
- Markdown content read as formatted text

**Color Contrast:**
- Text on blue-50 background: WCAG AA compliant (4.5:1+ ratio)
- Links on blue-50 background: WCAG AA compliant
- Close button: Sufficient contrast in both states

---

## 7. Error Handling & Edge Cases

### 7.1 Network Errors

**Scenario:** User's internet connection drops during config fetch

**Handling:**
- API call throws Error
- Error caught in `fetchConfig()` try-catch
- Error logged to Sentry with context tag
- Sidebar continues loading normally without banner
- No user-facing error message

**User Impact:** None - user doesn't know config exists, sidebar works normally

### 7.2 Backend Errors (500)

**Scenario:** Backend function crashes or database unavailable

**Handling:**
- Backend returns 500 Internal Server Error
- Same handling as network error (silent failure)
- Logged to Sentry for monitoring
- Sidebar continues normally

### 7.3 Session Expiration

**Scenario:** User's session expires before config fetch

**Handling:**
- Backend returns 401 Unauthorized
- Existing auth service handles this (clears auth state)
- Config fetch fails silently
- User sees unauthenticated state (sign-in prompt)

**Note:** This is unlikely since config fetches immediately after authentication, but handled gracefully.

### 7.4 Malformed Markdown

**Scenario:** Admin enters invalid Markdown syntax

**Handling:**
- react-markdown is fault-tolerant (renders as plain text if parsing fails)
- No crash or rendering error
- Banner displays with best-effort formatting

**Example:**
```markdown
Input: Check out [invalid link(https://example.com)
Output: "Check out [invalid link(https://example.com)" (rendered as plain text)
```

### 7.5 XSS Attempt

**Scenario:** Admin (or compromised backend) attempts to inject malicious HTML

**Handling:**
- rehype-sanitize strips dangerous tags and attributes
- Script tags removed
- Event handlers (onclick, onerror) removed
- Only safe tags and attributes allowed

**Example:**
```markdown
Input: Click <a href="javascript:alert('xss')" onclick="hack()">here</a>
Output: Click <a href="#">here</a> (sanitized, href removed, onclick removed)
```

**Security Note:** Even if admin account is compromised, cannot execute JavaScript in user's browser.

### 7.6 Empty Message

**Scenario:** Backend returns `{ "message": "" }` (empty string)

**Handling:**
- React conditional: `{showConfigMessage && configMessage && ...}`
- Empty string is falsy in JavaScript
- Banner does not render

**Alternative:** Could explicitly check `configMessage.trim().length > 0` for clarity.

### 7.7 Very Long Message

**Scenario:** Admin enters 500+ character message

**Handling:**
- No artificial limit enforced
- Message wraps to multiple lines
- Banner height expands automatically
- May push content down significantly

**Future Enhancement:** Add max-height with scrolling, or truncate with "Read more" expansion.

### 7.8 Rapid Dismiss and Reload

**Scenario:** User dismisses banner, immediately reloads page

**Handling:**
- Config fetched again on reload
- Banner reappears (no persistence of dismissal)
- Expected behavior (dismissal is temporary)

---

## 8. Testing Strategy

### 8.1 Unit Tests

**ConfigMessageBanner.tsx:**
- Renders Markdown correctly
- Renders inline HTML links correctly
- Sanitizes dangerous HTML (script tags, onclick handlers)
- onDismiss callback fires when X clicked
- Accessibility attributes present (role, aria-label)
- Links have noopener noreferrer
- Close button has aria-label

**getConfig() function:**
- Sends correct Authorization header
- Handles 200 success with message
- Handles 200 success with null message
- Handles 401 Unauthorized
- Handles 500 Server Error
- Handles network errors

### 8.2 Integration Tests

**Extension to Backend:**
- Authenticated user fetches config successfully
- Config endpoint returns message when set
- Config endpoint returns null when not set
- Invalid session returns 401
- Expired session returns 401

### 8.3 E2E Tests

**User Flow (Message Exists):**
1. User signs in to extension
2. Sidebar initializes, config fetched
3. Banner appears below header
4. User clicks X
5. Banner disappears
6. User reloads page
7. Banner reappears

**User Flow (No Message):**
1. User signs in to extension
2. Sidebar initializes, config fetched
3. Backend returns null message
4. No banner appears
5. Sidebar displays normally

### 8.4 Manual Testing Checklist

- [ ] Banner appears below header when message exists
- [ ] Banner does not appear when message is null
- [ ] Banner visible in all sidebar states (welcome, contact, person-matched, etc.)
- [ ] Markdown text renders correctly (bold, italic, links)
- [ ] Inline HTML links render correctly
- [ ] Links open in new tab when target="_blank" specified
- [ ] Links have noopener noreferrer for security
- [ ] Script tags are stripped (XSS prevention)
- [ ] onclick handlers are stripped (XSS prevention)
- [ ] Close button dismisses banner
- [ ] Dismissed banner reappears on page reload
- [ ] Config fetch failure is silent (no error shown to user)
- [ ] Config fetch failure logged to Sentry
- [ ] Very long messages wrap correctly
- [ ] Links are keyboard accessible (Tab to link, Enter to follow)
- [ ] Close button is keyboard accessible (Tab to button, Enter to dismiss)
- [ ] Screen reader announces banner and button correctly

---

## 9. Security & Privacy

### 9.1 Authentication

- Config endpoint requires valid session (verification_code)
- Session validated on every request
- No anonymous access to config
- Prevents unauthorized users from seeing messages

### 9.2 HTML Sanitization

**Allowed Tags:**
- `<p>` `<a>` `<strong>` `<em>` `<br>` `<ul>` `<ol>` `<li>` `<b>` `<i>`

**Allowed Attributes:**
- `href` `target` `rel` on `<a>` tags only

**Blocked Tags:**
- `<script>` `<iframe>` `<object>` `<embed>` `<style>` `<link>`

**Blocked Attributes:**
- `onclick` `onerror` `onload` `onmouseover` and all event handlers
- `style` attribute (prevents inline CSS injection)

**XSS Prevention:**
- rehype-sanitize runs on all HTML output
- Dangerous content stripped before rendering
- React's default escaping provides additional layer

### 9.3 Link Security

**rel="noopener noreferrer":**
- Prevents `window.opener` access from new tab
- Prevents referrer leakage
- Applied automatically to all links in component

**Target Validation:**
- No validation of target attribute (admin responsibility)
- Admin can specify `target="_blank"` or `target="_self"`
- Default behavior (if no target): Same-window navigation

### 9.4 Data Privacy

**No PII Collected:**
- Config message applies to all users (not user-specific)
- No user data sent in config request (only session token)
- No tracking of who dismissed messages

**Admin Responsibility:**
- Admin should not include sensitive information in messages
- Messages are visible to all authenticated users
- No per-user or per-company filtering in MVP

---

## 10. Performance Considerations

### 10.1 Bundle Size

**New Dependencies:**
- react-markdown: ~45 KB
- rehype-raw: ~5 KB
- rehype-sanitize: ~8 KB
- **Total:** ~58 KB added

**Impact:** Minimal - extension bundle increases by ~58 KB (compressed)

**Note:** If Feature 24 (Feedback System) also uses react-markdown, these libraries are shared (no duplicate cost).

### 10.2 Runtime Performance

**Config Fetch:**
- Single HTTP request on sidebar initialization
- Typical latency: 100-300ms
- Non-blocking (sidebar continues loading)

**Markdown Rendering:**
- react-markdown renders on initial mount
- Typical render time: <10ms for short messages
- No re-rendering unless message changes (stateful dismiss)

**Sanitization:**
- rehype-sanitize runs once per message
- Fast for typical message sizes (<500 chars)
- Negligible impact on render performance

### 10.3 Memory Usage

**Component State:**
- Two state variables: `configMessage` (string | null), `showConfigMessage` (boolean)
- Negligible memory footprint (<1 KB)

**Markdown Library:**
- react-markdown and plugins loaded into memory
- Shared across all components using Markdown
- No per-instance overhead

---

## 11. Admin Workflow

### 11.1 Setting a Message (MVP - Environment Variable)

**Azure Portal:**
1. Navigate to Function App → Configuration → Application settings
2. Add or update setting: `ConfigMessage`
3. Value: Markdown string with optional inline HTML
4. Example: `"Check out our **new features** and <a href=\"https://chat2deal.com/updates\" target=\"_blank\">learn more</a>!"`
5. Save and restart function app

**Deployment Time:** Immediate (after function app restart)

### 11.2 Removing a Message

**Azure Portal:**
1. Set `ConfigMessage` to empty string or null
2. Save and restart function app

**Alternative:** Delete the ConfigMessage setting entirely

**Deployment Time:** Immediate (after function app restart)

### 11.3 Updating a Message

**Process:**
1. Update ConfigMessage value in Azure Portal
2. Save and restart function app
3. Users see new message on next sidebar load

**User Impact:**
- Users who already dismissed old message will see new message (temporary dismissal)
- No way to track which users have seen which messages (MVP limitation)

### 11.4 Testing Messages

**Development Environment:**
1. Update `ConfigMessage` in local appsettings.json or .env file
2. Restart local function app
3. Reload extension in browser
4. Verify message appears and renders correctly

**Staging Environment:**
1. Deploy to staging function app with test message
2. Test with staging extension build
3. Verify formatting, links, dismissal behavior
4. Once confirmed, deploy to production

---

## 12. Future Enhancements

### 12.1 Database Storage

**Goal:** Store messages in Azure SQL Database for easier management

**Implementation:**
- New table: `Config` (ConfigId, Key, Value, UpdatedAt)
- Key: "ConfigMessage"
- Value: Markdown string or null
- Admin updates via SQL query or custom admin API

**Benefits:**
- No function app restart required
- Version history (track message changes)
- Easier to query and audit

### 12.2 Per-Company Messages

**Goal:** Show different messages to different companies

**Implementation:**
- Add CompanyId column to Config table
- Filter by user's CompanyId when fetching config
- Fallback to global message if no company-specific message

**Use Case:** Notify specific company about their trial expiration, custom feature availability, etc.

### 12.3 Per-User Messages

**Goal:** Show messages to specific users

**Implementation:**
- Add UserId column to Config table (nullable)
- Priority: User-specific > Company-specific > Global
- Track dismissals per user in database

**Use Case:** Onboarding tips for new users, personalized notifications

### 12.4 Message Expiration

**Goal:** Auto-hide messages after a certain date

**Implementation:**
- Add ExpiresAt column to Config table
- Backend filters out expired messages
- Admin sets expiration when creating message

**Use Case:** Limited-time promotions, maintenance window notices

### 12.5 Message Types

**Goal:** Different visual styles for different message types

**Implementation:**
- Add Type column: "info", "warning", "success", "error"
- Banner color changes based on type
  - Info: Blue (current)
  - Warning: Yellow/amber
  - Success: Green
  - Error: Red
- Icon changes based on type

**Use Case:** Critical alerts (red), success announcements (green), general info (blue)

### 12.6 Persistent Dismissal

**Goal:** Remember dismissals across sessions

**Implementation:**
- Add MessageId column to Config table
- Store dismissed message IDs in chrome.storage.local
- Don't show message if MessageId in dismissed list
- New MessageId shows message again

**Use Case:** Long-running messages that users don't need to see repeatedly

### 12.7 Admin Dashboard

**Goal:** Web UI for managing messages

**Implementation:**
- Website admin section with CRUD operations
- Form fields: Message content, Type, ExpiresAt, CompanyId
- Preview Markdown rendering before saving
- List view with active/expired/draft messages

**Benefits:**
- No direct database access needed
- Non-technical admins can manage messages
- Preview ensures formatting is correct

### 12.8 Message Analytics

**Goal:** Track message visibility and engagement

**Implementation:**
- Log message_shown event (message ID, user ID, timestamp)
- Log message_dismissed event (message ID, user ID, timestamp)
- Log message_link_clicked event (message ID, link URL, user ID, timestamp)
- Analytics dashboard: Views, dismissals, click-through rate

**Use Case:** Measure effectiveness of announcements, optimize messaging

### 12.9 Rich Media Support

**Goal:** Embed images, videos, or interactive elements

**Implementation:**
- Extend sanitization schema to allow `<img>` tags
- Add support for `<video>` or `<iframe>` (with strict allowlist)
- Lazy load media to avoid performance impact

**Considerations:**
- Increased bundle size for media
- Privacy concerns (external images leak IP addresses)
- Security concerns (iframe sandboxing required)

### 12.10 Localization

**Goal:** Show messages in user's language

**Implementation:**
- Detect user's language from Pipedrive profile
- Store translations in Config table (MessageId + LanguageCode)
- Fallback to English if translation unavailable

**Use Case:** Multi-language customer base

---

## 13. Acceptance Criteria

### Backend

- [ ] GetConfigFunction.cs implemented with session validation
- [ ] Endpoint route: GET /api/config
- [ ] Authentication required (Bearer token)
- [ ] Returns `{ "message": string | null }` JSON
- [ ] Message fetched from configuration (environment variable or appsettings.json)
- [ ] Returns 200 with null when ConfigMessage not set
- [ ] Returns 200 with Markdown string when ConfigMessage set
- [ ] Returns 401 for invalid/expired session
- [ ] Returns 500 on unexpected errors
- [ ] Deployed to Azure Functions
- [ ] Tested with Postman/curl

### Extension

- [ ] UserConfig type defined in types/config.ts
- [ ] pipedriveApiService.getConfig() method implemented
- [ ] ConfigMessageBanner component created
- [ ] Banner renders Markdown with react-markdown
- [ ] Banner supports inline HTML via rehype-raw
- [ ] Banner sanitizes HTML via rehype-sanitize
- [ ] Banner allows safe tags: p, a, strong, em, br, ul, ol, li, b, i
- [ ] Banner allows safe attributes: href, target, rel on links
- [ ] Banner strips dangerous tags: script, iframe, style
- [ ] Banner strips dangerous attributes: onclick, onerror
- [ ] Banner positioned below header, above scrollable content
- [ ] Banner visible in all sidebar states
- [ ] Banner has X close button in top-right corner
- [ ] Clicking X dismisses banner (UI state only)
- [ ] Dismissed banner reappears on page reload
- [ ] Config fetched once on authentication
- [ ] Config fetch failures silent (logged to Sentry)
- [ ] Links have rel="noopener noreferrer"
- [ ] Links open in new tab when target="_blank" specified
- [ ] ARIA attributes present (role, aria-label)
- [ ] Keyboard accessible (Tab to close, Enter to dismiss)

### Testing

- [ ] Unit tests pass for ConfigMessageBanner
- [ ] Unit tests pass for getConfig()
- [ ] Integration tests pass (extension to backend)
- [ ] E2E test passes (full user flow with message)
- [ ] E2E test passes (user flow with null message)
- [ ] Manual testing checklist completed
- [ ] XSS prevention verified (script tags stripped)
- [ ] No console errors during normal operation
- [ ] No accessibility violations

### Dependencies

- [ ] react-markdown (^9.0.0) added to package.json
- [ ] rehype-raw (^7.0.0) added to package.json
- [ ] rehype-sanitize (^6.0.0) added to package.json
- [ ] npm install completed successfully
- [ ] Extension builds without errors

---

## 14. Implementation Order

1. **Backend (Phase 1):**
   - Implement GetConfigFunction.cs
   - Add ConfigMessage to appsettings.json (test value)
   - Test locally with curl/Postman
   - Verify session validation works

2. **Backend (Phase 2):**
   - Deploy to Azure Functions
   - Add ConfigMessage to Azure App Settings (production value or null)
   - Test with production session token
   - Verify CORS headers work

3. **Extension (Phase 1):**
   - Add NPM dependencies (react-markdown, rehype-raw, rehype-sanitize)
   - Create types/config.ts
   - Add getConfig() to pipedriveApiService.ts
   - Test API call in isolation

4. **Extension (Phase 2):**
   - Create ConfigMessageBanner.tsx component
   - Implement Markdown rendering
   - Implement HTML sanitization
   - Test component in isolation with mock data

5. **Extension (Phase 3):**
   - Integrate banner into App.tsx
   - Add config fetch on authentication
   - Add state management (configMessage, showConfigMessage)
   - Add dismiss handler
   - Test full flow end-to-end

6. **Testing & Polish:**
   - Write unit tests
   - Write integration tests
   - Write E2E tests
   - Manual testing checklist
   - XSS testing (verify sanitization)
   - Accessibility audit

7. **Documentation:**
   - Update CLAUDE.md with new components
   - Add implementation summary document
   - Update Chrome extension architecture docs

---

## 15. Related Documentation

- [BRD-001: MVP Business Requirements](../BRDs/BRD-001-MVP-Pipedrive-WhatsApp.md) - Section 4.9 (Feature 25)
- [Chrome Extension Architecture](../Architecture/Chrome-Extension-Architecture.md) - Component structure and patterns
- [UI Design Specification](../Architecture/UI-Design-Specification.md) - Design system and visual patterns
- [Spec-105a: Backend OAuth Service](Spec-105a-Backend-OAuth-Service.md) - Authentication patterns
- [Spec-105b: Extension OAuth Integration](Spec-105b-Extension-OAuth-Integration.md) - Extension authentication
- [Spec-124: User Feedback System](Spec-124-User-Feedback-System.md) - Similar component patterns (modal, Markdown)

---

## 16. Implementation Summary

### Files Implemented

**Backend (Complete):**
- ✅ `Functions/GetConfigFunction.cs` - GET /api/config endpoint with session validation (3697 bytes)
- ✅ `local.settings.json` - Added ConfigMessage setting

**Extension (Complete):**
- ✅ `content-script/components/ConfigMessageBanner.tsx` - Banner component with Markdown rendering (2295 bytes)
- ✅ `content-script/components/ConfigMessageBanner.test.tsx` - Unit tests for banner (7734 bytes)
- ✅ `types/config.ts` - TypeScript type definitions (58 bytes)
- ✅ `content-script/App.tsx` - Integrated banner below header
- ✅ `service-worker/index.ts` - Added CONFIG_FETCH message handler
- ✅ `service-worker/pipedriveApiService.ts` - Added getConfig() method
- ✅ `types/messages.ts` - Added ConfigFetchRequest, ConfigFetchResponse types
- ✅ `package.json` - Added dependencies: react-markdown, rehype-raw, rehype-sanitize

**Tests (Complete):**
- ✅ `tests/unit/service-worker-handlers.test.ts` - Service worker config handler tests (7053 bytes)
- ✅ `tests/unit/pipedriveApiService.test.ts` - Updated with getConfig() tests
- ✅ `tests/e2e/config-message-banner.spec.ts` - E2E tests for banner flow (10613 bytes)

### Implementation Details

**Backend API:**
- Route: `GET /api/config`
- Authentication: Session validation (existing pattern)
- Response: `{ "message": string | null }`
- Configuration: Reads from `ConfigMessage` setting in local.settings.json / Azure App Settings
- CORS: Enabled for extension origins

**Extension Architecture:**
```typescript
// Message Flow
User authenticates
  → App.tsx calls fetchConfig()
  → Service worker receives CONFIG_FETCH message
  → Service worker calls pipedriveApiService.getConfig()
  → Backend validates session, returns { message }
  → Service worker sends CONFIG_FETCH_SUCCESS back to App
  → App stores configMessage in state
  → If message exists: ConfigMessageBanner renders below header
  → User clicks X: setShowConfigMessage(false)
  → Banner disappears (UI state only, no persistence)
```

**UI Component:**
- Position: Below header, above main content area
- Background: Amber-50 (warning/info color)
- Border: 1px solid amber-400 on top and bottom
- Icon: Info icon (circle-i) in amber-500
- Content: Markdown with inline HTML support (sanitized)
- Dismiss: X button in top-right corner
- Styling: Follows existing design system (Tailwind CSS)

**Markdown Support:**
- Library: react-markdown v10.1.0
- HTML support: rehype-raw v7.0.0
- Sanitization: rehype-sanitize v6.0.0
- Allowed tags: p, strong, em, a, code, br
- Allowed attributes: href (for links), must be https://)
- Link behavior: target="_blank", rel="noopener noreferrer"

**Security:**
- HTML sanitization prevents XSS attacks
- Only HTTPS links allowed
- No script tags, iframes, or event handlers
- No inline styles or classes (Tailwind only)
- Server-controlled content (admin-only configuration)

**Error Handling:**
- Network failure: Silent failure, no banner shown
- 500 error: Silent failure, logged to Sentry
- Invalid session: Silent failure (user likely not authenticated)
- Invalid JSON: Silent failure
- Missing message: No banner rendered (message = null)

**Testing Coverage:**
- ✅ Unit tests: ConfigMessageBanner component (7 tests)
- ✅ Unit tests: Service worker config handler (4 tests)
- ✅ Unit tests: pipedriveApiService.getConfig() (3 tests)
- ✅ E2E tests: Full flow with mock backend (6 scenarios)

### Configuration Examples

**Development (local.settings.json):**
```json
{
  "Values": {
    "ConfigMessage": "**New Feature:** Dark mode is now available! [Learn more](https://chat2deal.com/dark-mode)"
  }
}
```

**Production (Azure App Settings):**
```
ConfigMessage = null                           (no banner)
ConfigMessage = "System maintenance scheduled for Nov 15th, 10-11am UTC"
ConfigMessage = "**Limited Beta:** Try our new AI-powered lead scoring! [Sign up](https://chat2deal.com/beta)"
```

### Version Bump
- Extension version: 0.32.156 → 0.32.157

### Deployment Status
- ⏳ Backend deployed to Azure - Pending
- ⏳ Azure App Settings configured - Pending
- ⏳ Extension version published - Pending
- ⏳ Git commit - Pending

---

## 17. Notes

- No breaking changes to existing functionality
- Config banner is optional and non-critical (silent failure)
- Backend endpoint lightweight (no database queries in MVP)
- Extension components follow existing UI patterns
- Feature can be disabled by setting message to null
- All changes are independently testable
- Markdown libraries shared with Feature 24 (if implemented)
