import * as pb from './js/pageBuilder.js';
import { de } from './js/pageBuilder.js';
import fetch from 'node-fetch';
import fs from 'fs';
import { nunjucks } from './js/nunjucksEnv.js';

function handle(name) {
  return name.replace(/'/g, '-').replace(/\s+/g, '-').toLowerCase();
}

fetch('https://expiter.com/dataset.json', { method: 'Get', headers: { 'Cache-Control': 'no-cache' } })
  .then(r => r.json())
  .then(dataset => {
    const regions = [];
    for (let i = 108; i < dataset.length; i++) {
      const r = dataset[i];
      const deCapital = de(r.Capital);
      regions.push({
        Name: de(r.Name),
        populationFmt: Number(r.Population).toLocaleString('de'),
        Size: r.Size,
        Density: r.Density,
        Provinces: r.Provinces,
        Towns: r.Towns,
        capitalName: deCapital,
        capitalSlug: handle(deCapital),
      });
    }

    const html = nunjucks.render('pages/regions-list-de.njk', {
      lang: 'de',
      seoTitle: 'Regionen Italiens — Die 20 Italienischen Regionen für Auswanderer',
      seoDescription: 'Überblick über die 20 Regionen Italiens. Bevölkerung, Fläche, Dichte, Provinzen und Hauptstädte — alles, was Auswanderer über die italienischen Regionen wissen müssen.',
      seoKeywords: 'italienische regionen, regionen italiens, liste regionen italien, expat regionen italien',
      canonicalUrl: 'https://expiter.com/de/regionen/italienische-regionen/',
      hreflangEn: 'https://expiter.com/region/regions-of-italy/',
      heroImage: 'https://expiter.com/img/expiter-italy-expats-and-nomads.webp',
      eyebrow: 'Regionen Italiens',
      pageTitle: 'Die 20 Regionen Italiens',
      breadcrumbParent: { href: '/de/app/', label: 'Provinzen' },
      sidebar: pb.setSideBarDE(),
      regions,
    });

    if (!fs.existsSync('de/regionen')) fs.mkdirSync('de/regionen', { recursive: true });
    fs.writeFileSync('de/regionen/italienische-regionen.html', html);
    console.log('de/regionen/italienische-regionen.html saved!');
  })
  .catch(err => { console.error('error:', err); process.exit(1); });
