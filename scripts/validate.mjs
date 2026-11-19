// Validates the built _site output: page inventory, assets, base-path
// correctness, internal links, SEO metadata, navigation contract and basic
// accessibility invariants. Run: node scripts/validate.mjs
// Exits 1 on any failure.
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import suggestions from '../src/_data/suggestions.js';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const site = join(root, '_site');
const BASE = '/blog';
const SITE_URL = 'https://pedrom3160.github.io/blog/';

const errors = [];
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

function cleanUrl(url) {
  return url.split('#')[0].split('?')[0];
}

function assetExists(url) {
  const clean = cleanUrl(url);
  let rel = clean;
  if (clean.startsWith(BASE + '/')) rel = clean.slice(BASE.length);
  return existsSync(join(site, rel));
}

// ---------------------------------------------------------------------------
// 1. Expected page inventory
// ---------------------------------------------------------------------------
const EXPECTED_DIRS = [
  '', '/about', '/suggestions', '/donations', '/journal', '/ai-research', '/academy',
  '/pdf-library', '/audiobook-library', '/search', '/tags',
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
for (const asset of ['/styles/main.css', '/scripts/main.js', '/scripts/suggestions.js', '/assets/favicon.svg', '/assets/images/social-card.png']) {
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
if (!canonicals.length) fail('No canonical URLs found');
if (canonicals.some((c) => !c.startsWith(SITE_URL) || c.includes('/blog/blog'))) {
  fail('Canonical URLs malformed: ' + canonicals.filter((c) => !c.startsWith(SITE_URL) || c.includes('/blog/blog')).join(', '));
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
  const rel = cleanUrl(l).slice(BASE.length) || '/';
  if (existsSync(join(site, rel))) return false;
  const dir = rel.endsWith('/') ? rel : rel + '/';
  return !existsSync(join(site, dir, 'index.html'));
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
if (locs.some((l) => !l.startsWith(SITE_URL))) fail('Sitemap contains URLs outside https://pedrom3160.github.io/blog/');
if (locs.some((l) => l.includes('/blog/blog'))) fail('Sitemap contains doubled /blog/blog URLs');
if (!locs.includes(SITE_URL + 'donations/')) fail('Sitemap is missing /donations/');
if (!locs.includes(SITE_URL + 'about/')) fail('Sitemap is missing /about/');
if (!locs.includes(SITE_URL + 'suggestions/')) fail('Sitemap is missing /suggestions/');
if (locs.some((l) => l.endsWith('/404.html'))) fail('Sitemap must not include 404.html');
const notFound = readFileSync(join(site, '404.html'), 'utf8');
if (!/<meta name="robots" content="noindex/.test(notFound)) fail('404 page must be noindex');
const rss = readFileSync(join(site, 'rss.xml'), 'utf8');
if (rss.includes('/blog/blog')) fail('RSS contains doubled /blog/blog URLs');
if (!rss.startsWith('<?xml')) fail('rss.xml is not XML');

// ---------------------------------------------------------------------------
// 7. Navigation contract — exactly Blog, About, Suggestions, Donations
// ---------------------------------------------------------------------------
const REQUIRED_NAV = ['Blog', 'About', 'Suggestions', 'Donations'];
const navPagesChecked = [];
for (const file of htmlFiles) {
  const rel = file.slice(site.length).replaceAll('\\', '/');
  if (rel.startsWith('/admin/')) continue;
  const html = readFileSync(file, 'utf8');
  const nav = html.match(/<nav class="primary-nav"[^>]*>([\s\S]*?)<\/nav>/);
  if (!nav) {
    fail(`Primary navigation missing in ${rel}`);
    continue;
  }
  const labels = [...nav[1].matchAll(/<a[^>]*class="nav-link[^"]*"[^>]*>([^<]*)<\/a>/g)].map((m) => m[1].trim());
  if (labels.length !== REQUIRED_NAV.length) {
    fail(`Primary navigation must have exactly ${REQUIRED_NAV.length} items in ${rel} (found ${labels.length}: ${labels.join(', ')})`);
  } else if (REQUIRED_NAV.some((label, i) => labels[i] !== label)) {
    fail(`Primary navigation labels must be ${REQUIRED_NAV.join(' · ')} in ${rel} (found: ${labels.join(', ')})`);
  }
  navPagesChecked.push(rel);
}
if (!navPagesChecked.length) fail('No pages were checked for primary navigation');

// Suggestions page: real route, real form, no fake success path.
const suggestionsHtml = readFileSync(join(site, 'suggestions', 'index.html'), 'utf8');
const suggestionsNav = suggestionsHtml.match(/<nav class="primary-nav"[^>]*>([\s\S]*?)<\/nav>/);
if (!suggestionsNav || !suggestionsNav[1].includes('aria-current="page"')) {
  fail('Suggestions page does not mark its primary navigation item as current');
}
for (const field of ['category', 'title', 'body', 'name']) {
  if (!new RegExp(`name="${field}"`).test(suggestionsHtml)) fail(`Suggestions form is missing the "${field}" field`);
}
if (!/id="suggestion-form"/.test(suggestionsHtml)) fail('Suggestions form is missing its id');
if (!/data-repo="pedrom3160\/blog"/.test(suggestionsHtml)) fail('Suggestions form is missing its GitHub repository');
const submission = suggestions.submission;
if (submission.mode === 'github') {
  if (!/action="https:\/\/github\.com\/pedrom3160\/blog\/issues\/new"/.test(suggestionsHtml)) {
    fail('Suggestions form has no working GitHub issue fallback action');
  }
} else if (!new RegExp(`action="${submission.endpoint.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`).test(suggestionsHtml)) {
  fail('Suggestions form action does not target the configured provider');
}
if (!new RegExp(`data-mode="${submission.mode}"`).test(suggestionsHtml)) {
  fail(`Suggestions form mode is not rendered as "${submission.mode}"`);
}
if (!/id="suggestion-status"[^>]*role="status"/.test(suggestionsHtml) || !/aria-live="polite"/.test(suggestionsHtml)) {
  fail('Suggestions form status is not an accessible live region');
}
if (!/id="suggestion-name"[\s\S]{0,500}?aria-describedby="[^"]*error-name/.test(suggestionsHtml)) {
  fail('Suggestions name field is not linked to its error message');
}
if (submission.mode === 'github') {
  if (/name="email"/.test(suggestionsHtml)) fail('Public GitHub mode must not collect email');
} else {
  if (!/name="email"/.test(suggestionsHtml)) fail('Provider mode must offer the optional email field');
  if (!/id="suggestion-email"[\s\S]{0,500}?aria-describedby="[^"]*error-email/.test(suggestionsHtml)) {
    fail('Suggestions email field is not linked to its error message');
  }
  if (!/data-endpoint="https:\/\/[^"]+"/.test(suggestionsHtml)) fail('Provider mode has no https endpoint');
  if (submission.mode === 'web3forms' && (!/data-access-key="[^"]+"/.test(suggestionsHtml) || !/name="access_key" value="[^"]+"/.test(suggestionsHtml))) {
    fail('Web3Forms mode has no public access key');
  }
}
const suggestionsText = suggestionsHtml.replaceAll('&amp;', '&').replaceAll('&#39;', "'");
for (const copy of [
  'Um nome ainda por encontrar',
  'O GPTCLONE é um nome temporário.',
  'O nome pode ser temporário. A visão não.',
  'Ideias & Funcionalidades',
  'O que pode sugerir?',
  submission.mode === 'github' ? 'Preparar sugestão no GitHub' : 'Enviar sugestão',
]) {
  if (!suggestionsText.includes(copy)) fail(`Suggestions page is missing expected copy: ${copy}`);
}
const categoryCards = (suggestionsHtml.match(/class="suggestion-card"/g) || []).length;
if (categoryCards !== 5) fail(`Suggestions page must render 5 categories (found ${categoryCards})`);
if (!/Última revisão desta página: [^<]{8,}/.test(suggestionsText)) {
  fail('Suggestions page is missing a rendered last-reviewed date');
}

// The site must not present itself as a team or use the retired promo headline.
const FORBIDDEN = [
  /Equipa GPTCLONE/i,
  /Público e gratuito\s*[·—-]\s*Sem registo necessário/i,
  /público e gratuito, sem registo/i,
  /gptclone-team/i,
];
for (const file of htmlFiles) {
  const rel = file.slice(site.length).replaceAll('\\', '/');
  if (rel.startsWith('/admin/')) continue;
  const html = readFileSync(file, 'utf8');
  for (const pattern of FORBIDDEN) {
    if (pattern.test(html)) fail(`Forbidden identity text in ${rel}: ${pattern}`);
  }
}

// ---------------------------------------------------------------------------
// 8. Accessibility / document invariants
// ---------------------------------------------------------------------------
for (const file of htmlFiles) {
  const rel = file.slice(site.length).replaceAll('\\', '/');
  if (rel.startsWith('/admin/')) continue;
  const html = readFileSync(file, 'utf8');

  if (!/<html[^>]*lang="pt-PT"/.test(html)) fail(`Missing lang="pt-PT" in ${rel}`);
  if (!/<main[^>]*id="main"/.test(html)) fail(`Missing <main id="main"> in ${rel}`);

  const h1s = (html.match(/<h1[\s>]/g) || []).length;
  if (h1s !== 1) fail(`Expected exactly one <h1> in ${rel} (found ${h1s})`);

  for (const m of html.matchAll(/<img\b[^>]*>/g)) {
    if (!/\balt=/.test(m[0])) fail(`Image without alt attribute in ${rel}: ${m[0].slice(0, 90)}`);
  }

  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  const duplicate = ids.find((id, index) => ids.indexOf(id) !== index);
  if (duplicate) fail(`Duplicate id "${duplicate}" in ${rel}`);

  for (const label of html.matchAll(/<label[^>]*\bfor="([^"]+)"[^>]*>/g)) {
    if (!ids.includes(label[1])) fail(`Label for missing id "${label[1]}" in ${rel}`);
  }

  if (html.includes('id="search-results"') && !/id="search-results"[^>]*role="(region|status)"/.test(html)) {
    fail(`Search results live region has no supporting role in ${rel}`);
  }

  const title = html.match(/<title>([^<]*)<\/title>/);
  if (!title || title[1].trim().length < 10) fail(`Missing or too-short <title> in ${rel}`);
  const description = html.match(/<meta name="description" content="([^"]*)"/);
  if (!description || description[1].trim().length < 40) fail(`Missing or too-short meta description in ${rel}`);
}

// ---------------------------------------------------------------------------
// 9. Structured data on articles
// ---------------------------------------------------------------------------
for (const slug of CONTENT_SLUGS) {
  const file = join(site, slug.replace(/^\//, ''), 'index.html');
  const html = readFileSync(file, 'utf8');
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  if (!blocks.length) {
    fail(`No JSON-LD in ${slug}`);
    continue;
  }
  const parsed = [];
  for (const block of blocks) {
    try {
      parsed.push(JSON.parse(block[1]));
    } catch (error) {
      fail(`Invalid JSON-LD in ${slug}: ${error.message}`);
    }
  }
  const types = parsed.map((entry) => entry['@type']);
  if (!types.includes('BlogPosting')) fail(`Missing BlogPosting JSON-LD in ${slug}`);
  if (!types.includes('BreadcrumbList')) fail(`Missing BreadcrumbList JSON-LD in ${slug}`);
  const posting = parsed.find((entry) => entry['@type'] === 'BlogPosting');
  if (posting && !/^https:\/\//.test(String(posting.image || ''))) {
    fail(`BlogPosting image must be absolute in ${slug}`);
  }
}

// ---------------------------------------------------------------------------
// 10. No leaked debug artifacts / raw JSON
// ---------------------------------------------------------------------------
if (existsSync(join(site, 'content'))) fail('_site/content directory should not be emitted');
const debugLeak = files.find((f) => f.includes('debug'));
if (debugLeak) fail('Debug page emitted: ' + debugLeak);

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------
console.log(`Validated ${files.length} files (${htmlFiles.length} HTML) in _site/`);
console.log(`Internal links checked: ${localLinks.size}`);
console.log(`Navigation contract checked on ${navPagesChecked.length} pages: ${REQUIRED_NAV.join(' · ')}`);
if (errors.length) {
  console.error('\nVALIDATION FAILED:\n  ' + errors.join('\n  '));
  process.exit(1);
}
console.log('All validation checks passed.');
