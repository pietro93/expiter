/**
 * Data Loader Utility
 * Loads and caches data from JSON files
 * Supports datasets, comuni, and crime data
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '../../');

class DataLoader {
  constructor() {
    this.cache = {
      dataset: null,
      comuni: null,
      crimeData: null,
      regions: null,
      provinces: null,
    };
    this.loadedAt = {};
  }

  /**
   * Load main dataset (provinces data)
   * @returns {Promise<Object>} Dataset object with all provinces
   */
  async loadDataset() {
    if (this.cache.dataset) {
      return this.cache.dataset;
    }

    try {
      const datasetPath = path.join(ROOT_DIR, 'dataset.json');
      const rawData = await fs.readFile(datasetPath, 'utf8');
      this.cache.dataset = JSON.parse(rawData);
      this.loadedAt.dataset = new Date();
      return this.cache.dataset;
    } catch (error) {
      console.error('Error loading dataset:', error.message);
      throw new Error(`Failed to load dataset: ${error.message}`);
    }
  }

  /**
   * Load comuni (towns) data
   * @returns {Promise<Array>} Array of all comuni
   */
  async loadComuni() {
    if (this.cache.comuni) {
      return this.cache.comuni;
    }

    try {
      const comuniPath = path.join(ROOT_DIR, 'comuni.json');
      const rawData = await fs.readFile(comuniPath, 'utf8');
      this.cache.comuni = JSON.parse(rawData);
      this.loadedAt.comuni = new Date();
      return this.cache.comuni;
    } catch (error) {
      console.error('Error loading comuni:', error.message);
      throw new Error(`Failed to load comuni: ${error.message}`);
    }
  }

  /**
   * Load crime data
   * @returns {Promise<Object>} Crime statistics by province
   */
  async loadCrimeData() {
    if (this.cache.crimeData) {
      return this.cache.crimeData;
    }

    try {
      const crimePath = path.join(ROOT_DIR, 'dataset_crime_2023.json');
      const rawData = await fs.readFile(crimePath, 'utf8');
      this.cache.crimeData = JSON.parse(rawData);
      this.loadedAt.crimeData = new Date();
      return this.cache.crimeData;
    } catch (error) {
      console.error('Error loading crime data:', error.message);
      // Return empty object if crime data doesn't exist
      this.cache.crimeData = {};
      return this.cache.crimeData;
    }
  }

  /**
   * Validate dataset structure
   * @param {Object} dataset - Dataset to validate
   * @returns {Object} Validation result with errors array
   */
  validateDataset(dataset) {
    const errors = [];

    if (!dataset || typeof dataset !== 'object') {
      errors.push('Dataset must be an object');
      return { valid: false, errors };
    }

    // Check for required provinces
    const provinceKeys = Object.keys(dataset);
    if (provinceKeys.length === 0) {
      errors.push('Dataset contains no provinces');
      return { valid: false, errors };
    }

    // Sample validation - check first 3 provinces
    provinceKeys.slice(0, 3).forEach(key => {
      const province = dataset[key];
      if (!province.name) errors.push(`Province ${key} missing 'name'`);
      if (!province.region) errors.push(`Province ${key} missing 'region'`);
      if (province.quality === undefined) errors.push(`Province ${key} missing 'quality'`);
      if (province.cost === undefined) errors.push(`Province ${key} missing 'cost'`);
    });

    return {
      valid: errors.length === 0,
      errors,
      provinceCount: provinceKeys.length,
    };
  }

  /**
   * Get a specific province by key
   * @param {string} provinceKey - Province identifier (e.g., 'milano')
   * @returns {Promise<Object|null>} Province object or null if not found
   */
  async getProvince(provinceKey) {
    const dataset = await this.loadDataset();
    return dataset[provinceKey] || null;
  }

  /**
   * Get all provinces grouped by region
   * @returns {Promise<Object>} Provinces grouped by region name
   */
  async getProvincesByRegion() {
    const dataset = await this.loadDataset();
    const grouped = {};

    Object.entries(dataset).forEach(([key, province]) => {
      const region = province.region || 'Unknown';
      if (!grouped[region]) {
        grouped[region] = [];
      }
      grouped[region].push({ key, ...province });
    });

    return grouped;
  }

  /**
   * Get list of all regions
   * @returns {Promise<Array>} Array of unique region names
   */
  async getRegions() {
    if (this.cache.regions) {
      return this.cache.regions;
    }

    const dataset = await this.loadDataset();
    const regions = [...new Set(Object.values(dataset).map(p => p.region))].sort();
    this.cache.regions = regions;
    return regions;
  }

  /**
   * Search provinces by name
   * @param {string} query - Search query
   * @param {number} limit - Max results
   * @returns {Promise<Array>} Matching provinces
   */
  async searchProvinces(query, limit = 10) {
    const dataset = await this.loadDataset();
    const lowerQuery = query.toLowerCase();

    const matches = Object.entries(dataset)
      .filter(([_, province]) =>
        province.name.toLowerCase().includes(lowerQuery) ||
        (province.region && province.region.toLowerCase().includes(lowerQuery))
      )
      .slice(0, limit)
      .map(([key, province]) => ({ key, ...province }));

    return matches;
  }

  /**
   * Get statistics about the dataset
   * @returns {Promise<Object>} Statistics object
   */
  async getStats() {
    const dataset = await this.loadDataset();
    const comuni = await this.loadComuni();
    const regions = await this.getRegions();

    const provinceCount = Object.keys(dataset).length;
    const comuniCount = Array.isArray(comuni) ? comuni.length : 0;

    return {
      provinceCount,
      regionCount: regions.length,
      comuniCount,
      loadedAt: this.loadedAt,
      cacheSize: {
        dataset: JSON.stringify(dataset).length,
        comuni: JSON.stringify(comuni).length,
      },
    };
  }

  /**
   * Clear cache to free memory
   * @param {string} type - Specific cache type to clear, or 'all'
   */
  clearCache(type = 'all') {
    if (type === 'all') {
      Object.keys(this.cache).forEach(key => {
        this.cache[key] = null;
      });
      this.loadedAt = {};
    } else if (this.cache.hasOwnProperty(type)) {
      this.cache[type] = null;
      delete this.loadedAt[type];
    }
  }

  /**
   * Reload a specific dataset
   * @param {string} type - Type to reload
   */
  async reload(type) {
    this.clearCache(type);
    if (type === 'dataset') return this.loadDataset();
    if (type === 'comuni') return this.loadComuni();
    if (type === 'crimeData') return this.loadCrimeData();
  }
}

export default DataLoader;
