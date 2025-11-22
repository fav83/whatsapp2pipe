import type { BrowserOptions } from '@sentry/browser'
import { BrowserClient, Scope, defaultStackParser, makeFetchTransport } from '@sentry/browser'
import { sanitizeEvent } from '../utils/sentryFilters'

// Create isolated Sentry client (does NOT pollute global state)
const sentryClient = new BrowserClient({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  enabled: import.meta.env.VITE_SENTRY_ENABLED === 'true',
  environment: import.meta.env.VITE_ENV || 'development',
  release: chrome.runtime.getManifest().version,

  // Critical: Disable all automatic integrations for shared environments
  integrations: [],

  // Manual error capture only
  transport: makeFetchTransport,
  stackParser: defaultStackParser,

  // PII filtering only (debug IDs handle source map matching)
  beforeSend: sanitizeEvent as BrowserOptions['beforeSend'],

  // No performance monitoring
  tracesSampleRate: 0,

  // 100% error sampling
  sampleRate: 1.0,
})

// Create isolated scope
const sentryScope = new Scope()
sentryScope.setClient(sentryClient)

// Initialize client
sentryClient.init()

// Set default tags
sentryScope.setTag('context', 'content-script')
sentryScope.setTag('extension_id', chrome.runtime.id)

// Export for use in errorLogger
export { sentryClient, sentryScope }
