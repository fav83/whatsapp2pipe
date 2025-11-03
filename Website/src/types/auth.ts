export interface OAuthState {
  type: 'web' | 'extension'
  nonce: string
  timestamp: number
  inviteCode?: string
}

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'
