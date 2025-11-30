import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../../../components/Header';
import { Footer } from '../../../components/Footer';
import { TableOfContents } from './TableOfContents';
import { blogConfig } from '../config';
import type { BlogFrontmatter, TOCItem } from '../types';

interface BlogLayoutProps {
  frontmatter: BlogFrontmatter;
  readingTime: number;
  toc: TOCItem[];
  children: ReactNode;
}

/**
 * Layout wrapper for individual blog posts.
 * Two-column layout on desktop with content left and TOC right.
 */
export function BlogLayout({ frontmatter, readingTime, toc, children }: BlogLayoutProps) {
  const formattedDate = new Date(frontmatter.publishDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />

      <main className="flex-1">
        <article className="max-w-6xl mx-auto px-5 md:px-10 py-8 md:py-12">
          {/* Breadcrumbs */}
          <nav className="mb-8 text-sm" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2 text-slate-500">
              <li>
                <Link to="/" className="hover:text-indigo-600 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <span className="mx-2">/</span>
              </li>
              <li>
                <Link to="/guides" className="hover:text-indigo-600 transition-colors">
                  Guides
                </Link>
              </li>
              <li>
                <span className="mx-2">/</span>
              </li>
              <li className="text-slate-700 font-medium truncate max-w-xs">
                {frontmatter.title}
              </li>
            </ol>
          </nav>

          {/* Post Header */}
          <header className="mb-10">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-700 mb-4 leading-tight">
              {frontmatter.title}
            </h1>
            <div className="flex items-center text-slate-500 text-sm">
              <span>{blogConfig.defaultAuthor}</span>
              <span className="mx-3">•</span>
              <time dateTime={frontmatter.publishDate}>{formattedDate}</time>
              <span className="mx-3">•</span>
              <span>{readingTime} min read</span>
            </div>
          </header>

          {/* Content + TOC Grid */}
          <div className="lg:grid lg:grid-cols-[1fr,280px] lg:gap-12">
            {/* Article Content */}
            <div className="prose prose-lg max-w-none">
              {children}
            </div>

            {/* Sidebar with TOC - Hidden on mobile */}
            <aside className="hidden lg:block">
              <TableOfContents items={toc} />
            </aside>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
