# `app.html` Redesign — Handoff

## Context

`app.html` (served at `https://expiter.com/` and `https://expiter.com/app/`) is the **province comparison / discovery tool** — the visual entry point of expiter.com and a primary conversion surface.

It is **untouched by the recent NJK migration**. The province detail pages (`/province/{slug}/` and `/province/{slug}/crime-and-safety/`) have just been redesigned with a clean Bootstrap 5 / Trellis-style layout. `app.html` still has the legacy look: dense province cards with a fixed background of city photos, bright neon score chips, a wall of filter buttons at the top, and the legacy hamburger navbar markup. It is now visually inconsistent with the rest of the site.

**Your job: redesign `app.html` so it matches the new province page aesthetic, without breaking any of its existing client-side comparison/filter logic.**

## Where to find the current state

- `c:/Users/Pietro/Desktop/Github/expiter/app.html` — the page (single file, no template).
- `c:/Users/Pietro/Desktop/Github/expiter/script.js` — client-side logic that fetches `dataset.json`, builds and re-builds the province card grid in response to filter and sort actions, and powers the comparison tool.
- `c:/Users/Pietro/Desktop/Github/expiter/style.css` — legacy site CSS. Many of the card classes in `app.html` are styled here. You will likely keep some and drop others.
- `c:/Users/Pietro/Desktop/Github/expiter/dataset.json` — fetched at runtime from `https://expiter.com/dataset.json`. Not in repo. Schema is documented in `ARCHITECTURE.md` § Data Model.
- `c:/Users/Pietro/Desktop/Github/expiter/province/milano.html` — **reference implementation** of the new design language. Mirror its tokens, spacing, navbar, footer.
- `c:/Users/Pietro/Desktop/Github/expiter/src/templates/layouts/base.njk` — source-of-truth CSS variables and component styles (navbar, tier chips, sidebar, footer). Copy these into `app.html`'s inline `<style>` block — `app.html` is a flat HTML file, not part of the NJK pipeline.

## What must keep working

`script.js` is the brain of this page. **Do not rename DOM IDs, classes, or data attributes that `script.js` reads.** Audit `script.js` first to find every querySelector / getElementById / className branch and treat that list as inviolable. In particular:

- The filter button strip (Expat-friendly / A–Z / Random / Region / Population / Climate / Cheapest / Safety / Lack of Crime / Nightlife / Education / Sunshine / Hottest / Coldest / Wettest / Nomad-friendly / LGBTQ+-friendly / Women-friendly / Family-friendly / Vegan-friendly / Pop. Density / Best Beaches / Best Hikes / Best Skiing) drives sort/filter via `?sort=…` URL params. Each button needs an `onclick` (or an event listener bound by `script.js`) and a way to mark "active".
- The province card grid is built dynamically. The container element ID is read by `script.js` — preserve it.
- The "Filter by region" / "Additional filters" controls at the bottom: keep the same form structure or update `script.js` accordingly.
- The comparison drawer / selection state (multi-select province compare) must continue to function.
- URL query params (`?sort=…&region=…&filters=…`) must continue to read/write correctly so existing inbound links from the province pages' sidebars (e.g. `?sort=Safety&region=Sicilia`) don't break.

## Design direction

Match the province page aesthetic:

1. **Navbar** — replace the legacy hamburger markup with the same Bootstrap navbar used on the province page (see `base.njk` lines starting at `<nav class="navbar navbar-expand-lg site-navbar sticky-top">`). Same brand text, same nav items, sticky-top.
2. **Page header** — clean `<h1>` "Best Provinces in Italy for Expats" with a one-sentence lede. Drop the rainbow filter wall above the cards.
3. **Filter bar** — turn the 24+ filter buttons into a single horizontally-scrollable pill row (Bootstrap `nav nav-pills` or custom), with a clear "Sort by" label. Active pill uses the same `--bs-primary` accent. The current grid of bordered boxes feels like 2014 — replace with one row of subtle pills. Move "Region" and "Additional filters" into a slim toolbar directly above the cards (left: region dropdown; right: a "More filters" button that opens an offcanvas or collapse panel — Bootstrap offcanvas is appropriate). On mobile the filter row scrolls horizontally; on desktop it wraps gracefully.
4. **Result summary line** — keep the "Based on our data, the Best province … is X, with a score of Y/10. …" line but restyle as a muted lede under the H1, not a centered tagline. Make the linked names use the same `--bs-primary` color as the rest of the site.
5. **Province cards** — this is the biggest visual change. The current cards have full-bleed city photographs as backgrounds with text overlaid, which is dense and hard to scan. Redesign as:
   - White card, `border: 1px solid #e5e7eb`, `border-radius: 0.75rem`, subtle shadow on hover.
   - **Top**: a 16:9 thumbnail (use the same ImageKit URL pattern: `https://ik.imagekit.io/cfkgj4ulo/italy-cities/{Abbreviation}.webp?tr=w-400,h-225,c-at_least,q-60`).
   - **Body**: province name (H3) + region (small muted text under it) + population (small line) + a tight grid of metric chips using the same `.tier-chip {excellent|great|good|average|poor}` style already defined in `base.njk` (and now copied into `app.html`). 6–8 metrics max per card (Cost, Healthcare, Safety, Climate, Transport, Nightlife, LGBTQ+, DN-friendly — depending on the active sort). Use the same emoji-prefixed label pattern as the score rows in the scorecard.
   - Card is a single `<a>` link to `/province/{slug}/`, with a hover state. The current "checkbox to compare" affordance should become a small overlay checkbox in the top-right corner of the thumbnail.
6. **Comparison drawer** — when 2+ provinces are checked, surface a sticky bottom bar ("Compare 3 provinces →") that opens a comparison view. The current implementation likely already does something here — preserve the underlying state, restyle the surfacing.
7. **Footer** — copy the `.site-footer` from `base.njk`.
8. **Colors / fonts / radii** — reuse the CSS variables defined in `base.njk`:
   - `--bs-primary: #2563eb`
   - `--tier-excellent/great/good/average/poor` and their `--tier-bg-*` background pairs
   - System font stack
   - `border-radius` of `0.5rem` (small) / `0.75rem` (medium) / `999px` (pill)
   - Body color `#1f2937`, muted text `#6b7280`, border color `#e5e7eb`.
9. **Bootstrap** — load Bootstrap 5.3.3 CSS + bundle JS (same CDN URLs as `base.njk`). Drop dependence on Bulma if practical, but if `style.css` rules used by other pages reference Bulma classes, keep `bulma.min.css` loaded for now and just don't add new Bulma markup.

## What to delete

- The big colored "filter wall" above the cards (the matrix of bordered emoji-prefixed buttons) — replace with a single pill row.
- The radial-gradient blue page background.
- The "Italy Expats & Nomads" stylized logo block in the legacy navbar (replaced by the new navbar brand text).
- Any inline `<font>` tags or deprecated HTML.
- The legacy `<input type="checkbox" id="nbar">` + `.hamburger-lines` markup.

## What to keep verbatim

- All `id` and `data-*` attributes on the filter buttons, the cards container, the region filter, and any element `script.js` references.
- The `dataset.json` fetch and the comparison logic.
- SEO meta and the "Quick Facts" pattern if present.

## Validation

Before declaring done:

1. Click every filter pill — the URL updates with `?sort=…`, the cards reorder, the active pill highlights.
2. Click a card — lands on `/province/{slug}/` (current behavior must be preserved).
3. Region filter narrows the visible cards.
4. Multi-select compare still works.
5. Mobile (≤600px): navbar collapses, filter pills scroll horizontally, cards stack in one column.
6. Tablet (≤900px): cards in 2 columns.
7. Desktop: cards in 3 or 4 columns.
8. Visit `https://expiter.com/app/?sort=Safety&region=Sicilia` — both params still applied.
9. Lighthouse: Performance ≥ 80, no CLS spikes from late-loading card images (use explicit `width`/`height` or `aspect-ratio` on the thumbnail wrapper).
10. Visual parity test: open `/province/milano.html` and `/app.html` side by side — same navbar, footer, type system, colors, spacing rhythm, button styles.

## Out of scope

- Re-implementing the comparison logic in a framework.
- Server-side rendering `app.html` via NJK (it can stay flat — it's the only page that has heavy client-side state).
- Translating to IT/FR/DE/ES — that's a separate task. For now this redesign is EN only; the language variants of `app.html` (`it/app.html`, `de/app/index.html`, etc.) can be ported in a follow-up using the same pattern.

## Estimated effort

Half a day to a day for an engineer familiar with Bootstrap and reading `script.js`. The hard part is the audit of `script.js` selectors — once that list exists, the redesign is mechanical.
