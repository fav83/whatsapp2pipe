# Chat2Deal Landing Page

A modern, responsive landing page for Chat2Deal - WhatsApp to Pipedrive integration.

## Overview

This landing page is built following the design specification in [Spec-123-Landing-Page-Design.md](../Docs/Specs/Spec-123-Landing-Page-Design.md).

**Features:**
- Modern SaaS design with clean typography and subtle animations
- Fully responsive (mobile, tablet, desktop)
- Waitlist form with client-side validation
- SEO optimized with Open Graph and Twitter meta tags
- Accessibility compliant (WCAG AA)
- Form handling with success/error states

## Tech Stack

- **Framework**: Vite + React 18 + TypeScript
- **Styling**: Tailwind CSS v3
- **Build Tool**: Vite
- **Type Checking**: TypeScript

## Project Structure

```
Landing/
├── src/
│   ├── components/      # React components
│   │   ├── Header.tsx          # Fixed navigation header
│   │   ├── Hero.tsx            # Hero section with waitlist form
│   │   ├── Benefits.tsx        # 3-card benefits section
│   │   ├── HowItWorks.tsx      # 4-step process section
│   │   ├── FinalCTA.tsx        # Final CTA with waitlist form
│   │   ├── Footer.tsx          # Footer with links
│   │   └── WaitlistForm.tsx    # Reusable waitlist form component
│   ├── hooks/           # Custom React hooks
│   │   └── useWaitlistForm.ts  # Form state and validation logic
│   ├── services/        # API services
│   │   └── api.ts              # Waitlist API integration
│   ├── types/           # TypeScript types
│   │   └── index.ts            # Shared type definitions
│   ├── App.tsx          # Main App component
│   ├── main.tsx         # Entry point
│   └── index.css        # Global styles with Tailwind directives
├── public/              # Static assets
├── .env.example         # Environment variables template
├── .env.local           # Local environment variables (not in git)
├── index.html           # HTML template with meta tags
├── tailwind.config.js   # Tailwind configuration
├── postcss.config.js    # PostCSS configuration
├── tsconfig.json        # TypeScript configuration
├── vite.config.ts       # Vite configuration
└── package.json         # Dependencies and scripts
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Navigate to the Landing folder:
   ```bash
   cd Landing
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy environment variables:
   ```bash
   cp .env.example .env.local
   ```

4. Update `.env.local` with your API endpoint:
   ```
   VITE_API_BASE_URL=http://localhost:3000/api
   ```

### Development

Run the development server:

```bash
npm run dev
```

The site will be available at `http://localhost:5173`

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

## Page Sections

### Hero Section (includes Header)
- Full viewport height with white background and subtle indigo gradient
- **Header navigation** at the top (scrolls with page content):
  - chat2deal logo with Momo Trust Display font
  - "Join the Waitlist" button (scrolls to form)
  - "Sign in" button
- **Hero content**:
  - Two-column layout (60/40 split on desktop)
  - Primary headline and subheadline
  - Waitlist form (email + optional name)
  - Floating geometric shapes animation

### 2. Benefits Section
- Light gray background
- 3 benefit cards in a grid
- Icons, headings, and descriptions
- Hover lift effect on cards

### 3. How It Works Section
- White background
- 4-step process with numbered badges
- Vertical timeline connector (desktop only)
- Step-by-step user journey

### 4. Final CTA Section
- Indigo gradient background
- Centered content with heading
- Waitlist form with white styling
- Trust line with benefits

### 5. Footer
- White background with top border
- Three-column layout (branding, links, sign-in)
- Privacy policy and terms links
- Sign-in link for beta users

## Design System

### Colors
- **Primary**: `#6366f1` (indigo)
- **Secondary**: `#66748d` (gray)
- **Black**: `#000000`
- **White**: `#ffffff`
- **Light Gray**: `#e2e8f0`

### Typography
- **Font**: Inter (loaded from Google Fonts)
- **Weights**: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)

### Responsive Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1023px
- **Desktop**: ≥ 1024px

## Form Validation

The waitlist form includes:
- **Email**: Required, valid format, max 255 characters
- **Name**: Optional, max 100 characters
- Real-time validation on blur
- Inline error messages
- Success state with confirmation message
- Loading state during submission
- Error handling for network/server errors

## API Integration

### Waitlist Endpoint

**Endpoint**: `POST /api/waitlist`

**Request Body**:
```json
{
  "email": "user@example.com",
  "name": "John Doe" // Optional
}
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "You're on the waitlist!"
}
```

**Error Response** (400/429/500):
```json
{
  "success": false,
  "error": "Error message"
}
```

## Accessibility

- Semantic HTML structure
- ARIA labels for form inputs
- Keyboard navigation support
- Focus indicators on interactive elements
- Color contrast meets WCAG AA standards
- Screen reader support with aria-live regions

## Performance

- Optimized bundle size
- Lazy loading for below-the-fold content
- Preconnect for Google Fonts
- Efficient Tailwind CSS purging

## Browser Support

- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)
- iOS Safari (latest 2 versions)
- Chrome Mobile (latest 2 versions)

## SEO System

This landing page includes a comprehensive, automated SEO system. See [Docs/Architecture/Landing-SEO-Architecture.md](../Docs/Architecture/Landing-SEO-Architecture.md) for complete technical details.

**Features:**
- Dynamic meta tag management with react-helmet-async
- Automated route discovery and sitemap generation
- Static pre-rendering capability (optional)
- Robots.txt configuration
- Open Graph and Twitter Card tags

### SEO Build Commands

**Standard Build (Recommended):**
```bash
npm run build
```
Includes: TypeScript compilation → Vite build → Sitemap generation

**Build with Pre-rendering:**
```bash
npm run build:prerender
```
Includes: Standard build + Automated pre-rendering + Sitemap

**Individual Commands:**
```bash
npm run generate-sitemap   # Generate sitemap only
npm run prerender:run       # Pre-render (requires preview server)
```

### SEO Configuration

Create or update `.env.local`:
```bash
# Required for SEO
VITE_SITE_URL=https://chat2deal.com

# API endpoint
VITE_API_BASE_URL=http://localhost:3000/api
```

### Adding Pages with SEO

1. **Create page component** with `PageHelmet`:
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

3. **Build** - The page is automatically included in sitemap!

### SEO Files

```
Landing/
├── public/
│   └── robots.txt                    # Robots.txt (copied to dist/)
├── scripts/
│   ├── route-discovery.js           # Automated route discovery
│   ├── generate-sitemap.js          # Sitemap generation
│   ├── prerender.js                 # Static pre-rendering
│   └── build-with-prerender.js      # Automated server management
├── src/
│   └── components/
│       └── SEO/
│           ├── PageHelmet.tsx       # SEO meta tag component
│           └── index.ts
└── dist/                             # Build output
    ├── sitemap.xml                  # Generated sitemap
    └── robots.txt                   # Copied from public/
```

### When to Use Pre-rendering

**Use `npm run build:prerender` when:**
- Deploying to pure CDN without server-side rendering
- Targeting legacy search engine crawlers
- Need instant SEO without JavaScript execution

**Use standard `npm run build` when:**
- Deploying to modern hosting (Netlify, Vercel, etc.)
- Dynamic meta tags are sufficient (recommended for most cases)
- Want faster build times

## Deployment

Build the project for production:

```bash
npm run build
```

Deploy the `dist/` folder to your hosting provider:
- Netlify
- Vercel
- AWS S3 + CloudFront
- Azure Static Web Apps
- Any static hosting service

## Environment Variables

Create a `.env.local` file (not tracked in git):

```
VITE_API_BASE_URL=http://localhost:3000/api
```

For production, set this to your actual API endpoint.

## License

Proprietary - All rights reserved
