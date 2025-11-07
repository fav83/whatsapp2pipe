import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { authService } from '../services/authService'

export default function AuthCallbackPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [errorCode, setErrorCode] = useState<string | null>(null)

  useEffect(() => {
    // Extract verification_code from URL
    const verificationCode = searchParams.get('verification_code')
    const errorParam = searchParams.get('error')

    if (errorParam) {
      // OAuth error (user denied, etc.)
      setErrorCode(errorParam)
      setError(getErrorMessage(errorParam))
      return
    }

    if (!verificationCode) {
      setError('No verification code received')
      return
    }

    // Store verification_code and redirect to dashboard
    authService.handleCallback(verificationCode)
    navigate('/dashboard')
  }, [searchParams, navigate])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-light">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4 text-center">
          <div className="text-5xl mb-4">❌</div>
          <h2 className="text-2xl font-semibold text-red-600 mb-4">
            Authentication Failed
          </h2>
          <p className="text-slate-600 mb-6">{error}</p>

          {/* Show Join Waitlist button for beta access errors */}
          {(errorCode === 'closed_beta' || errorCode === 'invalid_invite') && (
            <Link
              to="/waitlist"
              className="inline-block mb-4 px-6 py-3 bg-button-primary text-white font-medium rounded-lg hover:bg-button-primary-hover active:bg-button-primary-active transition-colors w-full"
            >
              Join Waitlist
            </Link>
          )}

          <button
            onClick={() => navigate('/')}
            className="bg-gray-secondary hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-lg transition-colors w-full"
          >
            Return to Sign In
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-button-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-slate-700">
          Completing sign in...
        </h2>
      </div>
    </div>
  )
}

function getErrorMessage(error: string): string {
  switch (error) {
    case 'access_denied':
      return 'You denied access to the application.'
    case 'missing_code':
      return 'Authorization code is missing.'
    case 'missing_state':
      return 'State parameter is missing.'
    case 'invalid_state':
      return 'Invalid or expired authorization state.'
    case 'token_exchange_failed':
      return 'Failed to exchange authorization code for tokens.'
    case 'user_profile_fetch_failed':
      return 'Failed to fetch your user profile from Pipedrive.'
    case 'user_creation_failed':
      return 'Failed to create user record in database.'
    case 'config_error':
      return 'Server configuration error. Please contact support.'
    case 'internal_error':
      return 'An internal error occurred.'
    case 'closed_beta':
      return 'Chat2Deal is currently in closed beta. Access is limited to invited users only.'
    case 'invalid_invite':
      return 'Invalid invite code. Please check your invite and try again.'
    default:
      return 'An error occurred during authentication'
  }
}
