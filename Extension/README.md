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

### Manual Testing (Feature 2 - Basic Extension)

After loading the extension:

1. **Service Worker:**
   - Go to `chrome://extensions`
   - Find "Pipedrive for WhatsApp Web"
   - Click "service worker" link to open console
   - Verify you see `[Service Worker] Loaded` and `[Service Worker] Ready`

2. **Content Script on WhatsApp Web:**
   - Navigate to https://web.whatsapp.com
   - A sidebar should appear on the right side
   - The sidebar should show:
     - "Pipedrive for WhatsApp" heading
     - Extension version
     - "Test Service Worker" button
     - "Test Storage" button

3. **Test Service Worker Communication:**
   - Click "Test Service Worker" button
   - Counter should increment
   - Check browser console for ping/pong messages

4. **Test Storage:**
   - Click "Test Storage" button
   - Button should turn green showing "success"
   - Check console for storage test logs

5. **Popup:**
   - Click the extension icon in toolbar
   - Popup should open showing:
     - Extension icon and version
     - WhatsApp Web detection status
     - "Open WhatsApp Web" button (if not open)

6. **Console Logs:**
   - Open DevTools on WhatsApp Web page
   - Look for `[Content Script]` logs
   - Service worker inspector should show `[Service Worker]` logs

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
