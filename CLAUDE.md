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

## Current Implementation Status

**✅ Completed Features:**
- ✅ Project foundation and build setup (Spec-101)
- ✅ Chrome extension manifest and structure (Spec-102)
- ✅ WhatsApp Web sidebar injection with UI states (Spec-103)
  - WhatsApp load detection
  - Fixed header + scrollable body
  - 4 UI states: welcome, loading, contact, error
  - TypeScript discriminated unions for state management
  - 55 automated tests passing
  - WhatsApp color theme matching

**📋 Next Feature:**
- Feature 4: Chat detection and phone extraction

## Git Commit Guidelines

**IMPORTANT:** Git commit messages must NOT include any mention of AI tools, including but not limited to:
- Claude
- ChatGPT
- AI assistants
- Any other AI tool names or references
- "Generated with" attributions to AI tools
- "Co-Authored-By" tags referencing AI tools

Commit messages should be professional, concise, and focus solely on describing the changes made.