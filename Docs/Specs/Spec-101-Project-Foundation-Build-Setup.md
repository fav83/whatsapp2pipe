# Spec-101: Project Foundation & Build Setup

**Feature:** Feature 1 - Project Foundation & Build Setup
**Date:** 2025-10-25
**Status:** Draft
**Dependencies:** None
**Related Docs:**
- [BRD-001-MVP-Pipedrive-WhatsApp.md](../BRDs/BRD-001-MVP-Pipedrive-WhatsApp.md)
- [Chrome-Extension-Architecture.md](../Architecture/Chrome-Extension-Architecture.md)
- [Plan-001-MVP-Feature-Breakdown.md](../Plans/Plan-001-MVP-Feature-Breakdown.md)

---

## 1. Overview

Set up the complete project foundation with modern tooling including Vite build system, TypeScript, React, ESLint, Prettier, and testing infrastructure. This creates a production-ready development environment for building the Chrome extension.

**Project Structure:** All extension source code, build configurations, and dependencies are located under the `Extension/` folder at the project root. This keeps the extension code separate from documentation and other project files.

**Why this matters:** A solid foundation ensures developer productivity, code quality, and maintainability from day one. The tooling choices align with modern best practices and the technical architecture.

---

## 2. Objectives

- Create a working Vite + React + TypeScript project structure
- Configure all build tooling for Chrome extension development
- Set up code quality tools (ESLint, Prettier) with pre-commit hooks
- Initialize testing infrastructure (Vitest, Testing Library, Playwright)
- Establish environment variable management for dev/prod
- Create initial folder structure following architecture document

---

## 3. Functional Requirements

### 3.1 Package.json Setup

**Description:** Initialize npm project with all required dependencies and scripts.

**Dependencies:**
```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "typescript": "^5.6.0",
    "vite": "^5.4.0",
    "@vitejs/plugin-react": "^4.3.0",
    "eslint": "^9.0.0",
    "prettier": "^3.3.0",
    "vitest": "^2.1.0",
    "@testing-library/react": "^16.0.0",
    "@testing-library/jest-dom": "^6.5.0",
    "@playwright/test": "^1.48.0",
    "husky": "^9.1.0",
    "lint-staged": "^15.2.0"
  }
}
```

**Scripts:**
- `npm run dev` - Start Vite dev server in watch mode
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run unit/integration tests with Vitest
- `npm run test:e2e` - Run Playwright E2E tests
- `npm run lint` - Run ESLint
- `npm run format` - Run Prettier
- `npm run type-check` - Run TypeScript compiler check

**Acceptance Criteria:**
- [ ] package.json exists with all dependencies listed
- [ ] `npm install` completes without errors
- [ ] All npm scripts execute successfully (even if minimal)

---

### 3.2 TypeScript Configuration

**Description:** Configure TypeScript with strict mode for type safety.

**Configuration Requirements (tsconfig.json):**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "jsx": "react-jsx",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "allowSyntheticDefaultImports": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "types": ["chrome", "vite/client", "vitest/globals"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests/e2e"]
}

**Note:** All TypeScript configurations are located in the `Extension/` directory.
```

**Special Considerations:**
- Include `@types/chrome` for Chrome extension APIs
- Enable strict mode for maximum type safety
- Configure for Vite's bundler module resolution

**Acceptance Criteria:**
- [ ] tsconfig.json present with strict mode enabled
- [ ] `npm run type-check` runs without errors on initial structure
- [ ] Chrome extension types available globally

---

### 3.3 Vite Configuration

**Description:** Configure Vite to build Chrome extension components (content script, service worker, popup).

**Configuration Requirements (vite.config.ts):**

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        'content-script': resolve(__dirname, 'src/content-script/index.tsx'),
        'service-worker': resolve(__dirname, 'src/service-worker/index.ts'),
        'popup': resolve(__dirname, 'src/popup/index.html')
      },
      output: {
        entryFileNames: (chunkInfo) => {
          // Service worker and content script need specific names
          if (chunkInfo.name === 'service-worker' || chunkInfo.name === 'content-script') {
            return '[name].js'
          }
          return 'assets/[name].[hash].js'
        },
        chunkFileNames: 'chunks/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]'
      }
    },
    sourcemap: process.env.NODE_ENV === 'development'
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  }
})
```

**Special Considerations:**
- Service worker must output as `service-worker.js` (not hashed)
- Content script must output as `content-script.js`
- Sourcemaps only in development (security)
- Path alias `@/` for cleaner imports

**Acceptance Criteria:**
- [ ] vite.config.ts exists with correct build targets
- [ ] `npm run build` produces dist/ with correct file names
- [ ] Sourcemaps generated in dev, excluded in prod
- [ ] Import alias `@/` works in TypeScript files

---

### 3.4 Folder Structure

**Description:** Create initial folder structure per architecture document.

**Required Folders:**
```
whatsapp2pipe/
├── Extension/                  # All extension source code
│   ├── public/
│   │   └── icons/              # Extension icons (create placeholder)
│   ├── src/
│   │   ├── content-script/
│   │   ├── service-worker/
│   │   ├── popup/
│   │   ├── components/         # Custom React components
│   │   ├── hooks/
│   │   ├── contexts/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── types/
│   │   └── styles/
│   ├── tests/
│   │   ├── unit/
│   │   ├── integration/
│   │   └── e2e/
│   ├── .env.development
│   ├── .env.production
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── vitest.config.ts
│   ├── playwright.config.ts
│   ├── eslint.config.js
│   ├── .prettierrc
│   ├── .prettierignore
│   ├── tailwind.config.js      # (future)
│   ├── package.json
│   └── README.md
├── Docs/                       # Already exists
│   ├── Architecture/
│   ├── BRDs/
│   ├── Plans/
│   └── Specs/
└── .gitignore                  # Root level
```

**Placeholder Files (to enable builds):**
- `Extension/src/content-script/index.tsx` - Empty React root
- `Extension/src/service-worker/index.ts` - Empty service worker
- `Extension/src/popup/index.html` - Basic HTML with root div
- `Extension/src/popup/index.tsx` - Empty React popup
- `Extension/src/styles/globals.css` - Empty stylesheet (for Tailwind later)

**Acceptance Criteria:**
- [ ] All folders exist under Extension/ directory as specified
- [ ] Placeholder files allow `npm run build` to succeed
- [ ] .gitignore ignores Extension/node_modules/, Extension/dist/, Extension/.env.local

---

### 3.5 ESLint Configuration

**Description:** Set up ESLint with React, TypeScript, and Hooks rules.

**Configuration (eslint.config.js - ESLint 9 flat config):**

```javascript
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist', 'node_modules'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        chrome: 'readonly'
      }
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }]
    }
  }
)
```

**Key Rules:**
- React Hooks rules (prevent dependency issues)
- Unused vars detection (ignore underscore-prefixed)
- Chrome global defined (no-undef errors prevented)

**Acceptance Criteria:**
- [ ] eslint.config.js present
- [ ] `npm run lint` runs on all .ts/.tsx files
- [ ] No ESLint errors on placeholder code
- [ ] Chrome APIs not flagged as undefined

---

### 3.6 Prettier Configuration

**Description:** Configure Prettier for consistent code formatting.

**Configuration (.prettierrc):**

```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "arrowParens": "always"
}
```

**.prettierignore:**
```
dist/
node_modules/
*.md
package-lock.json
```

**Acceptance Criteria:**
- [ ] .prettierrc exists
- [ ] `npm run format` formats all files consistently
- [ ] Prettier and ESLint don't conflict (no formatting rule clashes)

---

### 3.7 Husky + lint-staged

**Description:** Set up Git hooks to run linting/formatting on commit.

**Setup:**
1. Initialize Husky: `npx husky init`
2. Configure lint-staged in package.json:

```json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{css,json,md}": [
      "prettier --write"
    ]
  }
}
```

3. Create `.husky/pre-commit`:
```bash
npx lint-staged
```

**Acceptance Criteria:**
- [ ] .husky/pre-commit hook exists
- [ ] Committing un-linted code triggers auto-fix
- [ ] Commits fail if linting can't auto-fix errors

---

### 3.8 Vitest Configuration

**Description:** Set up Vitest for unit and integration tests.

**Configuration (vitest.config.ts):**

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: ['node_modules/', 'tests/', 'dist/']
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  }
})
```

**Setup File (tests/setup.ts):**
```typescript
import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// Mock chrome API globally
global.chrome = {
  runtime: {},
  storage: { local: {} },
  identity: {}
} as any

afterEach(() => {
  cleanup()
})
```

**Sample Test (tests/unit/example.test.ts):**
```typescript
import { describe, it, expect } from 'vitest'

describe('Project Setup', () => {
  it('should have working test infrastructure', () => {
    expect(true).toBe(true)
  })
})
```

**Acceptance Criteria:**
- [ ] vitest.config.ts exists
- [ ] `npm run test` executes and passes sample test
- [ ] Chrome API mocked globally
- [ ] @testing-library/jest-dom matchers available

---

### 3.9 Playwright Configuration

**Description:** Set up Playwright for E2E testing with Chrome extension support.

**Configuration (playwright.config.ts):**

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false, // Extensions need sequential loading
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Chrome extensions are stateful
  reporter: 'html',
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ]
})
```

**Sample E2E Test (tests/e2e/extension-loads.spec.ts):**
```typescript
import { test, expect } from '@playwright/test'

test('extension structure exists', async () => {
  // Placeholder - will be implemented in Feature 2
  expect(true).toBe(true)
})
```

**Acceptance Criteria:**
- [ ] playwright.config.ts exists
- [ ] `npm run test:e2e` runs successfully
- [ ] Playwright browser binaries installed
- [ ] Sample test passes

---

### 3.10 Environment Variables

**Description:** Set up environment variable management for dev/prod.

**Architecture Note:** The extension communicates only with the Azure Functions backend. All Pipedrive API interactions (including OAuth redirect URLs) are handled server-side for security. The backend dynamically constructs OAuth redirect URLs using the pattern `https://{extensionId}.chromiumapp.org/`, which Chrome recognizes as a special pattern that automatically closes OAuth popups.

**.env.development:**
```env
# Sentry (disabled in dev)
VITE_SENTRY_DSN=
VITE_SENTRY_ENABLED=false

# Environment
VITE_ENV=development

# Dev Indicator (set to false to hide the dev banner)
VITE_SHOW_DEV_INDICATOR=true

# Backend OAuth Service
VITE_BACKEND_URL=http://localhost:7071
```

**.env.production:**
```env
# Sentry (enabled in prod)
VITE_SENTRY_DSN=
VITE_SENTRY_ENABLED=true

# Environment
VITE_ENV=production

# Dev Indicator (not used in production)
VITE_SHOW_DEV_INDICATOR=false

# Backend OAuth Service
VITE_BACKEND_URL=https://your-backend-url.azurewebsites.net
```

**.env.local (gitignored - for secrets):**
```env
# Local overrides (do not commit)
# VITE_SENTRY_DSN=actual_sentry_dsn
```

**.gitignore additions:**
```
.env.local
.env*.local
```

**Usage Example (src/config.ts):**
```typescript
// Environment configuration
export const config = {
  sentryDsn: import.meta.env.VITE_SENTRY_DSN,
  sentryEnabled: import.meta.env.VITE_SENTRY_ENABLED === 'true',
  env: import.meta.env.VITE_ENV as 'development' | 'production',
  showDevIndicator: import.meta.env.VITE_SHOW_DEV_INDICATOR === 'true',
}

// Backend OAuth Service configuration
export const AUTH_CONFIG = {
  backendUrl: import.meta.env.VITE_BACKEND_URL || 'http://localhost:7071',
  endpoints: {
    authStart: '/api/auth/start',
    authCallback: '/api/auth/callback',
  },
}
```

**OAuth Redirect URL Explanation:**
The extension does NOT need to configure OAuth redirect URLs. The backend dynamically constructs them at runtime:
- Pattern: `https://{chrome.runtime.id}.chromiumapp.org/`
- Example: `https://abcdefghijklmnop.chromiumapp.org/?verification_code=xyz&success=true`
- Chrome's `chrome.identity.launchWebAuthFlow()` recognizes this pattern and auto-closes the OAuth popup
- The extension ID is passed to the backend via the OAuth state parameter

**Acceptance Criteria:**
- [ ] .env.development and .env.production exist
- [ ] .env.local gitignored
- [ ] Environment variables accessible via import.meta.env
- [ ] config.ts exports typed configuration
- [ ] Backend URL configured for both dev and production

---

### 3.11 README.md

**Description:** Create initial developer documentation.

**Content:**
```markdown
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

See [Docs/](Docs/) folder for:
- [Architecture](Docs/Architecture/Chrome-Extension-Architecture.md)
- [BRD](Docs/BRDs/BRD-001-MVP-Pipedrive-WhatsApp.md)
- [Feature Plan](Docs/Plans/Plan-001-MVP-Feature-Breakdown.md)

## Tech Stack

- **Runtime:** Chrome Extension Manifest V3
- **Build:** Vite 5.x
- **Framework:** React 18 + TypeScript
- **UI:** Custom React components with Tailwind CSS utility classes
- **State:** Custom React hooks + React Context
- **Testing:** Vitest + Testing Library + Playwright

## License

[To be determined]
```

**Acceptance Criteria:**
- [ ] README.md exists with setup instructions
- [ ] Instructions can be followed to build extension
- [ ] Tech stack documented

---

## 4. Non-Functional Requirements

### 4.1 Performance
- Build time: < 10 seconds for dev, < 30 seconds for prod
- Test execution: Unit tests < 5 seconds

### 4.2 Developer Experience
- Hot module replacement works in dev mode
- TypeScript errors show immediately in IDE
- Linting/formatting happens automatically on save (with IDE config)

### 4.3 Code Quality
- Zero ESLint errors on initial setup
- All placeholder code properly typed (no `any`)
- 100% test pass rate (even if minimal)

---

## 5. Testing Strategy

### 5.1 Unit Tests
- Test that project builds successfully
- Test that environment config loads correctly
- Test that TypeScript types are enforced

### 5.2 Integration Tests
- None required for this feature (no integration points yet)

### 5.3 E2E Tests
- Verify Playwright can launch Chrome
- Placeholder test that passes

### 5.4 Manual Testing Checklist
- [ ] `npm install` completes without warnings
- [ ] `npm run dev` starts and rebuilds on file change
- [ ] `npm run build` produces dist/ folder
- [ ] `npm run test` and `npm run test:e2e` pass
- [ ] Pre-commit hook runs on git commit
- [ ] Extension loads in Chrome (even if empty)

---

## 6. Implementation Plan

### Phase 1: Core Setup (1-2 hours)
1. Initialize npm project
2. Install dependencies
3. Create tsconfig.json and vite.config.ts
4. Create folder structure with placeholders

### Phase 2: Tooling (1 hour)
5. Configure ESLint and Prettier
6. Set up Husky and lint-staged
7. Test that linting/formatting works

### Phase 3: Testing Infrastructure (1 hour)
8. Configure Vitest with sample test
9. Configure Playwright with sample test
10. Verify all tests pass

### Phase 4: Documentation & Polish (30 minutes)
11. Create .env files and config.ts
12. Write README.md
13. Final verification of all scripts

**Total Estimated Time:** 3.5-4.5 hours

---

## 7. Acceptance Criteria Summary

- [ ] Package.json with all dependencies
- [ ] TypeScript configured in strict mode
- [ ] Vite builds content script, service worker, popup
- [ ] Folder structure matches architecture
- [ ] ESLint and Prettier configured and working
- [ ] Pre-commit hooks run linting/formatting
- [ ] Vitest runs unit/integration tests
- [ ] Playwright configured for E2E tests
- [ ] Environment variables set up
- [ ] README.md with setup instructions
- [ ] `npm run build` produces loadable extension
- [ ] Extension loads in Chrome without errors

---

## 8. Dependencies & Blockers

**Dependencies:**
- None (foundational feature)

**Potential Blockers:**
- npm registry access issues
- Playwright browser download issues (corporate firewall)
- Chrome extension developer mode restrictions

**Mitigation:**
- Document offline npm setup if needed
- Provide Playwright browser binaries separately
- Include troubleshooting guide for Chrome policies

---

## 9. Future Considerations

**Post-MVP Enhancements:**
- CI/CD pipeline (GitHub Actions)
- Automated version bumping
- Bundle size analysis
- Test coverage thresholds
- Storybook for component development

**Not in Scope:**
- Docker setup (not needed for extension dev)
- Backend server (MVP uses client-side OAuth)
- Deployment automation (manual for MVP)

---

## 10. References

- [Vite Chrome Extension Guide](https://vitejs.dev/guide/build.html#library-mode)
- [Chrome Extension Manifest V3 Docs](https://developer.chrome.com/docs/extensions/mv3/)
- [Vitest Documentation](https://vitest.dev/)
- [Playwright Chrome Extension Testing](https://playwright.dev/docs/chrome-extensions)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
