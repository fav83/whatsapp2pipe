/**
 * DevModeIndicator Component
 *
 * Shows a visual banner at the top when the extension is running in development mode.
 * Displays DEV badge and backend URL for debugging.
 * Only visible when VITE_ENV=development AND VITE_SHOW_DEV_INDICATOR=true.
 */

import { AUTH_CONFIG, config } from '../../config'

interface DevModeIndicatorProps {
  sentryTestExpanded?: boolean
  onToggleSentryTest?: () => void
}

export function DevModeIndicator({
  sentryTestExpanded: _sentryTestExpanded,
  onToggleSentryTest,
}: DevModeIndicatorProps) {
  const isDevelopment =
    import.meta.env.MODE === 'development' &&
    import.meta.env.VITE_ENV === 'development' &&
    config.env === 'development' &&
    config.showDevIndicator

  if (!isDevelopment) {
    return null
  }

  return (
    <div className="w-full py-2 px-4 bg-dev-background border-t-2 border-dev-border flex items-center justify-between gap-2 flex-shrink-0">
      <div className="flex items-center gap-2">
        <span className="px-2 py-0.5 text-[11px] font-bold text-dev-badge-text bg-dev-badge-background border border-dev-border rounded">
          DEV
        </span>
        <span className="text-[11px] text-dev-badge-text font-semibold">
          {AUTH_CONFIG.backendUrl}
        </span>
      </div>
      {onToggleSentryTest && (
        <button
          onClick={onToggleSentryTest}
          className="w-6 h-6 p-0 text-[11px] font-bold text-white bg-dev-button-background border border-dev-button-border rounded hover:bg-dev-button-border cursor-pointer flex items-center justify-center transition-colors"
          title="Toggle Sentry Test Panel"
        >
          S
        </button>
      )}
    </div>
  )
}
