/**
 * TEMPORARY TEST COMPONENT - Remove before production
 * Tests Sentry error tracking integration
 */

import { sentryClient, sentryScope } from '../sentry'
import { logError } from '../../utils/errorLogger'
import { logBreadcrumb } from '../../utils/breadcrumbs'

export function SentryTest() {
  if (import.meta.env.MODE !== 'development') {
    return null // Only show in development mode
  }

  const showSentryConfig = () => {
    const config = {
      DSN: import.meta.env.VITE_SENTRY_DSN,
      Enabled: import.meta.env.VITE_SENTRY_ENABLED,
      Environment: import.meta.env.VITE_ENV,
      Mode: import.meta.env.MODE,
    }
    console.log('[Sentry Config]', config)
    alert(JSON.stringify(config, null, 2))
  }

  const testReactError = () => {
    throw new Error('TEST: React component error')
  }

  const testLoggedError = () => {
    console.log('[Sentry Test] Calling logError with sentryScope...')
    const timestamp = new Date().toISOString()
    logError(
      'TEST: Manual error log',
      new Error(`Test error from logError at ${timestamp}`),
      { testData: 'sample context', timestamp },
      sentryScope
    )
    console.log('[Sentry Test] logError called')
    alert('Error logged! Check console and Sentry dashboard in ~30 seconds')
  }

  const testBreadcrumbs = () => {
    logBreadcrumb('TEST: User clicked button', 'ui.test', { buttonId: 'test-btn' }, sentryScope)
    logBreadcrumb('TEST: Data loaded', 'data.test', { recordCount: 42 }, sentryScope)

    // Then trigger an error to see breadcrumbs
    setTimeout(() => {
      logError(
        'TEST: Error with breadcrumbs',
        new Error('Error after breadcrumbs'),
        {},
        sentryScope
      )
      alert('Error with breadcrumbs logged! Check Sentry dashboard')
    }, 100)
  }

  const testNetworkError = () => {
    // This will trigger a network error in pipedriveApiService
    chrome.runtime.sendMessage(
      {
        type: 'PIPEDRIVE_REQUEST',
        action: 'lookupPerson',
        data: { phone: '+999999999999' }, // Invalid phone that will likely 404
      },
      (response) => {
        console.log('Response:', response)
        alert('API call made. Check console and Sentry for results.')
      }
    )
  }

  const testDirectSentry = () => {
    console.log('[Sentry Test] Testing direct Sentry capture...')
    const timestamp = new Date().toISOString()
    const testError = new Error(`Direct Sentry test error at ${timestamp}`)
    sentryClient.captureException(testError, {}, sentryScope)
    console.log('[Sentry Test] Sent exception directly to Sentry')
    alert('Direct exception sent! Check console for network requests to sentry.io')
  }

  return (
    <div className="p-4 bg-yellow-50 border-t border-yellow-200">
      <div className="text-xs font-bold text-yellow-800 mb-2">🧪 SENTRY TEST (DEV ONLY)</div>
      <div className="flex flex-col gap-2">
        <button
          onClick={showSentryConfig}
          className="px-3 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600"
        >
          Show Config
        </button>
        <button
          onClick={testDirectSentry}
          className="px-3 py-1 bg-orange-500 text-white text-xs rounded hover:bg-orange-600"
        >
          Test Direct Sentry
        </button>
        <button
          onClick={testLoggedError}
          className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
        >
          Test Logged Error
        </button>
        <button
          onClick={testBreadcrumbs}
          className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
        >
          Test Breadcrumbs
        </button>
        <button
          onClick={testReactError}
          className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
        >
          Test React Error (Crashes UI)
        </button>
        <button
          onClick={testNetworkError}
          className="px-3 py-1 bg-purple-500 text-white text-xs rounded hover:bg-purple-600"
        >
          Test API Error
        </button>
      </div>
    </div>
  )
}
