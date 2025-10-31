/**
 * ErrorBoundary Component Unit Tests
 *
 * Tests error boundary behavior, fallback UI rendering,
 * and error logging.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ErrorBoundary } from '../../src/content-script/components/ErrorBoundary'

// Component that throws an error
const ThrowError = ({ shouldThrow = true }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error')
  }
  return <div>No error</div>
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Normal rendering', () => {
    it('renders children when no error', () => {
      render(
        <ErrorBoundary>
          <div>Test Content</div>
        </ErrorBoundary>
      )
      expect(screen.getByText('Test Content')).toBeInTheDocument()
    })

    it('renders multiple children when no error', () => {
      render(
        <ErrorBoundary>
          <div>First Child</div>
          <div>Second Child</div>
        </ErrorBoundary>
      )
      expect(screen.getByText('First Child')).toBeInTheDocument()
      expect(screen.getByText('Second Child')).toBeInTheDocument()
    })
  })

  describe('Error catching', () => {
    it('renders fallback UI when error thrown', () => {
      // Suppress console.error for this test
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      )

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /reload page/i })).toBeInTheDocument()

      consoleError.mockRestore()
    })

    it('does not render children after error', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

      render(
        <ErrorBoundary>
          <div>Should not be visible</div>
          <ThrowError />
        </ErrorBoundary>
      )

      expect(screen.queryByText('Should not be visible')).not.toBeInTheDocument()

      consoleError.mockRestore()
    })
  })

  describe('Fallback UI', () => {
    it('displays warning icon', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      )

      expect(screen.getByText('⚠️')).toBeInTheDocument()

      consoleError.mockRestore()
    })

    it('displays error message', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      )

      expect(
        screen.getByText('Something went wrong with the Pipedrive sidebar')
      ).toBeInTheDocument()

      consoleError.mockRestore()
    })

    it('displays reload button', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      )

      const button = screen.getByRole('button', { name: /reload page/i })
      expect(button).toBeInTheDocument()
      expect(button).toHaveTextContent('Reload Page')

      consoleError.mockRestore()
    })

    it('applies correct styling to fallback UI', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      )

      const container = screen
        .getByText('Something went wrong with the Pipedrive sidebar')
        .closest('div')
      expect(container).toHaveClass('h-full', 'flex', 'flex-col', 'items-center', 'justify-center')

      const button = screen.getByRole('button', { name: /reload page/i })
      expect(button).toHaveClass('bg-[#00a884]', 'text-white')

      consoleError.mockRestore()
    })
  })

  describe('Reload functionality', () => {
    it('calls window.location.reload on button click', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
      const reloadMock = vi.fn()

      // Mock window.location.reload
      Object.defineProperty(window, 'location', {
        value: { reload: reloadMock },
        writable: true,
      })

      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      )

      const button = screen.getByRole('button', { name: /reload page/i })
      fireEvent.click(button)

      expect(reloadMock).toHaveBeenCalled()

      consoleError.mockRestore()
    })
  })

  describe('Error logging', () => {
    it('logs error with structured format', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      )

      // Verify structured logging format
      expect(consoleError).toHaveBeenCalledWith(
        expect.stringContaining('[chat2deal-pipe]'),
        expect.any(String),
        expect.objectContaining({
          componentStack: expect.any(String),
          url: expect.any(String),
        })
      )

      consoleError.mockRestore()
    })

    it('includes component stack in error log', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      )

      const calls = consoleError.mock.calls[0]
      const context = calls[2] as Record<string, unknown>
      expect(context.componentStack).toBeTruthy()
      expect(typeof context.componentStack).toBe('string')

      consoleError.mockRestore()
    })

    it('includes URL in error log', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      )

      const calls = consoleError.mock.calls[0]
      const context = calls[2] as Record<string, unknown>
      expect(context.url).toBe(window.location.href)

      consoleError.mockRestore()
    })

    it('logs with correct context message', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      )

      expect(consoleError).toHaveBeenCalledWith(
        expect.stringContaining('React component error'),
        expect.any(String),
        expect.any(Object)
      )

      consoleError.mockRestore()
    })
  })

  describe('Edge cases', () => {
    it('handles error with custom message', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

      const ThrowCustomError = () => {
        throw new Error('Custom error message')
      }

      render(
        <ErrorBoundary>
          <ThrowCustomError />
        </ErrorBoundary>
      )

      // Should still show generic fallback UI
      expect(
        screen.getByText('Something went wrong with the Pipedrive sidebar')
      ).toBeInTheDocument()

      // But log should contain actual error message
      expect(consoleError).toHaveBeenCalledWith(
        expect.stringContaining('Custom error message'),
        expect.any(String),
        expect.any(Object)
      )

      consoleError.mockRestore()
    })

    it('handles non-Error thrown values', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

      const ThrowString = () => {
        throw 'String error'
      }

      render(
        <ErrorBoundary>
          <ThrowString />
        </ErrorBoundary>
      )

      expect(
        screen.getByText('Something went wrong with the Pipedrive sidebar')
      ).toBeInTheDocument()

      consoleError.mockRestore()
    })
  })
})
