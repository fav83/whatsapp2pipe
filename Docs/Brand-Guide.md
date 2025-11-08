# Chat2Deal Brand Guide

**Version:** 1.0
**Last Updated:** 2025-01-08
**Status:** Active

---

## Table of Contents

1. [Brand Overview](#1-brand-overview)
2. [Brand Positioning](#2-brand-positioning)
3. [Color Palette](#3-color-palette)
4. [Typography](#4-typography)
5. [Logo & Icon](#5-logo--icon)
6. [Voice & Tone](#6-voice--tone)
7. [Messaging Framework](#7-messaging-framework)
8. [Visual Style](#8-visual-style)
9. [Application Guidelines](#9-application-guidelines)

---

## 1. Brand Overview

### 1.1 Brand Name
**Chat2Deal**

### 1.2 Tagline
*"Never lose a WhatsApp lead"*

### 1.3 Product Description
Chat2Deal is a Chrome extension that seamlessly connects WhatsApp Web conversations to Pipedrive CRM. It enables sales teams to capture every lead instantly, right inside WhatsApp Web, without manual data entry.

### 1.4 Brand Personality
**Modern & Approachable**

Chat2Deal is a friendly, contemporary tool that makes sales teams' lives easier. We combine professional capability with approachable design, creating an experience that feels both reliable and refreshing.

**Brand Attributes:**
- **Modern** - Contemporary design and cutting-edge functionality
- **Approachable** - Easy to understand and use, never intimidating
- **Reliable** - Dependable and trustworthy
- **Efficient** - Focused on getting things done quickly
- **Friendly** - Warm and helpful, not cold or corporate

---

## 2. Brand Positioning

### 2.1 Target Audience
**Small to mid-sized sales teams looking for quick wins**

Our users are busy sales professionals who:
- Use WhatsApp Web for customer conversations
- Use Pipedrive for CRM
- Want to reduce manual data entry
- Need to ensure no leads slip through the cracks
- Value simplicity and quick setup

### 2.2 Core Message
**"Never lose a lead - Every WhatsApp conversation becomes a Pipedrive contact"**

We focus on completeness and reliability. Our primary promise is that users can trust Chat2Deal to capture every opportunity.

### 2.3 Desired User Feeling
**Relieved** - "Finally, I don't have to do this manually"

Users should feel a sense of burden lifted. Chat2Deal takes away the tedious task of copying contact information between WhatsApp and Pipedrive, allowing users to focus on what they do best: selling.

### 2.4 Competitive Differentiation
- **Direct integration** - Works right inside WhatsApp Web, no context switching
- **Zero learning curve** - Intuitive interface that feels native to WhatsApp
- **Instant setup** - No complex configuration or IT involvement
- **Focused solution** - Does one thing exceptionally well

---

## 3. Color Palette

### 3.1 Primary Brand Color

**Purple-Gray**
`#665F98`

This is our signature color. Use it for:
- Primary buttons and CTAs
- Brand accents
- Active states
- Icon color
- Links and interactive elements

**Why this color?**
- Professional yet approachable
- Modern and distinctive
- Balances trust (blue undertones) with creativity (purple undertones)
- Stands out in both WhatsApp and Pipedrive interfaces

### 3.2 Interactive States

**Primary Hover**
`#4f4775`
- Darker shade for hover states on buttons and links

**Primary Active**
`#483F70`
- Even darker shade for active/pressed states

**Primary Light**
`#e8e6f0`
- Very light tint for backgrounds and subtle highlights

**Primary Light Hover**
`#b8b3d0`
- Medium tint for hover states on light elements

### 3.3 Accent Colors

**Indigo Accent (Secondary)**
`#4F39F6`
- Used sparingly for special highlights
- Gradient overlays
- Marketing materials

**Indigo Accent Hover**
`#4531E0`

**Indigo Accent Active**
`#3D2BC8`

### 3.4 Neutral Colors

**Text Primary**
`#0a0a0a` (neutral-950)
- Main body text
- Headings

**Text Secondary**
`#525252` (neutral-600)
- Supporting text
- Metadata
- Captions

**Text Tertiary**
`#a3a3a3` (neutral-400)
- Placeholder text
- Disabled states
- Subtle labels

**Gray Secondary**
`#66748d`
- Alternative secondary text color
- Used in specific UI contexts

### 3.5 Background Colors

**Background Primary**
`#ffffff` (white)
- Main content backgrounds
- Cards

**Background Secondary**
`#f5f4f8`
- Subtle tinted background (Extension)

**Background Main**
`#e2e8f0` (slate-200)
- Main app background (Extension)

**Gray Light**
`#e2e8f0`
- Borders and dividers

### 3.6 State Colors

**Success**
- Background: `#d1fae5` (emerald-100)
- Border: `#10b981` (emerald-500)
- Use for: Successful actions, confirmations

**Error**
- Text: `#dc2626` (red-600)
- Background: `#fef2f2` (red-50)
- Border: `#fca5a5` (red-300)
- Use for: Error messages, validation failures

**Warning**
- Background: `#fef3c7` (amber-100)
- Border: `#fbbf24` (amber-400)
- Icon: `#f59e0b` (amber-500)
- Use for: Warnings, important notices

### 3.7 Color Usage Guidelines

**Do:**
- Use primary purple-gray (`#665F98`) for all primary CTAs
- Maintain consistent hover states across all touchpoints
- Use neutral grays for text hierarchy
- Reserve state colors for their intended purposes

**Don't:**
- Mix primary purple with indigo accent in the same UI element
- Use brand colors for text (use neutral grays instead)
- Override state colors (red = error, green = success, amber = warning)

---

## 4. Typography

### 4.1 Primary Font Family

**Inter**

Inter is our primary typeface across all platforms. It's modern, highly legible, and works beautifully at all sizes.

```css
font-family: 'Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont',
             'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif';
```

### 4.2 Display Font (Logo Only)

**Momo Trust Display**

Used exclusively for the "chat2deal" logo on the landing page. Provides a distinctive, friendly character.

```css
font-family: "'Momo Trust Display'", 'Inter', 'system-ui', 'sans-serif';
```

**Usage:**
- Landing page logo/wordmark only
- Never use for body text or UI elements

### 4.3 Type Scale

**Headings:**
- H1: 48-60px (landing hero), semibold (600)
- H2: 32-36px (section headings), semibold (600)
- H3: 24px (subsections), semibold (600)
- H4: 18px (card headings), semibold (600)

**Body:**
- Large: 16px (main content), regular (400)
- Base: 14-15px (UI text), regular (400)
- Small: 13px (supporting text), regular (400)
- Tiny: 12px (metadata, labels), regular (400)

**Interactive:**
- Buttons: 14px, medium (500)
- Links: Inherit size, medium (500)

### 4.4 Line Height

- Headings: 1.2-1.3 (tight)
- Body text: 1.5-1.6 (relaxed)
- UI elements: 1.4 (comfortable)

### 4.5 Font Weights

- **Regular (400)** - Body text, descriptions
- **Medium (500)** - Buttons, links, emphasized text
- **Semibold (600)** - Headings, names, labels
- **Bold (700)** - Rarely used, only for extreme emphasis

---

## 5. Logo & Icon

### 5.1 Wordmark (Logo)

**Text:** "chat2deal"
**Font:** Momo Trust Display (landing page) / Inter (other contexts)
**Color:** `#0a0a0a` (neutral-950) or white on dark backgrounds
**Case:** All lowercase
**Size:** 24px (navigation), 32-48px (hero)

**Usage:**
- Landing page header
- Website dashboard
- Marketing materials

### 5.2 Extension Icon

**File Location:** `Resources/UI/Icon/`

**Color:** `#665F98` (primary purple-gray)

**Design:** Message bubble with arrow, representing the flow from WhatsApp (chat) to Pipedrive (deal)

**Sizes Available:**
- 16x16px (browser toolbar, small displays)
- 32x32px (browser toolbar, standard)
- 48x48px (extension details page)
- 128x128px (Chrome Web Store)
- 180x180px (Apple touch icon)
- 192x192px (Android chrome)
- 512x512px (Chrome Web Store assets)

**Background:** Transparent

**Usage Guidelines:**
- Never alter the icon color
- Maintain minimum clear space (10% of icon size) around icon
- Don't add effects, shadows, or gradients
- Don't rotate or distort

### 5.3 Favicon

**Color:** `#665F98` on white background
**Sizes:** 16x16, 32x32

---

## 6. Voice & Tone

### 6.1 Voice Principles

Our voice is consistent across all touchpoints:

**Clear & Direct**
- Use simple, everyday language
- Avoid jargon and technical terms unless necessary
- Get to the point quickly

**Friendly & Helpful**
- Write like a helpful colleague, not a robot
- Use contractions (don't, can't, you'll)
- Be warm without being overly casual

**Confident & Reassuring**
- Show we understand the user's pain points
- Make promises we can keep
- Use active voice and definitive language

### 6.2 Tone Variations by Context

**Marketing (Landing Page, Website)**
- **Goal:** Convince and convert
- **Tone:** Confident, solution-focused, benefit-driven
- **Example:** "Stop losing WhatsApp leads in the chaos. Chat2Deal captures every lead instantly—right inside WhatsApp Web."

**Product UI (Extension, Dashboard)**
- **Goal:** Guide and inform
- **Tone:** Clear, helpful, reassuring
- **Example:** "We couldn't find this contact in Pipedrive. Would you like to create a new person or attach this number to an existing contact?"

**Error Messages**
- **Goal:** Inform and resolve
- **Tone:** Calm, helpful, solution-oriented
- **Example:** "We couldn't connect to Pipedrive. Please check your internet connection and try again."

**Success Messages**
- **Goal:** Confirm and encourage
- **Tone:** Positive, brief, rewarding
- **Example:** "Contact created successfully!"

### 6.3 Writing Guidelines

**Do:**
- Use second person ("you", "your")
- Write in active voice
- Start with benefits, not features
- Break long text into scannable chunks
- Use parallel structure in lists

**Don't:**
- Use technical jargon unnecessarily
- Write in passive voice
- Over-explain obvious actions
- Use ALL CAPS or excessive exclamation points!!!
- Use humor unless it serves a clear purpose

### 6.4 Example Phrases

**Good:**
- "Find, create, and link Pipedrive contacts directly from WhatsApp Web"
- "Never lose a lead again"
- "Set up in 60 seconds"
- "No complex configuration required"

**Avoid:**
- "Leverage our cutting-edge synergistic solution" (too corporate)
- "Utilize the extension functionality to actualize CRM integration" (too complex)
- "OMG this is SO AMAZING!!!" (too casual)

---

## 7. Messaging Framework

### 7.1 Core Positioning Statement

"Chat2Deal helps small to mid-sized sales teams never lose a WhatsApp lead by automatically syncing conversations to Pipedrive CRM—right inside WhatsApp Web."

### 7.2 Value Propositions

**Primary:**
"Never lose a lead - Every WhatsApp conversation becomes a Pipedrive contact"

**Supporting:**
1. "Works right inside WhatsApp Web - no context switching"
2. "Set up in 60 seconds - no IT required"
3. "Find, create, or link contacts instantly"
4. "Focus on selling, not data entry"

### 7.3 Key Messages by Audience

**For Sales Reps:**
- "Stop copying contact info manually"
- "Every WhatsApp chat is automatically tracked in Pipedrive"
- "Works exactly where you already work"

**For Sales Managers:**
- "Ensure your team captures every lead"
- "No more lost opportunities in WhatsApp"
- "Complete visibility into all customer conversations"

**For Small Business Owners:**
- "Simple setup, instant results"
- "No training required"
- "Affordable solution for growing teams"

### 7.4 Feature Messaging

When describing features, always lead with the benefit:

**Good:**
- "Find existing contacts instantly" (benefit-first)
- "Create new Pipedrive contacts in one click" (benefit-first)

**Avoid:**
- "Real-time API integration with Pipedrive" (feature-first)
- "Auto-complete search functionality" (feature-first)

---

## 8. Visual Style

### 8.1 Design Principles

**Clean & Uncluttered**
- Generous white space
- Clear visual hierarchy
- Minimal ornamentation

**Friendly & Modern**
- Rounded corners (8px standard, 4-12px range)
- Subtle shadows for depth
- Smooth transitions and animations

**Consistent & Predictable**
- Standardized component spacing
- Consistent button styles
- Predictable interaction patterns

### 8.2 UI Component Style

**Buttons:**
- Primary: `#665F98` background, white text, 8px border radius
- Hover: `#4f4775` background with smooth transition
- Height: 38-40px for primary actions
- Padding: 16px horizontal, 8-10px vertical
- Font: 14px medium (500)

**Cards:**
- White background (`#ffffff`)
- Border: 1px solid `#e9edef` (light gray)
- Border radius: 8px
- Shadow: Subtle (`0 1px 2px rgba(0,0,0,0.05)`)
- Padding: 16-20px

**Inputs:**
- Border: 1px solid `#d1d7db`
- Focus: Border `#665F98` with 1px ring
- Border radius: 8px
- Padding: 8-12px
- Placeholder: `#a3a3a3`

**Icons:**
- Size: 16px (inline), 20px (buttons), 24px (headers)
- Style: Outline/line style preferred over solid
- Color: Inherit from context or `#525252`

### 8.3 Spacing System

Use a consistent 4px base unit:

- **4px** - Tight spacing (icon gaps)
- **8px** - Close spacing (inline elements)
- **12px** - Related elements
- **16px** - Section padding
- **20px** - Major section gaps
- **24px** - Large section separation

### 8.4 Photography & Imagery

**Style:**
- Clean, modern, professional
- Real people in realistic sales scenarios
- Bright, well-lit environments
- Avoid overly staged stock photos

**Subject Matter:**
- Sales professionals using technology
- Team collaboration
- WhatsApp and CRM interfaces
- Success and relief emotions

**Treatment:**
- Natural color grading
- High contrast and sharpness
- Minimal filters or effects

### 8.5 Illustrations

**When to Use:**
- Empty states
- Onboarding flows
- Error pages
- Feature explanations

**Style:**
- Simple, geometric shapes
- Limited color palette (brand colors + neutrals)
- Friendly, approachable character
- Avoid overly detailed or realistic illustrations

---

## 9. Application Guidelines

### 9.1 Chrome Extension

**Color Application:**
- Primary actions: `#665F98`
- Sidebar background: `#e2e8f0`
- Cards: White with subtle borders
- Text: Neutral grays for hierarchy

**Typography:**
- Font: Inter
- Headings: 14-17px semibold
- Body: 13-15px regular
- Small text: 12px regular

**Component Style:**
- Follow Extension UI Design Specification (see [UI-Design-Specification.md](Architecture/UI-Design-Specification.md))
- Match WhatsApp Web's visual language
- Maintain consistent spacing and borders

### 9.2 Landing Page

**Hero Section:**
- Large heading (48-60px) with primary purple accent
- Clear value proposition above the fold
- Primary CTA button in brand color
- Hero image/demo showing product in action

**Color Application:**
- Primary buttons: `#665F98`
- Accent elements: `#4F39F6` (indigo)
- Background: White with subtle gray sections
- Text: Black (`#0a0a0a`) and gray (`#525252`)

**Typography:**
- Logo: Momo Trust Display, 32px+
- Headings: Inter, large sizes (32-60px)
- Body: Inter, 16-18px for readability

### 9.3 Website Dashboard

**Layout:**
- Clean, card-based design
- Sidebar navigation with brand color accents
- White content area with gray background
- Consistent with Extension visual language

**Color Application:**
- Primary buttons: `#665F98`
- Active navigation: Brand color
- Cards: White with borders
- Background: `#f5f5f5` or similar light gray

**Typography:**
- Font: Inter throughout
- Same type scale as extension
- Consistent button and link styles

### 9.4 Marketing Materials

**Email:**
- Simple, text-focused emails
- Minimal images
- Clear single CTA in brand color
- Friendly, conversational tone

**Social Media:**
- Brand color in graphics
- Simple, benefit-focused messaging
- Screenshots and product demos
- Authentic, not overly promotional

**Documentation:**
- Clear headings and sections
- Code examples with syntax highlighting
- Screenshots with annotations
- Friendly, helpful tone

---

## 10. Brand Guidelines Summary

### 10.1 Quick Reference

**Primary Color:** `#665F98`
**Hover State:** `#4f4775`
**Font:** Inter
**Logo Font:** Momo Trust Display (landing only)
**Tone:** Modern, approachable, helpful
**Core Message:** Never lose a lead

### 10.2 Dos and Don'ts

**✅ Do:**
- Use primary purple for all CTAs
- Keep messaging simple and benefit-focused
- Maintain consistent spacing and typography
- Focus on the "relieved" emotional benefit
- Write in a friendly, helpful tone

**❌ Don't:**
- Change brand colors or create new tints
- Use technical jargon unnecessarily
- Overcomplicate the UI or messaging
- Use multiple accent colors in the same context
- Deviate from Inter font family

### 10.3 Contact

For brand guideline questions or clarifications, refer to this document or consult the project documentation in the `Docs/` folder.

---

**End of Brand Guide**
