/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach } from 'vitest'

// Prevent main block from executing when importing inspector-main
;(window as any).__whatsappInspectorInitialized = true

await import('../../src/content-script/inspector-main')

const hooks = (window as any).__overlayTest as {
  waitForSidebarContainer: (timeoutMs?: number) => Promise<boolean>
  createLoadingOverlay: () => HTMLElement
  removeLoadingOverlay: () => void
  showOverlayIfNeeded: (initDoneRef: () => boolean) => void
}

describe('Module Raid Overlay Integration (simulated)', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    const style = document.getElementById('chat2deal-spin')
    if (style) style.remove()
  })

  it('shows overlay when sidebar exists and init not completed', async () => {
    const sidebar = document.createElement('div')
    sidebar.id = 'pipedrive-whatsapp-sidebar'
    document.body.appendChild(sidebar)

    // Simulate sidebar detection
    const detected = await hooks.waitForSidebarContainer(200)
    expect(detected).toBe(true)

    // Simulate init in progress
    hooks.showOverlayIfNeeded(() => false)
    expect(document.getElementById('chat2deal-loading-overlay')).toBeTruthy()
  })

  it('does not show overlay when init already completed', async () => {
    const sidebar = document.createElement('div')
    sidebar.id = 'pipedrive-whatsapp-sidebar'
    document.body.appendChild(sidebar)

    const detected = await hooks.waitForSidebarContainer(200)
    expect(detected).toBe(true)

    // Simulate completed init
    hooks.showOverlayIfNeeded(() => true)
    expect(document.getElementById('chat2deal-loading-overlay')).toBeNull()
  })
})
