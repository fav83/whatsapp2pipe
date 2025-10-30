/**
 * PersonLookupLoading Component
 *
 * Loading state shown while looking up person in Pipedrive.
 * Displays contact name and phone immediately, with skeleton placeholders.
 */

interface PersonLookupLoadingProps {
  contactName: string
  phone: string
}

export function PersonLookupLoading({ contactName, phone }: PersonLookupLoadingProps) {
  return (
    <div className="mx-5 mt-5">
      {/* Contact Info - Visible Immediately */}
      <div className="mb-4">
        <div className="text-base font-semibold text-[#111b21] mb-1">{contactName}</div>
        <div className="text-sm text-[#667781]">{phone}</div>
      </div>

      {/* Skeleton Placeholders with Shimmer Animation */}
      <div className="space-y-3 animate-pulse">
        {/* Skeleton line 1 - wider */}
        <div className="h-4 bg-[#f0f2f5] rounded w-3/4"></div>
        {/* Skeleton line 2 - medium */}
        <div className="h-4 bg-[#f0f2f5] rounded w-1/2"></div>
        {/* Skeleton line 3 - narrow */}
        <div className="h-4 bg-[#f0f2f5] rounded w-2/3"></div>
      </div>
    </div>
  )
}
