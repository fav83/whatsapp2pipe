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
    <div className="p-3 space-y-3">
      {/* Contact Info Card - Visible Immediately */}
      <div className="p-3 bg-white rounded-lg border border-border-secondary shadow-sm">
        <div className="text-base font-semibold text-text-primary mb-1">{contactName}</div>
        <div className="text-sm text-text-secondary">{phone}</div>
      </div>

      {/* Skeleton Placeholders with Shimmer Animation */}
      <div className="space-y-3 animate-pulse">
        {/* Skeleton line 1 - wider */}
        <div className="h-4 bg-background-secondary rounded w-3/4"></div>
        {/* Skeleton line 2 - medium */}
        <div className="h-4 bg-background-secondary rounded w-1/2"></div>
        {/* Skeleton line 3 - narrow */}
        <div className="h-4 bg-background-secondary rounded w-2/3"></div>
      </div>
    </div>
  )
}
