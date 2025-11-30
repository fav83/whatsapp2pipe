import { PageHelmet } from '../../../components/SEO/PageHelmet';
import { Header } from '../../../components/Header';
import { Footer } from '../../../components/Footer';
import { BlogCard } from './BlogCard';
import { getAllPosts } from '../business/mdx-loader';

/**
 * Blog index page displaying all published posts.
 */
export function BlogIndex() {
  const posts = getAllPosts();

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <PageHelmet
        title="Guides"
        description="Tips, guides, and updates for getting the most out of WhatsApp + Pipedrive integration."
        keywords="whatsapp pipedrive, crm integration, sales tips, whatsapp crm"
        url="/guides"
        type="website"
      />

      <Header />

      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-5 md:px-10 py-12 md:py-16">
          {/* Page Header */}
          <div className="mb-12 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-700 mb-4">
              Guides
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Tips, guides, and updates for getting the most out of WhatsApp + Pipedrive.
            </p>
          </div>

          {/* Blog Posts Grid */}
          {posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <BlogCard key={post.frontmatter.slug} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No posts yet. Check back soon!</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
