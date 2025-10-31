/**
 * Person Types
 *
 * Minimal domain models for Pipedrive Person data
 * Backend transforms Pipedrive API responses to these types
 */

/**
 * Phone number with label and primary flag
 */
export interface Phone {
  /** Phone number in E.164 format (e.g., "+48123456789") */
  value: string
  /** Phone label (mobile, work, home, WhatsApp, etc.) */
  label: string
  /** True if this is the primary phone */
  isPrimary: boolean
}

/**
 * Person (minimal data for MVP)
 * This is what backend returns after transforming Pipedrive response
 */
export interface Person {
  /** Pipedrive person ID */
  id: number
  /** Person's full name */
  name: string
  /** Organization name if available */
  organizationName?: string | null
  /** All phone numbers (can be empty array) */
  phones: Phone[]
  /** Primary email or null if none exists */
  email: string | null
}

/**
 * Data for creating a new person
 */
export interface CreatePersonData {
  /** Required: Person's name */
  name: string
  /** Required: WhatsApp phone in E.164 format */
  phone: string
  /** Optional: Email address */
  email?: string
}

/**
 * Data for attaching phone to existing person
 */
export interface AttachPhoneData {
  /** Pipedrive person ID */
  personId: number
  /** WhatsApp phone in E.164 format */
  phone: string
}
