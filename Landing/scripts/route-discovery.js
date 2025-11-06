/**
 * Automated Route Discovery System
 *
 * Scans src/pages/ directory and automatically generates route information
 * for sitemap generation and static pre-rendering.
 */

import { readdirSync, statSync } from 'fs';
import { join, relative, sep, parse } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PAGES_DIR = join(__dirname, '..', 'src', 'pages');

/**
 * Convert a component filename to a URL path
 * @param {string} filename - Component filename (e.g., "PrivacyPolicy.tsx")
 * @returns {string} - URL path (e.g., "privacy-policy")
 */
function filenameToPath(filename) {
  // Remove file extension
  const nameWithoutExt = filename.replace(/\.(tsx?|jsx?)$/, '');

  // Convert PascalCase to kebab-case
  return nameWithoutExt
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .toLowerCase();
}

/**
 * Route path overrides for special cases
 * Maps component paths to custom URL paths
 */
const ROUTE_OVERRIDES = {
  'legal/PrivacyPolicy': '/privacy-policy',
  'legal/TermsOfService': '/terms-of-service',
  'Home': '/',
};

/**
 * Get SEO priority based on route pattern
 * @param {string} path - URL path
 * @returns {number} - Priority between 0.0 and 1.0
 */
function getPriority(path) {
  if (path === '/') return 1.0;
  if (path.match(/^\/(privacy-policy|terms-of-service)/)) return 0.3;
  if (path.match(/^\/blog\//)) return 0.7;
  if (path.match(/^\/about/)) return 0.8;
  return 0.5;
}

/**
 * Get change frequency based on route pattern
 * @param {string} path - URL path
 * @returns {string} - Change frequency (always, hourly, daily, weekly, monthly, yearly, never)
 */
function getChangeFreq(path) {
  if (path === '/') return 'weekly';
  if (path.match(/^\/(privacy-policy|terms-of-service)/)) return 'yearly';
  if (path.match(/^\/blog\//)) return 'monthly';
  return 'monthly';
}

/**
 * Recursively scan directory for React components
 * @param {string} dir - Directory to scan
 * @param {string} baseDir - Base directory for relative path calculation
 * @returns {Array<Object>} - Array of route objects
 */
function scanDirectory(dir, baseDir = PAGES_DIR) {
  const routes = [];

  try {
    const items = readdirSync(dir);

    for (const item of items) {
      const fullPath = join(dir, item);
      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        // Recursively scan subdirectories
        routes.push(...scanDirectory(fullPath, baseDir));
      } else if (item.match(/\.(tsx?|jsx?)$/)) {
        // Get relative path from pages directory
        const relativePath = relative(baseDir, fullPath);
        const parsedPath = parse(relativePath);

        // Build component path (directory + filename without extension)
        const componentPath = parsedPath.dir
          ? `${parsedPath.dir}${sep}${parsedPath.name}`
          : parsedPath.name;

        // Normalize path separators for cross-platform compatibility
        const normalizedComponentPath = componentPath.split(sep).join('/');

        // Check for route override
        let urlPath;
        if (ROUTE_OVERRIDES[normalizedComponentPath]) {
          urlPath = ROUTE_OVERRIDES[normalizedComponentPath];
        } else {
          // Generate URL path from filename
          const pathSegment = filenameToPath(item);

          // Build full URL path
          if (parsedPath.dir) {
            // Keep directory structure in URL (e.g., blog/PostName -> /blog/post-name)
            const dirPath = parsedPath.dir.split(sep).join('/');
            urlPath = `/${dirPath}/${pathSegment}`;
          } else {
            urlPath = pathSegment === 'home' ? '/' : `/${pathSegment}`;
          }
        }

        routes.push({
          componentPath: normalizedComponentPath,
          urlPath,
          priority: getPriority(urlPath),
          changefreq: getChangeFreq(urlPath),
        });
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${dir}:`, error.message);
  }

  return routes;
}

/**
 * Discover all routes in the application
 * @param {Object} options - Configuration options
 * @param {boolean} options.verbose - Log route discovery to console (default: false)
 * @returns {Array<Object>} - Array of route objects with metadata
 */
export function discoverRoutes(options = {}) {
  const { verbose = false } = options;

  if (verbose) {
    console.log(`📂 Scanning pages directory: ${PAGES_DIR}\n`);
  }

  const routes = scanDirectoryWithVerbose(PAGES_DIR, PAGES_DIR, verbose);

  // Sort routes by priority (descending) then by path (ascending)
  routes.sort((a, b) => {
    if (b.priority !== a.priority) {
      return b.priority - a.priority;
    }
    return a.path.localeCompare(b.path);
  });

  if (verbose) {
    console.log(`\n✅ Found ${routes.length} route(s)`);
  }

  return routes;
}

/**
 * Scan directory with verbose logging
 * @param {string} dir - Directory to scan
 * @param {string} baseDir - Base directory for relative path calculation
 * @param {boolean} verbose - Whether to log details
 * @returns {Array<Object>} - Array of route objects
 */
function scanDirectoryWithVerbose(dir, baseDir, verbose) {
  const routes = [];

  try {
    const items = readdirSync(dir);

    for (const item of items) {
      const fullPath = join(dir, item);
      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        routes.push(...scanDirectoryWithVerbose(fullPath, baseDir, verbose));
      } else if (item.match(/\.(tsx?|jsx?)$/)) {
        const relativePath = relative(baseDir, fullPath);
        const parsedPath = parse(relativePath);

        const componentPath = parsedPath.dir
          ? `${parsedPath.dir}${sep}${parsedPath.name}`
          : parsedPath.name;

        const normalizedComponentPath = componentPath.split(sep).join('/');

        let urlPath;
        if (ROUTE_OVERRIDES[normalizedComponentPath]) {
          urlPath = ROUTE_OVERRIDES[normalizedComponentPath];
        } else {
          const pathSegment = filenameToPath(item);

          if (parsedPath.dir) {
            const dirPath = parsedPath.dir.split(sep).join('/');
            urlPath = `/${dirPath}/${pathSegment}`;
          } else {
            urlPath = pathSegment === 'home' ? '/' : `/${pathSegment}`;
          }
        }

        const priority = getPriority(urlPath);
        const changefreq = getChangeFreq(urlPath);

        routes.push({
          path: urlPath, // Use 'path' for consistency with boring-calc
          componentPath: normalizedComponentPath,
          priority,
          changefreq,
        });

        if (verbose) {
          console.log(`   ✓ Found: ${urlPath} (priority: ${priority}, changefreq: ${changefreq})`);
        }
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${dir}:`, error.message);
  }

  return routes;
}

/**
 * Get just the route paths (useful for pre-rendering)
 * @param {Object} options - Configuration options
 * @returns {string[]} Array of route paths
 */
export function getRoutePaths(options = {}) {
  const routes = discoverRoutes(options);
  return routes.map(r => r.path);
}

/**
 * Get base URL from environment or use default
 * @returns {string} - Base URL for the site
 */
export function getBaseUrl() {
  return process.env.VITE_SITE_URL || 'https://chat2deal.com';
}
