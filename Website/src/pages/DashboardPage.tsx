import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { authService } from '../services/authService'
import { userService } from '../services/userService'
import { Header } from '../components/layout/Header'
import { UserProfile } from '../components/auth/UserProfile'
import { ExtensionStatus } from '../components/dashboard/ExtensionStatus'
import { HowToUse } from '../components/dashboard/HowToUse'
import type { User } from '../types/user'

export default function DashboardPage() {
  const { authStatus, verificationCode, signOut } = useAuth()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Auto sign-in from extension verification code (if present in URL)
  useEffect(() => {
    const urlVerificationCode = searchParams.get('verification_code')
    if (urlVerificationCode && authStatus === 'unauthenticated') {
      // Store verification code from URL and remove parameter
      authService.handleCallback(urlVerificationCode)
      setSearchParams({}) // Clear URL parameter
      window.location.reload() // Reload to trigger AuthContext update
    }
  }, [searchParams, setSearchParams, authStatus])

  // Redirect unauthenticated users to home
  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      navigate('/')
    }
  }, [authStatus, navigate])

  // Fetch user info
  useEffect(() => {
    if (authStatus === 'authenticated' && verificationCode) {
      fetchUser()
    }
  }, [authStatus, verificationCode])

  const fetchUser = async () => {
    try {
      setLoading(true)
      setError(null)
      const userData = await userService.getCurrentUser(verificationCode!)
      setUser(userData)
    } catch (err) {
      if (err instanceof Error && err.message === 'Session expired') {
        // Session expired - sign out and redirect
        signOut()
        navigate('/')
      } else {
        setError('Failed to load user information')
      }
    } finally {
      setLoading(false)
    }
  }

  if (authStatus === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-600">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header onSignOut={signOut} />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-red-600 mb-2">
              Error
            </h2>
            <p className="text-slate-600 mb-4">{error}</p>
            <button
              onClick={fetchUser}
              className="text-button-primary hover:text-button-primary-hover hover:underline"
            >
              Try again
            </button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-light">
      <Header onSignOut={signOut} />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="text-3xl font-semibold text-slate-700 mb-8">
          Dashboard
        </h1>

        {/* Three-column responsive grid: 1 col (left) + 2 cols (right) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left column - Profile & Extension Status (1/3 width) */}
          <div className="md:col-span-1 space-y-6">
            {/* User Profile */}
            {user && <UserProfile user={user} onSignOut={signOut} />}

            {/* Extension Status */}
            <ExtensionStatus />
          </div>

          {/* Right column - How to Use (2/3 width, twice as wide) */}
          <div className="md:col-span-2">
            {/* How to use */}
            <HowToUse />
          </div>
        </div>
      </main>
    </div>
  )
}
