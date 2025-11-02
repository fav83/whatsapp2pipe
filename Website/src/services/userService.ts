import { CONFIG } from '../config/constants'
import type { User } from '../types/user'

class UserService {
  /**
   * Fetches current user info from backend
   */
  async getCurrentUser(verificationCode: string): Promise<User> {
    const response = await fetch(
      `${CONFIG.backendUrl}${CONFIG.endpoints.userMe}`,
      {
        headers: {
          Authorization: `Bearer ${verificationCode}`,
        },
      }
    )

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Session expired')
      }
      throw new Error('Failed to fetch user info')
    }

    return response.json()
  }
}

export const userService = new UserService()
