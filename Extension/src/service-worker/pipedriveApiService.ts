/**
 * Service Worker Pipedrive API Service
 *
 * Handles all Pipedrive API calls through backend proxy
 * Runs in service worker context (background)
 * Content script communicates via message passing
 */

import { AUTH_CONFIG } from '../config'
import type { Person, CreatePersonData, AttachPhoneData } from '../types/person'

class PipedriveApiService {
  private readonly baseUrl = AUTH_CONFIG.backendUrl

  /**
   * Gets verification_code from chrome.storage.local
   * Required for all API calls
   */
  private async getVerificationCode(): Promise<string> {
    const result = await chrome.storage.local.get('verification_code')
    if (!result.verification_code) {
      throw new Error('Not authenticated')
    }
    return result.verification_code
  }

  /**
   * Makes authenticated request to backend
   * Includes verification_code in Authorization header
   */
  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const verificationCode = await this.getVerificationCode()

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${verificationCode}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    // Handle HTTP errors
    if (!response.ok) {
      const statusCode = response.status
      let errorMessage: string

      switch (statusCode) {
        case 401:
          errorMessage = 'Authentication expired. Please sign in again.'
          break
        case 404:
          errorMessage = 'Person not found'
          break
        case 429:
          errorMessage = 'Too many requests. Please try again in a moment.'
          break
        case 500:
          errorMessage = 'Server error. Please try again later.'
          break
        default:
          errorMessage = 'An error occurred. Please try again.'
      }

      throw { statusCode, message: errorMessage }
    }

    return response.json()
  }

  /**
   * Lookup person by phone number
   * Returns single person or null if not found
   */
  async lookupByPhone(phone: string): Promise<Person | null> {
    console.log('[PipedriveAPI] Looking up person by phone:', phone)

    const persons = await this.makeRequest<Person[]>(
      `/api/pipedrive/persons/search?term=${encodeURIComponent(phone)}&fields=phone`
    )

    // Return first match or null
    return persons.length > 0 ? persons[0] : null
  }

  /**
   * Search persons by name
   * Returns array of matching persons (can be empty)
   */
  async searchByName(name: string): Promise<Person[]> {
    console.log('[PipedriveAPI] Searching persons by name:', name)

    const persons = await this.makeRequest<Person[]>(
      `/api/pipedrive/persons/search?term=${encodeURIComponent(name)}&fields=name`
    )

    return persons
  }

  /**
   * Create new person with WhatsApp phone
   */
  async createPerson(data: CreatePersonData): Promise<Person> {
    console.log('[PipedriveAPI] Creating person:', data.name)

    const person = await this.makeRequest<Person>('/api/pipedrive/persons', {
      method: 'POST',
      body: JSON.stringify(data),
    })

    console.log('[PipedriveAPI] Person created with ID:', person.id)
    return person
  }

  /**
   * Attach WhatsApp phone to existing person
   */
  async attachPhone(data: AttachPhoneData): Promise<Person> {
    console.log('[PipedriveAPI] Attaching phone to person:', data.personId)

    const person = await this.makeRequest<Person>(
      `/api/pipedrive/persons/${data.personId}/attach-phone`,
      {
        method: 'POST',
        body: JSON.stringify({ phone: data.phone }),
      }
    )

    console.log('[PipedriveAPI] Phone attached successfully')
    return person
  }
}

export const pipedriveApiService = new PipedriveApiService()
