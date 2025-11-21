import fs from 'fs';
import path from 'path';
import pLimit from 'p-limit';
import nunjucks from 'nunjucks';
import { setupNunjucks } from '../config/template-engine.js';
import { setupI18n } from '../config/i18n-config.js';
import DataLoader from '../utils/data-loader.js';
import ProvinceFormatter from '../utils/formatter.js';
import SEOBuilder from '../utils/seo-builder.js';
import UrlHelper from '../utils/url-helper.js';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * PageGenerator - Generates static HTML province pages using Nunjucks templates
 * 
 * Features:
 * - Parallel processing with configurable concurrency
 * - Multi-language support (en, it, de, es, fr)
 * - Data formatting and validation
 * - SEO meta tags and structured data
 * - Output directory management
 */
class PageGenerator {
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

    // Setup Nunjucks - create environment manually for better control
    const __templateDir = path.join(process.cwd(), 'src', 'templates');
    const FileSystemLoader = nunjucks.FileSystemLoader;
    
    try {
      this.nunjucksEnv = nunjucks.configure(__templateDir, {
        autoescape: true,
        trimBlocks: true,
        lstripBlocks: true,
        watch: false,
        noCache: process.env.NODE_ENV !== 'production',
      });
    } catch (e) {
      // Fallback: create manually
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

    // Add global t function
    this.nunjucksEnv.addGlobal('t', (key) => key);

    // Setup i18n
    this.i18n = setupI18n();

    // Setup data loader
    this.dataLoader = new DataLoader();

    // Create output directory if it doesn't exist
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }

    this.initialized = true;
    console.log('✓ PageGenerator initialized');
  }

  /**
   * Ensure output directories exist for a language
   * @param {string} language - Language code
   */
  ensureOutputDirectories(language) {
    // For English, use root-level province directory
    // For other languages, use language-specific directory
    const baseProvDir = language === 'en' 
      ? path.join(this.outputDir, 'province')
      : path.join(this.outputDir, language, 'province');
    
    const indexDir = language === 'en'
      ? this.outputDir
      : path.join(this.outputDir, language);

    if (!fs.existsSync(baseProvDir)) {
      fs.mkdirSync(baseProvDir, { recursive: true });
    }

    if (!fs.existsSync(indexDir)) {
      fs.mkdirSync(indexDir, { recursive: true });
    }

    return { provinceDir: baseProvDir, indexDir };
  }

  /**
   * Generate a single province page
   * @param {object} provinceData - Raw province data from dataset
   * @param {string} language - Language code
   * @param {string} outputPath - Full output file path
   * @returns {object} Generation result
   */
  async generateProvincePage(provinceData, language, outputPath) {
    try {
      // Debug: Log template path info
      // console.log(`Rendering template for ${provinceData.Name} to ${outputPath}`);

      // Format the province data
       const formattedProvince = ProvinceFormatter.formatProvince(provinceData);

       // Generate SEO tags with correct canonical URL
       const seoBuilder = new SEOBuilder('https://expiter.com', language);
       const seoTags = seoBuilder.buildMetaTags(formattedProvince);
       
       // Update canonical URL to match legacy structure (directory-style with trailing slash)
       const slug = ProvinceFormatter.toSlug(provinceData.Name);
       seoTags.canonical = UrlHelper.getCanonicalUrl('province', slug, language);

      // Create translation function for template
      const t = (key) => {
        const translations = {
          en: {
            'tabs.quality_of_life': 'Quality of Life',
            'tabs.cost_of_living': 'Cost of Living',
            'tabs.digital_nomads': 'Digital Nomads',
          },
          it: {
            'tabs.quality_of_life': 'Qualità della Vita',
            'tabs.cost_of_living': 'Costo della Vita',
            'tabs.digital_nomads': 'Nomadi Digitali',
          },
          de: {
            'tabs.quality_of_life': 'Lebensqualität',
            'tabs.cost_of_living': 'Lebenshaltungskosten',
            'tabs.digital_nomads': 'Digitale Nomaden',
          },
          es: {
            'tabs.quality_of_life': 'Calidad de Vida',
            'tabs.cost_of_living': 'Costo de Vida',
            'tabs.digital_nomads': 'Nómadas Digitales',
          },
          fr: {
            'tabs.quality_of_life': 'Qualité de Vie',
            'tabs.cost_of_living': 'Coût de la Vie',
            'tabs.digital_nomads': 'Nomades Numériques',
          },
        };
        return translations[language]?.[key] || translations.en?.[key] || key;
      };

      // Prepare template context
      const context = {
        province: formattedProvince,
        seo: seoTags,
        language,
        t,
        showAds: true,
        environment: this.environment,
        generatedAt: new Date().toISOString(),
      };

      // Render template
       let html;
       try {
         html = this.nunjucksEnv.render('layouts/province-detail.njk', context);
       } catch (renderError) {
         // Provide more detailed error info
         console.error(`  Template error for ${provinceData.Name}: ${renderError.message}`);
         throw renderError;
       }

       // Ensure output directory exists
       const outputDirectory = path.dirname(outputPath);
       if (!fs.existsSync(outputDirectory)) {
         fs.mkdirSync(outputDirectory, { recursive: true });
       }

       // Write output file
       fs.writeFileSync(outputPath, html, 'utf8');

      return {
        success: true,
        province: provinceData.Name,
        language,
        size: Buffer.byteLength(html, 'utf8'),
        lines: html.split('\n').length,
      };
    } catch (error) {
      return {
        success: false,
        province: provinceData.Name,
        language,
        error: error.message,
      };
    }
  }

  /**
   * Generate all province pages for a specific language
   * @param {string} language - Language code (en, it, de, es, fr)
   * @returns {object} Generation statistics
   */
  async generateProvincePages(language) {
    if (!this.initialized) {
      await this.initialize();
    }

    console.log(`\n📄 Generating province pages for ${language}...`);

    // Load dataset
    const dataset = await this.dataLoader.loadDataset();

    // Ensure output directories
    const { provinceDir } = this.ensureOutputDirectories(language);

    // Prepare concurrency limiter
    const limit = pLimit(this.concurrency);

    // Generate pages in parallel
     const generateTasks = dataset.map((province) => {
       return limit(async () => {
         const slug = ProvinceFormatter.toSlug(province.Name);
         // Use directory structure: /province/[slug]/index.html
         const outputPath = UrlHelper.getOutputPath('province', slug, language, this.outputDir);

         return this.generateProvincePage(province, language, outputPath);
       });
     });

    // Wait for all tasks to complete
    const results = await Promise.all(generateTasks);

    // Calculate statistics
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
        province: r.province,
        error: r.error,
      })),
    };

    if (stats.successful > 0) {
      stats.averageSize = Math.round(stats.totalSize / stats.successful);
    }

    // Log results
    console.log(`  ✓ Generated ${stats.successful}/${stats.total} pages`);
    if (stats.failed > 0) {
      console.log(`  ✗ Failed: ${stats.failed} pages`);
      stats.errors.slice(0, 5).forEach(e => {
        console.log(`    - ${e.province}: ${e.error}`);
      });
    }
    console.log(`  📊 Total size: ${this.formatBytes(stats.totalSize)}`);
    console.log(`  📏 Average size: ${this.formatBytes(stats.averageSize)}`);

    return stats;
  }

  /**
   * Generate province pages for multiple languages
   * @param {array} languages - Array of language codes
   * @returns {object} Combined statistics
   */
  async generateAllLanguages(languages = ['en', 'it', 'de', 'es', 'fr']) {
    if (!this.initialized) {
      await this.initialize();
    }

    console.log(`\n🚀 Starting multi-language generation for ${languages.length} languages...`);
    const startTime = Date.now();

    const results = {};
    for (const language of languages) {
      results[language] = await this.generateProvincePages(language);
    }

    const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
    const totalFiles = Object.values(results).reduce((sum, r) => sum + r.successful, 0);
    const totalSize = Object.values(results).reduce((sum, r) => sum + r.totalSize, 0);

    console.log(`\n✨ Generation complete!`);
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
   * Calculate average of numeric array
   * @param {array} arr - Array of numbers
   * @returns {number} Average
   */
  calculateAverage(arr) {
    if (!arr || arr.length === 0) return 0;
    return arr.reduce((a, b) => a + b, 0) / arr.length;
  }

  /**
   * Get generation statistics
   * @returns {object} Current statistics
   */
  getStatistics() {
    const outputDirs = fs.readdirSync(this.outputDir);
    const stats = {
      outputDirectory: this.outputDir,
      languages: [],
      totalFiles: 0,
      totalSize: 0,
    };

    outputDirs.forEach(lang => {
      const provincePath = path.join(this.outputDir, lang, 'province');
      if (fs.existsSync(provincePath)) {
        const files = fs.readdirSync(provincePath);
        const size = files.reduce((sum, file) => {
          const filePath = path.join(provincePath, file);
          return sum + fs.statSync(filePath).size;
        }, 0);

        stats.languages.push({
          code: lang,
          files: files.length,
          size,
          sizeFormatted: this.formatBytes(size),
        });

        stats.totalFiles += files.length;
        stats.totalSize += size;
      }
    });

    stats.totalSizeFormatted = this.formatBytes(stats.totalSize);

    return stats;
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

export default PageGenerator;
