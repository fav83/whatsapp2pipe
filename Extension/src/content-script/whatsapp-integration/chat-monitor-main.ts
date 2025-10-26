/**
 * WhatsApp Chat Monitor - MAIN World
 *
 * This runs in MAIN world and has direct access to WhatsApp's Store.
 * It polls for chat changes and dispatches custom events to communicate
 * with the React app running in ISOLATED world.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

interface ChatStatusEvent {
  phone: string | null
  name: string | null
  is_group: boolean
  group_name?: string | null
  participants?: Array<{ phone: string; name: string }>
}

/**
 * Start monitoring WhatsApp chats from MAIN world
 * Dispatches 'whatsapp-chat-status' custom events to communicate with ISOLATED world
 */
export function startChatMonitoring() {
  console.log('[Chat Monitor MAIN] Starting chat monitoring in MAIN world')

  let lastChatName: string | null | undefined = undefined

  // Poll every 200ms
  setInterval(() => {
    try {
      const status = detectCurrentChat()

      // Only dispatch if chat changed
      if (status && status.name != lastChatName) {
        lastChatName = status.name
        console.log('[Chat Monitor MAIN] Chat changed:', status.name || '(none)')

        // Dispatch custom event to ISOLATED world
        window.dispatchEvent(
          new CustomEvent('whatsapp-chat-status', {
            detail: status,
          })
        )
      }
    } catch (error) {
      console.error('[Chat Monitor MAIN] Error in polling:', error)
    }
  }, 200)
}

/**
 * Detect current chat from WhatsApp Store (MAIN world only)
 */
function detectCurrentChat(): ChatStatusEvent | null {
  try {
    // Access Store directly via require
    const debugModule = (window as any).require?.('__debug')
    if (!debugModule?.modulesMap) {
      console.log('[Chat Monitor MAIN] Store not available yet')
      return null
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
      return null
    }

    // Get all chats and find active one
    const chats = store.Chat.getModelsArray()
    const activeChat = chats.find((chat: any) => chat.active === true)

    if (!activeChat) {
      return { phone: null, name: null, is_group: false }
    }

    // Check if group
    const is_group = !!activeChat.__x_groupMetadata

    if (is_group) {
      // Extract group participants
      const participants: Array<{ phone: string; name: string }> = []

      if (activeChat.__x_groupMetadata?.participants?._index) {
        Object.values(activeChat.__x_groupMetadata.participants._index).forEach(
          (participant: any) => {
            participants.push({
              phone: '+' + participant.__x_contact.__x_id.user,
              name:
                participant.__x_contact.__x_pushname ||
                participant.__x_contact.__x_name ||
                'Unknown',
            })
          }
        )
      }

      return {
        phone: null,
        name: activeChat.__x_contact.__x_name,
        is_group: true,
        group_name: activeChat.__x_contact.__x_name,
        participants,
      }
    } else {
      // Individual chat
      const phone = '+' + activeChat.__x_contact.__x_id.user
      const name =
        activeChat.__x_contact.__x_pushname || activeChat.__x_contact.__x_name || 'Unknown'

      return {
        phone,
        name,
        is_group: false,
      }
    }
  } catch (error) {
    console.error('[Chat Monitor MAIN] Error detecting chat:', error)
    return null
  }
}
