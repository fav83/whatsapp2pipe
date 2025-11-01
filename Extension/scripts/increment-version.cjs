#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔢 Incrementing version...');

// Paths
const manifestPath = path.join(__dirname, '../public/manifest.json');
const packagePath = path.join(__dirname, '../package.json');

// Read current versions
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

const currentVersion = manifest.version;

// Parse version parts
const [major, minor, patch] = currentVersion.split('.').map(Number);

// Increment patch version
const newPatch = patch + 1;
const newVersion = `${major}.${minor}.${newPatch}`;

console.log(`  Current version: ${currentVersion}`);
console.log(`  New version:     ${newVersion}`);

// Update manifest.json
manifest.version = newVersion;
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');

// Update package.json
pkg.version = newVersion;
fs.writeFileSync(packagePath, JSON.stringify(pkg, null, 2) + '\n');

console.log(`✅ Version updated to ${newVersion}`);
