import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ConfigMessageBanner } from './ConfigMessageBanner'

describe('ConfigMessageBanner', () => {
  describe('Rendering', () => {
    it('renders markdown content correctly', () => {
      const markdown = 'Check out our **new features**!'
      render(<ConfigMessageBanner markdown={markdown} onDismiss={() => {}} />)

      expect(screen.getByText(/Check out our/)).toBeInTheDocument()
      expect(screen.getByText(/new features/)).toBeInTheDocument()
      const strongElement = screen.getByText('new features')
      expect(strongElement.tagName).toBe('STRONG')
    })

    it('renders links with correct attributes', () => {
      const markdown = '<a href="https://example.com" target="_blank">Click here</a>'
      render(<ConfigMessageBanner markdown={markdown} onDismiss={() => {}} />)

      const link = screen.getByRole('link', { name: /Click here/i })
      expect(link).toHaveAttribute('href', 'https://example.com')
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    })

    it('renders complex markdown with inline HTML', () => {
      const markdown =
        'Check out our **new features** and learn more! <a href="https://example.com" target="_blank">Read more</a>'
      render(<ConfigMessageBanner markdown={markdown} onDismiss={() => {}} />)

      expect(screen.getByText(/Check out our/)).toBeInTheDocument()
      expect(screen.getByText('new features')).toBeInTheDocument()
      const link = screen.getByRole('link', { name: /Read more/i })
      expect(link).toHaveAttribute('href', 'https://example.com')
    })

    it('renders dismiss button', () => {
      render(<ConfigMessageBanner markdown="Test message" onDismiss={() => {}} />)

      const dismissButton = screen.getByRole('button', { name: /Dismiss message/i })
      expect(dismissButton).toBeInTheDocument()
    })
  })

  describe('HTML Sanitization', () => {
    it('sanitizes dangerous script tags', () => {
      const markdown = 'Safe content <script>alert("XSS")</script> more content'
      render(<ConfigMessageBanner markdown={markdown} onDismiss={() => {}} />)

      expect(screen.getByText(/Safe content/)).toBeInTheDocument()
      expect(screen.queryByText(/alert/)).not.toBeInTheDocument()
      // Script tag should not be in the DOM
      expect(document.querySelector('script')).not.toBeInTheDocument()
    })

    it('sanitizes onclick attributes', () => {
      const markdown = '<a href="https://example.com" onclick="alert(\'XSS\')">Click</a>'
      render(<ConfigMessageBanner markdown={markdown} onDismiss={() => {}} />)

      const link = screen.getByRole('link', { name: /Click/i })
      expect(link).not.toHaveAttribute('onclick')
    })

    it('sanitizes iframe tags', () => {
      const markdown = 'Content <iframe src="https://evil.com"></iframe> more content'
      render(<ConfigMessageBanner markdown={markdown} onDismiss={() => {}} />)

      expect(screen.queryByTitle('iframe')).not.toBeInTheDocument()
      expect(document.querySelector('iframe')).not.toBeInTheDocument()
    })

    it('allows safe HTML tags', () => {
      const markdown = '<p>Paragraph</p><strong>Bold</strong><em>Italic</em><ul><li>Item</li></ul>'
      render(<ConfigMessageBanner markdown={markdown} onDismiss={() => {}} />)

      expect(screen.getByText('Paragraph')).toBeInTheDocument()
      expect(screen.getByText('Bold')).toBeInTheDocument()
      expect(screen.getByText('Italic')).toBeInTheDocument()
      expect(screen.getByText('Item')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA attributes on banner', () => {
      render(<ConfigMessageBanner markdown="Test message" onDismiss={() => {}} />)

      const banner = screen.getByRole('region', { name: /Admin message/i })
      expect(banner).toBeInTheDocument()
    })

    it('has accessible dismiss button with aria-label', () => {
      render(<ConfigMessageBanner markdown="Test message" onDismiss={() => {}} />)

      const dismissButton = screen.getByRole('button', { name: /Dismiss message/i })
      expect(dismissButton).toHaveAttribute('aria-label', 'Dismiss message')
    })

    it('links are keyboard accessible', async () => {
      const markdown = '<a href="https://example.com">Link</a>'
      render(<ConfigMessageBanner markdown={markdown} onDismiss={() => {}} />)

      const link = screen.getByRole('link', { name: /Link/i })
      link.focus()
      expect(link).toHaveFocus()
    })
  })

  describe('Interaction', () => {
    it('calls onDismiss when dismiss button is clicked', async () => {
      const user = userEvent.setup()
      const onDismiss = vi.fn()
      render(<ConfigMessageBanner markdown="Test message" onDismiss={onDismiss} />)

      const dismissButton = screen.getByRole('button', { name: /Dismiss message/i })
      await user.click(dismissButton)

      expect(onDismiss).toHaveBeenCalledTimes(1)
    })

    it('dismiss button is keyboard accessible', async () => {
      const user = userEvent.setup()
      const onDismiss = vi.fn()
      render(<ConfigMessageBanner markdown="Test message" onDismiss={onDismiss} />)

      const dismissButton = screen.getByRole('button', { name: /Dismiss message/i })
      dismissButton.focus()
      await user.keyboard('{Enter}')

      expect(onDismiss).toHaveBeenCalledTimes(1)
    })
  })

  describe('Styling', () => {
    it('applies correct CSS classes for dark theme', () => {
      render(<ConfigMessageBanner markdown="Test message" onDismiss={() => {}} />)

      const banner = screen.getByRole('region')
      expect(banner).toHaveClass('bg-slate-500')
      expect(banner).toHaveClass('border-slate-600')
    })

    it('applies correct link styling classes', () => {
      const markdown = '<a href="https://example.com">Link</a>'
      render(<ConfigMessageBanner markdown={markdown} onDismiss={() => {}} />)

      const link = screen.getByRole('link', { name: /Link/i })
      expect(link).toHaveClass('text-blue-200')
      expect(link).toHaveClass('hover:text-blue-100')
      expect(link).toHaveClass('underline')
      expect(link).toHaveClass('font-medium')
    })
  })

  describe('Edge Cases', () => {
    it('handles empty markdown', () => {
      render(<ConfigMessageBanner markdown="" onDismiss={() => {}} />)

      const banner = screen.getByRole('region')
      expect(banner).toBeInTheDocument()
    })

    it('handles very long markdown content', () => {
      const longMarkdown = 'A'.repeat(1000) + ' <a href="https://example.com">Link</a>'
      render(<ConfigMessageBanner markdown={longMarkdown} onDismiss={() => {}} />)

      expect(screen.getByRole('region')).toBeInTheDocument()
      expect(screen.getByRole('link')).toBeInTheDocument()
    })

    it('handles markdown with newlines', () => {
      const markdown = 'Line 1\n\nLine 2'
      render(<ConfigMessageBanner markdown={markdown} onDismiss={() => {}} />)

      expect(screen.getByText(/Line 1/)).toBeInTheDocument()
      expect(screen.getByText(/Line 2/)).toBeInTheDocument()
    })

    it('handles multiple links in content', () => {
      const markdown =
        '<a href="https://example.com/1">Link 1</a> and <a href="https://example.com/2">Link 2</a>'
      render(<ConfigMessageBanner markdown={markdown} onDismiss={() => {}} />)

      const links = screen.getAllByRole('link')
      expect(links).toHaveLength(2)
      expect(links[0]).toHaveAttribute('href', 'https://example.com/1')
      expect(links[1]).toHaveAttribute('href', 'https://example.com/2')
    })
  })
})
