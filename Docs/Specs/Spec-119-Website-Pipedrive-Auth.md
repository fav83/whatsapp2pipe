# Spec-119: Website Pipedrive Authentication

**Feature:** Website Pipedrive OAuth Authentication
**Date:** 2025-11-02
**Status:** Draft
**Dependencies:** Spec-105a (Backend OAuth Service), Spec-116 (User Entity Tracking)

---

## Implementation Context

This specification extends the existing OAuth infrastructure built for the Chrome extension to support the Chat2Deal user dashboard website. The website will share the same backend OAuth endpoints and follow the same session-based authentication pattern using `verification_code`.

---

**Related Docs:**
- [Website-Architecture.md](../Architecture/Website-Architecture.md) - Website architecture and technology stack
- [Spec-105a-Backend-OAuth-Service.md](Spec-105a-Backend-OAuth-Service.md) - Backend OAuth service (extension)
- [Spec-116-User-Entity-Tracking.md](Spec-116-User-Entity-Tracking.md) - User and Company database tracking
- [Pipedrive OAuth Documentation](../External/Pipedrive/docs/marketplace-oauth-authorization.md)

---

## 1. Overview

Implement OAuth 2.0 authentication for the Chat2Deal website using the redirect-based flow pattern. The website will reuse the existing Azure Functions OAuth endpoints, with the backend detecting client type (extension vs. website) via the OAuth state parameter and responding with appropriate redirects.

**Why this matters:** Users need a way to sign in to the website dashboard to manage their account, view settings, and access future features like subscription management. This provides the authentication foundation for all website functionality.

**Architecture Pattern:** Session-based authentication with backend-issued `verification_code`. Same security model as Chrome extension - tokens never exposed to browser.

---

## 2. Objectives

- Implement redirect-based OAuth 2.0 flow for website
- Extend backend OAuth endpoints to support both extension and website clients
- Implement client type detection via OAuth state parameter
- Create website authentication UI (landing page, callback page, dashboard)
- Implement React Context-based authentication state management
- Store `verification_code` in browser localStorage
- Persist authentication across browser sessions
- Create/update User and Company records in database after OAuth
- Provide user profile display on dashboard
- Implement sign-out functionality

---

## 3. Architecture Overview

### 3.1 Technology Stack

**Frontend:**
- React 18 with TypeScript
- Vite (build tooling)
- React Router v6 (routing)
- Tailwind CSS v3 + shadcn/ui (styling)
- React Context API (state management)

**Backend:**
- Azure Functions (existing, extended)
- C# / .NET 8 (existing)
- Azure SQL Database (existing)

**Hosting:**
- Azure Static Web Apps (frontend)
- Azure Functions (backend, existing)

### 3.2 OAuth Flow Architecture

**Constraint:** Pipedrive supports only ONE redirect URI per app registration. Both extension and website must share the same backend callback endpoint.

**Solution:** Client type encoded in OAuth state parameter. Backend detects client type and responds with appropriate redirect.

```
┌─────────────────────────────────────────────────────────────────┐
│                    Pipedrive OAuth App                          │
│  Redirect URI: https://func-app.azurewebsites.net/api/auth/    │
│                callback (SINGLE URI)                            │
└─────────────────────────────────────────────────────────────────┘
                              ▲
                              │
         ┌────────────────────┴────────────────────┐
         │                                         │
    ┌────▼─────┐                            ┌─────▼────┐
    │Extension │                            │ Website  │
    │  Client  │                            │  Client  │
    └──────────┘                            └──────────┘
    state:                                  state:
    {"type":"extension"...}                 {"type":"web"...}
         │                                         │
         │                                         │
         └────────────────────┬────────────────────┘
                              ▼
                  ┌───────────────────────┐
                  │  Backend OAuth Service│
                  │  (Azure Functions)    │
                  └───────────────────────┘
                              │
                    Decodes state parameter
                    Detects client type
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
    Extension redirect:              Website redirect:
    chromiumapp.org/...              yourwebsite.com/auth/callback
    (closes popup)                   (handles session)
```

### 3.3 Data Flow

```
User visits website (/)
    ↓
Not authenticated → Show landing page with "Sign in with Pipedrive" button
    ↓
User clicks "Sign in with Pipedrive"
    ↓
Website redirects browser to:
GET /api/auth/start?state={"type":"web","nonce":"xyz","timestamp":123}
    ↓
Backend generates Pipedrive OAuth URL with state parameter
Backend redirects to Pipedrive OAuth page
    ↓
User sees Pipedrive authorization screen
User clicks "Allow and install"
    ↓
Pipedrive redirects to:
GET /api/auth/callback?code=xxx&state={...}
    ↓
Backend validates state parameter
Backend decodes state → detects client type = "web"
Backend exchanges authorization code for tokens
    ↓
Backend calls Pipedrive /users/me
Backend creates/updates User and Company in database
Backend generates verification_code (GUID)
Backend stores Session in database:
    - verification_code
    - access_token, refresh_token
    - api_domain, expires_at
    - user_id (FK to User table)
    ↓
Backend redirects browser to:
https://yourwebsite.com/auth/callback?verification_code=xxx
    ↓
Website /auth/callback page:
    - Extracts verification_code from URL
    - Stores in localStorage
    - Redirects to /dashboard
    ↓
Dashboard page:
    - Detects verification_code in localStorage
    - Calls GET /api/user/me (with verification_code)
    - Displays user profile from database
    - User is authenticated
```

---

## 4. Functional Requirements

### 4.1 Backend OAuth Extensions

**Modifications to Existing Endpoints:**

#### 4.1.1 GET /api/auth/start

**Current Behavior (Extension):**
- Generates state with `{"type":"extension","extensionId":"...","nonce":"...","timestamp":...}`
- Returns JSON: `{"authUrl": "..."}`

**New Behavior (Website):**
- Detects if state parameter includes `"type":"web"`
- Generates OAuth URL with website state
- Returns redirect (302) to Pipedrive OAuth URL directly

**Detection Logic:**
```csharp
// Check if state parameter provided in query string
var stateParam = req.Query["state"];

if (!string.IsNullOrEmpty(stateParam))
{
    var state = JsonSerializer.Deserialize<OAuthState>(stateParam);

    if (state.Type == "web")
    {
        // Website flow - redirect directly to Pipedrive
        var authUrl = oauthService.GenerateAuthUrl(stateParam);
        return new RedirectResult(authUrl);
    }
    else
    {
        // Extension flow - return JSON
        var authUrl = oauthService.GenerateAuthUrl(stateParam);
        return new OkObjectResult(new { authUrl });
    }
}
```

**Acceptance Criteria:**
- ✅ Endpoint detects client type from state parameter
- ✅ Extension requests return JSON response (unchanged)
- ✅ Website requests return HTTP 302 redirect to Pipedrive
- ✅ State parameter validation works for both clients

---

#### 4.1.2 GET /api/auth/callback

**Current Behavior (Extension):**
- Validates state
- Exchanges code for tokens
- Creates session with verification_code
- Returns HTML that redirects to `chromiumapp.org` URL (closes popup)

**New Behavior (Website):**
- Same validation and token exchange
- Detects client type from state parameter
- If client type = "web":
  - Calls Pipedrive `/users/me` endpoint
  - Creates/updates User and Company in database
  - Links Session to User (adds user_id to Session table)
  - Redirects to website callback URL with verification_code

**Redirect Logic:**
```csharp
// After successful token exchange and session creation
var state = JsonSerializer.Deserialize<OAuthState>(stateParam);

if (state.Type == "web")
{
    // Fetch user info from Pipedrive
    var userInfo = await pipedriveClient.GetCurrentUserAsync(accessToken, apiDomain);

    // Create/update User and Company
    var user = await userService.CreateOrUpdateUserAsync(userInfo, session.VerificationCode);

    // Update session with user_id
    session.UserId = user.Id;
    await sessionService.UpdateSessionAsync(session);

    // Redirect to website with verification_code
    var websiteCallbackUrl = configuration["WEBSITE_CALLBACK_URL"];
    return new RedirectResult($"{websiteCallbackUrl}?verification_code={session.VerificationCode}");
}
else
{
    // Extension flow - return chromiumapp.org redirect HTML (unchanged)
    return new ContentResult { Content = GenerateExtensionCallbackHtml(session.VerificationCode), ContentType = "text/html" };
}
```

**Acceptance Criteria:**
- ✅ Endpoint detects client type from state parameter
- ✅ Extension flow unchanged (chromiumapp.org redirect)
- ✅ Website flow calls Pipedrive /users/me
- ✅ User and Company created/updated in database
- ✅ Session linked to User via user_id foreign key
- ✅ Website receives redirect with verification_code
- ✅ Error handling for both flows

---

#### 4.1.3 GET /api/user/me

**New Endpoint:**

**Purpose:** Retrieve authenticated user information from database (not Pipedrive)

**Request:**
```http
GET /api/user/me
Authorization: Bearer {verification_code}
```

**Response (200 OK):**
```json
{
  "id": "user-guid",
  "name": "John Doe",
  "email": "john@example.com",
  "pipedriveUserId": 12345,
  "companyDomain": "company.pipedrive.com",
  "companyName": "Acme Corp",
  "createdAt": "2025-11-02T10:00:00Z",
  "lastLoginAt": "2025-11-02T10:00:00Z"
}
```

**Response (401 Unauthorized):**
```json
{
  "error": "Invalid or expired session"
}
```

**Implementation:**
```csharp
[Function("GetCurrentUser")]
public async Task<IActionResult> Run(
    [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "user/me")] HttpRequest req)
{
    // Extract verification_code from Authorization header
    var authHeader = req.Headers["Authorization"].ToString();
    if (!authHeader.StartsWith("Bearer "))
    {
        return new UnauthorizedResult();
    }

    var verificationCode = authHeader.Substring("Bearer ".Length);

    // Retrieve session
    var session = await sessionService.GetSessionAsync(verificationCode);
    if (session == null || session.UserId == null)
    {
        return new UnauthorizedResult();
    }

    // Retrieve user from database
    var user = await userService.GetUserByIdAsync(session.UserId.Value);
    if (user == null)
    {
        return new NotFoundResult();
    }

    // Update last login timestamp
    user.LastLoginAt = DateTime.UtcNow;
    await userService.UpdateUserAsync(user);

    // Return user info
    return new OkObjectResult(new
    {
        id = user.Id,
        name = user.Name,
        email = user.Email,
        pipedriveUserId = user.PipedriveUserId,
        companyDomain = user.Company.CompanyDomain,
        companyName = user.Company.CompanyName,
        createdAt = user.CreatedAt,
        lastLoginAt = user.LastLoginAt
    });
}
```

**Acceptance Criteria:**
- ✅ Endpoint validates verification_code
- ✅ Returns user info from database (not Pipedrive)
- ✅ Returns 401 for invalid/expired sessions
- ✅ Updates lastLoginAt timestamp
- ✅ Includes company information

---

### 4.2 Database Schema Extensions

**Session Table Update:**

Add `UserId` foreign key to link sessions to users:

```sql
ALTER TABLE Sessions
ADD UserId uniqueidentifier NULL,
CONSTRAINT FK_Sessions_Users FOREIGN KEY (UserId) REFERENCES Users(Id);
```

**Why nullable?** Extension sessions created before website implementation won't have UserId. Website sessions will always have UserId populated.

**Migration:**
```csharp
// Add migration: AddUserIdToSessions
public partial class AddUserIdToSessions : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<Guid>(
            name: "UserId",
            table: "Sessions",
            type: "uniqueidentifier",
            nullable: true);

        migrationBuilder.CreateIndex(
            name: "IX_Sessions_UserId",
            table: "Sessions",
            column: "UserId");

        migrationBuilder.AddForeignKey(
            name: "FK_Sessions_Users_UserId",
            table: "Sessions",
            column: "UserId",
            principalTable: "Users",
            principalColumn: "Id",
            onDelete: ReferentialAction.Restrict);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropForeignKey(
            name: "FK_Sessions_Users_UserId",
            table: "Sessions");

        migrationBuilder.DropIndex(
            name: "IX_Sessions_UserId",
            table: "Sessions");

        migrationBuilder.DropColumn(
            name: "UserId",
            table: "Sessions");
    }
}
```

**Updated Session Model:**
```csharp
public class Session
{
    public Guid Id { get; set; }
    public string VerificationCode { get; set; } = default!;
    public string AccessToken { get; set; } = default!;
    public string RefreshToken { get; set; } = default!;
    public string ApiDomain { get; set; } = default!;
    public DateTime ExpiresAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime LastUsedAt { get; set; }
    public string Scope { get; set; } = default!;

    // New: Link to User
    public Guid? UserId { get; set; }
    public User? User { get; set; }
}
```

**Acceptance Criteria:**
- ✅ Migration adds UserId column to Sessions table
- ✅ Foreign key constraint created
- ✅ Index on UserId for query performance
- ✅ Existing sessions remain valid (nullable column)

---

### 4.3 Website Frontend Implementation

#### 4.3.1 Project Structure

```
Website/
├── src/
│   ├── components/
│   │   ├── ui/                    # shadcn/ui components (existing)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   └── ...
│   │   ├── layout/                # NEW - Layout components
│   │   │   ├── Header.tsx
│   │   │   └── Footer.tsx
│   │   └── auth/                  # NEW - Auth components
│   │       ├── SignInButton.tsx
│   │       └── UserProfile.tsx
│   ├── pages/
│   │   ├── HomePage.tsx           # Updated - Landing page
│   │   ├── AuthCallbackPage.tsx  # NEW - OAuth callback handler
│   │   └── DashboardPage.tsx     # NEW - Authenticated dashboard
│   ├── contexts/                  # NEW - React contexts
│   │   └── AuthContext.tsx
│   ├── hooks/                     # NEW - Custom hooks
│   │   └── useAuth.ts
│   ├── services/                  # NEW - API services
│   │   ├── authService.ts
│   │   └── userService.ts
│   ├── types/                     # NEW - TypeScript types
│   │   ├── auth.ts
│   │   └── user.ts
│   ├── config/                    # NEW - Configuration
│   │   └── constants.ts
│   ├── styles/
│   │   └── globals.css           # Existing
│   ├── App.tsx                    # Updated - Add routes
│   └── main.tsx                   # Existing
├── .env.development               # NEW - Dev config
├── .env.production                # NEW - Prod config
└── ...
```

---

#### 4.3.2 Configuration

**File: src/config/constants.ts**

```typescript
export const CONFIG = {
  backendUrl:
    import.meta.env.VITE_BACKEND_URL ||
    'https://func-whatsapp2pipe-prod.azurewebsites.net',
  websiteUrl:
    import.meta.env.VITE_WEBSITE_URL ||
    'https://dashboard.chat2deal.com',
  storage: {
    verificationCodeKey: 'verification_code',
  },
  endpoints: {
    authStart: '/api/auth/start',
    authCallback: '/api/auth/callback',
    userMe: '/api/user/me',
  },
} as const
```

**Environment Files:**

**.env.development:**
```env
VITE_BACKEND_URL=http://localhost:7071
VITE_WEBSITE_URL=http://localhost:5173
```

**.env.production:**
```env
VITE_BACKEND_URL=https://func-whatsapp2pipe-prod.azurewebsites.net
VITE_WEBSITE_URL=https://dashboard.chat2deal.com
```

**Backend Configuration (local.settings.json):**
```json
{
  "Values": {
    "WEBSITE_CALLBACK_URL": "http://localhost:5173/auth/callback"
  }
}
```

**Backend Configuration (Azure App Settings - Production):**
```
WEBSITE_CALLBACK_URL=https://dashboard.chat2deal.com/auth/callback
```

---

#### 4.3.3 TypeScript Types

**File: src/types/auth.ts**

```typescript
export interface OAuthState {
  type: 'web' | 'extension'
  nonce: string
  timestamp: number
}

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'
```

**File: src/types/user.ts**

```typescript
export interface User {
  id: string
  name: string
  email: string
  pipedriveUserId: number
  companyDomain: string
  companyName: string
  createdAt: string
  lastLoginAt: string
}
```

---

#### 4.3.4 Authentication Service

**File: src/services/authService.ts**

```typescript
import { CONFIG } from '../config/constants'
import type { OAuthState } from '../types/auth'

class AuthService {
  /**
   * Initiates OAuth flow by redirecting to backend auth start endpoint
   */
  signIn(): void {
    // Generate OAuth state for website
    const state: OAuthState = {
      type: 'web',
      nonce: this.generateNonce(),
      timestamp: Date.now(),
    }

    // Encode state as JSON
    const stateParam = encodeURIComponent(JSON.stringify(state))

    // Redirect to backend auth start
    // Backend will redirect to Pipedrive OAuth
    window.location.href = `${CONFIG.backendUrl}${CONFIG.endpoints.authStart}?state=${stateParam}`
  }

  /**
   * Handles OAuth callback by extracting and storing verification_code
   */
  handleCallback(verificationCode: string): void {
    localStorage.setItem(
      CONFIG.storage.verificationCodeKey,
      verificationCode
    )
  }

  /**
   * Checks if user is authenticated (has verification_code)
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem(CONFIG.storage.verificationCodeKey)
  }

  /**
   * Gets stored verification_code
   */
  getVerificationCode(): string | null {
    return localStorage.getItem(CONFIG.storage.verificationCodeKey)
  }

  /**
   * Signs out (clears verification_code)
   */
  signOut(): void {
    localStorage.removeItem(CONFIG.storage.verificationCodeKey)
  }

  /**
   * Generates random nonce for CSRF protection
   */
  private generateNonce(): string {
    return Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
  }
}

export const authService = new AuthService()
```

**Acceptance Criteria:**
- ✅ signIn() redirects to backend with web state
- ✅ handleCallback() stores verification_code in localStorage
- ✅ isAuthenticated() checks for verification_code
- ✅ signOut() clears verification_code
- ✅ Nonce generation for CSRF protection

---

#### 4.3.5 User Service

**File: src/services/userService.ts**

```typescript
import { CONFIG } from '../config/constants'
import type { User } from '../types/user'

class UserService {
  /**
   * Fetches current user info from backend
   */
  async getCurrentUser(verificationCode: string): Promise<User> {
    const response = await fetch(
      `${CONFIG.backendUrl}${CONFIG.endpoints.userMe}`,
      {
        headers: {
          Authorization: `Bearer ${verificationCode}`,
        },
      }
    )

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Session expired')
      }
      throw new Error('Failed to fetch user info')
    }

    return response.json()
  }
}

export const userService = new UserService()
```

**Acceptance Criteria:**
- ✅ Calls backend /api/user/me with verification_code
- ✅ Returns User object
- ✅ Throws error for 401 (session expired)
- ✅ Handles network errors

---

#### 4.3.6 Authentication Context

**File: src/contexts/AuthContext.tsx**

```typescript
import React, { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services/authService'
import type { AuthStatus } from '../types/auth'

interface AuthContextValue {
  authStatus: AuthStatus
  verificationCode: string | null
  signOut: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authStatus, setAuthStatus] = useState<AuthStatus>('loading')
  const [verificationCode, setVerificationCode] = useState<string | null>(null)

  // Check authentication status on mount
  useEffect(() => {
    const code = authService.getVerificationCode()
    if (code) {
      setVerificationCode(code)
      setAuthStatus('authenticated')
    } else {
      setAuthStatus('unauthenticated')
    }
  }, [])

  const signOut = () => {
    authService.signOut()
    setVerificationCode(null)
    setAuthStatus('unauthenticated')
  }

  return (
    <AuthContext.Provider value={{ authStatus, verificationCode, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
```

**Acceptance Criteria:**
- ✅ Context provides authStatus, verificationCode, signOut
- ✅ Checks localStorage on mount
- ✅ Sets authenticated/unauthenticated based on verification_code
- ✅ signOut clears state and localStorage
- ✅ Hook enforces provider usage

---

#### 4.3.7 Routing

**File: src/App.tsx**

```typescript
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import HomePage from './pages/HomePage'
import AuthCallbackPage from './pages/AuthCallbackPage'
import DashboardPage from './pages/DashboardPage'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
```

**Acceptance Criteria:**
- ✅ AuthProvider wraps all routes
- ✅ Three routes defined: /, /auth/callback, /dashboard
- ✅ React Router configured correctly

---

#### 4.3.8 Landing Page (/)

**File: src/pages/HomePage.tsx**

```typescript
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { SignInButton } from '../components/auth/SignInButton'
import { Header } from '../components/layout/Header'
import { Footer } from '../components/layout/Footer'

export default function HomePage() {
  const { authStatus } = useAuth()
  const navigate = useNavigate()

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (authStatus === 'authenticated') {
      navigate('/dashboard')
    }
  }, [authStatus, navigate])

  // Show loading while checking auth status
  if (authStatus === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-md w-full px-6 py-12 text-center">
          {/* Logo/Branding */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Chat2Deal
            </h1>
            <p className="text-lg text-gray-600">
              Sync WhatsApp contacts with Pipedrive
            </p>
          </div>

          {/* Sign In Button */}
          <SignInButton />
        </div>
      </main>

      <Footer />
    </div>
  )
}
```

**Acceptance Criteria:**
- ✅ Shows loading state while checking auth
- ✅ Redirects authenticated users to dashboard
- ✅ Shows sign-in button for unauthenticated users
- ✅ Clean, minimal design

---

#### 4.3.9 Sign In Button Component

**File: src/components/auth/SignInButton.tsx**

```typescript
import { Button } from '../ui/button'
import { authService } from '../../services/authService'

export function SignInButton() {
  const handleSignIn = () => {
    authService.signIn()
  }

  return (
    <Button
      onClick={handleSignIn}
      size="lg"
      className="w-full bg-[#1483EB] hover:bg-[#0d6fd1] text-white"
    >
      Sign in with Pipedrive
    </Button>
  )
}
```

**Acceptance Criteria:**
- ✅ Calls authService.signIn() on click
- ✅ Uses Pipedrive brand color (#1483EB)
- ✅ Full-width button
- ✅ Uses shadcn/ui Button component

---

#### 4.3.10 Auth Callback Page (/auth/callback)

**File: src/pages/AuthCallbackPage.tsx**

```typescript
import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { authService } from '../services/authService'

export default function AuthCallbackPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Extract verification_code from URL
    const verificationCode = searchParams.get('verification_code')
    const errorParam = searchParams.get('error')

    if (errorParam) {
      // OAuth error (user denied, etc.)
      setError(getErrorMessage(errorParam))
      setTimeout(() => navigate('/'), 3000)
      return
    }

    if (!verificationCode) {
      setError('No verification code received')
      setTimeout(() => navigate('/'), 3000)
      return
    }

    // Store verification_code and redirect to dashboard
    authService.handleCallback(verificationCode)
    navigate('/dashboard')
  }, [searchParams, navigate])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-red-600 mb-2">
            Authentication Failed
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">
            Redirecting to home page...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900">
          Completing sign in...
        </h2>
      </div>
    </div>
  )
}

function getErrorMessage(error: string): string {
  switch (error) {
    case 'user_denied':
      return 'You cancelled the sign-in process'
    case 'invalid_state':
      return 'Invalid authentication state'
    case 'auth_failed':
      return 'Authentication failed. Please try again.'
    default:
      return 'An error occurred during authentication'
  }
}
```

**Acceptance Criteria:**
- ✅ Extracts verification_code from URL query params
- ✅ Stores verification_code via authService
- ✅ Redirects to dashboard on success
- ✅ Handles error parameter from backend
- ✅ Shows user-friendly error messages
- ✅ Auto-redirects to home on error
- ✅ Shows loading spinner during processing

---

#### 4.3.11 Dashboard Page (/dashboard)

**File: src/pages/DashboardPage.tsx**

```typescript
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { userService } from '../services/userService'
import { Header } from '../components/layout/Header'
import { UserProfile } from '../components/auth/UserProfile'
import type { User } from '../types/user'

export default function DashboardPage() {
  const { authStatus, verificationCode, signOut } = useAuth()
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Redirect unauthenticated users to home
  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      navigate('/')
    }
  }, [authStatus, navigate])

  // Fetch user info
  useEffect(() => {
    if (authStatus === 'authenticated' && verificationCode) {
      fetchUser()
    }
  }, [authStatus, verificationCode])

  const fetchUser = async () => {
    try {
      setLoading(true)
      setError(null)
      const userData = await userService.getCurrentUser(verificationCode!)
      setUser(userData)
    } catch (err) {
      if (err instanceof Error && err.message === 'Session expired') {
        // Session expired - sign out and redirect
        signOut()
        navigate('/')
      } else {
        setError('Failed to load user information')
      }
    } finally {
      setLoading(false)
    }
  }

  if (authStatus === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-red-600 mb-2">
              Error
            </h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchUser}
              className="text-blue-600 hover:underline"
            >
              Try again
            </button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Dashboard
        </h1>

        {user && <UserProfile user={user} onSignOut={signOut} />}
      </main>
    </div>
  )
}
```

**Acceptance Criteria:**
- ✅ Redirects unauthenticated users to home
- ✅ Fetches user info from backend on mount
- ✅ Handles session expiration (401 error)
- ✅ Shows loading state while fetching
- ✅ Shows error with retry button
- ✅ Displays user profile on success

---

#### 4.3.12 User Profile Component

**File: src/components/auth/UserProfile.tsx**

```typescript
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import type { User } from '../../types/user'

interface UserProfileProps {
  user: User
  onSignOut: () => void
}

export function UserProfile({ user, onSignOut }: UserProfileProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-500">Name</label>
          <p className="text-base text-gray-900">{user.name}</p>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-500">Email</label>
          <p className="text-base text-gray-900">{user.email}</p>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-500">
            Pipedrive Company
          </label>
          <p className="text-base text-gray-900">{user.companyName}</p>
          <p className="text-sm text-gray-500">{user.companyDomain}</p>
        </div>

        <div className="pt-4 border-t">
          <Button
            onClick={onSignOut}
            variant="outline"
            className="w-full"
          >
            Sign Out
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
```

**Acceptance Criteria:**
- ✅ Displays user name, email, company info
- ✅ Shows sign-out button
- ✅ Uses shadcn/ui Card component
- ✅ Clean, readable layout

---

#### 4.3.13 Layout Components

**File: src/components/layout/Header.tsx**

```typescript
export function Header() {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <h1 className="text-xl font-semibold text-gray-900">
          Chat2Deal
        </h1>
      </div>
    </header>
  )
}
```

**File: src/components/layout/Footer.tsx**

```typescript
export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 py-6">
      <div className="container mx-auto px-4 text-center text-sm text-gray-600">
        <p>&copy; {new Date().getFullYear()} Chat2Deal. All rights reserved.</p>
      </div>
    </footer>
  )
}
```

**Acceptance Criteria:**
- ✅ Header shows app branding
- ✅ Footer shows copyright
- ✅ Consistent styling with overall design

---

## 5. Error Handling

### 5.1 Error Scenarios

| Error Scenario | Detection | User Message | Action |
|----------------|-----------|--------------|--------|
| User clicks "Cancel" on Pipedrive | `error=user_denied` in callback URL | "You cancelled the sign-in process" | Redirect to home after 3s |
| Invalid state parameter (CSRF) | Backend validation fails | "Invalid authentication state" | Redirect to home after 3s |
| Authorization code expired | Backend token exchange fails | "Authentication failed. Please try again." | Redirect to home after 3s |
| No verification_code in callback | Missing query param | "No verification code received" | Redirect to home after 3s |
| Session expired (401 on /api/user/me) | API returns 401 | "Session expired" | Sign out, redirect to home |
| Network error during fetch | Fetch throws error | "Failed to load user information" | Show retry button |
| Backend unreachable | Fetch timeout/failure | "Could not connect to server" | Show retry button |

### 5.2 Error Logging

**Frontend:**
- Log errors to browser console
- Future: Integrate with error tracking service (e.g., Sentry)

**Backend:**
- Log all OAuth errors to Application Insights
- Include client type (web/extension) in logs
- Never log tokens or sensitive data

---

## 6. Security Considerations

### 6.1 OAuth Security

**CSRF Protection:**
- State parameter includes nonce and timestamp
- Backend validates state before token exchange
- State is one-time use only

**Token Storage:**
- OAuth tokens (access_token, refresh_token) stored in backend database only
- Website never receives or stores actual tokens
- Only session identifier (verification_code) stored in browser

**Session Security:**
- verification_code is unpredictable GUID (128-bit entropy)
- Sessions expire after 60 days of inactivity
- HTTPS enforced on all endpoints

### 6.2 Web Security

**XSS Protection:**
- React automatically escapes user input
- No dangerouslySetInnerHTML usage
- CSP headers configured on Azure Static Web Apps

**localStorage Security:**
- Only verification_code stored (not tokens)
- verification_code is useless without backend session
- No sensitive user data in localStorage

**API Security:**
- All backend endpoints validate verification_code
- CORS configured to allow only website and extension origins
- Rate limiting (future consideration)

---

## 7. Testing Strategy

### 7.1 Backend Testing

**Unit Tests (C#):**
- ✅ State parameter parsing (web vs extension)
- ✅ Client type detection logic
- ✅ User/Company creation from Pipedrive data
- ✅ Session linking to User (UserId foreign key)
- ✅ GET /api/user/me authentication and response

**Integration Tests:**
- ✅ Full OAuth flow with website state parameter
- ✅ Backend redirects to website callback URL
- ✅ User info fetched and stored correctly
- ✅ GET /api/user/me returns correct user data

### 7.2 Frontend Testing

**Unit Tests (Vitest):**
- ✅ authService.signIn() redirects correctly
- ✅ authService.handleCallback() stores verification_code
- ✅ authService.isAuthenticated() checks localStorage
- ✅ userService.getCurrentUser() calls API correctly
- ✅ AuthContext provides correct state

**Component Tests (React Testing Library):**
- ✅ HomePage redirects authenticated users to dashboard
- ✅ AuthCallbackPage handles verification_code correctly
- ✅ AuthCallbackPage handles errors correctly
- ✅ DashboardPage fetches and displays user info
- ✅ DashboardPage handles session expiration
- ✅ SignInButton triggers OAuth flow

**E2E Tests (Playwright):**
- ✅ Full OAuth flow from landing page to dashboard
- ✅ Sign in → redirect to Pipedrive → authorize → land on dashboard
- ✅ Dashboard displays correct user info
- ✅ Sign out clears session and redirects to home
- ✅ Session persists across page refresh

### 7.3 Manual Testing Checklist

**Happy Path:**
- [ ] Visit website (/) while unauthenticated → See landing page
- [ ] Click "Sign in with Pipedrive" → Redirect to Pipedrive OAuth
- [ ] Authorize on Pipedrive → Redirect to /auth/callback
- [ ] Automatically redirect to /dashboard
- [ ] Dashboard shows correct user info (name, email, company)
- [ ] Refresh page → Still authenticated
- [ ] Close browser, reopen → Still authenticated

**Error Paths:**
- [ ] Click "Cancel" on Pipedrive → Error message → Redirect to home
- [ ] Invalid verification_code in URL → Error → Redirect to home
- [ ] Session expired (delete from DB) → 401 error → Sign out → Home
- [ ] Network offline → Error with retry button

**Edge Cases:**
- [ ] Visit /dashboard while unauthenticated → Redirect to home
- [ ] Visit / while authenticated → Redirect to dashboard
- [ ] Multiple tabs open → Auth state consistent
- [ ] Sign out from one tab → All tabs redirect to home

---

## 8. Deployment

### 8.1 Backend Deployment

**Azure Function App Settings (New):**
```
WEBSITE_CALLBACK_URL=https://dashboard.chat2deal.com/auth/callback
```

**Database Migration:**
```bash
cd Backend/WhatsApp2Pipe.Api
dotnet ef migrations add AddUserIdToSessions
dotnet ef database update
```

**Deploy Backend:**
- Deploy updated Azure Functions code
- Run database migration
- Verify WEBSITE_CALLBACK_URL configured

### 8.2 Frontend Deployment

**Build Website:**
```bash
cd Website
npm install
npm run build
```

**Deploy to Azure Static Web Apps:**
- Upload `Website/dist/` to Azure Static Web Apps
- Configure custom domain (dashboard.chat2deal.com)
- Verify SSL certificate
- Test OAuth flow end-to-end

**CORS Configuration:**

Ensure Azure Functions CORS allows website origin:
```
https://dashboard.chat2deal.com
https://yourwebsite.azurestaticapps.net
http://localhost:5173 (dev only)
```

---

## 9. Acceptance Criteria

### 9.1 Backend Requirements

- ✅ /api/auth/start detects client type from state parameter
- ✅ Extension flow unchanged (returns JSON)
- ✅ Website flow returns HTTP 302 redirect to Pipedrive
- ✅ /api/auth/callback detects client type from state parameter
- ✅ Website flow calls Pipedrive /users/me
- ✅ User and Company created/updated in database
- ✅ Session linked to User via UserId foreign key
- ✅ Backend redirects to WEBSITE_CALLBACK_URL with verification_code
- ✅ GET /api/user/me validates verification_code
- ✅ GET /api/user/me returns user info from database
- ✅ Database migration adds UserId to Sessions table

### 9.2 Frontend Requirements

- ✅ Landing page shows sign-in button for unauthenticated users
- ✅ Landing page redirects authenticated users to dashboard
- ✅ Sign-in button redirects to backend OAuth flow
- ✅ Callback page extracts verification_code from URL
- ✅ Callback page stores verification_code in localStorage
- ✅ Callback page redirects to dashboard
- ✅ Dashboard redirects unauthenticated users to home
- ✅ Dashboard fetches user info from backend
- ✅ Dashboard displays user profile (name, email, company)
- ✅ Dashboard shows sign-out button
- ✅ Sign-out clears verification_code and redirects to home
- ✅ Authentication persists across page refresh
- ✅ Session expiration handled gracefully (sign out)

### 9.3 Testing Requirements

- ✅ Unit tests pass with >80% coverage
- ✅ Integration tests pass for full OAuth flow
- ✅ E2E tests pass for happy path
- ✅ Manual testing checklist completed
- ✅ No console errors during OAuth flow

---

## 10. Out of Scope (Future Enhancements)

The following are explicitly **not** part of this specification:

- ❌ Account settings page
- ❌ User preferences management
- ❌ Billing and subscription management
- ❌ Usage analytics dashboard
- ❌ Chrome extension status display on website
- ❌ Multi-factor authentication
- ❌ Password recovery (OAuth only)
- ❌ Admin features
- ❌ Team/organization management
- ❌ API rate limiting
- ❌ Advanced error tracking (Sentry)
- ❌ Performance monitoring
- ❌ CI/CD pipeline

---

## 11. Dependencies

### 11.1 External Dependencies

**Backend:**
- ✅ Spec-105a implemented and deployed
- ✅ Spec-116 implemented (User/Company tracking)
- ✅ Azure Functions deployed
- ✅ Azure SQL Database running
- ✅ Pipedrive Developer Hub app registered
- ✅ WEBSITE_CALLBACK_URL configured in App Settings

**Frontend:**
- ✅ Azure Static Web Apps provisioned
- ✅ Custom domain configured (optional)
- ✅ SSL certificate provisioned

### 11.2 NPM Packages (Website)

**No new packages required beyond existing:**
- React 18 (existing)
- React Router v6 (existing)
- TypeScript (existing)
- Vite (existing)
- Tailwind CSS v3 (existing)
- shadcn/ui components (existing)
- Vitest (existing)
- React Testing Library (existing)
- Playwright (existing)

---

## 12. Implementation Checklist

### Phase 1: Backend Extensions
- [ ] Add UserId column to Sessions table (migration)
- [ ] Update Session model with UserId and User navigation property
- [ ] Modify /api/auth/start to detect client type from state
- [ ] Modify /api/auth/callback to detect client type and redirect accordingly
- [ ] Implement Pipedrive /users/me call in callback for website flow
- [ ] Implement User/Company creation in callback
- [ ] Link Session to User (populate UserId)
- [ ] Implement GET /api/user/me endpoint
- [ ] Add WEBSITE_CALLBACK_URL configuration
- [ ] Write unit tests for new logic
- [ ] Write integration tests for website OAuth flow
- [ ] Deploy to Azure
- [ ] Test with Postman/curl

### Phase 2: Frontend Implementation
- [ ] Create project structure (folders, files)
- [ ] Configure environment variables (.env files)
- [ ] Implement TypeScript types (auth.ts, user.ts)
- [ ] Implement authService
- [ ] Implement userService
- [ ] Implement AuthContext and useAuth hook
- [ ] Create Header and Footer components
- [ ] Create SignInButton component
- [ ] Create UserProfile component
- [ ] Implement HomePage
- [ ] Implement AuthCallbackPage
- [ ] Implement DashboardPage
- [ ] Update App.tsx with routes
- [ ] Write unit tests
- [ ] Write component tests
- [ ] Build and test locally

### Phase 3: E2E Testing & Deployment
- [ ] Write Playwright E2E tests
- [ ] Deploy backend to Azure
- [ ] Run database migration
- [ ] Build frontend for production
- [ ] Deploy frontend to Azure Static Web Apps
- [ ] Configure CORS on Azure Functions
- [ ] Test full OAuth flow end-to-end
- [ ] Complete manual testing checklist
- [ ] Verify session persistence
- [ ] Verify sign-out functionality
- [ ] Load test (optional)

---

## 13. Timeline Estimate

**Backend Extensions:** 2-3 days
- Database migration: 0.5 day
- Endpoint modifications: 1 day
- /api/user/me endpoint: 0.5 day
- Testing: 1 day

**Frontend Implementation:** 3-4 days
- Project structure and config: 0.5 day
- Services and contexts: 1 day
- Page components: 1.5 days
- Testing: 1 day

**E2E Testing & Deployment:** 1-2 days
- E2E tests: 0.5 day
- Deployment: 0.5 day
- Manual testing: 1 day

**Total:** 6-9 days (1-2 weeks)

---

## 14. Success Metrics

**Post-Launch Metrics (Future):**
- Website OAuth success rate > 95%
- Average time to sign in < 10 seconds
- Session persistence rate > 90%
- Zero security incidents
- User satisfaction with sign-in experience

---

## 15. References

- [Website Architecture](../Architecture/Website-Architecture.md)
- [Spec-105a: Backend OAuth Service](Spec-105a-Backend-OAuth-Service.md)
- [Spec-116: User Entity Tracking](Spec-116-User-Entity-Tracking.md)
- [Pipedrive OAuth Documentation](../External/Pipedrive/docs/marketplace-oauth-authorization.md)
- [React Router Documentation](https://reactrouter.com/)
- [Azure Static Web Apps Documentation](https://learn.microsoft.com/en-us/azure/static-web-apps/)
- [OAuth 2.0 RFC 6749](https://tools.ietf.org/html/rfc6749)

---

**Status:** Draft - Ready for review
**Owner:** Full-stack team
**Estimated Effort:** 1-2 weeks
