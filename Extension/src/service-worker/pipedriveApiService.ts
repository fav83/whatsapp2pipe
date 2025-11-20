/**
 * Service Worker Pipedrive API Service
 *
 * Handles all Pipedrive API calls through backend proxy
 * Runs in service worker context (background)
 * Content script communicates via message passing
 */

import { AUTH_CONFIG } from '../config'
import type { Person, CreatePersonData, AttachPhoneData } from '../types/person'
import type { Deal, CreateDealData, UpdateDealData } from '../types/deal'
import type { UserConfig } from '../types/config'
import { logError } from '../utils/errorLogger'
import { logBreadcrumb } from '../utils/breadcrumbs'
import { sentryScope } from './sentry'
import logger from '../utils/logger'

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
    try {
      logBreadcrumb(
        'API request started',
        'api.request_started',
        { endpoint, method: options.method || 'GET' },
        sentryScope
      )

      const verificationCode = await this.getVerificationCode()

      // Build headers - only include Content-Type for requests with body
      const headers: Record<string, string> = {
        Authorization: `Bearer ${verificationCode}`,
        ...(options.headers as Record<string, string>),
      }

      // Add Content-Type only for requests with a body (POST, PUT, PATCH)
      if (options.body) {
        headers['Content-Type'] = 'application/json'
      }

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      })

      // Handle HTTP errors
      if (!response.ok) {
        const statusCode = response.status
        let errorMessage: string

        switch (statusCode) {
          case 401:
            // Clear authentication on 401
            await chrome.storage.local.remove('verification_code')
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

        // Log API errors to Sentry (except 404 - expected state)
        if (statusCode !== 404) {
          logBreadcrumb(
            'API request failed',
            'api.request_failed',
            { endpoint, statusCode, errorMessage },
            sentryScope
          )

          logError(
            'API request failed',
            new Error(errorMessage),
            {
              endpoint,
              statusCode,
              method: options.method || 'GET',
            },
            sentryScope
          )
        }

        throw { statusCode, message: errorMessage }
      }

      logBreadcrumb(
        'API request success',
        'api.request_success',
        { endpoint, statusCode: response.status },
        sentryScope
      )

      return response.json()
    } catch (error) {
      // If error is already structured (thrown from response.ok check), re-throw
      if (typeof error === 'object' && error !== null && 'statusCode' in error) {
        throw error
      }

      // If error is "Not authenticated" from getVerificationCode(), treat as 401
      if (error instanceof Error && error.message === 'Not authenticated') {
        throw {
          statusCode: 401,
          message: 'Not authenticated',
        }
      }

      // Otherwise, this is a network error (fetch threw before getting response)
      logBreadcrumb(
        'API network error',
        'api.network_error',
        { endpoint, errorMessage: error instanceof Error ? error.message : String(error) },
        sentryScope
      )

      logError(
        'Network error',
        error,
        {
          endpoint,
          method: options.method || 'GET',
        },
        sentryScope
      )

      throw {
        statusCode: 0,
        message: 'Unable to connect. Check your internet connection.',
      }
    }
  }

  /**
   * Lookup person by phone number (returns person + deals)
   * Returns object with person, deals, and optional dealsError
   */
  async lookupByPhone(phone: string): Promise<{
    person: Person | null
    deals: Deal[] | null
    dealsError?: string
  }> {
    logger.log('[PipedriveAPI] Looking up person by phone:', phone)

    try {
      const response = await this.makeRequest<{
        person: Person | null
        deals: Deal[] | null
        dealsError?: string
      }>(`/api/pipedrive/persons/lookup?phone=${encodeURIComponent(phone)}`)

      return response
    } catch (error) {
      // Handle 404 as "person not found" (not an error)
      if (typeof error === 'object' && error !== null && 'statusCode' in error) {
        const statusError = error as { statusCode: number; message: string }
        if (statusError.statusCode === 404) {
          logger.log('[PipedriveAPI] Person not found (404)')
          return {
            person: null,
            deals: [],
          }
        }
      }
      // Re-throw other errors
      throw error
    }
  }

  /**
   * Search persons by name
   * Returns array of matching persons (can be empty)
   */
  async searchByName(name: string): Promise<Person[]> {
    logger.log('[PipedriveAPI] Searching persons by name:', name)

    const persons = await this.makeRequest<Person[]>(
      `/api/pipedrive/persons/search?term=${encodeURIComponent(name)}&fields=name`
    )

    return persons.slice(0, 10)
  }

  /**
   * Create new person with WhatsApp phone
   */
  async createPerson(data: CreatePersonData): Promise<Person> {
    logger.log('[PipedriveAPI] Creating person:', data.name)

    const person = await this.makeRequest<Person>('/api/pipedrive/persons', {
      method: 'POST',
      body: JSON.stringify(data),
    })

    logger.log('[PipedriveAPI] Person created with ID:', person.id)
    return person
  }

  /**
   * Attach WhatsApp phone to existing person
   */
  async attachPhone(data: AttachPhoneData): Promise<Person> {
    logger.log('[PipedriveAPI] Attaching phone to person:', data.personId)

    const person = await this.makeRequest<Person>(
      `/api/pipedrive/persons/${data.personId}/attach-phone`,
      {
        method: 'POST',
        body: JSON.stringify({ phone: data.phone }),
      }
    )

    logger.log('[PipedriveAPI] Phone attached successfully')
    return person
  }

  /**
   * Create a note in Pipedrive attached to a person
   * @param personId - Pipedrive person ID
   * @param content - Formatted note content
   * @throws Error with user-friendly message on failure
   */
  async createNote(personId: number, content: string): Promise<void> {
    logger.log('[PipedriveAPI] Creating note for person:', personId)

    const verificationCode = await this.getVerificationCode()

    if (!verificationCode) {
      throw new Error('Not authenticated')
    }

    const response = await fetch(`${this.baseUrl}/api/pipedrive/notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${verificationCode}`,
      },
      body: JSON.stringify({
        personId,
        content,
      }),
    })

    // Handle status codes
    if (response.status === 201) {
      logger.log('[PipedriveAPI] Note created successfully')
      return // Success
    }

    if (response.status === 401) {
      // Try to parse error body
      try {
        const errorData = await response.json()
        if (errorData.error === 'session_expired') {
          throw new Error('Session expired. Please sign in again.')
        }
      } catch {
        // Fall through to generic unauthorized
      }
      throw new Error('Unauthorized. Please sign in again.')
    }

    if (response.status === 400) {
      const errorText = await response.text()
      throw new Error(errorText || 'Invalid request')
    }

    if (response.status === 429) {
      throw new Error('Rate limit exceeded. Please try again later.')
    }

    // Generic error for 500 or other status codes
    throw new Error('Failed to create note. Please try again.')
  }

  /**
   * Create a deal in Pipedrive
   * @param data - Deal data (title, personId, pipelineId, stageId, optional value)
   * @returns Created deal with enriched metadata
   * @throws Error with user-friendly message on failure
   */
  async createDeal(data: CreateDealData): Promise<Deal> {
    logger.log('[PipedriveAPI] Creating deal:', data.title)

    const deal = await this.makeRequest<Deal>('/api/pipedrive/deals', {
      method: 'POST',
      body: JSON.stringify(data),
    })

    logger.log('[PipedriveAPI] Deal created with ID:', deal.id)
    return deal
  }

  /**
   * Update a deal's pipeline and/or stage
   * @param dealId - Deal ID to update
   * @param data - Update data (pipelineId, stageId)
   * @returns Updated deal with enriched metadata
   * @throws Error with user-friendly message on failure
   */
  async updateDeal(dealId: number, data: UpdateDealData): Promise<Deal> {
    logger.log('[PipedriveAPI] Updating deal:', dealId, data)

    const deal = await this.makeRequest<Deal>(`/api/pipedrive/deals/${dealId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })

    logger.log('[PipedriveAPI] Deal updated with ID:', deal.id)
    return deal
  }

  /**
   * Submit user feedback
   */
  async submitFeedback(message: string): Promise<void> {
    logger.log('[PipedriveAPI] Submitting feedback')

    const extensionVersion = chrome.runtime.getManifest().version

    await this.makeRequest<{ success: boolean }>('/api/feedback', {
      method: 'POST',
      body: JSON.stringify({
        message,
        extensionVersion,
      }),
    })

    logger.log('[PipedriveAPI] Feedback submitted successfully')
  }

  /**
   * Get user configuration (e.g., admin messages)
   */
  async getConfig(): Promise<UserConfig> {
    return this.makeRequest<UserConfig>('/api/config')
  }
}

export const pipedriveApiService = new PipedriveApiService()
