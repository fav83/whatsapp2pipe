interface SignInButtonProps {
  variant?: 'hero' | 'cta';
  label?: string;
}

export function SignInButton({ variant = 'hero', label = 'Sign in with Pipedrive' }: SignInButtonProps) {
  const handleSignIn = () => {
    // Generate OAuth state for website
    const state = {
      type: 'web',
      nonce: generateNonce(),
      timestamp: Date.now(),
    };

    // Encode state as base64 (backend expects base64-encoded JSON)
    const stateJson = JSON.stringify(state);
    const stateBase64 = btoa(stateJson);
    const stateParam = encodeURIComponent(stateBase64);

    // Get backend URL from environment
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:7071';

    // Redirect to backend auth start
    window.location.href = `${backendUrl}/api/auth/start?state=${stateParam}`;
  };

  const generateNonce = (): string => {
    return Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);
  };

  const baseClasses = 'font-medium rounded-lg transition-colors inline-flex items-center justify-center';
  const sizeClasses = variant === 'hero' ? 'px-8 py-4 text-lg' : 'w-full px-6 py-3 text-base';
  const colorClasses = 'bg-button-primary text-white hover:bg-button-primary-hover active:bg-button-primary-active';

  return (
    <button
      onClick={handleSignIn}
      className={`${baseClasses} ${sizeClasses} ${colorClasses}`}
    >
      {label}
    </button>
  );
}
