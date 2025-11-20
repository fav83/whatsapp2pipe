/**
 * Unit tests for DealDetails component - Won/Lost Actions
 * Tests the mark deal as won/lost flow with validation, error handling, and UI states
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { DealDetails } from '@/content-script/components/DealDetails'
import type { Deal, Pipeline, Stage } from '@/types/deal'

// Mock hooks
vi.mock('@/content-script/hooks/usePipedrive', () => ({
  usePipedrive: vi.fn(),
}))

vi.mock('@/content-script/context/ToastContext', () => ({
  useToast: vi.fn(() => ({
    showToast: vi.fn(),
  })),
}))

vi.mock('@/utils/errorLogger', () => ({
  logError: vi.fn(),
}))

import { usePipedrive } from '@/content-script/hooks/usePipedrive'
import { useToast } from '@/content-script/context/ToastContext'

const mockPipelines: Pipeline[] = [
  { id: 1, name: 'Sales', orderNr: 0, active: true },
  { id: 2, name: 'Partner', orderNr: 1, active: true },
]

const mockStages: Stage[] = [
  { id: 1, name: 'Qualified', orderNr: 0, pipelineId: 1 },
  { id: 2, name: 'Contact Made', orderNr: 1, pipelineId: 1 },
  { id: 3, name: 'Discovery', orderNr: 0, pipelineId: 2 },
]

const mockOpenDeal: Deal = {
  id: 123,
  title: 'Test Deal',
  value: '$50,000.00',
  status: 'open',
  stage: { id: 1, name: 'Qualified', order: 0 },
  pipeline: { id: 1, name: 'Sales' },
  updateTime: '2025-01-20 10:00:00',
}

const mockWonDeal: Deal = {
  ...mockOpenDeal,
  id: 456,
  status: 'won',
}

const mockLostDeal: Deal = {
  ...mockOpenDeal,
  id: 789,
  status: 'lost',
  lostReason: 'Customer chose competitor',
}

const defaultProps = {
  deal: mockOpenDeal,
  pipelines: mockPipelines,
  stages: mockStages,
  onDealUpdated: vi.fn(),
}

describe('DealDetails - Won/Lost Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(usePipedrive).mockReturnValue({
      updateDeal: vi.fn(),
      markDealWonLost: vi.fn(),
    } as ReturnType<typeof usePipedrive>)
    vi.mocked(useToast).mockReturnValue({
      showToast: vi.fn(),
    })
  })

  describe('Initial Rendering', () => {
    it('shows Won and Lost buttons for open deals', () => {
      render(<DealDetails {...defaultProps} />)

      expect(screen.getByRole('button', { name: /won/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /lost/i })).toBeInTheDocument()
    })

    it('does not show Won/Lost buttons for won deals', () => {
      render(<DealDetails {...defaultProps} deal={mockWonDeal} />)

      expect(screen.queryByRole('button', { name: /won/i })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /lost/i })).not.toBeInTheDocument()
    })

    it('does not show Won/Lost buttons for lost deals', () => {
      render(<DealDetails {...defaultProps} deal={mockLostDeal} />)

      expect(screen.queryByRole('button', { name: /won/i })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /lost/i })).not.toBeInTheDocument()
    })

    it('shows status and lost reason for lost deals', () => {
      render(<DealDetails {...defaultProps} deal={mockLostDeal} />)

      expect(screen.getByText(/✗ lost/i)).toBeInTheDocument()
      expect(screen.getByText('Customer chose competitor')).toBeInTheDocument()
    })

    it('shows won status for won deals', () => {
      render(<DealDetails {...defaultProps} deal={mockWonDeal} />)

      expect(screen.getByText(/won/i)).toBeInTheDocument()
    })
  })

  describe('Won Flow', () => {
    it('shows confirmation UI when Won button is clicked', () => {
      render(<DealDetails {...defaultProps} />)

      const wonButton = screen.getByRole('button', { name: /won/i })
      fireEvent.click(wonButton)

      expect(screen.getByText(/mark this deal as won/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /confirm/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
    })

    it('hides Won/Lost buttons when in confirmation UI', () => {
      render(<DealDetails {...defaultProps} />)

      const wonButton = screen.getByRole('button', { name: /won/i })
      fireEvent.click(wonButton)

      // Original buttons should be hidden
      expect(screen.queryByRole('button', { name: /✓ won/i })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /✗ lost/i })).not.toBeInTheDocument()
    })

    it('calls markDealWonLost with correct parameters on Won confirm', async () => {
      const mockMarkDealWonLost = vi.fn().mockResolvedValue({
        ...mockOpenDeal,
        status: 'won',
      })
      vi.mocked(usePipedrive).mockReturnValue({
        updateDeal: vi.fn(),
        markDealWonLost: mockMarkDealWonLost,
      } as ReturnType<typeof usePipedrive>)

      render(<DealDetails {...defaultProps} />)

      // Click Won button
      const wonButton = screen.getByRole('button', { name: /won/i })
      fireEvent.click(wonButton)

      // Click Confirm in confirmation UI
      const confirmButton = screen.getByRole('button', { name: /confirm/i })
      fireEvent.click(confirmButton)

      await waitFor(() => {
        expect(mockMarkDealWonLost).toHaveBeenCalledWith(123, 'won')
      })
    })

    it('shows loading state when marking as won', async () => {
      const mockMarkDealWonLost = vi.fn(() => new Promise(() => {})) // Never resolves
      vi.mocked(usePipedrive).mockReturnValue({
        updateDeal: vi.fn(),
        markDealWonLost: mockMarkDealWonLost,
      } as ReturnType<typeof usePipedrive>)

      render(<DealDetails {...defaultProps} />)

      const wonButton = screen.getByRole('button', { name: /won/i })
      fireEvent.click(wonButton)

      const confirmButton = screen.getByRole('button', { name: /confirm/i })
      fireEvent.click(confirmButton)

      await waitFor(() => {
        expect(screen.getByText(/saving/i)).toBeInTheDocument()
        expect(confirmButton).toBeDisabled()
      })
    })

    it('calls onDealUpdated and shows toast on successful won', async () => {
      const mockMarkDealWonLost = vi.fn().mockResolvedValue({
        ...mockOpenDeal,
        status: 'won',
      })
      const mockShowToast = vi.fn()
      const mockOnDealUpdated = vi.fn()

      vi.mocked(usePipedrive).mockReturnValue({
        updateDeal: vi.fn(),
        markDealWonLost: mockMarkDealWonLost,
      } as ReturnType<typeof usePipedrive>)

      vi.mocked(useToast).mockReturnValue({
        showToast: mockShowToast,
      })

      render(<DealDetails {...defaultProps} onDealUpdated={mockOnDealUpdated} />)

      const wonButton = screen.getByRole('button', { name: /won/i })
      fireEvent.click(wonButton)

      const confirmButton = screen.getByRole('button', { name: /confirm/i })
      fireEvent.click(confirmButton)

      await waitFor(() => {
        expect(mockOnDealUpdated).toHaveBeenCalledWith({
          ...mockOpenDeal,
          status: 'won',
        })
        expect(mockShowToast).toHaveBeenCalledWith('Deal marked as won')
      })
    })

    it('shows error banner on API failure when marking won', async () => {
      const mockMarkDealWonLost = vi.fn().mockRejectedValue(new Error('Network error'))
      vi.mocked(usePipedrive).mockReturnValue({
        updateDeal: vi.fn(),
        markDealWonLost: mockMarkDealWonLost,
      } as ReturnType<typeof usePipedrive>)

      render(<DealDetails {...defaultProps} />)

      const wonButton = screen.getByRole('button', { name: /won/i })
      fireEvent.click(wonButton)

      const confirmButton = screen.getByRole('button', { name: /confirm/i })
      fireEvent.click(confirmButton)

      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument()
      })
    })

    it('error banner can be dismissed in won flow', async () => {
      const mockMarkDealWonLost = vi.fn().mockRejectedValue(new Error('Network error'))
      vi.mocked(usePipedrive).mockReturnValue({
        updateDeal: vi.fn(),
        markDealWonLost: mockMarkDealWonLost,
      } as ReturnType<typeof usePipedrive>)

      render(<DealDetails {...defaultProps} />)

      const wonButton = screen.getByRole('button', { name: /won/i })
      fireEvent.click(wonButton)

      const confirmButton = screen.getByRole('button', { name: /confirm/i })
      fireEvent.click(confirmButton)

      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument()
      })

      const dismissButton = screen.getByLabelText(/dismiss error/i)
      fireEvent.click(dismissButton)

      expect(screen.queryByText(/network error/i)).not.toBeInTheDocument()
    })

    it('resets state when Cancel is clicked in won confirmation', () => {
      render(<DealDetails {...defaultProps} />)

      const wonButton = screen.getByRole('button', { name: /won/i })
      fireEvent.click(wonButton)

      expect(screen.getByText(/mark this deal as won/i)).toBeInTheDocument()

      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      fireEvent.click(cancelButton)

      // Should return to initial state with Won/Lost buttons
      expect(screen.queryByText(/mark this deal as won/i)).not.toBeInTheDocument()
      expect(screen.getByRole('button', { name: /won/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /lost/i })).toBeInTheDocument()
    })
  })

  describe('Lost Flow', () => {
    it('shows lost reason form when Lost button is clicked', () => {
      render(<DealDetails {...defaultProps} />)

      const lostButton = screen.getByRole('button', { name: /lost/i })
      fireEvent.click(lostButton)

      expect(screen.getByLabelText(/why was this deal lost/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /confirm/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
    })

    it('hides Won/Lost buttons when in lost reason form', () => {
      render(<DealDetails {...defaultProps} />)

      const lostButton = screen.getByRole('button', { name: /lost/i })
      fireEvent.click(lostButton)

      // Original buttons should be hidden
      expect(screen.queryByRole('button', { name: /✓ won/i })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /✗ lost/i })).not.toBeInTheDocument()
    })

    it('lost reason input is focused on mount', () => {
      render(<DealDetails {...defaultProps} />)

      const lostButton = screen.getByRole('button', { name: /lost/i })
      fireEvent.click(lostButton)

      const input = screen.getByLabelText(/why was this deal lost/i)
      expect(input).toHaveFocus()
    })

    it('Confirm button is enabled when lost reason is empty (optional field)', () => {
      render(<DealDetails {...defaultProps} />)

      const lostButton = screen.getByRole('button', { name: /lost/i })
      fireEvent.click(lostButton)

      const confirmButton = screen.getByRole('button', { name: /confirm/i })
      expect(confirmButton).not.toBeDisabled()
    })

    it('Confirm button is enabled when lost reason is whitespace only (optional field)', () => {
      render(<DealDetails {...defaultProps} />)

      const lostButton = screen.getByRole('button', { name: /lost/i })
      fireEvent.click(lostButton)

      const input = screen.getByLabelText(/why was this deal lost/i) as HTMLInputElement
      fireEvent.change(input, { target: { value: '   ' } })

      const confirmButton = screen.getByRole('button', { name: /confirm/i })
      expect(confirmButton).not.toBeDisabled()
    })

    it('Confirm button is enabled when lost reason is entered', () => {
      render(<DealDetails {...defaultProps} />)

      const lostButton = screen.getByRole('button', { name: /lost/i })
      fireEvent.click(lostButton)

      const input = screen.getByLabelText(/why was this deal lost/i) as HTMLInputElement
      fireEvent.change(input, { target: { value: 'Customer chose competitor' } })

      const confirmButton = screen.getByRole('button', { name: /confirm/i })
      expect(confirmButton).not.toBeDisabled()
    })

    it('shows character count for lost reason input', () => {
      render(<DealDetails {...defaultProps} />)

      const lostButton = screen.getByRole('button', { name: /lost/i })
      fireEvent.click(lostButton)

      expect(screen.getByText('0/150')).toBeInTheDocument()

      const input = screen.getByLabelText(/why was this deal lost/i) as HTMLInputElement
      fireEvent.change(input, { target: { value: 'Customer chose competitor' } })

      expect(screen.getByText('25/150')).toBeInTheDocument()
    })

    it('lost reason input has maxLength of 150', () => {
      render(<DealDetails {...defaultProps} />)

      const lostButton = screen.getByRole('button', { name: /lost/i })
      fireEvent.click(lostButton)

      const input = screen.getByLabelText(/why was this deal lost/i) as HTMLInputElement
      expect(input.maxLength).toBe(150)
    })

    it('calls markDealWonLost with lost reason on Lost confirm', async () => {
      const mockMarkDealWonLost = vi.fn().mockResolvedValue({
        ...mockOpenDeal,
        status: 'lost',
        lostReason: 'Budget constraints',
      })
      vi.mocked(usePipedrive).mockReturnValue({
        updateDeal: vi.fn(),
        markDealWonLost: mockMarkDealWonLost,
      } as ReturnType<typeof usePipedrive>)

      render(<DealDetails {...defaultProps} />)

      const lostButton = screen.getByRole('button', { name: /lost/i })
      fireEvent.click(lostButton)

      const input = screen.getByLabelText(/why was this deal lost/i) as HTMLInputElement
      fireEvent.change(input, { target: { value: 'Budget constraints' } })

      const confirmButton = screen.getByRole('button', { name: /confirm/i })
      fireEvent.click(confirmButton)

      await waitFor(() => {
        expect(mockMarkDealWonLost).toHaveBeenCalledWith(123, 'lost', 'Budget constraints')
      })
    })

    it('trims whitespace from lost reason before submission', async () => {
      const mockMarkDealWonLost = vi.fn().mockResolvedValue({
        ...mockOpenDeal,
        status: 'lost',
        lostReason: 'No budget',
      })
      vi.mocked(usePipedrive).mockReturnValue({
        updateDeal: vi.fn(),
        markDealWonLost: mockMarkDealWonLost,
      } as ReturnType<typeof usePipedrive>)

      render(<DealDetails {...defaultProps} />)

      const lostButton = screen.getByRole('button', { name: /lost/i })
      fireEvent.click(lostButton)

      const input = screen.getByLabelText(/why was this deal lost/i) as HTMLInputElement
      fireEvent.change(input, { target: { value: '  No budget  ' } })

      const confirmButton = screen.getByRole('button', { name: /confirm/i })
      fireEvent.click(confirmButton)

      await waitFor(() => {
        expect(mockMarkDealWonLost).toHaveBeenCalledWith(123, 'lost', 'No budget')
      })
    })

    it('sends undefined when lost reason is empty (optional field)', async () => {
      const mockMarkDealWonLost = vi.fn().mockResolvedValue({
        ...mockOpenDeal,
        status: 'lost',
        lostReason: null,
      })
      vi.mocked(usePipedrive).mockReturnValue({
        updateDeal: vi.fn(),
        markDealWonLost: mockMarkDealWonLost,
      } as ReturnType<typeof usePipedrive>)

      render(<DealDetails {...defaultProps} />)

      const lostButton = screen.getByRole('button', { name: /lost/i })
      fireEvent.click(lostButton)

      const confirmButton = screen.getByRole('button', { name: /confirm/i })
      fireEvent.click(confirmButton)

      await waitFor(() => {
        expect(mockMarkDealWonLost).toHaveBeenCalledWith(123, 'lost', undefined)
      })
    })

    it('sends undefined when lost reason is whitespace only (optional field)', async () => {
      const mockMarkDealWonLost = vi.fn().mockResolvedValue({
        ...mockOpenDeal,
        status: 'lost',
        lostReason: null,
      })
      vi.mocked(usePipedrive).mockReturnValue({
        updateDeal: vi.fn(),
        markDealWonLost: mockMarkDealWonLost,
      } as ReturnType<typeof usePipedrive>)

      render(<DealDetails {...defaultProps} />)

      const lostButton = screen.getByRole('button', { name: /lost/i })
      fireEvent.click(lostButton)

      const input = screen.getByLabelText(/why was this deal lost/i) as HTMLInputElement
      fireEvent.change(input, { target: { value: '   ' } })

      const confirmButton = screen.getByRole('button', { name: /confirm/i })
      fireEvent.click(confirmButton)

      await waitFor(() => {
        expect(mockMarkDealWonLost).toHaveBeenCalledWith(123, 'lost', undefined)
      })
    })

    it('shows loading state when marking as lost', async () => {
      const mockMarkDealWonLost = vi.fn(() => new Promise(() => {})) // Never resolves
      vi.mocked(usePipedrive).mockReturnValue({
        updateDeal: vi.fn(),
        markDealWonLost: mockMarkDealWonLost,
      } as ReturnType<typeof usePipedrive>)

      render(<DealDetails {...defaultProps} />)

      const lostButton = screen.getByRole('button', { name: /lost/i })
      fireEvent.click(lostButton)

      const input = screen.getByLabelText(/why was this deal lost/i) as HTMLInputElement
      fireEvent.change(input, { target: { value: 'Customer chose competitor' } })

      const confirmButton = screen.getByRole('button', { name: /confirm/i })
      fireEvent.click(confirmButton)

      await waitFor(() => {
        expect(screen.getByText(/saving/i)).toBeInTheDocument()
        expect(confirmButton).toBeDisabled()
      })
    })

    it('input is disabled during submission', async () => {
      const mockMarkDealWonLost = vi.fn(() => new Promise(() => {})) // Never resolves
      vi.mocked(usePipedrive).mockReturnValue({
        updateDeal: vi.fn(),
        markDealWonLost: mockMarkDealWonLost,
      } as ReturnType<typeof usePipedrive>)

      render(<DealDetails {...defaultProps} />)

      const lostButton = screen.getByRole('button', { name: /lost/i })
      fireEvent.click(lostButton)

      const input = screen.getByLabelText(/why was this deal lost/i) as HTMLInputElement
      fireEvent.change(input, { target: { value: 'Customer chose competitor' } })

      const confirmButton = screen.getByRole('button', { name: /confirm/i })
      fireEvent.click(confirmButton)

      await waitFor(() => {
        expect(input).toBeDisabled()
      })
    })

    it('calls onDealUpdated and shows toast on successful lost', async () => {
      const mockMarkDealWonLost = vi.fn().mockResolvedValue({
        ...mockOpenDeal,
        status: 'lost',
        lostReason: 'Budget constraints',
      })
      const mockShowToast = vi.fn()
      const mockOnDealUpdated = vi.fn()

      vi.mocked(usePipedrive).mockReturnValue({
        updateDeal: vi.fn(),
        markDealWonLost: mockMarkDealWonLost,
      } as ReturnType<typeof usePipedrive>)

      vi.mocked(useToast).mockReturnValue({
        showToast: mockShowToast,
      })

      render(<DealDetails {...defaultProps} onDealUpdated={mockOnDealUpdated} />)

      const lostButton = screen.getByRole('button', { name: /lost/i })
      fireEvent.click(lostButton)

      const input = screen.getByLabelText(/why was this deal lost/i) as HTMLInputElement
      fireEvent.change(input, { target: { value: 'Budget constraints' } })

      const confirmButton = screen.getByRole('button', { name: /confirm/i })
      fireEvent.click(confirmButton)

      await waitFor(() => {
        expect(mockOnDealUpdated).toHaveBeenCalledWith({
          ...mockOpenDeal,
          status: 'lost',
          lostReason: 'Budget constraints',
        })
        expect(mockShowToast).toHaveBeenCalledWith('Deal marked as lost')
      })
    })

    it('shows error banner on API failure when marking lost', async () => {
      const mockMarkDealWonLost = vi.fn().mockRejectedValue(new Error('Server error'))
      vi.mocked(usePipedrive).mockReturnValue({
        updateDeal: vi.fn(),
        markDealWonLost: mockMarkDealWonLost,
      } as ReturnType<typeof usePipedrive>)

      render(<DealDetails {...defaultProps} />)

      const lostButton = screen.getByRole('button', { name: /lost/i })
      fireEvent.click(lostButton)

      const input = screen.getByLabelText(/why was this deal lost/i) as HTMLInputElement
      fireEvent.change(input, { target: { value: 'Customer chose competitor' } })

      const confirmButton = screen.getByRole('button', { name: /confirm/i })
      fireEvent.click(confirmButton)

      await waitFor(() => {
        expect(screen.getByText(/server error/i)).toBeInTheDocument()
      })
    })

    it('error banner can be dismissed in lost flow', async () => {
      const mockMarkDealWonLost = vi.fn().mockRejectedValue(new Error('Server error'))
      vi.mocked(usePipedrive).mockReturnValue({
        updateDeal: vi.fn(),
        markDealWonLost: mockMarkDealWonLost,
      } as ReturnType<typeof usePipedrive>)

      render(<DealDetails {...defaultProps} />)

      const lostButton = screen.getByRole('button', { name: /lost/i })
      fireEvent.click(lostButton)

      const input = screen.getByLabelText(/why was this deal lost/i) as HTMLInputElement
      fireEvent.change(input, { target: { value: 'Customer chose competitor' } })

      const confirmButton = screen.getByRole('button', { name: /confirm/i })
      fireEvent.click(confirmButton)

      await waitFor(() => {
        expect(screen.getByText(/server error/i)).toBeInTheDocument()
      })

      const dismissButton = screen.getByLabelText(/dismiss error/i)
      fireEvent.click(dismissButton)

      expect(screen.queryByText(/server error/i)).not.toBeInTheDocument()
    })

    it('resets state when Cancel is clicked in lost form', () => {
      render(<DealDetails {...defaultProps} />)

      const lostButton = screen.getByRole('button', { name: /lost/i })
      fireEvent.click(lostButton)

      const input = screen.getByLabelText(/why was this deal lost/i) as HTMLInputElement
      fireEvent.change(input, { target: { value: 'Some reason' } })

      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      fireEvent.click(cancelButton)

      // Should return to initial state with Won/Lost buttons
      expect(screen.queryByLabelText(/why was this deal lost/i)).not.toBeInTheDocument()
      expect(screen.getByRole('button', { name: /won/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /lost/i })).toBeInTheDocument()
    })

    it('clears lost reason input when Cancel is clicked', () => {
      render(<DealDetails {...defaultProps} />)

      // Enter lost flow
      const lostButton = screen.getByRole('button', { name: /lost/i })
      fireEvent.click(lostButton)

      const input = screen.getByLabelText(/why was this deal lost/i) as HTMLInputElement
      fireEvent.change(input, { target: { value: 'Some reason' } })

      // Cancel
      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      fireEvent.click(cancelButton)

      // Re-enter lost flow
      const lostButtonAgain = screen.getByRole('button', { name: /lost/i })
      fireEvent.click(lostButtonAgain)

      // Input should be empty
      const inputAgain = screen.getByLabelText(/why was this deal lost/i) as HTMLInputElement
      expect(inputAgain.value).toBe('')
    })
  })

  describe('Edge Cases', () => {
    it('handles null return from markDealWonLost (won)', async () => {
      const mockMarkDealWonLost = vi.fn().mockResolvedValue(null)
      vi.mocked(usePipedrive).mockReturnValue({
        updateDeal: vi.fn(),
        markDealWonLost: mockMarkDealWonLost,
      } as ReturnType<typeof usePipedrive>)

      render(<DealDetails {...defaultProps} />)

      const wonButton = screen.getByRole('button', { name: /won/i })
      fireEvent.click(wonButton)

      const confirmButton = screen.getByRole('button', { name: /confirm/i })
      fireEvent.click(confirmButton)

      await waitFor(() => {
        expect(screen.getByText(/failed to mark deal as won/i)).toBeInTheDocument()
      })
    })

    it('handles null return from markDealWonLost (lost)', async () => {
      const mockMarkDealWonLost = vi.fn().mockResolvedValue(null)
      vi.mocked(usePipedrive).mockReturnValue({
        updateDeal: vi.fn(),
        markDealWonLost: mockMarkDealWonLost,
      } as ReturnType<typeof usePipedrive>)

      render(<DealDetails {...defaultProps} />)

      const lostButton = screen.getByRole('button', { name: /lost/i })
      fireEvent.click(lostButton)

      const input = screen.getByLabelText(/why was this deal lost/i) as HTMLInputElement
      fireEvent.change(input, { target: { value: 'Customer chose competitor' } })

      const confirmButton = screen.getByRole('button', { name: /confirm/i })
      fireEvent.click(confirmButton)

      await waitFor(() => {
        expect(screen.getByText(/failed to mark deal as lost/i)).toBeInTheDocument()
      })
    })

    it('does not call onDealUpdated when API returns null', async () => {
      const mockMarkDealWonLost = vi.fn().mockResolvedValue(null)
      const mockOnDealUpdated = vi.fn()

      vi.mocked(usePipedrive).mockReturnValue({
        updateDeal: vi.fn(),
        markDealWonLost: mockMarkDealWonLost,
      } as ReturnType<typeof usePipedrive>)

      render(<DealDetails {...defaultProps} onDealUpdated={mockOnDealUpdated} />)

      const wonButton = screen.getByRole('button', { name: /won/i })
      fireEvent.click(wonButton)

      const confirmButton = screen.getByRole('button', { name: /confirm/i })
      fireEvent.click(confirmButton)

      await waitFor(() => {
        expect(screen.getByText(/failed to mark deal as won/i)).toBeInTheDocument()
      })

      expect(mockOnDealUpdated).not.toHaveBeenCalled()
    })
  })
})
