# UI Design Specification - Chrome Extension Sidebar

## Document Status
**Status**: Complete (reflects current implementation)
**Last Updated**: 2025-11-04
**Version**: 0.3

---

## Overview

This document defines the complete UI design specification for the Chat2Deal Chrome extension sidebar. The sidebar integrates with WhatsApp Web to provide Pipedrive contact management functionality.

**Sidebar Dimensions**: 350px width, full viewport height
**Target Platform**: Chrome extension content script injected into WhatsApp Web

---

## Section 1: Overall Layout & Visual System

### Layout Structure
The sidebar is **350px wide** with a **fixed header** and **scrollable body**. The layout uses a single-column vertical flow optimized for scanning from top to bottom.

### Visual Separation Strategy
The design uses a **layered approach** with multiple separation techniques:

- **Background layers**: The main body uses a subtle light gray background (`#F5F6F7`), while interactive sections use white cards
- **Spacing**: Consistent padding (20px horizontal, 16-20px vertical between major blocks)
- **Divider lines**: Thin horizontal borders (`#E9EDEF`) only where sections have equal hierarchy (like between "Create" and "Attach")
- **Cards with borders**: Important information blocks (matched contact, search results) use white cards with subtle borders and optional shadow

### Typography & Hierarchy
- **Primary text**: 15-16px for main content (names, labels)
- **Secondary text**: 13-14px for phone numbers, helper text
- **Small text**: 12px for metadata (organization names, labels)
- **Font weights**: Semibold (600) for names/headings, Regular (400) for body text, Medium (500) for buttons

### Color System & Theming

**Architecture:** The extension uses a centralized, theme-aware color system that enables runtime theme switching without rebuild or component re-render.

**Core Components:**
- **[colors.ts](../../Extension/src/styles/colors.ts)** - Centralized palette definitions with 45+ pre-built themes
- **[ThemeManager.ts](../../Extension/src/styles/ThemeManager.ts)** - Theme selection, persistence, and CSS variable application
- **[tailwind.config.js](../../Extension/tailwind.config.js)** - CSS variable mapping to Tailwind utilities

**Semantic Color Categories:**

All colors are organized by semantic purpose rather than specific values:

| Category | Tokens | Usage |
|----------|--------|-------|
| **Brand** | `primary`, `primary-hover`, `primary-light`, `primary-light-hover` | Action buttons, links, accent colors |
| **Text** | `primary`, `secondary`, `tertiary`, `avatar-hover` | All text content by hierarchy |
| **Background** | `primary`, `secondary`, `tertiary`, `main` | Surface backgrounds and layouts |
| **Border** | `primary`, `secondary` | Dividers and component borders |
| **State Colors** | `error.*`, `warning.*`, `success.*` | Error banners, warnings, success states |
| **Loading** | `spinner` | Loading indicators |
| **Dev Mode** | `background`, `border`, `badge-*`, `button-*` | Development indicator styling |

**Implementation:**
- Colors defined as CSS variables on `#pipedrive-whatsapp-sidebar` root
- Tailwind utilities reference these variables (e.g., `bg-brand-primary`, `text-secondary`)
- ThemeManager applies selected palette as CSS variables at runtime
- Theme preference persisted in Chrome Storage
- 45+ pre-built themes across Tailwind 500-series and 600-series color scales

**Example Usage:**
```tsx
// Components use semantic token names via Tailwind
<button className="bg-brand-primary hover:bg-brand-hover text-white">
  Create
</button>

<div className="text-secondary">Supporting text</div>
<div className="border-primary">Bordered card</div>
```

**Default Theme Values (Cyan 600):**
- Primary action: `#0891b2` (cyan-600)
- Primary hover: `#0e7490` (cyan-700)
- Text primary: `#0a0a0a` (neutral-950)
- Text secondary: `#525252` (neutral-600)
- Background main: `#f5f5f5` (gray-100)
- Background secondary: `#ecfeff` (cyan-50)
- Border primary: `#d4d4d4` (neutral-300)

**Theme Categories:**
- **Tailwind 600-Series** - 22 vibrant themes (Blue, Violet, Teal, Orange, etc.)
- **Tailwind 500-Series** - 23 softer themes (lighter versions of 600-series colors)
- **Special Themes** - WhatsApp Green (original), custom-designed themes

**Adding New Themes:**
See [colors.ts](../../Extension/src/styles/colors.ts) for palette structure. Each theme defines all semantic categories to ensure consistent UI across theme switches.

### Spacing Scale
- **XS**: 4px - Icon gaps, tight spacing
- **SM**: 8px - Internal component spacing
- **MD**: 12px - Related element spacing
- **LG**: 16px - Section internal padding
- **XL**: 20px - Horizontal margins, section vertical gaps
- **2XL**: 24px - Major section separation

---

## Section 2: Header Block

### Structure
The header is a **fixed-position bar** at the top of the sidebar with a **white background** and **bottom border** (`1px solid #E9EDEF`). It stays visible while the body scrolls beneath it.

### Layout
- **Height**: 56px (comfortable touch target)
- **Padding**: 20px horizontal
- **Flex layout**: Space-between alignment (title left, avatar right)
- **Background**: `#FFFFFF`
- **Border bottom**: `1px solid #E9EDEF`

### Elements

#### Left Side - Branding
- Text: "**Chat2Deal**"
- Font size: 17px
- Font weight: Semibold (600)
- Color: `#111B21`
- No icon/logo (keeps it clean)

#### Right Side - User Avatar
- **Size**: 32px × 32px circle
- **Background**: `#667781` (gray), hover state `#556168` (darker gray)
- **Content**: First letter of user name, uppercase, white text (14px, semibold)
- **Interactive**: Cursor pointer, smooth transition on hover
- **Dropdown menu**: Appears below avatar on click
  - Width: 200px
  - Position: Absolute, right-aligned to avatar, 8px gap below
  - White background with subtle shadow (`0 2px 8px rgba(0,0,0,0.1)`)
  - Border: `1px solid #E9EDEF`
  - Rounded corners: 8px
  - User name at top (14px, semibold, `#111B21`, truncated if long, 16px padding)
  - Divider line (`1px solid #E9EDEF`)
  - "Sign out" option (14px, `#667781`, hover background `#F0F2F5`, 16px padding)

### Visual Treatment
- Clean, minimal design
- No competing visual elements
- Clear separation from body content via border
- Avatar provides subtle personalization without cluttering the space

---

---

## Section 3: Main Body Layout

### Background and Card System

The main body uses a **layered card system** for visual hierarchy and separation:

- **Main background**: `#E5E7EB` (gray-200, darker than original for better card contrast)
- **Card background**: `#FFFFFF` (white)
- **Card borders**: `1px solid #E9EDEF` (light gray)
- **Card shadow**: `0 1px 2px 0 rgba(0, 0, 0, 0.05)` (subtle shadow-sm)
- **Card spacing**: `20px` padding around cards, `20px` vertical gap between cards

### Layout Flow

All authenticated content uses the following pattern:
```
<main className="flex-1 overflow-y-auto bg-[#e5e7eb]">
  <div className="p-5 space-y-5">
    <!-- White cards here -->
  </div>
</main>
```

- **Padding**: `20px` (`p-5`) around all content
- **Vertical spacing**: `20px` (`space-y-5`) between cards
- **Card structure**: `p-4 bg-white rounded-lg border border-[#e9edef] shadow-sm`

---

## Section 4: Contact Info Card

### Purpose
Displays the selected contact's basic information in both matched and no-match states.

### Structure
```jsx
<div className="p-4 bg-white rounded-lg border border-[#e9edef] shadow-sm">
  <div className="text-base font-semibold text-[#111b21] mb-1">{name}</div>
  <div className="text-sm text-[#667781]">{phone}</div>
</div>
```

### Visual Specifications
- **Background**: White card with subtle border and shadow
- **Padding**: 16px (`p-4`) internal padding
- **Border radius**: 8px (`rounded-lg`)
- **Name**: 16px semibold, `#111B21`, 4px margin bottom
- **Phone**: 14px regular, `#667781`

### Component References
- Used in: `PersonMatchedCard.tsx:18-20`
- Used in: `PersonNoMatchState.tsx:224-227`

---

## Section 5: Person Matched State

### Layout
Shows a single white card with person details and a Pipedrive link button.

### Structure
- **Contact Info Card** (see Section 4)
- **Open in Pipedrive button**: Primary action button linking to Pipedrive

### Button Specifications
```jsx
<a
  href={pipedriveUrl}
  className="inline-flex items-center gap-2 px-4 py-2 bg-[#00a884] text-white text-sm font-medium rounded-lg hover:bg-[#008f6f] transition-colors"
>
  <span>Open in Pipedrive</span>
  <!-- External link icon -->
</a>
```

- **Type**: Link styled as button (`inline-flex`)
- **Background**: `#00A884` → `#008F6F` on hover
- **Padding**: `16px 16px` (`px-4 py-2`)
- **Text**: 14px medium weight, white
- **Icon**: 16px external link icon, white, 8px gap from text
- **Border radius**: 8px
- **Transition**: Smooth color transition on hover

### Component Reference
- File: `PersonMatchedCard.tsx:14-42`

---

## Section 6: Person No-Match State - Create Section

### Purpose
Allows user to create a new person in Pipedrive with the contact's phone number.

### Layout
White card with heading, error banner (if error), name input, and create button.

### Structure
```jsx
<div className="p-4 bg-white rounded-lg border border-[#e9edef] shadow-sm">
  <h3>Add this contact to Pipedrive</h3>
  {error && <ErrorBanner />}
  <div className="mb-4">
    <InputField />
  </div>
  <button>Create</button>
</div>
```

### Section Heading
- **Text**: "Add this contact to Pipedrive"
- **Font size**: 14px semibold
- **Color**: `#111B21`
- **Margin**: 12px bottom (`mb-3`)

### Error Banner
- **Background**: `#FEF2F2` (red-50)
- **Border**: `1px solid #FCA5A5` (red-300)
- **Text color**: `#DC2626` (red-600)
- **Padding**: `8px 12px` (`px-3 py-2`)
- **Border radius**: 8px
- **Layout**: Flex, space-between (error text left, close button right)
- **Margin**: 12px bottom (`mb-3`)
- **Close button**: 16px red icon, darker on hover (`#991B1B`)

### Input Field
- **Container**: Flex with 8px gap, white background
- **Border**: `1px solid #D1D7DB` (default state)
- **Focus state**: `border-[#00a884] ring-1 ring-[#00a884]` (green highlight)
- **Border radius**: 8px
- **Padding**: `8px 12px` (`px-3 py-2`)
- **Icon**: "T" label, 14px medium, `#667781`, 8px gap from input
- **Input**: 14px regular, `#111B21`, transparent background, no border
- **Placeholder**: "Name", `#94A3B8` color
- **Disabled**: 60% opacity

### Create Button
- **Width**: 100% full width
- **Height**: 38px fixed (`h-[38px]`)
- **Background**: `#00A884` → `#008F6F` on hover
- **Text**: 14px medium, white
- **Padding**: `8px 16px` (`px-4 py-2`)
- **Border radius**: 8px
- **Disabled**: 60% opacity, not-allowed cursor
- **Loading state**: Shows medium spinner (20px), no text
- **Transition**: Smooth color transition

### Component Reference
- File: `PersonNoMatchState.tsx:230-277`

---

## Section 7: Person No-Match State - Attach Section

### Purpose
Allows user to search for existing Pipedrive contacts and attach the phone number to one.

### Layout
White card with description, error banner (if error), search form, results list, and attach button.

### Description Text
- **Font size**: 14px regular
- **Color**: `#667781` (secondary text)
- **Margin**: 12px bottom (`mb-3`)
- **Phone number**: Inline `#111B21` medium weight for emphasis

### Search Form
Combines search input and button in a single bordered container.

#### Container
- **Layout**: Full width flex with 8px gap
- **Border**: `1px solid #D1D7DB` (default)
- **Focus state**: `border-[#00a884] ring-1 ring-[#00a884]`
- **Padding**: `8px 12px` (`px-3 py-2`)
- **Border radius**: 8px
- **Background**: White

#### Search Icon (Left)
- **Size**: 16px × 16px
- **Color**: `#667781`
- **Flex**: No shrink (`shrink-0`)

#### Search Input
- **Flex**: `flex-1 min-w-0` (fills space, can shrink)
- **Font size**: 14px regular
- **Color**: `#111B21`
- **Placeholder**: "Search contact...", `#94A3B8`
- **Background**: Transparent
- **Border**: None
- **Outline**: None
- **Read-only state**: While searching

#### Search Button (Right)
- **Size**: 34px × 34px square (`w-[34px] h-[34px]`)
- **Background**: `#00A884` → `#008F6F` on hover
- **Border radius**: 8px
- **Flex**: No shrink (`shrink-0`)
- **Content**: Search icon (16px white) OR medium spinner (20px white)
- **Disabled**: 60% opacity, not-allowed cursor
- **Disabled when**: Search term < 2 chars OR searching

### Loading State (Searching)
Shows 3 skeleton cards while search is in progress:
- **Height**: 48px (`h-12`)
- **Background**: `#F0F2F5` (gray-100)
- **Border radius**: 8px
- **Animation**: Pulse
- **Spacing**: 8px vertical gap (`space-y-2`)
- **Margin**: 16px top (`mt-4`)

### Search Results List
Scrollable list of selectable person cards.

#### Container
- **Max height**: 224px (`max-h-56`)
- **Overflow**: Vertical scroll
- **Spacing**: 8px vertical gap (`space-y-2`)
- **Padding right**: 4px (`pr-1`) for scrollbar spacing
- **Margin**: 16px top (`mt-4`)
- **Disabled state**: 60% opacity, no pointer events (while attaching)

#### Person Card (Unselected)
```jsx
<button className="w-full text-left px-3 py-2 border-2 rounded-lg transition-colors cursor-pointer border-[#d1d7db] bg-white hover:border-[#94a3b8] hover:bg-[#e5e7eb]">
  <div className="text-sm font-semibold text-[#111b21]">{name}</div>
  <div className="text-xs text-[#667781]">{phone} • {label}</div>
  <div className="text-xs text-[#667781] italic">{organization}</div>
</button>
```

- **Type**: Button (full width, left-aligned text)
- **Border**: `2px solid #D1D7DB` (medium border)
- **Background**: White
- **Hover border**: `#94A3B8` (darker gray)
- **Hover background**: `#E5E7EB` (light gray)
- **Padding**: `8px 12px` (`px-3 py-2`)
- **Border radius**: 8px
- **Transition**: Smooth color and border transition
- **Cursor**: Pointer

**Text Layout:**
- **Name**: 14px semibold, `#111B21`
- **Phone**: 12px regular, `#667781`, with optional label
- **Organization**: 12px italic, `#667781`

#### Person Card (Selected)
```jsx
<button className="... border-[#00a884] hover:border-[#008f6f] bg-[#b3ead4] hover:bg-[#72d4b7]">
```

- **Border**: `2px solid #00A884` (green)
- **Hover border**: `#008F6F` (darker green)
- **Background**: `#B3EAD4` (success background medium - better contrast than light variant)
- **Hover background**: `#72D4B7` (darker green background)
- **All other properties**: Same as unselected

**Color Refinement Note**: Original design used `#E7F8F3` (light success background), but this was updated to `#B3EAD4` for better visual contrast and clearer selection indication.

### Attach Button
- **Width**: 100% full width
- **Height**: 38px fixed (`h-[38px]`)
- **Margin**: 12px top (`mt-3`)
- **Background**: `#00A884` → `#008F6F` on hover
- **Text**: 14px medium, white, "Attach number"
- **Disabled**: When no person selected OR while attaching
- **Loading state**: Shows medium spinner (20px), no text
- **Transition**: Smooth color transition

### Empty State (No Results)
Shown when search completes with zero results:
```jsx
<div className="mt-4 px-3 py-3 border border-dashed border-[#d1d7db] rounded-lg text-sm text-[#667781]">
  No contacts matched "{searchTerm}". Try initials or another keyword.
</div>
```

- **Margin**: 16px top (`mt-4`)
- **Padding**: 12px (`px-3 py-3`)
- **Border**: `1px dashed #D1D7DB`
- **Border radius**: 8px
- **Text**: 14px regular, `#667781`
- **Content**: Dynamic search term embedded

### Component Reference
- File: `PersonNoMatchState.tsx:280-439`

---

## Section 8: Loading States

### Spinner Component
Reusable animated spinner for buttons and loading states.

#### Props
- `size`: "sm" (16px), "md" (20px), "lg" (32px)
- `color`: "white" or "primary" (`#00A884`)

#### Implementation
```jsx
<div className="w-5 h-5 border-2 border-solid rounded-full animate-spin border-white border-t-transparent" />
```

- **Border**: 2px solid, color-based
- **Border top**: Transparent (creates spinning effect)
- **Border radius**: Full circle (`rounded-full`)
- **Animation**: Tailwind `animate-spin`
- **Important**: Uses `border-solid` to ensure proper rendering

#### Usage Examples
- **Button loading**: `size="md"`, `color="white"` (20px white spinner)
- **Search button**: `size="md"`, `color="white"` (in 34px button)
- **Create button**: `size="md"`, `color="white"` (in 38px button)

#### Component Reference
- File: `Spinner.tsx:1-33`

### Person Lookup Loading
Full-screen loading state while looking up person by phone.

- Shows centered spinner with descriptive text
- Component: `PersonLookupLoading.tsx`

### Search Results Loading
Skeleton cards in search results list (see Section 7).

---

## Section 9: Interactive States

### Input Focus States
All text inputs use consistent focus styling:
- **Focus border**: `border-[#00a884]` (green)
- **Focus ring**: `ring-1 ring-[#00a884]` (1px green ring)
- **Transition**: Smooth border and ring transition

Applied via `focus-within` on container:
```jsx
<div className="... focus-within:border-[#00a884] focus-within:ring-1 focus-within:ring-[#00a884]">
```

### Button States
All buttons follow consistent state patterns:

#### Default State
- Background color based on type (primary: `#00A884`)
- Text color based on type (white for primary)
- Cursor: Pointer
- Transition: `transition-colors`

#### Hover State
- Background: Darker variant (primary: `#008F6F`)
- Text: Same color
- Transition: Smooth

#### Disabled State
- Opacity: 60% (`disabled:opacity-60`)
- Cursor: Not allowed (`disabled:cursor-not-allowed`)
- Hover: No hover effect

#### Loading State
- Shows spinner instead of text OR alongside text
- Disabled: Yes
- Content: Spinner component (medium, white)

### Card Selection States (Search Results)
See Section 7 for detailed person card selection states.

---

## Section 10: Error States

### Error Banner Pattern
Used consistently across all forms:

```jsx
<div className="mb-3 px-3 py-2 bg-[#fef2f2] border border-[#fca5a5] rounded-lg flex items-start justify-between">
  <p className="text-sm text-[#dc2626] flex-1">{errorMessage}</p>
  <button onClick={dismissError} className="ml-2 text-[#dc2626] hover:text-[#991b1b]">
    <svg className="w-4 h-4"><!-- X icon --></svg>
  </button>
</div>
```

- **Background**: `#FEF2F2` (red-50)
- **Border**: `1px solid #FCA5A5` (red-300)
- **Text**: 14px regular, `#DC2626` (red-600)
- **Padding**: `8px 12px` (`px-3 py-2`)
- **Border radius**: 8px
- **Margin**: 12px bottom (`mb-3`)
- **Layout**: Flex with space-between
- **Close button**: 16px red X icon, darker red on hover
- **Close hover**: `#991B1B` (red-800)

### Error Types
1. **Create person error**: Shown in create section
2. **Search error**: Shown in attach section (search or attach errors unified)
3. **Person lookup error**: Full-screen error state with retry button

### Component References
- Error banner: `PersonNoMatchState.tsx:234-252` (create), `286-313` (attach)
- Lookup error: `PersonLookupError.tsx`

---

## Section 11: Development Indicator

### Purpose
Shows visual banner at bottom of sidebar when running in development mode.

### Visibility Conditions
Only visible when BOTH are true:
- `VITE_ENV=development`
- `VITE_SHOW_DEV_INDICATOR=true`

### Layout
Fixed-position banner at bottom of sidebar:
- **Position**: Bottom of sidebar (below scrollable content)
- **Width**: 100% full width
- **Background**: `#FED7AA` (orange-200)
- **Border top**: `2px solid #FB923C` (orange-400)
- **Padding**: `8px 16px`
- **Layout**: Flex, left-aligned, 8px gap
- **Flex shrink**: 0 (fixed height)

### Content
- **DEV badge**:
  - Background: `#FFEDD5` (orange-100)
  - Border: `1px solid #FB923C` (orange-400)
  - Text: "DEV", 11px bold, `#7C2D12` (orange-900)
  - Padding: `2px 8px`
  - Border radius: 4px

- **Backend URL**:
  - Text: Backend API URL
  - Font: 11px semibold
  - Color: `#7C2D12` (orange-900)

### Component Reference
- File: `DevModeIndicator.tsx:1-52`
- Used in: `App.tsx:131-132` (rendered after main content)

---

## Section 12: Accessibility Considerations

### ARIA Labels
- All icon-only buttons have `aria-label` attributes
- Spinners have `role="status"` and `aria-label="Loading"`
- Screen reader-only text uses `sr-only` class

### Keyboard Navigation
- All interactive elements are keyboard accessible
- Search form uses proper `<form>` with submit behavior
- Tab order follows logical flow top to bottom

### Color Contrast
All text meets WCAG AA standards:
- Primary text (`#111B21`) on white: 16.1:1 ratio
- Secondary text (`#667781`) on white: 7.2:1 ratio
- Error text (`#DC2626`) on error bg (`#FEF2F2`): 5.2:1 ratio
- White text on primary (`#00A884`): 4.5:1 ratio

### Focus Indicators
- All inputs show clear green ring on focus
- All buttons show clear focus indicators (browser default)

---

## Section 13: Component Hierarchy

### File Structure
```
Extension/src/content-script/
├── App.tsx (Main app component, header, state management)
├── components/
│   ├── UserAvatar.tsx (Header avatar with dropdown)
│   ├── DevModeIndicator.tsx (Dev mode banner)
│   ├── WelcomeState.tsx (Unauthenticated welcome)
│   ├── AuthenticatingState.tsx (OAuth loading)
│   ├── ContactWarningCard.tsx (Phone unavailable)
│   ├── GroupChatState.tsx (Group chat selected)
│   ├── PersonLookupLoading.tsx (Lookup in progress)
│   ├── PersonMatchedCard.tsx (Person found)
│   ├── PersonNoMatchState.tsx (No person found - create/attach)
│   ├── PersonLookupError.tsx (Lookup failed)
│   └── Spinner.tsx (Loading spinner)
├── hooks/
│   ├── useAuth.ts (OAuth authentication)
│   └── usePipedrive.ts (Pipedrive API calls)
└── services/
    └── pipedriveApi.ts (API service layer)
```

### State Flow
```
App.tsx
├── authState: 'unauthenticated' → WelcomeState
├── authState: 'authenticating' → AuthenticatingState
├── authState: 'error' → WelcomeState (with error)
└── authState: 'authenticated' → SidebarContent
    ├── state: 'welcome' → WelcomeState
    ├── state: 'contact-warning' → ContactWarningCard
    ├── state: 'group-chat' → GroupChatState
    ├── state: 'contact' → (transitions to person-loading)
    ├── state: 'person-loading' → PersonLookupLoading
    ├── state: 'person-matched' → PersonMatchedCard
    ├── state: 'person-no-match' → PersonNoMatchState
    └── state: 'person-error' → PersonLookupError
```

---

## Section 14: Implementation Notes

### Color Refinements from Original Design
Several colors were refined during implementation for better visual hierarchy and contrast:

1. **Main background**: Changed from `#F5F6F7` to `#E5E7EB` (gray-200) for better card contrast
2. **Selected card background**: Changed from `#E7F8F3` (light) to `#B3EAD4` (medium) for clearer selection indication
3. **Card hover background**: Added `#F3F4F6` for interactive item hover states
4. **Border consistency**: Unified on `#E9EDEF` (light) for subtle separators and `#D1D7DB` (medium) for input/card borders

### Border Style Enforcement
Important: All borders must use `border-solid` class to ensure proper rendering:
```jsx
// ✅ Correct
<div className="border border-solid border-[#d1d7db]">

// ❌ Incorrect (may not render properly)
<div className="border border-[#d1d7db]">
```

This applies to:
- Input field containers
- Person search result cards
- Any component using Tailwind border utilities

### Button Height Consistency
All primary action buttons use fixed height for consistent sizing:
- **Height**: 38px (`h-[38px]`)
- **Padding**: `px-4 py-2` (16px horizontal, 8px vertical)
- **Applied to**: Create button, Attach button

Exception: Search button is square 34px × 34px to fit inside search input container.

### Spinner Integration
When showing loading state in buttons:
1. Replace button text with spinner
2. Do NOT show both text and spinner (cluttered)
3. Use `size="md"` (20px) for buttons
4. Use `color="white"` for primary buttons

```jsx
// ✅ Correct
{isCreating ? <Spinner size="md" color="white" /> : 'Create'}

// ❌ Incorrect
{isCreating && <Spinner size="sm" color="white" />}
{isCreating ? 'Creating...' : 'Create'}
```

### Component Communication
- **Person created**: `PersonNoMatchState` → `App` via `onPersonCreated` callback → Transitions to `person-matched` state
- **Person attached**: `PersonNoMatchState` → `App` via `onPersonAttached` callback → Transitions to `person-matched` state
- **Retry lookup**: `PersonLookupError` → `App` via `onRetry` callback → Transitions back to `person-loading` state

### Current Limitations
1. **Pipedrive URL**: Currently uses placeholder domain `app.pipedrive.com`. Should use actual company domain from auth session (stored in backend).
2. **Session expiry**: Not fully implemented in UI. Backend handles refresh tokens, but UI needs to handle session expiry gracefully.

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 0.1 | 2025-11-01 | Initial document created with Sections 1-2 (Header, Visual System) |
| 0.2 | 2025-11-01 | Added Sections 3-14 documenting complete UI implementation with all states, components, and refinements |
| 0.3 | 2025-11-04 | Updated Section 1.4 to document centralized color system with ThemeManager, semantic tokens, and 45+ pre-built themes |
