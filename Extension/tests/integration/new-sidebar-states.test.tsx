import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ContactWarningCard } from '../../src/content-script/components/ContactWarningCard'
import { GroupChatState } from '../../src/content-script/components/GroupChatState'

describe('New Sidebar UI States (Spec-104)', () => {
  describe('ContactWarningCard', () => {
    it('renders contact warning card with name and warning', () => {
      render(
        <ContactWarningCard
          name="John Doe"
          warning="Phone number unavailable - matching by name only"
        />
      )
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('Phone number unavailable')).toBeInTheDocument()
      expect(
        screen.getByText('Phone number unavailable - matching by name only')
      ).toBeInTheDocument()
    })

    it('displays name with correct styling', () => {
      render(<ContactWarningCard name="John Doe" warning="Test warning" />)
      const name = screen.getByText('John Doe')
      expect(name.className).toContain('text-base')
      expect(name.className).toContain('font-semibold')
      expect(name.className).toContain('text-[#111b21]')
    })

    it('displays warning icon', () => {
      render(<ContactWarningCard name="John Doe" warning="Test warning" />)
      const icon = screen.getByText('⚠️')
      expect(icon).toBeInTheDocument()
      expect(icon.className).toContain('text-[#e9730c]')
    })

    it('uses amber/yellow warning colors', () => {
      const { container } = render(<ContactWarningCard name="John Doe" warning="Test warning" />)
      const warningBox = container.querySelector('.bg-\\[\\#fff4e5\\]')
      expect(warningBox).toBeInTheDocument()
    })

    it('displays warning message with correct styling', () => {
      render(<ContactWarningCard name="John Doe" warning="Custom warning message" />)
      const warningText = screen.getByText('Custom warning message')
      expect(warningText.className).toContain('text-xs')
      expect(warningText.className).toContain('text-[#667781]')
    })

    it('displays title "Phone number unavailable"', () => {
      render(<ContactWarningCard name="John Doe" warning="Test" />)
      const title = screen.getByText('Phone number unavailable')
      expect(title.className).toContain('font-medium')
    })
  })

  describe('GroupChatState', () => {
    it('renders group chat state with correct message', () => {
      render(<GroupChatState />)
      expect(screen.getByText('Group chats are not supported')).toBeInTheDocument()
      expect(
        screen.getByText('Please select a 1:1 chat to view contact information')
      ).toBeInTheDocument()
    })

    it('applies correct styling classes', () => {
      const { container } = render(<GroupChatState />)
      const wrapper = container.firstChild as HTMLElement
      expect(wrapper.className).toContain('px-5')
      expect(wrapper.className).toContain('pt-5')
    })

    it('uses gray info color (not error red)', () => {
      const { container } = render(<GroupChatState />)
      const box = container.querySelector('.bg-\\[\\#f0f2f5\\]')
      expect(box).toBeInTheDocument()
    })

    it('centers text', () => {
      render(<GroupChatState />)
      const mainText = screen.getByText('Group chats are not supported')
      expect(mainText.className).toContain('text-center')

      const instructionText = screen.getByText(
        'Please select a 1:1 chat to view contact information'
      )
      expect(instructionText.className).toContain('text-center')
    })

    it('uses medium gray text color', () => {
      render(<GroupChatState />)
      const mainText = screen.getByText('Group chats are not supported')
      expect(mainText.className).toContain('text-[#667781]')
    })
  })
})
