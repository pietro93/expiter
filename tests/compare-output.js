import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Output Size Comparator - Compares new output with legacy output
 */
class OutputComparator {
  constructor(outputDir = path.join(process.cwd(), 'output')) {
    this.outputDir = outputDir;
    this.stats = {
      new: {
        totalSize: 0,
        fileCount: 0,
        languages: {},
      },
      legacy: {
        totalSize: 0,
        fileCount: 0,
        languages: {},
      },
    };
  }

  /**
   * Get size of all files in a directory recursively
   * @param {string} dir - Directory path
   * @returns {object} Size statistics
   */
  getDirectorySize(dir) {
    if (!fs.existsSync(dir)) {
      return { totalSize: 0, fileCount: 0, htmlCount: 0, xmlCount: 0 };
    }

    let totalSize = 0;
    let fileCount = 0;
    let htmlCount = 0;
    let xmlCount = 0;

    const files = fs.readdirSync(dir, { withFileTypes: true });

    files.forEach(file => {
      const fullPath = path.join(dir, file.name);

      if (file.isDirectory()) {
        const subStats = this.getDirectorySize(fullPath);
        totalSize += subStats.totalSize;
        fileCount += subStats.fileCount;
        htmlCount += subStats.htmlCount;
        xmlCount += subStats.xmlCount;
      } else {
        const fileSize = fs.statSync(fullPath).size;
        totalSize += fileSize;
        fileCount++;

        if (file.name.endsWith('.html')) {
          htmlCount++;
        } else if (file.name.endsWith('.xml')) {
          xmlCount++;
        }
      }
    });

    return { totalSize, fileCount, htmlCount, xmlCount };
  }

  /**
   * Get detailed statistics for a language directory
   * @param {string} langDir - Language directory path
   * @returns {object} Detailed statistics
   */
  getLanguageStats(langDir) {
    if (!fs.existsSync(langDir)) {
      return {
        htmlCount: 0,
        provinces: 0,
        regions: 0,
        safety: 0,
        other: 0,
        totalSize: 0,
      };
    }

    let stats = {
      htmlCount: 0,
      provinces: 0,
      regions: 0,
      safety: 0,
      other: 0,
      totalSize: 0,
    };

    // Count province files
    const provinceDir = path.join(langDir, 'province');
    if (fs.existsSync(provinceDir)) {
      const files = fs.readdirSync(provinceDir, { withFileTypes: true });
      files.forEach(f => {
        if (f.isFile() && f.name.endsWith('.html')) {
          stats.provinces++;
          stats.htmlCount++;
          stats.totalSize += fs.statSync(path.join(provinceDir, f.name)).size;
        }
      });
    }

    // Count region files
    const regionDir = path.join(langDir, 'region');
    if (fs.existsSync(regionDir)) {
      const files = fs.readdirSync(regionDir, { withFileTypes: true });
      files.forEach(f => {
        if (f.isFile() && f.name.endsWith('.html')) {
          stats.regions++;
          stats.htmlCount++;
          stats.totalSize += fs.statSync(path.join(regionDir, f.name)).size;
        }
      });
    }

    // Count safety files
    const safetyDir = path.join(langDir, 'safety');
    if (fs.existsSync(safetyDir)) {
      const files = fs.readdirSync(safetyDir, { withFileTypes: true });
      files.forEach(f => {
        if (f.isFile() && f.name.endsWith('.html')) {
          stats.safety++;
          stats.htmlCount++;
          stats.totalSize += fs.statSync(path.join(safetyDir, f.name)).size;
        }
      });
    }

    // Count index files
    const indexFile = path.join(langDir, 'index.html');
    if (fs.existsSync(indexFile)) {
      stats.htmlCount++;
      stats.other++;
      stats.totalSize += fs.statSync(indexFile).size;
    }

    return stats;
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
   * Calculate percentage change
   * @param {number} oldValue - Old value
   * @param {number} newValue - New value
   * @returns {string} Percentage change
   */
  percentChange(oldValue, newValue) {
    if (oldValue === 0) return newValue > 0 ? '+100%' : '0%';
    const change = ((newValue - oldValue) / oldValue) * 100;
    const sign = change >= 0 ? '+' : '';
    return sign + change.toFixed(1) + '%';
  }

  /**
   * Run comparison
   * @returns {object} Comparison results
   */
  compare() {
    const languages = ['en', 'it', 'de', 'es', 'fr'];

    console.log('📊 OUTPUT SIZE COMPARISON\n');
    console.log('═════════════════════════════════════════\n');

    // New output stats
    console.log('📁 NEW OUTPUT STATISTICS\n');
    let newTotalSize = 0;
    let newTotalFiles = 0;
    let newTotalHtml = 0;

    languages.forEach(lang => {
      const langDir = path.join(this.outputDir, lang);
      const stats = this.getLanguageStats(langDir);

      if (stats.htmlCount > 0) {
        console.log(`${lang.toUpperCase()}:`);
        console.log(`  Files: ${stats.htmlCount} (provinces: ${stats.provinces}, regions: ${stats.regions}, safety: ${stats.safety}, other: ${stats.other})`);
        console.log(`  Size: ${this.formatBytes(stats.totalSize)}`);
        console.log('');

        newTotalSize += stats.totalSize;
        newTotalHtml += stats.htmlCount;
      }
    });

    // Count sitemaps
    const sitemapFile = path.join(this.outputDir, 'sitemap_index.xml');
    let sitemapSize = 0;
    if (fs.existsSync(sitemapFile)) {
      sitemapSize = fs.statSync(sitemapFile).size;
      newTotalSize += sitemapSize;
    }

    languages.forEach(lang => {
      const sitemapFile = path.join(this.outputDir, lang, 'sitemap.xml');
      if (fs.existsSync(sitemapFile)) {
        const size = fs.statSync(sitemapFile).size;
        newTotalSize += size;
      }
    });

    console.log('📊 TOTAL NEW OUTPUT');
    console.log(`  Size: ${this.formatBytes(newTotalSize)}`);
    console.log(`  HTML files: ${newTotalHtml}`);
    console.log(`  XML sitemaps: 6`);
    console.log(`  Total files: ${newTotalHtml + 6}\n`);

    // Return summary
    return {
      newOutput: {
        size: newTotalSize,
        sizeFormatted: this.formatBytes(newTotalSize),
        htmlFiles: newTotalHtml,
        sitemaps: 6,
        totalFiles: newTotalHtml + 6,
      },
      target: {
        files: 650,
        description: 'Minimum target files',
      },
      analysis: {
        meetsTarget: (newTotalHtml + 6) >= 650,
        filesAboveTarget: (newTotalHtml + 6) - 650,
      },
    };
  }
}

// Main execution
async function main() {
  const comparator = new OutputComparator();
  const result = comparator.compare();

  console.log('✅ ANALYSIS');
  console.log('═════════════════════════════════════════');
  console.log(`Target minimum files: ${result.target.files}`);
  console.log(`Actual total files: ${result.newOutput.totalFiles}`);

  if (result.analysis.meetsTarget) {
    console.log(`✅ MEETS TARGET (+${result.analysis.filesAboveTarget} files above minimum)\n`);
  } else {
    console.log(`❌ BELOW TARGET (need ${result.target.files - result.newOutput.totalFiles} more files)\n`);
  }
}

main();

export default OutputComparator;
