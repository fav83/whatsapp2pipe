export function Benefits() {
  const benefits = [
    {
      icon: (
        <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: 'Capture leads in seconds',
      description: 'No more alt-tabbing, copying phone numbers, or losing track. Create Pipedrive contacts without leaving WhatsApp.',
    },
    {
      icon: (
        <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
      title: 'Auto-filled, ready to save',
      description: 'Contact names and phone numbers pulled automatically. Just click create—or attach to an existing contact.',
    },
    {
      icon: (
        <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      ),
      title: 'Live in WhatsApp, sync to Pipedrive',
      description: 'A sidebar that lives in WhatsApp Web. Every chat, every lead, instantly synced. Jump to Pipedrive with one click.',
    },
  ];

  return (
    <section className="bg-[#1E293B] py-20 md:py-24">
      <div className="max-w-6xl mx-auto px-5 md:px-10">
        {/* Section header */}
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-white/70 uppercase tracking-wider">
            Why Chat2Deal
          </p>
          <h2 className="mt-2 text-3xl md:text-4xl font-bold text-white leading-tight">
            Your CRM, without the context switching
          </h2>
        </div>

        {/* Benefits grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-8 transition-all duration-300 ease-out hover:bg-white/15"
            >
              <div className="mb-5">{benefit.icon}</div>
              <h3 className="text-xl font-semibold text-white mb-3 leading-snug">
                {benefit.title}
              </h3>
              <p className="text-base text-white/80 leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
