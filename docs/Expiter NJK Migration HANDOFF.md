Expiter NJK Migration — Comprehensive Agent Handoff
What We're Doing
Migrating pageGeneratorSSR.js and CaSGenerator.js (the two main English province page generators) from jsdom/jQuery to Nunjucks templates. No Eleventy. No framework. Just replace the JSDOM virtual DOM with nunjucks.renderString() / nunjucks.render(), keeping all logic in JS.

All other generators (IT/FR/DE/ES variants, comuniGenerator, townPageGenerator, etc.) are out of scope for now — migrate EN first, verify, then do the rest.

Repository Location
c:\Users\Pietro\Desktop\Github\expiter

Branch: refactor/njk-migration

Current State
pageGeneratorSSR.js — original, uses jsdom+jQuery, still the active generator
CaSGenerator.js — original, uses jsdom+jQuery, still the active generator
src/_includes/base.njk — exists but is a partial migration from a previous failed attempt, needs to be replaced/rebuilt
src/_includes/macros/ads.njk — exists
src/province.njk, src/town.njk, src/regions.njk, src/app.njk — stubs from failed migration, ignore them
js/pageBuilder.js — DO NOT TOUCH — exports setSideBar(), headerScripts(), setNavBar() etc. These return HTML strings and will be passed directly into templates.
The Migration Pattern
Before (jsdom approach):


const dom = new jsdom.JSDOM("<!DOCTYPE html><html>..." + bigTemplateLiteralString)
const $ = require('jquery')(dom.window)
$(".title").text("Province Name")
$("#overview").append(htmlString)
let html = dom.window.document.documentElement.outerHTML
fs.writeFile(fileName+'.html', html, callback)
After (Nunjucks approach):


import nunjucks from 'nunjucks'
nunjucks.configure('src/templates', { autoescape: false })
// build all content as plain JS strings (same logic, no jQuery)
const html = nunjucks.render('pages/province.njk', contextObject)
fs.writeFile(fileName+'.html', html, callback)
Key rule: autoescape: false — all content strings contain raw HTML tags like <b class='green'>, <score class='excellent short'>, <a href=...> etc. If autoescape is on, everything gets HTML-escaped and breaks.

Files to Create
1. js/nunjucksEnv.js (new)

import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const nunjucks = require('nunjucks')

const env = nunjucks.configure('src/templates', { autoescape: false })
export { env, nunjucks }
2. src/templates/layouts/base.njk (new — replaces src/_includes/base.njk)
This is the master layout. It receives these variables:

lang — 'en'
seoTitle
seoDescription
seoKeywords
canonicalUrl — full URL e.g. https://expiter.com/province/milano/
hreflangIt — e.g. https://expiter.com/it/province/milano/
heroImage — https://expiter.com/img/{ABB}.webp
heroAlt — {Province Name} Province
sidebar — raw HTML string from setSideBar(province)
navbar — raw HTML string from the navbar builder (see below)
pageTitle — the text for the <h1>
Content slots filled by child templates via {% block %}
CRITICAL structure to preserve (from original generators):


<!DOCTYPE html>
<html lang='en'>
<head>
  <meta charset="utf-8">
  <link rel="canonical" href="{{canonicalUrl}}"/>
  <link rel="alternate" hreflang="en" href="{{canonicalUrl}}" />
  <link rel="alternate" hreflang="it" href="{{hreflangIt}}" />
  <meta name="viewport" content="width=device-width, initial-scale=1,maximum-scale-1,user-scalable=0">
  <script type="text/javascript" src="https://expiter.com/jquery3.6.0.js" defer></script>
  <script type="text/json" src="https://expiter.com/dataset.json"></script>
  <script type="text/javascript" src="https://expiter.com/script.js" defer></script>
  <script type="text/javascript" src="https://expiter.com/bootstrap-toc.js" defer></script>
  <!-- headerScripts() output — Mediavine + Grow -->
  <script type="text/javascript" async="async" data-noptimize="1" data-cfasync="false" src="//scripts.scriptwrapper.com/tags/1cce7071-25c6-48c1-b7ee-1da5674b8bfd.js"></script>
  <script data-grow-initializer="">!(function(){...})</script>
  <!-- GetYourGuide Analytics -->
  <script async defer src="https://widget.getyourguide.com/dist/pa.umd.production.min.js" data-gyg-partner-id="56T9R2T"></script>
  <link rel="stylesheet" href="https://expiter.com/fonts.css" media="print" onload="this.media='all'">
  <link rel="stylesheet" href="https://expiter.com/bulma.min.css">
  <link rel="stylesheet" href="https://expiter.com/style.css?v=1.1">
  <meta property="og:title" content="{{seoTitle}}" />
  <meta property="og:description" content="{{seoDescription}}" />
  <meta property="og:image" content="{{heroImage}}" />
  <meta name="description" content="{{seoDescription}}" />
  <meta name="keywords" content="{{seoKeywords}}" />
  <title>{{seoTitle}}</title>
  <link rel="icon" type="image/x-icon" href="https://expiter.com/img/expiter-favicon.ico">
  {% block extra_head %}{% endblock %}
</head>

<aside class="menu sb higher">{{sidebar | safe}}</aside>

<body data-spy="scroll" data-target="#toc">
  <div class="toc container collapsed">
    <i class="arrow left" onclick="$('.toc').toggleClass('collapsed')"></i>
    <div class="row">
      <div class="col-sm-3">
        <nav id="toc" data-toggle="toc"></nav>
        <div class="col-sm-9"></div>
      </div>
    </div>
  </div>

  {{navbar | safe}}

  <div class="hero" style="background-image:url('{{heroImage}}')" title="{{heroAlt}}"></div>

  <h1 data-toc-skip id="title" class="title column is-12">{{pageTitle}}</h1>

  {% block tabs %}{% endblock %}

  <div id="info" class="columns is-multiline is-mobile {% block infoClass %}{% endblock %}">
    {% block infoSections %}{% endblock %}
  </div>

  <aside class="menu sb mobileonly">{{sidebar | safe}}</aside>
</body>
</html>
Note on navbar: In the original, jQuery populates #navbar at runtime. In the Nunjucks version, build the navbar HTML string directly in JS (same HTML as what setNavBar($) appends) and pass it as navbar. The navbar HTML is:


<nav id="navbar">
<div class="navbar-container">
<input type="checkbox" name="navbar" id="nbar">
<div class="hamburger-lines"><span class="line line1"></span><span class="line line2"></span><span class="line line3"></span></div>
<ul class="menu-items">
<li><a href="/">Home</a></li>
<li><a href="https://expiter.com/resources/">Resources</a></li>
<li><a href="https://expiter.com/tools/codice-fiscale-generator/">Tools</a></li>
<li><a href="https://expiter.com/blog/articles/">Blog</a></li>
<li><a href="https://expiter.com/app/#About">About</a></li>
<li><a href="https://forms.gle/WiivbZg8336TmeUPA" target="_blank">Take Survey</a></li>
</ul>
<label class="switch" id="switch"><input type="checkbox"><span class="slider round"></span></label>
<a href="/"><p class="logo">Italy Expats & Nomads</p></a>
</div>
</nav>
3. src/templates/pages/province.njk (new)
Extends layouts/base.njk. Receives all the content HTML strings as context variables.


{% extends "layouts/base.njk" %}

{% block extra_head %}{% endblock %}

{% block tabs %}
<div class="tabs effect-3">
  <input type="radio" id="tab-1" name="tab-effect-3" checked="checked">
  <span>Quality of Life</span>
  <input type="radio" id="tab-2" name="tab-effect-3">
  <span>Cost of Living</span>
  <input type="radio" id="tab-3" name="tab-effect-3">
  <span>Digital Nomads</span>
  <input type="radio" id="tab-4" name="tab-effect-3" disabled>
  <span></span>
  <input type="radio" id="tab-5" name="tab-effect-3" disabled>
  <span></span>
  <div class="line ease"></div>
  <div class="tab-content">
    <section id="Quality-of-Life" class="columns is-mobile is-multiline">
      <div class="column">{{tab1col1 | safe}}</div>
      <div class="column">{{tab1col2 | safe}}</div>
    </section>
    <section id="Cost-of-Living" class="columns is-mobile is-multiline">
      <div class="column">{{tab2col1 | safe}}</div>
      <div class="column">{{tab2col2 | safe}}</div>
    </section>
    <section id="Digital-Nomads" class="columns is-mobile is-multiline">
      <div class="column">{{tab3col1 | safe}}</div>
      <div class="column">{{tab3col2 | safe}}</div>
    </section>
  </div>
</div>
{% endblock %}

{% block infoSections %}
<section id="Overview"><h2>Overview</h2><div style="display:inline;" id="overview">{{overview | safe}}</div></section>
<section id="Climate"><h2>Climate</h2><div style="display:inline;" id="climate">{{climate | safe}}{{separator | safe}}{{weather | safe}}</div></section>
<section id="Cost of Living"><h2>Cost of Living</h2><div style="display:inline;" id="CoL">{{col | safe}}</div></section>
<section id="Quality of Life"><h2>Quality of Life</h2>
  <section id="Healthcare"><h3>Healthcare</h3><div style="display:inline;" id="healthcare">{{healthcare | safe}}</div></section>
  <section id="Education"><h3>Education</h3><div style="display:inline;" id="education">{{education | safe}}</div></section>
  <section id="Leisure"><h3>Leisure</h3><div style="display:inline;" id="leisure">{{leisure | safe}}</div></section>
  <section id="Crime and Safety"><h3><a href="{{crimeUrl}}">Crime and Safety</a></h3><div style="display:inline;" id="crimeandsafety">{{crimeandsafety | safe}}</div></section>
  <section id="Transport"><h3>Transport</h3><div style="display:inline;" id="transport">{{transport | safe}}</div></section>
</section>
<section id="Discover"><h2>Discover</h2><div style="display:inline;" id="promo">{{promo | safe}}</div></section>
{% endblock %}
4. src/templates/pages/crime-safety.njk (new)
Same structure as province.njk but for crime pages. The #info div has class blog-main-content entry-content journey-content (from the original CaSGenerator):


{% extends "layouts/base.njk" %}

{% block infoClass %}blog-main-content entry-content journey-content{% endblock %}

{% block tabs %}
{# Same 3-tab block as province.njk — copy verbatim #}
{% endblock %}

{% block infoSections %}
<section id="Overview"><h2>Overview</h2><span id="overview">{{overview | safe}}</span></section>
<section id="Crime and Safety"><h3>Crime and Safety</h3><span id="crimeandsafety">{{crimeandsafety | safe}}</span></section>
<section id="Thefts and Robberies"><h3>Thefts and Robberies</h3><span id="theftsandrobberies">{{theftsandrobberies | safe}}</span></section>
<section id="Violence"><h3>Violent Crimes</h3><span id="violentcrimes">{{violentcrimes | safe}}</span></section>
<section id="Organized Crime"><h3>Organized Crime & Drug-related Crimes</h3><span id="organizedcrime">{{organizedcrime | safe}}</span></section>
<section id="Accidents"><h3>Accidents</h3><span id="accidents">{{accidents | safe}}</span></section>
<section id="FAQs"><h3>Frequently Asked Questions</h3><span id="faqs">{{faqs | safe}}</span></section>
<section id="Discover"><h2>Discover</h2><span id="promo">{{promo | safe}}</span></section>
{% endblock %}
CRITICAL: CaSGenerator also needs a different <head> script — it uses the Mediavine script in the <head> directly (not GetYourGuide). This is handled via {% block extra_head %} in the child template:


{% block extra_head %}
<!-- Journey by Mediavine -->
<script type="text/javascript" async="async" data-noptimize="1" data-cfasync="false" src="//scripts.scriptwrapper.com/tags/1cce7071-25c6-48c1-b7ee-1da5674b8bfd.js"></script>
{% endblock %}
(The base.njk already has Mediavine in it from headerScripts() — check for duplication, may need to remove it from base and keep only in CaS, or use a flag variable.)

The Refactored Generator Logic
New pageGeneratorSSR.js
The complete replacement. Key changes:

Remove jsdom, jquery imports
Import nunjucks and configure
appendProvinceData() becomes a function returning 6 strings instead of manipulating DOM nodes
getInfo() stays identical — already returns HTML strings
setNavBar($) → build navbar string directly (no $ needed)
Write nunjucks.render('pages/province.njk', ctx) instead of dom.window.document.documentElement.outerHTML
buildTabContent(province, avg) — replaces appendProvinceData(province, $)

function buildTabContent(province) {
  let tab1col1 = ''
  tab1col1 += `<p><ej>👥</ej>Population: <b>${province.Population.toLocaleString('en', {useGrouping:true})}</b>`
  tab1col1 += `<p><ej>🚑</ej>Healthcare: ${qualityScore("Healthcare", province.Healthcare)}`
  tab1col1 += `<p><ej>📚</ej>Education: ${qualityScore("Education", province.Education)}`
  tab1col1 += `<p><ej>👮🏽‍♀️</ej>Safety: ${qualityScore("Safety", province.Safety)}`
  tab1col1 += `<p><ej>🚨</ej>Crime: ${qualityScore("Crime", province.Crime)}`
  tab1col1 += `<p><ej>🚌</ej>Transport: ${qualityScore("PublicTransport", province["PublicTransport"])}`
  tab1col1 += `<p><ej>🚥</ej>Traffic: ${qualityScore("Traffic", province["Traffic"])}`
  tab1col1 += `<p><ej>🚴‍♂️</ej>Cyclable: ${qualityScore("CyclingLanes", province["CyclingLanes"])}`
  tab1col1 += `<p><ej>🏛️</ej>Culture: ${qualityScore("Culture", province.Culture)}`
  tab1col1 += `<p><ej>🍸</ej>Nightlife: ${qualityScore("Nightlife", province.Nightlife)}`
  tab1col1 += `<p><ej>⚽</ej>Recreation: ${qualityScore("Sports & Leisure", province["Sports & Leisure"])}`

  let tab1col2 = ''
  tab1col2 += `<p><ej>🌦️</ej>Climate: ${qualityScore("Climate", province.Climate)}`
  tab1col2 += `<p><ej>☀️</ej>Sunshine: ${qualityScore("SunshineHours", province.SunshineHours)}`
  tab1col2 += `<p><ej>🥵</ej>Summers: ${qualityScore("HotDays", province.HotDays)}`
  tab1col2 += `<p><ej>🥶</ej>Winters: ${qualityScore("ColdDays", province.ColdDays)}`
  tab1col2 += `<p><ej>🌧️</ej>Rain: ${qualityScore("RainyDays", province.RainyDays)}`
  tab1col2 += `<p><ej>🌫️</ej>Fog: ${qualityScore("FoggyDays", province.FoggyDays)}`
  tab1col2 += `<p><ej>🍃</ej>Air quality: ${qualityScore("AirQuality", province["AirQuality"])}`
  tab1col2 += `<p><ej>👪</ej>For family: ${qualityScore("Family-friendly", province["Family-friendly"])}`
  tab1col2 += `<p><ej>👩</ej>For women: ${qualityScore("Female-friendly", province["Female-friendly"])}`
  tab1col2 += `<p><ej>🏳️‍🌈</ej>LGBTQ+: ${qualityScore("LGBT-friendly", province["LGBT-friendly"])}`
  tab1col2 += `<p><ej>🥗</ej>For vegans: ${qualityScore("Veg-friendly", province["Veg-friendly"])}`

  let tab2col1 = ''
  tab2col1 += `<p><ej>📈</ej>Cost of Living: ${qualityScore("CostOfLiving", province["CostOfLiving"])}`
  tab2col1 += `<p><ej>🧑🏻</ej>Expenses (single person): ${qualityScore("Cost of Living (Individual)", province["Cost of Living (Individual)"])}`
  tab2col1 += `<p><ej>👩🏽‍🏫</ej>Expenses (tourist): ${qualityScore("Cost of Living (Nomad)", province["Cost of Living (Nomad)"])}`
  tab2col1 += `<p><ej>🏠</ej>Rental (studio apt.): ${qualityScore("StudioRental", province["StudioRental"])}`
  tab2col1 += `<p><ej>🏘️</ej>Rental (2-room apt.): ${qualityScore("BilocaleRent", province["BilocaleRent"])}`
  tab2col1 += `<p><ej>🏰</ej>Rental (3-room apt.): ${qualityScore("TrilocaleRent", province["TrilocaleRent"])}`

  let tab2col2 = ''
  tab2col2 += `<p><ej>🏙️</ej>Housing Cost: ${qualityScore("HousingCost", province["HousingCost"])}`
  tab2col2 += `<p><ej>💵</ej>Local Income: ${qualityScore("MonthlyIncome", province["MonthlyIncome"])}`
  tab2col2 += `<p><ej>👪</ej>Expenses (small family): ${qualityScore("Cost of Living (Family)", province["Cost of Living (Family)"])}`
  tab2col2 += `<p><ej>🏠</ej>Sale (studio apt.): ${qualityScore("StudioSale", province["StudioSale"])}`
  tab2col2 += `<p><ej>🏘️</ej>Sale (2-room apt.): ${qualityScore("BilocaleSale", province["BilocaleSale"])}`
  tab2col2 += `<p><ej>🏰</ej>Sale (3-room apt.): ${qualityScore("TrilocaleSale", province["TrilocaleSale"])}`

  let tab3col1 = ''
  tab3col1 += `<p><ej>👩‍💻</ej>Nomad-friendly: ${qualityScore("DN-friendly", province["DN-friendly"])}`
  tab3col1 += `<p><ej>💃</ej>Fun: ${qualityScore("Fun", province["Fun"])}`
  tab3col1 += `<p><ej>🤗</ej>Friendliness: ${qualityScore("Friendliness", province["Friendliness"])}`
  tab3col1 += `<p><ej>🤐</ej>English-speakers: ${qualityScore("English-speakers", province["English-speakers"])}`
  tab3col1 += `<p><ej>😊</ej>Happiness: ${qualityScore("Antidepressants", province["Antidepressants"])}`

  let tab3col2 = ''
  tab3col2 += `<p><ej>💸</ej>Nomad cost: ${qualityScore("Cost of Living (Nomad)", province["Cost of Living (Nomad)"])}`
  tab3col2 += `<p><ej>📡</ej>High-speed Internet: ${qualityScore("HighSpeedInternetCoverage", province["HighSpeedInternetCoverage"])}`
  tab3col2 += `<p><ej>📈</ej>Innovation: ${qualityScore("Innovation", province["Innovation"])}`
  tab3col2 += `<p><ej>🏖️</ej>Beach: ${qualityScore("Beach", province["Beach"])}`
  tab3col2 += `<p><ej>⛰️</ej>Hiking: ${qualityScore("Hiking", province["Hiking"])}`

  return { tab1col1, tab1col2, tab2col1, tab2col2, tab3col1, tab3col2 }
}
Navbar string (replaces setNavBar($))

const NAVBAR = `<nav id="navbar"><div class="navbar-container"><input type="checkbox" name="navbar" id="nbar"><div class="hamburger-lines"><span class="line line1"></span><span class="line line2"></span><span class="line line3"></span></div><ul class="menu-items"><li><a href="/">Home</a></li><li><a href="https://expiter.com/resources/">Resources</a></li><li><a href="https://expiter.com/tools/codice-fiscale-generator/">Tools</a></li><li><a href="https://expiter.com/blog/articles/">Blog</a></li><li><a href="https://expiter.com/app/#About">About</a></li><li><a href="https://forms.gle/WiivbZg8336TmeUPA" target="_blank">Take Survey</a></li></ul><label class="switch" id="switch"><input type="checkbox"><span class="slider round"></span></label><a href="/"><p class="logo">Italy Expats & Nomads</p></a></div></nav>`
The render call (replaces jsdom + writeFile):

const tabs = buildTabContent(province)
const info = getInfo(province)  // unchanged from original
const separator = '</br><div class="separator"></div></br>'

const html = nunjucks.render('pages/province.njk', {
  lang: 'en',
  seoTitle: `${en(province.Name)} - Quality of Life and Info Sheet for Expats`,
  seoDescription: `Information about living in ${en(province.Name)}, Italy for expats and digital nomads. ${en(province.Name)} quality of life, cost of living, safety and more.`,
  seoKeywords: `${en(province.Name)} italy, ${en(province.Name)} expat, ${en(province.Name)} life, ${en(province.Name)} digital nomad`,
  canonicalUrl: `https://expiter.com/${fileName}/`,
  hreflangIt: `https://expiter.com/it/${fileName}/`,
  heroImage: `https://expiter.com/img/${province.Abbreviation}.webp`,
  heroAlt: `${province.Name} Province`,
  pageTitle: `${en(province.Name)} for Expats and Nomads`,
  sidebar: setSideBar(province),
  navbar: NAVBAR,
  crimeUrl: `https://expiter.com/${fileName}/crime-and-safety/`,
  ...tabs,
  overview: info.overview,
  climate: info.climate,
  weather: info.weather || '',
  col: info.CoL,
  healthcare: info.healthcare,
  leisure: info.leisure,
  crimeandsafety: info.crimeandsafety,
  education: info.education,
  transport: info.transport,
  promo: [info.viator, separator, info.getyourguide, separator, info.related].join(''),
  separator
})

fs.writeFile(fileName + '.html', html, callback)
Critical Facts About the Data Functions
These functions inside pageGeneratorSSR.js must be preserved exactly — copy them verbatim into the new file:

qualityScore(quality, score)
The entire function (lines 458–512 of pageGeneratorSSR.js). Do not simplify. The FoggyDays branch uses non-linear thresholds (.265, .6, 1.00, 3x) that differ from the standard 0.8/0.95/1.05/1.2 pattern used everywhere else.

populateFacts()
Lines 528–591 of pageGeneratorSSR.js. Sets facts.Roma.overview, facts.Milano.overview, etc. — city-specific editorial content. Must be called before getInfo().

populateNightlifeFacts()
Lines 594–692 of pageGeneratorSSR.js. Sets facts[city].nightlife for ~40 cities.

populateSafetyFacts()
Lines 694–end of pageGeneratorSSR.js (reading CaSGenerator.js lines 528+ for the full set). Sets facts[city].safety, facts[city].safeToLive, facts[city].forTourists, facts[city].safeAtNight, facts[city].forStudents, facts[city].forWomen, facts[city].forMuslims.

populateData(data)
Sets up regions{}, provinces{}, facts{} dictionaries and avg. Must be called once after fetch. Index layout: 0-106 = provinces, 107 = national averages, 108+ = regions.

getInfo(province)
The main content builder. Returns object with keys: overview, CoL, climate, weather, lgbtq, leisure, healthcare, crimeandsafety, education, transport, disclaimer, map, viator, getyourguide, related. All values are HTML strings. Keep entirely in JS, do not put in templates.

en(word)
Translation function — Milano→Milan, Roma→Rome, Venezia→Venice, etc. Must be available wherever province names are used.

Critical Facts About CaSGenerator
CaSGenerator.js additionally:

Fetches a second dataset: https://expiter.com/dataset_crime_2023.json and merges it onto dataset.json by Name key before generating
Creates .htaccess file in each province directory with content:

RewriteEngine on
RewriteRule ^$ /province/{slug}.html [L]
RewriteRule ^([a-zA-Z0-9-]+)/$ $1.html [L]
Output path: province/{slug}/crime-and-safety.html
Hero image: https://expiter.com/img/safety/{ABB}.webp (different from province pages)
Has populateFacts() which sets facts[city].mafia for ~20 cities (different from the populateFacts() in pageGeneratorSSR.js — they are separate functions with the same name but different content)
Has additional FAQ content: facts[city].safeToLive, facts[city].forTourists, facts[city].safeAtNight, facts[city].forStudents, facts[city].forWomen, facts[city].forMuslims
parsedDataAbout*.txt — THE most important thing not to miss
Every province has a file: temp/parsedDataAbout{province.Name}.txt

These contain AI-written rich prose. Split on %%%:

Part 0 (split("%%%")[0]) → appended to info.overview
Part 1 (split("%%%")[1]) → appended to info.transport
In pageGeneratorSSR.js this is at lines 140–145:


let parsedData = fs.readFileSync('temp/parsedDataAbout'+province.Name+'.txt','utf8');
let provinceData = parsedData.split("%%%")[0]; (provinceData=="undefined"?provinceData="":"")
let transportData = parsedData.split("%%%")[1]; (transportData=="undefined"?transportData="":"")
facts[province.Name]["provinceData"]=provinceData;
facts[province.Name]["transportData"]=transportData;
Then in getInfo():


// In info.overview:
(facts[name]["provinceData"]!=""?(info.overview+='</br></br>'+facts[name]["provinceData"]):"")

// In info.transport:
(facts[name]["transportData"]!=""?(info.transport+='</br></br>'+facts[name]["transportData"]):"")
This was completely missing in the previous migration. Do not skip it.

Package.json — nunjucks is already installed

"nunjucks": "^3.2.4"
Check: node_modules/nunjucks should exist. If not: npm install.

URL/File Output Structure (must not change)
Generator	Output path	URL served as
pageGeneratorSSR.js	province/{slug}.html	/province/{slug}/
CaSGenerator.js	province/{slug}/crime-and-safety.html	/province/{slug}/crime-and-safety/
The .htaccess in each province/{slug}/ dir handles the URL → file mapping.

Verification Steps
After implementation, test against a known province (Milano, Roma):

Run node pageGeneratorSSR.js — should produce province/milano.html, province/roma.html etc.

Check province/milano.html contains:

<score class='poor max'>expensive</score> (Milano cost of living is high)
<score class='excellent max'>excellent</score> (some category)
The parsedDataAbout prose in the overview section (not empty)
facts.Milano.overview text ("The city of Milan, with 1,371,498 residents...")
facts.Milano.nightlife text ("Milan is renowned for its vibrant and world-class nightlife")
Hero image: https://expiter.com/img/MI.webp
Sidebar with "Provinces in Lombardy" link
rel="canonical" = https://expiter.com/province/milano/
hreflang alternate for /it/province/milano/
Region map figure in overview
Google Maps embed
GetYourGuide widget
Viator widget
4 related province snippet figures
Run node CaSGenerator.js — check province/milano/crime-and-safety.html:

facts.Milano.mafia text present ("There is a significant mafia presence in Milan...")
facts.Milano.safeToLive present in FAQs section
Hero image: https://expiter.com/img/safety/MI.webp
.htaccess exists in province/milano/
Crime stats from 2023 dataset (IndiceCriminalita, FurtiDestrezza etc.)
What to Leave Alone
js/pageBuilder.js — do not touch
All *Italy.js, *French.js, *German.js, *Spanish.js generators — out of scope
comuniGenerator.js, townPageGenerator.js — out of scope
provincesGeneratorSSR.js, regionGeneratorSSR.js — out of scope
sitemapGenerator.js — out of scope
src/_data/, src/regions.njk, src/town.njk, src/app.njk, src/province.njk — these are from the failed Eleventy migration; leave them, don't build on them
src/_includes/base.njk — superseded by src/templates/layouts/base.njk; leave the old one in place but don't use it
Summary of Files to Create/Modify
Action	File
Create	js/nunjucksEnv.js
Create	src/templates/layouts/base.njk
Create	src/templates/pages/province.njk
Create	src/templates/pages/crime-safety.njk
Replace	pageGeneratorSSR.js — remove jsdom/jquery, add nunjucks render
Replace	CaSGenerator.js — remove jsdom/jquery, add nunjucks render
