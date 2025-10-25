/* eslint-disable @typescript-eslint/no-explicit-any */
import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// Mock chrome API globally
global.chrome = {
  runtime: {},
  storage: { local: {} },
  identity: {},
} as any

afterEach(() => {
  cleanup()
})
