/**
 * One-time content migration helper.
 *
 * Reads the original Astro content collections and adds Eleventy-compatible
 * front matter (slug, collection, permalink) while preserving the original
 * Markdown body and all metadata byte-for-byte.
 *
 * Run with: node scripts/migrate-content.mjs
 */
import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync, existsSync, readdirSync } from 'node:fs';
import { join, basename } from 'node:path';

const ROOT = process.cwd();
const CONTENT_DIR = join(ROOT, 'src', 'content');
const DATA_DIR = join(ROOT, 'src', '_data');

const ARTICLE_COLLECTIONS = ['journal', 'ai-research', 'academy'];

function addFrontMatterFields(source, fields) {
  const normalized = source.replace(/\r\n/g, '\n');
  const match = normalized.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!match) throw new Error('No front matter found');
  const originalFrontMatter = match[1];
  const additions = Object.entries(fields)
    .filter(([key]) => !new RegExp(`^${key}\\s*:`, 'm').test(originalFrontMatter))
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n');
  const newFrontMatter = additions ? `${additions}\n${originalFrontMatter}` : originalFrontMatter;
  const rest = normalized.slice(match[0].length);
  return `---\n${newFrontMatter}\n---\n${rest}`;
}

function listMarkdown(dir) {
  return existsSync(dir) ? readdirSync(dir).filter((name) => name.endsWith('.md')) : [];
}

function migrateArticles() {
  const report = [];
  for (const collection of ARTICLE_COLLECTIONS) {
    const dir = join(CONTENT_DIR, collection);
    for (const file of listMarkdown(dir)) {
      const full = join(dir, file);
      const source = readFileSync(full, 'utf8');
      const slug = basename(file, '.md');
      const updated = addFrontMatterFields(source, {
        slug,
        collection,
        permalink: `/${collection}/${slug}/`,
      });
      writeFileSync(full, updated, 'utf8');
      report.push(`${collection}/${slug}`);
    }
    if (existsSync(dir)) {
      writeFileSync(
        join(dir, `${collection}.11tydata.json`),
        JSON.stringify({ layout: 'layouts/article.njk' }, null, 2) + '\n',
        'utf8'
      );
    }
  }
  return report;
}

function migrateAuthors() {
  const dir = join(CONTENT_DIR, 'authors');
  const report = [];
  for (const file of listMarkdown(dir)) {
    const full = join(dir, file);
    const source = readFileSync(full, 'utf8');
    writeFileSync(full, addFrontMatterFields(source, { permalink: false }), 'utf8');
    report.push(`authors/${basename(file, '.md')}`);
  }
  if (existsSync(dir)) {
    writeFileSync(
      join(dir, 'authors.11tydata.json'),
      JSON.stringify({ permalink: false }, null, 2) + '\n',
      'utf8'
    );
  }
  return report;
}

function migrateData() {
  mkdirSync(DATA_DIR, { recursive: true });
  const sourceDir = join(CONTENT_DIR, 'data');
  if (!existsSync(sourceDir)) return [];
  const report = [];
  for (const file of readdirSync(sourceDir).filter((name) => name.endsWith('.json'))) {
    cpSync(join(sourceDir, file), join(DATA_DIR, file));
    rmSync(join(sourceDir, file));
    report.push(`_data/${file}`);
  }
  rmSync(sourceDir, { recursive: true, force: true });
  return report;
}

const articles = migrateArticles();
const authors = migrateAuthors();
const data = migrateData();

console.log('Migrated articles:');
for (const item of articles) console.log(`  - ${item}`);
console.log('Migrated authors:');
for (const item of authors) console.log(`  - ${item}`);
console.log('Migrated data files:');
for (const item of data) console.log(`  - ${item}`);
console.log(`Total: ${articles.length} articles, ${authors.length} authors, ${data.length} data files.`);
