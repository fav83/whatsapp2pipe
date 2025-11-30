import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 py-6">
      <div className="max-w-7xl mx-auto px-5 md:px-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left - Branding */}
          <div className="text-center md:text-left">
            <div className="text-base font-normal text-slate-700" style={{ fontFamily: "'Momo Trust Display', sans-serif" }}>chat2deal</div>
          </div>

          {/* Center - Links */}
          <div className="flex items-center gap-6">
            <Link
              to="/privacy-policy"
              className="text-sm text-slate-600 hover:text-slate-700 hover:underline transition-colors duration-200"
            >
              Privacy Policy
            </Link>
            <span className="text-slate-400">•</span>
            <Link
              to="/terms-of-service"
              className="text-sm text-slate-600 hover:text-slate-700 hover:underline transition-colors duration-200"
            >
              Terms of Service
            </Link>
            <span className="text-slate-400">•</span>
            <Link
              to="/guides"
              className="text-sm text-slate-600 hover:text-slate-700 hover:underline transition-colors duration-200"
            >
              Guides
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
