export interface OAuthState {
  type: 'web' | 'extension'
  nonce: string
  timestamp: number
  // Note: inviteCode is no longer required (open to all Pipedrive users)
  // Field remains for infrastructure compatibility but is unused in standard flow
  inviteCode?: string
}

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'
