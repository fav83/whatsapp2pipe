import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DealDropdown } from '../../src/content-script/components/DealDropdown'
import { DealDetails } from '../../src/content-script/components/DealDetails'
import { DealsSection } from '../../src/content-script/components/DealsSection'
import { DealsLoadingSkeleton } from '../../src/content-script/components/DealsLoadingSkeleton'
import { DealsErrorState } from '../../src/content-script/components/DealsErrorState'
import type { Deal } from '../../src/types/deal'

// Mock usePipedrive and useToast hooks at top level
const mockUpdateDeal = vi.fn()
const mockShowToast = vi.fn()

vi.mock('../../src/content-script/hooks/usePipedrive', () => ({
  usePipedrive: () => ({
    updateDeal: mockUpdateDeal,
    isLoading: false,
    error: null,
  }),
}))

vi.mock('../../src/content-script/context/ToastContext', () => ({
  useToast: () => ({
    showToast: mockShowToast,
  }),
}))

describe('Deals Components', () => {
  // Mock deals data
  const mockDeals: Deal[] = [
    {
      id: 1,
      title: 'Website Redesign Project',
      value: '$50,000.00',
      status: 'open',
      pipeline: { id: 1, name: 'Sales Pipeline' },
      stage: { id: 1, name: 'Proposal', order: 1 },
    },
    {
      id: 2,
      title: 'Mobile App Development',
      value: '$75,000.00',
      status: 'won',
      pipeline: { id: 1, name: 'Sales Pipeline' },
      stage: { id: 5, name: 'Closed Won', order: 5 },
    },
    {
      id: 3,
      title: 'Legacy System Migration',
      value: '$100,000.00',
      status: 'lost',
      pipeline: { id: 2, name: 'Enterprise Pipeline' },
      stage: { id: 6, name: 'Closed Lost', order: 6 },
    },
  ]

  describe('DealDropdown', () => {
    it('renders placeholder option when no deal selected', () => {
      const onSelect = vi.fn()
      render(<DealDropdown deals={mockDeals} selectedDealId={null} onSelect={onSelect} />)
      expect(screen.getByRole('combobox')).toHaveTextContent('Select a deal...')
    })

    it('renders all deal titles as options', async () => {
      const onSelect = vi.fn()
      render(<DealDropdown deals={mockDeals} selectedDealId={null} onSelect={onSelect} />)
      const user = userEvent.setup()
      await user.click(screen.getByRole('combobox'))
      expect(screen.getByText('Website Redesign Project')).toBeInTheDocument()
      expect(screen.getByText('Mobile App Development')).toBeInTheDocument()
      expect(screen.getByText('Legacy System Migration')).toBeInTheDocument()
    })

    it('renders "(Untitled Deal)" for empty title', async () => {
      const dealsWithEmptyTitle: Deal[] = [{ ...mockDeals[0], title: '' }]
      const onSelect = vi.fn()
      render(<DealDropdown deals={dealsWithEmptyTitle} selectedDealId={null} onSelect={onSelect} />)
      const user = userEvent.setup()
      await user.click(screen.getByRole('combobox'))
      expect(screen.getByText('(Untitled Deal)')).toBeInTheDocument()
    })

    it('selects deal when changed', async () => {
      const user = userEvent.setup()
      const onSelect = vi.fn()
      render(<DealDropdown deals={mockDeals} selectedDealId={null} onSelect={onSelect} />)

      const button = screen.getByRole('combobox')
      await user.click(button)
      await user.click(screen.getByText('Mobile App Development'))

      expect(onSelect).toHaveBeenCalledWith(2)
    })

    it('displays selected deal ID correctly', () => {
      const onSelect = vi.fn()
      render(<DealDropdown deals={mockDeals} selectedDealId={2} onSelect={onSelect} />)
      expect(screen.getByRole('combobox')).toHaveTextContent('Mobile App Development')
    })

    it('has correct styling classes', () => {
      const onSelect = vi.fn()
      const { container } = render(
        <DealDropdown deals={mockDeals} selectedDealId={null} onSelect={onSelect} />
      )
      const button = container.querySelector('button')
      expect(button?.className).toContain('w-full')
      expect(button?.className).toContain('px-3')
      expect(button?.className).toContain('py-2')
      expect(button?.className).toContain('rounded-lg')
    })
  })

  describe('DealDetails', () => {
    const mockPipelines = [
      { id: 1, name: 'Sales Pipeline', orderNr: 1, active: true },
      { id: 2, name: 'Enterprise Pipeline', orderNr: 2, active: true },
    ]

    const mockStages = [
      { id: 1, name: 'Proposal', orderNr: 1, pipelineId: 1 },
      { id: 2, name: 'Negotiation', orderNr: 2, pipelineId: 1 },
      { id: 3, name: 'Closed Won', orderNr: 3, pipelineId: 1 },
      { id: 4, name: 'Discovery', orderNr: 1, pipelineId: 2 },
      { id: 5, name: 'Qualification', orderNr: 2, pipelineId: 2 },
    ]

    beforeEach(() => {
      vi.resetAllMocks()

      // Mock chrome.runtime.sendMessage for any internal calls
      global.chrome = {
        runtime: {
          sendMessage: vi.fn(),
        },
      } as typeof chrome
    })

    describe('Rendering Tests', () => {
      it('renders editable UI for open deals', () => {
        const openDeal = mockDeals[0] // status: 'open'
        const { container } = render(
          <DealDetails
            deal={openDeal}
            pipelines={mockPipelines}
            stages={mockStages}
            onDealUpdated={vi.fn()}
          />
        )

        // Should show custom dropdown comboboxes (not native selects)
        const comboboxes = container.querySelectorAll('button[role="combobox"]')
        expect(comboboxes.length).toBe(2) // Pipeline and Stage dropdowns

        // Check that the selected values are displayed
        expect(comboboxes[0]).toHaveTextContent('Sales Pipeline')
        expect(comboboxes[1]).toHaveTextContent('Proposal')
      })

      it('renders read-only UI for won deals', () => {
        const wonDeal = mockDeals[1] // status: 'won'
        const { container } = render(
          <DealDetails
            deal={wonDeal}
            pipelines={mockPipelines}
            stages={mockStages}
            onDealUpdated={vi.fn()}
          />
        )

        // Should NOT show dropdowns
        const comboboxes = container.querySelectorAll('button[role="combobox"]')
        expect(comboboxes.length).toBe(0)

        // Should show text labels instead
        expect(screen.getByText(/Pipeline:/)).toBeInTheDocument()
        expect(screen.getByText(/Stage:/)).toBeInTheDocument()
        expect(screen.getByText('Sales Pipeline')).toBeInTheDocument()
        expect(screen.getByText('Closed Won')).toBeInTheDocument()
      })

      it('renders read-only UI for lost deals', () => {
        const lostDeal = mockDeals[2] // status: 'lost'
        const { container } = render(
          <DealDetails
            deal={lostDeal}
            pipelines={mockPipelines}
            stages={mockStages}
            onDealUpdated={vi.fn()}
          />
        )

        // Should NOT show dropdowns
        const comboboxes = container.querySelectorAll('button[role="combobox"]')
        expect(comboboxes.length).toBe(0)

        // Should show text labels instead
        expect(screen.getByText(/Pipeline:/)).toBeInTheDocument()
        expect(screen.getByText(/Stage:/)).toBeInTheDocument()
      })

      it('displays pipeline and stage correctly', () => {
        render(
          <DealDetails
            deal={mockDeals[0]}
            pipelines={mockPipelines}
            stages={mockStages}
            onDealUpdated={vi.fn()}
          />
        )
        // DealDetails doesn't display title - check for pipeline and stage instead
        const comboboxes = document.querySelectorAll('button[role="combobox"]')
        expect(comboboxes[0]).toHaveTextContent('Sales Pipeline')
        expect(comboboxes[1]).toHaveTextContent('Proposal')
      })

      it('displays deal value correctly', () => {
        render(
          <DealDetails
            deal={mockDeals[0]}
            pipelines={mockPipelines}
            stages={mockStages}
            onDealUpdated={vi.fn()}
          />
        )
        expect(screen.getByText(/Value:/)).toBeInTheDocument()
        expect(screen.getByText(/\$50,000.00/)).toBeInTheDocument()
      })
    })

    describe('Interaction Tests', () => {
      // Helper to get pipeline/stage comboboxes by index
      const getComboboxes = (container: HTMLElement) => {
        const comboboxes = container.querySelectorAll('button[role="combobox"]')
        return {
          pipelineCombobox: comboboxes[0] as HTMLButtonElement,
          stageCombobox: comboboxes[1] as HTMLButtonElement,
        }
      }

      it('shows Save/Cancel buttons when pipeline changes', async () => {
        const user = userEvent.setup()
        const { container } = render(
          <DealDetails
            deal={mockDeals[0]}
            pipelines={mockPipelines}
            stages={mockStages}
            onDealUpdated={vi.fn()}
          />
        )

        // Initially no buttons
        expect(screen.queryByRole('button', { name: 'Save' })).not.toBeInTheDocument()
        expect(screen.queryByRole('button', { name: 'Cancel' })).not.toBeInTheDocument()

        // Change pipeline
        const { pipelineCombobox } = getComboboxes(container)
        await user.click(pipelineCombobox)
        await user.click(screen.getByRole('option', { name: 'Enterprise Pipeline' }))

        // Buttons should appear
        expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
      })

      it('shows Save/Cancel buttons when stage changes', async () => {
        const user = userEvent.setup()
        const { container } = render(
          <DealDetails
            deal={mockDeals[0]}
            pipelines={mockPipelines}
            stages={mockStages}
            onDealUpdated={vi.fn()}
          />
        )

        // Change stage
        const { stageCombobox } = getComboboxes(container)
        await user.click(stageCombobox)
        await user.click(screen.getByRole('option', { name: 'Negotiation' }))

        // Buttons should appear
        expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
      })

      it('hides Save/Cancel buttons when no changes', async () => {
        const user = userEvent.setup()
        const { container } = render(
          <DealDetails
            deal={mockDeals[0]}
            pipelines={mockPipelines}
            stages={mockStages}
            onDealUpdated={vi.fn()}
          />
        )

        // Change stage
        const { stageCombobox } = getComboboxes(container)
        await user.click(stageCombobox)
        await user.click(screen.getByRole('option', { name: 'Negotiation' }))

        // Buttons appear
        expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()

        // Click Cancel
        await user.click(screen.getByRole('button', { name: 'Cancel' }))

        // Buttons disappear
        expect(screen.queryByRole('button', { name: 'Save' })).not.toBeInTheDocument()
        expect(screen.queryByRole('button', { name: 'Cancel' })).not.toBeInTheDocument()
      })

      it('updates stage dropdown when pipeline changes', async () => {
        const user = userEvent.setup()
        const { container } = render(
          <DealDetails
            deal={mockDeals[0]}
            pipelines={mockPipelines}
            stages={mockStages}
            onDealUpdated={vi.fn()}
          />
        )

        // Change to pipeline 2
        const { pipelineCombobox, stageCombobox } = getComboboxes(container)
        await user.click(pipelineCombobox)
        await user.click(screen.getByRole('option', { name: 'Enterprise Pipeline' }))

        // Stage dropdown should update to show stages from pipeline 2
        await user.click(stageCombobox)
        expect(screen.getByRole('option', { name: 'Discovery' })).toBeInTheDocument()
        expect(screen.getByRole('option', { name: 'Qualification' })).toBeInTheDocument()
        expect(screen.queryByRole('option', { name: 'Proposal' })).not.toBeInTheDocument()
      })

      it('auto-selects first stage of new pipeline', async () => {
        const user = userEvent.setup()
        const { container } = render(
          <DealDetails
            deal={mockDeals[0]}
            pipelines={mockPipelines}
            stages={mockStages}
            onDealUpdated={vi.fn()}
          />
        )

        // Change to pipeline 2
        const { pipelineCombobox, stageCombobox } = getComboboxes(container)
        await user.click(pipelineCombobox)
        await user.click(screen.getByRole('option', { name: 'Enterprise Pipeline' }))

        // Stage should auto-select to first stage (Discovery)
        expect(stageCombobox).toHaveTextContent('Discovery')
      })

      it('cancel button reverts changes', async () => {
        const user = userEvent.setup()
        const { container } = render(
          <DealDetails
            deal={mockDeals[0]}
            pipelines={mockPipelines}
            stages={mockStages}
            onDealUpdated={vi.fn()}
          />
        )

        const { pipelineCombobox, stageCombobox } = getComboboxes(container)

        // Original values
        expect(pipelineCombobox).toHaveTextContent('Sales Pipeline')
        expect(stageCombobox).toHaveTextContent('Proposal')

        // Change both
        await user.click(pipelineCombobox)
        await user.click(screen.getByRole('option', { name: 'Enterprise Pipeline' }))
        await user.click(stageCombobox)
        await user.click(screen.getByRole('option', { name: 'Discovery' }))

        // Verify changes
        expect(pipelineCombobox).toHaveTextContent('Enterprise Pipeline')
        expect(stageCombobox).toHaveTextContent('Discovery')

        // Click Cancel
        await user.click(screen.getByRole('button', { name: 'Cancel' }))

        // Values should revert
        expect(pipelineCombobox).toHaveTextContent('Sales Pipeline')
        expect(stageCombobox).toHaveTextContent('Proposal')
      })

      it('disables inputs during save', async () => {
        const user = userEvent.setup()
        mockUpdateDeal.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)))

        const { container } = render(
          <DealDetails
            deal={mockDeals[0]}
            pipelines={mockPipelines}
            stages={mockStages}
            onDealUpdated={vi.fn()}
          />
        )

        // Change stage
        const { pipelineCombobox, stageCombobox } = getComboboxes(container)
        await user.click(stageCombobox)
        await user.click(screen.getByRole('option', { name: 'Negotiation' }))

        // Click Save
        const saveButton = screen.getByRole('button', { name: 'Save' })
        await user.click(saveButton)

        // Inputs should be disabled
        expect(pipelineCombobox).toBeDisabled()
        expect(stageCombobox).toBeDisabled()
      })
    })

    describe('API Integration Tests', () => {
      const getComboboxes = (container: HTMLElement) => {
        const comboboxes = container.querySelectorAll('button[role="combobox"]')
        return {
          pipelineCombobox: comboboxes[0] as HTMLButtonElement,
          stageCombobox: comboboxes[1] as HTMLButtonElement,
        }
      }

      it('successful save updates deal', async () => {
        const user = userEvent.setup()
        const onDealUpdated = vi.fn()
        const updatedDeal = {
          ...mockDeals[0],
          stage: { id: 2, name: 'Negotiation', order: 2 },
        }

        mockUpdateDeal.mockResolvedValue(updatedDeal)

        const { container } = render(
          <DealDetails
            deal={mockDeals[0]}
            pipelines={mockPipelines}
            stages={mockStages}
            onDealUpdated={onDealUpdated}
          />
        )

        // Change stage
        const { stageCombobox } = getComboboxes(container)
        await user.click(stageCombobox)
        await user.click(screen.getByRole('option', { name: 'Negotiation' }))

        // Click Save
        await user.click(screen.getByRole('button', { name: 'Save' }))

        // Wait for API call
        await waitFor(() => {
          expect(mockUpdateDeal).toHaveBeenCalledWith(1, {
            pipelineId: 1,
            stageId: 2,
          })
        })

        // onDealUpdated callback should be called
        await waitFor(() => {
          expect(onDealUpdated).toHaveBeenCalledWith(updatedDeal)
        })

        // Toast should show
        await waitFor(() => {
          expect(mockShowToast).toHaveBeenCalledWith('Deal updated successfully')
        })
      })

      it('failed save shows error banner', async () => {
        const user = userEvent.setup()
        mockUpdateDeal.mockResolvedValue(null) // API returned null (error)

        const { container } = render(
          <DealDetails
            deal={mockDeals[0]}
            pipelines={mockPipelines}
            stages={mockStages}
            onDealUpdated={vi.fn()}
          />
        )

        // Change stage
        const { stageCombobox } = getComboboxes(container)
        await user.click(stageCombobox)
        await user.click(screen.getByRole('option', { name: 'Negotiation' }))

        // Click Save
        await user.click(screen.getByRole('button', { name: 'Save' }))

        // Error banner should appear
        await waitFor(() => {
          expect(screen.getByText('Failed to update deal. Please try again.')).toBeInTheDocument()
        })
      })

      it('error banner is dismissible', async () => {
        const user = userEvent.setup()
        mockUpdateDeal.mockResolvedValue(null)

        const { container } = render(
          <DealDetails
            deal={mockDeals[0]}
            pipelines={mockPipelines}
            stages={mockStages}
            onDealUpdated={vi.fn()}
          />
        )

        // Trigger error
        const { stageCombobox } = getComboboxes(container)
        await user.click(stageCombobox)
        await user.click(screen.getByRole('option', { name: 'Negotiation' }))
        await user.click(screen.getByRole('button', { name: 'Save' }))

        // Wait for error
        await waitFor(() => {
          expect(screen.getByText('Failed to update deal. Please try again.')).toBeInTheDocument()
        })

        // Click dismiss button
        const dismissButton = screen.getByRole('button', { name: 'Dismiss error' })
        await user.click(dismissButton)

        // Error should disappear
        expect(
          screen.queryByText('Failed to update deal. Please try again.')
        ).not.toBeInTheDocument()
      })

      it('success shows toast notification', async () => {
        const user = userEvent.setup()
        const updatedDeal = {
          ...mockDeals[0],
          stage: { id: 2, name: 'Negotiation', order: 2 },
        }
        mockUpdateDeal.mockResolvedValue(updatedDeal)

        const { container } = render(
          <DealDetails
            deal={mockDeals[0]}
            pipelines={mockPipelines}
            stages={mockStages}
            onDealUpdated={vi.fn()}
          />
        )

        // Change and save
        const { stageCombobox } = getComboboxes(container)
        await user.click(stageCombobox)
        await user.click(screen.getByRole('option', { name: 'Negotiation' }))
        await user.click(screen.getByRole('button', { name: 'Save' }))

        // Toast should be called
        await waitFor(() => {
          expect(mockShowToast).toHaveBeenCalledWith('Deal updated successfully')
        })
      })
    })

    describe('Edge Case Tests', () => {
      const getComboboxes = (container: HTMLElement) => {
        const comboboxes = container.querySelectorAll('button[role="combobox"]')
        return {
          pipelineCombobox: comboboxes[0] as HTMLButtonElement,
          stageCombobox: comboboxes[1] as HTMLButtonElement,
        }
      }

      it('handles pipeline with no stages', async () => {
        const user = userEvent.setup()
        // Create a pipeline with no stages
        const emptyPipeline = { id: 3, name: 'Empty Pipeline', orderNr: 3, active: true }
        const pipelinesWithEmpty = [...mockPipelines, emptyPipeline]

        const { container } = render(
          <DealDetails
            deal={mockDeals[0]}
            pipelines={pipelinesWithEmpty}
            stages={mockStages} // No stages for pipeline 3
            onDealUpdated={vi.fn()}
          />
        )

        // Change to empty pipeline
        const { pipelineCombobox, stageCombobox } = getComboboxes(container)
        await user.click(pipelineCombobox)
        await user.click(screen.getByRole('option', { name: 'Empty Pipeline' }))

        // Stage combobox should open but show no options (not crash)
        await user.click(stageCombobox)
        const options = container.querySelectorAll('[role="option"]')
        expect(options.length).toBe(0)
      })

      it('handles deal with very long title without crashing', () => {
        const longTitleDeal = {
          ...mockDeals[0],
          title: 'A'.repeat(200),
        }

        // DealDetails doesn't render title, but should not crash with long titles
        render(
          <DealDetails
            deal={longTitleDeal}
            pipelines={mockPipelines}
            stages={mockStages}
            onDealUpdated={vi.fn()}
          />
        )

        // Just verify it renders without crashing
        expect(screen.getByText(/Value:/)).toBeInTheDocument()
      })

      it('handles zero value deal', () => {
        const zeroValueDeal = {
          ...mockDeals[0],
          value: '$0.00',
        }

        render(
          <DealDetails
            deal={zeroValueDeal}
            pipelines={mockPipelines}
            stages={mockStages}
            onDealUpdated={vi.fn()}
          />
        )

        expect(screen.getByText(/\$0.00/)).toBeInTheDocument()
      })

      it('prevents double submission', async () => {
        const user = userEvent.setup()
        let resolveUpdate: () => void
        mockUpdateDeal.mockReturnValue(
          new Promise((resolve) => {
            resolveUpdate = () =>
              resolve({
                ...mockDeals[0],
                stage: { id: 2, name: 'Negotiation', order: 2 },
              })
          })
        )

        const { container } = render(
          <DealDetails
            deal={mockDeals[0]}
            pipelines={mockPipelines}
            stages={mockStages}
            onDealUpdated={vi.fn()}
          />
        )

        // Change stage
        const { stageCombobox } = getComboboxes(container)
        await user.click(stageCombobox)
        await user.click(screen.getByRole('option', { name: 'Negotiation' }))

        // Click Save twice rapidly
        const saveButton = screen.getByRole('button', { name: 'Save' })
        await user.click(saveButton)
        await user.click(saveButton)

        // Resolve the update
        resolveUpdate!()

        // Should only call API once
        await waitFor(() => {
          expect(mockUpdateDeal).toHaveBeenCalledTimes(1)
        })
      })

      it('clears error on new changes', async () => {
        const user = userEvent.setup()
        mockUpdateDeal.mockResolvedValue(null)

        const { container } = render(
          <DealDetails
            deal={mockDeals[0]}
            pipelines={mockPipelines}
            stages={mockStages}
            onDealUpdated={vi.fn()}
          />
        )

        // Trigger error
        const { stageCombobox } = getComboboxes(container)
        await user.click(stageCombobox)
        await user.click(screen.getByRole('option', { name: 'Negotiation' }))
        await user.click(screen.getByRole('button', { name: 'Save' }))

        // Wait for error
        await waitFor(() => {
          expect(screen.getByText('Failed to update deal. Please try again.')).toBeInTheDocument()
        })

        // Make a new change
        await user.click(stageCombobox)
        await user.click(screen.getByRole('option', { name: 'Closed Won' }))

        // Error should clear
        await waitFor(() => {
          expect(
            screen.queryByText('Failed to update deal. Please try again.')
          ).not.toBeInTheDocument()
        })
      })
    })
  })

  describe('DealsLoadingSkeleton', () => {
    it('displays skeleton dropdown with animation', () => {
      const { container } = render(<DealsLoadingSkeleton />)
      const skeletonElements = container.querySelectorAll('.animate-pulse')
      expect(skeletonElements.length).toBeGreaterThan(0)
    })

    it('displays skeleton inside white card', () => {
      const { container } = render(<DealsLoadingSkeleton />)
      const card = container.querySelector('.bg-white')
      expect(card).toBeInTheDocument()
    })

    it('has correct structure with outer padding and inner card', () => {
      const { container } = render(<DealsLoadingSkeleton />)
      const wrapper = container.firstChild as HTMLElement
      expect(wrapper.className).toContain('px-3')
      expect(wrapper.className).toContain('pt-3')
      const card = wrapper.firstChild as HTMLElement
      expect(card.className).toContain('bg-white')
      expect(card.className).toContain('space-y-3')
    })
  })

  describe('DealsErrorState', () => {
    it('renders error message', () => {
      const onRetry = vi.fn()
      render(<DealsErrorState onRetry={onRetry} />)
      expect(screen.getByText('Unable to load deals')).toBeInTheDocument()
    })

    it('renders specific error message when provided', () => {
      const onRetry = vi.fn()
      render(<DealsErrorState error="Network timeout" onRetry={onRetry} />)
      expect(screen.getByText('Network timeout')).toBeInTheDocument()
    })

    it('renders retry button', () => {
      const onRetry = vi.fn()
      render(<DealsErrorState onRetry={onRetry} />)
      expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument()
    })

    it('calls onRetry when retry button clicked', async () => {
      const user = userEvent.setup()
      const onRetry = vi.fn()
      render(<DealsErrorState onRetry={onRetry} />)

      const retryButton = screen.getByRole('button', { name: 'Retry' })
      await user.click(retryButton)

      expect(onRetry).toHaveBeenCalledTimes(1)
    })

    it('has correct error styling', () => {
      const onRetry = vi.fn()
      const { container } = render(<DealsErrorState onRetry={onRetry} />)
      const errorBox = container.querySelector('.bg-red-50')
      expect(errorBox).toBeInTheDocument()
      expect(errorBox?.className).toContain('border-red-200')
    })
  })

  describe('DealsSection', () => {
    it('renders error state when deals is null', () => {
      const onRetry = vi.fn()
      render(
        <DealsSection
          personId={123}
          personName="John Doe"
          deals={null}
          dealsError="Failed to load"
          onRetry={onRetry}
        />
      )
      expect(screen.getByText('Unable to load deals')).toBeInTheDocument()
      expect(screen.getByText('Failed to load')).toBeInTheDocument()
    })

    it('renders empty state when deals is empty array', () => {
      render(<DealsSection personId={123} personName="John Doe" deals={[]} />)
      expect(screen.getByText('No deals yet')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Create deal' })).toBeInTheDocument()
    })

    it('renders deals dropdown when deals are present', async () => {
      const user = userEvent.setup()
      render(<DealsSection personId={123} personName="John Doe" deals={mockDeals} />)
      expect(screen.getByText('Select a deal...')).toBeInTheDocument()

      // Open dropdown to see deal titles
      await user.click(screen.getByRole('combobox'))
      expect(screen.getByText('Website Redesign Project')).toBeInTheDocument()
    })

    it('shows deal details when deal is selected', async () => {
      const user = userEvent.setup()
      render(<DealsSection personId={123} personName="John Doe" deals={mockDeals} />)

      const button = screen.getByRole('combobox')
      await user.click(button)
      await user.click(screen.getByText('Website Redesign Project'))

      // Deal details should now be visible (value, pipeline, stage - not title)
      expect(screen.getByText(/Value:/)).toBeInTheDocument()
      expect(screen.getByText(/\$50,000.00/)).toBeInTheDocument()

      // Title remains visible in the closed dropdown button
      expect(button).toHaveTextContent('Website Redesign Project')
    })

    it('hides deal details when no deal is selected', () => {
      render(<DealsSection personId={123} personName="John Doe" deals={mockDeals} />)

      // Should not show deal details initially
      expect(screen.queryByText(/Value:/)).not.toBeInTheDocument()
      expect(screen.queryByText(/Pipeline:/)).not.toBeInTheDocument()
    })

    it('calls onRetry when retry is clicked in error state', async () => {
      const user = userEvent.setup()
      const onRetry = vi.fn()
      render(<DealsSection personId={123} personName="John Doe" deals={null} onRetry={onRetry} />)

      const retryButton = screen.getByRole('button', { name: 'Retry' })
      await user.click(retryButton)

      expect(onRetry).toHaveBeenCalledTimes(1)
    })
  })

  describe('Edge Cases', () => {
    const mockPipelines = [
      { id: 1, name: 'Sales Pipeline', orderNr: 1, active: true },
      { id: 2, name: 'Enterprise Pipeline', orderNr: 2, active: true },
    ]

    const mockStages = [
      { id: 1, name: 'Proposal', orderNr: 1, pipelineId: 1 },
      { id: 2, name: 'Negotiation', orderNr: 2, pipelineId: 1 },
      { id: 3, name: 'Closed Won', orderNr: 3, pipelineId: 1 },
      { id: 4, name: 'Discovery', orderNr: 1, pipelineId: 2 },
      { id: 5, name: 'Qualification', orderNr: 2, pipelineId: 2 },
    ]

    it('handles very long deal title with DealDropdown', async () => {
      const longTitleDeal: Deal = {
        ...mockDeals[0],
        title: 'A'.repeat(200),
      }
      const onSelect = vi.fn()
      const user = userEvent.setup()
      render(<DealDropdown deals={[longTitleDeal]} selectedDealId={null} onSelect={onSelect} />)

      // Open dropdown to see the option
      await user.click(screen.getByRole('combobox'))
      expect(screen.getByText('A'.repeat(200))).toBeInTheDocument()
    })

    it('handles special characters in deal title with DealDropdown', async () => {
      const specialCharDeal: Deal = {
        ...mockDeals[0],
        title: '<script>alert("XSS")</script>',
      }
      const onSelect = vi.fn()
      const user = userEvent.setup()
      render(<DealDropdown deals={[specialCharDeal]} selectedDealId={null} onSelect={onSelect} />)

      // Open dropdown to see the option
      await user.click(screen.getByRole('combobox'))
      // React should escape this automatically
      expect(screen.getByText('<script>alert("XSS")</script>')).toBeInTheDocument()
    })

    it('handles zero value deal with DealDetails', () => {
      const zeroValueDeal: Deal = {
        ...mockDeals[0],
        value: '$0.00',
      }
      render(
        <DealDetails
          deal={zeroValueDeal}
          pipelines={mockPipelines}
          stages={mockStages}
          onDealUpdated={vi.fn()}
        />
      )
      expect(screen.getByText(/\$0.00/)).toBeInTheDocument()
    })

    it('handles invalid status gracefully with DealDropdown', async () => {
      const invalidStatusDeal: Deal = {
        ...mockDeals[0],
        status: 'invalid' as unknown as Deal['status'],
      }
      const onSelect = vi.fn()
      const user = userEvent.setup()
      // Should not crash, should fall back to default color
      render(<DealDropdown deals={[invalidStatusDeal]} selectedDealId={null} onSelect={onSelect} />)

      // Open dropdown to see the option
      await user.click(screen.getByRole('combobox'))
      expect(screen.getByText('Website Redesign Project')).toBeInTheDocument()
    })
  })
})
