import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { authService } from '../services/authService'
import { Button } from '../components/ui/button'
import { Header } from '../components/layout/Header'
import { Footer } from '../components/layout/Footer'

export default function HomePage() {
  const { authStatus } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [inviteCode, setInviteCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Auto-fill invite from URL parameter ?i=my-invite
  useEffect(() => {
    const inviteParam = searchParams.get('i')
    if (inviteParam) {
      setInviteCode(inviteParam)
    }
  }, [searchParams])

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (authStatus === 'authenticated') {
      navigate('/dashboard')
    }
  }, [authStatus, navigate])

  const handleSignIn = () => {
    setIsLoading(true)
    // Pass invite code (empty string if not provided - backend will handle validation)
    authService.startAuth(inviteCode.trim())
  }

  // Show loading while checking auth status
  if (authStatus === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-md w-full px-6 py-12">
          {/* Logo/Branding */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Chat2Deal
            </h1>
            <p className="text-lg text-gray-600">
              Capture WhatsApp conversations in Pipedrive
            </p>
          </div>

          {/* Sign In Form */}
          <div className="bg-white py-8 px-6 shadow-lg rounded-lg">
            <div className="space-y-6">
              <div>
                <label htmlFor="inviteCode" className="block text-sm font-medium text-gray-700 mb-2">
                  Invite Code (optional for returning users)
                </label>
                <input
                  type="text"
                  id="inviteCode"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  placeholder="Enter your invite code"
                  maxLength={100}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                {inviteCode.trim() ? (
                  <p className="mt-2 text-sm text-gray-600">
                    ✓ Invite code provided
                  </p>
                ) : (
                  <p className="mt-2 text-sm text-amber-600">
                    ⚠️ Chat2Deal is in closed beta. New users require an invite code. Returning users can sign in without one.
                  </p>
                )}
              </div>

              <Button
                onClick={handleSignIn}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Redirecting...' : 'Sign in with Pipedrive'}
              </Button>
            </div>
          </div>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an invite?{' '}
            <Link
              to="/waitlist"
              className="text-blue-600 hover:text-blue-700 font-medium underline"
            >
              Join the waitlist
            </Link>
            {' '}to get notified when we have space.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  )
}
