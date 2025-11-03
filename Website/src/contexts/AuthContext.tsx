import React, { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services/authService'
import type { AuthStatus } from '../types/auth'

interface AuthContextValue {
  authStatus: AuthStatus
  verificationCode: string | null
  signOut: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authStatus, setAuthStatus] = useState<AuthStatus>('loading')
  const [verificationCode, setVerificationCode] = useState<string | null>(null)

  // Check authentication status on mount
  useEffect(() => {
    const code = authService.getVerificationCode()
    if (code) {
      setVerificationCode(code)
      setAuthStatus('authenticated')
    } else {
      setAuthStatus('unauthenticated')
    }
  }, [])

  const signOut = () => {
    authService.signOut()
    setVerificationCode(null)
    setAuthStatus('unauthenticated')
  }

  return (
    <AuthContext.Provider value={{ authStatus, verificationCode, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
