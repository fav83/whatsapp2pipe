import type { TOCItem } from '../types';

/**
 * Extracts a table of contents from MDX content by parsing H2 and H3 headings.
 *
 * @param content - The raw MDX content string
 * @returns Array of TOCItem with nested H3 children under H2 parents
 */
export function extractTOCFromContent(content: string): TOCItem[] {
  const headingRegex = /^(#{2,3})\s+(.+)$/gm;
  const tocItems: TOCItem[] = [];
  let currentH2: TOCItem | null = null;

  let match;
  while ((match = headingRegex.exec(content)) !== null) {
    const [, hashes, text] = match;
    const level = hashes.length as 2 | 3;
    const id = generateSlug(text);

    const item: TOCItem = {
      id,
      text: text.trim(),
      level,
    };

    if (level === 2) {
      item.children = [];
      tocItems.push(item);
      currentH2 = item;
    } else if (level === 3 && currentH2) {
      currentH2.children = currentH2.children || [];
      currentH2.children.push(item);
    }
  }

  return tocItems;
}

/**
 * Generates a URL-friendly slug from heading text.
 * Matches the slug generation of rehype-slug.
 */
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

/**
 * Calculates estimated reading time based on word count.
 *
 * @param content - The raw MDX content string
 * @param wordsPerMinute - Average reading speed (default: 200)
 * @returns Reading time in minutes (minimum 1)
 */
export function calculateReadingTime(content: string, wordsPerMinute = 200): number {
  const textContent = content
    .replace(/```[\s\S]*?```/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/#+\s/g, '')
    .replace(/[*_~`]/g, '');

  const words = textContent.trim().split(/\s+/).length;
  const readingTime = Math.ceil(words / wordsPerMinute);

  return Math.max(1, readingTime);
}
