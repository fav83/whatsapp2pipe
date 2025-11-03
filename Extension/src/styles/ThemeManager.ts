/**
 * Theme Manager
 *
 * Manages theme selection, persistence, and dynamic CSS variable application.
 * Enables instant theme switching without rebuild or component re-render.
 */

import { palettes, type ColorPalette } from './colors'

export type ThemeName = keyof typeof palettes

export interface ThemeMetadata {
  name: ThemeName
  displayName: string
  category: 'Original' | 'Tailwind 600-Series' | 'Tailwind 500-Series'
  primaryColor: string
}

/**
 * Theme metadata with display names and categories
 */
export const THEME_METADATA: ThemeMetadata[] = [
  // Original Theme
  {
    name: 'whatsappGreen',
    displayName: 'WhatsApp Green',
    category: 'Original',
    primaryColor: '#00a884',
  },

  // Tailwind 600-Series Color Themes
  {
    name: 'modernBlue',
    displayName: 'Blue 600',
    category: 'Tailwind 600-Series',
    primaryColor: '#2563eb',
  },
  {
    name: 'professionalPurple',
    displayName: 'Violet 600',
    category: 'Tailwind 600-Series',
    primaryColor: '#7c3aed',
  },
  {
    name: 'oceanTeal',
    displayName: 'Teal 600',
    category: 'Tailwind 600-Series',
    primaryColor: '#0d9488',
  },
  {
    name: 'sunsetOrange',
    displayName: 'Orange 600',
    category: 'Tailwind 600-Series',
    primaryColor: '#ea580c',
  },
  {
    name: 'deepIndigo',
    displayName: 'Indigo 600',
    category: 'Tailwind 600-Series',
    primaryColor: '#4f46e5',
  },
  {
    name: 'forestGreen',
    displayName: 'Green 600',
    category: 'Tailwind 600-Series',
    primaryColor: '#16a34a',
  },
  {
    name: 'rosePink',
    displayName: 'Rose 600',
    category: 'Tailwind 600-Series',
    primaryColor: '#e11d48',
  },
  {
    name: 'crimsonRed',
    displayName: 'Red 600',
    category: 'Tailwind 600-Series',
    primaryColor: '#dc2626',
  },
  {
    name: 'goldenAmber',
    displayName: 'Amber 600',
    category: 'Tailwind 600-Series',
    primaryColor: '#d97706',
  },
  {
    name: 'brightYellow',
    displayName: 'Yellow 600',
    category: 'Tailwind 600-Series',
    primaryColor: '#ca8a04',
  },
  {
    name: 'freshLime',
    displayName: 'Lime 600',
    category: 'Tailwind 600-Series',
    primaryColor: '#65a30d',
  },
  {
    name: 'vibrantEmerald',
    displayName: 'Emerald 600',
    category: 'Tailwind 600-Series',
    primaryColor: '#059669',
  },
  {
    name: 'royalPurple',
    displayName: 'Purple 600',
    category: 'Tailwind 600-Series',
    primaryColor: '#9333ea',
  },
  {
    name: 'vividFuchsia',
    displayName: 'Fuchsia 600',
    category: 'Tailwind 600-Series',
    primaryColor: '#c026d3',
  },
  {
    name: 'softPink',
    displayName: 'Pink 600',
    category: 'Tailwind 600-Series',
    primaryColor: '#db2777',
  },
  {
    name: 'coolCyan',
    displayName: 'Cyan 600',
    category: 'Tailwind 600-Series',
    primaryColor: '#0891b2',
  },
  {
    name: 'clearSky',
    displayName: 'Sky 600',
    category: 'Tailwind 600-Series',
    primaryColor: '#0284c7',
  },
  {
    name: 'slateGray',
    displayName: 'Slate 600',
    category: 'Tailwind 600-Series',
    primaryColor: '#475569',
  },
  {
    name: 'neutralGray',
    displayName: 'Gray 600',
    category: 'Tailwind 600-Series',
    primaryColor: '#4b5563',
  },
  {
    name: 'modernZinc',
    displayName: 'Zinc 600',
    category: 'Tailwind 600-Series',
    primaryColor: '#52525b',
  },
  {
    name: 'pureNeutral',
    displayName: 'Neutral 600',
    category: 'Tailwind 600-Series',
    primaryColor: '#525252',
  },
  {
    name: 'warmStone',
    displayName: 'Stone 600',
    category: 'Tailwind 600-Series',
    primaryColor: '#57534e',
  },

  // Tailwind 500-Series Color Themes
  {
    name: 'slate500',
    displayName: 'Slate 500',
    category: 'Tailwind 500-Series',
    primaryColor: '#64748b',
  },
  {
    name: 'gray500',
    displayName: 'Gray 500',
    category: 'Tailwind 500-Series',
    primaryColor: '#6b7280',
  },
  {
    name: 'zinc500',
    displayName: 'Zinc 500',
    category: 'Tailwind 500-Series',
    primaryColor: '#71717a',
  },
  {
    name: 'neutral500',
    displayName: 'Neutral 500',
    category: 'Tailwind 500-Series',
    primaryColor: '#737373',
  },
  {
    name: 'stone500',
    displayName: 'Stone 500',
    category: 'Tailwind 500-Series',
    primaryColor: '#78716c',
  },
  {
    name: 'red500',
    displayName: 'Red 500',
    category: 'Tailwind 500-Series',
    primaryColor: '#ef4444',
  },
  {
    name: 'orange500',
    displayName: 'Orange 500',
    category: 'Tailwind 500-Series',
    primaryColor: '#f97316',
  },
  {
    name: 'amber500',
    displayName: 'Amber 500',
    category: 'Tailwind 500-Series',
    primaryColor: '#f59e0b',
  },
  {
    name: 'yellow500',
    displayName: 'Yellow 500',
    category: 'Tailwind 500-Series',
    primaryColor: '#eab308',
  },
  {
    name: 'lime500',
    displayName: 'Lime 500',
    category: 'Tailwind 500-Series',
    primaryColor: '#84cc16',
  },
  {
    name: 'green500',
    displayName: 'Green 500',
    category: 'Tailwind 500-Series',
    primaryColor: '#22c55e',
  },
  {
    name: 'emerald500',
    displayName: 'Emerald 500',
    category: 'Tailwind 500-Series',
    primaryColor: '#10b981',
  },
  {
    name: 'teal500',
    displayName: 'Teal 500',
    category: 'Tailwind 500-Series',
    primaryColor: '#14b8a6',
  },
  {
    name: 'cyan500',
    displayName: 'Cyan 500',
    category: 'Tailwind 500-Series',
    primaryColor: '#06b6d4',
  },
  {
    name: 'sky500',
    displayName: 'Sky 500',
    category: 'Tailwind 500-Series',
    primaryColor: '#0ea5e9',
  },
  {
    name: 'blue500',
    displayName: 'Blue 500',
    category: 'Tailwind 500-Series',
    primaryColor: '#3b82f6',
  },
  {
    name: 'indigo500',
    displayName: 'Indigo 500',
    category: 'Tailwind 500-Series',
    primaryColor: '#6366f1',
  },
  {
    name: 'violet500',
    displayName: 'Violet 500',
    category: 'Tailwind 500-Series',
    primaryColor: '#8b5cf6',
  },
  {
    name: 'purple500',
    displayName: 'Purple 500',
    category: 'Tailwind 500-Series',
    primaryColor: '#a855f7',
  },
  {
    name: 'fuchsia500',
    displayName: 'Fuchsia 500',
    category: 'Tailwind 500-Series',
    primaryColor: '#d946ef',
  },
  {
    name: 'pink500',
    displayName: 'Pink 500',
    category: 'Tailwind 500-Series',
    primaryColor: '#ec4899',
  },
  {
    name: 'rose500',
    displayName: 'Rose 500',
    category: 'Tailwind 500-Series',
    primaryColor: '#f43f5e',
  },
]

/**
 * Group themes by category
 */
export const THEMES_BY_CATEGORY = THEME_METADATA.reduce(
  (acc, theme) => {
    if (!acc[theme.category]) {
      acc[theme.category] = []
    }
    acc[theme.category].push(theme)
    return acc
  },
  {} as Record<string, ThemeMetadata[]>
)

/**
 * Theme Manager Class
 */
class ThemeManager {
  private currentTheme: ThemeName = 'coolCyan'
  private listeners: Set<(theme: ThemeName) => void> = new Set()
  private initialized = false

  /**
   * Initialize theme manager - loads saved theme and applies it
   */
  async initialize(): Promise<void> {
    if (this.initialized) return

    try {
      const result = await chrome.storage.local.get('theme')
      if (result.theme && palettes[result.theme as ThemeName]) {
        this.currentTheme = result.theme as ThemeName
      }
      this.applyTheme(this.currentTheme)
      this.initialized = true
      console.log('[ThemeManager] Initialized with theme:', this.currentTheme)
    } catch (error) {
      console.error('[ThemeManager] Failed to initialize:', error)
      // Fall back to default theme
      this.applyTheme(this.currentTheme)
      this.initialized = true
    }
  }

  /**
   * Get current theme name
   */
  getCurrentTheme(): ThemeName {
    return this.currentTheme
  }

  /**
   * Set new theme
   */
  async setTheme(themeName: ThemeName): Promise<void> {
    if (!palettes[themeName]) {
      console.error('[ThemeManager] Invalid theme:', themeName)
      return
    }

    this.currentTheme = themeName
    this.applyTheme(themeName)
    this.notifyListeners()

    // Persist to storage
    try {
      await chrome.storage.local.set({ theme: themeName })
      console.log('[ThemeManager] Theme saved:', themeName)
    } catch (error) {
      console.error('[ThemeManager] Failed to save theme:', error)
    }
  }

  /**
   * Apply theme by setting CSS variables
   */
  private applyTheme(themeName: ThemeName): void {
    const palette = palettes[themeName]
    if (!palette) return

    this.applyCSSVariables(palette)
    console.log('[ThemeManager] Applied theme:', themeName)
  }

  /**
   * Apply color palette as CSS variables
   */
  private applyCSSVariables(palette: ColorPalette): void {
    const sidebar = document.getElementById('pipedrive-whatsapp-sidebar')
    if (!sidebar) {
      console.warn('[ThemeManager] Sidebar not found, retrying in 100ms...')
      setTimeout(() => this.applyCSSVariables(palette), 100)
      return
    }

    // Apply CSS variables to sidebar root (matching Tailwind config names)
    const style = sidebar.style

    // Brand colors (map to Tailwind config)
    style.setProperty('--brand-primary', palette.brand.primary)
    style.setProperty('--brand-secondary', palette.brand['primary-light']) // Use light variant as secondary
    style.setProperty('--brand-hover', palette.brand['primary-hover'])

    // Text colors
    style.setProperty('--text-primary', palette.text.primary)
    style.setProperty('--text-secondary', palette.text.secondary)
    style.setProperty('--text-tertiary', palette.text.tertiary)
    style.setProperty('--text-link', palette.brand.primary) // Use brand primary for links
    style.setProperty('--text-link-hover', palette.brand['primary-hover'])
    style.setProperty('--text-avatar-hover', palette.text['avatar-hover'])

    // Background colors (map to Tailwind config)
    style.setProperty('--background-main', palette.background.main) // Main background
    style.setProperty('--background-secondary', palette.background.secondary) // Lighter shade
    style.setProperty('--background-tertiary', palette.background.tertiary) // Another shade
    style.setProperty('--background-hover', palette.brand['primary-light-hover']) // Hover state

    // Border colors
    style.setProperty('--border-primary', palette.border.primary)
    style.setProperty('--border-secondary', palette.border.secondary)

    // Button colors
    style.setProperty('--button-primary-bg', palette.brand.primary)
    style.setProperty('--button-primary-bg-hover', palette.brand['primary-hover'])
    style.setProperty('--button-primary-text', '#ffffff')
    style.setProperty('--button-secondary-bg', palette.brand['primary-light'])
    style.setProperty('--button-secondary-bg-hover', palette.brand['primary-light-hover'])
    style.setProperty('--button-secondary-text', palette.brand.primary)

    // Loading
    style.setProperty('--loading-spinner', palette.loading.spinner)

    // Dev mode colors (for development indicator)
    style.setProperty('--dev-bg', palette.dev.background)
    style.setProperty('--dev-border', palette.dev.border)
    style.setProperty('--dev-badge-bg', palette.dev['badge-background'])
    style.setProperty('--dev-badge-text', palette.dev['badge-text'])
    style.setProperty('--dev-button-bg', palette.dev['button-background'])
    style.setProperty('--dev-button-border', palette.dev['button-border'])
  }

  /**
   * Add theme change listener
   */
  addListener(callback: (theme: ThemeName) => void): void {
    this.listeners.add(callback)
  }

  /**
   * Remove theme change listener
   */
  removeListener(callback: (theme: ThemeName) => void): void {
    this.listeners.delete(callback)
  }

  /**
   * Notify all listeners of theme change
   */
  private notifyListeners(): void {
    this.listeners.forEach((callback) => {
      try {
        callback(this.currentTheme)
      } catch (error) {
        console.error('[ThemeManager] Listener error:', error)
      }
    })
  }
}

// Export singleton instance
export const themeManager = new ThemeManager()
