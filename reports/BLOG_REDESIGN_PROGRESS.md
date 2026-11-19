# GPTCLONE Blog — Redesign Progress Report

**Date:** 2026-11-19
**Project:** `C:\Users\Pedro\Desktop\GPTCLONE\blog`
**Branch:** `main`
**Baseline HEAD:** `56d016a0b3dc498031f70b026a3cf1ae38337817`
**Repository:** https://github.com/pedrom3160/blog
**Production:** https://pedrom3160.github.io/blog/

---

## 1. Objective

Redesign the GPTCLONE Blog end to end without discarding Kilo's Eleventy migration or Cline's
content, enforce exactly three primary menus (**Blog · About · Donations**), add the missing About
and Donations experiences, and publish the verified result to GitHub Pages.

---

## 2. Design direction

**Identity: “Graphite & Vermilion” — an independent research quarterly, not a generic tech theme.**

| Decision | Rationale |
|----------|-----------|
| Warm paper light theme as default, graphite dark counterpart | Distinct from the previous dark-purple “aurora” look; editorial and readable |
| Fraunces display serif + Inter + IBM Plex Mono | A publication voice (serif), neutral reading (sans), labels and metadata (mono) |
| Hairline rules, near-square corners, numbering (`01 — Em destaque`) | Structure and rhythm instead of cards with heavy shadows |
| Vermilion accent `#b5391b` / `#ff7a4f` | Distinctive, AA-contrast on both paper and graphite |
| Dark “plates” for article covers | A coherent image system independent of the old purple SVGs |
| Editorial hero with “Nesta edição” index card | Makes the homepage feel like an issue, not a template |
| Full-width graphite support band | A deliberate break in the page rhythm and a clear route to Donations |

All tokens live in `src/styles/main.css` (`:root` and `[data-theme='dark']`), with no CSS framework.

---

## 3. Navigation contract

`src/_data/navigation.js` contains exactly:

```js
[
  { label: 'Blog', url: '/', key: 'blog' },
  { label: 'About', url: '/about/', key: 'about' },
  { label: 'Donations', url: '/donations/', key: 'donations' },
]
```

- Active state is computed server-side by the `isNavActive` filter; “Blog” owns all content routes
  (`/`, `/journal/`, `/ai-research/`, `/academy/`, libraries, `/search/`, `/tags/`).
- Sections, tags, search and pagination remain reachable as content discovery on the homepage and
  in the footer. They are deliberately **not** primary menus.
- `scripts/validate.mjs` fails the build if any page has more or fewer than three primary links or
  if the labels differ.

---

## 4. Implementation summary

### Homepage (`src/pages/index.njk`)

- Editorial hero: statement headline, mission lead, two CTAs, live counts (articles, tags, licence).
- “Nesta edição” index card with the three most recent articles, edition month, archive anchor and
  search trigger.
- Featured article (large plate + title + description + meta) and three compact “Também nesta
  edição” rows.
- “Últimas publicações” archive grid (newest six).
- “Áreas de conteúdo” index rows (Jornal, Investigação, Academy, Biblioteca PDF, Audiolivros) with
  real counts from collections/catalogs.
- Tag cloud with counts, generated from the articles.
- Support band linking to About/Donations.

### Article experience (`src/_includes/layouts/article.njk`)

Breadcrumbs; kicker + section/category; single `<h1>`; description as subtitle; author avatar, date
and reading time; share actions (Facebook, X, LinkedIn, copy link); cover figure with caption and
meaningful alt; sticky desktop TOC and collapsible mobile TOC; heading anchors; scrollspy; reading
progress bar; prose typography with drop cap; styled tables/quotes/lists; copy-code buttons;
Prism syntax highlighting for labelled fences; tag list; previous/next navigation; related
articles; `BlogPosting` + `BreadcrumbList` JSON-LD; raster social image fallback.

### About (`src/content/about.md` + `layouts/about.njk`)

Hero statement, mission/vision statements, four principles (abertura, rigor, independência, sem
barreiras), prose on what GPTCLONE is and is not, research interests, long-term direction, licence,
project fact card and a Donations CTA. No invented milestones, partnerships or metrics.

### Donations (`src/pages/donations.njk` + `src/_data/donations.js`)

Motivation, four funding priorities, transparency commitments, a data-driven channels section with
an honest empty state (“no active channels”), alternatives to donating, FAQ and last-review date.
No payment URL, IBAN, card number or wallet address is fabricated. Configuration is documented in
`src/_data/donations.js` and `docs/DONATIONS.md`.

### Visual assets

- Nine article covers rewritten as a coherent series (graphite plate, hairline grid, vermilion and
  cream geometry, numeric index, `GPTCLONE / JOURNAL` label) — same filenames, no content changes.
- New favicon and a 1392×752 raster social card (`social-card.png`) used for OG/Twitter and
  JSON-LD when the article image is an SVG.

### Responsive and interaction work

Mobile sheet navigation with `aria-expanded`, focus-visible states, search modal with focus trap and
Escape handling, theme persistence, client-side filters, TOC, progress, copy actions and the audio
player. Reduced-motion and high-contrast media queries included.

---

## 5. Technical and SEO changes

- `shortDate` / `monthYear` filters generate deterministic Portuguese editorial dates instead of
  ICU numeric short dates.
- `socialImage` filter prevents SVG-only OG previews.
- `absoluteUrl` now normalises accidental `/blog/` prefixes.
- Sitemap rewritten: explicit static routes, `/donations/`, tag pages and articles; `404.html`
  removed.
- Canonicals, OG/Twitter metadata, `WebSite` JSON-LD, article JSON-LD and breadcrumb JSON-LD.
- RSS retained with copyright and categories.
- Prism added as the only new runtime dependency, used at build time only.
- Decap CMS About fields updated to the new front matter (kicker, heading, lead, principles, facts)
  so CMS edits cannot silently drop the redesigned structure; optional `imageAlt` added to article
  collections.

---

## 6. Verification performed

| Check | Result |
|-------|--------|
| `npm run build` | PASS — 54 files written to `_site/` |
| `npm run validate` | PASS — 75 files, 51 HTML, 64 internal links, nav contract on 50 pages |
| `npm test` | PASS — 4 files, 27 tests |
| Overflow check 375 / 430 / 768 / 1024 / 1440 | PASS — `scrollWidth ≤ innerWidth`, no offending elements |
| Mobile navigation | PASS — 3 links, `aria-expanded` toggles, Escape closes |
| Search modal | PASS — opens, traps focus, 4 results for “transformer”, results link to content |
| Copy code | PASS — button injected, label changes to “Copiado” |
| Theme toggle | PASS — light ↔ dark, persisted in `localStorage` |
| TOC | PASS — 9–11 links, rail at ≥1024, collapsible details on mobile |
| Article structure | PASS — one `<h1>`, 11 heading anchors, JSON-LD valid |
| Contrast | PASS — accent 5.51:1, muted 5.26:1, secondary 9.75:1, dark accent 7.39:1 |
| Visual review | Desktop (1440), tablet (768/1024) and mobile (375) reviewed in-browser; homepage, About, Donations, article, PDF library |

**Not checked:** Safari/Firefox rendering, screen-reader announcement testing, Lighthouse scores,
and the Decap CMS admin (it needs the external OAuth proxy).

---

## 7. Preservation of previous work

- All nine articles, their slugs, titles, descriptions, images, tags and URLs untouched (only the
  duplicated in-body `<h1>` line was removed).
- Eleventy collections, base-path transform, draft filtering, CMS, OAuth proxy, tests, build and
  deploy workflow remain in place and are extended, not replaced.
- Kilo's and Cline's reports untouched. `reports/BLOG_AGENT_AUDIT.md` records the baseline.
- Untracked artefacts from the baseline (`build-out.txt`, `reports/BLOG_RECOVERY_REPORT.md`) are not
  deleted; `build-out.txt` is now ignored as a local log.

---

## 8. Known limitations

1. One legacy article contains LaTeX-style math (`$...$`) that markdown-it renders literally. It is
   pre-existing content and was not rewritten.
2. All nine articles share the same `pubDate`, so “newest” ordering is stable but not
   distinguishable by date.
3. The Decap CMS still needs an externally deployed OAuth proxy; it is not part of this mission.
4. Donation channels remain intentionally empty until a verified channel exists.

---

## 9. Publication and deployment

### Commits

| Commit | Content |
|--------|---------|
| `0972eb5` | Redesign implementation (59 files, +4722/−1721) |
| `b1b9b88` | Audit, progress report and Kilo's preserved recovery report |

Pushed without force: `56d016a..b1b9b88  main -> main` to
https://github.com/pedrom3160/blog. At deployment time `git rev-parse HEAD` and
`git rev-parse origin/main` both returned `b1b9b88b39fb154999eafd438c36da616c559ec0`.

### GitHub Actions

- Run: https://github.com/pedrom3160/blog/actions/runs/44574246100
- Workflow: “Deploy GPTCLONE Blog to GitHub Pages”
- Status: **completed / success** (triggered 2026-11-19T17:10:18Z)

### Production verification (https://pedrom3160.github.io/blog/)

| Check | Result |
|-------|--------|
| `/`, `/about/`, `/donations/` | 200, new design, one `<h1>`, `lang="pt-PT"`, canonical |
| Section pages (`/journal/`, `/ai-research/`, `/academy/`, `/pdf-library/`, `/audiobook-library/`, `/search/`, `/tags/`) | all 200 |
| Article page | 200, `BlogPosting` + breadcrumbs, OG/Twitter image resolves to `social-card.png` |
| Primary navigation | exactly 3 links on all 12 sampled pages: Blog · About · Donations |
| Images | 0 `<img>` without `alt` on all sampled pages |
| CSS / JS / fonts / covers | 200, no console errors, no failed requests in the browser |
| `/assets/images/social-card.png` | 200, `image/png`, 58 189 bytes |
| `/rss.xml` | 200, `application/xml` |
| `/sitemap.xml` | includes `/blog/donations/`, excludes `404.html` |
| `/blog/nao-existe-xyz/` | HTTP 404 with the branded error page |
| Mobile 375 px | no horizontal overflow (`scrollWidth 358`), menu button exposes 3 links, Donations page stacks correctly |
| Visual review | deployed homepage (light/dark), Donations and article at 1440 px; Donations at 375 px |

A final documentation-only commit records this section; the code served by GitHub Pages is the
implementation from commit `0972eb5`, deployed via `b1b9b88`.
