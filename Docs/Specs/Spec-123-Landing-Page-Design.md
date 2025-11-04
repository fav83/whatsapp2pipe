# Landing Page Design Specification

## Document Status
**Status**: Draft (Ready for implementation in v0/Lovable)
**Last Updated**: 2025-11-04
**Version**: 1.0

---

## Overview

This document defines the complete design specification for the Chat2Deal landing page. The landing page will showcase the product and drive visitors to join the waitlist for closed beta access.

**Primary Goal**: Product showcase + sign-up for closed beta waitlist

**Tone**: Balanced/Universal - Appeal to both enterprise sales teams AND scrappy founders. Professional but approachable.

**Visual Style**: Modern SaaS - Clean, lots of white space, subtle gradients, glass-morphism effects, floating cards, animated elements.

---

## Project Setup

### Technical Stack
- **Framework**: Vite + React 18 + TypeScript
- **Styling**: Tailwind CSS (latest version)
- **Responsive**: Mobile-first approach

### Responsive Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1023px
- **Desktop**: ≥ 1024px
- **Max Content Width**: 1280px (centered)

---

## Design System

### Color Palette

```css
--color-white: #ffffff
--color-gray-light: #e2e8f0
--color-indigo: #6366f1
--color-gray-secondary: #66748d
--color-black: #000000
```

**Usage**:
- **Primary Action**: Indigo (#6366f1) for CTAs, accents, and interactive elements
- **Text Primary**: Black (#000000) for headings and primary content
- **Text Secondary**: Secondary gray (#66748d) for supporting text and labels
- **Backgrounds**: White (#ffffff) base, light gray (#e2e8f0) for alternating sections
- **Hover States**: Darker indigo (#5558e3) for button hovers

### Typography

**Font Family**: Inter or system-ui fallback

**Type Scale**:
- **Hero Heading**: 48-64px, bold (font-weight: 700)
- **Section Headings**: 32-40px, bold (font-weight: 700)
- **Subheadings**: 18-20px, semibold (font-weight: 600)
- **Body Text**: 16-18px, regular (font-weight: 400)
- **Small Text**: 14px, regular (font-weight: 400)
- **Eyebrow Text**: 12-14px, uppercase, letter-spacing: 0.05em

### Spacing Scale

- **Section Padding**: 80-100px vertical, 20-40px horizontal
- **Card Padding**: 24-32px
- **Element Spacing**: 16-24px between related elements
- **Section Gaps**: 80-120px between major sections
- **Component Gaps**: 8-16px for closely related items

### Shadows

- **shadow-sm**: 0 1px 2px 0 rgba(0, 0, 0, 0.05)
- **shadow-md**: 0 4px 6px -1px rgba(0, 0, 0, 0.1)
- **shadow-lg**: 0 10px 15px -3px rgba(0, 0, 0, 0.1)

### Border Radius

- **Small**: 8px (inputs, buttons, cards)
- **Medium**: 12px (benefit cards)
- **Large**: 16px (hero visual elements)

---

## Page Structure

The landing page consists of 5 main sections:

1. **Hero Section** - Problem statement with primary waitlist CTA
2. **Benefits Section** - 3 key value propositions
3. **How It Works Section** - 4-step user journey
4. **Final CTA Section** - Strong closing waitlist signup
5. **Footer** - Links and sign-in for beta users

---

## Section 1: Hero Section

### Layout

**Structure**: Full viewport height (min-h-screen), centered content, two-column on desktop (60/40 split), stacked on mobile.

**Background**:
- White base (#ffffff)
- Subtle radial gradient: Indigo at 5% opacity emanating from top-right
- Optional: Very light gray dot grid pattern for texture

**Padding**: 80px vertical, 40px horizontal (desktop)

### Left Column - Content

**Headline**:
- Text: "Stop losing WhatsApp leads in the chaos"
- Font size: 48-64px
- Font weight: Bold (700)
- Color: Black (#000000)
- Line height: 1.1
- Max width: 600px

**Subheadline**:
- Text: "Sales teams waste hours copying contacts between WhatsApp and Pipedrive. Chat2Deal captures every lead instantly—right inside WhatsApp Web."
- Font size: 18px
- Color: Secondary gray (#66748d)
- Line height: 1.6
- Max width: 540px
- Margin top: 24px

**Waitlist Form**:
- Layout: Vertical stack, 16px gap
- Margin top: 40px
- Max width: 480px

**Email Input**:
- Background: White
- Border: 1px solid #e2e8f0
- Focus state: 2px border indigo, ring-2 ring-indigo/20
- Font size: 16px
- Placeholder: "Enter your email"
- Border radius: 8px
- Padding: 12-16px
- Width: 100%

**Name Input**:
- Same styling as email input
- Placeholder: "Your name (optional)"

**Submit Button**:
- Background: Indigo (#6366f1)
- Text: "Join the Waitlist"
- Font size: 16px
- Font weight: Medium (500)
- Color: White
- Border radius: 8px
- Padding: 12-16px
- Width: 100%
- Hover state: Darker indigo (#5558e3)
- Transition: 200ms ease

**Trust Text**:
- Text: "Get early access. No credit card required."
- Font size: 14px
- Color: Secondary gray (#66748d)
- Text align: Center
- Margin top: 12px

### Right Column - Visual

**Abstract Illustration Options**:

**Option 1**: WhatsApp icon → Arrow → Pipedrive icon
- Simple, minimalist style
- Icons: 80-100px
- Arrow: 40px, indigo color
- Horizontal layout with 32px gaps

**Option 2**: Floating geometric shapes
- Circles and rounded rectangles
- Colors: Indigo, white, light gray
- Various sizes: 60px - 200px
- Overlapping with subtle shadows
- Z-index layering for depth

**Visual Enhancements**:
- Background gradient: White to light indigo (10% opacity)
- Subtle floating animation (optional): translateY -10px to 10px, 3s ease-in-out infinite
- Fade-in animation on page load

### Responsive Behavior

**Mobile (< 768px)**:
- Stack vertically
- Hero content first, visual below
- Reduce heading to 40-48px
- Form inputs full width
- Padding: 40px vertical, 20px horizontal

**Tablet (768px - 1023px)**:
- Still stacked but with increased font sizes
- Heading: 52px
- More generous spacing

---

## Section 2: Benefits Section

### Layout

**Background**: Light gray (#e2e8f0)

**Padding**: 80-100px vertical, 40px horizontal

**Container**: Max width 1200px, centered

### Section Header

**Centered alignment**:

**Eyebrow Text**:
- Text: "Why Chat2Deal"
- Font size: 14px
- Color: Indigo (#6366f1)
- Text transform: Uppercase
- Letter spacing: 0.05em
- Font weight: Semibold (600)

**Main Heading**:
- Text: "Your CRM, without the context switching"
- Font size: 36-40px
- Font weight: Bold (700)
- Color: Black (#000000)
- Margin top: 8px
- Line height: 1.2

**Spacing**: 64px margin between heading and cards

### Three Benefit Cards

**Grid Layout**:
- Desktop: 3 columns, 32px gap
- Tablet: 2 columns, 24px gap (third card spans full width)
- Mobile: 1 column, 24px gap

**Card Structure (Each Card)**:

**Container**:
- Background: White (#ffffff)
- Border radius: 12px
- Shadow: shadow-sm
- Padding: 32px
- Transition: 300ms ease-out
- Hover effect: translateY(-4px) + shadow-lg

**Layout**: Vertical stack (icon, heading, description)

**Icon**:
- Size: 40px × 40px
- Color: Indigo (#6366f1)
- Margin bottom: 20px

**Heading**:
- Font size: 20px
- Font weight: Semibold (600)
- Color: Black (#000000)
- Margin bottom: 12px
- Line height: 1.3

**Description**:
- Font size: 16px
- Font weight: Regular (400)
- Color: Secondary gray (#66748d)
- Line height: 1.6

### Card Content

**Card 1: Speed**:
- Icon: Lightning bolt
- Heading: "Capture leads in seconds"
- Description: "No more alt-tabbing, copying phone numbers, or losing track. Create Pipedrive contacts without leaving WhatsApp."

**Card 2: Zero Data Entry**:
- Icon: Checklist/form with checkmark
- Heading: "Auto-filled, ready to save"
- Description: "Contact names and phone numbers pulled automatically. Just click create—or attach to an existing contact."

**Card 3: Seamless Workflow**:
- Icon: Link/connection icon
- Heading: "Live in WhatsApp, sync to Pipedrive"
- Description: "A sidebar that lives in WhatsApp Web. Every chat, every lead, instantly synced. Jump to Pipedrive with one click."

### Responsive Behavior

**Mobile (< 768px)**:
- Single column stack
- Card padding: 24px
- Heading font size: 18px
- Reduce vertical spacing to 60px

---

## Section 3: How It Works Section

### Layout

**Background**: White (#ffffff)

**Padding**: 80-100px vertical, 40px horizontal

**Container**: Max width 900px, centered

### Section Header

**Centered alignment**:

**Eyebrow Text**:
- Text: "Simple Process"
- Font size: 14px
- Color: Indigo (#6366f1)
- Text transform: Uppercase
- Letter spacing: 0.05em
- Font weight: Semibold (600)

**Main Heading**:
- Text: "From WhatsApp chat to Pipedrive contact"
- Font size: 36-40px
- Font weight: Bold (700)
- Color: Black (#000000)
- Margin top: 8px

**Subheading**:
- Text: "Four steps. Zero friction."
- Font size: 18px
- Color: Secondary gray (#66748d)
- Margin top: 12px

**Spacing**: 64px margin between header and steps

### Four Step Cards

**Layout**: Vertical timeline with connecting line (desktop only)

**Visual Connection**:
- Dotted vertical line (2px width, indigo at 20% opacity)
- Connects numbered badges
- Positioned behind badges (z-index)
- Only visible on desktop (≥ 1024px)

**Card Structure (Each Step)**:

**Layout**: Horizontal flex, 80px gap between badge and content

**Number Badge**:
- Shape: Circle
- Size: 56px diameter
- Background: Indigo (#6366f1)
- Text: Step number ("1", "2", "3", "4")
- Font size: 24px
- Font weight: Bold (700)
- Color: White
- Centered alignment
- Position: relative (above timeline line, z-index: 10)

**Content Area**:
- Flex: 1 (fills remaining space)
- Layout: Vertical stack (heading, description, icon)

**Heading**:
- Font size: 20px
- Font weight: Semibold (600)
- Color: Black (#000000)
- Margin bottom: 8px

**Description**:
- Font size: 16px
- Color: Secondary gray (#66748d)
- Line height: 1.6
- Margin bottom: 16px

**Icon**:
- Size: 24px × 24px
- Color: Secondary gray (#66748d)
- Decorative (not functional)

**Spacing**: 48px margin between step cards

### Step Content

**Step 1: Auto-Detect**:
- Number: "1"
- Heading: "Open any WhatsApp chat"
- Description: "Switch to a 1-on-1 conversation. Chat2Deal instantly reads the contact's phone number."
- Icon: Phone/chat bubble

**Step 2: Smart Lookup**:
- Number: "2"
- Heading: "See if they're already in Pipedrive"
- Description: "Automatic lookup finds existing contacts. Matched? Jump straight to their Pipedrive profile."
- Icon: Magnifying glass

**Step 3: Quick Create**:
- Number: "3"
- Heading: "Create new contacts instantly"
- Description: "No match? Click create. Name pre-filled from WhatsApp. Add optional email. Done in 3 seconds."
- Icon: Plus/user icon

**Step 4: Stay Synced**:
- Number: "4"
- Heading: "Open in Pipedrive anytime"
- Description: "One-click deep link to the contact. Update deals, add notes, track your pipeline—all connected."
- Icon: External link

### Responsive Behavior

**Mobile (< 768px)**:
- Remove timeline connector
- Stack vertically
- Number badge: 48px diameter, inline with heading
- Reduce gap to 16px between badge and content
- Reduce spacing between steps to 32px
- Hide decorative icons

**Tablet (768px - 1023px)**:
- Remove timeline connector
- Maintain horizontal layout for each step
- Reduce badge size to 48px
- Reduce gap to 40px

---

## Section 4: Final CTA Section

### Layout

**Background**: Linear gradient (indigo #6366f1 to darker indigo #5558e3, top to bottom)

**Padding**: 100-120px vertical, 40px horizontal

**Container**: Max width 640px, centered

**Text align**: Center

### Content

**Heading**:
- Text: "Ready to stop losing leads?"
- Font size: 40-48px
- Font weight: Bold (700)
- Color: White (#ffffff)
- Line height: 1.2
- Margin bottom: 20px

**Subheading**:
- Text: "Join the waitlist and get early access to Chat2Deal. Start capturing every WhatsApp conversation in your CRM."
- Font size: 18px
- Color: White with 90% opacity
- Line height: 1.6
- Margin bottom: 32px

### Waitlist Form

**Layout**: Vertical stack, 12px gap between inputs, 16px gap to button

**Email Input**:
- Background: White (#ffffff)
- Border: None
- Shadow: shadow-sm
- Font size: 16px
- Placeholder: "Enter your email"
- Border radius: 8px
- Padding: 12-16px
- Width: 100%
- Focus state: ring-2 ring-white/30

**Name Input**:
- Same styling as email input
- Placeholder: "Name (optional)"

**Submit Button**:
- Background: White (#ffffff)
- Text: "Join the Waitlist"
- Font size: 16px
- Font weight: Medium (500)
- Color: Indigo (#6366f1)
- Border radius: 8px
- Padding: 12-16px
- Width: 100%
- Shadow: shadow-md
- Hover state: Opacity 90%, shadow-lg
- Transition: 200ms ease

**Trust Line**:
- Text: "Free during beta • No credit card • Unsubscribe anytime"
- Font size: 14px
- Color: White with 70% opacity
- Margin top: 16px
- Text align: Center

### Visual Enhancement (Optional)

**Background Decoration**:
- Subtle blob shapes in lighter/darker indigo
- Absolute positioning
- Low opacity (10-20%)
- Various sizes and positions
- No interaction

### Responsive Behavior

**Desktop (≥ 1024px)**:
- Optional: Horizontal layout for inputs (side-by-side)
- Keep button full-width below

**Mobile (< 768px)**:
- Reduce heading to 32-36px
- Reduce padding to 80px vertical
- All inputs full width, stacked

---

## Section 5: Footer

### Layout

**Background**: White (#ffffff)

**Border Top**: 1px solid #e2e8f0

**Padding**: 60-80px vertical, 40px horizontal

**Container**: Max width 1280px, centered

**Layout Structure**: Three-column flex, space-between alignment

### Left Column - Branding

**Brand Name**:
- Text: "Chat2Deal"
- Font size: 16px
- Font weight: Semibold (600)
- Color: Black (#000000)

**Tagline**:
- Text: "WhatsApp meets Pipedrive"
- Font size: 14px
- Color: Secondary gray (#66748d)
- Margin top: 4px

### Center Column - Links

**Layout**: Horizontal flex, 24px gap

**Links**:
- Text: "Privacy Policy" and "Terms of Service"
- Font size: 14px
- Color: Secondary gray (#66748d)
- Hover: Indigo (#6366f1)
- Transition: 200ms ease
- No underline (default), underline on hover

**Separator**:
- Character: "•"
- Color: Secondary gray (#66748d)
- Margin: 0 12px

### Right Column - Sign In

**Layout**: Horizontal flex, 8px gap

**Label Text**:
- Text: "Already have beta access?"
- Font size: 14px
- Color: Secondary gray (#66748d)

**Sign In Link**:
- Text: "Sign in"
- Font size: 14px
- Font weight: Medium (500)
- Color: Indigo (#6366f1)
- Hover: Darker indigo (#5558e3)
- Transition: 200ms ease

### Responsive Behavior

**Mobile (< 768px)**:
- Stack vertically, center-aligned
- Spacing: 24px gaps between sections
- Links remain horizontal with separator

**Tablet (768px - 1023px)**:
- Maintain three-column layout
- Reduce horizontal padding

---

## Interactive States

### Form Inputs

**Default State**:
- Border: 1px solid #e2e8f0
- Background: White
- Text color: Black

**Focus State**:
- Border: 2px solid indigo (#6366f1)
- Ring: ring-2 ring-indigo/20
- Transition: 200ms ease
- Outline: none

**Error State**:
- Border: 2px solid red-500
- Ring: ring-2 ring-red-500/20
- Error message below: 14px, red-600

**Disabled State**:
- Opacity: 60%
- Cursor: not-allowed
- Background: Gray-100

### Buttons

**Primary Button (Indigo)**:

**Default**:
- Background: Indigo (#6366f1)
- Text: White
- Cursor: pointer

**Hover**:
- Background: Darker indigo (#5558e3)
- Transition: 200ms ease

**Active**:
- Background: Even darker indigo (#4f52d9)
- Transform: scale(0.98)

**Disabled**:
- Opacity: 60%
- Cursor: not-allowed
- No hover effect

**Loading**:
- Show spinner (20px, white)
- Disable interaction
- Text replaced by spinner

**White Button (CTA Section)**:

**Default**:
- Background: White
- Text: Indigo
- Shadow: shadow-md

**Hover**:
- Opacity: 90%
- Shadow: shadow-lg
- Transition: 200ms ease

**Active**:
- Opacity: 85%
- Shadow: shadow-md

### Cards (Benefits Section)

**Default**:
- Shadow: shadow-sm
- Transform: none
- Transition: 300ms ease-out

**Hover**:
- Transform: translateY(-4px)
- Shadow: shadow-lg

### Links

**Default**:
- No underline
- Color based on context

**Hover**:
- Underline
- Color transition: 200ms ease

**Focus**:
- Outline: 2px solid indigo
- Outline offset: 2px

---

## Form Handling

### Validation Rules

**Email Field**:
- Required: Yes
- Validation: Valid email format (regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`)
- Max length: 255 characters
- Error message: "Please enter a valid email address"

**Name Field**:
- Required: No
- Max length: 100 characters
- Trim whitespace
- Error message: "Name must be less than 100 characters"

### Client-Side Validation

**On Submit**:
1. Validate email format and presence
2. Validate name length (if provided)
3. Show inline error messages below fields (14px, red-600)
4. Prevent submission if validation fails
5. Focus first error field

**Real-Time Validation** (Optional):
- Validate on blur (after user leaves field)
- Clear errors on input change

### Success State

**Display**:
- Replace entire form with success message
- Smooth fade transition (300ms)

**Success Message**:
- Text: "You're on the waitlist! We'll email you when access is available."
- Font size: 18px
- Color: Black (hero section) or White (CTA section)
- Text align: Center

**Success Icon**:
- Checkmark icon (48px)
- Color: Indigo
- Display above text
- Margin bottom: 16px

### Loading State

**Button**:
- Show spinner (20px, color based on button type)
- Disable button
- Cursor: not-allowed

**Inputs**:
- Disable all inputs
- Opacity: 60%
- Read-only

**Duration**: Until API response received

### Error State (Submission Error)

**Display**:
- Show error banner above form
- Red background (red-50)
- Red border (red-300)
- Red text (red-600)

**Error Message**:
- Generic: "Something went wrong. Please try again."
- Network error: "Unable to connect. Please check your internet connection."
- Rate limit: "Too many requests. Please try again in a few minutes."

**Dismiss**:
- Close button (X icon) in top-right
- Auto-dismiss after 5 seconds (optional)

---

## Responsive Design

### Mobile (< 768px)

**Hero Section**:
- Stack vertically (content first, visual below)
- Heading: 40-48px
- Padding: 40px vertical, 20px horizontal
- Form inputs: Full width

**Benefits Section**:
- Single column cards
- Card padding: 24px
- Heading: 18px
- Reduce vertical spacing: 60px

**How It Works**:
- Remove timeline connector
- Stack steps vertically
- Number badge: 48px, inline with heading
- Reduce gaps: 16px (badge to content), 32px (between steps)

**Final CTA**:
- Heading: 32-36px
- Padding: 80px vertical
- All inputs full width, stacked

**Footer**:
- Stack vertically, center-aligned
- 24px gaps between sections

### Tablet (768px - 1023px)

**Hero Section**:
- Still stacked but with larger fonts
- Heading: 52px
- More generous spacing

**Benefits Section**:
- 2-column grid
- Third card spans full width below
- 24px gap

**How It Works**:
- Remove timeline connector
- Maintain horizontal layout per step
- Reduce badge size: 48px
- Reduce gap: 40px

**Final CTA**:
- Optional: Side-by-side inputs
- Keep button full-width

### Desktop (≥ 1024px)

**Hero Section**:
- Two-column layout (60/40 split)
- Full specifications as detailed

**Benefits Section**:
- 3-column grid
- 32px gap

**How It Works**:
- Vertical timeline with connecting line
- Full specifications as detailed

**Final CTA**:
- Optional: Horizontal input layout (desktop only)

**Max Widths**:
- Overall container: 1280px
- Hero content: 600px (left column)
- CTA section: 640px
- How It Works: 900px
- Benefits: 1200px

---

## Accessibility

### Semantic HTML

**Structure**:
- `<header>` for hero section
- `<main>` wrapper for all main content
- `<section>` for each major section
- `<footer>` for footer
- `<form>` for waitlist forms
- `<button>` for all buttons (not divs)
- `<a>` for all links

### Heading Hierarchy

- **H1**: Hero headline ("Stop losing WhatsApp leads...")
- **H2**: Section headings ("Your CRM, without...", "From WhatsApp chat to...")
- **H3**: Card headings (benefit cards, step headings)

### ARIA Labels

**Form Inputs**:
- Associate labels with inputs (explicit or aria-label)
- Email: `aria-label="Email address"`
- Name: `aria-label="Your name (optional)"`

**Buttons**:
- Submit: `aria-label="Join the waitlist"`
- Loading state: `aria-busy="true"`

**Icons**:
- Decorative icons: `aria-hidden="true"`
- Functional icons: Appropriate aria-label

### Keyboard Navigation

**Focus States**:
- All interactive elements have visible focus indicators
- Focus outline: 2px solid indigo, 2px offset
- Tab order follows logical reading flow

**Skip Links** (Optional):
- "Skip to main content" link at page top
- Hidden until keyboard focus
- Links to `<main>` element

### Color Contrast

**Text Contrast Ratios** (WCAG AA compliance):
- Black on white: 21:1 (AAA) ✓
- Secondary gray (#66748d) on white: 7.2:1 (AAA) ✓
- White on indigo (#6366f1): 4.8:1 (AA) ✓
- Indigo on white: 4.8:1 (AA) ✓

**Interactive Element Contrast**:
- Button text: Meets AA standards
- Link colors: Meets AA standards
- Error messages: red-600 on white meets AA

### Screen Reader Support

**Announcements**:
- Form validation errors announced via `aria-live="polite"`
- Success messages announced via `aria-live="polite"`
- Loading states indicated via `aria-busy="true"`

**Alternative Text**:
- All decorative illustrations: `alt=""` or `aria-hidden="true"`
- All functional images: Descriptive alt text

### Focus Management

**Form Submission**:
- On error: Focus first error field
- On success: Focus success message

**Modal/Overlays** (if used):
- Trap focus within modal
- Return focus to trigger element on close

---

## Performance Optimization

### Loading Strategy

**Critical CSS**:
- Inline critical above-the-fold CSS
- Defer non-critical styles

**Images**:
- Lazy load below-the-fold images
- Use WebP format with fallbacks
- Optimize SVG icons (remove unnecessary data)

**JavaScript**:
- Minimal JS bundle (form handling only)
- Defer non-critical scripts
- Use code splitting if applicable

### Performance Metrics Targets

- **First Contentful Paint (FCP)**: < 1.5s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Time to Interactive (TTI)**: < 3.0s
- **Cumulative Layout Shift (CLS)**: < 0.1
- **First Input Delay (FID)**: < 100ms

### Optimization Techniques

**Images**:
- Compress and optimize all images
- Use appropriate sizes for different breakpoints
- Implement lazy loading for non-critical images

**Fonts**:
- Use system fonts or font-display: swap
- Limit to 1-2 font weights
- Preload critical fonts

**CSS**:
- Minimize unused CSS (Tailwind purge)
- Combine and minify stylesheets
- Use CSS containment where appropriate

**JavaScript**:
- Minimize JavaScript bundle size
- Remove unused dependencies
- Use defer or async attributes

---

## Animation Guidelines

### Subtle Animations (Optional)

**Fade-In on Scroll**:
- Elements: Section headers, cards
- Trigger: Intersection Observer (when entering viewport)
- Effect: Opacity 0 → 1, translateY 20px → 0
- Duration: 600ms
- Easing: ease-out
- Threshold: 20% visible

**Hero Visual Float**:
- Element: Hero right column illustration
- Effect: translateY -10px → 10px
- Duration: 3000ms
- Easing: ease-in-out
- Loop: Infinite

**Card Hover**:
- Element: Benefit cards
- Effect: translateY -4px, shadow-lg
- Duration: 300ms
- Easing: ease-out

**Button Hover**:
- Effect: Background color change
- Duration: 200ms
- Easing: ease

### Animation Principles

**Performance**:
- Use `transform` and `opacity` only (GPU-accelerated)
- Avoid animating `width`, `height`, `top`, `left`
- Use `will-change` sparingly

**Accessibility**:
- Respect `prefers-reduced-motion` media query
- Disable animations if user prefers reduced motion
- Provide static alternatives

**Implementation**:
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition: none !important;
  }
}
```

---

## API Integration

### Waitlist Endpoint

**Endpoint**: POST `/api/waitlist`

**Request Body**:
```json
{
  "email": "user@example.com",
  "name": "John Doe" // Optional
}
```

**Response (Success)**:
```json
{
  "success": true,
  "message": "You're on the waitlist!"
}
```

**Response (Error)**:
```json
{
  "success": false,
  "error": "Invalid email address"
}
```

**Status Codes**:
- 200: Success
- 400: Validation error (invalid email, etc.)
- 429: Rate limit exceeded
- 500: Server error

### Error Handling

**Client-Side**:
- Validate before submission
- Handle network errors gracefully
- Show user-friendly error messages
- Allow retry on failure

**Server-Side Validation**:
- Validate email format
- Check for duplicates (update timestamp if exists)
- Sanitize input
- Rate limiting

---

## SEO Optimization

### Meta Tags

**Basic Meta**:
```html
<title>Chat2Deal - WhatsApp to Pipedrive in Seconds</title>
<meta name="description" content="Stop losing WhatsApp leads. Chat2Deal captures every conversation directly into your Pipedrive CRM—no context switching, no data entry.">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

**Open Graph**:
```html
<meta property="og:title" content="Chat2Deal - WhatsApp to Pipedrive in Seconds">
<meta property="og:description" content="Stop losing WhatsApp leads. Chat2Deal captures every conversation directly into your Pipedrive CRM.">
<meta property="og:type" content="website">
<meta property="og:url" content="https://chat2deal.com">
<meta property="og:image" content="https://chat2deal.com/og-image.jpg">
```

**Twitter Card**:
```html
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Chat2Deal - WhatsApp to Pipedrive in Seconds">
<meta name="twitter:description" content="Stop losing WhatsApp leads. Chat2Deal captures every conversation directly into your Pipedrive CRM.">
<meta name="twitter:image" content="https://chat2deal.com/twitter-image.jpg">
```

### Structured Data

**Organization Schema**:
```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Chat2Deal",
  "description": "Chrome extension for WhatsApp to Pipedrive integration",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Chrome",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  }
}
```

### Content Optimization

**Keywords**:
- Primary: "WhatsApp Pipedrive integration"
- Secondary: "WhatsApp CRM", "Pipedrive Chrome extension", "WhatsApp lead capture"

**Content Structure**:
- Use semantic HTML (h1, h2, h3)
- Include keywords naturally in headings
- Write descriptive alt text (when using images)
- Use descriptive link text (not "click here")

---

## Browser Compatibility

### Supported Browsers

**Desktop**:
- Chrome: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Edge: Latest 2 versions

**Mobile**:
- iOS Safari: Latest 2 versions
- Chrome Mobile: Latest 2 versions
- Samsung Internet: Latest version

### Fallbacks

**CSS**:
- Use `@supports` for modern features
- Provide fallbacks for gradients, backdrop-filter

**JavaScript**:
- Polyfill for Intersection Observer (if used)
- Feature detection before using modern APIs

---

## Development Notes

### Component Structure (Suggested)

```
src/
├── components/
│   ├── Hero.tsx
│   ├── Benefits.tsx
│   ├── HowItWorks.tsx
│   ├── FinalCTA.tsx
│   ├── Footer.tsx
│   └── WaitlistForm.tsx
├── hooks/
│   └── useWaitlistForm.ts
├── services/
│   └── api.ts
├── App.tsx
└── main.tsx
```

### State Management

**Form State**:
- Use React hooks (useState for form fields)
- Track: email, name, isSubmitting, isSuccess, error

**Validation**:
- Custom hook or library (e.g., React Hook Form, Formik)
- Client-side validation before submission

### Testing Considerations

**Unit Tests**:
- Form validation logic
- API service functions
- Utility functions

**Integration Tests**:
- Form submission flow
- Success/error state handling
- Responsive behavior

**E2E Tests** (Optional):
- Complete user journey (view page → submit form → see success)
- Test across different devices/browsers

---

## Deployment Checklist

### Pre-Launch

- [ ] All sections implemented and styled correctly
- [ ] Forms validated and working
- [ ] API integration tested
- [ ] Responsive design tested on all breakpoints
- [ ] Browser compatibility tested
- [ ] Accessibility audit completed (WCAG AA)
- [ ] Performance metrics meet targets
- [ ] SEO meta tags configured
- [ ] Analytics tracking implemented
- [ ] Error tracking configured (Sentry or similar)

### Launch

- [ ] Domain configured
- [ ] SSL certificate active
- [ ] API endpoints live
- [ ] Database ready for waitlist entries
- [ ] Monitoring configured
- [ ] Backup strategy in place

### Post-Launch

- [ ] Monitor form submissions
- [ ] Track performance metrics
- [ ] Monitor error rates
- [ ] Gather user feedback
- [ ] A/B testing (optional)

---

## Future Enhancements (Post-MVP)

### Potential Additions

1. **Video Demo**: Short product demo video in hero or How It Works section
2. **Testimonials**: Early user quotes when available
3. **Social Proof**: User count, company logos (when applicable)
4. **FAQ Section**: Answer common questions
5. **Blog/Resources**: Content marketing section
6. **Pricing Page**: When moving beyond beta
7. **Comparison Table**: Chat2Deal vs manual process
8. **Interactive Demo**: Embedded walkthrough or screenshots
9. **Email Capture Modal**: Exit-intent popup (use sparingly)
10. **Referral Program**: Reward waitlist referrals

### Analytics to Track

- Page views and unique visitors
- Scroll depth
- Form submission rate
- Form abandonment rate
- Button click rates
- Time on page
- Bounce rate
- Traffic sources
- Device/browser breakdown

---

## Prompt for v0/Lovable

### Concise Prompt Version

```
Create a modern SaaS landing page for Chat2Deal, a Chrome extension that syncs WhatsApp contacts to Pipedrive CRM.

TECH STACK:
- Vite + React 18 + TypeScript + Tailwind CSS
- Mobile-first responsive design

COLOR PALETTE:
- Primary: #6366f1 (indigo)
- Secondary: #66748d (gray)
- Black: #000000
- White: #ffffff
- Light gray: #e2e8f0

PAGE STRUCTURE:

1. HERO SECTION (full viewport height)
   - Two-column (60/40 split on desktop, stacked mobile)
   - Left: Headline "Stop losing WhatsApp leads in the chaos", subheadline, waitlist form (email + optional name)
   - Right: Abstract illustration (WhatsApp → Pipedrive or floating geometric shapes)
   - Background: White with subtle indigo gradient

2. BENEFITS SECTION (light gray background)
   - 3 cards (3-column grid desktop, stacked mobile)
   - Card 1: "Capture leads in seconds" (lightning icon)
   - Card 2: "Auto-filled, ready to save" (checklist icon)
   - Card 3: "Live in WhatsApp, sync to Pipedrive" (link icon)
   - White cards with hover lift effect

3. HOW IT WORKS SECTION (white background)
   - 4 steps with numbered badges (vertical timeline desktop)
   - Step 1: "Open any WhatsApp chat"
   - Step 2: "See if they're already in Pipedrive"
   - Step 3: "Create new contacts instantly"
   - Step 4: "Open in Pipedrive anytime"
   - Dotted line connecting badges (desktop only)

4. FINAL CTA SECTION (indigo gradient background)
   - Centered content: "Ready to stop losing leads?"
   - Waitlist form (email + optional name, white inputs, white button with indigo text)
   - Trust line: "Free during beta • No credit card • Unsubscribe anytime"

5. FOOTER (white background)
   - Three columns: Branding (left), Links (center), Sign In (right)
   - Minimal and clean

DESIGN DETAILS:
- Modern SaaS aesthetic with subtle shadows and rounded corners
- Indigo primary buttons with hover states
- Clean typography (Inter or system-ui)
- Smooth transitions and optional subtle animations
- White cards on gray backgrounds for depth
- Forms validate email and show success/error states

ACCESSIBILITY:
- Semantic HTML
- WCAG AA color contrast
- Keyboard navigation support
- Focus indicators on all interactive elements

Make it clean, professional, and conversion-focused.
```

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-11-04 | Initial specification created with complete design system, all sections, responsive behavior, accessibility, and implementation guidelines |
