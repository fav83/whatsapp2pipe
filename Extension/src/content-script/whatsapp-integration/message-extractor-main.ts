/**
 * WhatsApp Message Extractor - MAIN World
 *
 * This runs in MAIN world and has direct access to WhatsApp's Store.
 * It listens for message extraction requests from ISOLATED world and
 * responds with extracted messages via custom events.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

// Logger not available in MAIN world - use console directly with inline isDevelopment check
const isDevelopment = import.meta.env.MODE === 'development'

interface ExtractMessagesRequest {
  requestId: string
  contactName: string
  userName: string
}

interface ExtractedMessage {
  id: string
  text: string
  timestamp: number
  fromMe: boolean
  senderName: string
}

interface ExtractMessagesResponse {
  requestId: string
  success: boolean
  messages?: ExtractedMessage[]
  error?: string
}

/**
 * Initialize message extraction listener in MAIN world
 * Called once during inspector-main initialization
 */
export function initializeMessageExtractor() {
  if (isDevelopment) {
    console.log('[Message Extractor MAIN] Initializing message extraction listener')
  }

  try {
    // Listen for extraction requests from ISOLATED world
    window.addEventListener('whatsapp-extract-messages-request', (event: Event) => {
      const customEvent = event as CustomEvent<ExtractMessagesRequest>
      const request = customEvent.detail

      if (isDevelopment) {
        console.log('[Message Extractor MAIN] Received extraction request:', request.requestId)
      }

      try {
        const messages = extractMessagesFromStore(request.contactName, request.userName)

        // Send success response
        const response: ExtractMessagesResponse = {
          requestId: request.requestId,
          success: true,
          messages,
        }

        window.dispatchEvent(
          new CustomEvent('whatsapp-extract-messages-response', {
            detail: response,
          })
        )

        if (isDevelopment) {
          console.log('[Message Extractor MAIN] Sent response with', messages.length, 'messages')
        }
      } catch (error) {
        // Send error response
        const response: ExtractMessagesResponse = {
          requestId: request.requestId,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        }

        window.dispatchEvent(
          new CustomEvent('whatsapp-extract-messages-response', {
            detail: response,
          })
        )

        if (isDevelopment) {
          console.error('[Message Extractor MAIN] Error extracting messages:', error)
        }
      }
    })

    if (isDevelopment) {
      console.log('[Message Extractor MAIN] Event listener registered successfully')
    }
  } catch (error) {
    if (isDevelopment) {
      console.error('[Message Extractor MAIN] Failed to initialize:', error)
    }
    throw error
  }
}

/**
 * Extract messages from WhatsApp Store (MAIN world only)
 */
function extractMessagesFromStore(contactName: string, userName: string): ExtractedMessage[] {
  // Access Store directly via require
  const debugModule = (window as any).require?.('__debug')
  if (!debugModule?.modulesMap) {
    throw new Error('WhatsApp Store not available')
  }

  // Find Store module
  const moduleKeys = Object.keys(debugModule.modulesMap)
  let store: any = null

  for (const key of moduleKeys) {
    const module = debugModule.modulesMap[key]
    const moduleExports = module?.defaultExport

    if (moduleExports?.Chat?.getModelsArray) {
      store = moduleExports
      break
    }
  }

  if (!store) {
    throw new Error('WhatsApp Store not found')
  }

  // Find active chat
  const chats = store.Chat.getModelsArray()
  const activeChat = chats.find((chat: any) => chat.active === true)

  if (!activeChat) {
    throw new Error('No active chat found')
  }

  // Get messages from chat
  const messages = activeChat.msgs.getModelsArray()

  if (isDevelopment) {
    console.log('[Message Extractor MAIN] Raw messages count:', messages.length)
  }

  // Filter and transform messages
  const extracted: ExtractedMessage[] = messages
    .filter((msg: any) => {
      // Exclude system notifications
      if (msg.isNotification) return false

      // Include messages with text OR specific media types we handle
      const hasText = msg.body && msg.body.trim().length > 0
      const isHandledMedia =
        msg.type && ['image', 'video', 'audio', 'ptt', 'document'].includes(msg.type)

      return hasText || isHandledMedia
    })
    .map((msg: any) => {
      // Debug logging - show ALL properties
      if (isDevelopment) {
        console.log('[Message Extractor MAIN] Message object keys:', Object.keys(msg).slice(0, 20))
        console.log('[Message Extractor MAIN] Full message (first one):', msg)
      }

      // Extract fromMe from message ID (format: "true_..." or "false_...")
      const idString = msg.id?._serialized || ''
      const fromMe = idString.startsWith('true_')

      // Try to find timestamp in various possible properties
      const timestamp = msg.t || msg.timestamp || msg.__x_t || Date.now() / 1000

      // Determine text content with media indicators
      let text = ''

      // For media messages, check for caption in separate properties
      // and completely ignore msg.body to avoid base64 data
      // Use square brackets to avoid HTML interpretation by Pipedrive
      if (msg.type === 'image') {
        const caption = msg.caption || ''
        text = caption ? `${caption} [img redacted]` : '[img redacted]'
      } else if (msg.type === 'video') {
        const caption = msg.caption || ''
        text = caption ? `${caption} [video redacted]` : '[video redacted]'
      } else if (msg.type === 'audio' || msg.type === 'ptt') {
        const caption = msg.caption || ''
        text = caption ? `${caption} [audio redacted]` : '[audio redacted]'
      } else if (msg.type === 'document') {
        const caption = msg.caption || ''
        text = caption ? `${caption} [document redacted]` : '[document redacted]'
      } else {
        // For regular text messages, use body
        text = msg.body || ''
      }

      if (isDevelopment) {
        console.log('[Message Extractor MAIN] Extracted data:', {
          id: idString,
          fromMe,
          timestamp,
          type: msg.type,
          textPreview: text.substring(0, 50),
        })
      }

      return {
        id: msg.id._serialized,
        text,
        timestamp,
        fromMe,
        senderName: fromMe ? userName : contactName,
      }
    })
    .sort((a: ExtractedMessage, b: ExtractedMessage) => a.timestamp - b.timestamp) // Oldest first

  if (isDevelopment) {
    console.log('[Message Extractor MAIN] Extracted messages:', extracted.length)
    if (extracted.length > 0) {
      console.log('[Message Extractor MAIN] First message:', extracted[0])
      console.log('[Message Extractor MAIN] Last message:', extracted[extracted.length - 1])
    }
  }

  return extracted
}
