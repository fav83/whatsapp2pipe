import { defineConfig } from 'vite'
import mdx from '@mdx-js/rollup'
import react from '@vitejs/plugin-react'
import remarkGfm from 'remark-gfm'
import remarkFrontmatter from 'remark-frontmatter'
import remarkMdxFrontmatter from 'remark-mdx-frontmatter'
import rehypeSlug from 'rehype-slug'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    // MDX plugin MUST come before React plugin
    // Exclude raw imports so we can get plain text content for TOC/reading time
    mdx({
      include: /\.mdx$/,
      exclude: /\?raw$/,
      remarkPlugins: [
        remarkFrontmatter,
        [remarkMdxFrontmatter, { name: 'frontmatter' }],
        remarkGfm,
      ],
      rehypePlugins: [rehypeSlug],
      providerImportSource: '@mdx-js/react',
    }),
    react(),
  ],

  // SEO Optimization: Use base path for proper asset loading
  base: './',

  build: {
    // Don't generate source maps for production (landing is public website)
    sourcemap: false,

    // Optimize chunk size for better loading performance
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'markdown-vendor': ['react-markdown'],
          'mdx-vendor': ['@mdx-js/react'],
        },
      },
    },
  },
})
