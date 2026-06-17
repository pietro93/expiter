# Expiter — Build System Guide

## Architecture

The live site at **expiter.com** is hosted on **Cloudways**, which pulls directly from this GitHub repository. There is no build step — all HTML files must be generated locally and committed. The `.github/workflows/static.yml` file exists in the repo but the live site is served via Cloudways pulling from GitHub, not GitHub Pages.

There is also an Eleventy setup (`_site/`) that is **not deployed** — it's a migration artifact. Ignore it for deployment purposes.

## Live site directories

| Directory | Content |
|-----------|---------|
| `province/` | EN province pages |
| `comuni/` | EN town/municipality pages |
| `it/province/`, `it/comuni/` | IT province + town pages |
| `de/provinz/`, `de/gemeinden/` | DE province + town pages |
| `fr/province/`, `fr/municipalites/` | FR province + town pages |
| `es/provincia/`, `es/municipios/` | ES province + town pages |
| `provinces/` | EN provinces list |
| `regions/` | EN regions list |
| `blog/` | Blog posts (hand-crafted, **do not regenerate**) |

## Generator scripts

All generators are run from the repo root with `node`. Many fetch live data from `https://expiter.com/dataset.json`.

### npm scripts (package.json)

```bash
npm run build           # EN province pages → province/
npm run build:it        # IT province + town pages → it/
npm run build:de        # DE province + town pages → de/
npm run build:fr        # FR province + town pages → fr/
npm run build:es        # ES province + town pages → es/
npm run build:cas       # EN crime & safety pages
npm run build:cas-it    # IT crime & safety pages
npm run build:cas-de    # DE crime & safety pages
npm run build:cas-fr    # FR crime & safety pages
npm run build:cas-es    # ES crime & safety pages
npm run build:provinces # Province listing pages
npm run build:regions   # Region listing pages
npm run build:static    # Static pages (privacy policy, resources, etc.)
```

### Scripts without npm aliases (run directly)

```bash
node townPageGenerator.js         # EN town pages → comuni/
node townPageGeneratorItaly.js    # IT town pages → it/comuni/
node townPageGeneratorGerman.js   # DE town pages → de/gemeinden/
node townPageGeneratorFrench.js   # FR town pages → fr/municipalites/
node townPageGeneratorSpanish.js  # ES town pages → es/municipios/
node comuniGenerator.js           # EN comuni list pages
node comuniGeneratorItaly.js      # IT comuni list pages
# … and equivalents for DE/FR/ES
```

## Templates

All page templates are in `src/templates/`:

- `layouts/base.njk` — master layout (all languages extend this)
- `layouts/base-it.njk`, `base-de.njk`, `base-fr.njk`, `base-es.njk` — language overrides (breadcrumb + tab labels only; they extend `base.njk`)
- `pages/town.njk` — town page content blocks
- `pages/province.njk` — province page content blocks
- `pages/comuni-list.njk`, `pages/provinces-list.njk`, `pages/regions-list.njk`
- `pages/crime-safety.njk` + language variants

### Critical: `journey-content` class placement

Mediavine Journey uses `journey-content` to locate the main content area for sidebar ad injection. For Journey to resolve the sidebar relationship, the `<main>` and `<aside>` must **each be wrapped in their own Bootstrap grid column `<div>`**. The grid classes (`col-*`, `order-*`) live on the wrapper divs; the semantic classes (`journey-content`, `sidebar-primary`) live on the inner `<main>`/`<aside>`.

Correct structure (`base.njk` lines ~84-164):
```html
<div class="row g-4">
  <div class="col-12 col-lg-8 col-xl-9 order-1">
    <main class="journey-content"> ... </main>
  </div>
  <div class="col-12 col-lg-4 col-xl-3 order-2">
    <aside class="sidebar-primary" aria-label="Sidebar"> ... </aside>
  </div>
</div>
```

Do **not** put grid classes directly on `<main>` (the old `<main class="col-... journey-content">` form). When `<main>` sat as a direct grid child of `.row.g-4` next to `<aside>`, Journey couldn't resolve the sidebar and injected `sidebar_btf_placeholder` as a 3rd sibling column — the ad rendered below/outside the sidebar instead of inside it. The inner `<div class="entry-content">` must NOT carry `journey-content` either.

If the sidebar ad escapes the sidebar column, the canonical fix is to confirm `base.njk` has the wrapped structure above and **regenerate** the affected pages with the build scripts below — a regex find/replace is unreliable here because the wrappers require inserting matching closing `</div>`s in two places per page.
```

## Deploying

```bash
git add -A
git commit -m "Regenerate pages"
git push origin main
```

Cloudways pulls from GitHub on push to `main` and serves the static files directly — there is no GitHub Pages / GitHub Actions build step in the live path. The deploy takes ~1–2 minutes.

## Blog posts

Blog posts in `blog/` are hand-crafted HTML — **never regenerate them** with any script. The blog migrator (`blogMigrator.js`) is destructive and empties the body on re-run. Restore from git if accidentally overwritten.

## Local preview

```bash
npm run dev    # starts live-server on http://localhost:3000
```
