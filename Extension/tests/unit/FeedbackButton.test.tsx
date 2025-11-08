import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FeedbackButton } from '../../src/content-script/components/FeedbackButton'

describe('FeedbackButton', () => {
  it('renders the button', () => {
    const onClick = vi.fn()
    render(<FeedbackButton onClick={onClick} />)
    const button = screen.getByRole('button', { name: 'Send feedback' })
    expect(button).toBeInTheDocument()
  })

  it('displays "Send Feedback" text', () => {
    const onClick = vi.fn()
    render(<FeedbackButton onClick={onClick} />)
    expect(screen.getByText('Send Feedback')).toBeInTheDocument()
  })

  it('calls onClick when clicked', async () => {
    const onClick = vi.fn()
    const user = userEvent.setup()
    render(<FeedbackButton onClick={onClick} />)

    const button = screen.getByRole('button', { name: 'Send feedback' })
    await user.click(button)

    expect(onClick).toHaveBeenCalledOnce()
  })

  it('has correct aria-label', () => {
    const onClick = vi.fn()
    render(<FeedbackButton onClick={onClick} />)
    const button = screen.getByRole('button', { name: 'Send feedback' })
    expect(button.getAttribute('aria-label')).toBe('Send feedback')
  })

  it('has correct base styling classes', () => {
    const onClick = vi.fn()
    render(<FeedbackButton onClick={onClick} />)
    const button = screen.getByRole('button', { name: 'Send feedback' })
    expect(button.className).toContain('w-full')
    expect(button.className).toContain('h-[38px]')
    expect(button.className).toContain('rounded-lg')
    expect(button.className).toContain('border')
  })

  it('has hover state classes', () => {
    const onClick = vi.fn()
    render(<FeedbackButton onClick={onClick} />)
    const button = screen.getByRole('button', { name: 'Send feedback' })
    expect(button.className).toContain('hover:bg-brand-primary')
    expect(button.className).toContain('hover:text-white')
    expect(button.className).toContain('hover:border-brand-primary')
  })

  it('includes the speech bubble icon', () => {
    const onClick = vi.fn()
    const { container } = render(<FeedbackButton onClick={onClick} />)
    const icon = container.querySelector('svg')
    expect(icon).toBeInTheDocument()
    expect(icon?.getAttribute('width')).toBe('16')
    expect(icon?.getAttribute('height')).toBe('16')
  })

  it('can be clicked multiple times', async () => {
    const onClick = vi.fn()
    const user = userEvent.setup()
    render(<FeedbackButton onClick={onClick} />)

    const button = screen.getByRole('button', { name: 'Send feedback' })
    await user.click(button)
    await user.click(button)
    await user.click(button)

    expect(onClick).toHaveBeenCalledTimes(3)
  })

  it('has transition-colors class for smooth animations', () => {
    const onClick = vi.fn()
    render(<FeedbackButton onClick={onClick} />)
    const button = screen.getByRole('button', { name: 'Send feedback' })
    expect(button.className).toContain('transition-colors')
  })

  it('has cursor-pointer class', () => {
    const onClick = vi.fn()
    render(<FeedbackButton onClick={onClick} />)
    const button = screen.getByRole('button', { name: 'Send feedback' })
    expect(button.className).toContain('cursor-pointer')
  })
})
