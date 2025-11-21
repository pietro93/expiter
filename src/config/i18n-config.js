/**
 * i18next Internationalization Configuration
 * Loads and initializes the i18next library for multi-language support
 */

import i18next from 'i18next';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

function setupI18n() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const i18nDir = path.join(__dirname, '../i18n');

  // Load all translation files
  const resources = {};

  const languages = ['en', 'it', 'de', 'es', 'fr'];

  languages.forEach((lang) => {
    const filePath = path.join(i18nDir, `${lang}.json`);
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      resources[lang] = { translation: JSON.parse(content) };
    } catch (error) {
      console.warn(`Warning: Could not load i18n file for language "${lang}": ${error.message}`);
      resources[lang] = { translation: {} };
    }
  });

  i18next.init({
    lng: 'en',
    fallbackLng: 'en',
    resources,
    interpolation: {
      escapeValue: false, // Nunjucks handles escaping
    },
    saveMissing: process.env.NODE_ENV !== 'production',
    missingKeyHandler: (lngs, ns, key) => {
      console.warn(`Missing translation for key: ${key} in namespace: ${ns}`);
      return key;
    },
  });

  /**
   * Helper function to translate a key with optional default value
   */
  i18next.t_safe = function (key, defaultValue = key, options = {}) {
    const result = this.t(key, options);
    return result === key ? defaultValue : result;
  };

  return i18next;
}

export { setupI18n };
