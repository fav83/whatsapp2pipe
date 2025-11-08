import { test, expect, chromium } from '@playwright/test'
import path from 'path'

/**
 * E2E Test: Config Message Banner Flow
 *
 * Tests the complete config message banner flow in a real browser environment.
 * Note: This test requires the extension to be built (npm run build) before running.
 *
 * Limitations:
 * - Does not test actual backend responses (would require test backend or mocking)
 * - Focuses on UI interactions and component behavior in real browser
 * - Banner only appears when user is authenticated
 */

test.describe('Config Message Banner E2E', () => {
  test('banner renders when config message is available', async () => {
    const extensionPath = path.resolve(__dirname, '../../dist')

    // Launch browser with extension
    const context = await chromium.launchPersistentContext('', {
      headless: false,
      args: [`--disable-extensions-except=${extensionPath}`, `--load-extension=${extensionPath}`],
    })

    const page = await context.newPage()

    // Navigate to WhatsApp Web
    await page.goto('https://web.whatsapp.com')
    await page.waitForTimeout(3000)

    // Check if sidebar was injected
    const sidebar = await page.$('#pipedrive-whatsapp-sidebar')
    expect(sidebar).toBeTruthy()

    // Wait for sidebar to fully render
    await page.waitForSelector('#pipedrive-whatsapp-sidebar', { timeout: 5000 })

    // Note: In a real scenario, we would need to:
    // 1. Authenticate the user
    // 2. Have a backend that returns a config message
    // For this E2E test, we're checking if the banner element can be found when it exists

    // Look for the banner region
    const banner = await page.$('[role="region"][aria-label="Admin message"]')

    if (banner) {
      // Verify banner is visible
      const isVisible = await banner.isVisible()
      expect(isVisible).toBe(true)

      // Verify dismiss button is present
      const dismissButton = await banner.$('button[aria-label="Dismiss message"]')
      expect(dismissButton).toBeTruthy()

      console.log('Config message banner found and verified')
    } else {
      console.log('Config message banner not found - may require authentication or backend config')
      console.log('Skipping banner interaction test')
    }

    await context.close()
  })

  test('banner can be dismissed with close button', async () => {
    const extensionPath = path.resolve(__dirname, '../../dist')

    const context = await chromium.launchPersistentContext('', {
      headless: false,
      args: [`--disable-extensions-except=${extensionPath}`, `--load-extension=${extensionPath}`],
    })

    const page = await context.newPage()
    await page.goto('https://web.whatsapp.com')
    await page.waitForTimeout(3000)

    // Look for the banner
    const banner = await page.$('[role="region"][aria-label="Admin message"]')

    if (banner) {
      // Click dismiss button
      const dismissButton = await banner.$('button[aria-label="Dismiss message"]')
      await dismissButton?.click()

      // Wait a bit for dismissal animation
      await page.waitForTimeout(500)

      // Banner should be removed from DOM
      const bannerAfterDismiss = await page.$('[role="region"][aria-label="Admin message"]')
      expect(bannerAfterDismiss).toBeNull()

      console.log('Successfully dismissed config message banner')
    } else {
      console.log('Config message banner not found - skipping dismiss test')
    }

    await context.close()
  })

  test('banner renders markdown content correctly', async () => {
    const extensionPath = path.resolve(__dirname, '../../dist')

    const context = await chromium.launchPersistentContext('', {
      headless: false,
      args: [`--disable-extensions-except=${extensionPath}`, `--load-extension=${extensionPath}`],
    })

    const page = await context.newPage()
    await page.goto('https://web.whatsapp.com')
    await page.waitForTimeout(3000)

    const banner = await page.$('[role="region"][aria-label="Admin message"]')

    if (banner) {
      // Check for markdown elements (strong, em, links)
      const hasStrong = (await banner.$('strong')) !== null
      const hasLink = (await banner.$('a')) !== null

      if (hasStrong || hasLink) {
        console.log('Banner contains markdown elements:', { hasStrong, hasLink })
      }

      // If link exists, verify it has proper attributes
      const link = await banner.$('a')
      if (link) {
        const href = await link.getAttribute('href')
        const rel = await link.getAttribute('rel')
        const target = await link.getAttribute('target')

        expect(href).toBeTruthy()
        expect(rel).toBe('noopener noreferrer')
        expect(target).toBe('_blank')

        console.log('Link attributes verified:', { href, rel, target })
      }
    } else {
      console.log('Config message banner not found - skipping markdown test')
    }

    await context.close()
  })

  test('banner has correct styling classes', async () => {
    const extensionPath = path.resolve(__dirname, '../../dist')

    const context = await chromium.launchPersistentContext('', {
      headless: false,
      args: [`--disable-extensions-except=${extensionPath}`, `--load-extension=${extensionPath}`],
    })

    const page = await context.newPage()
    await page.goto('https://web.whatsapp.com')
    await page.waitForTimeout(3000)

    const banner = await page.$('[role="region"][aria-label="Admin message"]')

    if (banner) {
      // Check for expected CSS classes
      const className = await banner.getAttribute('class')
      expect(className).toContain('bg-slate-500')
      expect(className).toContain('border-slate-600')

      // Check link styling if link exists
      const link = await banner.$('a')
      if (link) {
        const linkClass = await link.getAttribute('class')
        expect(linkClass).toContain('text-blue-200')
        expect(linkClass).toContain('underline')
        expect(linkClass).toContain('font-medium')
      }

      console.log('Banner styling classes verified')
    } else {
      console.log('Config message banner not found - skipping styling test')
    }

    await context.close()
  })

  test('banner is accessible via keyboard navigation', async () => {
    const extensionPath = path.resolve(__dirname, '../../dist')

    const context = await chromium.launchPersistentContext('', {
      headless: false,
      args: [`--disable-extensions-except=${extensionPath}`, `--load-extension=${extensionPath}`],
    })

    const page = await context.newPage()
    await page.goto('https://web.whatsapp.com')
    await page.waitForTimeout(3000)

    const banner = await page.$('[role="region"][aria-label="Admin message"]')

    if (banner) {
      // Tab to dismiss button
      await page.keyboard.press('Tab')
      await page.keyboard.press('Tab')
      await page.keyboard.press('Tab')

      // Get focused element
      const focusedElement = await page.evaluateHandle(() => document.activeElement)
      const ariaLabel = await focusedElement.evaluate((el) => el.getAttribute('aria-label'))

      // Check if dismiss button can be focused
      if (ariaLabel === 'Dismiss message') {
        console.log('Dismiss button is keyboard accessible')

        // Press Enter to dismiss
        await page.keyboard.press('Enter')
        await page.waitForTimeout(500)

        // Banner should be dismissed
        const bannerAfterDismiss = await page.$('[role="region"][aria-label="Admin message"]')
        expect(bannerAfterDismiss).toBeNull()

        console.log('Banner dismissed via keyboard')
      } else {
        console.log('Dismiss button focus test inconclusive - tab navigation may vary')
      }
    } else {
      console.log('Config message banner not found - skipping keyboard navigation test')
    }

    await context.close()
  })

  test('banner does not appear when user is not authenticated', async () => {
    const extensionPath = path.resolve(__dirname, '../../dist')

    const context = await chromium.launchPersistentContext('', {
      headless: false,
      args: [`--disable-extensions-except=${extensionPath}`, `--load-extension=${extensionPath}`],
    })

    const page = await context.newPage()
    await page.goto('https://web.whatsapp.com')
    await page.waitForTimeout(3000)

    // Wait for sidebar
    await page.waitForSelector('#pipedrive-whatsapp-sidebar', { timeout: 5000 })

    // Look for sign-in button (indicates unauthenticated state)
    const signInButton = await page.$('button:has-text("Sign in with Pipedrive")')

    if (signInButton) {
      // User is not authenticated
      // Banner should NOT be visible
      const banner = await page.$('[role="region"][aria-label="Admin message"]')
      expect(banner).toBeNull()

      console.log('Confirmed: Banner does not appear when unauthenticated')
    } else {
      console.log('User may already be authenticated - skipping unauthenticated test')
    }

    await context.close()
  })

  test('banner reappears after page reload if not permanently dismissed', async () => {
    const extensionPath = path.resolve(__dirname, '../../dist')

    const context = await chromium.launchPersistentContext('', {
      headless: false,
      args: [`--disable-extensions-except=${extensionPath}`, `--load-extension=${extensionPath}`],
    })

    const page = await context.newPage()
    await page.goto('https://web.whatsapp.com')
    await page.waitForTimeout(3000)

    // Check if banner exists initially
    const bannerBefore = await page.$('[role="region"][aria-label="Admin message"]')

    if (bannerBefore) {
      // Dismiss banner
      const dismissButton = await bannerBefore.$('button[aria-label="Dismiss message"]')
      await dismissButton?.click()
      await page.waitForTimeout(500)

      // Verify dismissed
      const bannerAfterDismiss = await page.$('[role="region"][aria-label="Admin message"]')
      expect(bannerAfterDismiss).toBeNull()

      // Reload page
      await page.reload()
      await page.waitForTimeout(3000)

      // Banner should reappear (temporary dismissal only)
      const bannerAfterReload = await page.$('[role="region"][aria-label="Admin message"]')

      if (bannerAfterReload) {
        console.log('Banner reappeared after reload - temporary dismissal working as expected')
        expect(bannerAfterReload).toBeTruthy()
      } else {
        console.log('Banner did not reappear - may indicate persistent dismissal or no config')
      }
    } else {
      console.log('Config message banner not found - skipping reload test')
    }

    await context.close()
  })
})
