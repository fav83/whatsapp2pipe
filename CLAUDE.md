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

## README.md vs CLAUDE.md

This project uses two types of documentation files with distinct purposes:

| File | Audience | Purpose |
|------|----------|---------|
| **README.md** | Human developers | How to use, run, and deploy |
| **CLAUDE.md** | AI assistants | How to write code correctly |

**README.md should contain:**
- Project description and purpose
- Prerequisites and installation steps
- How to run locally and build for production
- Environment setup instructions
- Deployment and configuration
- Contributing guidelines

**CLAUDE.md should contain:**
- Coding conventions and naming rules
- Architecture gotchas and non-obvious patterns
- Build system quirks and workarounds
- Logging and error handling patterns
- What NOT to do (anti-patterns)
- Links to detailed specs/architecture docs

**Rule of thumb:** If it helps someone get the project running, put it in README. If it helps someone write code correctly in this project, put it in CLAUDE.md.

## Component-Specific Documentation

Each major component has its own CLAUDE.md file with detailed development guidelines:

- **[Extension/CLAUDE.md](Extension/CLAUDE.md)** - Chrome extension development (Vite, Sentry, logging, Tailwind)
- **[Backend/CLAUDE.md](Backend/CLAUDE.md)** - Backend development (logging, authentication, C# conventions)
- **[Website/CLAUDE.md](Website/CLAUDE.md)** - Dashboard website development (components, routes, auth flow)
- **[Landing/CLAUDE.md](Landing/CLAUDE.md)** - Landing page development (components, SEO, pricing)

## Documentation Structure

All project documents are located in the [Docs/](Docs/) folder, organized as follows:

### Brand & Design
- [Brand-Guide.md](Docs/Brand-Guide.md) - Complete brand guidelines including colors, typography, voice, tone, and visual style for Chat2Deal

### Architecture
- [Chrome-Extension-Architecture.md](Docs/Architecture/Chrome-Extension-Architecture.md) - Technical architecture and component design
- [Website-Architecture.md](Docs/Architecture/Website-Architecture.md) - User dashboard web application architecture
- [Landing-SEO-Architecture.md](Docs/Architecture/Landing-SEO-Architecture.md) - Landing page SEO system architecture
- [Landing-Blog-Architecture.md](Docs/Architecture/Landing-Blog-Architecture.md) - Landing page blog with MDX for SEO (📋 Planned)
- [UI-Design-Specification.md](Docs/Architecture/UI-Design-Specification.md) - Complete UI design specification with visual system, components, and states

### BRDs (Business Requirements Documents)
- [BRD-001-MVP-Pipedrive-WhatsApp.md](Docs/BRDs/BRD-001-MVP-Pipedrive-WhatsApp.md) - MVP requirements and specifications
- [BRD-002-Deals-Management.md](Docs/BRDs/BRD-002-Deals-Management.md) - Deals management features (Features 31-38)

### Specs
See [Specs-Overview.md](Docs/Specs-Overview.md) for complete list of specification documents.

### Testing Documentation
- [Testing/Manual/](Docs/Testing/Manual/) - Manual testing checklists for Extension, Landing, and Website

### External Documentation
- [Pipedrive/](Docs/External/Pipedrive/) - Pipedrive API documentation and development resources

## Logging Strategy

The project uses comprehensive logging with separation between development and production:

### Extension
- **Development logging**: `Extension/src/utils/logger.ts` - Console output (disabled in production by default)
- **Error logging**: `Extension/src/utils/errorLogger.ts` - Sentry integration for production errors
- **Details**: See [Extension/CLAUDE.md](Extension/CLAUDE.md#logging)

### Backend
- **HTTP logging**: All requests/responses logged to Application Insights (no sampling)
- **Pipedrive API**: All API calls logged with full details
- **Details**: See [Backend/CLAUDE.md](Backend/CLAUDE.md#logging)

## Code Style Guidelines

### Language-Specific Conventions

**C# (Backend):**
- Use `camelCase` for private fields, parameters, and local variables (NO underscore prefix)
- Use `PascalCase` for public properties, methods, and classes
- See [Backend/CLAUDE.md](Backend/CLAUDE.md#code-style) for detailed examples

**TypeScript/JavaScript (Extension, Website, Landing):**
- Use `camelCase` for variables and functions
- Use `PascalCase` for React components and types
- Use `UPPER_CASE` for constants

### Line Endings

**IMPORTANT:** This project enforces LF (Unix-style) line endings for all text files across all platforms.

- All text files use LF (`\n`) line endings, never CRLF (`\r\n`)
- Enforced via `.gitattributes` and `.editorconfig` at repo root
- Git is configured to normalize line endings on commit
- Modern editors (VS Code, Visual Studio) handle LF transparently on Windows

**For Contributors:**
- Windows users: Set `git config --global core.autocrlf false`
- VS Code users: Set `"files.eol": "\n"` in settings.json
- The build system expects LF and may fail with CRLF

**Documentation:** See [Line-Endings-Policy.md](Docs/Line-Endings-Policy.md) for complete policy details and setup instructions.

## Git Commit Guidelines

**IMPORTANT:** Git commit messages must NOT include any mention of AI tools, including but not limited to:
- Claude
- ChatGPT
- AI assistants
- Any other AI tool names or references
- "Generated with" attributions to AI tools
- "Co-Authored-By" tags referencing AI tools

Commit messages should be professional, concise, and focus solely on describing the changes made.
