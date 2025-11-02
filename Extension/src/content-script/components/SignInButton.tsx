/**
 * SignInButton Component
 *
 * Renders "Sign in with Pipedrive" button with Pipedrive branding.
 * Handles loading and error states during OAuth flow.
 */

interface SignInButtonProps {
  onClick: () => Promise<void>
  error?: string | null
  isLoading?: boolean
}

export function SignInButton({ onClick, error, isLoading = false }: SignInButtonProps) {
  return (
    <div className="space-y-3">
      <button
        onClick={onClick}
        disabled={isLoading}
        className="w-full px-4 py-3 bg-[#00a884] text-white text-sm font-medium rounded-lg hover:bg-[#008f6f] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? 'Signing in...' : 'Sign in with Pipedrive'}
      </button>

      {error && (
        <div className="rounded-md bg-red-50 p-3">
          <p className="text-sm text-red-800">
            {error}{' '}
            <button onClick={onClick} className="underline hover:text-red-900 font-medium">
              Try again
            </button>
          </p>
        </div>
      )}
    </div>
  )
}
