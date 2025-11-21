import fs from 'fs';
import path from 'path';
import DataLoader from '../utils/data-loader.js';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * SitemapGenerator - Generates XML sitemaps for SEO
 * 
 * Features:
 * - Generates sitemaps for all pages
 * - Multi-language support
 * - Sitemap index for large site structure
 * - Lastmod and priority attributes
 */
class SitemapGenerator {
  constructor(options = {}) {
    this.baseUrl = options.baseUrl || 'https://expiter.com';
    this.outputDir = options.outputDir || path.join(process.cwd(), 'output');
    this.dataLoader = null;
  }

  /**
   * Initialize the generator
   */
  async initialize() {
    this.dataLoader = new DataLoader();
    console.log('✓ SitemapGenerator initialized');
  }

  /**
   * Create a sitemap entry
   * @param {string} loc - URL location
   * @param {string} lastmod - Last modified date (ISO format)
   * @param {string} changefreq - Change frequency
   * @param {number} priority - Priority (0.0-1.0)
   * @returns {string} XML entry
   */
  createEntry(loc, lastmod = null, changefreq = 'monthly', priority = 0.5) {
    let entry = `  <url>\n    <loc>${this.escapeXml(loc)}</loc>\n`;
    
    if (lastmod) {
      entry += `    <lastmod>${lastmod}</lastmod>\n`;
    }
    
    entry += `    <changefreq>${changefreq}</changefreq>\n`;
    entry += `    <priority>${priority}</priority>\n`;
    entry += `  </url>\n`;
    
    return entry;
  }

  /**
   * Escape XML special characters
   * @param {string} str - String to escape
   * @returns {string} Escaped string
   */
  escapeXml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /**
   * Generate sitemap for a language
   * @param {string} language - Language code
   * @returns {object} Generation result
   */
  async generateSitemap(language) {
    try {
      const dataset = await this.dataLoader.loadDataset();
      const now = new Date().toISOString().split('T')[0];

      let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
      xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

      // Home page
      xml += this.createEntry(`${this.baseUrl}/${language}/`, now, 'daily', 1.0);

      // Province pages
      dataset.forEach(province => {
        const slug = (province.Name || '')
          .toLowerCase()
          .trim()
          .replace(/\s+/g, '-')
          .replace(/[^\w-]/g, '');

        if (slug) {
          xml += this.createEntry(
            `${this.baseUrl}/${language}/province/${slug}.html`,
            now,
            'monthly',
            0.8
          );
        }
      });

      // Region pages
      const regions = [...new Set(dataset.map(p => p.Region))].filter(Boolean);
      regions.forEach(region => {
        const slug = (region || '')
          .toLowerCase()
          .trim()
          .replace(/\s+/g, '-')
          .replace(/[^\w-]/g, '');

        if (slug) {
          xml += this.createEntry(
            `${this.baseUrl}/${language}/region/${slug}.html`,
            now,
            'monthly',
            0.7
          );
        }
      });

      // Safety pages
      const topSafe = dataset
        .filter(p => p.Safety !== undefined)
        .sort((a, b) => (b.Safety || 0) - (a.Safety || 0))
        .slice(0, 10);

      xml += this.createEntry(`${this.baseUrl}/${language}/safety/`, now, 'monthly', 0.6);
      topSafe.forEach(province => {
        const slug = (province.Name || '')
          .toLowerCase()
          .trim()
          .replace(/\s+/g, '-')
          .replace(/[^\w-]/g, '');

        if (slug) {
          xml += this.createEntry(
            `${this.baseUrl}/${language}/safety/${slug}-safety.html`,
            now,
            'monthly',
            0.5
          );
        }
      });

      xml += '</urlset>';

      const outputDir = path.join(this.outputDir, language);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      const outputPath = path.join(outputDir, 'sitemap.xml');
      fs.writeFileSync(outputPath, xml, 'utf8');

      return {
        success: true,
        language,
        url: outputPath,
        entries: (xml.match(/<url>/g) || []).length,
        size: Buffer.byteLength(xml, 'utf8'),
      };
    } catch (error) {
      return {
        success: false,
        language,
        error: error.message,
      };
    }
  }

  /**
   * Generate sitemaps for all languages
   * @param {array} languages - Array of language codes
   * @returns {object} Combined statistics
   */
  async generateAllLanguages(languages = ['en', 'it', 'de', 'es', 'fr']) {
    if (!this.dataLoader) {
      await this.initialize();
    }

    console.log(`\n🗺️  Generating sitemaps for ${languages.length} languages...`);
    const startTime = Date.now();

    const results = {};
    let totalEntries = 0;
    let totalSize = 0;

    for (const language of languages) {
      const result = await this.generateSitemap(language);
      results[language] = result;
      
      if (result.success) {
        totalEntries += result.entries;
        totalSize += result.size;
        console.log(`  ✓ ${language}: ${result.entries} entries (${this.formatBytes(result.size)})`);
      } else {
        console.log(`  ✗ ${language}: ${result.error}`);
      }
    }

    // Generate sitemap index
    const indexResult = this.generateSitemapIndex(languages, results);

    const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log(`\n✨ Sitemap generation complete!`);
    console.log(`  ⏱️  Total time: ${totalTime}s`);
    console.log(`  🗺️  Total entries: ${totalEntries}`);
    console.log(`  📦 Total size: ${this.formatBytes(totalSize)}`);

    return {
      startTime: new Date().toISOString(),
      duration: `${totalTime}s`,
      languages: results,
      index: indexResult,
      summary: {
        totalLanguages: languages.length,
        totalEntries,
        totalSize,
        totalSizeFormatted: this.formatBytes(totalSize),
      },
    };
  }

  /**
   * Generate sitemap index
   * @param {array} languages - Array of language codes
   * @param {object} results - Results from generateSitemap calls
   * @returns {object} Index generation result
   */
  generateSitemapIndex(languages, results) {
    try {
      let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
      xml += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

      languages.forEach(language => {
        if (results[language] && results[language].success) {
          const date = new Date().toISOString().split('T')[0];
          xml += `  <sitemap>\n`;
          xml += `    <loc>${this.escapeXml(`${this.baseUrl}/${language}/sitemap.xml`)}</loc>\n`;
          xml += `    <lastmod>${date}</lastmod>\n`;
          xml += `  </sitemap>\n`;
        }
      });

      xml += '</sitemapindex>';

      const outputPath = path.join(this.outputDir, 'sitemap_index.xml');
      fs.writeFileSync(outputPath, xml, 'utf8');

      return {
        success: true,
        url: outputPath,
        size: Buffer.byteLength(xml, 'utf8'),
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
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
}

export default SitemapGenerator;
