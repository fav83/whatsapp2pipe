export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-light py-6">
      <div className="max-w-7xl mx-auto px-5 md:px-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left - Branding */}
          <div className="text-center md:text-left">
            <div className="text-base font-semibold text-black">Chat2Deal</div>
          </div>

          {/* Center - Links */}
          <div className="flex items-center gap-6">
            <a
              href="/privacy"
              className="text-sm text-gray-secondary hover:text-indigo hover:underline transition-colors duration-200"
            >
              Privacy Policy
            </a>
            <span className="text-gray-secondary">•</span>
            <a
              href="/terms"
              className="text-sm text-gray-secondary hover:text-indigo hover:underline transition-colors duration-200"
            >
              Terms of Service
            </a>
          </div>

          {/* Right - Sign in */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-secondary">Already have beta access?</span>
            <a
              href="/signin"
              className="font-medium text-indigo hover:text-indigo-hover transition-colors duration-200"
            >
              Sign in
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
