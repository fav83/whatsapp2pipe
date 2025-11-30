interface ScreenshotProps {
  src: string;
  alt: string;
  caption?: string;
}

/**
 * Styled image component for screenshots within blog content.
 */
export function Screenshot({ src, alt, caption }: ScreenshotProps) {
  return (
    <figure className="my-8">
      <div className="overflow-hidden rounded-lg border border-gray-200 shadow-md">
        <img
          src={src}
          alt={alt}
          className="w-full h-auto"
          loading="lazy"
        />
      </div>
      {caption && (
        <figcaption className="mt-3 text-center text-sm text-gray-500">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
