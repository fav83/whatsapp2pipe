# UI Design Specification - Chrome Extension Sidebar

## Document Status
**Status**: In Progress
**Last Updated**: 2025-11-01
**Version**: 0.1

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

### Color Palette
Following WhatsApp Web's aesthetic with refinements:

| Purpose | Color | Usage |
|---------|-------|-------|
| Primary action | `#00A884` | Buttons, selected states |
| Primary action hover | `#008F6F` | Button hover states |
| Text primary | `#111B21` | Main text, headings |
| Text secondary | `#667781` | Supporting text, labels |
| Border light | `#E9EDEF` | Subtle dividers |
| Border medium | `#D1D7DB` | Input borders, card borders |
| Background main | `#F5F6F7` | Body background |
| Background card | `#FFFFFF` | Cards, inputs |
| Success background | `#E7F8F3` | Success states, selected items |
| Error background | `#FEF2F2` | Error banners |
| Error border | `#FCA5A5` | Error banner borders |
| Error text | `#DC2626` | Error messages |

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

## Section 3: [To Be Continued]

*Additional sections to be added:*
- Contact Info Block (Matched Person State)
- Add Contact to Pipedrive Section
- Attach to Existing Contact Section
- Loading States
- Error States
- Empty States
