/**
 * Expiter Migration - Main Entry Point
 * 
 * Usage:
 *   node src/index.js [languages...]
 *   node src/index.js en           - Generate English pages only
 *   node src/index.js en it        - Generate English and Italian pages
 *   node src/index.js              - Generate all languages (en, it, de, es, fr)
 */

import PageGenerator from './generators/pageGenerator.js';
import IndexGenerator from './generators/indexGenerator.js';
import RegionGenerator from './generators/regionGenerator.js';

/**
 * Parse command line arguments
 * @returns {object} Parsed arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const config = {
    languages: ['en', 'it', 'de', 'es', 'fr'],
    skipPages: false,
    skipIndex: false,
  };

  if (args.length === 0) {
    return config;
  }

  // Filter out flag arguments
  const languageArgs = args.filter(arg => !arg.startsWith('--'));
  const flags = args.filter(arg => arg.startsWith('--'));

  if (languageArgs.length > 0) {
    config.languages = languageArgs;
  }

  if (flags.includes('--pages-only')) config.skipIndex = true;
  if (flags.includes('--index-only')) config.skipPages = true;

  return config;
}

/**
 * Main function
 */
async function main() {
  try {
    const config = parseArgs();

    console.log(`\n🌍 Expiter Migration - Static Site Generator`);
    console.log(`   Languages: ${config.languages.join(', ')}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'production'}`);
    console.log(`   Options: ${config.skipPages ? 'index-only' : config.skipIndex ? 'pages-only' : 'all'}`);

    // Generate province pages
    if (!config.skipPages) {
      console.log(`\n📄 Generating province pages...`);
      const pageGenerator = new PageGenerator({
        environment: process.env.NODE_ENV || 'production',
        concurrency: parseInt(process.env.CONCURRENCY || '5', 10),
      });

      if (config.languages.length === 1) {
        const stats = await pageGenerator.generateProvincePages(config.languages[0]);
        console.log(`✅ Pages complete for ${config.languages[0]}: ${stats.successful}/${stats.total}`);
        if (stats.failed > 0) {
          console.warn(`⚠️  ${stats.failed} files failed`);
        }
      } else {
        const results = await pageGenerator.generateAllLanguages(config.languages);
        console.log(`✅ All province pages generated`);
      }
    }

    // Generate index pages
    if (!config.skipIndex) {
      console.log(`\n🏠 Generating index pages...`);
      const indexGenerator = new IndexGenerator();
      await indexGenerator.initialize();
      await indexGenerator.generateAllLanguages(config.languages);
      const stats = indexGenerator.getStatistics();
      console.log(`✅ Index pages complete: ${stats.filesGenerated} files`);
      await indexGenerator.cleanup();
    }

    // Generate region pages
    if (!config.skipIndex) {
      console.log(`\n🗺️  Generating region pages...`);
      const regionGenerator = new RegionGenerator({
        concurrency: parseInt(process.env.CONCURRENCY || '5', 10),
      });
      await regionGenerator.initialize();
      await regionGenerator.generateAllLanguages(config.languages);
      const stats = regionGenerator.getStatistics();
      console.log(`✅ Region pages complete: ${stats.filesGenerated} files`);
      await regionGenerator.cleanup();
    }

    console.log(`\n✨ Generation complete!`);
    process.exit(0);
  } catch (error) {
    console.error(`\n❌ Generation failed:`);
    console.error(error);
    process.exit(1);
  }
}

// Run main
main();
