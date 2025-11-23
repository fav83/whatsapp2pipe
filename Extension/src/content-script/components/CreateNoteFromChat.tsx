import { useState } from 'react'
import { usePipedrive } from '../hooks/usePipedrive'
import { useToast } from '../context/ToastContext'
import { extractMessagesFromWhatsApp, type ExtractedMessage } from '../services/message-extractor'
import { formatMessagesAsNote } from '../utils/note-formatter'

interface CreateNoteFromChatProps {
  personId: number
  contactName: string
  userName: string
  selectedDealId?: number | null
  selectedDealTitle?: string
}

export function CreateNoteFromChat({
  personId,
  contactName,
  userName,
  selectedDealId,
  selectedDealTitle,
}: CreateNoteFromChatProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [messages, setMessages] = useState<ExtractedMessage[]>([])
  const [selectedMessageIds, setSelectedMessageIds] = useState<Set<string>>(new Set())
  const [extractionError, setExtractionError] = useState<string | null>(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const { createPersonNote, createDealNote, isCreatingNote, createNoteError } = usePipedrive()
  const { showToast } = useToast()

  // Extract messages and expand section
  const handleExpand = async () => {
    setIsExpanded(true)
    setExtractionError(null)

    try {
      const extracted = await extractMessagesFromWhatsApp(contactName, userName)

      if (extracted.length === 0) {
        setExtractionError('No messages available to select.')
        setMessages([])
        return
      }

      setMessages(extracted)

      // Pre-select all messages
      const allIds = new Set(extracted.map((m) => m.id))
      setSelectedMessageIds(allIds)
    } catch (error) {
      setExtractionError(
        error instanceof Error ? error.message : 'Unable to extract messages. Please try again.'
      )
    }
  }

  // Toggle individual message selection
  const toggleMessage = (messageId: string) => {
    setSelectedMessageIds((prev) => {
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
    const allIds = new Set(messages.map((m) => m.id))
    setSelectedMessageIds(allIds)
  }

  // Deselect all messages
  const deselectAll = () => {
    setSelectedMessageIds(new Set())
  }

  // Handle menu item click
  const handleMenuItemClick = async (destination: 'person' | 'deal') => {
    // Close dropdown
    setIsDropdownOpen(false)

    // Create note to selected destination
    await handleCreateNote(destination)
  }

  // Create note with selected messages
  const handleCreateNote = async (destination: 'person' | 'deal' = 'person') => {
    // Get selected messages
    const selected = messages.filter((m) => selectedMessageIds.has(m.id))

    if (selected.length === 0) {
      return // Should not happen (button disabled)
    }

    // Format as note content
    const content = formatMessagesAsNote(selected)

    // Call appropriate API based on destination
    let success = false
    if (destination === 'person') {
      success = await createPersonNote(personId, content)
    } else {
      // destination === 'deal'
      if (!selectedDealId) {
        // Should not happen (button only shows when deal selected)
        return
      }
      success = await createDealNote(selectedDealId, content)
    }

    if (success) {
      // Immediately collapse and reset state
      setIsExpanded(false)
      setMessages([])
      setSelectedMessageIds(new Set())

      // Show success toast
      showToast('Note created successfully')
    }
  }

  // Computed properties
  const hasSelection = selectedMessageIds.size > 0
  const isCreateButtonDisabled = !hasSelection || isCreatingNote

  // Collapsed state
  if (!isExpanded) {
    return (
      <div className="px-3 pt-2 pb-2">
        <div className="p-3 bg-white border border-border-secondary rounded-lg shadow-sm">
          {/* Header */}
          <div className="flex items-center gap-2 mb-3">
            {/* Note Icon */}
            <svg
              className="w-5 h-5 text-brand-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
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
      </div>
    )
  }

  // Expanded state
  return (
    <div className="px-3 pt-2 pb-2">
      <div className="p-3 bg-white border border-border-secondary rounded-lg shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-brand-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            <h3 className="text-sm font-semibold text-text-primary">Create Note from Chat</h3>
          </div>
          <div className="flex items-center gap-2">
            {/* Selection Controls - In header */}
            {messages.length > 0 && (
              <div className="flex items-center gap-1.5 text-xs mr-2">
                <button
                  onClick={selectAll}
                  disabled={isCreatingNote}
                  className="text-brand-primary hover:text-brand-hover disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  All
                </button>
                <span className="text-gray-300">|</span>
                <button
                  onClick={deselectAll}
                  disabled={isCreatingNote}
                  className="text-brand-primary hover:text-brand-hover disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  None
                </button>
              </div>
            )}
            {/* Collapse Button */}
            <button
              onClick={() => setIsExpanded(false)}
              className="text-text-tertiary hover:text-text-primary transition-colors"
              aria-label="Collapse"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
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
                  className={`flex items-start gap-2 p-2 cursor-pointer transition-colors ${
                    message.fromMe ? 'bg-[#d9fdd3] hover:bg-[#cef7c5]' : 'hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedMessageIds.has(message.id)}
                    onChange={() => toggleMessage(message.id)}
                    disabled={isCreatingNote}
                    className="mt-1 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0 text-sm">
                    <span className="font-semibold text-gray-700">{message.senderName}:</span>{' '}
                    <span className="text-gray-900">
                      {message.text.length > 100
                        ? `${message.text.substring(0, 100)}...`
                        : message.text}
                    </span>
                  </div>
                </label>
              ))}
            </div>

            {/* Create Note Button */}
            {!selectedDealId ? (
              /* Regular button - no deal selected */
              <button
                onClick={() => handleCreateNote('person')}
                disabled={isCreateButtonDisabled}
                className="w-full px-4 py-2 bg-brand-primary hover:bg-brand-hover text-white text-sm font-medium rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isCreatingNote ? (
                  <>
                    {/* Spinner */}
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Creating...
                  </>
                ) : (
                  'Create Note'
                )}
              </button>
            ) : (
              /* Split button with dropdown - deal selected */
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  disabled={isCreateButtonDisabled}
                  className="w-full px-4 py-2 bg-brand-primary hover:bg-brand-hover text-white text-sm font-medium rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isCreatingNote ? (
                    <>
                      {/* Spinner */}
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Creating...
                    </>
                  ) : (
                    <>
                      Create Note
                      {/* Dropdown chevron */}
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </>
                  )}
                </button>

                {/* Dropdown menu */}
                {isDropdownOpen && !isCreatingNote && (
                  <div className="absolute z-10 mt-2 w-full bg-white border border-border-secondary rounded-lg shadow-lg">
                    <button
                      onClick={() => handleMenuItemClick('person')}
                      className="w-full px-4 py-2 text-left text-sm text-text-primary hover:bg-background-secondary transition-colors rounded-t-lg"
                    >
                      Save to Contact
                    </button>
                    <button
                      onClick={() => handleMenuItemClick('deal')}
                      className="w-full px-4 py-2 text-left text-sm text-text-primary hover:bg-background-secondary transition-colors rounded-b-lg"
                    >
                      Save to Deal
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Error Message */}
            {createNoteError && <div className="mt-3 text-sm text-red-600">{createNoteError}</div>}
          </>
        )}
      </div>
    </div>
  )
}
