import type { WaitlistFormData, WaitlistResponse } from '../types';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:7071';

export async function submitWaitlist(data: WaitlistFormData): Promise<WaitlistResponse> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/waitlist`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Too many requests. Please try again in a few minutes.');
      }
      if (response.status === 400) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Invalid email address');
      }
      throw new Error('Unable to connect. Please check your internet connection.');
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Something went wrong. Please try again.');
  }
}
