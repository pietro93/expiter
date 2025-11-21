import fs from 'fs';
import path from 'path';
import DataLoader from '../utils/data-loader.js';
import ProvinceFormatter from '../utils/formatter.js';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * SearchIndexGenerator - Generates optimized JSON search indices
 * 
 * Features:
 * - Minimized JSON structure for small file size
 * - Multi-language support
 * - Searchable by province and town
 */
class SearchIndexGenerator {
  constructor(options = {}) {
    this.outputDir = options.outputDir || path.join(process.cwd(), 'output');
    this.assetsDir = path.join(this.outputDir, 'assets');
    this.dataLoader = null;
    this.initialized = false;
  }

  /**
   * Initialize the generator
   */
  async initialize() {
    if (this.initialized) return;

    this.dataLoader = new DataLoader();

    // Ensure assets directory exists
    if (!fs.existsSync(this.assetsDir)) {
      fs.mkdirSync(this.assetsDir, { recursive: true });
    }

    this.initialized = true;
    console.log('✓ SearchIndexGenerator initialized');
  }

  /**
   * Generate search index for a language
   * @param {string} language - Language code
   * @returns {Promise<object>} Generation statistics
   */
  async generateIndex(language = 'en') {
    if (!this.initialized) {
      await this.initialize();
    }

    console.log(`\n🔍 Generating search index for ${language}...`);

    try {
      const provinces = await this.dataLoader.loadDataset();
      const comuni = await this.dataLoader.loadComuni();

      // Build index with minimized structure
      const index = [];

      // Add provinces
      let provinceCount = 0;
      if (Array.isArray(provinces)) {
        provinces.forEach(p => {
          const slug = ProvinceFormatter.toSlug(p.name || p.Name || '');
          index.push({
            t: 'p', // type: province
            n: p.name || p.Name,
            s: slug,
            u: `/province/${slug}/`,
            r: p.region || p.Region || ''
          });
          provinceCount++;
        });
      } else {
        Object.values(provinces).forEach(p => {
          const slug = ProvinceFormatter.toSlug(p.name || p.Name || '');
          index.push({
            t: 'p',
            n: p.name || p.Name,
            s: slug,
            u: `/province/${slug}/`,
            r: p.region || p.Region || ''
          });
          provinceCount++;
        });
      }

      // Add towns (comuni)
      let comuniCount = 0;
      if (Array.isArray(comuni)) {
        comuni.forEach(c => {
          const townName = c.name || c.Name || '';
          const provinceName = c.province || c.Province || 'Lazio'; // Default province
          
          if (townName) {
            const townSlug = ProvinceFormatter.toSlug(townName);
            const provinceSlug = ProvinceFormatter.toSlug(provinceName);
            
            index.push({
              t: 't', // type: town
              n: townName,
              s: `${provinceSlug}/${townSlug}`,
              u: `/comuni/${provinceSlug}/${townSlug}/`,
              p: provinceName
            });
            comuniCount++;
          }
        });
      }

      // Write index file
      const indexPath = path.join(this.assetsDir, `search-index-${language}.json`);
      const indexJson = JSON.stringify(index);
      fs.writeFileSync(indexPath, indexJson, 'utf8');

      const stats = {
        language,
        success: true,
        indexSize: Buffer.byteLength(indexJson, 'utf8'),
        totalEntries: index.length,
        provinces: provinceCount,
        towns: comuniCount,
        filePath: indexPath,
      };

      console.log(`  ✓ Generated search index with ${stats.totalEntries} entries`);
      console.log(`    - Provinces: ${provinceCount}`);
      console.log(`    - Towns: ${comuniCount}`);
      console.log(`    - File size: ${this.formatBytes(stats.indexSize)}`);

      return stats;
    } catch (error) {
      console.error(`  ✗ Error generating index: ${error.message}`);
      return {
        language,
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Generate search indices for multiple languages
   * @param {array} languages - Array of language codes
   * @returns {Promise<object>} Combined statistics
   */
  async generateAllLanguages(languages = ['en', 'it', 'de', 'es', 'fr']) {
    if (!this.initialized) {
      await this.initialize();
    }

    console.log(`\n🚀 Generating search indices for ${languages.length} languages...`);
    const startTime = Date.now();

    const results = {};
    for (const language of languages) {
      results[language] = await this.generateIndex(language);
    }

    const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
    const successCount = Object.values(results).filter(r => r.success).length;

    console.log(`\n✨ Search index generation complete!`);
    console.log(`  ⏱️  Total time: ${totalTime}s`);
    console.log(`  ✅ Successful: ${successCount}/${languages.length}`);

    return {
      startTime: new Date().toISOString(),
      duration: `${totalTime}s`,
      languages: results,
      summary: {
        successful: successCount,
        failed: languages.length - successCount,
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
    this.dataLoader = null;
    this.initialized = false;
  }
}

export default SearchIndexGenerator;
