#!/usr/bin/env node

import TownGenerator from './generators/townGenerator.js';
import SafetyGenerator from './generators/safetyGenerator.js';
import SitemapGenerator from './generators/sitemapGenerator.js';

const args = process.argv.slice(2);
const concurrency = parseInt(process.env.CONCURRENCY || '5', 10);

const options = {
  concurrency,
  environment: process.env.NODE_ENV || 'production',
};

/**
 * Main entry point for specialized page generation
 */
async function main() {
  const shouldGenerateTowns = !args.includes('--no-towns');
  const shouldGenerateSafety = !args.includes('--no-safety');
  const shouldGenerateSitemaps = !args.includes('--no-sitemaps');

  console.log('🚀 Expiter Specialized Page Generation');
  console.log('═════════════════════════════════════════\n');

  const startTime = Date.now();
  const results = {
    towns: null,
    safety: null,
    sitemaps: null,
  };

  try {
    // Generate town pages
    if (shouldGenerateTowns) {
      console.log('📍 TOWN PAGES GENERATION');
      console.log('────────────────────────\n');
      
      const townGen = new TownGenerator(options);
      results.towns = await townGen.generateAllLanguages();
      townGen.cleanup();
    }

    // Generate safety pages
    if (shouldGenerateSafety) {
      console.log('\n🛡️  SAFETY PAGES GENERATION');
      console.log('────────────────────────\n');
      
      const safetyGen = new SafetyGenerator(options);
      results.safety = await safetyGen.generateAllLanguages();
      safetyGen.cleanup();
    }

    // Generate sitemaps
    if (shouldGenerateSitemaps) {
      console.log('\n🗺️  SITEMAP GENERATION');
      console.log('──────────────────\n');
      
      const sitemapGen = new SitemapGenerator(options);
      results.sitemaps = await sitemapGen.generateAllLanguages();
    }

    // Print summary
    const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
    
    console.log('\n\n📊 GENERATION SUMMARY');
    console.log('═════════════════════════════════════════');

    let totalFiles = 0;

    if (results.towns) {
      const townFiles = Object.values(results.towns.languages || {})
        .reduce((sum, r) => sum + r.successful, 0);
      totalFiles += townFiles;
      console.log(`  🏘️  Town pages:      ${townFiles} files`);
    }

    if (results.safety) {
      const safetyFiles = Object.values(results.safety.languages || {})
        .reduce((sum, r) => sum + r.successful, 0);
      totalFiles += safetyFiles;
      console.log(`  🛡️  Safety pages:    ${safetyFiles} files`);
    }

    if (results.sitemaps) {
      console.log(`  🗺️  Sitemaps:        5 files + 1 index`);
    }

    console.log(`\n  ⏱️  Total time:      ${totalTime}s`);
    console.log(`  📄 Total files:     ${totalFiles + (results.sitemaps ? 6 : 0)}`);

    console.log('\n✅ Specialized generation completed successfully!\n');

  } catch (error) {
    console.error('\n❌ Generation failed:', error.message);
    process.exit(1);
  }
}

main();
