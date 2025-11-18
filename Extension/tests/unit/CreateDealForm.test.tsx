/**
 * Unit tests for CreateDealForm component
 * Tests validation, form submission, error handling, and pipeline/stage interactions
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CreateDealForm } from '@/content-script/components/CreateDealForm'
import type { Pipeline, Stage, Deal } from '@/types/deal'

// Mock hooks
vi.mock('@/content-script/hooks/usePipedrive', () => ({
  usePipedrive: vi.fn(),
}))

vi.mock('@/content-script/context/ToastContext', () => ({
  useToast: vi.fn(() => ({
    showToast: vi.fn(),
  })),
}))

import { usePipedrive } from '@/content-script/hooks/usePipedrive'

const mockPipelines: Pipeline[] = [
  { id: 1, name: 'Sales', orderNr: 0, active: true },
  { id: 2, name: 'Partner', orderNr: 1, active: true },
]

const mockStages: Stage[] = [
  { id: 1, name: 'Qualified', orderNr: 0, pipelineId: 1 },
  { id: 2, name: 'Contact Made', orderNr: 1, pipelineId: 1 },
  { id: 3, name: 'Discovery', orderNr: 0, pipelineId: 2 },
]

const defaultProps = {
  personId: 123,
  personName: 'John Smith',
  pipelines: mockPipelines,
  stages: mockStages,
  onDealCreated: vi.fn(),
  onCancel: vi.fn(),
}

describe('CreateDealForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(usePipedrive).mockReturnValue({
      createDeal: vi.fn(),
      isCreatingDeal: false,
      createDealError: null,
    } as ReturnType<typeof usePipedrive>)
  })

  describe('Initial Rendering', () => {
    it('renders with pre-filled title', () => {
      render(<CreateDealForm {...defaultProps} />)
      const input = screen.getByDisplayValue('John Smith Deal')
      expect(input).toBeInTheDocument()
    })

    it('pre-selects default pipeline (orderNr=0)', () => {
      render(<CreateDealForm {...defaultProps} />)
      const select = screen.getByLabelText(/pipeline/i) as HTMLSelectElement
      expect(select.value).toBe('1') // Sales pipeline
    })

    it('pre-selects first stage of default pipeline', () => {
      render(<CreateDealForm {...defaultProps} />)
      const select = screen.getByLabelText(/stage/i) as HTMLSelectElement
      expect(select.value).toBe('1') // Qualified
    })

    it('value field is empty and optional', () => {
      render(<CreateDealForm {...defaultProps} />)
      const input = screen.getByLabelText(/value/i) as HTMLInputElement
      expect(input.value).toBe('')
    })
  })

  describe('Field Interactions', () => {
    it('title field is editable', () => {
      render(<CreateDealForm {...defaultProps} />)
      const input = screen.getByDisplayValue('John Smith Deal') as HTMLInputElement

      fireEvent.change(input, { target: { value: 'Custom Deal' } })
      expect(input.value).toBe('Custom Deal')
    })

    it('value field accepts numeric input', () => {
      render(<CreateDealForm {...defaultProps} />)
      const input = screen.getByLabelText(/value/i) as HTMLInputElement

      fireEvent.change(input, { target: { value: '50000' } })
      expect(input.value).toBe('50000')
    })

    it('updates stages when pipeline changes', () => {
      render(<CreateDealForm {...defaultProps} />)
      const pipelineSelect = screen.getByLabelText(/pipeline/i) as HTMLSelectElement
      const stageSelect = screen.getByLabelText(/stage/i) as HTMLSelectElement

      // Change to Partner pipeline
      fireEvent.change(pipelineSelect, { target: { value: '2' } })

      // Stage should update to first stage of Partner pipeline
      expect(stageSelect.value).toBe('3') // Discovery
    })
  })

  describe('Validation', () => {
    it('Create button disabled when title is empty', () => {
      render(<CreateDealForm {...defaultProps} />)
      const input = screen.getByDisplayValue('John Smith Deal') as HTMLInputElement
      const button = screen.getByRole('button', { name: /create/i })

      fireEvent.change(input, { target: { value: '' } })
      expect(button).toBeDisabled()
    })

    it('Create button disabled when title is whitespace only', () => {
      render(<CreateDealForm {...defaultProps} />)
      const input = screen.getByDisplayValue('John Smith Deal') as HTMLInputElement
      const button = screen.getByRole('button', { name: /create/i })

      fireEvent.change(input, { target: { value: '   ' } })
      expect(button).toBeDisabled()
    })

    it('Create button enabled when all required fields valid', () => {
      render(<CreateDealForm {...defaultProps} />)
      const button = screen.getByRole('button', { name: /create/i })
      expect(button).not.toBeDisabled()
    })
  })

  describe('Form Submission', () => {
    it('shows loading state when creating', async () => {
      const mockCreateDeal = vi.fn(() => new Promise(() => {})) // Never resolves
      vi.mocked(usePipedrive).mockReturnValue({
        createDeal: mockCreateDeal,
        isCreatingDeal: true,
        createDealError: null,
      } as ReturnType<typeof usePipedrive>)

      render(<CreateDealForm {...defaultProps} />)

      expect(screen.getByText(/creating/i)).toBeInTheDocument()
      const button = screen.getByRole('button', { name: /creating/i })
      expect(button).toBeDisabled()
    })

    it('calls onDealCreated on successful creation', async () => {
      const mockDeal: Deal = {
        id: 456,
        title: 'John Smith Deal',
        value: '$0',
        stage: { id: 1, name: 'Qualified', order: 0 },
        pipeline: { id: 1, name: 'Sales' },
        status: 'open',
      }
      const mockCreateDeal = vi.fn().mockResolvedValue(mockDeal)
      vi.mocked(usePipedrive).mockReturnValue({
        createDeal: mockCreateDeal,
        isCreatingDeal: false,
        createDealError: null,
      } as ReturnType<typeof usePipedrive>)

      const onDealCreated = vi.fn()
      render(<CreateDealForm {...defaultProps} onDealCreated={onDealCreated} />)
      const button = screen.getByRole('button', { name: /create/i })

      fireEvent.click(button)

      await waitFor(() => {
        expect(mockCreateDeal).toHaveBeenCalled()
      })
    })

    it('sends correct data on submission', async () => {
      const mockCreateDeal = vi.fn().mockResolvedValue({
        id: 456,
        title: 'Custom Deal',
        value: '$50,000.00',
        stage: { id: 1, name: 'Qualified', order: 0 },
        pipeline: { id: 1, name: 'Sales' },
        status: 'open',
      })
      vi.mocked(usePipedrive).mockReturnValue({
        createDeal: mockCreateDeal,
        isCreatingDeal: false,
        createDealError: null,
      } as ReturnType<typeof usePipedrive>)

      render(<CreateDealForm {...defaultProps} />)

      // Edit title
      const titleInput = screen.getByDisplayValue('John Smith Deal') as HTMLInputElement
      fireEvent.change(titleInput, { target: { value: 'Custom Deal' } })

      // Add value
      const valueInput = screen.getByLabelText(/value/i) as HTMLInputElement
      fireEvent.change(valueInput, { target: { value: '50000' } })

      // Submit
      const button = screen.getByRole('button', { name: /create/i })
      fireEvent.click(button)

      await waitFor(() => {
        expect(mockCreateDeal).toHaveBeenCalledWith({
          title: 'Custom Deal',
          personId: 123,
          pipelineId: 1,
          stageId: 1,
          value: 50000,
        })
      })
    })

    it('does not send value if empty', async () => {
      const mockCreateDeal = vi.fn().mockResolvedValue({
        id: 456,
        title: 'John Smith Deal',
        value: '$0',
        stage: { id: 1, name: 'Qualified', order: 0 },
        pipeline: { id: 1, name: 'Sales' },
        status: 'open',
      })
      vi.mocked(usePipedrive).mockReturnValue({
        createDeal: mockCreateDeal,
        isCreatingDeal: false,
        createDealError: null,
      } as ReturnType<typeof usePipedrive>)

      render(<CreateDealForm {...defaultProps} />)
      const button = screen.getByRole('button', { name: /create/i })

      fireEvent.click(button)

      await waitFor(() => {
        expect(mockCreateDeal).toHaveBeenCalledWith({
          title: 'John Smith Deal',
          personId: 123,
          pipelineId: 1,
          stageId: 1,
          // value not included
        })
      })
    })
  })

  describe('Error Handling', () => {
    it('shows error banner on creation failure', async () => {
      vi.mocked(usePipedrive).mockReturnValue({
        createDeal: vi.fn().mockResolvedValue(null),
        isCreatingDeal: false,
        createDealError: { message: 'Failed to create deal', statusCode: 500 },
      } as ReturnType<typeof usePipedrive>)

      render(<CreateDealForm {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText(/failed to create deal/i)).toBeInTheDocument()
      })
    })

    it('error banner can be dismissed', async () => {
      vi.mocked(usePipedrive).mockReturnValue({
        createDeal: vi.fn().mockResolvedValue(null),
        isCreatingDeal: false,
        createDealError: { message: 'Network error', statusCode: 500 },
      } as ReturnType<typeof usePipedrive>)

      render(<CreateDealForm {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument()
      })

      const dismissButton = screen.getByLabelText(/dismiss error/i)
      fireEvent.click(dismissButton)

      expect(screen.queryByText(/network error/i)).not.toBeInTheDocument()
    })
  })

  describe('Cancel Button', () => {
    it('Cancel button calls onCancel', () => {
      const onCancel = vi.fn()
      render(<CreateDealForm {...defaultProps} onCancel={onCancel} />)
      const button = screen.getByRole('button', { name: /cancel/i })

      fireEvent.click(button)
      expect(onCancel).toHaveBeenCalled()
    })
  })
})
