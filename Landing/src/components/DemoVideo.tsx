export function DemoVideo() {
  return (
    <section className="bg-slate-700 py-20 md:py-24">
      <div className="max-w-6xl mx-auto px-5 md:px-10">
        {/* Section header */}
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-white/80 uppercase tracking-wider">
            See it in action
          </p>
          <h2 className="mt-2 text-3xl md:text-4xl font-bold text-white leading-tight">
            Watch how Chat2Deal works
          </h2>
          <p className="mt-4 text-lg text-white/90 max-w-2xl mx-auto">
            See how easy it is to capture leads from WhatsApp Web and sync them to Pipedrive in seconds
          </p>
        </div>

        {/* Video container */}
        <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-slate-900 mx-auto max-w-4xl">
          <video
            className="w-full h-auto"
            controls
            playsInline
            preload="metadata"
          >
            <source src="/demo.webm" type="video/webm" />
            <source src="/demo.mp4" type="video/mp4" />
            <p className="text-white p-8 text-center">
              Your browser doesn't support HTML5 video. Here is a{' '}
              <a href="/demo.mp4" className="text-button-primary underline" download>
                link to download the video
              </a>{' '}
              instead.
            </p>
          </video>
        </div>
      </div>
    </section>
  );
}
