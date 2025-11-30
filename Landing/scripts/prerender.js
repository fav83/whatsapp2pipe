/**
 * Static Pre-rendering Script
 *
 * Uses Puppeteer to render each page and generate static HTML files
 * with fully-rendered content and meta tags for optimal SEO.
 */

import puppeteer from 'puppeteer';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { getRoutePaths } from './route-discovery.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DIST_DIR = join(__dirname, '..', 'dist');
const PREVIEW_PORT = 4173;
const PREVIEW_HOST = 'localhost';

/**
 * Wait for network to be idle and all meta tags to be rendered
 * @param {import('puppeteer').Page} page - Puppeteer page
 * @param {string} route - The route being pre-rendered
 */
async function waitForPageReady(page, route) {
  // Wait for network idle
  await page.waitForNetworkIdle({ timeout: 10000 });

  // Wait for react-helmet-async to finish updating meta tags
  await page.waitForFunction(
    () => {
      const metaDescription = document.querySelector('meta[name="description"]');
      const ogTitle = document.querySelector('meta[property="og:title"]');
      return metaDescription && ogTitle;
    },
    { timeout: 5000 }
  );

  // For blog post pages, wait for article content to be rendered
  if (route.startsWith('/blog/') && route !== '/blog') {
    try {
      await page.waitForFunction(
        () => {
          // Wait for prose content (article body) or breadcrumb with Blog link
          const prose = document.querySelector('.prose');
          const blogBreadcrumb = document.querySelector('nav[aria-label="Breadcrumb"]');
          return prose || blogBreadcrumb;
        },
        { timeout: 15000 }
      );
    } catch {
      // If timeout, continue anyway - the page might still have content
      console.log('   ⚠ Warning: Blog content took too long, capturing current state');
    }
  }

  // For blog index, wait for blog cards or empty state
  if (route === '/blog') {
    await page.waitForFunction(
      () => {
        const blogTitle = document.querySelector('h1');
        return blogTitle && blogTitle.textContent.includes('Blog');
      },
      { timeout: 5000 }
    );
  }

  // Give a small buffer for any final updates
  await new Promise(resolve => setTimeout(resolve, 500));
}

/**
 * Pre-render a single route
 * @param {import('puppeteer').Browser} browser - Puppeteer browser instance
 * @param {string} route - Route path
 * @returns {Promise<boolean>} - Success status
 */
async function prerenderRoute(browser, route) {
  const page = await browser.newPage();

  try {
    const url = `http://${PREVIEW_HOST}:${PREVIEW_PORT}${route}`;
    console.log(`📄 Pre-rendering: ${route}`);
    console.log(`   URL: ${url}`);

    // Navigate to page
    await page.goto(url, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    });

    // Wait for page to be fully ready
    await waitForPageReady(page, route);

    // Get fully-rendered HTML
    const html = await page.content();

    // Determine output file path
    let outputPath;
    if (route === '/') {
      outputPath = join(DIST_DIR, 'index.html');
    } else {
      // Create directory for route and add index.html
      // e.g., /privacy-policy -> dist/privacy-policy/index.html
      const routeDir = join(DIST_DIR, route);
      mkdirSync(routeDir, { recursive: true });
      outputPath = join(routeDir, 'index.html');
    }

    // Write rendered HTML to file
    writeFileSync(outputPath, html, 'utf-8');

    // Count words in HTML to verify content
    const textContent = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ');
    const wordCount = textContent.split(' ').filter(w => w.length > 0).length;

    console.log(`   ✓ Generated: ${outputPath}`);
    console.log(`   📊 Word count: ${wordCount}\n`);

    await page.close();
    return true;
  } catch (error) {
    console.error(`   ❌ Failed to pre-render ${route}:`);
    console.error(`   Error: ${error.message}\n`);
    await page.close();
    return false;
  }
}

/**
 * Main pre-rendering function
 */
async function prerender() {
  console.log('\n🚀 Starting static pre-rendering...\n');
  console.log(`Server URL: http://${PREVIEW_HOST}:${PREVIEW_PORT}`);

  // Discover all routes automatically
  console.log('\n📂 Discovering routes from pages/ directory...\n');
  const routes = getRoutePaths({ verbose: true });
  console.log(`\n📊 Found ${routes.length} routes to pre-render\n`);

  // Launch browser
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-web-security'
      ],
    });
    console.log('✓ Browser launched\n');
  } catch (error) {
    console.error('❌ Failed to launch browser:', error.message);
    process.exit(1);
  }

  // Pre-render each route
  let successCount = 0;
  let failCount = 0;

  for (const route of routes) {
    const success = await prerenderRoute(browser, route);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
  }

  await browser.close();

  // Summary
  console.log('━'.repeat(60));
  console.log('✅ Pre-rendering complete!');
  console.log(`   Success: ${successCount}/${routes.length}`);
  if (failCount > 0) {
    console.log(`   Failed: ${failCount}/${routes.length}`);
  }
  console.log('━'.repeat(60) + '\n');

  if (failCount > 0) {
    process.exit(1);
  }
}

// Run pre-rendering
prerender().catch(err => {
  console.error('\n❌ Pre-rendering failed:');
  console.error(err);
  process.exit(1);
});

export { prerender };
