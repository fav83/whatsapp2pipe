import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { authService } from '../services/authService'

export default function AuthCallbackPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Extract verification_code from URL
    const verificationCode = searchParams.get('verification_code')
    const errorParam = searchParams.get('error')

    if (errorParam) {
      // OAuth error (user denied, etc.)
      setError(getErrorMessage(errorParam))
      setTimeout(() => navigate('/'), 3000)
      return
    }

    if (!verificationCode) {
      setError('No verification code received')
      setTimeout(() => navigate('/'), 3000)
      return
    }

    // Store verification_code and redirect to dashboard
    authService.handleCallback(verificationCode)
    navigate('/dashboard')
  }, [searchParams, navigate])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-red-600 mb-2">
            Authentication Failed
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">
            Redirecting to home page...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900">
          Completing sign in...
        </h2>
      </div>
    </div>
  )
}

function getErrorMessage(error: string): string {
  switch (error) {
    case 'user_denied':
      return 'You cancelled the sign-in process'
    case 'invalid_state':
      return 'Invalid authentication state'
    case 'auth_failed':
      return 'Authentication failed. Please try again.'
    default:
      return 'An error occurred during authentication'
  }
}
