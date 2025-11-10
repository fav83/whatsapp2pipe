import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { authService } from '../services/authService'
import { Button } from '../components/ui/button'
import { Header } from '../components/layout/Header'
import { Footer } from '../components/layout/Footer'

export default function HomePage() {
  const { authStatus } = useAuth()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (authStatus === 'authenticated') {
      navigate('/dashboard')
    }
  }, [authStatus, navigate])

  const handleSignIn = () => {
    setIsLoading(true)
    authService.signIn()
  }

  // Show loading while checking auth status
  if (authStatus === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-button-primary/5">
        <div className="max-w-md w-full px-6 py-12">
          {/* Logo/Branding */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-normal text-slate-700 mb-2 font-display">
              chat2deal
            </h1>
            <p className="text-lg text-slate-600">
              Capture WhatsApp conversations in Pipedrive
            </p>
          </div>

          {/* Sign In Form */}
          <div className="bg-white py-8 px-6 shadow-lg rounded-lg">
            <div className="space-y-6">
              <p className="text-sm text-slate-600 mb-4">
                Connect your Pipedrive account to start capturing WhatsApp conversations.
              </p>

              <Button
                onClick={handleSignIn}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Redirecting...' : 'Sign in with Pipedrive'}
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
