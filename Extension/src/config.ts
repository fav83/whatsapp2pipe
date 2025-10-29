// Environment configuration
export const config = {
  pipedriveApiUrl: import.meta.env.VITE_PIPEDRIVE_API_URL,
  pipedriveClientId: import.meta.env.VITE_PIPEDRIVE_CLIENT_ID,
  oauthRedirectUrl: import.meta.env.VITE_OAUTH_REDIRECT_URL,
  sentryDsn: import.meta.env.VITE_SENTRY_DSN,
  sentryEnabled: import.meta.env.VITE_SENTRY_ENABLED === 'true',
  env: import.meta.env.VITE_ENV as 'development' | 'production',
  showDevIndicator: import.meta.env.VITE_SHOW_DEV_INDICATOR === 'true',
}

// Backend OAuth Service configuration
export const AUTH_CONFIG = {
  backendUrl: import.meta.env.VITE_BACKEND_URL || 'http://localhost:7071',
  endpoints: {
    authStart: '/api/auth/start', // Now accepts ?state= parameter with extension ID
    authCallback: '/api/auth/callback',
  },
  // OAuth state includes:
  // - extensionId: chrome.runtime.id (dynamically determined at runtime)
  // - nonce: CSRF protection (crypto.randomUUID())
  // - timestamp: Request timestamp (Date.now())
  // This enables the backend to support any extension ID without hardcoding
}
