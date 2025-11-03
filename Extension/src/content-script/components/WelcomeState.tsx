/**
 * WelcomeState Component
 *
 * Displays welcome message and sign-in functionality.
 * Shows sign-in button when user is not authenticated.
 * Shows simple message when user is authenticated but no chat selected.
 */

import { SignInButton } from './SignInButton'

interface WelcomeStateProps {
  onSignIn?: () => Promise<void>
  error?: string | null
}

export function WelcomeState({ onSignIn, error }: WelcomeStateProps = {}) {
  // Unauthenticated state - show sign-in
  if (onSignIn) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <div className="mb-6 max-w-xs">
          <h2 className="text-lg font-semibold text-text-primary mb-2">
            Welcome to Pipedrive for WhatsApp
          </h2>
          <p className="text-sm text-text-secondary mb-4">
            Sign in to automatically sync your WhatsApp contacts with Pipedrive
          </p>
        </div>

        <div className="w-full max-w-xs">
          <SignInButton onClick={onSignIn} error={error} />
        </div>
      </div>
    )
  }

  // Authenticated state - simple message
  return (
    <div className="px-5 pt-5">
      <p className="text-sm text-text-secondary">Select a chat to view contact information</p>
    </div>
  )
}
