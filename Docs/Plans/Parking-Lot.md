# Parking Lot - Future Feature Ideas

**Date:** 2025-10-25
**Status:** Ideas for post-MVP consideration

---

## Features Deferred for Future Releases

### Dark Mode Support
**Description:** Automatically detect and match WhatsApp Web's dark mode theme.

**Current State:** MVP uses light mode only.

**Future Implementation:**
- Detect WhatsApp's theme setting (light/dark)
- Provide matching color schemes for sidebar
- Ensure all components work in both themes

**Priority:** Medium
**Effort:** Medium

---

### Sidebar Show/Hide Toggle
**Description:** Allow users to hide/show the sidebar with a toggle button or keyboard shortcut.

**Current State:** Sidebar is always visible in MVP.

**Future Implementation:**
- Toggle button (floating or in header)
- Keyboard shortcut (e.g., Ctrl+Shift+P)
- Remember user preference in chrome.storage
- Smooth slide-in/out animation

**Priority:** Medium
**Effort:** Low

---

### DOM-Based Contact Info Extraction
**Description:** Use DOM parsing as a fallback method for extracting contact phone numbers when module raid is unavailable or fails.

**Current State:** Implemented but disabled. Close button detection broken on WhatsApp v2.3000+.

**Benefits:**
- Extracts formatted phone numbers with spaces (e.g., `+34 679 29 72 97` instead of `+34679297297`)
- Provides fallback if WhatsApp changes internal module structure
- Can extract additional contact details visible in UI but not in modules

**Blockers:**
- Close button selector not working - contact info panel stays open after extraction
- Visual side effects - panel opens on screen, interrupting user
- WhatsApp console errors triggered by programmatic clicks (non-fatal but cosmetic)
- UI redesign fragility - WhatsApp v2.3000+ changed all icon names and selectors

**Investigation Needed:**
1. Find correct close button selector for WhatsApp v2.3000+
2. Investigate hidden iframe approach to eliminate visual side effects
3. Consider MutationObserver instead of setTimeout for better timing

**Documentation:** [WhatsApp-Contact-Extraction-DOM-Parsing.md](../Architecture/WhatsApp-Contact-Extraction-DOM-Parsing.md)

**Priority:** Low (Module raid works well for current needs)
**Effort:** Medium (Close button investigation + testing)

---

### Social Media Preview Images
**Description:** Create custom Open Graph and Twitter Card preview images for social media sharing.

**Current State:** Landing page SEO implementation references `/og-image.jpg` and `/twitter-image.jpg` but images don't exist yet.

**Future Implementation:**
- Design Open Graph image (1200x630px) with Chat2Deal branding
- Design Twitter Card image (1200x675px) with Chat2Deal branding
- Include key value proposition and visual brand elements
- Optimize for file size while maintaining quality
- Consider creating page-specific images (home, privacy, terms)

**Documentation:** [Landing-SEO-Architecture.md](../Architecture/Landing-SEO-Architecture.md)

**Priority:** Low (Meta tags work without images, just won't have rich previews)
**Effort:** Low (Design work, not technical)

---

## Notes

- Features in this parking lot are not committed for any specific release
- Prioritization will be based on user feedback and usage data
- Each feature should get its own spec document if/when approved for implementation
