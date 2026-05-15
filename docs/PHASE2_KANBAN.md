# Phase 2 Migration — Kanban

Status legend: `[ ]` todo · `[~]` in progress · `[x]` done · `[!]` blocked

Working order is roughly top-to-bottom — Task 1 blocks deploy, do it first.

---

## Task 1 — Fix app.html (CRITICAL, blocks deploy)

- [x] 1.1 Read `docs/app-html-redesign-handoff.md` end-to-end (spec)
- [x] 1.2 Read `src/templates/layouts/base.njk` (design tokens, chrome)
- [x] 1.3 Open `province/torino.html` as visual reference — *(used base.njk + app.html itself as ref)*
- [x] 1.4 Audit `script.js` — DOM hooks: `#app`, `#title`, `#output`, `#extra`, `#sorting`, `#regionfilters`, `#additionalfilters`, `#floatBottom`, `#header > .arrow`, `#navbar`, `input[name="sortBy"]:checked`, `.regionfilter`, `.chosenArea`/`.bestorworst`/spans inside H1, `button[value=...]`. All present in app.html.
- [x] 1.5 No selector mismatches. **Root cause was elsewhere** ↓
- [x] 1.6 Diff vs main skipped — bug found via code read
- [x] 1.7 `script.js` line 16 fetches absolute `https://expiter.com/dataset.json` — works on live, only fails for purely-local testing (acceptable)
- [x] 1.8 **Root cause**: on initial load with no `?sort=` query params, nothing kicked off the first render. `setTimeout` that used to call `filterDataByRegion("All")` was commented out (script.js:27-31). Fixed: replaced the dead `setTimeout` comment with a live `else { filterDataByRegion("All"); }` after `if (location.search!="")`.
- [x] 1.9 Inline base.njk's CSS tokens, navbar, footer, card surface, tier-chip into app.html `<style>` block — *already present, matches base.njk*
- [x] 1.10 Restyle province card to match base.njk language — *already in app.html `<style>` (line 146 #app)*
- [!] 1.11 Verify: default load shows ~107 cards — **needs human browser test**
- [!] 1.12 Verify: filter pills update URL `?sort=…`, grid reorders, active pill highlighted — needs browser
- [!] 1.13 Verify: region dropdown narrows cards — needs browser
- [!] 1.14 Verify: multi-select compare works — needs browser
- [!] 1.15 Verify: deep-link `?sort=Safety&region=Sicilia` applies both — needs browser
- [!] 1.16 Verify: sidebar deep-links from `province/torino.html` (e.g. "Best Places to Live in Lombardy") still resolve — needs browser
- [!] 1.17 Visual parity check side-by-side with `province/torino.html` — needs browser

**Verification commands** (run locally):
```
npm run dev     # then open http://localhost:3000/app.html
```
Hard-refresh (Ctrl+Shift+R) to bust cache. Watch console for fetch errors.

---

## Task 1.4 — City-card redesign (NomadList-inspired, expat-focused) ✅

- [x] Rebuilt card markup in [script.js:548-602](script.js#L548-L602): image with overlaid name/region + rank badge, compact 3-metric row (Cost · Safety · Climate), hover-reveals 8-metric detail panel
- [x] Detail panel absolutely-positioned overlay so hovering doesn't reflow the grid
- [x] Mobile (`@media (hover: none)`) inlines the detail for tap-free access
- [x] Confirmed no other currently-migrated page has city-card grids — language-variant `*/app.html` and `provinces.html` need chrome migration first (Tasks 2 + 4)

## Task 1.5 — Extract shared `style-v2.css` (high-leverage prerequisite) ✅

- [x] 1.5.1 Pulled the inline `<style>` block out of `src/templates/layouts/base.njk` into `/style-v2.css` (~310 lines)
- [x] 1.5.2 Replaced inline block with `<link rel="stylesheet" href="/style-v2.css">` in base.njk
- [x] 1.5.3 Wired same link into `app.html` (kept its app-specific inline `<style>` for #app grid/cards — cascades over the baseline)
- [x] 1.5.4 Rebuilt all 107 EN provinces + `/provinces/` + `/region/regions-of-italy/` — Torino went 700→396 lines, no regressions in chrome output
- [x] 1.5.5 Legacy `style.css` left untouched for unmigrated pages
- [!] 1.5.6 **Browser smoke-test still pending** — load Torino, /app/, /provinces/, /region/regions-of-italy/ on localhost and confirm visual parity

---

## Task 2 — Non-EN province + crime pages

Approach: pick A (copy-and-translate, matches repo style) unless time allows B (parameterize).

### IT (highest non-EN traffic)
- [x] 2.1 Migrate `pageGeneratorSSRItaly.js` → NJK pipeline — already done; 107 IT province pages confirmed new chrome
- [x] 2.2 `temp/parsedDataAbout{Name}.txt` wired — confirmed in generator
- [x] 2.3 `qualityScore()` FoggyDays thresholds verified verbatim
- [x] 2.4 `populateFacts`, `populateNightlifeFacts`, `populateSafetyFacts` present
- [x] 2.5 Migrate `CaSGeneratorIT.js` → NJK pipeline — done; 107 IT CaS pages confirmed new chrome
- [x] 2.6 `.htaccess` written by CaS generator — confirmed in code
- [!] 2.7 Visual parity vs torino.html on Milano IT page — needs browser

### FR
- [x] 2.8 Migrate `pageGeneratorSSRFrench.js` — done; 107 FR province pages new chrome
- [x] 2.9 `CaSGeneratorFR.js` exists and migrated — 107 FR CaS pages new chrome
- [!] 2.10 Verify Milano FR — needs browser

### DE
- [x] 2.11 Migrate `pageGeneratorSSRGerman.js` — done; 107 DE province pages new chrome
- [x] 2.12 `CaSGeneratorDE.js` exists and migrated — 107 DE CaS pages new chrome
- [!] 2.13 Verify Milano DE — needs browser

### ES
- [x] 2.14 Migrate `pageGeneratorSSRSpanish.js` — done; 107 ES province pages new chrome
- [x] 2.15 `CaSGeneratorES.js` exists and migrated — 107 ES CaS pages new chrome
- [!] 2.16 Verify Milano ES — needs browser

---

## Task 4 — Listing pages (do before Task 3, card markup reused) ✅ EN done

- [x] 4.1 Created `src/templates/pages/provinces-list.njk` (extends `simple-page.njk`) — cards grouped by region, reuses the Task 1 card markup
- [x] 4.2 Rewrote `provincesGeneratorSSR.js` — NJK render, no more jsdom/http server/`provincesTemplate.html`. Added `npm run build:provinces`
- [x] 4.3 Created `src/templates/pages/regions-list.njk` — clean responsive `<table>` of the 20 regions
- [x] 4.4 EN: Rewrote `regionGeneratorSSR.js` → NJK render. Added `npm run build:regions`.
- [x] 4.5 `indexGeneratorSSR.js` — confirmed superseded by current `app.html` (the redesign that just landed). **Recommend deleting it + the 4 language variants** after smoke-testing prod.
- [x] 4.6 Migrate `regionGeneratorSSRItaly.js`, `regionGeneratorSSRFrench.js`, `regionGeneratorSSRGerman.js` — rewrote all three (jsdom → NJK); created `regions-list-it/fr/de.njk`; all three pages new chrome confirmed
- [x] 4.8 `regionGeneratorSSRSpanish.js` — created + run; `es/regiones/regiones-italianas.html` new chrome confirmed
- [x] 4.7 `sitemapGenerator.js` / `sitemapGeneratorItaly.js` — left alone

---

## Task 3 — Comuni listing + town pages (biggest blast radius — last)

- [x] 3.1 Confirm whether `townPageGenerator.js` only iterates provinces 27–30 or full 107 — confirmed full 107
- [x] 3.2 Create `src/templates/pages/comuni-list.njk` (use `{% for comune in comuni %}` — replaces jQuery `<tr>` append)
- [x] 3.3 Migrate `comuniGenerator.js` (EN)
- [x] 3.4 Create `src/templates/pages/town.njk` (extends base.njk, town-card layout)
- [x] 3.5 Migrate `townPageGenerator.js` (EN, ~9,800 files)
- [x] 3.6 Migrate `comuniGeneratorItaly.js` + `townPageGeneratorItaly.js` — both rewritten + run; all IT pages new chrome
- [x] 3.7 Migrate FR variants — `townPageGeneratorFrench.js` was already rewritten; `comuniGeneratorFrench.js` rewritten (was still jsdom) + both run; all FR pages new chrome. Fixed `handle(province.Comuni[p])` → `.Name` bug in nearby links (also fixed in DE/ES).
- [x] 3.8 Migrate DE variants — same pattern; both run; all DE pages new chrome
- [x] 3.9 Migrate ES variants — same pattern; both run; all ES pages new chrome
- [ ] 3.10 Visual parity check — browser smoke test pending

---

## Task 5 — Static / editorial pages ✅

**Scope rule:** every page in the site — whether migrated to NJK or kept flat — must be **visually restyled** to match the new UX/UI (base.njk chrome, design tokens, typography, card surfaces, tier chips). Flat pages get the new stylesheet + chrome markup inlined; NJK pages get it via `extends`. No page is allowed to ship with the legacy Bulma/old chrome.

- [x] 5.1 Inventory: all standalone `.html` files audited — EN pages already had v2 chrome; IT/FR/DE/ES app pages + IT editorial pages needed work
- [x] 5.2 `resources.html` (EN) — already has style-v2.css + Bootstrap navbar; `it/risorse/risorse.html` rewritten with Bootstrap 5 + style-v2.css + new chrome
- [x] 5.3 `it/risorse/generatore-codice-fiscale.html`, `fr/ressources/generateur-codice-fiscale.html`, `es/recursos/generador-codice-fiscale.html` — all already have v2 chrome
- [x] 5.4 `blog/articles.html` (EN) + `it/blog/articoli.html` — both rewritten with Bootstrap 5 card grid + new chrome
- [x] 5.5 EN blog posts (`blog/living-in-*.html`, `blog/best-cities-*.html`, etc.) — already have v2 chrome. IT blog posts (`it/blog/vivere-a-*.html`) are body-only AJAX fragments (no `<head>`), no CSS change needed.
- [x] 5.6 About page stays as `/app/#About` anchor — no separate page needed
- [x] 5.7 `privacy-policy.html` — already has v2 chrome; `it/wordle/wordle.html` is a standalone third-party app (own CSS, no expiter chrome needed)
- [x] 5.8 `it/app.html`, `fr/app.html`, `de/app.html`, `es/app.html` — bulma + hamburger nav removed; Bootstrap 5 + style-v2.css + Bootstrap navbar added. Script.js DOM hooks (`#title`, `#sorting`, `#app`, etc.) preserved.
- [x] 5.9 Cross-check: all live non-artifact pages verified bulma-free. Remaining bulma files are stale build artifacts (`indexTemplate*.html`, `provincesTemplate.html`, `province/test.html`) or skipped-province stale files (`*-massa-carrara.html`, `de/gemeinden/provinz-monza-e-brianza.html`, `it/comuni/milano/`) — flagged for cleanup, not live traffic.

---

## Task 6 — URL slug audit (pre-deploy)

Verify that every output URL generated by the NJK pipeline matches the pre-migration URLs exactly. A mismatch breaks inbound links, SEO, and `.htaccess` redirects.

- [ ] 6.1 EN province pages — spot-check 5–10 slugs (e.g. `province/torino/`, `province/reggio-calabria/`, `province/monza-e-della-brianza/`) against the old generator output or live site
- [ ] 6.2 EN CaS pages — same spot-check (e.g. `reggio-calabria/crime-and-safety/`)
- [ ] 6.3 IT province pages — check `it/province/<slug>/` slugs match old output
- [ ] 6.4 FR/DE/ES province pages — check `fr/province/`, `de/provinz/`, `es/provincia/` slugs
- [ ] 6.5 Comuni listing pages — check `comuni/provincia-di-<slug>/`, `it/comuni/provincia-di-<slug>/`, `fr/municipalites/province-de-<slug>/`, `de/gemeinden/provinz-<slug>/`, `es/municipios/provincia-de-<slug>/`
- [ ] 6.6 Town pages — check a few towns per language, especially names with accents or apostrophes (e.g. `comuni/torino/sant-ambrogio-di-torino/`)
- [ ] 6.7 Region pages — check `region/regions-of-italy/`, `it/regioni/regioni-italiane/`, `fr/regions/regions-italiennes/`, `de/regionen/italienische-regionen/`, `es/regiones/regiones-italianas/`
- [ ] 6.8 `.htaccess` — confirm CaS redirects still point to correct new paths

---

## Guardrails (don't violate)

- Don't move `app.html` or `tools/codice-fiscale-generator/` into NJK
- Don't change `script.js` selectors without auditing
- Don't introduce Eleventy / SSG framework
- Don't skip `temp/parsedDataAbout{Name}.txt` wiring in any language
- Don't simplify `qualityScore()` — FoggyDays thresholds verbatim
- Don't commit `.env`, credentials, `node_modules/`

---

## Build commands (reference)

```bash
npm run dev                                          # local preview
NODE_TLS_REJECT_UNAUTHORIZED=0 npm run build              # EN province pages (107)
NODE_TLS_REJECT_UNAUTHORIZED=0 npm run build:cas          # EN crime pages (107)
NODE_TLS_REJECT_UNAUTHORIZED=0 npm run build:provinces    # /provinces/ listing
NODE_TLS_REJECT_UNAUTHORIZED=0 npm run build:regions      # /region/regions-of-italy/
NODE_TLS_REJECT_UNAUTHORIZED=0 node pageGeneratorSSRItaly.js
NODE_TLS_REJECT_UNAUTHORIZED=0 node CaSGeneratorIT.js
```
