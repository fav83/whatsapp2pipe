/**
 * useAuth Hook Unit Tests
 *
 * Tests authentication state management, storage listeners,
 * and sign-in/sign-out operations.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useAuth } from '../../src/content-script/hooks/useAuth'
import { authService } from '../../src/content-script/services/authService'

// Mock authService
vi.mock('../../src/content-script/services/authService', () => ({
  authService: {
    isAuthenticated: vi.fn(),
    getVerificationCode: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(),
  },
}))

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Initialization', () => {
    it('initializes with unauthenticated state when no verification_code', async () => {
      vi.mocked(authService.isAuthenticated).mockResolvedValue(false)

      const { result } = renderHook(() => useAuth())

      await waitFor(() => {
        expect(result.current.authState).toBe('unauthenticated')
      })
      expect(result.current.verificationCode).toBeNull()
      expect(result.current.error).toBeNull()
    })

    it('initializes with authenticated state when verification_code exists', async () => {
      vi.mocked(authService.isAuthenticated).mockResolvedValue(true)
      vi.mocked(authService.getVerificationCode).mockResolvedValue('test_code_123')

      const { result } = renderHook(() => useAuth())

      await waitFor(() => {
        expect(result.current.authState).toBe('authenticated')
      })
      expect(result.current.verificationCode).toBe('test_code_123')
    })

    it('checks authentication status on mount', async () => {
      vi.mocked(authService.isAuthenticated).mockResolvedValue(false)

      renderHook(() => useAuth())

      await waitFor(() => {
        expect(authService.isAuthenticated).toHaveBeenCalled()
      })
    })
  })

  describe('signIn()', () => {
    it('transitions to authenticating state', async () => {
      vi.mocked(authService.isAuthenticated).mockResolvedValue(false)
      vi.mocked(authService.signIn).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      )

      const { result } = renderHook(() => useAuth())

      await waitFor(() => {
        expect(result.current.authState).toBe('unauthenticated')
      })

      result.current.signIn()

      await waitFor(() => {
        expect(result.current.authState).toBe('authenticating')
      })
    })

    it('transitions to authenticated on success', async () => {
      vi.mocked(authService.isAuthenticated).mockResolvedValue(false)
      vi.mocked(authService.signIn).mockResolvedValue('success_code')

      const { result } = renderHook(() => useAuth())

      await waitFor(() => {
        expect(result.current.authState).toBe('unauthenticated')
      })

      await result.current.signIn()

      await waitFor(() => {
        expect(result.current.authState).toBe('authenticated')
        expect(result.current.verificationCode).toBe('success_code')
        expect(result.current.error).toBeNull()
      })
    })

    it('transitions to error on failure', async () => {
      vi.mocked(authService.isAuthenticated).mockResolvedValue(false)
      vi.mocked(authService.signIn).mockRejectedValue(new Error('OAuth failed'))

      const { result } = renderHook(() => useAuth())

      await waitFor(() => {
        expect(result.current.authState).toBe('unauthenticated')
      })

      await result.current.signIn()

      await waitFor(() => {
        expect(result.current.authState).toBe('error')
        expect(result.current.error).toBe('OAuth failed')
      })
    })

    it('clears previous error on new sign-in attempt', async () => {
      vi.mocked(authService.isAuthenticated).mockResolvedValue(false)
      vi.mocked(authService.signIn)
        .mockRejectedValueOnce(new Error('First error'))
        .mockResolvedValueOnce('success_code')

      const { result } = renderHook(() => useAuth())

      await waitFor(() => {
        expect(result.current.authState).toBe('unauthenticated')
      })

      // First attempt fails
      await result.current.signIn()

      await waitFor(() => {
        expect(result.current.error).toBe('First error')
      })

      // Second attempt succeeds
      await result.current.signIn()

      await waitFor(() => {
        expect(result.current.authState).toBe('authenticated')
        expect(result.current.error).toBeNull()
      })
    })
  })

  describe('signOut()', () => {
    it('transitions to unauthenticated', async () => {
      vi.mocked(authService.isAuthenticated).mockResolvedValue(true)
      vi.mocked(authService.getVerificationCode).mockResolvedValue('test_code')
      vi.mocked(authService.signOut).mockResolvedValue()

      const { result } = renderHook(() => useAuth())

      await waitFor(() => {
        expect(result.current.authState).toBe('authenticated')
      })

      await result.current.signOut()

      await waitFor(() => {
        expect(result.current.authState).toBe('unauthenticated')
        expect(result.current.verificationCode).toBeNull()
      })
    })

    it('calls authService.signOut()', async () => {
      vi.mocked(authService.isAuthenticated).mockResolvedValue(true)
      vi.mocked(authService.getVerificationCode).mockResolvedValue('test_code')
      vi.mocked(authService.signOut).mockResolvedValue()

      const { result } = renderHook(() => useAuth())

      await waitFor(() => {
        expect(result.current.authState).toBe('authenticated')
      })

      await result.current.signOut()

      expect(authService.signOut).toHaveBeenCalled()
    })
  })

  describe('Storage change listener', () => {
    it('registers storage change listener', async () => {
      vi.mocked(authService.isAuthenticated).mockResolvedValue(false)

      renderHook(() => useAuth())

      await waitFor(() => {
        expect(chrome.storage.onChanged.addListener).toHaveBeenCalled()
      })
    })

    it('unregisters storage change listener on unmount', async () => {
      vi.mocked(authService.isAuthenticated).mockResolvedValue(false)

      const { unmount } = renderHook(() => useAuth())

      await waitFor(() => {
        expect(chrome.storage.onChanged.addListener).toHaveBeenCalled()
      })

      unmount()

      expect(chrome.storage.onChanged.removeListener).toHaveBeenCalled()
    })

    it('updates to authenticated when verification_code is added to storage', async () => {
      vi.mocked(authService.isAuthenticated).mockResolvedValue(false)

      const { result } = renderHook(() => useAuth())

      await waitFor(() => {
        expect(result.current.authState).toBe('unauthenticated')
      })

      // Get the storage change listener
      const listenerCall = vi.mocked(chrome.storage.onChanged.addListener).mock.calls[0]
      const listener = listenerCall[0]

      // Simulate storage change
      listener(
        {
          verification_code: {
            newValue: 'new_code_123',
            oldValue: undefined,
          },
        },
        'local'
      )

      await waitFor(() => {
        expect(result.current.authState).toBe('authenticated')
        expect(result.current.verificationCode).toBe('new_code_123')
      })
    })

    it('updates to unauthenticated when verification_code is removed from storage', async () => {
      vi.mocked(authService.isAuthenticated).mockResolvedValue(true)
      vi.mocked(authService.getVerificationCode).mockResolvedValue('test_code')

      const { result } = renderHook(() => useAuth())

      await waitFor(() => {
        expect(result.current.authState).toBe('authenticated')
      })

      // Get the storage change listener
      const listenerCall = vi.mocked(chrome.storage.onChanged.addListener).mock.calls[0]
      const listener = listenerCall[0]

      // Simulate storage change (removal)
      listener(
        {
          verification_code: {
            newValue: undefined,
            oldValue: 'test_code',
          },
        },
        'local'
      )

      await waitFor(() => {
        expect(result.current.authState).toBe('unauthenticated')
        expect(result.current.verificationCode).toBeNull()
      })
    })
  })
})
