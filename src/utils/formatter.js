/**
 * Province Formatter Utility
 * Formats and transforms province data for template consumption
 * Calculates ratings and prepares data for display
 */

class ProvinceFormatter {
  /**
   * Format a raw province object for template display
   * @param {Object} rawProvince - Raw province data from dataset
   * @returns {Object} Formatted province object
   */
  static formatProvince(rawProvince) {
    if (!rawProvince || typeof rawProvince !== 'object') {
      return null;
    }

    return {
      name: rawProvince.name || '',
      region: rawProvince.region || '',
      slug: this.toSlug(rawProvince.name || ''),
      population: rawProvince.population || 0,
      area: rawProvince.area || 0,
      capital: rawProvince.capital || '',
      code: rawProvince.code || '',
      description: rawProvince.description || '',
      longDescription: rawProvince.longDescription || rawProvince.description || '',

      // Quality metrics
      quality: {
        healthcare: this.calculateRating(rawProvince.quality?.healthcare),
        safety: this.calculateRating(rawProvince.quality?.safety),
        education: this.calculateRating(rawProvince.quality?.education),
        climate: this.calculateRating(rawProvince.quality?.climate),
      },

      // Cost of living
      costOfLiving: {
        singlePerson: rawProvince.cost?.singlePerson || 0,
        family: rawProvince.cost?.family || 0,
        rent: rawProvince.cost?.rent || 0,
        utilities: rawProvince.cost?.utilities || 0,
        groceries: rawProvince.cost?.groceries || 0,
        transport: rawProvince.cost?.transport || 0,
        meal: rawProvince.cost?.meal || 0,
      },

      // Climate data
      climate: {
        avgTemp: this.formatNumber(rawProvince.climate?.avgTemp, 1),
        maxTemp: this.formatNumber(rawProvince.climate?.maxTemp, 1),
        minTemp: this.formatNumber(rawProvince.climate?.minTemp, 1),
        rainfall: rawProvince.climate?.rainfall || 0,
        sunshine: rawProvince.climate?.sunshine || 0,
        warmestMonth: rawProvince.climate?.warmestMonth || 'N/A',
        coldestMonth: rawProvince.climate?.coldestMonth || 'N/A',
        jan: rawProvince.climate?.jan || 0,
        apr: rawProvince.climate?.apr || 0,
        jul: rawProvince.climate?.jul || 0,
        oct: rawProvince.climate?.oct || 0,
      },

      // Healthcare details
      healthcare: {
        description: rawProvince.healthcare?.description || '',
        facilities: rawProvince.healthcare?.facilities || [],
        rating: this.calculateRating(rawProvince.quality?.healthcare),
      },

      // Safety details
      safety: {
        rating: this.calculateRating(rawProvince.quality?.safety),
        crimeRate: rawProvince.safety?.crimeRate || 'N/A',
        description: rawProvince.safety?.description || '',
      },

      // Education details
      education: {
        description: rawProvince.education?.description || '',
        types: rawProvince.education?.types || [],
        rating: this.calculateRating(rawProvince.quality?.education),
      },

      // Transport
      transport: {
        description: rawProvince.transport?.description || '',
        types: rawProvince.transport?.types || [],
        rating: rawProvince.transport?.rating || 7,
      },

      // Meta
      metadata: {
        lastUpdated: rawProvince.lastUpdated || null,
        source: rawProvince.source || '',
      },
    };
  }

  /**
   * Calculate a quality rating from raw score data
   * Converts numeric values to 1-10 scale
   * @param {number|Object} score - Raw score value or object with score property
   * @param {number} max - Maximum possible value for normalization
   * @returns {number} Rating on 1-10 scale
   */
  static calculateRating(score, max = 100) {
    if (score === null || score === undefined) {
      return 7; // Default neutral rating
    }

    // If it's an object, try to get the score property
    if (typeof score === 'object' && score !== null) {
      score = score.score || score.value || 7;
    }

    // Normalize to 1-10 scale
    const numeric = parseFloat(score);
    if (isNaN(numeric)) {
      return 7;
    }

    // If already in 1-10 range, return as is
    if (numeric >= 1 && numeric <= 10) {
      return numeric;
    }

    // If it's percentage-like (0-100), convert to 1-10
    if (numeric >= 0 && numeric <= 100) {
      return Math.round((numeric / 100) * 10);
    }

    // Otherwise clamp to 1-10
    return Math.max(1, Math.min(10, numeric));
  }

  /**
   * Format a number with thousand separators
   * @param {number} num - Number to format
   * @param {number} decimals - Number of decimal places
   * @returns {string} Formatted number
   */
  static formatNumber(num, decimals = 0) {
    if (num === null || num === undefined) return '0';

    const numeric = parseFloat(num);
    if (isNaN(numeric)) return '0';

    if (decimals > 0) {
      return numeric.toFixed(decimals);
    }

    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: decimals,
      minimumFractionDigits: decimals,
    }).format(numeric);
  }

  /**
   * Format currency value
   * @param {number} amount - Amount to format
   * @param {string} currency - Currency code (default: EUR)
   * @returns {string} Formatted currency string
   */
  static formatCurrency(amount, currency = 'EUR') {
    if (amount === null || amount === undefined) return '€0';

    const numeric = parseFloat(amount);
    if (isNaN(numeric)) return '€0';

    const formatter = new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

    return formatter.format(numeric);
  }

  /**
   * Convert string to URL-friendly slug
   * @param {string} text - Text to slugify
   * @returns {string} URL-safe slug
   */
  static toSlug(text) {
    if (!text) return '';

    return text
      .toString()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^\w\s-]/g, '') // Remove special chars
      .trim()
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  }

  /**
   * Round a number to specified decimal places
   * @param {number} num - Number to round
   * @param {number} decimals - Number of decimal places
   * @returns {number} Rounded number
   */
  static round(num, decimals = 0) {
    if (num === null || num === undefined) return 0;

    const numeric = parseFloat(num);
    if (isNaN(numeric)) return 0;

    const factor = Math.pow(10, decimals);
    return Math.round(numeric * factor) / factor;
  }

  /**
   * Calculate average rating from multiple scores
   * @param {Object} scores - Object with score properties
   * @returns {number} Average score
   */
  static calculateAverage(scores) {
    if (!scores || typeof scores !== 'object') {
      return 7;
    }

    const values = Object.values(scores)
      .filter(v => typeof v === 'number' && !isNaN(v))
      .map(v => this.calculateRating(v));

    if (values.length === 0) return 7;

    const sum = values.reduce((a, b) => a + b, 0);
    return this.round(sum / values.length, 1);
  }

  /**
   * Get quality color based on rating
   * @param {number} rating - Rating from 1-10
   * @returns {string} Color name for Bulma
   */
  static getQualityColor(rating) {
    if (rating >= 8) return 'success';
    if (rating >= 6) return 'info';
    if (rating >= 4) return 'warning';
    return 'danger';
  }

  /**
   * Get quality text based on rating
   * @param {number} rating - Rating from 1-10
   * @returns {string} Quality description
   */
  static getQualityText(rating) {
    if (rating >= 9) return 'Excellent';
    if (rating >= 8) return 'Very Good';
    if (rating >= 7) return 'Good';
    if (rating >= 6) return 'Satisfactory';
    if (rating >= 5) return 'Average';
    if (rating >= 4) return 'Fair';
    if (rating >= 3) return 'Poor';
    return 'Very Poor';
  }

  /**
   * Format multiple provinces for comparison
   * @param {Array<Object>} provinces - Array of province objects
   * @returns {Array<Object>} Formatted provinces
   */
  static formatProvinces(provinces) {
    if (!Array.isArray(provinces)) {
      return [];
    }

    return provinces
      .map(p => this.formatProvince(p))
      .filter(p => p !== null);
  }
}

export default ProvinceFormatter;
