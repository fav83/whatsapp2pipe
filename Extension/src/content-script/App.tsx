/**
 * Sidebar App Component
 *
 * Main application component for the Pipedrive sidebar.
 * Manages UI state and renders appropriate components based on current state.
 *
 * Integrates with WhatsApp chat detection via 200ms polling.
 * When user switches chats, the sidebar automatically updates to show contact info.
 */

import { useState, useEffect } from 'react'
import { WelcomeState } from './components/WelcomeState'
import { ContactInfoCard } from './components/ContactInfoCard'
import { ContactWarningCard } from './components/ContactWarningCard'
import { GroupChatState } from './components/GroupChatState'

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
 * Note: No loading or error states needed. The 200ms polling provides
 * near-instant updates (0-200ms latency), and errors are handled gracefully
 * by the next poll iteration.
 */
type SidebarState =
  | { type: 'welcome' }
  | { type: 'contact'; name: string; phone: string }
  | { type: 'contact-warning'; name: string; warning: string }
  | { type: 'group-chat' }

/**
 * Main App Component
 *
 * Initializes WhatsApp chat monitoring on mount and updates sidebar state
 * when user switches chats.
 */
export default function App() {
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
  if (import.meta.env.DEV) {
    // @ts-expect-error - Development only, adding to window for testing
    window.__setSidebarState = setState
    console.log('[Sidebar] Development mode: Use window.__setSidebarState() to test states')
    console.log('[Sidebar] Examples:')
    console.log('  __setSidebarState({ type: "contact", name: "John Doe", phone: "+1234567890" })')
    console.log(
      '  __setSidebarState({ type: "contact-warning", name: "Jane Doe", warning: "Test warning" })'
    )
    console.log('  __setSidebarState({ type: "group-chat" })')
    console.log('  __setSidebarState({ type: "welcome" })')
  }

  return (
    <div className="h-full flex flex-col bg-white border-l border-[#d1d7db]">
      {/* Fixed Header */}
      <header className="flex-shrink-0 px-5 py-4 border-b border-[#d1d7db]">
        <h1 className="text-[17px] font-semibold text-[#111b21]">Pipedrive</h1>
      </header>

      {/* Scrollable Body */}
      <main className="flex-1 overflow-y-auto">
        <SidebarContent state={state} />
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
 */
interface SidebarContentProps {
  state: SidebarState
}

function SidebarContent({ state }: SidebarContentProps) {
  switch (state.type) {
    case 'welcome':
      return <WelcomeState />
    case 'contact':
      return <ContactInfoCard name={state.name} phone={state.phone} />
    case 'contact-warning':
      return <ContactWarningCard name={state.name} warning={state.warning} />
    case 'group-chat':
      return <GroupChatState />
  }
}
