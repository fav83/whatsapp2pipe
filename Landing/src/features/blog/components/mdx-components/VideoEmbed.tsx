interface VideoEmbedProps {
  src: string;
  title?: string;
  aspectRatio?: '16:9' | '4:3';
}

/**
 * Video embed component for blog content.
 * Supports both mp4 files and YouTube embeds.
 */
export function VideoEmbed({ src, title = 'Video', aspectRatio = '16:9' }: VideoEmbedProps) {
  const aspectClass = aspectRatio === '16:9' ? 'aspect-video' : 'aspect-[4/3]';
  const isYouTube = src.includes('youtube.com') || src.includes('youtu.be');

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

  // MP4 or other video file
  return (
    <div className={`my-8 overflow-hidden rounded-lg shadow-lg ${aspectClass}`}>
      <video
        src={src}
        title={title}
        controls
        className="w-full h-full object-cover"
        preload="metadata"
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
}
