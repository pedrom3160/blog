# Phase 2 — Quality Audit

**Date:** 2026-11-19
**Git root:** `C:/Users/Pedro/Desktop/GPTCLONE/blog`
**Branch:** `main`
**Starting HEAD:** `961eb8f9520817b5ae5bed5d489df6f64e23deab`
**Remote:** `origin` → `https://github.com/pedrom3160/blog.git`
**Production:** https://pedrom3160.github.io/blog/

The working tree was clean, local `main` matched `origin/main`, and the latest Pages
workflow (`44580274776`) had completed successfully. The reported commit was correct.

---

## 1. Baseline verification

| Check | Baseline result |
|-------|-----------------|
| `npm run build` | 55 files written |
| `npm run validate` | 77 files, 52 HTML, 65 links, four-menu contract on 51 pages |
| `npm test` | 40 tests, 5 files, all passing |
| Navigation | `Blog · About · Suggestions · Donations` |
| Suggestions route | 200, GitHub-issue handoff only |
| 404 | custom page returned 404, but emitted `robots: index, follow` |
| Live site | homepage and sampled routes returned 200 |

No unrelated changes were present. The previous reports under `reports/` were read and the
four-menu contract, temporary-name copy and independent-project identity were confirmed in
source and production.

## 2. Submission architecture — actual state and blocker

The form has a client-side validator, a honeypot and a prefilled GitHub issue handoff. It does
not claim a submission until the visitor confirms on GitHub. The optional CORS endpoint in
`src/_data/suggestions.js` was empty.

**The real limitation remains:** an anonymous visitor cannot complete a submission without a
receiving endpoint. A static GitHub Pages site cannot accept a POST. Every viable anonymous
service needs a destination (an email address, form ID, public key or Worker) and therefore an
owner-side account or credential that is not present in this repository. No email address or
Web3Forms key was found in the project, environment or public GitHub profile.

Therefore the correct engineering action is to implement the integration and keep the existing
GitHub path transparent until the owner supplies a form key. Reporting an anonymous submission
as live would be false.

### Provider comparison (checked November 2026)

| Provider | Visitor account | Free allowance | Backend | Notes |
|---|---|---|---|---|
| **Web3Forms** | No | 250/month | None | Public form key, JSON/CORS, hCaptcha optional; data retained up to 3 years, configurable |
| Formspree | No | 50/month | None | Mature spam controls; lower free limit |
| Formspark | No | 250/month | None | Strong spam filtering; account plus endpoint; IP retained 12 months |
| FormSubmit | No | Unlimited | None | No account, but email activation/exposure and less control |
| Cloudflare Worker | No | Requires account | Worker + email | Full control, but secrets, deployment and mail infrastructure are disproportionate |
| Staticman / GitHub App | No | Self-hosted | Server/GitHub App | More infrastructure and privileges than needed |

**Chosen:** Web3Forms. It gives the highest free allowance without asking visitors to register,
works from the static page through a public form key, supports optional email, has server-side
spam filtering and returns an explicit JSON success flag. GitHub remains a public alternative.

## 3. Findings and disposition

| # | Finding | Severity | Disposition |
|---|---------|----------|-------------|
| 1 | No live anonymous submission path; only GitHub (account required) | High, external | Web3Forms adapter implemented; activation blocked on owner key |
| 2 | Dark-theme primary button: white on `#ff7a4f`, **2.58:1** | Serious accessibility | Fixed: dark text on accent, **7.39:1** |
| 3 | 404 emitted `index, follow` | SEO | Fixed: `noindex, follow` |
| 4 | Search results `aria-label` on a generic `div` (`aria-prohibited-attr`) | Serious accessibility | Fixed: `role="region"` on modal and page results |
| 5 | Name/email errors were not in `aria-describedby` | Accessibility | Fixed for both fields |
| 6 | Opening the mobile menu left focus on the toggle, so Tab skipped the four links | Accessibility | Fixed: first link focused on open; Escape returns to toggle |
| 7 | Brand link accessible name excluded the visible `G` monogram (`label-content-name-mismatch`) | Accessibility / WCAG 2.5.3 | Fixed: accessible name includes the visible brand text |
| 8 | Footer wordmark has 5.5% opacity and fails automated contrast | Low, decorative | Not changed: `aria-hidden`, non-interactive decorative branding, exempt as incidental text |
| 9 | 404/robots and search landmarks were not covered by validation | Quality gate | Added to `scripts/validate.mjs` |
| 10 | No Web3Forms success check (`2xx` alone would be insufficient) | Correctness/security | Adapter requires `payload.success === true`; tests cover `false` and string `true` |
| 11 | Generic endpoint mode had no public alternative if it failed | UX | Failure now keeps the text and links a prefilled GitHub issue |
| 12 | Native provider fallback could have submitted the optional email to GitHub | Privacy | Native action now targets the configured provider; GitHub mode still has no email field |
| 13 | Google Fonts CSS is render-blocking; GitHub Pages controls cache headers | Performance, platform | Measured, not changed; Lighthouse performance remains 98–99 |
| 13 | No CSP/security headers possible on GitHub Pages | Platform | Documented; form values are inserted with `textContent`, never `innerHTML` |

The decorative footer wordmark remains the only automated contrast finding. It is a
non-interactive `aria-hidden` watermark, not content; forcing it to pass a 4.5:1/3:1 text check
would make a deliberately faint brand element visually dominant. It is documented rather than
silently excluded from the audit.

## 4. Automated accessibility and performance baseline

Axe-core 4.10.2 (WCAG 2.0/2.1 A/AA) was run in the production Chromium session on:

- homepage at 375 px;
- Suggestions page at 375 px, light and dark;
- an article at 1440 px, dark;
- 404 at 1440 px, light;
- search page with the modal open, light.

Baseline violations: `.footer-wordmark` on every page; `.btn-primary` in dark theme on
Suggestions; `aria-prohibited-attr` on `#search-results` with the modal open. After the fixes,
axe reports only `.footer-wordmark` and Lighthouse reports no other accessibility violation.

Lighthouse 13.6.0, mobile emulation, production Suggestions page:

| Category | Baseline |
|---|---|
| Performance | 98 |
| Accessibility | 96 |
| Best practices | 100 |
| SEO | 100 |

The two accessibility audits were the dark primary button and the brand label mismatch; both
were fixed. The post-fix local run scored **99 / 96 / 100 / 100**, with the footer watermark as
the only remaining contrast item. FCP was 0.87 and LCP 0.98 in the baseline report.

## 5. Responsive facts

Measured after the Phase 2 changes on the Suggestions page:

| Viewport | `scrollWidth` | Form width | Result |
|----------|---------------|------------|--------|
| 375 | 358 | 321 px panel / 276 px fields | no overflow |
| 430 | 413 | 331 px | no overflow |
| 768 | 751 | 669 px, single column | no overflow |
| 1024 | 1007 | 506 px, two columns | no overflow |
| 1440 | 1423 | 648 px, two columns | no overflow |

## 6. Browser coverage

- Chromium (packaged Desktop browser): interactions, layout, axe, Lighthouse, keyboard focus.
- Firefox is installed, but the Windows headless screenshot process failed at the graphics
  layer (`RenderCompositorSWGL failed mapping default framebuffer`); no Firefox result is
  claimed.
- Edge is Chromium-based and was not tested separately. WebKit/Safari is unavailable on this
  Windows host.

## 7. Assumptions vs verified facts

**Verified:** Git state, baseline build/test counts, live 200 responses, form behavior, GitHub
URL construction, responsive measurements, axe and Lighthouse results, absent form key/email,
and the 404 robots defect.

**Assumption:** the owner can create a Web3Forms form with the project email and add the public
key as a GitHub Actions repository variable. Until that happens, the anonymous path is
implemented but not live.
