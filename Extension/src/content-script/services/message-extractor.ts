import * as logger from '@/utils/logger'

export interface ExtractedMessage {
  id: string // msg.id._serialized
  text: string // msg.body
  timestamp: number // msg.timestamp (Unix timestamp in seconds)
  fromMe: boolean // msg.fromMe
  senderName: string // Contact name or user name
}

interface ExtractMessagesRequest {
  requestId: string
  contactName: string
  userName: string
}

interface ExtractMessagesResponse {
  requestId: string
  success: boolean
  messages?: ExtractedMessage[]
  error?: string
}

/**
 * Extract messages from current WhatsApp chat
 *
 * This function communicates with MAIN world (inspector-main.js) via custom events
 * because WhatsApp Store is only accessible from MAIN world.
 *
 * @param contactName - Name of the contact (for incoming messages)
 * @param userName - Name of the authenticated user (for outgoing messages)
 * @returns Array of extracted messages, sorted chronologically
 * @throws Error if extraction fails
 */
export async function extractMessagesFromWhatsApp(
  contactName: string,
  userName: string
): Promise<ExtractedMessage[]> {
  logger.log('[message-extractor] Requesting message extraction from MAIN world')

  // Generate unique request ID
  const requestId = `extract-${Date.now()}-${Math.random().toString(36).slice(2)}`

  // Create promise that resolves when response is received
  const promise = new Promise<ExtractedMessage[]>((resolve, reject) => {
    // Timeout after 10 seconds
    const timeout = setTimeout(() => {
      window.removeEventListener('whatsapp-extract-messages-response', responseHandler)
      reject(new Error('Message extraction timed out. Please try again.'))
    }, 10000)

    // Listen for response from MAIN world
    const responseHandler = ((event: CustomEvent) => {
      const response = event.detail as ExtractMessagesResponse

      // Only process responses for this request
      if (response.requestId !== requestId) {
        return
      }

      clearTimeout(timeout)
      window.removeEventListener('whatsapp-extract-messages-response', responseHandler)

      if (response.success && response.messages) {
        logger.log(
          '[message-extractor] Received',
          response.messages.length,
          'messages from MAIN world'
        )
        resolve(response.messages)
      } else {
        logger.error('[message-extractor] Extraction failed:', response.error)
        reject(new Error(response.error || 'Failed to extract messages'))
      }
    }) as EventListener

    window.addEventListener('whatsapp-extract-messages-response', responseHandler)

    // Dispatch request to MAIN world
    const request: ExtractMessagesRequest = {
      requestId,
      contactName,
      userName,
    }

    window.dispatchEvent(
      new CustomEvent('whatsapp-extract-messages-request', {
        detail: request,
      })
    )

    logger.log('[message-extractor] Dispatched extraction request:', requestId)
  })

  return promise
}
