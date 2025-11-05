export function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 py-6">
      <div className="max-w-7xl mx-auto px-5 md:px-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left - Branding */}
          <div className="text-center md:text-left">
            <div className="text-base font-semibold text-slate-700">Chat2Deal</div>
          </div>

          {/* Center - Links */}
          <div className="flex items-center gap-6">
            <a
              href="/privacy"
              className="text-sm text-slate-600 hover:text-slate-700 hover:underline transition-colors duration-200"
            >
              Privacy Policy
            </a>
            <span className="text-slate-400">•</span>
            <a
              href="/terms"
              className="text-sm text-slate-600 hover:text-slate-700 hover:underline transition-colors duration-200"
            >
              Terms of Service
            </a>
          </div>

          {/* Right - Sign in */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-600">Already have beta access?</span>
            <a
              href="/signin"
              className="font-medium text-slate-700 hover:text-slate-600 transition-colors duration-200"
            >
              Sign in
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
