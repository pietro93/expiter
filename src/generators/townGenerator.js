import fs from 'fs';
import path from 'path';
import pLimit from 'p-limit';
import nunjucks from 'nunjucks';
import { setupNunjucks } from '../config/template-engine.js';
import { setupI18n } from '../config/i18n-config.js';
import DataLoader from '../utils/data-loader.js';
import SEOBuilder from '../utils/seo-builder.js';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * TownGenerator - Generates static HTML town/comune pages using Nunjucks templates
 * 
 * Features:
 * - Parallel processing with configurable concurrency
 * - Multi-language support (en, it, de, es, fr)
 * - Data formatting for towns/comuni
 * - SEO meta tags and structured data
 * - Output directory management
 */
class TownGenerator {
  constructor(options = {}) {
    this.outputDir = options.outputDir || path.join(process.cwd(), 'output');
    this.templatePath = options.templatePath || path.join(process.cwd(), 'src', 'templates');
    this.concurrency = options.concurrency || 5;
    this.environment = options.environment || 'production';
    
    this.nunjucksEnv = null;
    this.i18n = null;
    this.dataLoader = null;
    this.initialized = false;
  }

  /**
   * Initialize the generator with all dependencies
   */
  async initialize() {
    if (this.initialized) return;

    const __templateDir = path.join(process.cwd(), 'src', 'templates');
    
    try {
      this.nunjucksEnv = nunjucks.configure(__templateDir, {
        autoescape: true,
        trimBlocks: true,
        lstripBlocks: true,
        watch: false,
        noCache: process.env.NODE_ENV !== 'production',
      });
    } catch (e) {
      const FileSystemLoader = nunjucks.FileSystemLoader;
      const loader = new FileSystemLoader(__templateDir);
      this.nunjucksEnv = new nunjucks.Environment(loader, {
        autoescape: true,
        trimBlocks: true,
        lstripBlocks: true,
      });
    }

    // Add custom filters
    this.nunjucksEnv.addFilter('isExcellent', (value, threshold = 8) => value >= threshold);
    this.nunjucksEnv.addFilter('isSafe', (value, threshold = 7) => value >= threshold);
    this.nunjucksEnv.addFilter('formatCurrency', (value, locale = 'en-US') => {
      if (typeof value !== 'number') return value;
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value);
    });
    this.nunjucksEnv.addFilter('formatNumber', (value, locale = 'en-US') => {
      if (typeof value !== 'number') return value;
      return new Intl.NumberFormat(locale, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 1,
      }).format(value);
    });
    this.nunjucksEnv.addFilter('round', (value, digits = 1) => {
      if (typeof value !== 'number') return value;
      return Math.round(value * Math.pow(10, digits)) / Math.pow(10, digits);
    });
    this.nunjucksEnv.addFilter('toSlug', (value) => {
      if (typeof value !== 'string') return value;
      return value
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]/g, '');
    });

    this.nunjucksEnv.addGlobal('t', (key) => key);

    this.i18n = setupI18n();
    this.dataLoader = new DataLoader();

    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }

    this.initialized = true;
    console.log('✓ TownGenerator initialized');
  }

  /**
   * Ensure output directories exist for a language
   * @param {string} language - Language code
   */
  ensureOutputDirectories(language) {
    const townDir = path.join(this.outputDir, language, 'town');

    if (!fs.existsSync(townDir)) {
      fs.mkdirSync(townDir, { recursive: true });
    }

    return { townDir };
  }

  /**
   * Format town data
   * @param {object} townData - Raw town data
   * @returns {object} Formatted town data
   */
  formatTown(townData) {
    return {
      name: townData.name || townData.Name || 'Unknown Town',
      province: townData.province || townData.Province || '',
      region: townData.region || townData.Region || '',
      population: townData.population || 0,
      area: townData.area || 0,
      elevation: townData.elevation || 0,
      coordinates: {
        lat: townData.latitude || townData.lat || 0,
        lng: townData.longitude || townData.lng || 0,
      },
      description: townData.description || '',
      attractions: townData.attractions || [],
      services: townData.services || {
        healthcare: 0,
        education: 0,
        transport: 0,
      },
      events: townData.events || [],
      relatedTowns: townData.relatedTowns || [],
    };
  }

  /**
   * Generate a single town page
   * @param {object} townData - Raw town data from dataset
   * @param {string} language - Language code
   * @param {string} outputPath - Full output file path
   * @returns {object} Generation result
   */
  async generateTownPage(townData, language, outputPath) {
    try {
      const formattedTown = this.formatTown(townData);

      const seoBuilder = new SEOBuilder('https://expiter.com', language);
      const seoTags = seoBuilder.buildMetaTags({
        Name: formattedTown.name,
        Region: formattedTown.region,
        Province: formattedTown.province,
      });

      const t = (key) => {
        const translations = {
          en: {
            'overview': 'Overview',
            'attractions': 'Attractions',
            'services': 'Services',
            'events': 'Events',
          },
          it: {
            'overview': 'Panoramica',
            'attractions': 'Attrazioni',
            'services': 'Servizi',
            'events': 'Eventi',
          },
          de: {
            'overview': 'Übersicht',
            'attractions': 'Attraktionen',
            'services': 'Dienstleistungen',
            'events': 'Veranstaltungen',
          },
          es: {
            'overview': 'Descripción General',
            'attractions': 'Atracciones',
            'services': 'Servicios',
            'events': 'Eventos',
          },
          fr: {
            'overview': 'Aperçu',
            'attractions': 'Attractions',
            'services': 'Services',
            'events': 'Événements',
          },
        };
        return translations[language]?.[key] || translations.en?.[key] || key;
      };

      const context = {
        town: formattedTown,
        seo: seoTags,
        language,
        t,
        showAds: true,
        environment: this.environment,
        generatedAt: new Date().toISOString(),
      };

      let html;
      try {
        html = this.nunjucksEnv.render('layouts/town-detail.njk', context);
      } catch (renderError) {
        console.error(`  Template error for ${townData.name || townData.Name}: ${renderError.message}`);
        throw renderError;
      }

      fs.writeFileSync(outputPath, html, 'utf8');

      return {
        success: true,
        town: formattedTown.name,
        language,
        size: Buffer.byteLength(html, 'utf8'),
        lines: html.split('\n').length,
      };
    } catch (error) {
      return {
        success: false,
        town: townData.name || townData.Name,
        language,
        error: error.message,
      };
    }
  }

  /**
   * Generate all town pages for a specific language
   * @param {string} language - Language code
   * @returns {object} Generation statistics
   */
  async generateTownPages(language) {
    if (!this.initialized) {
      await this.initialize();
    }

    console.log(`\n🏘️  Generating town pages for ${language}...`);

    const comuni = await this.dataLoader.loadComuni();
    if (!comuni || comuni.length === 0) {
      console.log(`  ⚠️  No towns found in dataset`);
      return {
        language,
        total: 0,
        successful: 0,
        failed: 0,
        totalSize: 0,
        averageSize: 0,
        errors: [],
      };
    }

    const { townDir } = this.ensureOutputDirectories(language);
    const limit = pLimit(this.concurrency);

    // Generate pages in parallel (limit to first 50 towns for now)
    const generateTasks = comuni.slice(0, 50).map((town) => {
      return limit(async () => {
        const townName = town.name || town.Name || '';
        const slug = townName
          .toLowerCase()
          .trim()
          .replace(/\s+/g, '-')
          .replace(/[^\w-]/g, '');
        
        if (!slug) return { success: false, town: townName, error: 'Invalid town name' };

        const filename = `${slug}.html`;
        const outputPath = path.join(townDir, filename);

        return this.generateTownPage(town, language, outputPath);
      });
    });

    const results = await Promise.all(generateTasks);

    const stats = {
      language,
      total: results.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      totalSize: results
        .filter(r => r.success)
        .reduce((sum, r) => sum + (r.size || 0), 0),
      averageSize: 0,
      errors: results.filter(r => !r.success).map(r => ({
        town: r.town,
        error: r.error,
      })),
    };

    if (stats.successful > 0) {
      stats.averageSize = Math.round(stats.totalSize / stats.successful);
    }

    console.log(`  ✓ Generated ${stats.successful}/${stats.total} pages`);
    if (stats.failed > 0) {
      console.log(`  ✗ Failed: ${stats.failed} pages`);
      stats.errors.slice(0, 3).forEach(e => {
        console.log(`    - ${e.town}: ${e.error}`);
      });
    }
    console.log(`  📊 Total size: ${this.formatBytes(stats.totalSize)}`);
    console.log(`  📏 Average size: ${this.formatBytes(stats.averageSize)}`);

    return stats;
  }

  /**
   * Generate town pages for multiple languages
   * @param {array} languages - Array of language codes
   * @returns {object} Combined statistics
   */
  async generateAllLanguages(languages = ['en', 'it', 'de', 'es', 'fr']) {
    if (!this.initialized) {
      await this.initialize();
    }

    console.log(`\n🚀 Starting multi-language town generation for ${languages.length} languages...`);
    const startTime = Date.now();

    const results = {};
    for (const language of languages) {
      results[language] = await this.generateTownPages(language);
    }

    const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
    const totalFiles = Object.values(results).reduce((sum, r) => sum + r.successful, 0);
    const totalSize = Object.values(results).reduce((sum, r) => sum + r.totalSize, 0);

    console.log(`\n✨ Town generation complete!`);
    console.log(`  ⏱️  Total time: ${totalTime}s`);
    console.log(`  📄 Total files: ${totalFiles}`);
    console.log(`  📦 Total size: ${this.formatBytes(totalSize)}`);

    return {
      startTime: new Date().toISOString(),
      duration: `${totalTime}s`,
      languages: results,
      summary: {
        totalFiles,
        totalSize,
        totalSizeFormatted: this.formatBytes(totalSize),
      },
    };
  }

  /**
   * Format bytes to human-readable format
   * @param {number} bytes - Number of bytes
   * @returns {string} Formatted string
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Cleanup - clear the generator
   */
  cleanup() {
    this.nunjucksEnv = null;
    this.i18n = null;
    this.dataLoader = null;
    this.initialized = false;
  }
}

export default TownGenerator;
