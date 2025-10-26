/**
 * Contact Warning Card Component
 *
 * Displays contact name with a warning when phone number extraction fails.
 * Used when we can identify the contact but cannot extract their phone number.
 */

interface ContactWarningCardProps {
  /** Contact display name */
  name: string
  /** Warning message to display */
  warning: string
}

/**
 * ContactWarningCard Component
 *
 * Shows contact name in a card with an amber warning message below.
 * This indicates we can see who the user is chatting with but cannot
 * extract their phone number for Pipedrive matching.
 */
export function ContactWarningCard({ name, warning }: ContactWarningCardProps) {
  return (
    <div className="mx-5 mt-5">
      {/* Contact name card */}
      <div className="p-4 bg-[#f0f2f5] rounded-lg mb-3">
        <div className="text-base font-semibold text-[#111b21]">{name}</div>
      </div>

      {/* Warning message */}
      <div className="flex items-start gap-2 p-3 bg-[#fff4e5] border border-[#ffcc00] rounded-lg">
        <span className="text-[#e9730c] text-lg">⚠️</span>
        <div className="flex-1">
          <p className="text-sm text-[#111b21] font-medium mb-1">Phone number unavailable</p>
          <p className="text-xs text-[#667781]">{warning}</p>
        </div>
      </div>
    </div>
  )
}
