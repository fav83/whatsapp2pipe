# Chat2Deal Dashboard

User dashboard web application for Chat2Deal - account management and settings for Chrome extension users.

## Overview

This dashboard provides:
- User profile and account management
- Chrome extension installation status
- Step-by-step usage instructions
- OAuth authentication with Pipedrive

## Tech Stack

- **Framework**: Vite + React 18 + TypeScript
- **Routing**: React Router v6
- **Styling**: Tailwind CSS v3
- **UI Components**: Radix UI primitives
- **Testing**: Vitest + Testing Library + Playwright
- **Type Checking**: TypeScript

## Prerequisites

- Node.js 18+ and npm

## Getting Started

### Installation

1. Navigate to the Website folder:
   ```bash
   cd Website
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy environment variables:
   ```bash
   cp .env.example .env.local
   ```

4. Update `.env.local` with your settings:
   ```
   VITE_API_BASE_URL=http://localhost:7071/api
   ```

### Development

Run the development server:

```bash
npm run dev
```

The site will be available at `http://localhost:3000`

### Build

Build for production:

```bash
npm run build
```

The production build will be in the `dist/` folder.

### Preview Production Build

Preview the production build locally:

```bash
npm run preview
```

## Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run test` | Run unit tests (Vitest) |
| `npm run test:e2e` | Run E2E tests (Playwright) |
| `npm run lint` | Lint code |
| `npm run format` | Format code with Prettier |
| `npm run type-check` | Type check without emitting files |

## Project Structure

```
Website/
├── src/
│   ├── components/      # React components
│   │   ├── auth/        # Authentication components
│   │   ├── dashboard/   # Dashboard components
│   │   └── ui/          # Reusable UI components
│   ├── pages/           # Page components
│   ├── services/        # API services
│   ├── types/           # TypeScript types
│   ├── App.tsx          # Main App component
│   ├── main.tsx         # Entry point
│   └── index.css        # Global styles
├── public/              # Static assets
├── .env.example         # Environment variables template
├── .env.local           # Local environment variables (not in git)
├── tailwind.config.js   # Tailwind configuration
├── tsconfig.json        # TypeScript configuration
├── vite.config.ts       # Vite configuration
└── package.json         # Dependencies and scripts
```

## Routes

| Path | Description |
|------|-------------|
| `/` | Homepage with sign-in button |
| `/auth/callback` | OAuth callback handler |
| `/dashboard` | Authenticated user dashboard |
| `/dashboard?verification_code=xxx` | Auto sign-in from extension |

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API base URL | `http://localhost:7071/api` |

**Development** (`.env.development`):
```
VITE_API_BASE_URL=http://localhost:7071/api
```

**Production** (`.env.production`):
```
VITE_API_BASE_URL=https://api.chat2deal.com/api
```

## Documentation

See [Docs/](../Docs/) folder for:
- [Website Architecture](../Docs/Architecture/Website-Architecture.md)
- [BRD](../Docs/BRDs/BRD-001-MVP-Pipedrive-WhatsApp.md)

## License

Proprietary - All rights reserved
