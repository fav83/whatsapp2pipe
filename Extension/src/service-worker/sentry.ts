import type { BrowserOptions } from '@sentry/browser'
import { BrowserClient, Scope, defaultStackParser, makeFetchTransport } from '@sentry/browser'
import { sanitizeEvent } from '../utils/sentryFilters'

// Service worker is isolated, but use same pattern for consistency
const sentryClient = new BrowserClient({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  enabled: import.meta.env.VITE_SENTRY_ENABLED === 'true',
  environment: import.meta.env.VITE_ENV || 'development',
  release: chrome.runtime.getManifest().version,

  integrations: [],
  transport: makeFetchTransport,
  stackParser: defaultStackParser,

  beforeSend: sanitizeEvent as BrowserOptions['beforeSend'],
  tracesSampleRate: 0,
  sampleRate: 1.0,
})

const sentryScope = new Scope()
sentryScope.setClient(sentryClient)
sentryClient.init()

sentryScope.setTag('context', 'service-worker')
sentryScope.setTag('extension_id', chrome.runtime.id)

export { sentryClient, sentryScope }
