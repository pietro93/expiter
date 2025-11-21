import path from 'path';
import ProvinceFormatter from './formatter.js';

/**
 * URL Helper Utility
 * Handles URL and output path generation for legacy site compatibility
 * 
 * URL Structures:
 * - English Provinces: /province/[slug]/  -> output/province/[slug]/index.html
 * - Other Languages Provinces: /[lang]/province/[slug]/ -> output/[lang]/province/[slug]/index.html
 * - English Towns: /comuni/[province]/[town]/ -> output/comuni/[province]/[town]/index.html
 * - Other Languages Towns: /[lang]/comuni/[province]/[town]/ -> output/[lang]/comuni/[province]/[town]/index.html
 */
class UrlHelper {
  /**
   * Get the output directory path for a generated file
   * Handles language-specific routing
   * 
   * @param {string} type - Type of page: 'province', 'town', 'region', 'index', 'region-index'
   * @param {string} slug - URL slug(s) - can be single slug or path (e.g., 'roma' or 'bologna/bologna')
   * @param {string} language - Language code (en, it, de, es, fr)
   * @param {string} baseDir - Base output directory (default: 'output')
   * @returns {string} Full output file path
   */
  static getOutputPath(type, slug, language = 'en', baseDir = 'output') {
    if (!slug) {
      throw new Error('Slug is required for URL generation');
    }

    const baseOutput = baseDir;

    switch (type) {
      case 'province':
        // English: output/province/[slug]/index.html
        // Other languages: output/[lang]/province/[slug]/index.html
        if (language === 'en') {
          return path.join(baseOutput, 'province', slug, 'index.html');
        }
        return path.join(baseOutput, language, 'province', slug, 'index.html');

      case 'town':
        // Town/Comune structure: /comuni/[province]/[town]/
        // English: output/comuni/[province]/[town]/index.html
        // Other languages: output/[lang]/comuni/[province]/[town]/index.html
        if (language === 'en') {
          return path.join(baseOutput, 'comuni', slug, 'index.html');
        }
        return path.join(baseOutput, language, 'comuni', slug, 'index.html');

      case 'region':
        // Region pages: /region/[slug]/
        // English: output/region/[slug]/index.html
        // Other languages: output/[lang]/region/[slug]/index.html
        if (language === 'en') {
          return path.join(baseOutput, 'region', slug, 'index.html');
        }
        return path.join(baseOutput, language, 'region', slug, 'index.html');

      case 'index':
        // Home page index
        // English: output/index.html
        // Other languages: output/[lang]/index.html
        if (language === 'en') {
          return path.join(baseOutput, 'index.html');
        }
        return path.join(baseOutput, language, 'index.html');

      case 'region-index':
        // Region listing index
        // English: output/region/index.html
        // Other languages: output/[lang]/region/index.html
        if (language === 'en') {
          return path.join(baseOutput, 'region', 'index.html');
        }
        return path.join(baseOutput, language, 'region', 'index.html');

      case 'comparison':
        // Comparison pages: /compare/[slug1]-vs-[slug2]/
        // English: output/compare/[slug]/index.html
        // Other languages: output/[lang]/compare/[slug]/index.html
        if (language === 'en') {
          return path.join(baseOutput, 'compare', slug, 'index.html');
        }
        return path.join(baseOutput, language, 'compare', slug, 'index.html');

      default:
        // Fallback for unknown types
        if (language === 'en') {
          return path.join(baseOutput, type, `${slug}.html`);
        }
        return path.join(baseOutput, language, type, `${slug}.html`);
    }
  }

  /**
   * Get the canonical URL for a page (without .html extension)
   * Used in SEO meta tags
   * 
   * @param {string} type - Type of page: 'province', 'town', 'region', 'index'
   * @param {string} slug - URL slug(s)
   * @param {string} language - Language code
   * @param {string} domain - Domain (default: 'https://expiter.com')
   * @returns {string} Canonical URL
   */
  static getCanonicalUrl(type, slug, language = 'en', domain = 'https://expiter.com') {
    if (!slug && type !== 'index' && type !== 'region-index') {
      throw new Error('Slug is required for URL generation');
    }

    // Remove trailing slashes for consistency
    const cleanDomain = domain.replace(/\/$/, '');
    const langPrefix = language === 'en' ? '' : `/${language}`;

    switch (type) {
      case 'province':
        return `${cleanDomain}${langPrefix}/province/${slug}/`;

      case 'town':
        return `${cleanDomain}${langPrefix}/comuni/${slug}/`;

      case 'region':
        return `${cleanDomain}${langPrefix}/region/${slug}/`;

      case 'index':
        if (language === 'en') {
          return `${cleanDomain}/`;
        }
        return `${cleanDomain}/${language}/`;

      case 'region-index':
        if (language === 'en') {
          return `${cleanDomain}/region/`;
        }
        return `${cleanDomain}/${language}/region/`;

      case 'comparison':
        if (language === 'en') {
          return `${cleanDomain}/compare/${slug}/`;
        }
        return `${cleanDomain}/${language}/compare/${slug}/`;

      default:
        if (language === 'en') {
          return `${cleanDomain}/${type}/${slug}/`;
        }
        return `${cleanDomain}/${language}/${type}/${slug}/`;
    }
  }

  /**
   * Format town slug from province and town names
   * Combines province and town slugs for the path structure
   * 
   * @param {string} provinceName - Province name
   * @param {string} townName - Town name
   * @returns {string} Combined slug for the path (e.g., 'bologna/bologna')
   */
  static formatTownSlug(provinceName, townName) {
    const provinceSlug = ProvinceFormatter.toSlug(provinceName);
    const townSlug = ProvinceFormatter.toSlug(townName);
    return `${provinceSlug}/${townSlug}`;
  }

  /**
   * Parse a town slug back into components
   * 
   * @param {string} townSlug - Combined slug (e.g., 'bologna/bologna')
   * @returns {object} Object with province and town properties
   */
  static parseTownSlug(townSlug) {
    const parts = townSlug.split('/');
    if (parts.length !== 2) {
      throw new Error('Invalid town slug format. Expected "province/town"');
    }
    return {
      province: parts[0],
      town: parts[1],
    };
  }
}

export default UrlHelper;
