/* eslint-disable @typescript-eslint/no-explicit-any */
import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

// Mock chrome API globally
global.chrome = {
  runtime: {
    // Mock sendMessage for content script <-> service worker communication
    sendMessage: vi.fn(() =>
      Promise.resolve({
        type: 'AUTH_SIGN_IN_SUCCESS',
        verificationCode: 'test_code',
      })
    ),
  },
  storage: {
    local: {
      get: vi.fn(() => Promise.resolve({})),
      set: vi.fn(() => Promise.resolve()),
      remove: vi.fn(() => Promise.resolve()),
    },
    sync: {
      get: vi.fn((keys, callback) => {
        callback({ authState: 'authenticated' })
      }),
      set: vi.fn(() => Promise.resolve()),
      remove: vi.fn(() => Promise.resolve()),
      onChanged: {
        addListener: vi.fn(),
        removeListener: vi.fn(),
      },
    },
    onChanged: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
  },
  identity: {
    // Keep for service worker tests
    launchWebAuthFlow: vi.fn(() =>
      Promise.resolve('https://example.com/callback?verification_code=test_code')
    ),
  },
} as any

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})
