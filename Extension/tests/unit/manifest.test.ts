import { describe, it, expect } from 'vitest'
import manifest from '../../public/manifest.json'

describe('Manifest V3 Configuration', () => {
  it('should have correct manifest version', () => {
    expect(manifest.manifest_version).toBe(3)
  })

  it('should have all required permissions', () => {
    expect(manifest.permissions).toContain('storage')
    expect(manifest.permissions).toContain('tabs')
    expect(manifest.permissions).toContain('identity')
  })

  it('should target WhatsApp Web', () => {
    expect(manifest.host_permissions).toContain('*://web.whatsapp.com/*')
  })

  it('should have valid version format', () => {
    expect(manifest.version).toMatch(/^\d+\.\d+\.\d+$/)
  })

  it('should have correct name and description', () => {
    expect(manifest.name).toBe('Pipedrive for WhatsApp Web')
    expect(manifest.short_name).toBe('Pipedrive WhatsApp')
    expect(manifest.description).toBeTruthy()
  })

  it('should have service worker configured', () => {
    expect(manifest.background).toBeDefined()
    expect(manifest.background.service_worker).toBe('service-worker.js')
    expect(manifest.background.type).toBe('module')
  })

  it('should have content script configured for WhatsApp Web', () => {
    expect(manifest.content_scripts).toBeDefined()
    expect(manifest.content_scripts.length).toBeGreaterThan(0)
    const contentScript = manifest.content_scripts[0]
    expect(contentScript.matches).toContain('*://web.whatsapp.com/*')
    expect(contentScript.js).toContain('content-script.js')
    expect(contentScript.run_at).toBe('document_idle')
  })

  it('should have popup action configured', () => {
    expect(manifest.action).toBeDefined()
    expect(manifest.action.default_popup).toBe('popup.html')
    expect(manifest.action.default_icon).toBeDefined()
  })

  it('should have all required icon sizes', () => {
    expect(manifest.icons).toBeDefined()
    expect(manifest.icons['16']).toBe('icons/icon16.png')
    expect(manifest.icons['48']).toBe('icons/icon48.png')
    expect(manifest.icons['128']).toBe('icons/icon128.png')
  })

  it('should have web accessible resources configured', () => {
    expect(manifest.web_accessible_resources).toBeDefined()
    expect(manifest.web_accessible_resources.length).toBeGreaterThan(0)
    const war = manifest.web_accessible_resources[0]
    expect(war.matches).toContain('*://web.whatsapp.com/*')
    expect(war.resources).toContain('assets/*')
    expect(war.resources).toContain('chunks/*')
  })

  it('should have content security policy', () => {
    expect(manifest.content_security_policy).toBeDefined()
    expect(manifest.content_security_policy.extension_pages).toBeTruthy()
  })
})
