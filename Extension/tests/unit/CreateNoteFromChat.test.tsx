/**
 * Tests for CreateNoteFromChat component
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CreateNoteFromChat } from '../../src/content-script/components/CreateNoteFromChat'
import * as usePipedriveModule from '../../src/content-script/hooks/usePipedrive'
import * as toastModule from '../../src/content-script/context/ToastContext'
import * as messageExtractor from '../../src/content-script/services/message-extractor'

// Mock dependencies
vi.mock('../../src/content-script/hooks/usePipedrive')
vi.mock('../../src/content-script/context/ToastContext')
vi.mock('../../src/content-script/services/message-extractor')

describe('CreateNoteFromChat', () => {
  const mockCreatePersonNote = vi.fn()
  const mockCreateDealNote = vi.fn()
  const mockShowToast = vi.fn()

  const defaultProps = {
    personId: 123,
    contactName: 'John Doe',
    userName: 'Me',
  }

  const mockMessages = [
    {
      id: '1',
      text: 'Hello, interested in the product',
      senderName: 'John Doe',
      timestamp: '14:30 11/01/2025',
      fromMe: false,
    },
    {
      id: '2',
      text: 'Sure, let me send you details',
      senderName: 'Me',
      timestamp: '14:32 11/01/2025',
      fromMe: true,
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()

    // Mock usePipedrive hook
    vi.spyOn(usePipedriveModule, 'usePipedrive').mockReturnValue({
      createPersonNote: mockCreatePersonNote,
      createDealNote: mockCreateDealNote,
      isCreatingNote: false,
      createNoteError: null,
      // Add other required hook properties as needed
    } as ReturnType<typeof usePipedriveModule.usePipedrive>)

    // Mock toast context
    vi.spyOn(toastModule, 'useToast').mockReturnValue({
      showToast: mockShowToast,
      toast: null,
      hideToast: vi.fn(),
    })

    // Mock message extraction
    vi.spyOn(messageExtractor, 'extractMessagesFromWhatsApp').mockResolvedValue(mockMessages)
  })

  describe('No Deal Selected (Regular Button)', () => {
    it('renders collapsed state initially', () => {
      render(<CreateNoteFromChat {...defaultProps} />)

      expect(screen.getByText('Create Note from Chat')).toBeInTheDocument()
      expect(screen.getByText('Select messages')).toBeInTheDocument()
    })

    it('shows regular "Create Note" button when no deal selected', async () => {
      const user = userEvent.setup()
      render(<CreateNoteFromChat {...defaultProps} />)

      // Expand section
      await user.click(screen.getByText('Select messages'))

      await waitFor(() => {
        expect(screen.getByText('Create Note')).toBeInTheDocument()
      })

      // Should NOT show dropdown chevron
      expect(screen.queryByRole('button', { name: /save to/i })).not.toBeInTheDocument()
    })

    it('calls createPersonNote when regular button clicked', async () => {
      const user = userEvent.setup()
      mockCreatePersonNote.mockResolvedValue(true)

      render(<CreateNoteFromChat {...defaultProps} />)

      // Expand and create note
      await user.click(screen.getByText('Select messages'))
      await waitFor(() => screen.getByText('Create Note'))
      await user.click(screen.getByText('Create Note'))

      await waitFor(() => {
        expect(mockCreatePersonNote).toHaveBeenCalledWith(
          123,
          expect.stringContaining('=== WhatsApp Conversation ===')
        )
      })
    })

    it('shows success toast and collapses after creating person note', async () => {
      const user = userEvent.setup()
      mockCreatePersonNote.mockResolvedValue(true)

      render(<CreateNoteFromChat {...defaultProps} />)

      await user.click(screen.getByText('Select messages'))
      await waitFor(() => screen.getByText('Create Note'))
      await user.click(screen.getByText('Create Note'))

      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith('Note created successfully')
        expect(screen.queryByText(/John Doe:/)).not.toBeInTheDocument() // Collapsed
      })
    })
  })

  describe('Deal Selected (Split Button)', () => {
    const propsWithDeal = {
      ...defaultProps,
      selectedDealId: 456,
      selectedDealTitle: 'Enterprise Deal',
    }

    it('shows split button with dropdown when deal selected', async () => {
      const user = userEvent.setup()
      render(<CreateNoteFromChat {...propsWithDeal} />)

      await user.click(screen.getByText('Select messages'))

      await waitFor(() => {
        const createNoteButton = screen.getByText('Create Note')
        expect(createNoteButton).toBeInTheDocument()
        // Dropdown chevron should be present
        expect(createNoteButton.parentElement?.querySelector('svg')).toBeInTheDocument()
      })
    })

    it('shows dropdown menu when split button clicked', async () => {
      const user = userEvent.setup()
      render(<CreateNoteFromChat {...propsWithDeal} />)

      await user.click(screen.getByText('Select messages'))
      await waitFor(() => screen.getByText('Create Note'))

      // Click the button to open dropdown
      await user.click(screen.getByText('Create Note'))

      await waitFor(() => {
        expect(screen.getByText('Save to Contact')).toBeInTheDocument()
        expect(screen.getByText('Save to Deal')).toBeInTheDocument()
      })
    })

    it('calls createPersonNote when "Save to Contact" clicked', async () => {
      const user = userEvent.setup()
      mockCreatePersonNote.mockResolvedValue(true)

      render(<CreateNoteFromChat {...propsWithDeal} />)

      await user.click(screen.getByText('Select messages'))
      await waitFor(() => screen.getByText('Create Note'))
      await user.click(screen.getByText('Create Note'))
      await waitFor(() => screen.getByText('Save to Contact'))
      await user.click(screen.getByText('Save to Contact'))

      await waitFor(() => {
        expect(mockCreatePersonNote).toHaveBeenCalledWith(
          123,
          expect.stringContaining('=== WhatsApp Conversation ===')
        )
        expect(mockCreateDealNote).not.toHaveBeenCalled()
      })
    })

    it('calls createDealNote when "Save to Deal" clicked', async () => {
      const user = userEvent.setup()
      mockCreateDealNote.mockResolvedValue(true)

      render(<CreateNoteFromChat {...propsWithDeal} />)

      await user.click(screen.getByText('Select messages'))
      await waitFor(() => screen.getByText('Create Note'))
      await user.click(screen.getByText('Create Note'))
      await waitFor(() => screen.getByText('Save to Deal'))
      await user.click(screen.getByText('Save to Deal'))

      await waitFor(() => {
        expect(mockCreateDealNote).toHaveBeenCalledWith(
          456,
          expect.stringContaining('=== WhatsApp Conversation ===')
        )
        expect(mockCreatePersonNote).not.toHaveBeenCalled()
      })
    })

    it('closes dropdown after selecting destination', async () => {
      const user = userEvent.setup()
      mockCreateDealNote.mockResolvedValue(true)

      render(<CreateNoteFromChat {...propsWithDeal} />)

      await user.click(screen.getByText('Select messages'))
      await waitFor(() => screen.getByText('Create Note'))
      await user.click(screen.getByText('Create Note'))
      await waitFor(() => screen.getByText('Save to Deal'))
      await user.click(screen.getByText('Save to Deal'))

      await waitFor(() => {
        expect(screen.queryByText('Save to Contact')).not.toBeInTheDocument()
      })
    })
  })

  describe('Message Selection', () => {
    it('pre-selects all messages when expanded', async () => {
      const user = userEvent.setup()
      render(<CreateNoteFromChat {...defaultProps} />)

      await user.click(screen.getByText('Select messages'))

      await waitFor(() => {
        const checkboxes = screen.getAllByRole('checkbox')
        expect(checkboxes).toHaveLength(2)
        checkboxes.forEach((checkbox) => {
          expect(checkbox).toBeChecked()
        })
      })
    })

    it('allows deselecting messages', async () => {
      const user = userEvent.setup()
      render(<CreateNoteFromChat {...defaultProps} />)

      await user.click(screen.getByText('Select messages'))
      await waitFor(() => screen.getAllByRole('checkbox'))

      const firstCheckbox = screen.getAllByRole('checkbox')[0]
      await user.click(firstCheckbox)

      expect(firstCheckbox).not.toBeChecked()
    })

    it('disables Create Note button when no messages selected', async () => {
      const user = userEvent.setup()
      render(<CreateNoteFromChat {...defaultProps} />)

      await user.click(screen.getByText('Select messages'))
      await waitFor(() => screen.getByText('None'))

      // Deselect all
      await user.click(screen.getByText('None'))

      const createButton = screen.getByText('Create Note')
      expect(createButton).toBeDisabled()
    })
  })

  describe('Error Handling', () => {
    it('shows error message when note creation fails', async () => {
      const user = userEvent.setup()
      mockCreatePersonNote.mockResolvedValue(false)

      vi.spyOn(usePipedriveModule, 'usePipedrive').mockReturnValue({
        createPersonNote: mockCreatePersonNote,
        createDealNote: mockCreateDealNote,
        isCreatingNote: false,
        createNoteError: 'Failed to create note',
      } as ReturnType<typeof usePipedriveModule.usePipedrive>)

      render(<CreateNoteFromChat {...defaultProps} />)

      await user.click(screen.getByText('Select messages'))
      await waitFor(() => screen.getByText('Create Note'))
      await user.click(screen.getByText('Create Note'))

      await waitFor(() => {
        expect(screen.getByText('Failed to create note')).toBeInTheDocument()
      })
    })

    it('shows extraction error when no messages found', async () => {
      const user = userEvent.setup()
      vi.spyOn(messageExtractor, 'extractMessagesFromWhatsApp').mockResolvedValue([])

      render(<CreateNoteFromChat {...defaultProps} />)

      await user.click(screen.getByText('Select messages'))

      await waitFor(() => {
        expect(screen.getByText('No messages available to select.')).toBeInTheDocument()
      })
    })
  })

  describe('Loading State', () => {
    it('shows loading spinner while creating note', async () => {
      const user = userEvent.setup()
      mockCreatePersonNote.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(true), 100))
      )

      vi.spyOn(usePipedriveModule, 'usePipedrive').mockReturnValue({
        createPersonNote: mockCreatePersonNote,
        createDealNote: mockCreateDealNote,
        isCreatingNote: true,
        createNoteError: null,
      } as ReturnType<typeof usePipedriveModule.usePipedrive>)

      render(<CreateNoteFromChat {...defaultProps} />)

      await user.click(screen.getByText('Select messages'))
      await waitFor(() => screen.getByText('Creating...'))

      expect(screen.getByText('Creating...')).toBeInTheDocument()
    })
  })
})
