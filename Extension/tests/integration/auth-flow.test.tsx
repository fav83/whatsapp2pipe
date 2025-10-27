/**
 * Authentication Flow Integration Tests
 *
 * Tests complete authentication flow from UI to storage,
 * including App component integration with auth state.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../../src/content-script/App'
import { authService } from '../../src/content-script/services/authService'

// Mock authService
vi.mock('../../src/content-script/services/authService', () => ({
  authService: {
    isAuthenticated: vi.fn(),
    getVerificationCode: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(),
  },
}))

describe('Authentication Flow Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Unauthenticated User Journey', () => {
    it('shows sign-in UI when user is not authenticated', async () => {
      vi.mocked(authService.isAuthenticated).mockResolvedValue(false)

      render(<App />)

      await waitFor(() => {
        expect(screen.getByText('Welcome to Pipedrive for WhatsApp')).toBeInTheDocument()
        expect(screen.getByText('Sign in with Pipedrive')).toBeInTheDocument()
      })
    })

    it('shows authenticating state when sign-in button is clicked', async () => {
      vi.mocked(authService.isAuthenticated).mockResolvedValue(false)
      vi.mocked(authService.signIn).mockImplementation(
        () => new Promise(() => {}) // Never resolves to keep in authenticating state
      )

      const user = userEvent.setup()
      render(<App />)

      await waitFor(() => {
        expect(screen.getByText('Sign in with Pipedrive')).toBeInTheDocument()
      })

      const signInButton = screen.getByText('Sign in with Pipedrive')
      await user.click(signInButton)

      await waitFor(() => {
        expect(screen.getByText('Signing in...')).toBeInTheDocument()
        expect(
          screen.getByText('Please complete authorization in the popup window')
        ).toBeInTheDocument()
      })
    })

    it('completes sign-in flow successfully', async () => {
      vi.mocked(authService.isAuthenticated).mockResolvedValue(false)
      vi.mocked(authService.signIn).mockResolvedValue('test_verification_code')

      const user = userEvent.setup()
      render(<App />)

      await waitFor(() => {
        expect(screen.getByText('Sign in with Pipedrive')).toBeInTheDocument()
      })

      const signInButton = screen.getByText('Sign in with Pipedrive')
      await user.click(signInButton)

      await waitFor(() => {
        expect(authService.signIn).toHaveBeenCalled()
      })

      // After successful sign-in, should show authenticated content (welcome message)
      await waitFor(() => {
        expect(screen.getByText('Select a chat to view contact information')).toBeInTheDocument()
      })
    })

    it('shows error message when sign-in fails', async () => {
      vi.mocked(authService.isAuthenticated).mockResolvedValue(false)
      vi.mocked(authService.signIn).mockRejectedValue(
        new Error('You cancelled the sign-in process')
      )

      const user = userEvent.setup()
      render(<App />)

      await waitFor(() => {
        expect(screen.getByText('Sign in with Pipedrive')).toBeInTheDocument()
      })

      const signInButton = screen.getByText('Sign in with Pipedrive')
      await user.click(signInButton)

      await waitFor(() => {
        expect(screen.getByText(/You cancelled the sign-in process/)).toBeInTheDocument()
        expect(screen.getByText('Try again')).toBeInTheDocument()
      })
    })

    it('allows retry after failed sign-in', async () => {
      vi.mocked(authService.isAuthenticated).mockResolvedValue(false)
      vi.mocked(authService.signIn)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce('success_code')

      const user = userEvent.setup()
      render(<App />)

      await waitFor(() => {
        expect(screen.getByText('Sign in with Pipedrive')).toBeInTheDocument()
      })

      // First attempt fails
      const signInButton = screen.getByText('Sign in with Pipedrive')
      await user.click(signInButton)

      await waitFor(() => {
        expect(screen.getByText(/Network error/)).toBeInTheDocument()
      })

      // Click retry
      const retryButton = screen.getByText('Try again')
      await user.click(retryButton)

      // Second attempt succeeds
      await waitFor(() => {
        expect(screen.getByText('Select a chat to view contact information')).toBeInTheDocument()
      })
    })
  })

  describe('Authenticated User Journey', () => {
    it('shows authenticated content when user has verification_code', async () => {
      vi.mocked(authService.isAuthenticated).mockResolvedValue(true)
      vi.mocked(authService.getVerificationCode).mockResolvedValue('existing_code')

      render(<App />)

      await waitFor(() => {
        expect(screen.getByText('Select a chat to view contact information')).toBeInTheDocument()
      })

      // Should not show sign-in UI
      expect(screen.queryByText('Sign in with Pipedrive')).not.toBeInTheDocument()
    })
  })

  describe('UI Components Integration', () => {
    it('renders SignInButton with correct props', async () => {
      vi.mocked(authService.isAuthenticated).mockResolvedValue(false)

      render(<App />)

      await waitFor(() => {
        const button = screen.getByText('Sign in with Pipedrive')
        expect(button).toBeInTheDocument()
        expect(button).toHaveClass('bg-[#1483EB]') // Pipedrive blue
        expect(button).not.toBeDisabled()
      })
    })

    it('disables sign-in button while authenticating', async () => {
      vi.mocked(authService.isAuthenticated).mockResolvedValue(false)
      vi.mocked(authService.signIn).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      )

      const user = userEvent.setup()
      render(<App />)

      await waitFor(() => {
        expect(screen.getByText('Sign in with Pipedrive')).toBeInTheDocument()
      })

      const signInButton = screen.getByText('Sign in with Pipedrive')
      await user.click(signInButton)

      await waitFor(() => {
        expect(screen.getByText('Signing in...')).toBeInTheDocument()
      })
    })

    it('shows AuthenticatingState with spinner', async () => {
      vi.mocked(authService.isAuthenticated).mockResolvedValue(false)
      vi.mocked(authService.signIn).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      )

      const user = userEvent.setup()
      render(<App />)

      await waitFor(() => {
        expect(screen.getByText('Sign in with Pipedrive')).toBeInTheDocument()
      })

      const signInButton = screen.getByText('Sign in with Pipedrive')
      await user.click(signInButton)

      await waitFor(() => {
        const spinner = document.querySelector('.animate-spin')
        expect(spinner).toBeInTheDocument()
        expect(spinner).toHaveClass('border-[#1483EB]') // Pipedrive blue
      })
    })
  })

  describe('State Transitions', () => {
    it('transitions correctly: unauthenticated -> authenticating -> authenticated', async () => {
      vi.mocked(authService.isAuthenticated).mockResolvedValue(false)
      // Add delay to signIn so we can catch the authenticating state
      vi.mocked(authService.signIn).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve('test_code'), 100))
      )

      const user = userEvent.setup()
      render(<App />)

      // 1. Unauthenticated
      await waitFor(() => {
        expect(screen.getByText('Sign in with Pipedrive')).toBeInTheDocument()
      })

      // 2. Authenticating
      const signInButton = screen.getByText('Sign in with Pipedrive')
      await user.click(signInButton)

      await waitFor(() => {
        expect(screen.getByText('Signing in...')).toBeInTheDocument()
      })

      // 3. Authenticated
      await waitFor(() => {
        expect(screen.getByText('Select a chat to view contact information')).toBeInTheDocument()
      })
    })

    it('transitions correctly: unauthenticated -> authenticating -> error', async () => {
      vi.mocked(authService.isAuthenticated).mockResolvedValue(false)
      // Add delay to signIn so we can catch the authenticating state
      vi.mocked(authService.signIn).mockImplementation(
        () => new Promise((_, reject) => setTimeout(() => reject(new Error('Auth failed')), 100))
      )

      const user = userEvent.setup()
      render(<App />)

      // 1. Unauthenticated
      await waitFor(() => {
        expect(screen.getByText('Sign in with Pipedrive')).toBeInTheDocument()
      })

      // 2. Authenticating
      const signInButton = screen.getByText('Sign in with Pipedrive')
      await user.click(signInButton)

      await waitFor(() => {
        expect(screen.getByText('Signing in...')).toBeInTheDocument()
      })

      // 3. Error
      await waitFor(() => {
        expect(screen.getByText(/Auth failed/)).toBeInTheDocument()
        expect(screen.getByText('Try again')).toBeInTheDocument()
      })
    })
  })
})
