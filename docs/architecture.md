# Expiter — Complete Architecture & State of the Codebase

*Last updated: 2026-05-13. Written for any agent or developer picking this up cold.*

---

## Table of Contents

1. [What Expiter Is](#1-what-expiter-is)
2. [The Two Site-Building Systems](#2-the-two-site-building-systems)
3. [The Legacy Generator System (Current Production)](#3-the-legacy-generator-system-current-production)
4. [The Eleventy System (In Progress, Not Yet Live)](#4-the-eleventy-system-in-progress-not-yet-live)
5. [File Layout of the Repo](#5-file-layout-of-the-repo)
6. [How the Live Site Works (Cloudways + WordPress + Static Files)](#6-how-the-live-site-works-cloudways--wordpress--static-files)
7. [The Nunjucks Migration (Branch: refactor/njk-migration)](#7-the-nunjucks-migration-branch-refactornjk-migration)
8. [The Staging Problem — Why You See a Broken Page](#8-the-staging-problem--why-you-see-a-broken-page)
9. [Languages & Translation](#9-languages--translation)
10. [File Counts & Scale](#10-file-counts--scale)
11. [Cloudflare Pages vs Cloudways — Full Analysis](#11-cloudflare-pages-vs-cloudways--full-analysis)
12. [Known Bugs & Technical Debt](#12-known-bugs--technical-debt)
13. [How to Run the Generators](#13-how-to-run-the-generators)
14. [Recommended Next Steps](#14-recommended-next-steps)

---

## 1. What Expiter Is

Expiter (`expiter.com`) is a **static HTML site** that provides quality-of-life, cost-of-living, safety, climate, and demographic data for every Italian province (107 total), built for expats and digital nomads.

Each province has:
- An **overview page**: `expiter.com/province/bologna/`
- A **crime & safety subpage**: `expiter.com/province/bologna/crime-and-safety/`
- Translated versions in IT, DE, FR, ES

The site also has:
- A **comuni section** (~8,000+ Italian municipalities)
- **Region pages**
- A **comparison app** (`app.html` / `app/`) — a client-side JS tool
- A **blog** (WordPress)
- Translated equivalents of most pages in 5 languages

The site is hosted on **Cloudways** (Apache, WordPress installed), with static HTML files served directly from `public_html/`, bypassing WordPress via `.htaccess` rewrite rules.

---

## 2. The Two Site-Building Systems

**This is the most important thing to understand about this repo.** There are two completely separate systems that both generate province pages and live side by side in the same repo. They are at different stages of development and serve different purposes.

### System A — Legacy Node.js Generators (CURRENT PRODUCTION)

- **How it works**: ~28 standalone Node.js scripts (`pageGeneratorSSR.js`, `CaSGenerator.js`, etc.) fetch live data from `https://expiter.com/dataset.json`, build HTML strings in JS, and write `.html` files directly to the repo root.
- **Output location**: `province/`, `it/province/`, `de/provinz/`, `fr/province/`, `es/provincia/`, `comuni/`, `region/`, etc. — all at the repo root.
- **Deployed to**: Cloudways `public_html/` — the files land at the path they were written to.
- **Status**: **This is what the live site runs on.** All 52,000+ tracked HTML files in the repo were generated this way.

### System B — Eleventy (IN PROGRESS, NOT LIVE)

- **How it works**: Eleventy SSG (`eleventy.config.js`, source in `src/`) reads data from `src/_data/` (which fetches `dataset.json` at build time), processes Nunjucks templates in `src/`, and outputs to `_site/`.
- **Output location**: `_site/` (tracked in git, ~9,600 files, EN only so far).
- **Status**: **Partially complete. EN province pages exist in `_site/` but are broken** — they have unresolved i18n keys (`common.province`, `sections.overview`, etc.) baked into the HTML because the template (`src/_includes/base.njk`) references keys that don't exist in the data layer. Not deployed to production.

These two systems coexist without conflict on disk because they write to different directories. However, they both have Nunjucks templates — they use Nunjucks differently and their templates are completely separate.

---

## 3. The Legacy Generator System (Current Production)

### How it works

Each generator script is a standalone Node.js ESM file. The pattern is always the same:

1. Start an HTTP server on port 8080 (legacy artifact, no longer needed but still present)
2. `fetch('https://expiter.com/dataset.json')` to get live province data
3. Loop over 107 provinces
4. Build HTML strings using helper functions from `js/pageBuilder.js`
5. Call `nunjucks.render('pages/province.njk', context)` to render a full page
6. Write to disk (e.g. `province/bologna.html`)

### Key files

| File | Purpose |
|------|---------|
| `pageGeneratorSSR.js` | EN province overview pages → `province/*.html` |
| `CaSGenerator.js` | EN crime & safety pages → `province/*/crime-and-safety.html` |
| `pageGeneratorSSRItaly.js` | IT province pages → `it/province/*.html` |
| `pageGeneratorSSRFrench.js` | FR province pages → `fr/province/*.html` |
| `pageGeneratorSSRGerman.js` | DE province pages → `de/provinz/*.html` |
| `pageGeneratorSSRSpanish.js` | ES province pages → `es/provincia/*.html` |
| `CaSGeneratorIT.js` | IT crime & safety pages |
| `comuniGenerator.js` | EN comuni pages → `comuni/*/` |
| `comuniGeneratorItaly.js` | IT comuni pages → `it/comuni/*/` |
| `comuniGeneratorFrench.js` | FR comuni pages |
| `comuniGeneratorGerman.js` | DE comuni pages |
| `comuniGeneratorSpanish.js` | ES comuni pages |
| `regionGeneratorSSR.js` | EN region pages |
| `safetyGenerator.js` | Safety overview pages |
| `indexGeneratorSSR*.js` | Index/app pages per language |
| `js/pageBuilder.js` | Shared helpers: `setSideBar()`, `addBreaks()`, `setSideBarIT()`, etc. |
| `js/nunjucksEnv.js` | Shared Nunjucks environment (autoescape: false, noCache: true) |

### The Nunjucks templates (legacy generator)

Located in `src/templates/` — **separate from the Eleventy templates in `src/_includes/`**.

| File | Purpose |
|------|---------|
| `src/templates/layouts/base.njk` | Master layout: `<head>`, scripts, CSS, sidebar, navbar, hero, h1 |
| `src/templates/partials/tabs.njk` | 3-tab widget (Quality of Life / Cost of Living / Digital Nomads) |
| `src/templates/pages/province.njk` | Province overview page body |
| `src/templates/pages/crime-safety.njk` | Crime & safety page body |

### The data flow

```
https://expiter.com/dataset.json
    ↓ fetch() at runtime
dataset[] — 107 province objects + avg object + region objects
    ↓ passed to renderPage()
nunjucks.render('pages/province.njk', context)
    ↓ context includes: seoTitle, sidebar (HTML string), navbar (HTML string),
      tab1col1, tab1col2, overview, climate, col, healthcare, ...
    ↓
province/bologna.html written to disk
```

### Critical technical facts

- **`autoescape: false`** in the Nunjucks env is intentional and must not be changed. All content strings contain raw HTML: `<b class='green'>`, `<score class='excellent max'>excellent</score>`, `<ej>` emoji wrapper tags, inline `<p>` tags. Escaping would destroy the output.
- **`| safe` filter** is still present in templates as belt-and-suspenders — harmless alongside `autoescape: false`.
- **`pb.addBreaks()`** wraps content in `<p>` tags and adds `<br>` — called in JS before passing to template, not inside the template.
- **`temp/parsedDataAbout{Name}.txt` files** — per-province prose text read with try/catch; missing files silently return `''`.
- **Port 8080 EADDRINUSE bug**: each generator starts a server on port 8080. If a previous run is still alive, the next run crashes silently (EADDRINUSE) and writes no files. Always kill port 8080 before running a generator. See [Section 13](#13-how-to-run-the-generators).

---

## 4. The Eleventy System (In Progress, Not Yet Live)

### What it is

Eleventy (`@11ty/eleventy`) is a modern static site generator. It was introduced to this repo as a potential replacement for or complement to the legacy generator scripts. Its output goes to `_site/`.

### Current state

- EN province pages are generated: `_site/province/bologna/index.html` (107 pages)
- These pages are tracked in git
- **The pages are broken**: they contain literal strings like `common.province`, `sections.overview`, `metrics.population`, `metrics.healthcare` — these are i18n translation keys that are referenced in a template (`src/_includes/base.njk`) but never resolved because no i18n data layer exists yet for Eleventy
- Only EN is covered — no IT, DE, FR, ES equivalents exist in the Eleventy system
- `_site/` also contains comuni pages, app pages, asset copies

### Key files

| File | Purpose |
|------|---------|
| `eleventy.config.js` | Eleventy config: input=`src`, output=`_site`, qualityScore filter |
| `src/province.njk` | Province page template with Eleventy pagination over `dataset.provinces` |
| `src/regions.njk` | Region page template |
| `src/town.njk` | Town/comuni page template |
| `src/app.njk` | App page template |
| `src/_includes/base.njk` | Eleventy base layout (different from `src/templates/layouts/base.njk`) |
| `src/_includes/macros/ads.njk` | Ad placeholder macros |
| `src/_data/dataset.js` | Async data fetcher — fetches `dataset.json` at Eleventy build time |
| `src/_data/facts.js` | Static province prose facts (city descriptions, nightlife, etc.) |
| `src/_data/towns.js` | Towns/comuni data |
| `src/trellis.css` | Additional CSS for Eleventy pages |

### The qualityScore filter

`eleventy.config.js` defines a `qualityScore` Nunjucks filter that converts raw numeric scores to labelled `<score class='...'>` elements — the same visual output as the legacy generators' `qualityScore()` function in `pageBuilder.js`. The two implementations are separate but produce identical output.

### Why the Eleventy pages have broken i18n keys

The `src/_includes/base.njk` layout (and possibly some page templates) references strings like `{{ 'common.province' | i18n }}` or similar — keys that require a translation layer that hasn't been implemented. The Eleventy build runs without error but emits the raw key strings into the HTML. This is a known incomplete state.

---

## 5. File Layout of the Repo

```
expiter/
├── province/                   ← EN province pages (generated by pageGeneratorSSR.js)
│   ├── bologna.html            ← overview page for Bologna
│   ├── bologna/
│   │   ├── .htaccess           ← rewrites /province/bologna/ → bologna.html
│   │   └── crime-and-safety.html
│   └── ... (107 provinces × 2 pages + .htaccess each)
│
├── it/province/                ← IT province pages (pageGeneratorSSRItaly.js)
├── de/provinz/                 ← DE province pages (pageGeneratorSSRGerman.js)
├── fr/province/                ← FR province pages (pageGeneratorSSRFrench.js)
├── es/provincia/               ← ES province pages (pageGeneratorSSRSpanish.js)
│
├── comuni/                     ← EN comuni pages (~8,000+ towns)
├── it/comuni/                  ← IT comuni pages
├── de/gemeinden/               ← DE comuni pages
├── fr/municipalites/           ← FR comuni pages
├── es/municipios/              ← ES comuni pages
│
├── region/                     ← EN region pages
├── it/                         ← IT root (app, resources, etc.)
├── de/                         ← DE root
├── fr/                         ← fr root
├── es/                         ← ES root
│
├── _site/                      ← Eleventy output (EN only, broken i18n, tracked in git)
│   ├── province/bologna/index.html
│   └── ... (9,600 files)
│
├── src/                        ← Source for BOTH systems
│   ├── templates/              ← Legacy generator Nunjucks templates
│   │   ├── layouts/base.njk
│   │   ├── partials/tabs.njk
│   │   └── pages/province.njk, crime-safety.njk
│   ├── _includes/              ← Eleventy Nunjucks templates
│   │   ├── base.njk
│   │   └── macros/ads.njk
│   ├── _data/                  ← Eleventy data files
│   │   ├── dataset.js
│   │   ├── facts.js
│   │   └── towns.js
│   ├── province.njk            ← Eleventy province page template
│   ├── regions.njk
│   ├── town.njk
│   ├── app.njk
│   └── trellis.css
│
├── js/
│   ├── pageBuilder.js          ← Shared helpers for legacy generators
│   ├── nunjucksEnv.js          ← Shared Nunjucks env for legacy generators
│   └── safetyImageGenerator.js
│
├── pageGeneratorSSR.js         ← EN province generator (legacy)
├── pageGeneratorSSRItaly.js    ← IT province generator
├── pageGeneratorSSRFrench.js   ← FR province generator
├── pageGeneratorSSRGerman.js   ← DE province generator
├── pageGeneratorSSRSpanish.js  ← ES province generator
├── CaSGenerator.js             ← EN crime & safety generator
├── CaSGeneratorIT.js           ← IT crime & safety generator
├── comuniGenerator.js          ← EN comuni generator
├── comuniGeneratorItaly.js     ← IT comuni generator
├── comuniGeneratorFrench.js    ← FR comuni generator
├── comuniGeneratorGerman.js    ← DE comuni generator
├── comuniGeneratorSpanish.js   ← ES comuni generator
├── regionGeneratorSSR.js       ← EN region generator
├── indexGeneratorSSR.js        ← EN index/app generator
├── indexGeneratorSSRitaly.js   ← IT index generator
├── indexGeneratorSSRFrance.js  ← FR index generator
├── indexGeneratorSSRGermany.js ← DE index generator
├── indexGeneratorSSRSpanish.js ← ES index generator
├── safetyGenerator.js          ← Safety pages
├── safetyPageGenerator.js
├── sitemapGenerator.js
├── eleventy.config.js          ← Eleventy config
├── .htaccess                   ← Root Apache rewrite rules + WordPress rules
├── app.html                    ← Client-side comparison app (WordPress fallback target)
├── script.js                   ← Client-side JS (fetches dataset.json, populates DOM)
├── dataset.json                ← NOT in repo — lives only on expiter.com server
└── style.css, bulma.min.css, fonts.css, jquery3.6.0.js, bootstrap-toc.js
```

---

## 6. How the Live Site Works (Cloudways + WordPress + Static Files)

### The hosting setup

The live site runs on **Cloudways** (managed cloud hosting), using an **Apache web server** with a **WordPress installation** in `public_html/`. The repo is deployed to `public_html/` directly — so all files in the repo root land at the web root.

### The coexistence trick

WordPress and static HTML coexist via Apache's `.htaccess` rewrite system:

**Root `.htaccess`** contains two important blocks:

1. **Static file server** (before WordPress):
   ```apache
   RewriteCond %{REQUEST_FILENAME}\.html -f
   RewriteRule ^(.*)/$ $1.html
   ```
   This means: if a request for `/province/bologna/` finds a file at `province/bologna.html`, serve that file directly — WordPress never sees it.

2. **WordPress catch-all** (after):
   ```apache
   RewriteRule . app.html [L]
   ```
   Any request that doesn't match a real file or the `.html` rule gets sent to `app.html` (the client-side comparison app, not WordPress's `index.php`). This means WordPress's PHP is actually rarely invoked for regular pages.

**Per-directory `.htaccess`** (e.g. `province/bologna/.htaccess`):
```apache
RewriteEngine on
RewriteRule ^$ /province/bologna.html [L]
RewriteRule ^([a-zA-Z0-9-]+)/$ $1.html [L]
```
This handles the `/province/bologna/` → `province/bologna.html` rewrite as a fallback if the root rule doesn't catch it.

### Why this works on production but may fail on staging

For the per-directory `.htaccess` to work, Apache must have `AllowOverride All` (or at least `AllowOverride FileInfo`) set for the `public_html/` directory. On Cloudways production this is configured correctly. On a freshly cloned staging app, the Apache virtualhost config may default to `AllowOverride None`, which ignores all `.htaccess` files in subdirectories, causing requests to fall through to the WordPress catch-all.

### What `dataset.json` is and where it lives

`dataset.json` is the master data file containing all 107 province objects, an averages object, and regional data. It lives **only on the production server** at `https://expiter.com/dataset.json` — it is not in the repo.

The legacy generators fetch it at runtime: `fetch('https://expiter.com/dataset.json')`.

`script.js` (the client-side JS) also fetches it at page load to populate the "Quick Facts" sidebar section and other dynamic elements. This fetch **fails with a CORS error on the staging domain** because `expiter.com` does not allow cross-origin requests. This causes the Quick Facts section to show blank/zero values on staging — this is expected and not a regression.

---

## 7. The Nunjucks Migration (Branch: refactor/njk-migration)

### What was done

The EN province generators (`pageGeneratorSSR.js` and `CaSGenerator.js`) were migrated from **jsdom/jQuery virtual DOM** to **pure Nunjucks SSR**.

**Before**: generators created a jsdom virtual document, manipulated it with jQuery selectors, appended content by setting `.innerHTML`, and serialised with `.outerHTML`.

**After**: generators build a plain JS context object and call `nunjucks.render('pages/province.njk', context)` directly. No DOM involved.

No other generators were changed — IT, DE, FR, ES, comuni, region generators still use the old jsdom/jQuery approach.

### Commits on this branch (vs main)

```
1c809264be  Fix <aside> outside <body> in base.njk; regenerate all 214 province pages
bd54787e70  (earlier migration work)
266ec25ee1  (earlier migration work)
50493e5817  (earlier migration work)
7a73100f1d  (earlier migration work)
```

### The `<aside>` bug (fixed in latest commit)

The initial migration placed `<aside class="menu sb higher">` (the desktop sidebar) between `</head>` and `<body>` in `base.njk`. This is invalid HTML — browsers auto-correct it unpredictably, breaking the entire layout. Fixed in commit `1c809264be`: the `<aside>` now correctly appears as the first child of `<body>`.

Verification:
```bash
node -e "const fs=require('fs'),t=fs.readFileSync('province/bologna.html','utf8'),i=t.indexOf('</head>');console.log(t.slice(i,i+60))"
# Must print: </head>\n<body ...>\n<aside ...
# NOT:        </head>\n<aside ...\n<body ...
```

### Current state of the branch

- `src/templates/layouts/base.njk` — fixed, `<body>` before `<aside>`
- `province/*.html` — 107 pages regenerated with fixed template
- `province/*/crime-and-safety.html` — 107 pages regenerated
- All 214 files committed and pushed to `origin/refactor/njk-migration`
- Not yet verified visually on staging (staging serving wrong files — see Section 8)

---

## 8. The Staging Problem — Why You See a Broken Page

### What you see

The staging URL `https://wordpress-1548079-6016833.cloudwaysapps.com/province/bologna/` returns an HTML page with:
- Raw i18n keys: `common.province`, `sections.overview`, `metrics.population` etc.
- A completely different page structure (different navbar, different sidebar, different footer)
- Empty data values everywhere

### What that page actually is

This is **`_site/province/reggio-calabria/index.html`** (or similar) — the broken Eleventy output. It is not the province page generated by `pageGeneratorSSR.js`.

### Why it's being served instead of the correct file

There are two possible explanations:

**Explanation A — `AllowOverride None` on staging:**

The per-directory `.htaccess` files (e.g. `province/bologna/.htaccess`) are being ignored because the Cloudways staging Apache config has `AllowOverride None` for `public_html/`. The request for `/province/bologna/` falls through to the WordPress catch-all rule `RewriteRule . app.html [L]`, which serves `app.html`. But `app.html` is the Eleventy-generated `_site/app/index.html` or similar — which also uses the broken i18n template.

**Explanation B — Cloudways deployment path mismatch:**

The Cloudways staging app is configured with deployment path `public_html/` but the git repo's `public_html/` may be a subdirectory (e.g. the repo lands at `public_html/expiter/` instead of `public_html/`), meaning `province/bologna.html` is at `public_html/expiter/province/bologna.html` but Apache serves from `public_html/`.

### How to diagnose

SSH into the Cloudways staging server and run:
```bash
ls ~/public_html/province/bologna.html
# If this file exists, the issue is AllowOverride (Explanation A)
# If this file does not exist, the issue is deployment path (Explanation B)

# Also check the Apache virtualhost config:
cat /etc/apache2/sites-enabled/*.conf | grep -A5 "AllowOverride"
```

### How to fix

**For Explanation A (AllowOverride):**
On Cloudways, go to the staging application → Server → Apache settings, or ask Cloudways support to enable `AllowOverride All` for the application's document root. Alternatively, move all the rewrite rules from the per-directory `.htaccess` files into the root `.htaccess`.

**For Explanation B (deployment path):**
Correct the Cloudways deployment path so the repo root maps to `public_html/`.

---

## 9. Languages & Translation

### Current approach (legacy generators)

Each language has its own set of generator scripts that produce HTML into language-prefixed directories:

| Language | Generator(s) | Output dir | URL prefix |
|----------|-------------|------------|------------|
| English | `pageGeneratorSSR.js`, `CaSGenerator.js` | `province/` | `/province/` |
| Italian | `pageGeneratorSSRItaly.js`, `CaSGeneratorIT.js` | `it/province/` | `/it/province/` |
| French | `pageGeneratorSSRFrench.js` | `fr/province/` | `/fr/province/` |
| German | `pageGeneratorSSRGerman.js` | `de/provinz/` | `/de/provinz/` |
| Spanish | `pageGeneratorSSRSpanish.js` | `es/provincia/` | `/es/provincia/` |

Each generator imports language-specific content strings and sidebar functions from `js/pageBuilder.js` (e.g. `setSideBarIT()`, `setSideBarDE()`). Province names are translated in French (`agrigente`, `alexandrie`, `ancône`) and partially in other languages.

`hreflang` tags in the `<head>` link the EN and IT versions of each page together. FR, DE, ES do not currently have hreflang cross-links (possible SEO gap).

### Eleventy — no translations yet

The Eleventy system has no language support. `_site/` contains only EN pages. The broken i18n keys (`common.province` etc.) suggest a translation system was planned but never implemented. The Eleventy build would need a proper i18n data layer before it could replace even the EN generator.

### Scale of the translation work

- EN: 107 province + 107 crime-and-safety + ~8,000 comuni + regions + index = ~9,000+ pages
- × 5 languages = ~45,000+ pages total (excl. comuni for DE/FR/ES which also exist)
- Total tracked HTML files in repo: **~52,000**

---

## 10. File Counts & Scale

| Location | Files | What |
|----------|-------|------|
| `province/` | 322 | EN province HTML + .htaccess |
| `it/` | 10,178 | IT all pages |
| `de/` | 7,460 | DE all pages |
| `es/` | 7,551 | ES all pages |
| `fr/` | 5,431 | FR all pages |
| `comuni/` | 10,051 | EN comuni pages |
| `_site/` | 9,981 | Eleventy output (broken, EN only) |
| Root `.html` | 52,217 | All tracked HTML files total |
| **Total repo** | **~52,000+ HTML** | Across all languages and sections |

---

## 11. Cloudflare Pages vs Cloudways — Full Analysis

### The claim

A previous analysis suggested migrating the "Eleventy site" to Cloudflare Pages because `_site/` has only ~9,600 files — within Pages' 20,000 file limit.

### Why that analysis is incomplete

That analysis only counts the Eleventy `_site/` output (EN only, broken). The **full site** is:
- ~52,000 HTML files across 5 languages
- Plus assets (images, CSS, JS, fonts)

Cloudflare Pages has a **20,000 file limit per deployment**. The full site at ~52,000+ files is more than 2.5× that limit. Cloudflare Pages is **not viable for the full site without major restructuring**.

### Options if you want to move off Cloudways

| Option | Viable? | Notes |
|--------|---------|-------|
| Cloudflare Pages (EN only) | Yes — 9,600 files | But abandons 5-language support |
| Cloudflare Pages (all languages) | No — 52,000+ files | Exceeds 20,000 file limit |
| Cloudflare Pages + multiple repos/projects per language | Possible | Complex, 5 separate CF projects |
| Cloudflare Pages with i18n via routing | Possible | Requires rewriting the translation system |
| Netlify | Yes — no file count limit | 100GB bandwidth/month free, unlimited files |
| AWS S3 + CloudFront | Yes | No file limit, cheap at this scale, CDN included |
| Cloudways (keep current) | Yes | Known working, WordPress coexistence solved |

### The real migration question

The deeper question is whether to **replace the legacy generators with Eleventy** (or another SSG). If yes:

- The Eleventy system needs: (a) i18n support for 5 languages, (b) all content sections ported from `pageBuilder.js` into templates, (c) comuni, region, and safety pages ported, (d) the broken i18n key issue fixed.
- The `_site/` Eleventy output would then cover all languages, likely 50,000+ files.
- At that scale, Cloudflare Pages is not viable. Netlify or S3+CloudFront would be.

If the goal is just **Cloudflare Pages for the EN province pages only** as a quick win, that's viable — but it means running two hosting setups (CF Pages for EN, Cloudways for everything else).

---

## 12. Known Bugs & Technical Debt

### Active bugs

1. **Eleventy `_site/` pages have raw i18n keys** — `common.province`, `sections.overview`, `metrics.*` etc. are baked into the HTML. Cause: `src/_includes/base.njk` references translation keys that don't exist in the data layer. These files are tracked in git and deployed to production (but WordPress/static routing means they're never actually served on the live site — yet).

2. **`_site/` is tracked in git** — 9,981 generated files committed. This bloats the repo, slows git operations, and creates confusion about what's source vs output. Generated files should be in `.gitignore`.

3. **Port 8080 EADDRINUSE** — all legacy generators start an HTTP server on port 8080 (a legacy artifact). Running a generator twice without killing the port causes the second run to crash silently, writing no files. See Section 13 for the workaround.

4. **`dataset.json` is not in the repo** — generators fetch it from `expiter.com` at runtime. If the live site is down or slow, generation fails. There is no local copy or fallback.

5. **`NaN` values in generated content** — some province pages contain `NaN` in text (e.g. "This is NaN% less than average"). These come from missing or null fields in `dataset.json` and are a data quality issue, not a template bug.

6. **`undefined pharmacies`** — some pages say "there are around `undefined` pharmacies". Same cause: missing field in dataset.

7. **`script.js` still fetches `dataset.json` client-side** — the client-side script re-fetches the entire dataset on every page load to populate the Quick Facts sidebar section. This is a CORS failure on any domain other than `expiter.com`, and adds load time on production.

### Technical debt

- **28 separate generator scripts** — mostly copy-paste of each other with language strings swapped. Should be unified into one generator with a language parameter.
- **`pageGeneratorSSRItaly.js` still uses jsdom/jQuery** — only EN generators were migrated to Nunjucks in `refactor/njk-migration`. All other languages still use the old virtual DOM approach.
- **No build orchestration** — there is no `npm run build` or Makefile that runs all generators in sequence. They must be run individually.
- **`_site/` in git** — should be gitignored.
- **Broken Eleventy i18n** — the `src/_includes/base.njk` layout references i18n keys that don't exist. The Eleventy system is not production-ready.

---

## 13. How to Run the Generators

### Prerequisites

Always kill port 8080 before running any generator:

```powershell
# PowerShell
$proc = (Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue | Select-Object -First 1).OwningProcess
if ($proc) { Stop-Process -Id $proc -Force; "Killed $proc" } else { "Port 8080 free" }
```

### Running EN province generator

```bash
cd /path/to/expiter
node pageGeneratorSSR.js > /tmp/pgen.txt 2>&1 &
PID=$!
sleep 25          # wait for fetch + async file writes
kill $PID 2>/dev/null
grep -c "Saved" /tmp/pgen.txt   # should print 107
```

### Running EN crime & safety generator

```bash
# Kill port 8080 first (see above), then:
node CaSGenerator.js > /tmp/casgen.txt 2>&1 &
PID=$!
sleep 25
kill $PID 2>/dev/null
grep -c "Saved" /tmp/casgen.txt   # should print 107
```

### Verifying the output is correct

```bash
# Verify <body> comes before <aside> (the key structural fix)
node -e "
  const fs = require('fs');
  const t = fs.readFileSync('province/bologna.html', 'utf8');
  const i = t.indexOf('</head>');
  console.log(t.slice(i, i + 60));
"
# Should print: </head>\n<body data-spy="scroll"...>\n<aside class="menu sb higher">
```

### Running other language generators

Same pattern — kill port 8080, run, wait 25s, kill:

```bash
node pageGeneratorSSRItaly.js > /tmp/it.txt 2>&1 & PID=$!; sleep 25; kill $PID
node pageGeneratorSSRFrench.js > /tmp/fr.txt 2>&1 & PID=$!; sleep 25; kill $PID
node pageGeneratorSSRGerman.js > /tmp/de.txt 2>&1 & PID=$!; sleep 25; kill $PID
node pageGeneratorSSRSpanish.js > /tmp/es.txt 2>&1 & PID=$!; sleep 25; kill $PID
```

### Running the Eleventy build (do not deploy — broken)

```bash
npx @11ty/eleventy
# Output goes to _site/
# Pages will have broken i18n keys — do not use for production
```

---

## 14. Recommended Next Steps

### Immediate (unblock staging)

1. **SSH into the Cloudways staging server** and check:
   ```bash
   ls ~/public_html/province/bologna.html
   ```
   If the file exists → the issue is `AllowOverride None`. Ask Cloudways to enable `AllowOverride All` on the staging app, or consolidate all rewrite rules into the root `.htaccess`.

   If the file doesn't exist → the deployment path is wrong. Fix the Cloudways git deployment path.

2. **Once staging serves the correct page**, visually verify:
   - Desktop sidebar appears on the LEFT (not above the title)
   - Navbar at the top
   - Hero image behind the page title
   - Tabs widget with coloured `<score>` badges
   - Main content sections (Overview with map, Climate, Cost of Living, etc.)
   - Discover section with Viator widget at bottom

### Short term (clean up the repo)

3. **Add `_site/` to `.gitignore`** — it's 9,981 generated files with known bugs that don't belong in git.

4. **Fix the Eleventy i18n keys** — either implement a proper i18n data layer for Eleventy, or remove the broken key references from `src/_includes/base.njk` and replace with hardcoded EN strings until a proper solution exists.

5. **Migrate remaining language generators to Nunjucks** — `pageGeneratorSSRItaly.js`, `pageGeneratorSSRFrench.js`, `pageGeneratorSSRGerman.js`, `pageGeneratorSSRSpanish.js` still use jsdom/jQuery. Port them the same way EN was ported.

### Medium term (architecture decision)

6. **Decide on the future build system**: continue improving the legacy generator approach (simpler, more control) or commit to Eleventy (better tooling, but requires completing the i18n system and porting all content). This decision gates the hosting choice.

7. **If staying with legacy generators**: unify the 28 scripts into one configurable generator, add a proper `npm run build` script, add `dataset.json` to local storage or a build-time fetch cache.

8. **If moving to Eleventy**: implement i18n with a proper translation data file (e.g. `src/_data/i18n/en.json`), port all language content, then evaluate Netlify or S3+CloudFront for hosting (not Cloudflare Pages — file count too high at full scale).
