# Landing Page SEO Architecture

**Version:** 1.0
**Date:** 2025-11-05
**Status:** ✅ Implemented (Complete)

---

## Table of Contents

1. [Overview and Architecture](#1-overview-and-architecture)
2. [Dynamic Meta Tag Management](#2-dynamic-meta-tag-management)
3. [Automated Route Discovery](#3-automated-route-discovery)
4. [XML Sitemap Generation](#4-xml-sitemap-generation)
5. [Static Pre-rendering](#5-static-pre-rendering)
6. [Robots.txt Configuration](#6-robotstxt-configuration)
7. [Build System Integration](#7-build-system-integration)
8. [Page-Specific SEO Content](#8-page-specific-seo-content)

---

## 1. Overview and Architecture

This document describes the comprehensive, automated SEO system for the Chat2Deal landing page, modeled after the proven boring-calc implementation. The system provides excellent search engine visibility while remaining maintainable and scalable as the site grows from 3 pages to 10+ pages.

### 1.1 Design Goals

- **Automated** - Route discovery and sitemap generation require no manual maintenance
- **Scalable** - Handles 3 pages today, 10+ pages in the future with no code changes
- **SEO-First** - Static pre-rendering ensures search engines see fully-rendered content
- **Maintainable** - Clear patterns, sensible defaults, minimal configuration
- **Consistent** - Matches boring-calc architecture for cross-project familiarity

### 1.2 Core Architecture Components

#### 1.2.1 Dynamic Meta Tag Management

Using `react-helmet-async`, each page component defines its own SEO metadata:
- Page title (with site name)
- Meta description
- Keywords (optional)
- Open Graph tags (Facebook, LinkedIn)
- Twitter Card tags
- Canonical URLs

This ensures search engines and social media platforms see rich, accurate information for every page.

**Key Benefit:** Meta tags are defined at the component level, co-located with page content, making them easy to update and maintain.

#### 1.2.2 Automated Route Discovery

A shared route discovery module (`scripts/route-discovery.js`) scans the `src/pages/` directory and automatically detects all routes:
- Converts React component filenames to URL paths using kebab-case conversion
  - Example: `PrivacyPolicy.tsx` → `/privacy-policy`
  - Example: `About.tsx` → `/about`
- Handles nested directories for categorized pages
  - Example: `pages/legal/TermsOfService.tsx` → `/terms-of-service` (with override)
  - Example: `pages/blog/PostName.tsx` → `/blog/post-name`
- Pattern-based metadata rules automatically assign SEO priorities and change frequencies
- Route path overrides for special cases (e.g., legal pages at root level)

**Key Benefit:** Add a new page component and it's automatically included in sitemap and pre-rendering—no manual route lists to maintain.

#### 1.2.3 XML Sitemap Generation

An automated script (`scripts/generate-sitemap.js`) uses the route discovery system to generate a standards-compliant XML sitemap:
- Follows sitemaps.org protocol
- Includes all discovered routes with metadata (priority, changefreq)
- Configured for chat2deal.com base URL
- Runs automatically after every build

**Key Benefit:** Sitemap always stays in sync with actual routes in the application.

#### 1.2.4 Static Pre-rendering

Using Puppeteer, the build system generates static HTML files for all routes:
- Renders each page in a headless browser
- Captures fully-rendered HTML with all meta tags in place
- Writes static HTML files to appropriate locations in dist/
- Ensures search engines see content immediately without JavaScript execution

**Key Benefit:** Best possible SEO results for a React SPA—search engines see complete, rendered content with meta tags.

#### 1.2.5 Robots.txt Configuration

A properly configured `robots.txt` file:
- Allows all search engines to crawl all content
- Prevents indexing of duplicate URLs from tracking parameters (utm_, gclid, fbclid, ref)
- References the XML sitemap location

**Key Benefit:** Clean, crawlable site structure that avoids duplicate content penalties.

---

## 2. Dynamic Meta Tag Management

### 2.1 Component-Level SEO

Each page component defines its own SEO metadata using the `PageHelmet` component:

```tsx
import { PageHelmet } from '../components/SEO';

export default function Home() {
  return (
    <>
      <PageHelmet
        title="Chat2Deal"
        description="Seamlessly connect WhatsApp Web to Pipedrive CRM"
        keywords="WhatsApp CRM, Pipedrive integration"
        url="/"
      />
      {/* Page content */}
    </>
  );
}
```

### 2.2 Meta Tags Generated

The `PageHelmet` component automatically generates:

- **Basic Meta Tags**
  - `<title>` with site name suffix
  - `<meta name="description">`
  - `<meta name="keywords">` (optional)
  - `<link rel="canonical">`

- **Open Graph Tags** (Facebook, LinkedIn)
  - `og:type`, `og:title`, `og:description`
  - `og:url`, `og:image`, `og:site_name`

- **Twitter Card Tags**
  - `twitter:card`, `twitter:title`, `twitter:description`
  - `twitter:image`

### 2.3 Implementation Details

**Location:** `Landing/src/components/SEO/PageHelmet.tsx`

**Dependencies:**
- `react-helmet-async` (v2.0.5+)
- `HelmetProvider` wrapper in `main.tsx`

**Configuration:**
- Site name: "Chat2Deal"
- Base URL: `VITE_SITE_URL` environment variable
- Default OG image: `/og-image.png`

---

## 3. Automated Route Discovery

### 3.1 Route Discovery System

**Location:** `Landing/scripts/route-discovery.js`

The route discovery module scans `src/pages/` and automatically detects all routes without manual configuration.

### 3.2 Filename to URL Conversion

**Algorithm:**
1. Scan `src/pages/` directory recursively
2. For each `.tsx` file:
   - Remove file extension
   - Convert PascalCase to kebab-case
   - Apply route overrides if defined
3. Generate route metadata (priority, changefreq)

**Examples:**
```javascript
PrivacyPolicy.tsx  → /privacy-policy
About.tsx          → /about
Home.tsx           → /
pages/blog/PostName.tsx → /blog/post-name
```

### 3.3 Route Overrides

Special cases where URL doesn't match file structure:

```javascript
const ROUTE_OVERRIDES = {
  'legal/PrivacyPolicy': '/privacy-policy',    // Not /legal/privacy-policy
  'legal/TermsOfService': '/terms-of-service', // Not /legal/terms-of-service
  'Home': '/',
};
```

### 3.4 Pattern-Based Metadata

Routes automatically receive SEO metadata based on URL patterns:

```javascript
// Priority (0.0 - 1.0)
'/' → 1.0 (highest)
'/about' → 0.8
'/blog/*' → 0.7
'/privacy-policy', '/terms-of-service' → 0.3
default → 0.5

// Change Frequency
'/' → 'weekly'
'/blog/*' → 'monthly'
'/privacy-policy', '/terms-of-service' → 'yearly'
default → 'monthly'
```

### 3.5 Exported Functions

```javascript
// Get full route objects with metadata
discoverRoutes({ verbose: false }) → Array<{path, priority, changefreq}>

// Get just route paths (for pre-rendering)
getRoutePaths({ verbose: false }) → Array<string>

// Get base URL from environment
getBaseUrl() → string
```

---

## 4. XML Sitemap Generation

### 4.1 Sitemap Generation Script

**Location:** `Landing/scripts/generate-sitemap.js`

Automatically generates standards-compliant XML sitemap using route discovery system.

### 4.2 Sitemap Structure

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://chat2deal.com/</loc>
    <lastmod>2025-11-05</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <!-- Additional routes -->
</urlset>
```

### 4.3 Generation Process

1. Call `discoverRoutes()` to get all routes
2. Get base URL from `VITE_SITE_URL` env variable
3. For each route:
   - Build `<url>` entry with metadata
   - Set `lastmod` to current date (YYYY-MM-DD)
4. Write to `dist/sitemap.xml`

### 4.4 Execution

**When:** Automatically after every build
**How:** `npm run build` → calls `generate-sitemap.js`
**Output:** `dist/sitemap.xml`

---

## 5. Static Pre-rendering

### 5.1 Pre-rendering System

**Location:** `Landing/scripts/prerender.js`

Uses Puppeteer to render pages to static HTML with fully-rendered meta tags.

### 5.2 Pre-rendering Process

1. **Launch Puppeteer** with headless Chrome
2. **For each route:**
   - Navigate to `http://localhost:4173{route}`
   - Wait for network idle
   - Wait for meta tags to be injected (react-helmet-async)
   - Extract fully-rendered HTML
   - Count words to verify content
   - Write to `dist/{route}/index.html`
3. **Close browser** and report summary

### 5.3 Automated Server Management

**Location:** `Landing/scripts/build-with-prerender.js`

Fully automated pre-rendering with server lifecycle management:

1. **Cleanup:** Kill any existing preview servers on ports 4173-4180
2. **Start:** Launch preview server (`npm run preview`)
3. **Wait:** Detect when server is ready (monitors stdout for "localhost:")
4. **Port Detection:** Extract actual port from server output
5. **Update:** Dynamically update prerender script if port differs
6. **Execute:** Run pre-rendering (`node scripts/prerender.js`)
7. **Restore:** Restore original files if modified
8. **Shutdown:** Kill preview server and cleanup

### 5.4 File Output Structure

```
dist/
├── index.html                          # Pre-rendered home page
├── privacy-policy/
│   └── index.html                      # Pre-rendered privacy policy
├── terms-of-service/
│   └── index.html                      # Pre-rendered terms
└── sitemap.xml
```

### 5.5 When Pre-rendering is Beneficial

**Use pre-rendering when:**
- Deploying to pure CDN (no server-side routing)
- Targeting legacy search engine crawlers
- Need instant SEO without JavaScript execution
- Serving to regions with slow networks

**Skip pre-rendering when:**
- Modern hosting with SSR/edge rendering
- Dynamic meta tags are sufficient (most cases)
- Want faster build times

---

## 6. Robots.txt Configuration

### 6.1 File Location

**Source:** `Landing/public/robots.txt`
**Output:** `dist/robots.txt` (copied during build)

### 6.2 Configuration

```txt
# Chat2Deal Robots.txt
User-agent: *
Allow: /

# Prevent indexing of duplicate URLs from tracking parameters
Disallow: /*?utm_*
Disallow: /*?gclid=*
Disallow: /*?fbclid=*
Disallow: /*?ref=*

# Sitemap location
Sitemap: https://chat2deal.com/sitemap.xml
```

### 6.3 Key Features

- **Allow all crawlers:** No restrictions on search engine access
- **Prevent duplicate content:** Disallow tracking parameter URLs
- **Sitemap reference:** Points to XML sitemap for discovery

---

## 7. Build System Integration

### 7.1 Build Scripts

**Standard Build (No Pre-rendering):**
```bash
npm run build
→ tsc -b                              # TypeScript compilation
→ vite build                          # Vite production build
→ node scripts/generate-sitemap.js    # Sitemap generation
```

**Build with Pre-rendering:**
```bash
npm run build:prerender
→ tsc -b                                    # TypeScript compilation
→ vite build                                # Vite production build
→ node scripts/build-with-prerender.js      # Automated pre-rendering
→ node scripts/generate-sitemap.js          # Sitemap generation
```

### 7.2 Build Output

```
dist/
├── index.html                    # App entry point
├── sitemap.xml                   # XML sitemap
├── robots.txt                    # Robots configuration
├── assets/
│   ├── index-[hash].js          # Main bundle
│   ├── react-vendor-[hash].js   # React vendor bundle
│   ├── markdown-vendor-[hash].js# Markdown vendor bundle
│   └── index-[hash].css         # Styles
└── [routes]/                     # Pre-rendered pages (if enabled)
```

### 7.3 Vite Configuration

**Key SEO optimizations in `vite.config.ts`:**

```typescript
export default defineConfig({
  base: './',  // Relative paths for assets (critical for SPAs)

  build: {
    sourcemap: true,  // For debugging (not shipped)
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'markdown-vendor': ['react-markdown'],
        },
      },
    },
  },
});
```

### 7.4 Environment Variables

**Required:**
- `VITE_SITE_URL`: Base URL for sitemap (e.g., `https://chat2deal.com`)

**Optional:**
- `VITE_API_BASE_URL`: API endpoint for forms

---

## 8. Page-Specific SEO Content

### 8.1 Home Page

**Title:** "Chat2Deal"
**Description:** "Seamlessly connect WhatsApp Web conversations to Pipedrive CRM. Sync contacts, track conversations, and close more deals with our Chrome extension for sales teams."
**Keywords:** "WhatsApp CRM, Pipedrive integration, WhatsApp Web, CRM extension, sales automation, contact sync, Chrome extension"
**Priority:** 1.0
**Change Frequency:** weekly

### 8.2 Privacy Policy

**Title:** "Privacy Policy"
**Description:** "Chat2Deal Privacy Policy - How we collect, use, and protect your data when using our WhatsApp to Pipedrive CRM integration."
**Priority:** 0.3
**Change Frequency:** yearly

### 8.3 Terms of Service

**Title:** "Terms of Service"
**Description:** "Chat2Deal Terms of Service - Terms and conditions for using our WhatsApp to Pipedrive CRM integration Chrome extension."
**Priority:** 0.3
**Change Frequency:** yearly

### 8.4 Adding New Pages

To add a new page with automatic SEO integration:

1. **Create page component** in `src/pages/`:
   ```tsx
   // src/pages/About.tsx
   import { PageHelmet } from '../components/SEO';

   export default function About() {
     return (
       <>
         <PageHelmet
           title="About Us"
           description="Learn about Chat2Deal"
           url="/about"
         />
         {/* Page content */}
       </>
     );
   }
   ```

2. **Add route** to `App.tsx`:
   ```tsx
   <Route path="/about" element={<About />} />
   ```

3. **Build:** The page is automatically discovered and included in sitemap!

---

## References

- [Website Architecture](./Website-Architecture.md) - Overall website architecture
- [Parking Lot](../Plans/Parking-Lot.md) - Future features (social media images)

---

## Changelog

- **2025-11-05** - Complete architecture documentation (all 8 sections)
- **2025-11-05** - Initial document creation with Section 1 (Overview and Architecture)
