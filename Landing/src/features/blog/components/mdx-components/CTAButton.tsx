import type { ReactNode } from 'react';

interface CTAButtonProps {
  href?: string;
  children: ReactNode;
  variant?: 'primary' | 'secondary';
}

/**
 * Call-to-action button for use within blog content.
 * Defaults to the OAuth sign-in flow if no href is provided.
 */
export function CTAButton({ href, children, variant = 'primary' }: CTAButtonProps) {
  const handleClick = () => {
    if (href) {
      // External or internal link
      if (href.startsWith('http')) {
        window.open(href, '_blank', 'noopener,noreferrer');
      } else {
        window.location.href = href;
      }
    } else {
      // Default: trigger OAuth flow
      const state = {
        type: 'web',
        nonce: generateNonce(),
        timestamp: Date.now(),
      };

      const stateJson = JSON.stringify(state);
      const stateBase64 = btoa(stateJson);
      const stateParam = encodeURIComponent(stateBase64);

      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:7071';
      window.location.href = `${backendUrl}/api/auth/start?state=${stateParam}`;
    }
  };

  const generateNonce = (): string => {
    return Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);
  };

  const baseClasses = 'font-medium rounded-lg transition-all duration-200 inline-flex items-center justify-center cursor-pointer';
  const sizeClasses = 'px-6 py-3 text-base w-full sm:w-auto';

  const colorClasses = variant === 'primary'
    ? 'bg-button-primary text-white hover:bg-button-primary-hover hover:scale-[1.02] hover:shadow-lg active:bg-button-primary-active'
    : 'bg-white text-button-primary border-2 border-button-primary hover:bg-gray-50 hover:scale-[1.02] active:bg-gray-100';

  return (
    <button
      onClick={handleClick}
      className={`${baseClasses} ${sizeClasses} ${colorClasses} my-4`}
    >
      {children}
    </button>
  );
}
