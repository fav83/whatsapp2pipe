# Landing Page Development Guide

This document contains development guidelines specific to the Chat2Deal marketing landing page (React + TypeScript).

## Components

### Call-to-Action Components

**`src/components/SignInButton.tsx`**
- Direct sign-in with Pipedrive button
- Replaces previous WaitlistForm component
- Primary CTA throughout landing page

**`src/components/Hero.tsx`**
- Hero section with SignInButton
- Main landing page header and value proposition
- First impression for new visitors

**`src/components/FinalCTA.tsx`**
- Final call-to-action section with SignInButton
- Bottom of landing page conversion point
- Encourages sign-up after reading content

**`src/components/Header.tsx`**
- Navigation header with sign-in button
- Includes links to sections: Features, Pricing, How It Works
- Sticky navigation for easy access

### Feature Components

**`src/components/Pricing.tsx`** (Spec-128)
- Location: After "Your CRM" section, before "How It Works"
- Two tiers displayed:
  - **Free (Beta)**: Active CTA, all features available
  - **Pro (Coming Soon)**: Disabled button, future pricing tier
- Copy: "Free during beta. Paid plans coming soon."
- Anchor: `id="pricing"` for header navigation link
- Header Link: Smooth scroll navigation from header

## Important Changes (2025-11-10)

### Open Access Model

**Removed Waitlist:**
- **Removed WaitlistForm component** - Replaced with direct sign-in flow
- **Section ID changed** - From `#waitlist` to `#get-started`
- **Open to all Pipedrive users** - No invite code or waitlist required
- **Simplified user journey** - Single-click sign-in with Pipedrive OAuth

## Content Structure

### Section Flow
1. Header (navigation)
2. Hero (value proposition + SignInButton)
3. Features
4. Your CRM (integration benefits)
5. **Pricing** (new section, Spec-128)
6. How It Works
7. Final CTA (conversion + SignInButton)

### Navigation Links
- Features → `#features`
- Pricing → `#pricing`
- How It Works → `#how-it-works`
- Get Started → `#get-started` (SignInButton section)

## SEO Optimization

The landing page is optimized for search engines:
- Server-side rendering (SSR) support
- Semantic HTML structure
- Meta tags for social sharing
- Structured data markup

**Documentation:** See [Landing-SEO-Architecture.md](../Docs/Architecture/Landing-SEO-Architecture.md) for complete SEO strategy.

## Code Style

### TypeScript/React Conventions

- Use `camelCase` for variables and functions
- Use `PascalCase` for React components and types
- Use `UPPER_CASE` for constants
- Follow existing project conventions

## Documentation References

- [Landing-SEO-Architecture.md](../Docs/Architecture/Landing-SEO-Architecture.md) - SEO system architecture
- [UI-Design-Specification.md](../Docs/Architecture/UI-Design-Specification.md) - UI design system
- [Brand-Guide.md](../Docs/Brand-Guide.md) - Brand guidelines for copy and visual style
