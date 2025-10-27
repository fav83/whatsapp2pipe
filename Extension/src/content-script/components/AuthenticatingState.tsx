/**
 * AuthenticatingState Component
 *
 * Loading state displayed while OAuth flow is in progress.
 * Shows spinner and instructions for user.
 */

export function AuthenticatingState() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
      {/* Pipedrive-branded loading spinner */}
      <div className="w-12 h-12 border-4 border-[#1483EB] border-t-transparent rounded-full animate-spin mb-4" />

      <h2 className="text-lg font-semibold text-[#111b21] mb-2">Signing in...</h2>

      <p className="text-sm text-[#667781]">Please complete authorization in the popup window</p>
    </div>
  )
}
