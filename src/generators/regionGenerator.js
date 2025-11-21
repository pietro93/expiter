import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pLimit from 'p-limit';
import i18next from 'i18next';
import nunjucks from 'nunjucks';
import DataLoader from '../utils/data-loader.js';
import ProvinceFormatter from '../utils/formatter.js';
import SEOBuilder from '../utils/seo-builder.js';
import { setupI18n } from '../config/i18n-config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Italian Regions Data
 * Extracted from dataset
 */
const ITALIAN_REGIONS = [
  'Abruzzo', 'Basilicata', 'Calabria', 'Campania', 'Emilia-Romagna',
  'Friuli-Venezia Giulia', 'Lazio', 'Liguria', 'Lombardia', 'Marche',
  'Molise', 'Piemonte', 'Puglia', 'Sardegna', 'Sicilia', 'Toscana',
  'Trentino-Alto Adige', 'Umbria', 'Valle d\'Aosta', 'Veneto'
];

class RegionGenerator {
  constructor(options = {}) {
    this.nunjucksEnv = null;
    this.dataLoader = null;
    this.formatter = ProvinceFormatter;
    this.seoBuilder = new SEOBuilder();
    this.concurrency = options.concurrency || 5;
    this.stats = {
      filesGenerated: 0,
      totalSize: 0,
      languages: {},
      regions: {},
      startTime: null,
      endTime: null,
    };
  }

  async initialize() {
    console.log('Initializing RegionGenerator...');

    // Setup Nunjucks using nunjucks.configure for proper template resolution
    const __templateDir = path.join(__dirname, '../templates');
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
      return value.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');
    });

    // Setup i18n
    await setupI18n();

    // Initialize DataLoader
    this.dataLoader = new DataLoader();
    const dataset = await this.dataLoader.loadDataset();
    console.log(`✓ Loaded ${dataset.length} provinces`);
  }

  async ensureOutputDirectories(language) {
    const regionDir = path.join(__dirname, '../../output', language, 'region');
    if (!fs.existsSync(regionDir)) {
      fs.mkdirSync(regionDir, { recursive: true });
    }
  }

  /**
   * Build region data from provinces
   * @param {string} regionName - Region name
   * @param {Array} provinces - Array of provinces
   * @returns {Object} Region object
   */
  buildRegionData(regionName, provinces) {
    if (provinces.length === 0) {
      return null;
    }

    // Calculate aggregate statistics
    const population = provinces.reduce((sum, p) => sum + (parseInt(p.Population) || 0), 0);
    const area = provinces.reduce((sum, p) => sum + (parseInt(p.Size) || 0), 0);
    const avgQuality = provinces.length > 0
      ? provinces.reduce((sum, p) => sum + (parseFloat(p['Overall Score']) || 0), 0) / provinces.length
      : 0;
    const avgSafety = provinces.length > 0
      ? provinces.reduce((sum, p) => sum + (parseFloat(p.Safety) || 0), 0) / provinces.length
      : 0;
    const avgHealthcare = provinces.length > 0
      ? provinces.reduce((sum, p) => sum + (parseFloat(p.Healthcare) || 0), 0) / provinces.length
      : 0;

    return {
      name: regionName,
      slug: this.toSlug(regionName),
      population,
      area,
      provinceCount: provinces.length,
      capital: this.getRegionCapital(regionName),
      description: this.getRegionDescription(regionName),
      tagline: this.getRegionTagline(regionName),
      provinces,
      stats: {
        quality: avgQuality,
        safety: avgSafety,
        healthcare: avgHealthcare,
      },
    };
  }

  /**
   * Get region capital from Italian regions
   * @param {string} region - Region name
   * @returns {string} Capital city
   */
  getRegionCapital(region) {
    const capitals = {
      'Abruzzo': 'L\'Aquila',
      'Basilicata': 'Potenza',
      'Calabria': 'Catanzaro',
      'Campania': 'Napoli',
      'Emilia-Romagna': 'Bologna',
      'Friuli-Venezia Giulia': 'Trieste',
      'Lazio': 'Roma',
      'Liguria': 'Genova',
      'Lombardia': 'Milano',
      'Marche': 'Ancona',
      'Molise': 'Campobasso',
      'Piemonte': 'Torino',
      'Puglia': 'Bari',
      'Sardegna': 'Cagliari',
      'Sicilia': 'Palermo',
      'Toscana': 'Firenze',
      'Trentino-Alto Adige': 'Trento',
      'Umbria': 'Perugia',
      'Valle d\'Aosta': 'Aosta',
      'Veneto': 'Venezia',
    };
    return capitals[region] || region;
  }

  /**
   * Get region description
   * @param {string} region - Region name
   * @returns {string} Description
   */
  getRegionDescription(region) {
    const descriptions = {
      'Abruzzo': 'Located on the Adriatic coast, Abruzzo is known for its stunning mountain scenery, medieval towns, and rich cultural heritage.',
      'Basilicata': 'Basilicata, the "instep" of the Italian boot, features dramatic landscapes, ancient ruins, and authentic Southern Italian culture.',
      'Calabria': 'At the tip of the Italian peninsula, Calabria offers beautiful beaches, mountainous terrain, and a unique Mediterranean lifestyle.',
      'Campania': 'Home to Naples and the Amalfi Coast, Campania is rich in history, vibrant energy, and world-renowned cuisine.',
      'Emilia-Romagna': 'A cultural and culinary powerhouse, Emilia-Romagna is famous for its Renaissance cities, food traditions, and economic vitality.',
      'Friuli-Venezia Giulia': 'Located in the northeastern corner, this region blends Italian, Austrian, and Slovene influences with excellent quality of life.',
      'Lazio': 'Home to Rome, the Eternal City, Lazio is a major cultural and economic hub with millennia of history.',
      'Liguria': 'Along the Mediterranean coast, Liguria features the scenic Riviera, charming coastal towns, and a relaxed lifestyle.',
      'Lombardia': 'Northern Italy\'s economic engine, Lombardia includes Milan and the Lake District, known for fashion, finance, and natural beauty.',
      'Marche': 'A lesser-known gem in central Italy, Marche offers rolling hills, historic towns, and agricultural traditions.',
      'Molise': 'One of Italy\'s smallest regions, Molise is known for its unspoiled landscapes, local traditions, and authentic character.',
      'Piemonte': 'In northwest Italy, Piemonte features the Alps, wine country, Turin\'s urban culture, and industrial heritage.',
      'Puglia': 'The "heel" of Italy, Puglia offers beautiful beaches, trulli houses, baroque architecture, and authentic Southern hospitality.',
      'Sardegna': 'An island paradise, Sardegna is famous for pristine beaches, clear waters, and a distinct cultural identity.',
      'Sicilia': 'Italy\'s largest island, Sicilia combines Greek ruins, Norman architecture, volcanic landscapes, and unique Mediterranean culture.',
      'Toscana': 'Rolling hills, vineyards, medieval cities, and Renaissance art make Toscana one of Italy\'s most iconic regions.',
      'Trentino-Alto Adige': 'In the Dolomite Mountains, this bilingual region offers stunning alpine scenery and excellent quality of life.',
      'Umbria': 'The "green heart" of Italy, Umbria features medieval hill towns, spiritual heritage, and scenic countryside.',
      'Valle d\'Aosta': 'Italy\'s smallest region, Valle d\'Aosta is an alpine paradise with Mount Blanc and a unique Franco-Italian character.',
      'Veneto': 'Home to Venice and prosecco, Veneto blends historic charm, natural lagoons, and northern Italian prosperity.',
    };
    return descriptions[region] || 'A beautiful region in Italy with rich history and culture.';
  }

  /**
   * Get region tagline
   * @param {string} region - Region name
   * @returns {string} Tagline
   */
  getRegionTagline(region) {
    const taglines = {
      'Abruzzo': 'Mountains, coast, and authentic culture',
      'Basilicata': 'Discover the hidden gem of Southern Italy',
      'Calabria': 'Where Italy meets the Mediterranean',
      'Campania': 'History, vibrance, and culinary excellence',
      'Emilia-Romagna': 'Culture, food, and prosperity',
      'Friuli-Venezia Giulia': 'Where cultures converge',
      'Lazio': 'Ancient grandeur and modern vitality',
      'Liguria': 'Sun, sea, and Mediterranean charm',
      'Lombardia': 'Innovation, fashion, and lakes',
      'Marche': 'Historic elegance and natural beauty',
      'Molise': 'Authentic and unspoiled',
      'Piemonte': 'Alps, wines, and urban culture',
      'Puglia': 'Ancient charm and modern energy',
      'Sardegna': 'Island paradise and Mediterranean beauty',
      'Sicilia': 'Ancient ruins and Mediterranean magic',
      'Toscana': 'Rolling hills and Renaissance art',
      'Trentino-Alto Adige': 'Alpine majesty and bilingual culture',
      'Umbria': 'Spiritual heritage and green countryside',
      'Valle d\'Aosta': 'Alpine adventure and Franco-Italian charm',
      'Veneto': 'Venetian splendor and northern prosperity',
    };
    return taglines[region] || 'Discover Italian excellence';
  }

  async generateRegionPage(region, language, outputPath) {
    try {
      // Load dataset
      const dataset = await this.dataLoader.loadDataset();
      const provinces = dataset.filter(p => p.Region === region && p.Name && !p.Name.includes('AVG'));

      if (provinces.length === 0) {
        console.warn(`⚠️  No provinces found for region: ${region}`);
        return { success: false, region, error: 'No provinces found' };
      }

      // Build region data
      const regionData = this.buildRegionData(region, provinces);

      // Setup i18n to specific language
      await i18next.changeLanguage(language);

      // Prepare context
      const context = {
        language,
        region: regionData,
        provinces,
        t: (key) => i18next.t(key),
        title: `${region} - Italian Region | Expiter`,
        description: regionData.description,
        url: `https://expiter.com/${language}/region/${regionData.slug}.html`,
        seo: this.seoBuilder.buildMetaTags({
          name: region,
          slug: regionData.slug,
          region: region,
          quality: { healthcare: regionData.stats.healthcare, safety: regionData.stats.safety },
        }),
      };

      // Render template
      const html = this.nunjucksEnv.render('layouts/region-detail.njk', context);

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

      if (!this.stats.regions[region]) {
        this.stats.regions[region] = { files: 0, size: 0 };
      }
      this.stats.regions[region].files++;
      this.stats.regions[region].size += fileSize;

      return {
        success: true,
        region,
        file: path.basename(outputPath),
        size: fileSize,
      };
    } catch (error) {
      console.error(`✗ Error generating region page for ${region} (${language}):`, error.message);
      return {
        success: false,
        region,
        language,
        error: error.message,
      };
    }
  }

  async generateRegionPages(language) {
    console.log(`\n📄 Generating ${language.toUpperCase()} region pages...`);
    await this.ensureOutputDirectories(language);

    const limit = pLimit(this.concurrency);
    const tasks = ITALIAN_REGIONS.map(region =>
      limit(() => {
        const outputPath = path.join(__dirname, `../../output/${language}/region/${this.toSlug(region)}.html`);
        return this.generateRegionPage(region, language, outputPath);
      })
    );

    const results = await Promise.all(tasks);
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    console.log(`  ✓ ${successful}/${results.length} pages generated`);
    if (failed > 0) {
      console.log(`  ✗ ${failed} pages failed`);
    }

    return {
      language,
      successful,
      failed,
      total: results.length,
      results,
    };
  }

  async generateAllLanguages(languages = ['en', 'it', 'de', 'es', 'fr']) {
    this.stats.startTime = Date.now();
    console.log(`\n🌍 Generating region pages for ${languages.length} languages (${ITALIAN_REGIONS.length} regions)...\n`);

    const results = [];

    for (const language of languages) {
      const result = await this.generateRegionPages(language);
      results.push(result);
    }

    this.stats.endTime = Date.now();
    const duration = (this.stats.endTime - this.stats.startTime) / 1000;

    console.log(`\n✓ Region generation complete!`);
    console.log(`  Files: ${this.stats.filesGenerated} (${ITALIAN_REGIONS.length} regions × ${languages.length} languages)`);
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

  toSlug(text) {
    if (!text) return '';
    return text
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
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

export default RegionGenerator;
