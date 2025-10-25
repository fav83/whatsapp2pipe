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
    <div className="mx-5 mt-5 p-4 bg-[#f0f2f5] rounded-lg">
      <div className="text-base font-semibold text-[#111b21] mb-1">
        {name}
      </div>
      <div className="text-sm text-[#667781]">
        {phone}
      </div>
    </div>
  )
}
