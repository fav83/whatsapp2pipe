# Deployment Guide

## Critical: Source Maps Security

**⚠️ Source maps expose your TypeScript source code and must NEVER ship to users.**

Our build automatically moves `.map` files from `dist/` to `sourcemaps/` directory. Even accidental packaging of `dist/` is safe.

## Deployment Checklist

```bash
cd Extension
```

### 1. Pre-Deploy

- [ ] Remove `<SentryTest />` from `src/content-script/App.tsx`
- [ ] Verify `.env.production` has correct `VITE_BACKEND_URL`
- [ ] `npm test && npm run type-check && npm run lint`

### 2. Build & Package

```bash
npm run package              # For deployment (builds + creates zip)
# OR
npm run build                # Just build (for local testing)
```

**Version is auto-incremented** - Patch version (Z in X.Y.Z) increments automatically on each build.

**`npm run package`** - Full deployment (recommended)

- Auto-increments version
- Builds production code
- Creates `release/` folder
- Creates `chat2deal-vX.X.X.zip` for Chrome Web Store

**`npm run build`** - Build only

- Auto-increments version
- Builds production code to `dist/`
- Moves source maps to `sourcemaps/`
- Use for local testing of production build

### Build Pipeline Notes (Sentry + Single-File Content Script)

- The build now runs in 3 passes to produce accurate source maps:
  1. Build `content-script.js` as a single file (`inlineDynamicImports: true`).
  2. Build `inspector-main.js` as a single file.
  3. Build service worker + popup and move all `.map` files to `sourcemaps/`.
- The content script CSS is emitted to `assets/content-script.css` (stable path referenced by `manifest.json`).
- Debug IDs are injected by `sentry-cli` during `npm run upload-sourcemaps` (not during build) to avoid mismatches.
- After building and uploading, reload the extension in `chrome://extensions` and hard‑reload WhatsApp before testing.

### 3. Upload Source Maps to Sentry

```bash
# One-time setup (if not done) - see "Sentry Setup" section below
npm install -g @sentry/cli
sentry-cli login

# Upload source maps
npm run upload-sourcemaps
```

Verify: [Sentry](https://sentry.io) → Settings → Projects → Your Project → Source Maps

#### Debug IDs and Reload Workflow

This project uses Sentry Debug IDs to reliably de-minify stack traces. Debug IDs are injected by `sentry-cli` during `npm run upload-sourcemaps` (not during build).

**Critical: After uploading source maps, you MUST reload the extension:**

1. Open `chrome://extensions`
2. Click the **Reload** button on your extension
3. Hard-refresh the WhatsApp tab (Ctrl+Shift+R / Cmd+Shift+R)
4. Reproduce the error

**Why?** Chrome must run the JavaScript files that contain the injected Debug IDs. Without reloading, the old code (without Debug IDs) is still running, causing source map mismatches.

**Troubleshooting "Missing source file with a matching Debug ID":**

- Rebuild, re-upload, and reload the extension, then reproduce the error
- Ensure you didn't rebuild after uploading without re-uploading
- In Sentry Issue details, verify the Debug ID in the stack frame matches an uploaded artifact under Settings → Source Maps
- Remember: Debug IDs are injected during upload, not build

### 4. Deploy to Chrome Web Store

1. Go to [Chrome Web Store Dashboard](https://chrome.google.com/webstore/devconsole)
2. Upload `chat2deal-vX.X.X.zip`
3. Submit for review

## Sentry Setup (One-Time)

### Step 1: Install sentry-cli

```bash
npm install -g @sentry/cli
sentry-cli login
```

### Step 2: Configure Organization & Project

**Option A: .env.production File (Recommended)**

Add to your `Extension/.env.production` file:

```bash
SENTRY_ORG=your-org-slug
SENTRY_PROJECT=your-project-slug
```

**Option B: Environment Variables**

```bash
# Windows PowerShell
$env:SENTRY_ORG = "your-org-slug"
$env:SENTRY_PROJECT = "your-project-slug"

# Windows CMD
set SENTRY_ORG=your-org-slug
set SENTRY_PROJECT=your-project-slug

# macOS/Linux
export SENTRY_ORG=your-org-slug
export SENTRY_PROJECT=your-project-slug
```

**Option C: .sentryclirc File**

Create `.sentryclirc` in project root:

```ini
[defaults]
org=your-org-slug
project=your-project-slug

[auth]
token=your-token-here
```

Get your values from:

- Org & Project slugs: https://sentry.io/settings/
- Auth token: https://sentry.io/settings/account/api/auth-tokens/ (only for Option C)
- Token permissions: `project:releases`, `project:write`

## Troubleshooting

**Source maps not working in Sentry?**

- Check Sentry → Settings → Source Maps for uploaded files
- Verify Sentry release version matches `manifest.json`
- **Did you reload the extension after uploading?** See "Debug IDs and Reload Workflow" above
- Re-run: `npm run upload-sourcemaps` and reload the extension

**Verify no source maps in package:**

```bash
unzip -l chat2deal-vX.X.X.zip | grep "\.map"
# Should return nothing
```

## Quick Reference

```bash
# Development
npm run dev                  # Watch mode
npm test                     # Run tests

# Production
npm run package              # Build + create zip (NO source maps)
npm run upload-sourcemaps    # Upload to Sentry
```

**Security Rules:**

- ✅ Always use `npm run package` for production
- ✅ Upload source maps to Sentry after every build
- ❌ Never ship `.map` files to users
- ❌ Never commit `release/`, `sourcemaps/`, or `*.zip` to git
