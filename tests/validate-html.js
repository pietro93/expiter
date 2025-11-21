import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * HTML Validator - Validates generated HTML files for basic structure
 */
class HTMLValidator {
  constructor(outputDir = path.join(process.cwd(), 'output')) {
    this.outputDir = outputDir;
    this.results = {
      total: 0,
      valid: 0,
      invalid: 0,
      errors: [],
      warnings: [],
    };
  }

  /**
   * Validate basic HTML structure
   * @param {string} filename - HTML file path
   * @param {string} content - HTML file content
   * @returns {object} Validation result
   */
  validateHTML(filename, content) {
    const errors = [];
    const warnings = [];

    // Check for DOCTYPE
    if (!content.match(/<!DOCTYPE\s+html>/i)) {
      errors.push('Missing DOCTYPE declaration');
    }

    // Check for html tags
    if (!content.match(/<html[^>]*>/i)) {
      errors.push('Missing <html> tag');
    }

    if (!content.match(/<\/html>/i)) {
      errors.push('Missing closing </html> tag');
    }

    // Check for head section
    if (!content.match(/<head[^>]*>/i)) {
      errors.push('Missing <head> tag');
    }

    if (!content.match(/<\/head>/i)) {
      errors.push('Missing closing </head> tag');
    }

    // Check for body section
    if (!content.match(/<body[^>]*>/i)) {
      errors.push('Missing <body> tag');
    }

    if (!content.match(/<\/body>/i)) {
      errors.push('Missing closing </body> tag');
    }

    // Check for title
    if (!content.match(/<title[^>]*>.*?<\/title>/i)) {
      warnings.push('Missing or empty <title> tag');
    }

    // Check for meta charset
    if (!content.match(/<meta\s+charset/i)) {
      warnings.push('Missing charset meta tag');
    }

    // Check for proper tag nesting (basic check)
    const tagStack = [];
    const tagRegex = /<(\/?)(\w+)[^>]*>/g;
    let match;

    while ((match = tagRegex.exec(content)) !== null) {
      const [, isClosing, tagName] = match;
      const normalizedTag = tagName.toLowerCase();

      if (isClosing) {
        if (tagStack.length > 0 && tagStack[tagStack.length - 1] === normalizedTag) {
          tagStack.pop();
        }
      } else {
        // Only push structural tags
        if (['html', 'head', 'body', 'div', 'main', 'section', 'article'].includes(normalizedTag)) {
          tagStack.push(normalizedTag);
        }
      }
    }

    if (tagStack.length > 0) {
      warnings.push(`Potentially unclosed tags: ${tagStack.join(', ')}`);
    }

    return {
      filename,
      valid: errors.length === 0,
      errorCount: errors.length,
      warningCount: warnings.length,
      errors,
      warnings,
      size: content.length,
    };
  }

  /**
   * Recursively validate all HTML files in a directory
   * @param {string} dir - Directory to scan
   */
  validateDirectory(dir) {
    if (!fs.existsSync(dir)) {
      console.log(`⚠️  Directory not found: ${dir}`);
      return;
    }

    const files = fs.readdirSync(dir, { withFileTypes: true });

    files.forEach(file => {
      const fullPath = path.join(dir, file.name);

      if (file.isDirectory()) {
        this.validateDirectory(fullPath);
      } else if (file.name.endsWith('.html')) {
        const content = fs.readFileSync(fullPath, 'utf8');
        const result = this.validateHTML(fullPath, content);

        this.results.total++;
        if (result.valid) {
          this.results.valid++;
        } else {
          this.results.invalid++;
          this.results.errors.push(result);
        }

        // Collect warnings
        if (result.warningCount > 0) {
          this.results.warnings.push({
            filename: fullPath,
            warnings: result.warnings,
          });
        }
      }
    });
  }

  /**
   * Run full validation on output directory
   * @param {array} languages - Language codes to validate
   * @returns {object} Validation summary
   */
  validateAll(languages = ['en', 'it', 'de', 'es', 'fr']) {
    console.log('🔍 Starting HTML Validation\n');
    console.log('═════════════════════════════════════════\n');

    const startTime = Date.now();

    languages.forEach(lang => {
      const langDir = path.join(this.outputDir, lang);
      if (fs.existsSync(langDir)) {
        console.log(`📋 Validating ${lang}...`);
        this.validateDirectory(langDir);
      }
    });

    const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);

    return {
      duration: totalTime,
      summary: this.results,
    };
  }

  /**
   * Print validation report
   * @param {object} result - Validation result
   */
  printReport(result) {
    const { duration, summary } = result;
    const { total, valid, invalid, errors, warnings } = summary;
    const passRate = total > 0 ? ((valid / total) * 100).toFixed(1) : 0;

    console.log('\n\n📊 VALIDATION REPORT');
    console.log('═════════════════════════════════════════\n');

    console.log(`Total files scanned:     ${total}`);
    console.log(`Valid files:             ${valid} (${passRate}%)`);
    console.log(`Invalid files:           ${invalid}`);
    console.log(`Warnings:                ${warnings.length}`);
    console.log(`Duration:                ${duration}s\n`);

    if (invalid > 0) {
      console.log('❌ INVALID FILES:\n');
      errors.slice(0, 10).forEach(err => {
        console.log(`  📄 ${err.filename}`);
        err.errors.forEach(e => console.log(`     • ${e}`));
      });

      if (errors.length > 10) {
        console.log(`\n  ... and ${errors.length - 10} more invalid files\n`);
      }
    }

    if (warnings.length > 0) {
      console.log('⚠️  WARNINGS:\n');
      warnings.slice(0, 5).forEach(warn => {
        console.log(`  📄 ${warn.filename}`);
        warn.warnings.forEach(w => console.log(`     • ${w}`));
      });

      if (warnings.length > 5) {
        console.log(`\n  ... and ${warnings.length - 5} more files with warnings\n`);
      }
    }

    if (invalid === 0) {
      console.log('✅ ALL FILES PASSED VALIDATION!\n');
    } else {
      console.log(`\n❌ ${invalid} file(s) need fixing\n`);
    }

    return {
      passed: invalid === 0,
      passRate: parseFloat(passRate),
      validFiles: valid,
      invalidFiles: invalid,
    };
  }

  /**
   * Export results as JSON
   * @param {string} outputPath - Path to save JSON report
   * @param {object} result - Validation result
   */
  exportJSON(outputPath, result) {
    const report = {
      timestamp: new Date().toISOString(),
      duration: result.duration,
      summary: result.summary,
      details: {
        errorFiles: result.summary.errors.slice(0, 20),
        warningFiles: result.summary.warnings.slice(0, 20),
      },
    };

    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2), 'utf8');
    console.log(`📋 Report exported to: ${outputPath}\n`);
  }
}

// Main execution
async function main() {
  const validator = new HTMLValidator();
  const result = validator.validateAll();
  const report = validator.printReport(result);

  // Export JSON report
  const reportPath = path.join(process.cwd(), 'validation-report.json');
  validator.exportJSON(reportPath, result);

  // Exit with appropriate code
  process.exit(report.passed ? 0 : 1);
}

// Only run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default HTMLValidator;
