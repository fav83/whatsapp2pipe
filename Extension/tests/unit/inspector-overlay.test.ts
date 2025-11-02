/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach } from 'vitest'

// Prevent main block from executing when importing inspector-main
;(window as any).__whatsappInspectorInitialized = true

// Dynamically import to ensure the guard above is in place
await import('../../src/content-script/inspector-main')

const hooks = (window as any).__overlayTest as {
  waitForSidebarContainer: (timeoutMs?: number) => Promise<boolean>
  createLoadingOverlay: () => HTMLElement
  removeLoadingOverlay: () => void
  showOverlayIfNeeded: (initDoneRef: () => boolean) => void
}

describe('Inspector overlay helpers', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    // Clean any leftover styles
    const style = document.getElementById('chat2deal-spin')
    if (style) style.remove()
  })

  it('creates overlay element with spinner and text', () => {
    const overlay = hooks.createLoadingOverlay()
    expect(overlay.id).toBe('chat2deal-loading-overlay')
    expect(overlay.querySelector('span')?.textContent).toBe('Initializing Chat2Deal...')
    // Ensure style is injected
    const style = document.getElementById('chat2deal-spin')
    expect(style).toBeTruthy()
    expect(style?.textContent).toContain('@keyframes chat2deal-spin')
  })

  it('appends and removes overlay from DOM', () => {
    const overlay = hooks.createLoadingOverlay()
    document.body.appendChild(overlay)
    expect(document.getElementById('chat2deal-loading-overlay')).toBeTruthy()
    hooks.removeLoadingOverlay()
    expect(document.getElementById('chat2deal-loading-overlay')).toBeNull()
  })

  it('waitForSidebarContainer resolves true when sidebar appears', async () => {
    // Start waiting
    const p = hooks.waitForSidebarContainer(500)
    // Insert sidebar after a tick
    setTimeout(() => {
      const sidebar = document.createElement('div')
      sidebar.id = 'pipedrive-whatsapp-sidebar'
      document.body.appendChild(sidebar)
    }, 50)
    await expect(p).resolves.toBe(true)
  })

  it('waitForSidebarContainer resolves false on timeout', async () => {
    await expect(hooks.waitForSidebarContainer(100)).resolves.toBe(false)
  })

  it('showOverlayIfNeeded displays overlay only when init not completed', () => {
    hooks.showOverlayIfNeeded(() => false)
    expect(document.getElementById('chat2deal-loading-overlay')).toBeTruthy()

    // Second call should not duplicate
    hooks.showOverlayIfNeeded(() => false)
    expect(document.querySelectorAll('#chat2deal-loading-overlay').length).toBe(1)

    // When init is done, it should not display
    hooks.removeLoadingOverlay()
    hooks.showOverlayIfNeeded(() => true)
    expect(document.getElementById('chat2deal-loading-overlay')).toBeNull()
  })
})
