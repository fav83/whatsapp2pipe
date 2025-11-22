/**
 * Global window type extensions
 */

import type * as SentryBrowser from '@sentry/browser'

declare global {
  interface Window {
    Sentry?: typeof SentryBrowser
  }
}

export {}
