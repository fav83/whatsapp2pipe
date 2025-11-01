#!/bin/bash
set -e

# Read version from manifest.json
VERSION=$(node -p "require('./public/manifest.json').version")

echo "📦 Uploading source maps for version $VERSION..."

# Check if sentry-cli is installed
if ! command -v sentry-cli &> /dev/null; then
    echo "❌ sentry-cli is not installed"
    echo "Install it with: npm install -g @sentry/cli"
    echo "Then authenticate with: sentry-cli login"
    exit 1
fi

# Create release in Sentry
sentry-cli releases new "$VERSION"

# Upload source maps
sentry-cli releases files "$VERSION" upload-sourcemaps ./dist \
  --ext map \
  --ext js \
  --rewrite

# Finalize release
sentry-cli releases finalize "$VERSION"

echo "✅ Source maps uploaded successfully for version $VERSION"
