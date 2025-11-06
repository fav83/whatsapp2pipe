# Color Palette System

## Overview

All extension colors are centralized in [`colors.ts`](colors.ts) for easy theme switching and consistent styling across components.

## Available Palettes

**Note:** The default theme is managed by ThemeManager and can be changed at runtime. The static export in colors.ts is deprecated.

## How to Switch Palettes

**Runtime Theme Switching (Recommended)**

The extension uses ThemeManager for dynamic theme switching without rebuild. Themes are persisted in Chrome storage and applied via CSS variables.

To change themes:

1. Use the theme selector in the extension UI (when implemented)
2. Or programmatically via `themeManager.setTheme('themeName')`

Available theme names: `indigo500`, `modernBlue`, `coolCyan`, `oceanTeal`, `forestGreen`, `crimsonRed`, and many more (see `palettes` export in colors.ts)

**Option 2: Create Custom Palette**

Add your own palette object following the same structure:

```ts
const myCustomTheme = {
  brand: {
    primary: '#ff6b6b',
    'primary-hover': '#ff5252',
    // ... etc
  },
  // ... other color categories
}

export const colors = myCustomTheme
```

## Using Colors in Components

### Tailwind Classes (Recommended)

Use semantic color names in Tailwind classes:

```tsx
// ✅ NEW - Semantic names
<button className="bg-brand-primary hover:bg-brand-hover text-white">
  Click me
</button>

<p className="text-text-secondary">
  Secondary text
</p>

<div className="bg-background-secondary border border-border-primary">
  Card content
</div>

// ❌ OLD - Inline hex values
<button className="bg-[#00a884] hover:bg-[#008f6f] text-white">
  Click me
</button>
```

### Available Color Classes

#### Brand Colors

- `bg-brand-primary` / `text-brand-primary` / `border-brand-primary`
- `bg-brand-secondary` - Light variant of primary
- `hover:bg-brand-hover` / `hover:text-brand-hover` - Hover states

#### Text Colors

- `text-text-primary` - Headings, important text
- `text-text-secondary` - Body text, descriptions
- `text-text-tertiary` - Placeholders, muted text
- `text-text-avatar-hover` - Avatar hover states

#### Background Colors

- `bg-white` - White cards, inputs
- `bg-background-secondary` - Light gray backgrounds
- `bg-background-tertiary` - Subtle backgrounds
- `bg-background-main` - Main content area
- `hover:bg-background-hover` - Hover state background

#### Border Colors

- `border-border-primary` - Standard borders
- `border-border-secondary` - Subtle dividers

#### Error State

- `bg-error-background` + `border-error-border` + `text-error-text`
- `hover:text-error-text-hover`

#### Warning State

- `bg-warning-background` + `border-warning-border`
- `text-warning-icon` - Warning icons

#### Success State

- `bg-success-background` + `border-success-border`

#### Special UI

- `text-loading-spinner` - Loading spinners
- Dev mode colors: `bg-dev-background`, `border-dev-border`, etc.

## Migration Guide

### Before (Old Code)

```tsx
<div className="bg-[#00a884] hover:bg-[#008f6f] text-white rounded-lg">
  <h3 className="text-[#111b21] font-medium">Title</h3>
  <p className="text-[#667781]">Description</p>
  <input className="border-[#d1d7db] focus:border-[#00a884]" />
</div>
```

### After (New Code)

```tsx
<div className="bg-brand-primary hover:bg-brand-hover text-white rounded-lg">
  <h3 className="text-text-primary font-medium">Title</h3>
  <p className="text-text-secondary">Description</p>
  <input className="border-border-primary focus:border-brand-primary" />
</div>
```

## Common Patterns

### Primary Button

```tsx
<button className="bg-brand-primary hover:bg-brand-hover text-white px-4 py-2 rounded-lg">
  Primary Action
</button>
```

### Card

```tsx
<div className="bg-white border border-border-secondary rounded-lg shadow-sm p-4">Card content</div>
```

### Input Field

```tsx
<input
  className="
  w-full px-3 py-2 rounded-lg
  bg-white
  border border-border-primary
  text-text-primary
  placeholder:text-text-tertiary
  focus:outline-none
  focus:border-brand-primary
  focus:ring-1
  focus:ring-brand-primary
"
/>
```

### Error Message

```tsx
<div className="bg-error-background border border-error-border rounded-lg p-3">
  <p className="text-error-text">Error message</p>
</div>
```

### Selected State

```tsx
<button
  className={`
  px-4 py-2 rounded-lg
  ${
    isSelected
      ? 'bg-brand-secondary hover:bg-background-hover text-brand-primary'
      : 'bg-white hover:bg-background-secondary text-text-secondary'
  }
`}
>
  Option
</button>
```

## Testing Themes

Themes change instantly via ThemeManager without rebuild:

1. **Switch theme** using the UI selector or programmatically
2. **No rebuild needed** - changes apply immediately
3. **Test key states:**
   - Loading states (spinner color)
   - Authenticated state (primary colors)
   - Error states (error colors)
   - Selected/hover states (interaction colors)
   - Buttons and links (brand colors)

## Best Practices

1. **Always use semantic names**, never inline hex values
2. **Test all states** when changing palettes (hover, focus, error, loading)
3. **Check contrast ratios** for accessibility (especially text on backgrounds)
4. **Keep palettes consistent** - all color categories should have the same keys
5. **Document custom colors** if you add new ones

## Color Accessibility

When creating custom palettes, ensure:

- **Text contrast:** At least 4.5:1 for normal text, 3:1 for large text
- **Interactive elements:** Clear visual distinction for hover/focus states
- **Error states:** Red/orange tones that are distinguishable for colorblind users
- **Brand colors:** Sufficient contrast against white backgrounds

Use tools like [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) to verify accessibility.
