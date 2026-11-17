import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const SITE_URL = 'https://pedrom3160.github.io/blog/';
const DIST_DIR = join(process.cwd(), 'dist');
const OUT_FILE = join(DIST_DIR, 'sitemap.xml');

function getHtmlFiles(dir) {
  const results = [];
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...getHtmlFiles(fullPath));
    } else if (entry.name.endsWith('.html')) {
      results.push(fullPath);
    }
  }
  return results;
}

function pathToUrl(filePath) {
  const relative = filePath.slice(DIST_DIR.length + 1);
  let urlPath = relative.replace(/\\/g, '/');
  // Root index.html maps to "/"
  if (urlPath === 'index.html') {
    return SITE_URL;
  }
  // Remove index.html for directory URLs
  if (urlPath.endsWith('/index.html')) {
    urlPath = urlPath.replace(/\/index\.html$/, '/');
  } else if (urlPath.endsWith('.html')) {
    urlPath = urlPath.replace(/\.html$/, '/');
  }
  return SITE_URL + urlPath;
}

const htmlFiles = getHtmlFiles(DIST_DIR);
const urls = htmlFiles.map(pathToUrl).sort();

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url><loc>${url}</loc></url>`).join('\n')}
</urlset>
`;

writeFileSync(OUT_FILE, sitemap);
console.log(`Sitemap generated: ${urls.length} URLs written to ${OUT_FILE}`);
