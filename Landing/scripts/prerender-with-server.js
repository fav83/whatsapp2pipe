/**
 * Pre-render with automatic server management
 *
 * This script automatically starts a preview server, pre-renders pages,
 * and then stops the server. Works cross-platform (Windows, macOS, Linux).
 */

import { spawn } from 'child_process';
import { prerender } from './prerender.js';

const PREVIEW_PORT = 4173;
const PREVIEW_URL = `http://localhost:${PREVIEW_PORT}`;

/**
 * Wait for server to be ready
 * @param {number} maxAttempts - Maximum number of connection attempts
 * @returns {Promise<boolean>}
 */
async function waitForServer(maxAttempts = 30) {
  console.log('Waiting for preview server to be ready...');

  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(PREVIEW_URL);
      if (response.ok || response.status === 404) {
        console.log('✓ Preview server is ready\n');
        return true;
      }
    } catch (error) {
      // Server not ready yet, wait and retry
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  console.error('✗ Preview server failed to start within timeout');
  return false;
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Starting preview server...\n');

  // Start preview server
  const serverProcess = spawn('npx', ['vite', 'preview', '--port', PREVIEW_PORT.toString()], {
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: true,
  });

  let serverReady = false;

  // Listen for server output
  serverProcess.stdout.on('data', (data) => {
    const output = data.toString();
    if (output.includes('Local:') || output.includes('Network:')) {
      serverReady = true;
    }
  });

  serverProcess.stderr.on('data', (data) => {
    console.error('Server error:', data.toString());
  });

  // Wait for server to be ready
  const isReady = await waitForServer();

  if (!isReady) {
    serverProcess.kill();
    process.exit(1);
  }

  // Update environment variable for prerender script
  process.env.PRERENDER_URL = PREVIEW_URL;

  try {
    // Run pre-rendering (imported function will execute immediately)
    // Note: prerender.js now auto-executes, so we just need to wait
    console.log('Pre-rendering will complete...\n');

    // Give some time for the prerender import to complete
    await new Promise(resolve => setTimeout(resolve, 2000));

  } catch (error) {
    console.error('Pre-rendering failed:', error);
  } finally {
    // Stop preview server
    console.log('\n🛑 Stopping preview server...');
    serverProcess.kill();

    // Give server time to shut down
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('✓ Preview server stopped');
  }
}

// Run main function
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
