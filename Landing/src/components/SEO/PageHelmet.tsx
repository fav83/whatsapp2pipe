import { Helmet } from 'react-helmet-async';

export interface PageHelmetProps {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
}

/**
 * PageHelmet component for managing page-level SEO metadata
 *
 * This component uses react-helmet-async to dynamically set meta tags
 * for search engines and social media platforms.
 */
export function PageHelmet({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
}: PageHelmetProps) {
  const siteName = 'Chat2Deal';
  const fullTitle = title === siteName ? siteName : `${title} | ${siteName}`;

  // Default values
  const baseUrl = import.meta.env.VITE_SITE_URL || 'https://chat2deal.com';
  const canonicalUrl = url ? `${baseUrl}${url}` : baseUrl;
  const ogImage = image || `${baseUrl}/og-image.png`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph Tags (Facebook, LinkedIn) */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content={siteName} />

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
    </Helmet>
  );
}
