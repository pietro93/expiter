/**
 * Nunjucks Template Engine Configuration
 * Sets up the Nunjucks environment with custom filters and extensions
 */

import nunjucks from 'nunjucks';
import path from 'path';

function setupNunjucks() {
  const templatesPath = path.join(import.meta.url, '../../templates');

  const env = nunjucks.configure(templatesPath, {
    autoescape: true,
    trimBlocks: true,
    lstripBlocks: true,
    watch: false,
    noCache: process.env.NODE_ENV !== 'production',
  });

  /**
   * Custom filter: isExcellent
   * Checks if a numeric value meets or exceeds a quality threshold
   */
  env.addFilter('isExcellent', (value, threshold = 8) => {
    return value >= threshold;
  });

  /**
   * Custom filter: isSafe
   * Checks if a safety rating meets or exceeds a threshold
   */
  env.addFilter('isSafe', (value, threshold = 7) => {
    return value >= threshold;
  });

  /**
   * Custom filter: formatCurrency
   * Formats a number as currency in the specified locale
   */
  env.addFilter('formatCurrency', (value, locale = 'en-US') => {
    if (typeof value !== 'number') return value;
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  });

  /**
   * Custom filter: formatNumber
   * Formats a number with locale-specific separators
   */
  env.addFilter('formatNumber', (value, locale = 'en-US') => {
    if (typeof value !== 'number') return value;
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    }).format(value);
  });

  /**
   * Custom filter: round
   * Rounds a number to a specified number of decimal places
   */
  env.addFilter('round', (value, digits = 1) => {
    if (typeof value !== 'number') return value;
    return Math.round(value * Math.pow(10, digits)) / Math.pow(10, digits);
  });

  /**
   * Custom filter: toSlug
   * Converts a string to a URL-safe slug
   */
  env.addFilter('toSlug', (value) => {
    if (typeof value !== 'string') return value;
    return value
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '');
  });

  return env;
}

export { setupNunjucks };
