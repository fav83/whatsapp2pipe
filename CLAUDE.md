# Project Documentation

## Project Structure

This project uses a structured organization:
- **Extension/** - All Chrome extension source code, build configurations, and dependencies
- **Website/** - User dashboard web application (React + TypeScript)
- **Landing/** - Marketing landing page with SEO optimization (React + TypeScript)
- **Backend/** - Azure Functions-based OAuth and Pipedrive API backend service (.NET 8)
- **Docs/** - All project documentation (architecture, BRDs, plans, specs)
- **Resources/** - Design assets, UI resources, and demo materials

**IMPORTANT:** All extension source code must be located under the `Extension/` folder. This includes:
- Source files (src/)
- Build configurations (vite.config.ts, tsconfig.json, etc.)
- Dependencies (package.json, node_modules/)
- Tests (tests/)
- Environment files (.env.*)
- Build output (dist/)

## Documentation Structure

All project documents are located in the [Docs/](Docs/) folder, organized as follows:

### Brand & Design
- [Brand-Guide.md](Docs/Brand-Guide.md) - Complete brand guidelines including colors, typography, voice, tone, and visual style for Chat2Deal

### Architecture
- [Chrome-Extension-Architecture.md](Docs/Architecture/Chrome-Extension-Architecture.md) - Technical architecture and component design
- [Website-Architecture.md](Docs/Architecture/Website-Architecture.md) - User dashboard web application architecture (✅ Complete)
- [Landing-SEO-Architecture.md](Docs/Architecture/Landing-SEO-Architecture.md) - Landing page SEO system architecture (✅ Complete)
- [UI-Design-Specification.md](Docs/Architecture/UI-Design-Specification.md) - Complete UI design specification with visual system, components, and states (✅ Complete)

### BRDs (Business Requirements Documents)
- [BRD-001-MVP-Pipedrive-WhatsApp.md](Docs/BRDs/BRD-001-MVP-Pipedrive-WhatsApp.md) - MVP requirements and specifications

### Plans
- [Plan-001-MVP-Feature-Breakdown.md](Docs/Plans/Plan-001-MVP-Feature-Breakdown.md) - MVP broken down into implementable features

### Specs
- [Spec-101-Project-Foundation-Build-Setup.md](Docs/Specs/Spec-101-Project-Foundation-Build-Setup.md) - Project foundation and build setup specification
- [Spec-102-Chrome-Extension-Manifest-Basic-Structure.md](Docs/Specs/Spec-102-Chrome-Extension-Manifest-Basic-Structure.md) - Chrome extension manifest and basic structure
- [Spec-103-WhatsApp-Sidebar-Injection.md](Docs/Specs/Spec-103-WhatsApp-Sidebar-Injection.md) - WhatsApp Web sidebar injection with UI states (✅ Complete)
- [Spec-103-Implementation-Summary.md](Docs/Specs/Spec-103-Implementation-Summary.md) - Complete implementation summary and manual testing checklist
- [Spec-105a-Backend-OAuth-Service.md](Docs/Specs/Spec-105a-Backend-OAuth-Service.md) - Backend OAuth Service for Pipedrive authentication (✅ Complete)
- [Spec-105b-Extension-OAuth-Integration.md](Docs/Specs/Spec-105b-Extension-OAuth-Integration.md) - Extension OAuth integration with hybrid architecture (✅ Complete)
- [Spec-106a-Backend-Pipedrive-API-Service.md](Docs/Specs/Spec-106a-Backend-Pipedrive-API-Service.md) - Backend Pipedrive API Service (✅ Complete)
- [Spec-106b-Extension-Pipedrive-API-Integration.md](Docs/Specs/Spec-106b-Extension-Pipedrive-API-Integration.md) - Extension Pipedrive API Integration (✅ Complete)
- [Spec-106b-Implementation-Summary.md](Docs/Specs/Spec-106b-Implementation-Summary.md) - Complete implementation summary and testing results
- [Spec-109-Person-Auto-Lookup-Flow.md](Docs/Specs/Spec-109-Person-Auto-Lookup-Flow.md) - Person auto-lookup flow with UI states (✅ Complete)
- [Spec-110-Create-Person-Flow.md](Docs/Specs/Spec-110-Create-Person-Flow.md) - Create person flow with validation and error handling (✅ Complete)
- [Spec-111-Attach-Number-To-Existing-Person-Flow.md](Docs/Specs/Spec-111-Attach-Number-To-Existing-Person-Flow.md) - Attach number to existing person flow (✅ Complete)
- [Spec-112-UI-States-Error-Handling.md](Docs/Specs/Spec-112-UI-States-Error-Handling.md) - UI states and error handling with error boundaries (✅ Complete)
- [Spec-116-User-Entity-Tracking.md](Docs/Specs/Spec-116-User-Entity-Tracking.md) - User entity tracking with EF Core and Azure SQL (✅ Complete)
- [Spec-116-Implementation-Summary.md](Docs/Specs/Spec-116-Implementation-Summary.md) - Complete implementation summary and configuration details
- [Spec-117-User-Avatar-Dropdown.md](Docs/Specs/Spec-117-User-Avatar-Dropdown.md) - User avatar with profile dropdown (✅ Complete)
- [Spec-118-Module-Raid-Loading-Overlay.md](Docs/Specs/Spec-118-Module-Raid-Loading-Overlay.md) - Module raid loading overlay with Sentry error reporting (✅ Complete)
- [Spec-119-Website-Pipedrive-Auth.md](Docs/Specs/Spec-119-Website-Pipedrive-Auth.md) - Website OAuth implementation and user dashboard (✅ Complete - Open to All Pipedrive Users)
- [Spec-120a-Website-Invite-System.md](Docs/Specs/Spec-120a-Website-Invite-System.md) - Website closed beta invite system (⚠️ SUPERSEDED - Not Implemented, Open Access Instead)
- [Spec-120b-Extension-Beta-Access.md](Docs/Specs/Spec-120b-Extension-Beta-Access.md) - Extension beta access control (⚠️ PARTIALLY SUPERSEDED - Backend Allows Open Access, Extension UI Not Implemented)
- [Spec-123-Landing-Legal-Pages.md](Docs/Specs/Spec-123-Landing-Legal-Pages.md) - Landing page legal pages with SEO system (✅ Complete)
- [Spec-123-Implementation-Summary.md](Docs/Specs/Spec-123-Implementation-Summary.md) - Complete implementation summary with SEO enhancements
- [Spec-127-Comprehensive-Backend-Logging.md](Docs/Specs/Spec-127-Comprehensive-Backend-Logging.md) - Comprehensive backend logging with HTTP response tracking (✅ Complete)

### External Documentation
- [Pipedrive/](Docs/External/Pipedrive/) - Pipedrive API documentation and development resources

## Development Commands

All commands must be run from the `Extension/` directory:

```bash
cd Extension
```

### Setup
```bash
# Install dependencies
npm install

# First-time setup: copy environment template
cp .env.development .env.local
```

### Build Commands
```bash
# Production build (creates Extension/dist/)
npm run build

# Development build with watch mode
npm run dev
```

### Testing Commands
```bash
# Run unit tests (Vitest)
npm test

# Run unit tests in watch mode
npm run test -- --watch

# Run E2E tests (Playwright)
npm run test:e2e

# Run E2E tests in UI mode
npm run test:e2e -- --ui
```

### Code Quality Commands
```bash
# Lint code
npm run lint

# Format code with Prettier
npm run format

# Type check without emitting files
npm run type-check
```

### Loading the Extension in Chrome

1. Build the extension: `npm run build`
2. Open Chrome and navigate to `chrome://extensions`
3. Enable "Developer mode" (toggle in top-right)
4. Click "Load unpacked"
5. Select the `Extension/dist/` folder
6. The extension should now appear in your extensions list

### Development Workflow

1. Make code changes in `Extension/src/`
2. Run `npm run build` to rebuild
3. Go to `chrome://extensions` and click the reload icon on your extension
4. Test changes on https://web.whatsapp.com

For faster development, use `npm run dev` which watches for changes and rebuilds automatically.

## Build System Notes

### Vite Configuration for Chrome Extensions

The build system uses Vite with Chrome extension-specific configurations:

**Asset Loading Configuration:**
- **`base: './'`** in vite.config.ts - CRITICAL for Chrome extensions
- Vite defaults to absolute paths (`/assets/...`) which fail in extension context
- Relative paths (`./assets/...`) ensure proper CSS/JS loading
- Without this setting, assets will fail to load with CORS or path resolution errors

### Chrome Extension Module Bundling

The build system uses separate Vite configurations to solve Chrome Manifest V3 ES module compatibility issues:

**Problem:** Chrome content scripts don't support ES modules, but Vite creates code-split chunks with import/export statements.

**Solution:** The build system uses three separate Vite configurations:
- **vite.content.config.ts** - Builds content-script.js with `inlineDynamicImports: true`
- **vite.inspector.config.ts** - Builds inspector-main.js with `inlineDynamicImports: true`
- **vite.config.ts** - Builds service worker and popup, separates source maps

**Build Command:**
```bash
npm run build
# Executes three sequential builds:
# 1. vite build --config vite.content.config.ts --mode production
# 2. vite build --config vite.inspector.config.ts --mode production
# 3. vite build --mode production
```

**Result:**
- content-script.js: Single file bundle (~142KB) with no import/export statements
- inspector-main.js: Single file bundle with no import/export statements
- Accurate source maps for each entry point (moved to `sourcemaps/` directory)
- Works in Chrome without "Cannot use import statement outside a module" errors

**Documentation:** See [Chrome-Extension-Architecture.md](Docs/Architecture/Chrome-Extension-Architecture.md#81-vite-configuration) for complete technical details.

### Source Map Separation for Security

The build system includes a custom Vite plugin (`separate-sourcemaps`) that ensures source maps are never accidentally shipped to users:

**Problem:** Source maps expose original TypeScript source code and should never be included in production builds distributed to users.

**Solution:** The `separate-sourcemaps` plugin automatically:
- Runs after all other build plugins complete
- Recursively finds all `.map` files in the `dist/` directory
- Moves them to a separate `sourcemaps/` directory with flattened names
- Ensures `dist/` contains ONLY production code, ready to ship

**Directory Structure After Build:**
```
Extension/
  dist/              ← Production code ONLY (safe to ship)
    *.js, *.css, *.html, manifest.json
  sourcemaps/        ← Source maps ONLY (for Sentry upload)
    *.js.map, *.css.map
  release/           ← Created by npm run package
  chat2deal-vX.X.X.zip ← Distribution package
```

**Security Benefit:** Even if you accidentally package `dist/` directly instead of using `npm run package`, it contains NO source maps!

**Sentry Integration:** Source maps are uploaded separately to Sentry via `npm run upload-sourcemaps`, which reads from the `sourcemaps/` directory.

**Documentation:** See [DEPLOYMENT.md](Extension/DEPLOYMENT.md) for complete deployment workflow.

### Environment Variables

**Extension Environment Variables:**

**.env.development:**
```
VITE_BACKEND_URL=http://localhost:7071
VITE_LANDING_WEBSITE_URL=http://localhost:3000
```

**.env.production:**
```
VITE_BACKEND_URL=https://api.chat2deal.com
VITE_LANDING_WEBSITE_URL=https://chat2deal.com
```

**Key Variables:**
- `VITE_BACKEND_URL` - Backend OAuth and API service URL
- `VITE_LANDING_WEBSITE_URL` - Landing website URL for authentication and beta access redirects
- `VITE_SENTRY_ENABLED` - Enable/disable Sentry error tracking
- `VITE_ENV` - Environment (development/production)
- `VITE_SHOW_DEV_INDICATOR` - Show dev mode indicator banner

### Sentry Error Tracking

The extension uses Sentry for error tracking and performance monitoring with PII filtering.

**Setup:**
- Sentry enabled in production (`VITE_SENTRY_ENABLED=true`)
- Disabled in development by default
- PII filtering removes phone numbers, names, and tokens from error reports

**Source Maps and Debug IDs:**
- Debug IDs are injected during `npm run upload-sourcemaps` (not during build)
- **CRITICAL:** After uploading source maps, you MUST reload the extension in Chrome
- Without reload, old code runs without Debug IDs, causing "Missing source file with a matching Debug ID" errors

**Workflow:**
1. Build: `npm run build`
2. Upload: `npm run upload-sourcemaps` (injects Debug IDs and uploads to Sentry)
3. Reload: Open `chrome://extensions` and click Reload button
4. Test: Hard-refresh WhatsApp Web and reproduce errors

**Dev Mode Components:**
- `<DevModeIndicator />` - Shows dev mode banner with Sentry test button (only in development)
- `<SentryTest />` - Test component for verifying Sentry integration (only in development)
- Both components are automatically hidden in production builds

**Documentation:** See [DEPLOYMENT.md](Extension/DEPLOYMENT.md#debug-ids-and-reload-workflow) for complete Sentry workflow.

## Logging Strategy

The project uses a comprehensive logging approach with clear separation between development and production environments.

### Extension Logging

**IMPORTANT:** Always use the provided logging utilities instead of direct `console.log()` calls.

#### Development Logging (`Extension/src/utils/logger.ts`)

For development-only console output (automatically disabled in production):

```typescript
import * as logger from '@/utils/logger'

// General information logging
logger.log('User clicked button', { userId: 123 })

// Warnings
logger.warn('API response took longer than expected')

// Debug information
logger.debug('Component state:', componentState)

// Grouped logging for related messages
logger.group('API Request Details')
logger.log('URL:', apiUrl)
logger.log('Headers:', headers)
logger.groupEnd()

// Table logging for structured data
logger.table(userData)
```

**Key Features:**
- All methods are no-ops in production (zero runtime overhead)
- Supports all console methods: `log`, `warn`, `error`, `debug`, `info`, `group`, `groupEnd`, `table`
- Use for debugging, development tracing, and local troubleshooting
- Automatically stripped from production builds

#### Error Logging (`Extension/src/utils/errorLogger.ts`)

For errors that should be tracked in production with Sentry integration:

```typescript
import { logError } from '@/utils/errorLogger'
import * as Sentry from '@sentry/browser'

try {
  await riskyOperation()
} catch (error) {
  logError(
    'Failed to create person',           // Context description
    error,                                 // Error object
    {                                      // Additional context (optional)
      userId: user.id,
      statusCode: response.status
    },
    Sentry.getCurrentScope()              // Sentry scope (optional)
  )
}
```

**Key Features:**
- **Format**: `[chat2deal-pipe][timestamp][version] context: errorMessage`
- **Development**: Logs to console with full error details
- **Production**: Only logs to Sentry (no console output)
- **Sentry Integration**: Automatically captures errors with structured context
- **Smart Filtering**: Skips expected errors (404, validation, user cancellations)
- **Isolated Scopes**: Each error uses cloned Sentry scope to prevent conflicts

**When to Use:**
- API failures that users encounter
- Unexpected errors that break functionality
- Integration failures (Pipedrive API, authentication)
- Data processing errors

**When NOT to Use:**
- Expected errors (404 not found, validation failures)
- User-initiated cancellations
- Development debugging (use `logger.ts` instead)

### Backend Logging

**IMPORTANT:** Backend logging is always enabled in all environments with no sampling.

#### HTTP Request/Response Logging

All HTTP traffic is automatically logged via `HttpRequestLogger` service:

```csharp
[Function("MyFunction")]
public async Task<HttpResponseData> Run(
    [HttpTrigger] HttpRequestData req,
    HttpRequestLogger httpRequestLogger)
{
    // Log incoming request (automatic via middleware)
    await httpRequestLogger.LogRequestAsync(req);

    // ... function logic ...

    // Log outgoing response (required in each function)
    var response = req.CreateResponse(HttpStatusCode.OK);
    httpRequestLogger.LogResponse("MyFunction", 200);
    return response;
}
```

**Response Logging Overloads:**

```csharp
// Simple status code only
httpRequestLogger.LogResponse("MyFunction", 200);

// With JSON object body
httpRequestLogger.LogResponse("MyFunction", 200, responseData);

// With pre-serialized string body
httpRequestLogger.LogResponse("MyFunction", 200, jsonString);

// With full details (headers + body)
httpRequestLogger.LogResponse("MyFunction", 200, headers, responseData);
```

**What's Logged:**
- **Requests** → Application Insights `customEvents` table
  - Method, URL, headers (JSON), body, timestamp, correlation ID
- **Responses** → Application Insights `traces` table
  - Function name, status code, headers (optional), body, correlation ID
- **Pipedrive API** → Application Insights `traces` table
  - All API requests/responses with full details

#### Configuration

**Backend/WhatsApp2Pipe.Api/host.json:**
```json
{
  "logging": {
    "applicationInsights": {
      "samplingSettings": {
        "isEnabled": false  // ⚠️ CRITICAL: Disabled for complete log capture
      }
    },
    "logLevel": {
      "WhatsApp2Pipe.Api": "Information",
      "WhatsApp2Pipe.Api.Functions": "Information",
      "WhatsApp2Pipe.Api.Services": "Information"
    }
  }
}
```

**Backend/WhatsApp2Pipe.Api/Program.cs:**
```csharp
// Configure logging to ensure all ILogger output reaches Application Insights
services.Configure<LoggerFilterOptions>(options =>
{
    // Remove default filter that might suppress logs
    var defaultRule = options.Rules.FirstOrDefault(rule =>
        rule.ProviderName == "Microsoft.Extensions.Logging.ApplicationInsights.ApplicationInsightsLoggerProvider");
    if (defaultRule != null)
    {
        options.Rules.Remove(defaultRule);
    }
});
```

#### Querying Logs in Application Insights

**View all HTTP responses:**
```kql
traces
| where message startswith "[HTTP Response]"
| project
    timestamp,
    operation_Id,
    FunctionName = customDimensions.FunctionName,
    StatusCode = customDimensions.StatusCode,
    Body = customDimensions.Body
| order by timestamp desc
```

**View all Pipedrive API calls:**
```kql
traces
| where message contains "Pipedrive API"
| project
    timestamp,
    operation_Id,
    Method = customDimensions.Method,
    Url = customDimensions.Url,
    StatusCode = customDimensions.StatusCode
| order by timestamp desc
```

**Correlate request → response:**
```kql
let operationId = "<operation-id>";
union
    (customEvents | where name == "HttpRequest" and operation_Id == operationId),
    (traces | where message startswith "[HTTP Response]" and operation_Id == operationId)
| project timestamp, type = itemType, details = customDimensions
| order by timestamp asc
```

### Logging Best Practices

1. **Extension Development:**
   - Use `logger.*` for all development debugging
   - Use `logError()` only for production-critical errors
   - Never use `console.log()` directly

2. **Extension Production:**
   - All `logger.*` calls are no-ops (zero overhead)
   - Only critical errors reach Sentry via `logError()`
   - PII is filtered before sending to Sentry

3. **Backend:**
   - Always call `httpRequestLogger.LogResponse()` before returning responses
   - Use appropriate overload based on response type
   - Logging failures are caught and don't impact function execution

4. **Error Context:**
   - Provide clear context descriptions
   - Include relevant IDs (userId, personId, etc.)
   - Add status codes when available
   - Use structured data (objects) for additional context

5. **Security:**
   - Backend logs contain ALL data (tokens, PII) - use RBAC to restrict access
   - Extension logs filter PII before sending to Sentry
   - Configure Application Insights retention policies (recommend 90 days)

### Documentation References

- [Spec-127-Comprehensive-Backend-Logging.md](Docs/Specs/Spec-127-Comprehensive-Backend-Logging.md) - Complete backend logging specification (✅ Complete)
- [Chrome-Extension-Architecture.md](Docs/Architecture/Chrome-Extension-Architecture.md) - Extension logging architecture
- [DEPLOYMENT.md](Extension/DEPLOYMENT.md) - Deployment workflow with logging verification

### WhatsApp Web Integration

The sidebar adjusts the WhatsApp Web layout to prevent overlay:
- Detects WhatsApp container: `#app > div > div`
- Applies `marginRight: 350px` to push content left
- Sidebar uses `position: fixed` on the right
- Result: Sidebar and WhatsApp sit side-by-side without overlap

### Tailwind CSS Setup

The extension uses Tailwind CSS v3 for styling:

**Configuration Files:**
- `tailwind.config.js` - Tailwind configuration with content path scanning
- `postcss.config.js` - PostCSS configuration for Tailwind and Autoprefixer
- `src/styles/content-script.css` - Main CSS file with Tailwind directives

**Key Points:**
- Tailwind v3 used for better compatibility with Vite and content scanning
- CSS file includes `@tailwind base`, `@tailwind components`, and `@tailwind utilities` directives
- All utility classes are scoped within `#pipedrive-whatsapp-sidebar` container
- No aggressive CSS reset (`all: revert` removed) to allow Tailwind classes to work
- Content paths configured to scan all `.tsx` and `.ts` files in `src/`

**Build Process:**
- PostCSS processes Tailwind directives during Vite build
- Utility classes are generated based on usage in components
- Final CSS includes only used classes (tree-shaking)
- Typical CSS bundle size: ~10-11 KB (minified, before gzip)

**Important:** Avoid using `all: revert` or similar aggressive CSS resets as they will override Tailwind utility classes. Use targeted resets only when necessary.

## Website & Landing Page Components

### Landing Page (Open Access - No Waitlist)

**Key Components:**
- `Landing/src/components/SignInButton.tsx` - Direct sign-in with Pipedrive button (replaces WaitlistForm)
- `Landing/src/components/Hero.tsx` - Hero section with SignInButton
- `Landing/src/components/FinalCTA.tsx` - Final CTA section with SignInButton
- `Landing/src/components/Header.tsx` - Navigation header with sign-in button

**Important Changes (2025-11-10):**
- **Removed WaitlistForm** - Replaced with direct sign-in flow
- **Section ID changed** - From `#waitlist` to `#get-started`
- **Open to all Pipedrive users** - No invite code or waitlist required

### Website Dashboard (Open Access)

**Key Components:**
- `Website/src/components/auth/UserProfile.tsx` - User profile card with sign-out
- `Website/src/components/dashboard/ExtensionStatus.tsx` - Chrome extension installation status
- `Website/src/components/dashboard/HowToUse.tsx` - NEW: Step-by-step usage instructions
- `Website/src/pages/HomePage.tsx` - Landing page with direct sign-in (no invite input)
- `Website/src/pages/DashboardPage.tsx` - User dashboard with profile and extension status
- `Website/src/pages/AuthCallbackPage.tsx` - OAuth callback handler

**Important Changes (2025-11-10):**
- **Removed invite code requirement** - Any Pipedrive user can sign in directly
- **Removed WaitlistPage route** - Simplified to direct sign-in flow
- **Added HowToUse component** - User guidance on dashboard
- **Updated error messages** - Removed closed beta/invalid invite user-facing errors
- **Updated auth types** - Marked inviteCode as unused in OAuthState

**Website Routes:**
- `/` - Homepage with sign-in button
- `/auth/callback` - OAuth callback handler
- `/dashboard` - Authenticated user dashboard

### Backend Authentication (Open Access)

**Key Changes in AuthCallbackFunction.cs (Lines 173-197):**
- **New users allowed** - Both extension and website users can sign in without invites
- **Invite code optional** - If provided and valid, linked to user account for tracking
- **No rejection logic** - All Pipedrive users proceed to authenticated state
- **Invite infrastructure preserved** - Database tables remain but are not enforced

**OAuth Flow (Current Implementation):**
1. User clicks "Sign in with Pipedrive" (no invite required)
2. Backend generates OAuth URL and redirects to Pipedrive
3. User authorizes on Pipedrive
4. Backend checks if user exists in database
5. **NEW USER:** Creates user record (with optional invite link if provided)
6. **EXISTING USER:** Updates LastLoginAt timestamp
7. Backend creates session and returns verification_code
8. User is authenticated and redirected to dashboard/extension

## Code Style Guidelines

### C# Naming Conventions

**IMPORTANT:** For C# code, follow these naming conventions:

- **Do NOT** use underscore prefix for any variables, including private fields
- Use `camelCase` for private fields, parameters, and local variables
- Use `PascalCase` for public properties, methods, and classes
- Use descriptive, meaningful names

**Examples:**

```csharp
// ❌ INCORRECT - Do not use underscore prefix
private readonly ILogger<MyClass> _logger;
private readonly IMyService _myService;

// ✅ CORRECT - Use camelCase without underscore
private readonly ILogger<MyClass> logger;
private readonly IMyService myService;

public class MyService
{
    private readonly HttpClient httpClient;  // ✅ Correct
    private readonly string apiKey;          // ✅ Correct

    public MyService(HttpClient httpClient, string apiKey)
    {
        // Use 'this.' when parameter name matches field name
        this.httpClient = httpClient;
        this.apiKey = apiKey;
    }

    public async Task<string> GetDataAsync(string id)
    {
        var result = await httpClient.GetAsync($"/api/{id}");
        return await result.Content.ReadAsStringAsync();
    }
}
```

### TypeScript/JavaScript Conventions

- Follow existing project conventions (see Extension/ codebase)
- Use `camelCase` for variables and functions
- Use `PascalCase` for React components and types
- Use `UPPER_CASE` for constants

## Git Commit Guidelines

**IMPORTANT:** Git commit messages must NOT include any mention of AI tools, including but not limited to:
- Claude
- ChatGPT
- AI assistants
- Any other AI tool names or references
- "Generated with" attributions to AI tools
- "Co-Authored-By" tags referencing AI tools

Commit messages should be professional, concise, and focus solely on describing the changes made.