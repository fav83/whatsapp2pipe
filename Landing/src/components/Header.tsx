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
            <span className="text-2xl font-normal text-white" style={{ fontFamily: "'Momo Trust Display', sans-serif" }}>chat2deal</span>
          </a>

          {/* Navigation Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={scrollToWaitlist}
              className="hidden sm:inline-flex px-4 py-2 text-sm font-medium text-white/90 hover:text-white transition-colors duration-200"
            >
              Join the Waitlist
            </button>
            <a
              href="/signin"
              className="px-4 py-2 text-sm font-medium text-indigo-600 bg-white hover:bg-indigo-50 rounded-lg transition-all duration-200 active:scale-95"
            >
              Sign in
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
