import * as pb from './js/pageBuilder.js';
import { fr } from './js/pageBuilder.js';
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
      const frCapital = fr(r.Capital);
      regions.push({
        Name: fr(r.Name),
        populationFmt: Number(r.Population).toLocaleString('fr'),
        Size: r.Size,
        Density: r.Density,
        Provinces: r.Provinces,
        Towns: r.Towns,
        capitalName: frCapital,
        capitalSlug: handle(frCapital),
      });
    }

    const html = nunjucks.render('pages/regions-list-fr.njk', {
      lang: 'fr',
      seoTitle: 'Régions d\'Italie — Les 20 Régions Italiennes pour Expatriés',
      seoDescription: 'Aperçu des 20 régions d\'Italie. Population, superficie, densité, provinces et chefs-lieux — tout ce que les expatriés doivent savoir sur les régions italiennes.',
      seoKeywords: 'régions italiennes, régions d\'Italie, liste régions italie, expat régions italie',
      canonicalUrl: 'https://expiter.com/fr/regions/regions-italiennes/',
      hreflangEn: 'https://expiter.com/region/regions-of-italy/',
      heroImage: 'https://expiter.com/img/expiter-italy-expats-and-nomads.webp',
      eyebrow: 'Régions d\'Italie',
      pageTitle: 'Les 20 Régions d\'Italie',
      breadcrumbParent: { href: '/fr/app/', label: 'Provinces' },
      sidebar: pb.setSideBarFR(),
      regions,
    });

    if (!fs.existsSync('fr/regions')) fs.mkdirSync('fr/regions', { recursive: true });
    fs.writeFileSync('fr/regions/regions-italiennes.html', html);
    console.log('fr/regions/regions-italiennes.html saved!');
  })
  .catch(err => { console.error('error:', err); process.exit(1); });
