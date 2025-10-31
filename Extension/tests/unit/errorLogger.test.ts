/**
 * Error Logger Unit Tests
 *
 * Tests structured error logging format
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { logError } from '../../src/utils/errorLogger'

describe('errorLogger', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Mock chrome.runtime.getManifest for version
    if (!chrome.runtime.getManifest) {
      chrome.runtime.getManifest = vi.fn(() => ({
        version: '1.0.0',
        manifest_version: 3,
        name: 'Test Extension',
      })) as unknown as () => chrome.runtime.Manifest
    }
  })

  it('logs with correct format including prefix, timestamp, and version', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    logError('Test context', new Error('Test error'), { extra: 'data' })

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringMatching(
        /\[chat2deal-pipe\]\[\d{4}-\d{2}-\d{2}T.*\]\[1\.0\.0\] Test context: Test error/
      ),
      expect.any(String),
      { extra: 'data' }
    )

    consoleErrorSpy.mockRestore()
  })

  it('includes stack trace for Error objects', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const error = new Error('Test error')
    logError('Test context', error)

    const calls = consoleErrorSpy.mock.calls[0]
    expect(calls[1]).toContain('Error: Test error')
    expect(calls[1]).toContain('at ')

    consoleErrorSpy.mockRestore()
  })

  it('handles non-Error objects (string)', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    logError('Test context', 'String error')

    expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('String error'), '', {})

    consoleErrorSpy.mockRestore()
  })

  it('handles non-Error objects (number)', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    logError('Test context', 42)

    expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('42'), '', {})

    consoleErrorSpy.mockRestore()
  })

  it('handles non-Error objects (object)', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    logError('Test context', { message: 'custom error' })

    expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('[object Object]'), '', {})

    consoleErrorSpy.mockRestore()
  })

  it('includes additional context when provided', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    logError('Test context', new Error('Test error'), {
      url: 'https://web.whatsapp.com',
      userId: '123',
      extra: 'info',
    })

    const calls = consoleErrorSpy.mock.calls[0]
    expect(calls[2]).toEqual({
      url: 'https://web.whatsapp.com',
      userId: '123',
      extra: 'info',
    })

    consoleErrorSpy.mockRestore()
  })

  it('uses empty object when no additional context provided', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    logError('Test context', new Error('Test error'))

    const calls = consoleErrorSpy.mock.calls[0]
    expect(calls[2]).toEqual({})

    consoleErrorSpy.mockRestore()
  })

  it('formats timestamp in ISO format', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const beforeLog = new Date().toISOString()
    logError('Test context', new Error('Test error'))
    const afterLog = new Date().toISOString()

    const calls = consoleErrorSpy.mock.calls[0]
    const logMessage = calls[0] as string

    // Extract timestamp from log message
    const timestampMatch = logMessage.match(/\[(\d{4}-\d{2}-\d{2}T[\d:.]+Z)\]/)
    expect(timestampMatch).toBeTruthy()

    if (timestampMatch) {
      const logTimestamp = timestampMatch[1]
      // Verify timestamp is within reasonable range
      expect(logTimestamp >= beforeLog).toBe(true)
      expect(logTimestamp <= afterLog).toBe(true)
    }

    consoleErrorSpy.mockRestore()
  })

  it('includes extension version from manifest', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    logError('Test context', new Error('Test error'))

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('[1.0.0]'),
      expect.any(String),
      expect.any(Object)
    )

    consoleErrorSpy.mockRestore()
  })

  it('formats complete log message correctly', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    logError('Failed to initialize sidebar', new Error('Cannot find element'), {
      url: 'https://web.whatsapp.com',
    })

    const calls = consoleErrorSpy.mock.calls[0]
    const logMessage = calls[0] as string

    expect(logMessage).toMatch(/\[chat2deal-pipe\]/)
    expect(logMessage).toMatch(/\[\d{4}-\d{2}-\d{2}T[\d:.]+Z\]/)
    expect(logMessage).toMatch(/\[1\.0\.0\]/)
    expect(logMessage).toContain('Failed to initialize sidebar')
    expect(logMessage).toContain('Cannot find element')

    consoleErrorSpy.mockRestore()
  })
})
