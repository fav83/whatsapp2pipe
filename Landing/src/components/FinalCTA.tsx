import { SignInButton } from './SignInButton';

export function FinalCTA() {
  return (
    <section id="get-started" className="relative bg-white py-24 md:py-28 overflow-hidden">
      {/* Background decorations (optional) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-10 w-64 h-64 rounded-full bg-button-primary/10 blur-3xl" />
        <div className="absolute bottom-10 left-10 w-96 h-96 rounded-full bg-button-primary/5 blur-3xl" />
      </div>

      <div className="relative max-w-2xl mx-auto px-5 md:px-10 text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-slate-700 leading-tight mb-5">
          Ready to stop losing leads?
        </h2>

        <p className="text-lg text-slate-600 leading-relaxed mb-8">
          Connect your Pipedrive account to start capturing every WhatsApp conversation in your CRM.
        </p>

        <div className="flex justify-center">
          <SignInButton variant="cta" />
        </div>
      </div>
    </section>
  );
}
