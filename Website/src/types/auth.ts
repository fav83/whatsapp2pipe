export interface OAuthState {
  type: 'web' | 'extension'
  nonce: string
  timestamp: number
}

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'
