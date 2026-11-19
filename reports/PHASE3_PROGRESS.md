# Phase 3 — Progress Report

**Date:** 2026-11-19
**Repository:** https://github.com/pedrom3160/blog
**Branch:** `main`
**Starting HEAD:** `298009efdf03d5c820cdf3c99fb095b001a9f548`
**Production:** https://pedrom3160.github.io/blog/

Initial repository audit and constraints: see `reports/PHASE3_AUDIT.md`.

## 1. Homepage copy

Changed the single source occurrence in `src/pages/index.njk`:

Before:

> O GPTCLONE Blog reúne notas de investigação, diário de projeto e material educativo sobre IA, publicados à medida que o trabalho avança.

After:

> O Blog reúne notas de investigação, diário de projeto e material educativo sobre IA, publicados à medida que o trabalho avança.

Only `GPTCLONE ` was removed; the period and the rest of the sentence are unchanged. No other
source/metadata occurrence of the exact phrase was found. `npm run validate` now checks the
corrected sentence and rejects the old wording on the homepage.

## 2. Suggestions / Web3Forms status

The existing adapter was reviewed and kept: `web3forms` mode when
`WEB3FORMS_ACCESS_KEY` exists, explicit `success === true` confirmation, optional email,
preserved text on failure and a prefilled GitHub fallback.

**Current production remains `github`.** Creating the Web3Forms form, verifying the destination
inbox and receiving the access key requires the owner. No key or account was invented. The
destination address supplied for this phase was deliberately not written into the public
repository.

Activation is documented in `docs/SUGGESTIONS.md` with the exact settings page:

```
https://github.com/pedrom3160/blog/settings/variables/actions
```

Repository variable: `WEB3FORMS_ACCESS_KEY` (a variable, not a secret; the key is public by
design). After it is added and the Pages workflow runs, the owner must make a controlled real
submission and confirm the inbox; `data-mode="web3forms"` alone is not proof of delivery.

## 3. Publishing documentation

Created:

- [`docs/PUBLISHING_GUIDE.md`](../docs/PUBLISHING_GUIDE.md) — overview, quick start, workflow,
  organization, simplification decisions and checklist.
- [`docs/ARTICLES_GUIDE.md`](../docs/ARTICLES_GUIDE.md) — complete frontmatter, Markdown,
  images, code, references, preview, publishing, updating and removal.
- [`docs/PDF_LIBRARY_GUIDE.md`](../docs/PDF_LIBRARY_GUIDE.md) — storage, JSON schema, download
  and browser preview, size limits and alternatives.
- [`docs/AUDIOBOOKS_GUIDE.md`](../docs/AUDIOBOOKS_GUIDE.md) — formats, catalog schema, player,
  chapters, transcripts, storage and accessibility.

Updated:

- `docs/CONTENT_GUIDE.md` — consolidated into a short technical reference pointing to the
  handbooks instead of duplicating the step-by-step instructions.
- `README.md` — new **Publicar e manter conteúdo** index.
- `CONTENT-MANAGEMENT.md` — top note directing beginners to the new guides; the advanced Decap
  CMS remains optional and still requires its OAuth proxy.
- `docs/SUGGESTIONS.md` — exact activation URL, private destination handling and verification
  criteria.

No new CMS, SaaS dependency, backend or publishing interface was introduced. The GitHub web
editor + Markdown is the primary path; the existing Decap CMS is documented as optional because
its OAuth proxy is not configured.

## 4. Functional change: PDF preview links

The PDF catalog data already had `previewUrl`, but the card only offered a download. The card now
shows an accessible **Ver PDF** link (new tab, `noopener noreferrer`) when `previewUrl` exists,
alongside **Descarregar**. Action labels use `Ver PDF: <title>` / `Descarregar: <title>` so the
visible label remains part of the accessible name. This uses existing catalog data and does not
change the layout system or add dependencies.

A local Lighthouse pass caught a skipped heading level (`h3` cards without a preceding `h2`) and
the initial `Ver <title> em PDF` accessible name not containing the visible “Ver PDF” label.
Both were fixed with hidden section headings and the current labels; the PDF page now scores 96
accessibility with only the known decorative footer wordmark contrast finding.

## 5. Tests performed

| Check | Result |
|---|---|
| `npm run build` | PASS — 55 files |
| `npm run validate` | PASS — 77 files, 52 HTML, 65 links, four-menu contract on 51 pages |
| `npm test` | PASS — 46 tests, 5 files |
| Homepage copy | PASS — new sentence, old wording absent |
| Fake-key provider build | PASS — `data-mode="web3forms"`, optional email, hidden public key, provider action |
| Fake-key provider validation | PASS |
| Provider success (mocked fetch) | PASS — payload had key/category/title/message/email; only `success:true` reset the form and showed the sent status |
| Provider failure (HTTP 200, `success:false`) | PASS — content preserved, error status, prefilled GitHub fallback |
| Privacy of fallback | PASS — no email in the prefilled GitHub URL |
| Default build restored | PASS — `data-mode="github"`, no email field |
| PDF cards | PASS — 3 cards, each with Ver PDF and Descarregar; all 6 linked files returned 200 |
| PDF Lighthouse (local) | 96 accessibility / 100 best practices / 100 SEO; only footer-wordmark contrast |
| Audio page | PASS — 3 catalog cards, player, audio file returned 200 |
| Mobile menu | PASS — first link focused on open; Escape returned focus to toggle |
| Homepage layout | PASS — 375 px `scrollWidth` 358, no overflow |
| PDF layout | PASS — 375→358, 430→413, 768→751, 1024→1007, 1440→1423; action row not overflowing |
| Audio layout | PASS — 375 px, no overflow |
| Documentation targets | PASS — new guide/README relative targets exist; sample content paths inside code fences are intentionally illustrative |

No real Web3Forms request, email, GitHub issue or public test content was created.

Browser: Chromium DOM/layout and mocked provider interaction. Firefox/WebKit and screen-reader
testing were not available; those limitations remain from Phase 2.

## 6. Deployment and live verification

- Implementation commit: `b00f974e1ef6cd875b144ecb72f05f5fac59b275`
  (`feat: add publishing handbooks and refine PDF catalog`), pushed to `origin/main`.
- GitHub Actions run [44591311447](https://github.com/pedrom3160/blog/actions/runs/44591311447):
  **completed / success**.
- Local and remote `main` matched at the pushed implementation commit.

Live checks against `https://pedrom3160.github.io/blog/`:

| Route/check | Result |
|---|---|
| Home | 200; exact “O Blog reúne…” sentence; four nav links; no old phrase |
| About, Suggestions, Donations, Journal, article, PDF/audio libraries | 200 |
| Suggestions | `data-mode="github"`, no email field, GitHub action, five categories, temporary-name copy |
| Empty Submit | Three errors, focus on category, `aria-invalid="true"` |
| Valid Submit (stubbed `window.open`) | Honest “Sugestão preparada” status and correct issue URL; no issue created |
| PDF library | 3 cards; accessible Ver PDF and Descarregar actions; PDF returns 200 `application/pdf`; no overflow at 375/430/768/1024/1440 px |
| Audio library | 3 cards, player present, WAV returns 200 `audio/wav`; 375 px no overflow |
| 404 | HTTP 404, `noindex, follow`, four nav links |
| RSS / sitemap | 200 `application/xml`; canonical/OG on Suggestions correct |
| Assets | CSS/JS still served from the deployed build |

Production Lighthouse (mobile):

| Page | Performance | Accessibility | Best practices | SEO |
|---|---|---|---|---|
| Home | 99 | 96 | 100 | 100 |
| PDF library | 99 | 96 | 100 | 100 |

The only accessibility failure on both pages is the intentional, non-interactive,
`aria-hidden` footer wordmark contrast. The new PDF heading-order and accessible-label issues were
fixed and no longer appear.

**Email delivery was not tested and is not active.** There is no `WEB3FORMS_ACCESS_KEY` in the
repository or Actions build, so production remains on the GitHub fallback. No real provider
request, email or GitHub issue was created during verification.

## 7. Remaining limitations

- Email delivery is **not active or verified** until the owner supplies a Web3Forms access key.
- Production currently requires GitHub for suggestions; this is the honest fallback.
- The PDF catalog has no individual document page, embedded PDF viewer or cover-image field.
- The audiobook catalog has no individual book page, native chapter playlist or cover-image field;
  the embedded player is available for custom Nunjucks pages.
- PDFs/audio are subject to GitHub's file and Pages size limits.
- Firefox, WebKit/Safari and screen-reader testing remain unperformed.

## 8. Next steps after owner activation

1. Create the Web3Forms form using the destination inbox and verify it.
2. Add `WEB3FORMS_ACCESS_KEY` in GitHub repository variables.
3. Run the Pages workflow and confirm `data-mode="web3forms"`.
4. Submit one clearly marked controlled test and confirm email delivery.
5. Set retention to 7 days (or the minimum appropriate) and enable hCaptcha only if needed.
