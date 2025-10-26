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
    // Inline chunks into content-script and inspector-main for Chrome compatibility
    {
      name: 'inline-chunks',
      closeBundle() {
        const contentScriptPath = resolve(__dirname, 'dist/content-script.js')
        const inspectorMainPath = resolve(__dirname, 'dist/inspector-main.js')
        const chunksDir = resolve(__dirname, 'dist/chunks')

        // Process both content-script.js and inspector-main.js
        const filesToProcess = [
          { path: contentScriptPath, name: 'content-script' },
          { path: inspectorMainPath, name: 'inspector-main' },
        ]

        for (const { path: filePath, name: fileName } of filesToProcess) {
          if (!existsSync(filePath) || !existsSync(chunksDir)) {
            continue
          }

          let contentScript = readFileSync(filePath, 'utf-8')

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
                  chunksToInline.set(chunkFileName, {
                    content: chunkContent,
                    exports: exportedVars,
                    imports: importedVars,
                  })
                }
              }
            }

            // Replace all import statements with chunk content
            let chunkIndex = 0
            for (const [chunkFileName, { content, exports }] of chunksToInline) {
              // Build export map
              const exportMap = new Map()
              for (const pair of exports.split(',').map((s: string) => s.trim())) {
                const parts = pair.split(' as ')
                if (parts.length === 2) {
                  const [actualVar, exportedAs] = parts
                  exportMap.set(exportedAs, actualVar)
                }
              }

              // Get list of exported variable names we need to preserve
              const preservedVars = Array.from(exportMap.values())

              // Use unique chunk variable name for each chunk to avoid redeclaration
              const chunkVarName = `__chunk${chunkIndex}__`
              chunkIndex++

              // Wrap chunk in IIFE and return the preserved variables
              const returnStatement = `return {${preservedVars.join(',')}};`
              const iife = `const ${chunkVarName}=(function(){${content}${returnStatement}})();`

              // Find ALL imports for this chunk and replace them all at once
              const escapedFileName = chunkFileName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
              const allImportsRegex = new RegExp(
                `import\\{([^}]+)\\}from"\\./chunks/${escapedFileName}"`,
                'g'
              )

              let isFirstImport = true

              contentScript = contentScript.replace(allImportsRegex, (match, importedVars) => {
                // Create variable mappings for this import
                const varMappings = []
                for (const pair of importedVars.split(',').map((s: string) => s.trim())) {
                  const parts = pair.split(' as ')

                  let importedName: string
                  let localName: string

                  if (parts.length === 2) {
                    // Format: "j as o"
                    importedName = parts[0].trim()
                    localName = parts[1].trim()
                  } else if (parts.length === 1) {
                    // Format: "r" (no renaming)
                    importedName = parts[0].trim()
                    localName = importedName
                  } else {
                    return match // skip this pair
                  }

                  const actualVar = exportMap.get(importedName)
                  if (actualVar) {
                    varMappings.push(`const ${localName}=${chunkVarName}.${actualVar};`)
                  }
                }

                const mappingsCode = varMappings.join('')

                if (isFirstImport) {
                  // First import: include IIFE + mappings
                  isFirstImport = false
                  return iife + '\n' + mappingsCode
                } else {
                  // Subsequent imports: just mappings
                  return mappingsCode
                }
              })
            }

            writeFileSync(filePath, contentScript)
            console.log(`✓ Inlined chunks into ${fileName}.js`)
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
        'inspector-main': resolve(__dirname, 'src/content-script/inspector-main.ts'),
        'service-worker': resolve(__dirname, 'src/service-worker/index.ts'),
        popup: resolve(__dirname, 'src/popup/index.html'),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          // Service worker, content scripts, and inspector need specific names
          if (
            chunkInfo.name === 'service-worker' ||
            chunkInfo.name === 'content-script' ||
            chunkInfo.name === 'inspector-main'
          ) {
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
