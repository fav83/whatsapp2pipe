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

### Feature 12: UI States & Error Handling
Implement all required UI states (no chat selected, loading, matched, no match, success, error), error boundaries, user-friendly error messages, and retry mechanisms.

### Feature 13: ~~shadcn/ui Component Library Setup~~ (❌ Skipped)
**Decision:** Skipped for MVP. The current custom React components with Tailwind CSS utility classes are sufficient for the simple UI requirements (buttons, inputs, cards, forms). shadcn/ui and Radix UI primitives would add 30-50 KB to bundle size (doubling/tripling extension size) with minimal benefit for the straightforward UI patterns needed. All components (Features 8-11) are complete and tested without shadcn/ui. Can reconsider post-MVP if complex interactive components (modals, dropdowns, command palettes) are needed.

### Feature 14: Sentry Error Tracking Integration
Set up Sentry for content script and service worker, implement PII filtering for phone numbers and names, configure breadcrumbs for user actions, and error boundaries.

### Feature 15: Testing Infrastructure
Set up Vitest for unit/integration tests, configure Testing Library for React components, set up Playwright for E2E tests, and create test fixtures and mocks.

### Feature 16: User Entity Tracking (Backend) (Spec-116)
Implement user and company entity tracking in Azure SQL Database using Entity Framework Core. Automatically create/update user records during OAuth flow by fetching profile data from Pipedrive `/users/me` API. Normalized schema with Companies and Users tables, GUID primary keys, and composite unique constraints to support multi-company users.

---

## Implementation Order Recommendation

The features are numbered in a suggested implementation order that considers:
- Dependencies between features
- Ability to test incrementally
- Delivering vertical slices of functionality

**Phase 1: Foundation (Features 1-4)**
Get the basic extension working with sidebar injection and WhatsApp chat detection.

**Phase 2: Authentication & API (Features 5-6)**
Implement Pipedrive connectivity with secure authentication and API layer. Feature 7 (TanStack Query) skipped as unnecessary for MVP.

**Phase 3: Core User Flows (Features 8-11)**
Build the main user-facing features for person lookup, creation, and attachment.

**Phase 4: Polish & Quality (Features 12, 14-16)**
Add error handling, testing, monitoring, and user tracking. Feature 13 (shadcn/ui) skipped as unnecessary for MVP.

---

## Notes

- Each feature should be implemented as a complete vertical slice where possible
- Features can be worked on in parallel if dependencies allow
- Detailed acceptance criteria will be added to each feature in separate documents
- This breakdown aligns with BRD Section 4 (Functional Requirements) and the architecture document
