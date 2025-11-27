# Website Dashboard Development Guide

This document contains development guidelines specific to the Chat2Deal user dashboard web application (React + TypeScript).

## Components

### Authentication Components

**`src/components/auth/UserProfile.tsx`**
- User profile card with sign-out functionality
- Displays user information from authenticated session
- Sign-out button clears local storage and redirects to homepage

### Dashboard Components

**`src/components/dashboard/ExtensionStatus.tsx`**
- Shows Chrome extension installation status
- Detects if extension is installed and communicates version
- Provides download link if extension not installed

**`src/components/dashboard/HowToUse.tsx`**
- Step-by-step usage instructions for new users
- Guides users through installation and setup process
- Visual tutorial for getting started with Chat2Deal

## Pages

**`src/pages/HomePage.tsx`**
- Landing page with direct sign-in (no invite input)
- Primary entry point for unauthenticated users
- "Sign in with Pipedrive" button for OAuth flow

**`src/pages/DashboardPage.tsx`**
- Authenticated user dashboard
- Shows user profile and extension status
- Includes HowToUse guide for onboarding

**`src/pages/AuthCallbackPage.tsx`**
- OAuth callback handler
- Processes verification code from backend
- Redirects to dashboard after successful authentication

## Routes

- `/` - Homepage with sign-in button
- `/auth/callback` - OAuth callback handler
- `/dashboard` - Authenticated user dashboard
- `/dashboard?verification_code=xxx` - Auto sign-in from extension (URL parameter-based authentication)

## Authentication Flow

### Important Changes (2025-11-10)

**Open Access Model:**
- **Removed invite code requirement** - Any Pipedrive user can sign in directly
- **Removed WaitlistPage route** - Simplified to direct sign-in flow
- **Updated error messages** - Removed closed beta/invalid invite user-facing errors
- **Updated auth types** - Marked inviteCode as unused in OAuthState

### Auto Sign-In from Extension

**Feature:** `src/pages/DashboardPage.tsx`
- Detects `verification_code` URL parameter and auto signs in
- Flow: Extension → `?verification_code=xxx` → Store in localStorage → Reload → Authenticated
- Use Case: Seamless transition from extension to website dashboard via Profile link

**How It Works:**
1. Extension passes `verification_code` as URL parameter when opening dashboard
2. DashboardPage detects parameter on load
3. Stores verification code in localStorage
4. Reloads page without parameter
5. User is authenticated and sees dashboard

## Code Style

### TypeScript/React Conventions

- Use `camelCase` for variables and functions
- Use `PascalCase` for React components and types
- Use `UPPER_CASE` for constants
- Follow existing project conventions

## Documentation References

- [Website-Architecture.md](../Docs/Architecture/Website-Architecture.md) - Complete web application architecture
- [UI-Design-Specification.md](../Docs/Architecture/UI-Design-Specification.md) - UI design system
