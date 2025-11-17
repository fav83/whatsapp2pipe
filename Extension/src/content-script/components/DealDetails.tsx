import React from 'react'
import type { Deal } from '@/types/deal'

interface DealDetailsProps {
  deal: Deal | undefined
}

export const DealDetails = React.memo(function DealDetails({ deal }: DealDetailsProps) {
  if (!deal) return null

  return (
    <div className="pt-3 space-y-2">
      {/* Value */}
      <div className="text-sm text-text-secondary">
        <span className="font-medium">Value:</span> {deal.value}
      </div>

      {/* Pipeline */}
      <div className="text-sm text-text-secondary">
        <span className="font-medium">Pipeline:</span> {deal.pipeline?.name || 'Unknown Pipeline'}
      </div>

      {/* Stage */}
      <div className="text-sm text-text-secondary">
        <span className="font-medium">Stage:</span> {deal.stage?.name || 'Unknown Stage'}
      </div>
    </div>
  )
})
