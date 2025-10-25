/**
 * WelcomeState Component
 *
 * Displays a welcome message when no chat is selected in WhatsApp.
 * This is the default idle state of the sidebar.
 */

export function WelcomeState() {
  return (
    <div className="px-5 pt-5">
      <p className="text-sm text-[#667781]">
        Select a chat to view contact information
      </p>
    </div>
  )
}
