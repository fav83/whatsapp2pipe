/**
 * LoadingState Component
 *
 * Displays a centered loading spinner during async operations.
 * Uses WhatsApp green color for the spinner animation.
 */

export function LoadingState() {
  return (
    <div className="flex items-center justify-center h-40">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00a884]"></div>
    </div>
  )
}
