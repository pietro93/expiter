# Expiter — Architecture & NJK Migration Guide

## 1. Current Architecture

### Overview

Expiter is a static site generator for Italian province/municipality data targeting expats and digital nomads. It produces ~10,000+ static HTML files in multiple languages (EN, IT, FR, DE, ES) from a central JSON dataset.

**Stack:**
- Node.js (ES modules, `type: "module"`)
- `jsdom` — virtual DOM for server-side HTML construction
- `jquery` — DOM queries against the jsdom window
- `node-fetch` — fetches `https://expiter.com/dataset.json` and `dataset_crime_2023.json` at build time
- `nunjucks` — installed but only partially used in newer files
- `bulma` — CSS framework
- ImageKit CDN — image delivery with on-the-fly transforms
- `@11ty/eleventy` — installed but migration is incomplete

---

### Data Model

`dataset.json` is a flat array with a specific index layout:

| Index range | Content |
|---|---|
| `0–106` | 107 province objects |
| `107` | National averages object (`avg`) |
| `108–127` | 20 region objects |

**Province fields (key):** `Name`, `Abbreviation`, `Region`, `Population`, `Density`, `Size`, `Towns`, `Men`, `Women`, `MonthlyIncome`, `Cost of Living (Individual)`, `Cost of Living (Family)`, `Cost of Living (Nomad)`, `MonthlyRental`, `StudioRental`/`Sale`, `BilocaleRent`/`Sale`, `TrilocaleRent`/`Sale`, `HousingCost`, `SunshineHours`, `HotDays`, `ColdDays`, `RainyDays`, `FoggyDays`, `AirQuality`, `Climate`, `Healthcare`, `Education`, `Safety`, `Crime`, `SafetyRank`, `SafetyScore`, `IndiceCriminalita`, `FurtiDestrezza`, `FurtiStrappo`, `FurtiAutovettura`, `FurtiAbitazione`, `Omicidi`, `ViolenzeSessuali`, `Estorsioni`, `RiciclaggioDenaro`, `ReatiStupefacenti`, `InfortuniLavoro`, `MortalitàIncidenti`, `ReportedCrimes`, `RoadFatalities`, `WorkAccidents`, `CarTheft`, `HouseTheft`, `Robberies`, `PublicTransport`, `Traffic`, `CyclingLanes`, `Culture`, `Nightlife`, `Sports & Leisure`, `Beach`, `Hiking`, `Universities`, `Subway`, `Pharmacies`, `GeneralPractitioners`, `SpecializedDoctors`, `LifeExpectancy`, `HighSchoolGraduates`, `UniversityGraduates`, `YearsOfEducation`, `VehiclesPerPerson`, `Bars`, `Restaurants`, `LGBTQAssociations`, `Family-friendly`, `Female-friendly`, `LGBT-friendly`, `Veg-friendly`, `DN-friendly`, `Fun`, `Friendliness`, `English-speakers`, `Antidepressants`, `HighSpeedInternetCoverage`, `Innovation`, `SizeByPopulation`

**Supplementary data:**
- `temp/{ProvinceName}-comuni.json` — towns per province (107 files)
- `comuni.json` — ~landmark and history blurbs for notable towns
- `temp/parsedDataAbout{ProvinceName}.txt` — AI-written rich prose per province, split on `%%%` (first part = overview, second = transport)

**Second dataset:** `dataset_crime_2023.json` is merged onto `dataset.json` by `Name` key before generating crime pages.

---

### Generator Inventory

| File | Pages generated | URL pattern | Language |
|---|---|---|---|
| `pageGeneratorSSR.js` | 107 | `/province/{slug}/` | EN |
| `pageGeneratorSSRItaly.js` | 107 | `/it/province/{slug}/` | IT |
| `pageGeneratorSSRFrench.js` | 107 | `/fr/province/{slug}/` | FR |
| `pageGeneratorSSRGerman.js` | 107 | `/de/provinz/{slug}/` | DE |
| `pageGeneratorSSRSpanish.js` | 107 | `/es/provincia/{slug}/` | ES |
| `CaSGenerator.js` | 107 | `/province/{slug}/crime-and-safety/` | EN |
| `CaSGeneratorIT.js` | 107 | `/it/province/{slug}/crime-and-safety/` | IT |
| `QoLgenerator.js` | 107 | `/province/{slug}/quality-of-life/` | EN |
| `QoLgeneratorItaly.js` | 107 | `/it/province/{slug}/quality-of-life/` | IT |
| `comuniGenerator.js` | 107 | `/comuni/province-of-{slug}/` | EN |
| `comuniGeneratorItaly.js` | 107 | `/it/comuni/provincia-di-{slug}/` | IT |
| `comuniGeneratorFrench.js` | 107 | `/fr/comuni/province-de-{slug}/` | FR |
| `comuniGeneratorGerman.js` | 107 | `/de/gemeinden/provinz-{slug}/` | DE |
| `comuniGeneratorSpanish.js` | 107 | — | ES |
| `townPageGenerator.js` | ~200/province × 107 = ~9,800 | `/comuni/{province-slug}/{town-slug}/` | EN |
| `townPageGeneratorItaly.js` | ~9,800 | `/it/comuni/{province-slug}/{town-slug}/` | IT |
| `townPageGeneratorFrench.js` | ~9,800 | `/fr/comuni/...` | FR |
| `townPageGeneratorGerman.js` | ~9,800 | `/de/gemeinden/...` | DE |
| `townPageGeneratorSpanish.js` | ~9,800 | — | ES |
| `provincesGeneratorSSR.js` | 1 | `/provinces/` | EN |
| `regionGeneratorSSR.js` | 1 | `/region/regions-of-italy/` | EN |
| `regionGeneratorSSRItaly.js` | 1 | `/it/regioni/regioni-italiane/` | IT |
| `regionGeneratorSSRFrench.js` | 1 | `/fr/regions/...` | FR |
| `regionGeneratorSSRGerman.js` | 1 | `/de/...` | DE |
| `indexGeneratorSSR.js` | 1 | `/app/` (or `/`) | EN |
| `indexGeneratorSSRitaly.js` | 1 | `/it/app/` | IT |
| `indexGeneratorSSRFrance.js` | 1 | `/fr/app/` | FR |
| `indexGeneratorSSRGermany.js` | 1 | `/de/app/` | DE |
| `indexGeneratorSSRSpanish.js` | 1 | `/es/app/` | ES |
| `sitemapGenerator.js` | XML files | `autositemap.xml` + `provinces-sitemap{N}.xml` | — |
| `sitemapGeneratorItaly.js` | XML files | IT sitemaps | — |

**Shared utility: `js/pageBuilder.js`** — exports `setSideBar()`, `setSideBarIT()`, `setSideBarDE()`, `setSideBarFR()`, `setSideBarES()`, `setNavBar()`, `headerScripts()`, `addBreaks()`.

---

### Build Pattern (all generators follow this)

```
fetch(dataset.json)
  → populateData(data)           // builds provinces{}, regions{}, facts{}, avg
  → for i in 0..106:
      readFile(temp/{name}-comuni.json)   // optional; attaches .Comuni[]
      readFile(temp/parsedDataAbout{name}.txt)  // optional rich prose
      dom = new jsdom.JSDOM(templateLiteralHTML)
      $ = require('jquery')(dom.window)
      newPage(province, $)       // jQuery-appends computed HTML strings
      html = dom.window.document.documentElement.outerHTML
      fs.writeFile(fileName+'.html', html)
```

---

### Page Anatomy (province page — canonical reference)

```html
<html lang="en">
<head>
  <!-- canonical + hreflang alternates (EN + IT) -->
  <!-- viewport, jQuery, dataset.json, script.js, bootstrap-toc.js deferred -->
  <!-- Mediavine/Grow ad scripts (headerScripts()) -->
  <!-- GetYourGuide Analytics -->
  <!-- fonts.css (print/onload lazy), bulma.min.css, style.css -->
  <!-- OG + Twitter meta, description, keywords, title -->
  <!-- favicon -->
</head>

<aside class="menu sb higher"> {sidebar} </aside>   <!-- desktop sidebar -->

<body data-spy="scroll" data-target="#toc">

  <!-- Collapsible TOC panel -->
  <div class="toc container collapsed">
    <i class="arrow left" onclick="...toggle..."></i>
    <nav id="toc" data-toggle="toc"></nav>
  </div>

  <nav id="navbar"></nav>   <!-- populated by setNavBar() via jQuery -->

  <!-- Hero image -->
  <div class="hero" style="background-image:url('https://expiter.com/img/{ABB}.webp')"></div>

  <h1 data-toc-skip id="title" class="title column is-12">  </h1>

  <!-- 3-tab scorecard (populated client-side by script.js AND build-time by appendProvinceData()) -->
  <div class="tabs effect-3">
    <input type="radio" id="tab-1" name="tab-effect-3" checked>  <span>Quality of Life</span>
    <input type="radio" id="tab-2" name="tab-effect-3">           <span>Cost of Living</span>
    <input type="radio" id="tab-3" name="tab-effect-3">           <span>Digital Nomads</span>
    <div class="line ease"></div>
    <div class="tab-content">
      <section id="Quality-of-Life" class="columns is-mobile is-multiline">
        <div class="column"> {~11 quality metrics with <score> tags} </div>
        <div class="column"> {~8 climate + lifestyle metrics} </div>
      </section>
      <section id="Cost-of-Living" class="columns is-mobile is-multiline">
        <div class="column"> {6 cost metrics} </div>
        <div class="column"> {6 cost metrics} </div>
      </section>
      <section id="Digital-Nomads" class="columns is-mobile is-multiline">
        <div class="column"> {5 nomad metrics} </div>
        <div class="column"> {5 nomad metrics} </div>
      </section>
    </div>
  </div>

  <!-- Long-form content sections -->
  <div id="info" class="columns is-multiline is-mobile">
    <section id="Overview">    <h2>Overview</h2>    <div id="overview"></div> </section>
    <section id="Climate">     <h2>Climate</h2>     <div id="climate"></div>  </section>
    <section id="Cost of Living"> <h2>Cost of Living</h2> <div id="CoL"></div> </section>
    <section id="Quality of Life">
      <section id="Healthcare">      <h3>Healthcare</h3>      <div id="healthcare"></div>     </section>
      <section id="Education">       <h3>Education</h3>       <div id="education"></div>      </section>
      <section id="Leisure">         <h3>Leisure</h3>         <div id="leisure"></div>        </section>
      <section id="Crime and Safety"><h3><a href=".../crime-and-safety/">Crime and Safety</a></h3><div id="crimeandsafety"></div></section>
      <section id="Transport">       <h3>Transport</h3>       <div id="transport"></div>      </section>
    </section>
    <section id="Discover">   <h2>Discover</h2>   <div id="promo"></div>    </section>
  </div>

  <aside class="menu sb mobileonly"> {sidebar} </aside>  <!-- mobile sidebar -->

</body>
</html>
```

---

### Content Generated Per Province Page

All content is computed in `getInfo(province)` and appended via jQuery `$('#id').append(html)`:

| Section ID | Content |
|---|---|
| `#overview` | Region map figure, population/density/ratio paragraph, AI-written prose from `parsedDataAbout*.txt`, comuni count, disclaimer, Google Maps embed |
| `#climate` | Sunshine hours vs. national + regional average, rainy days, foggy days, hot/cold days |
| `#CoL` | Monthly income comparison, cost-of-living individual/family, rental price, above/below average % |
| `#healthcare` | Pharmacies + GPs + specialists per 10k, life expectancy comparison |
| `#leisure` | Nightlife facts (from `populateNightlifeFacts()`), bars/restaurants per 10k |
| `#crimeandsafety` | ReportedCrimes %, road fatalities %, work accidents %, car/house theft %, robberies %, safety facts (from `populateSafetyFacts()`) |
| `#education` | HS graduates %, uni graduates %, years of schooling, university count |
| `#transport` | PublicTransport score, Traffic comparison, VehiclesPerPerson, Subway mention, CyclingLanes km/10k, AI transport prose |
| `#promo` | Viator affiliate widget, GetYourGuide widget, 4 related province snippets |
| Tabs | 30+ `<score>` tagged metrics across 3 tabs, all generated by `qualityScore()` + `appendProvinceData()` |

---

### The `qualityScore()` Function

This is a critical piece of business logic that must be faithfully reproduced:

```javascript
qualityScore(quality, score)
// Returns: <score class='{tier} {size}'>{label}</score>
```

**Tier classes** (CSS): `excellent`, `great`, `good`, `average`, `poor`  
**Size classes** (CSS): `short`, `medium`, `long`, `max`

**Logic categories:**
1. `CostOfLiving`, `HousingCost` — inverted scale (lower = better): `cheap` / `affordable` / `average` / `high` / `expensive`
2. Rental/sale/income amounts — shows raw `€/m` with color: `green` / `green` / `orange` / `red` / `red`
3. `HotDays`, `ColdDays` — inverted (lower = better): `not hot/cold` → `very hot/cold`
4. `RainyDays` — inverted: `very little` → `a lot`
5. `FoggyDays` — inverted with non-linear thresholds: `no fog` → `a lot`
6. `Crime`, `Traffic` — inverted: `very low` → `too much`
7. Everything else — standard (higher = better): `poor` / `okay` / `good` / `great` / `excellent`

All comparisons use `avg[quality]` as the baseline (index 107 of dataset).

---

### Images

| Use | URL pattern |
|---|---|
| Province hero (full size) | `https://expiter.com/img/{ABB}.webp` |
| Province hero (safety pages) | `https://expiter.com/img/safety/{ABB}.webp` |
| Province thumbnail (cards/snippets) | `https://ik.imagekit.io/cfkgj4ulo/italy-cities/{ABB}.webp?tr=w-280,h-140,c-at_least,q-5` |
| Province card (provinces listing) | `https://ik.imagekit.io/cfkgj4ulo/italy-cities/{ABB}.webp?tr=w-{w},h-{h},c-at_least,q-{q}` |
| Region map | `https://ik.imagekit.io/cfkgj4ulo/map/{Region-slug}-provinces.webp?tr=w-340` |

`ABB` = `province.Abbreviation` (e.g. `MI`, `RM`, `NA`)

---

### Sidebar (`js/pageBuilder.js` → `setSideBar()`)

Renders differently depending on whether a `province` object is passed:

**With province context:**
- Province Overview link
- Municipalities in {province} link  
- Provinces in {region} (app filter link)
- "Get Inspired" links (best places, cheapest, climate, safest in region)
- GetYourGuide auto-widget
- About blurb + Disclaimer

**Without province context (generic):** expat resources, codice fiscale tool, regions page, comparison tool links.

---

### Slug Generation

```javascript
// Province slug
province.Name.replace(/'/g, '-').replace(/\s+/g, '-').toLowerCase()
// e.g. "Valle d'Aosta" → "valle-d-aosta"

// Region slug for app filter URLs  
province.Region.replace(/'/g, '-').replace(/\s+/g, '-').toLowerCase()
// Note: pageBuilder uses handle(name, 1) for regions

// Town slug (townPageGenerator)
comune.Name.replace('(*)','').replace(/'/g, '-').replace(/\s+/g, '-').toLowerCase()
```

---

## 2. What the Failed Migration Got Wrong

The previous Eleventy migration attempt produced pages that lost:

1. **Rich prose content** — The `temp/parsedDataAbout{Name}.txt` files were not wired into the data pipeline. These contain AI-written paragraphs that are the most valuable SEO content on the site.
2. **The `qualityScore()` scorecard** — The 30+ `<score>` tagged metrics in the 3-tab panel were not replicated. This is the visual centrepiece of every page.
3. **Exact URL structure** — Eleventy's default pagination changes slugs and directory layout. Pre-migration URLs must be preserved exactly or 301 redirects are needed for every page.
4. **Sidebar content** — `setSideBar()` outputs province-specific contextual navigation. Generic sidebar was used instead.
5. **Hero images** — Province abbreviation-based ImageKit URLs were lost; no fallback.
6. **The `appendProvinceData()` tabs** — The complete tab structure with all 30 metrics was absent.
7. **Crime & Safety sub-pages** — `/province/{slug}/crime-and-safety/` pages were not generated at all.
8. **`.htaccess` files** — Each province directory needs `.htaccess` for clean URLs (generated by `CaSGenerator.js`).

---

## 3. Recommended Migration Strategy

### Principle

Replace jsdom/jQuery with Nunjucks templates **without changing any observable output**. Each generator becomes a Node.js script that: fetches data → computes all derived values in JS → passes a fully-resolved context object to `nunjucks.render()` → writes the HTML file.

No Eleventy. No SSG framework. Just Nunjucks as a dumb templating engine called from the same Node.js scripts, eliminating only the JSDOM dependency.

### Why not Eleventy

Eleventy's data cascade and pagination add indirection that makes it hard to control exact output. The generators are already structured build scripts. The only problem they have is using jsdom+jQuery to build HTML — Nunjucks solves that directly.

---

### Phase 0 — Shared Infrastructure

**`js/nunjucksEnv.js`** — single Nunjucks environment shared by all generators:
```javascript
import nunjucks from 'nunjucks'
export const env = nunjucks.configure('src/templates', { autoescape: false })
// autoescape: false because HTML strings are intentionally passed as values
```

**`js/qualityScore.js`** — extract `qualityScore()` as a standalone ES module export.  
**`js/slug.js`** — extract all `handle()` / slug functions as exports.  
**`js/translations.js`** — extract all `en()`, `it()`, `de()`, `fr()`, `es()` functions.  
**`js/content.js`** — extract `getInfo()` logic from each generator (province info HTML fragments). These return plain HTML strings and remain in JS — they do NOT go into templates.

---

### Phase 1 — Template Structure

```
src/templates/
  layouts/
    base.njk          ← <html>, <head>, <aside>, <nav>, TOC, hero, tabs wrapper, </body>
  partials/
    sidebar.njk       ← renders the sidebar HTML (or just pass pre-built HTML string)
    navbar.njk        ← hamburger nav
    tabs.njk          ← the 3-tab scorecard panel
    score_row.njk     ← single <p><ej>emoji</ej>Label: {scoreHtml}</p> row
  pages/
    province.njk      ← extends layouts/base.njk; fills #info sections
    crime-safety.njk  ← extends layouts/base.njk; fills crime sections
    comuni-list.njk   ← province → towns listing table
    town.njk          ← individual town page
    provinces.njk     ← /provinces/ listing (cards by region)
    regions.njk       ← regions-of-italy table
```

#### `layouts/base.njk` receives this context shape:
```javascript
{
  lang: 'en',
  seoTitle: '...',
  seoDescription: '...',
  seoKeywords: '...',
  canonicalUrl: 'https://expiter.com/province/milano/',
  hreflangIt: 'https://expiter.com/it/province/milano/',
  heroImage: 'https://expiter.com/img/MI.webp',
  sidebar: '...raw HTML string from setSideBar()...',
  // tab content — pre-rendered HTML strings:
  tab1col1: '...', tab1col2: '...',
  tab2col1: '...', tab2col2: '...',
  tab3col1: '...', tab3col2: '...',
  // page-specific content slots:
  content: '...rendered by child template...'
}
```

**Key decision:** Sidebar and tab content are generated as HTML strings in JS (same as today, just without jQuery). The template receives finished strings and `{{ sidebar | safe }}`. This preserves all existing logic without having to rebuild it declaratively.

---

### Phase 2 — Generator Refactor (one generator at a time)

Take `pageGeneratorSSR.js` as the first target. Change:

**Before:**
```javascript
const dom = new jsdom.JSDOM(templateHTML)
const $ = require('jquery')(dom.window)
newPage(province, $)
let html = dom.window.document.documentElement.outerHTML
fs.writeFile(fileName+'.html', html, ...)
```

**After:**
```javascript
import { env } from './js/nunjucksEnv.js'
import { qualityScore } from './js/qualityScore.js'

// Build tab content as strings (no jQuery needed)
function buildTabContent(province, avg) {
  let tab1col1 = ''
  tab1col1 += `<p><ej>👥</ej>Population: <b>${province.Population.toLocaleString('en')}</b>`
  tab1col1 += `<p><ej>🚑</ej>Healthcare: ${qualityScore('Healthcare', province.Healthcare, avg)}`
  // ... etc
  return { tab1col1, tab1col2, tab2col1, tab2col2, tab3col1, tab3col2 }
}

// Build info sections as strings (already done by getInfo() — just remove jQuery calls)
function buildInfoSections(province, facts, avg, regions) {
  // same logic as current getInfo() but return object of HTML strings
  return { overview, climate, col, healthcare, leisure, crimeandsafety, education, transport, promo }
}

// Render
const tabs = buildTabContent(province, avg)
const info = buildInfoSections(province, facts, avg, regions)
const html = env.render('pages/province.njk', {
  lang: 'en',
  seoTitle: `${en(province.Name)} - Quality of Life and Info Sheet for Expats`,
  seoDescription: `Information about living in ${en(province.Name)}, Italy...`,
  canonicalUrl: `https://expiter.com/${fileName}/`,
  hreflangIt: `https://expiter.com/it/${fileName}/`,
  heroImage: `https://expiter.com/img/${province.Abbreviation}.webp`,
  heroAlt: province.Name + ' Province',
  sidebar: setSideBar(province),
  ...tabs,
  ...info
})
fs.writeFile(fileName + '.html', html, callback)
```

---

### Phase 3 — Migration Order

1. `pageGeneratorSSR.js` (EN province pages) — highest value, proves the approach
2. `CaSGenerator.js` (EN crime pages) — second most important SEO pages
3. `comuniGenerator.js` (EN comuni listing pages)
4. `townPageGenerator.js` (EN town pages) — most complex, ~9,800 files
5. `provincesGeneratorSSR.js` + `regionGeneratorSSR.js` — listing pages
6. All IT variants (`*Italy.js`)
7. FR, DE, ES variants

---

## 4. Constraints & Risks

### CRITICAL — URL Preservation

Every generator writes to a specific path. These must be identical post-migration:

| Generator | Current output path |
|---|---|
| `pageGeneratorSSR.js` | `province/{slug}.html` |
| `CaSGenerator.js` | `province/{slug}/crime-and-safety.html` |
| `comuniGenerator.js` | `comuni/province-of-{slug}.html` |
| `townPageGenerator.js` | `comuni/{province-slug}/{town-slug}.html` |

The `.htaccess` files in each province directory (written by `CaSGenerator.js`) are what make `/province/milano/crime-and-safety/` work without `.html` extension. These must continue to be generated.

---

### CRITICAL — Rich Prose (`parsedDataAbout*.txt`)

`temp/parsedDataAbout{ProvinceName}.txt` files exist for all 107 provinces. The content is split on `%%%`:
- Part 0: province overview prose (injected into `#overview`)
- Part 1: transport prose (appended to `#transport`)

The previous migration ignored these files entirely. In the refactored generator, this becomes:

```javascript
let parsedData = fs.readFileSync(`temp/parsedDataAbout${province.Name}.txt`, 'utf8')
facts[province.Name].provinceData = parsedData.split('%%%')[0] || ''
facts[province.Name].transportData = parsedData.split('%%%')[1] || ''
```

These strings are then appended to `info.overview` and `info.transport` respectively, exactly as the original does.

---

### HIGH — The `qualityScore()` Function

This must be extracted exactly, including all edge cases:
- `FoggyDays` uses non-linear thresholds (`.265`, `.6`, `1.00`, `3x` avg) — not the standard `0.8/0.95/1.05/1.2` pattern
- `CostOfLiving`/`HousingCost` return word labels (`cheap`, `expensive`) not the standard `poor`/`excellent`
- Rental/income amounts show raw `€/m` values with color, not quality words
- Inverted metrics: `HotDays`, `ColdDays`, `RainyDays`, `FoggyDays`, `Crime`, `Traffic`

Do not simplify or generalise this function. Copy it verbatim into `js/qualityScore.js`.

---

### HIGH — `appendProvinceData()` Without jQuery

The current approach:
```javascript
tab1[0].innerHTML += '<p>...' // jQuery node
```

The replacement is simple string concatenation — no DOM needed:
```javascript
let tab1col1 = ''
tab1col1 += '<p>...'
```

No logic changes, just no jQuery wrapper.

---

### MEDIUM — Hardcoded Mafia Facts in `CaSGenerator.js`

`populateFacts()` inside `CaSGenerator.js` contains hardcoded city-specific content blocks (Napoli, Milano, Roma, Palermo, Reggio Calabria, etc.) for the organized crime section. These are injected into `facts[name].mafia`. This must not be lost — it is unique content that cannot be derived from the dataset.

These should be moved to `js/mafiaFacts.js` as a plain exported object.

---

### MEDIUM — `populateNightlifeFacts()` and `populateSafetyFacts()`

`pageGeneratorSSR.js` calls both of these. They likely contain hardcoded prose per province similar to the mafia facts. They must be preserved identically.

---

### MEDIUM — Nunjucks `autoescape`

All content strings contain raw HTML (e.g. `<b class='green'>`, `<score class='excellent'>`, `<a href=...>`). The Nunjucks environment **must** be configured with `autoescape: false`, or every variable must use `| safe`. Recommend `autoescape: false` globally since this is a trusted build pipeline, not user input.

---

### LOW — `comuniGenerator.js` Uses jQuery to Append Table Rows

The comuni listing table rows are appended via jQuery from `dataset[i].Comuni`. In the refactored version, pass the full `comuni` array to the template and use `{% for comune in comuni %}` to render `<tr>` rows declaratively. This is the one place where moving logic to the template is the right call.

---

### LOW — Random Related Provinces (`getInfo()` in `townPageGenerator.js`)

The `related1/2/3/4` province snippets are selected with `Math.random()`. This means the output changes on every build. This is fine — just preserve the behaviour.

---

### LOW — `comuniGenerator.js` Scope vs. `townPageGenerator.js` Scope

`townPageGenerator.js` only iterates `i = 27` to `30` (4 provinces: likely Bergamo, Brescia, Como, Varese in Lombardy). The full ~9,800-town generation presumably exists in a separate script or was never fully implemented. Confirm which generator produces the complete town set before attempting migration.

---

### LOW — Language Variants Share Almost All Logic

Each language variant (IT, FR, DE, ES) of a generator is ~90% identical to the EN version, differing only in:
- `en()` → `it()` / `de()` / `fr()` / `es()` translation calls
- `setSideBar()` → `setSideBarIT()` / `setSideBarDE()` etc.
- URL prefixes (`/it/`, `/de/`, etc.)
- Some label strings inside `getInfo()`

These should share a single `getInfo(province, lang)` function with language passed as a parameter, rather than 5 copies of the same file. But this refactor should be deferred until after the EN migration is verified correct.

---

## 5. File Structure After Migration

```
expiter/
  js/
    pageBuilder.js          ← unchanged (sidebar HTML builders)
    qualityScore.js         ← extracted from generators
    slug.js                 ← extracted handle() functions
    translations.js         ← extracted en()/it()/de()/fr()/es()
    mafiaFacts.js           ← extracted hardcoded facts
    nunjucksEnv.js          ← shared nunjucks.configure()
  src/
    templates/
      layouts/
        base.njk
      partials/
        tabs.njk
        sidebar.njk
      pages/
        province.njk
        crime-safety.njk
        comuni-list.njk
        town.njk
        provinces.njk
        regions.njk
  pageGeneratorSSR.js       ← refactored (no jsdom/jquery)
  CaSGenerator.js           ← refactored
  comuniGenerator.js        ← refactored
  townPageGenerator.js      ← refactored
  [... language variants ...]
  temp/                     ← unchanged (data files)
  comuni.json               ← unchanged
  dataset_crime_2023.json   ← unchanged (fetched remotely)
```

---

## 6. Verification Checklist (Per Generator)

Before marking a generator migrated, verify:

- [ ] Output HTML is byte-for-byte equivalent on a known province (e.g. Milano/Rome)
- [ ] `temp/parsedDataAbout*.txt` prose appears in `#overview` and `#transport`
- [ ] All 30+ `<score>` tags appear in the 3-tab panel with correct tier classes
- [ ] `qualityScore()` FoggyDays thresholds produce correct output
- [ ] Sidebar contains province-specific links (not generic)
- [ ] Hero image URL uses correct `Abbreviation` (not `Name`)
- [ ] Crime page generates inside `province/{slug}/crime-and-safety/` subdirectory
- [ ] `.htaccess` is written to the crime-and-safety directory
- [ ] `rel="canonical"` URL is correct
- [ ] `hreflang` alternates are present
- [ ] Related province snippets appear in `#promo`
- [ ] Google Maps embed present in `#overview`
- [ ] GetYourGuide widget present in sidebar and `#promo`
- [ ] Mediavine ad script present in `<head>`
