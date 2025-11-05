import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Markdown from 'react-markdown';
import { PageHelmet } from '../../components/SEO';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';

export default function TermsOfService() {
  const [content, setContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch markdown content from public folder
    fetch('/content/legal/terms-of-service.md')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to load terms of service');
        }
        return response.text();
      })
      .then((text) => {
        setContent(text);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Error loading terms of service:', error);
        setError('Failed to load terms of service. Please try again later.');
        setIsLoading(false);
      });
  }, []);

  return (
    <>
      <PageHelmet
        title="Terms of Service"
        description="Chat2Deal Terms of Service - Terms and conditions for using our WhatsApp to Pipedrive CRM integration Chrome extension."
        url="/terms-of-service"
      />
      <div className="min-h-screen flex flex-col">
        <Header />

      <main className="flex-1 py-8 sm:py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb Navigation */}
          <div className="mb-6">
            <Link
              to="/"
              className="inline-flex items-center text-sm text-slate-600 hover:text-slate-700 transition-colors duration-200"
            >
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Home
            </Link>
          </div>

          {/* Legal Document Container */}
          <article className="prose prose-lg max-w-none">
            {isLoading ? (
              <div className="text-center text-slate-600">
                Loading Terms of Service...
              </div>
            ) : error ? (
              <div className="text-center text-red-600">
                {error}
              </div>
            ) : (
              <Markdown
                components={{
                  // Customize heading styles
                  h1: ({ children }) => (
                    <h1 className="mb-4 text-3xl font-bold text-slate-900 sm:text-4xl">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="mt-8 mb-4 text-2xl font-bold text-slate-900">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="mt-6 mb-3 text-xl font-semibold text-slate-900">
                      {children}
                    </h3>
                  ),
                  // Customize paragraph styles
                  p: ({ children }) => (
                    <p className="mb-4 text-base leading-relaxed text-slate-700">
                      {children}
                    </p>
                  ),
                  // Customize list styles
                  ul: ({ children }) => (
                    <ul className="mb-4 ml-6 list-disc space-y-2 text-slate-700">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="mb-4 ml-6 list-decimal space-y-2 text-slate-700">
                      {children}
                    </ol>
                  ),
                  // Customize link styles
                  a: ({ children, href }) => (
                    <a
                      href={href}
                      className="text-blue-600 underline hover:text-blue-700 transition-colors duration-200"
                    >
                      {children}
                    </a>
                  ),
                  // Customize strong (bold) text
                  strong: ({ children }) => (
                    <strong className="font-semibold text-slate-900">
                      {children}
                    </strong>
                  ),
                  // Customize emphasis (italic) text
                  em: ({ children }) => (
                    <em className="italic text-slate-700">
                      {children}
                    </em>
                  ),
                  // Customize blockquote styles
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-blue-600 pl-4 italic text-slate-700 my-4">
                      {children}
                    </blockquote>
                  ),
                  // Customize horizontal rule
                  hr: () => (
                    <hr className="my-8 border-t border-slate-300" />
                  ),
                }}
              >
                {content}
              </Markdown>
            )}
          </article>
        </div>
      </main>

      <Footer />
      </div>
    </>
  );
}
