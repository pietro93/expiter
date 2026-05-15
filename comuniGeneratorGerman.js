import * as pb from './js/pageBuilder.js';
import { de, handle } from './js/pageBuilder.js';
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
    return { name: de(p.Name), region: de(p.Region), abbr: p.Abbreviation, url: '/de/provinz/' + handle(de(p.Name)) + '/' };
  }).filter(Boolean);
}

fetch('https://expiter.com/dataset.json', { method: 'Get' })
  .then(r => r.json())
  .then(data => {
    dataset = data;
    populateData(data);

    for (let i = 0; i < 107; i++) {
      let province = dataset[i];
      const deProvince = de(province.Name);
      const deRegion = de(province.Region);
      const provinceSlug = handle(deProvince);
      const dirName = 'de/gemeinden/provinz-' + provinceSlug;

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
          url: '/de/gemeinden/' + provinceSlug + '/' + handle(name) + '/'
        };
      });

      const firstKey = comuniKeys[0];
      const largestRaw = province.Comuni[firstKey];
      const largestName = largestRaw.Name[0] + largestRaw.Name.toLowerCase().slice(1);
      const largestTown = {
        name: largestName,
        url: '/de/gemeinden/' + provinceSlug + '/' + handle(largestName) + '/',
        population: largestRaw.Population
      };

      const nearbyProvinces = getRelated(province);
      const enProvinceSlug = handle(province.Name);

      const html = nunjucks.render('pages/comuni-list-de.njk', {
        lang: 'de',
        seoTitle: 'Gemeinden in der Provinz ' + deProvince + ', ' + deRegion + ', Italien',
        seoDescription: 'Liste aller ' + towns.length + ' Gemeinden in der Provinz ' + deProvince + ', ' + deRegion + ', Italien.',
        seoKeywords: deProvince + ' Gemeinden, Gemeinden ' + deProvince + ', Städte ' + deProvince,
        canonicalUrl: 'https://expiter.com/' + dirName + '/',
        hreflangEn: 'https://expiter.com/comuni/province-of-' + enProvinceSlug + '/',
        heroImage: 'https://expiter.com/img/' + province.Abbreviation + '.webp',
        heroAlt: 'Gemeinden in der Provinz ' + deProvince,
        pageTitle: 'Gemeinden in der Provinz ' + deProvince,
        eyebrow: deRegion + ' · Gemeinden',
        breadcrumbParent: { href: '/de/provinz/' + provinceSlug + '/', label: 'Provinz ' + deProvince },
        sidebar: pb.setSideBarDE(province),
        toc: null,
        tabRows: null,
        provinceName: deProvince,
        provinceUrl: '/de/provinz/' + provinceSlug + '/',
        regionName: deRegion,
        townCount: towns.length,
        largestTown,
        towns,
        nearbyProvinces
      });

      if (!fs.existsSync('de/gemeinden')) fs.mkdirSync('de/gemeinden', { recursive: true });
      fs.writeFile(dirName + '.html', html, err => {
        if (err) throw err;
        console.log(province.Name + ' comuni list (DE) saved!');
      });
    }
  })
  .catch(err => console.error('Error: ' + err));
