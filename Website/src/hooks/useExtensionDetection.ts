import { useState, useEffect } from 'react';

export interface ExtensionStatus {
  installed: boolean;
  version: string | null;
  loading: boolean;
}

/**
 * Custom hook to detect Chrome extension installation status
 *
 * Uses postMessage handshake with retry logic:
 * - Attempt 1: Immediate (0ms)
 * - Attempt 2: After 500ms
 * - Timeout: 1000ms total
 *
 * @returns Extension installation status
 */
export function useExtensionDetection(): ExtensionStatus {
  const [status, setStatus] = useState<ExtensionStatus>({
    installed: false,
    version: null,
    loading: true,
  });

  useEffect(() => {
    let timeoutId: number;
    let retryTimeoutId: number;
    let detected = false;

    // Generate unique nonce for this detection attempt
    const nonce = Math.random().toString(36).substring(2) + Date.now().toString(36);

    // Log detection start
    if (import.meta.env.DEV) {
      console.log('[Extension Detection] Starting detection from origin:', window.location.origin);
      console.log('[Extension Detection] Generated nonce:', nonce);
    }

    // Message listener for PONG response
    const handleMessage = (event: MessageEvent) => {
      // Log all messages in dev mode for debugging
      if (import.meta.env.DEV) {
        console.log('[Extension Detection] Received message:', {
          origin: event.origin,
          type: event.data?.type,
          nonce: event.data?.nonce,
          data: event.data
        });
      }

      // Validate origin: Must come from same origin (content scripts run in page context)
      if (event.origin !== window.location.origin) {
        return;
      }

      // Check for pong message with required fields
      // Only the extension content script will send this exact structure with correct nonce
      if (
        event.data?.type === 'EXTENSION_PONG' &&
        event.data?.nonce === nonce &&
        event.data?.installed === true &&
        typeof event.data?.version === 'string' &&
        !detected
      ) {
        detected = true;

        // Clear timeouts
        clearTimeout(timeoutId);
        clearTimeout(retryTimeoutId);

        // Update state
        setStatus({
          installed: true,
          version: event.data.version,
          loading: false,
        });

        // Log detection (development only)
        if (import.meta.env.DEV) {
          console.log('[Extension Detection] ✅ Extension detected! Version:', event.data.version);
          console.log('[Extension Detection] Nonce verified:', nonce);
        }
      }
    };

    // Add message listener
    window.addEventListener('message', handleMessage);

    // Attempt 1: Send ping immediately
    if (import.meta.env.DEV) {
      console.log('[Extension Detection] Sending PING attempt 1 with nonce');
    }
    window.postMessage({ type: 'EXTENSION_PING', nonce }, window.location.origin);

    // Attempt 2: Retry after 500ms if not detected
    retryTimeoutId = window.setTimeout(() => {
      if (!detected) {
        if (import.meta.env.DEV) {
          console.log('[Extension Detection] Sending PING attempt 2 (retry after 500ms)');
        }
        window.postMessage({ type: 'EXTENSION_PING', nonce }, window.location.origin);
      }
    }, 500);

    // Timeout: After 1000ms, assume not installed
    timeoutId = window.setTimeout(() => {
      if (!detected) {
        setStatus({
          installed: false,
          version: null,
          loading: false,
        });

        if (import.meta.env.DEV) {
          console.log('[Extension Detection] ❌ Timeout - extension not detected after 1000ms');
          console.log('[Extension Detection] Troubleshooting:');
          console.log('  1. Make sure the extension is installed in Chrome');
          console.log('  2. Go to chrome://extensions and click the reload button');
          console.log('  3. Check that dashboard-bridge.js is in the extension dist/');
          console.log('  4. Refresh this page after reloading the extension');
        }
      }
    }, 1000);

    // Cleanup
    return () => {
      window.removeEventListener('message', handleMessage);
      clearTimeout(timeoutId);
      clearTimeout(retryTimeoutId);
    };
  }, []); // Run once on mount

  return status;
}
