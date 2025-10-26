import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'fs'

export default defineConfig({
  base: './', // Enable relative asset loading for Chrome extension compatibility
  plugins: [
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
    // Inline chunks into content-script for Chrome compatibility
    {
      name: 'inline-chunks',
      closeBundle() {
        const contentScriptPath = resolve(__dirname, 'dist/content-script.js')
        const chunksDir = resolve(__dirname, 'dist/chunks')

        if (existsSync(contentScriptPath) && existsSync(chunksDir)) {
          let contentScript = readFileSync(contentScriptPath, 'utf-8')

          // Find all chunk imports
          const importRegex = /import\{([^}]+)\}from"\.\/chunks\/([^"]+)"/g
          const matches = [...contentScript.matchAll(importRegex)]

          if (matches.length > 0) {
            // Collect all chunk contents and imported variable names
            const chunksToInline = new Map()

            for (const match of matches) {
              const importedVars = match[1]
              const chunkFileName = match[2]
              const chunkFile = resolve(__dirname, 'dist/chunks', chunkFileName)

              if (existsSync(chunkFile) && !chunksToInline.has(chunkFileName)) {
                let chunkContent = readFileSync(chunkFile, 'utf-8')

                // Remove export statement from chunk
                const exportRegex = /export\{([^}]+)\};?\s*$/m
                const exportMatch = chunkContent.match(exportRegex)

                if (exportMatch) {
                  // Get the exported variable names
                  const exportedVars = exportMatch[1]
                  chunkContent = chunkContent.replace(exportRegex, '')
                  chunksToInline.set(chunkFileName, { content: chunkContent, exports: exportedVars, imports: importedVars })
                }
              }
            }

            // Replace all import statements with chunk content
            for (const [chunkFileName, { content, exports, imports }] of chunksToInline) {
              // Parse the import and export mappings
              // imports format: "j as e,r as i,c as a,R as c"
              // exports format: "Td as R,Io as c,Ld as j,$u as r"

              // Build a map of export names (j,r,c,R) to their actual variable names (Ld,$u,Io,Td)
              const exportMap = new Map()
              for (const pair of exports.split(',').map((s: string) => s.trim())) {
                const parts = pair.split(' as ')
                if (parts.length === 2) {
                  const [actualVar, exportedAs] = parts
                  exportMap.set(exportedAs, actualVar)
                }
              }

              // Create variable declarations to map imports to actual variables
              const varMappings = []
              for (const pair of imports.split(',').map((s: string) => s.trim())) {
                const parts = pair.split(' as ')
                if (parts.length === 2) {
                  const [importedName, localName] = parts
                  const actualVar = exportMap.get(importedName)
                  if (actualVar) {
                    varMappings.push(`const ${localName}=${actualVar};`)
                  }
                }
              }

              // Get list of exported variable names we need to preserve
              const preservedVars = Array.from(exportMap.values())

              // Wrap chunk in IIFE and return the preserved variables
              const returnStatement = `return {${preservedVars.join(',')}};`
              const iife = `const __chunk__=(function(){${content}${returnStatement}})();`

              // Update variable mappings to reference __chunk__
              const adjustedMappings = []
              for (const pair of imports.split(',').map((s: string) => s.trim())) {
                const parts = pair.split(' as ')
                if (parts.length === 2) {
                  const [importedName, localName] = parts
                  const actualVar = exportMap.get(importedName)
                  if (actualVar) {
                    adjustedMappings.push(`const ${localName}=__chunk__.${actualVar};`)
                  }
                }
              }

              const inlinedCode = iife + '\n' + adjustedMappings.join('')

              // Find the first import for this chunk and replace it
              const escapedFileName = chunkFileName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
              const firstImportRegex = new RegExp(`import\\{[^}]+\\}from"\\./chunks/${escapedFileName}"`)
              contentScript = contentScript.replace(firstImportRegex, inlinedCode)
            }

            // Remove any remaining import statements for chunks (duplicates)
            contentScript = contentScript.replace(/import\{[^}]+\}from"\.\/chunks\/[^"]+"/g, '/* chunk already inlined */')

            writeFileSync(contentScriptPath, contentScript)
            console.log('✓ Inlined chunks into content-script.js')
          }
        }
      },
    },
  ],
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
    sourcemap: process.env.NODE_ENV === 'development',
    // Increase chunk size warning limit since content-script bundles React
    chunkSizeWarningLimit: 1000,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
})
