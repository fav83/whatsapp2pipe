import { useEffect, useRef, useState } from 'react'

interface UserAvatarProps {
  userName: string
  onSignOut: () => void
}

export function UserAvatar({ userName, onSignOut }: UserAvatarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const avatarRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  // Extract first letter, uppercase
  const avatarLetter = userName.charAt(0).toUpperCase()

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

  const handleSignOut = () => {
    setIsMenuOpen(false)
    onSignOut()
  }

  return (
    <div className="relative">
      {/* Avatar Circle */}
      <div
        ref={avatarRef}
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="w-8 h-8 rounded-full bg-[#667781] hover:bg-[#556168] flex items-center justify-center cursor-pointer transition-colors"
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
          className="absolute right-0 top-full mt-2 w-[200px] bg-white rounded-lg shadow-lg border border-[#E9EDEF] py-2 z-[1000]"
          role="menu"
        >
          {/* User Name Header */}
          <div className="px-4 py-3 text-sm font-semibold text-[#111b21] truncate">{userName}</div>

          {/* Divider */}
          <div className="h-px bg-[#E9EDEF] my-1" />

          {/* Sign Out Menu Item */}
          <button
            onClick={handleSignOut}
            className="w-full text-left px-4 py-3 text-sm text-[#667781] hover:bg-[#F0F2F5] transition-colors"
            role="menuitem"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}
