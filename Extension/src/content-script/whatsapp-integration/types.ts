/**
 * WhatsApp Integration Type Definitions
 *
 * Types for chat detection and contact extraction from WhatsApp Web
 */

/**
 * Chat status extracted from WhatsApp Web
 */
export interface ChatStatus {
  /** Phone number in E.164 format (+prefix), null for groups or if unavailable */
  phone: string | null
  /** Contact display name, null if no chat selected */
  name: string | null
  /** Whether this is a group chat */
  is_group: boolean
  /** Group name (only for group chats) */
  group_name?: string | null
  /** Group participants (only for group chats) */
  participants?: Array<{ phone: string; name: string }>
}

/**
 * Callback function type for chat status changes
 */
export type ChatStatusCallback = (status: ChatStatus) => void

/**
 * WhatsApp Store interface (reverse-engineered)
 * Note: These are WhatsApp's undocumented internal APIs
 */
export interface WhatsAppStore {
  Chat: {
    getModelsArray(): WhatsAppChat[]
  }
  // Add other Store modules as needed
}

/**
 * WhatsApp Chat model (reverse-engineered)
 */
export interface WhatsAppChat {
  active: boolean
  __x_contact: WhatsAppContact
  __x_groupMetadata?: WhatsAppGroupMetadata
}

/**
 * WhatsApp Contact model (reverse-engineered)
 */
export interface WhatsAppContact {
  __x_id: {
    user: string // Phone number without '+'
  }
  __x_name: string
  __x_pushname?: string
}

/**
 * WhatsApp Group Metadata (reverse-engineered)
 */
export interface WhatsAppGroupMetadata {
  participants: {
    _index: Record<string, WhatsAppParticipant>
  }
}

/**
 * WhatsApp Group Participant (reverse-engineered)
 */
export interface WhatsAppParticipant {
  __x_contact: WhatsAppContact
}

/**
 * Extended Window interface with WhatsApp Store
 */
declare global {
  interface Window {
    /** WhatsApp Store exposed for extension use */
    StoreWhatsApp2Pipe?: WhatsAppStore
    /** Debug module for Comet architecture (v2.3000+) */
    Debug?: {
      VERSION?: string
    }
  }
}
