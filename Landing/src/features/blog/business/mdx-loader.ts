import type { BlogFrontmatter, BlogPostMeta, BlogPost, TOCItem } from '../types';
import { blogConfig } from '../config';
import { extractTOCFromContent, calculateReadingTime } from './toc-generator';

// Vite's glob import for MDX files at build time
// This imports all MDX files from the content/guides directory
// Path: from src/features/blog/business/ -> src/content/guides/ (3 levels up)
const mdxModules = import.meta.glob<{
  default: React.ComponentType;
  frontmatter: BlogFrontmatter;
}>('../../../content/guides/*.mdx', { eager: true });

// Also load raw content for TOC extraction
const mdxRawContent = import.meta.glob<string>('../../../content/guides/*.mdx', {
  query: '?raw',
  import: 'default',
  eager: true,
});

interface PostModule {
  default: React.ComponentType;
  frontmatter: BlogFrontmatter;
  rawContent: string;
}

/**
 * Loads all posts from the MDX modules.
 */
function loadAllPostModules(): PostModule[] {
  const posts: PostModule[] = [];

  // Build a map of filename to raw content for easier lookup
  const rawContentMap = new Map<string, string>();
  for (const [path, content] of Object.entries(mdxRawContent)) {
    // Extract just the filename from the path
    const filename = path.split('/').pop() || '';
    if (typeof content === 'string') {
      rawContentMap.set(filename, content);
    }
  }

  for (const [path, module] of Object.entries(mdxModules)) {
    // Extract filename and look up raw content
    const filename = path.split('/').pop() || '';
    const rawContent = rawContentMap.get(filename) || '';

    posts.push({
      default: module.default,
      frontmatter: module.frontmatter,
      rawContent,
    });
  }

  return posts;
}

/**
 * Gets metadata for all blog posts, sorted by publish date (newest first).
 */
export function getAllPosts(): BlogPostMeta[] {
  const modules = loadAllPostModules();

  return modules
    .map((module) => ({
      frontmatter: {
        ...module.frontmatter,
        featuredImage: module.frontmatter.featuredImage || blogConfig.defaultFeaturedImage,
      },
      // Use frontmatter readingTime if provided, otherwise calculate from content
      readingTime: module.frontmatter.readingTime || calculateReadingTime(module.rawContent),
    }))
    .sort((a, b) =>
      new Date(b.frontmatter.publishDate).getTime() -
      new Date(a.frontmatter.publishDate).getTime()
    );
}

/**
 * Gets a single blog post by its slug.
 */
export function getPostBySlug(slug: string): BlogPost | null {
  const modules = loadAllPostModules();

  const module = modules.find((m) => m.frontmatter.slug === slug);

  if (!module) {
    return null;
  }

  // Use frontmatter TOC if provided, otherwise extract from content
  let toc: TOCItem[];
  if (module.frontmatter.toc && module.frontmatter.toc.length > 0) {
    // Convert frontmatter TOC to full TOCItem format
    toc = module.frontmatter.toc.map((item) => ({
      id: item.id,
      text: item.text,
      level: 2 as const,
    }));
  } else {
    toc = extractTOCFromContent(module.rawContent);
  }

  return {
    frontmatter: {
      ...module.frontmatter,
      featuredImage: module.frontmatter.featuredImage || blogConfig.defaultFeaturedImage,
    },
    content: module.default,
    // Use frontmatter readingTime if provided, otherwise calculate from content
    readingTime: module.frontmatter.readingTime || calculateReadingTime(module.rawContent),
    toc,
  };
}

/**
 * Gets all slugs for static path generation.
 */
export function getAllSlugs(): string[] {
  const modules = loadAllPostModules();
  return modules.map((m) => m.frontmatter.slug);
}
