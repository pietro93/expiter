import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

/**
 * OutputComparator - Manages snapshot testing for generated HTML output
 * 
 * Features:
 * - Captures and stores HTML snapshots
 * - Compares new output against saved snapshots
 * - Generates diff reports
 * - Tracks file sizes and modification times
 */
class OutputComparator {
  constructor(snapshotsDir = './tests/snapshots') {
    this.snapshotsDir = snapshotsDir;
    this.ensureSnapshotsDir();
  }

  /**
   * Ensures snapshots directory exists
   */
  ensureSnapshotsDir() {
    if (!fs.existsSync(this.snapshotsDir)) {
      fs.mkdirSync(this.snapshotsDir, { recursive: true });
    }
  }

  /**
   * Generate a consistent filename for snapshot storage
   * @param {string} identifier - Unique identifier (province name, page type, etc.)
   * @param {string} language - Language code (en, it, de, es, fr)
   * @returns {string} Filename for snapshot
   */
  getSnapshotFilename(identifier, language = 'en') {
    // Map of special characters to ASCII equivalents (for international characters)
    const charMap = {
      'ü': 'u', 'ö': 'o', 'ä': 'a', 'ß': 'ss',
      'á': 'a', 'à': 'a', 'â': 'a', 'ã': 'a', 'å': 'a',
      'é': 'e', 'è': 'e', 'ê': 'e', 'ë': 'e',
      'í': 'i', 'ì': 'i', 'î': 'i', 'ï': 'i',
      'ó': 'o', 'ò': 'o', 'ô': 'o', 'õ': 'o',
      'ú': 'u', 'ù': 'u', 'û': 'u',
      'ç': 'c', 'ñ': 'n'
    };

    let sanitized = identifier.toLowerCase();

    // Replace special characters
    for (const [char, replacement] of Object.entries(charMap)) {
      sanitized = sanitized.replace(new RegExp(char, 'g'), replacement);
    }

    // Replace remaining non-alphanumeric with dashes
    sanitized = sanitized
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    return `snapshot-${sanitized}-${language}.html`;
  }

  /**
   * Get metadata filename for snapshot
   * @param {string} identifier - Unique identifier
   * @param {string} language - Language code
   * @returns {string} Metadata filename
   */
  getMetadataFilename(identifier, language = 'en') {
    const snapshotFile = this.getSnapshotFilename(identifier, language);
    return snapshotFile.replace('.html', '.json');
  }

  /**
   * Capture and save an HTML snapshot
   * @param {string} html - HTML content to save
   * @param {string} identifier - Unique identifier for this snapshot
   * @param {string} language - Language code
   * @param {object} metadata - Additional metadata (optional)
   * @returns {object} Snapshot info
   */
  captureSnapshot(html, identifier, language = 'en', metadata = {}) {
    const filename = this.getSnapshotFilename(identifier, language);
    const filepath = path.join(this.snapshotsDir, filename);
    
    const snapshot = {
      timestamp: new Date().toISOString(),
      identifier,
      language,
      size: Buffer.byteLength(html, 'utf8'),
      hash: crypto.createHash('sha256').update(html).digest('hex'),
      lineCount: html.split('\n').length,
      ...metadata
    };

    // Save HTML
    fs.writeFileSync(filepath, html, 'utf8');

    // Save metadata
    const metadataFilename = this.getMetadataFilename(identifier, language);
    const metadataPath = path.join(this.snapshotsDir, metadataFilename);
    fs.writeFileSync(metadataPath, JSON.stringify(snapshot, null, 2), 'utf8');

    return snapshot;
  }

  /**
   * Load a saved snapshot
   * @param {string} identifier - Unique identifier
   * @param {string} language - Language code
   * @returns {object|null} Snapshot object or null if not found
   */
  loadSnapshot(identifier, language = 'en') {
    const filename = this.getSnapshotFilename(identifier, language);
    const filepath = path.join(this.snapshotsDir, filename);

    if (!fs.existsSync(filepath)) {
      return null;
    }

    const html = fs.readFileSync(filepath, 'utf8');
    const metadataFilename = this.getMetadataFilename(identifier, language);
    const metadataPath = path.join(this.snapshotsDir, metadataFilename);

    let metadata = {};
    if (fs.existsSync(metadataPath)) {
      metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
    }

    return {
      html,
      ...metadata
    };
  }

  /**
   * Compare new output against saved snapshot
   * @param {string} newHtml - New HTML content
   * @param {string} identifier - Unique identifier
   * @param {string} language - Language code
   * @returns {object} Comparison results
   */
  compareSnapshots(newHtml, identifier, language = 'en') {
    const saved = this.loadSnapshot(identifier, language);

    if (!saved) {
      return {
        status: 'new',
        message: 'No saved snapshot found',
        identifier,
        language
      };
    }

    const newHash = crypto.createHash('sha256').update(newHtml).digest('hex');
    const sizeNew = Buffer.byteLength(newHtml, 'utf8');
    const sizeDiff = sizeNew - saved.size;
    const sizeDiffPercent = saved.size > 0 ? ((sizeDiff / saved.size) * 100).toFixed(2) : 0;

    const matches = newHash === saved.hash;

    return {
      status: matches ? 'unchanged' : 'changed',
      matches,
      identifier,
      language,
      newHash,
      oldHash: saved.hash,
      newSize: sizeNew,
      oldSize: saved.size,
      sizeDiff,
      sizeDiffPercent: `${sizeDiffPercent}%`,
      oldLineCount: saved.lineCount,
      newLineCount: newHtml.split('\n').length
    };
  }

  /**
   * Generate a diff report between old and new HTML
   * @param {string} newHtml - New HTML content
   * @param {string} identifier - Unique identifier
   * @param {string} language - Language code
   * @returns {string} Diff report
   */
  generateDiffReport(newHtml, identifier, language = 'en') {
    const saved = this.loadSnapshot(identifier, language);

    if (!saved) {
      return `No saved snapshot found for ${identifier} (${language})`;
    }

    const oldLines = saved.html.split('\n');
    const newLines = newHtml.split('\n');

    let report = `DIFF REPORT: ${identifier} (${language})\n`;
    report += `Generated: ${new Date().toISOString()}\n`;
    report += `Old lines: ${oldLines.length}, New lines: ${newLines.length}\n\n`;

    // Simple line-by-line diff
    const maxLines = Math.max(oldLines.length, newLines.length);
    let diffCount = 0;

    for (let i = 0; i < maxLines; i++) {
      if ((oldLines[i] || '') !== (newLines[i] || '')) {
        diffCount++;
        if (diffCount <= 10) { // Show first 10 diffs
          report += `Line ${i + 1}:\n`;
          report += `- ${oldLines[i] || '[missing]'}\n`;
          report += `+ ${newLines[i] || '[missing]'}\n`;
        }
      }
    }

    if (diffCount > 10) {
      report += `\n... and ${diffCount - 10} more differences\n`;
    }

    report += `\nTotal differences: ${diffCount}`;

    return report;
  }

  /**
   * Get all snapshots for a language
   * @param {string} language - Language code
   * @returns {array} List of snapshot identifiers
   */
  getSnapshotsByLanguage(language = 'en') {
    const files = fs.readdirSync(this.snapshotsDir);
    const pattern = new RegExp(`^snapshot-.*-${language}\\.html$`);
    
    return files
      .filter(f => pattern.test(f))
      .map(f => f.replace(`-${language}.html`, '').replace('snapshot-', ''));
  }

  /**
   * Get all available snapshots
   * @returns {object} Snapshots organized by language
   */
  getAllSnapshots() {
    const files = fs.readdirSync(this.snapshotsDir);
    const snapshots = {};

    files.forEach(file => {
      if (file.endsWith('.html')) {
        const match = file.match(/^snapshot-(.+)-([a-z]{2})\.html$/);
        if (match) {
          const [, identifier, language] = match;
          if (!snapshots[language]) {
            snapshots[language] = [];
          }
          snapshots[language].push(identifier);
        }
      }
    });

    return snapshots;
  }

  /**
   * Clear snapshots for a specific identifier
   * @param {string} identifier - Unique identifier
   * @param {string} language - Language code (optional, undefined = all languages)
   * @returns {number} Number of files deleted
   */
  clearSnapshots(identifier, language = undefined) {
    let deleted = 0;

    const languages = language ? [language] : ['en', 'it', 'de', 'es', 'fr'];

    languages.forEach(lang => {
      const htmlFile = path.join(this.snapshotsDir, this.getSnapshotFilename(identifier, lang));
      const jsonFile = path.join(this.snapshotsDir, this.getMetadataFilename(identifier, lang));

      if (fs.existsSync(htmlFile)) {
        fs.unlinkSync(htmlFile);
        deleted++;
      }

      if (fs.existsSync(jsonFile)) {
        fs.unlinkSync(jsonFile);
        deleted++;
      }
    });

    return deleted;
  }

  /**
   * Generate snapshot statistics
   * @returns {object} Statistics about snapshots
   */
  getStatistics() {
    const files = fs.readdirSync(this.snapshotsDir);
    const stats = {
      totalFiles: files.length,
      htmlFiles: 0,
      jsonFiles: 0,
      byLanguage: {}
    };

    files.forEach(file => {
      if (file.endsWith('.html')) {
        stats.htmlFiles++;
        const match = file.match(/-([a-z]{2})\.html$/);
        if (match) {
          const lang = match[1];
          stats.byLanguage[lang] = (stats.byLanguage[lang] || 0) + 1;
        }
      } else if (file.endsWith('.json')) {
        stats.jsonFiles++;
      }
    });

    return stats;
  }

  /**
   * Validate snapshot integrity
   * @returns {object} Validation results
   */
  validateSnapshots() {
    const files = fs.readdirSync(this.snapshotsDir);
    const results = {
      valid: 0,
      invalid: 0,
      orphaned: 0,
      issues: []
    };

    files.forEach(file => {
      if (file.endsWith('.html')) {
        const jsonFile = file.replace('.html', '.json');
        const jsonPath = path.join(this.snapshotsDir, jsonFile);

        if (!fs.existsSync(jsonPath)) {
          results.orphaned++;
          results.issues.push(`Missing metadata: ${file}`);
        } else {
          results.valid++;
        }
      } else if (file.endsWith('.json')) {
        const htmlFile = file.replace('.json', '.html');
        const htmlPath = path.join(this.snapshotsDir, htmlFile);

        if (!fs.existsSync(htmlPath)) {
          results.orphaned++;
          results.issues.push(`Missing HTML: ${file}`);
        }
      }
    });

    return results;
  }
}

export default OutputComparator;
