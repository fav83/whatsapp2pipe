import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  base: './',
  plugins: [],
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: false, // Do not wipe content-script output
    sourcemap: true,
    rollupOptions: {
      input: resolve(__dirname, 'src/content-script/inspector-main.ts'),
      output: {
        entryFileNames: 'inspector-main.js',
        format: 'iife', // Use IIFE to prevent global scope pollution
        inlineDynamicImports: true,
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
