import { WaitlistForm } from './WaitlistForm';
import { Header } from './Header';

export function Hero() {
  return (
    <header className="bg-indigo-600 min-h-screen">
      {/* Header inside hero to share background */}
      <div className="relative">
        <Header />
      </div>

      <div className="relative max-w-7xl mx-auto px-5 md:px-10 py-20 md:py-32">
        <div className="grid md:grid-cols-[60%_40%] gap-12 items-center w-full">
          {/* Left column - Content */}
          <div className="flex flex-col">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight max-w-[600px]">
              Stop losing WhatsApp leads in the chaos
            </h1>

            <p className="mt-6 text-lg text-indigo-100 leading-relaxed max-w-[540px]">
              Sales teams waste hours copying contacts between WhatsApp and Pipedrive. Chat2Deal captures every lead instantly—right inside WhatsApp Web.
            </p>

            <div className="mt-10">
              <WaitlistForm variant="hero" />
            </div>
          </div>

          {/* Right column - Visual */}
          <div className="hidden md:flex items-center justify-center">
            <div className="relative w-full max-w-md aspect-square">
              {/* Floating geometric shapes */}
              <div className="absolute inset-0 flex items-center justify-center">
                {/* Large circle */}
                <div className="absolute w-48 h-48 rounded-full bg-white/20 shadow-lg animate-float" />

                {/* Medium rounded rectangle */}
                <div className="absolute top-12 right-8 w-32 h-24 rounded-2xl bg-white shadow-md transform rotate-12 animate-float-delayed" />

                {/* Small circle */}
                <div className="absolute bottom-20 left-12 w-20 h-20 rounded-full bg-indigo-400 shadow-md animate-float" />

                {/* Tiny circle accent */}
                <div className="absolute top-24 left-16 w-12 h-12 rounded-full bg-white/40 shadow-sm animate-float-delayed" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
