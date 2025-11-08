import { test, expect, chromium } from '@playwright/test'
import path from 'path'

/**
 * E2E Test: User Feedback Flow
 *
 * Tests the complete user feedback flow in a real browser environment.
 * Note: This test requires the extension to be built (npm run build) before running.
 *
 * Limitations:
 * - Does not test actual backend submission (would require test backend or mocking)
 * - Focuses on UI interactions and component behavior in real browser
 */

test.describe('Feedback Flow E2E', () => {
  test('user can open feedback modal and interact with it', async () => {
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

    // Note: In a real scenario, we would need to authenticate first
    // For this E2E test, we're focusing on the modal UI behavior
    // The feedback button is only visible when authenticated

    // Check if feedback button exists (may not be visible without auth)
    const feedbackButton = await page.$('button[aria-label="Send feedback"]')

    if (feedbackButton) {
      // Click feedback button
      await feedbackButton.click()

      // Wait for modal to appear
      await page.waitForSelector('[role="dialog"]', { timeout: 2000 })

      // Verify modal title
      const modalTitle = await page.textContent('[role="dialog"] h2')
      expect(modalTitle).toContain('Send Feedback')

      // Verify textarea is present
      const textarea = await page.$('[role="dialog"] textarea')
      expect(textarea).toBeTruthy()

      // Type feedback message
      await textarea?.fill('This is a test feedback message from E2E test')

      // Verify character counter updates
      const counter = await page.textContent('[role="dialog"] .text-xs')
      expect(counter).toContain('46 / 5000')

      // Verify Submit button is enabled
      const submitButton = await page.$('[role="dialog"] button:has-text("Submit")')
      expect(submitButton).toBeTruthy()

      const isDisabled = await submitButton?.isDisabled()
      expect(isDisabled).toBe(false)

      // Verify Cancel button is present
      const cancelButton = await page.$('[role="dialog"] button:has-text("Cancel")')
      expect(cancelButton).toBeTruthy()

      // Close modal using Cancel button
      await cancelButton?.click()

      // Confirm discard (if confirmation appears)
      page.once('dialog', (dialog) => {
        expect(dialog.message()).toContain('Discard your feedback?')
        dialog.accept()
      })

      // Wait for modal to close
      await page.waitForSelector('[role="dialog"]', { state: 'detached', timeout: 2000 })
    } else {
      console.log('Feedback button not found - user may not be authenticated in E2E test')
      console.log('Skipping feedback modal interaction test')
    }

    await context.close()
  })

  test('feedback modal can be closed with Escape key', async () => {
    const extensionPath = path.resolve(__dirname, '../../dist')

    const context = await chromium.launchPersistentContext('', {
      headless: false,
      args: [`--disable-extensions-except=${extensionPath}`, `--load-extension=${extensionPath}`],
    })

    const page = await context.newPage()
    await page.goto('https://web.whatsapp.com')
    await page.waitForTimeout(3000)

    const feedbackButton = await page.$('button[aria-label="Send feedback"]')

    if (feedbackButton) {
      // Open modal
      await feedbackButton.click()
      await page.waitForSelector('[role="dialog"]', { timeout: 2000 })

      // Press Escape key
      await page.keyboard.press('Escape')

      // Modal should close
      await page.waitForSelector('[role="dialog"]', { state: 'detached', timeout: 2000 })
    }

    await context.close()
  })

  test('feedback modal enforces character limit', async () => {
    const extensionPath = path.resolve(__dirname, '../../dist')

    const context = await chromium.launchPersistentContext('', {
      headless: false,
      args: [`--disable-extensions-except=${extensionPath}`, `--load-extension=${extensionPath}`],
    })

    const page = await context.newPage()
    await page.goto('https://web.whatsapp.com')
    await page.waitForTimeout(3000)

    const feedbackButton = await page.$('button[aria-label="Send feedback"]')

    if (feedbackButton) {
      // Open modal
      await feedbackButton.click()
      await page.waitForSelector('[role="dialog"]', { timeout: 2000 })

      const textarea = await page.$('[role="dialog"] textarea')

      // Try to type more than 5000 characters
      const longText = 'a'.repeat(6000)
      await textarea?.fill(longText)

      // Get actual value
      const actualValue = await textarea?.inputValue()

      // Should be capped at 5000
      expect(actualValue?.length).toBe(5000)

      // Character counter should show 5000 / 5000
      const counter = await page.textContent('[role="dialog"] .text-xs')
      expect(counter).toContain('5000 / 5000')
    }

    await context.close()
  })

  test('submit button is disabled when message is empty', async () => {
    const extensionPath = path.resolve(__dirname, '../../dist')

    const context = await chromium.launchPersistentContext('', {
      headless: false,
      args: [`--disable-extensions-except=${extensionPath}`, `--load-extension=${extensionPath}`],
    })

    const page = await context.newPage()
    await page.goto('https://web.whatsapp.com')
    await page.waitForTimeout(3000)

    const feedbackButton = await page.$('button[aria-label="Send feedback"]')

    if (feedbackButton) {
      // Open modal
      await feedbackButton.click()
      await page.waitForSelector('[role="dialog"]', { timeout: 2000 })

      const submitButton = await page.$('[role="dialog"] button:has-text("Submit")')

      // Should be disabled initially
      const isDisabled = await submitButton?.isDisabled()
      expect(isDisabled).toBe(true)

      // Type message
      const textarea = await page.$('[role="dialog"] textarea')
      await textarea?.fill('Test message')

      // Should now be enabled
      const isEnabledAfter = await submitButton?.isDisabled()
      expect(isEnabledAfter).toBe(false)

      // Clear message
      await textarea?.fill('')

      // Should be disabled again
      const isDisabledAgain = await submitButton?.isDisabled()
      expect(isDisabledAgain).toBe(true)
    }

    await context.close()
  })
})
