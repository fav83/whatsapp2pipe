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
      input: {
        'inspector-main': resolve(__dirname, 'src/content-script/inspector-main.ts'),
      },
      inlineDynamicImports: true,
      output: {
        entryFileNames: () => 'inspector-main.js',
        format: 'es',
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
