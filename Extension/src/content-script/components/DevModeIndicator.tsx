/**
 * DevModeIndicator Component
 *
 * Shows a visual banner at the top when the extension is running in development mode.
 * Displays DEV badge and backend URL for debugging.
 * Only visible when VITE_ENV=development AND VITE_SHOW_DEV_INDICATOR=true.
 */

import { config, AUTH_CONFIG } from '../../config'

export function DevModeIndicator() {
  // Only show if in development mode AND indicator is enabled
  if (config.env !== 'development' || !config.showDevIndicator) {
    return null
  }

  const bannerStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 16px',
    backgroundColor: '#fed7aa', // orange-200
    borderBottom: '2px solid #fb923c', // orange-400
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start', // Left-aligned
    gap: '8px',
    flexShrink: 0,
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

  return (
    <div style={bannerStyle}>
      <span style={badgeStyle}>DEV</span>
      <span style={urlStyle}>{AUTH_CONFIG.backendUrl}</span>
    </div>
  )
}
