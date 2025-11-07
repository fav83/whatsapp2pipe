// Environment configuration
export const config = {
  sentryDsn: import.meta.env.VITE_SENTRY_DSN,
  sentryEnabled: import.meta.env.VITE_SENTRY_ENABLED === 'true',
  env: import.meta.env.VITE_ENV as 'development' | 'production',
  showDevIndicator: import.meta.env.VITE_SHOW_DEV_INDICATOR === 'true',
  websiteUrl: import.meta.env.VITE_WEBSITE_URL,
}

// Backend OAuth Service configuration
export const AUTH_CONFIG = {
  backendUrl: import.meta.env.VITE_BACKEND_URL,
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
