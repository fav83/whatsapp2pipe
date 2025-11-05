import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  // SEO Optimization: Use base path for proper asset loading
  base: './',

  build: {
    // Generate source maps for debugging (but not shipped to users)
    sourcemap: true,

    // Optimize chunk size for better loading performance
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'markdown-vendor': ['react-markdown'],
        },
      },
    },
  },
})
