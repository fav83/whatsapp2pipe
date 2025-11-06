import { useState } from 'react';
import type { WaitlistFormData, FormState } from '../types';
import { submitWaitlist } from '../services/api';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function useWaitlistForm() {
  const [formData, setFormData] = useState<WaitlistFormData>({
    email: '',
    name: '',
  });

  const [formState, setFormState] = useState<FormState>({
    isSubmitting: false,
    isSuccess: false,
    error: null,
  });

  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    name?: string;
  }>({});

  const validateEmail = (email: string): string | undefined => {
    if (!email.trim()) {
      return 'Please enter a valid email address';
    }
    if (!EMAIL_REGEX.test(email)) {
      return 'Please enter a valid email address';
    }
    if (email.length > 255) {
      return 'Email must be less than 255 characters';
    }
    return undefined;
  };

  const validateName = (name: string): string | undefined => {
    if (name && name.length > 100) {
      return 'Name must be less than 100 characters';
    }
    return undefined;
  };

  const handleChange = (field: keyof WaitlistFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear field error on change
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    // Clear form error
    setFormState((prev) => ({ ...prev, error: null }));
  };

  const handleBlur = (field: keyof WaitlistFormData) => {
    const value = formData[field] || '';
    let error: string | undefined;

    if (field === 'email') {
      error = validateEmail(value);
    } else if (field === 'name') {
      error = validateName(value);
    }

    if (error) {
      setFieldErrors((prev) => ({ ...prev, [field]: error }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const emailError = validateEmail(formData.email);
    const nameError = validateName(formData.name || '');

    if (emailError || nameError) {
      setFieldErrors({
        email: emailError,
        name: nameError,
      });
      // Focus first error field
      if (emailError) {
        document.getElementById('email')?.focus();
      }
      return;
    }

    // Submit form
    setFormState({
      isSubmitting: true,
      isSuccess: false,
      error: null,
    });

    try {
      const response = await submitWaitlist({
        email: formData.email.trim(),
        name: formData.name?.trim() || undefined,
      });

      if (response.success) {
        setFormState({
          isSubmitting: false,
          isSuccess: true,
          error: null,
        });
      } else {
        throw new Error(response.error || 'Something went wrong');
      }
    } catch (error) {
      setFormState({
        isSubmitting: false,
        isSuccess: false,
        error: error instanceof Error ? error.message : 'Something went wrong. Please try again.',
      });
    }
  };

  const resetForm = () => {
    setFormData({ email: '', name: '' });
    setFormState({ isSubmitting: false, isSuccess: false, error: null });
    setFieldErrors({});
  };

  return {
    formData,
    formState,
    fieldErrors,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
  };
}
