import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PersonLookupLoading } from '../../src/content-script/components/PersonLookupLoading'
import { PersonMatchedCard } from '../../src/content-script/components/PersonMatchedCard'
import {
  PersonNoMatchState,
  isValidName,
} from '../../src/content-script/components/PersonNoMatchState'
import { PersonLookupError } from '../../src/content-script/components/PersonLookupError'
import type { Person } from '../../src/types/person'

// Mock usePipedrive hook
vi.mock('../../src/content-script/hooks/usePipedrive', () => ({
  usePipedrive: vi.fn(),
}))

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

  describe('isValidName validation', () => {
    it('returns false for empty string', () => {
      expect(isValidName('')).toBe(false)
    })

    it('returns false for single character', () => {
      expect(isValidName('A')).toBe(false)
    })

    it('returns true for 2 characters', () => {
      expect(isValidName('AB')).toBe(true)
    })

    it('returns true for valid names with spaces', () => {
      expect(isValidName('John Doe')).toBe(true)
      expect(isValidName('Mary Jane Watson')).toBe(true)
    })

    it('returns true for names with hyphens', () => {
      expect(isValidName('Jean-Pierre')).toBe(true)
      expect(isValidName('Mary-Anne Smith')).toBe(true)
    })

    it('returns true for names with apostrophes', () => {
      expect(isValidName("O'Brien")).toBe(true)
      expect(isValidName("D'Angelo")).toBe(true)
    })

    it('returns false for names with numbers', () => {
      expect(isValidName('John123')).toBe(false)
      expect(isValidName('Bob 2')).toBe(false)
    })

    it('returns false for names with special characters', () => {
      expect(isValidName('John@Doe')).toBe(false)
      expect(isValidName('Mary.Jane')).toBe(false)
      expect(isValidName('Bob#Smith')).toBe(false)
    })

    it('trims whitespace before validation', () => {
      expect(isValidName('  John Doe  ')).toBe(true)
      expect(isValidName('  A  ')).toBe(false)
      expect(isValidName('   ')).toBe(false)
    })

    it('handles mixed case names', () => {
      expect(isValidName('John DOE')).toBe(true)
      expect(isValidName('mcdonald')).toBe(true)
    })
  })

  describe('PersonNoMatchState', () => {
    const mockCreatePerson = vi.fn()
    const mockOnPersonCreated = vi.fn()
    const mockProps = {
      contactName: 'Bob Johnson',
      phone: '+48123456789',
      onPersonCreated: mockOnPersonCreated,
    }

    beforeEach(async () => {
      vi.clearAllMocks()
      // Mock usePipedrive hook implementation
      const { usePipedrive } = await import('../../src/content-script/hooks/usePipedrive')
      vi.mocked(usePipedrive).mockReturnValue({
        createPerson: mockCreatePerson,
        isLoading: false,
        error: null,
        lookupByPhone: vi.fn(),
        searchByName: vi.fn(),
        attachPhone: vi.fn(),
        clearError: vi.fn(),
      })
    })

    it('pre-fills name field with contact name', () => {
      render(<PersonNoMatchState {...mockProps} />)
      const nameInput = screen.getByDisplayValue('Bob Johnson')
      expect(nameInput).toBeInTheDocument()
    })

    it('displays phone number in header', () => {
      render(<PersonNoMatchState {...mockProps} />)
      const phoneNumbers = screen.getAllByText('+48123456789')
      expect(phoneNumbers.length).toBeGreaterThan(0)
      // Phone appears in header (contact info) and in "Or add the number..." section
      expect(phoneNumbers.length).toBe(2)
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

    it('Create button is enabled when name is valid', () => {
      render(<PersonNoMatchState {...mockProps} />)
      const createButton = screen.getByText('Create') as HTMLButtonElement
      expect(createButton.disabled).toBe(false)
    })

    it('Create button is disabled when name is invalid', async () => {
      const user = userEvent.setup()
      render(<PersonNoMatchState {...mockProps} />)

      const nameInput = screen.getByDisplayValue('Bob Johnson')
      await user.clear(nameInput)
      await user.type(nameInput, 'X')

      const createButton = screen.getByText('Create') as HTMLButtonElement
      expect(createButton.disabled).toBe(true)
    })

    it('Search field is disabled (Feature 11)', () => {
      render(<PersonNoMatchState {...mockProps} />)
      const searchInput = screen.getByPlaceholderText('Search contact...') as HTMLInputElement
      expect(searchInput.disabled).toBe(true)
    })

    it('allows editing the name field', async () => {
      const user = userEvent.setup()
      render(<PersonNoMatchState {...mockProps} />)

      const nameInput = screen.getByDisplayValue('Bob Johnson') as HTMLInputElement
      expect(nameInput.disabled).toBe(false)

      await user.clear(nameInput)
      await user.type(nameInput, 'Alice Smith')

      expect(nameInput.value).toBe('Alice Smith')
    })

    it('includes name input icon/label', () => {
      const { container } = render(<PersonNoMatchState {...mockProps} />)
      expect(container.textContent).toContain('T')
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

    it('calls createPerson when Create button clicked', async () => {
      const user = userEvent.setup()
      mockCreatePerson.mockResolvedValue({ id: 123, name: 'Bob Johnson', phones: [], email: null })

      render(<PersonNoMatchState {...mockProps} />)

      const createButton = screen.getByText('Create')
      await user.click(createButton)

      expect(mockCreatePerson).toHaveBeenCalledWith({
        name: 'Bob Johnson',
        phone: '+48123456789',
      })
    })

    it('calls onPersonCreated when person created successfully', async () => {
      const user = userEvent.setup()
      const mockPerson: Person = {
        id: 123,
        name: 'Bob Johnson',
        phones: [{ value: '+48123456789', label: 'WhatsApp', isPrimary: true }],
        email: null,
      }
      mockCreatePerson.mockResolvedValue(mockPerson)

      render(<PersonNoMatchState {...mockProps} />)

      const createButton = screen.getByText('Create')
      await user.click(createButton)

      await waitFor(() => {
        expect(mockOnPersonCreated).toHaveBeenCalledWith(mockPerson)
      })
    })

    it('shows loading state during creation', async () => {
      const user = userEvent.setup()
      mockCreatePerson.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(null), 100))
      )

      render(<PersonNoMatchState {...mockProps} />)

      const createButton = screen.getByText('Create')
      await user.click(createButton)

      expect(screen.getByText('Creating...')).toBeInTheDocument()
      expect(screen.getByLabelText('Loading')).toBeInTheDocument()
    })

    it('disables form during creation', async () => {
      const user = userEvent.setup()
      mockCreatePerson.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(null), 100))
      )

      render(<PersonNoMatchState {...mockProps} />)

      const createButton = screen.getByText('Create') as HTMLButtonElement
      await user.click(createButton)

      const nameInput = screen.getByDisplayValue('Bob Johnson') as HTMLInputElement
      expect(nameInput.disabled).toBe(true)
      expect(createButton.disabled).toBe(true)
    })

    it('shows error message when creation fails', async () => {
      const user = userEvent.setup()
      mockCreatePerson.mockResolvedValue(null)

      render(<PersonNoMatchState {...mockProps} />)

      const createButton = screen.getByText('Create')
      await user.click(createButton)

      await waitFor(() => {
        expect(screen.getByText('Failed to create contact. Please try again.')).toBeInTheDocument()
      })
    })

    it('can dismiss error message', async () => {
      const user = userEvent.setup()
      mockCreatePerson.mockResolvedValue(null)

      render(<PersonNoMatchState {...mockProps} />)

      const createButton = screen.getByText('Create')
      await user.click(createButton)

      await waitFor(() => {
        expect(screen.getByText('Failed to create contact. Please try again.')).toBeInTheDocument()
      })

      const dismissButton = screen.getByLabelText('Dismiss error')
      await user.click(dismissButton)

      expect(
        screen.queryByText('Failed to create contact. Please try again.')
      ).not.toBeInTheDocument()
    })

    it('clears error when user starts typing', async () => {
      const user = userEvent.setup()
      mockCreatePerson.mockResolvedValue(null)

      render(<PersonNoMatchState {...mockProps} />)

      const createButton = screen.getByText('Create')
      await user.click(createButton)

      await waitFor(() => {
        expect(screen.getByText('Failed to create contact. Please try again.')).toBeInTheDocument()
      })

      const nameInput = screen.getByDisplayValue('Bob Johnson')
      await user.type(nameInput, ' Jr.')

      expect(
        screen.queryByText('Failed to create contact. Please try again.')
      ).not.toBeInTheDocument()
    })

    it('trims name before submitting', async () => {
      const user = userEvent.setup()
      mockCreatePerson.mockResolvedValue({ id: 123, name: 'Alice Smith', phones: [], email: null })

      render(<PersonNoMatchState {...mockProps} />)

      const nameInput = screen.getByDisplayValue('Bob Johnson')
      await user.clear(nameInput)
      await user.type(nameInput, '  Alice Smith  ')

      const createButton = screen.getByText('Create')
      await user.click(createButton)

      expect(mockCreatePerson).toHaveBeenCalledWith({
        name: 'Alice Smith',
        phone: '+48123456789',
      })
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
