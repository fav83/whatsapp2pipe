# Pipedrive × WhatsApp Web Extension

Chrome extension that integrates Pipedrive CRM with WhatsApp Web for seamless contact management.

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- Chrome browser

### Installation

1. Clone and install dependencies:
   ```bash
   git clone <repo-url>
   cd whatsapp2pipe/Extension
   npm install
   ```

2. Set up environment:
   ```bash
   cp .env.development .env.local
   # Edit .env.local with your Pipedrive credentials
   ```

3. Build the extension:
   ```bash
   npm run build
   ```

4. Load in Chrome:
   - Open `chrome://extensions`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `Extension/dist/` folder

### Development

- `npm run dev` - Build in watch mode
- `npm run test` - Run unit tests
- `npm run test:e2e` - Run E2E tests
- `npm run lint` - Lint code
- `npm run format` - Format code

## Documentation

See [Docs/](../Docs/) folder for:
- [Architecture](../Docs/Architecture/Chrome-Extension-Architecture.md)
- [BRD](../Docs/BRDs/BRD-001-MVP-Pipedrive-WhatsApp.md)
- [Feature Plan](../Docs/Plans/Plan-001-MVP-Feature-Breakdown.md)

## Tech Stack

- **Runtime:** Chrome Extension Manifest V3
- **Build:** Vite 5.x
- **Framework:** React 18 + TypeScript
- **UI:** shadcn/ui + Tailwind CSS (to be added)
- **State:** TanStack Query + React Context (to be added)
- **Testing:** Vitest + Testing Library + Playwright

## License

[To be determined]
