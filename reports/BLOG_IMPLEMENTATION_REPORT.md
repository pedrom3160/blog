# GPTCLONE Blog — Implementation Report

**Date:** 2026-11-19
**Branch:** `main`
**Remote:** `https://github.com/pedrom3160/blog.git`
**Commits:** `5005170` (migration), `79fcc0d` (package-lock.json)

---

## 1. Migration Overview

The GPTCLONE Blog was migrated from **Astro** to **Eleventy 3.x** (v3.1.8). The migration is complete and all builds, tests, and validations pass.

**Technology stack:**
- Eleventy 3.x (static site generator)
- Nunjucks templates (`.njk`)
- Markdown content (`.md`) with front matter
- Vanilla JavaScript, Vitest for testing
- Decap CMS for content management
- Node.js `cms-proxy/` for GitHub OAuth authentication on GitHub Pages

**Base path:** `/blog/` served at `https://pedrom3160.github.io/blog/`
**Language:** Português Europeu (pt-PT)

---

## 2. Configuration Files

### `.eleventy.js`
Eleventy configuration with:
- Template formats: `md`, `njk`, `html`, `xml`, `11ty.js`
- Passthrough copies: `src/assets`, `src/styles`, `src/scripts`, `public/resources`, `public/robots.txt`, `src/admin`
- Markdown-it library with table and strikethrough extensions
- Nunjucks filters: `absoluteUrl`, `formatDate` (pt-PT), `isoDate`, `rssDate`, `fileSize`, `sortByDate`, `categories`, `filterByTag`, `relatedArticles`
- `base-path-links` transform: rewrites root-relative URLs to `/blog/` prefixed URLs in generated HTML
- Collections: `journal`, `ai-research`, `academy`, `authors`, `tags`, `articles`, `sitePages`
- Draft filtering: articles with `draft: true` frontmatter excluded from public collections

### `package.json` (v2.0.0)
- Scripts: `dev`, `build`, `preview`, `test`, `validate`, `generate:samples`
- Dependencies: `@11ty/eleventy@^3.1.8`, `markdown-it@^14.1.0`
- Dev dependencies: `jsdom@^26.1.0`, `vitest@^3.2.4`
- Engines: Node.js >= 22

### `scripts/build.mjs`
Clean build script that runs Eleventy via `cmd.cjs` directly (not `npx`).

### `scripts/validate.mjs`
Validation script checking: content integrity, internal links, base path consistency, SEO metadata, RSS feed, sitemap.

### `scripts/generate-samples.mjs`
Generates sample PDFs and WAV tone for library placeholder content.

---

## 3. Content Structure

All content migrated from Astro Markdown to Eleventy Markdown with front matter.

### Journal (4 articles, pt-PT)
| File | Title |
|------|-------|
| `bem-vindo-ao-blog-gptclone.md` | Welcome / announcement |
| `introducao-ao-gptclone.md` | GPTCLONE introduction |
| `sobre-o-jornal-gptclone.md` | About the Journal |
| `ecossistema-gptclone-limites.md` | Ecosystem & limits |

### AI Research (4 articles, pt-PT)
| File | Title |
|------|-------|
| `introducao-ia.md` | Introduction to AI |
| `introducao-llms.md` | Introduction to LLMs |
| `arquitetura-transformers.md` | Transformer architecture |
| `tokenizacao-explicada.md` | Tokenization explained |

### Academy (1 article, pt-PT)
| File | Title |
|------|-------|
| `caminho-aprendizagem-ia.md` | AI learning path |

### Authors (1)
| File | Title |
|------|-------|
| `gptclone-team.md` | GPTCLONE team |

### Data Catalogs (JSON)
| File | Entries |
|------|---------|
| `pdfLibrary.json` | 3 sample PDF entries (CC-BY-4.0) |
| `audiobookLibrary.json` | 3 placeholder audiobook entries |

---

## 4. Pages & Templates

### Pages (Nunjucks)
- `index.njk` — Homepage
- `journal.njk` — Journal listing
- `journal/[slug].njk` — Journal article detail
- `ai-research.njk` — AI Research listing
- `ai-research/[slug].njk` — AI Research article detail
- `academy.njk` — Academy listing
- `academy/[slug].njk` — Academy article detail
- `about.njk` — About page (migrated to `src/content/about.md`)
- `pdf-library.njk` — PDF library listing
- `audiobook-library.njk` — Audiobook library listing
- `404.njk` — 404 page
- `search.njk` — Search page
- `tags-index.njk` — Tags index
- `tags.njk` — Tag detail
- `feed.njk` — RSS feed
- `sitemap.njk` — Sitemap XML
- `search-index.11ty.js` — Search index JSON
- `preview.njk` — CMS preview page

### Layouts (`src/_includes/layouts/`)
- `base.njk` — Base layout with GPTCLONE design tokens
- `article.njk` — Article layout
- `about.njk` — About page layout

### Components (`src/_includes/components/`)
- `listing.njk` — Listing component
- Header, footer, cards, search-modal

---

## 5. CMS (Decap CMS)

- **Interface:** `/admin/` with `src/admin/config.yml` and `src/admin/index.html`
- **Preview:** `/preview/` page (`src/pages/preview.njk`)
- **Auth proxy:** `cms-proxy/` — Node.js server for GitHub OAuth (zero dependencies)
- **Draft support:** `draft: true` frontmatter excludes articles from public collections

Documentation: `CONTENT-MANAGEMENT.md` (405 lines)

---

## 6. Infrastructure

### GitHub Actions (`.github/workflows/deploy.yml`)
- Triggers: push to `main`, `workflow_dispatch`
- Steps: Checkout → Setup Node.js v22 → `npm ci` → `npm test` → `npm run build` → `npm run validate` → Upload artifact → Deploy to GitHub Pages
- Permissions: `contents: read`, `pages: write`, `id-token: write`
- Concurrency: `pages` group, cancel-in-progress disabled

### Static Assets
- `public/robots.txt`
- `public/favicon.svg`
- `public/resources/` (images, fonts, etc.)

---

## 7. Tests (Vitest)

| Test File | Tests |
|-----------|-------|
| `tests/date.test.js` | 9 tests (date utilities) |
| `tests/search.test.js` | 8 tests (search utilities) |
| `tests/dom.test.js` | 3 tests (DOM validation) |
| **Total** | **20 tests** |

---

## 8. Files Removed (Astro-specific)

| File | Reason |
|------|--------|
| `src/content/config.ts` | Astro content config — replaced by Eleventy collections |
| `src/pages/about.njk` | Replaced by `src/content/about.md` + `layouts/about.njk` |
| `src/utils/content.ts` | Astro content utilities — replaced by Eleventy data layer |

---

## 9. Build Output

```
Copied 21, Wrote 53 files in 0.63 seconds (v3.1.8)
```

All 53 files written to `_site/` directory, ready for GitHub Pages deployment.