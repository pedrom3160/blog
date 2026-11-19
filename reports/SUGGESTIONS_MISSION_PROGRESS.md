# Suggestions Mission — Progress Report

**Date:** 2026-11-19
**Branch:** `main`
**Starting HEAD:** `23ecea785b10da46b25d2fd1a623ae9329259f6d`
**Repository:** https://github.com/pedrom3160/blog
**Production:** https://pedrom3160.github.io/blog/

---

## 1. Initial state

The repository was clean and in sync at the reported commit. Build, validation (three-menu contract)
and 27 tests passed. The exact headline “Público e gratuito · Sem registo necessário” was not present
as a literal element; the related promotional sentence existed in `site.description` and metadata.
“Equipa GPTCLONE” was still used across bylines, catalogs, the author record, CMS defaults and docs.
Full baseline: `reports/SUGGESTIONS_MISSION_AUDIT.md`.

## 2. Navigation — four primary destinations

`src/_data/navigation.js` now contains exactly:

```js
Blog          /
About         /about/
Suggestions   /suggestions/
Donations     /donations/
```

- Desktop header, mobile sheet and footer all derive from the same list.
- `isNavActive` marks `/suggestions/` as current; the validator checks the `aria-current` state.
- The mobile toggle was tested in Chromium: four links, `aria-expanded` true/false, closes on the
  second activation.
- No other destination was added. Search, sections, tags and pagination remain content discovery.
- `scripts/validate.mjs` and `tests/navigation.test.js` now enforce four items, their order and
  routes on every page.

## 3. Suggestions page

Route: **`/suggestions/`** · `src/pages/suggestions.njk`.

The supplied editorial copy was adapted faithfully to the site’s pt-PT voice, not replaced with new
claims. Sections:

1. Hero: “Ajude a definir o futuro do GPTCLONE.”
2. “O que pode sugerir?” with five categories: Ideias & Funcionalidades, Nomenclatura, Design & UX,
   Feedback, Outras sugestões.
3. Closing invitation: “Ajude a construir algo melhor, em conjunto.”
4. Dark editorial band “Um nome ainda por encontrar” with the temporary-name explanation and the
   line “O nome pode ser temporário. A visão não.”
5. Form with privacy notice, accessible errors and status.

The page has a canonical URL, title, description, OG/Twitter metadata, sitemap entry, existing
base-path handling and the same header/footer. No additional JSON-LD was added because the page is
not an article or a contact directory; the site-level `WebSite` data is unchanged.

## 4. Submission mechanism

**Default (no backend): GitHub issue handoff.**

- Client-side validation for category, title (8–120), description (30–2000), optional name (≤80).
- On submit it builds a prefilled `https://github.com/pedrom3160/blog/issues/new` URL and opens it.
- The status says “Sugestão preparada… nada foi enviado por este site” and links to the issue.
- It never reports a published submission; the visitor must confirm on GitHub.
- Email is **not** collected in this mode because the issue is public.
- A no-JavaScript direct link opens a blank issue; the form itself also has a native GitHub `GET`
  fallback action.
- A honeypot is present. No secrets, tokens or credentials are in the repository.

**Optional: private endpoint.**

`src/_data/suggestions.js` exposes `endpoint` and `endpointProvider`. When configured with a
CORS-enabled form service, the page asks for an optional private email, posts JSON and only shows
success on a 2xx response. Setup, privacy and spam guidance: `docs/SUGGESTIONS.md`.

**Limitations (verified):** the default route requires a free GitHub account. Visitors without one
can copy the suggestion but cannot submit it until a private endpoint is configured. No actual
GitHub issue was created during testing; the window-open call was stubbed and the generated URL,
title and body were inspected instead.

## 5. Identity cleanup

- Removed every public use of “Equipa GPTCLONE”:
  - nine article authors → `GPTCLONE`;
  - `site.author` → `GPTCLONE`;
  - author record renamed `gptclone-team.md` → `gptclone.md`, new neutral bio/role;
  - avatar renamed and replaced with the project monogram `assets/avatars/gptclone.svg`;
  - six catalog entries → `GPTCLONE`;
  - CMS author defaults → `GPTCLONE`;
  - About fact “Equipa” replaced by “Natureza: Projeto independente”;
  - docs examples and defaults updated.
- About now says explicitly: “É um projeto independente, desenvolvido fora de qualquer estrutura
  empresarial.”
- Removed the “public and free / no registration” pitch from the site description, homepage lead,
  footer fine print, donation lead/FAQ and the journal accessibility bullet. The literal quoted
  headline was absent; validators now forbid it and its metadata variant.
- Article JSON-LD and `article:author` now identify `GPTCLONE`; the publisher remains the
  publication brand, not a team.

## 6. About, homepage and footer integration

- Homepage: new restrained section 05, “O nome é temporário. As ideias são bem-vindas.”, with a link
  to Suggestions. Hero lead no longer markets free access.
- About: short provisional-name card linking to Suggestions, independent-project sentence and
  neutral fact card.
- Footer: automatic fourth navigation item; fine print now “Projeto independente”.

## 7. Files changed

- Navigation/data: `src/_data/navigation.js`, `src/_data/suggestions.js`, `src/_data/site.js`.
- Page/form: `src/pages/suggestions.njk`, `src/scripts/suggestions.js`.
- Templates: `layouts/about.njk`, `layouts/base.njk`, `layouts/article.njk`, `components/footer.njk`.
- Content: `content/about.md`, nine articles, author record, both catalogs.
- Styling: `src/styles/main.css` (invitation, name band, form, responsive states).
- Validation/tests: `scripts/validate.mjs`, `tests/navigation.test.js`, `tests/suggestions.test.js`.
- CMS/docs: `src/admin/config.yml`, `README.md`, `docs/ARCHITECTURE.md`, `docs/CONTENT_GUIDE.md`,
  `docs/SUGGESTIONS.md`, `CONTENT-MANAGEMENT.md`.
- Metadata: sitemap entry, asset/cache version `3.1.0`.

## 8. Testing and verification

| Check | Result |
|-------|--------|
| `npm run build` | PASS — 55 files |
| `npm run validate` | PASS — 77 files, 52 HTML, 65 links, 4-menu contract on 51 pages |
| `npm test` | PASS — 40 tests, 5 files |
| Form empty submit | PASS — category/title/description errors shown, focus on first invalid, `aria-invalid` on all three |
| Form description error | PASS — `aria-invalid=true` and focus on the textarea |
| Complete handoff | PASS — correct `[Sugestão]` title, category, name and body in the GitHub URL; no email |
| Success semantics | PASS — status is “preparada”, not “enviada”; link points to GitHub |
| Copy action | PASS — “Sugestão copiada para a área de transferência.” |
| Mobile menu | PASS — Blog, About, Suggestions, Donations; toggles correctly |
| Contrast | PASS — accent on paper 5.51:1, muted 5.26:1, bright accent on graphite 4.77:1 |
| Desktop visual | homepage invitation, About and Suggestions reviewed at 1440 px |
| Mobile visual | 375 px page rendered; form fields 276 px inside a 321 px panel |

### Responsive overflow measurements

| Viewport | `documentElement.scrollWidth` | Result |
|----------|-------------------------------|--------|
| 375 | 358 | no horizontal overflow |
| 430 | 413 | no horizontal overflow |
| 768 | 751 | no horizontal overflow |
| 1024 | 1007 | no horizontal overflow |
| 1440 | 1423 | no horizontal overflow |

The only elements reported past the viewport were the intentionally off-screen honeypot and its
label; they are absolutely positioned and do not affect scroll width.

**Not tested:** real iOS/Safari and Firefox rendering, screen-reader announcement sessions,
Lighthouse, an actual published GitHub issue, or a live private endpoint (none is configured).

## 9. Commits, CI and production

### Commits

| SHA | Commit | Scope |
|-----|--------|-------|
| `4a65bca` | `feat: add suggestions page and four-menu navigation` | 41 files, +1346/−89 |
| `550f51a` | `docs: add suggestions mission audit and progress report` | 2 files, +245 |

Push: `23ecea7..550f51a main -> main` (fast-forward, no force). After the push,
`git rev-parse HEAD` and `git rev-parse origin/main` both returned
`550f51afdb65f1a2007e67d093bd77f21f662f17`; the working tree was clean.

A docs-only follow-up commit records this verification and changes no built page.

### GitHub Actions

- Run: https://github.com/pedrom3160/blog/actions/runs/44579594329
- Head: `550f51a`
- Status: **completed / success**
- Deployment: GitHub Pages workflow completed; the new build is served at the production URL.

### Live production verification (https://pedrom3160.github.io/blog/)

| Check | Verified result |
|-------|-----------------|
| `/`, `/about/`, `/suggestions/`, `/donations/`, `/journal/`, one article | all **200** |
| Primary navigation on all six pages | `Blog · About · Suggestions · Donations` |
| `<h1>` count / missing image `alt` | exactly 1 / 0 on every checked page |
| Suggestions editorial copy | all required headings, five categories and the vision line present |
| Temporary-name explanation | present, including “O GPTCLONE é um nome temporário.” |
| Form markup | `#suggestion-form`, five controls, `data-repo="pedrom3160/blog"`, last-reviewed date |
| Deployed validation | empty submit showed the three errors and focused the category |
| Deployed handoff | stubbed `window.open` received the expected `[Sugestão]` issue URL with category, name and body; no email field |
| Deployed status | “Sugestão preparada… nada foi enviado por este site”; success only on GitHub confirmation |
| Deployed clipboard | “Sugestão copiada para a área de transferência.” |
| Mobile menu at 375 px | opens with four links, Suggestions marked current, closes correctly; scroll width 358 |
| Forbidden strings | zero occurrences of the team byline, `gptclone-team`, or the removed promotional phrases in live HTML |
| Canonical | `https://pedrom3160.github.io/blog/suggestions/` |
| OG title/description | “Sugestões” and the Portuguese submission description |
| Sitemap | `/blog/suggestions/` included |
| CSS / form JS | both 200 with expected content types and content |
| RSS | 200, `application/xml` |
| Unknown path | 404 |

The live form was exercised against production with `window.open` stubbed, so **no real GitHub
issue was created**. The URL construction and status behaviour are verified; account-gated
confirmation on GitHub is not.

## 10. Remaining limitations

- The default submission path requires a free GitHub account. Without one, the visitor can validate,
  copy the text and open a blank issue, but cannot complete a submission.
- No private endpoint is configured. The optional CORS endpoint is implemented and documented but has
  not been tested against a live provider or credentials.
- An actual GitHub issue was not published during testing; doing so would create public content
  under the repository.
- Real Safari/iOS and Firefox rendering, screen-reader announcement sessions and Lighthouse were not
  run. Responsive checks used Chromium measurements at the five requested widths.
- The submission body is capped by the form at 2000 characters; very long GitHub URLs were not tested
  against GitHub’s server-side URL limit.
