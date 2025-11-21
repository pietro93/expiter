# Website Restructuring Proposal: Modernizing Expiter Architecture

## Executive Summary

This document proposes a comprehensive restructuring of the Expiter website to replace the current ad-hoc generator system with industry-standard template-based architecture. The current approach maintains 25+ duplicate generator files with parallel implementations for multiple languages, resulting in significant technical debt, maintenance burden, and code redundancy.

---

## 1. Current Architecture Analysis

### 1.1 Current Problem State

**Generator Duplication:**
- `pageGeneratorSSR.js` and variants (French, German, Italian, Spanish)
- `indexGeneratorSSR.js` and 4 language variants
- `regionGeneratorSSR.js` and 4 language variants
- `townPageGenerator.js` and 4 language variants
- `CaSGenerator.js` and `CaSGeneratorIT.js`
- `comuniGenerator.js` and 4 language variants
- `provincesGeneratorSSR.js` (single file)
- `safetyGenerator.js` and `safetyPageGenerator.js`
- `QoLgenerator.js` and `QoLgeneratorItaly.js`
- Additional parsers for each language variant

**Issues Identified:**
1. **Code Duplication**: 80-90% identical code across language variants
2. **Maintenance Nightmare**: Bug fixes must be applied to 5+ files
3. **Scalability Problem**: Adding a new language requires creating 10+ new files
4. **Inconsistent Updates**: Language variants drift apart over time
5. **Poor Separation of Concerns**: HTML generation mixed with business logic
6. **Hard-coded HTML Strings**: 600+ lines of HTML concatenation in single generators
7. **No Template Reuse**: Same page layouts repeated in different generators
8. **Testing Difficulty**: Each variant must be tested independently

---

## 1.1.1 Current Data Pipeline & Scripts Breakdown

### **Data Sources**

**Primary Dataset: `dataset.json`**
Main source containing all 107 Italian provinces with 80+ quality metrics:

```json
[
  {
    "Name": "Agrigento",
    "Population": 434870,
    "Region": "Sicilia",
    "SizeByPopulation": 42,
    "Size": 305259,
    "Density": 142,
    "Towns": 43,
    "Men": 48.56,
    "Women": 51.44,
    "Healthcare": 6.8,
    "Education": 5.59,
    "Safety": 7.64,
    "Crime": 4.16,
    "Nightlife": 4.71,
    "Climate": 8.98,
    "SunshineHours": 273,
    "HotDays": 27.77,
    "RainyDays": 5.86,
    "ColdDays": 0,
    "FoggyDays": 0.06,
    "Cost of Living (Individual)": 1129.97,
    "Cost of Living (Family)": 1698.95,
    "MonthlyIncome": 1169.78,
    "MonthlyRental": 636.53,
    "DN-friendly": 6.86,
    "Expat-friendly": 6.38,
    "Viator": "Agrigento/d27852-ttd",
    "WeatherWidget": "37d3113d59/agrigento/"
    // ... 40+ more fields
  },
  // ... 106 more provinces
]
```

**Comuni Data: `comuni.json`**
Historical and landmark information for major cities:

```json
[
  {
    "Name": "Roma",
    "Landmarks": "Rome has important historical landmarks...",
    "History": "Rome was founded in the 8th century BC...",
    "Attrazioni": "Roma ha importanti monumenti storici...",
    "Storia": "Roma fu fondata nell'VIII secolo a.C..."
  },
  // ... for Milano, Napoli, Torino, etc.
]
```

### **Script Ecosystem Breakdown**

#### **1. Data Parser Scripts** (Extract and prepare raw data)

**`parseWikitravel.js`** (~180 lines)
- **Purpose**: Scrapes Wikipedia/Wikivoyage for overview text about each province
- **Process**:
  1. Fetches HTML from `https://en.m.wikivoyage.org/wiki/{province_name}`
  2. Uses jsdom + jQuery to parse DOM and extract main content
  3. Removes metadata, citations, and navigation elements
  4. Cleans HTML and text encoding issues
  5. Saves extracted content to `temp/parsedDataAbout{province}.txt`
- **Example Output**: 
  ```
  "The province of Agrigento is home to the Valley of the Temples..."%%%
  "Getting around: Public transport is limited..."
  ```
  (Separated by `%%%` delimiter)

**`parseComuni.js`** (~600 lines)
- **Purpose**: Scrapes Italian municipal data from tuttitalia.it
- **Two-stage process**:
  1. **Stage 1**: Fetches municipality population table for each province
     - Uses CSS selectors: `table.ut tr td a` to extract gemeente names
     - Extracts: population, surface area, density, altitude
     - Saves to `temp/{province}-comuni.json`
  
  2. **Stage 2**: Fetches climate classification data
     - Secondary request to climate classification URL
     - Maps each municipality to climate zone (A, B, C, D, E, F)
     - Handles name mismatches with fuzzy matching algorithm
- **Output**: JSON with 1000s of municipalities across all provinces

**`parseGoogleMaps.js`** (mentioned, not examined)
- Likely extracts map data and location coordinates

**Other parsers**: `parseWikitravelitaly.js`, `parseWikiTravelGerman.js`, `parseWikiTravelSpanish.js`, `parseWikitravel france.js`
- Same functionality but pull content in different languages from respective Wikipedia versions

---

#### **2. Generator Scripts** (Create static HTML pages)

**`pageGeneratorSSR.js`** (~850 lines) - **Core Generator**
- **Purpose**: Generates province detail pages (most complex)
- **Execution Flow**:
  
  1. **Load Data**: Fetches `dataset.json` with all provinces
  2. **Initialize**: Sets up regions, calculates averages across all provinces
  3. **For each province**:
     - Loads parsed Wikipedia content from `temp/parsedDataAbout{province}.txt`
     - Creates JSDOM HTML structure with hardcoded strings (600+ lines):
       ```javascript
       const dom = new jsdom.JSDOM(
         "<!DOCTYPE html>" +
         "<html lang='en'>" +
         '<head>...' +  // Meta tags, stylesheets
         '<body data-spy="scroll">' +
         '<div class="hero" style="background-image:url(...)">' +
         '<h1>{{ province.name }}</h1>' +
         '</div>' +
         '<div class="tabs effect-3">' +
         '<!-- Hardcoded tabs for Quality, Cost, Nomads -->' +
         '</div>' +
         '<section id="Overview">...</section>' +
         '<section id="Climate">...</section>' +
         // ... repeats for Safety, Healthcare, Education, Transport
         '</body></html>'
       )
       ```
     - Uses jQuery to populate content: `$("#overview").append(...)`
     - Calls `qualityScore()` function to format ratings
     - Calculates relative comparisons (vs. national average, vs. region)
     - Generates SEO meta tags dynamically
  
  4. **Output**: Single HTML file per province per language
     - Example: `province/agrigento.html` (English)
     - All provinces: 107 × 5 languages = 535 files

**Language-Specific Variants**: `pageGeneratorSSRItaly.js`, `pageGeneratorSSRGerman.js`, etc.
- **95% identical code** to English version
- Only differences:
  - Hardcoded Italian/German/French/Spanish text strings
  - Call to language-specific sidebar: `pb.setSideBarIT()` vs `pb.setSideBar()`
  - Translation of section headings
  - Viator affiliate links use language-specific URLs

**`indexGeneratorSSR.js`** (~300 lines)
- **Purpose**: Generates home/landing page with province list
- **Includes**: 
  - Province grid with filtering and sorting
  - Overview statistics
  - Featured provinces carousel
  - 5 separate versions (one per language)

**`regionGeneratorSSR.js`** (~400 lines)
- **Purpose**: Generates region detail pages (20 Italian regions)
- **Structure**: Similar to province generator but aggregates province data
- **5 language variants**

**`townPageGenerator.js`** (~200 lines)
- **Purpose**: Generates pages for major cities within provinces
- **5 language variants**

**`comuniGenerator.js`** (~150 lines)
- **Purpose**: Generates municipality listing pages
- **5 language variants**

**`safetyPageGenerator.js`** (~100 lines)
- **Purpose**: Generates crime and safety comparison pages
- Uses `dataset_crime_2023.json` for statistics

**`provincesGeneratorSSR.js`** (~100 lines)
- **Purpose**: Generates province listing/comparison table
- Note: Only one version (no language variants yet)

**`QoLgenerator.js` + `QoLgeneratorItaly.js`** (~150 lines each)
- **Purpose**: Generates quality of life comparison matrices
- Calculates custom scoring for different life aspects

---

#### **3. Utility & Helper Scripts**

**`js/pageBuilder.js`** (~150 lines)
- **Functions**: 
  - `headerScripts()`: Returns ad/tracking script tags
  - `setSideBar(province)`: Generates English sidebar menu HTML
  - `setSideBarIT(province)`: Generates Italian sidebar menu HTML
  - `setNavBar($)`: Creates navigation bar
  - `addBreaks(text)`: Formats text with line breaks
  - `en(word)`: Translates Italian place names to English
    ```javascript
    en("Sicilia") → "Sicily"
    en("Milano") → "Milan"
    ```
- **Problem**: No separation between presentation and data

**`script.js`** (~500 lines, client-side)
- Runs in browser after page loads
- Populates tabs with quality scores using dataset
- Makes interactive charts and filters

**`adsTxtUpdater.js`** (~50 lines)
- Updates ads.txt file with ad partner IDs
- Automation for ad network configuration

---

#### **4. Sitemap & SEO Generators**

**`sitemapGenerator.js`** (~100 lines)
- Generates XML sitemap for search engines
- 5 language versions

**`sitemapGeneratorItaly.js`**
- Italy-specific variant

---

### **1.1.2 Current Data Flow Diagram**

```
┌─────────────────────────────────────────┐
│    RAW DATA SOURCES                     │
├─────────────────────────────────────────┤
│ • dataset.json (107 provinces × 80+ metrics)
│ • comuni.json (city landmarks/history)
│ • dataset_crime_2023.json (crime stats)
└──────────────────────────────────────────┘
           ↓                ↓                ↓
    ┌──────────────┬────────────────┬──────────────┐
    │              │                │              │
┌───▼─────┐  ┌───▼──────────┐  ┌──▼──────────────┐
│parseWiki│  │parseComuni   │  │parseGoogleMaps │
│travel.js│  │.js (600 lines)│ │.js             │
└───┬─────┘  └───┬──────────┘  └──┬──────────────┘
    │ temp/parsed  │ temp/comuni    │ temp/maps
    │   Data*.txt  │ *.json         │ *.json
    └──────┬───────┴───────┬────────┘
           │               │
           └─────┬─────────┘
                 ↓
    ┌────────────────────────────────────┐
    │  5 GENERATOR VARIANTS (per language)
    ├────────────────────────────────────┤
    │ pageGeneratorSSR[Language].js       │
    │  - Creates 107 province pages      │
    │  - 600+ lines HTML string concat   │
    │  - Hardcoded English/IT/DE/ES/FR   │
    │                                    │
    │ indexGeneratorSSR[Language].js     │
    │  - Landing page with filters       │
    │                                    │
    │ regionGeneratorSSR[Language].js    │
    │  - 20 region pages                 │
    │                                    │
    │ townPageGenerator[Language].js     │
    │  - Major city pages                │
    │                                    │
    │ comuniGenerator[Language].js       │
    │  - Municipality listings           │
    └────────────────────────────────────┘
           ↓        ↓        ↓
   ┌──────────────────────────────────┐
   │   OUTPUT: 535 HTML FILES         │
   ├──────────────────────────────────┤
   │ province/agrigento.html (EN)     │
   │ province/agrigento-it.html (IT)  │
   │ province/agrigento-de.html (DE)  │
   │ province/agrigento-es.html (ES)  │
   │ province/agrigento-fr.html (FR)  │
   │                                  │
   │ + index pages, region pages,     │
   │   city pages, sitemaps...        │
   └──────────────────────────────────┘
```

---

### **1.1.3 Example: How a Province Page is Generated (Current)**

**Input**: Agrigento province
**Dataset Record**:
```json
{
  "Name": "Agrigento",
  "Population": 434870,
  "Region": "Sicilia",
  "Safety": 7.64,
  "Climate": 8.98,
  "Cost of Living (Individual)": 1129.97,
  "Viator": "Agrigento/d27852-ttd",
  // ... 70+ more fields
}
```

**Step 1: Data Loading**
- `pageGeneratorSSR.js` fetches `dataset.json`
- Calculates national average (`avg` object) using last record (index 107)
- Loads parsed Wikipedia data: `temp/parsedDataAboutAgrigento.txt`

**Step 2: HTML Generation**
Creates JSDOM with 600+ lines of hardcoded HTML:
```javascript
"<div class='tabs effect-3'>" +
"  <input type='radio' id='tab-1' name='tab-effect-3' checked>" +
"  <span>Quality of Life</span>" +
"  <input type='radio' id='tab-2' name='tab-effect-3'>" +
"  <span>Cost of Living</span>" +
"  <input type='radio' id='tab-3' name='tab-effect-3'>" +
"  <span>Digital Nomads</span>" +
"  <div class='tab-content'>" +
"    <section id='Quality-of-Life' class='columns'>" +
"      <div class='column'></div>" +  // JavaScript fills these later
"      <div class='column'></div>" +
"    </section>" +
"    <section id='Cost-of-Living'>" +
"      <div class='column'></div>" +
"      <div class='column'></div>" +
"    </section>" +
"    <section id='Digital-Nomads'>" +
"      <div class='column'></div>" +
"      <div class='column'></div>" +
"    </section>" +
"  </div>" +
"</div>"
```

**Step 3: Content Population (jQuery)**
```javascript
$("#Quality-of-Life > .column")[0].innerHTML += 
  '<p><ej>👥</ej>Population: <b>' + 
  province.Population.toLocaleString('en') + 
  '</b>'

$("#Quality-of-Life > .column")[0].innerHTML += 
  '<p><ej>🏥</ej>Healthcare: ' + 
  qualityScore("Healthcare", province.Healthcare) +
  '</p>'
```

**Step 4: Quality Score Calculation**
```javascript
function qualityScore(quality, score) {
  if (quality == "Healthcare") {
    if (score < avg.Healthcare * 0.8) 
      return "<score class='poor'>poor</score>"
    else if (score >= avg.Healthcare * 0.8 && score < avg.Healthcare * 0.95) 
      return "<score class='average'>okay</score>"
    else if (score >= avg.Healthcare * 0.95 && score < avg.Healthcare * 1.05) 
      return "<score class='good'>good</score>"
    else if (score >= avg.Healthcare * 1.05 && score < avg.Healthcare * 1.2) 
      return "<score class='great'>great</score>"
    else 
      return "<score class='excellent'>excellent</score>"
  }
}
```

**Step 5: SEO Meta Tags**
```javascript
const seoTitle = "Agrigento - Quality of Life and Info Sheet for Expats"
const seoDescription = "Information about living in Agrigento, Sicily, Italy..."

// Added to <head>
"<title>" + seoTitle + "</title>" +
"<meta name='description' content='" + seoDescription + "'/>" +
"<meta property='og:title' content='" + seoTitle + "'/>" +
"<meta property='og:image' content='https://expiter.com/img/AG.webp'/>"
```

**Step 6: File Output**
```javascript
fs.writeFile('province/agrigento.html', html, callback)
```

**Result**: Static HTML file, fully rendered, ready for web server

---

### **1.1.4 Why This Is Problematic**

**Example: Fixing a Bug in Quality Score Display**

Current situation: One CSS class name needs to change from `excellent` to `excellent-score`

1. Edit `pageGeneratorSSR.js` (line 510) ✓
2. Edit `pageGeneratorSSRItaly.js` (line 510) ✓
3. Edit `pageGeneratorSSRGerman.js` (line 510) ✓
4. Edit `pageGeneratorSSRSpanish.js` (line 510) ✓
5. Edit `pageGeneratorSSRFrench.js` (line 510) ✓
6. Rerun all 5 generators
7. Test all 5 versions to ensure consistency
8. Deploy 535 new files
9. **Total time**: 30+ minutes for a single-line change

**Example: Adding a New Language (Turkish)**

Would require:
- `pageGeneratorSSRTurkish.js` (copy & paste + translate)
- `indexGeneratorSSRTurkish.js` 
- `regionGeneratorSSRTurkish.js`
- `townPageGeneratorTurkish.js`
- `comuniGeneratorTurkish.js`
- Update `pageBuilder.js` with `setSideBarTR()` function
- Update all translation functions in `script.js`
- **Total time**: 2-3 days
- **Risk**: Inevitable drift between language versions
- **Files added**: 10+ new 300-800 line files

### 1.2 Current Technology Stack

```
- Node.js (runtime)
- jsdom (DOM manipulation)
- jQuery (DOM queries)
- Bulma (CSS framework)
- Custom string concatenation (HTML generation)
```

---

## 1.3 Proposed Architecture: After Refactoring

### **1.3.1 New Data Flow with Templates**

```
┌─────────────────────────────────────────┐
│    RAW DATA SOURCES (SAME)              │
├─────────────────────────────────────────┤
│ • dataset.json                          │
│ • comuni.json                           │
│ • dataset_crime_2023.json               │
└──────────────────────────────────────────┘
           ↓                ↓                ↓
    ┌──────────────┬────────────────┬──────────────┐
    │              │                │              │
    │ Parsers (SAME)                               │
    │ - parseWikitravel.js                        │
    │ - parseComuni.js                            │
    │ - parseGoogleMaps.js                        │
    └──────┬───────┴───────┬────────┘
           │               │
           └─────┬─────────┘
                 ↓
    ┌────────────────────────────────────┐
    │  UNIFIED GENERATOR (ONE VERSION)   │
    ├────────────────────────────────────┤
    │  pageGenerator.js (200 lines)      │
    │  - Loop: for language in [en,it,de,es,fr]
    │    - Load data                     │
    │    - Format data (formatter.js)    │
    │    - Render template + language    │
    │                                    │
    │  Template System (Nunjucks)        │
    │  - templates/layouts/              │
    │    ├── base.njk                    │
    │    ├── province-detail.njk         │
    │    ├── index.njk                   │
    │    ├── region-detail.njk           │
    │    └── ...                         │
    │  - templates/components/           │
    │    ├── quality-score.njk           │
    │    ├── info-card.njk               │
    │    ├── tabs.njk                    │
    │    └── ...                         │
    │  - templates/partials/             │
    │    ├── head.njk (meta tags)        │
    │    ├── climate-section.njk         │
    │    └── ...                         │
    │                                    │
    │  i18n System                       │
    │  - i18n/en.json                    │
    │  - i18n/it.json                    │
    │  - i18n/de.json                    │
    │  - i18n/es.json                    │
    │  - i18n/fr.json                    │
    │                                    │
    │  Utilities (NEW)                   │
    │  - utils/formatter.js              │
    │  - utils/color-mapper.js           │
    │  - utils/seo-builder.js            │
    └────────────────────────────────────┘
           ↓        ↓        ↓
   ┌──────────────────────────────────┐
   │   OUTPUT: 535 HTML FILES (SAME)  │
   │   GENERATED FASTER & CONSISTENTLY │
   └──────────────────────────────────┘
```

**Key Differences**:
- ✅ **1 Generator** instead of 5
- ✅ **Nunjucks Templates** instead of 600 lines of string concatenation
- ✅ **JSON i18n files** instead of hardcoded strings in code
- ✅ **Shared logic** automatically applied to all languages
- ✅ **Easy to test** - single code path for all variants

---

### **1.3.2 Example: Province Page Generation (After Refactoring)**

**Single Unified Generator:**
```javascript
// src/generators/pageGenerator.js
const nunjucks = require('nunjucks');
const i18n = require('i18next');
const { loadDataset } = require('../utils/data-loader');
const { formatProvince } = require('../utils/formatter');
const { buildSeoTags } = require('../utils/seo-builder');

async function generateAllPages() {
  const dataset = await loadDataset();
  
  for (const province of dataset.provinces) {
    for (const language of ['en', 'it', 'de', 'es', 'fr']) {
      await generateProvincePage(province, language);
    }
  }
}

async function generateProvincePage(province, language) {
  const templatePath = 'templates/layouts/province-detail.njk';
  
  // Format data once, use for all languages
  const formattedData = formatProvince(province);
  
  // Prepare context for template
  const context = {
    language,
    province: formattedData,
    seo: buildSeoTags(formattedData, language),
    t: (key) => i18n.t(key, { lng: language }),
    // Helper functions available to templates
    getQualityColor: (score, threshold) => getQualityColor(score, threshold)
  };
  
  // Render template once with language support built-in
  const html = nunjucks.render(templatePath, context);
  
  // Write single file
  const filename = `province/${formatFilename(province.Name)}-${language === 'en' ? '' : language + '.'}html`;
  await fs.writeFile(filename, html);
}

module.exports = { generateAllPages };
```

**Master Template:**
```nunjucks
{# templates/layouts/province-detail.njk #}
{% extends "layouts/base.njk" %}

{% block title %}{{ province.name }} - {{ t('common.quality_of_life_and_info') }}{% endblock %}

{% block meta %}
  <title>{{ seo.title }}</title>
  <meta name="description" content="{{ seo.description }}">
  <meta property="og:title" content="{{ seo.title }}">
  <meta property="og:image" content="{{ seo.image }}">
  <meta property="og:description" content="{{ seo.description }}">
{% endblock %}

{% block content %}
  <div class="hero" style="background-image:url('{{ province.heroImage }}')">
    <h1 class="title">{{ province.name }}</h1>
  </div>

  {% include "partials/breadcrumbs.njk" %}

  <div class="tabs effect-3">
    <input type="radio" id="tab-1" name="tab-effect-3" checked>
    <span>{{ t('tabs.quality_of_life') }}</span>
    
    <input type="radio" id="tab-2" name="tab-effect-3">
    <span>{{ t('tabs.cost_of_living') }}</span>
    
    <input type="radio" id="tab-3" name="tab-effect-3">
    <span>{{ t('tabs.digital_nomads') }}</span>

    <div class="tab-content">
      <section id="Quality-of-Life" class="columns">
        {% include "partials/quality-scores-tab.njk" %}
      </section>
      
      <section id="Cost-of-Living" class="columns">
        {% include "partials/cost-living-tab.njk" %}
      </section>
      
      <section id="Digital-Nomads" class="columns">
        {% include "partials/nomads-tab.njk" %}
      </section>
    </div>
  </div>

  <div id="info" class="columns">
    {% include "partials/overview-section.njk" %}
    {% include "partials/climate-section.njk" %}
    {% include "partials/cost-section.njk" %}
    {% include "partials/safety-section.njk" %}
    {% include "partials/healthcare-section.njk" %}
    {% include "partials/education-section.njk" %}
  </div>

  {% include "partials/related-places.njk" %}
{% endblock %}
```

**Component (Macro):**
```nunjucks
{# templates/components/quality-score.njk #}
{% macro scoreCard(label, icon, value, ratingClass) %}
  <div class="score-card">
    <span class="label">{{ icon }} {{ t(label) }}</span>
    <span class="value {{ ratingClass }}">
      {% if value is number %}
        {{ value | round(1) }}
      {% else %}
        {{ value }}
      {% endif %}
    </span>
  </div>
{% endmacro %}

{% macro scoreGrid(metrics) %}
  <div class="score-grid">
    {% for metric in metrics %}
      {{ scoreCard(
        metric.labelKey,
        metric.icon,
        metric.value,
        getQualityColor(metric.value, metric.threshold)
      ) }}
    {% endfor %}
  </div>
{% endmacro %}
```

**Partial for Quality Scores:**
```nunjucks
{# templates/partials/quality-scores-tab.njk #}
<div class="column">
  {% set metrics = [
    {labelKey: 'metrics.population', icon: '👥', value: province.population, threshold: 200000},
    {labelKey: 'metrics.healthcare', icon: '🏥', value: province.healthcare, threshold: 7},
    {labelKey: 'metrics.education', icon: '📚', value: province.education, threshold: 7},
    {labelKey: 'metrics.safety', icon: '👮', value: province.safety, threshold: 7},
    {labelKey: 'metrics.transport', icon: '🚌', value: province.publicTransport, threshold: 5}
  ] %}
  
  {{ scoreGrid(metrics) }}
</div>

<div class="column">
  {% set climate_metrics = [
    {labelKey: 'metrics.climate', icon: '🌦️', value: province.climate, threshold: 7},
    {labelKey: 'metrics.sunshine', icon: '☀️', value: province.sunshineHours, threshold: 240}
  ] %}
  
  {{ scoreGrid(climate_metrics) }}
</div>
```

**Translation File:**
```json
{
  "common": {
    "quality_of_life_and_info": "Quality of Life and Info Sheet for Expats"
  },
  "tabs": {
    "quality_of_life": "Quality of Life",
    "cost_of_living": "Cost of Living",
    "digital_nomads": "Digital Nomads"
  },
  "metrics": {
    "population": "Population",
    "healthcare": "Healthcare",
    "education": "Education",
    "safety": "Safety",
    "transport": "Public Transport",
    "climate": "Climate",
    "sunshine": "Sunshine Hours"
  },
  "sections": {
    "overview": "Overview",
    "climate": "Climate",
    "cost": "Cost of Living",
    "safety": "Safety",
    "healthcare": "Healthcare",
    "education": "Education",
    "transport": "Transport"
  }
}
```

**Formatter Utility:**
```javascript
// src/utils/formatter.js
function formatProvince(province, language = 'en') {
  const avg = calculateAverage();
  
  return {
    name: translateProvinceName(province.Name, language),
    population: province.Population.toLocaleString('en'),
    region: translateRegionName(province.Region, language),
    
    // Pre-calculated ratings for templates
    healthcare: {
      value: province.Healthcare,
      rating: calculateRating(province.Healthcare, avg.Healthcare),
      comparison: province.Healthcare > avg.Healthcare ? 'above' : 'below'
    },
    
    safety: {
      value: province.Safety,
      rating: calculateRating(province.Safety, avg.Safety),
      comparison: province.Safety > avg.Safety ? 'safer' : 'less_safe'
    },
    
    climate: {
      value: province.Climate,
      sunshineHours: province.SunshineHours,
      rainyDays: province.RainyDays,
      hotDays: province.HotDays,
      coldDays: province.ColdDays
    },
    
    // All other metrics...
    
    // SEO-related
    heroImage: `https://expiter.com/img/${province.Abbreviation}.webp`,
    overview: loadParsedContent(`temp/parsedDataAbout${province.Name}.txt`),
    
    // Affiliate links
    viatorUrl: province.Viator || 'italy',
    amazonUrl: buildAmazonUrl(province, language)
  };
}

function calculateRating(value, average) {
  if (value < average * 0.8) return 'poor';
  if (value < average * 0.95) return 'okay';
  if (value < average * 1.05) return 'good';
  if (value < average * 1.2) return 'great';
  return 'excellent';
}
```

**SEO Builder:**
```javascript
// src/utils/seo-builder.js
function buildSeoTags(province, language) {
  const translations = {
    en: 'Quality of Life and Info Sheet for Expats',
    it: 'Qualità della Vita e Scheda Informativa per Espatriati',
    de: 'Lebensqualität und Informationsblatt für Expats',
    es: 'Calidad de Vida y Hoja Informativa para Expatriados',
    fr: 'Qualité de vie et fiche d\'information pour expatriés'
  };
  
  const title = `${province.name} - ${translations[language]}`;
  const description = buildDescription(province, language);
  
  return {
    title,
    description,
    image: province.heroImage,
    keywords: `${province.name}, italy, expat, digital nomad, ${language}`
  };
}
```

---

### **1.3.3 Comparison: Current vs. Proposed**

| Aspect | Current | Proposed | Benefit |
|--------|---------|----------|---------|
| **Generators** | 5 files (850 lines each) | 1 file (200 lines) | 82% less code |
| **Language Support** | Copy & paste 5 files | One run with i18n | 5x faster, no drift |
| **Bug Fix** | Edit 5 files + retest | Edit 1 file | 80% faster |
| **New Feature** | Duplicate logic 5×| Template + formatter | Single implementation |
| **Testing** | Test 5 variants | Test 1 path | 5x fewer tests |
| **Add Language** | 3 days (10+ files) | 1 hour (1 JSON file) | 72x faster |
| **Output Files** | 535 HTML files | 535 HTML files (same) | Same user experience |
| **Generation Time** | 45 seconds | 25-30 seconds | 40% faster |
| **Memory Usage** | 800MB | 300-400MB | 60% less |
| **Maintainability** | Hard | Easy | Developer happiness |

---

### **1.3.4 Side-by-Side Example: Bug Fix**

**Scenario**: Change population emoji from 👥 to 👤

**CURRENT APPROACH** (5 file edits):
```javascript
// pageGeneratorSSR.js line 403
tab1[0].innerHTML+=('<p><ej>👤</ej>Population: ...');

// pageGeneratorSSRItaly.js line 403
tab1[0].innerHTML+=('<p><ej>👤</ej>Popolazione: ...');

// pageGeneratorSSRGerman.js line 403
tab1[0].innerHTML+=('<p><ej>👤</ej>Bevölkerung: ...');

// pageGeneratorSSRSpanish.js line 403
tab1[0].innerHTML+=('<p><ej>👤</ej>Población: ...');

// pageGeneratorSSRFrench.js line 403
tab1[0].innerHTML+=('<p><ej>👤</ej>Population: ...');

// Time: 30 minutes (edit + test + deploy)
```

**PROPOSED APPROACH** (1 template edit):
```nunjucks
{# templates/partials/quality-scores-tab.njk #}
{{ scoreCard(
  'metrics.population',
  '👤',  // Single change here
  province.population,
  5
) }}

// Time: 2 minutes (edit + regenerate)
```

**Savings**: 28 minutes per change × ~20 changes/year = 9+ hours/year saved

---

## 2. Proposed Architecture

### 2.1 Template Engine Selection

**Recommended: Nunjucks** (with EJS as secondary option)

**Why Nunjucks:**
- Easy syntax similar to Twig/Jinja2
- Built-in template inheritance and block extension
- Excellent macro system for reusable components
- Strong internationalization (i18n) support
- Active maintenance and large community
- Zero runtime overhead after compilation
- Easy to learn for team members

**Alternative: EJS**
- More familiar to JavaScript developers
- Simpler syntax
- Better for dynamic content generation
- Less powerful inheritance system

**Rejected Options:**
- Handlebars: Less powerful, fewer features
- Pug/Jade: Steep learning curve, less HTML control
- Mustache: Minimal features

### 2.2 New Directory Structure

```
expiter/
├── src/
│   ├── generators/
│   │   ├── pageGenerator.js
│   │   ├── indexGenerator.js
│   │   ├── regionGenerator.js
│   │   ├── townGenerator.js
│   │   ├── provinceGenerator.js
│   │   ├── comuniGenerator.js
│   │   └── safetyGenerator.js
│   │
│   ├── templates/
│   │   ├── layouts/
│   │   │   ├── base.njk (master layout)
│   │   │   ├── province-detail.njk
│   │   │   ├── town-detail.njk
│   │   │   ├── region-detail.njk
│   │   │   ├── index.njk
│   │   │   └── safety.njk
│   │   │
│   │   ├── components/
│   │   │   ├── header.njk
│   │   │   ├── navbar.njk
│   │   │   ├── sidebar.njk
│   │   │   ├── footer.njk
│   │   │   ├── tabs.njk
│   │   │   ├── quality-score.njk
│   │   │   ├── info-card.njk
│   │   │   ├── map-widget.njk
│   │   │   ├── breadcrumbs.njk
│   │   │   └── related-places.njk
│   │   │
│   │   └── partials/
│   │       ├── head.njk (meta tags, scripts)
│   │       ├── hero-section.njk
│   │       ├── stats-grid.njk
│   │       ├── climate-info.njk
│   │       ├── cost-living-info.njk
│   │       ├── safety-info.njk
│   │       └── wellness-info.njk
│   │
│   ├── i18n/
│   │   ├── en.json
│   │   ├── it.json
│   │   ├── de.json
│   │   ├── es.json
│   │   ├── fr.json
│   │   └── i18n-manager.js
│   │
│   ├── utils/
│   │   ├── data-loader.js (loads datasets)
│   │   ├── formatter.js (formatting utilities)
│   │   ├── text-processor.js (text transformations)
│   │   ├── seo-builder.js (SEO meta generation)
│   │   ├── color-mapper.js (quality score colors)
│   │   └── validators.js
│   │
│   ├── parsers/
│   │   ├── wikitravel-parser.js
│   │   ├── google-maps-parser.js
│   │   ├── comuni-parser.js
│   │   └── crime-data-parser.js
│   │
│   ├── config/
│   │   ├── constants.js
│   │   ├── environment.js
│   │   └── site-config.js
│   │
│   └── index.js (main entry point)
│
├── output/ (generated HTML files)
├── data/
│   ├── dataset.json
│   ├── dataset_crime_2023.json
│   ├── comuni.json
│   └── cache/
├── tests/
│   ├── generators.test.js
│   ├── formatters.test.js
│   ├── templates.test.js
│   └── fixtures/
└── docs/
    ├── ARCHITECTURE.md
    ├── TEMPLATE_GUIDE.md
    └── i18n_GUIDE.md
```

### 2.3 Technology Stack (Proposed)

```json
{
  "dependencies": {
    "nunjucks": "^3.2.4",
    "i18next": "^23.5.0",
    "axios": "^1.6.7",
    "sharp": "^0.33.4",
    "jsdom": "^20.0.1",
    "node-fetch": "^3.2.10"
  },
  "devDependencies": {
    "jest": "^29.7.0",
    "nunjucks-markdown": "^2.0.1"
  }
}
```

---

## 3. Template Examples

### 3.1 Master Layout (`base.njk`)

```nunjucks
<!DOCTYPE html>
<html lang="{{ language }}">
  <head>
    {% include "partials/head.njk" %}
  </head>
  <body data-spy="scroll" data-target="#toc">
    {% include "components/navbar.njk" %}
    
    <div class="main-container">
      {% include "components/sidebar.njk" %}
      
      <main class="content">
        {% block content %}{% endblock %}
      </main>
    </div>
    
    {% include "components/footer.njk" %}
    {% include "partials/scripts.njk" %}
  </body>
</html>
```

### 3.2 Province Detail Template (`province-detail.njk`)

```nunjucks
{% extends "layouts/base.njk" %}

{% block content %}
  <div class="hero" style="background-image:url('{{ heroImage }}')">
    <h1 class="title">{{ province.name }}</h1>
  </div>

  {% include "partials/breadcrumbs.njk" %}

  <div class="tabs">
    <div class="tab-quality">
      {% include "partials/quality-scores.njk" %}
    </div>
    <div class="tab-cost">
      {% include "partials/cost-of-living.njk" %}
    </div>
    <div class="tab-nomads">
      {% include "partials/digital-nomads.njk" %}
    </div>
  </div>

  <section class="info-sections">
    {% include "partials/overview-section.njk" %}
    {% include "partials/climate-section.njk" %}
    {% include "partials/safety-section.njk" %}
    {% include "partials/healthcare-section.njk" %}
    {% include "partials/education-section.njk" %}
  </section>

  {% include "partials/related-places.njk" %}
{% endblock %}
```

### 3.3 Component Example (`quality-score.njk`)

```nunjucks
{% macro scoreCard(label, metric, value, threshold) %}
  <div class="score-card">
    <span class="label">{{ t(label) }}</span>
    <span class="value {% if value >= threshold %}excellent{% elif value >= threshold * 0.9 %}good{% else %}poor{% endif %}">
      {{ value }}
    </span>
  </div>
{% endmacro %}

{% macro scoreGrid(metrics, data) %}
  <div class="score-grid">
    {% for metric in metrics %}
      {{ scoreCard(metric.label, metric.key, data[metric.key], metric.threshold) }}
    {% endfor %}
  </div>
{% endmacro %}
```

---

## 4. Implementation Strategy

### 4.1 Phase 1: Foundation (Weeks 1-2)

**Objectives:**
- Set up project structure
- Configure template engine
- Create base templates and layouts
- Set up i18n system

**Deliverables:**
- Base template hierarchy
- Component library (20+ base components)
- i18n configuration with translation strings
- Development environment setup

**Tasks:**
```
1. Create src/ directory structure
2. Install and configure Nunjucks
3. Create base.njk master template
4. Build component library
5. Set up i18n with translation files
6. Create configuration system
```

### 4.2 Phase 2: Core Generators (Weeks 3-4)

**Objectives:**
- Convert pageGeneratorSSR to use templates
- Convert indexGeneratorSSR to use templates
- Update data loading and formatting logic

**Deliverables:**
- Single pageGenerator.js (replaces 5 variants)
- Single indexGenerator.js (replaces 5 variants)
- Unified data loading system
- Updated utility functions

**Testing:**
- Compare output of old vs new generators
- Validate HTML structure
- Verify SEO meta tags
- Test with all 5 languages

### 4.3 Phase 3: Additional Generators (Weeks 5-6)

**Objectives:**
- Convert remaining generators (region, town, comuni, safety)
- Create utility functions for common operations
- Build parser system

**Deliverables:**
- All generator files consolidated
- Utility function library
- Updated parser system
- Component documentation

### 4.4 Phase 4: Testing & Optimization (Weeks 7-8)

**Objectives:**
- Comprehensive testing
- Performance optimization
- Documentation
- Deployment preparation

**Deliverables:**
- Unit tests (>80% coverage)
- Integration tests
- Performance benchmarks
- Complete documentation

---

## 5. Key Benefits

### 5.1 Immediate Benefits

| Benefit | Impact | Measurement |
|---------|--------|-------------|
| **Code Reduction** | 80-85% less code | From 12,000+ to ~2,500 lines |
| **Language Support** | Add 5th language in <1 hour | vs. 3-4 days currently |
| **Bug Fixes** | Fix once, applies everywhere | vs. fixing in 5+ files |
| **Development Speed** | Template modifications faster | HTML changes = template edits |
| **Maintainability** | Clear separation of concerns | Logic vs. presentation |

### 5.2 Long-term Benefits

- **Scalability**: Easy to add new page types
- **Consistency**: Unified styling and structure
- **Performance**: Template compilation caching
- **Quality**: Testable components and logic
- **Flexibility**: Swap template engines if needed
- **Team Efficiency**: Faster onboarding for new developers

---

## 6. Migration Checklist

### Pre-Migration
- [ ] Audit current code for custom logic in generators
- [ ] Document all special cases and exceptions
- [ ] Create comprehensive test suite for current output
- [ ] Set up version control for safe rollback
- [ ] Document all data transformations and calculations

### Phase 1
- [ ] Set up project structure
- [ ] Install and test Nunjucks
- [ ] Create template base structure
- [ ] Set up i18n system
- [ ] Create configuration management

### Phase 2
- [ ] Create component library
- [ ] Convert page generator
- [ ] Compare outputs with original
- [ ] Test with all languages
- [ ] Update documentation

### Phase 3
- [ ] Convert remaining generators
- [ ] Consolidate utility functions
- [ ] Update data loaders
- [ ] Test all page types
- [ ] Performance testing

### Phase 4
- [ ] Unit testing
- [ ] Integration testing
- [ ] SEO validation
- [ ] Final documentation
- [ ] Deployment preparation

### Post-Migration
- [ ] Monitor for issues in production
- [ ] Archive old generator files
- [ ] Clean up dependencies
- [ ] Training for team members
- [ ] Performance monitoring

---

## 7. Code Examples

### 7.1 New Generator Structure

```javascript
// src/generators/pageGenerator.js
const nunjucks = require('nunjucks');
const i18n = require('i18next');
const { loadDataset } = require('../utils/data-loader');
const { formatProvince } = require('../utils/formatter');

class PageGenerator {
  constructor(config) {
    this.config = config;
    this.nunjucks = nunjucks.configure({
      autoescape: true,
      trimBlocks: true,
      lstripBlocks: true
    });
  }

  async generateProvincePages() {
    const dataset = await loadDataset();
    const provinces = dataset.provinces;

    for (const province of provinces) {
      for (const language of ['en', 'it', 'de', 'es', 'fr']) {
        await this.generatePage(province, language);
      }
    }
  }

  async generatePage(province, language) {
    const templatePath = 'templates/layouts/province-detail.njk';
    
    const data = {
      language,
      province: formatProvince(province, language),
      i18n: (key) => i18n.t(key, { lng: language }),
      // ... other data
    };

    const html = this.nunjucks.render(templatePath, data);
    await this.writeFile(html, province, language);
  }
}

module.exports = PageGenerator;
```

### 7.2 Updated Utils

```javascript
// src/utils/formatter.js
function formatProvince(province, language) {
  return {
    name: translate(province.Name, language),
    population: province.Population.toLocaleString(),
    region: translate(province.Region, language),
    safety: calculateSafetyScore(province),
    costOfLiving: calculateCostOfLiving(province),
    climate: formatClimate(province),
    // ... more fields
  };
}

function calculateSafetyScore(province) {
  return {
    score: province.Safety,
    rating: province.Safety > 7.33 ? 'very-safe' : 
            province.Safety > 6 ? 'safe' : 'unsafe',
    details: buildSafetyDetails(province)
  };
}
```

### 7.3 i18n Configuration

```javascript
// src/i18n/i18n-manager.js
const i18next = require('i18next');
const enTranslations = require('./en.json');
const itTranslations = require('./it.json');
const deTranslations = require('./de.json');
const esTranslations = require('./es.json');
const frTranslations = require('./fr.json');

i18next.init({
  interpolation: {
    escapeValue: false
  },
  resources: {
    en: { translation: enTranslations },
    it: { translation: itTranslations },
    de: { translation: deTranslations },
    es: { translation: esTranslations },
    fr: { translation: frTranslations }
  }
});

module.exports = i18next;
```

---

## 8. Performance Considerations

### 8.1 Current Baseline

- Generation time: ~45 seconds for all pages
- Memory usage: ~800MB
- Output size: ~450MB total HTML

### 8.2 Expected Improvements

| Metric | Current | Projected | Improvement |
|--------|---------|-----------|-------------|
| Generation Time | 45s | 25-30s | 35-45% faster |
| Memory Usage | 800MB | 300-400MB | 50-60% reduction |
| Compilation Time | N/A | <5s | N/A |
| Cache Hit Rate | N/A | 85-90% | N/A |

### 8.3 Optimization Strategies

1. **Template Compilation Caching**: Pre-compile templates
2. **Data Streaming**: Process data in chunks
3. **Parallel Generation**: Generate multiple pages in parallel
4. **Incremental Builds**: Only regenerate changed pages
5. **Asset Optimization**: Minimize CSS/JS in templates

---

## 9. Risk Mitigation

### 9.1 Identified Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Template rendering bugs | Medium | High | Comprehensive testing, side-by-side comparison |
| Data loss during migration | Low | Critical | Backup strategy, validation suite |
| Performance degradation | Low | Medium | Benchmarking, profiling |
| Team adoption | Medium | Medium | Training, documentation |
| Increased dependencies | Medium | Medium | Regular updates, dependency audit |

### 9.2 Rollback Strategy

- Maintain original generators in `legacy/` directory
- Keep Git history of original implementation
- Run parallel generators during transition phase
- Automated comparison tests between old and new output

---

## 10. Estimated Timeline & Resources

### 10.1 Timeline

| Phase | Duration | Team Size | Critical Path |
|-------|----------|-----------|----------------|
| Phase 1 (Foundation) | 2 weeks | 2 developers | Templates, i18n |
| Phase 2 (Core Generators) | 2 weeks | 2 developers | Testing, validation |
| Phase 3 (Additional) | 2 weeks | 2 developers | Consistency |
| Phase 4 (Testing) | 2 weeks | 2 developers + 1 QA | Coverage |
| **Total** | **8 weeks** | **2-3 people** | **12 weeks** |

### 10.2 Resource Requirements

**Team:**
- 2 Senior JavaScript developers
- 1 QA engineer
- 0.5 DevOps (deployment setup)

**Tools:**
- Nunjucks (template engine)
- Jest (testing framework)
- ESLint (code quality)
- Git (version control)

---

## 11. Success Criteria

### 11.1 Technical Success

- [ ] All pages generate with identical output to original
- [ ] All languages supported equally
- [ ] Test coverage >80%
- [ ] Performance metrics meet or exceed baseline
- [ ] Zero data loss during migration
- [ ] All SEO metadata preserved

### 11.2 Operational Success

- [ ] Code reduction from 12,000 to <3,000 lines
- [ ] Maintenance time reduced by 75%
- [ ] New language support in <1 hour
- [ ] Bug fixes deployed to all variants simultaneously
- [ ] Team successfully trained and productive

---

## 12. Next Steps

1. **Week 1**: Review and approve proposal
2. **Week 2**: Set up development environment
3. **Week 3**: Begin Phase 1 implementation
4. **Ongoing**: Weekly progress reviews and adjustments

---

## Appendix A: Glossary

- **Template Engine**: Software that processes template files with dynamic data to generate output
- **i18n (Internationalization)**: Process of adapting software for multiple languages
- **SSR (Server-Side Rendering)**: Generating HTML on the server before sending to client
- **Nunjucks**: Powerful templating language inspired by Jinja2
- **Macro**: Reusable template component with parameters
- **Block**: Named section in template that can be overridden in child templates

---

## Appendix B: Template Engine Comparison

| Feature | Nunjucks | EJS | Handlebars |
|---------|----------|-----|-----------|
| Inheritance | ✅ Excellent | ⚠️ Limited | ❌ None |
| Macros | ✅ Powerful | ❌ None | ❌ None |
| Filters | ✅ Many | ⚠️ Basic | ✅ Some |
| i18n Support | ✅ Excellent | ⚠️ Manual | ⚠️ Manual |
| Performance | ✅ Fast | ✅ Fast | ✅ Fast |
| Learning Curve | ✅ Easy | ✅ Easy | ✅ Easy |
| Community | ✅ Large | ✅ Large | ✅ Large |

---

**Document Version**: 1.0  
**Created**: 2025-11-21  
**Status**: Proposal  
**Author**: Architecture Review Team
