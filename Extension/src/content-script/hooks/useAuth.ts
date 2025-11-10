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
import logger from '../../utils/logger'

export function useAuth() {
  // Start in 'authenticating' to avoid flashing unauthenticated UI before the first check completes
  const [authState, setAuthState] = useState<AuthState>('authenticating')
  const [error, setError] = useState<string | null>(null)
  const [verificationCode, setVerificationCode] = useState<string | null>(null)
  const [userName, setUserName] = useState<string | null>(null)

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      logger.log('[useAuth] Checking authentication status...')
      const isAuth = await authService.isAuthenticated()
      if (isAuth) {
        const code = await authService.getVerificationCode()
        const { userName: storedUserName } = await chrome.storage.local.get('userName')
        setVerificationCode(code)
        setUserName(storedUserName || null)
        setAuthState('authenticated')
        logger.log('[useAuth] User is authenticated, userName:', storedUserName || 'Not set')
      } else {
        setVerificationCode(null)
        setUserName(null)
        setAuthState('unauthenticated')
        logger.log('[useAuth] User is not authenticated')
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
          logger.log(
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
          logger.log('[useAuth] userName change detected:', newUserName || 'Cleared')
          setUserName(newUserName || null)
        }
      }
    }

    chrome.storage.onChanged.addListener(handleStorageChange)
    return () => chrome.storage.onChanged.removeListener(handleStorageChange)
  }, [])

  const signIn = async () => {
    logger.log('[useAuth] Starting sign-in flow...')
    setAuthState('authenticating')
    setError(null)

    try {
      const code = await authService.signIn()
      setVerificationCode(code)
      setAuthState('authenticated')
      logger.log('[useAuth] Sign-in successful')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Authentication failed'
      logger.error('[useAuth] Sign-in failed:', errorMessage)

      // Check if error is beta access required
      if (errorMessage === OAuthErrorCode.BETA_ACCESS_REQUIRED) {
        logger.log('[useAuth] Beta access required - user not in database')
        setAuthState('beta_required')
      } else {
        setError(errorMessage)
        setAuthState('error')
      }
    }
  }

  const signOut = async () => {
    logger.log('[useAuth] Signing out...')
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
