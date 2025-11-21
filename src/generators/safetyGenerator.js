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
 * SafetyGenerator - Generates static HTML safety-focused pages using Nunjucks templates
 * 
 * Features:
 * - Generates pages for the safest provinces/regions
 * - Crime statistics comparison
 * - Multi-language support (en, it, de, es, fr)
 * - SEO meta tags for safety-related searches
 */
class SafetyGenerator {
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
    console.log('✓ SafetyGenerator initialized');
  }

  /**
   * Ensure output directories exist for a language
   * @param {string} language - Language code
   */
  ensureOutputDirectories(language) {
    const safetyDir = path.join(this.outputDir, language, 'safety');

    if (!fs.existsSync(safetyDir)) {
      fs.mkdirSync(safetyDir, { recursive: true });
    }

    return { safetyDir };
  }

  /**
   * Get top safe provinces
   * @param {array} dataset - Full province dataset
   * @param {number} limit - Number of safe provinces to return
   * @returns {array} Top safe provinces sorted by safety score
   */
  getTopSafeProvinces(dataset, limit = 20) {
    return dataset
      .filter(p => p.Safety !== undefined && p.Safety !== null)
      .sort((a, b) => (b.Safety || 0) - (a.Safety || 0))
      .slice(0, limit);
  }

  /**
   * Get crime data for display
   * @returns {object} Crime statistics and trends
   */
  async getCrimeData() {
    try {
      const data = await this.dataLoader.loadCrimeData();
      return data || {};
    } catch (e) {
      return {};
    }
  }

  /**
   * Generate a safety index page
   * @param {string} language - Language code
   * @param {string} outputPath - Full output file path
   * @returns {object} Generation result
   */
  async generateSafetyIndexPage(language, outputPath) {
    try {
      const dataset = await this.dataLoader.loadDataset();
      const topSafe = this.getTopSafeProvinces(dataset, 20);
      const crimeData = await this.getCrimeData();

      const seoBuilder = new SEOBuilder('https://expiter.com', language);
      const seoTags = seoBuilder.buildMetaTags({
        Name: 'Safest Provinces in Italy',
        Description: 'Explore the safest provinces and regions in Italy with detailed crime statistics and safety ratings.',
        Region: 'Italy',
      });

      const t = (key) => {
        const translations = {
          en: {
            'safety.title': 'Safest Provinces in Italy',
            'safety.description': 'Explore the safest provinces and regions with detailed crime statistics',
            'safety.ranking': 'Safety Ranking',
            'safety.crime_statistics': 'Crime Statistics',
            'safety.comparison': 'Compare Safety Ratings',
          },
          it: {
            'safety.title': 'Province più Sicure d\'Italia',
            'safety.description': 'Scopri le province più sicure con statistiche dettagliate della criminalità',
            'safety.ranking': 'Ranking Sicurezza',
            'safety.crime_statistics': 'Statistiche Criminalità',
            'safety.comparison': 'Confronta Indici di Sicurezza',
          },
          de: {
            'safety.title': 'Sicherste Provinzen Italiens',
            'safety.description': 'Entdecken Sie die sichersten Provinzen mit detaillierten Kriminalitätsstatistiken',
            'safety.ranking': 'Sicherheits-Ranking',
            'safety.crime_statistics': 'Kriminalitätsstatistiken',
            'safety.comparison': 'Sicherheitsbewertungen vergleichen',
          },
          es: {
            'safety.title': 'Provincias más Seguras de Italia',
            'safety.description': 'Explora las provincias más seguras con estadísticas detalladas de criminalidad',
            'safety.ranking': 'Ranking de Seguridad',
            'safety.crime_statistics': 'Estadísticas de Criminalidad',
            'safety.comparison': 'Comparar Calificaciones de Seguridad',
          },
          fr: {
            'safety.title': 'Provinces les plus Sûres d\'Italie',
            'safety.description': 'Explorez les provinces les plus sûres avec des statistiques détaillées sur la criminalité',
            'safety.ranking': 'Classement de Sécurité',
            'safety.crime_statistics': 'Statistiques Criminelles',
            'safety.comparison': 'Comparer les Évaluations de Sécurité',
          },
        };
        return translations[language]?.[key] || translations.en?.[key] || key;
      };

      const context = {
        provinces: topSafe,
        crimeData,
        seo: seoTags,
        language,
        t,
        pageType: 'safety',
        showAds: true,
        environment: this.environment,
        generatedAt: new Date().toISOString(),
      };

      let html;
      try {
        // For now, render as a comparison page with safety focus
        html = this.nunjucksEnv.render('layouts/comparison.njk', context);
      } catch (renderError) {
        console.error(`  Template error for safety index: ${renderError.message}`);
        throw renderError;
      }

      fs.writeFileSync(outputPath, html, 'utf8');

      return {
        success: true,
        page: 'safety-index',
        language,
        size: Buffer.byteLength(html, 'utf8'),
        lines: html.split('\n').length,
      };
    } catch (error) {
      return {
        success: false,
        page: 'safety-index',
        language,
        error: error.message,
      };
    }
  }

  /**
   * Generate safety pages for a specific language
   * @param {string} language - Language code
   * @returns {object} Generation statistics
   */
  async generateSafetyPages(language) {
    if (!this.initialized) {
      await this.initialize();
    }

    console.log(`\n🛡️  Generating safety pages for ${language}...`);

    const { safetyDir } = this.ensureOutputDirectories(language);

    // Generate safety index page
    const indexPath = path.join(safetyDir, 'index.html');
    const indexResult = await this.generateSafetyIndexPage(language, indexPath);

    // Generate top 10 safe provinces comparison pages
    const dataset = await this.dataLoader.loadDataset();
    const topSafe = this.getTopSafeProvinces(dataset, 10);

    const limit = pLimit(this.concurrency);

    const generateTasks = topSafe.map((province, index) => {
      return limit(async () => {
        const slug = (province.Name || '')
          .toLowerCase()
          .trim()
          .replace(/\s+/g, '-')
          .replace(/[^\w-]/g, '');

        if (!slug) return { success: false, province: province.Name, error: 'Invalid province name' };

        const filename = `${slug}-safety.html`;
        const outputPath = path.join(safetyDir, filename);

        try {
          const seoBuilder = new SEOBuilder('https://expiter.com', language);
          const seoTags = seoBuilder.buildMetaTags(province);

          const t = (key) => key;
          const context = {
            province,
            seo: seoTags,
            language,
            t,
            pageType: 'safety-province',
            showAds: true,
            environment: this.environment,
            generatedAt: new Date().toISOString(),
          };

          // Render province-detail template with safety focus
          const html = this.nunjucksEnv.render('layouts/province-detail.njk', context);
          fs.writeFileSync(outputPath, html, 'utf8');

          return {
            success: true,
            province: province.Name,
            language,
            size: Buffer.byteLength(html, 'utf8'),
          };
        } catch (error) {
          return {
            success: false,
            province: province.Name,
            language,
            error: error.message,
          };
        }
      });
    });

    const results = await Promise.all(generateTasks);
    results.unshift(indexResult);

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
        page: r.page || r.province,
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
        console.log(`    - ${e.page}: ${e.error}`);
      });
    }
    console.log(`  📊 Total size: ${this.formatBytes(stats.totalSize)}`);
    console.log(`  📏 Average size: ${this.formatBytes(stats.averageSize)}`);

    return stats;
  }

  /**
   * Generate safety pages for multiple languages
   * @param {array} languages - Array of language codes
   * @returns {object} Combined statistics
   */
  async generateAllLanguages(languages = ['en', 'it', 'de', 'es', 'fr']) {
    if (!this.initialized) {
      await this.initialize();
    }

    console.log(`\n🚀 Starting multi-language safety generation for ${languages.length} languages...`);
    const startTime = Date.now();

    const results = {};
    for (const language of languages) {
      results[language] = await this.generateSafetyPages(language);
    }

    const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
    const totalFiles = Object.values(results).reduce((sum, r) => sum + r.successful, 0);
    const totalSize = Object.values(results).reduce((sum, r) => sum + r.totalSize, 0);

    console.log(`\n✨ Safety generation complete!`);
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

export default SafetyGenerator;
