import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { waitForWhatsAppLoad } from '../../src/content-script/whatsapp-loader'

describe('waitForWhatsAppLoad', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('should resolve when both grid and textbox are present', async () => {
    // Create elements after a delay to simulate WhatsApp loading
    setTimeout(() => {
      const grid = document.createElement('div')
      grid.setAttribute('role', 'grid')
      document.body.appendChild(grid)

      const textbox = document.createElement('div')
      textbox.setAttribute('role', 'textbox')
      document.body.appendChild(textbox)
    }, 200)

    const promise = waitForWhatsAppLoad()
    vi.advanceTimersByTime(250)

    await expect(promise).resolves.toBeUndefined()
  })

  it('should keep polling until both elements are found', async () => {
    // Add grid first
    const grid = document.createElement('div')
    grid.setAttribute('role', 'grid')
    document.body.appendChild(grid)

    // Add textbox after delay
    setTimeout(() => {
      const textbox = document.createElement('div')
      textbox.setAttribute('role', 'textbox')
      document.body.appendChild(textbox)
    }, 500)

    const promise = waitForWhatsAppLoad()
    vi.advanceTimersByTime(600)

    await expect(promise).resolves.toBeUndefined()
  })

  it('should not resolve if only grid is present', async () => {
    const grid = document.createElement('div')
    grid.setAttribute('role', 'grid')
    document.body.appendChild(grid)

    const promise = waitForWhatsAppLoad()
    vi.advanceTimersByTime(1000)

    // Promise should still be pending
    let resolved = false
    promise.then(() => {
      resolved = true
    })

    // Small delay to allow any potential resolution
    await vi.advanceTimersByTimeAsync(0)
    expect(resolved).toBe(false)
  })

  it('should not resolve if only textbox is present', async () => {
    const textbox = document.createElement('div')
    textbox.setAttribute('role', 'textbox')
    document.body.appendChild(textbox)

    const promise = waitForWhatsAppLoad()
    vi.advanceTimersByTime(1000)

    // Promise should still be pending
    let resolved = false
    promise.then(() => {
      resolved = true
    })

    // Small delay to allow any potential resolution
    await vi.advanceTimersByTimeAsync(0)
    expect(resolved).toBe(false)
  })

  it('should poll every 50ms', async () => {
    const querySelectorSpy = vi.spyOn(document, 'querySelector')

    // Add elements after 150ms (should be checked at 0, 50, 100, 150)
    setTimeout(() => {
      const grid = document.createElement('div')
      grid.setAttribute('role', 'grid')
      document.body.appendChild(grid)

      const textbox = document.createElement('div')
      textbox.setAttribute('role', 'textbox')
      document.body.appendChild(textbox)
    }, 150)

    const promise = waitForWhatsAppLoad()
    vi.advanceTimersByTime(200)

    await promise

    // Should have been called at least 3 times (for 2 selectors per check)
    // At 0ms, 50ms, 100ms minimum before elements are found at 150ms
    expect(querySelectorSpy.mock.calls.length).toBeGreaterThanOrEqual(6) // 2 queries per check * 3 checks
  })

  it('should log to console when WhatsApp is loaded', async () => {
    const consoleSpy = vi.spyOn(console, 'log')

    const grid = document.createElement('div')
    grid.setAttribute('role', 'grid')
    document.body.appendChild(grid)

    const textbox = document.createElement('div')
    textbox.setAttribute('role', 'textbox')
    document.body.appendChild(textbox)

    const promise = waitForWhatsAppLoad()
    vi.advanceTimersByTime(100)

    await promise

    expect(consoleSpy).toHaveBeenCalledWith('[WhatsApp Loader] WhatsApp Web fully loaded')
  })
})
