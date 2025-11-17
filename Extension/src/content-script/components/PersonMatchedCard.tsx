/**
 * PersonMatchedCard Component
 *
 * Displays matched person from Pipedrive with link to view in Pipedrive.
 * Shown when lookup finds a matching person.
 */

interface PersonMatchedCardProps {
  name: string
  phone: string
  pipedriveUrl: string
  personId: number
}

export function PersonMatchedCard({ name, phone, pipedriveUrl }: PersonMatchedCardProps) {
  return (
    <div className="px-3 pt-3">
      {/* Person Info Card - Name, Phone, Open in Pipedrive Button */}
      <div className="p-3 bg-white rounded-lg border border-border-secondary shadow-sm">
        <div className="text-base font-semibold text-text-primary mb-1">{name}</div>
        <div className="text-sm text-text-secondary mb-1">{phone}</div>

        {/* Open in Pipedrive Link */}
        <a
          href={pipedriveUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-brand-primary hover:text-brand-hover text-sm font-bold underline transition-colors"
        >
          <span>Open in Pipedrive</span>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </a>
      </div>
    </div>
  )
}
