import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();

  // Handle hash navigation on mount or location change
  useEffect(() => {
    if (location.hash === '#pricing') {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        const pricingSection = document.getElementById('pricing');
        if (pricingSection) {
          pricingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }, [location]);

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

  const handlePricingClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();

    const scrollToPricing = () => {
      const pricingSection = document.getElementById('pricing');
      if (pricingSection) {
        pricingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };

    // If we're on the home route, just scroll
    if (location.pathname === '/') {
      scrollToPricing();
    } else {
      // Navigate to home with hash, then scroll after navigation
      navigate('/#pricing');
      // Small delay to allow route change to complete
      setTimeout(scrollToPricing, 100);
    }
  };

  const generateNonce = (): string => {
    return Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);
  };

  return (
    <nav>
      <div className="max-w-7xl mx-auto px-5 md:px-10">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="/" className="flex items-center">
            <span className="text-2xl font-normal text-slate-700" style={{ fontFamily: "'Momo Trust Display', sans-serif" }}>chat2deal</span>
          </a>

          {/* Navigation */}
          <div className="flex items-center gap-6">
            {/* Pricing Link */}
            <a
              href="/#pricing"
              onClick={handlePricingClick}
              className="text-sm font-medium text-slate-700 hover:text-button-primary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-button-primary focus:ring-offset-2 rounded"
            >
              Pricing
            </a>

            {/* Sign in Button */}
            <button
              onClick={handleSignIn}
              className="px-4 py-2 text-sm font-medium text-white bg-button-primary hover:bg-button-primary-hover active:bg-button-primary-active rounded-lg transition-all duration-200 active:scale-95"
            >
              Sign in
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
