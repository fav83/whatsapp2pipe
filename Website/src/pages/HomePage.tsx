import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { SignInButton } from '../components/auth/SignInButton'
import { Header } from '../components/layout/Header'
import { Footer } from '../components/layout/Footer'

export default function HomePage() {
  const { authStatus } = useAuth()
  const navigate = useNavigate()

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (authStatus === 'authenticated') {
      navigate('/dashboard')
    }
  }, [authStatus, navigate])

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
        <div className="max-w-md w-full px-6 py-12 text-center">
          {/* Logo/Branding */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Chat2Deal
            </h1>
            <p className="text-lg text-gray-600">
              Sync WhatsApp contacts with Pipedrive
            </p>
          </div>

          {/* Sign In Button */}
          <SignInButton />
        </div>
      </main>

      <Footer />
    </div>
  )
}
