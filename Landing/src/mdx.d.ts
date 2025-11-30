/// <reference types="vite/client" />

declare module '*.mdx' {
  import type { ComponentType } from 'react';

  export const frontmatter: {
    title: string;
    description: string;
    slug: string;
    keywords: string[];
    publishDate: string;
    lastUpdated?: string;
    featuredImage?: string;
    readingTime?: number;
    toc?: Array<{ id: string; text: string }>;
  };

  const MDXComponent: ComponentType;
  export default MDXComponent;
}
