# Chat2Deal User Dashboard - Website Architecture

**Version:** 1.0
**Last Updated:** 2025-11-02
**Status:** Active

---

## 1. Overview & Purpose

The Chat2Deal User Dashboard is a web-based application that provides account management, settings, and subscription features for users of the Chat2Deal Chrome extension. This dashboard complements the extension by offering a centralized interface for user profile management, authentication status, and future paid service subscriptions.

### Key Objectives

- Provide user account management and profile settings
- Enable subscription and billing management (future)
- Maintain authentication state synchronized with the Chrome extension
- Offer a responsive, modern UI consistent with the extension's design language

### Relationship to Chrome Extension

The dashboard and extension work together as complementary products. Users authenticate via Pipedrive OAuth (shared authentication), and both systems access the same backend Azure Functions and Azure SQL database. The extension provides the core WhatsApp-to-Pipedrive integration functionality, while the dashboard provides administrative and account management capabilities.

---

## 2. Technology Stack

### Frontend

- **React 18** with **TypeScript** - Component-based UI matching extension technology
- **Vite** - Fast build tooling and development server (same as extension)
- **Tailwind CSS v3** + **shadcn/ui** - Utility-first styling with accessible component library
- **React Router v6** - Client-side routing for dashboard pages
- **React Context API + hooks** - State management (consistent with extension approach)

### Backend

- **Azure Functions** (existing, extended) - Serverless API endpoints
- **C# / .NET 8** - Function runtime (existing stack)
- **Azure SQL Database** - Relational database for users, subscriptions, settings (existing, extended)

### Hosting & Infrastructure

- **Azure Static Web Apps** - Frontend hosting with built-in CDN and SSL
- **Azure Functions** - Backend API layer (existing)
- **Azure SQL Database** - Data persistence (existing)

### Development & Quality

- **Vitest** - Unit testing framework
- **React Testing Library** - Component testing
- **Playwright** - End-to-end testing
- **ESLint + Prettier** - Code linting and formatting
- **Azure Application Insights** - Error tracking and performance monitoring

---

## 3. Project Structure & Organization

### Repository Structure

```
whatsapp2pipe/
├── Extension/          # Chrome extension codebase
├── Website/            # User dashboard (NEW)
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components (routes)
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API client services
│   │   ├── types/          # TypeScript type definitions
│   │   ├── styles/         # Global styles and Tailwind config
│   │   ├── utils/          # Helper functions
│   │   └── App.tsx         # Root application component
│   ├── public/         # Static assets
│   ├── tests/          # Vitest unit tests
│   ├── e2e/            # Playwright E2E tests
│   ├── vite.config.ts  # Vite configuration
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── package.json
├── Docs/               # All documentation
└── Backend/            # Azure Functions (existing, to be extended)
```

### Code Sharing Strategy

- Code is **duplicated** between Extension/ and Website/ (no shared packages)
- Types, utilities, and API clients are copied when needed
- Simpler dependency management, independent versioning
- Each project maintains its own dependencies and build process

---

## 4. Authentication & Security

### Authentication Flow

- Users authenticate via **Pipedrive OAuth 2.0** (same as extension)
- OAuth flow handled by existing Azure Functions OAuth endpoints
- After successful authentication, user receives access token stored in browser (localStorage/sessionStorage)
- Dashboard and extension share the same authentication provider (Pipedrive)

### Session Management

- Access tokens stored securely in browser storage
- Token refresh handled automatically via backend
- Session expiry redirects to login flow
- User identity synchronized with extension via shared backend

### Authorization

- Azure Functions validate access tokens on each API request
- User context (Pipedrive company domain, user ID) retrieved from token
- Database queries scoped to authenticated user's data
- Role-based access control for future admin features

### Security Considerations

- HTTPS enforced on all endpoints (Azure Static Web Apps + Functions)
- CORS configured to allow only dashboard and extension origins
- No sensitive credentials stored in frontend code
- Environment variables for API endpoints and configuration
- Azure Application Insights with PII filtering (similar to extension's Sentry setup)

---

## 5. Backend Architecture & Database

### Azure Functions Extensions

- Extend existing Azure Functions app with new HTTP endpoints for dashboard functionality
- New functions will handle user profile management, settings, and subscription data
- Future endpoints for usage metrics and analytics
- Functions follow existing patterns and conventions (C# / .NET 8, Entity Framework Core)

### Database Schema Extensions

- Extend existing Azure SQL Database with new tables for dashboard features
- User profile and account information storage
- User preferences and settings
- Subscription and billing data structures (future, parked for now)
- Usage tracking and analytics tables (future)

### Data Access Pattern

- Entity Framework Core for database access (existing pattern)
- Repository pattern for data layer abstraction
- User data scoped by authenticated user ID from access token
- Efficient queries with appropriate indexes

### API Design

- RESTful HTTP endpoints returning JSON
- Standard HTTP status codes and error handling
- Consistent request/response patterns
- Type-safe DTOs for request validation and response serialization

---

## 6. Frontend Architecture & Routing

### Application Structure

- Single-page application (SPA) with client-side routing via React Router v6
- Component-based architecture with reusable UI components
- Page components for major dashboard sections (profile, settings, billing)
- Responsive design supporting desktop and mobile viewports

### State Management

- React Context API for global state (user profile, authentication status)
- Custom hooks for encapsulating business logic and API calls
- Local component state with `useState` for UI interactions
- No external state management libraries (consistent with extension approach)

### Routing Structure

- Protected routes requiring authentication
- Redirect unauthenticated users to login/OAuth flow
- Nested routes for organized page hierarchy
- Route-based code splitting for optimal performance

### UI Component Library

- shadcn/ui for accessible, customizable components
- Tailwind CSS v3 for utility-first styling
- Consistent design system matching extension's visual language
- Dark mode support (future consideration)

### API Integration

- Service layer for API communication with Azure Functions
- fetch/axios for HTTP requests
- Error handling and loading states
- Type-safe API clients using TypeScript interfaces

---

## 7. Development Workflow & Build Process

### Development Environment

- Node.js and npm for dependency management
- Environment variables via Vite's `.env` files (`.env.development`, `.env.production`)
- Hot module replacement (HMR) for fast development iteration
- TypeScript strict mode for type safety

### Build Process

- Vite for bundling and optimization
- Production builds output to `Website/dist/` directory
- Code splitting and tree-shaking for optimal bundle size
- Asset optimization (images, fonts, CSS)
- Source maps for debugging (separate from production bundles)

### Code Quality

- ESLint for code linting with TypeScript support
- Prettier for consistent code formatting
- TypeScript compiler for type checking
- Pre-commit hooks for automated quality checks (optional)

### Testing Strategy

- Unit tests with Vitest for components and utilities
- React Testing Library for component integration tests
- Playwright for end-to-end user flow testing
- Test coverage reporting and thresholds

### Development Commands

```bash
npm install       # Install dependencies
npm run dev       # Start development server
npm run build     # Production build
npm test          # Run unit tests
npm run test:e2e  # Run E2E tests
npm run lint      # Lint code
npm run format    # Format code
```

---

## 8. Deployment & Hosting

### Azure Static Web Apps Deployment

- Frontend hosted on Azure Static Web Apps with global CDN
- Automatic SSL certificate provisioning and management
- Custom domain support for production deployment
- Integration with Azure Functions backend (same Azure region)

### Environment Configuration

- Development environment points to development Azure Functions
- Production environment points to production Azure Functions
- Environment-specific configuration via Vite build-time variables
- API endpoint URLs configured per environment

### Deployment Process

- Manual deployment initially (no CI/CD)
- Build locally with `npm run build`
- Deploy `Website/dist/` folder to Azure Static Web Apps
- Verify deployment and test functionality
- Future: Automated CI/CD pipeline via GitHub Actions or Azure DevOps

### Monitoring & Observability

- Azure Application Insights for error tracking and performance monitoring
- Frontend error logging and stack traces
- API request/response monitoring
- Performance metrics (page load times, bundle sizes)
- User analytics and usage patterns (future)

---

## 9. Integration with Chrome Extension

### Shared Authentication

- Both extension and dashboard authenticate via Pipedrive OAuth
- Extension uses Chrome-specific OAuth flow (`chrome.identity.launchWebAuthFlow()`)
- Dashboard uses standard web OAuth redirect flow
- Backend Azure Functions validate tokens from both sources
- User session synchronized via shared user database
- Single Pipedrive account links both extension and dashboard access

### Shared Backend Services

- Extension and dashboard consume same Azure Functions APIs
- Shared Azure SQL database for user data and Pipedrive entities
- Consistent data access patterns and business logic
- API versioning for backward compatibility

### User Experience Flow

- User installs Chrome extension
- Extension prompts OAuth authentication via Chrome identity API
- User can access dashboard independently via browser with standard OAuth login
- Settings and preferences synchronized between extension and dashboard via backend
- Subscription status affects features available in both extension and dashboard

### Communication Pattern

- No direct communication between extension and dashboard
- Both communicate through backend APIs
- Real-time sync via polling or future WebSocket implementation
- Extension and dashboard can operate independently

---

## 10. Summary

The Chat2Deal User Dashboard is a React-based web application that provides account management and settings for Chrome extension users. It uses the same technology stack as the extension (React + TypeScript + Vite + Tailwind CSS) for consistency, with shadcn/ui for UI components and React Router v6 for navigation.

The dashboard extends the existing Azure Functions backend and Azure SQL database, adding new endpoints and tables for user profiles, settings, and future subscription management. Authentication is handled via Pipedrive OAuth, with the extension using Chrome's identity API and the dashboard using standard web OAuth flow.

The frontend is hosted on Azure Static Web Apps, providing global CDN distribution and SSL. Error tracking uses Azure Application Insights, and testing follows the same approach as the extension (Vitest + React Testing Library + Playwright).

Both the extension and dashboard operate independently but share backend services and data, providing a unified experience for users across platforms.

---

## Related Documentation

- [Chrome Extension Architecture](Chrome-Extension-Architecture.md) - Technical architecture for the Chrome extension
- [UI Design Specification](UI-Design-Specification.md) - Complete UI design specification with visual system
- [BRD-001: MVP Pipedrive WhatsApp](../BRDs/BRD-001-MVP-Pipedrive-WhatsApp.md) - Business requirements for the MVP
