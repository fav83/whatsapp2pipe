// Environment configuration
export const config = {
  pipedriveApiUrl: import.meta.env.VITE_PIPEDRIVE_API_URL,
  pipedriveClientId: import.meta.env.VITE_PIPEDRIVE_CLIENT_ID,
  oauthRedirectUrl: import.meta.env.VITE_OAUTH_REDIRECT_URL,
  sentryDsn: import.meta.env.VITE_SENTRY_DSN,
  sentryEnabled: import.meta.env.VITE_SENTRY_ENABLED === 'true',
  env: import.meta.env.VITE_ENV as 'development' | 'production',
}
