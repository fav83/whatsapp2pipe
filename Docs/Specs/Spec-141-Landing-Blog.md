# Spec-141: Landing Page Blog

**Feature:** Landing Page Blog with MDX
**Date:** 2025-11-30
**Status:** 📋 Planned
**Implementation Status:** 🔲 Not Started
**Last Updated:** 2025-11-30
**Dependencies:** Landing-Blog-Architecture, Landing-SEO-Architecture, UI-Design-Specification

---

**Related Docs:**
- [Landing-Blog-Architecture.md](../Architecture/Landing-Blog-Architecture.md) — Full architectural reference
- [Landing-SEO-Architecture.md](../Architecture/Landing-SEO-Architecture.md) — SEO system integration
- [UI-Design-Specification.md](../Architecture/UI-Design-Specification.md) — Visual design guidelines
- [Brand-Guide.md](../Brand-Guide.md) — Brand voice and tone

---

## 1. Overview

Add a blog to the Chat2Deal landing page to drive organic search traffic and educate potential users about WhatsApp + Pipedrive integration. The blog uses MDX for rich content with embedded React components, integrates visually with the existing landing page, and is fully optimized for SEO.

**Why this matters:** Content marketing is a key channel for organic discovery. The blog positions Chat2Deal as an authority on WhatsApp-CRM integration while providing practical value to potential users.

---

## 2. Objectives

- Launch a fully-functional blog integrated with the existing landing page
- Enable rich content authoring via MDX with custom React components
- Achieve full SEO optimization (meta tags, structured data, prerendering, sitemap)
- Provide excellent reading experience with Table of Contents navigation
- Maintain visual consistency with the Chat2Deal brand

---

## 3. Scope

### 3.1 In Scope

| Feature | Description |
|---------|-------------|
| **Blog index page** | Card grid listing all posts at `/blog` |
| **Blog post pages** | Individual posts at `/blog/:slug` with TOC sidebar |
| **Table of Contents** | Sticky sidebar with active section highlighting |
| **Custom MDX components** | CTAButton, FeatureHighlight, Screenshot, VideoEmbed |
| **Full SEO package** | Meta tags, Open Graph, JSON-LD structured data, canonical URLs |
| **Prerendering** | Static HTML generation for SEO crawlers |
| **Sitemap integration** | Auto-add blog posts to sitemap.xml |
| **Navigation integration** | Blog link in Header and Footer |
| **First blog post** | Convert draft to MDX: "How to Capture WhatsApp Leads into Pipedrive Instantly" |

### 3.2 Out of Scope (Future Enhancement)

| Feature | Rationale |
|---------|-----------|
| Category filtering | Only one post initially; add when content library grows |
| Search functionality | Not needed for small content library |
| Comments | Adds complexity; not needed for SEO content |
| RSS feed | Can add later if requested |
| Individual author profiles | All posts attributed to "Chat2Deal Team" |

---

## 4. Routes & URLs

| Route | Component | Purpose |
|-------|-----------|---------|
| `/blog` | `BlogIndex` | Lists all published posts in card grid |
| `/blog/:slug` | `BlogPost` | Renders individual post with TOC |

**URL Structure:** Simple `/blog/slug` pattern (no categories or dates in URL).

**First Post URL:** `/blog/capture-whatsapp-leads-pipedrive`

---

## 5. Navigation Integration

### 5.1 Header Changes

Add "Blog" link to the Header navigation, positioned between "Pricing" and the sign-in button.

**New Header Layout:**
```
[Logo]                    [Pricing] [Blog] [Sign in with Pipedrive]
```

**Behavior:**
- From any page: navigates to `/blog`
- Uses standard `<Link>` from react-router-dom

### 5.2 Footer Changes

Add "Blog" link to the Footer alongside existing legal links.

**Footer Links:**
```
Privacy Policy  •  Terms of Service  •  Blog
```

**Files to modify:**
- `Landing/src/components/Header.tsx`
- `Landing/src/components/Footer.tsx`

---

## 6. Technology Stack

### 6.1 New Dependencies

**Tier 1 — Core MDX:**

| Package | Version | Purpose |
|---------|---------|---------|
| `@mdx-js/mdx` | ^3.x | MDX compiler |
| `@mdx-js/react` | ^3.x | React integration, MDXProvider |
| `@mdx-js/rollup` | ^3.x | Vite/Rollup plugin |
| `gray-matter` | ^4.x | Frontmatter parsing |
| `@tailwindcss/typography` | ^0.5.x | Prose styling for article content |

**Tier 2 — Enhanced Markdown:**

| Package | Version | Purpose |
|---------|---------|---------|
| `remark-gfm` | ^4.x | GitHub-flavored markdown (tables, strikethrough) |
| `remark-frontmatter` | ^5.x | Parse YAML frontmatter |
| `remark-mdx-frontmatter` | ^4.x | Export frontmatter as JS module |
| `rehype-slug` | ^6.x | Add IDs to headings for anchor links |
| `remark-reading-time` | ^2.x | Auto-calculate reading time |

### 6.2 Vite Configuration

MDX plugin must be registered **before** React plugin:

```typescript
// vite.config.ts
import mdx from '@mdx-js/rollup';
import remarkGfm from 'remark-gfm';
import remarkFrontmatter from 'remark-frontmatter';
import remarkMdxFrontmatter from 'remark-mdx-frontmatter';
import rehypeSlug from 'rehype-slug';
import remarkReadingTime from 'remark-reading-time';

export default defineConfig({
  plugins: [
    mdx({
      remarkPlugins: [
        remarkFrontmatter,
        [remarkMdxFrontmatter, { name: 'frontmatter' }],
        remarkGfm,
        remarkReadingTime,
      ],
      rehypePlugins: [rehypeSlug],
      providerImportSource: '@mdx-js/react',
    }),
    react(),  // Must come AFTER mdx
  ],
});
```

---

## 7. Directory Structure

```
Landing/
├── src/
│   ├── content/
│   │   └── blog/                              # Blog post MDX files
│   │       └── capture-whatsapp-leads-pipedrive.mdx
│   │
│   ├── features/
│   │   └── blog/                              # Blog feature module
│   │       ├── index.ts                       # Public exports
│   │       ├── types.ts                       # TypeScript interfaces
│   │       ├── config.ts                      # Blog configuration
│   │       ├── business/
│   │       │   ├── mdx-loader.ts              # Load and parse MDX files
│   │       │   └── toc-generator.ts           # Generate table of contents
│   │       ├── hooks/
│   │       │   └── useActiveSection.ts        # TOC active section tracking
│   │       └── components/
│   │           ├── BlogIndex.tsx              # Blog listing page
│   │           ├── BlogPost.tsx               # Single post page
│   │           ├── BlogCard.tsx               # Post preview card
│   │           ├── BlogLayout.tsx             # Article layout wrapper
│   │           ├── TableOfContents.tsx        # Sticky sidebar TOC
│   │           └── mdx-components/
│   │               ├── index.ts               # Component registry
│   │               ├── CTAButton.tsx
│   │               ├── FeatureHighlight.tsx
│   │               ├── Screenshot.tsx
│   │               └── VideoEmbed.tsx
│   │
│   └── pages/
│       └── blog/
│           ├── index.tsx                      # Route: /blog
│           └── [slug].tsx                     # Route: /blog/:slug
│
└── public/
    └── blog/
        └── images/
            ├── placeholder.png                # Default featured image
            └── capture-whatsapp-leads-pipedrive/
                └── (post-specific images)
```

---

## 8. Frontmatter Schema

Every blog post must include YAML frontmatter:

```yaml
---
title: "Page title and H1"                    # Required: 10-70 chars
description: "Meta description for SEO"       # Required: 100-160 chars
slug: "url-path-segment"                      # Required: lowercase, hyphenated
keywords: ["keyword1", "keyword2"]            # Required: SEO keywords array
publishDate: "2025-01-15"                     # Required: ISO date
lastUpdated: "2025-01-20"                     # Optional: ISO date
featuredImage: "/blog/images/hero.png"        # Optional: defaults to placeholder
---
```

**TypeScript Interface:**

```typescript
// features/blog/types.ts
export interface BlogFrontmatter {
  title: string;
  description: string;
  slug: string;
  keywords: string[];
  publishDate: string;
  lastUpdated?: string;
  featuredImage?: string;
}

export interface BlogPost {
  frontmatter: BlogFrontmatter;
  content: React.ComponentType;      // Compiled MDX component
  readingTime: number;               // Auto-calculated minutes
  toc: TOCItem[];                    // Extracted headings
}

export interface TOCItem {
  id: string;           // Heading ID for anchor (e.g., "getting-started")
  text: string;         // Heading text (e.g., "Getting Started")
  level: 2 | 3;         // H2 or H3
  children?: TOCItem[]; // H3 items nested under parent H2
}
```

**Hardcoded Values:**
- `author`: Always "Chat2Deal Team" (not configurable per post)
- `category`: Field exists in schema but filtering not implemented

---

## 9. Configuration

### 9.1 Environment Variables

| Variable | Purpose | Default |
|----------|---------|---------|
| `VITE_BLOG_CTA_URL` | Default href for CTAButton components | OAuth flow URL |

**Usage:**
```typescript
// CTAButton uses this as default when no href prop provided
const defaultCTAUrl = import.meta.env.VITE_BLOG_CTA_URL || '/';
```

### 9.2 Blog Config File

```typescript
// features/blog/config.ts
export const blogConfig = {
  postsPerPage: 12,                    // For future pagination
  defaultAuthor: 'Chat2Deal Team',
  defaultFeaturedImage: '/blog/images/placeholder.png',
  dateFormat: 'MMMM d, yyyy',          // e.g., "January 15, 2025"
};
```

---

## 10. Component Specifications

### 10.1 BlogIndex (`/blog`)

**Purpose:** Display all blog posts in a responsive card grid.

**Layout:**
- Header component (same as all pages)
- Page title: "Blog" with brief intro text
- Card grid: 1 column (mobile), 2 columns (md), 3 columns (lg)
- Footer component

**BlogCard Contents:**
- Featured image (or placeholder)
- Post title (linked to post)
- Description (truncated if needed)
- Publish date
- Reading time (e.g., "5 min read")

**Sorting:** Posts sorted by `publishDate` descending (newest first).

### 10.2 BlogPost (`/blog/:slug`)

**Purpose:** Render individual blog post with full content and TOC.

**Layout (Desktop lg+):**
```
┌─────────────────────────────────────────────────────────────┐
│ Header                                                       │
├─────────────────────────────────────────────────────────────┤
│ Breadcrumbs: Home › Blog › Post Title                        │
├─────────────────────────────────────────────────────────────┤
│ Post Title (H1)                                              │
│ Published Date • Reading Time                                │
├─────────────────────────────────────────┬───────────────────┤
│                                         │                   │
│ Article Content (~70%)                  │ TOC Sidebar (~30%)│
│ - Prose-styled MDX content              │ - "On This Page"  │
│ - Custom components                     │ - H2/H3 links     │
│ - Images, etc.                          │ - Sticky position │
│                                         │ - Active highlight│
│                                         │                   │
├─────────────────────────────────────────┴───────────────────┤
│ Footer                                                       │
└─────────────────────────────────────────────────────────────┘
```

**Layout (Mobile):**
- Single column, full-width content
- TOC hidden (or collapsed at top — design decision during implementation)

### 10.3 TableOfContents

**Features:**
- Sticky positioning (`sticky top-24`)
- Extracts H2 and H3 headings from content
- H3 items indent under parent H2
- Active section highlighting via IntersectionObserver
- Click scrolls to heading with smooth animation
- Updates URL hash for shareable deep links
- Accounts for fixed header (80px scroll offset)

**Active Section Logic:**
```typescript
// IntersectionObserver config
{
  rootMargin: '-80px 0px -80% 0px',
  threshold: 0
}
```

**Visual Design:**
- Title: "On This Page"
- Inactive items: `text-muted-foreground/60`
- Active item: `text-primary font-semibold` with left border accent
- Left guide line: subtle `border-l` for visual hierarchy

### 10.4 Custom MDX Components

All components should be **polished and on-brand** from day one, matching the landing page's visual language (indigo accents, shadows, rounded corners, smooth transitions).

#### CTAButton

**Purpose:** Call-to-action links within blog content.

**Props:**
```typescript
interface CTAButtonProps {
  href?: string;        // Optional: overrides default CTA URL
  children: ReactNode;  // Button text
  variant?: 'primary' | 'secondary';  // Default: 'primary'
}
```

**Behavior:**
- If `href` provided: use that URL
- If no `href`: use `VITE_BLOG_CTA_URL` environment variable
- If env var not set: default to OAuth flow (same as SignInButton)

**Styling:**
- Primary: Matches landing page CTA buttons (indigo background, white text)
- Hover: Slight scale, shadow increase
- Full-width on mobile, auto-width on desktop

**Usage in MDX:**
```mdx
<CTAButton>Try Chat2Deal Free</CTAButton>
<CTAButton href="/blog/other-post" variant="secondary">Read More</CTAButton>
```

#### Screenshot

**Purpose:** Display images with optional captions, styled consistently.

**Props:**
```typescript
interface ScreenshotProps {
  src: string;          // Image path
  alt: string;          // Alt text (required for a11y)
  caption?: string;     // Optional caption below image
}
```

**Styling:**
- Rounded corners (`rounded-lg`)
- Subtle shadow
- Border for definition
- Caption: smaller text, muted color, centered

**Usage in MDX:**
```mdx
<Screenshot
  src="/blog/images/capture-whatsapp-leads-pipedrive/sidebar.png"
  alt="Chat2Deal sidebar showing person found"
  caption="The sidebar automatically detects contacts in your CRM"
/>
```

#### FeatureHighlight

**Purpose:** Callout boxes to emphasize key points.

**Props:**
```typescript
interface FeatureHighlightProps {
  title?: string;       // Optional heading
  icon?: 'tip' | 'info' | 'warning';  // Default: 'info'
  children: ReactNode;  // Content
}
```

**Styling:**
- Rounded box with subtle background tint
- Left border accent (color based on icon type)
- Icon displayed if specified
- Indigo tint for 'info', green for 'tip', amber for 'warning'

**Usage in MDX:**
```mdx
<FeatureHighlight title="Pro Tip" icon="tip">
  You can also search by company name if the person is associated with an organization.
</FeatureHighlight>
```

#### VideoEmbed

**Purpose:** Embed video content with consistent styling.

**Props:**
```typescript
interface VideoEmbedProps {
  src: string;          // Video URL (mp4 or YouTube embed)
  title?: string;       // Accessible title
  aspectRatio?: '16:9' | '4:3';  // Default: '16:9'
}
```

**Styling:**
- Responsive container maintaining aspect ratio
- Rounded corners
- Shadow for depth
- Play button overlay for mp4 (uses native controls)

**Usage in MDX:**
```mdx
<VideoEmbed src="/demo.mp4" title="Chat2Deal Demo" />
```

---

## 11. SEO Implementation

### 11.1 Meta Tags

Each blog post generates meta tags via `react-helmet-async`:

| Tag | Source |
|-----|--------|
| `<title>` | `{frontmatter.title} \| Chat2Deal Blog` |
| `<meta name="description">` | `frontmatter.description` |
| `<meta name="keywords">` | `frontmatter.keywords.join(', ')` |
| `<link rel="canonical">` | `https://chat2deal.com/blog/{slug}` |
| `<meta property="og:title">` | `frontmatter.title` |
| `<meta property="og:description">` | `frontmatter.description` |
| `<meta property="og:image">` | `frontmatter.featuredImage` or placeholder |
| `<meta property="og:type">` | `article` |
| `<meta property="article:published_time">` | `frontmatter.publishDate` |
| `<meta property="article:modified_time">` | `frontmatter.lastUpdated` (if present) |
| `<meta property="article:author">` | `Chat2Deal Team` |

### 11.2 Structured Data (JSON-LD)

Each blog post includes Article schema:

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "{title}",
  "description": "{description}",
  "image": "{featuredImage}",
  "datePublished": "{publishDate}",
  "dateModified": "{lastUpdated or publishDate}",
  "author": {
    "@type": "Organization",
    "name": "Chat2Deal"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Chat2Deal",
    "logo": {
      "@type": "ImageObject",
      "url": "https://chat2deal.com/logo.png"
    }
  }
}
```

### 11.3 Prerendering

Extend existing prerender script to discover and render blog routes:

```javascript
// scripts/build-with-prerender.js
const blogRoutes = discoverBlogRoutes();  // Read from src/content/blog/
const routes = [
  '/',
  '/privacy-policy',
  '/terms-of-service',
  '/blog',
  ...blogRoutes,  // /blog/capture-whatsapp-leads-pipedrive, etc.
];
```

### 11.4 Sitemap Integration

Extend sitemap generation to include blog posts:

```javascript
// scripts/generate-sitemap.js

// Blog index
sitemap.write({
  url: '/blog',
  changefreq: 'weekly',
  priority: 0.8
});

// Individual posts
blogPosts.forEach(post => {
  sitemap.write({
    url: `/blog/${post.slug}`,
    changefreq: 'monthly',
    priority: 0.7,
    lastmod: post.lastUpdated || post.publishDate,
  });
});
```

---

## 12. Azure Static Web Apps Configuration

Add blog routes to `staticwebapp.config.json`:

```json
{
  "routes": [
    { "route": "/blog", "rewrite": "/index.html" },
    { "route": "/blog/*", "rewrite": "/index.html" }
  ]
}
```

---

## 13. First Blog Post

### 13.1 Source

Convert `gemini3-post-1.md` to MDX format with proper frontmatter.

### 13.2 Frontmatter

```yaml
---
title: "How to Capture WhatsApp Leads into Pipedrive Instantly"
description: "Stop manually copying WhatsApp leads to Pipedrive. Learn how to capture contacts, sync chats, and manage deals instantly with the Chat2Deal Chrome extension."
slug: "capture-whatsapp-leads-pipedrive"
keywords:
  - "whatsapp pipedrive integration"
  - "capture whatsapp leads"
  - "whatsapp crm"
  - "pipedrive chrome extension"
  - "whatsapp lead capture"
publishDate: "2025-11-30"
featuredImage: "/blog/images/placeholder.png"
---
```

### 13.3 Content Modifications

- Replace markdown links `[text](url)` with `<CTAButton>` components for CTAs
- Add `<Screenshot>` components where images are suggested
- Consider `<FeatureHighlight>` for the "If they exist / If they don't" section
- Remove "Suggested Images" and "Internal Link Placements" notes (author instructions)
- Update internal links to use actual blog slugs once other posts exist

---

## 14. Placeholder Image

Create a branded placeholder image for posts without a featured image:

**Specifications:**
- Dimensions: 1200x630px (optimal for Open Graph)
- Design: Chat2Deal logo centered on indigo-to-slate gradient
- Format: PNG
- Location: `public/blog/images/placeholder.png`

---

## 15. Acceptance Criteria

### 15.1 Navigation
- [ ] "Blog" link appears in Header between "Pricing" and sign-in button
- [ ] "Blog" link appears in Footer alongside legal links
- [ ] Both links navigate to `/blog`

### 15.2 Blog Index (`/blog`)
- [ ] Page renders with Header and Footer
- [ ] Displays card grid of all posts
- [ ] Cards show: featured image, title, description, date, reading time
- [ ] Grid is responsive: 1 col (mobile), 2 col (md), 3 col (lg)
- [ ] Posts sorted by publish date (newest first)
- [ ] SEO meta tags present (title, description, canonical)

### 15.3 Blog Post (`/blog/:slug`)
- [ ] Page renders individual post content
- [ ] Two-column layout on desktop (content left, TOC right)
- [ ] Single-column on mobile (TOC hidden or collapsed)
- [ ] Breadcrumbs show: Home › Blog › Post Title
- [ ] Title, date, and reading time displayed
- [ ] Article content styled with Tailwind Typography prose
- [ ] Custom MDX components render correctly

### 15.4 Table of Contents
- [ ] Displays H2 and H3 headings from content
- [ ] H3 items indent under parent H2
- [ ] Sticky positioning (stays visible while scrolling)
- [ ] Active section highlighting as user scrolls
- [ ] Click scrolls to heading smoothly
- [ ] URL hash updates on click

### 15.5 Custom MDX Components
- [ ] `<CTAButton>` renders styled button, uses env var or explicit href
- [ ] `<Screenshot>` renders image with optional caption
- [ ] `<FeatureHighlight>` renders callout box
- [ ] `<VideoEmbed>` renders video player
- [ ] All components match landing page visual style

### 15.6 SEO
- [ ] Meta tags (title, description, keywords, canonical) on all blog pages
- [ ] Open Graph tags for social sharing
- [ ] JSON-LD Article structured data on post pages
- [ ] Blog routes added to sitemap.xml
- [ ] Blog pages prerendered to static HTML

### 15.7 First Post
- [ ] Post accessible at `/blog/capture-whatsapp-leads-pipedrive`
- [ ] Content matches original draft with MDX enhancements
- [ ] Reading time auto-calculated and displayed
- [ ] Placeholder image used until real images provided

---

## 16. Implementation Order

Recommended sequence for implementation:

1. **Dependencies & Config** — Install packages, configure Vite MDX plugin
2. **Types & Structure** — Create feature module structure and TypeScript types
3. **MDX Loader** — Build content loading and parsing logic
4. **Blog Index** — Create listing page with BlogCard components
5. **Blog Post Layout** — Create post page with prose styling
6. **Table of Contents** — Add TOC generation and active section tracking
7. **MDX Components** — Build CTAButton, Screenshot, FeatureHighlight, VideoEmbed
8. **First Post** — Convert draft to MDX, add placeholder image
9. **Navigation** — Add Blog links to Header and Footer
10. **SEO** — Add meta tags, structured data
11. **Build Integration** — Update prerender and sitemap scripts
12. **Azure Config** — Add routes to staticwebapp.config.json

---

## 17. Testing Checklist

### Manual Testing
- [ ] Navigate to `/blog` — index page loads
- [ ] Click a blog card — navigates to post
- [ ] Scroll through post — TOC highlights active section
- [ ] Click TOC item — scrolls to heading
- [ ] Resize browser — responsive layout adjusts
- [ ] View page source — prerendered HTML present
- [ ] Check sitemap.xml — blog URLs included
- [ ] Share on social — Open Graph preview correct

### SEO Validation
- [ ] Run Lighthouse SEO audit
- [ ] Validate structured data with Google Rich Results Test
- [ ] Check meta tags with social media debuggers (Facebook, Twitter)

---

## 18. Open Questions

1. **TOC on mobile** — Hide completely, or show as collapsible section at top of article?
   *Recommendation: Hide for MVP, add collapsible later if users request.*

2. **Reading time display format** — "5 min read" or "5 minute read" or "5m"?
   *Recommendation: "5 min read" — concise and widely understood.*

3. **Blog index intro text** — What copy should appear above the card grid?
   *Suggestion: "Tips, guides, and updates for getting the most out of WhatsApp + Pipedrive."*

---

## 19. Future Enhancements

Items explicitly deferred from this spec:

| Feature | Notes |
|---------|-------|
| Category filtering | Add when content library exceeds ~10 posts |
| Pagination | Add when posts exceed `postsPerPage` (12) |
| Search | Consider Algolia or simple client-side search later |
| Related posts | Show related articles at bottom of posts |
| Social sharing buttons | Add if analytics show demand |
| RSS feed | Add if users request |
| Code syntax highlighting | Add if publishing technical tutorials |

---

## 20. Revision History

| Date | Version | Changes |
|------|---------|---------|
| 2025-11-30 | 1.0 | Initial specification |
