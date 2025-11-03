/**
 * Centralized Color Palette for Extension
 *
 * This file defines all colors used throughout the extension.
 * To change the theme, simply update the values in the active palette.
 *
 * Color palettes available:
 * - whatsappGreen: Original WhatsApp-inspired green theme
 * - modernBlue: Alternative blue theme
 * - professionalPurple: Alternative purple theme
 */

// ============================================================================
// PALETTE DEFINITIONS
// ============================================================================

/**
 * WhatsApp-inspired Green Theme (Original)
 */
const whatsappGreen = {
  // Brand Colors
  brand: {
    primary: '#00a884',
    'primary-hover': '#008f6f',
    'primary-light': '#b3ead4',
    'primary-light-hover': '#72d4b7',
  },

  // Text Colors
  text: {
    primary: '#111b21',
    secondary: '#667781',
    tertiary: '#94a3b8',
    'avatar-hover': '#556168',
  },

  // Background Colors
  background: {
    primary: '#ffffff',
    secondary: '#f0f2f5',
    tertiary: '#f5f6f7',
    main: '#e5e7eb',
  },

  // Border Colors
  border: {
    primary: '#d1d7db',
    secondary: '#e9edef',
  },

  // State Colors
  error: {
    text: '#dc2626',
    'text-hover': '#991b1b',
    background: '#fef2f2',
    border: '#fca5a5',
  },

  warning: {
    background: '#fff4e5',
    border: '#ffcc00',
    icon: '#e9730c',
  },

  success: {
    background: '#e8f5e9',
    border: '#4caf50',
  },

  // Special UI
  loading: {
    spinner: '#00a884', // Uses brand primary color
  },

  // Dev Mode Colors
  dev: {
    background: '#fed7aa',
    border: '#fb923c',
    'badge-background': '#ffedd5',
    'badge-text': '#7c2d12',
    'button-background': '#ea580c',
    'button-border': '#c2410c',
  },
}

/**
 * Modern Blue Theme
 */
const modernBlue = {
  // Brand Colors
  brand: {
    primary: '#2563eb', // blue-600
    'primary-hover': '#1d4ed8', // blue-700
    'primary-light': '#dbeafe', // blue-100
    'primary-light-hover': '#93c5fd', // blue-300
  },

  // Text Colors
  text: {
    primary: '#0f172a', // slate-900
    secondary: '#64748b', // slate-500
    tertiary: '#94a3b8', // slate-400
    'avatar-hover': '#475569', // slate-600
  },

  // Background Colors
  background: {
    primary: '#ffffff',
    secondary: '#f8fafc', // slate-50
    tertiary: '#f1f5f9', // slate-100
    main: '#e2e8f0', // slate-200
  },

  // Border Colors
  border: {
    primary: '#cbd5e1', // slate-300
    secondary: '#e2e8f0', // slate-200
  },

  // State Colors
  error: {
    text: '#dc2626', // red-600
    'text-hover': '#991b1b', // red-800
    background: '#fef2f2', // red-50
    border: '#fca5a5', // red-300
  },

  warning: {
    background: '#fef3c7', // amber-100
    border: '#fbbf24', // amber-400
    icon: '#f59e0b', // amber-500
  },

  success: {
    background: '#d1fae5', // emerald-100
    border: '#10b981', // emerald-500
  },

  // Special UI
  loading: {
    spinner: '#2563eb', // blue-600
  },

  // Dev Mode Colors
  dev: {
    background: '#fed7aa', // orange-200
    border: '#fb923c', // orange-400
    'badge-background': '#ffedd5', // orange-100
    'badge-text': '#7c2d12', // orange-900
    'button-background': '#ea580c', // orange-600
    'button-border': '#c2410c', // orange-700
  },
}

/**
 * Professional Purple Theme
 */
const professionalPurple = {
  // Brand Colors
  brand: {
    primary: '#7c3aed', // violet-600
    'primary-hover': '#6d28d9', // violet-700
    'primary-light': '#ede9fe', // violet-100
    'primary-light-hover': '#c4b5fd', // violet-300
  },

  // Text Colors
  text: {
    primary: '#1e1b4b', // indigo-950
    secondary: '#6b7280', // gray-500
    tertiary: '#9ca3af', // gray-400
    'avatar-hover': '#4b5563', // gray-600
  },

  // Background Colors
  background: {
    primary: '#ffffff',
    secondary: '#faf5ff', // purple-50
    tertiary: '#f5f3ff', // violet-50
    main: '#e7e5e4', // stone-200
  },

  // Border Colors
  border: {
    primary: '#d4d4d8', // zinc-300
    secondary: '#e4e4e7', // zinc-200
  },

  // State Colors
  error: {
    text: '#dc2626', // red-600
    'text-hover': '#991b1b', // red-800
    background: '#fef2f2', // red-50
    border: '#fca5a5', // red-300
  },

  warning: {
    background: '#fef3c7', // amber-100
    border: '#fbbf24', // amber-400
    icon: '#f59e0b', // amber-500
  },

  success: {
    background: '#dcfce7', // green-100
    border: '#22c55e', // green-500
  },

  // Special UI
  loading: {
    spinner: '#7c3aed', // violet-600
  },

  // Dev Mode Colors
  dev: {
    background: '#fed7aa', // orange-200
    border: '#fb923c', // orange-400
    'badge-background': '#ffedd5', // orange-100
    'badge-text': '#7c2d12', // orange-900
    'button-background': '#ea580c', // orange-600
    'button-border': '#c2410c', // orange-700
  },
}

/**
 * Ocean Teal Theme
 */
const oceanTeal = {
  // Brand Colors
  brand: {
    primary: '#0d9488', // teal-600
    'primary-hover': '#0f766e', // teal-700
    'primary-light': '#ccfbf1', // teal-100
    'primary-light-hover': '#5eead4', // teal-300
  },

  // Text Colors
  text: {
    primary: '#0f172a', // slate-900
    secondary: '#475569', // slate-600
    tertiary: '#94a3b8', // slate-400
    'avatar-hover': '#334155', // slate-700
  },

  // Background Colors
  background: {
    primary: '#ffffff',
    secondary: '#f0fdfa', // teal-50
    tertiary: '#f1f5f9', // slate-100
    main: '#e2e8f0', // slate-200
  },

  // Border Colors
  border: {
    primary: '#cbd5e1', // slate-300
    secondary: '#e2e8f0', // slate-200
  },

  // State Colors
  error: {
    text: '#dc2626', // red-600
    'text-hover': '#991b1b', // red-800
    background: '#fef2f2', // red-50
    border: '#fca5a5', // red-300
  },

  warning: {
    background: '#fef3c7', // amber-100
    border: '#fbbf24', // amber-400
    icon: '#f59e0b', // amber-500
  },

  success: {
    background: '#d1fae5', // emerald-100
    border: '#10b981', // emerald-500
  },

  // Special UI
  loading: {
    spinner: '#0d9488', // teal-600
  },

  // Dev Mode Colors
  dev: {
    background: '#fed7aa', // orange-200
    border: '#fb923c', // orange-400
    'badge-background': '#ffedd5', // orange-100
    'badge-text': '#7c2d12', // orange-900
    'button-background': '#ea580c', // orange-600
    'button-border': '#c2410c', // orange-700
  },
}

/**
 * Sunset Orange Theme
 */
const sunsetOrange = {
  // Brand Colors
  brand: {
    primary: '#ea580c', // orange-600
    'primary-hover': '#c2410c', // orange-700
    'primary-light': '#ffedd5', // orange-100
    'primary-light-hover': '#fdba74', // orange-300
  },

  // Text Colors
  text: {
    primary: '#1c1917', // stone-900
    secondary: '#57534e', // stone-600
    tertiary: '#a8a29e', // stone-400
    'avatar-hover': '#44403c', // stone-700
  },

  // Background Colors
  background: {
    primary: '#ffffff',
    secondary: '#fff7ed', // orange-50
    tertiary: '#fafaf9', // stone-50
    main: '#e7e5e4', // stone-200
  },

  // Border Colors
  border: {
    primary: '#d6d3d1', // stone-300
    secondary: '#e7e5e4', // stone-200
  },

  // State Colors
  error: {
    text: '#dc2626', // red-600
    'text-hover': '#991b1b', // red-800
    background: '#fef2f2', // red-50
    border: '#fca5a5', // red-300
  },

  warning: {
    background: '#fef3c7', // amber-100
    border: '#fbbf24', // amber-400
    icon: '#f59e0b', // amber-500
  },

  success: {
    background: '#d1fae5', // emerald-100
    border: '#10b981', // emerald-500
  },

  // Special UI
  loading: {
    spinner: '#ea580c', // orange-600
  },

  // Dev Mode Colors
  dev: {
    background: '#fed7aa', // orange-200
    border: '#fb923c', // orange-400
    'badge-background': '#ffedd5', // orange-100
    'badge-text': '#7c2d12', // orange-900
    'button-background': '#ea580c', // orange-600
    'button-border': '#c2410c', // orange-700
  },
}

/**
 * Deep Indigo Theme
 */
const deepIndigo = {
  // Brand Colors
  brand: {
    primary: '#4f46e5', // indigo-600
    'primary-hover': '#4338ca', // indigo-700
    'primary-light': '#e0e7ff', // indigo-100
    'primary-light-hover': '#a5b4fc', // indigo-300
  },

  // Text Colors
  text: {
    primary: '#1e1b4b', // indigo-950
    secondary: '#6366f1', // indigo-500
    tertiary: '#a5b4fc', // indigo-300
    'avatar-hover': '#4338ca', // indigo-700
  },

  // Background Colors
  background: {
    primary: '#ffffff',
    secondary: '#eef2ff', // indigo-50
    tertiary: '#f8fafc', // slate-50
    main: '#e2e8f0', // slate-200
  },

  // Border Colors
  border: {
    primary: '#cbd5e1', // slate-300
    secondary: '#e2e8f0', // slate-200
  },

  // State Colors
  error: {
    text: '#dc2626', // red-600
    'text-hover': '#991b1b', // red-800
    background: '#fef2f2', // red-50
    border: '#fca5a5', // red-300
  },

  warning: {
    background: '#fef3c7', // amber-100
    border: '#fbbf24', // amber-400
    icon: '#f59e0b', // amber-500
  },

  success: {
    background: '#d1fae5', // emerald-100
    border: '#10b981', // emerald-500
  },

  // Special UI
  loading: {
    spinner: '#4f46e5', // indigo-600
  },

  // Dev Mode Colors
  dev: {
    background: '#fed7aa', // orange-200
    border: '#fb923c', // orange-400
    'badge-background': '#ffedd5', // orange-100
    'badge-text': '#7c2d12', // orange-900
    'button-background': '#ea580c', // orange-600
    'button-border': '#c2410c', // orange-700
  },
}

/**
 * Forest Green Theme
 */
const forestGreen = {
  // Brand Colors
  brand: {
    primary: '#16a34a', // green-600
    'primary-hover': '#15803d', // green-700
    'primary-light': '#dcfce7', // green-100
    'primary-light-hover': '#86efac', // green-300
  },

  // Text Colors
  text: {
    primary: '#14532d', // green-950
    secondary: '#166534', // green-800
    tertiary: '#86efac', // green-300
    'avatar-hover': '#15803d', // green-700
  },

  // Background Colors
  background: {
    primary: '#ffffff',
    secondary: '#f0fdf4', // green-50
    tertiary: '#f7fee7', // lime-50
    main: '#e5e7eb', // gray-200
  },

  // Border Colors
  border: {
    primary: '#d1d5db', // gray-300
    secondary: '#e5e7eb', // gray-200
  },

  // State Colors
  error: {
    text: '#dc2626', // red-600
    'text-hover': '#991b1b', // red-800
    background: '#fef2f2', // red-50
    border: '#fca5a5', // red-300
  },

  warning: {
    background: '#fef3c7', // amber-100
    border: '#fbbf24', // amber-400
    icon: '#f59e0b', // amber-500
  },

  success: {
    background: '#dcfce7', // green-100
    border: '#22c55e', // green-500
  },

  // Special UI
  loading: {
    spinner: '#16a34a', // green-600
  },

  // Dev Mode Colors
  dev: {
    background: '#fed7aa', // orange-200
    border: '#fb923c', // orange-400
    'badge-background': '#ffedd5', // orange-100
    'badge-text': '#7c2d12', // orange-900
    'button-background': '#ea580c', // orange-600
    'button-border': '#c2410c', // orange-700
  },
}

/**
 * Rose Pink Theme
 */
const rosePink = {
  // Brand Colors
  brand: {
    primary: '#e11d48', // rose-600
    'primary-hover': '#be123c', // rose-700
    'primary-light': '#ffe4e6', // rose-100
    'primary-light-hover': '#fda4af', // rose-300
  },

  // Text Colors
  text: {
    primary: '#4c0519', // rose-950
    secondary: '#9f1239', // rose-800
    tertiary: '#fda4af', // rose-300
    'avatar-hover': '#be123c', // rose-700
  },

  // Background Colors
  background: {
    primary: '#ffffff',
    secondary: '#fff1f2', // rose-50
    tertiary: '#fdf2f8', // pink-50
    main: '#f5f5f4', // stone-100
  },

  // Border Colors
  border: {
    primary: '#d6d3d1', // stone-300
    secondary: '#e7e5e4', // stone-200
  },

  // State Colors
  error: {
    text: '#dc2626', // red-600
    'text-hover': '#991b1b', // red-800
    background: '#fef2f2', // red-50
    border: '#fca5a5', // red-300
  },

  warning: {
    background: '#fef3c7', // amber-100
    border: '#fbbf24', // amber-400
    icon: '#f59e0b', // amber-500
  },

  success: {
    background: '#d1fae5', // emerald-100
    border: '#10b981', // emerald-500
  },

  // Special UI
  loading: {
    spinner: '#e11d48', // rose-600
  },

  // Dev Mode Colors
  dev: {
    background: '#fed7aa', // orange-200
    border: '#fb923c', // orange-400
    'badge-background': '#ffedd5', // orange-100
    'badge-text': '#7c2d12', // orange-900
    'button-background': '#ea580c', // orange-600
    'button-border': '#c2410c', // orange-700
  },
}

/**
 * Crimson Red Theme
 */
const crimsonRed = {
  // Brand Colors
  brand: {
    primary: '#dc2626', // red-600
    'primary-hover': '#b91c1c', // red-700
    'primary-light': '#fee2e2', // red-100
    'primary-light-hover': '#fca5a5', // red-300
  },

  // Text Colors
  text: {
    primary: '#450a0a', // red-950
    secondary: '#991b1b', // red-800
    tertiary: '#fca5a5', // red-300
    'avatar-hover': '#b91c1c', // red-700
  },

  // Background Colors
  background: {
    primary: '#ffffff',
    secondary: '#fef2f2', // red-50
    tertiary: '#fef5f5', // custom light red
    main: '#f5f5f5', // gray-100
  },

  // Border Colors
  border: {
    primary: '#d4d4d4', // neutral-300
    secondary: '#e5e5e5', // neutral-200
  },

  // State Colors
  error: {
    text: '#dc2626', // red-600
    'text-hover': '#991b1b', // red-800
    background: '#fef2f2', // red-50
    border: '#fca5a5', // red-300
  },

  warning: {
    background: '#fef3c7', // amber-100
    border: '#fbbf24', // amber-400
    icon: '#f59e0b', // amber-500
  },

  success: {
    background: '#d1fae5', // emerald-100
    border: '#10b981', // emerald-500
  },

  // Special UI
  loading: {
    spinner: '#dc2626', // red-600
  },

  // Dev Mode Colors
  dev: {
    background: '#fed7aa', // orange-200
    border: '#fb923c', // orange-400
    'badge-background': '#ffedd5', // orange-100
    'badge-text': '#7c2d12', // orange-900
    'button-background': '#ea580c', // orange-600
    'button-border': '#c2410c', // orange-700
  },
}

/**
 * Golden Amber Theme
 */
const goldenAmber = {
  // Brand Colors
  brand: {
    primary: '#d97706', // amber-600
    'primary-hover': '#b45309', // amber-700
    'primary-light': '#fef3c7', // amber-100
    'primary-light-hover': '#fcd34d', // amber-300
  },

  // Text Colors
  text: {
    primary: '#451a03', // amber-950
    secondary: '#78350f', // amber-900
    tertiary: '#fcd34d', // amber-300
    'avatar-hover': '#b45309', // amber-700
  },

  // Background Colors
  background: {
    primary: '#ffffff',
    secondary: '#fffbeb', // amber-50
    tertiary: '#fefce8', // yellow-50
    main: '#fafaf9', // stone-50
  },

  // Border Colors
  border: {
    primary: '#d6d3d1', // stone-300
    secondary: '#e7e5e4', // stone-200
  },

  // State Colors
  error: {
    text: '#dc2626', // red-600
    'text-hover': '#991b1b', // red-800
    background: '#fef2f2', // red-50
    border: '#fca5a5', // red-300
  },

  warning: {
    background: '#fef3c7', // amber-100
    border: '#fbbf24', // amber-400
    icon: '#f59e0b', // amber-500
  },

  success: {
    background: '#d1fae5', // emerald-100
    border: '#10b981', // emerald-500
  },

  // Special UI
  loading: {
    spinner: '#d97706', // amber-600
  },

  // Dev Mode Colors
  dev: {
    background: '#fed7aa', // orange-200
    border: '#fb923c', // orange-400
    'badge-background': '#ffedd5', // orange-100
    'badge-text': '#7c2d12', // orange-900
    'button-background': '#ea580c', // orange-600
    'button-border': '#c2410c', // orange-700
  },
}

/**
 * Bright Yellow Theme
 */
const brightYellow = {
  // Brand Colors
  brand: {
    primary: '#ca8a04', // yellow-600
    'primary-hover': '#a16207', // yellow-700
    'primary-light': '#fef9c3', // yellow-100
    'primary-light-hover': '#fde047', // yellow-300
  },

  // Text Colors
  text: {
    primary: '#422006', // yellow-950
    secondary: '#713f12', // yellow-900
    tertiary: '#fde047', // yellow-300
    'avatar-hover': '#a16207', // yellow-700
  },

  // Background Colors
  background: {
    primary: '#ffffff',
    secondary: '#fefce8', // yellow-50
    tertiary: '#fffbeb', // amber-50
    main: '#fafaf9', // stone-50
  },

  // Border Colors
  border: {
    primary: '#d6d3d1', // stone-300
    secondary: '#e7e5e4', // stone-200
  },

  // State Colors
  error: {
    text: '#dc2626', // red-600
    'text-hover': '#991b1b', // red-800
    background: '#fef2f2', // red-50
    border: '#fca5a5', // red-300
  },

  warning: {
    background: '#fef3c7', // amber-100
    border: '#fbbf24', // amber-400
    icon: '#f59e0b', // amber-500
  },

  success: {
    background: '#d1fae5', // emerald-100
    border: '#10b981', // emerald-500
  },

  // Special UI
  loading: {
    spinner: '#ca8a04', // yellow-600
  },

  // Dev Mode Colors
  dev: {
    background: '#fed7aa', // orange-200
    border: '#fb923c', // orange-400
    'badge-background': '#ffedd5', // orange-100
    'badge-text': '#7c2d12', // orange-900
    'button-background': '#ea580c', // orange-600
    'button-border': '#c2410c', // orange-700
  },
}

/**
 * Fresh Lime Theme
 */
const freshLime = {
  // Brand Colors
  brand: {
    primary: '#65a30d', // lime-600
    'primary-hover': '#4d7c0f', // lime-700
    'primary-light': '#ecfccb', // lime-100
    'primary-light-hover': '#bef264', // lime-300
  },

  // Text Colors
  text: {
    primary: '#1a2e05', // lime-950
    secondary: '#365314', // lime-900
    tertiary: '#bef264', // lime-300
    'avatar-hover': '#4d7c0f', // lime-700
  },

  // Background Colors
  background: {
    primary: '#ffffff',
    secondary: '#f7fee7', // lime-50
    tertiary: '#f0fdf4', // green-50
    main: '#f5f5f5', // gray-100
  },

  // Border Colors
  border: {
    primary: '#d4d4d4', // neutral-300
    secondary: '#e5e5e5', // neutral-200
  },

  // State Colors
  error: {
    text: '#dc2626', // red-600
    'text-hover': '#991b1b', // red-800
    background: '#fef2f2', // red-50
    border: '#fca5a5', // red-300
  },

  warning: {
    background: '#fef3c7', // amber-100
    border: '#fbbf24', // amber-400
    icon: '#f59e0b', // amber-500
  },

  success: {
    background: '#ecfccb', // lime-100
    border: '#84cc16', // lime-500
  },

  // Special UI
  loading: {
    spinner: '#65a30d', // lime-600
  },

  // Dev Mode Colors
  dev: {
    background: '#fed7aa', // orange-200
    border: '#fb923c', // orange-400
    'badge-background': '#ffedd5', // orange-100
    'badge-text': '#7c2d12', // orange-900
    'button-background': '#ea580c', // orange-600
    'button-border': '#c2410c', // orange-700
  },
}

/**
 * Vibrant Emerald Theme
 */
const vibrantEmerald = {
  // Brand Colors
  brand: {
    primary: '#059669', // emerald-600
    'primary-hover': '#047857', // emerald-700
    'primary-light': '#d1fae5', // emerald-100
    'primary-light-hover': '#6ee7b7', // emerald-300
  },

  // Text Colors
  text: {
    primary: '#022c22', // emerald-950
    secondary: '#064e3b', // emerald-900
    tertiary: '#6ee7b7', // emerald-300
    'avatar-hover': '#047857', // emerald-700
  },

  // Background Colors
  background: {
    primary: '#ffffff',
    secondary: '#ecfdf5', // emerald-50
    tertiary: '#f0fdfa', // teal-50
    main: '#f5f5f5', // gray-100
  },

  // Border Colors
  border: {
    primary: '#d4d4d4', // neutral-300
    secondary: '#e5e5e5', // neutral-200
  },

  // State Colors
  error: {
    text: '#dc2626', // red-600
    'text-hover': '#991b1b', // red-800
    background: '#fef2f2', // red-50
    border: '#fca5a5', // red-300
  },

  warning: {
    background: '#fef3c7', // amber-100
    border: '#fbbf24', // amber-400
    icon: '#f59e0b', // amber-500
  },

  success: {
    background: '#d1fae5', // emerald-100
    border: '#10b981', // emerald-500
  },

  // Special UI
  loading: {
    spinner: '#059669', // emerald-600
  },

  // Dev Mode Colors
  dev: {
    background: '#fed7aa', // orange-200
    border: '#fb923c', // orange-400
    'badge-background': '#ffedd5', // orange-100
    'badge-text': '#7c2d12', // orange-900
    'button-background': '#ea580c', // orange-600
    'button-border': '#c2410c', // orange-700
  },
}

/**
 * Cool Cyan Theme
 */
const coolCyan = {
  // Brand Colors
  brand: {
    primary: '#0891b2', // cyan-600
    'primary-hover': '#0e7490', // cyan-700
    'primary-light': '#cffafe', // cyan-100
    'primary-light-hover': '#67e8f9', // cyan-300
  },

  // Text Colors
  text: {
    primary: '#083344', // cyan-950
    secondary: '#164e63', // cyan-900
    tertiary: '#67e8f9', // cyan-300
    'avatar-hover': '#0e7490', // cyan-700
  },

  // Background Colors
  background: {
    primary: '#ffffff',
    secondary: '#ecfeff', // cyan-50
    tertiary: '#f0f9ff', // sky-50
    main: '#f5f5f5', // gray-100
  },

  // Border Colors
  border: {
    primary: '#d4d4d4', // neutral-300
    secondary: '#e5e5e5', // neutral-200
  },

  // State Colors
  error: {
    text: '#dc2626', // red-600
    'text-hover': '#991b1b', // red-800
    background: '#fef2f2', // red-50
    border: '#fca5a5', // red-300
  },

  warning: {
    background: '#fef3c7', // amber-100
    border: '#fbbf24', // amber-400
    icon: '#f59e0b', // amber-500
  },

  success: {
    background: '#d1fae5', // emerald-100
    border: '#10b981', // emerald-500
  },

  // Special UI
  loading: {
    spinner: '#0891b2', // cyan-600
  },

  // Dev Mode Colors
  dev: {
    background: '#fed7aa', // orange-200
    border: '#fb923c', // orange-400
    'badge-background': '#ffedd5', // orange-100
    'badge-text': '#7c2d12', // orange-900
    'button-background': '#ea580c', // orange-600
    'button-border': '#c2410c', // orange-700
  },
}

/**
 * Clear Sky Theme
 */
const clearSky = {
  // Brand Colors
  brand: {
    primary: '#0284c7', // sky-600
    'primary-hover': '#0369a1', // sky-700
    'primary-light': '#e0f2fe', // sky-100
    'primary-light-hover': '#7dd3fc', // sky-300
  },

  // Text Colors
  text: {
    primary: '#082f49', // sky-950
    secondary: '#0c4a6e', // sky-900
    tertiary: '#7dd3fc', // sky-300
    'avatar-hover': '#0369a1', // sky-700
  },

  // Background Colors
  background: {
    primary: '#ffffff',
    secondary: '#f0f9ff', // sky-50
    tertiary: '#eff6ff', // blue-50
    main: '#f5f5f5', // gray-100
  },

  // Border Colors
  border: {
    primary: '#d4d4d4', // neutral-300
    secondary: '#e5e5e5', // neutral-200
  },

  // State Colors
  error: {
    text: '#dc2626', // red-600
    'text-hover': '#991b1b', // red-800
    background: '#fef2f2', // red-50
    border: '#fca5a5', // red-300
  },

  warning: {
    background: '#fef3c7', // amber-100
    border: '#fbbf24', // amber-400
    icon: '#f59e0b', // amber-500
  },

  success: {
    background: '#d1fae5', // emerald-100
    border: '#10b981', // emerald-500
  },

  // Special UI
  loading: {
    spinner: '#0284c7', // sky-600
  },

  // Dev Mode Colors
  dev: {
    background: '#fed7aa', // orange-200
    border: '#fb923c', // orange-400
    'badge-background': '#ffedd5', // orange-100
    'badge-text': '#7c2d12', // orange-900
    'button-background': '#ea580c', // orange-600
    'button-border': '#c2410c', // orange-700
  },
}

/**
 * Royal Purple Theme
 */
const royalPurple = {
  // Brand Colors
  brand: {
    primary: '#9333ea', // purple-600
    'primary-hover': '#7e22ce', // purple-700
    'primary-light': '#f3e8ff', // purple-100
    'primary-light-hover': '#d8b4fe', // purple-300
  },

  // Text Colors
  text: {
    primary: '#3b0764', // purple-950
    secondary: '#581c87', // purple-900
    tertiary: '#d8b4fe', // purple-300
    'avatar-hover': '#7e22ce', // purple-700
  },

  // Background Colors
  background: {
    primary: '#ffffff',
    secondary: '#faf5ff', // purple-50
    tertiary: '#fdf4ff', // fuchsia-50
    main: '#fafafa', // gray-50
  },

  // Border Colors
  border: {
    primary: '#d4d4d4', // neutral-300
    secondary: '#e5e5e5', // neutral-200
  },

  // State Colors
  error: {
    text: '#dc2626', // red-600
    'text-hover': '#991b1b', // red-800
    background: '#fef2f2', // red-50
    border: '#fca5a5', // red-300
  },

  warning: {
    background: '#fef3c7', // amber-100
    border: '#fbbf24', // amber-400
    icon: '#f59e0b', // amber-500
  },

  success: {
    background: '#d1fae5', // emerald-100
    border: '#10b981', // emerald-500
  },

  // Special UI
  loading: {
    spinner: '#9333ea', // purple-600
  },

  // Dev Mode Colors
  dev: {
    background: '#fed7aa', // orange-200
    border: '#fb923c', // orange-400
    'badge-background': '#ffedd5', // orange-100
    'badge-text': '#7c2d12', // orange-900
    'button-background': '#ea580c', // orange-600
    'button-border': '#c2410c', // orange-700
  },
}

/**
 * Vivid Fuchsia Theme
 */
const vividFuchsia = {
  // Brand Colors
  brand: {
    primary: '#c026d3', // fuchsia-600
    'primary-hover': '#a21caf', // fuchsia-700
    'primary-light': '#fae8ff', // fuchsia-100
    'primary-light-hover': '#f0abfc', // fuchsia-300
  },

  // Text Colors
  text: {
    primary: '#4a044e', // fuchsia-950
    secondary: '#701a75', // fuchsia-900
    tertiary: '#f0abfc', // fuchsia-300
    'avatar-hover': '#a21caf', // fuchsia-700
  },

  // Background Colors
  background: {
    primary: '#ffffff',
    secondary: '#fdf4ff', // fuchsia-50
    tertiary: '#faf5ff', // purple-50
    main: '#fafafa', // gray-50
  },

  // Border Colors
  border: {
    primary: '#d4d4d4', // neutral-300
    secondary: '#e5e5e5', // neutral-200
  },

  // State Colors
  error: {
    text: '#dc2626', // red-600
    'text-hover': '#991b1b', // red-800
    background: '#fef2f2', // red-50
    border: '#fca5a5', // red-300
  },

  warning: {
    background: '#fef3c7', // amber-100
    border: '#fbbf24', // amber-400
    icon: '#f59e0b', // amber-500
  },

  success: {
    background: '#d1fae5', // emerald-100
    border: '#10b981', // emerald-500
  },

  // Special UI
  loading: {
    spinner: '#c026d3', // fuchsia-600
  },

  // Dev Mode Colors
  dev: {
    background: '#fed7aa', // orange-200
    border: '#fb923c', // orange-400
    'badge-background': '#ffedd5', // orange-100
    'badge-text': '#7c2d12', // orange-900
    'button-background': '#ea580c', // orange-600
    'button-border': '#c2410c', // orange-700
  },
}

/**
 * Soft Pink Theme
 */
const softPink = {
  // Brand Colors
  brand: {
    primary: '#db2777', // pink-600
    'primary-hover': '#be185d', // pink-700
    'primary-light': '#fce7f3', // pink-100
    'primary-light-hover': '#f9a8d4', // pink-300
  },

  // Text Colors
  text: {
    primary: '#500724', // pink-950
    secondary: '#831843', // pink-900
    tertiary: '#f9a8d4', // pink-300
    'avatar-hover': '#be185d', // pink-700
  },

  // Background Colors
  background: {
    primary: '#ffffff',
    secondary: '#fdf2f8', // pink-50
    tertiary: '#fff1f2', // rose-50
    main: '#fafafa', // gray-50
  },

  // Border Colors
  border: {
    primary: '#d4d4d4', // neutral-300
    secondary: '#e5e5e5', // neutral-200
  },

  // State Colors
  error: {
    text: '#dc2626', // red-600
    'text-hover': '#991b1b', // red-800
    background: '#fef2f2', // red-50
    border: '#fca5a5', // red-300
  },

  warning: {
    background: '#fef3c7', // amber-100
    border: '#fbbf24', // amber-400
    icon: '#f59e0b', // amber-500
  },

  success: {
    background: '#d1fae5', // emerald-100
    border: '#10b981', // emerald-500
  },

  // Special UI
  loading: {
    spinner: '#db2777', // pink-600
  },

  // Dev Mode Colors
  dev: {
    background: '#fed7aa', // orange-200
    border: '#fb923c', // orange-400
    'badge-background': '#ffedd5', // orange-100
    'badge-text': '#7c2d12', // orange-900
    'button-background': '#ea580c', // orange-600
    'button-border': '#c2410c', // orange-700
  },
}

/**
 * Slate Gray Theme
 */
const slateGray = {
  // Brand Colors
  brand: {
    primary: '#475569', // slate-600
    'primary-hover': '#334155', // slate-700
    'primary-light': '#e2e8f0', // slate-200
    'primary-light-hover': '#94a3b8', // slate-400
  },

  // Text Colors
  text: {
    primary: '#020617', // slate-950
    secondary: '#1e293b', // slate-800
    tertiary: '#94a3b8', // slate-400
    'avatar-hover': '#334155', // slate-700
  },

  // Background Colors
  background: {
    primary: '#ffffff',
    secondary: '#f8fafc', // slate-50
    tertiary: '#f1f5f9', // slate-100
    main: '#e2e8f0', // slate-200
  },

  // Border Colors
  border: {
    primary: '#cbd5e1', // slate-300
    secondary: '#e2e8f0', // slate-200
  },

  // State Colors
  error: {
    text: '#dc2626', // red-600
    'text-hover': '#991b1b', // red-800
    background: '#fef2f2', // red-50
    border: '#fca5a5', // red-300
  },

  warning: {
    background: '#fef3c7', // amber-100
    border: '#fbbf24', // amber-400
    icon: '#f59e0b', // amber-500
  },

  success: {
    background: '#d1fae5', // emerald-100
    border: '#10b981', // emerald-500
  },

  // Special UI
  loading: {
    spinner: '#475569', // slate-600
  },

  // Dev Mode Colors
  dev: {
    background: '#fed7aa', // orange-200
    border: '#fb923c', // orange-400
    'badge-background': '#ffedd5', // orange-100
    'badge-text': '#7c2d12', // orange-900
    'button-background': '#ea580c', // orange-600
    'button-border': '#c2410c', // orange-700
  },
}

/**
 * Neutral Gray Theme
 */
const neutralGray = {
  // Brand Colors
  brand: {
    primary: '#4b5563', // gray-600
    'primary-hover': '#374151', // gray-700
    'primary-light': '#e5e7eb', // gray-200
    'primary-light-hover': '#9ca3af', // gray-400
  },

  // Text Colors
  text: {
    primary: '#030712', // gray-950
    secondary: '#1f2937', // gray-800
    tertiary: '#9ca3af', // gray-400
    'avatar-hover': '#374151', // gray-700
  },

  // Background Colors
  background: {
    primary: '#ffffff',
    secondary: '#f9fafb', // gray-50
    tertiary: '#f3f4f6', // gray-100
    main: '#e5e7eb', // gray-200
  },

  // Border Colors
  border: {
    primary: '#d1d5db', // gray-300
    secondary: '#e5e7eb', // gray-200
  },

  // State Colors
  error: {
    text: '#dc2626', // red-600
    'text-hover': '#991b1b', // red-800
    background: '#fef2f2', // red-50
    border: '#fca5a5', // red-300
  },

  warning: {
    background: '#fef3c7', // amber-100
    border: '#fbbf24', // amber-400
    icon: '#f59e0b', // amber-500
  },

  success: {
    background: '#d1fae5', // emerald-100
    border: '#10b981', // emerald-500
  },

  // Special UI
  loading: {
    spinner: '#4b5563', // gray-600
  },

  // Dev Mode Colors
  dev: {
    background: '#fed7aa', // orange-200
    border: '#fb923c', // orange-400
    'badge-background': '#ffedd5', // orange-100
    'badge-text': '#7c2d12', // orange-900
    'button-background': '#ea580c', // orange-600
    'button-border': '#c2410c', // orange-700
  },
}

/**
 * Modern Zinc Theme
 */
const modernZinc = {
  // Brand Colors
  brand: {
    primary: '#52525b', // zinc-600
    'primary-hover': '#3f3f46', // zinc-700
    'primary-light': '#e4e4e7', // zinc-200
    'primary-light-hover': '#a1a1aa', // zinc-400
  },

  // Text Colors
  text: {
    primary: '#09090b', // zinc-950
    secondary: '#18181b', // zinc-900
    tertiary: '#a1a1aa', // zinc-400
    'avatar-hover': '#3f3f46', // zinc-700
  },

  // Background Colors
  background: {
    primary: '#ffffff',
    secondary: '#fafafa', // zinc-50
    tertiary: '#f4f4f5', // zinc-100
    main: '#e4e4e7', // zinc-200
  },

  // Border Colors
  border: {
    primary: '#d4d4d8', // zinc-300
    secondary: '#e4e4e7', // zinc-200
  },

  // State Colors
  error: {
    text: '#dc2626', // red-600
    'text-hover': '#991b1b', // red-800
    background: '#fef2f2', // red-50
    border: '#fca5a5', // red-300
  },

  warning: {
    background: '#fef3c7', // amber-100
    border: '#fbbf24', // amber-400
    icon: '#f59e0b', // amber-500
  },

  success: {
    background: '#d1fae5', // emerald-100
    border: '#10b981', // emerald-500
  },

  // Special UI
  loading: {
    spinner: '#52525b', // zinc-600
  },

  // Dev Mode Colors
  dev: {
    background: '#fed7aa', // orange-200
    border: '#fb923c', // orange-400
    'badge-background': '#ffedd5', // orange-100
    'badge-text': '#7c2d12', // orange-900
    'button-background': '#ea580c', // orange-600
    'button-border': '#c2410c', // orange-700
  },
}

/**
 * Pure Neutral Theme
 */
const pureNeutral = {
  // Brand Colors
  brand: {
    primary: '#525252', // neutral-600
    'primary-hover': '#404040', // neutral-700
    'primary-light': '#e5e5e5', // neutral-200
    'primary-light-hover': '#a3a3a3', // neutral-400
  },

  // Text Colors
  text: {
    primary: '#0a0a0a', // neutral-950
    secondary: '#171717', // neutral-900
    tertiary: '#a3a3a3', // neutral-400
    'avatar-hover': '#404040', // neutral-700
  },

  // Background Colors
  background: {
    primary: '#ffffff',
    secondary: '#fafafa', // neutral-50
    tertiary: '#f5f5f5', // neutral-100
    main: '#e5e5e5', // neutral-200
  },

  // Border Colors
  border: {
    primary: '#d4d4d4', // neutral-300
    secondary: '#e5e5e5', // neutral-200
  },

  // State Colors
  error: {
    text: '#dc2626', // red-600
    'text-hover': '#991b1b', // red-800
    background: '#fef2f2', // red-50
    border: '#fca5a5', // red-300
  },

  warning: {
    background: '#fef3c7', // amber-100
    border: '#fbbf24', // amber-400
    icon: '#f59e0b', // amber-500
  },

  success: {
    background: '#d1fae5', // emerald-100
    border: '#10b981', // emerald-500
  },

  // Special UI
  loading: {
    spinner: '#525252', // neutral-600
  },

  // Dev Mode Colors
  dev: {
    background: '#fed7aa', // orange-200
    border: '#fb923c', // orange-400
    'badge-background': '#ffedd5', // orange-100
    'badge-text': '#7c2d12', // orange-900
    'button-background': '#ea580c', // orange-600
    'button-border': '#c2410c', // orange-700
  },
}

/**
 * Warm Stone Theme
 */
const warmStone = {
  // Brand Colors
  brand: {
    primary: '#57534e', // stone-600
    'primary-hover': '#44403c', // stone-700
    'primary-light': '#e7e5e4', // stone-200
    'primary-light-hover': '#a8a29e', // stone-400
  },

  // Text Colors
  text: {
    primary: '#0c0a09', // stone-950
    secondary: '#1c1917', // stone-900
    tertiary: '#a8a29e', // stone-400
    'avatar-hover': '#44403c', // stone-700
  },

  // Background Colors
  background: {
    primary: '#ffffff',
    secondary: '#fafaf9', // stone-50
    tertiary: '#f5f5f4', // stone-100
    main: '#e7e5e4', // stone-200
  },

  // Border Colors
  border: {
    primary: '#d6d3d1', // stone-300
    secondary: '#e7e5e4', // stone-200
  },

  // State Colors
  error: {
    text: '#dc2626', // red-600
    'text-hover': '#991b1b', // red-800
    background: '#fef2f2', // red-50
    border: '#fca5a5', // red-300
  },

  warning: {
    background: '#fef3c7', // amber-100
    border: '#fbbf24', // amber-400
    icon: '#f59e0b', // amber-500
  },

  success: {
    background: '#d1fae5', // emerald-100
    border: '#10b981', // emerald-500
  },

  // Special UI
  loading: {
    spinner: '#57534e', // stone-600
  },

  // Dev Mode Colors
  dev: {
    background: '#fed7aa', // orange-200
    border: '#fb923c', // orange-400
    'badge-background': '#ffedd5', // orange-100
    'badge-text': '#7c2d12', // orange-900
    'button-background': '#ea580c', // orange-600
    'button-border': '#c2410c', // orange-700
  },
}

// ============================================================================
// ACTIVE PALETTE
// ============================================================================

/**
 * Active Color Palette
 *
 * To change the theme, update this export to use a different palette:
 *
 * Original Themes:
 * - export const colors = whatsappGreen;
 * - export const colors = modernBlue;
 * - export const colors = professionalPurple;
 * - export const colors = oceanTeal;
 * - export const colors = sunsetOrange;
 * - export const colors = deepIndigo;
 * - export const colors = forestGreen;
 * - export const colors = rosePink;
 *
 * Tailwind 600-Series Themes:
 * - export const colors = crimsonRed;      // red-600
 * - export const colors = goldenAmber;     // amber-600
 * - export const colors = brightYellow;    // yellow-600
 * - export const colors = freshLime;       // lime-600
 * - export const colors = vibrantEmerald;  // emerald-600
 * - export const colors = coolCyan;        // cyan-600
 * - export const colors = clearSky;        // sky-600
 * - export const colors = royalPurple;     // purple-600
 * - export const colors = vividFuchsia;    // fuchsia-600
 * - export const colors = softPink;        // pink-600
 * - export const colors = slateGray;       // slate-600
 * - export const colors = neutralGray;     // gray-600
 * - export const colors = modernZinc;      // zinc-600
 * - export const colors = pureNeutral;     // neutral-600
 * - export const colors = warmStone;       // stone-600
 */
export const colors = coolCyan

// ============================================================================
// AVAILABLE PALETTES (for easy switching)
// ============================================================================

export const palettes = {
  // Original themes
  whatsappGreen,
  modernBlue,
  professionalPurple,
  oceanTeal,
  sunsetOrange,
  deepIndigo,
  forestGreen,
  rosePink,

  // Tailwind 600-series themes
  crimsonRed,
  goldenAmber,
  brightYellow,
  freshLime,
  vibrantEmerald,
  coolCyan,
  clearSky,
  royalPurple,
  vividFuchsia,
  softPink,
  slateGray,
  neutralGray,
  modernZinc,
  pureNeutral,
  warmStone,
}

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type ColorPalette = typeof whatsappGreen
export type ColorCategory = keyof ColorPalette
export type BrandColor = keyof typeof whatsappGreen.brand
export type TextColor = keyof typeof whatsappGreen.text
export type BackgroundColor = keyof typeof whatsappGreen.background
export type BorderColor = keyof typeof whatsappGreen.border
export type ErrorColor = keyof typeof whatsappGreen.error
export type WarningColor = keyof typeof whatsappGreen.warning
export type SuccessColor = keyof typeof whatsappGreen.success
