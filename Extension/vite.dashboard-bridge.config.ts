import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: false, // Don't clear dist/ (other builds use it)
    rollupOptions: {
      input: {
        'dashboard-bridge': resolve(__dirname, 'src/dashboard-bridge.ts'),
      },
      output: {
        entryFileNames: '[name].js',
        format: 'iife', // Self-contained bundle
        inlineDynamicImports: true, // Single file (no chunks)
      },
    },
    sourcemap: true,
  },
})
