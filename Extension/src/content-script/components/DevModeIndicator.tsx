/**
 * DevModeIndicator Component
 *
 * Shows a visual banner at the top when the extension is running in development mode.
 * Displays DEV badge and backend URL for debugging.
 * Only visible when VITE_ENV=development AND VITE_SHOW_DEV_INDICATOR=true.
 */

import { AUTH_CONFIG } from '../../config'

interface DevModeIndicatorProps {
  sentryTestExpanded?: boolean
  onToggleSentryTest?: () => void
}

export function DevModeIndicator({
  sentryTestExpanded: _sentryTestExpanded,
  onToggleSentryTest,
}: DevModeIndicatorProps) {
  // TEMPORARY OVERRIDE: Show in production for Sentry testing
  // TODO: REVERT THIS AFTER TESTING!
  // Normal check would be:
  // const isDevelopment =
  //   import.meta.env.MODE === 'development' &&
  //   import.meta.env.VITE_ENV === 'development' &&
  //   config.env === 'development' &&
  //   config.showDevIndicator
  //
  // if (!isDevelopment) {
  //   return null
  // }

  const bannerStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 16px',
    backgroundColor: '#fed7aa', // orange-200
    borderTop: '2px solid #fb923c', // orange-400
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between', // Space between left and right content
    gap: '8px',
    flexShrink: 0,
  }

  const leftContentStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  }

  const badgeStyle: React.CSSProperties = {
    padding: '2px 8px',
    fontSize: '11px',
    fontWeight: '700',
    color: '#7c2d12', // orange-900
    backgroundColor: '#ffedd5', // orange-100
    border: '1px solid #fb923c', // orange-400
    borderRadius: '4px',
  }

  const urlStyle: React.CSSProperties = {
    fontSize: '11px',
    color: '#7c2d12', // orange-900
    fontWeight: '600',
  }

  const sentryButtonStyle: React.CSSProperties = {
    width: '24px',
    height: '24px',
    padding: '0',
    fontSize: '11px',
    fontWeight: '700',
    color: '#fff', // white text
    backgroundColor: '#ea580c', // orange-600 (less contrast with orange-200 background)
    border: '1px solid #c2410c', // orange-700
    borderRadius: '4px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.2s',
  }

  const sentryButtonHoverStyle: React.CSSProperties = {
    backgroundColor: '#c2410c', // orange-700 (darker on hover)
  }

  return (
    <div style={bannerStyle}>
      <div style={leftContentStyle}>
        <span style={badgeStyle}>DEV</span>
        <span style={urlStyle}>{AUTH_CONFIG.backendUrl}</span>
      </div>
      {/* TEMPORARY: S button shown in production for testing */}
      {onToggleSentryTest && (
        <button
          onClick={onToggleSentryTest}
          style={sentryButtonStyle}
          onMouseEnter={(e) => {
            Object.assign(e.currentTarget.style, sentryButtonHoverStyle)
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = sentryButtonStyle.backgroundColor!
          }}
          title="Toggle Sentry Test Panel"
        >
          S
        </button>
      )}
    </div>
  )
}
