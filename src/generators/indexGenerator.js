import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import nunjucks from 'nunjucks';
import i18next from 'i18next';
import DataLoader from '../utils/data-loader.js';
import ProvinceFormatter from '../utils/formatter.js';
import SEOBuilder from '../utils/seo-builder.js';
import { setupNunjucks } from '../config/template-engine.js';
import { setupI18n } from '../config/i18n-config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

class IndexGenerator {
  constructor() {
    this.nunjucksEnv = null;
    this.dataLoader = null;
    this.formatter = ProvinceFormatter;
    this.seoBuilder = new SEOBuilder();
    this.stats = {
      filesGenerated: 0,
      totalSize: 0,
      languages: {},
      startTime: null,
      endTime: null,
    };
  }

  async initialize() {
    console.log('Initializing IndexGenerator...');

    // Setup Nunjucks
    const templatesDir = path.join(__dirname, '../templates');
    this.nunjucksEnv = setupNunjucks(templatesDir);

    // Setup i18n
    await setupI18n();

    // Initialize DataLoader
    this.dataLoader = new DataLoader();
    const dataset = await this.dataLoader.loadDataset();
    console.log(`✓ Loaded ${dataset.length} provinces`);
  }

  async ensureOutputDirectories(language) {
    const outDir = path.join(__dirname, '../../output', language);
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }
  }

  async generateIndexPage(language, outputPath) {
    try {
      // Load dataset
      const dataset = await this.dataLoader.loadDataset();
      const provinces = dataset.filter(p => p.Name && !p.Name.includes('AVG'));

      // Group provinces by region
      const regions = [...new Set(provinces.map(p => p.Region).filter(Boolean))].sort();
      const regionProvinceCount = {};
      regions.forEach(region => {
        regionProvinceCount[region] = provinces.filter(p => p.Region === region).length;
      });

      // Setup i18n to specific language
      await i18next.changeLanguage(language);

      // Prepare context
      const context = {
        language,
        provinces,
        regions,
        regionsList: regions,
        regionProvinceCount,
        t: (key) => i18next.t(key),
        title: `Explore Italian Provinces | Expiter`,
        description: `Discover quality of life, cost of living, and lifestyle insights for every Italian province`,
        url: `https://expiter.com/${language}/`,
        seo: this.seoBuilder.buildHomepage(language),
      };

      // Render template
      const html = this.nunjucksEnv.render('layouts/index.njk', context);

      // Write file
      fs.writeFileSync(outputPath, html, 'utf-8');

      const fileSize = Buffer.byteLength(html, 'utf-8');
      this.stats.filesGenerated++;
      this.stats.totalSize += fileSize;

      if (!this.stats.languages[language]) {
        this.stats.languages[language] = { files: 0, size: 0 };
      }
      this.stats.languages[language].files++;
      this.stats.languages[language].size += fileSize;

      return {
        success: true,
        file: path.basename(outputPath),
        size: fileSize,
      };
    } catch (error) {
      console.error(`✗ Error generating index for ${language}:`, error.message);
      return {
        success: false,
        language,
        error: error.message,
      };
    }
  }

  async generateAllLanguages(languages = ['en', 'it', 'de', 'es', 'fr']) {
    this.stats.startTime = Date.now();
    console.log(`\n📄 Generating index pages for ${languages.length} languages...\n`);

    const results = [];

    for (const language of languages) {
      console.log(`  Generating ${language.toUpperCase()} index...`);
      await this.ensureOutputDirectories(language);
      const outputPath = path.join(__dirname, `../../output/${language}/index.html`);
      const result = await this.generateIndexPage(language, outputPath);
      results.push(result);
    }

    this.stats.endTime = Date.now();
    const duration = (this.stats.endTime - this.stats.startTime) / 1000;

    console.log(`\n✓ Index generation complete!`);
    console.log(`  Files: ${this.stats.filesGenerated}`);
    console.log(`  Total size: ${this.formatBytes(this.stats.totalSize)}`);
    console.log(`  Time: ${duration.toFixed(2)}s`);

    return results;
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  getStatistics() {
    return {
      ...this.stats,
      totalSizeFormatted: this.formatBytes(this.stats.totalSize),
      duration: this.stats.endTime ? `${((this.stats.endTime - this.stats.startTime) / 1000).toFixed(2)}s` : null,
    };
  }

  async cleanup() {
    if (this.dataLoader) {
      this.dataLoader.clearCache();
    }
  }
}

export default IndexGenerator;
