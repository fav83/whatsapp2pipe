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
      <div className="p-4 bg-background-secondary rounded-lg mb-3">
        <div className="text-base font-semibold text-text-primary">{name}</div>
      </div>

      {/* Warning message */}
      <div className="flex items-start gap-2 p-3 bg-warning-background border border-warning-border rounded-lg">
        <span className="text-warning-icon text-lg">⚠️</span>
        <div className="flex-1">
          <p className="text-sm text-text-primary font-medium mb-1">Phone number unavailable</p>
          <p className="text-xs text-text-secondary">{warning}</p>
        </div>
      </div>
    </div>
  )
}
