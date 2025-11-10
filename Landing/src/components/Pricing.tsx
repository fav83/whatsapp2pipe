import { SignInButton } from './SignInButton';

export function Pricing() {
  const tiers = [
    {
      name: 'Free',
      badge: 'Beta',
      badgeColor: 'bg-button-primary text-white',
      features: [
        'Everything you need to get started',
        'Capture contacts from WhatsApp chats',
        'Save directly to your Pipedrive',
        'Help us improve with your feedback',
      ],
      cta: 'active',
      highlight: true,
    },
    {
      name: 'Pro',
      badge: 'Coming Soon',
      badgeColor: 'bg-slate-300 text-slate-700',
      features: [
        'No limits on how much you use it',
        'Get help when you need it',
        'Automate your workflow',
        'Perfect for teams',
      ],
      cta: 'disabled',
      highlight: false,
    },
  ];

  return (
    <section id="pricing" className="bg-slate-700 py-20 md:py-24">
      <div className="max-w-6xl mx-auto px-5 md:px-10">
        {/* Section header */}
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-white/80 uppercase tracking-wider">
            Pricing
          </p>
          <h2 className="mt-2 text-3xl md:text-4xl font-bold text-white leading-tight">
            Free during beta. Paid plans coming soon.
          </h2>
          <p className="mt-3 text-sm text-white/70">
            We'll provide advance notice before any pricing changes.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto">
          {tiers.map((tier, index) => (
            <div
              key={index}
              className={`rounded-xl p-8 transition-all duration-300 ease-out ${
                tier.highlight
                  ? 'bg-gradient-to-br from-white to-green-50 shadow-2xl hover:shadow-[0_25px_60px_rgba(0,0,0,0.5)] transform hover:scale-[1.02]'
                  : 'bg-slate-500/60 shadow-lg'
              }`}
            >
              {/* Tier header */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className={`text-2xl font-semibold ${tier.highlight ? 'text-slate-700' : 'text-white'}`}>
                    {tier.name}
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${tier.badgeColor}`}>
                    {tier.badge}
                  </span>
                </div>
              </div>

              {/* Features list */}
              <ul className="space-y-3 mb-8">
                {tier.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start">
                    <svg
                      className={`w-5 h-5 flex-shrink-0 mr-3 mt-0.5 ${tier.highlight ? 'text-button-primary' : 'text-slate-300'}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className={`text-base leading-relaxed ${tier.highlight ? 'text-slate-600' : 'text-slate-200'}`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <div className="mt-auto">
                {tier.cta === 'active' ? (
                  <SignInButton variant="cta" label="Start free" />
                ) : (
                  <button
                    disabled
                    aria-disabled="true"
                    className="w-full px-6 py-3 text-base font-medium rounded-lg bg-slate-300 text-slate-500 cursor-not-allowed"
                    title="Available after beta"
                  >
                    Coming soon
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
