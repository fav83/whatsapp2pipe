import type { ComponentType } from 'react';

/**
 * Blog post frontmatter metadata from MDX files.
 */
/**
 * Frontmatter TOC item for manual override.
 */
export interface FrontmatterTOCItem {
  id: string;
  text: string;
}

export interface BlogFrontmatter {
  title: string;
  description: string;
  slug: string;
  keywords: string[];
  publishDate: string;
  lastUpdated?: string;
  featuredImage?: string;
  readingTime?: number; // Optional override for calculated reading time
  toc?: FrontmatterTOCItem[]; // Optional manual TOC override
}

/**
 * Complete blog post with compiled content and computed fields.
 */
export interface BlogPost {
  frontmatter: BlogFrontmatter;
  content: ComponentType;
  readingTime: number;
  toc: TOCItem[];
}

/**
 * Table of contents item extracted from headings.
 */
export interface TOCItem {
  id: string;
  text: string;
  level: 2 | 3;
  children?: TOCItem[];
}

/**
 * Blog post metadata for listing pages (without content).
 */
export interface BlogPostMeta {
  frontmatter: BlogFrontmatter;
  readingTime: number;
}
