/**
 * WhatsApp Inspector - Research Utility (Development Mode Only)
 *
 * This utility uses Webpack module interception to access WhatsApp Web's
 * internal state and extract chat information.
 *
 * Usage (in browser console after loading extension):
 *   __whatsappInspector.inspectAll()
 *   __whatsappInspector.getCurrentChat()
 *
 * Note: This file works with WhatsApp's undocumented internal APIs.
 * Some `any` types are unavoidable when working with reverse-engineered structures.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

// Logger not available in MAIN world - use console directly with inline isDevelopment check
const isDevelopment = import.meta.env.MODE === 'development'

// TypeScript declarations for WhatsApp's internal objects (reverse-engineered)
interface WhatsAppWindow extends Window {
  webpackChunkbuild?: unknown[]
  webpackChunkwhatsapp_web_client?: unknown[]
  require?: (module: string) => {
    modulesMap?: Map<string, WhatsAppModule>
  }
  __whatsappInspector?: WhatsAppInspector
  __debugDrawer?: {
    html: string
    text: string
    fullText: string
    selector: string
  }
}

declare const window: WhatsAppWindow

interface InspectionResult {
  method: string
  success: boolean
  jid: string | null
  contactName: string | null
  chatType: 'individual' | 'group' | 'unknown' | null
  error?: string
  details?: Record<string, unknown>
}

interface WhatsAppModule {
  defaultExport?: unknown
  [key: string]: unknown
}

interface ModuleRaid {
  mID: string
  mObj: Record<string, WhatsAppModule>
  findModule: (query: string | ((mod: WhatsAppModule) => boolean)) => WhatsAppModule[]
}

export class WhatsAppInspector {
  private results: InspectionResult[] = []
  private moduleRaid: ModuleRaid | null = null

  /**
   * Test all available methods and display results
   */
  public async inspectAll(): Promise<void> {
    if (isDevelopment) {
      console.log('='.repeat(80))
      console.log('WhatsApp Inspector - Testing Webpack Module Interception')
      console.log('='.repeat(80))
      console.log('')
    }

    this.results = []

    // Test methods in order of reliability
    this.testWebpackModuleRaid()

    // DOM Parsing disabled - not production-ready
    // See Docs/Architecture/WhatsApp-Contact-Extraction-DOM-Parsing.md for details
    // await this.testDOMParsing()

    // Display summary
    this.displaySummary()
  }

  /**
   * Method 1: Webpack Module Raid (Intercept Internal Modules)
   */
  private testWebpackModuleRaid(): void {
    if (isDevelopment) {
      console.log('📦 Method 1: Webpack Module Raid (Intercept Internal Modules)')
      console.log('-'.repeat(40))
    }

    try {
      // Check if webpack chunks exist
      const webpackChunk = window.webpackChunkbuild || window.webpackChunkwhatsapp_web_client

      if (!webpackChunk) {
        this.logResult({
          method: 'Webpack Module Raid',
          success: false,
          jid: null,
          contactName: null,
          chatType: null,
          error: 'Webpack chunk not found (webpackChunkwhatsapp_web_client)',
        })
        return
      }

      if (isDevelopment) {
        console.log('✓ Webpack chunk found')
      }

      // Initialize module raid if not already done
      if (!this.moduleRaid) {
        this.initializeModuleRaid(webpackChunk)
      }

      if (!this.moduleRaid) {
        this.logResult({
          method: 'Webpack Module Raid',
          success: false,
          jid: null,
          contactName: null,
          chatType: null,
          error: 'Failed to initialize module raid',
        })
        return
      }

      if (isDevelopment) {
        console.log('✓ Module raid initialized')
        console.log(`  Captured ${Object.keys(this.moduleRaid.mObj).length} modules`)
      }

      // Detect WhatsApp version (Comet vs Legacy)
      const version = win.Debug?.VERSION
      const isComet = version ? parseInt(version.split('.')?.[1]) >= 3000 : false

      if (isDevelopment) {
        console.log(`✓ WhatsApp version: ${version || 'unknown'} (${isComet ? 'Comet' : 'Legacy'})`)
      }

      // Find Chat module
      let ChatModule: any = null

      if (isComet) {
        // Modern Comet version (v3000+)
        const modules = this.moduleRaid.findModule((m: any) => m.Call && m.Chat)
        if (modules.length > 0) {
          ChatModule = modules[0]
        } else {
          // Fallback for some Comet versions
          const defaultModules = this.moduleRaid.findModule((m: any) => m.default && m.default.Chat)
          if (defaultModules.length > 0) {
            ChatModule = defaultModules[0].default
          }
        }
      } else {
        // Legacy version
        const modules = this.moduleRaid.findModule((m: any) => m.default && m.default.Chat)
        if (modules.length > 0) {
          ChatModule = modules[0].default
        }
      }

      if (!ChatModule || !ChatModule.Chat) {
        this.logResult({
          method: 'Webpack Module Raid',
          success: false,
          jid: null,
          contactName: null,
          chatType: null,
          error: 'Chat module not found in webpack modules',
        })
        return
      }

      if (isDevelopment) {
        console.log('✓ Chat module found')
      }

      // Get active chat
      const chats = ChatModule.Chat.getModelsArray ? ChatModule.Chat.getModelsArray() : []
      const activeChat = chats.find((chat: any) => chat.active === true)

      if (!activeChat) {
        this.logResult({
          method: 'Webpack Module Raid',
          success: false,
          jid: null,
          contactName: null,
          chatType: null,
          error: 'No active chat found (please open a chat)',
        })
        return
      }

      if (isDevelopment) {
        console.log('✓ Active chat found')
      }

      // Extract chat information using private properties
      const contact = activeChat.__x_contact || activeChat.contact
      const groupMetadata = activeChat.__x_groupMetadata || activeChat.groupMetadata

      const isGroup = !!groupMetadata
      const jid = contact?.__x_id?.user || contact?.id?.user

      // Try multiple name properties (order matters - pushname is often more reliable)
      const name =
        contact?.__x_pushname ||
        contact?.__x_name ||
        contact?.__x_formattedName ||
        contact?.pushname ||
        contact?.name ||
        contact?.formattedName

      if (!jid) {
        this.logResult({
          method: 'Webpack Module Raid',
          success: false,
          jid: null,
          contactName: null,
          chatType: null,
          error: 'Could not extract JID from active chat',
        })
        return
      }

      const formattedJid = jid.includes('@') ? jid : `${jid}@${isGroup ? 'g.us' : 'c.us'}`
      // Add '+' prefix for E.164 international format
      const phone = '+' + (jid.includes('@') ? jid.split('@')[0] : jid)

      if (isDevelopment) {
        console.log('✓ Chat data extracted:')
        console.log('  JID:', formattedJid)
        console.log('  Phone:', phone)
        console.log('  Name:', name || 'Unknown')
        console.log('  Type:', isGroup ? 'group' : 'individual')

        if (isGroup && groupMetadata?.participants) {
          const participants = Object.values(groupMetadata.participants._index || {})
          console.log(`  Participants: ${participants.length}`)
        }
      }

      this.logResult({
        method: 'Webpack Module Raid',
        success: true,
        jid: formattedJid,
        contactName: name || 'Unknown',
        chatType: isGroup ? 'group' : 'individual',
        details: {
          phone,
          isGroup,
          version,
          isComet,
          activeChat: {
            id: activeChat.id,
            name: activeChat.name,
            contact: contact
              ? {
                  id: contact.__x_id || contact.id,
                  name: contact.__x_name || contact.name,
                }
              : null,
          },
        },
      })
    } catch (error) {
      this.logResult({
        method: 'Webpack Module Raid',
        success: false,
        jid: null,
        contactName: null,
        chatType: null,
        error: error instanceof Error ? error.message : String(error),
      })
    }
    if (isDevelopment) {
      console.log('')
    }
  }

  /**
   * Initialize module raid by intercepting webpack chunks
   * Captures WhatsApp's internal modules for state inspection
   */
  private initializeModuleRaid(webpackChunk: any): void {
    const win = window as any

    try {
      this.moduleRaid = {
        mID: Math.random().toString(36).substring(7),
        mObj: {},
        moduleKeys: [] as string[],
        requireFn: null as any,
        findModule: function (query: string | ((mod: any) => boolean)) {
          const results: any[] = []

          // Helper to check if module key should be skipped
          const shouldSkip = (key: string) => {
            // Skip lazy loaders and placeholders
            if (
              key.startsWith('__requireLazy_') ||
              key.startsWith('__call_') ||
              key.startsWith('__requireModule_') ||
              key.startsWith('__requireWeak_') ||
              key.startsWith('__isRequired_')
            ) {
              return true
            }

            // Skip basic module system placeholders
            if (key === 'module' || key === 'exports') {
              return true
            }

            // Skip conditional requires (cr:XXXX)
            if (key.startsWith('cr:')) {
              return true
            }

            // Skip Config modules with unresolved dependencies
            if (
              key.includes('Config') &&
              (key.includes('Sitevar') ||
                key.includes('Responsiveness') ||
                key.includes('AnimationFrame'))
            ) {
              return true
            }

            // Skip React component modules that commonly have unresolved deps
            if (
              key.endsWith('.react') &&
              (key.includes('Comet') ||
                key.includes('CDS') ||
                key.includes('FDS') ||
                key.includes('Base'))
            ) {
              return true
            }

            // Skip React hooks with dependencies
            if (
              key.startsWith('use') &&
              (key.includes('Debug') || key.includes('Subscribed') || key.includes('Newsletter'))
            ) {
              return true
            }

            // Skip Performance and Observer modules
            if (
              key.includes('Performance') ||
              key.includes('Observer') ||
              key.includes('WebVitals')
            ) {
              return true
            }

            // Skip specific known problematic modules
            const problematicModules = [
              'LongAnimationFrameConfig',
              'WebResponsivenessConfig',
              'CDSThemeV1.react',
              'BaseCometModal.react',
              'CometMaxEnqueuedToastsSitevarConfigJSModuleWrapper',
              'FDSTextImpl.react',
              'useWAWebSubscribedNewsletters',
              'useWAWebDebugCommandValues',
              'WAWebDebugCommandCollection',
            ]

            return problematicModules.includes(key)
          }

          // For Comet: use lazy loading approach
          const keysToSearch =
            this.moduleKeys && this.moduleKeys.length > 0 ? this.moduleKeys : Object.keys(this.mObj)

          keysToSearch.forEach((mKey) => {
            // Skip problematic modules
            if (shouldSkip(mKey)) return

            // Try to get from cache first
            let mod = this.mObj[mKey]

            // If not cached and we have requireFn, load it lazily
            if (!mod && this.requireFn) {
              try {
                mod = this.requireFn(mKey)
                if (mod) {
                  this.mObj[mKey] = mod // Cache it
                }
              } catch (e) {
                // Skip modules that fail to load
                return
              }
            }

            if (!mod) return

            // Search the module
            if (typeof query === 'string') {
              // Search by property name
              if (mod.default && mod.default[query]) results.push(mod)
              if (mod[query]) results.push(mod)
            } else {
              // Search by predicate function
              try {
                if (query(mod)) results.push(mod)
              } catch (e) {
                // Ignore errors when testing modules
              }
            }
          })

          return results
        },
      }

      // Check WhatsApp version for Comet detection
      const version = win.Debug?.VERSION
      const isComet = version ? parseInt(version.split('.')?.[1]) >= 3000 : false

      if (isDevelopment) {
        console.log(`[Module Raid] WhatsApp version: ${version}, isComet: ${isComet}`)
      }

      if (isComet) {
        // Comet version (2.3000+): Use require('__debug').modulesMap
        if (isDevelopment) {
          console.log('[Module Raid] Using Comet module loading method')
        }

        if (typeof win.require === 'function') {
          try {
            const debugModule = win.require('__debug')
            if (debugModule && debugModule.modulesMap) {
              const moduleKeys = Object.keys(debugModule.modulesMap)
              if (isDevelopment) {
                console.log(`[Module Raid] Found ${moduleKeys.length} module keys`)
              }

              // Store module keys and require function for lazy loading
              // We DON'T call require() on all modules upfront - that causes errors
              // Instead, we load modules on-demand in findModule()
              this.moduleRaid.moduleKeys = moduleKeys
              this.moduleRaid.requireFn = win.require

              if (isDevelopment) {
                console.log(`✓ Module raid ready (lazy loading mode)`)
              }
            } else {
              if (isDevelopment) {
                console.warn('[Module Raid] __debug.modulesMap not found')
              }
            }
          } catch (error) {
            if (isDevelopment) {
              console.error('[Module Raid] Comet module loading failed:', error)
            }
          }
        } else {
          if (isDevelopment) {
            console.warn('[Module Raid] window.require function not available')
          }
        }
      } else {
        // Legacy version: Use webpack chunk push method
        if (isDevelopment) {
          console.log('[Module Raid] Using Legacy webpack push method')
        }

        webpackChunk.push([
          [this.moduleRaid.mID],
          {},
          (e: any) => {
            Object.keys(e.m).forEach((mod) => {
              try {
                this.moduleRaid!.mObj[mod] = e(mod)
              } catch (error) {
                // Some modules may fail to load, that's okay
              }
            })
          },
        ])

        if (isDevelopment) {
          console.log('✓ Webpack interceptor injected')
        }
      }
    } catch (error) {
      if (isDevelopment) {
        console.error('✗ Failed to initialize module raid:', error)
      }
      this.moduleRaid = null
    }
  }

  /**
   * PUBLIC: Initialize module raid early (called on page load)
   * This must be called ASAP to capture modules as they load
   */
  public initializeModuleRaidEarly(): void {
    const win = window as any
    const webpackChunk = win.webpackChunkbuild || win.webpackChunkwhatsapp_web_client

    if (webpackChunk && !this.moduleRaid) {
      if (isDevelopment) {
        console.log('[Module Raid] Initializing module raid...')
      }
      this.initializeModuleRaid(webpackChunk)
      if (isDevelopment) {
        console.log(
          `[Module Raid] Captured ${Object.keys(this.moduleRaid?.mObj || {}).length} modules`
        )
      }
    }
  }

  /**
   * Method 2: DOM parsing (fallback for contact name)
   */
  /**
   * Recursively search for phone number in DOM
   */
  private findElementWithPhoneNumber(rootElement: Element): string | null {
    // International phone number regex pattern
    const phoneRegex = /\+\d{1,3}[-\s]?\(?\d{1,3}\)?[-\s]?\d{1,4}[-\s]?\d{1,4}[-\s]?\d{1,9}/

    let elementsChecked = 0
    const textSamples: string[] = []

    const searchElement = (element: Element, depth = 0): string | null => {
      elementsChecked++

      // Collect text samples for debugging (first 5 elements with content)
      if (textSamples.length < 5 && element.textContent && element.textContent.trim().length > 0) {
        const sample = element.textContent.trim().substring(0, 50)
        if (sample && !textSamples.includes(sample)) {
          textSamples.push(sample)
        }
      }

      // Check current element's text content
      if (element.textContent && phoneRegex.test(element.textContent)) {
        const match = element.textContent.match(phoneRegex)
        if (match) {
          if (isDevelopment) {
            console.log(
              `  [Debug] Phone found at depth ${depth}, checked ${elementsChecked} elements`
            )
          }
          return match[0]
        }
      }

      // Recursively search children
      for (const child of element.children) {
        const result = searchElement(child, depth + 1)
        if (result) return result
      }

      return null
    }

    const result = searchElement(rootElement)

    // Log search summary
    if (isDevelopment) {
      console.log(`  [Debug] Searched ${elementsChecked} elements`)
      if (textSamples.length > 0) {
        console.log('  [Debug] Text samples found:')
        textSamples.forEach((sample, i) => {
          console.log(`    ${i + 1}. "${sample}${sample.length >= 50 ? '...' : ''}"`)
        })
      } else {
        console.log('  [Debug] No text content found in section')
      }
    }

    return result
  }

  private async testDOMParsing(): Promise<void> {
    if (isDevelopment) {
      console.log('🌳 Method 2: DOM Parsing (Fallback)')
      console.log('-'.repeat(40))
    }

    try {
      // Try to find chat header in main panel
      const headerElement = document.querySelector('#main header')

      if (!headerElement) {
        this.logResult({
          method: 'DOM Parsing',
          success: false,
          jid: null,
          contactName: null,
          chatType: null,
          error: 'Chat header not found (selector: #main header)',
        })
        return
      }

      if (isDevelopment) {
        console.log('✓ Chat header found')
      }

      // Extract contact name from header
      const nameSpan = headerElement.querySelector('span[dir="auto"]')
      let contactName: string | null = null

      if (nameSpan?.textContent) {
        contactName = nameSpan.textContent.trim()
      }

      // Fallback: span[title]
      if (!contactName) {
        const titleSpan = headerElement.querySelector('span[title]')
        contactName = titleSpan?.getAttribute('title') || null
      }

      if (isDevelopment) {
        console.log('  Contact name:', contactName || 'Not found')
      }

      // Extract phone number by opening contact info panel
      let phone: string | null = null
      let isGroup = false

      // Step 1: Click header button to open contact info
      const headerButton = document.querySelector('#main header div[role=button]') as HTMLElement
      if (headerButton) {
        // Small delay before click to let React settle (reduces WhatsApp internal errors)
        await new Promise((resolve) => setTimeout(resolve, 100))

        headerButton.click()
        if (isDevelopment) {
          console.log('  → Clicked header to open contact info panel')
        }

        // Note: WhatsApp may log a non-fatal React i18n error about "Block {contact_name}"
        // This is a WhatsApp internal issue with programmatic clicks and is automatically suppressed

        // Wait for React to render the contact info panel
        await new Promise((resolve) => setTimeout(resolve, 900))

        // Check if any panel/drawer opened
        const drawerElement =
          document.querySelector('[data-animate-drawer-right]') ||
          document.querySelector('[data-animate-drawer]') ||
          document.querySelector('div[role="dialog"]')
        if (isDevelopment) {
          console.log('  [Debug] Drawer/Panel element:', drawerElement ? 'Found' : 'Not found')
        }

        // Expose drawer content to global for debugging (bypasses console flooding)
        if (drawerElement) {
          const drawerText = drawerElement.textContent || ''
          ;(window as any).__debugDrawer = {
            html: drawerElement.outerHTML.substring(0, 2000),
            text: drawerText.substring(0, 500),
            fullText: drawerText,
            selector: drawerElement.getAttribute('data-animate-drawer-right')
              ? 'data-animate-drawer-right'
              : drawerElement.getAttribute('data-animate-drawer')
                ? 'data-animate-drawer'
                : 'role=dialog',
          }
          if (isDevelopment) {
            console.log('  [Debug] Drawer content exposed to window.__debugDrawer')
            console.log('  [Debug] Drawer text preview:', drawerText.substring(0, 100))
          }

          // Validate this is the contact info drawer (not image viewer or other panel)
          const isContactInfo =
            drawerText.toLowerCase().includes('contact info') ||
            drawerText.toLowerCase().includes('phone') ||
            drawerText.toLowerCase().includes('about') ||
            (contactName && drawerText.includes(contactName))

          const isImageViewer =
            drawerText.includes('ic-download') || drawerText.toLowerCase().includes('image')

          if (isDevelopment) {
            console.log('  [Debug] Drawer validation:')
            console.log(`    - Is Contact Info: ${isContactInfo}`)
            console.log(`    - Is Image Viewer: ${isImageViewer}`)
          }

          if (isImageViewer && !isContactInfo) {
            if (isDevelopment) {
              console.log(
                '  [Warning] Wrong drawer detected (image viewer), closing and retrying...'
              )
            }
            // Close wrong drawer
            const closeBtn =
              (drawerElement.querySelector('span[data-icon="x"]') as HTMLElement) ||
              (drawerElement.querySelector('span[data-icon="x-refreshed"]') as HTMLElement)
            if (closeBtn) {
              closeBtn.click()
              await new Promise((resolve) => setTimeout(resolve, 300))

              // Try clicking header again
              headerButton.click()
              await new Promise((resolve) => setTimeout(resolve, 900))
            }
          }
        }

        // Re-query drawer after potential retry
        const currentDrawer =
          document.querySelector('[data-animate-drawer-right]') ||
          document.querySelector('[data-animate-drawer]') ||
          document.querySelector('div[role="dialog"]')

        // Step 2: Search for phone number
        // WhatsApp v2.3000+ redesigned UI - Try multiple approaches

        // First: Try searching within drawer element if found
        if (currentDrawer) {
          if (isDevelopment) {
            console.log('  [1] Searching for phone within drawer element')
          }
          phone = this.findElementWithPhoneNumber(currentDrawer)
        }

        // Second: If not found in drawer, search entire document
        if (!phone) {
          if (isDevelopment) {
            console.log('  [2] Searching for phone in entire document')
          }
          phone = this.findElementWithPhoneNumber(document)
        }

        if (phone) {
          if (isDevelopment) {
            console.log('  ✓ Phone found:', phone)
            console.log('  Type: individual')
          }
          isGroup = false
        } else {
          if (isDevelopment) {
            console.log('  ✗ Phone: Not found')
            console.log('  [Debug] This may be a group chat, or phone is not visible in UI')
          }

          // Check if group indicators exist
          const bodyText = document.body.textContent?.toLowerCase() || ''
          if (bodyText.includes('group info') || bodyText.includes('participants')) {
            if (isDevelopment) {
              console.log('  Type: Likely a group chat')
            }
            isGroup = true
          }
        }

        // Step 3: Close panel after extraction
        // Search for close button within the drawer (more targeted)
        let closeButton: HTMLElement | null = null

        if (currentDrawer) {
          // Try multiple selectors for close button (WhatsApp v2.3000+ uses various naming)
          closeButton =
            (currentDrawer.querySelector('span[data-icon="x"]') as HTMLElement) ||
            (currentDrawer.querySelector('span[data-icon="x-refreshed"]') as HTMLElement) ||
            (currentDrawer.querySelector('span[data-icon="x-viewer"]') as HTMLElement) ||
            (currentDrawer.querySelector('span[data-icon="close"]') as HTMLElement) ||
            (currentDrawer.querySelector('[aria-label="Close"]') as HTMLElement) ||
            (currentDrawer.querySelector('button[aria-label*="Close"]') as HTMLElement) ||
            (currentDrawer.querySelector('div[role="button"][aria-label*="Close"]') as HTMLElement)
        }

        // Fallback: search entire document
        if (!closeButton) {
          closeButton =
            (document.querySelector('span[data-icon="x"]') as HTMLElement) ||
            (document.querySelector('span[data-icon="x-refreshed"]') as HTMLElement) ||
            (document.querySelector('span[data-icon="x-viewer"]') as HTMLElement)
        }

        if (closeButton) {
          // Find the clickable parent (icon is often inside a button)
          const clickableButton =
            closeButton.closest('button') ||
            closeButton.closest('div[role="button"]') ||
            closeButton

          if (clickableButton) {
            ;(clickableButton as HTMLElement).click()
            if (isDevelopment) {
              console.log('  → Closed contact info panel')
            }
          }
        } else {
          if (isDevelopment) {
            console.log('  [Debug] Close button not found, panel may stay open')
            // Log available icons for debugging
            if (currentDrawer) {
              const icons = Array.from(currentDrawer.querySelectorAll('span[data-icon]'))
              const iconNames = icons.map((el) => el.getAttribute('data-icon')).filter(Boolean)
              if (iconNames.length > 0) {
                console.log(
                  '  [Debug] Available icons in drawer:',
                  iconNames.slice(0, 5).join(', ')
                )
              }
            }
          }
        }
      } else {
        if (isDevelopment) {
          console.log('  Phone: Header button not found')
        }
      }

      this.logResult({
        method: 'DOM Parsing',
        success: contactName !== null,
        jid: phone ? `${phone.replace(/[^\d]/g, '')}@c.us` : null,
        contactName,
        chatType: isGroup ? 'group' : 'individual',
        details: { phone },
        error: contactName ? undefined : 'Contact name not found in DOM',
      })
    } catch (error) {
      this.logResult({
        method: 'DOM Parsing',
        success: false,
        jid: null,
        contactName: null,
        chatType: null,
        error: error instanceof Error ? error.message : String(error),
      })
    }
    if (isDevelopment) {
      console.log('')
    }
  }

  /**
   * Get current chat using the best available method
   */
  public getCurrentChat(): any {
    if (isDevelopment) {
      console.log('🔍 Attempting to get current chat...')
    }

    try {
      const win = window as any
      const webpackChunk = win.webpackChunkbuild || win.webpackChunkwhatsapp_web_client

      if (!webpackChunk) {
        if (isDevelopment) {
          console.log('✗ Webpack chunks not available')
        }
        return null
      }

      // Initialize module raid if needed
      if (!this.moduleRaid) {
        this.initializeModuleRaid(webpackChunk)
      }

      if (!this.moduleRaid) {
        if (isDevelopment) {
          console.log('✗ Module raid failed to initialize')
        }
        return null
      }

      // Detect version
      const isComet = parseInt(win.Debug?.VERSION?.split('.')?.[1]) >= 3000

      // Find Chat module
      let ChatModule: any = null
      if (isComet) {
        const modules = this.moduleRaid.findModule((m: any) => m.Call && m.Chat)
        ChatModule = modules.length > 0 ? modules[0] : null
        if (!ChatModule) {
          const defaultModules = this.moduleRaid.findModule((m: any) => m.default && m.default.Chat)
          ChatModule = defaultModules.length > 0 ? defaultModules[0].default : null
        }
      } else {
        const modules = this.moduleRaid.findModule((m: any) => m.default && m.default.Chat)
        ChatModule = modules.length > 0 ? modules[0].default : null
      }

      if (!ChatModule?.Chat) {
        if (isDevelopment) {
          console.log('✗ Chat module not found')
        }
        return null
      }

      // Get active chat
      const chats = ChatModule.Chat.getModelsArray()
      const activeChat = chats.find((chat: any) => chat.active === true)

      if (!activeChat) {
        if (isDevelopment) {
          console.log('✗ No active chat found')
        }
        return null
      }

      if (isDevelopment) {
        console.log('✓ Chat retrieved:', activeChat)
      }
      return activeChat
    } catch (error) {
      if (isDevelopment) {
        console.log('✗ Error getting current chat:', error)
      }
      return null
    }
  }

  /**
   * Log a result
   */
  private logResult(result: InspectionResult): void {
    this.results.push(result)

    if (isDevelopment) {
      if (result.success) {
        console.log('✅ SUCCESS')
      } else {
        console.log('❌ FAILED:', result.error)
      }
    }
  }

  /**
   * Display summary of all results
   */
  private displaySummary(): void {
    if (isDevelopment) {
      console.log('='.repeat(80))
      console.log('Summary')
      console.log('='.repeat(80))
      console.log('')

      const successful = this.results.filter((r) => r.success)
      const failed = this.results.filter((r) => !r.success)

      console.log('Results:')
      this.results.forEach((result) => {
        const status = result.success ? '✅' : '❌'
        console.log(`  ${status} ${result.method}`)
        if (result.success) {
          if (result.jid) {
            console.log(`      JID: ${result.jid}`)
          }
          if (result.contactName) {
            console.log(`      Name: ${result.contactName}`)
          }
          if (result.details?.phone) {
            console.log(`      Phone: ${result.details.phone}`)
          }
          if (result.chatType) {
            console.log(`      Type: ${result.chatType}`)
          }
        }
      })
      console.log('')

      if (successful.length > 0) {
        console.log('✅ Recommended approach:')
        console.log(`   Primary: ${successful[0].method}`)
        if (successful.length > 1) {
          console.log(
            `   Fallback: ${successful
              .slice(1)
              .map((r) => r.method)
              .join(', ')}`
          )
        }
      } else {
        console.log('⚠️  No working methods found!')
        console.log('   Please ensure:')
        console.log('   1. You are on web.whatsapp.com')
        console.log('   2. WhatsApp is fully loaded')
        console.log('   3. You have a chat open')
      }
      console.log('')
      console.log('='.repeat(80))
    }
  }

  /**
   * Get all results
   */
  public getResults(): InspectionResult[] {
    return this.results
  }
}

// Export singleton instance for development mode
export const whatsappInspector = new WhatsAppInspector()
