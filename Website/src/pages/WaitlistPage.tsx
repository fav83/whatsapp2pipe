import { useState, FormEvent } from 'react'
import { Header } from '../components/layout/Header'
import { Footer } from '../components/layout/Footer'
import { Button } from '../components/ui/button'
import { waitlistService } from '../services/waitlistService'

export default function WaitlistPage() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [emailError, setEmailError] = useState<string | null>(null)

  // Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  const validateEmail = (value: string): boolean => {
    if (!value.trim()) {
      setEmailError('Email is required')
      return false
    }
    if (!emailRegex.test(value)) {
      setEmailError('Please enter a valid email address')
      return false
    }
    setEmailError(null)
    return true
  }

  const handleEmailChange = (value: string) => {
    setEmail(value)
    if (value.trim()) {
      validateEmail(value)
    } else {
      setEmailError(null)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    // Validate email before submission
    if (!validateEmail(email)) {
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      await waitlistService.joinWaitlist(email.trim(), name.trim() || undefined)
      setIsSuccess(true)
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('An error occurred. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4">
        <div className="max-w-md w-full py-12">
          {!isSuccess ? (
            <>
              {/* Title */}
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Join the Waitlist
                </h1>
                <p className="text-base text-gray-600">
                  Chat2Deal is currently in closed beta. Sign up to be notified when we have space.
                </p>
              </div>

              {/* Form */}
              <div className="bg-white py-8 px-6 shadow-lg rounded-lg">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Email Field */}
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => handleEmailChange(e.target.value)}
                      onBlur={() => email.trim() && validateEmail(email)}
                      placeholder="your@email.com"
                      required
                      maxLength={255}
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        emailError
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                          : 'border-gray-300'
                      }`}
                    />
                    {emailError && (
                      <p className="mt-2 text-sm text-red-600">{emailError}</p>
                    )}
                  </div>

                  {/* Name Field */}
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Name (optional)
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      maxLength={255}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-3">
                      <p className="text-sm text-red-800">{error}</p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={!email.trim() || !!emailError || isSubmitting}
                    className="w-full"
                  >
                    {isSubmitting ? 'Joining...' : 'Join Waitlist'}
                  </Button>
                </form>
              </div>
            </>
          ) : (
            /* Success State */
            <div className="bg-white py-12 px-6 shadow-lg rounded-lg text-center">
              {/* Success Icon */}
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>

              {/* Success Message */}
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                You're on the waitlist!
              </h2>
              <p className="text-base text-gray-600">
                We'll email you when access is available.
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
