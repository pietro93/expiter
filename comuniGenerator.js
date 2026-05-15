import * as pb from './js/pageBuilder.js';
import fetch from 'node-fetch';
import fs from 'fs';
import { nunjucks } from './js/nunjucksEnv.js';

var dataset;
var provinces = {};
var facts = {};
var avg;
var regions = {};

function handle(name) {
  return name.replace('(*)', '').replace(/'/g, '-').replace(/\s+/g, '-').toLowerCase();
}

function en(word) {
  switch (word) {
    case 'Sicilia': return 'Sicily';
    case "Valle d'Aosta": case "Val d'Aosta": return 'Aosta Valley';
    case 'Toscana': return 'Tuscany';
    case 'Sardegna': return 'Sardinia';
    case 'Milano': return 'Milan';
    case 'Lombardia': return 'Lombardy';
    case 'Torino': return 'Turin';
    case 'Piemonte': return 'Piedmont';
    case 'Roma': return 'Rome';
    case 'Puglia': return 'Apulia';
    case 'Mantova': return 'Mantua';
    case 'Padova': return 'Padua';
    case 'Venezia': return 'Venice';
    case 'Firenze': return 'Florence';
    case 'Napoli': return 'Naples';
    case 'Genova': return 'Genoa';
    default: return word;
  }
}

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
    return { name: en(p.Name), region: en(p.Region), abbr: p.Abbreviation, url: '/province/' + handle(p.Name) + '/' };
  }).filter(Boolean);
}

function generateSiteMap(data) {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  for (let i = 0; i < 107; i++) {
    xml += '<url><loc>https://expiter.com/comuni/province-of-' + handle(data[i].Name) + '/</loc></url>\n';
  }
  xml += '</urlset>';
  fs.writeFile('sitemap/comuni-sitemap.xml', xml, err => { if (err) throw err; console.log('comuni-sitemap.xml saved!'); });
}

fetch('https://expiter.com/dataset.json', { method: 'Get' })
  .then(r => r.json())
  .then(data => {
    dataset = data;
    populateData(data);
    generateSiteMap(dataset);

    for (let i = 0; i < 107; i++) {
      let province = dataset[i];
      const provinceSlug = handle(province.Name);
      const dirName = 'comuni/province-of-' + provinceSlug;

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
          url: '/comuni/' + provinceSlug + '/' + handle(name) + '/'
        };
      });

      const firstKey = comuniKeys[0];
      const largestRaw = province.Comuni[firstKey];
      const largestName = largestRaw.Name[0] + largestRaw.Name.toLowerCase().slice(1);
      const largestTown = {
        name: largestName,
        url: '/comuni/' + provinceSlug + '/' + handle(largestName) + '/',
        population: largestRaw.Population
      };

      const nearbyProvinces = getRelated(province);

      const html = nunjucks.render('pages/comuni-list.njk', {
        lang: 'en',
        seoTitle: 'Towns in ' + en(province.Name) + ' Province, Italy',
        seoDescription: 'List of all ' + towns.length + ' municipalities (comuni) in the province of ' + en(province.Name) + ', ' + en(province.Region) + ', Italy.',
        seoKeywords: en(province.Name) + ' comuni, municipalities ' + en(province.Name) + ', towns ' + en(province.Name),
        canonicalUrl: 'https://expiter.com/' + dirName + '/',
        hreflangIt: 'https://expiter.com/it/comune/provincia-di-' + provinceSlug + '/',
        heroImage: 'https://expiter.com/img/' + province.Abbreviation + '.webp',
        heroAlt: 'Towns in ' + en(province.Name) + ' Province',
        pageTitle: 'Towns in ' + en(province.Name) + ' Province',
        eyebrow: en(province.Region) + ' · Municipalities',
        breadcrumbParent: { href: '/province/' + provinceSlug + '/', label: en(province.Name) + ' Province' },
        sidebar: pb.setSideBar(province),
        toc: null,
        tabRows: null,
        provinceName: en(province.Name),
        provinceUrl: '/province/' + provinceSlug + '/',
        regionName: en(province.Region),
        townCount: towns.length,
        largestTown,
        towns,
        nearbyProvinces
      });

      if (!fs.existsSync('comuni')) fs.mkdirSync('comuni');
      fs.writeFile(dirName + '.html', html, err => {
        if (err) throw err;
        console.log(province.Name + ' comuni list saved!');
      });
    }
  })
  .catch(err => console.error('Error: ' + err));
