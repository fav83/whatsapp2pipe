import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DealDropdown } from '../../src/content-script/components/DealDropdown'
import { DealDetails } from '../../src/content-script/components/DealDetails'
import { DealsSection } from '../../src/content-script/components/DealsSection'
import { DealsLoadingSkeleton } from '../../src/content-script/components/DealsLoadingSkeleton'
import { DealsErrorState } from '../../src/content-script/components/DealsErrorState'
import type { Deal, DealPipeline, DealStage } from '../../src/types/deal'

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
    it('renders nothing when deal is undefined', () => {
      const { container } = render(<DealDetails deal={undefined} />)
      expect(container.firstChild).toBeNull()
    })

    it('renders deal value with label', () => {
      render(<DealDetails deal={mockDeals[0]} />)
      expect(screen.getByText(/Value:/)).toBeInTheDocument()
      expect(screen.getByText(/\$50,000.00/)).toBeInTheDocument()
    })

    it('renders pipeline name with label', () => {
      render(<DealDetails deal={mockDeals[0]} />)
      expect(screen.getByText(/Pipeline:/)).toBeInTheDocument()
      expect(screen.getByText(/Sales Pipeline/)).toBeInTheDocument()
    })

    it('renders stage name with label', () => {
      render(<DealDetails deal={mockDeals[0]} />)
      expect(screen.getByText(/Stage:/)).toBeInTheDocument()
      expect(screen.getByText(/Proposal/)).toBeInTheDocument()
    })

    it('handles missing pipeline gracefully', () => {
      const dealWithoutPipeline: Deal = {
        ...mockDeals[0],
        pipeline: undefined as unknown as DealPipeline,
      }
      render(<DealDetails deal={dealWithoutPipeline} />)
      expect(screen.getByText(/Unknown Pipeline/)).toBeInTheDocument()
    })

    it('handles missing stage gracefully', () => {
      const dealWithoutStage: Deal = {
        ...mockDeals[0],
        stage: undefined as unknown as DealStage,
      }
      render(<DealDetails deal={dealWithoutStage} />)
      expect(screen.getByText(/Unknown Stage/)).toBeInTheDocument()
    })

    it('has correct spacing', () => {
      const { container } = render(<DealDetails deal={mockDeals[0]} />)
      const wrapper = container.firstChild as HTMLElement
      expect(wrapper.className).toContain('pt-3')
      expect(wrapper.className).toContain('space-y-2')
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
      expect(screen.getByRole('button', { name: 'Create Deal' })).toBeInTheDocument()
    })

    it('renders deals dropdown when deals are present', () => {
      render(<DealsSection personId={123} personName="John Doe" deals={mockDeals} />)
      expect(screen.getByText('Select a deal...')).toBeInTheDocument()
      expect(screen.getByText('Website Redesign Project')).toBeInTheDocument()
    })

    it('shows deal details when deal is selected', async () => {
      const user = userEvent.setup()
      render(<DealsSection personId={123} personName="John Doe" deals={mockDeals} />)

      const button = screen.getByRole('combobox')
      await user.click(button)
      await user.click(screen.getByText('Website Redesign Project'))

      // Deal details should now be visible (title only in dropdown, not in details)
      expect(screen.getByText('Website Redesign Project')).toBeInTheDocument()
      expect(screen.getByText(/Value:/)).toBeInTheDocument()
      expect(screen.getByText(/\$50,000.00/)).toBeInTheDocument()
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
    it('handles very long deal title', () => {
      const longTitleDeal: Deal = {
        ...mockDeals[0],
        title: 'A'.repeat(200),
      }
      const onSelect = vi.fn()
      render(<DealDropdown deals={[longTitleDeal]} selectedDealId={null} onSelect={onSelect} />)
      expect(screen.getByText('A'.repeat(200))).toBeInTheDocument()
    })

    it('handles special characters in deal title', () => {
      const specialCharDeal: Deal = {
        ...mockDeals[0],
        title: '<script>alert("XSS")</script>',
      }
      const onSelect = vi.fn()
      render(<DealDropdown deals={[specialCharDeal]} selectedDealId={null} onSelect={onSelect} />)
      // React should escape this automatically
      expect(screen.getByText('<script>alert("XSS")</script>')).toBeInTheDocument()
    })

    it('handles zero value deal', () => {
      const zeroValueDeal: Deal = {
        ...mockDeals[0],
        value: '$0.00',
      }
      render(<DealDetails deal={zeroValueDeal} />)
      expect(screen.getByText(/\$0.00/)).toBeInTheDocument()
    })

    it('handles invalid status gracefully', () => {
      const invalidStatusDeal: Deal = {
        ...mockDeals[0],
        status: 'invalid' as unknown as Deal['status'],
      }
      const onSelect = vi.fn()
      // Should not crash, should fall back to default color
      render(<DealDropdown deals={[invalidStatusDeal]} selectedDealId={null} onSelect={onSelect} />)
      expect(screen.getByText('Website Redesign Project')).toBeInTheDocument()
    })
  })
})
