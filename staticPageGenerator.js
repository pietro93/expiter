import fs from 'fs';
import path from 'path';
import { nunjucks } from './js/nunjucksEnv.js';
import * as pb from './js/pageBuilder.js';

// One entry per migrated static page.
// out: path relative to repo root where the rendered HTML is written.
const pages = [
  {
    template: 'pages/static/resources.njk',
    out: 'resources.html',
    pageTitle: 'Italy Expat Resource List',
    eyebrow: 'Resources',
    seoTitle: 'Italy Expats and Nomads — Resources',
    seoDescription: 'Resources for Expats and Digital Nomads in Italy. Best health insurance, expat books, language learning apps and more.',
    seoKeywords: 'italy, italian cities, best city in italy, italy digital nomad, italy expat',
    canonicalUrl: 'https://expiter.com/resources/',
    hreflangIt: 'https://expiter.com/it/risorse/',
    heroImage: 'https://expiter.com/img/expiter-favicon.ico',
  },
  {
    template: 'pages/static/privacy-policy.njk',
    out: 'privacy-policy.html',
    pageTitle: 'Privacy Policy',
    eyebrow: 'Privacy Policy',
    seoTitle: 'Expiter — Privacy Policy',
    seoDescription: 'Privacy Policy for Expiter — Italy Expats and Nomads.',
    seoKeywords: 'privacy policy, expiter, italy',
    canonicalUrl: 'https://expiter.com/privacy-policy/',
    hreflangIt: 'https://expiter.com/it/privacy/',
    heroImage: 'https://expiter.com/img/expiter-favicon.ico',
  },
  {
    template: 'pages/static/regions-of-italy.njk',
    out: 'region/regions-of-italy.html',
    pageTitle: 'Regions of Italy',
    eyebrow: 'Regions of Italy',
    seoTitle: 'Regions in Italy',
    seoDescription: 'List of all 20 regions in Italy with information about size, population, provinces, towns and more.',
    seoKeywords: 'regions of Italy, Italy regions, list of regions in italy, Italian regions, regions in Italy by population',
    canonicalUrl: 'https://expiter.com/region/regions-of-italy/',
    hreflangIt: 'https://expiter.com/it/regioni/regioni-italiane/',
    heroImage: 'https://expiter.com/img/regions.webp',
  },
  {
    template: 'pages/static/us-consular-offices-italy.njk',
    out: 'tools/us-consular-offices-italy.html',
    pageTitle: 'U.S. Consular Offices in Italy',
    eyebrow: 'U.S. Consular Offices',
    breadcrumbParent: { href: '/tools/', label: 'Tools' },
    seoTitle: 'U.S. Consular Offices in Italy',
    seoDescription: 'Information about U.S. consular offices in Italy, including addresses, contact details, and the regions they serve.',
    seoKeywords: 'U.S. Consular Offices, Italy, American Citizens, Consular Services, Diplomatic Relations',
    canonicalUrl: 'https://expiter.com/tools/us-consular-offices-italy/',
    hreflangIt: 'https://expiter.com/it/risorse/consolati-stati-uniti-italia/',
    heroImage: 'https://expiter.com/img/tools/us-consulate-italy.webp',
  },
  {
    template: 'pages/static/blog-articles.njk',
    out: 'blog/articles.html',
    pageTitle: 'Latest Articles',
    eyebrow: 'Blog',
    seoTitle: 'Italy Expats and Nomads - Articles',
    seoDescription: 'Expiter Blog - All about living in Italy for expats and nomads',
    seoKeywords: 'italy, italian cities, best city in italy, italy digital nomad, italy expat, italy quality of life, living in italy',
    canonicalUrl: 'https://expiter.com/blog/articles/',
    hreflangIt: 'https://expiter.com/it/blog/articoli/',
    heroImage: 'https://expiter.com/img/expiter-favicon.ico',
    articles: [
      { href: 'https://expiter.com/blog/living-in-perugia/',                  img: 'https://expiter.com/img/blog/living-in-perugia.webp',          title: 'What is it like to live in Perugia?' },
      { href: 'https://expiter.com/blog/living-in-brescia/',                  img: 'https://expiter.com/img/blog/living-in-brescia.webp',          title: 'What is it like to live in Brescia?' },
      { href: 'https://expiter.com/blog/living-in-pescara/',                  img: 'https://expiter.com/img/blog/living-in-pescara.webp',          title: 'What is it like to live in Pescara?' },
      { href: 'https://expiter.com/blog/living-in-verona/',                   img: 'https://expiter.com/img/blog/living-in-verona.webp',           title: 'What is it like to live in Verona?' },
      { href: 'https://expiter.com/blog/living-in-caserta/',                  img: 'https://expiter.com/img/blog/living-in-caserta.webp',          title: 'What is it like to live in Caserta?' },
      { href: 'https://expiter.com/blog/living-in-pisa/',                     img: 'https://expiter.com/img/blog/living-in-pisa.webp',             title: 'What is it like to live in Pisa?' },
      { href: 'https://expiter.com/blog/living-in-caserma-ederle/',           img: 'https://expiter.com/img/blog/caserma-ederle.webp',             title: 'What is it like to live in Caserma Ederle?' },
      { href: 'https://expiter.com/blog/living-in-vicenza/',                  img: 'https://expiter.com/img/blog/life-in-vicenza.webp',            title: 'What is it like to live in Vicenza?' },
      { href: 'https://expiter.com/blog/living-in-siena/',                    img: 'https://expiter.com/img/blog/life-in-siena.webp',              title: 'What is it like to live in Siena?' },
      { href: 'https://expiter.com/blog/living-in-cagliari/',                 img: 'https://expiter.com/img/blog/life-in-cagliari.webp',           title: 'What is it like to live in Cagliari?' },
      { href: 'https://expiter.com/blog/living-in-lucca/',                    img: 'https://expiter.com/img/blog/life-in-lucca.webp',              title: 'What is it like to live in Lucca?' },
      { href: 'https://expiter.com/blog/living-in-livorno/',                  img: 'https://expiter.com/img/blog/life-in-livorno.webp',            title: 'What is it like to live in Livorno?' },
      { href: 'https://expiter.com/blog/living-in-trieste/',                  img: 'https://expiter.com/img/blog/life-in-trieste.webp',            title: 'What is it like to live in Trieste?' },
      { href: 'https://expiter.com/blog/living-in-catania/',                  img: 'https://expiter.com/img/blog/life-in-catania.webp',            title: 'What is it like to live in Catania?' },
      { href: 'https://expiter.com/blog/living-in-padua/',                    img: 'https://expiter.com/img/blog/life-in-padua.webp',              title: 'What is it like to live in Padua?' },
      { href: 'https://expiter.com/blog/living-in-bologna/',                  img: 'https://expiter.com/img/blog/living-in-bologna.webp',          title: 'What is it like to live in Bologna?' },
      { href: 'https://expiter.com/blog/living-in-turin/',                    img: 'https://expiter.com/img/blog/living-in-turin.webp',            title: 'What is it like to live in Turin?' },
      { href: 'https://expiter.com/blog/living-in-reggio-calabria/',          img: 'https://expiter.com/img/blog/living-in-reggio-calabria.webp',  title: 'What is it like to live in Reggio Calabria?' },
      { href: 'https://expiter.com/blog/living-in-palermo/',                  img: 'https://expiter.com/img/blog/life-in-palermo.webp',            title: 'What is it like to live in Palermo?' },
      { href: 'https://expiter.com/blog/living-in-genoa/',                    img: 'https://expiter.com/img/blog/living-in-genoa.webp',            title: 'What is it like to live in Genoa?' },
      { href: 'https://expiter.com/blog/living-in-sigonella/',                img: 'https://expiter.com/img/blog/sigonella.jpg',                   title: 'What is it like to live in Sigonella?' },
      { href: 'https://expiter.com/blog/living-in-venice/',                   img: 'https://expiter.com/img/blog/living-in-venice.webp',           title: 'What is it like to live in Venice?' },
      { href: 'https://expiter.com/blog/living-in-florence/',                 img: 'https://expiter.com/img/blog/living-in-florence.webp',         title: 'What is it like to live in Florence?' },
      { href: 'https://expiter.com/blog/living-in-bari/',                     img: 'https://expiter.com/img/blog/living-in-bari.webp',             title: 'What is it like to live in Bari?' },
      { href: 'https://expiter.com/blog/living-in-naples/',                   img: 'https://expiter.com/img/blog/living-in-naples.webp',           title: 'What is it like to live in Naples?' },
      { href: 'https://expiter.com/blog/living-in-rome/',                     img: 'https://expiter.com/img/blog/living-in-rome.webp',             title: 'What is it like to live in Rome?' },
      { href: 'https://expiter.com/blog/living-in-milan/',                    img: 'https://expiter.com/img/blog/living-in-milan.webp',            title: 'What is it like to live in Milan?' },
      { href: 'https://expiter.com/blog/italy-quality-of-life-2023/',         img: 'https://expiter.com/img/udine.webp',                           title: 'Udine Ranks 1st for Quality of Life in Italy in 2023' },
      { href: 'https://expiter.com/blog/best-cities-for-digital-nomads-in-italy/', img: 'https://expiter.com/img/blog/digital-nomad-italy.webp',   title: 'The Best 10 Places to Live as a Digital Nomad in Italy' },
    ],
  },
  {
    template: 'pages/static/living-in-rome.njk',
    out: 'blog/living-in-rome.html',
    pageTitle: 'What is it like to live in Rome, Italy',
    eyebrow: 'Living in Rome',
    breadcrumbParent: { href: '/blog/articles/', label: 'Blog' },
    seoTitle: 'What is it like to live in Rome, Italy',
    seoDescription: 'Is Rome, Italy a good place to live? A guide for expats. Rome quality of life, cost of living, safety and more.',
    seoKeywords: 'Rome italy, Rome expat, Rome life, Rome digital nomad',
    canonicalUrl: 'https://expiter.com/blog/living-in-rome/',
    hreflangIt: 'https://expiter.com/it/blog/vivere-a-roma/',
    heroImage: 'https://expiter.com/img/blog/living-in-rome.webp',
  },
];

const sidebar = pb.setSideBar();

for (const p of pages) {
  const html = nunjucks.render(p.template, { ...p, sidebar });
  const outPath = path.resolve(p.out);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, html, 'utf8');
  console.log(`${p.out} Saved!`);
}
