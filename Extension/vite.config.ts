import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve, dirname } from 'path'
import {
  copyFileSync,
  existsSync,
  readFileSync,
  writeFileSync,
  mkdirSync,
  readdirSync,
  renameSync,
  unlinkSync,
} from 'fs'

export default defineConfig({
  base: './', // Enable relative asset loading for Chrome extension compatibility
  plugins: [
    // Important: We rely on sentry-cli to inject Debug IDs post-build during upload.
    // Keeping the Vite plugin disabled avoids double-injection and mismatched IDs.
    react(),
    // Copy manifest to dist after build
    {
      name: 'copy-manifest',
      closeBundle() {
        copyFileSync(
          resolve(__dirname, 'public/manifest.json'),
          resolve(__dirname, 'dist/manifest.json')
        )
        console.log('✓ Copied manifest.json to dist/')
      },
    },
    // Move popup.html to root of dist and fix asset paths
    {
      name: 'move-popup-html',
      closeBundle() {
        const popupSrc = resolve(__dirname, 'dist/src/popup/index.html')
        const popupDest = resolve(__dirname, 'dist/popup.html')
        if (existsSync(popupSrc)) {
          let popupContent = readFileSync(popupSrc, 'utf-8')
          // Fix asset paths: ../../assets/ becomes ./assets/ since we're moving from dist/src/popup/ to dist/
          popupContent = popupContent.replace(/\.\.(\/\.\.)+\//g, './')
          writeFileSync(popupDest, popupContent)
          console.log('✓ Moved popup.html to dist/ and fixed asset paths')
        }
      },
    },
    // Note: No post-build inlining. content-script and inspector are
    // built as single-file bundles via separate configs.
    // Separate source maps from dist to prevent accidental deployment
    // But keep sourceMappingURL references in JS files for Sentry
    {
      name: 'separate-sourcemaps',
      closeBundle() {
        const distDir = resolve(__dirname, 'dist')
        const sourcemapsDir = resolve(__dirname, 'sourcemaps')

        // Create sourcemaps directory (clean it completely if it exists)
        if (existsSync(sourcemapsDir)) {
          // Remove entire directory and recreate it
          const removeDir = (dir: string) => {
            const entries = readdirSync(dir, { withFileTypes: true })
            for (const entry of entries) {
              const fullPath = resolve(dir, entry.name)
              if (entry.isDirectory()) {
                removeDir(fullPath)
              } else {
                unlinkSync(fullPath)
              }
            }
          }
          removeDir(sourcemapsDir)
        }
        mkdirSync(sourcemapsDir, { recursive: true })

        // Function to recursively find and move .map files
        const moveSourceMaps = (dir: string) => {
          if (!existsSync(dir)) return
          const entries = readdirSync(dir, { withFileTypes: true })

          for (const entry of entries) {
            const fullPath = resolve(dir, entry.name)
            if (entry.isDirectory()) {
              moveSourceMaps(fullPath)
            } else if (entry.name.endsWith('.map')) {
              // For .map files, move them but keep the sourceMappingURL comment in the JS file
              const relativePath = fullPath.replace(distDir, '').replace(/^[\\/]/, '')
              const targetPath = resolve(sourcemapsDir, relativePath)
              const targetDir = dirname(targetPath)

              // Create subdirectories if needed
              if (!existsSync(targetDir)) {
                mkdirSync(targetDir, { recursive: true })
              }

              renameSync(fullPath, targetPath)
            }
          }
        }

        moveSourceMaps(distDir)
        const mapCount = readdirSync(sourcemapsDir).filter((f) => f.endsWith('.map')).length
        console.log(`✓ Moved ${mapCount} source map(s) to sourcemaps/`)
        console.log(
          'Note: sourceMappingURL comments remain in JS files for Sentry (maps not deployed)'
        )
      },
    },
  ],
  publicDir: 'public',
  build: {
    outDir: 'dist',
    // Do not wipe dist; earlier builds have emitted files
    emptyOutDir: false,
    rollupOptions: {
      input: {
        // content-script and inspector are built in separate configs
        'service-worker': resolve(__dirname, 'src/service-worker/index.ts'),
        popup: resolve(__dirname, 'src/popup/index.html'),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          // Service worker, content scripts, and inspector need specific names
          if (chunkInfo.name === 'service-worker') {
            return '[name].js'
          }
          return 'assets/[name].[hash].js'
        },
        chunkFileNames: 'chunks/[name].[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'content-script.css') {
            return 'assets/content-script.css'
          }
          return 'assets/[name].[hash].[ext]'
        },
        format: 'es',
        manualChunks: () => {
          // Don't create separate vendor chunks - inline everything
          return undefined
        },
      },
      // Disable automatic vendor chunking
      preserveEntrySignatures: 'strict',
    },
    sourcemap: true, // Generate source maps for Sentry error tracking
    // Increase chunk size warning limit since content-script bundles React
    chunkSizeWarningLimit: 1000,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
})
