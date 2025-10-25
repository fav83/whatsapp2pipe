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

## Git Commit Guidelines

**IMPORTANT:** Git commit messages must NOT include any mention of AI tools, including but not limited to:
- Claude
- ChatGPT
- AI assistants
- Any other AI tool names or references
- "Generated with" attributions to AI tools
- "Co-Authored-By" tags referencing AI tools

Commit messages should be professional, concise, and focus solely on describing the changes made.