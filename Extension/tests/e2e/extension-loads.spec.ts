import { test, expect, chromium } from '@playwright/test'
import path from 'path'

test('extension loads on WhatsApp Web', async () => {
  const extensionPath = path.resolve(__dirname, '../../dist')

  const context = await chromium.launchPersistentContext('', {
    headless: false,
    args: [`--disable-extensions-except=${extensionPath}`, `--load-extension=${extensionPath}`],
  })

  const page = await context.newPage()
  await page.goto('https://web.whatsapp.com')

  // Wait for WhatsApp to load
  await page.waitForTimeout(3000)

  // Check if sidebar was injected
  const sidebar = await page.$('#pipedrive-whatsapp-sidebar')
  expect(sidebar).toBeTruthy()

  // Check if React app rendered
  const heading = await page.textContent('#pipedrive-whatsapp-sidebar h1')
  expect(heading).toContain('Pipedrive for WhatsApp')

  await context.close()
})
