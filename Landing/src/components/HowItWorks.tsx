export function HowItWorks() {
  const steps = [
    {
      number: '1',
      title: 'Install the Chrome extension',
      description: 'Add Chat2Deal to Chrome in seconds. Connect your Pipedrive account and you\'re ready to go.',
      icon: (
        <svg className="w-6 h-6 text-button-primary-hover" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      ),
    },
    {
      number: '2',
      title: 'Open any WhatsApp chat',
      description: 'Switch to a 1-on-1 conversation. Chat2Deal instantly reads the contact\'s phone number.',
      icon: (
        <svg className="w-6 h-6 text-button-primary-hover" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
    },
    {
      number: '3',
      title: 'See if they\'re already in Pipedrive',
      description: 'Automatic lookup finds existing contacts. Matched? Jump straight to their Pipedrive profile.',
      icon: (
        <svg className="w-6 h-6 text-button-primary-hover" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
    },
    {
      number: '4',
      title: 'Create or update contacts instantly',
      description: 'No match? Click create and it\'s done in 3 seconds. Already exists? Update deals, add notes, track your pipeline.',
      icon: (
        <svg className="w-6 h-6 text-button-primary-hover" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
      ),
    },
  ];

  return (
    <section className="bg-white py-20 md:py-24">
      <div className="max-w-4xl mx-auto px-5 md:px-10">
        {/* Section header */}
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-button-primary uppercase tracking-wider">
            Simple Process
          </p>
          <h2 className="mt-2 text-3xl md:text-4xl font-bold text-slate-700 leading-tight">
            From WhatsApp chat to Pipedrive contact
          </h2>
          <p className="mt-3 text-lg text-slate-600">
            Four steps. Zero friction.
          </p>
        </div>

        {/* Steps with timeline */}
        <div className="relative">
          {/* Timeline line (desktop only) */}
          <div className="hidden lg:block absolute left-7 top-0 bottom-0 w-0.5 bg-button-primary/30" style={{ height: 'calc(100% - 3rem)' }} />

          {/* Steps */}
          <div className="space-y-12">
            {steps.map((step, index) => (
              <div key={index} className="relative flex gap-6 md:gap-10 items-start">
                {/* Number badge */}
                <div className="relative z-10 flex-shrink-0 w-14 h-14 rounded-full bg-button-primary flex items-center justify-center shadow-md">
                  <span className="text-2xl font-bold text-white">{step.number}</span>
                </div>

                {/* Content */}
                <div className="flex-1 pt-2">
                  <h3 className="text-xl font-semibold text-slate-700 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-base text-slate-600 leading-relaxed mb-4">
                    {step.description}
                  </p>
                  <div className="hidden md:block">
                    {step.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
