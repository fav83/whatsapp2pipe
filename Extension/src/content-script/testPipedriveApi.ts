/**
 * Manual Testing Helper for Pipedrive API
 *
 * This file is for development/testing only.
 * Import this in App.tsx temporarily to expose testing functions to browser console.
 */

/**
 * Test helper that exposes Pipedrive API functions to window object
 * for manual testing in browser DevTools console
 */
export function exposePipedriveTestHelpers() {
  // Send message to service worker and log response
  const testPipedriveApi = async (message: unknown) => {
    console.log('[Test] Sending message:', message)
    try {
      const response = await chrome.runtime.sendMessage(message)
      console.log('[Test] Received response:', response)
      return response
    } catch (error) {
      console.error('[Test] Error:', error)
      return null
    }
  }

  // Test helpers exposed to window
  const helpers = {
    /**
     * Test lookup by phone
     * Example: window.testPipedrive.lookupByPhone('+48123456789')
     */
    async lookupByPhone(phone: string) {
      console.log(`[Test] Looking up phone: ${phone}`)
      return testPipedriveApi({
        type: 'PIPEDRIVE_LOOKUP_BY_PHONE',
        phone,
      })
    },

    /**
     * Test search by name
     * Example: window.testPipedrive.searchByName('John')
     */
    async searchByName(name: string) {
      console.log(`[Test] Searching name: ${name}`)
      return testPipedriveApi({
        type: 'PIPEDRIVE_SEARCH_BY_NAME',
        name,
      })
    },

    /**
     * Test create person
     * Example: window.testPipedrive.createPerson('Jane Doe', '+48123456789', 'jane@example.com')
     */
    async createPerson(name: string, phone: string, email?: string) {
      console.log(`[Test] Creating person: ${name}`)
      return testPipedriveApi({
        type: 'PIPEDRIVE_CREATE_PERSON',
        data: { name, phone, email },
      })
    },

    /**
     * Test attach phone
     * Example: window.testPipedrive.attachPhone(123, '+48123456789')
     */
    async attachPhone(personId: number, phone: string) {
      console.log(`[Test] Attaching phone to person ${personId}`)
      return testPipedriveApi({
        type: 'PIPEDRIVE_ATTACH_PHONE',
        data: { personId, phone },
      })
    },

    /**
     * Check if authenticated
     */
    async checkAuth() {
      const result = await chrome.storage.local.get('verification_code')
      const isAuthed = !!result.verification_code
      console.log('[Test] Authenticated:', isAuthed)
      if (isAuthed) {
        console.log(
          '[Test] Verification code exists (length:',
          result.verification_code.length,
          ')'
        )
      } else {
        console.log('[Test] Not authenticated. Please sign in first.')
      }
      return isAuthed
    },
  }

  // Expose to window for DevTools access
  ;(window as Window & typeof globalThis & { testPipedrive: typeof helpers }).testPipedrive =
    helpers

  console.log('✅ Pipedrive test helpers loaded!')
  console.log('📝 Available commands:')
  console.log('  - window.testPipedrive.checkAuth()')
  console.log('  - window.testPipedrive.lookupByPhone("+48123456789")')
  console.log('  - window.testPipedrive.searchByName("John")')
  console.log(
    '  - window.testPipedrive.createPerson("Jane Doe", "+48123456789", "jane@example.com")'
  )
  console.log('  - window.testPipedrive.attachPhone(123, "+48123456789")')
}
