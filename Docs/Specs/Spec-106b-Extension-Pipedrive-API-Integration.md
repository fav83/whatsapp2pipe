# Spec-106b: Extension Pipedrive API Integration

**Feature:** Feature 6 - Pipedrive API Service Layer (Extension)
**Date:** 2025-10-28
**Status:** ✅ Complete
**Completed:** 2025-10-29
**Dependencies:** Spec-106a (Backend Pipedrive API Service must be deployed)

---

## Implementation Split

Feature 6 (Pipedrive API Service Layer) is split into two independent specifications:

- **Spec-106a:** Backend Pipedrive API Service - Azure Functions + C# + Pipedrive API integration
- **Spec-106b (This Document):** Extension Pipedrive API Integration - TypeScript + React + Service Worker

**Implementation Order:**
1. Spec-106a (Backend) - Must be completed and deployed first
2. Spec-106b (Extension) - Integrates with deployed backend

---

**Related Docs:**
- [BRD-001-MVP-Pipedrive-WhatsApp.md](../BRDs/BRD-001-MVP-Pipedrive-WhatsApp.md) - Sections 4.3, 4.4, 4.5 (Person operations)
- [Plan-001-MVP-Feature-Breakdown.md](../Plans/Plan-001-MVP-Feature-Breakdown.md) - Feature 6
- [Spec-105b-Extension-OAuth-Integration.md](Spec-105b-Extension-OAuth-Integration.md) - OAuth foundation
- [Spec-106a-Backend-Pipedrive-API-Service.md](Spec-106a-Backend-Pipedrive-API-Service.md) - Backend counterpart

---

## 1. Overview

Implement extension-side Pipedrive API integration that enables React components to interact with Pipedrive through the backend proxy service. The implementation follows the same hybrid architecture as OAuth (Spec-105b): service worker makes HTTP requests, content script uses React hooks for UI integration.

**Why this matters:** Features 9-11 (Person lookup, create, attach flows) depend on this API service layer. This feature provides the foundational hooks and services that UI components will use.

**Architecture Pattern:** Service Worker + Message Passing - Content script sends messages to service worker, service worker makes authenticated HTTP requests to backend, responses flow back to React components via hooks.

---

## 2. Objectives

- Implement service worker API client that calls backend endpoints
- Create type-safe message passing between content script and service worker
- Build React hook (`usePipedrive`) for all Pipedrive operations
- Handle loading and error states automatically
- Support all 4 operations: lookup by phone, search by name, create person, attach phone
- Use discriminated unions for type safety (consistent with OAuth implementation)

---

## 3. Architecture Overview

### 3.1 Component Structure

```
Extension/src/
├── types/
│   ├── person.ts                         # NEW - Person, Phone, CreatePersonData types
│   └── messages.ts                       # UPDATE - Add Pipedrive message types
├── service-worker/
│   ├── pipedriveApiService.ts            # NEW - Pipedrive API client
│   └── index.ts                          # UPDATE - Add Pipedrive message handlers
├── content-script/
│   └── hooks/
│       └── usePipedrive.ts               # NEW - React hook for Pipedrive operations
└── config.ts                             # EXISTING - Already has AUTH_CONFIG
```

### 3.2 Data Flow

```
React Component (Content Script)
    ↓
usePipedrive() hook
    ↓ chrome.runtime.sendMessage({ type: 'PIPEDRIVE_LOOKUP_BY_PHONE', phone })
Service Worker
    ↓
pipedriveApiService.lookupByPhone(phone)
    ↓ fetch(backend + verification_code)
Backend Azure Function
    ↓ (Pipedrive API)
Backend Azure Function
    ↓ (Transformed response)
Service Worker
    ↓ sendResponse({ type: 'PIPEDRIVE_LOOKUP_SUCCESS', person })
usePipedrive() hook
    ↓ (Update state)
React Component (Re-renders with data)
```

---

## 4. Functional Requirements

### 4.1 TypeScript Type Definitions

**File: `types/person.ts` (NEW)**

```typescript
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
```

**Acceptance Criteria:**
- ✅ All types defined with JSDoc comments
- ✅ Phone numbers always in E.164 format
- ✅ `Person.email` is `string | null` (not optional)
- ✅ `Person.phones` is always array (never undefined)
- ✅ `CreatePersonData.email` is optional

---

### 4.2 Message Type Definitions

**File: `types/messages.ts` (UPDATE EXISTING)**

Add Pipedrive message types to existing file that contains `AuthSignInRequest`, `AuthSignInResponse`, etc.

```typescript
/**
 * Pipedrive API Messages
 *
 * Discriminated unions for type-safe message passing
 * between content script and service worker
 */

import type { Person, CreatePersonData, AttachPhoneData } from './person'

// ============================================================================
// Request Messages (Content Script → Service Worker)
// ============================================================================

/**
 * Lookup person by phone number
 */
export interface PipedriveLookupByPhoneRequest {
  type: 'PIPEDRIVE_LOOKUP_BY_PHONE'
  phone: string  // E.164 format
}

/**
 * Search persons by name
 */
export interface PipedriveSearchByNameRequest {
  type: 'PIPEDRIVE_SEARCH_BY_NAME'
  name: string
}

/**
 * Create new person
 */
export interface PipedriveCreatePersonRequest {
  type: 'PIPEDRIVE_CREATE_PERSON'
  data: CreatePersonData
}

/**
 * Attach WhatsApp phone to existing person
 */
export interface PipedriveAttachPhoneRequest {
  type: 'PIPEDRIVE_ATTACH_PHONE'
  data: AttachPhoneData
}

/**
 * Union of all Pipedrive request messages
 */
export type PipedriveRequest =
  | PipedriveLookupByPhoneRequest
  | PipedriveSearchByNameRequest
  | PipedriveCreatePersonRequest
  | PipedriveAttachPhoneRequest

// ============================================================================
// Response Messages (Service Worker → Content Script)
// ============================================================================

/**
 * Successful lookup by phone
 * Returns single person or null if not found
 */
export interface PipedriveLookupSuccess {
  type: 'PIPEDRIVE_LOOKUP_SUCCESS'
  person: Person | null
}

/**
 * Successful search by name
 * Returns array of matching persons (can be empty)
 */
export interface PipedriveSearchSuccess {
  type: 'PIPEDRIVE_SEARCH_SUCCESS'
  persons: Person[]
}

/**
 * Successfully created person
 */
export interface PipedriveCreateSuccess {
  type: 'PIPEDRIVE_CREATE_SUCCESS'
  person: Person
}

/**
 * Successfully attached phone
 */
export interface PipedriveAttachSuccess {
  type: 'PIPEDRIVE_ATTACH_SUCCESS'
  person: Person
}

/**
 * Pipedrive API error
 * Includes HTTP status code and user-friendly message
 */
export interface PipedriveError {
  type: 'PIPEDRIVE_ERROR'
  /** User-friendly error message (ready for display) */
  error: string
  /** HTTP status code from backend */
  statusCode: number
}

/**
 * Union of all Pipedrive response messages
 */
export type PipedriveResponse =
  | PipedriveLookupSuccess
  | PipedriveSearchSuccess
  | PipedriveCreateSuccess
  | PipedriveAttachSuccess
  | PipedriveError
```

**Acceptance Criteria:**
- ✅ All message types use discriminated unions
- ✅ Request and response types are separate unions
- ✅ Consistent naming with existing `Auth` messages
- ✅ JSDoc comments for all types
- ✅ Error type includes user-friendly message and status code

---

### 4.3 Service Worker API Client

**File: `service-worker/pipedriveApiService.ts` (NEW)**

```typescript
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
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const verificationCode = await this.getVerificationCode()

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${verificationCode}`,
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

    const person = await this.makeRequest<Person>(
      '/api/pipedrive/persons',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    )

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
```

**Acceptance Criteria:**
- ✅ All methods retrieve `verification_code` from storage
- ✅ All requests include Authorization header
- ✅ Error handling converts HTTP codes to user-friendly messages
- ✅ Console logging for debugging
- ✅ Type-safe with Person/CreatePersonData/AttachPhoneData types
- ✅ Lookup returns null when no matches (not empty array)
- ✅ Search returns empty array when no matches

---

### 4.4 Service Worker Message Handlers

**File: `service-worker/index.ts` (UPDATE EXISTING)**

Add Pipedrive message handlers to existing service worker that already handles `AUTH_SIGN_IN`.

```typescript
import { serviceWorkerAuthService } from './authService'
import { pipedriveApiService } from './pipedriveApiService'
import type {
  AuthSignInRequest,
  AuthSignInResponse,
  PipedriveRequest,
  PipedriveResponse,
} from '../types/messages'

/**
 * Message handler for all extension messages
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Existing AUTH_SIGN_IN handler
  if (message.type === 'AUTH_SIGN_IN') {
    handleAuthSignIn(message, sendResponse)
    return true
  }

  // NEW: Pipedrive API message handlers
  if (message.type === 'PIPEDRIVE_LOOKUP_BY_PHONE') {
    handlePipedriveLookup(message, sendResponse)
    return true
  }

  if (message.type === 'PIPEDRIVE_SEARCH_BY_NAME') {
    handlePipedriveSearch(message, sendResponse)
    return true
  }

  if (message.type === 'PIPEDRIVE_CREATE_PERSON') {
    handlePipedriveCreate(message, sendResponse)
    return true
  }

  if (message.type === 'PIPEDRIVE_ATTACH_PHONE') {
    handlePipedriveAttach(message, sendResponse)
    return true
  }

  return false
})

// Existing auth handler...
async function handleAuthSignIn(
  message: AuthSignInRequest,
  sendResponse: (response: AuthSignInResponse) => void
) {
  // ... existing implementation ...
}

/**
 * Handle lookup by phone
 */
async function handlePipedriveLookup(
  message: PipedriveRequest,
  sendResponse: (response: PipedriveResponse) => void
) {
  try {
    if (message.type !== 'PIPEDRIVE_LOOKUP_BY_PHONE') return

    const person = await pipedriveApiService.lookupByPhone(message.phone)

    sendResponse({
      type: 'PIPEDRIVE_LOOKUP_SUCCESS',
      person,
    })
  } catch (error: any) {
    sendResponse({
      type: 'PIPEDRIVE_ERROR',
      error: error.message || 'Lookup failed',
      statusCode: error.statusCode || 500,
    })
  }
}

/**
 * Handle search by name
 */
async function handlePipedriveSearch(
  message: PipedriveRequest,
  sendResponse: (response: PipedriveResponse) => void
) {
  try {
    if (message.type !== 'PIPEDRIVE_SEARCH_BY_NAME') return

    const persons = await pipedriveApiService.searchByName(message.name)

    sendResponse({
      type: 'PIPEDRIVE_SEARCH_SUCCESS',
      persons,
    })
  } catch (error: any) {
    sendResponse({
      type: 'PIPEDRIVE_ERROR',
      error: error.message || 'Search failed',
      statusCode: error.statusCode || 500,
    })
  }
}

/**
 * Handle create person
 */
async function handlePipedriveCreate(
  message: PipedriveRequest,
  sendResponse: (response: PipedriveResponse) => void
) {
  try {
    if (message.type !== 'PIPEDRIVE_CREATE_PERSON') return

    const person = await pipedriveApiService.createPerson(message.data)

    sendResponse({
      type: 'PIPEDRIVE_CREATE_SUCCESS',
      person,
    })
  } catch (error: any) {
    sendResponse({
      type: 'PIPEDRIVE_ERROR',
      error: error.message || 'Failed to create person',
      statusCode: error.statusCode || 500,
    })
  }
}

/**
 * Handle attach phone
 */
async function handlePipedriveAttach(
  message: PipedriveRequest,
  sendResponse: (response: PipedriveResponse) => void
) {
  try {
    if (message.type !== 'PIPEDRIVE_ATTACH_PHONE') return

    const person = await pipedriveApiService.attachPhone(message.data)

    sendResponse({
      type: 'PIPEDRIVE_ATTACH_SUCCESS',
      person,
    })
  } catch (error: any) {
    sendResponse({
      type: 'PIPEDRIVE_ERROR',
      error: error.message || 'Failed to attach phone',
      statusCode: error.statusCode || 500,
    })
  }
}
```

**Acceptance Criteria:**
- ✅ All handlers return `true` to keep sendResponse alive
- ✅ All handlers catch errors and send PIPEDRIVE_ERROR response
- ✅ Type guards validate message types before processing
- ✅ Consistent error handling across all handlers
- ✅ Follows same pattern as existing AUTH_SIGN_IN handler

---

### 4.5 React Hook for Content Script

**File: `content-script/hooks/usePipedrive.ts` (NEW)**

```typescript
/**
 * Content Script Pipedrive Hook
 *
 * React hook for Pipedrive API operations
 * Sends messages to service worker and handles responses
 */

import { useState } from 'react'
import type {
  Person,
  CreatePersonData,
  AttachPhoneData,
} from '../../types/person'
import type {
  PipedriveRequest,
  PipedriveResponse,
} from '../../types/messages'

interface PipedriveError {
  message: string
  statusCode: number
}

export function usePipedrive() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<PipedriveError | null>(null)

  /**
   * Sends message to service worker and waits for response
   */
  const sendMessage = async <T extends PipedriveResponse>(
    message: PipedriveRequest
  ): Promise<T> => {
    const response = await chrome.runtime.sendMessage(message)
    return response as T
  }

  /**
   * Lookup person by phone number
   * Returns person or null if not found
   */
  const lookupByPhone = async (phone: string): Promise<Person | null> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await sendMessage<PipedriveResponse>({
        type: 'PIPEDRIVE_LOOKUP_BY_PHONE',
        phone,
      })

      if (response.type === 'PIPEDRIVE_LOOKUP_SUCCESS') {
        return response.person
      } else if (response.type === 'PIPEDRIVE_ERROR') {
        setError({
          message: response.error,
          statusCode: response.statusCode,
        })
        return null
      }

      throw new Error('Unexpected response type')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Lookup failed'
      setError({ message: errorMessage, statusCode: 500 })
      return null
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Search persons by name
   * Returns array of matching persons (empty if none found)
   */
  const searchByName = async (name: string): Promise<Person[]> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await sendMessage<PipedriveResponse>({
        type: 'PIPEDRIVE_SEARCH_BY_NAME',
        name,
      })

      if (response.type === 'PIPEDRIVE_SEARCH_SUCCESS') {
        return response.persons
      } else if (response.type === 'PIPEDRIVE_ERROR') {
        setError({
          message: response.error,
          statusCode: response.statusCode,
        })
        return []
      }

      throw new Error('Unexpected response type')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Search failed'
      setError({ message: errorMessage, statusCode: 500 })
      return []
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Create new person with WhatsApp phone
   */
  const createPerson = async (data: CreatePersonData): Promise<Person | null> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await sendMessage<PipedriveResponse>({
        type: 'PIPEDRIVE_CREATE_PERSON',
        data,
      })

      if (response.type === 'PIPEDRIVE_CREATE_SUCCESS') {
        return response.person
      } else if (response.type === 'PIPEDRIVE_ERROR') {
        setError({
          message: response.error,
          statusCode: response.statusCode,
        })
        return null
      }

      throw new Error('Unexpected response type')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create person'
      setError({ message: errorMessage, statusCode: 500 })
      return null
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Attach WhatsApp phone to existing person
   */
  const attachPhone = async (data: AttachPhoneData): Promise<Person | null> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await sendMessage<PipedriveResponse>({
        type: 'PIPEDRIVE_ATTACH_PHONE',
        data,
      })

      if (response.type === 'PIPEDRIVE_ATTACH_SUCCESS') {
        return response.person
      } else if (response.type === 'PIPEDRIVE_ERROR') {
        setError({
          message: response.error,
          statusCode: response.statusCode,
        })
        return null
      }

      throw new Error('Unexpected response type')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to attach phone'
      setError({ message: errorMessage, statusCode: 500 })
      return null
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Clear error state
   */
  const clearError = () => setError(null)

  return {
    isLoading,
    error,
    lookupByPhone,
    searchByName,
    createPerson,
    attachPhone,
    clearError,
  }
}
```

**Acceptance Criteria:**
- ✅ Hook manages loading state automatically
- ✅ Hook manages error state automatically
- ✅ Returns null/empty array on errors (graceful degradation)
- ✅ Error messages are user-friendly (ready for UI display)
- ✅ All operations are async
- ✅ clearError() allows manual error dismissal
- ✅ Type-safe with discriminated unions

---

### 4.6 Usage Examples

**Example 1: Auto-lookup when chat changes**

```typescript
import { usePipedrive } from '../hooks/usePipedrive'

function ContactLookup({ phone }: { phone: string }) {
  const { lookupByPhone, isLoading, error } = usePipedrive()
  const [person, setPerson] = useState<Person | null>(null)

  useEffect(() => {
    const lookup = async () => {
      const result = await lookupByPhone(phone)
      setPerson(result)
    }
    lookup()
  }, [phone])

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>
  if (!person) return <div>No match found</div>

  return <PersonCard person={person} />
}
```

**Example 2: Search by name**

```typescript
function PersonSearch() {
  const { searchByName, isLoading } = usePipedrive()
  const [results, setResults] = useState<Person[]>([])
  const [searchTerm, setSearchTerm] = useState('')

  const handleSearch = async () => {
    const persons = await searchByName(searchTerm)
    setResults(persons)
  }

  return (
    <div>
      <input
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search by name"
      />
      <button onClick={handleSearch} disabled={isLoading}>
        Search
      </button>
      {results.map(person => (
        <PersonCard key={person.id} person={person} />
      ))}
    </div>
  )
}
```

**Example 3: Create person**

```typescript
function CreatePersonForm({ phone }: { phone: string }) {
  const { createPerson, isLoading, error } = usePipedrive()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  const handleCreate = async () => {
    const person = await createPerson({
      name,
      phone,
      email: email || undefined
    })

    if (person) {
      // Success - show person card
      console.log('Person created:', person)
    }
  }

  return (
    <div>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name"
      />
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email (optional)"
      />
      <button onClick={handleCreate} disabled={isLoading}>
        Create
      </button>
      {error && <div className="error">{error.message}</div>}
    </div>
  )
}
```

**Example 4: Attach phone**

```typescript
function AttachPhoneButton({ person, phone }: { person: Person; phone: string }) {
  const { attachPhone, isLoading } = usePipedrive()

  const handleAttach = async () => {
    const updatedPerson = await attachPhone({
      personId: person.id,
      phone
    })

    if (updatedPerson) {
      console.log('Phone attached:', updatedPerson)
    }
  }

  return (
    <button onClick={handleAttach} disabled={isLoading}>
      {isLoading ? 'Attaching...' : `Add ${phone}`}
    </button>
  )
}
```

---

## 5. Testing Strategy

### 5.1 Unit Tests (Vitest)

**Test: Service Worker API Service**

```typescript
// pipedriveApiService.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { pipedriveApiService } from '../pipedriveApiService'

describe('PipedriveApiService', () => {
  beforeEach(() => {
    // Mock chrome.storage.local
    global.chrome = {
      storage: {
        local: {
          get: vi.fn().mockResolvedValue({ verification_code: 'test_code' }),
        },
      },
    } as any

    // Mock fetch
    global.fetch = vi.fn()
  })

  it('lookupByPhone sends correct request', async () => {
    const mockPerson = { id: 123, name: 'John', phones: [], email: null }
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => [mockPerson],
    } as Response)

    const result = await pipedriveApiService.lookupByPhone('+48123456789')

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/pipedrive/persons/search'),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test_code',
        }),
      })
    )
    expect(result).toEqual(mockPerson)
  })

  it('lookupByPhone returns null when no matches', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => [],
    } as Response)

    const result = await pipedriveApiService.lookupByPhone('+48123456789')

    expect(result).toBeNull()
  })

  it('searchByName returns empty array when no matches', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => [],
    } as Response)

    const result = await pipedriveApiService.searchByName('John')

    expect(result).toEqual([])
  })

  it('createPerson sends correct payload', async () => {
    const mockPerson = { id: 456, name: 'Jane', phones: [], email: null }
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockPerson,
      status: 201,
    } as Response)

    await pipedriveApiService.createPerson({
      name: 'Jane',
      phone: '+48123456789',
      email: 'jane@example.com',
    })

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/pipedrive/persons'),
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('Jane'),
      })
    )
  })

  it('handles 401 unauthorized error', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 401,
    } as Response)

    await expect(
      pipedriveApiService.lookupByPhone('+48123456789')
    ).rejects.toMatchObject({
      statusCode: 401,
      message: expect.stringContaining('Authentication expired'),
    })
  })

  it('handles 429 rate limit error', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 429,
    } as Response)

    await expect(
      pipedriveApiService.searchByName('John')
    ).rejects.toMatchObject({
      statusCode: 429,
      message: expect.stringContaining('Too many requests'),
    })
  })

  it('handles 500 server error', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 500,
    } as Response)

    await expect(
      pipedriveApiService.createPerson({ name: 'Test', phone: '+48123' })
    ).rejects.toMatchObject({
      statusCode: 500,
      message: expect.stringContaining('Server error'),
    })
  })
})
```

**Test: React Hook**

```typescript
// usePipedrive.test.ts
import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { usePipedrive } from '../usePipedrive'

describe('usePipedrive', () => {
  beforeEach(() => {
    // Mock chrome.runtime.sendMessage
    global.chrome = {
      runtime: {
        sendMessage: vi.fn(),
      },
    } as any
  })

  it('lookupByPhone sets loading state', async () => {
    vi.mocked(chrome.runtime.sendMessage).mockImplementation(() =>
      new Promise(resolve => setTimeout(resolve, 100))
    )

    const { result } = renderHook(() => usePipedrive())

    expect(result.current.isLoading).toBe(false)

    const promise = result.current.lookupByPhone('+48123456789')

    await waitFor(() => {
      expect(result.current.isLoading).toBe(true)
    })

    await promise
  })

  it('lookupByPhone returns person on success', async () => {
    const mockPerson = { id: 123, name: 'John', phones: [], email: null }
    vi.mocked(chrome.runtime.sendMessage).mockResolvedValue({
      type: 'PIPEDRIVE_LOOKUP_SUCCESS',
      person: mockPerson,
    })

    const { result } = renderHook(() => usePipedrive())
    const person = await result.current.lookupByPhone('+48123456789')

    expect(person).toEqual(mockPerson)
    expect(result.current.error).toBeNull()
  })

  it('lookupByPhone returns null on error', async () => {
    vi.mocked(chrome.runtime.sendMessage).mockResolvedValue({
      type: 'PIPEDRIVE_ERROR',
      error: 'Not found',
      statusCode: 404,
    })

    const { result } = renderHook(() => usePipedrive())
    const person = await result.current.lookupByPhone('+48123456789')

    expect(person).toBeNull()
    expect(result.current.error).toMatchObject({
      message: 'Not found',
      statusCode: 404,
    })
  })

  it('searchByName returns empty array on error', async () => {
    vi.mocked(chrome.runtime.sendMessage).mockResolvedValue({
      type: 'PIPEDRIVE_ERROR',
      error: 'Network error',
      statusCode: 500,
    })

    const { result } = renderHook(() => usePipedrive())
    const persons = await result.current.searchByName('John')

    expect(persons).toEqual([])
    expect(result.current.error).toMatchObject({
      message: 'Network error',
      statusCode: 500,
    })
  })

  it('clearError clears error state', async () => {
    vi.mocked(chrome.runtime.sendMessage).mockResolvedValue({
      type: 'PIPEDRIVE_ERROR',
      error: 'Test error',
      statusCode: 500,
    })

    const { result } = renderHook(() => usePipedrive())
    await result.current.lookupByPhone('+48123456789')

    expect(result.current.error).not.toBeNull()

    result.current.clearError()

    await waitFor(() => {
      expect(result.current.error).toBeNull()
    })
  })

  it('createPerson sends correct message', async () => {
    const mockPerson = { id: 456, name: 'Jane', phones: [], email: null }
    vi.mocked(chrome.runtime.sendMessage).mockResolvedValue({
      type: 'PIPEDRIVE_CREATE_SUCCESS',
      person: mockPerson,
    })

    const { result } = renderHook(() => usePipedrive())
    await result.current.createPerson({
      name: 'Jane',
      phone: '+48123456789',
      email: 'jane@example.com',
    })

    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({
      type: 'PIPEDRIVE_CREATE_PERSON',
      data: {
        name: 'Jane',
        phone: '+48123456789',
        email: 'jane@example.com',
      },
    })
  })

  it('attachPhone sends correct message', async () => {
    const mockPerson = { id: 123, name: 'John', phones: [], email: null }
    vi.mocked(chrome.runtime.sendMessage).mockResolvedValue({
      type: 'PIPEDRIVE_ATTACH_SUCCESS',
      person: mockPerson,
    })

    const { result } = renderHook(() => usePipedrive())
    await result.current.attachPhone({
      personId: 123,
      phone: '+48123456789',
    })

    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({
      type: 'PIPEDRIVE_ATTACH_PHONE',
      data: {
        personId: 123,
        phone: '+48123456789',
      },
    })
  })
})
```

### 5.2 Manual Testing Checklist

**Service Worker Tests:**
- [ ] Service worker receives messages from content script
- [ ] Service worker makes authenticated requests to backend
- [ ] Authorization header includes verification_code
- [ ] Error responses handled correctly (401, 404, 429, 500)
- [ ] Console logging shows API calls and responses

**React Hook Tests:**
- [ ] usePipedrive hook updates loading state correctly
- [ ] usePipedrive hook handles success responses
- [ ] usePipedrive hook handles error responses
- [ ] Error messages are user-friendly (no technical jargon)
- [ ] clearError() clears error state

**Integration Tests:**
- [ ] Lookup by phone returns correct person
- [ ] Lookup by phone returns null when not found
- [ ] Search by name returns array of persons
- [ ] Search by name returns empty array when not found
- [ ] Create person returns created person
- [ ] Attach phone returns updated person with new phone
- [ ] All operations work with E.164 phone format

**End-to-End Test:**
- [ ] Complete flow: lookup → not found → create → lookup finds created person
- [ ] Complete flow: lookup → not found → search by name → attach phone → verify

---

## 6. Acceptance Criteria (Spec-106b Complete)

### 6.1 Functional Requirements

- ✅ `types/person.ts` created with Person, Phone, CreatePersonData, AttachPhoneData
- ✅ `types/messages.ts` updated with Pipedrive request/response types
- ✅ `service-worker/pipedriveApiService.ts` implemented with 4 methods
- ✅ `service-worker/index.ts` updated with 4 message handlers
- ✅ `content-script/hooks/usePipedrive.ts` implemented
- ✅ All methods retrieve `verification_code` from storage
- ✅ All requests include Authorization header
- ✅ Message handlers return `true` to keep sendResponse alive
- ✅ Error handling converts HTTP codes to user-friendly messages

### 6.2 Type Safety Requirements

- ✅ All types use discriminated unions
- ✅ Request and response types are separate unions
- ✅ JSDoc comments for all types
- ✅ Consistent with existing Auth message types
- ✅ No `any` types in production code

### 6.3 State Management Requirements

- ✅ Hook manages loading state automatically
- ✅ Hook manages error state automatically
- ✅ Returns null/empty array on errors (graceful degradation)
- ✅ clearError() allows manual error dismissal

### 6.4 Testing Requirements

- ✅ Service worker unit tests pass with >90% coverage
- ✅ React hook tests pass with >85% coverage
- ✅ Manual testing checklist completed
- ✅ Integration test with deployed backend successful
- ✅ No console errors during API operations

---

## 7. Out of Scope (Deferred)

The following are explicitly **NOT** part of Spec-106b:

- ❌ UI Components - PersonCard, CreatePersonModal, SearchPersonList (Features 9-11)
- ❌ Auto-lookup on chat switch - Triggering lookup automatically (Feature 9)
- ❌ Form validation - Email format, name validation (Features 10-11)
- ❌ Caching strategy - In-memory or time-based caching (Post-MVP)
- ❌ Rate limit handling UI - User-facing rate limit messages (Feature 12)
- ❌ Sentry error tracking - Error reporting integration (Feature 14)

**Spec-106b Scope:** Pure API service layer only. No UI, no automatic triggers, no advanced features.

---

## 8. Implementation Notes

### 8.1 Message Passing Pattern

**Critical: Return `true` from message handlers**

```typescript
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'PIPEDRIVE_LOOKUP_BY_PHONE') {
    handlePipedriveLookup(message, sendResponse)
    return true  // CRITICAL: Keeps sendResponse alive for async operations
  }
})
```

Without `return true`, sendResponse channel closes immediately and async responses fail.

### 8.2 Error State Management

**Hook returns null/empty array on error BUT sets error state:**

```typescript
// Component can check both
const person = await lookupByPhone('+48123')  // null on error

if (person) {
  // Show person card
} else if (error) {
  // Show error message
} else {
  // Show "no match" state
}
```

### 8.3 E.164 Phone Format

**No formatting needed in Feature 6:**
- Feature 4 already extracts phone in E.164 format from WhatsApp
- Example: `"+48123456789"`
- Just pass through to backend as-is
- Backend validates format (starts with `+`)

### 8.4 Configuration

**Backend URL already configured in Spec-105b:**

```typescript
// config.ts (already exists from Spec-105b)
export const AUTH_CONFIG = {
  backendUrl: import.meta.env.VITE_BACKEND_URL || 'https://your-backend.azurewebsites.net',
  endpoints: {
    authStart: '/api/auth/start',
    authCallback: '/api/auth/callback',
  }
}

// Pipedrive endpoints use same backendUrl
// No new configuration needed
```

---

## 9. Next Steps

**After Spec-106b Completion:**

1. **Feature 9: Person Auto-Lookup Flow** – ✅ Delivered in [Spec-109](Spec-109-Person-Auto-Lookup-Flow.md).
2. **Feature 10: Create Person Flow** – ✅ Delivered in [Spec-110](Spec-110-Create-Person-Flow.md).
3. **Feature 11: Attach Number Flow** – ✅ Delivered in [Spec-111](Spec-111-Attach-Number-To-Existing-Person-Flow.md).

---

## 10. References

- [Chrome Extension Message Passing](https://developer.chrome.com/docs/extensions/mv3/messaging/)
- [React Hooks Best Practices](https://react.dev/reference/react)
- [TypeScript Discriminated Unions](https://www.typescriptlang.org/docs/handbook/unions-and-intersections.html)
- [Spec-105b-Extension-OAuth-Integration.md](Spec-105b-Extension-OAuth-Integration.md) - Similar architecture pattern

---

**Status:** ✅ Complete - Implementation finished and tested
**Owner:** Extension team
**Actual Effort:** 2 days (development + testing + CORS fixes)
**Test Results:** All 51 unit tests passing, manual testing verified
