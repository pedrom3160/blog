// Validates the built _site output: content counts, asset existence, base-path
// correctness, internal links, RSS/sitemap/SEO basics. Run: node scripts/validate.mjs
// Exits 1 on any failure.
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const site = join(root, '_site');
const BASE = '/blog';

const errors = [];
const warnings = [];
const fail = (msg) => errors.push(msg);

// Collect all files under _site
const files = [];
(function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else files.push(full);
  }
})(site);

const htmlFiles = files.filter((f) => f.endsWith('.html'));
const allFiles = files.map((f) => '/' + f.slice(site.length + 1).replaceAll('\\', '/'));

function assetExists(url) {
  const clean = url.split('#')[0].split('?')[0];
  let rel = clean;
  if (clean.startsWith(BASE + '/')) rel = clean.slice(BASE.length);
  return existsSync(join(site, rel));
}

// ---------------------------------------------------------------------------
// 1. Expected page inventory
// ---------------------------------------------------------------------------
const EXPECTED_DIRS = [
  '', '/about', '/journal', '/ai-research', '/academy', '/pdf-library',
  '/audiobook-library', '/search', '/tags',
];
const CONTENT_SLUGS = [
  '/journal/bem-vindo-ao-blog-gptclone', '/journal/introducao-ao-gptclone',
  '/journal/sobre-o-jornal-gptclone', '/journal/ecossistema-gptclone-limites',
  '/ai-research/introducao-ia', '/ai-research/introducao-llms',
  '/ai-research/arquitetura-transformers', '/ai-research/tokenizacao-explicada',
  '/academy/caminho-aprendizagem-ia',
];
const check = (paths, kind) => {
  for (const p of paths) {
    const idx = p === '' ? '/index.html' : p + '/index.html';
    if (!existsSync(join(site, idx))) fail(`Missing ${kind} page: ${p} (${idx} not found)`);
  }
};
check(EXPECTED_DIRS, 'section');
check(CONTENT_SLUGS, 'article');
if (!existsSync(join(site, '404.html'))) fail('Missing /404.html');
if (!existsSync(join(site, 'rss.xml'))) fail('Missing /rss.xml');
if (!existsSync(join(site, 'sitemap.xml'))) fail('Missing /sitemap.xml');
if (!existsSync(join(site, 'search-index.json'))) fail('Missing /search-index.json');

// ---------------------------------------------------------------------------
// 2. Assets copied
// ---------------------------------------------------------------------------
for (const asset of ['/styles/main.css', '/scripts/main.js', '/assets/favicon.svg']) {
  if (!assetExists(asset)) fail(`Missing asset: ${asset}`);
}

// ---------------------------------------------------------------------------
// 3. Base path correctness in HTML
// ---------------------------------------------------------------------------
const badRootUrls = [];
const doubleBase = [];
const canonicals = [];
for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8');
  for (const m of html.matchAll(/(?:href|src|poster|srcset)="([^"]*)"/g)) {
    const url = m[1];
    if (url.startsWith('/') && !url.startsWith(BASE + '/') && !url.startsWith('//')) {
      badRootUrls.push(`${file.slice(site.length)} -> ${url}`);
    }
    if (url.startsWith(BASE + '/blog')) doubleBase.push(`${file.slice(site.length)} -> ${url}`);
  }
  const canon = html.match(/rel="canonical" href="([^"]*)"/);
  if (canon) canonicals.push(canon[1]);
}
if (badRootUrls.length) fail(`Root-relative URLs missing /blog prefix (${badRootUrls.length}):\n  ` + badRootUrls.slice(0, 12).join('\n  '));
if (doubleBase.length) fail(`Doubled /blog/blog URLs (${doubleBase.length}):\n  ` + doubleBase.slice(0, 12).join('\n  '));
if (canonicals.some((c) => !c.startsWith('https://pedrom3160.github.io/blog/') || c.includes('/blog/blog'))) {
  fail('Canonical URLs malformed: ' + canonicals.filter((c) => !c.startsWith('https://pedrom3160.github.io/blog/') || c.includes('/blog/blog')).join(', '));
}

// ---------------------------------------------------------------------------
// 4. Internal link resolution
// ---------------------------------------------------------------------------
const localLinks = new Set();
for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8');
  for (const m of html.matchAll(/href="([^"]*)"/g)) {
    const url = m[1];
    if (url.startsWith(BASE + '/')) localLinks.add(url);
  }
}
const broken = [...localLinks].filter((l) => {
  if (l.endsWith('.xml') || l.endsWith('.json')) return !assetExists(l);
  let rel = l.slice(BASE.length) || '/';
  if (!rel.endsWith('/')) rel += '/';
  const target = rel.endsWith('/') ? rel + 'index.html' : rel;
  if (existsSync(join(site, target))) return false;
  const noIndex = join(site, rel.replaceAll('/', '\\'));
  return !existsSync(noIndex);
});
if (broken.length) fail(`Broken internal links (${broken.length}):\n  ` + broken.slice(0, 15).join('\n  '));

// ---------------------------------------------------------------------------
// 5. Resources referenced by catalogs exist
// ---------------------------------------------------------------------------
const pdfLibrary = JSON.parse(readFileSync(join(root, 'src', '_data', 'pdfLibrary.json'), 'utf8'));
for (const doc of pdfLibrary.documents) {
  for (const key of ['downloadUrl', 'previewUrl']) {
    if (doc[key] && !assetExists(doc[key])) fail(`PDF catalog: ${doc.id} ${key} -> ${doc[key]} does not exist in _site`);
  }
}
const audioLibrary = JSON.parse(readFileSync(join(root, 'src', '_data', 'audiobookLibrary.json'), 'utf8'));
for (const item of audioLibrary.audiobooks) {
  if (item.streamUrl && !assetExists(item.streamUrl)) fail(`Audiobook catalog: ${item.id} streamUrl -> ${item.streamUrl} missing`);
  if (item.downloadUrl && !assetExists(item.downloadUrl)) fail(`Audiobook catalog: ${item.id} downloadUrl -> ${item.downloadUrl} missing`);
}

// ---------------------------------------------------------------------------
// 6. RSS / sitemap URL sanity
// ---------------------------------------------------------------------------
const sitemap = readFileSync(join(site, 'sitemap.xml'), 'utf8');
const locs = [...sitemap.matchAll(/<loc>([^<]*)<\/loc>/g)].map((m) => m[1]);
if (locs.some((l) => !l.startsWith('https://pedrom3160.github.io/blog/'))) fail('Sitemap contains URLs outside https://pedrom3160.github.io/blog/');
if (locs.some((l) => l.includes('/blog/blog'))) fail('Sitemap contains doubled /blog/blog URLs');
const rss = readFileSync(join(site, 'rss.xml'), 'utf8');
if (rss.includes('/blog/blog')) fail('RSS contains doubled /blog/blog URLs');
if (!rss.startsWith('<?xml')) fail('rss.xml is not XML');

// ---------------------------------------------------------------------------
// 7. No leaked debug artifacts / raw JSON
// ---------------------------------------------------------------------------
if (existsSync(join(site, 'content'))) fail('_site/content directory should not be emitted');
const debugLeak = files.find((f) => f.includes('debug'));
if (debugLeak) fail('Debug page emitted: ' + debugLeak);

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------
console.log(`Validated ${files.length} files (${htmlFiles.length} HTML) in _site/`);
console.log(`Internal links checked: ${localLinks.size}`);
if (warnings.length) console.log('Warnings:\n  ' + warnings.join('\n  '));
if (errors.length) {
  console.error('\nVALIDATION FAILED:\n  ' + errors.join('\n  '));
  process.exit(1);
}
console.log('All validation checks passed.');
