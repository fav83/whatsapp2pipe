import type { Breadcrumb, Scope } from '@sentry/browser'

/**
 * Log a breadcrumb for user action tracking
 * Only records if Sentry is enabled
 */
export function logBreadcrumb(
  message: string,
  category: string,
  data?: Record<string, unknown>,
  scope?: Scope
): void {
  if (!scope || import.meta.env.VITE_SENTRY_ENABLED !== 'true') {
    return
  }

  const breadcrumb: Breadcrumb = {
    message,
    category,
    level: 'info',
    timestamp: Date.now() / 1000,
    data: data || {},
  }

  scope.addBreadcrumb(breadcrumb)
}
