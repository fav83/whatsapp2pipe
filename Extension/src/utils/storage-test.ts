import logger from './logger'

export async function testChromeStorage(): Promise<boolean> {
  try {
    // Write test data
    await chrome.storage.local.set({ test_key: 'test_value', timestamp: Date.now() })
    logger.log('[Storage Test] Write successful')

    // Read test data
    const result = await chrome.storage.local.get(['test_key', 'timestamp'])
    logger.log('[Storage Test] Read successful:', result)

    // Clean up
    await chrome.storage.local.remove(['test_key', 'timestamp'])
    logger.log('[Storage Test] Cleanup successful')

    return result.test_key === 'test_value'
  } catch (error) {
    logger.error('[Storage Test] Failed:', error)
    return false
  }
}
