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

fetch('https://expiter.com/dataset.json', { method: 'Get', headers: { 'Cache-Control': 'no-cache' } })
  .then(r => r.json())
  .then(dataset => {
    const regions = [];
    for (let i = 108; i < dataset.length; i++) {
      const r = dataset[i];
      regions.push({
        Name: r.Name,
        populationFmt: Number(r.Population).toLocaleString('en'),
        Size: r.Size,
        Density: r.Density,
        Provinces: r.Provinces,
        Towns: r.Towns,
        Capital: r.Capital,
        capitalSlug: String(r.Capital).replace(/\s+/g, '-').replace(/'/g, '-').toLowerCase(),
      });
    }

    const html = nunjucks.render('pages/regions-list.njk', {
      lang: 'en',
      seoTitle: 'Regions of Italy — The 20 Italian Regions for Expats',
      seoDescription: 'Overview of the 20 regions of Italy. Population, size, density, provinces and capitals — everything expats need to know about Italian regions.',
      seoKeywords: 'regions of italy, italian regions, italy regions list, expat italy regions',
      canonicalUrl: 'https://expiter.com/region/regions-of-italy/',
      hreflangIt: 'https://expiter.com/it/regioni-italiane/',
      heroImage: 'https://expiter.com/img/expiter-italy-expats-and-nomads.webp',
      eyebrow: 'Regions of Italy',
      pageTitle: 'The 20 Regions of Italy',
      breadcrumbParent: { href: '/provinces/', label: 'Provinces' },
      sidebar: pb.setSideBar(),
      navbar: NAVBAR,
      regions,
    });

    if (!fs.existsSync('region')) fs.mkdirSync('region');
    fs.writeFileSync('region/regions-of-italy.html', html);
    console.log('region/regions-of-italy.html Saved!');
  })
  .catch(err => { console.error('error:', err); process.exit(1); });
