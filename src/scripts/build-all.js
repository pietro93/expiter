/**
 * Master Build Orchestration Script
 * Executes all generators in correct sequence to build complete site
 * 
 * Usage: node src/scripts/build-all.js [--limit=N] [--languages=en,it,de,es,fr] [--skip-towns]
 * 
 * Examples:
 *   node src/scripts/build-all.js                           # Full build, all languages
 *   node src/scripts/build-all.js --limit=100              # Limited test run
 *   node src/scripts/build-all.js --languages=en,it        # Only English & Italian
 *   node src/scripts/build-all.js --skip-towns             # Skip town generation (faster)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import PageGenerator from '../generators/pageGenerator.js';
import TownGenerator from '../generators/townGenerator.js';
import RegionGenerator from '../generators/regionGenerator.js';
import SitemapGenerator from '../generators/sitemapGenerator.js';
import SearchIndexGenerator from '../generators/searchIndexGenerator.js';
import ComparisonGenerator from '../generators/comparisonGenerator.js';
import DataLoader from '../utils/data-loader.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.join(__dirname, '../../..');
const OUTPUT_DIR = path.join(ROOT_DIR, 'output');

// Parse command-line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    limit: null,
    languages: ['en', 'it', 'de', 'es', 'fr'],
    skipTowns: false,
    skipComparisons: false,
    skipSearch: false
  };

  args.forEach(arg => {
    if (arg.startsWith('--limit=')) {
      options.limit = parseInt(arg.split('=')[1]);
    } else if (arg.startsWith('--languages=')) {
      options.languages = arg.split('=')[1].split(',');
    } else if (arg === '--skip-towns') {
      options.skipTowns = true;
    } else if (arg === '--skip-comparisons') {
      options.skipComparisons = true;
    } else if (arg === '--skip-search') {
      options.skipSearch = true;
    }
  });

  return options;
}

// Format bytes for display
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

// Get directory size recursively
function getDirectorySize(dir) {
  let size = 0;
  if (!fs.existsSync(dir)) return 0;

  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const stat = fs.statSync(path.join(dir, file));
    if (stat.isDirectory()) {
      size += getDirectorySize(path.join(dir, file));
    } else {
      size += stat.size;
    }
  });
  return size;
}

// Count files in directory
function countFiles(dir, ext = null) {
  let count = 0;
  if (!fs.existsSync(dir)) return 0;

  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      count += countFiles(filePath, ext);
    } else if (ext === null || file.endsWith(ext)) {
      count++;
    }
  });
  return count;
}

// Main build orchestration
async function buildAll() {
  const options = parseArgs();
  const startTime = Date.now();
  let totalFilesGenerated = 0;
  let totalSize = 0;
  const results = [];

  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║          EXPITER - MASTER BUILD ORCHESTRATION                  ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  console.log('📋 Build Configuration:');
  console.log(`  Languages: ${options.languages.join(', ')}`);
  console.log(`  Limit: ${options.limit || 'none (full)'}`);
  console.log(`  Skip Towns: ${options.skipTowns}`);
  console.log(`  Skip Comparisons: ${options.skipComparisons}`);
  console.log(`  Output Directory: ${OUTPUT_DIR}\n`);

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const dataLoader = new DataLoader();

  try {
    // ========== PHASE 1: LOAD DATA ==========
    console.log('⏳ Phase 1: Loading data...');
    const phaseStartTime = Date.now();

    const provinces = await dataLoader.loadDataset();
    console.log(`✅ Loaded ${provinces.length} provinces`);
    results.push({
      task: 'Data Loading',
      time: Date.now() - phaseStartTime,
      count: provinces.length,
      status: 'success'
    });

    // ========== PHASE 2: PROVINCE PAGES ==========
    console.log('\n⏳ Phase 2: Generating province pages...');
    const pageGenStartTime = Date.now();

    try {
      const pageGen = new PageGenerator();
      const pageResult = await pageGen.generateAllLanguages(options.languages);
      const pageTime = Date.now() - pageGenStartTime;
      
      // Extract total files generated from result
      const pageCount = pageResult.summary?.totalFiles || 0;
      totalFilesGenerated += pageCount;

      console.log(`✅ Generated ${pageCount} province pages in ${(pageTime / 1000).toFixed(2)}s`);
      results.push({
        task: 'Province Pages',
        time: pageTime,
        count: pageCount,
        status: 'success'
      });
    } catch (error) {
      const pageTime = Date.now() - pageGenStartTime;
      console.warn(`⚠️  Province generation encountered issues: ${error.message}`);
      results.push({
        task: 'Province Pages',
        time: pageTime,
        count: 0,
        status: 'warning',
        error: error.message
      });
    }

    // ========== PHASE 3: REGION PAGES ==========
    console.log('\n⏳ Phase 3: Generating region pages...');
    const regionGenStartTime = Date.now();

    const regionGen = new RegionGenerator();
    const regionCount = await regionGen.generateAll(options.languages);
    const regionTime = Date.now() - regionGenStartTime;
    totalFilesGenerated += regionCount;

    console.log(`✅ Generated ${regionCount} region pages in ${(regionTime / 1000).toFixed(2)}s`);
    results.push({
      task: 'Region Pages',
      time: regionTime,
      count: regionCount,
      status: 'success'
    });

    // ========== PHASE 4: TOWN/COMUNE PAGES ==========
    if (!options.skipTowns) {
      console.log('\n⏳ Phase 4: Generating town/comune pages...');
      const townGenStartTime = Date.now();

      try {
        const townGen = new TownGenerator();
        const townCount = await townGen.generateAll(options.languages, options.limit);
        const townTime = Date.now() - townGenStartTime;
        totalFilesGenerated += townCount;

        console.log(`✅ Generated ${townCount} town pages in ${(townTime / 1000).toFixed(2)}s`);
        results.push({
          task: 'Town Pages',
          time: townTime,
          count: townCount,
          status: 'success'
        });
      } catch (error) {
        console.warn(`⚠️  Town generation encountered issues: ${error.message}`);
        results.push({
          task: 'Town Pages',
          time: Date.now() - townGenStartTime,
          count: 0,
          status: 'warning',
          error: error.message
        });
      }
    } else {
      console.log('\n⏭️  Skipped town generation (--skip-towns flag)');
    }

    // ========== PHASE 5: COMPARISON PAGES ==========
    if (!options.skipComparisons) {
      console.log('\n⏳ Phase 5: Generating comparison pages...');
      const compGenStartTime = Date.now();

      try {
        const compGen = new ComparisonGenerator();
        const compCount = await compGen.generateAll(options.languages);
        const compTime = Date.now() - compGenStartTime;
        totalFilesGenerated += compCount;

        console.log(`✅ Generated ${compCount} comparison pages in ${(compTime / 1000).toFixed(2)}s`);
        results.push({
          task: 'Comparison Pages',
          time: compTime,
          count: compCount,
          status: 'success'
        });
      } catch (error) {
        console.warn(`⚠️  Comparison generation encountered issues: ${error.message}`);
        results.push({
          task: 'Comparison Pages',
          time: Date.now() - compGenStartTime,
          count: 0,
          status: 'warning',
          error: error.message
        });
      }
    } else {
      console.log('\n⏭️  Skipped comparison generation (--skip-comparisons flag)');
    }

    // ========== PHASE 6: SEARCH INDEX ==========
    if (!options.skipSearch) {
      console.log('\n⏳ Phase 6: Generating search indices...');
      const searchGenStartTime = Date.now();

      try {
        const searchGen = new SearchIndexGenerator();
        const searchCount = await searchGen.generateAll(options.languages);
        const searchTime = Date.now() - searchGenStartTime;
        totalFilesGenerated += searchCount;

        console.log(`✅ Generated ${searchCount} search index files in ${(searchTime / 1000).toFixed(2)}s`);
        results.push({
          task: 'Search Indices',
          time: searchTime,
          count: searchCount,
          status: 'success'
        });
      } catch (error) {
        console.warn(`⚠️  Search index generation encountered issues: ${error.message}`);
        results.push({
          task: 'Search Indices',
          time: Date.now() - searchGenStartTime,
          count: 0,
          status: 'warning',
          error: error.message
        });
      }
    } else {
      console.log('\n⏭️  Skipped search index generation (--skip-search flag)');
    }

    // ========== PHASE 7: SITEMAPS ==========
    console.log('\n⏳ Phase 7: Generating sitemaps...');
    const sitemapGenStartTime = Date.now();

    const sitemapGen = new SitemapGenerator();
    const sitemapCount = await sitemapGen.generateAll(options.languages);
    const sitemapTime = Date.now() - sitemapGenStartTime;
    totalFilesGenerated += sitemapCount;

    console.log(`✅ Generated ${sitemapCount} sitemap files in ${(sitemapTime / 1000).toFixed(2)}s`);
    results.push({
      task: 'Sitemaps',
      time: sitemapTime,
      count: sitemapCount,
      status: 'success'
    });

    // ========== SUMMARY ==========
    const totalTime = Date.now() - startTime;
    const htmlFiles = countFiles(OUTPUT_DIR, '.html');
    const xmlFiles = countFiles(OUTPUT_DIR, '.xml');
    const jsonFiles = countFiles(OUTPUT_DIR, '.json');
    const totalBytes = getDirectorySize(OUTPUT_DIR);

    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║                      BUILD COMPLETE ✅                          ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    console.log('📊 Build Summary:');
    console.log(`  Total Files Generated: ${totalFilesGenerated}`);
    console.log(`  HTML Files: ${htmlFiles}`);
    console.log(`  XML Files: ${xmlFiles}`);
    console.log(`  JSON Files: ${jsonFiles}`);
    console.log(`  Total Size: ${formatBytes(totalBytes)}`);
    console.log(`  Total Time: ${(totalTime / 1000).toFixed(2)}s`);
    console.log(`  Avg Time/File: ${(totalTime / totalFilesGenerated).toFixed(2)}ms\n`);

    console.log('📈 Breakdown by Phase:');
    results.forEach((result, i) => {
      const statusIcon = result.status === 'success' ? '✅' : result.status === 'warning' ? '⚠️' : '❌';
      console.log(
        `  ${i + 1}. ${statusIcon} ${result.task.padEnd(20)} ${result.count.toString().padStart(5)} files | ${(result.time / 1000).toFixed(2).padStart(6)}s`
      );
      if (result.error) {
        console.log(`     Error: ${result.error}`);
      }
    });

    console.log(`\n✨ Output directory: ${OUTPUT_DIR}`);
    console.log('🚀 Ready for deployment!\n');

    // Create build summary file
    const buildSummary = {
      timestamp: new Date().toISOString(),
      duration: totalTime / 1000,
      totalFiles: totalFilesGenerated,
      htmlFiles,
      xmlFiles,
      jsonFiles,
      totalSize: totalBytes,
      languages: options.languages,
      configuration: {
        limit: options.limit,
        skipTowns: options.skipTowns,
        skipComparisons: options.skipComparisons,
        skipSearch: options.skipSearch
      },
      phases: results
    };

    const summaryPath = path.join(OUTPUT_DIR, 'build-summary.json');
    fs.writeFileSync(summaryPath, JSON.stringify(buildSummary, null, 2));
    console.log(`📝 Build summary saved to: build-summary.json`);

  } catch (error) {
    console.error('\n❌ Build failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run build
buildAll();
