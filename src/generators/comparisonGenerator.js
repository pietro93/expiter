import fs from 'fs';
import path from 'path';
import nunjucks from 'nunjucks';
import DataLoader from '../utils/data-loader.js';
import ProvinceFormatter from '../utils/formatter.js';
import SEOBuilder from '../utils/seo-builder.js';
import UrlHelper from '../utils/url-helper.js';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * ComparisonGenerator - Generates comparison pages between provinces
 * 
 * Features:
 * - Generates static comparison pages
 * - Multi-language support
 * - SEO optimized
 */
class ComparisonGenerator {
  constructor(options = {}) {
    this.outputDir = options.outputDir || path.join(process.cwd(), 'output');
    this.templatePath = options.templatePath || path.join(process.cwd(), 'src', 'templates');
    this.environment = options.environment || 'production';
    
    this.nunjucksEnv = null;
    this.dataLoader = null;
    this.initialized = false;
  }

  /**
   * Initialize the generator
   */
  async initialize() {
    if (this.initialized) return;

    // Setup Nunjucks
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
    this.nunjucksEnv.addFilter('round', (value, digits = 1) => {
      if (typeof value !== 'number') return value;
      return Math.round(value * Math.pow(10, digits)) / Math.pow(10, digits);
    });
    this.nunjucksEnv.addFilter('toSlug', (value) => {
      if (typeof value !== 'string') return value;
      return ProvinceFormatter.toSlug(value);
    });

    // Setup data loader
    this.dataLoader = new DataLoader();

    // Create output directory
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }

    this.initialized = true;
    console.log('✓ ComparisonGenerator initialized');
  }

  /**
   * Load comparison definitions
   * @returns {Promise<Array>} Array of comparison definitions
   */
  async loadComparisons() {
    try {
      const comparisonPath = path.join(process.cwd(), 'src', 'data', 'comparisons.json');
      const data = await fs.promises.readFile(comparisonPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error loading comparisons:', error.message);
      return [];
    }
  }

  /**
   * Generate a comparison page
   * @param {object} comparison - Comparison definition
   * @param {string} language - Language code
   * @returns {Promise<object>} Generation result
   */
  async generateComparison(comparison, language = 'en') {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      // Load provinces
      const dataset = await this.dataLoader.loadDataset();
      
      // Find provinces
      let province1 = null;
      let province2 = null;

      if (Array.isArray(dataset)) {
        province1 = dataset.find(p => (p.name || p.Name) === comparison.province1);
        province2 = dataset.find(p => (p.name || p.Name) === comparison.province2);
      } else {
        Object.values(dataset).forEach(p => {
          if ((p.name || p.Name) === comparison.province1) province1 = p;
          if ((p.name || p.Name) === comparison.province2) province2 = p;
        });
      }

      if (!province1 || !province2) {
        return {
          success: false,
          comparison: comparison.id,
          language,
          error: 'One or both provinces not found',
        };
      }

      // Format provinces
      const formatted1 = ProvinceFormatter.formatProvince(province1);
      const formatted2 = ProvinceFormatter.formatProvince(province2);

      // Generate SEO
      const seoBuilder = new SEOBuilder('https://expiter.com', language);
      const seoTags = seoBuilder.buildMetaTags({
        Name: comparison.title,
        Region: 'Italy',
      });

      // Update canonical URL
      const slug = `${ProvinceFormatter.toSlug(comparison.province1)}-vs-${ProvinceFormatter.toSlug(comparison.province2)}`;
      seoTags.canonical = UrlHelper.getCanonicalUrl('comparison', slug, language);

      // Create context
      const context = {
        comparison,
        province1: formatted1,
        province2: formatted2,
        seo: seoTags,
        language,
        t: (key) => key, // Simple translation function
        showAds: true,
        environment: this.environment,
        generatedAt: new Date().toISOString(),
      };

      // Render template
      let html;
      try {
        html = this.nunjucksEnv.render('layouts/comparison.njk', context);
      } catch (renderError) {
        console.error(`  Template error for comparison ${comparison.id}: ${renderError.message}`);
        // If template not found, create a simple HTML
        html = `<!DOCTYPE html>
<html lang="${language}">
<head>
  <meta charset="UTF-8">
  <title>${comparison.title}</title>
  <meta name="description" content="Comparison: ${comparison.title}">
</head>
<body>
  <h1>${comparison.title}</h1>
  <p>Comparison page for ${comparison.province1} vs ${comparison.province2}</p>
</body>
</html>`;
      }

      // Determine output path
      const outputPath = UrlHelper.getOutputPath(
        'comparison',
        slug,
        language,
        this.outputDir
      );

      // Ensure output directory exists
      const outputDirectory = path.dirname(outputPath);
      if (!fs.existsSync(outputDirectory)) {
        fs.mkdirSync(outputDirectory, { recursive: true });
      }

      // Write file
      fs.writeFileSync(outputPath, html, 'utf8');

      return {
        success: true,
        comparison: comparison.id,
        language,
        size: Buffer.byteLength(html, 'utf8'),
      };
    } catch (error) {
      return {
        success: false,
        comparison: comparison.id,
        language,
        error: error.message,
      };
    }
  }

  /**
   * Generate all comparisons for a language
   * @param {string} language - Language code
   * @returns {Promise<object>} Generation statistics
   */
  async generateComparisonPages(language = 'en') {
    if (!this.initialized) {
      await this.initialize();
    }

    console.log(`\n⚖️  Generating comparison pages for ${language}...`);

    const comparisons = await this.loadComparisons();
    if (comparisons.length === 0) {
      console.log(`  ⚠️  No comparisons defined`);
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

    const results = await Promise.all(
      comparisons.map(comp => this.generateComparison(comp, language))
    );

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
        comparison: r.comparison,
        error: r.error,
      })),
    };

    if (stats.successful > 0) {
      stats.averageSize = Math.round(stats.totalSize / stats.successful);
    }

    console.log(`  ✓ Generated ${stats.successful}/${stats.total} comparison pages`);
    if (stats.failed > 0) {
      console.log(`  ✗ Failed: ${stats.failed}`);
    }
    console.log(`  📊 Total size: ${this.formatBytes(stats.totalSize)}`);
    console.log(`  📏 Average size: ${this.formatBytes(stats.averageSize)}`);

    return stats;
  }

  /**
   * Generate comparisons for multiple languages
   * @param {array} languages - Array of language codes
   * @returns {Promise<object>} Combined statistics
   */
  async generateAllLanguages(languages = ['en', 'it', 'de', 'es', 'fr']) {
    if (!this.initialized) {
      await this.initialize();
    }

    console.log(`\n🚀 Generating comparison pages for ${languages.length} languages...`);
    const startTime = Date.now();

    const results = {};
    for (const language of languages) {
      results[language] = await this.generateComparisonPages(language);
    }

    const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
    const totalFiles = Object.values(results).reduce((sum, r) => sum + r.successful, 0);
    const totalSize = Object.values(results).reduce((sum, r) => sum + r.totalSize, 0);

    console.log(`\n✨ Comparison generation complete!`);
    console.log(`  ⏱️  Total time: ${totalTime}s`);
    console.log(`  📄 Total pages: ${totalFiles}`);
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
   * Cleanup
   */
  cleanup() {
    this.nunjucksEnv = null;
    this.dataLoader = null;
    this.initialized = false;
  }
}

export default ComparisonGenerator;
