# Landing Page Blog Architecture

**Version:** 1.0
**Date:** 2025-11-27
**Status:** 📋 Planned

---

## Table of Contents

1. [Overview](#1-overview)
2. [Design Goals](#2-design-goals)
3. [Technology Selection](#3-technology-selection)
   - 3.1 [Why MDX Over Plain Markdown](#31-why-mdx-over-plain-markdown)
   - 3.2 [Tier 1: Core Dependencies](#32-tier-1-core-dependencies)
   - 3.3 [Tier 2: Enhanced Markdown](#33-tier-2-enhanced-markdown)
   - 3.4 [Tier 3: Future Enhancements](#34-tier-3-future-enhancements)
4. [Content Architecture](#4-content-architecture)
   - 4.1 [Directory Structure](#41-directory-structure)
   - 4.2 [Frontmatter Schema](#42-frontmatter-schema)
   - 4.3 [Content Categories](#43-content-categories)
5. [Component Architecture](#5-component-architecture)
   - 5.1 [Page Components](#51-page-components)
   - 5.2 [Custom MDX Components](#52-custom-mdx-components)
   - 5.3 [Layout System](#53-layout-system)
   - 5.4 [Table of Contents Architecture](#54-table-of-contents-architecture)
6. [Build System Integration](#6-build-system-integration)
   - 6.1 [Vite MDX Plugin](#61-vite-mdx-plugin)
   - 6.2 [Prerendering](#62-prerendering)
   - 6.3 [Sitemap Integration](#63-sitemap-integration)
7. [SEO Architecture](#7-seo-architecture)
8. [Reference Implementation](#8-reference-implementation)
9. [Decision Log](#9-decision-log)

---

## 1. Overview

This document describes the architectural approach for adding a blog to the Chat2Deal landing page. The blog serves as a content marketing channel to improve organic search traffic and provide educational content about WhatsApp + CRM integration.

The architecture leverages MDX (Markdown with JSX) to enable rich, interactive blog content while maintaining the simplicity of markdown-based authoring.

---

## 2. Design Goals

| Goal | Description |
|------|-------------|
| **SEO-First** | Blog content must be fully indexable by search engines with proper meta tags, structured data, and prerendered HTML |
| **Developer Experience** | Authors write content in MDX files with familiar markdown syntax, enhanced with React components when needed |
| **Consistency** | Architecture mirrors the proven boring-calc/website implementation for cross-project familiarity |
| **Performance** | Fast page loads with optimized bundles, lazy-loaded images, and minimal JavaScript |
| **Extensibility** | Easy to add new custom components, content categories, and features over time |
| **Maintainability** | Content is co-located with metadata, no external CMS dependencies, all content in version control |

---

## 3. Technology Selection

### 3.1 Why MDX Over Plain Markdown

The Landing page already has `react-markdown` installed, but MDX provides significant advantages:

| Feature | Plain Markdown | MDX |
|---------|----------------|-----|
| Embed React components | No | Yes |
| Interactive demos | No | Yes |
| Custom styling per element | Limited | Full control |
| TypeScript support | No | Yes |
| Component props | No | Yes |

**Use Cases Enabled by MDX:**
- Embed CTA buttons that link to `/#get-started`
- Show feature highlight callouts with icons
- Display styled screenshots with captions
- Embed video demos inline
- Add interactive pricing comparisons

### 3.2 Tier 1: Core Dependencies

These packages are required for basic MDX blog functionality:

| Package | Purpose | Notes |
|---------|---------|-------|
| `@mdx-js/mdx` | MDX compiler | Core MDX processing |
| `@mdx-js/react` | React integration | MDXProvider for component injection |
| `@mdx-js/rollup` | Vite/Rollup plugin | Build-time MDX compilation |
| `gray-matter` | Frontmatter parsing | Extract YAML metadata from MDX files |
| `@tailwindcss/typography` | Prose styling | Beautiful default typography for article content |

### 3.3 Tier 2: Enhanced Markdown

These packages extend markdown capabilities:

| Package | Purpose | Notes |
|---------|---------|-------|
| `remark-gfm` | GitHub-flavored markdown | Tables, strikethrough, autolinks, task lists |
| `remark-frontmatter` | Parse YAML frontmatter | Required for gray-matter integration |
| `remark-mdx-frontmatter` | Export frontmatter as JS | Access metadata in components |
| `rehype-slug` | Add IDs to headings | Enable anchor links for table of contents |

### 3.4 Tier 3: Future Enhancements

These packages can be added later as needs arise:

| Package | Purpose | When to Add |
|---------|---------|-------------|
| `prismjs` or `shiki` | Code syntax highlighting | If publishing technical tutorials |
| `rehype-autolink-headings` | Clickable heading anchors | For long-form content with deep linking |
| `remark-reading-time` | Auto-calculate reading time | When manual estimation becomes tedious |

---

## 4. Content Architecture

### 4.1 Directory Structure

```
Landing/
├── src/
│   ├── content/
│   │   └── blog/                          # Blog post MDX files
│   │       ├── whatsapp-crm-integration-guide.mdx
│   │       ├── pipedrive-whatsapp-best-practices.mdx
│   │       └── sales-team-messaging-tips.mdx
│   │
│   └── features/
│       └── blog/                          # Blog feature module
│           ├── types.ts                   # TypeScript interfaces
│           ├── business/                  # Business logic
│           │   ├── mdx-loader.ts          # Load and parse MDX files
│           │   └── toc-generator.ts       # Generate table of contents
│           └── components/                # UI components
│               ├── BlogLayout.tsx         # Single post layout
│               ├── BlogIndex.tsx          # Blog listing page
│               ├── BlogCard.tsx           # Post preview card
│               ├── TableOfContents.tsx    # Sticky sidebar TOC
│               └── mdx-components/        # Custom MDX components
│
└── public/
    └── blog/
        └── images/                        # Blog post images
```

**Architectural Decisions:**
- Content lives in `src/content/blog/` to enable Vite's asset handling
- Feature module follows existing pattern from `boring-calc/website/src/features/guides/`
- Images stored in `public/blog/images/` for simple URL paths in MDX

### 4.2 Frontmatter Schema

Every blog post must include YAML frontmatter with standardized fields:

```yaml
---
title: "Page title and H1"                    # Required: 10-70 chars
description: "Meta description for SEO"       # Required: 100-160 chars
slug: "url-path-segment"                      # Required: lowercase, hyphenated
category: "Guides"                            # Required: Guides | Tips | News
keywords: ["keyword1", "keyword2"]            # Required: SEO keywords array
publishDate: "2025-01-15"                     # Required: ISO date
lastUpdated: "2025-01-20"                     # Optional: ISO date
author: "Chat2Deal Team"                      # Optional: defaults to "Chat2Deal Team"
featuredImage: "/blog/images/hero.png"        # Optional: OG image
readingTime: 5                                # Optional: auto-calculated if omitted
---
```

**TypeScript Interface:**

```typescript
interface BlogFrontmatter {
  title: string;
  description: string;
  slug: string;
  category: 'Guides' | 'Tips' | 'News';
  keywords: string[];
  publishDate: string;
  lastUpdated?: string;
  author?: string;
  featuredImage?: string;
  readingTime?: number;
}
```

### 4.3 Content Categories

| Category | Purpose | Example Topics |
|----------|---------|----------------|
| **Guides** | Educational how-to content | Integration setup, best practices, workflows |
| **Tips** | Quick actionable advice | Productivity hacks, feature spotlights |
| **News** | Product updates and announcements | New features, company updates |

---

## 5. Component Architecture

### 5.1 Page Components

| Component | Route | Purpose |
|-----------|-------|---------|
| `BlogIndex` | `/blog` | Lists all published posts with filtering by category |
| `BlogPost` | `/blog/:slug` | Renders individual post with layout and TOC |

### 5.2 Custom MDX Components

These components can be used directly in MDX files:

| Component | Purpose | Example Usage |
|-----------|---------|---------------|
| `CTAButton` | Call-to-action links | `<CTAButton href="/#get-started">Try Free</CTAButton>` |
| `FeatureHighlight` | Feature callout boxes | `<FeatureHighlight title="Auto-Lookup">...</FeatureHighlight>` |
| `Screenshot` | Styled images with captions | `<Screenshot src="/blog/images/sidebar.png" alt="..." />` |
| `VideoEmbed` | Embedded video player | `<VideoEmbed src="/demo.mp4" />` |

**Component Registration:**

```typescript
// mdx-components/index.tsx
export const mdxComponents = {
  CTAButton,
  FeatureHighlight,
  Screenshot,
  VideoEmbed,
};
```

### 5.3 Layout System

The blog uses a two-column layout on desktop:

```
┌─────────────────────────────────────────────────────────┐
│ Breadcrumbs: Home › Blog › Post Title                   │
├─────────────────────────────────────────────────────────┤
│ Category Badge                                          │
│ Post Title (H1)                                         │
│ Published Date • Reading Time                           │
├─────────────────────────────────────┬───────────────────┤
│                                     │                   │
│ Article Content (prose)             │ Table of Contents │
│ - MDX rendered content              │ - H2 headings     │
│ - Custom components                 │ - H3 subheadings  │
│ - Images, code blocks               │ - Sticky position │
│                                     │                   │
└─────────────────────────────────────┴───────────────────┘
```

**Responsive Behavior:**
- Desktop (lg+): Two-column with sticky TOC sidebar
- Mobile: Single column, TOC hidden or collapsed

### 5.4 Table of Contents Architecture

The Table of Contents (TOC) provides navigation within long-form blog posts with active section highlighting.

#### 5.4.1 TOC Generation

TOC is automatically extracted from MDX content at build time:

```typescript
// business/toc-generator.ts
interface TOCItem {
  id: string;        // Heading ID for anchor links (e.g., "getting-started")
  text: string;      // Heading text (e.g., "Getting Started")
  level: 2 | 3;      // H2 or H3 only
  children?: TOCItem[]; // H3 items nested under parent H2
}

// Parses MDX content string to extract H2/H3 headings
function extractTOCFromContent(content: string): TOCItem[]
```

**Heading ID Generation:**
- Text is lowercased and special characters removed
- Spaces converted to hyphens
- Example: "Understanding CD Rates" → `understanding-cd-rates`
- IDs are also added by `rehype-slug` plugin for anchor linking

#### 5.4.2 Active Section Tracking

The TOC highlights the currently visible section using Intersection Observer:

```typescript
// hooks/useActiveSection.ts
function useActiveSection(headingIds: string[]): string | null
```

**How it works:**
1. IntersectionObserver monitors all H2/H3 heading elements
2. When headings enter/exit the viewport, observer fires
3. The topmost visible heading becomes the "active" section
4. TOC highlights the active item with visual indicator

**Observer Configuration:**
```typescript
{
  rootMargin: '-80px 0px -80% 0px',  // 80px = header height offset
  threshold: 0
}
```

This ensures:
- Heading is considered "active" when it's near the top of viewport
- Bottom 80% of viewport is ignored (reader's focus area)

#### 5.4.3 TOC Component Features

| Feature | Description |
|---------|-------------|
| **Sticky positioning** | TOC stays visible while scrolling (`sticky top-24`) |
| **Nested structure** | H3 items indent under parent H2 |
| **Active highlighting** | Current section has bold text + left border accent |
| **Smooth scrolling** | Click jumps to heading with smooth animation |
| **URL hash update** | Clicking updates URL for shareable deep links |
| **Scroll offset** | Accounts for fixed header (80px offset) |

#### 5.4.4 Visual Design

```
┌─────────────────────────┐
│ On This Page            │  ← Title
├─────────────────────────┤
│ │ Introduction          │  ← H2 (muted)
│ │ Getting Started       │  ← H2 (muted)
│ ┃ Why Use MDX        ●  │  ← H2 (ACTIVE - bold, accent border)
│ │   ├─ Benefits         │  ← H3 child (indented, muted)
│ │   └─ Use Cases        │  ← H3 child (indented, muted)
│ │ Configuration         │  ← H2 (muted)
│ │ Conclusion            │  ← H2 (muted)
└─────────────────────────┘
```

**Styling:**
- Inactive items: `text-muted-foreground/60`
- Active item: `text-primary font-bold border-l-4 border-primary`
- Left border line: `border-l-2 border-border` (subtle guide line)

#### 5.4.5 Reference Implementation

From `boring-calc/website/src/features/guides/`:

| File | Purpose |
|------|---------|
| `components/TableOfContents.tsx` | TOC UI component with click handling |
| `hooks/useActiveSection.ts` | IntersectionObserver hook for active tracking |
| `business/toc-generator.ts` | Extract TOC from MDX content string |
| `types.ts` | `TOCItem` interface definition |

---

## 6. Build System Integration

### 6.1 Vite MDX Plugin

MDX plugin must be registered **before** the React plugin in Vite config:

```typescript
// vite.config.ts
import mdx from '@mdx-js/rollup'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import remarkFrontmatter from 'remark-frontmatter'
import remarkMdxFrontmatter from 'remark-mdx-frontmatter'

export default defineConfig({
  plugins: [
    mdx({
      remarkPlugins: [
        remarkFrontmatter,
        [remarkMdxFrontmatter, { name: 'frontmatter' }],
        remarkGfm,
      ],
      rehypePlugins: [rehypeSlug],
      providerImportSource: '@mdx-js/react',
    }),
    react(),  // Must come AFTER mdx
  ],
})
```

### 6.2 Prerendering

Blog posts must be prerendered for SEO. The existing prerender system will be extended:

```javascript
// scripts/build-with-prerender.js
const blogRoutes = discoverBlogRoutes(); // Read from content/blog/
const routes = [
  '/',
  '/privacy-policy',
  '/terms-of-service',
  '/blog',
  ...blogRoutes,  // /blog/whatsapp-crm-integration-guide, etc.
];
```

### 6.3 Sitemap Integration

Blog routes will be automatically discovered and added to sitemap:

```javascript
// scripts/generate-sitemap.js
// Blog posts: priority 0.7, changefreq monthly
blogPosts.forEach(post => {
  sitemap.write({
    url: `/blog/${post.slug}`,
    changefreq: 'monthly',
    priority: 0.7,
    lastmod: post.lastUpdated || post.publishDate,
  });
});

// Blog index: priority 0.8, changefreq weekly
sitemap.write({ url: '/blog', changefreq: 'weekly', priority: 0.8 });
```

---

## 7. SEO Architecture

### 7.1 Meta Tags

Each blog post generates comprehensive meta tags via `react-helmet-async`:

| Tag | Source |
|-----|--------|
| `<title>` | `{frontmatter.title} \| Chat2Deal Blog` |
| `<meta name="description">` | `frontmatter.description` |
| `<meta name="keywords">` | `frontmatter.keywords.join(', ')` |
| `<link rel="canonical">` | `https://chat2deal.com/blog/{slug}` |
| `<meta property="og:*">` | Open Graph tags for social sharing |
| `<meta property="article:*">` | Article metadata (published, modified, author) |

### 7.2 Structured Data

Blog posts include JSON-LD Article schema:

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "...",
  "description": "...",
  "datePublished": "2025-01-15",
  "dateModified": "2025-01-20",
  "author": { "@type": "Organization", "name": "Chat2Deal" },
  "publisher": { "@type": "Organization", "name": "Chat2Deal" }
}
```

### 7.3 Azure Static Web Apps Routes

```json
// staticwebapp.config.json
{
  "routes": [
    { "route": "/blog", "rewrite": "/index.html" },
    { "route": "/blog/*", "rewrite": "/index.html" }
  ]
}
```

---

## 8. Reference Implementation

The blog architecture is based on the proven implementation in:

```
c:\myproj\boring-calc\website\
├── vite.config.ts              # MDX plugin configuration
├── src/
│   ├── content/guides/         # MDX content files
│   └── features/guides/        # Guide feature module
│       ├── types.ts
│       ├── business/
│       │   ├── mdx-loader.ts
│       │   └── toc-generator.ts
│       └── components/
│           ├── GuidePageLayout.tsx
│           ├── TableOfContents.tsx
│           └── mdx-components/
```

**Key files to reference:**
- `vite.config.ts` - MDX plugin setup with remark/rehype plugins
- `types.ts` - Frontmatter and metadata interfaces
- `GuidePageLayout.tsx` - Two-column layout with TOC
- `mdx-components/index.tsx` - Component registry pattern

---

## 9. Decision Log

| Decision | Rationale | Date |
|----------|-----------|------|
| Use MDX over plain Markdown | Enables React component embedding for CTAs, feature highlights, and interactive content | 2025-11-27 |
| No headless CMS | Keep content in version control, avoid external dependencies, team is technical | 2025-11-27 |
| Match boring-calc architecture | Proven pattern, consistent DX across projects, reduces learning curve | 2025-11-27 |
| Tier 1 + Tier 2 dependencies | Provides complete markdown features (tables, frontmatter, anchors) without unnecessary complexity | 2025-11-27 |
| Feature module pattern | Isolates blog code, follows existing project conventions | 2025-11-27 |
| Content in `src/content/` | Enables Vite's asset handling and hot reload during development | 2025-11-27 |

---

## Related Documents

- [Landing-SEO-Architecture.md](Landing-SEO-Architecture.md) - SEO system the blog integrates with
- [UI-Design-Specification.md](UI-Design-Specification.md) - Visual design guidelines
- [Brand-Guide.md](../Brand-Guide.md) - Brand voice and tone for content
