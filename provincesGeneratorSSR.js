import * as pb from './js/pageBuilder.js'
import fetch from 'node-fetch';
import fs from 'fs';
import { nunjucks } from './js/nunjucksEnv.js'

const NAVBAR = '<nav id="navbar"><div class="navbar-container">'+
'<input type="checkbox" name="navbar" id="nbar">'+
'<div class="hamburger-lines"><span class="line line1"></span><span class="line line2"></span><span class="line line3"></span></div>'+
'<ul class="menu-items">'+
'<li><a href="/">Home</a></li>'+
'<li><a href="https://expiter.com/resources/">Resources</a></li>'+
'<li><a href="https://expiter.com/tools/codice-fiscale-generator/">Tools</a></li>'+
'<li><a href="https://expiter.com/blog/articles/">Blog</a></li>'+
'<li><a href="https://expiter.com/app/#About">About</a></li>'+
'<li><a href="https://forms.gle/WiivbZg8336TmeUPA" target="_blank">Take Survey</a></li>'+
'</ul>'+
'<label class="switch" id="switch"><input type="checkbox"><span class="slider round"></span></label>'+
'<a href="/"><div class="logo">Italy Expats & Nomads</div></a>'+
'</div></nav>';

let avg;

fetch('https://expiter.com/dataset.json', { method: 'Get' })
  .then(r => r.json())
  .then(dataset => {
    avg = dataset[107];

    const provinces = dataset.slice(0, 107);

    // Group by region; regions are ordered alphabetically (matching prior behavior).
    const regionsMap = {};
    for (const p of provinces) {
      const region = p.Name === 'Aosta' ? "Valle d'Aosta" : p.Region;
      if (!regionsMap[region]) regionsMap[region] = [];
      regionsMap[region].push(p);
    }

    const regions = Object.keys(regionsMap).sort().map(name => ({
      id: name.replace(/[\s']/g, '-'),
      name,
      provinces: regionsMap[name]
        .sort((a, b) => a.Name.localeCompare(b.Name))
        .map(p => buildProvinceCardData(p))
    }));

    const html = nunjucks.render('pages/provinces-list.njk', {
      lang: 'en',
      seoTitle: 'All 107 Italian Provinces — Quality of Life & Info for Expats',
      seoDescription: 'Browse all 107 Italian provinces grouped by region. Compare quality of life, cost of living, safety, climate and more for expats and digital nomads.',
      seoKeywords: 'italian provinces, italy provinces list, italy regions, expat italy, digital nomad italy',
      canonicalUrl: 'https://expiter.com/provinces/',
      hreflangIt: 'https://expiter.com/it/province-italiane/',
      heroImage: 'https://expiter.com/img/expiter-italy-expats-and-nomads.webp',
      eyebrow: 'Provinces',
      pageTitle: 'All Italian Provinces by Region',
      sidebar: pb.setSideBar(),
      navbar: NAVBAR,
      regions,
    });

    fs.writeFileSync('./provinces.html', html);
    console.log('provinces.html Saved!');
  })
  .catch(err => { console.error('error:', err); process.exit(1); });


function buildProvinceCardData(p) {
  const slug = p.Name.replace(/'/g, '-').replace(/\s+/g, '-').toLowerCase();
  const popLabel = p.Population >= 1_000_000 ? 'Large city'
                : p.Population >= 300_000   ? 'Medium city'
                                            : 'Small city';
  return {
    Name: p.Name,
    Region: p.Region,
    Abbreviation: p.Abbreviation,
    slug,
    popLabel,
    populationFmt: p.Population.toLocaleString('en'),
    cost:       qualityScore('CostOfLiving',                p.CostOfLiving),
    safety:     qualityScore('Safety',                       p.Safety),
    climate:    qualityScore('Climate',                      p.Climate),
    expenses:   qualityScore('Cost of Living (Individual)',  p['Cost of Living (Individual)']),
    healthcare: qualityScore('Healthcare',                   p.Healthcare),
    transport:  qualityScore('PublicTransport',              p.PublicTransport),
    education:  qualityScore('Education',                    p.Education),
    culture:    qualityScore('Culture',                      p.Culture),
    nightlife:  qualityScore('Nightlife',                    p.Nightlife),
    air:        qualityScore('AirQuality',                   p.AirQuality),
    family:     qualityScore('Family-friendly',              p['Family-friendly']),
  };
}


function qualityScore(quality, score) {
  const expenses = ['Cost of Living (Individual)', 'Cost of Living (Family)', 'Cost of Living (Nomad)',
    'StudioRental', 'BilocaleRent', 'TrilocaleRent', 'MonthlyIncome',
    'StudioSale', 'BilocaleSale', 'TrilocaleSale'];

  if (quality === 'CostOfLiving' || quality === 'HousingCost') {
    if (score < avg[quality] * 0.8) return "<score class='excellent short'>cheap</score>";
    if (score < avg[quality] * 0.95) return "<score class='great medium'>affordable</score>";
    if (score < avg[quality] * 1.05) return "<score class='good medium'>average</score>";
    if (score < avg[quality] * 1.2)  return "<score class='average long'>high</score>";
    return "<score class='poor max'>expensive</score>";
  }
  if (expenses.includes(quality)) {
    if (score < avg[quality] * 0.95) return "<score class='green'>" + score + "€/m</score>";
    if (score < avg[quality] * 1.05) return "<score class='orange'>" + score + "€/m</score>";
    return "<score class='red'>" + score + "€/m</score>";
  }
  if (quality === 'HotDays' || quality === 'ColdDays') {
    const tag = quality === 'HotDays' ? 'hot' : 'cold';
    if (score < avg[quality] * 0.8)  return "<score class='excellent short'>not " + tag + "</score>";
    if (score < avg[quality] * 0.95) return "<score class='great medium'>not very " + tag + "</score>";
    if (score < avg[quality] * 1.05) return "<score class='good medium'>a bit " + tag + "</score>";
    if (score < avg[quality] * 1.2)  return "<score class='average long'>" + tag + "</score>";
    return "<score class='poor max'>very " + tag + "</score>";
  }
  if (quality === 'RainyDays') {
    if (score < avg[quality] * 0.8)  return "<score class='excellent short'>very little</score>";
    if (score < avg[quality] * 0.95) return "<score class='great medium'>little</score>";
    if (score < avg[quality] * 1.05) return "<score class='good medium'>average</score>";
    if (score < avg[quality] * 1.2)  return "<score class='average long'>rainy</score>";
    return "<score class='poor max'>a lot</score>";
  }
  if (quality === 'FoggyDays') {
    // Non-linear thresholds — DO NOT simplify (see ARCHITECTURE.md).
    if (score < avg[quality] * 0.265) return "<score class='excellent short'>no fog</score>";
    if (score < avg[quality] * 0.6)   return "<score class='great medium'>little</score>";
    if (score < avg[quality] * 1.0)   return "<score class='good medium'>average</score>";
    if (score < avg[quality] * 3)     return "<score class='average long'>foggy</score>";
    return "<score class='poor max'>a lot</score>";
  }
  if (quality === 'Crime' || quality === 'Traffic') {
    if (score < avg[quality] * 0.8)  return "<score class='excellent short'>very low</score>";
    if (score < avg[quality] * 0.95) return "<score class='great medium'>low</score>";
    if (score < avg[quality] * 1.05) return "<score class='good medium'>average</score>";
    if (score < avg[quality] * 1.2)  return "<score class='average long'>high</score>";
    return "<score class='poor max'>too much</score>";
  }
  // Default: high = good, low = bad
  if (score < avg[quality] * 0.8)  return "<score class='poor short'>poor</score>";
  if (score < avg[quality] * 0.95) return "<score class='average medium'>okay</score>";
  if (score < avg[quality] * 1.05) return "<score class='good medium'>good</score>";
  if (score < avg[quality] * 1.2)  return "<score class='great long'>great</score>";
  return "<score class='excellent max'>excellent</score>";
}
