/**
 * WhatsApp Store Accessor
 *
 * Exposes WhatsApp's internal Store on window.StoreWhatsApp2Pipe
 * This allows the extension to access chat data reliably.
 *
 * Note: Must be run in MAIN world to access WhatsApp's globals.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import type { WhatsAppStore } from './types'
// Logger not available in MAIN world - use console directly with inline isDevelopment check

const isDevelopment = import.meta.env.MODE === 'development'

/**
 * Initialize WhatsApp Store access
 *
 * Attempts to find and expose WhatsApp's internal Store object.
 * This function should be called once when the extension initializes.
 *
 * @returns true if Store was found and exposed, false otherwise
 */
export function initializeStoreAccess(): boolean {
  try {
    // Check if Store is already exposed
    if (window.StoreWhatsApp2Pipe) {
      if (isDevelopment) {
        console.log('[Store Accessor] Store already exposed')
      }
      return true
    }

    // Try to find Store via webpack require (Comet v2.3000+)
    const store = findStoreViaRequire()
    if (store) {
      window.StoreWhatsApp2Pipe = store as WhatsAppStore
      if (isDevelopment) {
        console.log('[Store Accessor] Store exposed via require()')
      }
      return true
    }

    // Try to find Store via webpack chunks (legacy)
    const storeLegacy = findStoreViaWebpack()
    if (storeLegacy) {
      window.StoreWhatsApp2Pipe = storeLegacy as WhatsAppStore
      if (isDevelopment) {
        console.log('[Store Accessor] Store exposed via webpack chunks')
      }
      return true
    }

    if (isDevelopment) {
      console.warn('[Store Accessor] Could not find WhatsApp Store')
    }
    return false
  } catch (error) {
    if (isDevelopment) {
      console.error('[Store Accessor] Error initializing Store access:', error)
    }
    return false
  }
}

/**
 * Find Store via require() for Comet architecture (v2.3000+)
 */
function findStoreViaRequire(): any {
  try {
    // Access WhatsApp's require function
    const debugModule = (window as any).require?.('__debug')
    if (!debugModule?.modulesMap) {
      return null
    }

    // Search for Store module in modulesMap
    const moduleKeys = Object.keys(debugModule.modulesMap)

    for (const key of moduleKeys) {
      const module = debugModule.modulesMap[key]
      const moduleExports = module?.defaultExport

      // Look for Chat store with getModelsArray method
      if (moduleExports?.Chat?.getModelsArray) {
        if (isDevelopment) {
          console.log('[Store Accessor] Found Store via require() in module:', key)
        }
        return moduleExports
      }
    }

    return null
  } catch (error) {
    if (isDevelopment) {
      console.error('[Store Accessor] Error in findStoreViaRequire:', error)
    }
    return null
  }
}

/**
 * Find Store via webpack chunks (legacy WhatsApp versions)
 */
function findStoreViaWebpack(): any {
  try {
    const webpackChunk =
      (window as any).webpackChunkbuild || (window as any).webpackChunkwhatsapp_web_client

    if (!webpackChunk) {
      return null
    }

    // Intercept webpack chunk pushes to find Store
    let foundStore: any = null

    const originalPush = webpackChunk.push
    webpackChunk.push = function (...args: [any]) {
      if (!foundStore) {
        const modules = args[0]?.[1]
        if (modules) {
          Object.values(modules).forEach((module: any) => {
            try {
              const temp: any = {}
              module(temp, {}, (e: string) => temp[e])

              if (temp?.d?.Chat?.getModelsArray) {
                foundStore = temp.d
              }
            } catch {
              // Ignore module evaluation errors
            }
          })
        }
      }
      return originalPush.apply(this, args)
    }

    // Trigger module loading by accessing a common module
    try {
      ;(window as any).require?.('WAWebWidBase')
    } catch {
      // Module may not exist, that's okay
    }

    // Restore original push
    webpackChunk.push = originalPush

    return foundStore
  } catch (error) {
    console.error('[Store Accessor] Error in findStoreViaWebpack:', error)
    return null
  }
}

/**
 * Check if Store is currently accessible
 */
export function isStoreAvailable(): boolean {
  return !!window.StoreWhatsApp2Pipe
}

/**
 * Get the WhatsApp Store (if available)
 *
 * Note: This function can be called from ISOLATED world (content scripts)
 * It accesses window.require directly which is available across worlds
 */
export function getStore(): WhatsAppStore | null {
  // Try cached Store first (MAIN world only)
  if (window.StoreWhatsApp2Pipe) {
    if (isDevelopment) {
      console.log('[Store Accessor] Returning cached Store from window.StoreWhatsApp2Pipe')
    }
    return window.StoreWhatsApp2Pipe
  }

  if (isDevelopment) {
    console.log(
      '[Store Accessor] window.StoreWhatsApp2Pipe not available, trying direct require access'
    )
  }

  // Direct access via require (works from ISOLATED world)
  try {
    const windowRequire = (window as any).require
    if (isDevelopment) {
      console.log('[Store Accessor] window.require available?', !!windowRequire)
    }

    if (!windowRequire) {
      if (isDevelopment) {
        console.log('[Store Accessor] window.require is not available')
      }
      return null
    }

    const debugModule = windowRequire('__debug')
    if (isDevelopment) {
      console.log('[Store Accessor] __debug module loaded?', !!debugModule)
      console.log('[Store Accessor] __debug.modulesMap available?', !!debugModule?.modulesMap)
    }

    if (!debugModule?.modulesMap) {
      if (isDevelopment) {
        console.log('[Store Accessor] __debug.modulesMap not available')
      }
      return null
    }

    // Search for Store module
    const moduleKeys = Object.keys(debugModule.modulesMap)
    if (isDevelopment) {
      console.log('[Store Accessor] Searching', moduleKeys.length, 'modules for Store')
    }

    for (const key of moduleKeys) {
      const module = debugModule.modulesMap[key]
      const moduleExports = module?.defaultExport

      // Look for Chat store with getModelsArray method
      if (moduleExports?.Chat?.getModelsArray) {
        if (isDevelopment) {
          console.log('[Store Accessor] Found Store in module:', key)
        }
        return moduleExports as WhatsAppStore
      }
    }

    if (isDevelopment) {
      console.log('[Store Accessor] Store not found in any module')
    }
    return null
  } catch (error) {
    if (isDevelopment) {
      console.error('[Store Accessor] Error accessing Store:', error)
    }
    return null
  }
}
