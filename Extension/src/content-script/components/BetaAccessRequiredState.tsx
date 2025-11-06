/**
 * BetaAccessRequiredState Component
 *
 * Displays dedicated error state when new user is rejected during closed beta.
 * Shows explanation, instructions, and CTA to request beta access via website.
 *
 * Configuration: Set VITE_WEBSITE_URL in .env.local to customize the beta access URL.
 */

interface BetaAccessRequiredStateProps {
  onSignIn: () => Promise<void>
}

export function BetaAccessRequiredState({ onSignIn }: BetaAccessRequiredStateProps) {
  const WEBSITE_URL = import.meta.env.VITE_WEBSITE_URL || 'https://chat2deal.com'

  return (
    <div className="flex flex-col items-center justify-center h-full px-3 py-4 text-center">
      {/* Icon */}
      <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
        <svg
          className="w-8 h-8 text-amber-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
      </div>

      {/* Title */}
      <h2 className="text-xl font-semibold text-text-primary mb-2">Beta Access Required</h2>

      {/* Explanation */}
      <p className="text-sm text-text-secondary mb-4">
        Chat2Deal is currently in closed beta. Access is limited to invited users only.
      </p>

      {/* Instructions */}
      <div className="bg-background-tertiary border border-border-secondary rounded-md p-4 mb-4 text-left">
        <h3 className="text-sm font-semibold text-text-primary mb-2">How to get access:</h3>
        <ol className="text-sm text-text-secondary space-y-1 list-decimal list-inside">
          <li>Join our waitlist to request beta access</li>
          <li>We'll email you with an invite code</li>
          <li>Sign up on our website with your invite</li>
          <li>Return here and sign in</li>
        </ol>
      </div>

      {/* CTA Button */}
      <a
        href={`${WEBSITE_URL}/waitlist`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center px-4 py-3 bg-brand-primary text-white text-sm font-medium rounded-lg hover:bg-brand-hover transition-colors"
      >
        Join Waitlist
        <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
          />
        </svg>
      </a>

      {/* Additional help */}
      <p className="text-xs text-text-secondary mt-6">
        Already have an account?{' '}
        <button
          onClick={onSignIn}
          className="text-brand-primary hover:text-brand-hover font-medium"
        >
          Try signing in again
        </button>
      </p>
    </div>
  )
}
