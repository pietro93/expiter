import * as pb from './js/pageBuilder.js';
import { es, handle } from './js/pageBuilder.js';
import fetch from 'node-fetch';
import fs from 'fs';
import { nunjucks } from './js/nunjucksEnv.js';

var dataset;
var provinces = {};
var facts = {};
var avg;
var regions = {};

function populateData(data) {
  for (let i = 108; i < data.length; i++) {
    let region = data[i];
    regions[region.Name] = region;
    regions[region.Name].index = i;
    facts[region.Name] = {};
    facts[region.Name].provinces = [];
  }
  for (let i = 0; i < 107; i++) {
    let province = data[i];
    provinces[province.Name] = province;
    provinces[province.Name].index = i;
    facts[province.Region].provinces.push(province.Name);
    facts[province.Name] = {};
  }
  avg = data[107];
}

function getRelated(province) {
  let region = regions[province.Region];
  let target;
  if (region.Name === "Valle d'Aosta") target = facts[region.Name].provinces.concat(facts['Piemonte'].provinces);
  else if (region.Name === 'Trentino-Alto Adige') target = facts[region.Name].provinces.concat(facts['Veneto'].provinces).concat(['Brescia', 'Sondrio']);
  else if (region.Name === 'Molise') target = facts[region.Name].provinces.concat(facts['Abruzzo'].provinces);
  else if (region.Name === 'Abruzzo') target = facts[region.Name].provinces.concat(facts['Molise'].provinces);
  else if (region.Name === 'Emilia-Romagna') target = facts[region.Name].provinces.concat(['Prato', 'Mantova', 'Cremona', 'Rovigo', 'Massa-Carrara', 'Lucca', 'Pistoia', 'Pesaro e Urbino', 'Arezzo']);
  else if (region.Name === 'Liguria') target = facts[region.Name].provinces.concat(facts['Piemonte'].provinces);
  else if (region.Name === 'Piemonte') target = facts[region.Name].provinces.concat(facts['Lombardia'].provinces);
  else if (region.Name === 'Lombardia') target = facts[region.Name].provinces.concat(facts['Piemonte'].provinces);
  else if (region.Name === 'Friuli-Venezia Giulia') target = facts[region.Name].provinces.concat(facts['Veneto'].provinces);
  else if (region.Name === 'Basilicata') target = facts[region.Name].provinces.concat(facts['Campania'].provinces).concat(facts['Puglia'].provinces).concat(['Cosenza']);
  else if (region.Name === 'Puglia') target = facts[region.Name].provinces.concat(facts['Basilicata'].provinces).concat(['Campobasso', 'Benevento', 'Avellino']);
  else if (region.Name === 'Umbria') target = facts[region.Name].provinces.concat(facts['Marche'].provinces).concat(['Arezzo', 'Siena', 'Viterbo', 'Rieti']);
  else target = facts[region.Name].provinces;

  if (province.Name === 'Reggio Calabria') target = target.concat(['Messina']);
  else if (province.Name === 'Messina') target = target.concat(['Reggio Calabria']);
  else if (province.Name === 'Torino') target = target.concat(['Aosta']);
  else if (province.Name === 'Cosenza') target = target.concat(facts['Basilicata'].provinces);
  else if (province.Name === 'Salerno') target = target.concat(facts['Basilicata'].provinces);

  target = target.filter(n => n !== province.Name);
  const pick = () => { const i = Math.floor(Math.random() * target.length); const v = target[i]; target.splice(i, 1); return v; };
  return [pick(), pick(), pick(), pick()].filter(Boolean).map(name => {
    const p = provinces[name];
    if (!p) return null;
    return { name: es(p.Name), region: es(p.Region), abbr: p.Abbreviation, url: '/es/provincia/' + handle(es(p.Name)) + '/' };
  }).filter(Boolean);
}

fetch('https://expiter.com/dataset.json', { method: 'Get' })
  .then(r => r.json())
  .then(data => {
    dataset = data;
    populateData(data);

    for (let i = 0; i < 107; i++) {
      let province = dataset[i];
      const esProvince = es(province.Name);
      const esRegion = es(province.Region);
      const provinceSlug = handle(esProvince);
      const dirName = 'es/municipios/provincia-de-' + provinceSlug;

      if (!fs.existsSync('temp/' + province.Name + '-comuni.json')) {
        console.log('Missing comuni: ' + province.Name);
        continue;
      }

      const dic = JSON.parse(fs.readFileSync('temp/' + province.Name + '-comuni.json', 'utf8'));
      province.Comuni = dic;

      const comuniKeys = Object.keys(province.Comuni);
      const towns = comuniKeys.map(key => {
        const c = province.Comuni[key];
        const name = c.Name[0] + c.Name.toLowerCase().slice(1);
        return {
          name,
          slug: handle(name),
          population: c.Population,
          density: c.Density,
          altitude: c.Altitude,
          url: '/es/municipios/' + provinceSlug + '/' + handle(name) + '/'
        };
      });

      const firstKey = comuniKeys[0];
      const largestRaw = province.Comuni[firstKey];
      const largestName = largestRaw.Name[0] + largestRaw.Name.toLowerCase().slice(1);
      const largestTown = {
        name: largestName,
        url: '/es/municipios/' + provinceSlug + '/' + handle(largestName) + '/',
        population: largestRaw.Population
      };

      const nearbyProvinces = getRelated(province);
      const enProvinceSlug = handle(province.Name);

      const html = nunjucks.render('pages/comuni-list-es.njk', {
        lang: 'es',
        seoTitle: 'Municipios en la Provincia de ' + esProvince + ', ' + esRegion + ', Italia',
        seoDescription: 'Lista de todos los ' + towns.length + ' municipios en la provincia de ' + esProvince + ', ' + esRegion + ', Italia.',
        seoKeywords: esProvince + ' municipios, municipios ' + esProvince + ', ciudades ' + esProvince,
        canonicalUrl: 'https://expiter.com/' + dirName + '/',
        hreflangEn: 'https://expiter.com/comuni/province-of-' + enProvinceSlug + '/',
        heroImage: 'https://expiter.com/img/' + province.Abbreviation + '.webp',
        heroAlt: 'Municipios en la Provincia de ' + esProvince,
        pageTitle: 'Municipios en la Provincia de ' + esProvince,
        eyebrow: esRegion + ' · Municipios',
        breadcrumbParent: { href: '/es/provincia/' + provinceSlug + '/', label: 'Provincia de ' + esProvince },
        sidebar: pb.setSideBarES(province),
        toc: null,
        tabRows: null,
        provinceName: esProvince,
        provinceUrl: '/es/provincia/' + provinceSlug + '/',
        regionName: esRegion,
        townCount: towns.length,
        largestTown,
        towns,
        nearbyProvinces
      });

      if (!fs.existsSync('es/municipios')) fs.mkdirSync('es/municipios', { recursive: true });
      fs.writeFile(dirName + '.html', html, err => {
        if (err) throw err;
        console.log(province.Name + ' comuni list (ES) saved!');
      });
    }
  })
  .catch(err => console.error('Error: ' + err));
