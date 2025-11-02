# Spec-118: Module Raid Loading Overlay

**Feature:** Feature 18 - Module Raid Loading Overlay
**Date:** 2025-11-02
**Status:** ✅ Complete
**Implementation:** Extension/src/content-script/inspector-main.ts (lines 20-142)
**Dependencies:** Spec-103 (WhatsApp Sidebar Injection), Spec-112 (Error Handling)

**Implementation Notes:**
- Full-height overlay (350px × 100vh) covering sidebar area
- Conditional display triggered when `#pipedrive-whatsapp-sidebar` container exists
- 300ms dwell time on success, 1000ms on timeout for better visibility
- Sentry error reporting via custom events implemented (`whatsapp-module-raid-error`)
- Test hooks exposed via `window.__overlayTest` for unit/integration testing

---

## 1. Overview

When the Chat2Deal extension loads on `web.whatsapp.com`, it performs critical initialization in the MAIN world script (`inspector-main.ts`) including webpack chunk detection, module raiding, and chat monitoring setup. This process is currently invisible to users, providing no feedback during initialization or failure states.

This specification adds a **full-height loading overlay** that provides visual feedback during the module raid initialization phase, covering the entire sidebar area with a centered spinner and loading message.

### 1.1 Scope

**In Scope:**
- Full-height loading overlay displayed during Phase 1 initialization (module raid)
- Overlay covers entire sidebar area (350px × 100vh) with centered spinner and message
- Conditional display - only appears when WhatsApp UI is ready
- Timed removal when module raid completes (300ms delay on success, 1000ms on timeout)
- Silent degradation - sidebar loads normally even if module raid fails
- Plain HTML/CSS implementation (no React dependencies)

**Out of Scope:**
- Loading indicators for Phase 2 initialization (sidebar mounting)
- Loading states for API calls or data fetching
- Retry mechanism in the overlay UI
- DOM-based contact detection fallback (separate future spec)
- User notifications for module raid failures (errors logged to console only)
- Error reporting to Sentry via custom events (deferred to future iteration)

### 1.2 Background: Two-Phase Initialization

**Phase 1 - MAIN World (inspector-main.ts):**
- Runs at `document_start` with `"world": "MAIN"`
- Polls for webpack chunks (~50ms intervals, 5 second timeout)
- Intercepts WhatsApp's internal modules (module raid)
- Initializes chat monitoring
- **This phase displays the loading overlay**

**Phase 2 - ISOLATED World (index.tsx):**
- Runs at `document_idle`
- Waits for WhatsApp DOM to be ready
- Injects sidebar container
- Mounts React application
- **No loading indicator in this spec**

---

## 2. Objectives

- **Provide initialization feedback** - Users see visual confirmation that the extension is loading
- **Prevent early interaction** - Full-height overlay prevents clicks on incomplete sidebar area
- **Maintain simplicity** - Overlay appears and disappears automatically with appropriate timing
- **Graceful degradation** - Extension works in degraded mode if module raid fails
- **Future-proof** - DOM-based contact detection will provide fallback (separate spec)

---

## 3. Visual Design Specification

### 3.1 Overlay Structure

**HTML Structure:**
```html
<div id="chat2deal-loading-overlay">
  <div class="chat2deal-spinner"></div>
  <span class="chat2deal-loading-text">Initializing Chat2Deal...</span>
</div>
```

### 3.2 Dimensions and Layout

**Container:**
- Width: `350px` (same width as sidebar)
- Height: `100vh` (full viewport height)
- Position: `fixed`
- Top: `0`
- Right: `0`
- Z-index: `10000000` (above everything to prevent interaction during load)
- Background: `#f0f2f5` (WhatsApp light gray)

**Content Layout:**
- Display: `flex`
- Flex direction: `column` (vertical stack)
- Align items: `center`
- Justify content: `center`
- Gap: `16px` (between spinner and text)

### 3.3 Colors and Typography

**Colors:**
- Background: `#f0f2f5` (WhatsApp light gray - same as chat background)
- Text color: `#54656f` (WhatsApp secondary text color)
- Spinner color: `#00a884` (WhatsApp primary green)
- Spinner track: `rgba(0, 0, 0, 0.1)` (semi-transparent black)

**Typography:**
- Font family: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
- Font size: `16px`
- Font weight: `400` (normal)
- Text content: `"Initializing Chat2Deal..."`

### 3.4 Components

**Spinner:**
- Size: `48px × 48px` (large and easily visible)
- Border width: `4px`
- Border style: `solid`
- Border colors: `4px solid rgba(0, 0, 0, 0.1)` with top border `#00a884`
- Border radius: `50%`
- Animation: Continuous rotation, 0.8s linear infinite

**Text Label:**
- Content: `"Initializing Chat2Deal..."`
- Color: `#54656f` (WhatsApp secondary text)
- Font size: `16px`
- Text align: `center`

### 3.5 CSS Animation

```css
@keyframes chat2deal-spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.chat2deal-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-top-color: #00a884;
  border-radius: 50%;
  animation: chat2deal-spin 0.8s linear infinite;
}
```

### 3.6 Timing and Transitions

**Appearance:**
- Appears only when WhatsApp UI is ready (chat list + search box present)
- No fade-in animation (instant display)
- Conditional injection prevents flash on early page load

**Removal:**
- Removes with 300ms delay when module raid succeeds
- Removes with 1000ms delay on timeout/failure
- No fade-out animation (instant removal after delay)
- Typical display duration: 300ms-1000ms depending on initialization success

---

## 4. Technical Implementation

### 4.1 File Changes

**Modified File:**
- `Extension/src/content-script/inspector-main.ts`

**Dependencies:**
- No new files required
- Uses existing Chrome extension APIs
- Inline styles (no external CSS)
- No React dependencies

### 4.2 Implementation Functions

**Function 1: Wait for WhatsApp UI Ready**
```typescript
function waitForWhatsAppUI(): Promise<void> {
  return new Promise((resolve) => {
    const checkUI = () => {
      const chatList = document.querySelector('div[role="grid"]');
      const searchBox = document.querySelector('div[role="textbox"]');

      if (chatList && searchBox) {
        resolve();
      } else {
        setTimeout(checkUI, 100);
      }
    };
    checkUI();
  });
}
```

**Purpose:** Ensures WhatsApp UI is ready before injecting overlay (prevents flash on early page load)

**Performance:** Typically resolves in 100-500ms

**Function 2: Create Loading Overlay**
```typescript
function createLoadingOverlay(): HTMLElement {
  const overlay = document.createElement('div');
  overlay.id = 'chat2deal-loading-overlay';

  // Inline styles for full-height overlay
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    right: 0;
    width: 350px;
    height: 100vh;
    background: #f0f2f5;
    z-index: 10000000;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  `;

  // Spinner
  const spinner = document.createElement('div');
  spinner.className = 'chat2deal-spinner';
  spinner.style.cssText = `
    width: 48px;
    height: 48px;
    border: 4px solid rgba(0, 0, 0, 0.1);
    border-top-color: #00a884;
    border-radius: 50%;
    animation: chat2deal-spin 0.8s linear infinite;
  `;

  // Text label
  const text = document.createElement('span');
  text.className = 'chat2deal-loading-text';
  text.textContent = 'Initializing Chat2Deal...';
  text.style.cssText = `
    color: #54656f;
    font-size: 16px;
    font-weight: 400;
    margin-top: 16px;
    text-align: center;
  `;

  // Assemble
  overlay.appendChild(spinner);
  overlay.appendChild(text);

  // Add animation keyframes (inject into document)
  if (!document.getElementById('chat2deal-spin')) {
    const style = document.createElement('style');
    style.id = 'chat2deal-spin';
    style.textContent = `
      @keyframes chat2deal-spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }

  return overlay;
}
```

**Function 3: Remove Loading Overlay**
```typescript
function removeLoadingOverlay(): void {
  const overlay = document.getElementById('chat2deal-loading-overlay');
  if (overlay) {
    overlay.remove();
  }

  // Also remove style tag (cleanup)
  const styles = document.getElementById('chat2deal-spin');
  if (styles) {
    styles.remove();
  }
}
```

### 4.3 Integration with Module Raid Initialization

**Modified Flow in inspector-main.ts:**

```typescript
// Existing code structure (simplified)
async function initializeModuleRaid() {
  try {
    // NEW: Wait for WhatsApp UI to be ready
    await waitForWhatsAppUI();

    // NEW: Show loading overlay
    const overlay = createLoadingOverlay();
    document.body.appendChild(overlay);

    console.log('[Inspector] Starting webpack chunk detection...');

    // EXISTING: Webpack detection with 5-second timeout
    await detectWebpackChunks(); // Polls every 50ms

    console.log('[Inspector] Webpack chunks detected, initializing module raid...');

    // EXISTING: Module raid initialization
    await initializeModuleRaid();

    console.log('[Inspector] Module raid complete, setting up chat monitoring...');

    // EXISTING: Chat monitoring setup
    await setupChatMonitoring();

    console.log('[Inspector] Initialization complete');

    // NEW: Remove overlay after 300ms delay (ensures visibility)
    setTimeout(() => {
      removeLoadingOverlay();
    }, 300);

  } catch (error) {
    console.error('[Inspector] Initialization failed:', error);

    // NEW: Remove overlay after 1000ms delay (longer visibility on failure)
    setTimeout(() => {
      removeLoadingOverlay();
    }, 1000);

    // Extension continues in degraded mode (no chat monitoring)
    // Note: Error reporting to Sentry deferred to future iteration
  }
}
```

---

## 5. Error Handling

### 5.1 Error Scenarios

The module raid can fail in several ways:

1. **Webpack chunk timeout** - Webpack not detected within 5 seconds (most common)
2. **Module raid error** - Webpack detected but module interception fails
3. **Store accessor error** - Modules raided but Store access fails
4. **Chat monitoring error** - Store accessed but chat monitoring setup fails

### 5.2 Error Handling (Current Implementation)

**Current Behavior:**
- Errors are logged to console only
- No custom events dispatched to ISOLATED world
- No automatic Sentry reporting
- Overlay removed after 1000ms delay on any error

**Future Enhancement:**
- Sentry error reporting via custom events (deferred to future iteration)
- Structured error context with phase, timeout duration, and diagnostic data
- Integration with existing `logError()` utility from Spec-112

### 5.3 Degraded Mode Behavior

When module raid fails:

1. **Overlay removed** - After 1000ms delay, no persistent error UI
2. **Error logged to console** - For debugging purposes
3. **Sidebar loads normally** - React app mounts, shows welcome state
4. **Chat monitoring inactive** - No `whatsapp-chat-status` events dispatched
5. **User experience** - User sees "Select a chat to get started" indefinitely
6. **Future enhancement** - DOM-based contact detection (separate spec)

**No blocking behavior** - Extension remains functional for other features (manual contact creation, search, etc.)

---

## 6. Testing Strategy

### 6.1 Unit Tests

**Test File:** `Extension/tests/unit/inspector-overlay.test.ts` (not yet implemented)

**Test Cases:**

```typescript
describe('Loading Overlay Functions', () => {
  describe('waitForWhatsAppUI', () => {
    it('resolves immediately if WhatsApp UI exists', async () => {
      // Mock WhatsApp UI elements
      document.body.innerHTML = `
        <div role="grid"></div>
        <div role="textbox"></div>
      `;

      const result = await waitForWhatsAppUI();
      expect(result).toBeUndefined();
    });

    it('waits for WhatsApp UI to be created', async () => {
      // Start with empty DOM
      document.body.innerHTML = '';

      const promise = waitForWhatsAppUI();

      // Simulate WhatsApp UI creation after delay
      setTimeout(() => {
        document.body.innerHTML = `
          <div role="grid"></div>
          <div role="textbox"></div>
        `;
      }, 200);

      await promise;
    });
  });

  describe('createLoadingOverlay', () => {
    it('creates overlay element with correct ID', () => {
      const overlay = createLoadingOverlay();
      expect(overlay.id).toBe('chat2deal-loading-overlay');
    });

    it('includes all required child elements', () => {
      const overlay = createLoadingOverlay();

      const spinner = overlay.querySelector('.chat2deal-spinner');
      const text = overlay.querySelector('.chat2deal-loading-text');

      expect(spinner).toBeTruthy();
      expect(text).toBeTruthy();
      expect(text?.textContent).toBe('Initializing Chat2Deal...');
    });

    it('applies correct inline styles', () => {
      const overlay = createLoadingOverlay();
      expect(overlay.style.position).toBe('fixed');
      expect(overlay.style.top).toBe('0');
      expect(overlay.style.right).toBe('0');
      expect(overlay.style.width).toBe('350px');
      expect(overlay.style.height).toBe('100vh');
      expect(overlay.style.zIndex).toBe('10000000');
    });

    it('injects animation styles into document', () => {
      createLoadingOverlay();
      const styles = document.getElementById('chat2deal-spin');
      expect(styles).toBeTruthy();
      expect(styles?.textContent).toContain('chat2deal-spin');
    });
  });

  describe('removeLoadingOverlay', () => {
    it('removes overlay element from DOM', () => {
      const overlay = createLoadingOverlay();
      document.body.appendChild(overlay);

      expect(document.getElementById('chat2deal-loading-overlay')).toBeTruthy();

      removeLoadingOverlay();

      expect(document.getElementById('chat2deal-loading-overlay')).toBeNull();
    });

    it('removes style tag from DOM', () => {
      createLoadingOverlay();
      expect(document.getElementById('chat2deal-spin')).toBeTruthy();

      removeLoadingOverlay();

      expect(document.getElementById('chat2deal-spin')).toBeNull();
    });

    it('handles case when overlay does not exist', () => {
      expect(() => removeLoadingOverlay()).not.toThrow();
    });
  });
});
```

### 6.2 Integration Tests

**Test File:** `Extension/tests/integration/module-raid-overlay.test.ts` (not yet implemented)

**Test Cases:**

```typescript
describe('Module Raid Overlay Integration', () => {
  it('shows overlay during initialization and removes on success', async () => {
    // Mock WhatsApp UI
    document.body.innerHTML = `
      <div role="grid"></div>
      <div role="textbox"></div>
    `;

    // Mock successful module raid
    mockWebpackDetection(true);

    const initPromise = initializeModuleRaid();

    // Overlay should appear after WhatsApp UI check
    await waitFor(() => {
      expect(document.getElementById('chat2deal-loading-overlay')).toBeTruthy();
    });

    // Wait for initialization to complete
    await initPromise;

    // Overlay should be removed after 300ms delay
    await waitFor(() => {
      expect(document.getElementById('chat2deal-loading-overlay')).toBeNull();
    }, { timeout: 500 });
  });

  it('shows overlay during initialization and removes on failure', async () => {
    // Mock WhatsApp UI
    document.body.innerHTML = `
      <div role="grid"></div>
      <div role="textbox"></div>
    `;

    // Mock failed module raid
    mockWebpackDetection(false);

    const initPromise = initializeModuleRaid().catch(() => {});

    // Overlay should appear
    await waitFor(() => {
      expect(document.getElementById('chat2deal-loading-overlay')).toBeTruthy();
    });

    // Wait for timeout
    await initPromise;

    // Overlay should be removed after 1000ms delay
    await waitFor(() => {
      expect(document.getElementById('chat2deal-loading-overlay')).toBeNull();
    }, { timeout: 1500 });
  });

  it('does not show overlay if WhatsApp UI is not ready', async () => {
    // Empty DOM - no WhatsApp UI
    document.body.innerHTML = '';

    const initPromise = initializeModuleRaid();

    // Overlay should not appear immediately
    await new Promise(resolve => setTimeout(resolve, 200));
    expect(document.getElementById('chat2deal-loading-overlay')).toBeNull();

    // Note: In real scenario, overlay would appear once WhatsApp UI loads
  });
});
```

### 6.3 Manual Testing Checklist

**Normal Load (Happy Path):**
- [ ] Navigate to `web.whatsapp.com`
- [ ] Overlay appears covering entire sidebar area (350px width)
- [ ] Overlay displays large spinner (48×48px) and "Initializing Chat2Deal..." text
- [ ] Overlay disappears after ~300ms
- [ ] Sidebar loads normally beneath
- [ ] Chat monitoring works (opening chat updates sidebar)
- [ ] No console errors

**Slow Network (Delayed Webpack Detection):**
- [ ] Throttle network/CPU in DevTools
- [ ] Navigate to `web.whatsapp.com`
- [ ] Overlay remains visible for longer duration
- [ ] Overlay eventually disappears when webpack detected
- [ ] Sidebar loads and functions normally

**Module Raid Failure:**
- [ ] Modify `inspector-main.ts` to force timeout (set 1ms timeout)
- [ ] Navigate to `web.whatsapp.com`
- [ ] Overlay appears
- [ ] Overlay disappears after ~1000ms
- [ ] Check console: Error logged
- [ ] Sidebar still loads (shows welcome state)
- [ ] Chat monitoring does NOT work (stays on welcome when clicking chats)

**WhatsApp UI Ready Check:**
- [ ] Test on very slow connection
- [ ] Verify overlay waits for WhatsApp UI (chat list + search box) before injecting
- [ ] No console errors about missing DOM elements
- [ ] Overlay eventually appears once WhatsApp UI is ready

**Visual Design Verification:**
- [ ] Overlay positioned at right: 0, top: 0
- [ ] Width exactly 350px, height 100vh
- [ ] Background color #f0f2f5 (WhatsApp light gray)
- [ ] Spinner 48×48px, centered
- [ ] Spinner rotates smoothly
- [ ] Text uses correct font, size (16px), and color (#54656f)
- [ ] Content vertically and horizontally centered
- [ ] Z-index 10000000 (above everything)

**Multiple Tabs:**
- [ ] Open multiple WhatsApp Web tabs simultaneously
- [ ] Each tab shows independent overlay
- [ ] No interference between tabs
- [ ] Each tab completes initialization properly

---

## 7. Acceptance Criteria

### 7.1 Visual Design

- [ ] **AC-1:** Overlay appears at `right: 0, top: 0` covering sidebar area
- [ ] **AC-2:** Overlay width is exactly `350px`, height `100vh`
- [ ] **AC-3:** Overlay background is WhatsApp light gray (#f0f2f5)
- [ ] **AC-4:** Overlay displays rotating spinner (48×48px, WhatsApp green)
- [ ] **AC-5:** Overlay displays text "Initializing Chat2Deal..." (16px, WhatsApp secondary text color)
- [ ] **AC-6:** Content is vertically and horizontally centered
- [ ] **AC-7:** Overlay z-index (10000000) prevents interaction during load

### 7.2 Timing and Behavior

- [ ] **AC-8:** Overlay appears only when WhatsApp UI is ready (chat list + search box present)
- [ ] **AC-9:** Overlay removes with 300ms delay when module raid succeeds
- [ ] **AC-10:** Overlay removes with 1000ms delay when module raid fails/times out
- [ ] **AC-11:** No fade-in or fade-out animations (instant show/hide after delays)
- [ ] **AC-12:** Typical display duration: 300ms (normal case)
- [ ] **AC-13:** Extended display duration: 1000ms (timeout case)

### 7.3 Error Handling

- [ ] **AC-14:** Module raid failures logged to console
- [ ] **AC-15:** Optional: Sentry error reporting via custom events
- [ ] **AC-16:** Sidebar loads normally even if module raid fails (degraded mode)

### 7.4 Implementation Quality

- [ ] **AC-17:** Overlay uses plain HTML/CSS (no React dependencies)
- [ ] **AC-18:** All styles are inline (no external CSS files)
- [ ] **AC-19:** Animation keyframes injected into `<style>` tag
- [ ] **AC-20:** No console errors during normal operation
- [ ] **AC-21:** Overlay cleanup removes both element and style tag

### 7.5 Testing

- [ ] **AC-22:** Unit tests cover all helper functions
- [ ] **AC-23:** Integration tests cover success and failure paths
- [ ] **AC-24:** Manual testing completed for all scenarios
- [ ] **AC-25:** Test coverage ≥70% for new code
- [ ] **AC-26:** No TypeScript errors or type warnings

---

## 8. Implementation Plan

### Phase 1: Helper Functions

**Tasks:**
1. Add `waitForWhatsAppUI()` function to `inspector-main.ts`
2. Add `createLoadingOverlay()` function with inline styles
3. Add `removeLoadingOverlay()` cleanup function

**Files:**
- `Extension/src/content-script/inspector-main.ts`

### Phase 2: Overlay Integration

**Tasks:**
4. Modify initialization flow to call `waitForWhatsAppUI()`
5. Inject overlay after WhatsApp UI ready, before module raid
6. Remove overlay on success with 300ms delay (try block)
7. Remove overlay on failure with 1000ms delay (catch block)
8. Test with Chrome DevTools

**Files:**
- `Extension/src/content-script/inspector-main.ts`

### Phase 3: Error Handling (Optional)

**Tasks:**
9. Add event listener for `whatsapp-module-raid-error` in `index.tsx`
10. Call `logError()` with structured context
11. Test error event flow (MAIN → ISOLATED → Sentry)
12. Verify Sentry receives errors with correct context

**Files:**
- `Extension/src/content-script/index.tsx`

### Phase 4: Unit Tests

**Tasks:**
13. Write tests for `waitForWhatsAppUI()`
14. Write tests for `createLoadingOverlay()`
15. Write tests for `removeLoadingOverlay()`

**Files:**
- `Extension/tests/unit/inspector-overlay.test.ts`

### Phase 5: Integration Tests

**Tasks:**
16. Write test: overlay shows during init, removes on success
17. Write test: overlay shows during init, removes on failure
18. Write test: conditional display based on WhatsApp UI

**Files:**
- `Extension/tests/integration/module-raid-overlay.test.ts`

### Phase 6: Manual Testing

**Tasks:**
19. Test normal load (happy path)
20. Test slow network (throttled)
21. Test module raid failure (forced timeout)
22. Test WhatsApp UI ready check
23. Test visual design (measurements, colors, spacing)
24. Test multiple tabs

### Phase 7: Documentation & Review

**Tasks:**
25. Update BRD with Feature 18 status
26. Mark spec as "Complete"
27. Update CLAUDE.md with spec reference

**Files:**
- `Docs/BRDs/BRD-001-MVP-Pipedrive-WhatsApp.md`
- `CLAUDE.md`

---

**Total Estimated Time:** 6.5 hours

**Breakdown:**
- Implementation: 2.5 hours (Phases 1-3)
- Testing: 3.5 hours (Phases 4-6)
- Documentation: 30 minutes (Phase 7)

---

## 9. Design Decisions & Rationale

### 9.1 Why Plain HTML/CSS (Not React)?

**Decision:** Use vanilla JavaScript to create toast DOM elements

**Rationale:**
- Toast runs in MAIN world, before React exists
- No need for React overhead for simple loading indicator
- Inline styles ensure no external dependencies
- Faster execution (no component lifecycle)
- Simpler cleanup (just remove element)

**Tradeoff:** More verbose code vs React JSX. Acceptable for small, isolated component.

### 9.2 Why Instant Show/Hide (No Animations)?

**Decision:** No fade-in or fade-out transitions

**Rationale:**
- Initialization typically completes in <200ms (too fast for smooth animation)
- Instant removal keeps code simple
- No animation timing edge cases
- Reduced complexity in cleanup
- Performance: no animation frames or transitions

**Tradeoff:** Less polished UX. Acceptable because toast is so short-lived.

### 9.3 Why Bottom-Right Corner?

**Decision:** Position at `bottom: 20px, right: 20px`

**Rationale:**
- Non-intrusive location (doesn't block WhatsApp chat list or messages)
- Common pattern for toast notifications
- Won't conflict with sidebar (sidebar is 350px wide, toast is 200px wide with margin)
- Easy to dismiss mentally (peripheral vision)
- Matches user expectations for temporary notifications

**Tradeoff:** Could be missed by users not looking at that corner. Acceptable because toast is informational, not critical.

### 9.4 Why Remove Toast on Failure (Not Show Error)?

**Decision:** Always remove toast, even on module raid failure

**Rationale:**
- Module raid failures are rare (WhatsApp API changes, network issues)
- Extension still functions in degraded mode (manual operations work)
- Persistent error UI would be confusing (sidebar works for most features)
- Sentry captures diagnostics for debugging
- Future DOM-based fallback will mitigate failures (separate spec)

**Tradeoff:** User doesn't know module raid failed. Acceptable because extension still provides value.

### 9.5 Why Custom Event for Error Reporting (Not Direct Sentry Call)?

**Decision:** Dispatch custom event from MAIN world, listen in ISOLATED world

**Rationale:**
- MAIN world script doesn't have access to Sentry client (lives in ISOLATED world)
- Custom events are existing communication pattern (chat status events)
- Keeps error logging centralized in ISOLATED world
- Maintains separation of concerns (MAIN = WhatsApp integration, ISOLATED = extension logic)
- PII filtering automatically applied by existing errorLogger

**Tradeoff:** More complex error flow. Worth it for architectural consistency.

### 9.6 Why Wait for `document.body` (Not Inject at `document_start`)?

**Decision:** Use `waitForBody()` helper before injecting toast

**Rationale:**
- `inspector-main.ts` runs at `document_start`, body might not exist yet
- Attempting to append to non-existent body causes error
- MutationObserver pattern is performant (resolves in <50ms)
- Ensures toast always injects successfully
- No risk of initialization failure due to DOM timing

**Tradeoff:** Slight delay (negligible). Worth it for reliability.

### 9.7 Why Z-Index 999998 (Below Sidebar)?

**Decision:** Set toast z-index one below sidebar (999999)

**Rationale:**
- Ensures toast never overlaps sidebar
- Sidebar is primary UI, should be on top
- Toast is temporary and less important
- Still above WhatsApp Web content (z-index typically <1000)
- Consistent layering hierarchy

**Tradeoff:** None. This is the correct layering.

### 9.8 Why Single Toast Message (Not Different Messages per Phase)?

**Decision:** Always show "Initializing Chat2Deal..." regardless of phase

**Rationale:**
- Phases happen too quickly for user to read different messages
- Simpler implementation (one message, one function)
- User doesn't care about technical phases
- Generic message covers all cases
- No need to update message during initialization

**Tradeoff:** Less granular feedback. Acceptable because initialization is so fast.

---

## 10. Future Enhancements (Post-Implementation)

### 10.1 Enhanced Error Feedback

**Persistent Error Toast:**
- If module raid fails, show error toast with "Reload" button
- User can dismiss or reload page from toast
- Helps users understand why chat monitoring isn't working

**Requires:**
- Retry mechanism in MAIN world
- More complex toast state management
- Error messaging UX design

### 10.2 Success Confirmation

**Brief Success Toast:**
- Show "Chat2Deal ready" for 1 second after successful init
- Provides positive feedback that extension loaded
- Fades out after 1 second

**Requires:**
- Timing logic for minimum display duration
- Fade-out animation
- Success message copy

### 10.3 Progress Indicator

**Multi-Phase Progress:**
- Show different messages for each phase:
  - "Detecting WhatsApp modules..."
  - "Initializing chat monitoring..."
  - "Ready!"
- Progress bar or step indicator

**Requires:**
- Message update mechanism
- Progress calculation
- More complex state management

### 10.4 DOM-Based Contact Detection Fallback

**Automatic Fallback:**
- If module raid fails, automatically switch to DOM scraping
- Parse contact name and phone from WhatsApp DOM
- Seamless degradation (user doesn't notice failure)

**Requires:**
- New spec for DOM-based detection (separate feature)
- Reliable DOM selectors
- Fallback activation logic

### 10.5 Animation and Polish

**Smooth Transitions:**
- Fade-in animation (200ms) when toast appears
- Fade-out animation (200ms) when toast disappears
- Slide-in from bottom-right corner
- Minimum display time (500ms) to prevent flashing

**Requires:**
- CSS transitions
- Timing coordination
- Animation cleanup

### 10.6 Customizable Toast Position

**User Preference:**
- Allow user to choose toast position (4 corners + center)
- Remember preference in chrome.storage
- Apply to all toasts

**Requires:**
- Settings UI
- Storage integration
- Position calculation logic

---

## 11. Known Limitations

### 11.1 Short Display Duration

**Limitation:** Toast may appear and disappear too quickly to read

**Impact:** User might not notice extension is loading

**Mitigation:**
- Initialization is so fast (<200ms) that feedback isn't critical
- Sidebar appears shortly after, providing confirmation
- Future enhancement: Minimum display time (500ms)

### 11.2 No Error Visibility

**Limitation:** Module raid failures are silent (no persistent error)

**Impact:** User doesn't know why chat monitoring isn't working

**Mitigation:**
- Sidebar still loads and provides manual features
- Sentry captures errors for debugging
- Future enhancement: DOM-based fallback (separate spec)
- Future enhancement: Persistent error toast with retry

### 11.3 No Retry Mechanism

**Limitation:** User can't retry module raid without reloading page

**Impact:** Temporary failures (network blip) require full reload

**Mitigation:**
- Module raid failures are rare
- Page reload is simple recovery
- Future enhancement: Retry button in error toast

### 11.4 Single Message

**Limitation:** Toast always shows "Initializing..." (no phase-specific messages)

**Impact:** User doesn't know which phase is taking time

**Mitigation:**
- Initialization is so fast that granular feedback isn't useful
- Generic message covers all cases
- Future enhancement: Multi-phase progress

---

## 12. Security & Privacy Considerations

### 12.1 No PII in Toast

**Guarantee:** Toast never displays user data

**Rationale:**
- Only shows generic "Initializing Chat2Deal..." message
- No phone numbers, names, or chat content
- No user-specific information

### 12.2 No Sensitive Data in Error Events

**Guarantee:** Error events contain only technical context

**Contents:**
- Phase name (webpack-detection, module-raid, etc.)
- Error message (timeout, module not found, etc.)
- Timestamp (Date.now())
- Timeout duration (5000ms)

**Excluded:**
- No verification codes or tokens
- No chat data or phone numbers
- No user profile information
- No API keys or secrets

### 12.3 Sentry Error Filtering

**Guarantee:** PII filtered before sending to Sentry

**Mechanism:**
- Existing `logError()` utility applies PII filtering
- Phone numbers, names, tokens removed automatically
- Only technical diagnostic data sent

### 12.4 DOM Injection Safety

**Guarantee:** Toast HTML is safe and doesn't execute scripts

**Mechanism:**
- All content is static strings (no user input)
- No `innerHTML` or `eval()` usage
- Chrome extension icon loaded via trusted API (`chrome.runtime.getURL()`)
- No external resources or CDN loads

---

## 13. References

### 13.1 Related Documents

- [BRD-001-MVP-Pipedrive-WhatsApp.md](../BRDs/BRD-001-MVP-Pipedrive-WhatsApp.md) - Feature 18 business requirements
- [Chrome-Extension-Architecture.md](../Architecture/Chrome-Extension-Architecture.md) - MAIN vs ISOLATED world architecture
- [Spec-103-WhatsApp-Sidebar-Injection.md](Spec-103-WhatsApp-Sidebar-Injection.md) - Sidebar injection patterns
- [Spec-112-UI-States-Error-Handling.md](Spec-112-UI-States-Error-Handling.md) - Error logging and Sentry integration
- [UI-Design-Specification.md](../Architecture/UI-Design-Specification.md) - WhatsApp design system colors

### 13.2 External References

- [Chrome Extensions: Content Scripts](https://developer.chrome.com/docs/extensions/mv3/content_scripts/) - Execution world documentation
- [MDN: MutationObserver](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver) - DOM observation API
- [MDN: CustomEvent](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent) - Custom event dispatch
- [MDN: CSS Animations](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Animations) - Keyframe animations

### 13.3 Code References

- `Extension/src/content-script/inspector-main.ts` - Module raid initialization (MAIN world)
- `Extension/src/content-script/index.tsx` - Sidebar injection and React mount (ISOLATED world)
- `Extension/src/content-script/whatsapp-integration/chat-monitor-main.ts` - Chat monitoring setup
- `Extension/src/utils/errorLogger.ts` - Centralized error logging
- `Extension/src/content-script/sentry.ts` - Sentry client configuration

---

## 14. Glossary

**Module Raid:** Intercepting WhatsApp Web's internal webpack modules to access the Store object

**MAIN World:** JavaScript execution context with access to page's global variables (WhatsApp modules)

**ISOLATED World:** JavaScript execution context isolated from page (Chrome extension content scripts)

**Webpack Chunk:** JavaScript bundle containing WhatsApp Web's internal modules

**Store:** WhatsApp Web's internal state management object (accessed via module raid)

**Chat Monitoring:** Polling WhatsApp Store for active chat changes (every 200ms)

**Degraded Mode:** Extension state when module raid fails (sidebar loads but chat monitoring inactive)

**Toast:** Temporary notification UI element (typically bottom-right corner)

**Custom Event:** Browser API for dispatching events between different JavaScript contexts

**PII:** Personally Identifiable Information (names, phone numbers, emails, etc.)

**Sentry:** Error tracking and monitoring service

**statusCode: 0:** Special error code indicating network failure (used in API error handling)

---

**End of Specification**
