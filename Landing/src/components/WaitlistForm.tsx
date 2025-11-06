import { useWaitlistForm } from '../hooks/useWaitlistForm';

interface WaitlistFormProps {
  variant?: 'hero' | 'cta';
}

export function WaitlistForm({ variant = 'hero' }: WaitlistFormProps) {
  const {
    formData,
    formState,
    fieldErrors,
    handleChange,
    handleBlur,
    handleSubmit,
  } = useWaitlistForm();

  const isCTA = variant === 'cta';

  // Success state
  if (formState.isSuccess) {
    return (
      <div className={isCTA ? 'text-center' : 'flex items-center gap-4'}>
        <div className={`flex items-center justify-center w-12 h-12 rounded-full bg-button-primary flex-shrink-0 ${isCTA ? 'mx-auto mb-4' : ''}`}>
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-lg text-slate-700">
          You're on the waitlist! We'll email you when access is available.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md">
      {/* Error banner */}
      {formState.error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-300 rounded-lg">
          <p className="text-sm text-red-600">{formState.error}</p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {/* Email input */}
        <div>
          <label htmlFor="email" className="sr-only">
            Email address
          </label>
          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            onBlur={() => handleBlur('email')}
            disabled={formState.isSubmitting}
            aria-label="Email address"
            aria-invalid={!!fieldErrors.email}
            aria-describedby={fieldErrors.email ? 'email-error' : undefined}
            className={`w-full px-4 py-3 text-base rounded-lg transition-all duration-200 bg-white text-slate-700 border border-slate-300 focus:border-slate-500 focus:ring-2 focus:ring-slate-200 ${
              fieldErrors.email ? 'border-red-500 ring-2 ring-red-500/20' : ''
            } disabled:opacity-60 disabled:cursor-not-allowed outline-none`}
          />
          {fieldErrors.email && (
            <p id="email-error" className="mt-1 text-sm text-red-600">
              {fieldErrors.email}
            </p>
          )}
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={formState.isSubmitting}
          aria-busy={formState.isSubmitting}
          className="w-full px-6 py-3 text-base font-medium rounded-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed bg-button-primary text-white hover:bg-button-primary-hover active:bg-button-primary-active active:scale-[0.98]"
        >
          {formState.isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Loading...
            </span>
          ) : (
            'Join the Waitlist'
          )}
        </button>
      </div>

      {/* Trust text */}
      <p className="mt-3 text-sm text-center text-slate-500">
        {isCTA
          ? 'Free during beta • No credit card'
          : 'Get early access. No credit card required.'}
      </p>
    </form>
  );
}
