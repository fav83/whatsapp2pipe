/**
 * useAuth Hook
 *
 * React hook for authentication state management.
 * Manages OAuth flow, checks auth status, and listens for storage changes.
 */

import { useState, useEffect } from 'react'
import { authService } from '../services/authService'
import type { AuthState } from '../../types/auth'
import { OAuthErrorCode } from '../../types/errors'

export function useAuth() {
  // Start in 'authenticating' to avoid flashing unauthenticated UI before the first check completes
  const [authState, setAuthState] = useState<AuthState>('authenticating')
  const [error, setError] = useState<string | null>(null)
  const [verificationCode, setVerificationCode] = useState<string | null>(null)
  const [userName, setUserName] = useState<string | null>(null)

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      console.log('[useAuth] Checking authentication status...')
      const isAuth = await authService.isAuthenticated()
      if (isAuth) {
        const code = await authService.getVerificationCode()
        const { userName: storedUserName } = await chrome.storage.local.get('userName')
        setVerificationCode(code)
        setUserName(storedUserName || null)
        setAuthState('authenticated')
        console.log('[useAuth] User is authenticated, userName:', storedUserName || 'Not set')
      } else {
        setVerificationCode(null)
        setUserName(null)
        setAuthState('unauthenticated')
        console.log('[useAuth] User is not authenticated')
      }
    }
    checkAuth()
  }, [])

  // Listen for storage changes (e.g., sign-in in another tab)
  useEffect(() => {
    const handleStorageChange = (
      changes: { [key: string]: chrome.storage.StorageChange },
      areaName: string
    ) => {
      if (areaName === 'local') {
        // Handle verification_code changes
        if (changes.verification_code) {
          const newValue = changes.verification_code.newValue
          console.log(
            '[useAuth] Storage change detected:',
            newValue ? 'authenticated' : 'unauthenticated'
          )

          if (newValue) {
            setVerificationCode(newValue)
            setAuthState('authenticated')
          } else {
            setVerificationCode(null)
            setAuthState('unauthenticated')
          }
        }

        // Handle userName changes
        if (changes.userName) {
          const newUserName = changes.userName.newValue
          console.log('[useAuth] userName change detected:', newUserName || 'Cleared')
          setUserName(newUserName || null)
        }
      }
    }

    chrome.storage.onChanged.addListener(handleStorageChange)
    return () => chrome.storage.onChanged.removeListener(handleStorageChange)
  }, [])

  const signIn = async () => {
    console.log('[useAuth] Starting sign-in flow...')
    setAuthState('authenticating')
    setError(null)

    try {
      const code = await authService.signIn()
      setVerificationCode(code)
      setAuthState('authenticated')
      console.log('[useAuth] Sign-in successful')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Authentication failed'
      console.error('[useAuth] Sign-in failed:', errorMessage)

      // Check if error is beta access required
      if (errorMessage === OAuthErrorCode.BETA_ACCESS_REQUIRED) {
        console.log('[useAuth] Beta access required - user not in database')
        setAuthState('beta_required')
      } else {
        setError(errorMessage)
        setAuthState('error')
      }
    }
  }

  const signOut = async () => {
    console.log('[useAuth] Signing out...')
    await authService.signOut()
    setVerificationCode(null)
    setUserName(null)
    setAuthState('unauthenticated')
  }

  return {
    authState,
    verificationCode,
    userName,
    error,
    signIn,
    signOut,
  }
}
