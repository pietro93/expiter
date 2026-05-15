import * as pb from './js/pageBuilder.js';
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
      regions.push({
        Name: r.Name,
        populationFmt: Number(r.Population).toLocaleString('it'),
        Size: r.Size,
        Density: r.Density,
        Provinces: r.Provinces,
        Towns: r.Towns,
        capitalName: r.Capital,
        capitalSlug: handle(r.Capital),
      });
    }

    const html = nunjucks.render('pages/regions-list-it.njk', {
      lang: 'it',
      seoTitle: 'Regioni d\'Italia — Le 20 Regioni Italiane per Expat',
      seoDescription: 'Panoramica delle 20 regioni d\'Italia. Popolazione, superficie, densità, province e capoluoghi — tutto quello che gli expat devono sapere sulle regioni italiane.',
      seoKeywords: 'regioni italiane, regioni d\'Italia, lista regioni italia, expat regioni italia',
      canonicalUrl: 'https://expiter.com/it/regioni/regioni-italiane/',
      hreflangEn: 'https://expiter.com/region/regions-of-italy/',
      heroImage: 'https://expiter.com/img/expiter-italy-expats-and-nomads.webp',
      eyebrow: 'Regioni d\'Italia',
      pageTitle: 'Le 20 Regioni d\'Italia',
      breadcrumbParent: { href: '/it/app/', label: 'Province' },
      sidebar: pb.setSideBarIT(),
      regions,
    });

    if (!fs.existsSync('it/regioni')) fs.mkdirSync('it/regioni', { recursive: true });
    fs.writeFileSync('it/regioni/regioni-italiane.html', html);
    console.log('it/regioni/regioni-italiane.html saved!');
  })
  .catch(err => { console.error('error:', err); process.exit(1); });
