import { useParams, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { MDXProvider } from '@mdx-js/react';
import { getPostBySlug } from '../business/mdx-loader';
import { BlogLayout } from './BlogLayout';
import { mdxComponents } from './mdx-components';
import { blogConfig } from '../config';

/**
 * Blog post page component.
 * Loads and renders a single post by slug from URL params.
 */
export function BlogPost() {
  const { slug } = useParams<{ slug: string }>();

  if (!slug) {
    return <Navigate to="/guides" replace />;
  }

  const post = getPostBySlug(slug);

  if (!post) {
    return <Navigate to="/guides" replace />;
  }

  const { frontmatter, content: Content, readingTime, toc } = post;
  const baseUrl = import.meta.env.VITE_SITE_URL || 'https://chat2deal.com';
  const canonicalUrl = `${baseUrl}/guides/${slug}`;
  const ogImage = frontmatter.featuredImage
    ? `${baseUrl}${frontmatter.featuredImage}`
    : `${baseUrl}${blogConfig.defaultFeaturedImage}`;

  // JSON-LD structured data for Article
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: frontmatter.title,
    description: frontmatter.description,
    image: ogImage,
    datePublished: frontmatter.publishDate,
    dateModified: frontmatter.lastUpdated || frontmatter.publishDate,
    author: {
      '@type': 'Organization',
      name: 'Chat2Deal',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Chat2Deal',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo.png`,
      },
    },
  };

  return (
    <>
      <Helmet>
        {/* Basic Meta Tags */}
        <title>{frontmatter.title} | Chat2Deal Guides</title>
        <meta name="description" content={frontmatter.description} />
        <meta name="keywords" content={frontmatter.keywords.join(', ')} />
        <link rel="canonical" href={canonicalUrl} />

        {/* Open Graph Tags */}
        <meta property="og:type" content="article" />
        <meta property="og:title" content={frontmatter.title} />
        <meta property="og:description" content={frontmatter.description} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:site_name" content="Chat2Deal" />

        {/* Article-specific OG tags */}
        <meta property="article:published_time" content={frontmatter.publishDate} />
        {frontmatter.lastUpdated && (
          <meta property="article:modified_time" content={frontmatter.lastUpdated} />
        )}
        <meta property="article:author" content={blogConfig.defaultAuthor} />

        {/* Twitter Card Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={frontmatter.title} />
        <meta name="twitter:description" content={frontmatter.description} />
        <meta name="twitter:image" content={ogImage} />

        {/* JSON-LD Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      </Helmet>

      <BlogLayout
        frontmatter={frontmatter}
        readingTime={readingTime}
        toc={toc}
      >
        <MDXProvider components={mdxComponents}>
          <Content />
        </MDXProvider>
      </BlogLayout>
    </>
  );
}
