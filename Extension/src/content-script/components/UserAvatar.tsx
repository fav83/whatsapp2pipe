import { useEffect, useRef, useState } from 'react'
import { themeManager, THEMES_BY_CATEGORY, type ThemeName } from '../../styles/ThemeManager'
import { config } from '../../config'

interface UserAvatarProps {
  userName: string
  verificationCode: string | null
  onSignOut: () => void
}

export function UserAvatar({ userName, verificationCode, onSignOut }: UserAvatarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false)
  const [currentTheme, setCurrentTheme] = useState<ThemeName>(themeManager.getCurrentTheme())
  const avatarRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const themeMenuRef = useRef<HTMLDivElement>(null)

  // Extract first letter, uppercase
  const avatarLetter = userName.charAt(0).toUpperCase()

  // Check if theme selector should be shown (dev mode only)
  const showThemeSelector =
    import.meta.env.MODE === 'development' &&
    import.meta.env.VITE_ENV === 'development' &&
    config.env === 'development'

  // Handle clicks outside menu
  useEffect(() => {
    if (!isMenuOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node

      // Close if click is outside both avatar and menu
      if (
        avatarRef.current &&
        !avatarRef.current.contains(target) &&
        menuRef.current &&
        !menuRef.current.contains(target)
      ) {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isMenuOpen])

  // Handle Escape key
  useEffect(() => {
    if (!isMenuOpen) return

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isMenuOpen])

  // Listen for theme changes
  useEffect(() => {
    const handleThemeChange = (newTheme: ThemeName) => {
      setCurrentTheme(newTheme)
    }

    themeManager.addListener(handleThemeChange)
    return () => themeManager.removeListener(handleThemeChange)
  }, [])

  const handleSignOut = () => {
    setIsMenuOpen(false)
    onSignOut()
  }

  const handleThemeSelect = async (themeName: ThemeName) => {
    await themeManager.setTheme(themeName)
    setIsThemeMenuOpen(false)
  }

  const handleProfileClick = () => {
    // Build dashboard URL with verification code for auto sign-in
    let dashboardUrl = `${config.dashboardUrl}/dashboard`
    if (verificationCode) {
      dashboardUrl += `?verification_code=${encodeURIComponent(verificationCode)}`
    }

    // Send message to service worker to open tab (chrome.tabs not available in content script)
    chrome.runtime.sendMessage({
      type: 'TAB_OPEN',
      url: dashboardUrl,
    })

    setIsMenuOpen(false)
  }

  return (
    <div className="relative">
      {/* Avatar Circle */}
      <div
        ref={avatarRef}
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="w-8 h-8 rounded-full bg-brand-primary hover:bg-brand-hover flex items-center justify-center cursor-pointer transition-colors"
        role="button"
        aria-label="User menu"
        aria-expanded={isMenuOpen}
      >
        <span className="text-white text-sm font-semibold leading-none">{avatarLetter}</span>
      </div>

      {/* Dropdown Menu */}
      {isMenuOpen && (
        <div
          ref={menuRef}
          className="absolute right-0 top-full mt-2 w-[200px] bg-white rounded-lg shadow-lg border border-border-secondary py-2 z-[1000]"
          role="menu"
        >
          {/* User Name Header */}
          <div className="px-4 py-3 text-sm font-semibold text-text-primary truncate">
            {userName}
          </div>

          {/* Divider */}
          <div className="h-px bg-border-secondary my-1" />

          {/* Profile Menu Item */}
          <button
            onClick={handleProfileClick}
            className="w-full text-left px-4 py-3 text-sm text-text-secondary hover:bg-background-secondary transition-colors"
            role="menuitem"
          >
            Profile
          </button>

          {/* Divider */}
          <div className="h-px bg-border-secondary my-1" />

          {/* Theme Menu Item (Dev Only) */}
          {showThemeSelector && (
            <div className="relative">
              <button
                onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
                className="w-full text-left px-4 py-3 text-sm text-text-secondary hover:bg-background-secondary transition-colors flex items-center justify-between"
                role="menuitem"
                aria-expanded={isThemeMenuOpen}
              >
                <div className="flex items-center gap-2">
                  <span>Theme</span>
                  <span className="px-1.5 py-0.5 text-[10px] font-bold text-dev-badge-text bg-dev-badge-background border border-dev-border rounded">
                    DEV
                  </span>
                </div>
                <svg
                  className={`w-4 h-4 transition-transform ${isThemeMenuOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Theme Submenu */}
              {isThemeMenuOpen && (
                <div
                  ref={themeMenuRef}
                  className="absolute right-full top-0 mr-1 w-[220px] max-h-[400px] overflow-y-auto bg-white rounded-lg shadow-lg border border-border-secondary py-2 z-[1001]"
                  role="menu"
                >
                  {Object.entries(THEMES_BY_CATEGORY).map(([category, themes]) => (
                    <div key={category}>
                      <div className="px-3 py-2 text-xs font-semibold text-text-tertiary uppercase">
                        {category}
                      </div>
                      {themes.map((theme) => (
                        <button
                          key={theme.name}
                          onClick={() => handleThemeSelect(theme.name)}
                          className={`w-full text-left px-3 py-2 text-sm hover:bg-background-secondary transition-colors flex items-center gap-2 ${
                            currentTheme === theme.name ? 'bg-background-tertiary' : ''
                          }`}
                          role="menuitem"
                        >
                          <div
                            className="w-4 h-4 rounded-full border border-border-primary flex-shrink-0"
                            style={{ backgroundColor: theme.primaryColor }}
                          />
                          <span
                            className={
                              currentTheme === theme.name
                                ? 'font-semibold text-text-primary'
                                : 'text-text-secondary'
                            }
                          >
                            {theme.displayName}
                          </span>
                          {currentTheme === theme.name && (
                            <svg
                              className="w-4 h-4 ml-auto text-brand-primary flex-shrink-0"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Divider */}
          {showThemeSelector && <div className="h-px bg-border-secondary my-1" />}

          {/* Sign Out Menu Item */}
          <button
            onClick={handleSignOut}
            className="w-full text-left px-4 py-3 text-sm text-text-secondary hover:bg-background-secondary transition-colors"
            role="menuitem"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}
