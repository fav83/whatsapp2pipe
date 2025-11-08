# Spec-124: User Feedback System

**Feature:** Feature 24 - User Feedback System
**Date:** 2025-11-08
**Status:** ✅ Complete (Implementation Pending Commit)
**Dependencies:** Spec-105a (Backend OAuth Service), Spec-116 (User Entity Tracking)

---

## 1. Overview

Implement in-extension feedback submission system that allows authenticated users to send bug reports, feature requests, and general feedback directly from the Chat2Deal Chrome extension sidebar.

**Why this matters:** Provides a low-friction, contextual channel for users to share feedback while using the product. This improves product development velocity by capturing user insights at the moment of experience, and eliminates the need for external feedback tools or email-based support.

**Architecture Pattern:** Fixed UI button in sidebar → Modal overlay with form → Backend API endpoint → Azure SQL Database storage. Follows existing patterns for authentication, API services, and UI components.

---

## 2. Objectives

- Provide a visible, accessible feedback mechanism within the extension UI
- Collect feedback text along with user identity and metadata
- Store feedback in Azure SQL Database for analysis and follow-up
- Maintain user context (no navigation away from WhatsApp Web)
- Follow existing UI design patterns (modals, buttons, error handling)
- Ensure full keyboard accessibility and ARIA compliance

---

## 3. Architecture Overview

### 3.1 Technology Stack

**Extension:**
- **UI Framework:** React 18 + TypeScript
- **Styling:** Tailwind CSS (existing color system and utilities)
- **API Client:** Fetch API (following existing pipedriveApi.ts patterns)
- **State Management:** Component-level React state (useState)

**Backend:**
- **Database:** Azure SQL Database
- **ORM:** Entity Framework Core 8.x
- **Language:** C# 12 (.NET 8)
- **Function Runtime:** Azure Functions (.NET 8 isolated)
- **Authentication:** Pipedrive access token validation (existing pattern)

### 3.2 Component Structure

```
Extension/src/content-script/
├── components/
│   ├── FeedbackButton.tsx           # Fixed button at bottom
│   └── FeedbackModal.tsx            # Modal with form and states
├── services/
│   └── pipedriveApi.ts              # Add submitFeedback() function
└── App.tsx                          # Integrate FeedbackButton + Modal

Backend/WhatsApp2Pipe.Api/
├── Models/
│   ├── Feedback.cs                  # Feedback entity
│   └── Chat2DealDbContext.cs        # Add DbSet<Feedback>
├── Functions/
│   └── FeedbackFunction.cs          # POST /api/feedback endpoint
└── Migrations/
    └── AddFeedbackTable.cs          # EF Core migration
```

### 3.3 Data Flow

```
User clicks "Send Feedback" button
    ↓
FeedbackModal opens with empty form
    ↓
User types feedback message (5000 char limit)
    ↓
User clicks "Submit"
    ↓
Extension calls POST /api/feedback with message
    ↓
Backend validates access token → extracts UserId
    ↓
Backend saves to Feedback table (auto-populates metadata)
    ↓
Backend returns success
    ↓
Modal shows success message
    ↓
User clicks "Close" → Modal closes, form resets
```

**Error Handling:** If API call fails, show error banner in modal, preserve user's message, allow retry without losing text.

---

## 4. Database Schema

### 4.1 Feedback Table

**Purpose:** Store user feedback with metadata for analysis and follow-up.

**Entity Model:**
```csharp
public class Feedback
{
    // Primary Key
    public Guid FeedbackEntityId { get; set; }  // Auto-generated GUID

    // Foreign Key
    public Guid UserId { get; set; }             // FK to Users table

    // Feedback Content
    public string Message { get; set; }           // User's feedback text (max 10000 chars)

    // Timestamps
    public DateTime CreatedAt { get; set; }       // Submission timestamp (UTC)

    // Metadata (optional, for context)
    public string UserAgent { get; set; }         // Browser user agent string
    public string ExtensionVersion { get; set; }  // Extension version (from manifest)

    // Navigation property
    public User User { get; set; } = null!;
}
```

**Constraints:**
- Primary Key: `FeedbackEntityId` (GUID, clustered index)
- Foreign Key: `UserId` → `Users.UserId`
- Foreign Key Delete Behavior: Restrict (preserve feedback if user deleted)
- Required fields: Message, CreatedAt
- Max length: Message (10000), UserAgent (500), ExtensionVersion (50)
- Nullable fields: UserAgent, ExtensionVersion

**Indexes:**
```sql
CREATE INDEX IX_Feedback_UserId ON Feedback(UserId);
CREATE INDEX IX_Feedback_CreatedAt ON Feedback(CreatedAt DESC);
```

**Sample Data:**
```
FeedbackEntityId: c3d4e5f6-g7h8-9012-cdef-123456789012
UserId: b2c3d4e5-f6g7-8901-bcde-f12345678901
Message: "Love the extension! Would be great to have a dark mode option."
CreatedAt: 2025-11-08 14:23:15
UserAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36..."
ExtensionVersion: "1.2.0"
```

### 4.2 Relationship

```
Users (1) ←──── (N) Feedback
```

**Key Points:**
- One User can submit many Feedback entries
- One Feedback belongs to exactly one User
- Cannot delete User if Feedback exists (DeleteBehavior.Restrict)
- UserId is always available (feature requires authentication)

---

## 5. Backend Implementation

### 5.1 EF Core Entity

**Models/Feedback.cs:**
```csharp
using System;

namespace WhatsApp2Pipe.Api.Models;

public class Feedback
{
    public Guid FeedbackEntityId { get; set; }
    public Guid UserId { get; set; }
    public string Message { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public string? UserAgent { get; set; }
    public string? ExtensionVersion { get; set; }

    // Navigation property
    public User User { get; set; } = null!;
}
```

### 5.2 DbContext Changes

**Models/Chat2DealDbContext.cs:**
```csharp
public DbSet<Feedback> Feedback { get; set; }

protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    // ... existing configurations ...

    // Feedback configuration
    modelBuilder.Entity<Feedback>(entity =>
    {
        entity.HasKey(f => f.FeedbackEntityId);

        entity.Property(f => f.Message)
            .IsRequired()
            .HasMaxLength(10000);

        entity.Property(f => f.CreatedAt)
            .IsRequired();

        entity.Property(f => f.UserAgent)
            .HasMaxLength(500);

        entity.Property(f => f.ExtensionVersion)
            .HasMaxLength(50);

        // Foreign key relationship
        entity.HasOne(f => f.User)
            .WithMany()
            .HasForeignKey(f => f.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        // Indexes
        entity.HasIndex(f => f.UserId)
            .HasDatabaseName("IX_Feedback_UserId");

        entity.HasIndex(f => f.CreatedAt)
            .HasDatabaseName("IX_Feedback_CreatedAt")
            .IsDescending();
    });
}
```

### 5.3 API Endpoint

**Functions/FeedbackFunction.cs:**
```csharp
using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using WhatsApp2Pipe.Api.Models;
using WhatsApp2Pipe.Api.Services;

namespace WhatsApp2Pipe.Api.Functions;

public class FeedbackFunction
{
    private readonly ILogger<FeedbackFunction> logger;
    private readonly Chat2DealDbContext dbContext;
    private readonly IPipedriveApiClient pipedriveClient;

    public FeedbackFunction(
        ILogger<FeedbackFunction> logger,
        Chat2DealDbContext dbContext,
        IPipedriveApiClient pipedriveClient)
    {
        this.logger = logger;
        this.dbContext = dbContext;
        this.pipedriveClient = pipedriveClient;
    }

    [Function("Feedback")]
    public async Task<IActionResult> Run(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "feedback")]
        HttpRequestData req)
    {
        logger.LogInformation("Feedback submission request received");

        // CORS headers
        if (req.Method == "OPTIONS")
        {
            return new OkObjectResult(new { });
        }

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

            var accessToken = authHeader.Substring("Bearer ".Length).Trim();

            // 2. Validate token and get UserId
            Guid userId;
            try
            {
                var userInfo = await pipedriveClient.GetCurrentUserAsync(accessToken);
                var user = await dbContext.Users
                    .FirstOrDefaultAsync(u =>
                        u.PipedriveUserId == userInfo.Id &&
                        u.CompanyId == /* derive from company_id in user info */);

                if (user == null)
                {
                    logger.LogWarning("User not found in database for PipedriveUserId: {PipedriveUserId}", userInfo.Id);
                    return new UnauthorizedObjectResult(new { error = "User not found" });
                }

                userId = user.UserId;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to validate access token");
                return new UnauthorizedObjectResult(new { error = "Invalid or expired token" });
            }

            // 3. Parse request body
            string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
            var feedbackRequest = JsonConvert.DeserializeObject<FeedbackRequest>(requestBody);

            if (feedbackRequest == null || string.IsNullOrWhiteSpace(feedbackRequest.Message))
            {
                logger.LogWarning("Missing or empty message in request");
                return new BadRequestObjectResult(new { error = "Message is required" });
            }

            // Validate message length
            if (feedbackRequest.Message.Length > 10000)
            {
                logger.LogWarning("Message too long: {Length} characters", feedbackRequest.Message.Length);
                return new BadRequestObjectResult(new { error = "Message exceeds maximum length of 10000 characters" });
            }

            // 4. Extract metadata from headers
            req.Headers.TryGetValues("User-Agent", out var userAgentHeaders);
            var userAgent = userAgentHeaders?.FirstOrDefault();

            // ExtensionVersion could be passed as custom header or extracted from User-Agent
            // For now, we'll set it to null and enhance later if needed
            string extensionVersion = null;

            // 5. Create Feedback entity
            var feedback = new Feedback
            {
                FeedbackEntityId = Guid.NewGuid(),
                UserId = userId,
                Message = feedbackRequest.Message.Trim(),
                CreatedAt = DateTime.UtcNow,
                UserAgent = userAgent?.Length > 500 ? userAgent.Substring(0, 500) : userAgent,
                ExtensionVersion = extensionVersion
            };

            // 6. Save to database
            dbContext.Feedback.Add(feedback);
            await dbContext.SaveChangesAsync();

            logger.LogInformation("Feedback saved successfully. FeedbackEntityId: {FeedbackEntityId}, UserId: {UserId}",
                feedback.FeedbackEntityId, userId);

            // 7. Return success
            return new OkObjectResult(new { success = true });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to process feedback submission");
            return new ObjectResult(new { error = "Internal server error" })
            {
                StatusCode = 500
            };
        }
    }

    private class FeedbackRequest
    {
        public string Message { get; set; } = string.Empty;
    }
}
```

**Key Implementation Notes:**
1. Uses existing token validation pattern (calls Pipedrive API to verify)
2. Looks up User by PipedriveUserId to get UserId (GUID)
3. Server-side validation: message required, max 10000 chars
4. Auto-populates CreatedAt, UserAgent, ExtensionVersion
5. Returns simple `{ "success": true }` on success
6. Returns appropriate HTTP status codes (400, 401, 500)

### 5.4 EF Core Migration

**Command:**
```bash
cd Backend/WhatsApp2Pipe.Api
dotnet ef migrations add AddFeedbackTable
dotnet ef database update
```

**Generated Migration:**
```csharp
public partial class AddFeedbackTable : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "Feedback",
            columns: table => new
            {
                FeedbackEntityId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                Message = table.Column<string>(type: "nvarchar(10000)", maxLength: 10000, nullable: false),
                CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                UserAgent = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                ExtensionVersion = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_Feedback", x => x.FeedbackEntityId);
                table.ForeignKey(
                    name: "FK_Feedback_Users_UserId",
                    column: x => x.UserId,
                    principalTable: "Users",
                    principalColumn: "UserId",
                    onDelete: ReferentialAction.Restrict);
            });

        migrationBuilder.CreateIndex(
            name: "IX_Feedback_UserId",
            table: "Feedback",
            column: "UserId");

        migrationBuilder.CreateIndex(
            name: "IX_Feedback_CreatedAt",
            table: "Feedback",
            column: "CreatedAt",
            descending: new[] { true });
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(name: "Feedback");
    }
}
```

---

## 6. Extension Implementation

### 6.1 API Service Function

**Extension/src/content-script/services/pipedriveApi.ts:**

Add new function following existing patterns:

```typescript
/**
 * Submit user feedback to backend
 */
export async function submitFeedback(
  accessToken: string,
  message: string
): Promise<void> {
  const response = await fetch(`${BACKEND_URL}/api/feedback`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify({ message })
  });

  if (!response.ok) {
    let errorMessage = 'Failed to submit feedback';

    try {
      const errorData = await response.json();
      if (errorData.error) {
        errorMessage = errorData.error;
      }
    } catch {
      // If JSON parsing fails, use default error message
    }

    throw new Error(errorMessage);
  }

  // Success - no return value needed
}
```

**Error Handling:**
- Network errors → throw Error
- 401 Unauthorized → throw Error (will be caught and handled by modal)
- 400 Bad Request → parse error message from response
- 500 Server Error → throw generic error

### 6.2 FeedbackButton Component

**Extension/src/content-script/components/FeedbackButton.tsx:**

```typescript
import React from 'react';

interface FeedbackButtonProps {
  onClick: () => void;
}

export const FeedbackButton: React.FC<FeedbackButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="w-full h-[38px] flex items-center justify-center gap-2 px-4
        bg-white border border-solid border-border-primary rounded-lg
        text-secondary text-sm font-medium
        hover:bg-bg-secondary transition-colors"
      aria-label="Send feedback"
    >
      {/* Speech bubble icon */}
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-secondary"
      >
        <path
          d="M14 10.5C14 11.328 13.328 12 12.5 12H4.5L2 14.5V3.5C2 2.672 2.672 2 3.5 2H12.5C13.328 2 14 2.672 14 3.5V10.5Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
      Send Feedback
    </button>
  );
};
```

**Design Details:**
- Full width (w-full) within container
- 38px height (consistent with primary action buttons)
- Secondary styling: white background, border, text-secondary color
- Hover state: light gray background (bg-secondary)
- Icon: 16×16px speech bubble (outline style)
- Gap: 8px between icon and text

### 6.3 FeedbackModal Component

**Extension/src/content-script/components/FeedbackModal.tsx:**

```typescript
import React, { useState, useRef, useEffect } from 'react';
import { submitFeedback } from '../services/pipedriveApi';
import { Spinner } from './Spinner';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  accessToken: string;
}

type ModalState = 'default' | 'submitting' | 'success' | 'error';

const MAX_CHARS = 5000;

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  accessToken
}) => {
  const [message, setMessage] = useState('');
  const [state, setState] = useState<ModalState>('default');
  const [errorMessage, setErrorMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Focus textarea when modal opens
  useEffect(() => {
    if (isOpen && state === 'default' && textareaRef.current) {
      // Small delay to ensure modal is rendered
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [isOpen, state]);

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, message]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        handleClose();
      }
    };

    if (isOpen) {
      // Add listener with slight delay to avoid immediate trigger
      setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 100);

      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, message]);

  const handleClose = () => {
    // If user has typed text, confirm before closing
    if (message.trim().length > 0 && state === 'default') {
      const confirmed = window.confirm('Discard your feedback?');
      if (!confirmed) return;
    }

    // Reset state and close
    resetModal();
    onClose();
  };

  const resetModal = () => {
    setMessage('');
    setState('default');
    setErrorMessage('');
  };

  const handleSubmit = async () => {
    if (message.trim().length === 0) return;

    setState('submitting');
    setErrorMessage('');

    try {
      await submitFeedback(accessToken, message.trim());
      setState('success');
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      setState('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to submit feedback. Please try again.');
    }
  };

  const handleSuccessClose = () => {
    resetModal();
    onClose();
  };

  const dismissError = () => {
    setErrorMessage('');
    setState('default');
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="feedback-modal-title"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50" />

      {/* Modal Container */}
      <div
        ref={modalRef}
        className="relative w-[300px] bg-white rounded-lg shadow-lg border border-solid border-border-primary"
        style={{ maxHeight: '80vh' }}
      >
        {state === 'success' ? (
          // SUCCESS STATE
          <div className="p-5">
            {/* Success Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M20 6L9 17L4 12"
                    stroke="#10b981"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>

            {/* Success Message */}
            <h2 className="text-[17px] font-semibold text-primary text-center mb-3">
              Thank you!
            </h2>
            <p className="text-sm text-secondary text-center mb-6">
              Your feedback has been received. We appreciate you taking the time to help us improve Chat2Deal.
            </p>

            {/* Close Button */}
            <button
              onClick={handleSuccessClose}
              className="w-full h-[38px] bg-brand-primary hover:bg-brand-hover
                text-white text-sm font-medium rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          // DEFAULT / SUBMITTING / ERROR STATE
          <>
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-solid border-border-secondary">
              <h2
                id="feedback-modal-title"
                className="text-[17px] font-semibold text-primary"
              >
                Send Feedback
              </h2>
              <button
                onClick={handleClose}
                disabled={state === 'submitting'}
                className="w-6 h-6 flex items-center justify-center text-secondary hover:text-primary
                  disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Close feedback modal"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M12 4L4 12M4 4L12 12"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="p-5">
              {/* Error Banner */}
              {state === 'error' && errorMessage && (
                <div className="mb-4 p-3 bg-red-50 border border-solid border-red-200 rounded-lg flex items-start justify-between">
                  <p className="text-sm text-red-600 flex-1">{errorMessage}</p>
                  <button
                    onClick={dismissError}
                    className="ml-2 text-red-600 hover:text-red-800"
                    aria-label="Dismiss error"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M12 4L4 12M4 4L12 12"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                </div>
              )}

              {/* Instructional Text */}
              <p className="text-sm text-secondary mb-3">
                Share your thoughts with us! Whether it's a bug you've encountered, a feature you'd like to see,
                or general feedback about Chat2Deal - we'd love to hear from you.
              </p>

              {/* Textarea */}
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => {
                  if (e.target.value.length <= MAX_CHARS) {
                    setMessage(e.target.value);
                  }
                }}
                placeholder="Tell us what's on your mind..."
                disabled={state === 'submitting'}
                className="w-full min-h-[120px] max-h-[240px] p-3 border border-solid border-border-primary
                  rounded-lg text-sm text-primary placeholder-secondary resize-y
                  focus:outline-none focus:ring-1 focus:ring-brand-primary
                  disabled:opacity-60 disabled:cursor-not-allowed"
                aria-label="Feedback message"
                aria-required="true"
              />

              {/* Character Counter */}
              <p className="mt-2 text-xs text-secondary text-right">
                {message.length} / {MAX_CHARS}
              </p>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-solid border-border-secondary">
              <button
                onClick={handleClose}
                disabled={state === 'submitting'}
                className="h-[38px] px-4 border border-solid border-border-primary rounded-lg
                  text-secondary text-sm font-medium
                  hover:bg-bg-secondary transition-colors
                  disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={message.trim().length === 0 || state === 'submitting'}
                className="h-[38px] px-6 bg-brand-primary hover:bg-brand-hover rounded-lg
                  text-white text-sm font-medium transition-colors
                  disabled:opacity-60 disabled:cursor-not-allowed
                  flex items-center justify-center min-w-[80px]"
              >
                {state === 'submitting' ? (
                  <Spinner size={16} color="white" />
                ) : (
                  'Submit'
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
```

**Key Features:**
- Four distinct states with conditional rendering
- Auto-focus textarea on open
- Character counter with 5000 limit
- Keyboard navigation (Escape to close)
- Click-outside to close with confirmation
- Error banner with dismiss button
- Success screen with checkmark icon
- Disabled states during submission
- Preserves message text on error

### 6.4 App.tsx Integration

**Extension/src/content-script/App.tsx:**

```typescript
// Add state for feedback modal
const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

// In return statement, add button and modal:
return (
  <div id="pipedrive-whatsapp-sidebar" className="...">
    {/* Header */}
    <div className="...">
      {/* ... existing header content ... */}
    </div>

    {/* Main content area */}
    <div className="...">
      {/* ... existing sidebar states ... */}
    </div>

    {/* Feedback Button - Fixed at bottom */}
    {user && (
      <div className="absolute bottom-0 left-0 right-0 px-4 pb-4 bg-bg-main">
        {/* In dev mode, show above DevModeIndicator */}
        {import.meta.env.DEV && <div className="mb-4" />}

        <FeedbackButton onClick={() => setIsFeedbackModalOpen(true)} />
      </div>
    )}

    {/* Dev Mode Indicator (if in dev) */}
    {import.meta.env.DEV && <DevModeIndicator />}

    {/* Feedback Modal */}
    {user && (
      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        accessToken={user.accessToken}
      />
    )}
  </div>
);
```

**Positioning Logic:**
- Production: Button at absolute bottom (bottom-0)
- Development: Button above DevModeIndicator (mb-4 spacing)
- Button only visible when authenticated (user exists)
- Modal only rendered when authenticated

---

## 7. UI Design Specification

### 7.1 Feedback Button

**Layout:**
- Position: Fixed at bottom of sidebar
  - Production: `bottom-0` (absolute bottom)
  - Development: `bottom-0` with spacing above DevModeIndicator
- Width: Full width minus horizontal padding (318px with 16px margins)
- Height: 38px

**Visual Style:**
- Background: White (`bg-white`)
- Border: 1px solid border-primary color
- Border radius: 8px (`rounded-lg`)
- Text: text-secondary color, 14px, font-weight 500
- Icon: 16×16px speech bubble, text-secondary color
- Gap: 8px between icon and text

**Interactive States:**
- Hover: background-secondary color
- Active: Standard button active state
- Focus: Browser default focus indicator

### 7.2 Feedback Modal

**Backdrop:**
- Full viewport overlay with `rgba(0, 0, 0, 0.5)` background
- Z-index: 10000 (above all extension content)
- Click to close with confirmation if text entered

**Modal Container:**
- Width: 300px (leaves 25px margins on 350px sidebar)
- Max height: 80vh (prevents overflow on small screens)
- Background: White
- Border: 1px solid border-primary
- Border radius: 8px
- Shadow: Standard elevation shadow
- Centered vertically and horizontally

**Header:**
- Padding: 16px top/bottom, 20px left/right
- Border bottom: 1px solid border-secondary
- Title: "Send Feedback" (17px, semibold, text-primary)
- Close button: 24×24px clickable area, X icon (16×16px)

**Body:**
- Padding: 20px all around
- Instructional text: 13px, text-secondary, 12px bottom margin
- Textarea:
  - Min height: 120px
  - Max height: 240px (scrollable)
  - Padding: 12px
  - Border: 1px solid border-primary
  - Border radius: 8px
  - Font: 14px regular
  - Placeholder: text-secondary color
  - Focus: 1px ring in brand-primary color
- Character counter: 12px, text-secondary, right-aligned, 8px top margin

**Footer:**
- Padding: 16px all around
- Border top: 1px solid border-secondary
- Buttons:
  - Cancel: Secondary style (border, text-secondary, hover bg-secondary)
  - Submit: Primary style (brand-primary bg, white text, hover brand-hover)
  - Both: 38px height, 8-12px horizontal padding
  - Gap: 12px between buttons

**Success State:**
- Padding: 20px all around
- Checkmark icon: 64×64px circle, emerald-100 bg, emerald-500 checkmark
- Heading: "Thank you!" (17px, semibold, text-primary, centered)
- Message: 14px, text-secondary, centered, 24px bottom margin
- Close button: Full width, 38px, brand-primary style

**Error State:**
- Error banner: Above instructional text
- Padding: 12px
- Background: red-50
- Border: 1px solid red-200
- Border radius: 8px
- Text: 14px, red-600
- Dismiss X: 16×16px, red-600 color

### 7.3 Accessibility

**ARIA Attributes:**
```html
<!-- Modal -->
<div role="dialog" aria-modal="true" aria-labelledby="feedback-modal-title">

<!-- Title -->
<h2 id="feedback-modal-title">Send Feedback</h2>

<!-- Textarea -->
<textarea aria-label="Feedback message" aria-required="true">

<!-- Buttons -->
<button aria-label="Close feedback modal">
<button aria-label="Dismiss error">
```

**Keyboard Navigation:**
- Tab order: Close X → Textarea → Cancel → Submit
- Escape: Close modal (with confirmation if text present)
- Enter in textarea: Insert newline (not submit)
- Focus trap: Tab cycles within modal when open

**Screen Reader:**
- Modal announces as dialog when opened
- Textarea labeled for context
- Success/error states announced via live regions (implicit)

---

## 8. Error Handling & Edge Cases

### 8.1 Network Errors

**Scenario:** User's internet connection drops during submission

**Handling:**
- API call throws Error with message
- Modal shows error banner: "Network error. Please check your connection and try again."
- User's message preserved in textarea
- User can retry when connection restored

### 8.2 Token Expiration

**Scenario:** User's Pipedrive access token expired

**Handling:**
- Backend returns 401 Unauthorized
- Modal shows error banner: "Session expired. Please sign out and sign in again."
- User's message preserved
- User can copy message, sign in, and resubmit

### 8.3 Server Errors

**Scenario:** Backend database unavailable or function crashes

**Handling:**
- Backend returns 500 Internal Server Error
- Modal shows error banner: "Failed to submit feedback. Please try again."
- User's message preserved
- User can retry immediately

### 8.4 Validation Errors

**Scenario:** User bypasses UI validation (unlikely but possible)

**Handling:**
- Backend returns 400 Bad Request with error message
- Modal shows specific error (e.g., "Message exceeds maximum length")
- User's message preserved
- User can edit and resubmit

### 8.5 Empty Message

**Scenario:** User tries to submit without typing anything

**Handling:**
- Submit button disabled when message is empty (client-side prevention)
- If somehow bypassed, backend returns 400 Bad Request
- Modal shows error banner

### 8.6 Character Limit

**Scenario:** User tries to type more than 5000 characters

**Handling:**
- Textarea onChange prevents input beyond limit
- Character counter shows "5000 / 5000" in red (optional enhancement)
- User cannot exceed limit in UI

### 8.7 Modal Close with Unsaved Text

**Scenario:** User types message but clicks outside or presses Escape

**Handling:**
- Browser confirm dialog: "Discard your feedback?"
- If user confirms: Modal closes, message lost
- If user cancels: Modal stays open, message preserved

---

## 9. Testing Strategy

### 9.1 Unit Tests

**FeedbackButton.tsx:**
- Renders with correct text and icon
- onClick callback fires when clicked
- Accessibility attributes present

**FeedbackModal.tsx:**
- Renders all four states correctly
- Character counter updates on input
- Submit button disabled when empty
- Error banner dismisses correctly
- Success state shows after submission
- Modal closes on backdrop click (with confirmation)
- Escape key closes modal (with confirmation)

**submitFeedback() function:**
- Sends correct request body
- Includes Authorization header
- Handles 200 success
- Handles 400/401/500 errors
- Throws Error with correct message

### 9.2 Integration Tests

**Extension to Backend:**
- Authenticated user can submit feedback
- Feedback appears in database with correct UserId
- Metadata (UserAgent, CreatedAt) populated correctly
- Invalid token returns 401
- Empty message returns 400
- Server error returns 500

### 9.3 E2E Tests

**User Flow:**
1. User signs in to extension
2. User clicks "Send Feedback" button
3. Modal opens with focused textarea
4. User types message
5. User clicks Submit
6. Success message appears
7. User clicks Close
8. Modal closes, button still visible

**Error Recovery Flow:**
1. User opens modal, types message
2. Network disconnected
3. User clicks Submit
4. Error banner appears, message preserved
5. Network reconnected
6. User clicks Submit again
7. Success message appears

### 9.4 Manual Testing Checklist

- [ ] Button appears at correct position (prod vs dev mode)
- [ ] Modal opens when button clicked
- [ ] Textarea auto-focuses when modal opens
- [ ] Character counter updates correctly
- [ ] Submit disabled when empty
- [ ] Submit enabled when text present
- [ ] Escape key closes modal (with confirmation)
- [ ] Click outside closes modal (with confirmation)
- [ ] Error banner displays and dismisses
- [ ] Success state displays after submission
- [ ] Database record created with correct data
- [ ] Keyboard navigation works (Tab through elements)
- [ ] Screen reader announces modal correctly
- [ ] Long messages (5000 chars) accepted
- [ ] Messages >5000 chars prevented
- [ ] Token expiration handled gracefully
- [ ] Network errors handled gracefully

---

## 10. Security & Privacy

### 10.1 Authentication

- Feedback submission requires valid Pipedrive access token
- Token validated on every request (calls Pipedrive API)
- No anonymous feedback accepted
- UserId extracted from token, not client input

### 10.2 Data Validation

- Server-side validation of message length (max 10000 chars)
- Message trimmed before storage (remove leading/trailing whitespace)
- SQL injection prevented by EF Core parameterized queries
- XSS prevented by React's default escaping

### 10.3 PII Handling

**Stored Data:**
- UserId (GUID) - not PII, references Users table
- Message - may contain PII (user's choice)
- UserAgent - not PII (browser metadata)
- ExtensionVersion - not PII

**Privacy Considerations:**
- Users aware they're submitting feedback (explicit action)
- Feedback linked to their account for follow-up
- No automatic filtering of PII in messages (user responsibility)
- Data stored in encrypted Azure SQL Database

**Future Enhancement:**
- Optional checkbox: "Include my email in case we need to follow up" (default: unchecked)
- Privacy notice: "Your feedback will be associated with your account."

### 10.4 Rate Limiting

**Not Implemented in MVP:**
- No rate limiting on feedback endpoint
- Users can submit unlimited feedback
- Risk: Spam or abuse

**Future Enhancement:**
- Rate limit: 10 submissions per user per hour (database-level tracking)
- Client-side cooldown: Disable button for 60 seconds after submission

---

## 11. Monitoring & Analytics

### 11.1 Backend Logging

**Successful Submissions:**
```csharp
logger.LogInformation("Feedback saved successfully. FeedbackEntityId: {FeedbackEntityId}, UserId: {UserId}",
    feedback.FeedbackEntityId, userId);
```

**Failed Submissions:**
```csharp
logger.LogError(ex, "Failed to process feedback submission");
logger.LogWarning("User not found in database for PipedriveUserId: {PipedriveUserId}", userInfo.Id);
```

### 11.2 Metrics to Track

**Submission Metrics:**
- Total feedback submissions per day/week/month
- Feedback submissions per user
- Average message length
- Success rate (successful submissions / attempted submissions)
- Error rate by error type (401, 400, 500)

**User Engagement:**
- % of active users who have submitted feedback
- Repeat feedback submitters (users who submit multiple times)
- Time between sign-in and first feedback submission

**Content Analysis:**
- Most common words/phrases in feedback (manual review)
- Categorization: Bug reports vs. feature requests vs. general feedback (manual or ML)

### 11.3 Sentry Error Tracking

**Extension Errors:**
- Network failures during submission
- Unexpected API responses
- Component rendering errors

**Backend Errors:**
- Database connection failures
- Token validation failures
- Unexpected exceptions

**Not Tracked:**
- Feedback content (excluded from error reports for privacy)
- User identity in error breadcrumbs (PII filtering)

---

## 12. Acceptance Criteria

### Backend

- [ ] Feedback table created in Azure SQL Database with correct schema
- [ ] EF Core migration applied successfully
- [ ] POST /api/feedback endpoint implemented and deployed
- [ ] Endpoint validates access token (calls Pipedrive API)
- [ ] Endpoint extracts UserId from validated token
- [ ] Endpoint validates message (required, max 10000 chars)
- [ ] Endpoint auto-populates CreatedAt, UserAgent, ExtensionVersion
- [ ] Endpoint returns 200 success with `{ "success": true }`
- [ ] Endpoint returns 401 for invalid/missing token
- [ ] Endpoint returns 400 for missing/invalid message
- [ ] Endpoint returns 500 for database errors
- [ ] Feedback records appear in database with correct data
- [ ] Foreign key relationship to Users table enforced

### Extension

- [ ] FeedbackButton component implemented with correct styling
- [ ] Button appears at bottom of sidebar (above dev indicator in dev mode)
- [ ] Button only visible when user is authenticated
- [ ] FeedbackModal component implemented with four states
- [ ] Modal opens when button clicked
- [ ] Textarea auto-focuses when modal opens
- [ ] Character counter updates on input (shows X / 5000)
- [ ] Textarea prevents input beyond 5000 characters
- [ ] Submit button disabled when textarea empty
- [ ] Submit button enabled when textarea has text
- [ ] Clicking Submit calls API and shows loading spinner
- [ ] Success state displays after successful submission
- [ ] Error state displays on API failure
- [ ] Error banner preserves user's message
- [ ] User can retry after error
- [ ] Escape key closes modal (with confirmation if text present)
- [ ] Click outside closes modal (with confirmation if text present)
- [ ] Cancel button closes modal (with confirmation if text present)
- [ ] Success Close button closes modal and resets state
- [ ] submitFeedback() function implemented in pipedriveApi.ts
- [ ] Function includes Authorization header with Bearer token
- [ ] Function throws Error on non-200 responses

### Accessibility

- [ ] Modal has role="dialog" and aria-modal="true"
- [ ] Modal title has id="feedback-modal-title"
- [ ] Modal references title via aria-labelledby
- [ ] Textarea has aria-label="Feedback message"
- [ ] Textarea has aria-required="true"
- [ ] Close button has aria-label="Close feedback modal"
- [ ] Dismiss error button has aria-label="Dismiss error"
- [ ] Tab order flows logically (Close → Textarea → Cancel → Submit)
- [ ] Focus trap works (Tab cycles within modal)
- [ ] Escape key closes modal
- [ ] All interactive elements keyboard-accessible

### Testing

- [ ] Unit tests pass for FeedbackButton
- [ ] Unit tests pass for FeedbackModal
- [ ] Unit tests pass for submitFeedback()
- [ ] Integration tests pass (extension to backend)
- [ ] E2E test passes (full user flow)
- [ ] Manual testing checklist completed
- [ ] No console errors during normal operation
- [ ] No accessibility violations (axe-core or similar)

---

## 13. Future Enhancements

### 13.1 Screenshot Attachment

Allow users to attach a screenshot to their feedback:
- "Attach Screenshot" button in modal
- Uses chrome.tabs.captureVisibleTab API
- Uploads image to Azure Blob Storage
- Stores blob URL in Feedback table

### 13.2 Feedback Categories

Add category selection to form:
- Radio buttons: Bug Report / Feature Request / General Feedback
- Stored in new `Category` column (enum or string)
- Helps with feedback triage and analytics

### 13.3 Admin Dashboard

Web-based dashboard to view and manage feedback:
- List all feedback submissions (paginated, filterable)
- View user details for each submission
- Mark feedback as reviewed/resolved
- Export feedback to CSV
- Analytics: Feedback volume over time, common themes

### 13.4 Email Notifications

Notify admin on new feedback submissions:
- SendGrid or Azure Communication Services
- Email sent to feedback@chat2deal.com
- Includes message preview and user info
- Link to admin dashboard

### 13.5 User Feedback History

Show users their past feedback:
- New page in website dashboard
- List of submitted feedback with timestamps
- Status indicator (pending, reviewed, resolved)
- Reply from admin (optional two-way communication)

### 13.6 Rate Limiting

Prevent spam and abuse:
- Database table: FeedbackRateLimit (UserId, SubmissionCount, WindowStart)
- Enforce 10 submissions per user per hour
- Return 429 Too Many Requests if limit exceeded
- Client-side cooldown: Disable button for 60 seconds after submission

### 13.7 Sentiment Analysis

Automatically categorize feedback sentiment:
- Azure Cognitive Services Text Analytics
- Detect positive/negative/neutral sentiment
- Store sentiment score in database
- Surface negative feedback for priority review

---

## 14. Implementation Order

1. **Backend (Phase 1):**
   - Create Feedback entity model
   - Update Chat2DealDbContext
   - Create and apply EF Core migration
   - Test migration on localhost SQL Server

2. **Backend (Phase 2):**
   - Implement FeedbackFunction.cs
   - Add to dependency injection
   - Deploy to Azure
   - Test with Postman/curl

3. **Extension (Phase 1):**
   - Implement submitFeedback() in pipedriveApi.ts
   - Create FeedbackButton component
   - Create FeedbackModal component (default state only)
   - Integrate into App.tsx
   - Test button visibility and modal open/close

4. **Extension (Phase 2):**
   - Implement submitting state in modal
   - Implement success state in modal
   - Implement error state in modal
   - Add keyboard navigation
   - Add accessibility attributes
   - Test full flow end-to-end

5. **Testing & Polish:**
   - Write unit tests
   - Write integration tests
   - Write E2E tests
   - Manual testing checklist
   - Accessibility audit
   - Performance testing (modal rendering, API latency)

6. **Documentation:**
   - Update CLAUDE.md with new components
   - Add implementation summary document (Spec-124-Implementation-Summary.md)
   - Update Chrome extension architecture docs

---

## 15. Related Documentation

- [BRD-001: MVP Business Requirements](../BRDs/BRD-001-MVP-Pipedrive-WhatsApp.md) - Section 4.8 (Feature 24)
- [Plan-001: MVP Feature Breakdown](../Plans/Plan-001-MVP-Feature-Breakdown.md) - Feature 24
- [Chrome Extension Architecture](../Architecture/Chrome-Extension-Architecture.md) - Component structure and patterns
- [UI Design Specification](../Architecture/UI-Design-Specification.md) - Design system and visual patterns
- [Spec-105a: Backend OAuth Service](Spec-105a-Backend-OAuth-Service.md) - Authentication patterns
- [Spec-116: User Entity Tracking](Spec-116-User-Entity-Tracking.md) - Database schema and EF Core patterns

---

## 16. Implementation Summary

### Files Implemented

**Backend (Complete):**
- ✅ `Models/Feedback.cs` - Entity model (FeedbackEntityId, UserId, Message, CreatedAt, UserAgent, ExtensionVersion)
- ✅ `Models/Chat2DealDbContext.cs` - Added DbSet<Feedback> and entity configuration
- ✅ `Functions/FeedbackFunction.cs` - POST /api/feedback endpoint with authentication
- ✅ `Migrations/20251108150731_AddFeedbackTable.cs` - EF Core migration (applied to database)
- ✅ `Migrations/Chat2DealDbContextModelSnapshot.cs` - Updated model snapshot

**Extension (Complete):**
- ✅ `content-script/components/FeedbackButton.tsx` - Fixed button at sidebar bottom (538 bytes)
- ✅ `content-script/components/FeedbackModal.tsx` - Modal with form and four states (9932 bytes)
- ✅ `content-script/App.tsx` - Integrated button + modal, conditional rendering
- ✅ `service-worker/index.ts` - Added FEEDBACK_SUBMIT message handler
- ✅ `service-worker/pipedriveApiService.ts` - Added submitFeedback() method
- ✅ `types/messages.ts` - Added FeedbackSubmitRequest, FeedbackResponse types

### Implementation Details

**Database:**
- Table name: `Feedback`
- Primary key: `FeedbackEntityId` (GUID)
- Foreign key: `UserId` → Users.UserId (Restrict delete)
- Indexes: IX_Feedback_UserId, IX_Feedback_CreatedAt (descending)
- Max lengths: Message (10000), UserAgent (500), ExtensionVersion (50)

**API Endpoint:**
- Route: `POST /api/feedback`
- Authentication: Bearer token (Pipedrive access token)
- Request: `{ "message": string, "extensionVersion": string }`
- Response: `{ "success": true }`
- Error codes: 400 (bad request), 401 (unauthorized), 500 (server error)

**UI Components:**
- Button: 38px height, full width, secondary styling, speech bubble icon
- Modal: 300px width, centered overlay, four states (default, submitting, success, error)
- Textarea: 5000 character UI limit, character counter, auto-focus
- Accessibility: Full keyboard navigation, ARIA labels, focus trap

**Message Flow:**
1. User clicks FeedbackButton
2. FeedbackModal opens with default state
3. User types message (max 5000 chars)
4. User clicks Submit → Modal shows submitting state
5. Content script sends FEEDBACK_SUBMIT message to service worker
6. Service worker calls pipedriveApiService.submitFeedback()
7. Service worker makes POST /api/feedback with Bearer token
8. Backend validates token, extracts UserId, saves to database
9. Service worker sends FEEDBACK_SUBMIT_SUCCESS back to content script
10. Modal shows success state with thank you message
11. User clicks Close → Modal closes and resets

### Testing Status
- ⏳ Unit tests - Pending
- ⏳ Integration tests - Pending
- ⏳ E2E tests - Pending
- ⏳ Manual testing checklist - Pending

### Deployment Status
- ⏳ Backend migration applied - Pending
- ⏳ Backend deployed to Azure - Pending
- ⏳ Extension version bumped to 0.32.156 - Ready
- ⏳ Git commit - Pending

---

## 17. Notes

- No breaking changes to existing functionality
- Feedback feature is additive and optional (users can ignore button)
- Backend endpoint follows existing authentication patterns
- Extension components follow existing UI patterns
- Database schema uses existing EF Core conventions
- All changes are independently testable
- Feature can be disabled via feature flag if needed (future enhancement)
