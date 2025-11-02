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
      input: {
        'content-script': resolve(__dirname, 'src/content-script/index.tsx'),
      },
      // Inline all dynamic imports to produce a single file
      inlineDynamicImports: true,
      output: {
        entryFileNames: () => 'content-script.js',
        format: 'es',
        // Ensure Chrome manifest can load a stable CSS path
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'content-script.css') {
            return 'assets/content-script.css'
          }
          return 'assets/[name].[hash].[ext]'
        },
      },
      preserveEntrySignatures: 'strict',
    },
    chunkSizeWarningLimit: 1000,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
})
