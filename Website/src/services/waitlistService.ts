import { CONFIG } from '../config/constants'

interface WaitlistResponse {
  success: boolean
  message?: string
  error?: string
}

class WaitlistService {
  /**
   * Join the waitlist
   */
  async joinWaitlist(email: string, name?: string): Promise<void> {
    const response = await fetch(`${CONFIG.backendUrl}/api/waitlist`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, name }),
    })

    const contentType = response.headers.get('content-type') || ''
    let data: WaitlistResponse | null = null
    if (contentType.includes('application/json')) {
      try {
        data = (await response.json()) as WaitlistResponse
      } catch {
        // Ignore JSON parse errors; rely on status
      }
    }

    if (!response.ok) {
      throw new Error(data?.error || response.statusText || 'Failed to join waitlist')
    }

    if (data && !data.success) {
      throw new Error(data.error || 'Failed to join waitlist')
    }
  }
}

export const waitlistService = new WaitlistService()
