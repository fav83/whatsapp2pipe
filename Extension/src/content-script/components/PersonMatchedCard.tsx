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
}

export function PersonMatchedCard({ name, phone, pipedriveUrl }: PersonMatchedCardProps) {
  return (
    <div className="mx-5 mt-5">
      {/* Person Info Card */}
      <div className="p-4 bg-white rounded-lg border border-[#d1d7db]">
        <div className="text-base font-semibold text-[#111b21] mb-1">{name}</div>
        <div className="text-sm text-[#667781] mb-4">{phone}</div>

        {/* Open in Pipedrive Link */}
        <a
          href={pipedriveUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#00a884] text-white text-sm font-medium rounded-lg hover:bg-[#008f6f] transition-colors"
        >
          <span>Open in Pipedrive</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
