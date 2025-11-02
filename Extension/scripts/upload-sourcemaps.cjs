#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Read version from manifest.json
const manifestPath = path.join(__dirname, '../public/manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const version = manifest.version;

console.log(`Uploading source maps for version ${version}...`);

// Check if sentry-cli is installed
try {
  execSync('sentry-cli --version', { stdio: 'ignore' });
} catch (error) {
  console.error('sentry-cli is not installed');
  console.error('Install it with: npm install -g @sentry/cli');
  console.error('Then authenticate with: sentry-cli login');
  process.exit(1);
}

// Load Sentry config from .env.production if it exists
const envPath = path.join(__dirname, '../.env.production');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach((line) => {
    const trimmedLine = line.trim();
    const match = trimmedLine.match(/^(SENTRY_ORG|SENTRY_PROJECT)=(.*)$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2].trim();
    }
  });
}

// Check for Sentry configuration
const sentryOrg = process.env.SENTRY_ORG;
const sentryProject = process.env.SENTRY_PROJECT;

if (!sentryOrg || !sentryProject) {
  console.error('Sentry configuration missing');
  console.error('');
  console.error('Option 1: Add to .env.production file:');
  console.error('  SENTRY_ORG=your-org-slug');
  console.error('  SENTRY_PROJECT=your-project-slug');
  console.error('');
  console.error('Option 2: Set environment variables:');
  console.error('  $env:SENTRY_ORG = "your-org-slug"    # PowerShell');
  console.error('  $env:SENTRY_PROJECT = "your-project-slug"');
  console.error('');
  console.error('Option 3: Create .sentryclirc file in project root:');
  console.error('  [defaults]');
  console.error('  org=your-org-slug');
  console.error('  project=your-project-slug');
  console.error('');
  console.error('Get these values from: https://sentry.io/settings/');
  process.exit(1);
}

// Prepare temporary directory with both JS and map files (Sentry needs both together)
const uploadDir = path.join(__dirname, '../upload-temp');
console.log('Preparing files for upload...');

// Clean and create upload directory
if (fs.existsSync(uploadDir)) {
  fs.rmSync(uploadDir, { recursive: true, force: true });
}
fs.mkdirSync(uploadDir, { recursive: true });

// Copy JS files from dist/ and .map files from sourcemaps/
const distDir = path.join(__dirname, '../dist');
const sourcemapsDir = path.join(__dirname, '../sourcemaps');

function copyRecursive(src, dest, extensions) {
  if (!fs.existsSync(src)) return;
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      fs.mkdirSync(destPath, { recursive: true });
      copyRecursive(srcPath, destPath, extensions);
    } else {
      const ext = path.extname(entry.name);
      if (extensions.includes(ext)) {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }
}

copyRecursive(distDir, uploadDir, ['.js']);
copyRecursive(sourcemapsDir, uploadDir, ['.map']);

console.log('Prepared upload directory with JS and map files');

try {
  // Ensure Debug IDs are present in both JS and source maps. Even though
  // the Vite plugin injects them in JS, this also stamps the .map files.
  console.log('Injecting debug IDs into upload-temp/...');
  execSync(`sentry-cli sourcemaps inject ./upload-temp`, { stdio: 'inherit' });

  // Copy injected JS back to dist so the browser executes code with matching IDs
  console.log('Syncing injected JS back to dist/...');
  copyRecursive(uploadDir, distDir, ['.js']);

  // Diagnostics: show the Debug ID we will upload for key bundles
  function showDebugId(jsPath) {
    if (!fs.existsSync(jsPath)) return;
    const src = fs.readFileSync(jsPath, 'utf8');
    const m1 = src.match(/sentry-dbid-([0-9a-f-]+)/i);
    const m2 = src.match(/#\s*debugId=([0-9a-f-]+)/i);
    const id = m1 ? m1[1] : (m2 ? m2[1] : null);
    if (id) {
      const mapPath = jsPath + '.map';
      const hasMap = fs.existsSync(mapPath);
      const mapHasId = hasMap && fs.readFileSync(mapPath, 'utf8').includes(id);
      console.log(`Debug ID ${id} in ${path.basename(jsPath)} (map: ${hasMap ? (mapHasId ? 'has id' : 'missing id') : 'missing'})`);
    } else {
      console.warn(`No Debug ID found in ${path.basename(jsPath)}`);
    }
  }
  showDebugId(path.join(uploadDir, 'content-script.js'));
  showDebugId(path.join(uploadDir, 'inspector-main.js'));
  showDebugId(path.join(uploadDir, 'service-worker.js'));

  console.log('Uploading source maps...');
  execSync(
    `sentry-cli sourcemaps upload --org "${sentryOrg}" --project "${sentryProject}" ./upload-temp`,
    { stdio: 'inherit' }
  );
  console.log(`Source maps uploaded successfully for version ${version}`);
} catch (error) {
  console.error('Failed to upload source maps');
  console.error('Check your Sentry authentication and configuration');
  process.exit(1);
} finally {
  // Clean up temporary directory (set KEEP_UPLOAD_TEMP=1 to skip)
  if (process.env.KEEP_UPLOAD_TEMP !== '1') {
    if (fs.existsSync(uploadDir)) {
      fs.rmSync(uploadDir, { recursive: true, force: true });
      console.log('Cleaned up temporary files');
    }
  } else {
    console.log(`Keeping temporary files for inspection at: ${uploadDir}`);
  }
}
