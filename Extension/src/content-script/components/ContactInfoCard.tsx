/**
 * ContactInfoCard Component
 *
 * Displays WhatsApp contact name and phone number in a styled card.
 * Shown when a 1:1 chat is selected in WhatsApp.
 */

interface ContactInfoCardProps {
  name: string
  phone: string
}

export function ContactInfoCard({ name, phone }: ContactInfoCardProps) {
  return (
    <div className="mx-3 mt-3 p-3 bg-background-secondary rounded-lg">
      <div className="text-base font-semibold text-text-primary mb-1">{name}</div>
      <div className="text-sm text-text-secondary">{phone}</div>
    </div>
  )
}
