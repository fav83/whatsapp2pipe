import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { WelcomeState } from '../../src/content-script/components/WelcomeState'
import { ContactInfoCard } from '../../src/content-script/components/ContactInfoCard'
import { LoadingState } from '../../src/content-script/components/LoadingState'
import { ErrorState } from '../../src/content-script/components/ErrorState'

describe('Sidebar UI States', () => {
  describe('WelcomeState', () => {
    it('renders welcome state with correct message', () => {
      render(<WelcomeState />)
      expect(screen.getByText('Select a chat to view contact information')).toBeInTheDocument()
    })

    it('applies correct styling classes', () => {
      const { container } = render(<WelcomeState />)
      const wrapper = container.firstChild as HTMLElement
      expect(wrapper.className).toContain('px-5')
      expect(wrapper.className).toContain('pt-5')
    })

    it('uses medium gray text color', () => {
      const { container } = render(<WelcomeState />)
      const text = container.querySelector('p')
      expect(text?.className).toContain('text-[#667781]')
    })
  })

  describe('ContactInfoCard', () => {
    it('renders contact info card with name and phone', () => {
      render(<ContactInfoCard name="John Doe" phone="+1234567890" />)
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('+1234567890')).toBeInTheDocument()
    })

    it('displays name with correct styling', () => {
      render(<ContactInfoCard name="John Doe" phone="+1234567890" />)
      const name = screen.getByText('John Doe')
      expect(name.className).toContain('text-base')
      expect(name.className).toContain('font-semibold')
      expect(name.className).toContain('text-[#111b21]')
    })

    it('displays phone with correct styling', () => {
      render(<ContactInfoCard name="John Doe" phone="+1234567890" />)
      const phone = screen.getByText('+1234567890')
      expect(phone.className).toContain('text-sm')
      expect(phone.className).toContain('text-[#667781]')
    })

    it('has light gray background', () => {
      const { container } = render(<ContactInfoCard name="John Doe" phone="+1234567890" />)
      const card = container.firstChild as HTMLElement
      expect(card.className).toContain('bg-[#f0f2f5]')
    })

    it('has rounded corners', () => {
      const { container } = render(<ContactInfoCard name="John Doe" phone="+1234567890" />)
      const card = container.firstChild as HTMLElement
      expect(card.className).toContain('rounded-lg')
    })

    it('displays full phone number without truncation', () => {
      const longPhone = '+1234567890123456'
      render(<ContactInfoCard name="John Doe" phone={longPhone} />)
      expect(screen.getByText(longPhone)).toBeInTheDocument()
    })
  })

  describe('LoadingState', () => {
    it('renders loading state with spinner', () => {
      const { container } = render(<LoadingState />)
      const spinner = container.querySelector('.animate-spin')
      expect(spinner).toBeInTheDocument()
    })

    it('spinner has correct size', () => {
      const { container } = render(<LoadingState />)
      const spinner = container.querySelector('.animate-spin') as HTMLElement
      expect(spinner.className).toContain('h-8')
      expect(spinner.className).toContain('w-8')
    })

    it('spinner uses WhatsApp green color', () => {
      const { container } = render(<LoadingState />)
      const spinner = container.querySelector('.animate-spin') as HTMLElement
      expect(spinner.className).toContain('border-[#00a884]')
    })

    it('spinner is centered', () => {
      const { container } = render(<LoadingState />)
      const wrapper = container.firstChild as HTMLElement
      expect(wrapper.className).toContain('flex')
      expect(wrapper.className).toContain('items-center')
      expect(wrapper.className).toContain('justify-center')
    })

    it('has no text content', () => {
      const { container } = render(<LoadingState />)
      const text = container.textContent
      expect(text).toBe('')
    })
  })

  describe('ErrorState', () => {
    it('renders error state with retry button', () => {
      const onRetry = vi.fn()
      render(<ErrorState message="Test error" onRetry={onRetry} />)
      expect(screen.getByText('Test error')).toBeInTheDocument()
      expect(screen.getByText('Retry')).toBeInTheDocument()
    })

    it('displays error message with correct styling', () => {
      const onRetry = vi.fn()
      render(<ErrorState message="Test error" onRetry={onRetry} />)
      const message = screen.getByText('Test error')
      expect(message.className).toContain('text-sm')
      expect(message.className).toContain('text-[#667781]')
      expect(message.className).toContain('mb-4')
    })

    it('retry button has correct styling', () => {
      const onRetry = vi.fn()
      render(<ErrorState message="Test error" onRetry={onRetry} />)
      const button = screen.getByText('Retry')
      expect(button.className).toContain('bg-[#00a884]')
      expect(button.className).toContain('text-white')
      expect(button.className).toContain('rounded-lg')
      expect(button.className).toContain('hover:bg-[#008f6f]')
    })

    it('calls onRetry when retry button is clicked', async () => {
      const onRetry = vi.fn()
      const user = userEvent.setup()
      render(<ErrorState message="Test error" onRetry={onRetry} />)

      const button = screen.getByText('Retry')
      await user.click(button)

      expect(onRetry).toHaveBeenCalledOnce()
    })

    it('supports multiple retry clicks', async () => {
      const onRetry = vi.fn()
      const user = userEvent.setup()
      render(<ErrorState message="Test error" onRetry={onRetry} />)

      const button = screen.getByText('Retry')
      await user.click(button)
      await user.click(button)
      await user.click(button)

      expect(onRetry).toHaveBeenCalledTimes(3)
    })

    it('displays user-friendly error messages', () => {
      const onRetry = vi.fn()
      const { rerender } = render(
        <ErrorState message="Unable to connect to Pipedrive" onRetry={onRetry} />
      )
      expect(screen.getByText('Unable to connect to Pipedrive')).toBeInTheDocument()

      rerender(<ErrorState message="Failed to load contact information" onRetry={onRetry} />)
      expect(screen.getByText('Failed to load contact information')).toBeInTheDocument()

      rerender(<ErrorState message="Something went wrong" onRetry={onRetry} />)
      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    })
  })
})
