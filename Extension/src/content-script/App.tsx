/**
 * Sidebar App Component
 *
 * Main application component for the Pipedrive sidebar.
 * Manages authentication state and UI state.
 * Renders appropriate components based on current state.
 *
 * Integrates with:
 * - OAuth authentication via useAuth hook
 * - WhatsApp chat detection via 200ms polling
 */

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './hooks/useAuth'
import { usePipedrive } from './hooks/usePipedrive'
import { WelcomeState } from './components/WelcomeState'
import { AuthenticatingState } from './components/AuthenticatingState'
import { ContactWarningCard } from './components/ContactWarningCard'
import { GroupChatState } from './components/GroupChatState'
import { DevModeIndicator } from './components/DevModeIndicator'
import { PersonLookupLoading } from './components/PersonLookupLoading'
import { PersonMatchedCard } from './components/PersonMatchedCard'
import { PersonNoMatchState } from './components/PersonNoMatchState'
import { PersonLookupError } from './components/PersonLookupError'
import { exposePipedriveTestHelpers } from './testPipedriveApi'
import type { Person } from '../types/person'

interface ChatStatus {
  phone: string | null
  name: string | null
  is_group: boolean
  group_name?: string | null
  participants?: Array<{ phone: string; name: string }>
}

/**
 * Discriminated union type for sidebar UI states
 *
 * Includes person lookup states for Feature 9:
 * - person-loading: Lookup in progress
 * - person-matched: Person found in Pipedrive
 * - person-no-match: No person found
 * - person-error: Lookup failed
 */
type SidebarState =
  | { type: 'welcome' }
  | { type: 'contact'; name: string; phone: string }
  | { type: 'contact-warning'; name: string; warning: string }
  | { type: 'group-chat' }
  | { type: 'person-loading'; name: string; phone: string }
  | { type: 'person-matched'; person: Person; phone: string }
  | { type: 'person-no-match'; name: string; phone: string }
  | { type: 'person-error'; name: string; phone: string; error: string }

/**
 * Main App Component
 *
 * Manages authentication and sidebar UI state.
 * Shows sign-in UI when unauthenticated, otherwise shows chat-based content.
 */
export default function App() {
  const { authState, signIn, signOut, error } = useAuth()
  const [state, setState] = useState<SidebarState>({ type: 'welcome' })

  // Listen for chat status events from MAIN world
  useEffect(() => {
    console.log('[App] Setting up chat status event listener')

    const handleChatStatus = (event: Event) => {
      const customEvent = event as CustomEvent<ChatStatus>
      const status = customEvent.detail
      handleChatStatusChange(status, setState)
    }

    // Listen for custom events dispatched from MAIN world
    window.addEventListener('whatsapp-chat-status', handleChatStatus)

    // Cleanup on unmount
    return () => {
      window.removeEventListener('whatsapp-chat-status', handleChatStatus)
    }
  }, [])

  // Development mode: expose setState globally for testing different states
  useEffect(() => {
    if (import.meta.env.MODE === 'development') {
      // @ts-expect-error - Development only, adding to window for testing
      window.__setSidebarState = setState
      console.log('[Sidebar] Development mode: Use window.__setSidebarState() to test states')
      console.log('[Sidebar] Examples:')
      console.log(
        '  __setSidebarState({ type: "contact", name: "John Doe", phone: "+1234567890" })'
      )
      console.log(
        '  __setSidebarState({ type: "contact-warning", name: "Jane Doe", warning: "Test warning" })'
      )
      console.log('  __setSidebarState({ type: "group-chat" })')
      console.log('  __setSidebarState({ type: "welcome" })')

      // Expose Pipedrive API test helpers
      exposePipedriveTestHelpers()
    }
  }, [])

  return (
    <div className="h-full flex flex-col bg-white border-l border-[#d1d7db]">
      {/* Dev Mode Indicator - Top Banner */}
      <DevModeIndicator />

      {/* Fixed Header */}
      <header className="flex-shrink-0 px-5 py-4 border-b border-[#d1d7db] flex items-center justify-between">
        <h1 className="text-[17px] font-semibold text-[#111b21]">Pipedrive</h1>
        {authState === 'authenticated' && (
          <button
            onClick={signOut}
            className="text-sm text-[#667781] hover:text-[#111b21] transition-colors px-3 py-1 rounded hover:bg-[#f0f2f5]"
            aria-label="Sign out"
          >
            Sign out
          </button>
        )}
      </header>

      {/* Scrollable Body */}
      <main className="flex-1 overflow-y-auto">
        {/* Unauthenticated: Show sign-in UI */}
        {authState === 'unauthenticated' && <WelcomeState onSignIn={signIn} />}

        {/* Authenticating: Show loading state */}
        {authState === 'authenticating' && <AuthenticatingState />}

        {/* Error: Show sign-in UI with error message */}
        {authState === 'error' && <WelcomeState onSignIn={signIn} error={error} />}

        {/* Authenticated: Show chat-based content */}
        {authState === 'authenticated' && <SidebarContent state={state} setState={setState} />}
      </main>
    </div>
  )
}

/**
 * Handle chat status change from WhatsAppChatStatus callback
 *
 * Maps detection status to appropriate sidebar UI state.
 * This function determines which component to show based on the chat data.
 */
function handleChatStatusChange(
  status: ChatStatus,
  setState: React.Dispatch<React.SetStateAction<SidebarState>>
) {
  console.log('[App] Chat status changed:', status)

  // No chat selected
  if (!status.name) {
    setState({ type: 'welcome' })
    return
  }

  // Group chat detected
  if (status.is_group) {
    setState({ type: 'group-chat' })
    return
  }

  // Individual chat with phone
  if (status.phone) {
    setState({
      type: 'contact',
      name: status.name,
      phone: status.phone,
    })
    return
  }

  // Individual chat but phone unavailable
  setState({
    type: 'contact-warning',
    name: status.name,
    warning: 'Phone number unavailable - matching by name only',
  })
}

/**
 * SidebarContent Component
 *
 * Renders appropriate content based on current state.
 * Triggers person lookup when contact state is entered.
 */
interface SidebarContentProps {
  state: SidebarState
  setState: React.Dispatch<React.SetStateAction<SidebarState>>
}

function SidebarContent({ state, setState }: SidebarContentProps) {
  const { lookupByPhone, error } = usePipedrive()

  /**
   * Handle person lookup by phone
   */
  const handlePersonLookup = useCallback(
    async (phone: string, name: string) => {
      try {
        const person = await lookupByPhone(phone)

        if (error) {
          setState({
            type: 'person-error',
            name,
            phone,
            error: error.message,
          })
        } else if (person) {
          setState({
            type: 'person-matched',
            person,
            phone,
          })
        } else {
          setState({
            type: 'person-no-match',
            name,
            phone,
          })
        }
      } catch (err) {
        setState({
          type: 'person-error',
          name,
          phone,
          error: err instanceof Error ? err.message : 'Lookup failed',
        })
      }
    },
    [lookupByPhone, error, setState]
  )

  // Trigger person lookup when contact state is entered
  useEffect(() => {
    if (state.type === 'contact') {
      const contactPhone = state.phone
      const contactName = state.name

      // Immediately show loading state
      setState({
        type: 'person-loading',
        name: contactName,
        phone: contactPhone,
      })

      // Trigger lookup
      handlePersonLookup(contactPhone, contactName)
    }
  }, [state.type, state.type === 'contact' ? state.phone : null, handlePersonLookup, setState])

  /**
   * Handle retry button click
   */
  function handleRetry(phone: string, name: string) {
    setState({
      type: 'person-loading',
      name,
      phone,
    })
    handlePersonLookup(phone, name)
  }

  /**
   * Handle person created callback
   * Transitions to person-matched state
   */
  function handlePersonCreated(person: Person, phone: string) {
    setState({
      type: 'person-matched',
      person,
      phone,
    })
  }

  /**
   * Construct Pipedrive URL
   * TODO: Get company domain from backend/auth session
   */
  function getPipedriveUrl(personId: number): string {
    // For now, use a placeholder domain
    // This should be replaced with actual domain from auth session
    return `https://app.pipedrive.com/person/${personId}`
  }

  switch (state.type) {
    case 'welcome':
      return <WelcomeState />
    case 'contact':
      // This state should immediately transition to person-loading via useEffect
      return null
    case 'contact-warning':
      return <ContactWarningCard name={state.name} warning={state.warning} />
    case 'group-chat':
      return <GroupChatState />
    case 'person-loading':
      return <PersonLookupLoading contactName={state.name} phone={state.phone} />
    case 'person-matched':
      return (
        <PersonMatchedCard
          name={state.person.name}
          phone={state.phone}
          pipedriveUrl={getPipedriveUrl(state.person.id)}
        />
      )
    case 'person-no-match':
      return (
        <PersonNoMatchState
          contactName={state.name}
          phone={state.phone}
          onPersonCreated={(person) => handlePersonCreated(person, state.phone)}
        />
      )
    case 'person-error':
      return (
        <PersonLookupError
          errorMessage={state.error}
          onRetry={() => handleRetry(state.phone, state.name)}
        />
      )
  }
}
