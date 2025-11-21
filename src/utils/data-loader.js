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
   * Load comuni (towns) data from individual province files
   * @returns {Promise<Array>} Array of all comuni merged from province files
   */
  async loadComuni() {
    if (this.cache.comuni) {
      return this.cache.comuni;
    }

    try {
      const dataset = await this.loadDataset();
      const comuniList = [];
      
      // Get list of province directories
      const provinceDir = ROOT_DIR;
      const dirents = await fs.readdir(provinceDir, { withFileTypes: true });
      
      // For each province directory, try to load province-specific data
      for (const dirent of dirents) {
        if (!dirent.isDirectory()) continue;
        
        const provinceName = dirent.name;
        
        // Try to load JSON files from the province directory
        const jsonFiles = [];
        try {
          const provinceFiles = await fs.readdir(path.join(provinceDir, provinceName));
          
          // Look for .json files that might contain comuni data
          for (const file of provinceFiles) {
            if (file.endsWith('.json') && !file.includes('index')) {
              jsonFiles.push(path.join(provinceDir, provinceName, file));
            }
          }
        } catch (err) {
          // Directory might not exist or be readable
          continue;
        }
        
        // Also check for temp directory pattern (used by legacy generator)
        const tempPath = path.join(ROOT_DIR, 'temp', `${this.normalizeName(provinceName)}-comuni.json`);
        try {
          const stat = await fs.stat(tempPath);
          if (stat.isFile()) {
            jsonFiles.push(tempPath);
          }
        } catch (err) {
          // File doesn't exist, that's ok
        }
        
        // Load and merge all found JSON files
        for (const jsonFile of jsonFiles) {
          try {
            const rawData = await fs.readFile(jsonFile, 'utf8');
            const data = JSON.parse(rawData);
            
            if (Array.isArray(data)) {
              // If it's an array, add all items
              data.forEach(item => {
                if (item.Name || item.name) {
                  item.Province = item.Province || provinceName;
                  comuniList.push(item);
                }
              });
            } else if (typeof data === 'object') {
              // If it's an object with town data, convert to array
              Object.values(data).forEach(item => {
                if (item && (item.Name || item.name)) {
                  item.Province = item.Province || provinceName;
                  comuniList.push(item);
                }
              });
            }
          } catch (parseErr) {
            // Invalid JSON file, skip
            continue;
          }
        }
      }
      
      // If no province-specific data found, fall back to single comuni.json
      if (comuniList.length === 0) {
        const comuniPath = path.join(ROOT_DIR, 'comuni.json');
        try {
          const rawData = await fs.readFile(comuniPath, 'utf8');
          this.cache.comuni = JSON.parse(rawData);
        } catch (fallbackErr) {
          console.warn('Could not load comuni from comuni.json:', fallbackErr.message);
          this.cache.comuni = [];
        }
      } else {
        this.cache.comuni = comuniList;
      }
      
      this.loadedAt.comuni = new Date();
      return this.cache.comuni;
    } catch (error) {
      console.error('Error loading comuni:', error.message);
      // Return fallback empty array instead of throwing
      this.cache.comuni = [];
      return this.cache.comuni;
    }
  }

  /**
   * Normalize province name for file matching
   * @param {string} name - Province or directory name
   * @returns {string} Normalized name
   */
  normalizeName(name) {
    return name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/'/g, '');
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
