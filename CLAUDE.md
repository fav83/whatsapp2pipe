# Project Documentation

## Project Structure

This project uses a structured organization:
- **Extension/** - All Chrome extension source code, build configurations, and dependencies
- **Docs/** - All project documentation (architecture, BRDs, plans, specs)

**IMPORTANT:** All extension source code must be located under the `Extension/` folder. This includes:
- Source files (src/)
- Build configurations (vite.config.ts, tsconfig.json, etc.)
- Dependencies (package.json, node_modules/)
- Tests (tests/)
- Environment files (.env.*)
- Build output (dist/)

## Documentation Structure

All project documents are located in the [Docs/](Docs/) folder, organized as follows:

### Architecture
- [Chrome-Extension-Architecture.md](Docs/Architecture/Chrome-Extension-Architecture.md) - Technical architecture and component design

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

The build system includes a custom Vite plugin (`inline-chunks`) that solves Chrome Manifest V3 ES module compatibility issues:

**Problem:** Chrome content scripts don't support ES modules, but Vite creates code-split chunks with import/export statements.

**Solution:** The `inline-chunks` plugin automatically:
- Detects and reads chunk files after build
- Removes export statements
- Wraps chunks in IIFE to prevent variable collisions
- Inlines all React dependencies (~142KB) into content-script.js
- Produces a single self-contained file with no import/export statements

**Result:** content-script.js works in Chrome without "Cannot use import statement outside a module" errors.

**Documentation:** See [Chrome-Extension-Architecture.md](Docs/Architecture/Chrome-Extension-Architecture.md#81-vite-configuration) for complete technical details.

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