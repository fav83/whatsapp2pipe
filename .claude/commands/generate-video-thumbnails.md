# Generate Video Thumbnails for SEO

Generate thumbnails for video files and ensure VideoObject schema compliance for Google Search Console.

## Instructions

1. **Find all mp4 files** in the specified directory (default: `Landing/public/blog/videos/`)

2. **Generate thumbnails** using ffmpeg:
   ```bash
   ffmpeg -i "video.mp4" -ss 00:00:01 -frames:v 1 "thumbnails/video-thumb.jpg" -y
   ```
   - Extract frame at 1 second into the video
   - Save to `thumbnails/` subdirectory with `-thumb.jpg` suffix
   - Create the thumbnails directory if it doesn't exist

3. **Update VideoEmbed components** in MDX files to include required schema fields:
   - `poster` - path to the generated thumbnail (for `thumbnailUrl` in schema)
   - `uploadDate` - must be ISO 8601 with timezone: `"YYYY-MM-DDTHH:MM:SSZ"`
   - `duration` - ISO 8601 duration format: `"PT1M30S"` for 1min 30sec
   - `title` - descriptive title for the video
   - `description` - brief description of video content

## Google VideoObject Schema Requirements

These fields are required for videos to appear in Google Search results:

| Field | Required | Format |
|-------|----------|--------|
| `thumbnailUrl` | Critical | Full URL to image (from `poster` prop) |
| `uploadDate` | Required | ISO 8601 with timezone (e.g., `2025-11-30T00:00:00Z`) |
| `name` | Required | From `title` prop |
| `description` | Recommended | From `description` prop |
| `duration` | Recommended | ISO 8601 duration (e.g., `PT39S`) |
| `contentUrl` | Required | From `src` prop |

## Example VideoEmbed with full schema support

```tsx
<VideoEmbed
  src="/blog/videos/my-video.mp4"
  webmSrc="/blog/videos/my-video.webm"
  poster="/blog/videos/thumbnails/my-video-thumb.jpg"
  title="Descriptive Video Title"
  description="Brief description of what the video shows."
  uploadDate="2025-11-30T00:00:00Z"
  duration="PT1M30S"
  autoPlay
/>
```

## Usage

Run this command when:
- Adding new videos to blog/guide content
- Google Search Console reports VideoObject schema issues
- Missing thumbnailUrl, invalid uploadDate, or other schema errors

$ARGUMENTS
