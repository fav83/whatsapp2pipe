import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FeedbackModal } from '../../src/content-script/components/FeedbackModal'
import type { FeedbackResponse } from '../../src/types/messages'

describe('FeedbackModal', () => {
  const mockOnClose = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()

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

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })

  describe('Rendering', () => {
    it('does not render when isOpen is false', () => {
      render(<FeedbackModal isOpen={false} onClose={mockOnClose} />)
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('renders when isOpen is true', () => {
      render(<FeedbackModal isOpen={true} onClose={mockOnClose} />)
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('displays modal title', () => {
      render(<FeedbackModal isOpen={true} onClose={mockOnClose} />)
      expect(screen.getByText('Send Feedback')).toBeInTheDocument()
    })

    it('displays instructional text', () => {
      render(<FeedbackModal isOpen={true} onClose={mockOnClose} />)
      expect(screen.getByText(/Share your thoughts with us!/i)).toBeInTheDocument()
    })

    it('displays textarea with placeholder', () => {
      render(<FeedbackModal isOpen={true} onClose={mockOnClose} />)
      const textarea = screen.getByPlaceholderText("Tell us what's on your mind...")
      expect(textarea).toBeInTheDocument()
    })

    it('displays character counter', () => {
      render(<FeedbackModal isOpen={true} onClose={mockOnClose} />)
      expect(screen.getByText('0 / 5000')).toBeInTheDocument()
    })

    it('displays Cancel button', () => {
      render(<FeedbackModal isOpen={true} onClose={mockOnClose} />)
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
    })

    it('displays Submit button', () => {
      render(<FeedbackModal isOpen={true} onClose={mockOnClose} />)
      expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument()
    })

    it('displays close X button', () => {
      render(<FeedbackModal isOpen={true} onClose={mockOnClose} />)
      const closeButton = screen.getByLabelText('Close feedback modal')
      expect(closeButton).toBeInTheDocument()
    })

    it('has backdrop', () => {
      const { container } = render(<FeedbackModal isOpen={true} onClose={mockOnClose} />)
      const backdrop = container.querySelector('.bg-black.bg-opacity-50')
      expect(backdrop).toBeInTheDocument()
    })

    it('has correct modal width (544px)', () => {
      const { container } = render(<FeedbackModal isOpen={true} onClose={mockOnClose} />)
      const modal = container.querySelector('.w-\\[544px\\]')
      expect(modal).toBeInTheDocument()
    })

    it('has ARIA attributes', () => {
      render(<FeedbackModal isOpen={true} onClose={mockOnClose} />)
      const dialog = screen.getByRole('dialog')
      expect(dialog.getAttribute('aria-modal')).toBe('true')
      expect(dialog.getAttribute('aria-labelledby')).toBe('feedback-modal-title')
    })
  })

  describe('User Input', () => {
    it('allows typing in textarea', async () => {
      const user = userEvent.setup({ delay: null })
      render(<FeedbackModal isOpen={true} onClose={mockOnClose} />)

      const textarea = screen.getByPlaceholderText("Tell us what's on your mind...")
      await user.type(textarea, 'This is my feedback')

      expect(textarea).toHaveValue('This is my feedback')
    })

    it('updates character counter as user types', async () => {
      const user = userEvent.setup({ delay: null })
      render(<FeedbackModal isOpen={true} onClose={mockOnClose} />)

      const textarea = screen.getByPlaceholderText("Tell us what's on your mind...")
      await user.type(textarea, 'Hello')

      expect(screen.getByText('5 / 5000')).toBeInTheDocument()
    })

    it('enforces character limit of 5000', async () => {
      const user = userEvent.setup({ delay: null })
      render(<FeedbackModal isOpen={true} onClose={mockOnClose} />)

      const textarea = screen.getByPlaceholderText("Tell us what's on your mind...")
      const longText = 'a'.repeat(6000)
      await user.type(textarea, longText)

      expect(textarea).toHaveValue('a'.repeat(5000))
      expect(screen.getByText('5000 / 5000')).toBeInTheDocument()
    })

    it('Submit button disabled when message is empty', () => {
      render(<FeedbackModal isOpen={true} onClose={mockOnClose} />)
      const submitButton = screen.getByRole('button', { name: 'Submit' }) as HTMLButtonElement
      expect(submitButton.disabled).toBe(true)
    })

    it('Submit button disabled when message is only whitespace', async () => {
      const user = userEvent.setup({ delay: null })
      render(<FeedbackModal isOpen={true} onClose={mockOnClose} />)

      const textarea = screen.getByPlaceholderText("Tell us what's on your mind...")
      await user.type(textarea, '   ')

      const submitButton = screen.getByRole('button', { name: 'Submit' }) as HTMLButtonElement
      expect(submitButton.disabled).toBe(true)
    })

    it('Submit button enabled when message has content', async () => {
      const user = userEvent.setup({ delay: null })
      render(<FeedbackModal isOpen={true} onClose={mockOnClose} />)

      const textarea = screen.getByPlaceholderText("Tell us what's on your mind...")
      await user.type(textarea, 'Feedback message')

      const submitButton = screen.getByRole('button', { name: 'Submit' }) as HTMLButtonElement
      expect(submitButton.disabled).toBe(false)
    })
  })

  describe('Submission', () => {
    it('sends FEEDBACK_SUBMIT message with message content', async () => {
      const user = userEvent.setup({ delay: null })
      vi.mocked(chrome.runtime.sendMessage).mockImplementation((message, callback) => {
        const response: FeedbackResponse = { type: 'FEEDBACK_SUBMIT_SUCCESS' }
        if (callback) callback(response)
      })

      render(<FeedbackModal isOpen={true} onClose={mockOnClose} />)

      const textarea = screen.getByPlaceholderText("Tell us what's on your mind...")
      await user.type(textarea, 'My feedback')

      const submitButton = screen.getByRole('button', { name: 'Submit' })
      await user.click(submitButton)

      expect(chrome.runtime.sendMessage).toHaveBeenCalledWith(
        {
          type: 'FEEDBACK_SUBMIT',
          message: 'My feedback',
        },
        expect.any(Function)
      )
    })

    it('trims message before submitting', async () => {
      const user = userEvent.setup({ delay: null })
      vi.mocked(chrome.runtime.sendMessage).mockImplementation((message, callback) => {
        const response: FeedbackResponse = { type: 'FEEDBACK_SUBMIT_SUCCESS' }
        if (callback) callback(response)
      })

      render(<FeedbackModal isOpen={true} onClose={mockOnClose} />)

      const textarea = screen.getByPlaceholderText("Tell us what's on your mind...")
      await user.type(textarea, '  My feedback  ')

      const submitButton = screen.getByRole('button', { name: 'Submit' })
      await user.click(submitButton)

      expect(chrome.runtime.sendMessage).toHaveBeenCalledWith(
        {
          type: 'FEEDBACK_SUBMIT',
          message: 'My feedback',
        },
        expect.any(Function)
      )
    })

    it('shows submitting state during submission', async () => {
      const user = userEvent.setup({ delay: null })
      let resolveCallback: ((response: FeedbackResponse) => void) | null = null
      vi.mocked(chrome.runtime.sendMessage).mockImplementation((message, callback) => {
        resolveCallback = callback as (response: FeedbackResponse) => void
      })

      render(<FeedbackModal isOpen={true} onClose={mockOnClose} />)

      const textarea = screen.getByPlaceholderText("Tell us what's on your mind...")
      await user.type(textarea, 'My feedback')

      const submitButton = screen.getByRole('button', { name: 'Submit' })
      await user.click(submitButton)

      // Should show spinner during submission
      expect(screen.getByLabelText('Loading')).toBeInTheDocument()

      // Resolve the submission
      if (resolveCallback) {
        resolveCallback({ type: 'FEEDBACK_SUBMIT_SUCCESS' })
      }
    })

    it('disables form controls during submission', async () => {
      const user = userEvent.setup({ delay: null })
      let resolveCallback: ((response: FeedbackResponse) => void) | null = null
      vi.mocked(chrome.runtime.sendMessage).mockImplementation((message, callback) => {
        resolveCallback = callback as (response: FeedbackResponse) => void
      })

      render(<FeedbackModal isOpen={true} onClose={mockOnClose} />)

      const textarea = screen.getByPlaceholderText("Tell us what's on your mind...")
      await user.type(textarea, 'My feedback')

      const submitButton = screen.getByRole('button', { name: 'Submit' }) as HTMLButtonElement
      const cancelButton = screen.getByRole('button', { name: 'Cancel' }) as HTMLButtonElement
      const closeButton = screen.getByLabelText('Close feedback modal') as HTMLButtonElement

      await user.click(submitButton)

      expect(textarea).toBeDisabled()
      expect(submitButton).toBeDisabled()
      expect(cancelButton).toBeDisabled()
      expect(closeButton).toBeDisabled()

      // Resolve the submission
      if (resolveCallback) {
        resolveCallback({ type: 'FEEDBACK_SUBMIT_SUCCESS' })
      }
    })
  })

  describe('Success State', () => {
    it('shows success state after successful submission', async () => {
      const user = userEvent.setup({ delay: null })
      vi.mocked(chrome.runtime.sendMessage).mockImplementation((message, callback) => {
        const response: FeedbackResponse = { type: 'FEEDBACK_SUBMIT_SUCCESS' }
        if (callback) callback(response)
      })

      render(<FeedbackModal isOpen={true} onClose={mockOnClose} />)

      const textarea = screen.getByPlaceholderText("Tell us what's on your mind...")
      await user.type(textarea, 'My feedback')

      const submitButton = screen.getByRole('button', { name: 'Submit' })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Thank you!')).toBeInTheDocument()
      })
    })

    it('displays success message', async () => {
      const user = userEvent.setup({ delay: null })
      vi.mocked(chrome.runtime.sendMessage).mockImplementation((message, callback) => {
        const response: FeedbackResponse = { type: 'FEEDBACK_SUBMIT_SUCCESS' }
        if (callback) callback(response)
      })

      render(<FeedbackModal isOpen={true} onClose={mockOnClose} />)

      const textarea = screen.getByPlaceholderText("Tell us what's on your mind...")
      await user.type(textarea, 'My feedback')

      const submitButton = screen.getByRole('button', { name: 'Submit' })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/Your feedback has been received/i)).toBeInTheDocument()
      })
    })

    it('shows Close button in success state', async () => {
      const user = userEvent.setup({ delay: null })
      vi.mocked(chrome.runtime.sendMessage).mockImplementation((message, callback) => {
        const response: FeedbackResponse = { type: 'FEEDBACK_SUBMIT_SUCCESS' }
        if (callback) callback(response)
      })

      render(<FeedbackModal isOpen={true} onClose={mockOnClose} />)

      const textarea = screen.getByPlaceholderText("Tell us what's on your mind...")
      await user.type(textarea, 'My feedback')

      const submitButton = screen.getByRole('button', { name: 'Submit' })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument()
      })
    })

    it('calls onClose when Close button clicked in success state', async () => {
      const user = userEvent.setup({ delay: null })
      vi.mocked(chrome.runtime.sendMessage).mockImplementation((message, callback) => {
        const response: FeedbackResponse = { type: 'FEEDBACK_SUBMIT_SUCCESS' }
        if (callback) callback(response)
      })

      render(<FeedbackModal isOpen={true} onClose={mockOnClose} />)

      const textarea = screen.getByPlaceholderText("Tell us what's on your mind...")
      await user.type(textarea, 'My feedback')

      const submitButton = screen.getByRole('button', { name: 'Submit' })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument()
      })

      const closeButton = screen.getByRole('button', { name: 'Close' })
      await user.click(closeButton)

      expect(mockOnClose).toHaveBeenCalledOnce()
    })

    it('resets state when closing after success', async () => {
      const user = userEvent.setup({ delay: null })
      vi.mocked(chrome.runtime.sendMessage).mockImplementation((message, callback) => {
        const response: FeedbackResponse = { type: 'FEEDBACK_SUBMIT_SUCCESS' }
        if (callback) callback(response)
      })

      const { rerender } = render(<FeedbackModal isOpen={true} onClose={mockOnClose} />)

      const textarea = screen.getByPlaceholderText("Tell us what's on your mind...")
      await user.type(textarea, 'My feedback')

      const submitButton = screen.getByRole('button', { name: 'Submit' })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument()
      })

      const closeButton = screen.getByRole('button', { name: 'Close' })
      await user.click(closeButton)

      // Reopen modal
      rerender(<FeedbackModal isOpen={true} onClose={mockOnClose} />)

      // Should be back to default state
      expect(screen.queryByText('Thank you!')).not.toBeInTheDocument()
      expect(screen.getByText('Send Feedback')).toBeInTheDocument()
      expect(screen.getByPlaceholderText("Tell us what's on your mind...")).toHaveValue('')
    })
  })

  describe('Error State', () => {
    it('shows error state after failed submission', async () => {
      const user = userEvent.setup({ delay: null })
      vi.mocked(chrome.runtime.sendMessage).mockImplementation((message, callback) => {
        const response: FeedbackResponse = {
          type: 'FEEDBACK_SUBMIT_ERROR',
          error: 'Network error',
        }
        if (callback) callback(response)
      })

      render(<FeedbackModal isOpen={true} onClose={mockOnClose} />)

      const textarea = screen.getByPlaceholderText("Tell us what's on your mind...")
      await user.type(textarea, 'My feedback')

      const submitButton = screen.getByRole('button', { name: 'Submit' })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument()
      })
    })

    it('displays error banner with red styling', async () => {
      const user = userEvent.setup({ delay: null })
      vi.mocked(chrome.runtime.sendMessage).mockImplementation((message, callback) => {
        const response: FeedbackResponse = {
          type: 'FEEDBACK_SUBMIT_ERROR',
          error: 'Server error',
        }
        if (callback) callback(response)
      })

      const { container } = render(<FeedbackModal isOpen={true} onClose={mockOnClose} />)

      const textarea = screen.getByPlaceholderText("Tell us what's on your mind...")
      await user.type(textarea, 'My feedback')

      const submitButton = screen.getByRole('button', { name: 'Submit' })
      await user.click(submitButton)

      await waitFor(() => {
        const errorBanner = container.querySelector('.bg-red-50')
        expect(errorBanner).toBeInTheDocument()
      })
    })

    it('can dismiss error message', async () => {
      const user = userEvent.setup({ delay: null })
      vi.mocked(chrome.runtime.sendMessage).mockImplementation((message, callback) => {
        const response: FeedbackResponse = {
          type: 'FEEDBACK_SUBMIT_ERROR',
          error: 'Test error',
        }
        if (callback) callback(response)
      })

      render(<FeedbackModal isOpen={true} onClose={mockOnClose} />)

      const textarea = screen.getByPlaceholderText("Tell us what's on your mind...")
      await user.type(textarea, 'My feedback')

      const submitButton = screen.getByRole('button', { name: 'Submit' })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Test error')).toBeInTheDocument()
      })

      const dismissButton = screen.getByLabelText('Dismiss error')
      await user.click(dismissButton)

      expect(screen.queryByText('Test error')).not.toBeInTheDocument()
    })

    it('returns to default state after dismissing error', async () => {
      const user = userEvent.setup({ delay: null })
      vi.mocked(chrome.runtime.sendMessage).mockImplementation((message, callback) => {
        const response: FeedbackResponse = {
          type: 'FEEDBACK_SUBMIT_ERROR',
          error: 'Test error',
        }
        if (callback) callback(response)
      })

      render(<FeedbackModal isOpen={true} onClose={mockOnClose} />)

      const textarea = screen.getByPlaceholderText("Tell us what's on your mind...")
      await user.type(textarea, 'My feedback')

      const submitButton = screen.getByRole('button', { name: 'Submit' })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Test error')).toBeInTheDocument()
      })

      const dismissButton = screen.getByLabelText('Dismiss error')
      await user.click(dismissButton)

      // Should be able to resubmit
      const newSubmitButton = screen.getByRole('button', { name: 'Submit' }) as HTMLButtonElement
      expect(newSubmitButton.disabled).toBe(false)
    })

    it('preserves message content after error', async () => {
      const user = userEvent.setup({ delay: null })
      vi.mocked(chrome.runtime.sendMessage).mockImplementation((message, callback) => {
        const response: FeedbackResponse = {
          type: 'FEEDBACK_SUBMIT_ERROR',
          error: 'Test error',
        }
        if (callback) callback(response)
      })

      render(<FeedbackModal isOpen={true} onClose={mockOnClose} />)

      const textarea = screen.getByPlaceholderText("Tell us what's on your mind...")
      await user.type(textarea, 'My important feedback')

      const submitButton = screen.getByRole('button', { name: 'Submit' })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Test error')).toBeInTheDocument()
      })

      // Message should still be there
      expect(textarea).toHaveValue('My important feedback')
    })
  })

  describe('Closing Modal', () => {
    it('calls onClose when Cancel button clicked with empty message', async () => {
      const user = userEvent.setup({ delay: null })
      render(<FeedbackModal isOpen={true} onClose={mockOnClose} />)

      const cancelButton = screen.getByRole('button', { name: 'Cancel' })
      await user.click(cancelButton)

      expect(mockOnClose).toHaveBeenCalledOnce()
    })

    it('calls onClose when X button clicked with empty message', async () => {
      const user = userEvent.setup({ delay: null })
      render(<FeedbackModal isOpen={true} onClose={mockOnClose} />)

      const closeButton = screen.getByLabelText('Close feedback modal')
      await user.click(closeButton)

      expect(mockOnClose).toHaveBeenCalledOnce()
    })

    it('shows confirmation when closing with message content', async () => {
      const user = userEvent.setup({ delay: null })
      render(<FeedbackModal isOpen={true} onClose={mockOnClose} />)

      const textarea = screen.getByPlaceholderText("Tell us what's on your mind...")
      await user.type(textarea, 'Some feedback')

      const cancelButton = screen.getByRole('button', { name: 'Cancel' })
      await user.click(cancelButton)

      expect(global.confirm).toHaveBeenCalledWith('Discard your feedback?')
    })

    it('does not close if user cancels confirmation', async () => {
      const user = userEvent.setup({ delay: null })
      vi.mocked(global.confirm).mockReturnValue(false)

      render(<FeedbackModal isOpen={true} onClose={mockOnClose} />)

      const textarea = screen.getByPlaceholderText("Tell us what's on your mind...")
      await user.type(textarea, 'Some feedback')

      const cancelButton = screen.getByRole('button', { name: 'Cancel' })
      await user.click(cancelButton)

      expect(mockOnClose).not.toHaveBeenCalled()
    })

    it('closes if user confirms discard', async () => {
      const user = userEvent.setup({ delay: null })
      vi.mocked(global.confirm).mockReturnValue(true)

      render(<FeedbackModal isOpen={true} onClose={mockOnClose} />)

      const textarea = screen.getByPlaceholderText("Tell us what's on your mind...")
      await user.type(textarea, 'Some feedback')

      const cancelButton = screen.getByRole('button', { name: 'Cancel' })
      await user.click(cancelButton)

      expect(mockOnClose).toHaveBeenCalledOnce()
    })

    it('does not show confirmation for whitespace-only message', async () => {
      const user = userEvent.setup({ delay: null })
      render(<FeedbackModal isOpen={true} onClose={mockOnClose} />)

      const textarea = screen.getByPlaceholderText("Tell us what's on your mind...")
      await user.type(textarea, '   ')

      const cancelButton = screen.getByRole('button', { name: 'Cancel' })
      await user.click(cancelButton)

      expect(global.confirm).not.toHaveBeenCalled()
      expect(mockOnClose).toHaveBeenCalledOnce()
    })
  })

  describe('Keyboard Navigation', () => {
    it('closes modal on Escape key with empty message', async () => {
      const user = userEvent.setup({ delay: null })
      render(<FeedbackModal isOpen={true} onClose={mockOnClose} />)

      await user.keyboard('{Escape}')

      expect(mockOnClose).toHaveBeenCalledOnce()
    })

    it('shows confirmation on Escape key with message content', async () => {
      const user = userEvent.setup({ delay: null })
      render(<FeedbackModal isOpen={true} onClose={mockOnClose} />)

      const textarea = screen.getByPlaceholderText("Tell us what's on your mind...")
      await user.type(textarea, 'Some feedback')

      await user.keyboard('{Escape}')

      expect(global.confirm).toHaveBeenCalledWith('Discard your feedback?')
    })
  })
})
