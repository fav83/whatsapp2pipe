import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  base: './',
  plugins: [react()],
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: true, // First pass cleans dist
    sourcemap: true,
    rollupOptions: {
      input: resolve(__dirname, 'src/content-script/index.tsx'),
      output: {
        entryFileNames: 'content-script.js',
        format: 'iife', // Use IIFE to prevent global scope pollution with WhatsApp Web
        // Ensure Chrome manifest can load a stable CSS path
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'content-script.css') {
            return 'assets/content-script.css'
          }
          return 'assets/[name].[hash].[ext]'
        },
        inlineDynamicImports: true, // Inline all imports into single file
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
})
