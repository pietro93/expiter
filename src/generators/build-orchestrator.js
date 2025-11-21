import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import PageGenerator from './page-generator.js';
import RegionGenerator from './region-generator.js';
import TownGenerator from './town-generator.js';
import SafetyPageGenerator from './safety-page-generator.js';
import SitemapGenerator from './sitemap-generator.js';
import SearchIndexGenerator from './search-index-generator.js';
import ComparisonGenerator from './comparison-generator.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '../../');
const OUTPUT_DIR = path.resolve(ROOT_DIR, 'output');

class BuildOrchestrator {
  constructor(options = {}) {
    this.options = {
      languages: options.languages || ['en', 'it', 'de', 'es', 'fr'],
      skipTowns: options.skipTowns || false,
      skipPages: options.skipPages || false,
      skipRegions: options.skipRegions || false,
      skipSafety: options.skipSafety || false,
      skipSearch: options.skipSearch || false,
      skipComparisons: options.skipComparisons || false,
      skipSitemaps: options.skipSitemaps || false,
      townLimit: options.townLimit || null, // null = all, or number for testing
      verbose: options.verbose !== false,
      ...options
    };
    
    this.results = {
      start: new Date(),
      phases: {}
    };
  }

  log(message, level = 'info') {
    if (this.options.verbose) {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`);
    }
  }

  logPhaseStart(phase, description) {
    this.log(`\n${'='.repeat(60)}`, 'info');
    this.log(`START: ${phase}`, 'info');
    this.log(`${description}`, 'info');
    this.log(`${'='.repeat(60)}`, 'info');
    this.results.phases[phase] = {
      start: new Date(),
      status: 'in-progress'
    };
  }

  logPhaseEnd(phase, result) {
    const duration = new Date() - this.results.phases[phase].start;
    this.results.phases[phase].end = new Date();
    this.results.phases[phase].duration = duration;
    this.results.phases[phase].status = 'completed';
    this.results.phases[phase].result = result;
    this.log(`COMPLETED: ${phase} (${(duration / 1000).toFixed(2)}s)`, 'success');
  }

  async ensureOutputDirectory() {
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
      this.log(`Created output directory: ${OUTPUT_DIR}`, 'info');
    }
  }

  async generateProvincePages() {
    if (this.options.skipPages) {
      this.log('Skipping province pages (skipPages=true)', 'info');
      return { skipped: true };
    }

    this.logPhaseStart(
      'Phase 1: Province Pages',
      'Generating pages for all 128 provinces in 5 languages'
    );

    try {
      const generator = new PageGenerator({
        outputDir: OUTPUT_DIR,
        languages: this.options.languages
      });

      const result = await generator.generateAll();
      this.logPhaseEnd('Phase 1: Province Pages', result);
      return result;
    } catch (error) {
      this.log(`Error in phase 1: ${error.message}`, 'error');
      this.results.phases['Phase 1: Province Pages'].error = error.message;
      throw error;
    }
  }

  async generateRegionPages() {
    if (this.options.skipRegions) {
      this.log('Skipping region pages (skipRegions=true)', 'info');
      return { skipped: true };
    }

    this.logPhaseStart(
      'Phase 2: Region Pages',
      'Generating pages for all 20 regions in 5 languages'
    );

    try {
      const generator = new RegionGenerator({
        outputDir: OUTPUT_DIR,
        languages: this.options.languages
      });

      const result = await generator.generateAll();
      this.logPhaseEnd('Phase 2: Region Pages', result);
      return result;
    } catch (error) {
      this.log(`Error in phase 2: ${error.message}`, 'error');
      this.results.phases['Phase 2: Region Pages'].error = error.message;
      throw error;
    }
  }

  async generateTownPages() {
    if (this.options.skipTowns) {
      this.log('Skipping town pages (skipTowns=true)', 'info');
      return { skipped: true };
    }

    this.logPhaseStart(
      'Phase 3: Town/Comune Pages',
      `Generating pages for all Italian towns (${this.options.townLimit ? `limit: ${this.options.townLimit}` : 'all 7,904'})`
    );

    try {
      const generator = new TownGenerator({
        outputDir: OUTPUT_DIR,
        languages: this.options.languages,
        limit: this.options.townLimit
      });

      const result = await generator.generateAll();
      this.logPhaseEnd('Phase 3: Town/Comune Pages', result);
      return result;
    } catch (error) {
      this.log(`Error in phase 3: ${error.message}`, 'error');
      this.results.phases['Phase 3: Town/Comune Pages'].error = error.message;
      throw error;
    }
  }

  async generateSafetyPages() {
    if (this.options.skipSafety) {
      this.log('Skipping safety pages (skipSafety=true)', 'info');
      return { skipped: true };
    }

    this.logPhaseStart(
      'Phase 4: Safety & Specialized Pages',
      'Generating safety ratings and specialized pages'
    );

    try {
      const generator = new SafetyPageGenerator({
        outputDir: OUTPUT_DIR,
        languages: this.options.languages
      });

      const result = await generator.generateAll();
      this.logPhaseEnd('Phase 4: Safety & Specialized Pages', result);
      return result;
    } catch (error) {
      this.log(`Error in phase 4: ${error.message}`, 'error');
      this.results.phases['Phase 4: Safety & Specialized Pages'].error = error.message;
      throw error;
    }
  }

  async generateSearchIndex() {
    if (this.options.skipSearch) {
      this.log('Skipping search index (skipSearch=true)', 'info');
      return { skipped: true };
    }

    this.logPhaseStart(
      'Phase 5: Search Index',
      'Generating search indexes for all languages'
    );

    try {
      const generator = new SearchIndexGenerator({
        outputDir: OUTPUT_DIR,
        languages: this.options.languages
      });

      const result = await generator.generateAll();
      this.logPhaseEnd('Phase 5: Search Index', result);
      return result;
    } catch (error) {
      this.log(`Error in phase 5: ${error.message}`, 'error');
      this.results.phases['Phase 5: Search Index'].error = error.message;
      throw error;
    }
  }

  async generateComparisons() {
    if (this.options.skipComparisons) {
      this.log('Skipping comparison pages (skipComparisons=true)', 'info');
      return { skipped: true };
    }

    this.logPhaseStart(
      'Phase 6: Comparison Pages',
      'Generating pre-built province comparison pages'
    );

    try {
      const generator = new ComparisonGenerator({
        outputDir: OUTPUT_DIR,
        languages: this.options.languages
      });

      const result = await generator.generateAll();
      this.logPhaseEnd('Phase 6: Comparison Pages', result);
      return result;
    } catch (error) {
      this.log(`Error in phase 6: ${error.message}`, 'error');
      this.results.phases['Phase 6: Comparison Pages'].error = error.message;
      throw error;
    }
  }

  async generateSitemaps() {
    if (this.options.skipSitemaps) {
      this.log('Skipping sitemaps (skipSitemaps=true)', 'info');
      return { skipped: true };
    }

    this.logPhaseStart(
      'Phase 7: XML Sitemaps',
      'Generating XML sitemaps with proper priorities and change frequencies'
    );

    try {
      const generator = new SitemapGenerator({
        outputDir: OUTPUT_DIR,
        languages: this.options.languages
      });

      const result = await generator.generateAll();
      this.logPhaseEnd('Phase 7: XML Sitemaps', result);
      return result;
    } catch (error) {
      this.log(`Error in phase 7: ${error.message}`, 'error');
      this.results.phases['Phase 7: XML Sitemaps'].error = error.message;
      throw error;
    }
  }

  async build() {
    try {
      await this.ensureOutputDirectory();
      
      this.log('Starting full site build orchestration', 'info');
      this.log(`Output directory: ${OUTPUT_DIR}`, 'info');
      this.log(`Languages: ${this.options.languages.join(', ')}`, 'info');
      this.log(`Options: ${JSON.stringify(this.options)}`, 'info');

      // Execute phases in sequence
      await this.generateProvincePages();
      await this.generateRegionPages();
      await this.generateTownPages();
      await this.generateSafetyPages();
      await this.generateSearchIndex();
      await this.generateComparisons();
      await this.generateSitemaps();

      this.results.end = new Date();
      this.results.totalDuration = this.results.end - this.results.start;
      this.results.status = 'success';

      return this.generateBuildReport();
    } catch (error) {
      this.results.end = new Date();
      this.results.totalDuration = this.results.end - this.results.start;
      this.results.status = 'failed';
      this.results.error = error.message;
      
      this.log(`\nBuild failed: ${error.message}`, 'error');
      return this.generateBuildReport();
    }
  }

  generateBuildReport() {
    const report = {
      title: 'Full Site Build Report',
      timestamp: new Date().toISOString(),
      status: this.results.status,
      duration: {
        total: `${(this.results.totalDuration / 1000).toFixed(2)}s`,
        phases: {}
      },
      summary: {
        totalPhases: Object.keys(this.results.phases).length,
        completedPhases: Object.values(this.results.phases).filter(p => p.status === 'completed').length,
        skippedPhases: Object.values(this.results.phases).filter(p => p.skipped).length,
        failedPhases: Object.values(this.results.phases).filter(p => p.error).length
      },
      phases: this.results.phases
    };

    // Add phase durations
    for (const [phase, data] of Object.entries(this.results.phases)) {
      if (data.duration) {
        report.duration.phases[phase] = `${(data.duration / 1000).toFixed(2)}s`;
      }
    }

    return report;
  }

  printBuildReport(report) {
    console.log('\n' + '='.repeat(70));
    console.log('FULL SITE BUILD REPORT');
    console.log('='.repeat(70));
    console.log(`Status: ${report.status.toUpperCase()}`);
    console.log(`Total Duration: ${report.duration.total}`);
    console.log(`Timestamp: ${report.timestamp}`);
    console.log('\nSummary:');
    console.log(`  Total Phases: ${report.summary.totalPhases}`);
    console.log(`  Completed: ${report.summary.completedPhases}`);
    console.log(`  Skipped: ${report.summary.skippedPhases}`);
    console.log(`  Failed: ${report.summary.failedPhases}`);
    console.log('\nPhase Breakdown:');
    
    for (const [phase, data] of Object.entries(report.phases)) {
      const duration = report.duration.phases[phase] || 'N/A';
      const status = data.skipped ? '⏭️  SKIPPED' : (data.error ? '❌ FAILED' : '✅ COMPLETED');
      console.log(`  ${phase}`);
      console.log(`    Status: ${status}`);
      console.log(`    Duration: ${duration}`);
      if (data.result && data.result.filesGenerated) {
        console.log(`    Files: ${data.result.filesGenerated}`);
      }
      if (data.error) {
        console.log(`    Error: ${data.error}`);
      }
    }
    
    console.log('\n' + '='.repeat(70));
  }

  saveReportToFile(report) {
    const reportPath = path.join(OUTPUT_DIR, 'BUILD_REPORT.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
    this.log(`Build report saved to: ${reportPath}`, 'info');
    return reportPath;
  }
}

export default BuildOrchestrator;
