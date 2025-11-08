/**
 * Feedback Submission Integration Tests
 *
 * Tests the complete flow from FeedbackModal → Service Worker → Backend
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FeedbackModal } from '../../src/content-script/components/FeedbackModal'
import type { FeedbackResponse } from '../../src/types/messages'

describe('Feedback Integration Tests', () => {
  const mockOnClose = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()

    // Mock chrome.runtime.sendMessage
    global.chrome = {
      ...global.chrome,
      runtime: {
        ...global.chrome.runtime,
        sendMessage: vi.fn(),
      },
    } as typeof chrome

    // Mock window.confirm
    global.confirm = vi.fn(() => true)
  })

  describe('Successful Submission Flow', () => {
    it('completes full submission flow successfully', async () => {
      const user = userEvent.setup({ delay: null })

      // Mock successful submission
      vi.mocked(chrome.runtime.sendMessage).mockImplementation((message, callback) => {
        expect(message).toEqual({
          type: 'FEEDBACK_SUBMIT',
          message: 'Great extension!',
        })

        const response: FeedbackResponse = { type: 'FEEDBACK_SUBMIT_SUCCESS' }
        if (callback) callback(response)
      })

      render(<FeedbackModal isOpen={true} onClose={mockOnClose} />)

      // User types feedback
      const textarea = screen.getByPlaceholderText("Tell us what's on your mind...")
      await user.type(textarea, 'Great extension!')

      // User submits
      const submitButton = screen.getByRole('button', { name: 'Submit' })
      await user.click(submitButton)

      // Should send message to service worker
      expect(chrome.runtime.sendMessage).toHaveBeenCalledWith(
        {
          type: 'FEEDBACK_SUBMIT',
          message: 'Great extension!',
        },
        expect.any(Function)
      )

      // Should show success state
      await waitFor(() => {
        expect(screen.getByText('Thank you!')).toBeInTheDocument()
      })

      expect(screen.getByText(/Your feedback has been received/i)).toBeInTheDocument()
    })

    it('handles multiple submissions in sequence', async () => {
      const user = userEvent.setup({ delay: null })

      // Mock successful submissions
      vi.mocked(chrome.runtime.sendMessage).mockImplementation((message, callback) => {
        const response: FeedbackResponse = { type: 'FEEDBACK_SUBMIT_SUCCESS' }
        if (callback) callback(response)
      })

      const { rerender } = render(<FeedbackModal isOpen={true} onClose={mockOnClose} />)

      // First submission
      const textarea = screen.getByPlaceholderText("Tell us what's on your mind...")
      await user.type(textarea, 'First feedback')
      await user.click(screen.getByRole('button', { name: 'Submit' }))

      await waitFor(() => {
        expect(screen.getByText('Thank you!')).toBeInTheDocument()
      })

      // Close and reopen
      await user.click(screen.getByRole('button', { name: 'Close' }))
      expect(mockOnClose).toHaveBeenCalled()

      rerender(<FeedbackModal isOpen={true} onClose={mockOnClose} />)

      // Second submission
      const textarea2 = screen.getByPlaceholderText("Tell us what's on your mind...")
      await user.type(textarea2, 'Second feedback')
      await user.click(screen.getByRole('button', { name: 'Submit' }))

      await waitFor(() => {
        expect(screen.getByText('Thank you!')).toBeInTheDocument()
      })

      // Should have been called twice
      expect(chrome.runtime.sendMessage).toHaveBeenCalledTimes(2)
    })
  })

  describe('Error Handling Flow', () => {
    it('handles authentication error (401)', async () => {
      const user = userEvent.setup({ delay: null })

      // Mock authentication error
      vi.mocked(chrome.runtime.sendMessage).mockImplementation((message, callback) => {
        const response: FeedbackResponse = {
          type: 'FEEDBACK_SUBMIT_ERROR',
          error: 'Authentication expired. Please sign in again.',
          statusCode: 401,
        }
        if (callback) callback(response)
      })

      render(<FeedbackModal isOpen={true} onClose={mockOnClose} />)

      const textarea = screen.getByPlaceholderText("Tell us what's on your mind...")
      await user.type(textarea, 'My feedback')
      await user.click(screen.getByRole('button', { name: 'Submit' }))

      await waitFor(() => {
        expect(
          screen.getByText('Authentication expired. Please sign in again.')
        ).toBeInTheDocument()
      })

      // Message should be preserved
      expect(textarea).toHaveValue('My feedback')
    })

    it('handles server error (500)', async () => {
      const user = userEvent.setup({ delay: null })

      // Mock server error
      vi.mocked(chrome.runtime.sendMessage).mockImplementation((message, callback) => {
        const response: FeedbackResponse = {
          type: 'FEEDBACK_SUBMIT_ERROR',
          error: 'Server error. Please try again later.',
          statusCode: 500,
        }
        if (callback) callback(response)
      })

      render(<FeedbackModal isOpen={true} onClose={mockOnClose} />)

      const textarea = screen.getByPlaceholderText("Tell us what's on your mind...")
      await user.type(textarea, 'My feedback')
      await user.click(screen.getByRole('button', { name: 'Submit' }))

      await waitFor(() => {
        expect(screen.getByText('Server error. Please try again later.')).toBeInTheDocument()
      })
    })

    it('handles network error', async () => {
      const user = userEvent.setup({ delay: null })

      // Mock network error
      vi.mocked(chrome.runtime.sendMessage).mockImplementation((message, callback) => {
        const response: FeedbackResponse = {
          type: 'FEEDBACK_SUBMIT_ERROR',
          error: 'Unable to connect. Check your internet connection.',
          statusCode: 0,
        }
        if (callback) callback(response)
      })

      render(<FeedbackModal isOpen={true} onClose={mockOnClose} />)

      const textarea = screen.getByPlaceholderText("Tell us what's on your mind...")
      await user.type(textarea, 'My feedback')
      await user.click(screen.getByRole('button', { name: 'Submit' }))

      await waitFor(() => {
        expect(
          screen.getByText('Unable to connect. Check your internet connection.')
        ).toBeInTheDocument()
      })
    })

    it('allows retry after error', async () => {
      const user = userEvent.setup({ delay: null })

      // First attempt fails, second succeeds
      let attemptCount = 0
      vi.mocked(chrome.runtime.sendMessage).mockImplementation((message, callback) => {
        attemptCount++
        if (attemptCount === 1) {
          const response: FeedbackResponse = {
            type: 'FEEDBACK_SUBMIT_ERROR',
            error: 'Server error. Please try again later.',
            statusCode: 500,
          }
          if (callback) callback(response)
        } else {
          const response: FeedbackResponse = { type: 'FEEDBACK_SUBMIT_SUCCESS' }
          if (callback) callback(response)
        }
      })

      render(<FeedbackModal isOpen={true} onClose={mockOnClose} />)

      const textarea = screen.getByPlaceholderText("Tell us what's on your mind...")
      await user.type(textarea, 'My feedback')
      await user.click(screen.getByRole('button', { name: 'Submit' }))

      // First attempt shows error
      await waitFor(() => {
        expect(screen.getByText('Server error. Please try again later.')).toBeInTheDocument()
      })

      // Dismiss error
      const dismissButton = screen.getByLabelText('Dismiss error')
      await user.click(dismissButton)

      // Retry
      const submitButton = screen.getByRole('button', { name: 'Submit' })
      await user.click(submitButton)

      // Second attempt succeeds
      await waitFor(() => {
        expect(screen.getByText('Thank you!')).toBeInTheDocument()
      })

      expect(chrome.runtime.sendMessage).toHaveBeenCalledTimes(2)
    })
  })

  describe('State Management', () => {
    it('manages loading state correctly', async () => {
      const user = userEvent.setup({ delay: null })

      let resolveCallback: ((response: FeedbackResponse) => void) | null = null
      vi.mocked(chrome.runtime.sendMessage).mockImplementation((message, callback) => {
        resolveCallback = callback as (response: FeedbackResponse) => void
      })

      render(<FeedbackModal isOpen={true} onClose={mockOnClose} />)

      const textarea = screen.getByPlaceholderText("Tell us what's on your mind...")
      const submitButton = screen.getByRole('button', { name: 'Submit' }) as HTMLButtonElement

      // Initially not loading
      expect(submitButton.disabled).toBe(true) // disabled due to empty message

      await user.type(textarea, 'My feedback')
      expect(submitButton.disabled).toBe(false)

      // Click submit
      await user.click(submitButton)

      // Should be loading
      expect(screen.getByLabelText('Loading')).toBeInTheDocument()
      expect(submitButton).toBeDisabled()
      expect(textarea).toBeDisabled()

      // Resolve
      if (resolveCallback) {
        resolveCallback({ type: 'FEEDBACK_SUBMIT_SUCCESS' })
      }

      // Should show success
      await waitFor(() => {
        expect(screen.getByText('Thank you!')).toBeInTheDocument()
      })
    })

    it('resets state when modal closes and reopens', async () => {
      const user = userEvent.setup({ delay: null })

      vi.mocked(chrome.runtime.sendMessage).mockImplementation((message, callback) => {
        const response: FeedbackResponse = { type: 'FEEDBACK_SUBMIT_SUCCESS' }
        if (callback) callback(response)
      })

      const { rerender } = render(<FeedbackModal isOpen={true} onClose={mockOnClose} />)

      // Submit feedback
      const textarea = screen.getByPlaceholderText("Tell us what's on your mind...")
      await user.type(textarea, 'Original feedback')
      await user.click(screen.getByRole('button', { name: 'Submit' }))

      await waitFor(() => {
        expect(screen.getByText('Thank you!')).toBeInTheDocument()
      })

      // Close
      await user.click(screen.getByRole('button', { name: 'Close' }))

      // Reopen
      rerender(<FeedbackModal isOpen={true} onClose={mockOnClose} />)

      // Should be reset to default state
      expect(screen.queryByText('Thank you!')).not.toBeInTheDocument()
      expect(screen.getByText('Send Feedback')).toBeInTheDocument()

      const newTextarea = screen.getByPlaceholderText("Tell us what's on your mind...")
      expect(newTextarea).toHaveValue('')
      expect(screen.getByText('0 / 5000')).toBeInTheDocument()
    })
  })

  describe('Message Content Validation', () => {
    it('trims whitespace from message before sending', async () => {
      const user = userEvent.setup({ delay: null })

      vi.mocked(chrome.runtime.sendMessage).mockImplementation((message, callback) => {
        // Verify message is trimmed
        expect(message).toEqual({
          type: 'FEEDBACK_SUBMIT',
          message: 'Trimmed feedback',
        })

        const response: FeedbackResponse = { type: 'FEEDBACK_SUBMIT_SUCCESS' }
        if (callback) callback(response)
      })

      render(<FeedbackModal isOpen={true} onClose={mockOnClose} />)

      const textarea = screen.getByPlaceholderText("Tell us what's on your mind...")
      await user.type(textarea, '  Trimmed feedback  ')
      await user.click(screen.getByRole('button', { name: 'Submit' }))

      await waitFor(() => {
        expect(screen.getByText('Thank you!')).toBeInTheDocument()
      })
    })

    it('does not submit whitespace-only message', async () => {
      const user = userEvent.setup({ delay: null })

      render(<FeedbackModal isOpen={true} onClose={mockOnClose} />)

      const textarea = screen.getByPlaceholderText("Tell us what's on your mind...")
      await user.type(textarea, '     ')

      const submitButton = screen.getByRole('button', { name: 'Submit' }) as HTMLButtonElement
      expect(submitButton.disabled).toBe(true)

      // Should not be able to click
      await user.click(submitButton)

      // Should not send message
      expect(chrome.runtime.sendMessage).not.toHaveBeenCalled()
    })

    it('handles long feedback messages', async () => {
      const user = userEvent.setup({ delay: null })

      const longMessage = 'a'.repeat(4000) // 4000 chars (under 5000 limit)

      vi.mocked(chrome.runtime.sendMessage).mockImplementation((message, callback) => {
        expect(message).toEqual({
          type: 'FEEDBACK_SUBMIT',
          message: longMessage,
        })

        const response: FeedbackResponse = { type: 'FEEDBACK_SUBMIT_SUCCESS' }
        if (callback) callback(response)
      })

      render(<FeedbackModal isOpen={true} onClose={mockOnClose} />)

      const textarea = screen.getByPlaceholderText("Tell us what's on your mind...")
      await user.type(textarea, longMessage)
      await user.click(screen.getByRole('button', { name: 'Submit' }))

      await waitFor(() => {
        expect(screen.getByText('Thank you!')).toBeInTheDocument()
      })
    })

    it('enforces character limit at 5000', async () => {
      const user = userEvent.setup({ delay: null })

      const maxMessage = 'a'.repeat(5000)
      const overLimitMessage = 'a'.repeat(6000)

      render(<FeedbackModal isOpen={true} onClose={mockOnClose} />)

      const textarea = screen.getByPlaceholderText("Tell us what's on your mind...")
      await user.type(textarea, overLimitMessage)

      // Should be capped at 5000
      expect(textarea).toHaveValue(maxMessage)
      expect(screen.getByText('5000 / 5000')).toBeInTheDocument()
    })
  })
})
