# Chrome Extension Development Guide

This document contains development guidelines specific to the Chat2Deal Chrome extension.

## Build System

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

**Documentation:** See [Chrome-Extension-Architecture.md](../Docs/Architecture/Chrome-Extension-Architecture.md#81-vite-configuration) for complete technical details.

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

**Documentation:** See [DEPLOYMENT.md](DEPLOYMENT.md) for complete deployment workflow.

### Environment Variables

**Extension Environment Variables:**

**.env.development:**
```
VITE_BACKEND_URL=http://localhost:7071
VITE_DASHBOARD_URL=http://localhost:3000
```

**.env.production:**
```
VITE_BACKEND_URL=https://api.chat2deal.com
VITE_DASHBOARD_URL=https://app.chat2deal.com
VITE_CONSOLE_LOGGING_ENABLED=false
```

**Key Variables:**
- `VITE_BACKEND_URL` - Backend OAuth and API service URL
- `VITE_DASHBOARD_URL` - Dashboard website URL for authentication and profile access
- `VITE_SENTRY_ENABLED` - Enable/disable Sentry error tracking
- `VITE_ENV` - Environment (development/production)
- `VITE_SHOW_DEV_INDICATOR` - Show dev mode indicator banner
- `VITE_CONSOLE_LOGGING_ENABLED` - Enable console logging in production (default: false)

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

**Documentation:** See [DEPLOYMENT.md](DEPLOYMENT.md#debug-ids-and-reload-workflow) for complete Sentry workflow.

## Logging

**IMPORTANT:** Always use the provided logging utilities instead of direct `console.log()` calls.

### Development Logging (`src/utils/logger.ts`)

For console output during development and optionally in production:

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
- **Development mode:** All logging methods output to console
- **Production mode:** Logging is disabled by default (zero runtime overhead)
- **Production debugging:** Enable via `VITE_CONSOLE_LOGGING_ENABLED=true` in `.env.production`
- Supports all console methods: `log`, `warn`, `error`, `debug`, `info`, `group`, `groupEnd`, `table`
- Use for debugging, development tracing, and local troubleshooting

**Enabling Production Console Logging:**
Set `VITE_CONSOLE_LOGGING_ENABLED=true` in `Extension/.env.production` to enable console logging in production builds for debugging. This is disabled by default to reduce noise in production.

### Error Logging (`src/utils/errorLogger.ts`)

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

### Logging Best Practices

1. **Development:**
   - Use `logger.*` for all development debugging
   - Use `logError()` only for production-critical errors
   - Never use `console.log()` directly

2. **Production:**
   - All `logger.*` calls are no-ops (zero overhead)
   - Only critical errors reach Sentry via `logError()`
   - PII is filtered before sending to Sentry

3. **Error Context:**
   - Provide clear context descriptions
   - Include relevant IDs (userId, personId, etc.)
   - Add status codes when available
   - Use structured data (objects) for additional context

## WhatsApp Web Integration

The sidebar adjusts the WhatsApp Web layout to prevent overlay:
- Detects WhatsApp container: `#app > div > div`
- Applies `marginRight: 350px` to push content left
- Sidebar uses `position: fixed` on the right
- Result: Sidebar and WhatsApp sit side-by-side without overlap

## Tailwind CSS Setup

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

## Extension Features

### Profile Link in User Avatar Dropdown

**Component:** `src/content-script/components/UserAvatar.tsx`
- Feature: Added "Profile" menu item that opens website dashboard in new tab
- Behavior: Passes `verification_code` as URL parameter for auto sign-in
- Message Type: `TAB_OPEN` sent to service worker (content scripts can't access chrome.tabs)

### Service Worker Tab Management

**File:** `src/service-worker/index.ts`
- New Handler: `handleTabOpen()` - Opens URLs in new tabs on behalf of content scripts
- Message Types: `TAB_OPEN_REQUEST`, `TAB_OPEN_SUCCESS`, `TAB_OPEN_ERROR`
- Usage: Enables content scripts to open tabs without direct chrome.tabs access

## Code Style

### TypeScript/JavaScript Conventions

- Follow existing project conventions
- Use `camelCase` for variables and functions
- Use `PascalCase` for React components and types
- Use `UPPER_CASE` for constants

## Documentation References

- [Chrome-Extension-Architecture.md](../Docs/Architecture/Chrome-Extension-Architecture.md) - Complete technical architecture
- [DEPLOYMENT.md](DEPLOYMENT.md) - Deployment workflow with logging verification
- [UI-Design-Specification.md](../Docs/Architecture/UI-Design-Specification.md) - UI design system
