# Phase 3 — Initial Audit

**Date:** 2026-11-19
**Repository root:** `C:/Users/Pedro/Desktop/GPTCLONE/blog`
**Branch:** `main`
**Starting HEAD:** `298009efdf03d5c820cdf3c99fb095b001a9f548`
**Remote:** `origin` → https://github.com/pedrom3160/blog.git
**Production:** https://pedrom3160.github.io/blog/

The working tree was clean, local and remote `main` matched, and the last three Pages
workflows had completed successfully. The Phase 2 audit and progress reports were read.

## 1. Homepage wording

Found exactly one source occurrence of the sentence:

`src/pages/index.njk:21`

```
O GPTCLONE Blog reúne notas de investigação, diário de projeto e material
educativo sobre IA, publicados à medida que o trabalho avança.
```

The required change is the removal of `GPTCLONE ` only, producing `O Blog reúne...`; the
sentence already ends with a period. The page description and `site.js` use different wording
and do not contain the exact phrase, so they do not need changing.

## 2. Suggestions state

- `src/_data/suggestions.js` supports `web3forms` when `WEB3FORMS_ACCESS_KEY` is present,
  otherwise the optional `endpoint`, otherwise `github`.
- The current production HTML renders `data-mode="github"` and asks for a GitHub account.
- No `WEB3FORMS_ACCESS_KEY`, provider key or form account is present in the repository or
  environment. The destination inbox supplied for this phase is intentionally not committed.
- Web3Forms requires the owner to create a form, verify the destination email and copy the
  emailed access key. This cannot be completed autonomously without bypassing ownership or
  verification.
- The adapter already requires `success === true`, preserves text on failure, keeps optional
  email and provides a GitHub fallback. The remaining work is activation documentation and,
  after the key exists, an owner-controlled real submission.

## 3. Existing publishing architecture

- Articles are Markdown in `src/content/journal/`, `src/content/ai-research/` or
  `src/content/academy/`; `.11tydata.json` supplies `layouts/article.njk`.
- Images live in `src/assets/images/` (passthrough to `/assets/images/`) or the CMS upload
  directory `public/resources/uploads/` (passthrough to `/resources/uploads/`).
- PDFs live in `public/resources/pdfs/` and are catalogued in `src/_data/pdfLibrary.json`.
- Audio lives in `public/resources/audiobooks/` and is catalogued in
  `src/_data/audiobookLibrary.json`; the reusable `audioPlayer` macro is in
  `src/_includes/components/cards.njk`.
- Existing documentation is split between `docs/CONTENT_GUIDE.md` and the advanced,
  proxy-dependent `CONTENT-MANAGEMENT.md`. The latter is not a beginner path while its OAuth
  proxy remains unconfigured.

## 4. Constraints and decisions

- Preserve the four-menu contract, five suggestion categories, Graphite & Vermilion identity,
  existing routes, RSS/sitemap, tests and GitHub Pages deployment.
- Do not add a CMS, backend or large dependency. The existing Decap CMS is advanced/optional,
  not a substitute for a working OAuth proxy; the handbook will make the GitHub web workflow
  the primary path.
- Do not claim email delivery is active. Produce the exact owner steps and keep the honest
  GitHub fallback until `WEB3FORMS_ACCESS_KEY` is available.
- Write the requested handbooks and consolidate the existing content guide around them rather
  than duplicating contradictory instructions.
