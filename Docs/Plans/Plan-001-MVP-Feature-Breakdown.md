# Plan-001: MVP Feature Breakdown

**Date:** 2025-10-25
**Based on:** BRD-001-MVP-Pipedrive-WhatsApp.md
**Architecture:** Chrome-Extension-Architecture.md
**Status:** Draft

---

## Feature Breakdown

### Feature 1: Project Foundation & Build Setup
Set up the basic project structure with Vite, TypeScript, React, and all necessary tooling including ESLint, Prettier, and testing infrastructure.

### Feature 2: Chrome Extension Manifest & Basic Structure
Create Manifest V3 configuration with required permissions, define extension components (service worker, content script, popup), and implement basic extension loading on WhatsApp Web.

### Feature 3: WhatsApp Web Sidebar Injection
Inject a React-based sidebar into WhatsApp Web DOM with proper styling isolation, responsive layout, and show/hide toggle functionality.

### Feature 4: WhatsApp Chat Detection & Phone Extraction (✅ Complete - Spec-104)
Implement DOM observer to detect 1:1 chat switches, extract JID from WhatsApp DOM, parse phone numbers from JID, and detect unsupported chat types (groups).

### Feature 5: Pipedrive OAuth Authentication (✅ Complete - Spec-105a + Spec-105b)
Implement OAuth 2.0 authorization code flow with backend service (Azure Functions + Azure Table Storage) and extension integration using chrome.identity API. Backend handles secure token storage and issues session identifiers. Extension uses hybrid architecture (content script + service worker) with dynamic extension ID support and state-based CSRF protection.

### Feature 6: Pipedrive API Service Layer (✅ Complete - Spec-106a + Spec-106b)
Create centralized API service with TypeScript interfaces for Person lookup by phone, Person search by name, Person creation, and phone attachment to existing Person. Includes React hook (usePipedrive) with built-in loading and error state management.

### Feature 7: ~~TanStack Query Integration~~ (❌ Skipped)
**Decision:** Skipped for MVP. The custom `usePipedrive()` hook (Feature 6) already provides sufficient state management, loading states, and error handling. TanStack Query would add complexity and bundle size without meaningful benefits for the MVP use cases.

### Feature 8: Authentication UI State (✅ Complete)
Build sign-in prompt UI with Pipedrive branding, authenticated/unauthenticated states in sidebar, and sign-out functionality. Implemented with WelcomeState, AuthenticatingState, SignInButton components, useAuth hook, and full OAuth flow integration.

### Feature 9: Person Auto-Lookup Flow (✅ Complete - Spec-109)
Implement automatic person lookup on chat switch, display matched Person card with details and "Open in Pipedrive" button, and show loading states during lookup.

### Feature 10: Create Person Flow (✅ Complete - Spec-110)
Build Create Person form with editable pre-filled name (from WhatsApp display name), client-side validation, inline error handling, and creation with WhatsApp phone label (not primary). Email field removed for MVP simplicity.

### Feature 11: Attach Number to Existing Person Flow (✅ Complete - Spec-111)
Implement inline person search by name with selection UI, attach phone as "WhatsApp" label (not primary), and transition to matched state on success.

### Feature 12: UI States & Error Handling (✅ Complete - Spec-112)
Implement all required UI states (no chat selected, loading, matched, no match, success, error), error boundaries, user-friendly error messages, and retry mechanisms. Includes React Error Boundary, global error handlers, network error detection, automatic sign-out on 401, and structured error logging.

### Feature 13: ~~shadcn/ui Component Library Setup~~ (❌ Skipped)
**Decision:** Skipped for MVP. The current custom React components with Tailwind CSS utility classes are sufficient for the simple UI requirements (buttons, inputs, cards, forms). shadcn/ui and Radix UI primitives would add 30-50 KB to bundle size (doubling/tripling extension size) with minimal benefit for the straightforward UI patterns needed. All components (Features 8-11) are complete and tested without shadcn/ui. Can reconsider post-MVP if complex interactive components (modals, dropdowns, command palettes) are needed.

### Feature 14: Sentry Error Tracking Integration
Set up Sentry for content script and service worker, implement PII filtering for phone numbers and names, configure breadcrumbs for user actions, and error boundaries.

### Feature 15: Testing Infrastructure
Set up Vitest for unit/integration tests, configure Testing Library for React components, set up Playwright for E2E tests, and create test fixtures and mocks.

### Feature 16: User Entity Tracking (Backend) (✅ Complete - Spec-116)
Implement user and company entity tracking in Azure SQL Database using Entity Framework Core. Automatically create/update user records during OAuth flow by fetching profile data from Pipedrive `/users/me` API. Normalized schema with Companies and Users tables, GUID primary keys, and composite unique constraints to support multi-company users. Database migration applied successfully to `chat2deal-dev` on localhost SQL Server. OAuth scope remains `contacts:full` (no changes needed - `/users/me` uses base scope).

### Feature 17: User Avatar with Profile Dropdown (✅ Complete - Spec-117)
Replace text sign-out button with circular avatar showing first letter of user's name. Backend passes userName in OAuth callback URL. Extension stores userName in chrome.storage.local. Avatar displays 32px gray circle with white letter, clicking toggles dropdown menu with full name and sign-out option. Supports outside-click and Escape key to close. Header rebranded to "Chat2Deal". DEV indicator moved to bottom of sidebar.

### Feature 18: Extension Initialization & Loading States (✅ Complete - Spec-118)
Display visual feedback during extension initialization (webpack detection, module raid, chat monitoring setup). Full-height loading overlay with spinner and "Initializing Chat2Deal..." text, shown when sidebar container exists. 300ms dwell time on success, 1000ms on timeout. Module raid failures logged to console and reported to Sentry. Sidebar loads in degraded mode if initialization fails.

### Feature 19: Website Pipedrive Authentication (Draft - Spec-119)
Implement Pipedrive OAuth authentication for Chat2Deal user dashboard website using redirect-based flow. Backend OAuth endpoints extended to support both extension and website clients (detect via state parameter). Website receives verification_code after OAuth, stores in localStorage, and uses for API calls. Three pages: landing (/), callback (/auth/callback), dashboard (/dashboard). Dashboard displays user profile (name, email, company) fetched from database via GET /api/user/me endpoint. Database migration adds UserId foreign key to Sessions table. Technology: React 18 + TypeScript + Vite + React Router v6 + Tailwind CSS + shadcn/ui, hosted on Azure Static Web Apps.

### Feature 20: Closed Beta Invite System (Draft - Spec-120a + Spec-120b)
Implement invite-based access control for closed beta. Website sign-in requires invite code input (required field, auto-fills from `?i=invite` URL param). Invite passed through OAuth state parameter, validated server-side during callback. New users must provide valid invite; existing users bypass check. Extension flow remains unchanged for existing users; new users rejected with "Beta Access Required" error state. Database changes: new Invites table (InviteId, Code, CreatedAt, UsageCount, Description), Users table adds nullable InviteId foreign key. Backend AuthCallback modified to validate invites for new users, increment usage count on signup. Invites created manually via database insertion (multi-use unlimited). Supports tracking which users signed up with which invite.

### Feature 21: Waitlist System (Draft - Spec-121)
Implement waitlist system for users without beta access. Dedicated `/waitlist` page on website with email (required) and name (optional) form fields with client-side email validation. Multiple entry points: HomePage link ("Don't have an invite? Join the waitlist"), AuthCallbackPage error state ("Join Waitlist" button for closed_beta/invalid_invite errors), and Extension BetaAccessRequiredState ("Join Waitlist" button opens website). Backend POST /api/waitlist endpoint with server-side validation, deduplication by email (updates UpdatedAt on duplicate), returns 200 for both new and duplicate entries. Database: new Waitlist table (WaitlistId, Email, Name, CreatedAt, UpdatedAt) with unique constraint on Email. Admin management via manual SQL queries only. Extension BetaAccessRequiredState updated to replace "Request Beta Access" with "Join Waitlist" button that opens website /waitlist page in new tab.

### Feature 22: Website Extension Detection & Installation Prompt (Draft - Spec-122)
Implement extension installation detection on website dashboard using postMessage handshake. Dashboard page displays two-column layout (left: UserProfile, right: ExtensionStatus card). Website sends ping messages on page load (two retry attempts at 0ms, 500ms). Extension content script injected on dashboard domain listens and responds with version metadata. Detection timeout shows "not installed" state. Two display states: NOT installed (prominent "Install Extension" button linking to Chrome Web Store) and IS installed (green checkmark + "Extension installed" text with small Chrome Web Store link). Mobile/tablet detection shows modified message: "Extension available for desktop Chrome". ExtensionStatus component matches UserProfile card styling (shadcn/ui Card). Chrome Web Store URL configurable via VITE_EXTENSION_STORE_URL environment variable. No persistent storage or continuous polling. Extension manifest updated to inject content script on dashboard domains (localhost:3000, app.chat2deal.com).

### Feature 23: Landing Page Legal Pages (✅ Complete - Spec-123)
Implement Privacy Policy and Terms of Service pages for Chat2Deal landing site. Add React Router to support multi-page navigation (/privacy-policy and /terms-of-service routes). Create two page components (PrivacyPolicy.tsx, TermsOfService.tsx) that fetch and render Markdown content from public/content/legal/ directory using react-markdown. Layout includes existing Header component (logo, "Join the Waitlist", "Sign in"), breadcrumb navigation ("← Back to Home"), legal content with custom Tailwind typography, and existing Footer. Refactor App.tsx to use React Router with Home page wrapping existing landing components (Hero, Benefits, HowItWorks, FinalCTA). Update Footer links from /privacy and /terms to /privacy-policy and /terms-of-service. Markdown content (privacy-policy.md, terms-of-service.md) created in Basecamp conversational style with CC BY 4.0 attribution. Dependencies: react-router-dom v7.9.5, react-markdown v10.1.0, react-helmet-async v2.0.5 (SEO enhancement), and puppeteer v24.29.0 (pre-rendering). **Implementation exceeded original scope with comprehensive SEO system including automated route discovery, XML sitemap generation, static pre-rendering, and robots.txt configuration** (documented in Landing-SEO-Architecture.md).

---

## Notes

- Each feature should be implemented as a complete vertical slice where possible
- Features can be worked on in parallel if dependencies allow
- Detailed acceptance criteria will be added to each feature in separate documents
- This breakdown aligns with BRD Section 4 (Functional Requirements) and the architecture document
