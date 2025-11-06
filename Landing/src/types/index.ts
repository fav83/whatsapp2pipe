export interface WaitlistFormData {
  email: string;
  name?: string;
}

export interface WaitlistResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface FormState {
  isSubmitting: boolean;
  isSuccess: boolean;
  error: string | null;
}
