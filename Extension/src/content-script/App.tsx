/**
 * Sidebar App Component
 *
 * Main application component for the Pipedrive sidebar.
 * Manages UI state and renders appropriate components based on current state.
 */

import { useState } from 'react'
import { WelcomeState } from './components/WelcomeState'
import { ContactInfoCard } from './components/ContactInfoCard'
import { LoadingState } from './components/LoadingState'
import { ErrorState } from './components/ErrorState'

/**
 * Discriminated union type for sidebar UI states
 */
type SidebarState =
  | { type: 'welcome' }
  | { type: 'loading' }
  | { type: 'contact'; name: string; phone: string }
  | { type: 'error'; message: string; onRetry: () => void }

/**
 * Main App Component
 */
export default function App() {
  const [state, setState] = useState<SidebarState>({ type: 'welcome' })

  // Development mode: expose setState globally for testing different states
  if (import.meta.env.DEV) {
    // @ts-expect-error - Development only, adding to window for testing
    window.__setSidebarState = setState
    console.log('[Sidebar] Development mode: Use window.__setSidebarState() to test states')
    console.log('[Sidebar] Examples:')
    console.log('  __setSidebarState({ type: "loading" })')
    console.log('  __setSidebarState({ type: "contact", name: "John Doe", phone: "+1234567890" })')
    console.log('  __setSidebarState({ type: "error", message: "Test error", onRetry: () => console.log("retry") })')
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
        <SidebarContent state={state} setState={setState} />
      </main>
    </div>
  )
}

/**
 * SidebarContent Component
 * Renders appropriate content based on current state
 */
interface SidebarContentProps {
  state: SidebarState
  setState: React.Dispatch<React.SetStateAction<SidebarState>>
}

function SidebarContent({ state, setState: _setState }: SidebarContentProps) {
  switch (state.type) {
    case 'welcome':
      return <WelcomeState />
    case 'loading':
      return <LoadingState />
    case 'contact':
      return <ContactInfoCard name={state.name} phone={state.phone} />
    case 'error':
      return <ErrorState message={state.message} onRetry={state.onRetry} />
  }
}
