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

## Git Commit Guidelines

**IMPORTANT:** Git commit messages must NOT include any mention of AI tools, including but not limited to:
- Claude
- ChatGPT
- AI assistants
- Any other AI tool names or references
- "Generated with" attributions to AI tools
- "Co-Authored-By" tags referencing AI tools

Commit messages should be professional, concise, and focus solely on describing the changes made.