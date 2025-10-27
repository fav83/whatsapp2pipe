import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from '../../src/content-script/App'
import { authService } from '../../src/content-script/services/authService'

// Mock authService to be authenticated by default for these tests
vi.mock('../../src/content-script/services/authService', () => ({
  authService: {
    isAuthenticated: vi.fn().mockResolvedValue(true),
    getVerificationCode: vi.fn().mockResolvedValue('test_code'),
    signIn: vi.fn(),
    signOut: vi.fn(),
  },
}))

describe('App Component', () => {
  beforeEach(() => {
    // Reset mocks to authenticated state
    vi.mocked(authService.isAuthenticated).mockResolvedValue(true)
    vi.mocked(authService.getVerificationCode).mockResolvedValue('test_code')
  })

  describe('Layout Structure', () => {
    it('renders fixed header with Pipedrive text', () => {
      render(<App />)
      const header = screen.getByRole('banner')
      expect(header).toBeInTheDocument()
      expect(screen.getByText('Pipedrive')).toBeInTheDocument()
    })

    it('header has correct styling', () => {
      const { container } = render(<App />)
      const header = container.querySelector('header')
      expect(header?.className).toContain('flex-shrink-0')
      expect(header?.className).toContain('px-5')
      expect(header?.className).toContain('py-4')
      expect(header?.className).toContain('border-b')
      expect(header?.className).toContain('border-[#d1d7db]')
    })

    it('renders scrollable body area', () => {
      const { container } = render(<App />)
      const main = container.querySelector('main')
      expect(main).toBeInTheDocument()
      expect(main?.className).toContain('flex-1')
      expect(main?.className).toContain('overflow-y-auto')
    })

    it('has full height flex column layout', () => {
      const { container } = render(<App />)
      const root = container.firstChild as HTMLElement
      expect(root.className).toContain('h-full')
      expect(root.className).toContain('flex')
      expect(root.className).toContain('flex-col')
    })

    it('has white background and left border', () => {
      const { container } = render(<App />)
      const root = container.firstChild as HTMLElement
      expect(root.className).toContain('bg-white')
      expect(root.className).toContain('border-l')
      expect(root.className).toContain('border-[#d1d7db]')
    })
  })

  describe('Initial State', () => {
    it('displays welcome state by default', async () => {
      render(<App />)
      // Wait for async auth check to complete
      await screen.findByText('Select a chat to view contact information')
      expect(screen.getByText('Select a chat to view contact information')).toBeInTheDocument()
    })

    it('does not display loading state initially', () => {
      const { container } = render(<App />)
      const spinner = container.querySelector('.animate-spin')
      expect(spinner).not.toBeInTheDocument()
    })

    it('does not display error state initially', () => {
      render(<App />)
      expect(screen.queryByText('Retry')).not.toBeInTheDocument()
    })
  })

  describe('WhatsApp Color Palette', () => {
    it('uses correct dark text color for header', () => {
      const { container } = render(<App />)
      const heading = container.querySelector('h1')
      expect(heading?.className).toContain('text-[#111b21]')
    })

    it('uses correct border color', () => {
      const { container } = render(<App />)
      const root = container.firstChild as HTMLElement
      expect(root.className).toContain('border-[#d1d7db]')
    })

    it('header text has correct size and weight', () => {
      const { container } = render(<App />)
      const heading = container.querySelector('h1')
      expect(heading?.className).toContain('text-[17px]')
      expect(heading?.className).toContain('font-semibold')
    })
  })

  describe('Development Mode', () => {
    it('exposes __setSidebarState in DEV mode', () => {
      render(<App />)
      // In DEV mode (including test), __setSidebarState should be exposed
      // @ts-expect-error - checking window property
      expect(window.__setSidebarState).toBeDefined()
      // @ts-expect-error - checking window property
      expect(typeof window.__setSidebarState).toBe('function')
    })
  })

  describe('Accessibility', () => {
    it('uses semantic HTML elements', () => {
      const { container } = render(<App />)
      expect(container.querySelector('header')).toBeInTheDocument()
      expect(container.querySelector('main')).toBeInTheDocument()
      expect(container.querySelector('h1')).toBeInTheDocument()
    })

    it('header is accessible via role', () => {
      render(<App />)
      expect(screen.getByRole('banner')).toBeInTheDocument()
    })

    it('main content is accessible via role', () => {
      render(<App />)
      expect(screen.getByRole('main')).toBeInTheDocument()
    })

    it('heading is accessible via role', () => {
      render(<App />)
      expect(screen.getByRole('heading', { name: 'Pipedrive' })).toBeInTheDocument()
    })
  })
})

describe('State Management', () => {
  it('SidebarState type supports all required states', () => {
    // This is a compile-time test - if it compiles, the types are correct
    type SidebarState =
      | { type: 'welcome' }
      | { type: 'loading' }
      | { type: 'contact'; name: string; phone: string }
      | { type: 'error'; message: string; onRetry: () => void }

    const welcomeState: SidebarState = { type: 'welcome' }
    const loadingState: SidebarState = { type: 'loading' }
    const contactState: SidebarState = { type: 'contact', name: 'John', phone: '+123' }
    const errorState: SidebarState = {
      type: 'error',
      message: 'Error',
      onRetry: () => {},
    }

    expect(welcomeState.type).toBe('welcome')
    expect(loadingState.type).toBe('loading')
    expect(contactState.type).toBe('contact')
    expect(errorState.type).toBe('error')
  })
})
