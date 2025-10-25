/**
 * WhatsApp Web Load Detection
 *
 * Polls for WhatsApp Web to be fully loaded before allowing sidebar injection.
 * This ensures the extension doesn't interfere with WhatsApp's initialization.
 */

/**
 * Polls for WhatsApp Web to be fully loaded.
 * Checks for both chat list grid and search textbox.
 * @returns Promise that resolves when WhatsApp is ready
 */
export function waitForWhatsAppLoad(): Promise<void> {
  return new Promise((resolve) => {
    const checkInterval = 50 // Poll every 50ms

    const intervalId = setInterval(() => {
      const isChatListPresent = !!document.querySelector('div[role="grid"]')
      const isSearchPresent = !!document.querySelector('div[role="textbox"]')
      const isLoaded = isChatListPresent && isSearchPresent

      if (isLoaded) {
        clearInterval(intervalId)
        console.log('[WhatsApp Loader] WhatsApp Web fully loaded')
        resolve()
      }
    }, checkInterval)
  })
}
