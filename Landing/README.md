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

### Header
- Fixed navigation bar at the top (does not scroll)
- Chat2Deal logo
- "Join the Waitlist" button (scrolls to hero form)
- "Sign in" button
- Transparent background that blends seamlessly with hero section

### 1. Hero Section
- Full viewport height
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

## SEO

- Proper meta tags (title, description)
- Open Graph tags for social sharing
- Twitter Card tags
- Semantic HTML structure
- Mobile-responsive design

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
