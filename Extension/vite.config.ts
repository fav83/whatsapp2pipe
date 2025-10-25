import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        'content-script': resolve(__dirname, 'src/content-script/index.tsx'),
        'service-worker': resolve(__dirname, 'src/service-worker/index.ts'),
        popup: resolve(__dirname, 'src/popup/index.html'),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          // Service worker and content script need specific names
          if (chunkInfo.name === 'service-worker' || chunkInfo.name === 'content-script') {
            return '[name].js'
          }
          return 'assets/[name].[hash].js'
        },
        chunkFileNames: 'chunks/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]',
      },
    },
    sourcemap: process.env.NODE_ENV === 'development',
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
})
