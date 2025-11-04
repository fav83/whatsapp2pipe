import { WaitlistForm } from './WaitlistForm';

export function Hero() {
  return (
    <header className="min-h-screen bg-white relative overflow-hidden pt-16">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo/5 via-transparent to-transparent pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-5 md:px-10 py-20 md:py-20 min-h-screen flex items-center">
        <div className="grid md:grid-cols-[60%_40%] gap-12 items-center w-full">
          {/* Left column - Content */}
          <div className="flex flex-col">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-black leading-tight max-w-[600px]">
              Stop losing WhatsApp leads in the chaos
            </h1>

            <p className="mt-6 text-lg text-gray-secondary leading-relaxed max-w-[540px]">
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
                <div className="absolute w-48 h-48 rounded-full bg-gradient-to-br from-indigo/20 to-indigo/5 shadow-lg animate-float" />

                {/* Medium rounded rectangle */}
                <div className="absolute top-12 right-8 w-32 h-24 rounded-2xl bg-gradient-to-br from-indigo to-indigo-hover shadow-md transform rotate-12 animate-float-delayed" />

                {/* Small circle */}
                <div className="absolute bottom-20 left-12 w-20 h-20 rounded-full bg-gray-light shadow-md animate-float" />

                {/* Tiny circle accent */}
                <div className="absolute top-24 left-16 w-12 h-12 rounded-full bg-indigo/30 shadow-sm animate-float-delayed" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
