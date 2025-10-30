import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PersonLookupLoading } from '../../src/content-script/components/PersonLookupLoading'
import { PersonMatchedCard } from '../../src/content-script/components/PersonMatchedCard'
import { PersonNoMatchState } from '../../src/content-script/components/PersonNoMatchState'
import { PersonLookupError } from '../../src/content-script/components/PersonLookupError'

describe('Person Lookup Components', () => {
  describe('PersonLookupLoading', () => {
    it('renders contact name immediately (not skeleton)', () => {
      render(<PersonLookupLoading contactName="John Doe" phone="+1234567890" />)
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })

    it('renders phone number immediately (not skeleton)', () => {
      render(<PersonLookupLoading contactName="John Doe" phone="+1234567890" />)
      expect(screen.getByText('+1234567890')).toBeInTheDocument()
    })

    it('displays name with correct styling', () => {
      render(<PersonLookupLoading contactName="John Doe" phone="+1234567890" />)
      const name = screen.getByText('John Doe')
      expect(name.className).toContain('text-base')
      expect(name.className).toContain('font-semibold')
      expect(name.className).toContain('text-[#111b21]')
    })

    it('displays phone with correct styling', () => {
      render(<PersonLookupLoading contactName="John Doe" phone="+1234567890" />)
      const phone = screen.getByText('+1234567890')
      expect(phone.className).toContain('text-sm')
      expect(phone.className).toContain('text-[#667781]')
    })

    it('shows skeleton placeholders with animation', () => {
      const { container } = render(
        <PersonLookupLoading contactName="John Doe" phone="+1234567890" />
      )
      const skeleton = container.querySelector('.animate-pulse')
      expect(skeleton).toBeInTheDocument()
    })

    it('skeleton has multiple placeholder lines', () => {
      const { container } = render(
        <PersonLookupLoading contactName="John Doe" phone="+1234567890" />
      )
      const placeholders = container.querySelectorAll('.bg-\\[\\#f0f2f5\\]')
      expect(placeholders.length).toBeGreaterThanOrEqual(3)
    })
  })

  describe('PersonMatchedCard', () => {
    const mockProps = {
      name: 'Jane Smith',
      phone: '+34646852630',
      pipedriveUrl: 'https://example.pipedrive.com/person/123',
    }

    it('renders person name from props', () => {
      render(<PersonMatchedCard {...mockProps} />)
      expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    })

    it('renders phone number', () => {
      render(<PersonMatchedCard {...mockProps} />)
      expect(screen.getByText('+34646852630')).toBeInTheDocument()
    })

    it('renders "Open in Pipedrive" link', () => {
      render(<PersonMatchedCard {...mockProps} />)
      const link = screen.getByText('Open in Pipedrive').closest('a')
      expect(link).toBeInTheDocument()
      expect(link?.getAttribute('href')).toBe('https://example.pipedrive.com/person/123')
    })

    it('link opens in new tab', () => {
      render(<PersonMatchedCard {...mockProps} />)
      const link = screen.getByText('Open in Pipedrive').closest('a')
      expect(link?.getAttribute('target')).toBe('_blank')
      expect(link?.getAttribute('rel')).toBe('noopener noreferrer')
    })

    it('link has correct styling', () => {
      render(<PersonMatchedCard {...mockProps} />)
      const link = screen.getByText('Open in Pipedrive').closest('a')
      expect(link?.className).toContain('bg-[#00a884]')
      expect(link?.className).toContain('text-white')
      expect(link?.className).toContain('rounded-lg')
      expect(link?.className).toContain('hover:bg-[#008f6f]')
    })

    it('includes external link icon', () => {
      const { container } = render(<PersonMatchedCard {...mockProps} />)
      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })

    it('displays person name with correct styling', () => {
      render(<PersonMatchedCard {...mockProps} />)
      const name = screen.getByText('Jane Smith')
      expect(name.className).toContain('text-base')
      expect(name.className).toContain('font-semibold')
      expect(name.className).toContain('text-[#111b21]')
    })

    it('has border and white background', () => {
      const { container } = render(<PersonMatchedCard {...mockProps} />)
      const card = container.querySelector('.border-\\[\\#d1d7db\\]')
      expect(card).toBeInTheDocument()
      expect(card?.className).toContain('bg-white')
    })
  })

  describe('PersonNoMatchState', () => {
    const mockProps = {
      contactName: 'Bob Johnson',
      phone: '+48123456789',
    }

    it('pre-fills name field with contact name', () => {
      render(<PersonNoMatchState {...mockProps} />)
      const nameInput = screen.getByDisplayValue('Bob Johnson')
      expect(nameInput).toBeInTheDocument()
    })

    it('email field is empty by default', () => {
      render(<PersonNoMatchState {...mockProps} />)
      const emailInput = screen.getByPlaceholderText('Email') as HTMLInputElement
      expect(emailInput.value).toBe('')
    })

    it('displays phone number in "Or add..." section', () => {
      render(<PersonNoMatchState {...mockProps} />)
      expect(screen.getByText('+48123456789')).toBeInTheDocument()
    })

    it('renders "Add this contact to Pipedrive" heading', () => {
      render(<PersonNoMatchState {...mockProps} />)
      expect(screen.getByText('Add this contact to Pipedrive')).toBeInTheDocument()
    })

    it('renders "Or add the number..." text', () => {
      render(<PersonNoMatchState {...mockProps} />)
      expect(screen.getByText(/Or add the number/i)).toBeInTheDocument()
      expect(screen.getByText(/to an existing contact/i)).toBeInTheDocument()
    })

    it('Create button is disabled (non-functional in MVP)', () => {
      render(<PersonNoMatchState {...mockProps} />)
      const createButton = screen.getByText('Create') as HTMLButtonElement
      expect(createButton.disabled).toBe(true)
    })

    it('Search field is disabled (non-functional in MVP)', () => {
      render(<PersonNoMatchState {...mockProps} />)
      const searchInput = screen.getByPlaceholderText('Search contact...') as HTMLInputElement
      expect(searchInput.disabled).toBe(true)
    })

    it('Name input is disabled (non-functional in MVP)', () => {
      render(<PersonNoMatchState {...mockProps} />)
      const nameInput = screen.getByDisplayValue('Bob Johnson') as HTMLInputElement
      expect(nameInput.disabled).toBe(true)
    })

    it('Email input is disabled (non-functional in MVP)', () => {
      render(<PersonNoMatchState {...mockProps} />)
      const emailInput = screen.getByPlaceholderText('Email') as HTMLInputElement
      expect(emailInput.disabled).toBe(true)
    })

    it('includes name input icon/label', () => {
      const { container } = render(<PersonNoMatchState {...mockProps} />)
      expect(container.textContent).toContain('T')
    })

    it('includes email input icon/label', () => {
      const { container } = render(<PersonNoMatchState {...mockProps} />)
      expect(container.textContent).toContain('@')
    })

    it('includes search icon', () => {
      const { container } = render(<PersonNoMatchState {...mockProps} />)
      const searchIcon = container.querySelector('svg')
      expect(searchIcon).toBeInTheDocument()
    })

    it('has visual section separation', () => {
      const { container } = render(<PersonNoMatchState {...mockProps} />)
      const separator = container.querySelector('.border-t')
      expect(separator).toBeInTheDocument()
    })
  })

  describe('PersonLookupError', () => {
    it('renders error message', () => {
      const onRetry = vi.fn()
      render(<PersonLookupError errorMessage="Network connection failed" onRetry={onRetry} />)
      expect(screen.getByText('Network connection failed')).toBeInTheDocument()
    })

    it('renders "Try again" button', () => {
      const onRetry = vi.fn()
      render(<PersonLookupError errorMessage="Test error" onRetry={onRetry} />)
      expect(screen.getByText('Try again')).toBeInTheDocument()
    })

    it('calls onRetry when button clicked', async () => {
      const onRetry = vi.fn()
      const user = userEvent.setup()
      render(<PersonLookupError errorMessage="Test error" onRetry={onRetry} />)

      const button = screen.getByText('Try again')
      await user.click(button)

      expect(onRetry).toHaveBeenCalledOnce()
    })

    it('button has correct styling', () => {
      const onRetry = vi.fn()
      render(<PersonLookupError errorMessage="Test error" onRetry={onRetry} />)
      const button = screen.getByText('Try again')
      expect(button.className).toContain('bg-[#00a884]')
      expect(button.className).toContain('text-white')
      expect(button.className).toContain('rounded-lg')
    })

    it('displays error icon', () => {
      const onRetry = vi.fn()
      const { container } = render(
        <PersonLookupError errorMessage="Test error" onRetry={onRetry} />
      )
      const icon = container.querySelector('svg')
      expect(icon).toBeInTheDocument()
    })

    it('error icon has red styling', () => {
      const onRetry = vi.fn()
      const { container } = render(
        <PersonLookupError errorMessage="Test error" onRetry={onRetry} />
      )
      const icon = container.querySelector('.text-red-500')
      expect(icon).toBeInTheDocument()
    })

    it('displays different error messages', () => {
      const onRetry = vi.fn()
      const { rerender } = render(
        <PersonLookupError errorMessage="Authentication expired" onRetry={onRetry} />
      )
      expect(screen.getByText('Authentication expired')).toBeInTheDocument()

      rerender(<PersonLookupError errorMessage="Too many requests" onRetry={onRetry} />)
      expect(screen.getByText('Too many requests')).toBeInTheDocument()

      rerender(<PersonLookupError errorMessage="Server error" onRetry={onRetry} />)
      expect(screen.getByText('Server error')).toBeInTheDocument()
    })

    it('supports multiple retry clicks', async () => {
      const onRetry = vi.fn()
      const user = userEvent.setup()
      render(<PersonLookupError errorMessage="Test error" onRetry={onRetry} />)

      const button = screen.getByText('Try again')
      await user.click(button)
      await user.click(button)

      expect(onRetry).toHaveBeenCalledTimes(2)
    })
  })
})
