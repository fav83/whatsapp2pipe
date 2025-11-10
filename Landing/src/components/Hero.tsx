import { SignInButton } from './SignInButton';
import { Header } from './Header';

export function Hero() {
  return (
    <header className="bg-white min-h-screen">
      {/* Header inside hero to share background */}
      <div className="relative">
        <Header />
      </div>

      <div className="relative max-w-7xl mx-auto px-5 md:px-10 py-20 md:py-32">
        <div className="grid md:grid-cols-[60%_40%] gap-12 items-center w-full">
          {/* Left column - Content */}
          <div className="flex flex-col">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-700 leading-tight max-w-[600px]">
              Stop losing WhatsApp leads in the chaos
            </h1>

            <p className="mt-6 text-lg text-slate-600 leading-relaxed max-w-[540px]">
              Sales teams waste hours copying contacts between WhatsApp and Pipedrive. Chat2Deal captures every lead instantly—right inside WhatsApp Web.
            </p>

            <div className="mt-10">
              <SignInButton variant="hero" />
            </div>
          </div>

          {/* Right column - Visual */}
          <div className="hidden md:flex items-center justify-center">
            <div className="relative w-full max-w-sm">
              <img
                src="/hero-image.png"
                alt="Chat2Deal - Connect WhatsApp to Pipedrive"
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
