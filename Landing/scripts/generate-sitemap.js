/**
 * XML Sitemap Generation Script
 *
 * Generates a standards-compliant XML sitemap using the automated
 * route discovery system.
 */

import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { discoverRoutes, getBaseUrl } from './route-discovery.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DIST_DIR = join(__dirname, '..', 'dist');
const SITEMAP_PATH = join(DIST_DIR, 'sitemap.xml');

/**
 * Generate XML sitemap content
 * @param {Array<Object>} routes - Array of route objects
 * @param {string} baseUrl - Base URL for the site
 * @returns {string} - XML sitemap content
 */
function generateSitemapXML(routes, baseUrl) {
  const lastmod = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

  const urlEntries = routes
    .map((route) => {
      return `  <url>
    <loc>${baseUrl}${route.path}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority.toFixed(1)}</priority>
  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
}

/**
 * Main sitemap generation function
 */
function generateSitemap() {
  console.log('Generating sitemap...');

  // Discover all routes
  const routes = discoverRoutes();
  console.log(`Found ${routes.length} routes`);

  // Get base URL
  const baseUrl = getBaseUrl();
  console.log(`Using base URL: ${baseUrl}`);

  // Generate sitemap XML
  const sitemapXML = generateSitemapXML(routes, baseUrl);

  // Write sitemap to dist directory
  try {
    writeFileSync(SITEMAP_PATH, sitemapXML, 'utf-8');
    console.log(`✓ Sitemap generated successfully: ${SITEMAP_PATH}`);
    console.log(`  - ${routes.length} URLs included`);
    console.log(`  - Base URL: ${baseUrl}`);
  } catch (error) {
    console.error('✗ Failed to write sitemap:', error.message);
    process.exit(1);
  }
}

// Always run when executed
generateSitemap();

export { generateSitemap };
