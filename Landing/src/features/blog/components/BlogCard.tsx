import { Link } from 'react-router-dom';
import type { BlogPostMeta } from '../types';

interface BlogCardProps {
  post: BlogPostMeta;
}

/**
 * Preview card for guides displayed on the index page.
 */
export function BlogCard({ post }: BlogCardProps) {
  const { frontmatter, readingTime } = post;

  const formattedDate = new Date(frontmatter.publishDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <article className="group bg-white rounded-xl shadow-md border border-gray-200 border-l-4 border-l-button-primary overflow-hidden hover:shadow-lg hover:border-l-button-primary-dark transition-all duration-200">
      <Link to={`/guides/${frontmatter.slug}`} className="block p-6">
        <h2 className="text-xl font-semibold text-slate-700 group-hover:text-button-primary transition-colors line-clamp-2 mb-3">
          {frontmatter.title}
        </h2>
        <p className="text-gray-600 text-sm line-clamp-3 mb-4">
          {frontmatter.description}
        </p>
        <div className="flex items-center text-sm text-gray-500">
          <time dateTime={frontmatter.publishDate}>{formattedDate}</time>
          <span className="mx-2">•</span>
          <span>{readingTime} min read</span>
        </div>
      </Link>
    </article>
  );
}
