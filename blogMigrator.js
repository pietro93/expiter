import fs from 'fs';
import path from 'path';
import { nunjucks } from './js/nunjucksEnv.js';
import * as pb from './js/pageBuilder.js';

const sidebar = pb.setSideBar();

// Blog posts to migrate: [inputFile, outputFile, canonicalUrl, hreflangIt, breadcrumb eyebrow]
const posts = [
  ['blog/living-in-bari.html',                     'blog/living-in-bari.html',                     'https://expiter.com/blog/living-in-bari/',                      'https://expiter.com/it/blog/vivere-a-bari/'],
  ['blog/living-in-bologna.html',                  'blog/living-in-bologna.html',                  'https://expiter.com/blog/living-in-bologna/',                   'https://expiter.com/it/blog/vivere-a-bologna/'],
  ['blog/living-in-brescia.html',                  'blog/living-in-brescia.html',                  'https://expiter.com/blog/living-in-brescia/',                   'https://expiter.com/it/blog/vivere-a-brescia/'],
  ['blog/living-in-cagliari.html',                 'blog/living-in-cagliari.html',                 'https://expiter.com/blog/living-in-cagliari/',                  'https://expiter.com/it/blog/vivere-a-cagliari/'],
  ['blog/living-in-caserma-ederle.html',           'blog/living-in-caserma-ederle.html',           'https://expiter.com/blog/living-in-caserma-ederle/',            'https://expiter.com/it/blog/vivere-a-caserma-ederle/'],
  ['blog/living-in-caserta.html',                  'blog/living-in-caserta.html',                  'https://expiter.com/blog/living-in-caserta/',                   'https://expiter.com/it/blog/vivere-a-caserta/'],
  ['blog/living-in-catania.html',                  'blog/living-in-catania.html',                  'https://expiter.com/blog/living-in-catania/',                   'https://expiter.com/it/blog/vivere-a-catania/'],
  ['blog/living-in-florence.html',                 'blog/living-in-florence.html',                 'https://expiter.com/blog/living-in-florence/',                  'https://expiter.com/it/blog/vivere-a-firenze/'],
  ['blog/living-in-genoa.html',                    'blog/living-in-genoa.html',                    'https://expiter.com/blog/living-in-genoa/',                     'https://expiter.com/it/blog/vivere-a-genova/'],
  ['blog/living-in-livorno.html',                  'blog/living-in-livorno.html',                  'https://expiter.com/blog/living-in-livorno/',                   'https://expiter.com/it/blog/vivere-a-livorno/'],
  ['blog/living-in-lucca.html',                    'blog/living-in-lucca.html',                    'https://expiter.com/blog/living-in-lucca/',                     'https://expiter.com/it/blog/vivere-a-lucca/'],
  ['blog/living-in-milan.html',                    'blog/living-in-milan.html',                    'https://expiter.com/blog/living-in-milan/',                     'https://expiter.com/it/blog/vivere-a-milano/'],
  ['blog/living-in-naples.html',                   'blog/living-in-naples.html',                   'https://expiter.com/blog/living-in-naples/',                    'https://expiter.com/it/blog/vivere-a-napoli/'],
  ['blog/living-in-padua.html',                    'blog/living-in-padua.html',                    'https://expiter.com/blog/living-in-padua/',                     'https://expiter.com/it/blog/vivere-a-padova/'],
  ['blog/living-in-palermo.html',                  'blog/living-in-palermo.html',                  'https://expiter.com/blog/living-in-palermo/',                   'https://expiter.com/it/blog/vivere-a-palermo/'],
  ['blog/living-in-perugia.html',                  'blog/living-in-perugia.html',                  'https://expiter.com/blog/living-in-perugia/',                   'https://expiter.com/it/blog/vivere-a-perugia/'],
  ['blog/living-in-pescara.html',                  'blog/living-in-pescara.html',                  'https://expiter.com/blog/living-in-pescara/',                   'https://expiter.com/it/blog/vivere-a-pescara/'],
  ['blog/living-in-pisa.html',                     'blog/living-in-pisa.html',                     'https://expiter.com/blog/living-in-pisa/',                      'https://expiter.com/it/blog/vivere-a-pisa/'],
  ['blog/living-in-reggio-calabria.html',          'blog/living-in-reggio-calabria.html',          'https://expiter.com/blog/living-in-reggio-calabria/',           'https://expiter.com/it/blog/vivere-a-reggio-calabria/'],
  ['blog/living-in-siena.html',                    'blog/living-in-siena.html',                    'https://expiter.com/blog/living-in-siena/',                     'https://expiter.com/it/blog/vivere-a-siena/'],
  ['blog/living-in-sigonella.html',                'blog/living-in-sigonella.html',                'https://expiter.com/blog/living-in-sigonella/',                 'https://expiter.com/it/blog/vivere-a-sigonella/'],
  ['blog/living-in-trieste.html',                  'blog/living-in-trieste.html',                  'https://expiter.com/blog/living-in-trieste/',                   'https://expiter.com/it/blog/vivere-a-trieste/'],
  ['blog/living-in-turin.html',                    'blog/living-in-turin.html',                    'https://expiter.com/blog/living-in-turin/',                     'https://expiter.com/it/blog/vivere-a-torino/'],
  ['blog/living-in-venice.html',                   'blog/living-in-venice.html',                   'https://expiter.com/blog/living-in-venice/',                    'https://expiter.com/it/blog/vivere-a-venezia/'],
  ['blog/living-in-verona.html',                   'blog/living-in-verona.html',                   'https://expiter.com/blog/living-in-verona/',                    'https://expiter.com/it/blog/vivere-a-verona/'],
  ['blog/living-in-vicenza.html',                  'blog/living-in-vicenza.html',                  'https://expiter.com/blog/living-in-vicenza/',                   'https://expiter.com/it/blog/vivere-a-vicenza/'],
  ['blog/italy-quality-of-life-2023.html',         'blog/italy-quality-of-life-2023.html',         'https://expiter.com/blog/italy-quality-of-life-2023/',          'https://expiter.com/it/blog/qualita-vita-italia-2023/'],
  ['blog/best-cities-for-digital-nomads-in-italy.html', 'blog/best-cities-for-digital-nomads-in-italy.html', 'https://expiter.com/blog/best-cities-for-digital-nomads-in-italy/', 'https://expiter.com/it/blog/migliori-citta-nomadi-digitali-italia/'],
];

function renderPost(vars) {
  return nunjucks.renderString(
    `{% extends "layouts/simple-page.njk" %}{% block content %}{{ bodyContent | safe }}{% endblock %}`,
    vars
  );
}

function extractMeta(html, name) {
  const re = new RegExp(`<meta[^>]+(?:name|property)=["']${name}["'][^>]+content=["']([^"']*)["']`, 'i');
  const re2 = new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+(?:name|property)=["']${name}["']`, 'i');
  const m = html.match(re) || html.match(re2);
  return m ? m[1] : '';
}

function extractTitle(html) {
  const m = html.match(/<title>([^<]*)<\/title>/i);
  return m ? m[1] : '';
}

function extractBody(html) {
  // Extract hero background-image style from <div class="hero" style="...">
  let heroHtml = '';
  const heroMatch = html.match(/<div[^>]+class="hero"[^>]+style="([^"]*)"[^>]*>/i);
  if (heroMatch) {
    heroHtml = `<figure class="province-hero" style="${heroMatch[1]}" aria-hidden="true"></figure>\n`;
  }

  // Get everything between </nav> (end of the legacy navbar) and the last </aside>
  // The structure is: <aside>..</aside> <toc> <nav#navbar>...</nav> <hero> <h1> <div#info...> <aside class="mobileonly">
  // We want: everything after </nav> up to (but not including) the last <aside class="...mobileonly...">

  // Strip the opening <html>, <head>...</head>, <body ...>
  let body = html.replace(/^[\s\S]*?<body[^>]*>/i, '').replace(/<\/body>[\s\S]*$/i, '');

  // Remove leading desktop <aside ...> block (sidebar)
  body = body.replace(/^[\s\S]*?<\/aside>/i, '');

  // Remove TOC div
  body = body.replace(/<div[^>]+class="toc[^"]*"[\s\S]*?<\/div>/gi, '');

  // Remove the legacy navbar block
  body = body.replace(/<nav[^>]+id="navbar"[\s\S]*?<\/nav>/i, '');

  // Remove Viator widget script
  body = body.replace(/<script[^>]+viator\.com[\s\S]*?<\/script>/gi, '');

  // Remove hero div (we replaced it above)
  body = body.replace(/<div[^>]+class="hero"[^>]*>[\s\S]*?<\/div>/i, '');

  // Remove h1#title (base.njk renders from pageTitle)
  body = body.replace(/<h1[^>]+id="title"[^>]*>[\s\S]*?<\/h1>/i, '');

  // Remove trailing mobile-only aside
  body = body.replace(/<aside[^>]+class="[^"]*mobileonly[^"]*"[\s\S]*?<\/aside>/i, '');

  // Remove scorecard tabs block (legacy .tabs.effect-3) if present
  body = body.replace(/<div[^>]+class="tabs[^"]*"[\s\S]*?<\/div>\s*<\/div>/i, '');

  // Remove leftover data-vi- Viator widget divs
  body = body.replace(/<div[^>]+data-vi-partner-id[^>]*>[\s\S]*?<\/div>/gi, '');

  // Strip orphaned closing </div> tags left behind by removed legacy containers
  body = body.replace(/^(\s*<\/div>\s*)+/, '');

  body = body.trim();

  return heroHtml + body;
}

let ok = 0;
let fail = 0;

for (const [inFile, outFile, canonicalUrl, hreflangIt] of posts) {
  const inPath = path.resolve(inFile);
  if (!fs.existsSync(inPath)) {
    console.warn(`SKIP (not found): ${inFile}`);
    continue;
  }

  const raw = fs.readFileSync(inPath, 'utf8');

  const seoTitle = extractTitle(raw) || extractMeta(raw, 'og:title');
  const seoDescription = extractMeta(raw, 'description') || extractMeta(raw, 'og:description');
  const seoKeywords = extractMeta(raw, 'keywords');
  const heroImage = extractMeta(raw, 'og:image');

  // Derive eyebrow from title
  const eyebrow = seoTitle
    .replace(/^What is it like to live in /i, 'Living in ')
    .replace(/, Italy.*$/i, '');

  const bodyContent = extractBody(raw);

  try {
    const html = renderPost({
      pageTitle: seoTitle,
      eyebrow,
      breadcrumbParent: { href: '/blog/articles/', label: 'Blog' },
      seoTitle,
      seoDescription,
      seoKeywords,
      canonicalUrl,
      hreflangIt,
      heroImage,
      sidebar,
      bodyContent,
    });

    const outPath = path.resolve(outFile);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, html, 'utf8');
    console.log(`✓ ${outFile}`);
    ok++;
  } catch (err) {
    console.error(`✗ ${outFile}: ${err.message}`);
    fail++;
  }
}

console.log(`\nDone: ${ok} migrated, ${fail} failed.`);
