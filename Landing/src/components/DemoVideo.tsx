import { useRef, useState } from 'react';

export function DemoVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayClick = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => setIsPlaying(false);

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
            ref={videoRef}
            className="w-full h-auto"
            controls
            playsInline
            preload="metadata"
            onPlay={handlePlay}
            onPause={handlePause}
          >
            <source src="/chat2deal-whatsapp-sync-pipedrive-promo.mp4" type="video/mp4" />
            <p className="text-white p-8 text-center">
              Your browser doesn't support HTML5 video. Here is a{' '}
              <a href="/chat2deal-whatsapp-sync-pipedrive-promo.mp4" className="text-button-primary underline" download>
                link to download the video
              </a>{' '}
              instead.
            </p>
          </video>
          {/* Play button overlay */}
          {!isPlaying && (
            <button
              onClick={handlePlayClick}
              className="absolute inset-0 flex items-center justify-center cursor-pointer group"
              aria-label="Play video"
            >
              <div className="w-20 h-20 rounded-full bg-button-primary group-hover:bg-button-primary-hover group-hover:scale-110 transition-all flex items-center justify-center shadow-lg">
                <svg
                  className="w-8 h-8 text-white ml-1"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
