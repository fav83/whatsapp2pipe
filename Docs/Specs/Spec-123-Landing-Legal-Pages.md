# Spec-123: Landing Page Legal Pages

**Feature:** Feature 23 - Privacy Policy and Terms of Service Pages for Landing Site
**Date:** 2025-11-05
**Status:** ✅ Complete (Specification)
**Implementation Status:** ⏳ Not Started
**Dependencies:** None

---

**Related Docs:**
- [BRD-001-MVP-Pipedrive-WhatsApp.md](../BRDs/BRD-001-MVP-Pipedrive-WhatsApp.md) - Section 6.8 (Landing Page Legal Pages)
- [Plan-001-MVP-Feature-Breakdown.md](../Plans/Plan-001-MVP-Feature-Breakdown.md) - Feature 23

---

## 1. Overview

Implement dedicated Privacy Policy and Terms of Service pages for the Chat2Deal landing site. These pages provide legally required disclosures and build trust with potential users during closed beta. Content is stored as Markdown files and rendered with custom typography styling.

**Why this matters:** Legal compliance, user trust, professional appearance, and foundation for future beta signup flow.

**Architecture Pattern:** React Router for multi-page navigation, Markdown content files with react-markdown renderer, shared Header/Footer layout components.

**Reference Implementation:** Based on boring-calc website architecture (c:\myproj\boring-calc\website\)

---

## 2. Objectives

- Transform single-page landing site into multi-page application with React Router
- Create two legal page components (Privacy Policy, Terms of Service)
- Fetch and render Markdown content from public directory
- Apply custom Tailwind typography styling to legal content
- Add breadcrumb navigation ("← Back to Home") on legal pages
- Share Header and Footer components across all pages
- Update Footer links to new URL structure (/privacy-policy, /terms-of-service)
- Refactor App.tsx to wrap landing components in Home page route

---

## 3. URL Structure

### 3.1 Routing Table

| Page | URL | Component | Layout |
|------|-----|-----------|--------|
| Landing Page | `/` | `Home.tsx` | Header + Hero + Benefits + HowItWorks + FinalCTA + Footer |
| Privacy Policy | `/privacy-policy` | `PrivacyPolicy.tsx` | Header + Breadcrumb + Legal Content + Footer |
| Terms of Service | `/terms-of-service` | `TermsOfService.tsx` | Header + Breadcrumb + Legal Content + Footer |

### 3.2 URL Design Rationale

- `/privacy-policy` and `/terms-of-service` (not `/privacy` or `/terms`)
- Explicit, SEO-friendly URLs that clearly indicate legal content
- Matches reference implementation (boring-calc) for consistency
- Better for search engine indexing and user clarity

---

## 4. File Structure

### 4.1 New Files

```
Landing/
  public/
    content/
      legal/
        privacy-policy.md          (user will provide)
        terms-of-service.md        (user will provide)
  src/
    pages/
      Home.tsx                     (new - wraps existing landing components)
      legal/
        PrivacyPolicy.tsx          (new - renders markdown)
        TermsOfService.tsx         (new - renders markdown)
    components/
      Header.tsx                   (existing - already created)
      Footer.tsx                   (existing)
      Hero.tsx                     (existing)
      Benefits.tsx                 (existing)
      HowItWorks.tsx               (existing)
      FinalCTA.tsx                 (existing)
```

### 4.2 Modified Files

```
Landing/
  src/
    App.tsx                        (modified - add React Router)
    components/
      Footer.tsx                   (modified - update links)
  package.json                     (modified - add dependencies)
```

---

## 5. Dependencies

### 5.1 New Dependencies

**react-router-dom:**
- Purpose: Multi-page routing
- Version: `^7.9.3` (latest stable)
- Install: `npm install react-router-dom`

**react-markdown:**
- Purpose: Render Markdown content to React components
- Version: `^10.1.0` (latest stable)
- Install: `npm install react-markdown`

### 5.2 Dependency Rationale

**Why react-router-dom v7:**
- Latest stable version
- Improved performance and features over v6
- Better TypeScript support
- Matches boring-calc implementation approach

**Why react-markdown:**
- Simple, lightweight Markdown renderer
- Allows custom component styling
- No additional plugins needed for basic legal content
- Matches boring-calc implementation

**Why NO react-helmet-async:**
- SEO not critical for MVP landing page
- Reduces bundle size
- Can add later if needed for production
- Focus on getting legal pages functional quickly

---

## 6. Implementation

### 6.1 App.tsx - Add React Router

**File:** `Landing/src/App.tsx`

**Changes:**
- Import `BrowserRouter`, `Routes`, `Route` from `react-router-dom`
- Import new page components
- Wrap app in `<BrowserRouter>`
- Define routes for `/`, `/privacy-policy`, `/terms-of-service`
- Remove direct rendering of Hero, Benefits, etc. (moved to Home page)

**Implementation:**
```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import PrivacyPolicy from './pages/legal/PrivacyPolicy';
import TermsOfService from './pages/legal/TermsOfService';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

**Acceptance Criteria:**
- ✅ BrowserRouter wraps entire app
- ✅ Three routes defined (/, /privacy-policy, /terms-of-service)
- ✅ Navigation between pages works via browser URL
- ✅ Browser back/forward buttons work correctly
- ✅ No console errors on route changes

---

### 6.2 Home.tsx - Landing Page Wrapper

**File:** `Landing/src/pages/Home.tsx`

**Purpose:** Wrap existing landing page components (Hero, Benefits, HowItWorks, FinalCTA, Footer) into a routable page.

**Implementation:**
```tsx
import { Hero } from '../components/Hero';
import { Benefits } from '../components/Benefits';
import { HowItWorks } from '../components/HowItWorks';
import { FinalCTA } from '../components/FinalCTA';
import { Footer } from '../components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen">
      <Hero />
      <main>
        <Benefits />
        <HowItWorks />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
```

**Design Notes:**
- Exact same structure as original App.tsx
- No changes to landing page UI or behavior
- Simply moves content into a routable component

**Acceptance Criteria:**
- ✅ Landing page displays identically to before
- ✅ All sections render in correct order
- ✅ No visual regressions
- ✅ Responsive layout preserved

---

### 6.3 PrivacyPolicy.tsx - Privacy Policy Page

**File:** `Landing/src/pages/legal/PrivacyPolicy.tsx`

**Purpose:** Fetch and render privacy-policy.md with custom styling.

**Implementation:**
```tsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Markdown from 'react-markdown';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';

export default function PrivacyPolicy() {
  const [content, setContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch markdown content from public folder
    fetch('/content/legal/privacy-policy.md')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to load privacy policy');
        }
        return response.text();
      })
      .then((text) => {
        setContent(text);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Error loading privacy policy:', error);
        setError('Failed to load privacy policy. Please try again later.');
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-8 sm:py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb Navigation */}
          <div className="mb-6">
            <Link
              to="/"
              className="inline-flex items-center text-sm text-slate-600 hover:text-slate-700 transition-colors duration-200"
            >
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Home
            </Link>
          </div>

          {/* Legal Document Container */}
          <article className="prose prose-lg max-w-none">
            {isLoading ? (
              <div className="text-center text-slate-600">
                Loading Privacy Policy...
              </div>
            ) : error ? (
              <div className="text-center text-red-600">
                {error}
              </div>
            ) : (
              <Markdown
                components={{
                  // Customize heading styles
                  h1: ({ children }) => (
                    <h1 className="mb-4 text-3xl font-bold text-slate-900 sm:text-4xl">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="mt-8 mb-4 text-2xl font-bold text-slate-900">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="mt-6 mb-3 text-xl font-semibold text-slate-900">
                      {children}
                    </h3>
                  ),
                  // Customize paragraph styles
                  p: ({ children }) => (
                    <p className="mb-4 text-base leading-relaxed text-slate-700">
                      {children}
                    </p>
                  ),
                  // Customize list styles
                  ul: ({ children }) => (
                    <ul className="mb-4 ml-6 list-disc space-y-2 text-slate-700">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="mb-4 ml-6 list-decimal space-y-2 text-slate-700">
                      {children}
                    </ol>
                  ),
                  // Customize link styles
                  a: ({ children, href }) => (
                    <a
                      href={href}
                      className="text-blue-600 underline hover:text-blue-700 transition-colors duration-200"
                    >
                      {children}
                    </a>
                  ),
                  // Customize strong (bold) text
                  strong: ({ children }) => (
                    <strong className="font-semibold text-slate-900">
                      {children}
                    </strong>
                  ),
                  // Customize emphasis (italic) text
                  em: ({ children }) => (
                    <em className="italic text-slate-700">
                      {children}
                    </em>
                  ),
                  // Customize blockquote styles
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-blue-600 pl-4 italic text-slate-700 my-4">
                      {children}
                    </blockquote>
                  ),
                  // Customize horizontal rule
                  hr: () => (
                    <hr className="my-8 border-t border-slate-300" />
                  ),
                }}
              >
                {content}
              </Markdown>
            )}
          </article>
        </div>
      </main>

      <Footer />
    </div>
  );
}
```

**Design Notes:**
- Loading state while fetching markdown
- Error state if fetch fails
- Breadcrumb with left arrow icon at top
- Custom Tailwind styling for all markdown elements
- Matches Chat2Deal design system (slate colors, blue accents)
- Responsive padding and max-width

**Acceptance Criteria:**
- ✅ Fetches /content/legal/privacy-policy.md on mount
- ✅ Displays loading state during fetch
- ✅ Displays error message if fetch fails
- ✅ Renders markdown with custom styling
- ✅ Breadcrumb navigates back to home page
- ✅ Header and Footer rendered
- ✅ Responsive layout works on mobile/desktop
- ✅ Links within markdown are clickable and styled
- ✅ Typography is readable and professional

---

### 6.4 TermsOfService.tsx - Terms of Service Page

**File:** `Landing/src/pages/legal/TermsOfService.tsx`

**Purpose:** Fetch and render terms-of-service.md with custom styling.

**Implementation:**
```tsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Markdown from 'react-markdown';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';

export default function TermsOfService() {
  const [content, setContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch markdown content from public folder
    fetch('/content/legal/terms-of-service.md')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to load terms of service');
        }
        return response.text();
      })
      .then((text) => {
        setContent(text);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Error loading terms of service:', error);
        setError('Failed to load terms of service. Please try again later.');
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-8 sm:py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb Navigation */}
          <div className="mb-6">
            <Link
              to="/"
              className="inline-flex items-center text-sm text-slate-600 hover:text-slate-700 transition-colors duration-200"
            >
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Home
            </Link>
          </div>

          {/* Legal Document Container */}
          <article className="prose prose-lg max-w-none">
            {isLoading ? (
              <div className="text-center text-slate-600">
                Loading Terms of Service...
              </div>
            ) : error ? (
              <div className="text-center text-red-600">
                {error}
              </div>
            ) : (
              <Markdown
                components={{
                  // Customize heading styles
                  h1: ({ children }) => (
                    <h1 className="mb-4 text-3xl font-bold text-slate-900 sm:text-4xl">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="mt-8 mb-4 text-2xl font-bold text-slate-900">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="mt-6 mb-3 text-xl font-semibold text-slate-900">
                      {children}
                    </h3>
                  ),
                  // Customize paragraph styles
                  p: ({ children }) => (
                    <p className="mb-4 text-base leading-relaxed text-slate-700">
                      {children}
                    </p>
                  ),
                  // Customize list styles
                  ul: ({ children }) => (
                    <ul className="mb-4 ml-6 list-disc space-y-2 text-slate-700">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="mb-4 ml-6 list-decimal space-y-2 text-slate-700">
                      {children}
                    </ol>
                  ),
                  // Customize link styles
                  a: ({ children, href }) => (
                    <a
                      href={href}
                      className="text-blue-600 underline hover:text-blue-700 transition-colors duration-200"
                    >
                      {children}
                    </a>
                  ),
                  // Customize strong (bold) text
                  strong: ({ children }) => (
                    <strong className="font-semibold text-slate-900">
                      {children}
                    </strong>
                  ),
                  // Customize emphasis (italic) text
                  em: ({ children }) => (
                    <em className="italic text-slate-700">
                      {children}
                    </em>
                  ),
                  // Customize blockquote styles
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-blue-600 pl-4 italic text-slate-700 my-4">
                      {children}
                    </blockquote>
                  ),
                  // Customize horizontal rule
                  hr: () => (
                    <hr className="my-8 border-t border-slate-300" />
                  ),
                }}
              >
                {content}
              </Markdown>
            )}
          </article>
        </div>
      </main>

      <Footer />
    </div>
  );
}
```

**Design Notes:**
- Identical structure to PrivacyPolicy.tsx
- Fetches different markdown file (terms-of-service.md)
- Consistent styling and layout

**Acceptance Criteria:**
- ✅ Fetches /content/legal/terms-of-service.md on mount
- ✅ Displays loading state during fetch
- ✅ Displays error message if fetch fails
- ✅ Renders markdown with custom styling
- ✅ Breadcrumb navigates back to home page
- ✅ Header and Footer rendered
- ✅ Responsive layout works on mobile/desktop
- ✅ Links within markdown are clickable and styled
- ✅ Typography is readable and professional

---

### 6.5 Footer.tsx - Update Links

**File:** `Landing/src/components/Footer.tsx`

**Changes:**
- Update href from `/privacy` to `/privacy-policy`
- Update href from `/terms` to `/terms-of-service`
- Change `<a>` tags to `<Link>` components from react-router-dom

**Current Code:**
```tsx
<a
  href="/privacy"
  className="text-sm text-slate-600 hover:text-slate-700 hover:underline transition-colors duration-200"
>
  Privacy Policy
</a>
<span className="text-slate-400">•</span>
<a
  href="/terms"
  className="text-sm text-slate-600 hover:text-slate-700 hover:underline transition-colors duration-200"
>
  Terms of Service
</a>
```

**New Code:**
```tsx
import { Link } from 'react-router-dom';

// In the footer JSX:
<Link
  to="/privacy-policy"
  className="text-sm text-slate-600 hover:text-slate-700 hover:underline transition-colors duration-200"
>
  Privacy Policy
</Link>
<span className="text-slate-400">•</span>
<Link
  to="/terms-of-service"
  className="text-sm text-slate-600 hover:text-slate-700 hover:underline transition-colors duration-200"
>
  Terms of Service
</Link>
```

**Acceptance Criteria:**
- ✅ Footer imports Link from react-router-dom
- ✅ Privacy link navigates to /privacy-policy
- ✅ Terms link navigates to /terms-of-service
- ✅ Links work without full page reload (SPA behavior)
- ✅ Styling preserved

---

## 7. Markdown Content Structure

### 7.1 Content Files Location

**Directory:** `Landing/public/content/legal/`

**Files:**
- `privacy-policy.md` - Privacy Policy content (provided by user)
- `terms-of-service.md` - Terms of Service content (provided by user)

### 7.2 Why public/ Directory?

- Files served as static assets via Vite
- Accessible via fetch('/content/legal/...')
- No build-time processing needed
- Easy to update content without rebuilding
- Matches boring-calc reference implementation

### 7.3 Markdown Format Requirements

**Supported Markdown Features:**
- Headings (h1, h2, h3)
- Paragraphs
- Bold (**text**) and italic (*text*)
- Unordered lists (-)
- Ordered lists (1.)
- Links ([text](url))
- Blockquotes (>)
- Horizontal rules (---)

**Not Supported in MVP:**
- Tables (can add remark-gfm plugin later)
- Code blocks (not needed for legal content)
- Images (not needed for legal content)

**Example Structure:**
```markdown
# Privacy Policy

*Last updated: November 5, 2025*

## Introduction

Chat2Deal ("we", "us", or "our") operates the Chat2Deal Chrome extension and website...

## Data We Collect

We collect the following data:

- **User Profile:** Name, email, company name (from Pipedrive OAuth)
- **Phone Numbers:** WhatsApp numbers extracted from chats
- **Usage Data:** Sign-in timestamps, Person lookups

## How We Use Your Data

...
```

---

## 8. Typography & Styling

### 8.1 Design System Alignment

**Colors:**
- Headings: `text-slate-900` (dark, high contrast)
- Body text: `text-slate-700` (readable, slightly muted)
- Links: `text-blue-600` with `hover:text-blue-700`
- Muted text: `text-slate-600`
- Borders: `border-slate-300`

**Typography:**
- H1: `text-3xl sm:text-4xl font-bold`
- H2: `text-2xl font-bold mt-8 mb-4`
- H3: `text-xl font-semibold mt-6 mb-3`
- Paragraph: `text-base leading-relaxed mb-4`
- Lists: `ml-6 space-y-2`

**Spacing:**
- Container: `max-w-4xl mx-auto px-4 sm:px-6 lg:px-8`
- Vertical: `py-8 sm:py-12`
- Section gaps: `mt-8` for H2, `mt-6` for H3

### 8.2 Responsive Behavior

**Mobile (< 640px):**
- H1: `text-3xl`
- Padding: `px-4`
- Breadcrumb: Full width, wraps if needed

**Desktop (≥ 640px):**
- H1: `text-4xl`
- Padding: `px-6 lg:px-8`
- Max width: `4xl` (56rem / 896px)

---

## 9. Testing Strategy

### 9.1 Manual Testing Checklist

**Routing:**
- [ ] Navigate to / → Home page displays
- [ ] Click Privacy Policy link in Footer → /privacy-policy page displays
- [ ] Click Terms of Service link in Footer → /terms-of-service page displays
- [ ] Click "Back to Home" breadcrumb → Returns to /
- [ ] Browser back button works correctly
- [ ] Browser forward button works correctly
- [ ] Direct URL entry works for all routes

**Content Loading:**
- [ ] Privacy Policy markdown loads and renders
- [ ] Terms of Service markdown loads and renders
- [ ] Loading state displays briefly during fetch
- [ ] Error state displays if markdown file missing

**Layout:**
- [ ] Header appears on all pages
- [ ] Footer appears on all pages
- [ ] Breadcrumb appears on legal pages only
- [ ] Content is centered and max-width applied
- [ ] Responsive padding works on mobile/desktop

**Styling:**
- [ ] Headings use correct font sizes and weights
- [ ] Body text is readable and properly spaced
- [ ] Links are underlined and change color on hover
- [ ] Lists are indented and have proper spacing
- [ ] Blockquotes have left border and italic text
- [ ] Horizontal rules render correctly

**Cross-Browser:**
- [ ] Chrome (primary target)
- [ ] Firefox
- [ ] Safari
- [ ] Edge

**Mobile Testing:**
- [ ] iPhone Safari
- [ ] Android Chrome
- [ ] Responsive breakpoints work correctly

### 9.2 Development Testing

**Local Development:**
1. `cd Landing`
2. `npm install` (installs new dependencies)
3. Create dummy markdown files in `public/content/legal/`
4. `npm run dev`
5. Test all routes and interactions

**Build Testing:**
1. `npm run build`
2. `npm run preview`
3. Verify routes work in production build
4. Verify markdown files are included in dist/

---

## 10. Acceptance Criteria

### 10.1 Dependencies

- ✅ react-router-dom installed
- ✅ react-markdown installed
- ✅ package.json updated with correct versions

### 10.2 Routing

- ✅ App.tsx uses BrowserRouter
- ✅ Three routes defined (/, /privacy-policy, /terms-of-service)
- ✅ Navigation works via Link components
- ✅ Browser back/forward buttons work
- ✅ Direct URL navigation works

### 10.3 Pages

- ✅ Home.tsx created and renders landing components
- ✅ PrivacyPolicy.tsx created and renders markdown
- ✅ TermsOfService.tsx created and renders markdown
- ✅ Loading states implemented
- ✅ Error states implemented
- ✅ Breadcrumb navigation works

### 10.4 Components

- ✅ Header renders on all pages
- ✅ Footer renders on all pages
- ✅ Footer links updated to new URLs
- ✅ Footer uses Link components (not <a> tags)

### 10.5 Content

- ✅ public/content/legal/ directory created
- ✅ privacy-policy.md file location documented
- ✅ terms-of-service.md file location documented
- ✅ Markdown format requirements documented

### 10.6 Styling

- ✅ Custom Tailwind styles applied to all markdown elements
- ✅ Typography is readable and professional
- ✅ Colors match Chat2Deal design system
- ✅ Responsive layout works on mobile/desktop
- ✅ Consistent spacing and alignment

### 10.7 Testing

- ✅ Manual testing checklist completed
- ✅ All routes tested
- ✅ All interactions tested
- ✅ Responsive behavior verified
- ✅ Cross-browser testing performed

---

## 11. Implementation Checklist

### Phase 1: Setup & Dependencies (0.5 hour)
- [ ] Install react-router-dom: `npm install react-router-dom`
- [ ] Install react-markdown: `npm install react-markdown`
- [ ] Create directory: `Landing/src/pages/`
- [ ] Create directory: `Landing/src/pages/legal/`
- [ ] Create directory: `Landing/public/content/legal/`
- [ ] Verify dependencies installed correctly

### Phase 2: Routing Setup (0.5 hour)
- [ ] Modify App.tsx to use BrowserRouter
- [ ] Add Routes and Route imports
- [ ] Define three routes (/, /privacy-policy, /terms-of-service)
- [ ] Test basic routing works

### Phase 3: Home Page (0.25 hour)
- [ ] Create Home.tsx
- [ ] Move landing components from App.tsx to Home.tsx
- [ ] Verify landing page looks identical
- [ ] Test navigation to/from home page

### Phase 4: Legal Pages (1 hour)
- [ ] Create PrivacyPolicy.tsx with fetch logic
- [ ] Add markdown rendering with custom styling
- [ ] Add breadcrumb navigation
- [ ] Copy to create TermsOfService.tsx
- [ ] Update fetch URL for terms file
- [ ] Test loading states
- [ ] Test error states

### Phase 5: Footer Updates (0.25 hour)
- [ ] Update Footer.tsx to import Link
- [ ] Change /privacy to /privacy-policy
- [ ] Change /terms to /terms-of-service
- [ ] Change <a> tags to <Link> components
- [ ] Test footer links work

### Phase 6: Markdown Files (user-provided)
- [ ] Obtain privacy-policy.md from user
- [ ] Obtain terms-of-service.md from user
- [ ] Place files in public/content/legal/
- [ ] Verify files load correctly

### Phase 7: Testing & Refinement (0.5 hour)
- [ ] Run through manual testing checklist
- [ ] Fix any styling issues
- [ ] Test responsive behavior
- [ ] Test in multiple browsers
- [ ] Verify production build works

**Total Estimated Effort:** 3-3.5 hours

---

## 12. Timeline Estimate

- **Setup & Dependencies:** 0.5 hour
- **Routing Setup:** 0.5 hour
- **Home Page:** 0.25 hour
- **Legal Pages:** 1 hour
- **Footer Updates:** 0.25 hour
- **Testing & Refinement:** 0.5 hour

**Total:** 3-3.5 hours (about half a day)

*Note: Markdown content creation not included (user-provided)*

---

## 13. Out of Scope (Future Enhancements)

The following are explicitly **not** part of this specification:

- ❌ SEO meta tags (react-helmet-async)
- ❌ Table support in markdown (remark-gfm)
- ❌ Code syntax highlighting
- ❌ Table of contents generation
- ❌ Search functionality within legal pages
- ❌ PDF export of legal documents
- ❌ Version history tracking
- ❌ Last updated timestamp automation
- ❌ Legal page analytics
- ❌ Print-friendly styling
- ❌ Multi-language support
- ❌ Cookie consent banner integration

---

## 14. Related Documentation

- [BRD-001: MVP Pipedrive WhatsApp](../BRDs/BRD-001-MVP-Pipedrive-WhatsApp.md) - Section 6.8
- [Plan-001: MVP Feature Breakdown](../Plans/Plan-001-MVP-Feature-Breakdown.md) - Feature 23

**Reference Implementation:**
- boring-calc website: `c:\myproj\boring-calc\website\src\pages\legal\`

---

**Status:** ✅ Draft - Ready for implementation
**Owner:** Landing Site Team
**Estimated Effort:** 3-3.5 hours
