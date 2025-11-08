/**
 * Service Worker Pipedrive API Service
 *
 * Handles all Pipedrive API calls through backend proxy
 * Runs in service worker context (background)
 * Content script communicates via message passing
 */

import { AUTH_CONFIG } from '../config'
import type { Person, CreatePersonData, AttachPhoneData } from '../types/person'
import { logError } from '../utils/errorLogger'
import { logBreadcrumb } from '../utils/breadcrumbs'
import { sentryScope } from './sentry'

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

    return persons.slice(0, 10)
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

  /**
   * Submit user feedback
   */
  async submitFeedback(message: string): Promise<void> {
    console.log('[PipedriveAPI] Submitting feedback')

    const extensionVersion = chrome.runtime.getManifest().version

    await this.makeRequest<{ success: boolean }>('/api/feedback', {
      method: 'POST',
      body: JSON.stringify({
        message,
        extensionVersion,
      }),
    })

    console.log('[PipedriveAPI] Feedback submitted successfully')
  }
}

export const pipedriveApiService = new PipedriveApiService()
