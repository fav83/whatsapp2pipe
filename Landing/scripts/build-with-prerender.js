/**
 * Build script that handles preview server lifecycle for pre-rendering
 *
 * This script:
 * 1. Kills any existing preview servers
 * 2. Starts the preview server
 * 3. Waits for it to be ready (detects actual port)
 * 4. Updates prerender script with detected port
 * 5. Runs the pre-rendering script
 * 6. Stops the preview server
 */

import { spawn, exec } from 'child_process';
import { setTimeout } from 'timers/promises';
import { promisify } from 'util';
import { readFile, writeFile } from 'fs/promises';

const execAsync = promisify(exec);

console.log('🚀 Starting build with pre-rendering...\n');

// Step 1: Kill any existing preview servers
console.log('🧹 Cleaning up any existing preview servers...');
try {
  // Windows: Kill node processes on ports 4173-4180
  for (let port = 4173; port <= 4180; port++) {
    try {
      const { stdout } = await execAsync(`netstat -ano | findstr :${port}`);
      if (stdout) {
        const lines = stdout.trim().split('\n');
        for (const line of lines) {
          const match = line.match(/LISTENING\s+(\d+)/);
          if (match) {
            const pid = match[1];
            await execAsync(`taskkill /F /PID ${pid}`);
            console.log(`   ✓ Killed process ${pid} on port ${port}`);
          }
        }
      }
    } catch (e) {
      // Port not in use, that's fine
    }
  }
  await setTimeout(1000); // Give it a moment to release ports
} catch (error) {
  console.log('   (No existing servers to clean up)');
}

// Step 2: Start preview server
console.log('\n📦 Starting preview server...');
const previewServer = spawn('npm', ['run', 'preview'], {
  shell: true,
  stdio: 'pipe'
});

let serverReady = false;
let detectedPort = null;

// Monitor server output
previewServer.stdout.on('data', (data) => {
  const output = data.toString();
  console.log(output);

  // Check if server is ready and extract port (strip ANSI codes for checking)
  const cleanOutput = output.replace(/\x1B\[[0-9;]*[a-zA-Z]/g, '');
  const portMatch = cleanOutput.match(/localhost:(\d+)/);
  if (portMatch && cleanOutput.includes('Local:')) {
    detectedPort = portMatch[1];
    serverReady = true;
  }
});

previewServer.stderr.on('data', (data) => {
  console.error(data.toString());
});

// Step 3: Wait for server to be ready (max 30 seconds)
let attempts = 0;
while (!serverReady && attempts < 30) {
  await setTimeout(1000);
  attempts++;
}

if (!serverReady || !detectedPort) {
  console.error('❌ Preview server failed to start after 30 seconds');
  previewServer.kill();
  process.exit(1);
}

console.log(`✅ Preview server is ready on port ${detectedPort}\n`);

// Give it an extra second to stabilize
await setTimeout(2000);

// Step 4: Temporarily update prerender script port if needed
let originalPrerender = null;
if (detectedPort !== '4173') {
  console.log(`⚙️  Updating prerender script to use port ${detectedPort}...\n`);
  const prerenderPath = 'scripts/prerender.js';
  originalPrerender = await readFile(prerenderPath, 'utf8');
  const updatedPrerender = originalPrerender.replace(
    /const PREVIEW_PORT = 4173;/,
    `const PREVIEW_PORT = ${detectedPort};`
  );
  await writeFile(prerenderPath, updatedPrerender, 'utf8');
}

// Step 5: Run pre-rendering
console.log('🎨 Running pre-rendering...\n');
const prerenderProcess = spawn('node', ['scripts/prerender.js'], {
  shell: true,
  stdio: 'inherit'
});

// Wait for pre-rendering to complete
const prerenderExitCode = await new Promise((resolve) => {
  prerenderProcess.on('close', resolve);
});

// Restore original prerender script if we modified it
if (originalPrerender) {
  await writeFile('scripts/prerender.js', originalPrerender, 'utf8');
}

// Step 6: Stop preview server
console.log('\n🛑 Stopping preview server...');
previewServer.kill();

// Wait a moment for cleanup
await setTimeout(1000);

if (prerenderExitCode === 0) {
  console.log('✅ Build with pre-rendering completed successfully!');
  process.exit(0);
} else {
  console.error('❌ Pre-rendering failed');
  process.exit(prerenderExitCode);
}
