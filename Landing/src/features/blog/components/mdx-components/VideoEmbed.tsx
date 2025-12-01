import { useEffect, useRef, useState } from 'react';

interface VideoEmbedProps {
  src: string;
  webmSrc?: string;
  title?: string;
  description?: string;
  poster?: string;
  uploadDate?: string;
  duration?: string; // ISO 8601 duration format, e.g., "PT1M30S" for 1min 30sec
  aspectRatio?: '16:9' | '4:3';
  autoPlay?: boolean;
}

/**
 * Video embed component for blog content.
 * Supports mp4 files with optional webm fallback, and YouTube embeds.
 */
export function VideoEmbed({
  src,
  webmSrc,
  title = 'Video',
  description,
  poster,
  uploadDate,
  duration,
  aspectRatio = '16:9',
  autoPlay = false,
}: VideoEmbedProps) {
  const aspectClass = aspectRatio === '16:9' ? 'aspect-video' : 'aspect-[4/3]';
  const isYouTube = src.includes('youtube.com') || src.includes('youtu.be');
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const hasAutoPlayedRef = useRef(false);

  // Generate VideoObject JSON-LD schema for SEO
  const getVideoSchema = () => {
    if (isYouTube) return null; // YouTube handles its own schema

    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const schema: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': 'VideoObject',
      name: title,
      contentUrl: `${baseUrl}${src}`,
    };

    if (description) schema.description = description;
    if (poster) schema.thumbnailUrl = `${baseUrl}${poster}`;
    if (uploadDate) schema.uploadDate = uploadDate;
    if (duration) schema.duration = duration;

    return schema;
  };

  const videoSchema = getVideoSchema();

  const handlePlayClick = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handlePlay = () => {
    setIsPlaying(true);
  };

  // Autoplay only when the video is in view; pause when it leaves view.
  useEffect(() => {
    if (!autoPlay || !videoRef.current || typeof IntersectionObserver === 'undefined') {
      return;
    }

    const videoEl = videoRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          if (hasAutoPlayedRef.current) {
            return;
          }
          hasAutoPlayedRef.current = true;

          const playPromise = videoEl.play();
          if (playPromise?.catch) {
            playPromise.catch(() => {
              // Browser blocked autoplay; user will see the play button overlay.
            });
          }
        } else {
          videoEl.pause();
        }
      },
      { threshold: 0.35 }
    );

    observer.observe(videoEl);

    return () => {
      observer.unobserve(videoEl);
      observer.disconnect();
    };
  }, [autoPlay]);

  if (isYouTube) {
    // Convert YouTube URL to embed URL
    let embedUrl = src;
    if (src.includes('watch?v=')) {
      const videoId = src.split('watch?v=')[1].split('&')[0];
      embedUrl = `https://www.youtube.com/embed/${videoId}`;
    } else if (src.includes('youtu.be/')) {
      const videoId = src.split('youtu.be/')[1].split('?')[0];
      embedUrl = `https://www.youtube.com/embed/${videoId}`;
    }

    return (
      <div className={`my-8 overflow-hidden rounded-lg shadow-lg ${aspectClass}`}>
        <iframe
          src={embedUrl}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />
      </div>
    );
  }

  // MP4 or other video file with optional webm fallback
  return (
    <div className={`not-prose my-8 relative w-full rounded-lg shadow-lg overflow-hidden bg-black ${aspectClass}`}>
      {/* VideoObject JSON-LD for SEO */}
      {videoSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(videoSchema) }}
        />
      )}
      <video
        ref={videoRef}
        title={title}
        controls
        poster={poster}
        className="absolute inset-0 w-full h-full object-cover object-top m-0"
        preload="metadata"
        muted={autoPlay}
        playsInline
        onPlay={handlePlay}
        onPause={handlePause}
      >
        {webmSrc && <source src={webmSrc} type="video/webm" />}
        <source src={src} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      {/* Play button overlay */}
      {!isPlaying && (
        <button
          onClick={handlePlayClick}
          className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors cursor-pointer group"
          aria-label="Play video"
        >
          <div className="w-20 h-20 rounded-full bg-white/90 group-hover:bg-white group-hover:scale-110 transition-all flex items-center justify-center shadow-lg">
            <svg
              className="w-8 h-8 text-button-primary ml-1"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </button>
      )}
    </div>
  );
}
