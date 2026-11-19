# Phase 2 — Quality Progress Report

**Date:** 2026-11-19
**Repository:** https://github.com/pedrom3160/blog
**Branch:** `main`
**Starting HEAD:** `961eb8f9520817b5ae5bed5d489df6f64e23deab`
**Production:** https://pedrom3160.github.io/blog/

The starting tree was clean and in sync. Baseline: 55 build files, 77 validated files (52
HTML), 65 internal links, four-menu contract on 51 pages, 40 tests. Full baseline and findings:
`reports/PHASE2_QUALITY_AUDIT.md`.

## 1. Submission architecture

| Mode | Activation | Visitor account | How it works |
|---|---|---|---|
| `github` (default) | No key/endpoint | GitHub account required | Validates and prepares a prefilled public issue; explicit “preparada”, never “enviada” |
| `web3forms` | `WEB3FORMS_ACCESS_KEY` at build time | None | `POST` JSON to Web3Forms; optional email; success only on `success === true`; GitHub fallback |
| `endpoint` | `endpoint` in `src/_data/suggestions.js` | Depends on provider | `POST` JSON; success only on 2xx; GitHub fallback |

The Web3Forms public key is a routing identifier, not a secret. It is read from the
`WEB3FORMS_ACCESS_KEY` repository variable in GitHub Actions and passed to the build; it is
visible in the built HTML by design. No private token, password or secret is in the repository.

The form's native action follows the mode: GitHub GET in the default mode (no email field), or
the provider POST in provider mode (hidden `access_key`, `from_name` and `subject`). This avoids
putting an optional email into a GitHub URL when JavaScript is unavailable.

## 2. What changed

- Added `buildWeb3FormsPayload` and `web3formsSucceeded`; success requires an explicit
  `success: true`, not merely HTTP 200.
- Added provider-mode email, privacy link and provider-aware copy; the five categories,
  temporary-name section and four-menu navigation are unchanged.
- Added a “Preparar no GitHub” alternative in provider mode and a prefilled GitHub fallback on
  provider failure.
- Added `aria-busy` during submission and kept the form text intact on failure.
- Fixed dark-theme primary button contrast: dark text on `#ff7a4f` (**7.39:1**, was **2.58:1**
  with white text).
- Fixed 404 `noindex, follow`; 404 retains the four-item navigation.
- Fixed `aria-prohibited-attr` by giving both search-results regions `role="region"`.
- Linked name and email errors through `aria-describedby`.
- Mobile menu now focuses the first link on open and returns focus to the toggle on Escape.
- Brand link accessible names include the visible monogram/subtitle, resolving
  `label-content-name-mismatch`.
- Added validation for mode, provider endpoint, hidden key, optional email, field-to-error links,
  search landmark role and 404 noindex.
- Added Web3Forms tests and a public-key build test; docs updated.
- Version `3.2.0`, CSS/JS cache query `v=3.2.0`.

## 3. Privacy and security

- No email is collected or put in a URL in GitHub mode.
- In provider mode email is optional; it is sent only to the configured provider and is never
  included in the GitHub fallback URL.
- All user text is inserted with `textContent`; issue URLs use `URLSearchParams`. No `innerHTML`
  path handles submission input.
- Honeypot (`website`) plus Web3Forms `botcheck`; no client-side rate limit is claimed because it
  would be bypassable. Provider limits and 429 responses remain authoritative.
- No analytics, cookies or local storage for the form.
- Web3Forms acts as a processor; submissions may include IP/user-agent metadata, retention up to
  3 years by default (configurable to 7 days), dashboard visibility 30 days on the free plan.
  Documented with links to its privacy policy and DPA.
- GitHub Pages cannot set custom security headers/CSP; this is a platform limitation, not a
  hidden mitigation.

## 4. Accessibility

- Native labels and required semantics; visible focus; keyboard-operable menu, search, form and
  copy controls.
- Errors appear in `aria-describedby`, `aria-invalid` is set, and focus moves to the first
  invalid field.
- Submission status is a `role="status"` live region; success is announced only after a real
  provider success.
- Search dialog has a name, `aria-modal`, focus trap, Escape close and focus restoration.
- Reduced motion is honoured by the existing CSS.
- Contrast now passes for the dark primary button and brand text. The only remaining axe/Lighthouse
  contrast item is the intentionally faint, `aria-hidden` footer wordmark (decorative branding).

## 5. Testing

| Check | Result |
|---|---|
| `npm run build` | PASS — 55 files |
| `npm run validate` | PASS — 77 files, 52 HTML, 65 links, 51 pages |
| `npm test` | PASS — 46 tests, 5 files |
| Default form | PASS — GitHub mode, no email field, three errors on empty submit, focus on category |
| GitHub handoff | PASS — correct prefilled issue URL; status says prepared, not submitted |
| Provider payload | PASS — mocked Web3Forms payload had key, category, title, message, optional email, `botcheck:false`, page URL |
| Provider success | PASS — only `success:true` reset the form and showed “Sugestão enviada” |
| Provider failure | PASS — `success:false` with HTTP 200 kept the text and offered a prefilled GitHub fallback |
| Web3Forms build | PASS — `data-mode="web3forms"`, email field, hidden key, endpoint and provider copy; validator passes |
| Mobile focus | PASS — opening focuses “Blog”; Escape returns focus to “Abrir menu”; four links |
| Search axe | PASS — no `aria-prohibited-attr`; role region present |
| Dark button | PASS — computed foreground `#0e1013` on `#ff7a4f`, 7.39:1 |
| 404 | PASS — 404 response, `noindex, follow`, four nav links |
| Lighthouse (local Suggestions) | 99 performance / 96 accessibility / 100 best practices / 100 SEO |

Responsive `scrollWidth`: 375→358, 430→413, 768→751, 1024→1007, 1440→1423. Form widths:
321 px panel at 375, 331 px at 430, 669 px single-column at 768, 506 px at 1024, 648 px at 1440.
No horizontal overflow.

Chromium was used for DOM, keyboard, axe and Lighthouse checks. Firefox is installed but its
Windows headless screenshot process failed at the graphics layer; no Firefox result is claimed.
WebKit/Safari is unavailable on this host. Edge was not tested separately.

## 6. SEO and performance

- Suggestions canonical/OG/Twitter metadata, sitemap entry and base path remain correct.
- 404 is now `noindex`; sitemap still excludes it.
- Lighthouse baseline production Suggestions: 98/96/100/100. Post-fix local run: 99/96/100/100.
- Google Fonts CSS remains render-blocking; GitHub Pages cache lifetime is 10 minutes and cannot
  be configured. CSS is 12 KB transferred; no new dependencies or client libraries were added.

## 7. Remaining limitations

- **The anonymous path is not live yet.** No Web3Forms form key or receiving email exists in the
  project, and creating the owner account/email verification requires human action. The code,
  validation, tests and documentation are complete; the page remains GitHub-only until
  `WEB3FORMS_ACCESS_KEY` is set. This is the one external blocker.
- No real submission was sent to Web3Forms (no key); the integration was exercised with a fake key
  and a mocked fetch, including both success and failure.
- The footer wordmark remains an automated contrast finding; it is decorative and `aria-hidden`.
- Firefox and WebKit were not verified; screen-reader sessions and real-device iOS were not run.
- No CSP/security headers can be added on GitHub Pages.

## 8. Git, CI and live production

- Initial HEAD: `961eb8f9520817b5ae5bed5d489df6f64e23deab`.
- Implementation commit: `81ea562c539ed2f30b614e9f73ca64390e18a99b`
  (`feat: add Web3Forms path and accessibility hardening`), pushed to `origin/main`.
- GitHub Actions run [44586881391](https://github.com/pedrom3160/blog/actions/runs/44586881391):
  **completed / success**.
- Local and remote `main` matched at the pushed commit; the working tree was clean before
  this report update.

Live checks against `https://pedrom3160.github.io/blog/`:

| Route/check | Result |
|---|---|
| Home, About, Suggestions, Donations, Journal, article | 200, one `h1`, four nav links |
| Suggestions mode | `github`; no email field; GitHub action |
| Empty Submit | Three errors, focus on category, `aria-invalid="true"` |
| Valid Submit (stubbed `window.open`) | Honest “Sugestão preparada” status and correct prefilled issue URL; no request or issue created |
| 404 | HTTP 404, `noindex, follow`, four nav links |
| Search | `id="search-results" role="region"` |
| Brand | `G GPTCLONE Journal — página inicial` |
| Assets | CSS and both JS files return 200 at `v=3.2.0` |
| Sitemap / RSS | Suggestions included, 404 excluded; RSS 200 `application/xml` |
| Canonical / OG | Correct production URLs and title |
| Dark primary button | Computed `#0e1013` on `#ff7a4f`, **7.39:1** |
| Layout | 1440: scrollWidth 1423, form 648; 375: no overflow |

Live Lighthouse (mobile, Suggestions): **98 performance / 96 accessibility / 100 best
practices / 100 SEO**; FCP 1.8 s, LCP 1.8 s, CLS 0. The only accessibility failure is the
decorative `aria-hidden` footer wordmark. The earlier local post-fix run scored 99 performance.

No real Web3Forms submission, GitHub issue or other public test content was created. The
provider path remains inactive until the owner adds `WEB3FORMS_ACCESS_KEY`.
