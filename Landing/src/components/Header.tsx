export function Header() {
  const scrollToWaitlist = () => {
    const heroSection = document.querySelector('header');
    if (heroSection) {
      heroSection.scrollIntoView({ behavior: 'smooth' });
      // Focus on email input after scroll
      setTimeout(() => {
        document.getElementById('email')?.focus();
      }, 500);
    }
  };

  return (
    <nav>
      <div className="max-w-7xl mx-auto px-5 md:px-10">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="/" className="flex items-center">
            <span className="text-2xl font-normal text-slate-700" style={{ fontFamily: "'Momo Trust Display', sans-serif" }}>chat2deal</span>
          </a>

          {/* Navigation Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={scrollToWaitlist}
              className="hidden sm:inline-flex px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-700 transition-colors duration-200"
            >
              Join the Waitlist
            </button>
            <a
              href={import.meta.env.VITE_APP_URL}
              className="px-4 py-2 text-sm font-medium text-white bg-button-primary hover:bg-button-primary-hover active:bg-button-primary-active rounded-lg transition-all duration-200 active:scale-95"
            >
              Sign in
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
