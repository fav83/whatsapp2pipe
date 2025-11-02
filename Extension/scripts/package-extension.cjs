#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('📦 Packaging Chrome extension for distribution...');

// Read version from manifest.json
const manifestPath = path.join(__dirname, '../public/manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const version = manifest.version;

console.log(`Version: ${version}`);

// Clean previous release
const releaseDir = path.join(__dirname, '../release');
if (fs.existsSync(releaseDir)) {
  fs.rmSync(releaseDir, { recursive: true, force: true });
}
fs.mkdirSync(releaseDir, { recursive: true });

console.log('✓ Cleaned release directory');

// Copy dist contents to release, excluding source maps
console.log('Copying files (excluding source maps)...');
const distDir = path.join(__dirname, '../dist');

function copyRecursive(src, dest) {
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      fs.mkdirSync(destPath, { recursive: true });
      copyRecursive(srcPath, destPath);
    } else if (!entry.name.endsWith('.map')) {
      // Exclude .map files
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

copyRecursive(distDir, releaseDir);

console.log('✓ Copied files to release/');

// Create zip file for Chrome Web Store
const zipName = `chat2deal-v${version}.zip`;
const zipPath = path.join(__dirname, '..', zipName);

// Remove old zip if exists
if (fs.existsSync(zipPath)) {
  fs.unlinkSync(zipPath);
}

// Use platform-specific zip command
try {
  if (process.platform === 'win32') {
    // Windows: Use PowerShell's Compress-Archive
    const psCommand = `Compress-Archive -Path "${releaseDir}\\*" -DestinationPath "${zipPath}" -Force`;
    execSync(`powershell -Command "${psCommand}"`, { stdio: 'ignore' });
  } else {
    // Unix-like systems: Use zip command
    execSync(`cd "${releaseDir}" && zip -r "../${zipName}" .`, { stdio: 'ignore' });
  }
} catch (error) {
  console.error('❌ Failed to create zip file');
  console.error('Make sure zip (Unix) or PowerShell (Windows) is available');
  process.exit(1);
}

console.log(`✓ Created ${zipName}`);

// Display package info
const stats = fs.statSync(zipPath);
const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);

console.log('');
console.log('📊 Package Summary:');
console.log(`  Version: ${version}`);
console.log(`  Package: ${zipName}`);
console.log(`  Size: ${sizeInMB} MB`);
console.log('');
console.log('✅ Ready for Chrome Web Store upload!');
console.log('');
console.log('📋 Next steps:');
console.log('  1. Upload source maps: npm run upload-sourcemaps');
console.log(`  2. Upload ${zipName} to Chrome Web Store`);
console.log('');
