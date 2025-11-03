import React from 'react'
import { logError } from '../../utils/errorLogger'
import { sentryScope } from '../sentry'
import { logBreadcrumb } from '../../utils/breadcrumbs'

interface ErrorBoundaryProps {
  children: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

/**
 * Error Boundary Component
 *
 * Catches unhandled React component errors and displays fallback UI
 * instead of crashing entire sidebar.
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state to render fallback UI
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Add breadcrumb for Sentry
    logBreadcrumb(
      'React component crashed',
      'react.error_boundary',
      { componentStack: errorInfo.componentStack?.slice(0, 500) }, // Truncate for brevity
      sentryScope
    )

    // Log error with structured format (dual logging: console + Sentry)
    logError(
      'React component error',
      error,
      {
        componentStack: errorInfo.componentStack,
        url: window.location.href,
      },
      sentryScope // Pass scope to logError
    )
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback onReset={() => window.location.reload()} />
    }
    return this.props.children
  }
}

interface ErrorFallbackProps {
  onReset: () => void
}

/**
 * Error Fallback UI Component
 *
 * Displays user-friendly error message when Error Boundary catches an error.
 */
function ErrorFallback({ onReset }: ErrorFallbackProps) {
  return (
    <div className="h-full flex flex-col items-center justify-center px-4 text-center">
      <div className="text-5xl mb-4">⚠️</div>
      <p className="text-text-secondary text-sm mb-4">
        Something went wrong with the Pipedrive sidebar
      </p>
      <button
        onClick={onReset}
        className="px-4 py-2 bg-brand-primary text-white text-sm font-medium rounded-lg hover:bg-brand-primary-hover transition-colors"
      >
        Reload Page
      </button>
    </div>
  )
}
