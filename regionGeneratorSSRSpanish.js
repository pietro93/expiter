import * as pb from './js/pageBuilder.js';
import { es } from './js/pageBuilder.js';
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
      const esCapital = es(r.Capital);
      regions.push({
        Name: es(r.Name),
        populationFmt: Number(r.Population).toLocaleString('es'),
        Size: r.Size,
        Density: r.Density,
        Provinces: r.Provinces,
        Towns: r.Towns,
        capitalName: esCapital,
        capitalSlug: handle(esCapital),
      });
    }

    const html = nunjucks.render('pages/regions-list-es.njk', {
      lang: 'es',
      seoTitle: 'Regiones de Italia — Las 20 Regiones Italianas para Expatriados',
      seoDescription: 'Resumen de las 20 regiones de Italia. Población, superficie, densidad, provincias y capitales — todo lo que los expatriados deben saber sobre las regiones italianas.',
      seoKeywords: 'regiones italianas, regiones de italia, lista regiones italia, expat regiones italia',
      canonicalUrl: 'https://expiter.com/es/regiones/regiones-italianas/',
      hreflangEn: 'https://expiter.com/region/regions-of-italy/',
      heroImage: 'https://expiter.com/img/expiter-italy-expats-and-nomads.webp',
      eyebrow: 'Regiones de Italia',
      pageTitle: 'Las 20 Regiones de Italia',
      breadcrumbParent: { href: '/es/app/', label: 'Provincias' },
      sidebar: pb.setSideBarES(),
      regions,
    });

    if (!fs.existsSync('es/regiones')) fs.mkdirSync('es/regiones', { recursive: true });
    fs.writeFileSync('es/regiones/regiones-italianas.html', html);
    console.log('es/regiones/regiones-italianas.html saved!');
  })
  .catch(err => { console.error('error:', err); process.exit(1); });
