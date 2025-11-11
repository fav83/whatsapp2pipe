# Spec-130b: Extension - Create Note from Chat

**Status:** Draft
**Created:** 2025-01-11
**Updated:** 2025-01-11

---

## Overview

This specification defines the Chrome extension UI and functionality for extracting WhatsApp messages and creating notes in Pipedrive. Users can select messages from the current conversation and save them as a formatted note linked to the matched Pipedrive contact.

---

## Business Requirements

### User Story

**As a** sales representative chatting on WhatsApp Web
**I want to** select important messages from our conversation and save them to Pipedrive
**So that** I can capture key discussion points (product inquiries, pricing, commitments) in my CRM without manual copy-paste

### Key Requirements

1. **Message Extraction:** Extract text messages from current WhatsApp chat using WhatsApp's internal Store API
2. **Message Selection:** Allow users to select/deselect individual messages or use bulk selection controls
3. **Note Creation:** Create formatted note in Pipedrive with selected messages, including timestamps and sender names
4. **UI Integration:** Seamlessly integrate into existing sidebar below matched person card
5. **Loading States:** Show clear loading, success, and error states
6. **Error Handling:** Handle all failure scenarios with user-friendly error messages

---

## User Flow

### Prerequisites

- User is authenticated (signed in with Pipedrive)
- User has WhatsApp Web open with an active chat
- Contact is matched in Pipedrive (person found via phone lookup)

### Step-by-Step Flow

```
1. User opens WhatsApp chat
   └─ Extension shows "Person Matched" state with contact card

2. User sees "Create Note from Chat" section (collapsed)
   └─ Below contact card and "Open in Pipedrive" button

3. User clicks "Select messages" button
   ├─ Section expands
   ├─ Messages extracted from WhatsApp
   ├─ Message list displayed with checkboxes
   └─ All messages pre-selected (checkboxes checked)

4. User reviews messages
   ├─ Can manually check/uncheck individual messages
   ├─ Can click "Select All" to re-check all
   └─ Can click "Deselect All" to uncheck all

5. User clicks "Create Note" button
   ├─ Button shows loading spinner, becomes disabled
   ├─ Selected messages formatted with timestamps
   └─ API call to backend to create note

6a. Success Path
    ├─ Success message displayed: "Note created successfully ✓"
    ├─ Section auto-collapses after 2 seconds
    └─ User can open Pipedrive to view note

6b. Error Path
    ├─ Error message displayed inline (below button)
    ├─ Section remains expanded
    └─ User can retry or collapse section
```

---

## UI Specification

### Component Hierarchy

```
PersonMatchedCard (existing)
  ├─ ContactInfoCard (existing)
  ├─ OpenInPipedriveButton (existing)
  └─ CreateNoteFromChat (NEW)
      ├─ CollapsedState (default)
      │   ├─ Header: "Create Note from Chat" + icon
      │   └─ Button: "Select messages"
      └─ ExpandedState (after click)
          ├─ MessageList (scrollable)
          │   └─ MessageItem[] (checkbox + message preview)
          ├─ SelectionControls
          │   ├─ "Select All" button
          │   └─ "Deselect All" button
          ├─ CreateNoteButton (with loading state)
          └─ StatusMessage (success/error, inline)
```

### Visual Design

#### Collapsed State

```
┌─────────────────────────────────────────────┐
│  📝 Create Note from Chat                   │
│                                             │
│  ┌───────────────────────────────────────┐ │
│  │       Select messages                 │ │
│  └───────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

**Styling:**
- Card container with rounded borders (`rounded-lg`)
- Subtle shadow (`shadow-sm`)
- Padding: `p-4`
- Border: `border border-border-secondary`
- Background: `bg-white`

#### Expanded State

```
┌─────────────────────────────────────────────┐
│  📝 Create Note from Chat                   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ ☑ [14:30 11/01/2025] John Doe:      │   │
│  │   Hello, I'm interested in the...   │   │
│  │                                      │   │
│  │ ☑ [14:32 11/01/2025] You:           │   │
│  │   Hello! I'd be happy to help.      │   │
│  │                                      │   │
│  │ ☑ [14:35 11/01/2025] John Doe:      │   │
│  │   What's the price?                 │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  Select All  |  Deselect All               │
│                                             │
│  ┌───────────────────────────────────────┐ │
│  │       Create Note                     │ │
│  └───────────────────────────────────────┘ │
│                                             │
│  ✓ Note created successfully                │
└─────────────────────────────────────────────┘
```

**Message List Styling:**
- Max height: `max-h-64` (256px, scrollable if more)
- Each message: `p-2`, hover effect `hover:bg-gray-50`
- Checkbox: left-aligned, standard size
- Timestamp: `text-xs text-gray-500`
- Sender: `font-semibold text-gray-700`
- Message text: `text-sm text-gray-900`, truncated at 100 chars with `...`

**Selection Controls:**
- Horizontal layout with divider: `Select All  |  Deselect All`
- Text buttons, small size, secondary color
- Spacing: `space-x-2`

**Create Note Button:**
- Full width
- Primary color (green): `bg-brand-primary hover:bg-brand-hover`
- Disabled state: `opacity-50 cursor-not-allowed`
- Loading state: Spinner icon + "Creating..."

**Status Messages:**
- Success: Green text with checkmark icon `text-green-600`
- Error: Red text `text-red-600`

### Interaction States

**State 1: Initial (Collapsed)**
- "Select messages" button enabled
- No message list visible

**State 2: Extracting Messages**
- "Select messages" button shows spinner
- Brief loading state (usually < 500ms)

**State 3: Messages Loaded (Expanded)**
- Message list visible with all items checked
- "Select All" / "Deselect All" buttons enabled
- "Create Note" button enabled (since all are selected)

**State 4: No Selection**
- At least one message available but none selected
- "Create Note" button disabled (gray)

**State 5: Creating Note**
- "Create Note" button shows spinner, disabled
- Selection controls disabled
- Message checkboxes disabled
- User cannot interact while creating

**State 6: Success**
- Green success message visible
- Button returns to normal state briefly
- Section auto-collapses after 2 seconds

**State 7: Error**
- Red error message visible below button
- Button enabled (user can retry)
- Selection controls enabled
- Message list remains visible

---

## Technical Specification

### WhatsApp Message Extraction

#### Method: Module Raid (Store.Msg API)

**Primary Approach:** Access WhatsApp's internal Store to extract messages reliably.

**Implementation File:** `Extension/src/content-script/services/message-extractor.ts`

```typescript
import { getStore } from '../whatsapp-integration/store-accessor'

export interface ExtractedMessage {
  id: string              // msg.id._serialized
  text: string            // msg.body
  timestamp: number       // msg.timestamp (Unix timestamp in seconds)
  fromMe: boolean         // msg.fromMe
  senderName: string      // Contact name or user name
}

/**
 * Extract messages from current WhatsApp chat
 * @param contactName - Name of the contact (for incoming messages)
 * @param userName - Name of the authenticated user (for outgoing messages)
 * @returns Array of extracted messages, sorted chronologically
 * @throws Error if Store API unavailable or extraction fails
 */
export async function extractMessagesFromWhatsApp(
  contactName: string,
  userName: string
): Promise<ExtractedMessage[]> {
  try {
    // Get WhatsApp Store
    const store = getStore()
    if (!store) {
      throw new Error('WhatsApp Store not available')
    }

    // Find active chat
    const chats = store.Chat.getModelsArray()
    const activeChat = chats.find((chat: any) => chat.active === true)

    if (!activeChat) {
      throw new Error('No active chat found')
    }

    // Get messages from chat
    const messages = activeChat.msgs.getModelsArray()

    // Filter and transform messages
    const extracted: ExtractedMessage[] = messages
      .filter((msg: any) => {
        // Include only text messages (type 'chat')
        if (msg.type !== 'chat') return false

        // Exclude system notifications
        if (msg.isNotification) return false

        // Exclude messages without text
        if (!msg.body || msg.body.trim().length === 0) return false

        return true
      })
      .map((msg: any) => ({
        id: msg.id._serialized,
        text: msg.body,
        timestamp: msg.timestamp,
        fromMe: msg.fromMe,
        senderName: msg.fromMe ? userName : contactName
      }))
      .sort((a, b) => a.timestamp - b.timestamp) // Oldest first

    return extracted
  } catch (error) {
    console.error('[message-extractor] Failed to extract messages:', error)
    throw new Error('Unable to extract messages from WhatsApp')
  }
}
```

#### Store Interface Extensions

**File:** `Extension/src/content-script/whatsapp-integration/store-accessor.ts`

Add to existing interfaces:

```typescript
export interface WhatsAppStore {
  Chat: {
    getModelsArray(): WhatsAppChat[]
    get(chatId: string): WhatsAppChat
  }
  // NEW: Message store access
  Msg: {
    get(messageId: string): WhatsAppMessage
    getMessagesById(ids: string[]): WhatsAppMessage[]
  }
}

export interface WhatsAppChat {
  active: boolean
  __x_contact: WhatsAppContact
  __x_groupMetadata?: WhatsAppGroupMetadata
  // NEW: Message collection
  msgs: {
    getModelsArray(): WhatsAppMessage[]
  }
}

// NEW: Message interface
export interface WhatsAppMessage {
  id: {
    _serialized: string
  }
  body: string
  type: string          // 'chat', 'image', 'video', etc.
  timestamp: number     // Unix timestamp
  fromMe: boolean
  isNotification: boolean
  isGroupMsg: boolean
  quotedMsg?: WhatsAppMessage
  isForwarded: boolean
}
```

### Note Formatting

**Implementation File:** `Extension/src/content-script/utils/note-formatter.ts`

```typescript
import { ExtractedMessage } from '../services/message-extractor'

/**
 * Format extracted messages as a note with WhatsApp Conversation header
 * and timestamps in [hh:mm dd/MM/yyyy] format
 *
 * @param messages - Array of extracted messages
 * @returns Formatted note content
 */
export function formatMessagesAsNote(messages: ExtractedMessage[]): string {
  if (messages.length === 0) {
    return '=== WhatsApp Conversation ==='
  }

  const lines = ['=== WhatsApp Conversation ===']

  for (const message of messages) {
    const date = new Date(message.timestamp * 1000) // Convert to milliseconds
    const formattedTimestamp = formatTimestamp(date)
    const line = `[${formattedTimestamp}] ${message.senderName}: ${message.text}`
    lines.push(line)
  }

  return lines.join('\n')
}

/**
 * Format timestamp as [hh:mm dd/MM/yyyy]
 * @param date - Date object
 * @returns Formatted string
 */
function formatTimestamp(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0') // 0-indexed
  const year = date.getFullYear()

  return `${hours}:${minutes} ${day}/${month}/${year}`
}
```

**Example Output:**

```
=== WhatsApp Conversation ===
[14:30 11/01/2025] John Doe: Hi, I'm interested in the Aurelia Duo 2G
[14:32 11/01/2025] Sarah Smith: Hello John! Yes, we have it in stock. Daily output is 250-300 drinks with 2 steam wands and PID temperature control.
[14:35 11/01/2025] John Doe: Perfect! What's the price?
[14:36 11/01/2025] Sarah Smith: Machine is $5,900. I also recommend the Fiorenzato F64 grinder at $1,150.
[14:40 11/01/2025] John Doe: Great, I'll take both!
```

### Message Passing Architecture

**File:** `Extension/src/types/messages.ts`

Add new message types:

```typescript
// Request from content script to service worker
export interface PipedriveCreateNoteRequest {
  type: 'PIPEDRIVE_CREATE_NOTE'
  personId: number
  content: string
}

// Success response
export interface PipedriveCreateNoteSuccess {
  type: 'PIPEDRIVE_CREATE_NOTE_SUCCESS'
}

// Error response
export interface PipedriveCreateNoteError {
  type: 'PIPEDRIVE_CREATE_NOTE_ERROR'
  error: string
}

// Add to message union type
export type Message =
  | /* existing message types */
  | PipedriveCreateNoteRequest
  | PipedriveCreateNoteSuccess
  | PipedriveCreateNoteError
```

### Service Worker API Client

**File:** `Extension/src/service-worker/pipedriveApiService.ts`

Add method to existing service:

```typescript
/**
 * Create a note in Pipedrive attached to a person
 * @param personId - Pipedrive person ID
 * @param content - Formatted note content
 * @throws Error with user-friendly message on failure
 */
async createNote(personId: number, content: string): Promise<void> {
  const verificationCode = await chrome.storage.local.get('verification_code')
    .then(result => result.verification_code)

  if (!verificationCode) {
    throw new Error('Not authenticated')
  }

  const response = await fetch(`${AUTH_CONFIG.backendUrl}/api/pipedrive/notes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${verificationCode}`
    },
    body: JSON.stringify({
      personId,
      content
    })
  })

  // Handle status codes
  if (response.status === 201) {
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
```

**File:** `Extension/src/service-worker/index.ts`

Add message handler:

```typescript
// In message handler switch statement
case 'PIPEDRIVE_CREATE_NOTE':
  try {
    await pipedriveApiService.createNote(
      message.personId,
      message.content
    )
    sendResponse({
      type: 'PIPEDRIVE_CREATE_NOTE_SUCCESS'
    })
  } catch (error) {
    sendResponse({
      type: 'PIPEDRIVE_CREATE_NOTE_ERROR',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
  return true // Keep channel open for async response
```

### Custom Hook: usePipedrive Extension

**File:** `Extension/src/content-script/hooks/usePipedrive.ts`

Add to existing hook:

```typescript
// Add state
const [isCreatingNote, setIsCreatingNote] = useState(false)
const [createNoteError, setCreateNoteError] = useState<string | null>(null)

// Add method
const createNote = async (personId: number, content: string): Promise<boolean> => {
  setIsCreatingNote(true)
  setCreateNoteError(null)

  try {
    const response = await chrome.runtime.sendMessage({
      type: 'PIPEDRIVE_CREATE_NOTE',
      personId,
      content
    })

    if (response.type === 'PIPEDRIVE_CREATE_NOTE_SUCCESS') {
      return true
    } else if (response.type === 'PIPEDRIVE_CREATE_NOTE_ERROR') {
      setCreateNoteError(response.error)
      return false
    }

    // Unexpected response type
    setCreateNoteError('Unexpected error occurred')
    return false
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to create note'
    setCreateNoteError(errorMessage)
    return false
  } finally {
    setIsCreatingNote(false)
  }
}

// Add to return object
return {
  // ... existing methods
  createNote,
  isCreatingNote,
  createNoteError
}
```

### Component Implementation

**File:** `Extension/src/content-script/components/CreateNoteFromChat.tsx`

```typescript
import { useState } from 'react'
import { usePipedrive } from '../hooks/usePipedrive'
import { extractMessagesFromWhatsApp, type ExtractedMessage } from '../services/message-extractor'
import { formatMessagesAsNote } from '../utils/note-formatter'

interface CreateNoteFromChatProps {
  personId: number
  contactName: string
  userName: string
}

export function CreateNoteFromChat({
  personId,
  contactName,
  userName
}: CreateNoteFromChatProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [messages, setMessages] = useState<ExtractedMessage[]>([])
  const [selectedMessageIds, setSelectedMessageIds] = useState<Set<string>>(new Set())
  const [extractionError, setExtractionError] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)

  const { createNote, isCreatingNote, createNoteError } = usePipedrive()

  // Extract messages and expand section
  const handleExpand = async () => {
    setIsExpanded(true)
    setExtractionError(null)
    setShowSuccess(false)

    try {
      const extracted = await extractMessagesFromWhatsApp(contactName, userName)

      if (extracted.length === 0) {
        setExtractionError('No messages available to select.')
        setMessages([])
        return
      }

      setMessages(extracted)

      // Pre-select all messages
      const allIds = new Set(extracted.map(m => m.id))
      setSelectedMessageIds(allIds)
    } catch (error) {
      setExtractionError(
        error instanceof Error ? error.message : 'Unable to extract messages. Please try again.'
      )
    }
  }

  // Toggle individual message selection
  const toggleMessage = (messageId: string) => {
    setSelectedMessageIds(prev => {
      const next = new Set(prev)
      if (next.has(messageId)) {
        next.delete(messageId)
      } else {
        next.add(messageId)
      }
      return next
    })
  }

  // Select all messages
  const selectAll = () => {
    const allIds = new Set(messages.map(m => m.id))
    setSelectedMessageIds(allIds)
  }

  // Deselect all messages
  const deselectAll = () => {
    setSelectedMessageIds(new Set())
  }

  // Create note with selected messages
  const handleCreateNote = async () => {
    // Get selected messages
    const selected = messages.filter(m => selectedMessageIds.has(m.id))

    if (selected.length === 0) {
      return // Should not happen (button disabled)
    }

    // Format as note content
    const content = formatMessagesAsNote(selected)

    // Call API
    const success = await createNote(personId, content)

    if (success) {
      setShowSuccess(true)
      // Auto-collapse after 2 seconds
      setTimeout(() => {
        setIsExpanded(false)
        setShowSuccess(false)
        setMessages([])
        setSelectedMessageIds(new Set())
      }, 2000)
    }
  }

  // Computed properties
  const hasSelection = selectedMessageIds.size > 0
  const isCreateButtonDisabled = !hasSelection || isCreatingNote

  // Collapsed state
  if (!isExpanded) {
    return (
      <div className="mt-4 p-4 bg-white border border-border-secondary rounded-lg shadow-sm">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          {/* Note Icon */}
          <svg className="w-5 h-5 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          <h3 className="text-sm font-semibold text-text-primary">Create Note from Chat</h3>
        </div>

        {/* Expand Button */}
        <button
          onClick={handleExpand}
          className="w-full px-4 py-2 bg-brand-primary hover:bg-brand-hover text-white text-sm font-medium rounded transition-colors"
        >
          Select messages
        </button>
      </div>
    )
  }

  // Expanded state
  return (
    <div className="mt-4 p-4 bg-white border border-border-secondary rounded-lg shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          <h3 className="text-sm font-semibold text-text-primary">Create Note from Chat</h3>
        </div>
        {/* Collapse Button */}
        <button
          onClick={() => setIsExpanded(false)}
          className="text-text-tertiary hover:text-text-primary transition-colors"
          aria-label="Collapse"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Extraction Error */}
      {extractionError && (
        <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
          {extractionError}
        </div>
      )}

      {/* Message List */}
      {messages.length > 0 && (
        <>
          <div className="mb-3 max-h-64 overflow-y-auto border border-border-secondary rounded">
            {messages.map((message) => (
              <label
                key={message.id}
                className="flex items-start gap-2 p-2 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedMessageIds.has(message.id)}
                  onChange={() => toggleMessage(message.id)}
                  disabled={isCreatingNote}
                  className="mt-1 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gray-500">
                    {new Date(message.timestamp * 1000).toLocaleString('en-GB', {
                      hour: '2-digit',
                      minute: '2-digit',
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })}
                  </div>
                  <div className="text-sm">
                    <span className="font-semibold text-gray-700">{message.senderName}:</span>
                    {' '}
                    <span className="text-gray-900">
                      {message.text.length > 100
                        ? `${message.text.substring(0, 100)}...`
                        : message.text}
                    </span>
                  </div>
                </div>
              </label>
            ))}
          </div>

          {/* Selection Controls */}
          <div className="mb-3 flex items-center justify-center gap-2 text-sm">
            <button
              onClick={selectAll}
              disabled={isCreatingNote}
              className="text-brand-primary hover:text-brand-hover disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Select All
            </button>
            <span className="text-gray-300">|</span>
            <button
              onClick={deselectAll}
              disabled={isCreatingNote}
              className="text-brand-primary hover:text-brand-hover disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Deselect All
            </button>
          </div>

          {/* Create Note Button */}
          <button
            onClick={handleCreateNote}
            disabled={isCreateButtonDisabled}
            className="w-full px-4 py-2 bg-brand-primary hover:bg-brand-hover text-white text-sm font-medium rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isCreatingNote ? (
              <>
                {/* Spinner */}
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Creating...
              </>
            ) : (
              'Create Note'
            )}
          </button>

          {/* Success Message */}
          {showSuccess && (
            <div className="mt-3 flex items-center gap-2 text-sm text-green-600">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Note created successfully
            </div>
          )}

          {/* Error Message */}
          {createNoteError && !showSuccess && (
            <div className="mt-3 text-sm text-red-600">
              {createNoteError}
            </div>
          )}
        </>
      )}
    </div>
  )
}
```

### Integration with PersonMatchedCard

**File:** `Extension/src/content-script/components/PersonMatchedCard.tsx`

Add import and render:

```typescript
import { CreateNoteFromChat } from './CreateNoteFromChat'

// Inside component, after existing content
export function PersonMatchedCard({ person, phone }: PersonMatchedCardProps) {
  const { userName } = useAuth()

  // ... existing code ...

  return (
    <div className="space-y-4">
      {/* Existing components */}
      <ContactInfoCard person={person} phone={phone} />
      <OpenInPipedriveButton personId={person.id} />

      {/* NEW: Create Note from Chat */}
      {userName && (
        <CreateNoteFromChat
          personId={person.id}
          contactName={person.name}
          userName={userName}
        />
      )}
    </div>
  )
}
```

---

## Error Handling

### Error Scenarios & User Messages

| Scenario | Cause | UI Message | User Action |
|----------|-------|------------|-------------|
| Message extraction fails | WhatsApp Store unavailable | "Unable to extract messages. Please try again." | Collapse and retry |
| No messages available | Only media/system messages | "No messages available to select." | Collapse section |
| Network error | Backend unreachable | "Failed to create note. Please check your connection." | Retry |
| Session expired | Refresh token expired (30+ days) | "Session expired. Please sign in again." | Sign out and re-authenticate |
| Rate limit | Too many API requests | "Rate limit exceeded. Please try again later." | Wait and retry |
| Validation error | Invalid request | (Specific error from backend) | Should not occur |
| Generic error | Unknown failure | "Failed to create note. Please try again." | Retry |

### Edge Cases

1. **Chat switch during creation:** Note still created for original person (correct behavior)
2. **Empty message content:** Filtered out during extraction
3. **Very long messages:** Show truncated preview (100 chars), full text in note
4. **Special characters/emojis:** Preserved as-is in note
5. **Person deleted:** Error shown, user must refresh sidebar
6. **Large message count (1000+):** All extracted, scrollable list (may be slow)

### Logging

**Development (logger.ts):**
```typescript
logger.log('[CreateNoteFromChat] Extracting messages')
logger.log('[CreateNoteFromChat] Extracted messages:', messages.length)
logger.log('[CreateNoteFromChat] Creating note:', { personId, messageCount })
```

**Production (errorLogger.ts):**
```typescript
logError(
  'Failed to create note from chat',
  error,
  {
    personId,
    messageCount: selectedMessages.length,
    errorType: 'note_creation_failed'
  },
  Sentry.getCurrentScope()
)
```

---

## Testing

### Unit Tests

**message-extractor.test.ts:**
- Extract messages successfully → Returns array
- Filter system notifications → Excluded
- Filter empty messages → Excluded
- Sort by timestamp → Chronological order
- Store unavailable → Throws error
- No active chat → Throws error

**note-formatter.test.ts:**
- Format single message → Correct format
- Format multiple messages → Multiple lines
- Timestamp format → `[hh:mm dd/MM/yyyy]`
- Special characters → Preserved
- Emojis → Preserved
- Empty array → Header only

**CreateNoteFromChat.test.tsx:**
- Initial render → Collapsed state
- Click expand → Extracts and shows messages
- All messages pre-selected → All checked
- Toggle message → Updates selection
- Select All → All checked
- Deselect All → All unchecked, button disabled
- Create note success → Shows success, auto-collapses
- Create note error → Shows error, stays expanded

### Manual Testing Checklist

**Prerequisites:**
- [ ] Extension loaded in Chrome
- [ ] WhatsApp Web open
- [ ] Authenticated with Pipedrive

**Happy Path:**
- [ ] Open chat with matched contact
- [ ] "Create Note from Chat" section visible (collapsed)
- [ ] Click "Select messages" → Section expands
- [ ] Messages shown with checkboxes (all checked)
- [ ] Click "Create Note" → Success message
- [ ] Section auto-collapses after 2 seconds
- [ ] Open Pipedrive → Note exists on person timeline
- [ ] Note format matches specification

**Selection Controls:**
- [ ] Click individual checkbox → Toggles selection
- [ ] Uncheck all → Button disabled
- [ ] "Deselect All" → All unchecked, button disabled
- [ ] "Select All" → All checked, button enabled
- [ ] Select 3 of 10 messages → Only 3 in note

**Message Types:**
- [ ] Text messages → Shown
- [ ] Media without captions → Not shown
- [ ] Media with captions → Caption shown
- [ ] System messages → Not shown
- [ ] Emojis/special chars → Preserved

**Error Scenarios:**
- [ ] No selection → Button disabled
- [ ] Network error → Error message shown
- [ ] Chat switch during creation → Note created correctly
- [ ] Session expired → Error with sign-in prompt

**UI/UX:**
- [ ] Expand/collapse smooth
- [ ] Loading spinner visible
- [ ] Success checkmark visible
- [ ] Error messages readable
- [ ] Scrollable list (many messages)
- [ ] Message preview truncated

---

## Deployment

### Build Steps

1. Run tests: `npm test`
2. Build production: `npm run build`
3. Verify `dist/` contains no source maps
4. Test locally: Load unpacked extension
5. Upload source maps: `npm run upload-sourcemaps`
6. **Reload extension in Chrome** (critical for Debug IDs)
7. Test error tracking in Sentry

### Files Modified

**New Files:**
- `Extension/src/content-script/services/message-extractor.ts`
- `Extension/src/content-script/utils/note-formatter.ts`
- `Extension/src/content-script/components/CreateNoteFromChat.tsx`
- `Extension/tests/message-extractor.test.ts`
- `Extension/tests/note-formatter.test.ts`

**Modified Files:**
- `Extension/src/types/messages.ts`
- `Extension/src/service-worker/pipedriveApiService.ts`
- `Extension/src/service-worker/index.ts`
- `Extension/src/content-script/hooks/usePipedrive.ts`
- `Extension/src/content-script/whatsapp-integration/store-accessor.ts`
- `Extension/src/content-script/components/PersonMatchedCard.tsx`

---

## Performance Considerations

| Scenario | Expected Performance |
|----------|---------------------|
| Extract 50 messages | < 500ms |
| Extract 200 messages | < 1s |
| Extract 1000+ messages | < 3s (acceptable degradation) |
| Format note content | < 50ms |
| API request | < 2s (depends on backend/Pipedrive) |

---

## Future Enhancements

1. Load earlier messages with pagination
2. Filter messages (date range, keyword search)
3. Edit note content before creation
4. Attach to deal in addition to person
5. Support media messages with thumbnails
6. Export as PDF or other formats
7. Note templates for common scenarios
8. Bulk note creation (multiple chats)

---

## References

- [Spec-130a: Backend Notes API](Spec-130a-Backend-Notes-API.md)
- [Chrome Extension Architecture](../Architecture/Chrome-Extension-Architecture.md)
- [Spec-109: Person Auto-Lookup Flow](Spec-109-Person-Auto-Lookup-Flow.md)
- [Spec-112: UI States Error Handling](Spec-112-UI-States-Error-Handling.md)

---

## Appendix: Example Note Format

### Input Messages

```typescript
[
  {
    id: "msg1",
    text: "Hi, I'm interested in the Aurelia Duo 2G",
    timestamp: 1736604600,
    fromMe: false,
    senderName: "John Doe"
  },
  {
    id: "msg2",
    text: "Hello John! Yes, we have it in stock.",
    timestamp: 1736604720,
    fromMe: true,
    senderName: "Sarah Smith"
  },
  {
    id: "msg3",
    text: "What's the price?",
    timestamp: 1736604900,
    fromMe: false,
    senderName: "John Doe"
  },
  {
    id: "msg4",
    text: "Machine is $5,900. Recommended grinder is $1,150.",
    timestamp: 1736604960,
    fromMe: true,
    senderName: "Sarah Smith"
  }
]
```

### Output Note

```
=== WhatsApp Conversation ===
[14:30 11/01/2025] John Doe: Hi, I'm interested in the Aurelia Duo 2G
[14:32 11/01/2025] Sarah Smith: Hello John! Yes, we have it in stock.
[14:35 11/01/2025] John Doe: What's the price?
[14:36 11/01/2025] Sarah Smith: Machine is $5,900. Recommended grinder is $1,150.
```
